import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FinancePrivacyContent } from '../app/finance-privacy-content';
import { financePrivacyFixtures, financePrivacyMiddlewareExample, sanitizePrivacyDemo } from '../lib/finance-privacy';
import { financeGraphScenarios, financeScenarioPath } from '../lib/finance-graph';

test('synthetic privacy demo fully redacts detected emails and Luhn-valid cards', () => {
  const result = sanitizePrivacyDemo('MSFT: analyst@example.com; test 4242-4242-4242-4242.');
  assert.equal(result.kind, 'sanitized');
  if (result.kind !== 'sanitized') throw new Error('Expected sanitized fixture');
  assert.equal(result.text, 'MSFT: [REDACTED_EMAIL]; test [REDACTED_CREDIT_CARD].');
  assert.deepEqual(result.counts, { email: 1, credit_card: 1 });
  assert.ok(!JSON.stringify(result).includes('analyst@example.com'));
  assert.ok(!JSON.stringify(result).includes('4242'));
  const second = sanitizePrivacyDemo(result.text);
  if (second.kind !== 'sanitized') throw new Error('Expected idempotent result');
  assert.equal(second.text, result.text);
  assert.deepEqual(second.counts, { email: 0, credit_card: 0 });
});

test('financial fixtures and citation URLs survive while invalid card checksums are not claimed as detected', () => {
  const fixture = financePrivacyFixtures.find(item => item.id === 'finance');
  assert.ok(fixture);
  const result = sanitizePrivacyDemo(fixture.text);
  if (result.kind !== 'sanitized') throw new Error('Expected financial facts');
  assert.equal(result.text, fixture.text);
  assert.deepEqual(result.counts, { email: 0, credit_card: 0 });
  const invalid = sanitizePrivacyDemo('Synthetic invalid checksum 4242 4242 4242 4241');
  if (invalid.kind !== 'sanitized') throw new Error('Expected fixture result');
  assert.equal(invalid.counts.credit_card, 0);
});

test('detector failure returns no input, partial text or matched values', () => {
  assert.deepEqual(sanitizePrivacyDemo('analyst@example.com 4242 4242 4242 4242', false), { kind: 'blocked', reason: 'privacy_blocked' });
});

test('workflow privacy failure stops before graph scope and unsafe output never reaches report storage', () => {
  assert.deepEqual(financeScenarioPath('privacy_failure'), ['privacy_request', 'privacy_stop']);
  const outputFailure = financeScenarioPath('privacy_output_failure');
  assert.ok(outputFailure.includes('generate'));
  assert.equal(outputFailure.at(-1), 'privacy_stop');
  for (const node of ['validate', 'save', 'answer']) assert.ok(!new Set<string>(outputFailure).has(node));
  for (const scenario of financeGraphScenarios) {
    const path = financeScenarioPath(scenario.id);
    assert.equal(path[0], 'privacy_request');
    if (path.includes('save')) assert.ok(path.indexOf('privacy_publish') > path.indexOf('validate') && path.indexOf('privacy_publish') < path.indexOf('save'));
  }
});

test('middleware configuration parses without claiming a live SDK integration', () => {
  const parsed = spawnSync('python3', ['-c', 'import ast,sys; ast.parse(sys.stdin.read())'], { input: financePrivacyMiddlewareExample, encoding: 'utf8' });
  assert.equal(parsed.status, 0, parsed.stderr);
  assert.equal((financePrivacyMiddlewareExample.match(/strategy="redact"/g) ?? []).length, 2);
  assert.equal((financePrivacyMiddlewareExample.match(/apply_to_output=True/g) ?? []).length, 2);
  assert.equal((financePrivacyMiddlewareExample.match(/apply_to_tool_results=True/g) ?? []).length, 2);
});

test('bilingual privacy section exposes downloadable wiring and honest offline limits', () => {
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const html = renderToStaticMarkup(createElement(FinancePrivacyContent, { lang }));
    assert.ok(html.includes('id="finance-privacy"'));
    assert.ok(html.includes('[REDACTED_EMAIL]'));
    assert.ok(html.includes('PIIMiddleware'));
    assert.ok(html.includes('NOT RUN'));
    assert.ok(html.includes('/downloads/stock-research-privacy-guide.md'));
    assert.ok(html.includes('/downloads/finance-diagrams/privacy-'));
    assert.ok(!html.includes('<textarea'));
  }
});
