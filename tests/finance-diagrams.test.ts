import assert from 'node:assert/strict';
import test from 'node:test';
import { financeDiagrams, financeOverallDiagram, layoutFinanceDiagram, type FinanceDiagram } from '../lib/finance-diagrams';
import { financeGraphScenarios, financeScenarioPath } from '../lib/finance-graph';
import { financeFunctionRoutes } from '../lib/finance-workflows';

test('all eleven function graphs use the complete documented routes and reach an exit', () => {
  assert.equal(financeDiagrams.length, 14);
  for (const [id, routes] of Object.entries(financeFunctionRoutes)) {
    const diagram = financeDiagrams.find(item => item.id === id);
    assert.ok(diagram, id);
    assert.equal(diagram.edges.length, routes.length);
    const reached = new Set([diagram.nodes[0].id]);
    for (let i = 0; i < diagram.nodes.length; i++) for (const edge of diagram.edges) if (reached.has(edge.from)) reached.add(edge.to);
    assert.equal(reached.size, diagram.nodes.length, `${id}: disconnected node`);
    assert.ok(diagram.nodes.some(node => !diagram.edges.some(edge => edge.from === node.id)), `${id}: no exit`);
  }
});

test('every teaching scenario follows actual edges in the overall diagram, including retries', () => {
  for (const scenario of financeGraphScenarios) {
    const path = financeScenarioPath(scenario.id);
    for (let i = 1; i < path.length; i++) assert.ok(financeOverallDiagram.edges.some(edge => edge.from === path[i - 1] && edge.to === path[i]), `${scenario.id}: missing ${path[i - 1]} → ${path[i]}`);
    assert.ok(path.filter(id => id === 'retrieve').length <= 2);
    assert.ok(path.filter(id => id === 'refresh').length <= 1);
  }
});

test('accepted request paths pin evidence without triggering the independent daily schedule', () => {
  for (const scenario of financeGraphScenarios) {
    const path = financeScenarioPath(scenario.id);
    if (path.includes('retrieve')) {
      assert.ok(path.indexOf('refresh') < path.indexOf('snapshot'));
      assert.ok(path.indexOf('snapshot') < path.indexOf('retrieve'));
    }
    assert.ok(!new Set<string>(path).has('daily'));
  }
  for (const from of ['evidence_pool', 'refresh']) assert.ok(financeOverallDiagram.edges.some(edge => edge.from === from && edge.to === 'snapshot'));
});

test('the acquisition retry loop returns to the provider inside n8n', () => {
  const retries = financeFunctionRoutes.sources.filter(route => route.kind === 'retry');
  assert.equal(retries.length, 2);
  assert.ok(retries.every(route => route.from.startsWith('n8n') && route.to.startsWith('n8n')));
  assert.ok(retries.some(route => route.to === 'n8n provider attempt'));
});

test('layout keeps every node on canvas and rejects dangling edges and unbounded cycles', () => {
  for (const diagram of financeDiagrams) {
    const layout = layoutFinanceDiagram(diagram);
    for (const node of layout.nodes) {
      assert.ok(node.x >= 0 && node.y >= 0 && node.x + 280 <= layout.width && node.y + 112 <= layout.height);
      for (const other of layout.nodes) if (node.id !== other.id) assert.ok(Math.abs(node.x - other.x) >= 280 || Math.abs(node.y - other.y) >= 112, `${diagram.id}: overlapping nodes`);
    }
  }
  const bad: FinanceDiagram = { id: 'bad', title: { en: 'Bad', zh: '錯誤' }, nodes: [{ id: 'a', label: 'A', detail: { en: '', zh: '' } }], edges: [] };
  const edge = { from: 'a', to: 'missing', label: { en: '', zh: '' }, detail: { en: '', zh: '' }, kind: 'flow' } satisfies FinanceDiagram['edges'][number];
  assert.throws(() => layoutFinanceDiagram({ ...bad, edges: [edge] }), /Dangling edge/);
  assert.throws(() => layoutFinanceDiagram({ ...bad, edges: [{ ...edge, to: 'a' }] }), /Unbounded cycle/);
});
