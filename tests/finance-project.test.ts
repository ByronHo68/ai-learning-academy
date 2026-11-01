import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FinanceProjectContent, { FinanceProjectBanner } from '../app/finance-project-content';
import { topics } from '../lib/curriculum';
import { financeAreas } from '../lib/finance-project';
import { financeFunctionWorkflows } from '../lib/finance-function-workflows';
import { financeAreaIllustrations, financeOverviewIllustration } from '../lib/finance-illustrations';
import { readFile } from 'node:fs/promises';
import { financeApiWorkflows, type FinanceApiWorkflow } from '../lib/finance-api-workflows';
import { FinanceApiContent } from '../app/finance-api-content';

test('finance blueprint renders accessible branch controls and course links in both languages', () => {
  for (const lang of ['en', 'zh'] as const) {
    const html = renderToStaticMarkup(createElement(FinanceProjectContent, { lang }));
    assert.equal((html.match(/aria-controls="finance-area-detail"/g) ?? []).length, 8);
    assert.equal((html.match(/aria-controls="finance-function-list"/g) ?? []).length, 8);
    assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 2);
    assert.match(html, /id="finance-area-detail"[^>]*aria-live="polite"/);
    assert.match(html, /id="finance-workflow"/);
    assert.match(html, /id="finance-functions"/);
    assert.match(html, /id="finance-pictures"/);
    assert.ok(html.includes(financeOverviewIllustration.src));
    assert.ok(html.includes(financeAreaIllustrations.library.src));
    assert.equal((html.match(/class="finance-function-flow"/g) ?? []).length, 3);
    assert.equal((html.match(/class="finance-api"/g) ?? []).length, 3);
    assert.equal((html.match(/class="finance-stack-flow"/g) ?? []).length, 6);
    for (const item of financeFunctionWorkflows.library) {
      assert.ok(html.includes(item.title[lang]));
      assert.ok(html.includes(item.result[lang]));
      assert.ok(html.includes(item.failure[lang]));
    }
    assert.match(html, /name="finance-scenario"/);
    assert.match(html, /id="finance-stack"/);
    assert.match(html, /id="finance-stages"/);
    assert.ok(html.includes(lang === 'en' ? 'fictional' : '虛構'));
    assert.ok(html.includes(lang === 'en' ? 'does not upload files or call a model' : '不會上載文件或呼叫模型'));
    const banner = renderToStaticMarkup(createElement(FinanceProjectBanner, { lang }));
    assert.match(banner, /href="\/finance-project"/);
  }
  for (const area of financeAreas) {
    assert.ok(topics.some(topic => topic.slug === area.lesson.slug), `Broken course link: ${area.lesson.slug}`);
  }
});

test('generated teaching illustrations are real local WebP assets for every project area', async () => {
  for (const area of financeAreas) assert.ok(area.id in financeAreaIllustrations);
  const illustrations = [financeOverviewIllustration, ...Object.values(financeAreaIllustrations)];
  assert.equal(new Set(illustrations.map(item => item.src)).size, 9);
  for (const illustration of illustrations) {
    assert.ok(illustration.src.startsWith('/finance-illustrations/v1/'));
    const asset = await readFile(new URL(`../public${illustration.src}`, import.meta.url));
    assert.equal(new TextDecoder().decode(asset.subarray(0, 4)), 'RIFF', illustration.src);
    assert.equal(new TextDecoder().decode(asset.subarray(8, 12)), 'WEBP', illustration.src);
    for (const lang of ['en', 'zh'] as const) {
      assert.ok(illustration.alt[lang].length > 20);
      assert.ok(illustration.steps.every(step => step[lang].trim().length > 0));
    }
    assert.equal(new Set(illustration.steps.map(step => step.keyword)).size, illustration.steps.length);
    assert.ok(illustration.steps.every(step => /^[A-Za-z ]+$/.test(step.keyword)));
  }
});

test('all 24 function guides have a rendered API or CI contract in both languages', () => {
  let httpCount = 0;
  let pipelineCount = 0;
  for (const area of financeAreas) {
    const workflows: FinanceApiWorkflow[] = financeApiWorkflows[area.id];
    assert.equal(workflows.length, financeFunctionWorkflows[area.id].length);
    for (const workflow of workflows) {
      if (workflow.kind === 'http') httpCount++;
      else pipelineCount++;
      for (const lang of ['en', 'zh'] as const) {
        const html = renderToStaticMarkup(createElement(FinanceApiContent, { workflow, lang }));
        assert.ok(html.includes(workflow.services));
        for (const stage of workflow.processing) assert.ok(html.includes(stage[lang]));
        if (workflow.kind === 'pipeline') {
          assert.ok(html.includes('workflow_dispatch'));
          assert.ok(html.includes(workflow.failure[lang]));
          assert.ok(!html.includes('Authorization:'));
          continue;
        }
        assert.ok(html.includes(workflow.path));
        assert.ok(html.includes(`HTTP ${workflow.result.status}`));
        assert.ok(html.includes('Authorization: Bearer'));
        assert.ok(html.includes(lang === 'en' ? 'no requests are sent' : '不會發出請求'));
        if (workflow.method === 'GET') assert.ok(workflow.request.kind === 'query' || workflow.request.kind === 'none');
        if (workflow.result.kind === 'accepted') {
          assert.ok(html.includes(`GET ${workflow.result.poll}`));
          assert.equal(workflow.result.example.statusUrl, workflow.result.poll);
          assert.equal(workflow.result.completed.state, 'completed');
          assert.equal(workflow.result.failed.state, 'failed');
          assert.ok(html.includes(lang === 'en' ? 'still unfinished' : '尚未完成'));
        }
        if (workflow.result.kind === 'file') assert.ok(html.includes('application/pdf'));
        for (const error of workflow.errors) assert.ok(html.includes(error.code));
      }
    }
  }
  assert.equal(httpCount, 23);
  assert.equal(pipelineCount, 1);
});
