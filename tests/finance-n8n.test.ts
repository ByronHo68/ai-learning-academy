import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FinanceN8nContent from '../app/finance-n8n-content';
import FinanceProjectContent from '../app/finance-project-content';
import { n8nScenarios, n8nStages } from '../lib/finance-n8n';

test('every n8n scenario is playable in both languages', () => {
  assert.deepEqual(n8nStages.map(stage => stage.id), ['ask', 'scope', 'call', 'n8n', 'receipt', 'pin', 'handoff']);
  const ids = new Set(n8nScenarios.map(scenario => scenario.id));
  assert.deepEqual(ids, new Set(['fresh', 'blip', 'down', 'resume', 'reject', 'daily', 'daily_failure', 'empty', 'invalid']));
  for (const scenario of n8nScenarios) {
    assert.ok(scenario.steps.length >= 2, scenario.id);
    assert.equal(new Set(scenario.steps.map(step => step.id)).size, scenario.steps.length, scenario.id);
    for (const step of scenario.steps) assert.ok(n8nStages.some(stage => stage.id === step.stage), step.id);
  }
  const fresh = n8nScenarios.find(scenario => scenario.id === 'fresh');
  assert.ok(fresh?.steps.some(step => step.message.includes('refresh_company_news')));
  const reject = n8nScenarios.find(scenario => scenario.id === 'reject');
  assert.equal(reject?.steps.at(-1)?.tone, 'stop');
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const html = renderToStaticMarkup(createElement(FinanceN8nContent, { lang }));
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    assert.ok(html.includes('id="n8n-animation"'));
    assert.ok(html.includes('refresh_company_news'));
    assert.ok(html.includes('node office/server.mjs'));
    assert.ok(html.includes('DB_TYPE=postgresdb'));
    assert.ok(html.includes('n8n_metadata'));
    assert.ok(!html.includes('curl -fsSL'));
    assert.ok(html.includes('id="n8n-connected-workflow"'));
    assert.ok(html.includes('/downloads/stock-research-n8n-guide.md'));
    assert.ok(html.includes(n8nScenarios[0].title[lang]));
    assert.ok(html.includes('/finance-project/mcp'));
  }
});

test('the stock research project links to the n8n guide', () => {
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const html = renderToStaticMarkup(createElement(FinanceProjectContent, { lang }));
    assert.ok(html.includes('href="/finance-project/n8n"'));
  }
});

test('successful acquisition hands off through review and evidence checks before a report', () => {
  for (const scenario of n8nScenarios.filter(item => ['fresh', 'blip', 'resume'].includes(item.id))) {
    const stages = scenario.steps.map(step => step.id);
    for (const [before, after] of [['receipt', 'pin'], ['pin', 'search'], ['search', 'review'], ['review', 'gate'], ['gate', 'report']]) {
      assert.ok(stages.indexOf(before) >= 0 && stages.indexOf(before) < stages.indexOf(after), `${scenario.id}: ${before} before ${after}`);
    }
    assert.ok(scenario.steps.filter(step => step.stage === 'handoff').every(step => step.channel === 'app'));
  }
  for (const scenario of n8nScenarios.filter(item => ['down', 'reject', 'invalid', 'empty', 'daily', 'daily_failure'].includes(item.id))) {
    assert.ok(!scenario.steps.some(step => step.id === 'report'), scenario.id);
  }
});

test('daily success and failure are separate, and neither uses the company-only adapter', () => {
  for (const id of ['daily', 'daily_failure']) {
    const scenario = n8nScenarios.find(item => item.id === id);
    assert.ok(scenario);
    const fetch = scenario.steps.find(step => step.id === 'fetch');
    assert.ok(fetch);
    assert.equal(fetch.to.en, 'Approved macro / geopolitical API or RSS');
    assert.ok(!scenario.steps.some(step => step.id === 'call' || step.id === 'review'));
    assert.equal(scenario.steps.at(-1)?.tone, id === 'daily' ? 'go' : 'stop');
  }
  const invalid = n8nScenarios.find(item => item.id === 'invalid');
  assert.ok(!invalid?.steps.some(step => step.id === 'fetch'));
});
