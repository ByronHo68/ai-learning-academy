import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

// Install test-only packages in a temporary folder. The project gets no Node dependency.
const require = createRequire(resolve(process.env.STOCK_RAG_TEST_DEPS, 'package.json'));
const { PGlite } = require('@electric-sql/pglite');
const { vector } = require('@electric-sql/pglite-pgvector');
const db = await PGlite.create({ extensions: { vector } });
const read = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');
const query = async (sql, params = []) => (await db.query(sql, params)).rows;
const script = (file, params) => query(read(file), params);
const asRole = async (role, callback) => {
  await db.exec(`SET ROLE ${role}`);
  try {
    return await callback();
  } finally {
    await db.exec('RESET ROLE');
  }
};

try {
  await db.exec(read('../n8n_stock_news/schema.sql'));
  await db.exec(read('schema.sql'));
  await db.exec(read('schema.sql'));
  // PGlite starts with a scratch database named postgres.
  await db.exec(read('roles.sql').replaceAll('DATABASE stock_research', 'DATABASE postgres'));
  const article = {
    title: 'Fictional MSFT cloud update', summary: null, publisher: 'Example',
    content: 'Cloud demand expanded. Data center costs rose.',
    publishedAt: '2020-01-01T08:00:00Z', url: 'https://example.com/cloud', topic: 'company:MSFT',
  };
  const receipt = await asRole('stock_ingest', async () => {
    await query("SELECT news_ingest.claim_batch('demo:MSFT', '{\"provider\":\"own-yfinance-mcp\"}')");
    await query("SELECT news_ingest.claim_batch('pending:MSFT', '{}')");
    assert.equal((await query("SELECT news_ingest.claim_batch('demo:MSFT', '{\"provider\":\"own-yfinance-mcp\"}') AS r"))[0].r.acquired, false);
    await assert.rejects(query('SELECT * FROM stock_rag.chunks'), /permission denied/);
    return (await query("SELECT news_ingest.commit_batch('demo:MSFT',$1::jsonb) AS r", [JSON.stringify([article, article])]))[0].r;
  });
  assert.equal(receipt.unique_versions, 1);
  const [newsId] = receipt.version_ids;
  const sourceParams = ['demo:MSFT', newsId, 'demo-privacy', 'fictional-demo', 'unknown'];
  const chunks = await asRole('stock_app', async () => {
    assert.deepEqual(await script('save_news_source.sql', ['pending:MSFT', ...sourceParams.slice(1)]), []);
    const [{ source_id: sourceId }] = await script('save_news_source.sql', sourceParams);
    assert.deepEqual(await script('save_news_source.sql', sourceParams), []);
    await query(`
      INSERT INTO stock_rag.source_scopes (source_id, scope, known_at)
      SELECT $1, 'MSFT', completed_at FROM stock_rag.completed_news
      WHERE batch_key = $2 AND version_id = $3 AND topic = 'company:MSFT'`,
    [sourceId, 'demo:MSFT', newsId]);
    const boundary = 'Cloud demand expanded.'.length;
    const firstParams = [sourceId, 'demo-chunker', 'content', 0, 0, boundary, 5];
    const [first] = await script('save_chunk.sql', firstParams);
    const [second] = await script('save_chunk.sql', [
      sourceId, 'demo-chunker', 'content', 1, boundary + 1, article.content.length, 6,
    ]);
    assert.equal(first.excerpt, 'Cloud demand expanded.');
    assert.equal(second.excerpt, 'Data center costs rose.');
    assert.deepEqual(await script('save_chunk.sql', firstParams), []);
    assert.deepEqual(await script('save_chunk.sql', [...firstParams.slice(0, 5), 10000, 5]), []);
    return { sourceId, first: first.chunk_id, second: second.chunk_id };
  });
  await db.exec("INSERT INTO stock_rag.embedding_models VALUES ('demo-model', 'fixture', 'v1', '{}')");
  const vectorInput = JSON.stringify([1, ...Array(383).fill(0)]);
  await asRole('stock_embed', async () => {
    await assert.rejects(script('save_embedding.sql', [chunks.first, 'demo-model', '[1,2]']), /384/);
    assert.equal((await script('save_embedding.sql', [chunks.first, 'demo-model', vectorInput])).length, 1);
    assert.deepEqual(await script('save_embedding.sql', [chunks.first, 'demo-model', vectorInput]), []);
  });

  const runId = '25baf777-7aad-49d6-b6ee-610acee749f9';
  const freeze = (company, cutoff) => query(
    "SELECT stock_rag.freeze_snapshot($1, 'demo-owner', $2, $3, 'demo-chunker', $4::uuid[], 'demo-model')",
    [runId, company, cutoff, [chunks.first, chunks.second]],
  );
  await asRole('stock_app', async () => {
    const cutoff = (await query('SELECT clock_timestamp() AS cutoff'))[0].cutoff;
    await assert.rejects(freeze('AAPL', cutoff), /ineligible/);
    await assert.rejects(freeze('MSFT', '2021-01-01T00:00:00Z'), /ineligible/);
    await freeze('MSFT', cutoff);
    await assert.rejects(freeze('MSFT', cutoff), /duplicate/);
    await assert.rejects(query('INSERT INTO stock_rag.snapshot_chunks VALUES ($1,$2,true)', [runId, chunks.second]), /permission denied/);
    assert.deepEqual((await script('retrieve_sparse.sql', [runId, 'demo-owner', 'cloud demand'])).map((row) => row.chunk_id), [chunks.first]);
    assert.deepEqual(await script('retrieve_sparse.sql', [runId, 'wrong-owner', 'cloud']), []);
    await query("INSERT INTO stock_rag.reports (run_id,horizon,target_date,validated_report,generation_config_key) VALUES ($1,'30d',CURRENT_DATE + 30,'{}','fixture')", [runId]);
    await assert.rejects(query('INSERT INTO stock_rag.report_citations VALUES ($1,gen_random_uuid())', [runId]), /foreign key/);
    await query('INSERT INTO stock_rag.report_citations VALUES ($1,$2)', [runId, chunks.first]);
  });
  await asRole('stock_embed', () => script('save_embedding.sql', [chunks.second, 'demo-model', vectorInput]));
  await asRole('stock_app', async () => {
    const dense = await script('retrieve_dense.sql', [runId, 'demo-owner', vectorInput, 'demo-model']);
    assert.deepEqual(dense.map((row) => row.chunk_id), [chunks.first]);
    assert.equal(dense[0].distance, 0);
    assert.deepEqual(await script('retrieve_dense.sql', [runId, 'demo-owner', vectorInput, 'wrong-model']), []);
  });
  await query("INSERT INTO stock_rag.source_revocations (source_id,reason_code) VALUES ($1,'fixture')", [chunks.sourceId]);
  await asRole('stock_app', async () => {
    assert.deepEqual(await script('retrieve_sparse.sql', [runId, 'demo-owner', 'cloud']), []);
    assert.deepEqual(await script('retrieve_dense.sql', [runId, 'demo-owner', vectorInput, 'demo-model']), []);
  });
  console.log('Verified staging, deduplication, chunk offsets, pgvector dimensions, role grants, snapshot filters, frozen vector readiness, citations, and revocation.');
} finally {
  await db.close();
}
