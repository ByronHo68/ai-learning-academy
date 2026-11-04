import assert from 'node:assert/strict';
import test from 'node:test';
import {
  financeDemoAnalysis, financeDemoEvidence, financeDemoExport, financeDemoPages,
  financeDemoPreparedMarkdown, financeDemoReducer, initialFinanceDemo,
  type FinanceDemoAction, type FinanceDemoScenario, type FinanceDemoState,
} from '../lib/finance-demo';

function run(scenario: FinanceDemoScenario, actions: FinanceDemoAction[]): FinanceDemoState {
  return actions.reduce(financeDemoReducer, financeDemoReducer(initialFinanceDemo, { type: 'select', scenario }));
}

test('a question needs conversion and indexing; a result needs evidence validation', () => {
  const source = run('supported', []);
  for (const action of [{ type: 'index' }, { type: 'ask', question: 'cashflow-reason' }, { type: 'validate' }] satisfies FinanceDemoAction[]) {
    assert.equal(financeDemoReducer(source, action), source);
  }
  const markdown = financeDemoReducer(source, { type: 'convert' });
  assert.equal(markdown.kind, 'markdown');
  assert.equal(financeDemoReducer(markdown, { type: 'ask', question: 'cashflow-change' }), markdown);
  const indexed = financeDemoReducer(markdown, { type: 'index' });
  assert.equal(indexed.kind, 'indexed');
  assert.equal(financeDemoReducer(indexed, { type: 'validate' }), indexed);
  const evidence = financeDemoReducer(indexed, { type: 'ask', question: 'cashflow-reason' });
  assert.equal(evidence.kind, 'evidence');
  assert.equal(financeDemoReducer(evidence, { type: 'validate' }).kind, 'result');
});

test('table review blocks indexing and both review decisions have distinct outcomes', () => {
  const pending = run('review', [{ type: 'convert' }]);
  assert.equal(pending.kind, 'review');
  assert.equal(financeDemoReducer(pending, { type: 'index' }), pending);
  assert.equal(financeDemoReducer(pending, { type: 'ask', question: 'cashflow-change' }), pending);
  const rejected = financeDemoReducer(pending, { type: 'reject-review' });
  assert.equal(rejected.kind, 'rejected');
  for (const action of [{ type: 'approve-review' }, { type: 'convert' }, { type: 'index' }, { type: 'ask', question: 'cashflow-change' }] satisfies FinanceDemoAction[]) {
    assert.equal(financeDemoReducer(rejected, action), rejected);
  }
  const approved = financeDemoReducer(pending, { type: 'approve-review' });
  assert.equal(approved.kind, 'markdown');
  assert.equal(financeDemoReducer(approved, { type: 'index' }).kind, 'indexed');
  assert.equal(financeDemoAnalysis('review', 'cashflow-change').after, 80);
  assert.ok(!financeDemoPreparedMarkdown('review').includes('800'));
});

test('a scanned sample has no extracted content and cannot progress beyond the OCR stop', () => {
  const blocked = run('scanned', [{ type: 'convert' }]);
  assert.equal(blocked.kind, 'ocr-required');
  assert.deepEqual(financeDemoPages('scanned'), []);
  assert.deepEqual(financeDemoEvidence('scanned', 'cashflow-reason'), []);
  assert.equal(financeDemoPreparedMarkdown('scanned'), '');
  for (const action of [{ type: 'approve-review' }, { type: 'index' }, { type: 'ask', question: 'cashflow-reason' }, { type: 'validate' }] satisfies FinanceDemoAction[]) {
    assert.equal(financeDemoReducer(blocked, action), blocked);
  }
  assert.deepEqual(financeDemoReducer(blocked, { type: 'select', scenario: 'supported' }), { kind: 'source', scenario: 'supported' });
});

test('missing causal evidence returns supported numbers without inventing an explanation', () => {
  const partial = financeDemoAnalysis('missing', 'cashflow-reason');
  assert.equal(partial.kind, 'partial');
  assert.equal(partial.before, 100);
  assert.equal(partial.after, 80);
  assert.equal(partial.changePercent, -20);
  assert.ok(partial.body.en.includes('cannot establish why'));
  assert.ok(!partial.body.en.includes('receivables'));
  assert.deepEqual(partial.evidence.map(page => page.page), [42, 48]);
  assert.ok(!financeDemoPreparedMarkdown('missing').includes('original page 49'));
  assert.equal(financeDemoAnalysis('missing', 'cashflow-change').kind, 'supported');
  const supported = financeDemoAnalysis('supported', 'cashflow-reason');
  assert.equal(supported.kind, 'supported');
  assert.ok(supported.body.en.includes('receivables'));
  assert.deepEqual(supported.evidence.map(page => page.page), [42, 48, 49]);
});

test('asking again reuses indexed content and clears the prior result until validation', () => {
  const result = run('supported', [{ type: 'convert' }, { type: 'index' }, { type: 'ask', question: 'cashflow-reason' }, { type: 'validate' }]);
  assert.equal(result.kind, 'result');
  const next = financeDemoReducer(result, { type: 'ask', question: 'cashflow-change' });
  assert.deepEqual(next, { kind: 'evidence', scenario: 'supported', question: 'cashflow-change' });
  assert.equal(financeDemoReducer(next, { type: 'validate' }).kind, 'result');
  assert.deepEqual(financeDemoReducer(result, { type: 'select', scenario: 'missing' }), { kind: 'source', scenario: 'missing' });
  assert.deepEqual(financeDemoReducer(result, { type: 'restart' }), initialFinanceDemo);
});

test('export keeps the displayed answer, calculation, source years, pages and units in both languages', () => {
  const result = run('review', [{ type: 'convert' }, { type: 'approve-review' }, { type: 'index' }, { type: 'ask', question: 'cashflow-reason' }, { type: 'validate' }]);
  assert.ok(result.kind === 'result');
  const analysis = financeDemoAnalysis(result.scenario, result.question);
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const exported = financeDemoExport(result, lang);
    assert.ok(exported.includes(analysis.body[lang]));
    assert.ok(exported.includes(analysis.calculation));
    for (const page of analysis.evidence) {
      assert.ok(exported.includes(`${page.year} p.${page.page}`));
      assert.ok(exported.includes(page.id));
      assert.ok(exported.includes(page.text[lang]));
    }
    assert.ok(exported.includes(lang === 'en' ? 'fictional' : '虛構'));
    assert.ok(exported.includes(lang === 'en' ? 'HKD million' : '百萬港元'));
    assert.ok(exported.includes(lang === 'en' ? 'simulated reviewer' : '模擬覆核者'));
  }
});
