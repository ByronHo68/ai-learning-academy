import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import { randomUUID } from 'node:crypto';

const root = process.cwd();
if (!existsSync('.env.lab') || !existsSync('services/bank/target/bank-1.0.0.jar') || !existsSync('services/agent/.venv/bin/python')) {
  throw new Error('Run npm run lab:setup first.');
}
const env = { ...parseEnv(readFileSync('.env.lab', 'utf8')), ...process.env };
const port = Number(env.LAB_WEB_PORT ?? 3000);
for (const number of [port, 8001, 8081]) {
  await new Promise((done, reject) => {
    const socket = createServer();
    socket.once('error', () => reject(new Error(`Port ${number} is already in use. Stop that lab instance, or set LAB_WEB_PORT for the website.`)));
    socket.listen(number, '127.0.0.1', () => socket.close(done));
  });
}
const processes = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of processes) child.kill('SIGTERM');
  const timer = setTimeout(() => { for (const child of processes) child.kill('SIGKILL'); process.exit(code); }, 5000);
  timer.unref();
  process.exitCode = code;
}
function start(command, args, cwd) {
  const child = spawn(command, args, { cwd, env, stdio: 'inherit' });
  processes.push(child);
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code ?? 1); });
  return child;
}
const java = env.JAVA_HOME ? resolve(env.JAVA_HOME, 'bin/java') : 'java';
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
start(java, ['-jar', 'target/bank-1.0.0.jar'], resolve(root, 'services/bank'));
start(resolve(root, 'services/agent/.venv/bin/python'), ['-m', 'uvicorn', 'academy.api:create_app', '--factory', '--host', '127.0.0.1', '--port', '8001'], resolve(root, 'services/agent'));
console.log('Starting Python and Java; waiting for the MCP tools…');
let ready = false;
for (let attempt = 0; attempt < 30 && !stopping; attempt++) {
  try {
    const response = await fetch('http://127.0.0.1:8001/health', {
      headers: { Authorization: `Bearer ${env.LAB_AUTH_TOKEN}`, 'X-Lab-Session': randomUUID() },
      signal: AbortSignal.timeout(2000),
    });
    if (response.ok && (await response.json()).bank_connected) { ready = true; break; }
  } catch { /* Services are still starting. */ }
  await delay(1000);
}
if (ready && !stopping) {
  start(process.execPath, [resolve(root, 'node_modules/next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', String(port)], root);
  console.log(`Agent lab: http://127.0.0.1:${port}/agent-lab\nCtrl+C stops all three services.`);
} else if (!stopping) {
  console.error('Python or Java did not become ready. Check the service output above.');
  stop(1);
}
