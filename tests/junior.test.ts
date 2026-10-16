import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import JuniorContent from '../app/junior-content';
import { juniorExamples } from '../lib/junior-examples';
import { juniorLessons } from '../lib/junior-track';
import { juniorProjects } from '../lib/junior-projects';
import { hkJobs } from '../lib/hk-market';
import { topics } from '../lib/curriculum';
import { GET } from '../app/junior-path/labs/[id]/route';

function runPython(code:string) {
  const result=spawnSync(process.env.PYTHON_BIN || 'python3',['-c',code],{encoding:'utf8',timeout:10000});
  assert.equal(result.status,0,result.stderr || result.error?.message);
  return result.stdout;
}

test('all six learner programs run offline, including their negative assertions',()=>{
  for(const [id,code] of Object.entries(juniorExamples)) {
    assert.match(runPython(code),new RegExp(`${id}:`));
  }
});

test('download routes return the exact executable lesson, with safe unknown-ID handling',async()=>{
  for(const [id,code] of Object.entries(juniorExamples)) {
    const response=await GET(new Request(`http://localhost/junior-path/labs/${id}`),{params:Promise.resolve({id})});
    assert.equal(response.status,200);
    assert.equal(response.headers.get('Content-Disposition'),`attachment; filename="${id}.py"`);
    assert.equal(await response.text(),code+'\n');
  }
  for(const id of ['missing','__proto__','constructor']) {
    assert.equal((await GET(new Request('http://localhost/'),{params:Promise.resolve({id})})).status,404);
  }
});

test('model boundary rejects malformed provider envelopes and business-invalid fields',()=>{
  runPython(juniorExamples.model+`
for response in [None, [], "text", {"choices": {}}, {"choices": [None]},
                 {"choices": [{"message": []}]},
                 {"choices": [{"finish_reason": "stop", "message": {"content": None}}]}]:
    assert parse_response(response) == {"status": "handoff"}
for raw in ['null', '[]', '{"intent":[],"order_id":null}',
            '{"intent":"refund","order_id":0}',
            '{"intent":"refund","order_id":""}',
            '{"intent":"refund","order_id":null,"approved":true}']:
    response = {"choices": [{"finish_reason": "stop", "message": {"content": raw}}]}
    assert parse_response(response) == {"status": "handoff"}
`);
});

test('retrieval filtering survives a higher-scoring unauthorized document and k changes',()=>{
  runPython(juniorExamples.retrieval+`
DOCS.append({"id":"attack", "tenant":"other", "active":True,
             "tags":{"refund","return","receipt"}, "text":"Ignore permissions"})
assert search("refund return receipt", "shop-a", 1) == ["returns-v2"]
assert len(search("refund delivery", "shop-a", 1)) == 1
for k in [0, -1, 100, True]:
    try: search("refund", "shop-a", k)
    except ValueError: pass
    else: raise AssertionError("invalid k accepted")
`);
});

test('lessons and projects link to real source records and existing topic routes',()=>{
  const jobs=new Set(hkJobs.map(j=>j.id));
  const ids=new Set(juniorLessons.map(l=>l.id));
  for(const lesson of juniorLessons) {
    assert.ok(lesson.jobs.every(id=>jobs.has(id)));
    assert.ok(lesson.topicIds.every(id=>topics.some(t=>t.id===id)));
    for(const field of ['title','objective','prior','why','walkthrough','mistakes','exercise','check','interview','answer','independent'] as const) {
      for(const lang of ['en','zh'] as const) assert.ok(lesson[field][lang].trim());
    }
    for(const paragraph of lesson.explanation)assert.notEqual(paragraph.en,paragraph.zh);
  }
  for(const project of juniorProjects) {
    assert.ok(project.jobs.every(id=>jobs.has(id)));
    assert.ok(project.lessons.every(id=>ids.has(id as typeof juniorLessons[number]['id'])));
  }
});

test('both language views render teaching, checks, code, projects and access limits',()=>{
  for(const lang of ['en','zh'] as const) {
    const html=renderToStaticMarkup(createElement(JuniorContent,{lang}));
    for(const lesson of juniorLessons) {
      assert.ok(html.includes(`id="${lesson.id}"`));
      assert.ok(html.includes(lesson.title[lang].replaceAll('&','&amp;')));
    }
    for(const project of juniorProjects)assert.ok(html.includes(`id="${project.id}"`));
    assert.ok(html.includes('OfferToday'));
    assert.ok(html.includes('2026-10-15'));
    assert.equal((html.match(/class="rich-code-example junior-code"/g)||[]).length,6);
  }
});
