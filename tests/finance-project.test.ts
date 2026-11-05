import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FinanceProjectContent, { FinanceProjectBanner } from '../app/finance-project-content';
import { FinanceFunctionMindmap } from '../app/finance-function-map';
import { financeCompanies, financeEngineeringWorkflows, financeFunctions, financeStages } from '../lib/finance-project';
import { financePlan } from '../lib/finance-proposal';

test('the bounded scope and cumulative delivery estimate stay consistent', () => {
  assert.deepEqual(financeCompanies.map(company => company.id), ['MSFT', 'AAPL', 'NVDA']);
  assert.deepEqual(new Set(financeFunctions.map(guide => guide.id)), new Set(['company', 'sources', 'retrieval', 'research', 'report', 'validation', 'export', 'recovery']));
  assert.deepEqual(new Set(financeEngineeringWorkflows.map(guide => guide.id)), new Set(['evaluation', 'deployment']));
  assert.equal(financeStages.reduce((total, stage) => total + stage.hours, 0), financePlan.hoursMin);
  assert.equal(financePlan.hoursMin + financePlan.contingencyHours, financePlan.hoursMax);
  assert.equal(financePlan.hoursMax / financePlan.weeklyHours, financePlan.weeksMax);
});

test('both languages expose every retained function and its own workflow', () => {
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const html = renderToStaticMarkup(createElement(FinanceProjectContent, { lang }));
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    for (const guide of [...financeFunctions, ...financeEngineeringWorkflows]) {
      assert.ok(html.includes(`id="finance-function-${guide.id}"`), guide.id);
      assert.ok(html.includes(`data-function="${guide.id}"`), guide.id);
      assert.ok(html.includes(guide.title[lang]), guide.id);
    }
    for (const anchor of ['finance-functions', 'finance-build-guide', 'finance-stack', 'finance-stages', 'finance-langgraph-map']) assert.ok(html.includes(`id="${anchor}"`), anchor);
    assert.ok(html.includes('/finance-project/demo'));
    assert.ok(html.includes('/finance-project/proposal'));
    assert.ok(!html.includes('Hong Kong Financial Report Analyst'));
    assert.ok(!html.includes('24 functions'));
    assert.ok(!html.includes('24 項功能'));
    const banner = renderToStaticMarkup(createElement(FinanceProjectBanner, { lang }));
    assert.ok(banner.includes('/finance-project'));
  }
});

test('every function presents its real entry type, technology explanation and distinct returns', () => {
  for (const guide of [...financeFunctions, ...financeEngineeringWorkflows]) {
    for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
      const html = renderToStaticMarkup(createElement(FinanceFunctionMindmap, { guide, lang }));
      assert.ok(html.includes(guide.input[lang]), guide.id);
      assert.ok(html.includes(guide.output[lang]), guide.id);
      for (const branch of guide.branches) assert.ok(html.includes(branch.result[lang]), guide.id);
      assert.ok(html.includes(guide.steps[0].how[lang]), guide.id);
      assert.ok(html.includes(guide.steps[0].why[lang]), guide.id);
      if (guide.entry.kind === 'http') assert.ok(html.includes(guide.entry.path));
      if (guide.entry.kind === 'developer') assert.ok(!html.includes('Authorization: Bearer'));
    }
    assert.ok(guide.branches.some(branch => branch.kind === 'success'));
    assert.ok(guide.branches.some(branch => branch.kind === 'failure'));
    assert.equal(new Set(guide.steps.map(step => step.id)).size, guide.steps.length);
  }
});
