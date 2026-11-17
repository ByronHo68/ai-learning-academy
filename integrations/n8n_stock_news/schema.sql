-- Separate staging schema. Run as the schema owner in your research database.
-- PostgreSQL 14+. No pgvector extension is required for collection.
CREATE SCHEMA IF NOT EXISTS news_ingest;
CREATE TABLE IF NOT EXISTS news_ingest.batches (
  batch_key text PRIMARY KEY,
  config jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('pending','completed')),
  started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  completed_at timestamptz,
  receipt jsonb
);
CREATE TABLE IF NOT EXISTS news_ingest.versions (
  version_id text PRIMARY KEY,
  document_id text NOT NULL,
  article jsonb NOT NULL,
  first_seen_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE IF NOT EXISTS news_ingest.members (
  batch_key text NOT NULL REFERENCES news_ingest.batches,
  version_id text NOT NULL REFERENCES news_ingest.versions,
  topic text NOT NULL,
  PRIMARY KEY(batch_key, version_id, topic)
);
CREATE TABLE IF NOT EXISTS news_ingest.embedding_outbox (
  version_id text PRIMARY KEY REFERENCES news_ingest.versions,
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','completed'))
);

CREATE OR REPLACE FUNCTION news_ingest.claim_batch(k text, c jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE acquired text; b news_ingest.batches;
BEGIN
  IF k IS NULL OR length(k) NOT BETWEEN 1 AND 200 OR c IS NULL THEN RAISE EXCEPTION 'invalid_batch'; END IF;
  INSERT INTO news_ingest.batches(batch_key,config,status) VALUES(k,c,'pending')
    ON CONFLICT DO NOTHING RETURNING batch_key INTO acquired;
  SELECT * INTO STRICT b FROM news_ingest.batches WHERE batch_key=k;
  IF b.config <> c THEN RAISE EXCEPTION 'batch_key_configuration_conflict'; END IF;
  RETURN jsonb_build_object('acquired',acquired IS NOT NULL,'batch_key',k,'status',b.status,'receipt',b.receipt);
END $$;

CREATE OR REPLACE FUNCTION news_ingest.commit_batch(k text, items jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE b news_ingest.batches; n jsonb; a jsonb; doc text; ver text;
  ids jsonb := '[]'; inserted integer := 0; count_new integer; r jsonb;
BEGIN
  SELECT * INTO STRICT b FROM news_ingest.batches WHERE batch_key=k FOR UPDATE;
  IF b.status='completed' THEN RETURN b.receipt; END IF;
  IF jsonb_typeof(items) IS DISTINCT FROM 'array' OR jsonb_array_length(items)>3000 THEN RAISE EXCEPTION 'invalid_items'; END IF;
  FOR n IN SELECT value FROM jsonb_array_elements(items) LOOP
    a := n - 'topic';
    IF jsonb_typeof(a->'title') IS DISTINCT FROM 'string' OR jsonb_typeof(a->'content') IS DISTINCT FROM 'string'
       OR NOT (n ? 'topic') THEN RAISE EXCEPTION 'invalid_article'; END IF;
    -- A URL identifies an article; the content hash identifies each correction.
    doc := encode(sha256(convert_to(COALESCE(NULLIF(a->>'url',''),
      jsonb_build_array(a->>'title',a->>'publisher',a->>'publishedAt',a->>'content')::text),'UTF8')),'hex');
    ver := encode(sha256(convert_to(doc || a::text,'UTF8')),'hex');
    INSERT INTO news_ingest.versions(version_id,document_id,article) VALUES(ver,doc,a) ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS count_new = ROW_COUNT;
    inserted := inserted + count_new;
    INSERT INTO news_ingest.members VALUES(k,ver,n->>'topic') ON CONFLICT DO NOTHING;
    INSERT INTO news_ingest.embedding_outbox(version_id) VALUES(ver) ON CONFLICT DO NOTHING;
    IF NOT ids @> jsonb_build_array(ver) THEN ids := ids || jsonb_build_array(ver); END IF;
  END LOOP;
  r := jsonb_build_object('batch_key',k,'status','completed','version_ids',ids,
    'new_versions',inserted,'unique_versions',jsonb_array_length(ids),
    'coverage',b.config->'coverage','committed_at',clock_timestamp());
  UPDATE news_ingest.batches SET status='completed', completed_at=clock_timestamp(),receipt=r WHERE batch_key=k;
  RETURN r;
END $$;

-- Functions use caller privileges. Do not connect n8n as a database owner.
REVOKE ALL ON FUNCTION news_ingest.claim_batch(text,jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION news_ingest.commit_batch(text,jsonb) FROM PUBLIC;
-- After creating a dedicated role, grant USAGE on this schema, SELECT/INSERT/UPDATE
-- on batches, SELECT/INSERT on versions/members/embedding_outbox, and EXECUTE on
-- these two functions. Grant no rights on profiles, reports or checkpoint tables.
