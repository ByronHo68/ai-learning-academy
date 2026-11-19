-- Bind: chunk_id, pinned model_key, pgvector input.
INSERT INTO stock_rag.embeddings (chunk_id, model_key, embedding)
SELECT c.chunk_id, $2, $3::public.vector(384)
FROM stock_rag.chunks c
WHERE c.chunk_id = $1::uuid
  AND NOT EXISTS (SELECT 1 FROM stock_rag.source_revocations r WHERE r.source_id = c.source_id)
ON CONFLICT (chunk_id, model_key) DO NOTHING
RETURNING chunk_id, model_key;
