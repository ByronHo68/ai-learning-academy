import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ConceptStudio from '../app/concept-studio';
import { agentOutcome, evaluateThreshold, inspectModel, lookupOrder, retrieveDocuments, transformIntents, type VisualLesson } from '../lib/junior-simulations';

test('visual data transformation stops at parsing or validation without partial counts', () => {
  assert.equal(transformIntents('[{"intent":"Refund"},{"intent":" refund "}]').counts.refund, 2);
  assert.equal(transformIntents('[').failure, 1);
  const invalid = transformIntents('[{"intent":"Refund"},{"intent":3}]');
  assert.equal(invalid.failure, 2);
  assert.equal(Object.keys(invalid.counts).length, 0);
  assert.equal(transformIntents('[{"intent":"__proto__"}]').counts.__proto__, 1);
});

test('visual access and model gates cannot disclose another owner or authorize model text', () => {
  assert.equal(lookupOrder('HK-1', 'alice').status, 200);
  assert.equal(lookupOrder('HK-2', 'alice').status, 404);
  assert.equal(lookupOrder('HK-2', 'alice').row, null);
  assert.equal(lookupOrder('HK-1', null).status, 401);
  assert.equal(inspectModel('valid').output, 'proposal');
  for (const fixture of ['refusal', 'broken', 'extra']) assert.equal(inspectModel(fixture).output, 'handoff');
});

test('retrieval animation changes recall with k without ranking excluded documents', () => {
  assert.deepEqual(retrieveDocuments('refund and delivery', 1).map(doc => doc.id), ['delivery-v1']);
  assert.deepEqual(retrieveDocuments('refund and delivery', 2).map(doc => doc.id), ['delivery-v1', 'returns-v2']);
  assert.deepEqual(retrieveDocuments('點樣退款？', 2).map(doc => doc.id), ['returns-v2']);
  assert.deepEqual(retrieveDocuments('weather', 2), []);
  assert.ok(retrieveDocuments('refund delivery 退款', 10).every(doc => doc.tenant === 'shop-a' && doc.active));
});

test('threshold animation moves the same four cases and preserves the confusion total', () => {
  const defaultResult = evaluateThreshold(.5);
  assert.deepEqual(defaultResult.cells, { tp: ['A'], fp: ['C'], fn: ['B'], tn: ['D'] });
  assert.equal(defaultResult.precision, .5);
  const loose = evaluateThreshold(.3);
  assert.equal(loose.recall, 1);
  assert.equal(loose.f1, .8);
  assert.equal(evaluateThreshold(.8).precision, 1);
  for (const threshold of [.1, .3, .4, .5, .6, .8, .95]) {
    const { cells } = evaluateThreshold(threshold);
    assert.equal(Object.values(cells).flat().length, 4);
    assert.equal(new Set(Object.values(cells).flat()).size, 4);
  }
  assert.equal(evaluateThreshold(.95).f1, 0);
});

test('agent animation requires independent approval and reuses one write on replay', () => {
  assert.equal(agentOutcome('normal', false).writes, 0);
  assert.equal(agentOutcome('normal', false).status, 'awaiting_approval');
  assert.equal(agentOutcome('forged', true).status, 'denied');
  assert.equal(agentOutcome('wrong-tool', true).writes, 0);
  assert.equal(agentOutcome('normal', true, 5).writes, 1);
  assert.equal(agentOutcome('normal', true, 5).status, 'CASE-1');
});

test('all six visual experiments render in both languages with controls and lesson links', () => {
  for (const lang of ['zh', 'en'] as const) for (const selected of ['python', 'backend', 'model', 'retrieval', 'evaluation', 'agent'] as VisualLesson[]) {
    const html = renderToStaticMarkup(createElement(ConceptStudio, { lang, selected, onSelect: () => {} }));
    assert.ok(html.includes(`href="#${selected}"`));
    assert.ok(html.includes('aria-live="polite"'));
    assert.ok(html.includes(`id="case-${selected}"`));
    assert.ok(html.includes(lang === 'zh' ? '減少動態' : 'Reduce motion'));
  }
});
