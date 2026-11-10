# Stock research evaluation report card

Status: synthetic harness executed; live integrations NOT RUN; hybrid admission BLOCKED.

這是虛構資料的本機工具驗證；真實服務未執行，混合檢索未獲准入。

Dataset: `finance-synthetic-v1`. 24 fictional excerpts, 18 prompts (15 answerable, 3 unanswerable); three tickers. Labels are authored fixtures, not independent expert judgments. No real market claims.

Baseline configuration: `postgres-fts-v2` · PostgreSQL 18 · Psycopg 3 · `english` tsvector + GIN · any-term websearch_to_tsquery · ts_rank_cd normalization 0 · 20 candidates · ID tie-break in C collation. The planner may scan this tiny corpus; these are ranking scores, not index-performance measurements.

Changed on 2026-11-11: this PostgreSQL baseline supersedes the earlier SQLite/BM25 implementation. The frozen corpus, labels and admission thresholds are unchanged. Recompute both candidate ablations against this baseline; historical scores remain in Git.

Executed: PostgreSQL full-text search over temporary tables containing the frozen corpus, company and publication/first-seen filters, and the metric calculator. No embedding, reranker, LLM, n8n, Langfuse or LangSmith service is executed by this command. Imported candidate rankings are scored as supplied, not independently reproduced vector searches.

Install `evals/finance/requirements.txt` and set `FINANCE_EVAL_DATABASE_URL` to a dedicated PostgreSQL 18 test database as described in `evals/finance/README.md`. Reproduce from the repository root: `python3 evals/finance/evaluate.py --check`. Generate: `npm run finance:eval`. Tests: `npm run finance:eval:test`.

| Configuration | recall@5 | nDCG@5 | recall@10 | nDCG@10 |
| --- | ---: | ---: | ---: | ---: |
| PostgreSQL full-text (executed) | 0.9000 | 0.9652 | 0.9000 | 0.9652 |
| Hybrid (imported) | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| Hybrid + rerank (imported) | NOT RUN | NOT RUN | NOT RUN | NOT RUN |

Macro means over the 15 answerable cases only. Recall counts relevant IDs with grade >0; nDCG uses gain 2^grade−1 and log2(rank+1). Empty qrels have undefined recall/nDCG and are reported separately. A zero-hit answerable query scores zero; duplicate/unknown/disallowed IDs are rejected.

Sparse returned empty evidence on 3/3 unanswerable cases. This measures retrieval, not model abstention.

| Outstanding acceptance evidence | Result |
| --- | --- |
| Citation-precision and material factual-claim coverage | NOT RUN: no generated answers or independent claim judgments |
| End-to-end model abstention | NOT RUN |
| Live prompt-injection suite (8 fixtures) | NOT RUN: fixtures provided, agent absent |
| n8n MCP per-prompt refresh and recovery | NOT RUN: no endpoint configured |
| OTel → self-hosted Langfuse + LangSmith | NOT RUN: no backends connected |
| Actual provider input/output tokens | NOT RUN; unknown, not a fabricated estimate |
| Live p50/p95 latency | NOT RUN: requires ≥30 completed runs, failures and timeouts reported separately |
| Shareable trace URL for each demo run | NOT AVAILABLE: no live demo run yet |

## Admission policy

Require absolute gains ≥0.03 recall@10 and ≥0.05 nDCG@10 over sparse, no regression by company, citation-precision ≥0.95 and no drop from sparse, 100% material factual-claim citation coverage, correct abstention and the live safety/trace gates. Citation-precision is supported claim–source pairs / all emitted pairs; zero pairs is N/A. Support must be judged against the excerpt, not URL membership.

Production admission: **BLOCKED**. Add the independently reviewed, licensed real-news holdout and actual live safety/trace evidence. Keep sparse active. The application runtime enforcement remains part of the proposed backend; this harness cannot configure a live index.

## Per-case sparse results

| Case | recall@10 | nDCG@10 | Returned IDs |
| --- | ---: | ---: | --- |
| MSFT-demand | 1.0000 | 1.0000 | MSFT-orders, MSFT-risk |
| MSFT-margin | 1.0000 | 1.0000 | MSFT-costs, MSFT-pricing, MSFT-outlook |
| MSFT-paraphrase | 0.5000 | 0.8262 | MSFT-costs |
| MSFT-outlook | 1.0000 | 1.0000 | MSFT-outlook |
| MSFT-conflict | 1.0000 | 1.0000 | MSFT-risk, MSFT-orders |
| MSFT-absent | N/A | N/A | empty |
| AAPL-demand | 1.0000 | 1.0000 | AAPL-orders, AAPL-risk |
| AAPL-margin | 1.0000 | 1.0000 | AAPL-costs, AAPL-pricing, AAPL-outlook |
| AAPL-paraphrase | 0.5000 | 0.8262 | AAPL-costs |
| AAPL-outlook | 1.0000 | 1.0000 | AAPL-outlook |
| AAPL-conflict | 1.0000 | 1.0000 | AAPL-risk, AAPL-orders |
| AAPL-absent | N/A | N/A | empty |
| NVDA-demand | 1.0000 | 1.0000 | NVDA-orders, NVDA-risk |
| NVDA-margin | 1.0000 | 1.0000 | NVDA-costs, NVDA-pricing, NVDA-outlook |
| NVDA-paraphrase | 0.5000 | 0.8262 | NVDA-costs |
| NVDA-outlook | 1.0000 | 1.0000 | NVDA-outlook |
| NVDA-conflict | 1.0000 | 1.0000 | NVDA-risk, NVDA-orders |
| NVDA-absent | N/A | N/A | empty |

## Frozen SHA-256 manifest

- `golden.json`: `169b6bf1c5398f7fb20cdf0588e1d181267a061a0e36cff802a13e782acd6145`
- `injections.json`: `c66b6b5566c2c0b27a5f6dfd129e9fe6c213db0ff016e8bb88954cb1e1b73666`
- `policy.json`: `7c505bcd9307828d6a9fa1705c75b4d5617724fe392c498b984e0df0bc277c61`

## Limits and next evidence

The baseline leaves at most 0.0348 nDCG@10 headroom on these fixtures. The written +0.05 gate is evaluated for production on the independently reviewed real-news holdout with its own PostgreSQL baseline.

The paraphrase cases intentionally exercise lexical misses. The tiny repetitive corpus and authored labels make these scores unsuitable for claims about real-news quality or prediction accuracy. Use separate development data for tuning. Version and review any new labels, thresholds or corpus; never silently overwrite the frozen test set.

Read [the six ADRs and revised requirements](../public/downloads/stock-research-review-pack.md) and [download the frozen fixtures](../public/downloads/stock-research-eval-fixtures.json). See `evals/finance/README.md` for candidate input and live injection execution instructions.
