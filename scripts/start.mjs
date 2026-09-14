import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nextCli = require.resolve('next/dist/bin/next');

console.log('Preparing AI Learning Academy…');
const build = spawnSync(process.execPath, [nextCli, 'build'], {
  stdio: 'inherit',
  env: process.env,
});

if (build.error) {
  console.error(build.error.message);
  process.exit(1);
}

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const server = spawn(process.execPath, [nextCli, 'start', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}

server.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
