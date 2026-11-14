# Vector databases and embeddings / 向量資料庫及 Embedding

Open `/finance-project/vector-db` for the bilingual mind map, animated search and model examples. Offline browser calls: zero. Its 2D coordinates are handmade, not E5 outputs or a measured projection. Real-model inference and PostgreSQL execution are NOT RUN; Python syntax is checked. Sparse remains the default until measured hybrid admission.

開啟 `/finance-project/vector-db` 看雙語心智圖、搜尋動畫及模型例子。瀏覽器外部呼叫為零，二維座標是人手指定，不是 E5 輸出或實測投影。真實模型及 PostgreSQL 執行為 NOT RUN；Python 已檢查語法。混合檢索量度准入前維持全文預設。

## Embedding model / Embedding 模型

An embedding model encodes text into a vector so a search system can compare meanings. It does not store the article or write the report. The proposed multilingual-e5-small candidate outputs 384 numbers per text; each number is a learned coordinate, not a named financial factor.

Embedding 模型把文字編碼成向量，讓搜尋系統比較語義。它不保存文章，也不寫報告。建議候選 multilingual-e5-small 每段輸出 384 個數字；每個是學習到的座標，不是有名稱的金融因素。

## Chunk + source metadata / 切段＋來源資料

Split permitted article/profile text into manageable passages before embedding. Keep source/chunk IDs, content hash, publication/first-seen times, company/topic, permission and snapshot membership. A short provider summary is not the full article. Chunking avoids silently truncating long text and lets the answer cite the exact excerpt.

Embedding 前把允許的文章／背景文字切成適當段落，保留來源／切段 ID、內容 hash、發布／首次取得時間、公司／主題、權限及快照成員資料。供應商短摘要不是完整文章；切段避免長文被暗中截斷，亦讓答案引用確切節錄。

## Vector database / 向量資料庫

Your vector database is PostgreSQL with the pgvector extension. PostgreSQL stores original excerpts and metadata; pgvector adds vector columns and distance search. It is the same database service, not a second news provider or an embedding model. Your existing full-text index remains available beside it.

你的向量資料庫是 PostgreSQL 加 pgvector extension。PostgreSQL 存原文及 metadata，pgvector 加向量欄位及距離搜尋。這是同一資料庫服務，不是另一新聞供應商或 embedding 模型；旁邊仍保留全文索引。

## Similarity and nearest neighbours / 相似度及最近鄰

Cosine similarity compares vector direction. pgvector’s cosine operator returns distance, so lower is nearer; 1 − distance gives cosine similarity. Top-k means take k ranked candidates after filters. High similarity does not prove a claim, freshness or a future stock move. Score thresholds must be calibrated for the actual model and task.

Cosine similarity 比較向量方向。pgvector 的 cosine operator 回傳距離，越低越近；1−距離才是相似度。Top-k 指篩選後取前 k 個候選。高相似度不證明主張、時效或未來股價；門檻須按實際模型及任務校準。

## Reranker / 重排器

Vector search retrieves candidates efficiently. A separate reranker reads question–passage pairs to reorder a smaller candidate set. It uses original text, not just vector coordinates. It is different from the embedding model, provider sentiment and your manual discussion order.

向量搜尋找出候選；另一重排器讀問題與原文配對，重新排列較小候選集合。它用原文，不只讀座標，亦與 embedding 模型、供應商情緒及用戶討論次序不同。

## RAG + evidence review + LLM / RAG＋證據覆核＋LLM

Retrieval supplies excerpts to the LLM. After ranking, show the proposed news and original ranks; users may exclude, highlight and reorder discussion. Validate selected IDs and coverage before generation. The LLM receives the question, excerpts, dates, citation IDs and selection limitations—not a list of raw vectors as its evidence.

檢索把節錄交給 LLM。排序後展示建議新聞及原排名，讓用戶排除、標記或改討論次序；生成前核對 ID 及證據覆蓋。LLM 收到問題、原文、日期、引用 ID 及選取限制，不是把原始向量清單當證據。

## Model candidates / 模型候選

### [intfloat/multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small)

384 dimensions · 512 tokens

Starting candidate for English + Chinese

中英查詢的起步候選

Supports multilingual retrieval and fits the existing vector(384) example. Encode documents with passage: and queries with query:, including non-English text; normalize consistently. This is a proposal to evaluate on your news, not a claim of financial accuracy.

支援多語檢索，配合現有 vector(384) 範例。文件加 passage:、問題加 query:，非英文亦一樣，並一致正規化。這是供新聞評估的建議，不代表已驗證金融準確度。

### [BAAI/bge-small-en-v1.5](https://huggingface.co/BAAI/bge-small-en-v1.5)

384 dimensions · 512 tokens

English-only comparison candidate

英文檢索比較候選

Compare on an English query/news slice. Use its own documented query instruction and preprocessing. Equal dimensions do not make its vectors compatible with E5: keep a separate model key and re-embed the corpus before comparing.

可在英文問題／新聞子集比較；使用其官方查詢指令及處理方式。維度一樣不代表與 E5 相容；須獨立模型鍵及重新嵌入語料再比較。

### [BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3)

1024 dimensions · 8192 tokens

Multilingual / longer-input alternative

多語／較長輸入替代候選

A possible later dense-retrieval experiment. Its larger vector and input window change resource needs; no speed or quality advantage has been measured here. It needs a 1024-dimensional schema/index and a full compatible reindex. This project does not enable its sparse or multi-vector modes.

可作之後的 dense retrieval 實驗。較大向量及輸入視窗改變資源需求，這裡未量度速度或品質優勢；須 1024 維 schema／索引及完整相容重建。本項目不啟用其 sparse 或 multi-vector 模式。

## Ingestion: after n8n commits the news / 匯入：n8n 提交新聞之後

YFinance supplies company news; the daily Alpha Vantage job supplies macro/fiscal news and broad candidates for geopolitical tagging. After validation/deduplication/commit, a Python indexing worker chunks permitted text and creates document embeddings. Company-profile excerpts follow the same path. n8n does not run a browser embedding model.

YFinance 提供公司新聞；Alpha Vantage 每日工作提供宏觀／財政及廣泛候選作地緣標記。驗證、去重及提交後，Python 索引 worker 切段及建立文件 embedding；公司背景同樣處理。n8n 不是在瀏覽器執行模型。

## Index once; reuse unchanged content / 建立索引後重用未改動內容

Key each vector by text/chunk hash plus model revision, dimension, prefixes, normalization and chunker configuration. Pin an immutable model revision. Store vector readiness and embedding provenance. Re-embed changed chunks or a new model/configuration; excluding or reordering existing news does not need new embeddings.

向量鍵包含文字／段落 hash、模型 revision、維度、prefix、正規化及切段設定；固定不可變模型 revision，記錄就緒及來源。內容或模型設定改動才重嵌入；排除或改新聞次序毋須新 embedding。

## Per question: encode the query before search / 每題：搜尋前先編碼查詢

After scope acceptance, company refresh and snapshot pinning, hybrid mode embeds the query with the compatible model/configuration. Apply the frozen snapshot, permission, company/global-context and both time filters before top-k. Fuse with full-text results, rerank, review and recheck support. A refined query gets a new query vector; original document vectors stay reusable.

範圍通過、公司刷新及固定快照後，混合模式以相容設定嵌入問題。Top-k 前套固定快照、權限、公司／共用背景及兩個時間條件，再與全文融合、重排、覆核及重查支持。補查的新 query 要新向量，原文件向量可重用。

## Start with exact search and measure admission / 先 exact search，再量度准入

pgvector defaults to exact nearest-neighbour search. HNSW/IVFFlat are optional approximate indexes with recall/latency tradeoffs, not a requirement for a small pilot. Keep PostgreSQL full-text as the project default until the frozen golden set shows at least +0.03 recall@10 and +0.05 nDCG@10 over sparse, with citation/safety gates satisfied. Toy scores on this page cannot authorize hybrid retrieval.

pgvector 預設 exact nearest-neighbour。HNSW／IVFFlat 是可選近似索引，涉及召回／延遲取捨，小型試驗並非必須。項目預設全文，凍結 golden set 須比 sparse 至少提升 recall@10 0.03、nDCG@10 0.05 並過引用／安全關卡才准入；本頁玩具分數不能授權混合檢索。

## Checkpoint references and vector storage differ / Checkpoint 引用與向量儲存分開

PostgreSQL evidence tables keep vectors/excerpts. A LangGraph checkpoint keeps snapshot IDs, ranked IDs, model/configuration references, selection/order and remaining budgets. It does not need model weights or live database connections. Pin the vector-ready view so refinement/resume do not silently change the run’s retrieval corpus.

PostgreSQL 證據表存向量及原文；LangGraph checkpoint 存快照、排序 ID、模型設定引用、選取／次序及預算，不須存模型權重或即時連線。固定向量就緒視圖，補查／恢復不暗改任務檢索語料。

## Animation / 動畫

Try costs, rates, missing evidence, incompatible model and out-of-scope prompts. Adjust top-k and the toy-only threshold. Disabling metadata filters is an unsafe comparison and blocks context; production must enforce them. The demo computes cosine, does not execute a real reranker, and uses pre-labelled fictional support facets.

### 1 · Original text / 1 · 原文

Fictional company news, Alpha Vantage macro context and a dated profile are the source material. Provider sentiment is metadata, not an embedding.

虛構公司新聞、Alpha Vantage 宏觀背景及有日期背景是原材料；供應商情緒只是 metadata，不是 embedding。

### 2 · Chunk + metadata / 2 · 切段＋metadata

Each short fixture is one passage. Real articles need tokenizer-aware chunking with source IDs, dates, hashes and permissions.

每個短 fixture 是一段；真實文章須按 tokenizer 切段，保留來源 ID、日期、hash 及權限。

### 3 · Document embeddings / 3 · 文件 embedding

The points now use hand-assigned 2D coordinates so you can inspect them. They are not E5 outputs, a trained browser model, or a projection of measured 384D embeddings.

圖中用人手指定的二維座標供觀察，不是 E5 輸出、瀏覽器訓練模型，亦非實測 384 維向量投影。

### 4 · PostgreSQL + pgvector / 4 · PostgreSQL＋pgvector

Store original text, metadata and model-keyed vectors. Indexing is a separate Python job; unchanged text/configuration reuses its vector.

保存原文、metadata 及按模型鍵分開的向量；索引為獨立 Python 工作，未改文字／設定可重用。

### 5 · Query embedding / 5 · 問題 embedding

Encode the query in the compatible space. In the real E5 recipe, queries use query: while document passages use passage:.

用相容空間編碼查詢；真實 E5 配方中，問題加 query:，文件加 passage:。

### 6 · Filter + nearest search / 6 · 篩選＋最近鄰搜尋

Filter before top-k, then compare direction. Inspect why high-scoring wrong-company, future and permission-revoked passages are removed.

Top-k 前先篩選，再比較方向；查看高分錯公司、未來及權限撤銷段落為何被移除。

### 7 · Text reranker / 7 · 原文重排

A production reranker would read each question–passage pair. This browser does not run one or invent a measured reranker score; the list remains the computed toy cosine order.

正式重排器會讀問題與原文配對；瀏覽器沒有執行，也不捏造實測重排分數，清單仍是計算出的玩具 cosine 次序。

### 8 · Your evidence review / 8 · 你的證據覆核

Show proposed news and original ranks, allow exclusions/highlights/discussion order, then validate selection. Reordering needs no re-embedding.

展示建議新聞及原排名，讓用戶排除／標記／改討論次序，再驗證選取；改次序毋須重嵌入。

### 9 · Evidence → LLM context / 9 · 證據 → LLM context

Only supported permitted excerpts, source IDs and dates go to the LLM after the evidence gate. Raw vector coordinates are not answer evidence.

證據關卡後，只有有支持且允許的原文、來源 ID 及日期進 LLM；原始向量座標不是答案證據。

## Diagrams / 圖解

[Embedding workflow SVG](../public/downloads/finance-diagrams/embeddings-en.svg) · [PostgreSQL storage SVG](../public/downloads/finance-diagrams/vector_storage-en.svg)

## Standalone tutorial / 獨立教學

```sh
# Separate Python 3.11+ tutorial environment; the browser/office page needs none of this.
python3 -m venv .venv
source .venv/bin/activate
python -m pip install sentence-transformers numpy "psycopg[binary]" pgvector
# On the model's Files/Commits page, review and copy an immutable 40-character revision.
# Replace this placeholder with that reviewed commit (not the moving branch main):
export EMBEDDING_MODEL_REVISION="<reviewed-40-character-commit>"
# Model: https://huggingface.co/intfloat/multilingual-e5-small/commits/main
# Record/pin the tested package versions before adopting this in the finance service.

# Real embeddings and local cosine ranking; no database or news/model API key:
python stock-research-vector-demo.py
python stock-research-vector-demo.py --question "哪些證據討論 MSFT 雲端基建成本？"

# Optional: create a disposable pgvector-enabled DB named vector_tutorial first.
# Local example (configure authentication privately, e.g. via .pgpass):
export VECTOR_DEMO_DATABASE_URL="postgresql://localhost/vector_tutorial"
python stock-research-vector-demo.py --setup
python stock-research-vector-demo.py --postgres
# Setup/inference/database execution are NOT RUN by the academy's browser demo.
# The finance app stays on full-text until its frozen retrieval/safety gates pass.
```

```python
"""Standalone real-model tutorial, not a finance backend.
Browser animation uses handmade 2D vectors; THIS script loads multilingual E5.
Syntax is checked by academy tests; model inference and PostgreSQL are NOT RUN.
Python 3.11+. First model load needs internet or a populated local cache.
"""
import argparse
import hashlib
import json
import os
import re

import numpy as np
import psycopg
from pgvector.psycopg import register_vector
from sentence_transformers import SentenceTransformer

MODEL_ID = "intfloat/multilingual-e5-small"
DIMENSIONS = 384
SNAPSHOT = "fictional-vector-tutorial-v1"
AS_OF = "2026-11-15T00:00:00Z"
DOCUMENTS = [
    ("costs", "MSFT", "Fictional: MSFT increased investment in cloud data centres."),
    ("rates", None, "Fictional macro story: higher rates increase borrowing costs."),
    ("profile", "MSFT", "Fictional profile: cloud infrastructure contributes to operating costs."),
]

SCHEMA = """-- Disposable tutorial DB only; not the finance app's production migration.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS vector_tutorial_chunks (
  snapshot_id text NOT NULL,
  chunk_id text NOT NULL,
  company text,
  published_at timestamptz NOT NULL,
  first_seen_at timestamptz NOT NULL,
  permitted boolean NOT NULL,
  model_key text NOT NULL,
  excerpt text NOT NULL,
  embedding vector(384) NOT NULL,
  PRIMARY KEY (snapshot_id, chunk_id, model_key)
);
-- No approximate index is required for this small exact-search tutorial.
"""
QUERY = """SELECT chunk_id, excerpt,
       1 - (embedding <=> %(query_vector)s) AS cosine_similarity
FROM vector_tutorial_chunks
WHERE snapshot_id = %(snapshot_id)s
  AND model_key = %(model_key)s
  AND permitted = true
  AND (company = %(company)s OR company IS NULL)
  AND published_at <= %(as_of)s AND first_seen_at <= %(as_of)s
ORDER BY embedding <=> %(query_vector)s, chunk_id
LIMIT %(top_k)s;
-- Parameters are bound by Psycopg, never interpolated from news text.
-- A nearest-neighbour result still needs relevance/support validation.
"""

def private_database_url():
    value = os.environ.get("VECTOR_DEMO_DATABASE_URL")
    if not value:
        raise SystemExit("Set private VECTOR_DEMO_DATABASE_URL for the disposable tutorial DB")
    return value

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--question", default="Which evidence discusses MSFT cloud infrastructure costs?")
    parser.add_argument("--setup", action="store_true")
    parser.add_argument("--postgres", action="store_true")
    args = parser.parse_args()
    if args.setup:
        with psycopg.connect(private_database_url(), autocommit=True) as connection:
            connection.execute(SCHEMA)
        print("Tutorial vector table ready; no model was downloaded")
        return

    revision = os.environ.get("EMBEDDING_MODEL_REVISION", "")
    if not re.fullmatch(r"[a-fA-F0-9]{40}", revision):
        raise SystemExit("Set EMBEDDING_MODEL_REVISION to a reviewed immutable 40-character model commit")
    model = SentenceTransformer(MODEL_ID, revision=revision,
                                trust_remote_code=False, device="cpu")
    if model.get_sentence_embedding_dimension() != DIMENSIONS:
        raise ValueError("Unexpected dimension: migrate/reindex instead of mixing vector spaces")
    model.max_seq_length = 512
    passages = ["passage: " + text for _, _, text in DOCUMENTS]
    query_text = "query: " + args.question
    # Check the actual tokenizer including prefixes and special tokens.
    # A real ingestion worker chunks long text first, rather than silently clipping it.
    for text in [*passages, query_text]:
        token_ids = model.tokenizer(text, add_special_tokens=True, truncation=False)["input_ids"]
        if len(token_ids) > model.max_seq_length:
            raise ValueError("Input exceeds the model window; chunk documents or shorten the query")

    documents = model.encode(passages, normalize_embeddings=True, convert_to_numpy=True)
    query = model.encode([query_text], normalize_embeddings=True, convert_to_numpy=True)[0]
    if documents.shape != (len(DOCUMENTS), DIMENSIONS) or query.shape != (DIMENSIONS,):
        raise ValueError("Invalid embedding shape")
    if not np.isfinite(documents).all() or not np.isfinite(query).all():
        raise ValueError("Invalid embedding values")
    configuration = {"model_id": MODEL_ID, "revision": revision, "dimensions": DIMENSIONS,
                     "document_prefix": "passage: ", "query_prefix": "query: ",
                     "normalize": True, "max_tokens": 512, "chunker": "short-fixture-v1"}
    model_key = hashlib.sha256(json.dumps(configuration, sort_keys=True).encode()).hexdigest()
    print(json.dumps(configuration, indent=2))
    print("Model key:", model_key)
    # Unit-normalized dot product equals cosine similarity here.
    scores = documents @ query
    for index in np.argsort(-scores):
        print(DOCUMENTS[index][0], round(float(scores[index]), 4), DOCUMENTS[index][2])
    print("Similarity is not factual support or a stock-return estimate")

    if args.postgres:
        with psycopg.connect(private_database_url()) as connection:
            register_vector(connection)
            with connection.cursor() as cursor:
                for (label, company, excerpt), vector in zip(DOCUMENTS, documents):
                    content_hash = hashlib.sha256(excerpt.encode()).hexdigest()
                    chunk_id = label + ":" + content_hash
                    cursor.execute("""INSERT INTO vector_tutorial_chunks
                        (snapshot_id, chunk_id, company, published_at, first_seen_at,
                         permitted, model_key, excerpt, embedding)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                        ON CONFLICT DO NOTHING""",
                        (SNAPSHOT, chunk_id, company, "2026-11-13T08:00:00Z",
                         "2026-11-14T01:00:00Z", True, model_key, excerpt, vector))
                cursor.execute(QUERY, {"query_vector": query, "snapshot_id": SNAPSHOT,
                                      "model_key": model_key, "company": "MSFT",
                                      "as_of": AS_OF, "top_k": 3})
                for row in cursor.fetchall():
                    print("POSTGRESQL", row)
        print("Exact pgvector query only: no hybrid admission, reranker or LLM was run")

if __name__ == "__main__":
    main()

```

```sql
-- Disposable tutorial DB only; not the finance app's production migration.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS vector_tutorial_chunks (
  snapshot_id text NOT NULL,
  chunk_id text NOT NULL,
  company text,
  published_at timestamptz NOT NULL,
  first_seen_at timestamptz NOT NULL,
  permitted boolean NOT NULL,
  model_key text NOT NULL,
  excerpt text NOT NULL,
  embedding vector(384) NOT NULL,
  PRIMARY KEY (snapshot_id, chunk_id, model_key)
);
-- No approximate index is required for this small exact-search tutorial.

SELECT chunk_id, excerpt,
       1 - (embedding <=> %(query_vector)s) AS cosine_similarity
FROM vector_tutorial_chunks
WHERE snapshot_id = %(snapshot_id)s
  AND model_key = %(model_key)s
  AND permitted = true
  AND (company = %(company)s OR company IS NULL)
  AND published_at <= %(as_of)s AND first_seen_at <= %(as_of)s
ORDER BY embedding <=> %(query_vector)s, chunk_id
LIMIT %(top_k)s;
-- Parameters are bound by Psycopg, never interpolated from news text.
-- A nearest-neighbour result still needs relevance/support validation.

```

## References / 參考

- [Multilingual E5 model card: dimensions, prefixes and limits](https://huggingface.co/intfloat/multilingual-e5-small)

- [BGE small English model card](https://huggingface.co/BAAI/bge-small-en-v1.5)

- [BGE-M3 model card](https://huggingface.co/BAAI/bge-m3)

- [pgvector: distance, exact search and approximate indexes](https://github.com/pgvector/pgvector)

- [Sentence Transformers similarity](https://www.sbert.net/docs/sentence_transformer/usage/semantic_textual_similarity.html)
