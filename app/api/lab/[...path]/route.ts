import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const cookieName = 'academy-lab-session';

function equal(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sameOrigin(origin: string, host: string | null, protocol: string) {
  try {
    const parsed = new URL(origin);
    return parsed.host === host && parsed.protocol === protocol;
  } catch {
    return false;
  }
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const endpoint = path.join('/');
  const allowed = /^(health|runs|evals|runs\/[a-f0-9-]{36}(\/approval)?)$/;
  if (!allowed.test(endpoint)) return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  const token = process.env.LAB_AUTH_TOKEN;
  const base = process.env.AGENT_API_URL;
  if (!token || !base) return NextResponse.json({ detail: 'Start the services with npm run lab:start. See the setup guide below.' }, { status: 503 });
  if (request.method === 'POST') {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && !sameOrigin(origin, host, request.nextUrl.protocol)) {
      return NextResponse.json({ detail: 'Origin not allowed' }, { status: 403 });
    }
    if (!request.headers.get('content-type')?.startsWith('application/json')) return NextResponse.json({ detail: 'JSON required' }, { status: 415 });
  }
  const sign = (id: string) => createHmac('sha256', token).update(id).digest('hex');
  const [savedId = '', savedSignature = ''] = (request.cookies.get(cookieName)?.value ?? '').split('.');
  const authenticated = /^[a-f0-9-]{36}$/.test(savedId) && equal(sign(savedId), savedSignature);
  const local = process.env.LAB_LOCAL_MODE === 'true' && ['localhost', '127.0.0.1', '[::1]'].includes(request.nextUrl.hostname);
  if (!authenticated && !local) {
    const code = process.env.LAB_ACCESS_CODE;
    if (!code || !equal(request.headers.get('x-lab-access-code') ?? '', code)) {
      return NextResponse.json({ detail: 'Enter the private lab access code.' }, { status: 401 });
    }
  }
  const sessionId = authenticated ? savedId : randomUUID();
  try {
    const body = request.method === 'POST' ? await request.text() : undefined;
    if (body && body.length > 12_000) return NextResponse.json({ detail: 'Request too large' }, { status: 413 });
    const upstream = await fetch(`${base.replace(/\/$/, '')}/${endpoint}`, {
      method: request.method, body, cache: 'no-store', signal: AbortSignal.timeout(30_000),
      headers: { Authorization: `Bearer ${token}`, 'X-Lab-Session': sessionId, 'Content-Type': 'application/json' },
    });
    const response = new NextResponse(await upstream.text(), {
      status: upstream.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
    if (!authenticated) response.cookies.set(cookieName, `${sessionId}.${sign(sessionId)}`, {
      httpOnly: true, sameSite: 'strict', secure: request.nextUrl.protocol === 'https:', path: '/api/lab', maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    return NextResponse.json({ detail: 'Agent service is unavailable. Start or restart npm run lab:start.' }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
