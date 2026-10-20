import Ajv from 'ajv';
import schema from './lab-schema.json';
import type { LabContracts } from './lab-contracts';

const ajv = new Ajv({ strict: false });
ajv.addSchema(schema, 'lab');

export async function labRequest<K extends keyof LabContracts>(
  name: K, path: string, options: { body?: unknown; accessCode?: string; signal?: AbortSignal } = {},
): Promise<LabContracts[K]> {
  const response = await fetch(`/api/lab/${path}`, {
    method: options.body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.accessCode ? { 'X-Lab-Access-Code': options.accessCode } : {}) },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });
  const value: unknown = await response.json();
  if (!response.ok) {
    const detail = typeof value === 'object' && value !== null && 'detail' in value && typeof value.detail === 'string' ? value.detail : `Request failed (${response.status})`;
    throw new Error(detail);
  }
  const validate = ajv.compile<LabContracts[K]>({ $ref: `lab#/$defs/${name}` });
  if (!validate(value)) throw new Error('The service returned an incompatible response. Update both services together.');
  return value;
}
