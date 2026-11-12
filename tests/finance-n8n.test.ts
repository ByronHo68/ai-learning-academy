import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FinanceN8nContent from '../app/finance-n8n-content';
import FinanceProjectContent from '../app/finance-project-content';
import { n8nScenarios, n8nStages } from '../lib/finance-n8n';

test('every n8n scenario is playable in both languages', () => {
  assert.deepEqual(n8nStages.map(stage => stage.id), ['ask', 'scope', 'call', 'n8n', 'receipt', 'pin']);
  const ids = new Set(n8nScenarios.map(scenario => scenario.id));
  assert.deepEqual(ids, new Set(['fresh', 'blip', 'down', 'resume', 'reject', 'daily']));
  for (const scenario of n8nScenarios) {
    assert.ok(scenario.steps.length >= 2, scenario.id);
    assert.equal(new Set(scenario.steps.map(step => step.id)).size, scenario.steps.length, scenario.id);
    for (const step of scenario.steps) assert.ok(n8nStages.some(stage => stage.id === step.stage), step.id);
  }
  const fresh = n8nScenarios.find(scenario => scenario.id === 'fresh');
  assert.ok(fresh?.steps.some(step => step.message.includes('refresh_company_news')));
  const reject = n8nScenarios.find(scenario => scenario.id === 'reject');
  assert.equal(reject?.steps.at(-1)?.tone, 'stop');
  for (const lang of ['en', 'zh'] as const) {
    const html = renderToStaticMarkup(createElement(FinanceN8nContent, { lang }));
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    assert.ok(html.includes('id="n8n-animation"'));
    assert.ok(html.includes('refresh_company_news'));
    assert.ok(html.includes('node office/server.mjs'));
    assert.ok(html.includes('https://get.n8n.io'));
    assert.ok(html.includes(n8nScenarios[0].title[lang]));
    assert.ok(html.includes('/finance-project/mcp'));
  }
});

test('the stock research project links to the n8n guide', () => {
  for (const lang of ['en', 'zh'] as const) {
    const html = renderToStaticMarkup(createElement(FinanceProjectContent, { lang }));
    assert.ok(html.includes('href="/finance-project/n8n"'));
  }
});
