-- Bind: run_id, authenticated owner_id, sanitized search query.
WITH q AS (SELECT websearch_to_tsquery('simple'::regconfig, $3::text) AS terms)
SELECT e.chunk_id, e.source_id, e.excerpt, e.title, e.source_url, e.published_at,
       e.content_quality, ts_rank_cd(e.search_text, q.terms) AS score
FROM stock_rag.snapshot_evidence e CROSS JOIN q
WHERE e.run_id = $1::uuid AND e.owner_id = $2 AND e.search_text @@ q.terms
ORDER BY score DESC, e.chunk_id
LIMIT 20;
