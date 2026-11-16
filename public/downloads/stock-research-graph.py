# Wiring sketch only: inject tested nodes and a PostgreSQL AsyncPostgresSaver.
# See the PostgreSQL guide for lifespan wiring and one-time setup.
# The academy does not run this graph or connect external services.
# API PRIVACY BEFORE GRAPH is an outer boundary, not a first graph node.
# Disable raw body/callback capture; sanitize before any graph invocation.
# Each model/tool wrapper sanitizes results BEFORE returning state updates.
# Do not checkpoint a raw draft and clean it in a subsequent node.
# Disable raw token streaming; direct scope/refine LLM calls need wrappers too.
from typing import TypedDict, Literal
from langgraph.graph import StateGraph, START, END

class Evidence(TypedDict):
    source_id: str
    excerpt: str
    published_at: str
    first_seen_at: str

class ResearchState(TypedDict, total=False):
    run_id: str
    original_question: str  # Sanitized before graph invocation.
    privacy_policy_version: str
    company_id: str
    horizon: str
    as_of: str
    deadline: str
    remaining_active_ms: int
    review_mode: Literal["automatic", "review"]
    review_expires_at: str  # Absolute expiry set at first pause, not refreshed.
    candidate_revision: int
    selection_revision: int
    system_ordered_ids: list[str]
    user_ordered_ids: list[str]
    highlighted_ids: list[str]
    excluded_ids: list[str]
    scope: Literal["accepted", "irrelevant", "ambiguous", "privacy_blocked"]
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
    for name in ("scope", "refresh", "snapshot", "retrieve", "rerank", "fallback", "review", "selection", "review_expired", "gate",
                 "refine", "context", "generate", "validate", "privacy_publish", "privacy_stop", "save", "answer",
                 "insufficient", "irrelevant", "clarify", "unavailable", "blocked"):
        builder.add_node(name, nodes[name])
    builder.add_edge(START, "scope")
    builder.add_conditional_edges("scope", lambda s: s["scope"], {
        "accepted": "refresh", "irrelevant": "irrelevant", "ambiguous": "clarify", "privacy_blocked": "privacy_stop"})
    # These nodes set route only to one of their declared successors.
    branches = {
        "refresh": ["snapshot", "insufficient", "unavailable", "privacy_stop"],
        "snapshot": ["retrieve", "insufficient", "unavailable"],
        "retrieve": ["rerank", "review", "fallback", "unavailable", "privacy_stop"],
        "rerank": ["review", "fallback", "unavailable", "privacy_stop"],
        "fallback": ["review", "unavailable", "privacy_stop"],
        "review": ["selection", "review_expired"],
        "selection": ["gate", "review_expired", "unavailable"],
        "refine": ["retrieve", "privacy_stop"],
        "context": ["generate", "insufficient", "unavailable", "privacy_stop"],
        "generate": ["validate", "unavailable", "privacy_stop"],
        "validate": ["privacy_publish", "blocked"],
        "privacy_publish": ["save", "privacy_stop"],
        "save": ["answer", "unavailable"],
    }
    for name, successors in branches.items():
        builder.add_conditional_edges(name, lambda s: s["route"],
                                      {target: target for target in successors})
    builder.add_conditional_edges("gate", route_evidence,
        {name: name for name in ("context", "refine", "insufficient")})
    for terminal in ("answer", "insufficient", "irrelevant", "clarify", "unavailable", "blocked", "review_expired", "privacy_stop"):
        builder.add_edge(terminal, END)
    return builder.compile(checkpointer=checkpointer)

# graph.invoke(sanitized_request, {"configurable": {"thread_id": run_id}, "recursion_limit": 40})
# Thread ownership must be checked by the API. A recursion limit is only a backstop;
# node wrappers enforce the actual time/call budget and idempotent MCP refresh.
# Only a persisted human-review wait pauses active time. Save the remainder before
# interrupt(); on resume atomically spend that remainder, never another full 60s.
# Network waits and crash recovery count against the active deadline. All call
# counters survive pauses. The first-pause 15-minute review expiry never moves.
# Refine context/draft/result dictionaries to the application response schemas.
