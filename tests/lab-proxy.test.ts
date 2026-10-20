import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { GET, POST } from '../app/api/lab/[...path]/route';

test('proxy preserves browser origin, isolates signed sessions, and rejects cross-origin requests', async () => {
  const sessions: string[] = [];
  const original = { ...process.env };
  const backend = createServer((request, response) => {
    assert.equal(request.headers.authorization, 'Bearer ' + 'test-service-token'.repeat(3));
    const session = request.headers['x-lab-session'];
    assert.equal(typeof session, 'string');
    if (typeof session === 'string') sessions.push(session);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
  });
  backend.listen(0, '127.0.0.1');
  await once(backend, 'listening');
  const address = backend.address();
  assert(address && typeof address === 'object');
  process.env.LAB_AUTH_TOKEN = 'test-service-token'.repeat(3);
  process.env.AGENT_API_URL = `http://127.0.0.1:${address.port}`;
  process.env.LAB_LOCAL_MODE = 'true';
  const context = { params: Promise.resolve({ path: ['runs'] }) };
  const request = (origin: string, cookie?: string) => new NextRequest('http://localhost:3102/api/lab/runs', {
    method: 'POST', body: JSON.stringify({ question: 'Balance?' }),
    headers: { Host: '127.0.0.1:3102', Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
  });
  try {
    const first = await POST(request('http://127.0.0.1:3102'), context);
    assert.equal(first.status, 200);
    const cookie = first.headers.get('set-cookie')?.split(';')[0];
    assert(cookie);
    assert.match(first.headers.get('set-cookie') ?? '', /httponly/i);
    assert.equal((await POST(request('http://127.0.0.1:3102', cookie), context)).status, 200);
    assert.equal(sessions[0], sessions[1]);
    assert.equal((await POST(request('https://evil.example', cookie), context)).status, 403);
    assert.equal((await POST(request('not-a-url', cookie), context)).status, 403);
    process.env.LAB_LOCAL_MODE = 'false';
    delete process.env.LAB_ACCESS_CODE;
    assert.equal((await GET(new NextRequest('http://localhost:3102/api/lab/health'),
      { params: Promise.resolve({ path: ['health'] }) })).status, 401);
    const forged = cookie.replace(/.$/, value => value === 'a' ? 'b' : 'a');
    assert.equal((await POST(request('http://127.0.0.1:3102', forged), context)).status, 401);
    assert.equal(sessions.length, 2);
  } finally {
    for (const key of ['LAB_AUTH_TOKEN', 'AGENT_API_URL', 'LAB_LOCAL_MODE', 'LAB_ACCESS_CODE']) {
      if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key];
    }
    backend.closeAllConnections();
    await new Promise<void>(resolve => backend.close(() => resolve()));
  }
});
