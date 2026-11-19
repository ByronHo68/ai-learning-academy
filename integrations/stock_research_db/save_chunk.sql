-- Bind: source_id, chunker key, field, ordinal, start, end, token count.
-- Unicode code-point offsets are zero-based with an exclusive end.
WITH body AS (
  SELECT v.source_id,
         CASE WHEN v.kind IN ('profile','filing') AND $3 = 'curated_text' THEN v.curated_text
              WHEN v.kind = 'news' AND $3 IN ('content','summary') THEN
                (SELECT n.article->>$3 FROM stock_rag.completed_news n
                 WHERE n.version_id = v.news_version_id LIMIT 1)
         END AS source_text
  FROM stock_rag.source_versions v
  WHERE v.source_id = $1::uuid
    AND NOT EXISTS (SELECT 1 FROM stock_rag.source_revocations r WHERE r.source_id = v.source_id)
)
INSERT INTO stock_rag.chunks (
  source_id, chunker_key, source_field, ordinal, char_start, char_end, excerpt, token_count
)
SELECT source_id, $2, $3, $4, $5, $6,
       substring(source_text FROM $5::int + 1 FOR GREATEST($6::int - $5::int, 0)), $7
FROM body
WHERE $5::int >= 0 AND $6::int > $5::int AND $6::int <= char_length(source_text)
ON CONFLICT (source_id, chunker_key, source_field, ordinal) DO NOTHING
RETURNING chunk_id, excerpt;
