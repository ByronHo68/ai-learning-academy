"""Offline HTTP-fixture demo. No API key, network or finance service is used."""
import asyncio
import json
import time

import httpx

from .client import GatewayError, OpenRouterGateway, Reservation, Route, Settings

SCOPE = {'question': 'How could MSFT infrastructure costs affect margins? Contact analyst@example.com.',
         'company': 'MSFT', 'horizon': '1-3 months'}
REFINE = {**SCOPE, 'missing_facets': ['dated capital-expenditure evidence']}
REPORT = {**SCOPE, 'snapshot_id': 'synthetic-openrouter-v1', 'as_of': '2026-11-16T00:00:00Z',
          'evidence': [{'source_id': 'costs-v1', 'excerpt': 'Fictional: dated MSFT infrastructure spending increased.',
                        'published_at': '2026-11-15T00:00:00Z'}]}
RESPONSES = {
    'scope': {'decision': 'accepted', 'clarification': ''},
    'refine': {'query': 'MSFT dated capital expenditure infrastructure spending'},
    'report': {'answer': 'Fictional cost evidence supports discussing margin pressure, with explicit gaps.',
               'facts': [{'claim': 'The fictional excerpt reports increased infrastructure spending.', 'source_ids': ['costs-v1']}],
               'scenarios': [], 'limitations': ['Fictional evidence only; no revenue offsets supplied.']},
}


class DemoBudget:
    """Single-process demonstration only. Production needs a durable atomic ledger.

    Persist attempts BEFORE dispatch, restore saved counters/configuration on
    resume, and compute time from the saved active budget. Human wait is handled
    by the host. Do not create a fresh budget for an existing run.
    """
    def __init__(self):
        self.run_id = 'synthetic-run'
        self.calls = 0
        self.roles = set()
        self.fingerprints = {}
        self.deadline = time.time() + 60
        self.lock = asyncio.Lock()

    async def reserve(self, run_id, role, fingerprint):
        async with self.lock:
            if run_id != self.run_id:
                raise GatewayError('budget_run_mismatch')
            if role in self.roles or self.calls >= 3:
                raise GatewayError('call_budget_exhausted')
            remaining = self.deadline - time.time()
            if remaining <= 0:
                raise GatewayError('active_budget_exhausted')
            self.calls += 1
            self.roles.add(role)
            self.fingerprints[role] = fingerprint
            return Reservation(remaining)


def fixture_sanitizer(text):
    # ONLY the known synthetic email. Not a production privacy implementation.
    return text.replace('analyst@example.com', '[REDACTED_EMAIL]')


async def main():
    def respond(request):
        body = json.loads(request.content)
        role = body['response_format']['json_schema']['name'].removeprefix('finance_')
        return httpx.Response(200, json={'id': 'offline-fixture-' + role,
            'model': 'example/reviewed-model', 'provider': 'offline-fixture',
            'choices': [{'finish_reason': 'stop', 'message': {'role': 'assistant', 'content': json.dumps(RESPONSES[role])}}]})
    settings = Settings('offline-test-key', {role: Route('example/reviewed-model', 'approved-endpoint')
                                         for role in ('scope', 'refine', 'report')})
    budget = DemoBudget()
    async with OpenRouterGateway(settings, reserve_call=budget.reserve,
            sanitize=fixture_sanitizer, transport=httpx.MockTransport(respond)) as gateway:
        for role, payload in [('scope', SCOPE), ('refine', REFINE), ('report', REPORT)]:
            completion = await gateway.complete(role, payload, run_id='synthetic-run')
            print(role, json.dumps(completion.result.model_dump()))
            print('safe metadata:', json.dumps(completion.metadata))
    print('Offline adapter exercised:', budget.calls, 'reserved attempts; real external calls: 0')
    print('Live OpenRouter and durable checkpoint integration: NOT RUN')


if __name__ == '__main__':
    asyncio.run(main())
