/* Generated from Python Pydantic models. Run npm run lab:contracts; do not edit. */

export type Status = "ok";
export type BankConnected = boolean;
export type Tools = string[];
export type LiveConfigured = boolean;
export type Model = string | null;
export type LangfuseConfigured = boolean;
export type Synthetic = true;
export type Id = string;
export type SessionId = string;
export type Question = string;
export type Mode = "single" | "supervisor";
export type Engine = "offline" | "live";
export type ModelName = string | null;
export type Language = "en" | "zh";
export type Status1 = "queued" | "running" | "awaiting_approval" | "completed" | "failed";
export type CreatedAt = string;
export type MemoryTurns = number;
export type Step = string;
export type Detail = string;
export type ElapsedMs = number;
export type Kind = "agent" | "tool" | "checkpoint" | "approval" | "error";
export type Events = Event[];
export type ActiveMs = number;
export type InputTokens = number;
export type OutputTokens = number;
export type ModelCalls = number;
export type CostUsd = number | null;
export type CostBasis = "no_model" | "configured_rates" | "unavailable";
export type TraceUrl = string | null;
export type Tracing = "disabled" | "enabled" | "error";
export type Tool = "open_review_case";
export type AccountId = string;
export type Reason = string;
export type Intent = "balance" | "transactions" | "review" | "refuse" | "clarify";
export type Answer = string;
export type AccountId1 = string | null;
export type Balance = number | null;
export type TransactionIds = string[];
export type CaseId = string | null;
export type Sources = string[];
export type Action = "none" | "pending" | "approved" | "rejected";
export type Error = string | null;
export type Runs = Run[];
export type Id1 = string;
export type SessionId1 = string;
export type Engine1 = "offline" | "live";
export type ModelName1 = string | null;
export type WorkflowSha256 = string | null;
export type Modes = ("single" | "supervisor")[];
export type DatasetSha256 = string;
export type Status2 = "running" | "completed" | "failed";
export type CreatedAt1 = string;
export type Total = number;
export type CaseId1 = string;
export type Mode1 = "single" | "supervisor";
export type Category = string;
export type Question1 = string;
export type Passed = boolean;
export type Name = string;
export type Passed1 = boolean;
export type Checks = Check[];
export type RunId = string | null;
export type ActiveMs1 = number;
export type CostUsd1 = number | null;
export type Error1 = string | null;
export type Rows = EvalRow[];
export type GatePassed = boolean | null;
export type Error2 = string | null;
export type Id2 = string;
export type Category1 = "read" | "bilingual" | "approval" | "injection" | "boundary" | "memory";
export type Question2 = string;
export type Language1 = "en" | "zh";
export type ExpectedIntent = "balance" | "transactions" | "review" | "refuse" | "clarify";
export type ExpectedAction = "none" | "approved" | "rejected";
export type Decision = boolean | null;
export type SetupQuestion = string | null;
export type ExpectedBalance = number | null;
export type ExpectedTransactions = string[];
export type ForbiddenText = string[];
export type Cases = EvalCase[];
export type Reports = EvalReport[];

export interface LabContracts {
  Health: Health;
  Run: Run;
  RunIndex: RunIndex;
  EvalReport: EvalReport;
  EvalIndex: EvalIndex;
}
export interface Health {
  status: Status;
  bank_connected: BankConnected;
  tools: Tools;
  live_configured: LiveConfigured;
  model: Model;
  langfuse_configured: LangfuseConfigured;
  synthetic: Synthetic;
}
export interface Run {
  id: Id;
  session_id: SessionId;
  question: Question;
  mode: Mode;
  engine: Engine;
  model_name: ModelName;
  language: Language;
  status: Status1;
  created_at: CreatedAt;
  memory_turns: MemoryTurns;
  events: Events;
  metrics: Metrics;
  pending: PendingAction | null;
  result: Result | null;
  error: Error;
}
export interface Event {
  step: Step;
  detail: Detail;
  elapsed_ms: ElapsedMs;
  kind: Kind;
}
export interface Metrics {
  active_ms: ActiveMs;
  input_tokens: InputTokens;
  output_tokens: OutputTokens;
  model_calls: ModelCalls;
  cost_usd: CostUsd;
  cost_basis: CostBasis;
  trace_url: TraceUrl;
  tracing: Tracing;
}
export interface PendingAction {
  tool: Tool;
  account_id: AccountId;
  reason: Reason;
}
export interface Result {
  intent: Intent;
  answer: Answer;
  account_id: AccountId1;
  balance: Balance;
  transaction_ids: TransactionIds;
  case_id: CaseId;
  sources: Sources;
  action: Action;
}
export interface RunIndex {
  runs: Runs;
}
export interface EvalReport {
  id: Id1;
  session_id: SessionId1;
  engine: Engine1;
  model_name: ModelName1;
  workflow_sha256: WorkflowSha256;
  modes: Modes;
  dataset_sha256: DatasetSha256;
  status: Status2;
  created_at: CreatedAt1;
  total: Total;
  rows: Rows;
  gate_passed: GatePassed;
  error: Error2;
}
export interface EvalRow {
  case_id: CaseId1;
  mode: Mode1;
  category: Category;
  question: Question1;
  passed: Passed;
  checks: Checks;
  run_id: RunId;
  active_ms: ActiveMs1;
  cost_usd: CostUsd1;
  error: Error1;
}
export interface Check {
  name: Name;
  passed: Passed1;
}
export interface EvalIndex {
  cases: Cases;
  reports: Reports;
}
export interface EvalCase {
  id: Id2;
  category: Category1;
  question: Question2;
  language: Language1;
  expected_intent: ExpectedIntent;
  expected_action: ExpectedAction;
  decision: Decision;
  setup_question: SetupQuestion;
  expected_balance: ExpectedBalance;
  expected_transactions: ExpectedTransactions;
  forbidden_text: ForbiddenText;
}
