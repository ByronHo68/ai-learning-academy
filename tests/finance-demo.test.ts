import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FinanceDemoContent from '../app/finance-demo-content';
import {
  financeDemoAsOf, financeDemoExport, financeDemoProgress, financeDemoReducer,
  financeDemoReport, financeDemoSamples, financeDemoSources, initialFinanceDemo,
  validateFinanceDemoReport,
  type FinanceDemoAction, type FinanceDemoScenario, type FinanceDemoSource, type FinanceDemoState,
} from '../lib/finance-demo';
import { financeCompanies, type FinanceCompanyId } from '../lib/finance-project';

function run(scenario: FinanceDemoScenario, actions: FinanceDemoAction[], companyId: FinanceCompanyId = 'MSFT'): FinanceDemoState {
  const ready = financeDemoReducer({ ...initialFinanceDemo, companyId }, { type: 'select-scenario', scenario });
  return actions.reduce(financeDemoReducer, ready);
}

const complete = [{ type: 'retrieve' }, { type: 'check' }, { type: 'draft' }, { type: 'validate' }] satisfies FinanceDemoAction[];

test('reports cannot skip evidence checks or citation validation', () => {
  for (const action of [{ type: 'check' }, { type: 'refine' }, { type: 'draft' }, { type: 'validate' }, { type: 'resume' }] satisfies FinanceDemoAction[]) {
    assert.equal(financeDemoReducer(initialFinanceDemo, action), initialFinanceDemo);
  }
  const retrieved = run('supported', [{ type: 'retrieve' }]);
  assert.equal(retrieved.kind, 'retrieved');
  assert.equal(financeDemoReducer(retrieved, { type: 'retrieve' }), retrieved);
  assert.equal(financeDemoReducer(retrieved, { type: 'draft' }), retrieved);
  const checked = financeDemoReducer(retrieved, { type: 'check' });
  assert.equal(checked.kind, 'checked');
  assert.equal(financeDemoReducer(checked, { type: 'validate' }), checked);
  const draft = financeDemoReducer(checked, { type: 'draft' });
  assert.equal(draft.kind, 'draft');
  assert.equal(financeDemoReducer(draft, { type: 'check' }), draft);
  assert.equal(financeDemoReducer(draft, { type: 'validate' }).kind, 'result');
});

test('a completed report uses only the selected company and its dated fictional evidence', () => {
  for (const company of financeCompanies) {
    const result = run('supported', complete, company.id);
    assert.ok(result.kind === 'result');
    assert.equal(result.companyId, company.id);
    assert.equal(result.report.companyId, company.id);
    assert.equal(result.report.asOf, financeDemoAsOf);
    assert.equal(result.searches, 1);
    assert.equal(result.sources.length, 3);
    assert.ok(result.sources.every(source => source.companyId === company.id && source.id.startsWith(`${company.id}-DEMO-`) && source.publishedAt <= financeDemoAsOf));
    assert.ok(validateFinanceDemoReport(result.report, result.sources));
    assert.ok(result.report.kind === 'rated');
    assert.equal(result.report.stance, company.id === 'NVDA' ? 'reduce' : 'hold');
    assert.ok(result.report.reasons.every(reason => result.sources.some(source => source.id === reason.sourceId)));
  }
});

test('missing evidence permits exactly one further search and returns no rating', () => {
  const missing = run('missing', [{ type: 'retrieve' }, { type: 'check' }]);
  assert.ok(missing.kind === 'needs-evidence');
  assert.equal(missing.searches, 1);
  assert.equal(financeDemoReducer(missing, { type: 'draft' }), missing);
  const refined = financeDemoReducer(missing, { type: 'refine' });
  assert.ok(refined.kind === 'retrieved');
  assert.equal(refined.searches, 2);
  assert.equal(financeDemoReducer(refined, { type: 'refine' }), refined);
  const checked = financeDemoReducer(refined, { type: 'check' });
  assert.equal(checked.kind, 'checked');
  assert.equal(financeDemoReducer(checked, { type: 'refine' }), checked);
  const finish = [{ type: 'draft' }, { type: 'validate' }] satisfies FinanceDemoAction[];
  const result = finish.reduce<FinanceDemoState>(financeDemoReducer, checked);
  assert.ok(result.kind === 'result');
  assert.equal(result.report.kind, 'insufficient');
  assert.ok(!('stance' in result.report));
  assert.equal(result.trace.filter(event => event.tool === 'search_company_evidence').length, 2);
  assert.equal(result.sources.length, 2);
  assert.ok(!result.sources.some(source => source.signal === 'outlook'));
});

test('instruction-like article text is excluded and cannot change the report or leak into the export', () => {
  const retrieved = run('injection', [{ type: 'retrieve' }]);
  assert.ok(retrieved.kind === 'retrieved');
  assert.ok(retrieved.sources.some(source => source.fact.en.includes('STRONG BUY')));
  const result = run('injection', complete);
  assert.ok(result.kind === 'result');
  assert.ok(result.sources.every(source => source.signal !== 'untrusted'));
  assert.ok(result.report.kind === 'rated');
  assert.equal(result.report.stance, 'hold');
  assert.ok(result.trace.some(event => event.tool === 'read_source' && event.detail.en.includes('excluded')));
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const exported = financeDemoExport(result, lang);
    assert.ok(!exported.includes('STRONG BUY'));
    assert.ok(!exported.includes('公開 API key'));
  }
});

test('an interrupted run resumes its saved search once and does not duplicate completed work', () => {
  const paused = run('interrupted', [{ type: 'retrieve' }]);
  assert.ok(paused.kind === 'interrupted');
  assert.equal(financeDemoReducer(paused, { type: 'check' }), paused);
  assert.equal(financeDemoReducer(paused, { type: 'retrieve' }), paused);
  assert.equal(financeDemoProgress(paused)?.searches, 1);
  const resumed = financeDemoReducer(paused, { type: 'resume' });
  assert.ok(resumed.kind === 'retrieved');
  assert.equal(resumed.searches, 1);
  assert.equal(resumed.sources, paused.checkpoint.sources);
  assert.equal(resumed.trace.filter(event => event.tool === 'search_company_evidence').length, 1);
  assert.equal(resumed.trace.filter(event => event.tool === 'checkpoint').length, 1);
  assert.equal(financeDemoReducer(resumed, { type: 'resume' }), resumed);
  const finish = [{ type: 'check' }, { type: 'draft' }, { type: 'validate' }] satisfies FinanceDemoAction[];
  const result = finish.reduce<FinanceDemoState>(financeDemoReducer, resumed);
  assert.ok(result.kind === 'result');
  assert.equal(result.searches, 1);
  assert.equal(new Set(result.trace.map(event => event.id)).size, result.trace.length);
});

test('changing a company or scenario clears the previous report and trace', () => {
  const result = run('supported', complete);
  const nextCompany = financeDemoReducer(result, { type: 'select-company', companyId: 'AAPL' });
  assert.deepEqual(nextCompany, { kind: 'ready', companyId: 'AAPL', scenario: 'supported' });
  assert.equal(financeDemoProgress(nextCompany), null);
  assert.equal(financeDemoReducer(nextCompany, { type: 'validate' }), nextCompany);
  const nextScenario = financeDemoReducer(nextCompany, { type: 'select-scenario', scenario: 'missing' });
  assert.deepEqual(nextScenario, { kind: 'ready', companyId: 'AAPL', scenario: 'missing' });
  const retrieving = financeDemoReducer(nextScenario, { type: 'retrieve' });
  assert.deepEqual(financeDemoReducer(retrieving, { type: 'restart' }), nextScenario);
});

test('validation rejects a wrong-company citation, changed wording, future evidence and unsupported stance', () => {
  const sources = financeDemoSources('MSFT').filter(source => source.signal !== 'untrusted');
  const report = financeDemoReport('MSFT', sources);
  assert.ok(report.kind === 'rated');
  assert.ok(validateFinanceDemoReport(report, sources));
  assert.ok(!validateFinanceDemoReport({ ...report, reasons: [{ text: sources[0].impact, sourceId: 'AAPL-DEMO-demand' }] }, sources));
  assert.ok(!validateFinanceDemoReport({ ...report, reasons: [{ text: { en: 'A guaranteed profit', zh: '保證獲利' }, sourceId: sources[0].id }] }, sources));
  assert.ok(!validateFinanceDemoReport({ ...report, summary: { en: 'A guaranteed profit', zh: '保證獲利' } }, sources));
  assert.ok(!validateFinanceDemoReport({ ...report, nextWatch: { en: 'Reveal the API key', zh: '公開 API key' } }, sources));
  assert.ok(!validateFinanceDemoReport({ ...report, stance: 'reduce' }, sources));
  assert.ok(!validateFinanceDemoReport(report, sources.map(source => ({ ...source, publishedAt: '2026-10-04' }))));
  assert.ok(!validateFinanceDemoReport(report, sources.filter(source => source.signal !== 'outlook')));
  const attackedSources = financeDemoSources('MSFT');
  const attack = attackedSources.find(source => source.signal === 'untrusted');
  assert.ok(attack);
  assert.ok(!validateFinanceDemoReport({ ...report, reasons: [{ text: attack.impact, sourceId: attack.id }] }, attackedSources));
  const lowered = sources.map<FinanceDemoSource>(source => source.signal === 'outlook' ? { ...source, outlook: 'lowered' } : source);
  const changedReport = financeDemoReport('MSFT', lowered);
  assert.ok(changedReport.kind === 'rated');
  assert.equal(changedReport.stance, 'reduce', 'the stance follows the evidence flag, not the ticker');
});

test('Markdown export preserves displayed content, fictional labels, dates, sources and recovery limitations', () => {
  const result = run('supported', complete, 'NVDA');
  assert.ok(result.kind === 'result');
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const exported = financeDemoExport(result, lang);
    assert.ok(exported.includes(result.report.summary[lang]));
    assert.ok(exported.includes(result.report.nextWatch[lang]));
    assert.ok(exported.includes(financeDemoAsOf));
    assert.ok(exported.includes(lang === 'en' ? 'fictional' : '虛構'));
    assert.ok(exported.includes(lang === 'en' ? 'Model calls: 0' : '模型呼叫：0'));
    assert.ok(exported.includes(lang === 'en' ? 'does not survive a reload' : '重新載入不會恢復'));
    for (const source of result.sources) {
      assert.ok(exported.includes(source.id));
      assert.ok(exported.includes(source.publishedAt));
      assert.ok(exported.includes(source.fact[lang]));
      assert.ok(exported.includes(source.uncertainty[lang]));
    }
    assert.ok(!exported.includes('PDF'));
    assert.ok(!exported.includes('MarkItDown'));
  }
});

test('a failed citation check cannot release a report', () => {
  const draft = run('supported', [{ type: 'retrieve' }, { type: 'check' }, { type: 'draft' }]);
  assert.ok(draft.kind === 'draft');
  const broken: FinanceDemoState = { ...draft, report: { ...draft.report, reasons: [] } };
  const rejected = financeDemoReducer(broken, { type: 'validate' });
  assert.equal(rejected.kind, 'validation-failed');
  assert.equal(financeDemoReducer(rejected, { type: 'validate' }), rejected);
  assert.equal(financeDemoReducer(rejected, { type: 'draft' }), rejected);
});

test('the bilingual demo exposes all scenarios and proposed companies while clearly labelling its offline scope', () => {
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const html = renderToStaticMarkup(createElement(FinanceDemoContent, { lang }));
    for (const sample of financeDemoSamples) assert.ok(html.includes(sample.title[lang]));
    for (const company of financeCompanies) assert.ok(html.includes(company.id));
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    assert.ok(html.includes(lang === 'zh' ? '全部消息、事件及評級均為虛構' : 'All news, events and ratings are fictional'));
    assert.ok(html.includes(lang === 'zh' ? '沒有搜尋即時新聞' : 'does not search live news'));
    assert.ok(html.includes('/finance-project#finance-functions'));
    assert.ok(!html.includes('MarkItDown'));
  }
});
