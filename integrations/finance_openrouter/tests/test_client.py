import asyncio
import copy
import json
import os
import unittest
from unittest.mock import patch

import httpx

from integrations.finance_openrouter.client import ENDPOINT, GatewayError, OpenRouterGateway, Reservation, Route, Settings
from integrations.finance_openrouter.demo import DemoBudget, REFINE, REPORT, RESPONSES, SCOPE, fixture_sanitizer
from integrations.finance_openrouter.nodes import build_llm_nodes


def envelope(role='scope', content=None, **extra):
    return {'id': 'gen-fixture', 'model': 'example/reviewed-model', 'provider': 'test-provider',
            'choices': [{'finish_reason': 'stop', 'message': {'role': 'assistant',
                'content': json.dumps(RESPONSES[role]) if content is None else content}}], **extra}


class GatewayTests(unittest.IsolatedAsyncioTestCase):
    def settings(self):
        return Settings('test-key-never-export', {role: Route('example/reviewed-model', 'approved-endpoint')
                                               for role in ('scope', 'refine', 'report')})

    def gateway(self, handler, budget=None, sanitize=fixture_sanitizer):
        self.budget = budget or DemoBudget()
        return OpenRouterGateway(self.settings(), reserve_call=self.budget.reserve,
                                 sanitize=sanitize, transport=httpx.MockTransport(handler))

    async def test_every_role_uses_one_endpoint_schema_and_approved_route(self):
        requests = []
        def respond(request):
            requests.append(request)
            body = json.loads(request.content)
            role = body['response_format']['json_schema']['name'].removeprefix('finance_')
            return httpx.Response(200, json=envelope(role, usage={'prompt_tokens': 12, 'completion_tokens': 8}))
        async with self.gateway(respond) as gateway:
            for role, payload in [('scope', SCOPE), ('refine', REFINE), ('report', REPORT)]:
                result = await gateway.complete(role, payload, run_id='synthetic-run')
                self.assertEqual(result.metadata['role'], role)
                self.assertEqual(result.metadata['input_tokens'], 12)
                self.assertNotIn('test-key', json.dumps(result.metadata))
                self.assertNotIn('analyst@example.com', json.dumps(result.result.model_dump()))
        self.assertEqual(self.budget.calls, 3)
        for request in requests:
            self.assertEqual(str(request.url), ENDPOINT)
            body = json.loads(request.content)
            self.assertFalse(body['stream'])
            self.assertFalse(body['provider']['allow_fallbacks'])
            self.assertTrue(body['provider']['require_parameters'])
            self.assertEqual(body['provider']['only'], ['approved-endpoint'])
            self.assertEqual(body['provider']['data_collection'], 'deny')
            self.assertTrue(body['response_format']['json_schema']['strict'])
            self.assertNotIn('analyst@example.com', request.content.decode())
            self.assertNotIn('tools', body)

    async def test_failed_attempt_is_spent_without_hidden_retry(self):
        calls = []
        def fail(request):
            calls.append(request)
            return httpx.Response(429, json={'error': 'private provider body'})
        async with self.gateway(fail) as gateway:
            with self.assertRaisesRegex(GatewayError, '^provider_http_429$'):
                await gateway.complete('scope', SCOPE, run_id='synthetic-run')
            with self.assertRaisesRegex(GatewayError, '^call_budget_exhausted$'):
                await gateway.complete('scope', SCOPE, run_id='synthetic-run')
        self.assertEqual(len(calls), 1)
        self.assertEqual(self.budget.calls, 1)

    async def test_invalid_input_or_privacy_failure_never_dispatches(self):
        calls = []
        def respond(request):
            calls.append(request)
            return httpx.Response(200, json=envelope())
        async with self.gateway(respond) as gateway:
            with self.assertRaisesRegex(GatewayError, '^invalid_input$'):
                await gateway.complete('scope', {**SCOPE, 'company': 'UNKNOWN'}, run_id='synthetic-run')
        def broken(text):
            raise ValueError('private text: ' + text)
        async with self.gateway(respond, sanitize=broken) as gateway:
            with self.assertRaisesRegex(GatewayError, '^privacy_blocked$'):
                await gateway.complete('scope', SCOPE, run_id='synthetic-run')
        self.assertEqual(calls, [])

    async def test_json_decoding_precedes_output_redaction_and_unknown_usage_stays_null(self):
        content = '{"query":"contact analyst\\u0040example.com"}'
        async with self.gateway(lambda request: httpx.Response(200, json=envelope('refine', content))) as gateway:
            result = await gateway.complete('refine', REFINE, run_id='synthetic-run')
        self.assertEqual(result.result.query, 'contact [REDACTED_EMAIL]')
        self.assertIsNone(result.metadata['input_tokens'])
        self.assertIsNone(result.metadata['output_tokens'])

    async def test_bad_json_schema_truncation_refusal_tools_and_200_errors_fail_closed(self):
        malformed = []
        malformed.append(envelope(content='{"decision":"accepted","decision":"irrelevant","clarification":""}'))
        malformed.append(envelope(content='{"decision":"accepted","clarification":"","extra":"private"}'))
        malformed.append({'error': {'message': 'private text'}})
        truncated = envelope()
        truncated['choices'][0]['finish_reason'] = 'length'
        malformed.append(truncated)
        tools = envelope()
        tools['choices'][0]['message']['tool_calls'] = [{'name': 'unapproved'}]
        malformed.append(tools)
        refused = envelope()
        refused['choices'][0]['message']['refusal'] = 'private refusal'
        malformed.append(refused)
        for body in malformed:
            with self.subTest(body_type=list(body)):
                async with self.gateway(lambda request: httpx.Response(200, json=body)) as gateway:
                    with self.assertRaises(GatewayError) as caught:
                        await gateway.complete('scope', SCOPE, run_id='synthetic-run')
                    self.assertNotIn('private', str(caught.exception))

    async def test_unknown_citation_is_rejected(self):
        draft = copy.deepcopy(RESPONSES['report'])
        draft['facts'][0]['source_ids'] = ['not-in-snapshot']
        async with self.gateway(lambda request: httpx.Response(200, json=envelope('report', json.dumps(draft)))) as gateway:
            with self.assertRaisesRegex(GatewayError, '^citation_membership_failed$'):
                await gateway.complete('report', REPORT, run_id='synthetic-run')

    async def test_scope_refine_and_generate_node_bindings_use_the_same_gateway(self):
        seen = []
        def respond(request):
            body = json.loads(request.content)
            role = body['response_format']['json_schema']['name'].removeprefix('finance_')
            seen.append(role)
            return httpx.Response(200, json=envelope(role))
        state = {'run_id': 'synthetic-run', 'original_question': SCOPE['question'],
                 'company_id': 'MSFT', 'horizon': SCOPE['horizon'],
                 'missing_facets': REFINE['missing_facets'], 'snapshot_id': REPORT['snapshot_id'],
                 'as_of': REPORT['as_of'], 'context': {'evidence': REPORT['evidence']}}
        async with self.gateway(respond) as gateway:
            nodes = build_llm_nodes(gateway)
            state.update(await nodes['scope'](state))
            self.assertEqual(state['scope'], 'accepted')
            state.update(await nodes['refine'](state))
            self.assertEqual(state['route'], 'retrieve')
            state.update(await nodes['generate'](state))
            self.assertEqual(state['route'], 'validate')
        self.assertEqual(seen, ['scope', 'refine', 'report'])
        self.assertEqual(len(state['model_call_records']), 3)
        self.assertNotIn('analyst@example.com', json.dumps(state['draft']))

    async def test_node_scope_outage_returns_unavailable_and_reservation_failure_never_dispatches(self):
        async with self.gateway(lambda request: httpx.Response(503)) as gateway:
            node = build_llm_nodes(gateway)['scope']
            result = await node({'run_id': 'synthetic-run', 'original_question': 'MSFT costs?',
                                 'company_id': 'MSFT', 'horizon': '1-3 months'})
            self.assertEqual(result['scope'], 'unavailable')
        seen = []
        def respond(request):
            seen.append(request)
            return httpx.Response(200, json=envelope())
        async def broken_ledger(run_id, role, fingerprint):
            raise RuntimeError('private database information')
        async with OpenRouterGateway(self.settings(), reserve_call=broken_ledger,
                sanitize=fixture_sanitizer, transport=httpx.MockTransport(respond)) as gateway:
            with self.assertRaisesRegex(GatewayError, '^reservation_failed$'):
                await gateway.complete('scope', SCOPE, run_id='synthetic-run')
        self.assertEqual(seen, [])

    async def test_redirects_do_not_receive_credentials_and_timeouts_stay_spent(self):
        seen = []
        def redirect(request):
            seen.append(str(request.url))
            return httpx.Response(302, headers={'Location': 'https://unapproved.invalid/'})
        async with self.gateway(redirect) as gateway:
            with self.assertRaisesRegex(GatewayError, '^provider_http_302$'):
                await gateway.complete('scope', SCOPE, run_id='synthetic-run')
        self.assertEqual(seen, [ENDPOINT])
        async def slow(request):
            await asyncio.sleep(0.03)
            return httpx.Response(200, json=envelope())
        async def reserve(run_id, role, fingerprint):
            return Reservation(0.001)
        async with OpenRouterGateway(self.settings(), reserve_call=reserve, sanitize=fixture_sanitizer,
                                     transport=httpx.MockTransport(slow)) as gateway:
            with self.assertRaisesRegex(GatewayError, '^provider_timeout$'):
                await gateway.complete('scope', SCOPE, run_id='synthetic-run')

    def test_environment_uses_role_overrides_and_does_not_print_the_key(self):
        env = {'OPENROUTER_API_KEY': 'test-key-never-export', 'OPENROUTER_MODEL': 'example/shared',
               'OPENROUTER_PROVIDER': 'approved', 'OPENROUTER_REPORT_MODEL': 'example/report'}
        with patch.dict(os.environ, env, clear=True):
            config = Settings.from_env()
        self.assertEqual(config.routes['scope'].model, 'example/shared')
        self.assertEqual(config.routes['report'].model, 'example/report')
        self.assertNotIn('test-key', repr(config))
        with patch.dict(os.environ, {**env, 'OPENROUTER_MODEL': 'openrouter/auto'}, clear=True):
            with self.assertRaisesRegex(GatewayError, '^configuration_requires_explicit_model$'):
                Settings.from_env()


if __name__ == '__main__':
    unittest.main()
