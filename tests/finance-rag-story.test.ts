import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  joinRagEmbeddings, ragChunks, ragContext, ragEmbedding, ragEmbeddingRequest, ragExampleResponse,
  ragNews, ragQueryRequest, ragScenarios, ragStoryPath, ragWorkflow,
} from '../lib/finance-rag-story';

test('embedding results join to the original chunk ID even when response order is reversed', () => {
  const reply = ragExampleResponse(false);
  const joined = joinRagEmbeddings(reply, ragChunks.map(chunk => chunk.chunk_id));
  assert.equal(joined.kind, 'validated');
  if (joined.kind !== 'validated') return;
  assert.equal(joined.rows[0].chunk_id, ragChunks[0].chunk_id);
  assert.deepEqual(joined.rows[0].embedding, reply.data[1].embedding);
  assert.deepEqual(joined.rows[1].embedding, reply.data[0].embedding);
  assert.equal(joined.rows[0].model_key, ragEmbedding.modelKey);
  assert.equal(ragQueryRequest.model, ragEmbeddingRequest.model);
  assert.equal(ragQueryRequest.dimensions, ragEmbeddingRequest.dimensions);
  for (const [index, chunk] of ragChunks.entries()) {
    assert.equal(ragEmbeddingRequest.input[index], ragNews.news[0].content.slice(chunk.char_start, chunk.char_end));
  }
  assert.deepEqual(Object.keys(ragEmbeddingRequest).sort(), ['dimensions', 'encoding_format', 'input', 'model']);
  assert.equal(ragContext.evidence[0].excerpt, ragChunks[1].excerpt);
});

test('an invalid embedding batch exposes no rows and the lesson follows the full-text branch', () => {
  const reply = ragExampleResponse(false);
  const malformed = [
    ragExampleResponse(true),
    { ...reply, model: 'different-model' },
    { ...reply, data: [reply.data[0], reply.data[0]] },
    { ...reply, data: [{ ...reply.data[0], index: 3 }, reply.data[1]] },
    { ...reply, data: [reply.data[0]] },
  ];
  for (const value of malformed) {
    assert.deepEqual(joinRagEmbeddings(value, ragChunks.map(chunk => chunk.chunk_id)), { kind: 'rejected' });
  }
  for (const scenario of ragScenarios) {
    const path = ragStoryPath(scenario.id);
    for (const [index, stage] of path.slice(1).entries()) {
      assert.ok(ragWorkflow.edges.some(edge => edge.from === path[index].id && edge.to === stage.id));
    }
  }
  assert.ok(!ragStoryPath('invalid').some(stage => stage.id === 'store'));
  assert.ok(!ragStoryPath('insufficient').some(stage => stage.id === 'generate'));
});
