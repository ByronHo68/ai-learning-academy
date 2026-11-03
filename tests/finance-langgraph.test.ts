import assert from 'node:assert/strict';
import test from 'node:test';
import { financeGraphWalkthrough, financeGraphScenarios, type FinanceGraphNodeId } from '../lib/finance-langgraph';

test('code-only work validates and saves without retrieval or an answer-model call',()=>{
  const path=financeGraphWalkthrough('code');
  assert.ok(path.includes('facts') && path.includes('verify'));
  const skipped: FinanceGraphNodeId[]=['retrieve','route','draft','escalate'];
  for(const node of skipped) assert.ok(!path.includes(node));
  assert.equal(path.at(-1),'save');
});
test('missing evidence gets one retrieval refinement and never escalates or drafts',()=>{
  const path=financeGraphWalkthrough('missing');
  assert.equal(path.filter(x=>x==='refine').length,1);
  assert.equal(path.filter(x=>x==='retrieve').length,2);
  assert.ok(!path.includes('draft') && !path.includes('escalate'));
  assert.equal(path.at(-1),'save');
});
test('review pauses before saving; approval reauthorizes before new retrieval and rejection does not draft',()=>{
  assert.equal(financeGraphWalkthrough('review').at(-1),'review');
  const approved=financeGraphWalkthrough('review','approved');
  const resume=approved.indexOf('resume');
  assert.ok(resume>approved.indexOf('review'));
  assert.equal(approved[resume+1],'retrieve');
  assert.equal(approved.at(-1),'save');
  const rejected=financeGraphWalkthrough('review','rejected');
  assert.ok(!rejected.includes('draft'));
  assert.equal(rejected.at(-1),'save');
});
test('the escalation demonstration uses one stronger attempt through model policy before drafting again',()=>{
  const path=financeGraphWalkthrough('escalation');
  assert.equal(path.filter(x=>x==='escalate').length,1);
  const escalation=path.indexOf('escalate');
  assert.equal(path[escalation-1],'verify');
  assert.deepEqual(path.slice(escalation+1,escalation+4),['route','draft','verify']);
});
test('only the pending review demonstration remains paused; other scenarios terminate by saving',()=>{
  for(const scenario of financeGraphScenarios) if(scenario.id!=='review') assert.equal(financeGraphWalkthrough(scenario.id).at(-1),'save');
});
