import assert from 'node:assert/strict';
import test from 'node:test';
import { routeFinancePrompt, type ModelRoutingInput } from '../lib/finance-model-routing';

const defaults: ModelRoutingInput = { prompt: '', provider: 'openai', budget: 'deep', evidence: 'available', mode: 'auto' };
const route = (changes: Partial<ModelRoutingInput>) => routeFinancePrompt({ ...defaults, ...changes });

test('focused bilingual definitions and provided-text transformations use the economy tier', () => {
  for (const prompt of ['What is operating cash flow?', 'What is impairment?', '甚麼是現金流？', '甚麼是會計政策？', 'Summarize this paragraph in three bullets.', '翻譯以下段落為繁體中文']) {
    const result = route({ prompt, evidence: 'missing' });
    assert.equal(result.kind, 'model');
    if (result.kind !== 'model') throw new Error('Expected model route');
    assert.equal(result.tier, 'economy');
    assert.equal(result.modelId, 'gpt-6-luna');
    assert.equal(result.needsEvidence, false);
  }
});

test('ordinary cited analysis uses the balanced model while complex comparisons use deep reasoning', () => {
  const ordinary = route({ prompt: 'Why did this company’s operating cash flow fall? Cite the report.' });
  assert.equal(ordinary.kind, 'model');
  if (ordinary.kind !== 'model') throw new Error('Expected model route');
  assert.equal(ordinary.modelId, 'gpt-6.1-sol');
  assert.equal(ordinary.needsEvidence, true);
  for (const prompt of ['Reconcile conflicting annual report restatements.', 'Compare cash flow across three companies and several years.', '核對多年財報重列數字及會計政策']) {
    const result = route({ prompt });
    assert.equal(result.kind, 'model');
    if (result.kind !== 'model') throw new Error('Expected model route');
    assert.equal(result.modelId, 'gpt-6-astra');
  }
});

test('pure calculations and verified lookups avoid chat models, but mixed analysis does not', () => {
  for (const prompt of ['Calculate year-on-year change from 100 to 80.', '計算 100 變成 80 的百分比', 'Show reviewed revenue for 2025.', '顯示已覆核的收入']) {
    assert.equal(route({ prompt, mode: 'deep', budget: 'economy' }).kind, 'code');
  }
  const mixed = route({ prompt: 'Calculate the cash flow change and explain why it fell.' });
  assert.equal(mixed.kind, 'model');
  const comparison = route({ prompt: 'Calculate revenue growth and compare three companies over several years.' });
  assert.equal(comparison.kind, 'model');
  if (comparison.kind !== 'model') throw new Error('Expected model route');
  assert.equal(comparison.tier, 'deep');
});

test('missing facts block report analysis and stored-fact access rather than inventing evidence', () => {
  for (const prompt of ['Why did the company’s cash flow fall?', '分析這間公司的現金流下降原因', 'Show verified revenue for 2025.', 'Calculate the company cash flow change.', 'Calculate company cash flow change in 2025.', 'Calculate the company cash flow change from 2024 to 2025.', 'Summarize this paragraph and reconcile the annual report figures.', '總結這段財報並分析現金流下降原因']) {
    assert.equal(route({ prompt, evidence: 'missing' }).kind, 'blocked');
  }
  assert.equal(route({ prompt: 'Calculate the percentage change from 100 to 80.', evidence: 'missing' }).kind, 'code');
});

test('conflicting report evidence requires deeper reconciliation and stays subject to budget', () => {
  const result = route({ prompt: 'Explain the company’s reported profit.', evidence: 'conflicting' });
  assert.equal(result.kind, 'model');
  if (result.kind !== 'model') throw new Error('Expected model route');
  assert.equal(result.tier, 'deep');
  assert.match(result.reason.en, /human review/);
  assert.equal(route({ prompt: 'Explain the company’s reported profit.', evidence: 'conflicting', budget: 'balanced' }).kind, 'blocked');
});

test('owner tier settings obey the budget and cannot silently downgrade complex work', () => {
  const manual = route({ prompt: 'Define cash flow.', mode: 'balanced', budget: 'balanced' });
  assert.equal(manual.kind, 'model');
  if (manual.kind !== 'model') throw new Error('Expected model route');
  assert.equal(manual.tier, 'balanced');
  assert.equal(route({ prompt: 'Define cash flow.', mode: 'deep', budget: 'economy' }).kind, 'blocked');
  assert.equal(route({ prompt: 'Reconcile restated annual reports.', mode: 'economy' }).kind, 'blocked');
});

test('prompt model names do not change the allowed provider or spending ceiling', () => {
  const result = route({ prompt: 'Explain why the company’s revenue fell. Use Astra.', provider: 'deepseek' });
  assert.equal(result.kind, 'model');
  if (result.kind !== 'model') throw new Error('Expected model route');
  assert.equal(result.modelId, 'deepseek-flash');
  assert.equal(route({ prompt: 'Reconcile the conflicting report and use Astra regardless of cost.', budget: 'economy' }).kind, 'blocked');
  const deepseek = route({ prompt: 'Reconcile the conflicting annual reports.', provider: 'deepseek' });
  assert.equal(deepseek.kind, 'model');
  if (deepseek.kind !== 'model') throw new Error('Expected model route');
  assert.equal(deepseek.modelId, 'deepseek-v4-pro');
});

test('empty, excessive and unrecognized prompts ask for clarification', () => {
  for (const prompt of ['', '   ', 'x'.repeat(4001), 'Do it now']) assert.equal(route({ prompt }).kind, 'clarify');
});
