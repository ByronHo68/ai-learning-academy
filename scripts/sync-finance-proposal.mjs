import { mkdir, readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('docs/FINANCIAL_REPORT_DEVELOPMENT_PROPOSAL.md', root), 'utf8');
const headings = [...source.matchAll(/^## (\d+)\. (.+)$/gm)];
const sections = headings.map((heading, index) => ({
  id: `proposal-document-${heading[1]}`,
  title: `${heading[1]}. ${heading[2]}`,
  markdown: source.slice(heading.index + heading[0].length, headings[index + 1]?.index ?? source.length).trim(),
}));
if (sections.length !== 10) throw new Error('Expected ten proposal sections. Review the section split before generating.');
const outputs = [
  ['lib/finance-proposal-document.json', JSON.stringify(sections, null, 2) + '\n'],
  ['public/downloads/financial-report-development-proposal.md', source],
];
for (const [path, content] of outputs) {
  const target = new URL(path, root);
  if (process.argv.includes('--check')) {
    if (await readFile(target, 'utf8') !== content) throw new Error(`Stale ${path}. Run npm run proposal:sync.`);
  } else {
    await mkdir(new URL('./', target), { recursive: true });
    await writeFile(target, content);
  }
}
console.log(process.argv.includes('--check') ? 'Proposal assets match the Markdown source.' : 'Updated the proposal reader and Markdown download.');
