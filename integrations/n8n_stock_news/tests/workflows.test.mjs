import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const {company,daily}=new Function(read('code/normalize.js')+'\nreturn {company,daily};')();
const {classify}=new Function(read('code/retry.js')+'\nreturn {classify};')();
const example=JSON.parse(read('examples/company-news.json'));
const normalized=example.news.map(n=>({...n,publishedAt:new Date(n.publishedAt).toISOString()}));
test('own MCP contract stays a three-item news array, including nullable fields',()=>{
  assert.deepEqual(company(example,'MSFT'),normalized);
  for(const wrapped of [{structuredContent:example},{content:[{type:'text',text:JSON.stringify(example)}]},
    {content:[{type:'text',text:example}]}]) assert.deepEqual(company(wrapped,'MSFT'),normalized);
  assert.equal(company({...example,news:[]},'MSFT').length,0);
  assert.equal(company({...example,news:[example.news[0]]},'MSFT').length,1);
});
test('deduplication, limit, newest order and basic privacy filtering',()=>{
  const n={...example.news[0],title:'Contact analyst@example.com',content:'Card 4111 1111 1111 1111',url:'https://example.com/a?utm_source=x'};
  const rows=company({...example,news:[...example.news,n,{...n,url:'https://example.com/a'}]},'MSFT');
  assert.equal(rows.length,3);
  const cleaned=company({...example,news:[n]},'MSFT')[0];
  assert.equal(cleaned.url,'https://example.com/a');
  assert.equal(cleaned.title,'Contact [EMAIL]');assert.ok(cleaned.content.includes('[CARD_OR_LONG_NUMBER]'));
});
test('wrong company, malformed schema and MCP errors fail closed',()=>{
  for (const bad of [{...example,symbol:'AAPL'},{symbol:'MSFT',news:{}},
    {...example,news:[{...example.news[0],publishedAt:'yesterday'}]},
    {...example,news:[{...example.news[0],summary:undefined}]},{isError:true,...example}]) {
    assert.throws(()=>company(bad,'MSFT'));
  }
});
test('Alpha Vantage empty feeds are valid but HTTP-200 quota and malformed data are errors',()=>{
  assert.deepEqual(daily({feed:[]},'economy_macro'),[]);
  assert.throws(()=>daily({Information:'quota exceeded',feed:[]},'economy_macro'));
  const rows=daily({feed:[{title:'Fictional fiscal event',summary:'Source excerpt',time_published:'20261116T080000',url:null}]},'economy_fiscal');
  assert.equal(rows[0].publishedAt,'2026-11-16T08:00:00.000Z');
  assert.equal(rows[0].topic,'economy_fiscal');
});
test('retry decisions cap attempts, honor Retry-After and reject permanent/unknown errors',()=>{
  const r=classify({statusCode:429,headers:{'retry-after':'10'}},1,100000,0);
  assert.equal(r.retry,true);assert.equal(r.delay_seconds,10);
  assert.equal(classify({statusCode:200,body:{feed:[]}},1,100000,0).retry,false);
  for(const [raw,attempt,deadline] of [[{statusCode:401},1,100000],[{statusCode:503},3,100000],
    [{statusCode:429,headers:{'retry-after':'999'}},1,100000],[{error:{message:'unknown'}},1,100000],
    [{statusCode:200},1,0]]) assert.throws(()=>classify(raw,attempt,deadline,0));
});
test('workflow exports have valid connections, disabled activation, no agent/LLM calls or automatic retries',()=>{
  for(const filename of readdirSync(new URL('workflows/',root))) {
    const w=JSON.parse(read('workflows/'+filename));const names=new Set(w.nodes.map(n=>n.name));
    assert.equal(w.active,false);assert.equal(w.settings.saveDataErrorExecution,'none');
    for(const [from,outputs] of Object.entries(w.connections)) {
      assert.ok(names.has(from));for(const group of outputs.main)for(const edge of group)assert.ok(names.has(edge.node));
    }
    for(const n of w.nodes) {
      assert.ok(!/agent|chatOpenRouter/i.test(n.type));assert.ok(!n.retryOnFail);
      if(n.type==='n8n-nodes-base.code') new Function(n.parameters.jsCode);
    }
  }
});
