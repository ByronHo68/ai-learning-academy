# OpenRouter for the stock research workflow

Use one Python gateway for the three generative call sites. The academy website remains an offline guide. The adapter and HTTP-fixture tests exist; live OpenRouter, the research API, PostgreSQL reservations and end-to-end finance checks are **NOT RUN**.

| Graph node | Gateway role | Prerequisite | Maximum attempts per run |
| --- | --- | --- | --- |
| `scope` | `scope` | API authorization and privacy, before news | 1 |
| `refine` | `refine` | Missing facets, one search remaining | 1 |
| `generate` | `report` | Approved selection, evidence coverage and safe context | 1 |

Normal supported research needs scope and report calls. A resolved evidence gap can add one refinement. An irrelevant request only needs scope. Missing evidence never authorizes a report call. All attempts share the existing 60-second active budget; review wait follows the existing absolute expiry rules.

## Run the offline adapter example

From the repository root:

```sh
python3 -m venv integrations/finance_openrouter/.venv
source integrations/finance_openrouter/.venv/bin/activate
python -m pip install -r integrations/finance_openrouter/requirements.txt
python -m integrations.finance_openrouter.demo
python -m unittest discover -s integrations/finance_openrouter/tests -v
```

The demo uses HTTP fixtures, a fake key/model/provider and fixed synthetic evidence. It prints three reserved attempts and **zero real external calls**. `DemoBudget` is in-memory. `fixture_sanitizer` only replaces the known synthetic email. Neither is a production implementation, and the demo has no live mode.

## Configure the future research service

Copy this package to `services/research/app/providers/openrouter/` when that scaffold exists. Keep its relative imports. Place the values from `.env.example` in the private Python service environment, outside Git and the browser. Set the private key, exact model slug and approved provider endpoint. The host must load the environment; this module does not read `.env` files automatically.

Start with one evaluated model and endpoint shared by all roles. Optional role-specific model/provider overrides permit later comparisons. Select a model/endpoint that supports the generated JSON schemas and the requested token caps. Evaluate the real scope, injection, citation and abstention cases before enabling it. Model slugs are not immutable weight revisions. No specific commercial model or cost is selected by this integration.

`Settings.from_env()` reads only server environment variables. The endpoint is fixed to `https://openrouter.ai/api/v1/chat/completions`. The gateway requests `response_format=json_schema`, `strict=true`, supported parameters and one approved provider endpoint. It sets `allow_fallbacks=false` and `data_collection=deny`. Review the provider/account data policies; these routing flags do not guarantee end-to-end privacy. There is no SDK retry, model fallback list, web-search plugin or tool binding.

## Supply the two required host services

The host supplies `reserve_call(owned_run_id, role, configuration_hash)`. This callback must authenticate the run and atomically reserve a role attempt in PostgreSQL **before** returning `Reservation(timeout_seconds)`. Enforce at most one attempt per role and three total. Clip time to the saved active deadline. Persist configuration fingerprints and attempts across crashes. An already-attempted role cannot silently call the model again after a timeout or resume. Reuse saved sanitized results; if an external outcome is unknown, return unavailable. A checkpoint alone does not make a paid HTTP call exactly once.

The host also supplies a tested `sanitize(text)` privacy callback that raises on failure. Use the same email/card policy as API entry, ingestion and state persistence. The gateway recursively sanitizes parsed strings before dispatch and after JSON decoding, then validates closed Pydantic output schemas. Disable raw prompt/response capture in SDK callbacks, APM and proxy logs before using this adapter. There is no raw token streaming. Citation-ID membership is checked here; factual support, source permissions, timestamps, company and selection coverage remain host responsibilities.

## Bind the three graph nodes

Create one shared gateway during FastAPI lifespan. Its reservation callback receives the authenticated run ID explicitly. It must use the correct durable ledger for that run, never a global budget shared by unrelated users. Close the gateway during shutdown.

```python
from app.providers.openrouter.client import OpenRouterGateway, Settings
from app.providers.openrouter.nodes import build_llm_nodes

# lifespan-owned gateway; these are host interfaces that must be implemented.
gateway = OpenRouterGateway(
    Settings.from_env(),
    reserve_call=durable_run_ledger.reserve,
    sanitize=privacy_service.sanitize,
)
nodes.update(build_llm_nodes(gateway))
graph = build_graph(nodes, checkpointer)
# Only already sanitized, authorized state may enter graph.ainvoke(...).
```

`nodes.py` binds every generative finance call through the shared gateway. Keep the existing conditional edges. Scope API failures route to `unavailable` before news; privacy errors route to `privacy_stop`. Refinement errors never add a third search. Report output is buffered, sanitized and validated before a state update. Host wrappers still enforce the evidence gate before `generate` and citation/support/final-privacy checks before report storage.

If later using LangChain `create_agent`, use its `ChatOpenRouter` integration with explicit model/provider settings and `max_retries=0`. Add a durable reservation before **each** model attempt, including any hidden agent loop or structured-output repair. The current bounded design calls no agent loop; adding an alternative direct model client would bypass the shared gateway and needs separate review.

## Record safe telemetry

The returned metadata contains role/run, requested model/provider, observed served identities when supplied, generation ID, configuration hash and token counts. Unknown usage stays `null`. The host records duration/errors in its existing OTel tree and exports only safe attributes through the Collector to Langfuse/LangSmith. Do not sum the two products' token records or capture raw reasoning. Configure account/key spend limits in addition to per-run caps.

Embedding and reranking keep the separate E5/BGE Python candidate path, subject to the existing evaluation gates. PostgreSQL search and n8n YFinance/Alpha Vantage acquisition do not call this gateway. The separate Agent Lab already has its own `MODEL_*` provider settings; this finance integration uses `OPENROUTER_*` and does not change that service.

Official references: [OpenRouter quickstart](https://openrouter.ai/docs/quickstart), [structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs), [provider routing](https://openrouter.ai/docs/guides/routing/provider-selection), [ChatOpenRouter](https://docs.langchain.com/oss/python/integrations/chat/openrouter).
