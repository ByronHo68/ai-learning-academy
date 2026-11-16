import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FinanceOpenRouterContent from '../app/finance-openrouter-content';
import { openRouterCalls, openRouterScenarios } from '../lib/finance-openrouter';
import { financeScenarioPath } from '../lib/finance-graph';

test('call-map caps match the executable Python gateway contract', async () => {
  const client = await readFile(new URL('../integrations/finance_openrouter/client.py', import.meta.url), 'utf8');
  const parsed = spawnSync('python3', ['-c', 'import ast,json,sys; tree=ast.parse(sys.stdin.read()); caps=next(n.value for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=="CAPS" for t in n.targets)); print(json.dumps(ast.literal_eval(caps)))'], { input: client, encoding: 'utf8' });
  assert.equal(parsed.status, 0, parsed.stderr);
  assert.deepEqual(JSON.parse(parsed.stdout), Object.fromEntries(openRouterCalls.map(call => [call.id, [call.tokens, call.seconds]])));
  assert.deepEqual(openRouterCalls.map(call => call.id), ['scope', 'refine', 'report']);
});

test('planned call scenarios stay bounded and failures do not fetch news', () => {
  for (const scenario of openRouterScenarios) {
    assert.ok(scenario.roles.length <= 3);
    assert.equal(new Set(scenario.roles).size, scenario.roles.length);
    assert.equal(scenario.roles[0], 'scope');
  }
  assert.deepEqual(financeScenarioPath('openrouter_failure'), ['privacy_request', 'scope', 'unavailable']);
  assert.ok(!openRouterScenarios.find(item => item.id === 'missing')?.roles.includes('report'));
});

test('downloaded client and node bindings are the same reviewed Python sources', async () => {
  for (const [source, download] of [['client.py', 'finance-openrouter-client.py'], ['nodes.py', 'finance-openrouter-nodes.py']]) {
    const code = await readFile(new URL(`../integrations/finance_openrouter/${source}`, import.meta.url), 'utf8');
    assert.equal(await readFile(new URL(`../public/downloads/${download}`, import.meta.url), 'utf8'), code);
    const parsed = spawnSync('python3', ['-c', 'import ast,sys; ast.parse(sys.stdin.read())'], { input: code, encoding: 'utf8' });
    assert.equal(parsed.status, 0, parsed.stderr);
  }
  const template = await readFile(new URL('../public/downloads/finance-openrouter.env.example', import.meta.url), 'utf8');
  assert.match(template, /^OPENROUTER_API_KEY=$/m);
  assert.ok(!template.includes('NEXT_PUBLIC_OPENROUTER'));
});

test('both languages expose every role and the remaining live integration requirements', () => {
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const html = renderToStaticMarkup(createElement(FinanceOpenRouterContent, { lang }));
    for (const id of ['openrouter-calls', 'openrouter-demo', 'openrouter-flow', 'openrouter-setup']) assert.ok(html.includes(`id="${id}"`));
    for (const call of openRouterCalls) assert.ok(html.includes(call.modelEnv));
    assert.ok(html.includes('NOT RUN'));
    assert.ok(html.includes('/downloads/finance-openrouter-client.py'));
    assert.ok(html.includes('/finance-project/rerank-hnsw'));
  }
});
