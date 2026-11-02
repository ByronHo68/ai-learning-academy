import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FinanceFunctionMindmap, type BackendLayout, type BuildEnvironment } from '../app/finance-function-map';
import { financeFunctionExamples } from '../lib/finance-function-examples';
import { financeAreas } from '../lib/finance-project';
import { financeFunctionMaps, type FinanceFunctionMap } from '../lib/finance-function-maps';
import { financeFunctionWorkflows } from '../lib/finance-function-workflows';
import { financeApiWorkflows, type FinanceApiWorkflow } from '../lib/finance-api-workflows';

test('every function has a distinct map that matches its API, caller and domain outcomes', () => {
  let count = 0;
  const signatures = new Set<string>();
  for (const area of financeAreas) {
    const maps: FinanceFunctionMap[] = financeFunctionMaps[area.id];
    const apis: FinanceApiWorkflow[] = financeApiWorkflows[area.id];
    assert.equal(maps.length, financeFunctionWorkflows[area.id].length);
    for (const [index, map] of maps.entries()) {
      const api = apis[index];
      count++;
      assert.equal(map.kind === 'pipeline', api.kind === 'pipeline');
      assert.ok(map.steps.length >= 3);
      assert.equal(new Set(map.steps.map(step => step.id)).size, map.steps.length);
      assert.ok(map.steps.every(step => !['entry', 'dns', 'https', 'java', 'python', 'private'].includes(step.id)));
      signatures.add(map.steps.map(step => step.keyword).join(' → '));
      if (map.kind === 'request' && api.kind === 'http') {
        assert.equal(map.entry === 'n8n', api.access === 'service');
        assert.equal(map.entry === 'operator', api.access === 'operator');
      }
      for (const lang of ['en', 'zh'] as const) {
        assert.ok(map.validation[lang].trim().length > 0);
        assert.ok(map.outcomes.success[lang].trim().length > 0);
        assert.ok(map.outcomes.failure[lang].trim().length > 0);
        assert.ok(map.steps.every(step => step.action[lang].trim().length > 0));
        if (map.outcomes.kind === 'partial') assert.ok(map.outcomes.partial[lang].trim().length > 0);
        const layouts: BackendLayout[] = ['java-python', 'python'];
        for (const backend of layouts) {
          const environments: BuildEnvironment[] = ['local', 'deployed'];
          for (const environment of environments) {
          const html = renderToStaticMarkup(createElement(FinanceFunctionMindmap, { map, api, title: financeFunctionWorkflows[area.id][index].title, lang, backend, environment, example: financeFunctionExamples[area.id][index] }));
          assert.ok(html.includes('VALIDATE'));
          assert.ok(html.includes(map.outcomes.success[lang]));
          assert.ok(html.includes(map.outcomes.failure[lang]));
          for (const step of map.steps) assert.ok(html.includes(step.keyword));
          if (map.kind === 'request') {
            assert.equal(html.includes('JAVA API'), backend === 'java-python');
            assert.equal(html.includes('DNS LOOKUP'), environment === 'deployed' && map.entry === 'browser');
            assert.equal(html.includes('DEV API PROXY'), environment === 'local' && map.entry === 'browser');
            assert.equal(html.includes('HTTPS / CADDY'), environment === 'deployed' && map.entry === 'browser');
            assert.equal(html.includes('SERVICE DNS'), environment === 'deployed' && map.entry === 'n8n');
            assert.equal(html.includes('SSM / PRIVATE'), environment === 'deployed' && map.entry === 'operator');
          } else {
            assert.ok(!html.includes('JAVA API'));
            assert.ok(!html.includes('DNS LOOKUP'));
            assert.ok(html.includes('GitHub Actions'));
          }
          if (api.kind === 'http' && api.result.kind === 'accepted') {
            assert.ok(html.includes('HTTP 202'));
            assert.ok(html.includes(`GET ${api.result.poll}`));
            assert.ok(html.includes('HTTP 200 · job/run state: completed'));
          }
          if (map.outcomes.kind === 'partial') assert.ok(html.includes(map.outcomes.partial[lang]));
          const example = financeFunctionExamples[area.id][index];
          assert.ok(html.includes(example.scenario[lang]));
          assert.ok(html.includes(example.check[lang]));
          for (const file of example.files) assert.ok(html.includes(file));
          }
        }
      }
    }
  }
  assert.equal(count, 24);
  assert.equal(signatures.size, 24);
});

test('research maps distinguish orchestration, retrieval and generation without adding LLMs to deterministic work', () => {
  const research = financeFunctionMaps.research[0].steps.map(step => step.keyword);
  const graph = research.findIndex(keyword => keyword.includes('LANGGRAPH'));
  const vector = research.findIndex(keyword => keyword.includes('VECTOR'));
  const rag = research.findIndex(keyword => keyword.includes('RAG'));
  const llm = research.findIndex(keyword => keyword.includes('LLM'));
  assert.ok(graph >= 0 && graph < vector && vector < rag && rag < llm);
  for (const map of [financeFunctionMaps.library[0], financeFunctionMaps.library[1], financeFunctionMaps.comparison[0], financeFunctionMaps.research[1]]) {
    assert.ok(!map.steps.some(step => step.keyword === 'LLM API'));
  }
});
