import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sources, topics, validateCurriculum } from '../site/curriculum.js';
import { conceptDetails } from '../site/concepts.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('all 13 lessons and 104 questions validate', () => {
  assert.deepEqual(validateCurriculum(), []);
  assert.equal(topics.length, 13);
  assert.equal(topics.reduce((total, topic) => total + topic.quiz.length, 0), 104);
  for (const topic of topics) {
    assert.equal(topic.quiz.length, 8);
    assert.equal(topic.examples.length, 5);
    assert.equal(new Set(topic.examples.map((item) => item.role)).size, 5);
    assert.ok(topic.visual.textAlternative.zh.length > 20);
    assert.ok(topic.quiz.every((question) => question.retryPrompt.zh !== question.prompt.zh));
  }
});

test('every topic has detailed metaphors, real examples, steps, and code', () => {
  for (const topic of topics) {
    const details = conceptDetails[topic.id];
    assert.ok(Array.isArray(details) && details.length >= 3, `${topic.id} needs three concept labs`);
    for (const detail of details) {
      assert.ok(detail.explanation.zh.length > 40);
      assert.ok(detail.metaphor.zh.length > 2);
      assert.ok(detail.example.zh.length > 20);
      assert.ok(detail.code.split('\n').length >= 4);
      assert.ok(detail.steps.length >= 3);
    }
  }
});

test('package has no dependencies and targets Node 18.18', async () => {
  const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  assert.equal(pkg.engines.node, '18.18.x');
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
  assert.equal(pkg.scripts.start, 'node server.mjs');
});

test('plain browser application contains every required learning surface', async () => {
  const application = await readFile(resolve(root, 'site/app.js'), 'utf8');
  const html = await readFile(resolve(root, 'site/index.html'), 'utf8');
  for (const token of ['conceptWorkshop', 'copy-code', 'visualLab', 'quizTab', 'reviewPage', 'assessmentPage', 'glossaryPage', 'settingsPage', 'localStorage', 'prefers-reduced-motion']) {
    assert.ok(application.includes(token), `missing ${token}`);
  }
  assert.ok(html.includes('type="module"'));
  assert.ok(!application.includes('OPENAI_API_KEY'));
  assert.ok(!application.includes('sk-'));
});

test('dated claims map to known sources with valid URLs', () => {
  const ids = new Set(sources.map((source) => source.id));
  for (const topic of topics) {
    assert.match(topic.current.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(topic.current.sourceIds.every((id) => ids.has(id)));
  }
  for (const source of sources) if (source.url) assert.doesNotThrow(() => new URL(source.url));
});
