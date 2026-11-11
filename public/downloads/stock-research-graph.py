# Wiring sketch only: inject tested nodes and a PostgreSQL AsyncPostgresSaver.
# See the PostgreSQL guide for lifespan wiring and one-time setup.
# The academy does not run this graph or connect external services.
from typing import TypedDict, Literal
from langgraph.graph import StateGraph, START, END

class Evidence(TypedDict):
    source_id: str
    excerpt: str
    published_at: str
    first_seen_at: str

class ResearchState(TypedDict, total=False):
    run_id: str
    original_question: str
    company_id: str
    horizon: str
    as_of: str
    deadline: str
    scope: Literal["accepted", "irrelevant", "ambiguous"]
    snapshot_id: str
    snapshot_manifest: dict  # Company-news, daily-batch and profile version IDs + coverage.
    query: str
    search_attempts: int
    evidence_status: Literal["enough", "gap"]
    refresh_receipt: dict
    retrieval_mode: str
    candidate_ids: list[str]
    selected_evidence: list[Evidence]
    missing_facets: list[str]
    conflicts: list[str]
    context: dict
    draft: dict
    validation_errors: list[str]
    result: dict
    trace_id: str
    route: str  # Set by code-owned node checks, never copied from model output.

def route_evidence(state):
    if state["evidence_status"] == "enough":
        return "context"
    return "refine" if state["search_attempts"] < 2 else "insufficient"

def build_graph(nodes, checkpointer):
    # Each supplied node validates its boundary and returns a state update.
    # Wrappers enforce deadlines, tool/model budgets, exception mapping and spans.
    # retrieve increments search_attempts BEFORE each attempt.
    builder = StateGraph(ResearchState)
    for name in ("scope", "refresh", "snapshot", "retrieve", "rerank", "fallback", "gate",
                 "refine", "context", "generate", "validate", "save", "answer",
                 "insufficient", "irrelevant", "clarify", "unavailable", "blocked"):
    builder.add_node(name, nodes[name])
    builder.add_edge(START, "scope")
    builder.add_conditional_edges("scope", lambda s: s["scope"], {
        "accepted": "refresh", "irrelevant": "irrelevant", "ambiguous": "clarify"})
    # These nodes set route only to one of their declared successors.
    branches = {
        "refresh": ["snapshot", "insufficient", "unavailable"],
        "snapshot": ["retrieve", "insufficient", "unavailable"],
        "retrieve": ["rerank", "gate", "fallback", "unavailable"],
        "rerank": ["gate", "fallback", "unavailable"],
        "fallback": ["gate", "unavailable"],
        "context": ["generate", "insufficient", "unavailable"],
        "generate": ["validate", "unavailable"],
        "validate": ["save", "blocked"],
        "save": ["answer", "unavailable"],
    }
    for name, successors in branches.items():
        builder.add_conditional_edges(name, lambda s: s["route"],
                                      {target: target for target in successors})
    builder.add_conditional_edges("gate", route_evidence,
        {name: name for name in ("context", "refine", "insufficient")})
    builder.add_edge("refine", "retrieve")
    for terminal in ("answer", "insufficient", "irrelevant", "clarify", "unavailable", "blocked"):
        builder.add_edge(terminal, END)
    return builder.compile(checkpointer=checkpointer)

# graph.invoke(validated_request, {"configurable": {"thread_id": run_id}, "recursion_limit": 40})
# Thread ownership must be checked by the API. A recursion limit is only a backstop;
# node wrappers enforce the actual time/call budget and idempotent MCP refresh.
# Persist the original deadline. Resume does not grant another full budget.
# Refine context/draft/result dictionaries to the application response schemas.
