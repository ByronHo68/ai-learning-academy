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
  }
});
