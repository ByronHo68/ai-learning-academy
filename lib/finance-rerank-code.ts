export const rerankTutorialSchema = `-- Disposable tutorial DB only. pgvector >= 0.8.0 for iterative_scan.
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
`;

export const rerankTutorialQuery = `SELECT chunk_id, excerpt, embedding <=> %(query_vector)s AS distance
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
`;

export const rerankSqlSettings = `-- Query settings belong inside the SAME transaction as the filtered SELECT.
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
`;

export const rerankPythonExample = `"""Synthetic E5 + BGE reranking tutorial; not a finance backend.
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
SCHEMA = """${rerankTutorialSchema}"""
QUERY = """${rerankTutorialQuery}"""

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
`;

export const rerankExampleCommands = `# Separate Python 3.11+ tutorial environment; first model downloads need internet/cache.
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
# Do not use toy overlap to admit hybrid retrieval or claim measured speed/quality.`;
