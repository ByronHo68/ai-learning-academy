import assert from 'node:assert/strict';
import test from 'node:test';
import { financeReviewCoverage, financeReviewSources, moveFinanceReviewSource } from '../lib/finance-review';
import { alphaVantageDailyQueries } from '../lib/finance-alpha-vantage';

test('manual order moves selected news without changing system ranks or coverage', () => {
  const original = financeReviewSources.map(source => source.id);
  const ordered = moveFinanceReviewSource({ orderedIds: original, excludedIds: [], sourceId: 'outlook', direction: 'up' });
  assert.deepEqual(ordered, ['costs', 'outlook', 'demand']);
  assert.deepEqual(original, ['costs', 'demand', 'outlook']);
  assert.deepEqual(financeReviewSources.map(source => source.id), original);
  assert.deepEqual(financeReviewCoverage([]), []);
});

test('reordering skips excluded news and cannot reintroduce it into selection', () => {
  const ordered = moveFinanceReviewSource({ orderedIds: ['costs', 'demand', 'outlook'], excludedIds: ['demand'], sourceId: 'outlook', direction: 'up' });
  assert.deepEqual(ordered, ['outlook', 'demand', 'costs']);
  assert.deepEqual(ordered.filter(id => id !== 'demand'), ['outlook', 'costs']);
  assert.deepEqual(financeReviewCoverage(['demand']), ['demand']);
  assert.deepEqual(moveFinanceReviewSource({ orderedIds: ordered, excludedIds: ['demand'], sourceId: 'demand', direction: 'up' }), ordered);
  assert.deepEqual(moveFinanceReviewSource({ orderedIds: ordered, excludedIds: ['demand'], sourceId: 'outlook', direction: 'up' }), ordered);
});

test('Alpha Vantage broad coverage does not accidentally AND macro and fiscal topics', () => {
  assert.equal(alphaVantageDailyQueries.length, 3);
  const topics = alphaVantageDailyQueries.flatMap(query => 'topics' in query.parameters ? [query.parameters.topics] : []);
  assert.deepEqual(topics, ['economy_macro', 'economy_fiscal']);
  const geopolitical = alphaVantageDailyQueries.find(query => query.id === 'geopolitics_candidates');
  assert.ok(geopolitical);
  assert.ok(!('topics' in geopolitical.parameters));
  assert.ok(alphaVantageDailyQueries.every(query => query.parameters.function === 'NEWS_SENTIMENT'));
});
