import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { sources, topics, validateCurriculum } from '../lib/curriculum.ts';
import { conceptDetails } from '../lib/concepts.ts';
import type { Attempt } from '../lib/progress.ts';
import {
  createReviewItems, deriveStatus, emptyProgress, initialState,
  mergeProgress, normalizeAcademyState, scorePercent,
} from '../lib/progress.ts';

const projectRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');

test('all thirteen lesson contracts and 104 quiz questions validate',()=>{
  assert.deepEqual(validateCurriculum(),[]);
  assert.equal(topics.length,13);
  assert.equal(topics.reduce((total,topic)=>total+topic.quiz.length,0),104);
  for(const topic of topics){
    assert.equal(topic.quiz.length,8);
    assert.equal(topic.examples.length,5);
    assert.equal(new Set(topic.examples.map((item)=>item.role)).size,5);
    assert.ok(topic.visual.textAlternative.zh.length>20);
    assert.ok(topic.quiz.every((question)=>question.retryPrompt.zh!==question.prompt.zh));
    assert.ok(topic.quiz.every((question)=>question.options.every((option)=>option.feedback.zh.length>0)));
  }
});

test('all thirteen topics have three complete concept workshops',()=>{
  assert.deepEqual(Object.keys(conceptDetails).sort(),topics.map((topic)=>topic.id).sort());
  assert.equal(Object.values(conceptDetails).flat().length,39);
  for(const topic of topics){
    const details=conceptDetails[topic.id];
    assert.equal(details.length,3);
    for(const detail of details){
      assert.ok(detail.explanation.zh.length>30);
      assert.ok(detail.metaphor.zh.length>18);
      assert.ok(detail.example.zh.length>20);
      assert.equal(detail.steps.length,3);
      assert.ok(detail.code.includes('\n'));
    }
  }
});

test('80 percent mastery boundary uses seven of eight and every gate',()=>{
  const six:Attempt={at:'2026-09-04T00:00:00.000Z',score:6,total:8,missed:['t1-q1','t1-q2']};
  const seven:Attempt={at:'2026-09-04T00:00:00.000Z',score:7,total:8,missed:['t1-q1']};
  assert.equal(scorePercent(six),75);
  assert.equal(scorePercent(seven),88);
  const almost={...emptyProgress(),status:'in-progress' as const,recapReached:true,practiceComplete:true,latestScore:88,bestScore:88,attempts:[seven]};
  assert.equal(deriveStatus(almost),'in-progress');
  assert.equal(deriveStatus({...almost,remediated:['t1-q1']}),'mastered');
  assert.equal(mergeProgress(almost,{remediated:['t1-q1']}).status,'mastered');
  assert.equal(deriveStatus({...almost,bestScore:75,latestScore:75,remediated:['t1-q1','t1-q2'],attempts:[six]}),'needs-review');
});

test('review scheduling creates Day 1, 3, and 7 without deleting attempts',()=>{
  const attempt:Attempt={at:'2026-09-04T00:00:00.000Z',score:7,total:8,missed:['t3-q2']};
  const items=createReviewItems('t3',attempt,Date.parse(attempt.at));
  assert.deepEqual(items.map((item)=>item.day),[1,3,7]);
  assert.equal(Date.parse(items[2].dueAt)-Date.parse(attempt.at),7*86_400_000);
  assert.ok(items.every((item)=>item.done===false&&item.questionId==='t3-q2'));
});

test('versioned progress import deep-normalizes malformed and older v1 data',()=>{
  assert.equal(normalizeAcademyState({version:2}),null);
  const normalized=normalizeAcademyState({version:1,lang:'xx',topicProgress:{t1:{attempts:[{at:'bad',score:99,total:0,missed:'no'}]}},reviewQueue:[{bad:true}],safetyChecks:[true,'yes'],notes:{t1:'hello',unknown:'drop'}});
  assert.ok(normalized);
  assert.equal(normalized?.lang,'zh');
  assert.deepEqual(normalized?.topicProgress.t1.attempts,[]);
  assert.deepEqual(normalized?.safetyChecks,[true,false,false,false]);
  assert.deepEqual(normalized?.reviewQueue,[]);
  assert.equal(normalized?.notes.t1,'hello');
  assert.equal(normalized?.notes.unknown,undefined);
  assert.deepEqual(normalized?.cumulative,initialState().cumulative);
});

test('routes, remediation, animation accessibility, and local-only secrets contract exist',async()=>{
  const client=await readFile(resolve(projectRoot,'app/academy-client.tsx'),'utf8');
  const routes=['app/page.tsx','app/review/page.tsx','app/assessment/page.tsx','app/concept-map/page.tsx','app/glossary/page.tsx','app/settings/page.tsx','app/learn/[slug]/page.tsx'];
  await Promise.all(routes.map((route)=>readFile(resolve(projectRoot,route),'utf8')));
  for(const token of ['prefers-reduced-motion','useReducedMotion','AnimatePresence','ConceptWorkshop','prism-react-renderer','static-alternative','aria-live="polite"','question.remediationSectionId','Play','Pause','Replay','speed']) assert.ok(client.includes(token),`missing ${token}`);
  assert.ok(!client.includes('OPENAI_API_KEY'));
  assert.ok(!client.includes('sk-'));
});

test('every dated current block maps to a valid primary or standards source',()=>{
  const ids=new Set(sources.map((source)=>source.id));
  for(const topic of topics){
    assert.match(topic.current.verifiedAt,/^\d{4}-\d{2}-\d{2}$/);
    assert.ok(topic.current.sourceIds.length>0);
    assert.ok(topic.current.sourceIds.every((id)=>ids.has(id)));
  }
  for(const source of sources){
    const sourceUrl=source.url;
    if(sourceUrl) assert.doesNotThrow(()=>new URL(sourceUrl));
  }
});
