"""App-ready LLM node bindings; host supplies graph, gateway and validated state.

These nodes perform no news/search/database work. Surround them with the existing
authorization, privacy, scope/evidence/selection gates and saved active budgets.
"""
from .client import GatewayError, OpenRouterGateway


def build_llm_nodes(gateway: OpenRouterGateway):
    def common(state):
        return {'question': state['original_question'], 'company': state['company_id'],
                'horizon': state['horizon']}

    def records(state, completion):
        return [*state.get('model_call_records', []), completion.metadata]

    def failure(error):
        # Never copy a provider error body or input values into state.
        return 'privacy_stop' if str(error) == 'privacy_blocked' else 'unavailable'

    async def scope(state):
        try:
            completion = await gateway.complete('scope', common(state), run_id=state['run_id'])
            decision = completion.result
            return {'scope': decision.decision, 'clarification': decision.clarification,
                    'model_call_records': records(state, completion)}
        except GatewayError as error:
            return {'scope': 'privacy_blocked' if failure(error) == 'privacy_stop' else 'unavailable',
                    'error_category': str(error)}

    async def refine(state):
        try:
            completion = await gateway.complete('refine', {**common(state),
                'missing_facets': state['missing_facets']}, run_id=state['run_id'])
            return {'query': completion.result.query, 'route': 'retrieve',
                    'model_call_records': records(state, completion)}
        except GatewayError as error:
            return {'route': failure(error), 'error_category': str(error)}

    async def generate(state):
        # The host has already approved IDs/permissions, cutoff and coverage.
        # Project exactly the safe fields expected by the provider boundary.
        evidence = [{'source_id': source['source_id'], 'excerpt': source['excerpt'],
                     'published_at': source['published_at']}
                    for source in state['context']['evidence']]
        try:
            completion = await gateway.complete('report', {**common(state),
                'snapshot_id': state['snapshot_id'], 'as_of': state['as_of'],
                'evidence': evidence}, run_id=state['run_id'])
            return {'draft': completion.result.model_dump(), 'route': 'validate',
                    'model_call_records': records(state, completion)}
        except GatewayError as error:
            return {'route': failure(error), 'error_category': str(error)}

    return {'scope': scope, 'refine': refine, 'generate': generate}
