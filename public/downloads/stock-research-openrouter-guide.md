# OpenRouter for every research LLM call / 每個研究 LLM 呼叫使用 OpenRouter

Open `/finance-project/openrouter` for the bilingual call map, scenarios and setup. The repo has a real Python HTTP adapter and offline fixture tests. Live API, durable reservation and finance-backend integration are NOT RUN. Browser external calls: zero.

開啟 `/finance-project/openrouter` 看雙語呼叫地圖、情境及設定。Repo 有 Python HTTP adapter 及離線 fixture 測試；真實 API、持久預留及金融後端整合為 NOT RUN；瀏覽器外部呼叫為零。

## Scope classifier / Scope 分類器

Once after API privacy, before news access

API 隱私檢查後一次，新聞存取之前

Input: Sanitized question + supported company + horizon

清理後問題＋支援公司＋期間

Output: ScopeResult: accepted | ambiguous | irrelevant

Model override: OPENROUTER_SCOPE_MODEL; max 256 output tokens / 10s, clipped to remaining run budget.

## One query refinement / 一次查詢補查

Only when required evidence is missing and search budget remains

只在缺所需證據且有搜尋預算時

Input: Same question/company + missing facets

相同問題／公司＋缺少面向

Output: RefineResult: query

Model override: OPENROUTER_REFINE_MODEL; max 384 output tokens / 10s, clipped to remaining run budget.

## Report draft / 報告草稿

Only after selection, coverage and context checks

只在選取、覆蓋及 context 檢查後

Input: Question + fixed snapshot + at most six safe excerpts

問題＋固定快照＋最多六段安全節錄

Output: ReportResult: answer + facts + scenarios + limitations

Model override: OPENROUTER_REPORT_MODEL; max 2048 output tokens / 25s, clipped to remaining run budget.

## One server-side gateway for every generative call / 每次生成呼叫共用伺服器 gateway

Scope, optional refinement and report generation all call OpenRouterGateway.complete(role, payload, run_id=owned_run_id). The gateway posts buffered Chat Completions to https://openrouter.ai/api/v1/chat/completions. OpenRouter routes the request to your approved model/provider; it is not the model itself, an MCP news server or your vector database. The existing finance pages remain offline demos, not a running backend.

Scope、可選補查及報告生成全部呼叫 OpenRouterGateway.complete(role, payload, run_id=owned_run_id)，以緩衝 Chat Completions 發至 https://openrouter.ai/api/v1/chat/completions。OpenRouter 將請求交你核准的模型／provider，它不是模型本身、MCP 新聞 server 或向量資料庫。現有金融頁面仍是離線示範，並非已運行後端。

## Configure model IDs without exposing your key / 設定模型 ID，金鑰只留伺服器

Set OPENROUTER_API_KEY, an exact OPENROUTER_MODEL and an approved OPENROUTER_PROVIDER endpoint in the research service environment. Start with one evaluated model/provider for all three roles; optional role-specific variables override the shared values. Do not use openrouter/auto. Model availability and JSON-schema support must be verified on the chosen endpoint before live use. No particular model or pricing is assumed by the guide.

在研究服務環境設 OPENROUTER_API_KEY、確切 OPENROUTER_MODEL 及核准 OPENROUTER_PROVIDER endpoint。先用同一經評估模型／provider 處理三角色，之後可用角色變數覆寫共用值。不用 openrouter/auto；上線前須核對所選 endpoint 的模型及 JSON schema 支援。指南不假設特定模型或價錢。

## No hidden retries or provider fallback / 不隱藏重試或 provider 回退

One attempt per role, at most three generative attempts per run. The adapter has no retry loop, disables provider fallback, restricts the approved endpoint and requests supported parameters. It uses data_collection=deny; review the actual provider/account policies because this is not an end-to-end privacy guarantee. HTTP 429, timeout, refusal, invalid JSON/schema and truncation stop that path. Do not silently switch model or add a repair call. n8n still owns news-provider retries.

每角色一次嘗試，每任務最多三次生成嘗試。Adapter 沒有重試迴圈，停用 provider 回退、限制核准 endpoint 並要求支援參數；用 data_collection=deny，但仍要覆核實際 provider／帳戶政策，這不保證全程隱私。429、超時、拒答、JSON／schema 無效及截斷都停止該路徑，不暗換模型或加修補呼叫；n8n 仍控制新聞供應商重試。

## Reserve calls durably before paid work / 付費呼叫前先持久預留次數

The host must supply reserve_call(owned_run_id, role, configuration_hash), atomically keyed by authenticated run and role in PostgreSQL. Persist the attempt, model/provider/schema/prompt fingerprint and remaining active time before dispatch. Failed/ambiguous attempts stay spent. Restore reservations on resume; reuse saved sanitized results instead of retrying. A checkpoint alone cannot guarantee exactly-once external calls. The included DemoBudget is in-memory and only suitable for the offline example.

Host 須提供 reserve_call(owned_run_id, role, configuration_hash)，在 PostgreSQL 按已驗證 run／角色作原子預留，發出前保存嘗試、模型／provider／schema／提示指紋及剩餘處理時間。失敗／結果不明的嘗試仍計數，恢復時重用預留及已存清理結果，不再重試。Checkpoint 本身不保證外部呼叫 exactly-once；附帶 DemoBudget 只存記憶體，只適用離線例子。

## Keep privacy and evidence validation around the API / API 前後保留隱私及證據驗證

The host supplies a tested privacy sanitizer. The gateway sanitizes before dispatch and after JSON decoding, validates closed Pydantic schemas, rejects unexpected tool calls, and checks report citation IDs against supplied evidence. Buffer output before state writes or release; disable raw SDK/APM request/response capture. Citation membership does not prove claim support: the existing company/time/permission, coverage and factual-support validators still decide release.

Host 提供經測試隱私 sanitizer。Gateway 在發出前及 JSON 解碼後清理，驗證封閉 Pydantic schema、拒絕意外 tool calls，並核對報告引用 ID 屬所供證據。State 寫入／發布前先緩衝輸出，停用 SDK／APM 原請求及回應擷取。有引用 ID 不證明主張獲支持；原公司／時間／權限、覆蓋及事實支持驗證仍決定發布。

## Record usage without duplicating telemetry / 記用量，避免重複追蹤

Record role, requested/served model, approved/served provider when reported, generation ID, configuration hash, tokens and call duration in the existing OTel tree. Missing usage remains null. Export sanitized attributes through the Collector to Langfuse/LangSmith; do not trace raw prompts, reasoning or article text. Model slugs do not pin immutable weights; keep evaluation versions and observed served identities. Account-level spend limits supplement per-run caps.

在既有 OTel tree 記角色、請求／實際模型、核准／實際 provider（如有提供）、generation ID、設定 hash、token 及耗時，缺用量保留 null。清理 attributes 經 Collector 分送 Langfuse／LangSmith，不追蹤原提示、reasoning 或文章。模型 slug 不固定不可變權重，保留評估版本及觀察到的實際身份；帳戶開支限制補充每任務上限。

## Embedding, reranking and news are separate APIs / Embedding、重排及新聞是另一分工

E5 document/query embeddings and the BGE cross-encoder keep a separate local Python candidate path, subject to the existing admission gates. HNSW/full-text search stays in PostgreSQL; YFinance/Alpha Vantage acquisition stays in n8n. They are not generative LLM calls and do not use this Chat Completions gateway. Any future hosted embedding/reranking migration needs a separate API/configuration and re-evaluation. Daily news tagging uses deterministic rules unless an explicitly budgeted LLM job is added.

E5 文件／問題 embedding 及 BGE cross-encoder 保持獨立本機 Python 候選路徑，仍受既有准入關卡限制；HNSW／全文在 PostgreSQL，YFinance／Alpha Vantage 抓取在 n8n。它們不是生成 LLM 呼叫，不走此 Chat Completions gateway。將來改託管 embedding／重排須獨立 API／設定及重評；每日新聞標記先用固定規則，若另加 LLM 工作須明確預算。

[OpenRouter workflow SVG](finance-diagrams/openrouter-en.svg) · [繁中 SVG](finance-diagrams/openrouter-zh.svg)

## Server configuration / 伺服器設定

```dotenv
# Server-only configuration; never use NEXT_PUBLIC_ or commit a populated copy.
OPENROUTER_API_KEY=
# Pick an exact model slug AND an approved endpoint from its OpenRouter model page.
# The model/endpoint must support your strict JSON schemas.
OPENROUTER_MODEL=
OPENROUTER_PROVIDER=
# Optional role overrides, otherwise the shared model/provider above are used:
# OPENROUTER_SCOPE_MODEL=
# OPENROUTER_SCOPE_PROVIDER=
# OPENROUTER_REFINE_MODEL=
# OPENROUTER_REFINE_PROVIDER=
# OPENROUTER_REPORT_MODEL=
# OPENROUTER_REPORT_PROVIDER=

```

## OpenRouter for the stock research workflow

Use one Python gateway for the three generative call sites. The academy website remains an offline guide. The adapter and HTTP-fixture tests exist; live OpenRouter, the research API, PostgreSQL reservations and end-to-end finance checks are **NOT RUN**.

| Graph node | Gateway role | Prerequisite | Maximum attempts per run |
| --- | --- | --- | --- |
| `scope` | `scope` | API authorization and privacy, before news | 1 |
| `refine` | `refine` | Missing facets, one search remaining | 1 |
| `generate` | `report` | Approved selection, evidence coverage and safe context | 1 |

Normal supported research needs scope and report calls. A resolved evidence gap can add one refinement. An irrelevant request only needs scope. Missing evidence never authorizes a report call. All attempts share the existing 60-second active budget; review wait follows the existing absolute expiry rules.

### Run the offline adapter example

From the repository root:

```sh
python3 -m venv integrations/finance_openrouter/.venv
source integrations/finance_openrouter/.venv/bin/activate
python -m pip install -r integrations/finance_openrouter/requirements.txt
python -m integrations.finance_openrouter.demo
python -m unittest discover -s integrations/finance_openrouter/tests -v
```

The demo uses HTTP fixtures, a fake key/model/provider and fixed synthetic evidence. It prints three reserved attempts and **zero real external calls**. `DemoBudget` is in-memory. `fixture_sanitizer` only replaces the known synthetic email. Neither is a production implementation, and the demo has no live mode.

### Configure the future research service

Copy this package to `services/research/app/providers/openrouter/` when that scaffold exists. Keep its relative imports. Place the values from `.env.example` in the private Python service environment, outside Git and the browser. Set the private key, exact model slug and approved provider endpoint. The host must load the environment; this module does not read `.env` files automatically.

Start with one evaluated model and endpoint shared by all roles. Optional role-specific model/provider overrides permit later comparisons. Select a model/endpoint that supports the generated JSON schemas and the requested token caps. Evaluate the real scope, injection, citation and abstention cases before enabling it. Model slugs are not immutable weight revisions. No specific commercial model or cost is selected by this integration.

`Settings.from_env()` reads only server environment variables. The endpoint is fixed to `https://openrouter.ai/api/v1/chat/completions`. The gateway requests `response_format=json_schema`, `strict=true`, supported parameters and one approved provider endpoint. It sets `allow_fallbacks=false` and `data_collection=deny`. Review the provider/account data policies; these routing flags do not guarantee end-to-end privacy. There is no SDK retry, model fallback list, web-search plugin or tool binding.

### Supply the two required host services

The host supplies `reserve_call(owned_run_id, role, configuration_hash)`. This callback must authenticate the run and atomically reserve a role attempt in PostgreSQL **before** returning `Reservation(timeout_seconds)`. Enforce at most one attempt per role and three total. Clip time to the saved active deadline. Persist configuration fingerprints and attempts across crashes. An already-attempted role cannot silently call the model again after a timeout or resume. Reuse saved sanitized results; if an external outcome is unknown, return unavailable. A checkpoint alone does not make a paid HTTP call exactly once.

The host also supplies a tested `sanitize(text)` privacy callback that raises on failure. Use the same email/card policy as API entry, ingestion and state persistence. The gateway recursively sanitizes parsed strings before dispatch and after JSON decoding, then validates closed Pydantic output schemas. Disable raw prompt/response capture in SDK callbacks, APM and proxy logs before using this adapter. There is no raw token streaming. Citation-ID membership is checked here; factual support, source permissions, timestamps, company and selection coverage remain host responsibilities.

### Bind the three graph nodes

Create one shared gateway during FastAPI lifespan. Its reservation callback receives the authenticated run ID explicitly. It must use the correct durable ledger for that run, never a global budget shared by unrelated users. Close the gateway during shutdown.

```python
from app.providers.openrouter.client import OpenRouterGateway, Settings
from app.providers.openrouter.nodes import build_llm_nodes

## lifespan-owned gateway; these are host interfaces that must be implemented.
gateway = OpenRouterGateway(
    Settings.from_env(),
    reserve_call=durable_run_ledger.reserve,
    sanitize=privacy_service.sanitize,
)
nodes.update(build_llm_nodes(gateway))
graph = build_graph(nodes, checkpointer)
## Only already sanitized, authorized state may enter graph.ainvoke(...).
```

`nodes.py` binds every generative finance call through the shared gateway. Keep the existing conditional edges. Scope API failures route to `unavailable` before news; privacy errors route to `privacy_stop`. Refinement errors never add a third search. Report output is buffered, sanitized and validated before a state update. Host wrappers still enforce the evidence gate before `generate` and citation/support/final-privacy checks before report storage.

If later using LangChain `create_agent`, use its `ChatOpenRouter` integration with explicit model/provider settings and `max_retries=0`. Add a durable reservation before **each** model attempt, including any hidden agent loop or structured-output repair. The current bounded design calls no agent loop; adding an alternative direct model client would bypass the shared gateway and needs separate review.

### Record safe telemetry

The returned metadata contains role/run, requested model/provider, observed served identities when supplied, generation ID, configuration hash and token counts. Unknown usage stays `null`. The host records duration/errors in its existing OTel tree and exports only safe attributes through the Collector to Langfuse/LangSmith. Do not sum the two products' token records or capture raw reasoning. Configure account/key spend limits in addition to per-run caps.

Embedding and reranking keep the separate E5/BGE Python candidate path, subject to the existing evaluation gates. PostgreSQL search and n8n YFinance/Alpha Vantage acquisition do not call this gateway. The separate Agent Lab already has its own `MODEL_*` provider settings; this finance integration uses `OPENROUTER_*` and does not change that service.

Official references: [OpenRouter quickstart](https://openrouter.ai/docs/quickstart), [structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs), [provider routing](https://openrouter.ai/docs/guides/routing/provider-selection), [ChatOpenRouter](https://docs.langchain.com/oss/python/integrations/chat/openrouter).


## References / 參考

- [OpenRouter API quickstart](https://openrouter.ai/docs/quickstart)

- [Structured outputs and endpoint support](https://openrouter.ai/docs/guides/features/structured-outputs)

- [Provider routing, parameter support and data policies](https://openrouter.ai/docs/guides/routing/provider-selection)

- [Optional LangChain ChatOpenRouter integration](https://docs.langchain.com/oss/python/integrations/chat/openrouter)
