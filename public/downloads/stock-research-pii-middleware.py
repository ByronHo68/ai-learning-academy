# Proposed LangChain configuration, not an installed finance backend.
from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware

def build_research_agent(model, tools):
    return create_agent(
        model=model,
        tools=tools,
        middleware=[
            PIIMiddleware("email", strategy="redact", apply_to_input=True,
                          apply_to_output=True, apply_to_tool_results=True),
            PIIMiddleware("credit_card", strategy="redact", apply_to_input=True,
                          apply_to_output=True, apply_to_tool_results=True),
        ],
    )

# This optional list belongs to create_agent, not StateGraph(...).
# The finance scope/refine/report path uses OpenRouterGateway + a host sanitizer.
# If adopting create_agent later, pass a configured ChatOpenRouter with max_retries=0,
# and reserve EACH attempted model call durably. Never add an unbudgeted agent loop.
# The host must sanitize BEFORE invoking a graph with a checkpointer.
# Direct LLM calls in scope/refine/generate need explicit boundary wrappers.
# Filter tool arguments BEFORE dispatch, not just tool results afterwards.
# Model/tool callbacks and n8n logs need their own payload-capture policy.
# Start with buffered output: do not forward raw provider token chunks.
# Pin/test the installed LangChain version and its stream behavior.
# Syntax checked; live PIIMiddleware/model/checkpoint integration: NOT RUN.
