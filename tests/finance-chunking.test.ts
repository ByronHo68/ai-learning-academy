import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { chunkExample, chunkMeasurements } from '../lib/finance-chunking';
import { chunkLimitCases, chunkLimitExample } from '../lib/finance-chunk-limits';

test('each illustrated chunk resolves to its exact article slice within the model limit', () => {
  assert.equal(chunkExample.news.length, 3);
  assert.equal(chunkMeasurements.articles.length, chunkExample.news.length);
  assert.equal(chunkMeasurements.articles[0].sourceChars, 8000);
  assert.equal(chunkMeasurements.articles[2].sourceField, 'summary');

  for (const [index, measured] of chunkMeasurements.articles.entries()) {
    const article = chunkExample.news[index];
    const body = Array.from((measured.sourceField === 'summary' ? article.summary : article.content) ?? '');
    assert.equal(body.length, measured.sourceChars);
    for (const preset of measured.variants) {
      let end = 0;
      let previousStart = -1;
      for (const chunk of preset.chunks) {
        assert.ok(chunk.startChar > previousStart);
        assert.ok(chunk.startChar <= end && end < chunk.endChar && chunk.endChar <= body.length);
        if (preset.overlap === 0) assert.equal(chunk.startChar, end);
        assert.ok(chunk.textTokens > 0 && chunk.textTokens <= preset.target);
        assert.ok(chunk.inputTokens > chunk.textTokens && chunk.inputTokens <= chunkMeasurements.maxInput);
        const text = body.slice(chunk.startChar, chunk.endChar).join('');
        assert.equal(createHash('sha256').update(text).digest('hex'), chunk.textSha256);
        previousStart = chunk.startChar;
        end = chunk.endChar;
      }
      assert.equal(end, body.length);
    }
  }
});

test('the news limit demo tracks article coverage separately from vector readiness', () => {
  const examples = new Map(chunkLimitCases.map(item => [item.id, item]));
  const long = examples.get('long');
  const summary = examples.get('summary');
  const skipped = examples.get('skip');
  assert.ok(long && summary && skipped);

  const partial = chunkLimitExample(long, false);
  const complete = chunkLimitExample(long, true);
  assert.equal(partial.intake.source_coverage, 'full_body');
  assert.deepEqual(complete.intake, partial.intake);
  assert.equal(partial.vector_index.status, 'partial');
  assert.equal(partial.vector_index.ready_chunks + partial.vector_index.queued_chunks, partial.vector_index.planned_chunks);
  assert.equal(complete.vector_index.status, 'complete');
  assert.equal(complete.vector_index.queued_chunks, 0);

  const fallback = chunkLimitExample(summary, false);
  assert.equal(fallback.vector_index.status, 'complete');
  assert.equal(fallback.intake.source_coverage, 'summary_only');
  assert.equal(fallback.intake.source_field, 'summary');
  assert.equal(fallback.intake.reason, 'content_over_limit');
  const rejected = chunkLimitExample(skipped, false);
  assert.equal(rejected.intake.source_field, null);
  assert.equal(rejected.vector_index.status, 'not_applicable');
  assert.equal(rejected.vector_index.planned_chunks, 0);
});
