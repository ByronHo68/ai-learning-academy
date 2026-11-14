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
