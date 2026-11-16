SELECT chunk_id, excerpt, embedding <=> %(query_vector)s AS distance
FROM rerank_tutorial_chunks
WHERE snapshot_id = %(snapshot_id)s
  AND model_key = %(model_key)s
  AND privacy_policy_version = %(privacy_policy)s
  AND permitted = true
  AND (company = %(company)s OR company IS NULL)
  AND published_at <= %(as_of)s AND first_seen_at <= %(as_of)s
ORDER BY embedding <=> %(query_vector)s
LIMIT %(candidate_limit)s;
-- Keep ORDER BY as the distance operator, ascending, with LIMIT for index eligibility.
-- WHERE guards returned evidence, but does not mean HNSW traverses only these rows.
-- Bind parameters using Psycopg; never interpolate article text or request values.
