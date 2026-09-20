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
  assert.equal(Object.values(conceptDetails).flat().length, 59);
  assert.equal(conceptDetails.t13.length, 6);
  for (const topic of topics) {
    const details = conceptDetails[topic.id];
    assert.ok(Array.isArray(details) && details.length >= 4 && details.length <= 6, `${topic.id} needs four to six concept labs`);
    for (const detail of details) {
      assert.ok(detail.explanation.zh.length > 40);
      assert.ok(detail.metaphor.zh.length > 2);
      assert.ok(detail.example.zh.length > 20);
      assert.ok(detail.code.split('\n').length >= 4);
      assert.ok(detail.steps.length >= 3);
    }
  }
});

test('API lesson uses OpenRouter and removes the old mainland-China provider', async () => {
  const curriculum = await readFile(resolve(root, 'site/curriculum.js'), 'utf8');
  const concepts = await readFile(resolve(root, 'site/concepts.js'), 'utf8');
  const apiTopic = topics.find((topic) => topic.id === 't2');
  assert.ok(sources.some((source) => source.id === 'openrouter' && source.url === 'https://openrouter.ai/docs/quickstart'));
  assert.ok(apiTopic.sourceIds.includes('openrouter'));
  assert.ok(concepts.includes('OPENROUTER_API_KEY'));
  assert.doesNotMatch(`${curriculum}\n${concepts}`, /ARK_API_KEY|volcengine|火山引擎|豆包|doubao|方舟/i);
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
  assert.ok(application.includes('productionBuildBrief'));
  assert.ok(application.includes('human code review'));
});

test('production sources and Node 18 browser module are bundled', async () => {
  const production = await readFile(resolve(root, 'site/production-track.js'), 'utf8');
  assert.ok(production.includes('Provider fallback is a policy decision'));
  assert.ok(production.includes('Canary releases, rollback, and incident runbooks'));
  assert.ok(sources.some((source) => source.id === 'openrouter-fallback'));
  assert.ok(sources.some((source) => source.id === 'aws-genai-ops'));
  assert.ok(topics.find((topic) => topic.id === 't2').sourceIds.includes('openrouter-fallback'));
});

test('dated claims map to known sources with valid URLs', () => {
  const ids = new Set(sources.map((source) => source.id));
  for (const topic of topics) {
    assert.match(topic.current.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(topic.current.sourceIds.every((id) => ids.has(id)));
  }
  for (const source of sources) if (source.url) assert.doesNotThrow(() => new URL(source.url));
});
