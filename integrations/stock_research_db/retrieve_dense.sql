-- Bind: run_id, authenticated owner_id, pgvector input, pinned model_key.
-- Run only for the evaluated dense candidate. Lower cosine distance is closer.
SELECT e.chunk_id, e.source_id, e.excerpt, e.title, e.source_url, e.published_at,
       e.content_quality, v.embedding OPERATOR(public.<=>) $3::public.vector(384) AS distance
FROM stock_rag.snapshot_evidence e
JOIN stock_rag.embeddings v ON v.chunk_id = e.chunk_id AND v.model_key = e.model_key
WHERE e.run_id = $1::uuid AND e.owner_id = $2 AND e.vector_ready AND e.model_key = $4
ORDER BY distance, e.chunk_id
LIMIT 20;
