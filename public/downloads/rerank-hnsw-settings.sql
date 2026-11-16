-- Query settings belong inside the SAME transaction as the filtered SELECT.
BEGIN;
SET LOCAL hnsw.ef_search = 80; -- Experiment value; not top-k or a node-visit limit.
SET LOCAL hnsw.iterative_scan = strict_order; -- Requires pgvector >=0.8.0.
SET LOCAL hnsw.max_scan_tuples = 20000; -- Still bounded; may return fewer than k.
SET LOCAL statement_timeout = '4s'; -- Tutorial only; production clips to run budget.
-- Execute the parameter-bound query with your compatible 384D query vector.
-- Inspect EXPLAIN (ANALYZE, BUFFERS) in a controlled experiment.
-- A small table may use a sequential scan even when an HNSW index exists.
COMMIT;

-- Exact comparison uses the SAME snapshot, query, model, filters and LIMIT:
BEGIN;
SET LOCAL enable_indexscan = off;
-- Execute the same SELECT and keep its IDs as the exact-neighbour reference.
COMMIT;
-- Compare overlap against exact independently of relevance qrels.
-- strict_order sorts found neighbours, not an exact-recall guarantee.
