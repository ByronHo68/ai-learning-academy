SELECT chunk_id, excerpt,
       1 - (embedding <=> %(query_vector)s) AS cosine_similarity
FROM vector_tutorial_chunks
WHERE snapshot_id = %(snapshot_id)s
  AND model_key = %(model_key)s
  AND permitted = true
  AND (company = %(company)s OR company IS NULL)
  AND published_at <= %(as_of)s AND first_seen_at <= %(as_of)s
ORDER BY embedding <=> %(query_vector)s, chunk_id
LIMIT %(top_k)s;
-- Parameters are bound by Psycopg, never interpolated from news text.
-- A nearest-neighbour result still needs relevance/support validation.
