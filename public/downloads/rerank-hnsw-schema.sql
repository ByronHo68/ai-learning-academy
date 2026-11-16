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
