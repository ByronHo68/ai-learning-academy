import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { topics } from '../site/curriculum.js';
import { hiringCapstone, hiringSkills, hiringSources, hiringVerifiedAt, specialistTracks } from '../site/hiring-track.js';

test('hiring guides cover ten competencies with distinct bilingual daily examples',()=>{
  const expected=['problem-framing','software-engineering','ml-foundations','data-engineering','llm-rag','agent-design','evaluation','security','operations','communication'];
  assert.deepEqual(hiringSkills.map(skill=>skill.id),expected);
  assert.equal(new Set(hiringSkills.map(skill=>skill.id)).size,10);
  const stories={zh:new Set(),en:new Set()};
  for(const skill of hiringSkills){
    assert.equal(skill.dailyExamples.length,2,skill.id);
    assert.equal(skill.steps.length,3,skill.id);
    assert.equal(skill.evidence.length,2,skill.id);
    const copies=[skill.title,skill.explanation,skill.metaphorTitle,skill.metaphor,skill.example,skill.codeTitle,...skill.steps,...skill.evidence,skill.drill.task,skill.drill.pass,skill.interview.question,skill.interview.answer,...skill.dailyExamples.flatMap(example=>[example.title,example.story,example.connection])];
    for(const copy of copies)for(const lang of ['zh','en'])assert.ok(copy[lang].trim().length>0,`${skill.id}: missing ${lang}`);
    for(const example of skill.dailyExamples)for(const lang of ['zh','en']){
      assert.notEqual(example.story[lang],example.connection[lang]);
      stories[lang].add(example.story[lang]);
    }
    assert.ok(skill.explanation.en.length>180,skill.id);
    assert.ok(skill.code.includes('\n'),skill.id);
    assert.ok(['javascript','python','sql'].includes(skill.language.toLowerCase()),skill.id);
    if(skill.language.toLowerCase()==='javascript'){
      const run=spawnSync(process.execPath,['--input-type=module','--eval',skill.code],{encoding:'utf8',timeout:3000});
      assert.equal(run.status,0,`${skill.id}: ${run.stderr || run.error?.message}`);
    }
  }
  assert.equal(stories.zh.size,20);
  assert.equal(stories.en.size,20);
});

test('hiring lessons link to real topics and dated primary employer references',()=>{
  const ids=new Set(topics.map(topic=>topic.id));
  const sourceIds=new Set(hiringSources.map(source=>source.id));
  assert.equal(hiringSources.length,3);
  assert.equal(hiringVerifiedAt,'2026-10-09');
  for(const source of hiringSources){
    assert.equal(source.verifiedAt,hiringVerifiedAt);
    assert.equal(new URL(source.url).hostname,'job-boards.greenhouse.io');
    assert.ok(source.note.zh.length>20 && source.note.en.length>20);
  }
  for(const skill of hiringSkills){
    assert.ok(skill.topicIds.length>0 && skill.topicIds.every(id=>ids.has(id)),skill.id);
    assert.ok(skill.sourceIds.length>0 && skill.sourceIds.every(id=>sourceIds.has(id)),skill.id);
  }
  for(const track of specialistTracks)assert.ok(track.topicIds.length>0 && track.topicIds.every(id=>ids.has(id)));
});

test('capstone and optional specialist paths require demonstrable work rather than scores',()=>{
  assert.deepEqual(specialistTracks.map(track=>track.id),['deep-learning-cv','training-inference','research']);
  assert.equal(hiringCapstone.phases.length,4);
  assert.equal(hiringCapstone.deliverables.length,6);
  assert.equal(hiringCapstone.acceptance.length,4);
  const copies=[hiringCapstone.title,hiringCapstone.description,...hiringCapstone.phases,...hiringCapstone.deliverables,...hiringCapstone.acceptance,...specialistTracks.flatMap(track=>[track.title,track.explanation,track.evidence])];
  for(const copy of copies)for(const lang of ['zh','en'])assert.ok(copy[lang].trim().length>0);
  assert.match(JSON.stringify(specialistTracks),/OpenCV/);
  assert.match(JSON.stringify(hiringCapstone),/baseline/i);
  assert.match(JSON.stringify(hiringCapstone),/synthetic/i);
  assert.match(JSON.stringify(hiringCapstone),/rollback/i);
  assert.match(JSON.stringify(hiringSkills),/leakage/i);
  assert.match(JSON.stringify(hiringSkills),/precision[\s\S]*recall/i);
});

import { renderHiringContent, renderHiringBanner } from '../site/hiring-view.js';

test('both languages render all hiring examples, code, interviews, and real routes',()=>{
  for(const lang of ['zh','en']){
    const html=renderHiringContent(lang,'security');
    assert.equal((html.match(/class="hiring-skill"/g)||[]).length,10);
    assert.equal((html.match(/class="everyday-connection"/g)||[]).length,20);
    assert.equal((html.match(/class="code-example rich-code-example hiring-code"/g)||[]).length,10);
    assert.equal((html.match(/class="hiring-interview"/g)||[]).length,10);
    assert.equal((html.match(/tabindex="-1" open>/g)||[]).length,1);
    assert.ok(html.includes('id="hire-security" tabindex="-1" open>'));
    for(const skill of hiringSkills)assert.ok(html.includes('id="hire-'+skill.id+'"'));
    for(const source of hiringSources)assert.ok(html.includes('href="'+source.url+'"'));
    for(const id of new Set(hiringSkills.flatMap(skill=>skill.topicIds))){
      const topic=topics.find(item=>item.id===id);
      assert.ok(topic && html.includes('href="#/lesson/'+topic.slug+'"'));
    }
    assert.ok(html.includes('datetime="2026-10-09"'));
    assert.ok(html.includes('href="#/assessment"'));
    assert.ok(renderHiringBanner(lang).includes('href="#/hiring-readiness"'));
  }
});

test('plain hiring renderer safely escapes content and rejects unknown skill selection',()=>{
  const marker='<script>dangerous-example</script>';
  const example=hiringSkills[0].dailyExamples[0];
  const previous=example.story.en;
  try {
    example.story.en=marker;
    const html=renderHiringContent('en',marker);
    assert.ok(html.includes('&lt;script&gt;dangerous-example&lt;/script&gt;'));
    assert.ok(!html.includes(marker));
    assert.ok(html.includes('id="hire-problem-framing" tabindex="-1" open>'));
    assert.equal((html.match(/tabindex="-1" open>/g)||[]).length,1);
  } finally { example.story.en=previous; }
});

test('plain hiring route is discoverable without changing saved mastery or adding dependencies',async()=>{
  const app=await readFile(new URL('../site/app.js',import.meta.url),'utf8');
  const view=await readFile(new URL('../site/hiring-view.js',import.meta.url),'utf8');
  const html=await readFile(new URL('../site/index.html',import.meta.url),'utf8');
  assert.ok(app.includes('href="#/hiring-readiness"'));
  assert.ok(app.includes("current.path === '/hiring-readiness'"));
  assert.ok(app.includes('shell(renderHiringContent(state.lang, selectedSkill))'));
  assert.ok(app.includes('renderHiringBanner(state.lang)'));
  assert.ok(html.includes('href="/hiring.css"'));
  assert.ok(view.includes('not an automated hiring score'));
  assert.ok(view.includes('does not verify production ability or guarantee employment'));
  assert.doesNotMatch(view,/localStorage|setState\(|capstoneComplete|bestScore/);
});
