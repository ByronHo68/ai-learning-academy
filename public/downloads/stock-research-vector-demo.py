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
