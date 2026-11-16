# Reranking and HNSW in the research project / 研究項目的重排及 HNSW

Open `/finance-project/rerank-hnsw` for the bilingual mind map and animated layered graph / reranking lesson. Browser calls: zero. The graph, 2D vectors and relevance rubric are handmade fictional fixtures, not real HNSW or E5/BGE outputs. Live model inference, SQL, ANN recall and performance are NOT RUN. Full-text remains the default until frozen admission.

開啟 `/finance-project/rerank-hnsw` 看雙語心智圖、分層圖及重排動畫。瀏覽器外部呼叫為零，人手圖、二維向量及相關 rubric 是虛構 fixture，不是真實 HNSW 或 E5／BGE 輸出。真實推論、SQL、ANN 召回及效能均 NOT RUN；凍結准入前預設全文。

## Embedding model / Embedding 模型

An embedding model encodes each passage and query separately. Start by evaluating intfloat/multilingual-e5-small: 384 dimensions, a 512-token window, passage: for documents and query: for questions, including Chinese questions. Pin the revision, prefixes, normalization and chunking configuration. HNSW stores links between these vectors; it does not create embeddings.

Embedding 模型分別編碼段落及問題。先評估 intfloat/multilingual-e5-small：384 維、512 token 視窗，文件加 passage:、問題加 query:，中文問題亦一樣。固定 revision、prefix、正規化及切段設定。HNSW 保存向量間連線，不產生 embedding。

## Exact vector search / 精確向量搜尋

Exact search is your first pgvector baseline. It gives the nearest neighbours under the selected vector distance and filters, but semantic relevance is still a separate question. A small pilot may already be fast enough without HNSW. Measure real filtered queries before adding an approximate index.

精確搜尋是 pgvector 起步基線，按所選距離及條件找最近鄰；語義相關性仍是另一問題。小型試驗可能毋須 HNSW 已足夠，先量度實際帶條件查詢，再加近似索引。

## HNSW index / HNSW 索引

Hierarchical Navigable Small World is an approximate nearest-neighbour graph. Sparse upper layers guide the search towards a useful region; the base layer explores more neighbours. It can trade search work and memory for recall. It is a PostgreSQL index access method, separate from the LangGraph workflow graph, the embedding model and a reranker.

Hierarchical Navigable Small World 是近似最近鄰圖。稀疏上層引導搜尋到合適區域，底層再探索鄰居，以搜尋工作及記憶體與召回作取捨。它是 PostgreSQL 索引方法，與 LangGraph 工作流程圖、embedding 模型及重排器分開。

## Filtered ANN search / 帶條件 ANN 搜尋

Keep snapshot membership, model/policy configuration, permissions, company/global context and both timestamps in SQL. These protect returned evidence. In pgvector approximate scans, filtering happens after index traversal, so many visited rows may be rejected and LIMIT 20 can return fewer than 20. Iterative scans can explore more but still have caps. Never drop filters to fill the list. strict_order orders found results; it does not restore exact recall.

SQL 保留快照、模型／隱私設定、權限、公司／共用背景及兩個時間條件，保護回傳證據。pgvector 近似掃描是在索引探索後篩選，很多已訪列可能被拒，LIMIT 20 可少於 20 筆。Iterative scan 可多探索但仍有上限；不能刪條件湊筆數。strict_order 只排序已找到結果，不恢復精確召回。

## Hybrid fusion / 混合融合

Your admitted hybrid path retrieves up to 20 candidates per branch, deduplicates by stable source/chunk identity and uses reciprocal rank fusion to keep 20. RRF combines ranks, not raw cosine values and reranker logits. Full-text can retrieve something HNSW missed. The browser animation isolates the dense branch so you can see the missed-candidate problem.

已准入混合路徑每分支最多 20 候選，按穩定來源／切段身份去重，再用 RRF 保留 20。RRF 融合名次，不混加 cosine 與重排 logit。全文可能找到 HNSW 漏掉內容；瀏覽器動畫只示範 dense 分支，方便看清候選遺漏。

## Cross-encoder reranker / Cross-encoder 重排器

A cross-encoder reads each question–passage pair together. Evaluate BAAI/bge-reranker-v2-m3 for multilingual reranking, independently from your E5 embedding model. Score only the retrieved shortlist, then keep the top 10 before selecting at most 6 report excerpts. A high score is neither a probability of truth nor a stock-return estimate. Reranking cannot add a source that was never retrieved.

Cross-encoder 一起讀問題與原文配對，可評估 BAAI/bge-reranker-v2-m3 作多語重排，與 E5 embedding 模型獨立。只評已檢索小集合，保留前 10，再最多選 6 段作報告。高分不是事實機率或股票回報估計；重排不能加入從未檢索的來源。

## Review and evidence gate / 覆核及證據關卡

After system ranking, users can exclude, highlight and reorder proposed news. Preserve system ranks and record discussion order separately. Validate selected IDs, permissions and coverage again before context assembly. Privacy removal and trimming can remove required support. Missing support returns insufficient; similarity or a reranker cannot waive that rule.

系統排序後，用戶可排除、標記及改建議新聞次序。保留系統排名，討論次序另記；context 前重查所選 ID、權限及覆蓋。隱私移除及裁剪可令必要支持流失，支持不足回 insufficient，相似度或重排器不能免除此規則。

## Try the animation / 試動畫

Start with 3 toy base expansions, then try 9 or exact. Compare the original cosine order with human-labelled rubric order. Change costs/rates/missing evidence and top-k. Toy expansions are not ef_search; exact-neighbour overlap is not relevance recall@k. Reranking never introduces new source IDs.

## Ingestion and index build / 匯入及建索引

n8n fetches company/daily news and owns provider retries. Sanitize permitted excerpts before committing PostgreSQL evidence. A separate Python worker chunks and embeds new text with pinned E5 configuration. A migration/operator builds an optional HNSW cosine index over ready compatible vectors; do not build it per prompt or re-embed when only ef_search changes.

n8n 抓公司／每日新聞並控制供應商重試，允許節錄先清理再提交 PostgreSQL。獨立 Python worker 按固定 E5 設定切段及嵌入新文字；migration／操作者在就緒相容向量上建立可選 HNSW cosine 索引。不能每題重建，亦不因只改 ef_search 而重嵌入。

## Per accepted prompt / 每個有效提示

Sanitize before graph invocation, pass scope, refresh company news once and pin the snapshot/vector-ready view. Sparse remains default. Admitted hybrid embeds the query, searches full-text and exact/HNSW dense candidates under identical safety filters, fuses, reranks and enters evidence review. Resume/refinement keeps the same eligible corpus and remaining budgets. A snapshot does not freeze the physical ANN graph: new inserts can change approximate neighbours. Save retrieval settings, reranker revision and completed candidate IDs/ranks in the checkpoint; reuse completed results on resume. Repeatable ANN experiments need a frozen database/index view.

Graph 前清理、通過 scope、刷新公司新聞一次，再固定快照／向量就緒視圖。Sparse 仍是預設；已准入混合模式才嵌入問題，在相同安全條件下搜尋全文及 exact／HNSW 向量候選，融合、重排及進證據覆核。恢復／補查沿用合資格語料及剩餘預算。快照不凍結實體 ANN 圖，新插入可改近似鄰居；checkpoint 須存檢索設定、重排版本及已完成候選 ID／排名，恢復時重用結果。可重現 ANN 實驗須凍結資料庫／索引視圖。

## Measure two different questions / 分開量度兩個問題

First compare HNSW neighbour overlap with exact vector search under the same snapshot and filters, and measure latency/memory on the actual corpus. Separately test semantic relevance using the frozen golden set. Hybrid+reranking needs at least +0.03 recall@10 and +0.05 nDCG@10 over sparse, no company regression, citation precision ≥0.95 with no decline from sparse, and safety/abstention gates. ANN neighbour overlap is not that relevance recall and does not validate forecasts.

先在同快照及條件下比較 HNSW 與 exact 的鄰居重疊，再量度實際語料的延遲／記憶體；另用凍結 golden set 評語義相關。混合＋重排須比 sparse 至少 recall@10 +0.03、nDCG@10 +0.05，各公司不倒退，引用精準度 ≥0.95 且不低於 sparse，並過安全／拒答關卡。ANN 鄰居重疊不是該相關召回，也不驗證預測。

## Failure and short-list handling / 失敗及候選不足

Too few filtered results can mean limited ANN exploration, not no news. Use a preselected larger scan setting or exact path within the same search budget, or surface the shortfall. Do not add hidden retrieval calls. Operational vector/reranker errors may use sparse fallback. Privacy failures stop the affected path. A PostgreSQL outage affects both branches; release only claims supported by available evidence.

帶條件結果不足可能是 ANN 探索受限，不等於沒有新聞。可在同一搜尋預算內使用預先選定較大掃描或 exact 路徑，否則明示不足，不暗加檢索次數。向量／重排運作錯誤可回 sparse，隱私失敗停止該路徑；PostgreSQL 中斷影響兩分支，只發布可用證據支持的主張。

## m

Build

建立索引

Graph connectivity setting. The documented default is 16. More links change memory, build/insert work and recall; do not copy a large value without measurement.

圖連通設定，官方預設 16。更多連線改變記憶體、建立／插入工作及召回，未量度不要直接用大值。

## ef_construction

Build

建立索引

Candidate-list size during index construction; documented default 64. It affects the built graph. SET LOCAL ef_search does not rebuild that graph.

建圖時的候選清單大小，官方預設 64，影響已建圖；SET LOCAL ef_search 不會重建圖。

## hnsw.ef_search

Query

查詢

Search candidate-list size; documented default 40. Compare settings such as 40/80/120 on real filtered queries. It is not top-k and not a count of nodes visited. Use SET LOCAL within the query transaction.

搜尋候選清單大小，官方預設 40。可在實際條件查詢比較 40／80／120；它不是 top-k 或已訪節點數，在查詢 transaction 內用 SET LOCAL。

## hnsw.iterative_scan

Query · pgvector ≥0.8.0

查詢 · pgvector ≥0.8.0

strict_order can continue a filtered scan until enough rows are found or scan/resource limits are reached. Check max_scan_tuples, work_mem and the remaining deadline. It does not promise a full list or exact neighbours.

strict_order 可在帶條件掃描繼續找列，直到足夠或碰到掃描／資源上限。核對 max_scan_tuples、work_mem 及餘下時限，不保證足筆數或精確最近鄰。

[Workflow SVG](../public/downloads/finance-diagrams/rerank_hnsw-en.svg) · [繁中 SVG](../public/downloads/finance-diagrams/rerank_hnsw-zh.svg)

## Standalone tutorial / 獨立教學

```sh
# Separate Python 3.11+ tutorial environment; first model downloads need internet/cache.
python3 -m venv .venv
source .venv/bin/activate
python -m pip install sentence-transformers numpy "psycopg[binary]" pgvector
# Review immutable commits in each model repository; replace BOTH placeholders.
export EMBEDDING_MODEL_REVISION="<reviewed-40-character-E5-commit>"
export RERANKER_MODEL_REVISION="<reviewed-40-character-BGE-reranker-commit>"
python stock-research-rerank-demo.py
# Expected form: candidate IDs + raw relevance logits, not predefined scores/order.
# Model inference is NOT RUN by the academy. Record/pin tested package versions.

# Optional private disposable PostgreSQL DB with pgvector >=0.8.0:
export RERANK_DEMO_DATABASE_URL="postgresql://localhost/rerank_tutorial"
python stock-research-rerank-demo.py --setup
python stock-research-rerank-demo.py --postgres
# Inspect the printed plan. Index creation/settings do NOT prove HNSW was used.
# Do not use toy overlap to admit hybrid retrieval or claim measured speed/quality.
```

```python
"""Synthetic E5 + BGE reranking tutorial; not a finance backend.
Syntax checked. Live models, SQL execution and performance measurements: NOT RUN.
Only fixed synthetic text. Real services need privacy, authorization, budgets,
safe callbacks and coverage/citation validation at their own boundaries.
"""
import argparse
import hashlib
import json
import os
import re

import numpy as np
import psycopg
import torch
from pgvector.psycopg import register_vector
from sentence_transformers import SentenceTransformer, CrossEncoder

EMBEDDER = "intfloat/multilingual-e5-small"
RERANKER = "BAAI/bge-reranker-v2-m3"
QUESTION = "Which evidence directly supports increased MSFT infrastructure spending?"
DOCUMENTS = [
    ("keyword", "MSFT", "Fictional: MSFT advertises tools for customers to manage cloud costs."),
    ("filing", "MSFT", "Fictional dated filing: MSFT reports higher data-centre capital expenditure."),
    ("profile", "MSFT", "Fictional profile: MSFT operates capital-intensive cloud infrastructure."),
    ("macro", None, "Fictional macro release: the policy interest rate increased."),
]
SCHEMA = """-- Disposable tutorial DB only. pgvector >= 0.8.0 for iterative_scan.
-- This table holds one pinned embedding configuration, not mixed vector spaces.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS rerank_tutorial_chunks (
  snapshot_id text NOT NULL,
  chunk_id text NOT NULL,
  model_key text NOT NULL,
  privacy_policy_version text NOT NULL,
  company text,
  published_at timestamptz NOT NULL,
  first_seen_at timestamptz NOT NULL,
  permitted boolean NOT NULL,
  excerpt text NOT NULL,
  embedding vector(384) NOT NULL,
  PRIMARY KEY (snapshot_id, chunk_id, model_key)
);
CREATE INDEX IF NOT EXISTS rerank_tutorial_hnsw
ON rerank_tutorial_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
-- Metadata B-tree is a comparison candidate, not a guaranteed HNSW prefilter.
CREATE INDEX IF NOT EXISTS rerank_tutorial_metadata
ON rerank_tutorial_chunks (snapshot_id, model_key, privacy_policy_version, company);
"""
QUERY = """SELECT chunk_id, excerpt, embedding <=> %(query_vector)s AS distance
FROM rerank_tutorial_chunks
WHERE snapshot_id = %(snapshot_id)s
  AND model_key = %(model_key)s
  AND privacy_policy_version = %(privacy_policy)s
  AND permitted = true
  AND (company = %(company)s OR company IS NULL)
  AND published_at <= %(as_of)s AND first_seen_at <= %(as_of)s
ORDER BY embedding <=> %(query_vector)s
LIMIT %(candidate_limit)s;
-- Keep ORDER BY as the distance operator, ascending, with LIMIT for index eligibility.
-- WHERE guards returned evidence, but does not mean HNSW traverses only these rows.
-- Bind parameters using Psycopg; never interpolate article text or request values.
"""

def revision(name):
    value = os.environ.get(name, "")
    if not re.fullmatch(r"[a-fA-F0-9]{40}", value):
        raise SystemExit("Set " + name + " to a reviewed immutable 40-character model commit")
    return value

def database_url():
    value = os.environ.get("RERANK_DEMO_DATABASE_URL")
    if not value:
        raise SystemExit("Set private RERANK_DEMO_DATABASE_URL for a disposable tutorial DB")
    return value

def postgres_candidates(vectors, query_vector, model_key):
    params = {"snapshot_id": "synthetic-rerank-v1", "model_key": model_key,
              "privacy_policy": "finance-pii-v1", "company": "MSFT",
              "as_of": "2026-11-16T00:00:00Z", "query_vector": query_vector,
              "candidate_limit": 3}
    with psycopg.connect(database_url()) as connection:
        register_vector(connection)
        with connection.cursor() as cursor:
            cursor.execute("SELECT extversion FROM pg_extension WHERE extname='vector'")
            row = cursor.fetchone()
            if not row or tuple(int(x) for x in row[0].split(".")[:3]) < (0, 8, 0):
                raise SystemExit("Use pgvector >=0.8.0 and run --setup first")
            cursor.execute("SELECT DISTINCT model_key FROM rerank_tutorial_chunks")
            if any(row[0] != model_key for row in cursor.fetchall()):
                raise SystemExit("Different embedding configuration already stored; use a fresh tutorial DB")
            for (label, company, text), vector in zip(DOCUMENTS, vectors):
                chunk_id = label + ":" + hashlib.sha256(text.encode()).hexdigest()
                cursor.execute("""INSERT INTO rerank_tutorial_chunks
                    (snapshot_id, chunk_id, model_key, privacy_policy_version,
                     company, published_at, first_seen_at, permitted, excerpt, embedding)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT DO NOTHING""",
                    (params["snapshot_id"], chunk_id, model_key, params["privacy_policy"],
                     company, "2026-11-14T00:00:00Z", "2026-11-15T00:00:00Z",
                     True, text, vector))
            cursor.execute("SET LOCAL statement_timeout = '4s'")
            cursor.execute("SET LOCAL enable_indexscan = off")
            cursor.execute(QUERY, params)
            exact = cursor.fetchall()
            cursor.execute("SET LOCAL enable_indexscan = on")
            cursor.execute("SET LOCAL hnsw.ef_search = 80")
            cursor.execute("SET LOCAL hnsw.iterative_scan = strict_order")
            cursor.execute("SET LOCAL hnsw.max_scan_tuples = 20000")
            cursor.execute("EXPLAIN (FORMAT JSON, COSTS OFF) " + QUERY, params)
            print("Requested ANN plan (small tables may still use exact seq scan):", cursor.fetchone()[0])
            cursor.execute(QUERY, params)
            candidates = cursor.fetchall()
    exact_ids = {row[0] for row in exact}
    overlap = sum(row[0] in exact_ids for row in candidates)
    print("Exact-neighbour overlap:", overlap, "/", len(exact_ids))
    print("This overlap is not relevance recall@k, citation accuracy or a speed result")
    return [(row[0], row[1]) for row in candidates]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--setup", action="store_true")
    parser.add_argument("--postgres", action="store_true")
    args = parser.parse_args()
    if args.setup:
        with psycopg.connect(database_url(), autocommit=True) as connection:
            connection.execute(SCHEMA)
        print("Tutorial schema/index ready; no model downloaded")
        return

    embed_revision = revision("EMBEDDING_MODEL_REVISION")
    rerank_revision = revision("RERANKER_MODEL_REVISION")
    embedder = SentenceTransformer(EMBEDDER, revision=embed_revision,
                                  trust_remote_code=False, device="cpu")
    if embedder.get_sentence_embedding_dimension() != 384:
        raise ValueError("Unexpected dimension; do not mix vector spaces")
    embedder.max_seq_length = 512
    passages = ["passage: " + text for _, _, text in DOCUMENTS]
    query_text = "query: " + QUESTION
    for text in [*passages, query_text]:
        if len(embedder.tokenizer(text, truncation=False)["input_ids"]) > 512:
            raise ValueError("Chunk first; do not silently truncate E5 input")
    vectors = embedder.encode(passages, normalize_embeddings=True, convert_to_numpy=True)
    query_vector = embedder.encode([query_text], normalize_embeddings=True, convert_to_numpy=True)[0]
    if vectors.shape != (len(DOCUMENTS), 384) or query_vector.shape != (384,):
        raise ValueError("Unexpected vector shape")
    if not np.isfinite(vectors).all() or not np.isfinite(query_vector).all():
        raise ValueError("Non-finite embedding")
    config = {"model": EMBEDDER, "revision": embed_revision, "dimension": 384,
              "document_prefix": "passage: ", "query_prefix": "query: ",
              "normalized": True, "window": 512, "chunker": "short-fixture-v1",
              "privacy_policy": "finance-pii-v1"}
    model_key = hashlib.sha256(json.dumps(config, sort_keys=True).encode()).hexdigest()
    print("Embedding configuration:", json.dumps(config))
    print("Reranker revision:", rerank_revision)
    if args.postgres:
        candidates = postgres_candidates(vectors, query_vector, model_key)
    else:
        order = np.argsort(-(vectors @ query_vector))[:3]
        candidates = [(DOCUMENTS[int(i)][0], DOCUMENTS[int(i)][2]) for i in order]
        print("Local exact cosine shortlist, no HNSW/database:", [row[0] for row in candidates])
    if not candidates:
        print("No eligible candidates; stop without calling the reranker")
        return
    # CrossEncoder takes raw question/passage pairs, not E5's query:/passage: prefixes.
    # 512 is this tutorial's chosen pair window, not a claim about maximum model capacity.
    reranker = CrossEncoder(RERANKER, revision=rerank_revision, trust_remote_code=False,
                           device="cpu", max_length=512, activation_fn=torch.nn.Identity())
    pairs = [(QUESTION, text) for _, text in candidates]
    for question, text in pairs:
        if len(reranker.tokenizer(question, text, truncation=False)["input_ids"]) > 512:
            raise ValueError("Pair exceeds tutorial window; prepare bounded passages first")
    scores = np.asarray(reranker.predict(pairs)).reshape(-1)
    if len(scores) != len(candidates) or not np.isfinite(scores).all():
        raise ValueError("Invalid reranker output")
    for index in sorted(range(len(candidates)), key=lambda i: (-float(scores[i]), candidates[i][0])):
        print(candidates[index][0], "raw relevance logit:", float(scores[index]), candidates[index][1])
    print("No LLM/report was called. Scores are not truth probabilities or stock predictions.")
    print("Production still needs sparse fusion, evidence review, coverage and citation/privacy checks.")

if __name__ == "__main__":
    main()

```

## SQL templates / SQL 模板

Query placeholders are bound by Psycopg, not runnable unchanged in psql. 查詢參數由 Psycopg 綁定，不能原樣在 psql 執行。

```sql
-- Disposable tutorial DB only. pgvector >= 0.8.0 for iterative_scan.
-- This table holds one pinned embedding configuration, not mixed vector spaces.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS rerank_tutorial_chunks (
  snapshot_id text NOT NULL,
  chunk_id text NOT NULL,
  model_key text NOT NULL,
  privacy_policy_version text NOT NULL,
  company text,
  published_at timestamptz NOT NULL,
  first_seen_at timestamptz NOT NULL,
  permitted boolean NOT NULL,
  excerpt text NOT NULL,
  embedding vector(384) NOT NULL,
  PRIMARY KEY (snapshot_id, chunk_id, model_key)
);
CREATE INDEX IF NOT EXISTS rerank_tutorial_hnsw
ON rerank_tutorial_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
-- Metadata B-tree is a comparison candidate, not a guaranteed HNSW prefilter.
CREATE INDEX IF NOT EXISTS rerank_tutorial_metadata
ON rerank_tutorial_chunks (snapshot_id, model_key, privacy_policy_version, company);

SELECT chunk_id, excerpt, embedding <=> %(query_vector)s AS distance
FROM rerank_tutorial_chunks
WHERE snapshot_id = %(snapshot_id)s
  AND model_key = %(model_key)s
  AND privacy_policy_version = %(privacy_policy)s
  AND permitted = true
  AND (company = %(company)s OR company IS NULL)
  AND published_at <= %(as_of)s AND first_seen_at <= %(as_of)s
ORDER BY embedding <=> %(query_vector)s
LIMIT %(candidate_limit)s;
-- Keep ORDER BY as the distance operator, ascending, with LIMIT for index eligibility.
-- WHERE guards returned evidence, but does not mean HNSW traverses only these rows.
-- Bind parameters using Psycopg; never interpolate article text or request values.

-- Query settings belong inside the SAME transaction as the filtered SELECT.
BEGIN;
SET LOCAL hnsw.ef_search = 80; -- Experiment value; not top-k or a node-visit limit.
SET LOCAL hnsw.iterative_scan = strict_order; -- Requires pgvector >=0.8.0.
SET LOCAL hnsw.max_scan_tuples = 20000; -- Still bounded; may return fewer than k.
SET LOCAL statement_timeout = '4s'; -- Tutorial only; production clips to run budget.
-- Execute the parameter-bound query with your compatible 384D query vector.
-- Inspect EXPLAIN (ANALYZE, BUFFERS) in a controlled experiment.
-- A small table may use a sequential scan even when an HNSW index exists.
COMMIT;

-- Exact comparison uses the SAME snapshot, query, model, filters and LIMIT:
BEGIN;
SET LOCAL enable_indexscan = off;
-- Execute the same SELECT and keep its IDs as the exact-neighbour reference.
COMMIT;
-- Compare overlap against exact independently of relevance qrels.
-- strict_order sorts found neighbours, not an exact-recall guarantee.

```

## References / 參考

- [pgvector: HNSW, filtering, iterative scans and exact comparison](https://github.com/pgvector/pgvector)

- [Multilingual E5 small embedding model](https://huggingface.co/intfloat/multilingual-e5-small)

- [BGE reranker v2 M3 model card](https://huggingface.co/BAAI/bge-reranker-v2-m3)

- [Sentence Transformers: CrossEncoder usage](https://www.sbert.net/docs/cross_encoder/usage/usage.html)
