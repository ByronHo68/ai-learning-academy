import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FinanceCheckpointsContent from '../app/finance-checkpoints-content';
import { checkpointDemoCanStep, checkpointDemoSnapshot, checkpointDemoTransition, createCheckpointDemo, type CheckpointDemo, type CheckpointDemoScenario } from '../lib/finance-checkpoints';
import { checkpointPythonExample } from '../lib/finance-checkpoint-code';

function reachReview(scenario: CheckpointDemoScenario): CheckpointDemo {
  let state = createCheckpointDemo(scenario);
  for (let i = 0; i < 8 && checkpointDemoCanStep(state); i++) state = checkpointDemoTransition(state, { type: 'step' });
  assert.equal(state.live?.phase, 'review');
  return state;
}

test('durable review recovery preserves evidence, budgets and completed acquisition', () => {
  const waiting = reachReview('durable');
  const saved = waiting.history.at(-1);
  assert.ok(saved);
  const crashed = checkpointDemoTransition(waiting, { type: 'restart' });
  assert.equal(crashed.live, null);
  assert.deepEqual(crashed.history, waiting.history);
  let restored = checkpointDemoTransition(crashed, { type: 'recover' });
  assert.deepEqual(restored.live, saved.values);
  restored = checkpointDemoTransition(restored, { type: 'submit', order: 'costs_first' });
  assert.equal(restored.live?.snapshotId, saved.values.snapshotId);
  assert.deepEqual(restored.live?.selectedIds, ['costs-v2', 'demand-v1']);
  assert.equal(restored.live?.remainingActiveMs, saved.values.remainingActiveMs);
  assert.equal(restored.live?.searchRounds, 1);
  assert.equal(restored.reviewEntries, 2);
  restored = checkpointDemoTransition(restored, { type: 'step' });
  assert.equal(restored.live?.phase, 'done');
  assert.equal(restored.providerFetches, 1);
  assert.equal(restored.generationStages, 1);
  const completed = checkpointDemoTransition(checkpointDemoTransition(restored, { type: 'restart' }), { type: 'recover' });
  assert.equal(checkpointDemoTransition(completed, { type: 'step' }).generationStages, 1);
  assert.equal(waiting.history[0].values.phase, 'accepted');
});

test('the memory-only comparison cannot reconstruct graph progress after restart', () => {
  const waiting = reachReview('memory_only');
  assert.equal(waiting.history.length, 0);
  const recovered = checkpointDemoTransition(checkpointDemoTransition(waiting, { type: 'restart' }), { type: 'recover' });
  assert.equal(recovered.live, null);
  assert.equal(recovered.generationStages, 0);
  assert.equal(recovered.providerFetches, 1);
});

test('an uncheckpointed refresh reconciles its committed receipt instead of fetching twice', () => {
  let state = checkpointDemoTransition(createCheckpointDemo('receipt_gap'), { type: 'step' });
  state = checkpointDemoTransition(state, { type: 'step' });
  assert.equal(state.live, null);
  assert.equal(state.receipt, true);
  assert.equal(state.history.at(-1)?.values.phase, 'accepted');
  assert.equal(state.providerFetches, 1);
  state = checkpointDemoTransition(state, { type: 'recover' });
  state = checkpointDemoTransition(state, { type: 'step' });
  assert.equal(state.live?.phase, 'fetched');
  assert.equal(state.providerFetches, 1);
  assert.equal(state.reconciliations, 1);
});

test('an expired review keeps audit state but never advances to generation', () => {
  let state = reachReview('expired');
  const count = state.history.length;
  state = checkpointDemoTransition(state, { type: 'expire' });
  state = checkpointDemoTransition(state, { type: 'submit', order: 'recommended' });
  assert.equal(state.blocked, true);
  assert.equal(state.history.length, count);
  assert.equal(state.generationStages, 0);
  state = checkpointDemoTransition(checkpointDemoTransition(state, { type: 'restart' }), { type: 'recover' });
  assert.equal(state.live, null);
  assert.equal(state.history.length, count);
});

test('the bilingual page renders concepts, safe demo controls and executable-example syntax', () => {
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const html = renderToStaticMarkup(createElement(FinanceCheckpointsContent, { lang }));
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    assert.ok(html.includes('_checkpoint'));
    assert.ok(html.includes('AsyncPostgresSaver'));
    assert.ok(html.includes('id="checkpoint-demo"'));
    assert.ok(html.includes('id="checkpoint-mindmap"'));
    assert.ok(html.includes('stock-research-checkpoint-demo.py'));
    assert.ok(html.includes('NOT RUN'));
  }
  const result = spawnSync('python3', ['-c', 'import ast,sys;ast.parse(sys.stdin.read())'], { input: checkpointPythonExample, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  const view = checkpointDemoSnapshot(reachReview('durable').history.at(-1));
  assert.ok('config' in view);
  assert.deepEqual(view.next, ['review']);
});
