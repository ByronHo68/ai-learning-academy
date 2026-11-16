import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FinanceRerankContent from '../app/finance-rerank-content';
import { rerankQuestions, runRerankToy, searchToyDocuments } from '../lib/finance-rerank';
import { rerankPythonExample, rerankTutorialQuery, rerankTutorialSchema } from '../lib/finance-rerank-code';

const settings = { questionId: 'costs', mode: 'graph', exploration: 3, topK: 2 } satisfies Parameters<typeof runRerankToy>[0];

test('limited graph exploration misses evidence that exact search can retrieve', () => {
  const limited = runRerankToy(settings);
  assert.deepEqual(limited.upperPath, ['entry', 'cloud']);
  assert.deepEqual(limited.visited, ['cloud', 'keyword', 'future']);
  assert.equal(limited.overlap, 1);
  assert.equal(limited.supported, false);
  assert.ok(limited.exactIds.includes('direct'));
  assert.ok(!limited.retrieved.some(hit => hit.document.id === 'direct'));
  assert.ok(!limited.reranked.some(hit => hit.document.id === 'direct'));
});

test('broader toy expansion finds the exact eligible neighbours and reranking changes their order', () => {
  const broad = runRerankToy({ ...settings, exploration: 9 });
  const exact = runRerankToy({ ...settings, mode: 'exact' });
  assert.equal(broad.visited.length, searchToyDocuments.length);
  assert.deepEqual(broad.retrieved.map(hit => hit.document.id), ['keyword', 'direct']);
  assert.deepEqual(broad.retrieved, exact.retrieved);
  assert.deepEqual(broad.reranked.map(hit => hit.document.id), ['direct', 'keyword']);
  assert.equal(broad.overlap, broad.exactIds.length);
  assert.equal(broad.supported, true);
});

test('ineligible visited vectors never reach retrieved or reranked lists', () => {
  for (const question of rerankQuestions) for (const exploration of [3, 6, 9]) for (const topK of [1, 2, 4]) {
    const run = runRerankToy({ ...settings, questionId: question.id, exploration, topK });
    assert.equal(new Set(run.visited).size, run.visited.length);
    assert.ok(run.visited.length <= exploration);
    assert.ok(run.retrieved.length <= topK);
    assert.ok(run.retrieved.every(hit => hit.document.excluded === null));
    assert.deepEqual(new Set(run.reranked.map(hit => hit.document.id)), new Set(run.retrieved.map(hit => hit.document.id)));
    assert.equal(run.frames.filter(frame => frame.kind === 'base').length, run.visited.length);
  }
  const full = runRerankToy({ ...settings, exploration: 9 });
  assert.ok(full.visited.includes('foreign') && full.visited.includes('future'));
});

test('question changes reorder relevance and missing support never becomes a forecast', () => {
  const rates = runRerankToy({ ...settings, questionId: 'rates', mode: 'exact' });
  assert.equal(rates.reranked[0].document.id, 'macro');
  assert.equal(rates.supported, true);
  const missing = runRerankToy({ ...settings, questionId: 'missing', mode: 'exact', topK: 4 });
  assert.equal(missing.supported, false);
  assert.ok(missing.reranked.every(hit => hit.grade === 0));
});

test('candidate top-k does not act as the graph exploration cap', () => {
  const one = runRerankToy({ ...settings, exploration: 9, topK: 1 });
  const four = runRerankToy({ ...settings, exploration: 9, topK: 4 });
  assert.deepEqual(one.visited, four.visited);
  assert.equal(one.retrieved.length, 1);
  assert.equal(four.retrieved.length, 4);
});

test('real-model example is valid Python with filtered, parameter-bound HNSW and exact queries', () => {
  const result = spawnSync('python3', ['-c', 'import ast,sys; ast.parse(sys.stdin.read())'], { input: rerankPythonExample, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(rerankTutorialSchema.includes('vector_cosine_ops'));
  for (const parameter of ['snapshot_id', 'model_key', 'privacy_policy', 'company', 'as_of', 'query_vector', 'candidate_limit']) assert.ok(rerankTutorialQuery.includes(`%(${parameter})s`));
  for (const guard of ['permitted = true', 'published_at <=', 'first_seen_at <=']) assert.ok(rerankTutorialQuery.includes(guard));
  assert.ok(rerankTutorialQuery.includes('ORDER BY embedding <=> %(query_vector)s'));
});

test('bilingual lesson renders a mind map, animation, model roles and honest downloadable examples', () => {
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const html = renderToStaticMarkup(createElement(FinanceRerankContent, { lang }));
    for (const id of ['rerank-mindmap', 'rerank-animation', 'rerank-models', 'rerank-project', 'hnsw-settings', 'rerank-code']) assert.ok(html.includes(`id="${id}"`));
    assert.ok(html.includes('NOT RUN'));
    assert.ok(html.includes('intfloat/multilingual-e5-small'));
    assert.ok(html.includes('BAAI/bge-reranker-v2-m3'));
    assert.ok(html.includes('/downloads/stock-research-rerank-demo.py'));
    assert.ok(html.includes('/downloads/finance-diagrams/rerank_hnsw-'));
  }
});
