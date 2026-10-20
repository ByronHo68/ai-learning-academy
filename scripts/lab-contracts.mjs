import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { compile } from 'json-schema-to-typescript';

const schema = JSON.parse(execFileSync('services/agent/.venv/bin/python', ['-c', `
import json
from academy.models import Health, Run, RunIndex, EvalReport, EvalIndex
print(json.dumps({t.__name__:t.model_json_schema(mode="serialization") for t in [Health, Run, RunIndex, EvalReport, EvalIndex]}))
`], { env: { ...process.env, PYTHONPATH: 'services/agent' }, encoding: 'utf8' }));
// Compile a single umbrella schema to avoid repeated declarations of shared models.
const definitions = {};
for (const [name, value] of Object.entries(schema)) {
  const { $defs, ...root } = value;
  Object.assign(definitions, $defs);
  definitions[name] = root;
}
const all = { title: 'LabContracts', type: 'object', additionalProperties: false, required: Object.keys(schema),
  properties: Object.fromEntries(Object.keys(schema).map(name => [name, { $ref: `#/$defs/${name}` }])), $defs: definitions };
const source = await compile(all, 'LabContracts', { bannerComment: '/* Generated from Python Pydantic models. Run npm run lab:contracts; do not edit. */' });
const outputs = [['lib/lab-contracts.ts', source], ['lib/lab-schema.json', JSON.stringify(all, null, 2) + '\n']];
for (const [path, text] of outputs) {
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8') !== text) throw new Error(`${path} is stale. Run npm run lab:contracts.`);
  } else writeFileSync(path, text);
}
