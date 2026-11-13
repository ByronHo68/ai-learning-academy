import type { Copy } from './curriculum';
import { financeGraphNodes } from './finance-graph';
import { financePreparationNodes } from './finance-evidence';
import { financeFunctions, financeEngineeringWorkflows } from './finance-project';
import { financeFunctionRoutes, type FinanceFunctionId, type FinanceRouteKind } from './finance-workflows';

const t = (en: string, zh: string): Copy => ({ en, zh });
export type DiagramNode = { id: string; label: string; detail: Copy };
export type DiagramEdge = { from: string; to: string; label: Copy; detail: Copy; kind: FinanceRouteKind };
export type FinanceDiagram = { id: string; title: Copy; nodes: DiagramNode[]; edges: DiagramEdge[] };

const edge = (from: keyof typeof financeGraphNodes, to: keyof typeof financeGraphNodes, en: string, zh: string, kind: FinanceRouteKind = 'flow'): DiagramEdge => ({ from, to, label: t(en, zh), detail: financeGraphNodes[to].how, kind });

export const financeOverallDiagram: FinanceDiagram = {
  id: 'overall', title: t('One question → one evidence-backed report', '一條問題 → 一份有證據報告'),
  nodes: [...Object.entries(financeGraphNodes).map(([id, node]) => ({ id, label: node.label.replace(' → END', ''), detail: node.how })), ...financePreparationNodes],
  edges: [
    edge('scope', 'refresh', 'Supported', '範圍符合'),
    edge('scope', 'clarify', 'Ambiguous', '不明確', 'stop'),
    edge('scope', 'irrelevant', 'Unrelated', '不相關', 'stop'),
    edge('refresh', 'snapshot', 'n8n receipt ready', 'n8n 紀錄就緒'),
    edge('snapshot', 'retrieve', 'Evidence versions pinned', '證據版本已固定'),
    edge('snapshot', 'insufficient', 'Required context missing', '缺少所需背景', 'stop'),
    edge('snapshot', 'unavailable', 'Snapshot storage failed', '快照儲存失敗', 'stop'),
    edge('refresh', 'insufficient', 'Only stale news', '只有過期新聞', 'stop'),
    edge('refresh', 'unavailable', 'Refresh failed', '刷新失敗', 'stop'),
    edge('retrieve', 'rerank', 'Admitted hybrid', '已准入混合'),
    edge('retrieve', 'review', 'Full-text default', '預設全文搜尋'),
    edge('retrieve', 'unavailable', 'PostgreSQL unavailable', 'PostgreSQL 中斷', 'stop'),
    edge('retrieve', 'fallback', 'Vector path fails', '向量路徑失敗', 'fallback'),
    edge('rerank', 'review', 'Ranked passages', '已排序原文'),
    edge('rerank', 'fallback', 'Reranker fails', '重排失敗', 'fallback'),
    edge('fallback', 'review', 'Sparse works', 'Sparse 可用', 'fallback'),
    edge('fallback', 'unavailable', 'Sparse also fails', 'Sparse 亦失敗', 'stop'),
    edge('review', 'selection', 'Automatic / submitted review', '自動／已提交覆核'),
    edge('review', 'review_expired', 'Review window expired', '覆核期已過', 'stop'),
    edge('selection', 'gate', 'Valid selection revision', '選取版本有效'),
    edge('selection', 'review_expired', 'Expired before resume', '恢復前已過期', 'stop'),
    edge('selection', 'unavailable', 'Selection storage failed', '選取儲存失敗', 'stop'),
    edge('gate', 'refine', 'Gap + budget left', '有缺口＋餘額', 'retry'),
    edge('refine', 'retrieve', 'Search 2 of 2', '第 2／2 次搜尋', 'retry'),
    edge('gate', 'insufficient', 'Still insufficient', '仍不足', 'stop'),
    edge('gate', 'context', 'Enough support', '支持足夠'),
    edge('context', 'insufficient', 'Trimming loses support', '裁剪後支持不足', 'stop'),
    edge('context', 'generate', 'Context ready', '上下文就緒'),
    edge('context', 'unavailable', 'Deadline reached', '到達時限', 'stop'),
    edge('generate', 'validate', 'Draft ready', '草稿就緒'),
    edge('generate', 'unavailable', 'Model / schema error', '模型／格式錯誤', 'stop'),
    edge('validate', 'blocked', 'Invalid support', '支持無效', 'stop'),
    edge('validate', 'save', 'All checks pass', '檢查通過'),
    edge('save', 'answer', 'Persisted result', '已保存結果'),
    edge('save', 'unavailable', 'Save failed', '保存失敗', 'stop'),
    { from: 'daily', to: 'global_news', label: t('Daily, configured timezone', '每日，已設定時區'), detail: financePreparationNodes[0].detail, kind: 'flow' },
    { from: 'global_news', to: 'evidence_pool', label: t('Commit completed batches', '提交完整批次'), detail: financePreparationNodes[1].detail, kind: 'flow' },
    { from: 'global_news', to: 'daily_failure', label: t('n8n retries exhausted', 'n8n 重試已用完'), detail: financePreparationNodes[4].detail, kind: 'stop' },
    { from: 'daily_failure', to: 'evidence_pool', label: t('Prior batch + failure status', '舊批次＋失敗狀態'), detail: financePreparationNodes[4].detail, kind: 'fallback' },
    { from: 'profiles', to: 'evidence_pool', label: t('Sourced profile versions', '附來源背景版本'), detail: financePreparationNodes[2].detail, kind: 'flow' },
    { from: 'evidence_pool', to: 'snapshot', label: t('Read eligible versions', '讀取合資格版本'), detail: financePreparationNodes[3].detail, kind: 'flow' },
  ],
};

export function financeFunctionDiagram(id: FinanceFunctionId): FinanceDiagram {
  const guide = [...financeFunctions, ...financeEngineeringWorkflows].find(item => item.id === id);
  if (!guide) throw new Error(`Missing function guide: ${id}`);
  const routes = financeFunctionRoutes[id];
  const names = [...new Set(routes.flatMap(route => [route.from, route.to]))];
  return {
    id, title: guide.title,
    nodes: names.map(name => ({ id: name, label: name, detail: guide.purpose })),
    edges: routes.map(route => ({ from: route.from, to: route.to, label: route.label, kind: route.kind, detail: t(`${route.when.en} Handoff: ${route.payload.en}`, `${route.when.zh} 交接資料：${route.payload.zh}`) })),
  };
}

export const financeDiagramIds: Array<'overall' | FinanceFunctionId> = ['overall', ...financeFunctions.map(item => item.id), ...financeEngineeringWorkflows.map(item => item.id)];
export const financeDiagrams = financeDiagramIds.map(id => id === 'overall' ? financeOverallDiagram : financeFunctionDiagram(id));

export const financeRetryRules = [
  { title: t('n8n retries news providers', 'n8n 重試新聞供應商'), body: t('One logical company refresh per run. n8n owns up to 3 transient provider attempts, with 1s then 2s backoff plus jitter. Clip each 10s attempt to the proposed 25s acquisition budget and the original run deadline. A host timeout triggers receipt reconciliation, not blind resubmission. Daily acquisition uses the same policy with its own job deadline.', '每次任務一次邏輯公司刷新。n8n 最多嘗試供應商 3 次，等待 1 秒、2 秒加 jitter；每次 10 秒受建議 25 秒抓取預算及原任務時限限制。Host 超時先核對紀錄，不盲目再發送；每日抓取同樣有限重試，但使用獨立工作時限。') },
  { title: t('Refine a weak search', '補查不足證據'), body: t('At most one refined query: two searches total, including failures. Keep the company, original question, snapshot and remaining active budget. If evidence is still weak, return insufficient evidence.', '最多一次修正查詢，包含失敗總共兩次搜尋。保留公司、原問題、快照及剩餘處理預算；仍不足就回傳證據不足。') },
  { title: t('Fall back after a component failure', '元件失敗時回退'), body: t('Use working sparse evidence when the vector/reranker path fails. Stay inside the same budget. If PostgreSQL is down, both retrieval paths fail: report unavailable; an outage is not “no news”.', '向量／重排路徑失敗時用仍可用的 sparse，維持原預算。PostgreSQL 中斷則兩條檢索路徑均失敗，回服務不可用；故障不等於「沒有新聞」。') },
  { title: t('Resume an interrupted run', '恢復中斷任務'), body: t('Authenticate the owner and resume the same PostgreSQL checkpoint. Completed retrieval stays completed; an interrupted review node restarts at its beginning. Only explicit review wait pauses the 60s active budget. Persist the remainder and all counters; edits and refinement never extend the first-pause 15-minute review expiry. Crash recovery and network waits still consume active time.', '驗證擁有者並恢復同一 PostgreSQL checkpoint。已完成檢索不重做；中斷覆核節點從頭重跑。只有刻意覆核等待暫停 60 秒處理預算；保存餘額及全部計數，編輯或補查不延長首次暫停起 15 分鐘期限。故障恢復及網絡等待仍計處理時間。') },
  { title: t('Stop when a retry would be misleading', '不能靠重試解決就停止'), body: t('Irrelevant prompts, failed authorization and invalid citations do not trigger automatic retries. There is one news refresh per new accepted prompt, and no automatic draft-repair loop in this design.', '不相關問題、授權失敗及無效引用不會自動重試。每個新接納問題只刷新新聞一次；此設計沒有自動修補草稿迴圈。') },
];

export const diagramPalette = {
  flow: '#087f78', retry: '#7251a1', fallback: '#9b641b', stop: '#b64a4a',
};

export type PlacedNode = DiagramNode & { x: number; y: number; rank: number; kind: 'start' | 'decision' | 'work' | 'end' };
export const diagramNodeSize = { width: 280, height: 112 };

export function layoutFinanceDiagram(diagram: FinanceDiagram) {
  const ids = new Set(diagram.nodes.map(node => node.id));
  if (ids.size !== diagram.nodes.length || !diagram.nodes.length) throw new Error(`Invalid nodes in ${diagram.id}`);
  for (const edge of diagram.edges) if (!ids.has(edge.from) || !ids.has(edge.to)) throw new Error(`Dangling edge in ${diagram.id}`);
  const backEdges = new Set<number>();
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visit = (id: string) => {
    if (visited.has(id)) return;
    visiting.add(id);
    diagram.edges.forEach((edge, index) => {
      if (edge.from !== id) return;
      if (visiting.has(edge.to)) {
        if (edge.kind !== 'retry') throw new Error(`Unbounded cycle in ${diagram.id}`);
        backEdges.add(index);
      } else visit(edge.to);
    });
    visiting.delete(id);
    visited.add(id);
  };
  diagram.nodes.forEach(node => visit(node.id));
  const ranks = new Map(diagram.nodes.map(node => [node.id, 0]));
  for (let pass = 0; pass < diagram.nodes.length; pass++) {
    diagram.edges.forEach((edge, i) => {
      if (!backEdges.has(i)) ranks.set(edge.to, Math.max(ranks.get(edge.to) ?? 0, (ranks.get(edge.from) ?? 0) + 1));
    });
  }
  const layers = new Map<number, DiagramNode[]>();
  for (const node of diagram.nodes) {
    const rank = ranks.get(node.id) ?? 0;
    layers.set(rank, [...(layers.get(rank) ?? []), node]);
  }
  const columns = Math.max(...[...layers.values()].map(layer => layer.length));
  const longEdges = diagram.edges.map((edge, i) => !backEdges.has(i) && (ranks.get(edge.to) ?? 0) - (ranks.get(edge.from) ?? 0) > 1 ? i : -1).filter(i => i >= 0);
  const extraGutter = Math.max(0, longEdges.length * 24 - 100);
  const width = Math.max(900, columns * 360 + 360) + extraGutter;
  const nodes: PlacedNode[] = [];
  for (const [rank, layer] of layers) layer.forEach((node, column) => {
    const outgoing = diagram.edges.filter(edge => edge.from === node.id).length;
    nodes.push({ ...node, rank, x: (width - extraGutter - layer.length * 360) / 2 + column * 360 + 40, y: 130 + rank * 210,
      kind: outgoing > 1 ? 'decision' : rank === 0 ? 'start' : outgoing === 0 ? 'end' : 'work' });
  });
  const edges = diagram.edges.map((edge, i) => {
    const from = nodes.find(node => node.id === edge.from);
    const to = nodes.find(node => node.id === edge.to);
    if (!from || !to) throw new Error('Diagram endpoint not placed');
    const sx = from.x + 140, sy = from.y + 112, tx = to.x + 140, ty = to.y;
    if (backEdges.has(i)) {
      const lane = 65 + (i % 2) * 35;
      return { ...edge, index: i, path: `M ${from.x} ${from.y + 56} H ${lane} V ${to.y + 56} H ${to.x}`, labelX: 100, labelY: (from.y + to.y) / 2 + 56, loop: true };
    }
    if (to.rank - from.rank > 1) {
      const lane = width - 40 - longEdges.indexOf(i) * 24;
      const offset = 24 + (i % 3) * 14;
      return { ...edge, index: i, path: `M ${sx} ${sy} V ${sy + offset} H ${lane} V ${ty - offset} H ${tx} V ${ty}`, labelX: lane - 58, labelY: (sy + ty) / 2, loop: false };
    }
    const middle = (sy + ty) / 2;
    return { ...edge, index: i, path: `M ${sx} ${sy} C ${sx} ${middle}, ${tx} ${middle}, ${tx} ${ty}`, labelX: (sx + tx) / 2, labelY: middle, loop: false };
  });
  return { nodes, edges, width, height: 130 + Math.max(...ranks.values()) * 210 + 180 };
}

export function diagramLines(text: string, limit = 26): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && [...line, ...word].length + 1 > limit) { lines.push(line); line = ''; }
    if ([...word].length > limit) {
      if (line) { lines.push(line); line = ''; }
      const chars = [...word];
      while (chars.length > limit) lines.push(chars.splice(0, limit).join(''));
      line = chars.join('');
    } else line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line);
  return lines;
}

export function financeDiagramMermaid(diagram: FinanceDiagram, lang: 'en' | 'zh'): string {
  const names = new Map(diagram.nodes.map((node, i) => [node.id, `n${i}`]));
  const quote = (text: string) => text.replaceAll('"', '&quot;');
  return ['flowchart TD', ...diagram.nodes.map(node => `  ${names.get(node.id)}["${quote(node.label)}"]`), ...diagram.edges.map(edge => `  ${names.get(edge.from)} ${edge.kind === 'retry' ? '-.' : '--'} "${quote(edge.label[lang])}" ${edge.kind === 'retry' ? '.->' : '-->'} ${names.get(edge.to)}`)].join('\n');
}
