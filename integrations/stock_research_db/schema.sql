-- Apply to stock_research after integrations/n8n_stock_news/schema.sql.
BEGIN;

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
CREATE SCHEMA IF NOT EXISTS stock_rag;

-- Read the normalized n8n items only after a whole batch commits.
CREATE OR REPLACE VIEW stock_rag.completed_news AS
SELECT b.batch_key, b.completed_at, b.config->>'provider' AS provider,
       m.topic, v.version_id, v.document_id, v.article, v.first_seen_at
FROM news_ingest.batches b
JOIN news_ingest.members m USING (batch_key)
JOIN news_ingest.versions v USING (version_id)
WHERE b.status = 'completed' AND b.completed_at IS NOT NULL;

-- One admitted version. News text stays in staging; curated text lives here.
CREATE TABLE IF NOT EXISTS stock_rag.source_versions (
  source_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_key text NOT NULL,
  version_key text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('news','profile','filing')),
  news_version_id text REFERENCES news_ingest.versions(version_id),
  title text NOT NULL CHECK (length(title) > 0),
  publisher text,
  source_url text CHECK (source_url ~ '^https?://[^[:space:]]+$'),
  published_at timestamptz,
  first_seen_at timestamptz NOT NULL,
  admitted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  content_quality text NOT NULL CHECK (content_quality IN ('article_body','summary','excerpt','unknown')),
  curated_text text,
  permission_ref text NOT NULL CHECK (length(permission_ref) > 0),
  privacy_policy_key text NOT NULL,
  UNIQUE (document_key, version_key, privacy_policy_key),
  CHECK (
    (kind = 'news' AND news_version_id IS NOT NULL AND curated_text IS NULL)
    OR (kind IN ('profile','filing') AND news_version_id IS NULL AND curated_text IS NOT NULL)
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS stock_rag_news_policy
  ON stock_rag.source_versions (news_version_id, privacy_policy_key)
  WHERE news_version_id IS NOT NULL;

-- Keep the earliest verified time this association was known. Scope is curated by the host.
CREATE TABLE IF NOT EXISTS stock_rag.source_scopes (
  source_id uuid NOT NULL REFERENCES stock_rag.source_versions,
  scope text NOT NULL CHECK (scope IN ('MSFT','AAPL','NVDA','SHARED')),
  known_at timestamptz NOT NULL,
  PRIMARY KEY (source_id, scope)
);
CREATE TABLE IF NOT EXISTS stock_rag.source_revocations (
  source_id uuid PRIMARY KEY REFERENCES stock_rag.source_versions,
  revoked_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  reason_code text NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_rag.chunks (
  chunk_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES stock_rag.source_versions,
  chunker_key text NOT NULL,
  source_field text NOT NULL CHECK (source_field IN ('content','summary','curated_text')),
  ordinal integer NOT NULL CHECK (ordinal >= 0),
  char_start integer NOT NULL CHECK (char_start >= 0),
  char_end integer NOT NULL CHECK (char_end > char_start),
  excerpt text NOT NULL CHECK (length(excerpt) BETWEEN 1 AND 12000),
  token_count integer NOT NULL CHECK (token_count > 0),
  search_text tsvector GENERATED ALWAYS AS
    (to_tsvector('simple'::regconfig, excerpt)) STORED,
  UNIQUE (source_id, chunker_key, source_field, ordinal),
  CHECK (char_end - char_start = char_length(excerpt))
);
CREATE INDEX IF NOT EXISTS stock_rag_chunks_text ON stock_rag.chunks USING gin (search_text);

CREATE TABLE IF NOT EXISTS stock_rag.embedding_models (
  model_key text PRIMARY KEY,
  model_name text NOT NULL,
  model_revision text NOT NULL,
  preprocessing jsonb NOT NULL CHECK (jsonb_typeof(preprocessing) = 'object')
);
CREATE TABLE IF NOT EXISTS stock_rag.embeddings (
  chunk_id uuid NOT NULL REFERENCES stock_rag.chunks,
  model_key text NOT NULL REFERENCES stock_rag.embedding_models,
  embedding public.vector(384) NOT NULL CHECK (public.vector_norm(embedding) > 0),
  ready_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (chunk_id, model_key)
);

CREATE TABLE IF NOT EXISTS stock_rag.snapshots (
  run_id uuid PRIMARY KEY,
  owner_id text NOT NULL,
  company text NOT NULL CHECK (company IN ('MSFT','AAPL','NVDA')),
  as_of timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  chunker_key text NOT NULL,
  model_key text REFERENCES stock_rag.embedding_models
);
CREATE TABLE IF NOT EXISTS stock_rag.snapshot_chunks (
  run_id uuid NOT NULL REFERENCES stock_rag.snapshots,
  chunk_id uuid NOT NULL REFERENCES stock_rag.chunks,
  vector_ready boolean NOT NULL,
  PRIMARY KEY (run_id, chunk_id)
);

-- Only this function inserts a manifest for the application role. A repeat call
-- with the same run ID fails its unique constraint. Read the existing snapshot on replay.
CREATE OR REPLACE FUNCTION stock_rag.freeze_snapshot(
  p_run uuid, p_owner text, p_company text, p_as_of timestamptz,
  p_chunker text, p_chunks uuid[], p_model text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE n integer;
BEGIN
  IF p_chunks IS NULL THEN RAISE EXCEPTION 'snapshot_requires_chunk_array'; END IF;
  INSERT INTO stock_rag.snapshots (run_id, owner_id, company, as_of, chunker_key, model_key)
  VALUES (p_run, p_owner, p_company, p_as_of, p_chunker, p_model);

  INSERT INTO stock_rag.snapshot_chunks (run_id, chunk_id, vector_ready)
  SELECT p_run, c.chunk_id, e.chunk_id IS NOT NULL
  FROM stock_rag.chunks c
  JOIN stock_rag.source_versions v USING (source_id)
  LEFT JOIN stock_rag.embeddings e ON e.chunk_id = c.chunk_id AND e.model_key = p_model
  WHERE c.chunk_id = ANY(p_chunks) AND c.chunker_key = p_chunker
    AND v.published_at <= p_as_of AND v.first_seen_at <= p_as_of
    AND EXISTS (
      SELECT 1 FROM stock_rag.source_scopes s
      WHERE s.source_id = v.source_id AND s.scope IN (p_company, 'SHARED')
        AND s.known_at <= p_as_of
    )
    AND NOT EXISTS (SELECT 1 FROM stock_rag.source_revocations r WHERE r.source_id = v.source_id);

  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> cardinality(p_chunks) THEN RAISE EXCEPTION 'ineligible_or_duplicate_snapshot_chunk'; END IF;
  RETURN p_run;
END;
$$;
REVOKE ALL ON FUNCTION stock_rag.freeze_snapshot(uuid,text,text,timestamptz,text,uuid[],text) FROM PUBLIC;

CREATE OR REPLACE VIEW stock_rag.snapshot_evidence AS
SELECT s.run_id, s.owner_id, s.company, s.as_of, s.model_key, m.vector_ready,
       c.chunk_id, c.excerpt, c.search_text, c.source_field, c.char_start, c.char_end,
       v.source_id, v.document_key, v.version_key, v.title, v.publisher, v.source_url,
       v.published_at, v.first_seen_at, v.content_quality
FROM stock_rag.snapshots s
JOIN stock_rag.snapshot_chunks m USING (run_id)
JOIN stock_rag.chunks c USING (chunk_id)
JOIN stock_rag.source_versions v USING (source_id)
WHERE NOT EXISTS (SELECT 1 FROM stock_rag.source_revocations r WHERE r.source_id = v.source_id);

CREATE TABLE IF NOT EXISTS stock_rag.reports (
  run_id uuid PRIMARY KEY REFERENCES stock_rag.snapshots,
  horizon text NOT NULL CHECK (horizon IN ('30d','6mo','1y')),
  target_date date NOT NULL,
  validated_report jsonb NOT NULL CHECK (jsonb_typeof(validated_report) = 'object'),
  generation_config_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE IF NOT EXISTS stock_rag.report_citations (
  run_id uuid NOT NULL REFERENCES stock_rag.reports,
  chunk_id uuid NOT NULL,
  PRIMARY KEY (run_id, chunk_id),
  FOREIGN KEY (run_id, chunk_id) REFERENCES stock_rag.snapshot_chunks (run_id, chunk_id)
);

COMMIT;
