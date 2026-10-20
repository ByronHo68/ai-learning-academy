# Agent engineering lab

The academy now includes a runnable Python/Java system behind three bilingual pages:

- `/agent-lab`: run an agent, inspect its events and structured output, approve or reject a case, and reopen saved runs.
- `/agent-lab/evals`: inspect 50 cases and run the automated quality gate.
- `/agent-lab/compare`: compare a single agent with a supervisor and two specialists using the same cases.

All bank records are synthetic. This is a local portfolio lab, not a banking product or an implementation for Taikang or Intact. The only write creates a review case; no transfer, payment execution, or credit decision API exists.

## Start

Use Node 22.13+, Python 3.13, and Java 21 on macOS or Linux:

```bash
npm ci
npm run lab:setup
npm run lab:start
```

Open [the Agent Lab](http://127.0.0.1:3000/agent-lab). Keep the terminal running. Ctrl+C stops the three processes. Set `LAB_WEB_PORT=3102` if another website is using port 3000.

Setup creates a project-local Python environment, installs the locked dependencies, downloads Maven 3.9.11 from Maven Central and verifies its SHA-512 checksum, builds the Java service, and creates `.env.lab` with random service credentials. Re-running setup preserves this file and saved data. No Docker daemon or global Maven installation is required.

The services bind to loopback:

| Service | Address | Persistence |
| --- | --- | --- |
| Next.js web app | `127.0.0.1:3000` | Signed HttpOnly browser session |
| FastAPI / LangGraph | `127.0.0.1:8001` | `services/agent/data/lab.sqlite` and `checkpoints.sqlite` |
| Spring Boot / MCP | `127.0.0.1:8081` | `services/bank/data/bank.mv.db` |

Python runs as **one process**. Local SQLite and the in-process job scheduler are deliberate limits of this lab. Multiple Uvicorn workers are not supported. For a multi-instance deployment, move jobs and checkpoint/session persistence to shared infrastructure first.

## Try the full workflow

1. Start with **Offline workflow test**. This is a limited rule-based driver, not an LLM. It still executes the actual graph, MCP transport, Java service, and databases.
2. Ask “What is my balance?” or “查詢我的戶口結餘。”
3. Ask “Show that again.” The next request loads the last six saved turns for that browser session.
4. Ask “Open a review case for the cafe charge.” The graph pauses with the exact account and reason.
5. Reload the page, or restart the backend, and open the saved pending run. The approval survives.
6. Approve or reject it. Approval resumes the graph and sends a server-signed proof to Java; rejection never calls the write tool.
7. Change to **Supervisor + 2 helpers**, run the same question, and inspect the additional specialist events.
8. Open Evaluations and run the 50 cases against both designs.

Use **Replay recorded steps** on a completed run to animate the saved events at a readable pace. Replay does not call the model or tools again. Animations respect reduced-motion preferences.

Browser identity is an anonymous, signed HttpOnly cookie. It expires after 30 days. Clearing it loses access to that browser's saved runs; it does not delete server records. This is session isolation, not enterprise login.

## Enable live model calls

Edit `.env.lab` locally:

```dotenv
MODEL_BASE_URL=https://openrouter.ai/api/v1
MODEL_API_KEY=your-provider-key
MODEL_NAME=your-exact-model-id
```

Restart `npm run lab:start`. The model must support strict JSON Schema output through an OpenAI-compatible Chat Completions API. The Python client uses Pydantic structured responses. API failures or unsupported schemas become explicit failed runs; they do not fall back to offline answers.

The model selects an intent and writes a grounded explanation. Account identity, allowed tools, approval state, balance fields, transaction IDs, case IDs, and provenance are controlled by the host and tool results. The final explanation still needs evaluation: a typed response alone does not establish factual accuracy.

The single design makes a planning call and, for supported requests, an answer call. The supervisor adds separate account and policy specialist calls before synthesis. Each specialist has its own system task and scoped context. Specialists cannot approve actions. These are bounded LangGraph workflows, not unrestricted autonomous agent loops.

### Tracing and cost

Add:

```dotenv
LANGFUSE_BASE_URL=https://cloud.langfuse.com
LANGFUSE_PUBLIC_KEY=your-public-key
LANGFUSE_SECRET_KEY=your-secret-key
MODEL_INPUT_USD_PER_MILLION=your-current-input-rate
MODEL_OUTPUT_USD_PER_MILLION=your-current-output-rate
```

The installed Langfuse Python SDK v5 requires a compatible Langfuse v4 server. Use compatible Cloud or self-hosted credentials. Root agent spans, model generations, and MCP tool spans share a trace ID. Approval resumes use the same trace ID. The UI links to the trace once Langfuse returns the project ID.

Local metrics are available without Langfuse. Processing time is measured in the backend and excludes human waiting. Token usage comes from provider responses. Cost is an estimate using the explicitly configured per-million-token rates, **not a bill from the provider**; discounts, caching tiers and other charges are not modeled. Missing pricing or usage displays “unavailable,” not a fabricated zero. Offline runs have zero model cost.

Only run metadata, model names, usage, costs and span names are exported by this integration. Raw questions, answers, credentials and bank tool payloads are not added to Langfuse spans. Local SQLite does contain synthetic prompts, answers and checkpoints.

## Java connection

`services/bank` uses Java 21, Spring Boot 3.5.16, Spring AI 1.1.8, JDBC and H2. MCP uses the Spring AI Streamable HTTP server at `/mcp`. Python uses the official MCP SDK to initialize a session, list tools, and invoke them.

| MCP tool | Matching REST API | Enforcement |
| --- | --- | --- |
| `get_account_summary` | `GET /api/accounts/{id}` | Service credential is restricted to HK-001 |
| `list_transactions` | `GET /api/accounts/{id}/transactions` | Same account restriction |
| `open_review_case` | `POST /api/review-cases` | HMAC over run ID, account and reason; unique run ID prevents duplicate cases |

`GET /api/review-cases` supports verification. Every HTTP endpoint, including `/health` and `/mcp`, requires the bank bearer token. REST and MCP call the same domain service. HMAC approval proofs are injected only after the LangGraph interrupt is resumed through the human decision endpoint. Models never receive the signing key.

This provides concrete interview evidence of Java skills carrying into AI work: service boundaries, DTOs, authentication, parameterized SQL, transactions, idempotency, HTTP APIs, and integration testing. Demonstrate the behavior and discuss its limits; do not imply an employer has endorsed this implementation.

## Evaluation design and CI

`services/agent/evals/cases.json` contains 50 explicit cases:

| Category | Cases |
| --- | ---: |
| Ordinary reads | 10 |
| Traditional Chinese and mixed-language requests | 10 |
| Human approval / rejection | 8 |
| Prompt injection | 12 |
| Access boundary / unsupported request / clarification | 6 |
| Saved-memory follow-ups | 4 |

Both architectures run all 50. Four memory cases have an extra setup turn per architecture: **100 scored runs plus 8 setup runs**. Reported case time and cost include those setup turns. The harness supplies the specified human decision for evaluation only. Interactive runs never auto-approve.

Scoring checks intent, exact structured facts, visible balance agreement, transaction IDs, expected side effects, the presence of an approval interrupt, language, provenance, and memory use. Refusal cases must make no tool calls. A report is tied to a SHA-256 hash of the dataset. Failed executions count as failed cases.

These are reproducible rule checks, not an LLM judge. Keyword and schema checks cannot prove semantic correctness or universal injection resistance. Add new failure cases when behavior changes. A single timing pass is descriptive; it is not sufficient evidence of a stable speed advantage.

The GitHub Actions `agent-quality` job starts the real Java service, runs the Python integration suite, and uploads the evaluation report. The Node build **depends on this job**, so a failed gate prevents the build.

- Offline baseline: 100% pass rate.
- Live acceptance thresholds: at least 92% overall and 90% for bilingual and memory categories, with every approval, injection, and boundary case passing. These are initial acceptance thresholds, not a measured baseline for a particular model.
- Configure repository secret `MODEL_API_KEY` and variables `MODEL_NAME`, optionally `MODEL_BASE_URL`, to also run the live gate in CI.
- Set repository variable `LAB_REQUIRE_LIVE_EVAL=true` to fail CI when live credentials are missing. Fork PRs do not receive provider secrets and will therefore fail that required gate until a trusted run evaluates them.
- Without provider credentials, the workflow explicitly reports **offline integration gate only**. It does not claim to protect live model quality.

Commands while the Java service is running:

```bash
npm run lab:eval
npm run lab:eval -- --engine live
npm run lab:contracts
```

The TypeScript contracts and runtime JSON schemas are generated from the Python Pydantic response models. CI checks they are current. Do not hand-edit the generated files.

## Hosting boundary

The existing ChatGPT Sites / Cloudflare deployment cannot host the Python and Java processes inside a webpage. Host those services separately on private infrastructure, configure `AGENT_API_URL` in the Next.js runtime, and provide persistent storage. Never expose the bank service directly to a browser.

For a private hosted demo, set `LAB_LOCAL_MODE=false` and a strong server-only `LAB_ACCESS_CODE`; the web page asks for that code and creates a signed session. The loopback launcher remains a local development tool. A public multi-user service needs identity, per-user authorization, quotas, data retention controls and a durable job queue.

This implementation does not publish or deploy the site.

## Technical references

Implementation references checked on 2026-10-20:

- [LangGraph interrupts and durable resumption](https://docs.langchain.com/oss/python/langgraph/interrupts)
- [Official Python MCP SDK](https://github.com/modelcontextprotocol/python-sdk)
- [Spring AI MCP server starter](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html)
- [Langfuse SDK instrumentation](https://langfuse.com/docs/observability/sdk/instrumentation)
- [Langfuse SDK compatibility](https://langfuse.com/docs/observability/sdk/overview)
