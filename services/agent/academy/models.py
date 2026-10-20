from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

Mode = Literal["single", "supervisor"]
Engine = Literal["offline", "live"]
Intent = Literal["balance", "transactions", "review", "refuse", "clarify"]


class Contract(BaseModel):
    model_config = ConfigDict(extra="forbid", json_schema_serialization_defaults_required=True)


class Plan(Contract):
    intent: Intent
    account_id: str = Field(description="HK-001 unless a different account is explicitly requested")
    reason: str = Field(max_length=500, description="Brief case reason, or empty for read operations")


class AnswerText(Contract):
    answer: str = Field(max_length=2000)


class HelperNote(Contract):
    summary: str = Field(max_length=1500)


class Result(Contract):
    intent: Intent
    answer: str
    account_id: str | None
    balance: float | None = None
    transaction_ids: list[str] = Field(default_factory=list)
    case_id: str | None = None
    sources: list[str] = Field(default_factory=list)
    action: Literal["none", "pending", "approved", "rejected"] = "none"


class Event(Contract):
    step: str
    detail: str
    elapsed_ms: float
    kind: Literal["agent", "tool", "checkpoint", "approval", "error"]


class Metrics(Contract):
    active_ms: float = 0
    input_tokens: int = 0
    output_tokens: int = 0
    model_calls: int = 0
    cost_usd: float | None = None
    cost_basis: Literal["no_model", "configured_rates", "unavailable"] = "no_model"
    trace_url: str | None = None
    tracing: Literal["disabled", "enabled", "error"] = "disabled"


class PendingAction(Contract):
    tool: Literal["open_review_case"] = "open_review_case"
    account_id: str
    reason: str


class Run(Contract):
    id: str
    session_id: str
    question: str
    mode: Mode
    engine: Engine
    model_name: str | None = None
    language: Literal["en", "zh"]
    status: Literal["queued", "running", "awaiting_approval", "completed", "failed"]
    created_at: str
    memory_turns: int = 0
    events: list[Event] = Field(default_factory=list)
    metrics: Metrics = Field(default_factory=Metrics)
    pending: PendingAction | None = None
    result: Result | None = None
    error: str | None = None


class RunRequest(Contract):
    question: str = Field(min_length=1, max_length=2000)
    mode: Mode = "single"
    engine: Engine = "offline"
    language: Literal["en", "zh"] = "en"


class ApprovalRequest(Contract):
    approved: bool


class Health(Contract):
    status: Literal["ok"] = "ok"
    bank_connected: bool
    tools: list[str]
    live_configured: bool
    model: str | None
    langfuse_configured: bool
    synthetic: Literal[True] = True


class EvalCase(Contract):
    id: str
    category: Literal["read", "bilingual", "approval", "injection", "boundary", "memory"]
    question: str
    language: Literal["en", "zh"]
    expected_intent: Intent
    expected_action: Literal["none", "approved", "rejected"] = "none"
    decision: bool | None = None
    setup_question: str | None = None
    expected_balance: float | None = None
    expected_transactions: list[str] = Field(default_factory=list)
    forbidden_text: list[str] = Field(default_factory=list)


class Check(Contract):
    name: str
    passed: bool


class EvalRow(Contract):
    case_id: str
    mode: Mode
    category: str
    question: str
    passed: bool
    checks: list[Check]
    run_id: str | None
    active_ms: float
    cost_usd: float | None
    error: str | None = None


class EvalRequest(Contract):
    engine: Engine = "offline"
    modes: list[Mode] = Field(default_factory=lambda: ["single", "supervisor"], min_length=1, max_length=2)


class EvalReport(Contract):
    id: str
    session_id: str
    engine: Engine
    model_name: str | None = None
    workflow_sha256: str | None = None
    modes: list[Mode]
    dataset_sha256: str
    status: Literal["running", "completed", "failed"]
    created_at: str
    total: int
    rows: list[EvalRow] = Field(default_factory=list)
    gate_passed: bool | None = None
    error: str | None = None


class EvalIndex(Contract):
    cases: list[EvalCase]
    reports: list[EvalReport]


class RunIndex(Contract):
    runs: list[Run]
