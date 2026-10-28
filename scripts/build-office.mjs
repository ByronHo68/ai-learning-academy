import { cp, mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
  throw new Error('Rebuilding needs Node 22.13+. Running office/server.mjs only needs Node 18.18+.');
}
const workspace = await mkdtemp(join(tmpdir(), 'academy-office-build-'));
try {
  for (const name of ['app', 'lib', 'public', 'tsconfig.json', 'package.json', 'package-lock.json']) {
    await cp(join(root, name), join(workspace, name), { recursive: true });
  }
  await symlink(join(root, 'node_modules'), join(workspace, 'node_modules'), 'junction');
  await rm(join(workspace, 'app/api'), { recursive: true });
  for (const path of ['app/learn/[slug]/page.tsx', 'app/junior-path/labs/[id]/route.ts']) {
    const target = join(workspace, path);
    const content = await readFile(target, 'utf8');
    await writeFile(target, `export const dynamic = 'force-static';\nexport const dynamicParams = false;\n${content}`);
  }
  await writeFile(join(workspace, 'next.config.mjs'),
    "export default { output: 'export', poweredByHeader: false, images: { unoptimized: true } };\n");
  const result = spawnSync(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), 'build', '--webpack'], {
    cwd: workspace, stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Static build failed (${result.status}).`);
  const target = resolve(root, 'office/site');
  await rm(target, { recursive: true, force: true });
  await cp(join(workspace, 'out'), target, { recursive: true });
  await mkdir(join(target, 'docs/guide'), { recursive: true });
  await cp(join(root, 'docs/guide/ai-learning-roadmap-bilingual-quiz-guide.pdf'),
    join(target, 'docs/guide/ai-learning-roadmap-bilingual-quiz-guide.pdf'));
  const notices = ['Third-party licenses for the prebuilt office website\n'];
  for (const name of ['react', 'react-dom', 'next', 'lucide-react', 'motion', 'framer-motion',
    'motion-dom', 'motion-utils', 'prism-react-renderer', '@swc/helpers', 'scheduler']) {
    const directory = join(root, 'node_modules', name);
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isFile() && /^(license|licence|copying)/i.test(entry.name)) {
        notices.push(`\n===== ${name} / ${entry.name} =====\n${await readFile(join(directory, entry.name), 'utf8')}`);
      }
    }
  }
  await writeFile(join(root, 'office/THIRD_PARTY_NOTICES.txt'), notices.join('\n').replace(/\r\n/g, '\n'));
  const source = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
  await writeFile(join(root, 'office/build-info.json'), JSON.stringify({
    sourceCommit: source.stdout.trim(), buildNode: process.version,
    runtime: 'Node.js >=18.18.0; no npm dependencies',
    agentLab: 'The static office edition does not run the Python/Java agent services.',
  }, null, 2) + '\n');
  console.log('Office bundle ready. Run: cd office && npm start');
} finally {
  await rm(workspace, { recursive: true, force: true });
}
