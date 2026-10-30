import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createOfficeServer } from '../server.mjs';

const site = fileURLToPath(new URL('../site/', import.meta.url));
async function files(path, prefix = '') {
  const result = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) result.push(...await files(join(path, entry.name), name + '/'));
    else result.push(name);
  }
  return result;
}

test('office package serves every exported page and asset on Node without dependencies', async t => {
  const server = createOfficeServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const exported = await files(site);
  assert(exported.includes('index.html'));
  assert.equal(exported.filter(path => /^learn\/[^/]+\.html$/.test(path)).length, 13);
  assert.equal(exported.filter(path => /^junior-path\/labs\/[^/]+$/.test(path)).length, 6);
  for (const path of exported) {
    const response = await fetch(`${base}/${path}`);
    assert.equal(response.status, 200, path);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(join(site, path)), path);
  }
  for (const path of ['/', '/junior-path', '/junior-path/', '/hiring-readiness', '/finance-project', '/finance-project/', '/learn/rag-graphrag', '/settings', '/agent-lab/evals']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('content-type'), /text\/html/);
  }
  const home = await fetch(base + '/');
  for (const match of (await home.text()).matchAll(/(?:src|href)="(\/_next\/[^"?]+)/g)) {
    assert.equal((await fetch(base + match[1])).status, 200, match[1]);
  }
  const finance = await fetch(base + '/finance-project');
  const financeHtml = await finance.text();
  assert.match(financeHtml, /<title>香港財報分析項目/);
  assert.match(financeHtml, /\/app\/finance-project\/page-[^" ]+\.js/);
  const download = await fetch(base + '/junior-path/labs/python');
  assert.match(download.headers.get('content-type'), /text\/x-python/);
  assert.equal(download.headers.get('content-disposition'), 'attachment; filename="python.py"');
  assert.match(await download.text(), /def /);
  const head = await fetch(base + '/', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal((await fetch(base + '/unknown-page')).status, 404);
  assert.equal((await fetch(base + '/.env.lab')).status, 400);
  assert.equal((await fetch(base + '/%2e%2e%2fpackage.json')).status, 400);
  assert.equal((await fetch(base + '/%E0%A4%A')).status, 400);
  assert.equal((await fetch(base + '/', { method: 'POST' })).status, 405);
  const lab = await fetch(base + '/api/lab/health');
  assert.equal(lab.status, 503);
  assert.match((await lab.json()).detail, /separate Node 22, Python and Java/);
});
