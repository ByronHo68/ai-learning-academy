// Deterministic teaching fixtures. No model, network or business actions run here.
export type VisualLesson = 'python' | 'backend' | 'model' | 'retrieval' | 'evaluation' | 'agent';

export function transformIntents(raw: string) {
  let rows: unknown;
  try { rows = JSON.parse(raw); }
  catch { return { failure: 1, error: 'JSONDecodeError', values: [] as string[], counts: {} as Record<string, number> }; }
  if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== 'object' || typeof row.intent !== 'string' || !row.intent.trim())) {
    return { failure: 2, error: 'ValueError', values: [] as string[], counts: {} as Record<string, number> };
  }
  const values = rows.map(row => row.intent.trim().toLowerCase());
  const counts: Record<string, number> = Object.create(null);
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return { failure: null, error: '', values, counts };
}

export const visualOrders = [
  { id: 'HK-1', owner: 'alice', status: 'dispatched' },
  { id: 'HK-2', owner: 'bob', status: 'pending' },
];

export function lookupOrder(orderId: string, trustedUser: string | null) {
  if (!trustedUser) return { status: 401, row: null, stoppedAt: 1 };
  const row = visualOrders.find(order => order.id === orderId && order.owner === trustedUser) ?? null;
  return { status: row ? 200 : 404, row, stoppedAt: row ? null : 3 };
}

export function inspectModel(kind: string) {
  if (kind === 'refusal') return { failure: 1, output: 'handoff', raw: 'refusal: "Cannot process this request"' };
  if (kind === 'broken') return { failure: 2, output: 'handoff', raw: '{"intent": "refund",' };
  if (kind === 'extra') return { failure: 3, output: 'handoff', raw: '{"intent":"refund", "order_id":"HK-1", "approved":true}' };
  return { failure: null, output: 'proposal', raw: '{"intent":"refund", "order_id":"HK-1"}' };
}

export const visualDocuments = [
  { id: 'returns-v2', tenant: 'shop-a', active: true, tags: ['refund', 'return', '退款', '退貨'], title: { zh: '退貨政策', en: 'Returns policy' } },
  { id: 'delivery-v1', tenant: 'shop-a', active: true, tags: ['delivery', 'shipping', '送貨', '運送'], title: { zh: '送貨政策', en: 'Delivery policy' } },
  { id: 'returns-v1', tenant: 'shop-a', active: false, tags: ['refund', '退款'], title: { zh: '過期退貨政策', en: 'Old returns policy' } },
  { id: 'private-v1', tenant: 'shop-b', active: true, tags: ['refund', 'delivery', '退款'], title: { zh: '其他商戶資料', en: 'Other tenant data' } },
];

export function retrieveDocuments(query: string, k: number) {
  const words = new Set(query.toLowerCase().match(/[a-z]+/g) ?? []);
  const score = (tags: string[]) => tags.filter(tag => [...tag].every(char => char.charCodeAt(0) < 128) ? words.has(tag) : query.includes(tag)).length;
  const ranked = visualDocuments.filter(doc => doc.tenant === 'shop-a' && doc.active)
    .map(doc => ({ ...doc, score: score(doc.tags) }))
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return ranked.slice(0, Math.max(0, Math.floor(k)));
}

export const validationPoints = [
  { id: 'A', truth: 1, score: 0.9 },
  { id: 'B', truth: 1, score: 0.4 },
  { id: 'C', truth: 0, score: 0.6 },
  { id: 'D', truth: 0, score: 0.1 },
] as const;

export function evaluateThreshold(threshold: number) {
  const cells = { tp: [] as string[], fp: [] as string[], fn: [] as string[], tn: [] as string[] };
  for (const point of validationPoints) {
    const predicted = point.score >= threshold;
    cells[predicted ? (point.truth ? 'tp' : 'fp') : (point.truth ? 'fn' : 'tn')].push(point.id);
  }
  const { tp, fp, fn } = cells;
  const precision = tp.length + fp.length ? tp.length / (tp.length + fp.length) : 0;
  const recall = tp.length + fn.length ? tp.length / (tp.length + fn.length) : 0;
  return { cells, precision, recall, f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0 };
}

export function agentOutcome(kind: string, approved: boolean, requests = 1) {
  if (kind === 'forged' || kind === 'wrong-tool') return { status: 'denied', writes: 0, failure: 1 };
  if (!approved) return { status: 'awaiting_approval', writes: 0, failure: 2 };
  const ledger = new Map<string, string>();
  const key = 'alice:draft_case:HK-1:1';
  for (let request = 0; request < requests; request++) {
    if (!ledger.has(key)) ledger.set(key, `CASE-${ledger.size + 1}`);
  }
  return { status: ledger.get(key) ?? 'handoff', writes: ledger.size, failure: null };
}
