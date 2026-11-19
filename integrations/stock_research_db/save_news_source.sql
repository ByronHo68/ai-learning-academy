-- Bind: completed batch_key, n8n version_id, privacy policy key, permission reference,
-- and verified content quality (use 'unknown' when the MCP did not distinguish).
-- An empty RETURNING result can mean no such completed membership or an existing row.
INSERT INTO stock_rag.source_versions (
  document_key, version_key, kind, news_version_id, title, publisher, source_url,
  published_at, first_seen_at, content_quality, permission_ref, privacy_policy_key
)
SELECT DISTINCT 'news:' || n.document_id, n.version_id, 'news', n.version_id,
       n.article->>'title', n.article->>'publisher', n.article->>'url',
       (n.article->>'publishedAt')::timestamptz, n.first_seen_at, $5, $4, $3
FROM stock_rag.completed_news n
WHERE n.batch_key = $1 AND n.version_id = $2
ON CONFLICT (document_key, version_key, privacy_policy_key) DO NOTHING
RETURNING source_id;
