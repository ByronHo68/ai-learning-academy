import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FinanceProposalContent from '../app/finance-proposal-content';
import { financeEngineeringWorkflows, financeFunctions, financeStages } from '../lib/finance-project';
import { financeComposeDesign, financeRuntimeLimits } from '../lib/finance-proposal';

test('generated downloads contain the retained specification and match their documentation', async () => {
  for (const [document, download] of [
    ['FINANCIAL_REPORT_PROJECT.md', 'stock-research-project.md'],
    ['FINANCIAL_REPORT_DEVELOPMENT_PROPOSAL.md', 'financial-report-development-proposal.md'],
    ['FINANCIAL_REPORT_LANGGRAPH_DESIGN.md', 'financial-report-langgraph-design.md'],
  ]) {
    const source = await readFile(new URL(`../docs/${document}`, import.meta.url), 'utf8');
    assert.equal(await readFile(new URL(`../public/downloads/${download}`, import.meta.url), 'utf8'), source);
    assert.ok(!source.includes('Hong Kong Financial Report Analyst'));
    assert.ok(source.includes('fictional'));
  }
  const proposal = await readFile(new URL('../docs/FINANCIAL_REPORT_DEVELOPMENT_PROPOSAL.md', import.meta.url), 'utf8');
  for (const guide of [...financeFunctions, ...financeEngineeringWorkflows]) {
    assert.ok(proposal.includes(guide.title.en));
    assert.ok(proposal.includes(guide.title.zh));
    for (const step of guide.steps) {
      assert.ok(proposal.includes(step.how.en));
      assert.ok(proposal.includes(step.why.zh));
    }
  }
});

test('the bilingual proposal presents local development, bounded runs and private Docker deployment', () => {
  for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
    const html = renderToStaticMarkup(createElement(FinanceProposalContent, { lang }));
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    for (const stage of financeStages) assert.ok(html.includes(stage.done[lang]));
    for (const id of ['proposal-estimate', 'proposal-stages', 'finance-build-guide', 'proposal-ec2', 'proposal-evaluation']) assert.ok(html.includes(`id="${id}"`));
    assert.ok(html.includes('/downloads/financial-report-development-proposal.md'));
    assert.ok(html.includes('127.0.0.1:3000:3000'));
    assert.ok(html.includes('http://research:8000'));
    assert.ok(!html.includes('21–22 weeks'));
    assert.ok(!html.includes('MarkItDown conversion guide'));
  }
  assert.equal(financeRuntimeLimits.searchRounds, 2);
  assert.ok(!financeComposeDesign.includes('8000:8000'));
});
