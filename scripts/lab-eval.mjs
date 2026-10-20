import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
const config = existsSync('.env.lab') ? parseEnv(readFileSync('.env.lab', 'utf8')) : {};
const result = spawnSync('.venv/bin/python', ['-m', 'academy.evals', ...process.argv.slice(2)], {
  cwd: 'services/agent', env: { ...config, ...process.env }, stdio: 'inherit',
});
process.exit(result.status ?? 1);
