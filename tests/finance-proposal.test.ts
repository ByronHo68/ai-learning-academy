import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FinanceProposalContent from '../app/finance-proposal-content';
import FinanceProjectContent from '../app/finance-project-content';
import { proposalStages, proposalServices, proposalDeploymentSteps } from '../lib/finance-proposal';
import documentSections from '../lib/finance-proposal-document.json';

test('proposal reader and Markdown download preserve the complete developer specification', async () => {
  const source = await readFile(new URL('../docs/FINANCIAL_REPORT_DEVELOPMENT_PROPOSAL.md', import.meta.url), 'utf8');
  const download = await readFile(new URL('../public/downloads/financial-report-development-proposal.md', import.meta.url), 'utf8');
  assert.equal(download, source);
  const headings = [...source.matchAll(/^## (\d+)\. (.+)$/gm)];
  assert.equal(documentSections.length, 10);
  for (const [index, section] of documentSections.entries()) {
    const heading = headings[index];
    assert.equal(section.title, `${heading[1]}. ${heading[2]}`);
    assert.equal(section.markdown, source.slice(heading.index + heading[0].length, headings[index + 1]?.index ?? source.length).trim());
  }
  assert.equal(proposalStages.length, 8);
  assert.equal(proposalStages.reduce((total, stage) => total + stage.hours, 0), 240);
  assert.equal(proposalServices.length, 8);
  assert.equal(proposalDeploymentSteps.length, 9);
});

test('proposal renders every stage, EC2 design and complete specification in both interface languages', () => {
  for (const lang of ['en', 'zh'] as const) {
    const html = renderToStaticMarkup(createElement(FinanceProposalContent, { lang }));
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    assert.equal((html.match(/class="proposal-stage"/g) ?? []).length, 8);
    assert.equal((html.match(/id="proposal-document-\d+"/g) ?? []).length, 10);
    assert.match(html, /download="FINANCIAL_REPORT_DEVELOPMENT_PROPOSAL.md"/);
    assert.ok(html.includes('lang="en"'));
    for (const stage of proposalStages) {
      assert.ok(html.includes(stage.title[lang]));
      assert.ok(html.includes(stage.acceptance[lang]));
      for (const task of stage.tasks) assert.ok(html.includes(task[lang]));
    }
    assert.ok(html.includes(lang === 'en' ? '20-week target' : '目標 20 週'));
    assert.ok(html.includes(lang === 'en' ? 'does not provision cloud resources' : '不會啟動雲端資源'));
    assert.ok(html.includes('docker compose --env-file deploy/production.env'));
    assert.ok(html.includes('--wait --wait-timeout 120'));
    assert.ok(html.includes('RequiresMountsFor=/srv/finance-data'));
    assert.ok(html.includes('CronJobs'));
    assert.ok(html.includes('24 to 32 weeks'));
    assert.ok(html.includes('Caddy'));
    assert.match(html, /href="\/finance-project"/);
    assert.ok(!html.includes('href="FINANCIAL_REPORT_PROJECT.md"'));
    assert.ok(!html.includes('href="../lib/'));
    const guide = renderToStaticMarkup(createElement(FinanceProjectContent, { lang }));
    assert.match(guide, /href="\/finance-project\/proposal"/);
  }
});
