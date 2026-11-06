import assert from 'node:assert/strict';
import test from 'node:test';
import { financeGraphScenarios, financeScenarioPath } from '../lib/finance-graph';
import { financeFunctionRoutes } from '../lib/finance-workflows';
import { financeFunctions, financeEngineeringWorkflows } from '../lib/finance-project';

test('irrelevant and ambiguous requests return before news, retrieval or report generation', () => {
  for (const scenario of ['irrelevant', 'ambiguous'] satisfies Array<'irrelevant' | 'ambiguous'>) {
    const path = financeScenarioPath(scenario);
    assert.ok(!path.includes('refresh'));
    assert.ok(!path.includes('retrieve'));
    assert.ok(!path.includes('generate'));
    assert.equal(path.at(-1), scenario === 'irrelevant' ? 'irrelevant' : 'clarify');
  }
});

test('missing evidence refines once and never fabricates a model answer', () => {
  const path = financeScenarioPath('insufficient');
  assert.equal(path.filter(node => node === 'retrieve').length, 2);
  assert.equal(path.filter(node => node === 'refine').length, 1);
  assert.ok(!path.includes('generate'));
  assert.equal(path.at(-1), 'insufficient');
  assert.equal(financeScenarioPath('stale').at(-1), 'insufficient');
});

test('a report requires reranked or fallback evidence, a context envelope and validation', () => {
  for (const scenario of financeGraphScenarios) {
    const path = financeScenarioPath(scenario.id);
    assert.ok(path.filter(node => node === 'retrieve').length <= 2);
    if (path.includes('generate')) {
      assert.ok(path.indexOf('gate') < path.indexOf('context'));
      assert.ok(path.indexOf('context') < path.indexOf('generate'));
      assert.ok(path.includes('rerank') || path.includes('fallback'));
    }
    if (path.includes('answer')) {
      assert.ok(path.indexOf('validate') < path.indexOf('save'));
      assert.ok(path.indexOf('save') < path.indexOf('answer'));
    }
  }
  const rejected = financeScenarioPath('invalid_citation');
  assert.equal(rejected.at(-1), 'blocked');
  assert.ok(!rejected.includes('save'));
  assert.ok(!rejected.includes('answer'));
});

test('service outages and budget expiry differ from missing evidence', () => {
  assert.ok(financeScenarioPath('rerank_failure').includes('fallback'));
  assert.equal(financeScenarioPath('rerank_failure').at(-1), 'answer');
  for (const scenario of ['retrieval_failure', 'timeout'] satisfies Array<'retrieval_failure' | 'timeout'>) {
    const path = financeScenarioPath(scenario);
    assert.equal(path.at(-1), 'unavailable');
    assert.ok(!path.includes('generate'));
    assert.ok(!path.includes('insufficient'));
  }
});

test('every function diagram has connected conditional routes and handoff content', () => {
  for (const guide of [...financeFunctions, ...financeEngineeringWorkflows]) {
    const routes = financeFunctionRoutes[guide.id];
    const reached = new Set([routes[0].from]);
    for (let pass = 0; pass < routes.length; pass++) {
      for (const route of routes) if (reached.has(route.from)) reached.add(route.to);
    }
    for (const route of routes) {
      assert.ok(reached.has(route.from), `${guide.id}: disconnected ${route.from}`);
      assert.ok(route.when.en && route.when.zh && route.payload.en && route.payload.zh);
    }
  }
});
