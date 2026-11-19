-- Run as the admin after both schemas. Set login passwords with psql \password.
BEGIN;
DO $$
DECLARE role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['stock_ingest', 'stock_app', 'stock_embed'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('CREATE ROLE %I LOGIN', role_name);
    END IF;
  END LOOP;
END;
$$;

REVOKE CONNECT, TEMPORARY ON DATABASE stock_research FROM PUBLIC;
GRANT CONNECT ON DATABASE stock_research TO stock_ingest, stock_app, stock_embed;

GRANT USAGE ON SCHEMA news_ingest TO stock_ingest;
GRANT SELECT, INSERT, UPDATE ON news_ingest.batches TO stock_ingest;
GRANT SELECT, INSERT ON news_ingest.versions, news_ingest.members,
  news_ingest.embedding_outbox TO stock_ingest;
GRANT EXECUTE ON FUNCTION news_ingest.claim_batch(text,jsonb),
  news_ingest.commit_batch(text,jsonb) TO stock_ingest;

GRANT USAGE ON SCHEMA stock_rag TO stock_app, stock_embed;
GRANT SELECT ON stock_rag.completed_news TO stock_app;
GRANT SELECT, INSERT ON stock_rag.source_versions, stock_rag.source_scopes,
  stock_rag.chunks, stock_rag.reports, stock_rag.report_citations TO stock_app;
GRANT SELECT ON stock_rag.source_revocations, stock_rag.embedding_models, stock_rag.embeddings,
  stock_rag.snapshots, stock_rag.snapshot_evidence TO stock_app;
GRANT EXECUTE ON FUNCTION stock_rag.freeze_snapshot(uuid,text,text,timestamptz,text,uuid[],text)
  TO stock_app;

GRANT SELECT ON stock_rag.chunks, stock_rag.source_versions,
  stock_rag.source_revocations, stock_rag.embedding_models TO stock_embed;
GRANT SELECT, INSERT ON stock_rag.embeddings TO stock_embed;
COMMIT;
