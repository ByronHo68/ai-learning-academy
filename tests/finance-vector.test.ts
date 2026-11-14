import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FinanceVectorContent from '../app/finance-vector-content';
import { rankVectorLesson, toyCosine, vectorDocumentExclusions, vectorLessonDocuments, vectorLessonStageLimit } from '../lib/finance-vector-lesson';
import { vectorPythonExample, vectorTutorialQuery } from '../lib/finance-vector-code';

const settings = { scenarioId: 'costs', topK: 2, minimumSimilarity: 0.55, applyFilters: true } satisfies Parameters<typeof rankVectorLesson>[0];

test('toy similarity computes directions, not stock-impact scores', () => {
  assert.equal(toyCosine([1, 0], [4, 0]), 1);
  assert.equal(toyCosine([1, 0], [0, 3]), 0);
  assert.equal(toyCosine([1, 0], [-1, 0]), -1);
  assert.throws(() => toyCosine([0, 0], [1, 0]), /zero vector/);
});

test('filters exclude foreign, future and unpermitted passages before top-k', () => {
  const result = rankVectorLesson({ ...settings, topK: 1 });
  assert.equal(result.kind, 'ranked');
  if (result.kind !== 'ranked') throw new Error('Expected ranking');
  assert.deepEqual(result.hits.map(hit => hit.document.id), ['cloud-spend']);
  assert.equal(result.contextAllowed, true);
  const macro = rankVectorLesson({ ...settings, scenarioId: 'rates', topK: 1 });
  if (macro.kind !== 'ranked') throw new Error('Expected macro ranking');
  assert.equal(macro.hits[0].document.id, 'macro-rates');
  assert.equal(macro.hits[0].document.company, null);
  const eligible = vectorLessonDocuments[0];
  assert.deepEqual(vectorDocumentExclusions({ ...eligible, publishedAt: '2026-11-16T00:00:00Z' }), ['publication cutoff']);
  assert.deepEqual(vectorDocumentExclusions({ ...eligible, firstSeenAt: '2026-11-16T00:00:00Z' }), ['first-seen cutoff']);
});

test('unsafe comparison never creates LLM context even with similar news', () => {
  const result = rankVectorLesson({ ...settings, applyFilters: false });
  if (result.kind !== 'ranked') throw new Error('Expected comparison ranking');
  assert.equal(result.hits.length, 2);
  assert.ok(result.hits.some(hit => vectorDocumentExclusions(hit.document).length > 0));
  assert.equal(result.contextAllowed, false);
  assert.equal(vectorLessonStageLimit(result), 5);
});

test('empty evidence, wrong model and irrelevant prompts stop before context', () => {
  const empty = rankVectorLesson({ ...settings, scenarioId: 'no_evidence' });
  if (empty.kind !== 'ranked') throw new Error('Expected empty ranking');
  assert.deepEqual(empty.hits, []);
  assert.equal(empty.contextAllowed, false);
  assert.equal(vectorLessonStageLimit(empty), 5);
  const threshold = rankVectorLesson({ ...settings, minimumSimilarity: 1 });
  if (threshold.kind !== 'ranked') throw new Error('Expected threshold ranking');
  assert.deepEqual(threshold.hits, []);
  const incompatible = rankVectorLesson({ ...settings, scenarioId: 'mismatch' });
  assert.equal(incompatible.kind, 'incompatible');
  assert.equal(vectorLessonStageLimit(incompatible), 4);
  const unsupported = rankVectorLesson({ ...settings, scenarioId: 'unsupported' });
  assert.equal(unsupported.kind, 'out_of_scope');
  assert.equal(vectorLessonStageLimit(unsupported), 0);
});

test('tutorial Python parses and query binds metadata restrictions before top-k', () => {
  const parsed = spawnSync('python3', ['-c', 'import ast,sys; ast.parse(sys.stdin.read())'], { input: vectorPythonExample, encoding: 'utf8' });
  assert.equal(parsed.status, 0, parsed.stderr);
  for (const field of ['snapshot_id', 'model_key', 'permitted', 'company', 'published_at', 'first_seen_at']) assert.ok(vectorTutorialQuery.includes(field));
  assert.ok(vectorTutorialQuery.indexOf('WHERE') < vectorTutorialQuery.indexOf('LIMIT'));
  assert.ok(vectorPythonExample.includes('trust_remote_code=False'));
  assert.ok(vectorPythonExample.includes('normalize_embeddings=True'));
});

test('both languages expose an honest offline lesson and usable examples', () => {
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const html = renderToStaticMarkup(createElement(FinanceVectorContent, { lang }));
    for (const id of ['vector-mindmap', 'vector-demo', 'vector-models', 'vector-project-flow', 'vector-code']) assert.ok(html.includes(`id="${id}"`));
    assert.ok(html.includes('NOT RUN'));
    assert.ok(html.includes('intfloat/multilingual-e5-small'));
    assert.ok(html.includes('/downloads/stock-research-vector-demo.py'));
    assert.ok(html.includes('/finance-project/checkpoints'));
    assert.ok(html.includes('vector_storage'));
  }
});
