import { pick, type Lang } from '../lib/curriculum';
import { diagramLines, diagramPalette, layoutFinanceDiagram, type FinanceDiagram } from '../lib/finance-diagrams';

export function FinanceDiagramSvg({ diagram, lang, prefix, active, route = [], onSelect, playing = false }: { diagram: FinanceDiagram; lang: Lang; prefix: string; active?: string; route?: string[]; onSelect?: (id: string) => void; playing?: boolean }) {
  const layout = layoutFinanceDiagram(diagram);
  const hasSelection = active !== undefined;
  const textStyle = { fontFamily: 'Arial, "Noto Sans TC", sans-serif' };
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${layout.width} ${layout.height}`} width={layout.width} height={layout.height} role={onSelect ? 'group' : 'img'} aria-label={pick(diagram.title, lang)} style={{ ...textStyle, display: 'block', maxWidth: '100%', height: 'auto' }}>
    <title>{pick(diagram.title, lang)}</title><desc>{lang === 'zh' ? '設計圖，並非真實執行。紫色虛線是有限補查；棕色是回退；紅色是停止。' : 'Design diagram, not a live run. Purple dashed arrows show bounded retry, amber shows fallback, and red shows stop paths.'}</desc>
    <defs><pattern id={`${prefix}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#dce4df"/></pattern>{Object.entries(diagramPalette).map(([kind, color]) => <marker key={kind} id={`${prefix}-${kind}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={color}/></marker>)}</defs>
    <rect width={layout.width} height={layout.height} fill="#fcfcf8"/><rect width={layout.width} height={layout.height} fill={`url(#${prefix}-grid)`}/>
    <text x="36" y="37" fill="#087f78" fontSize="12" letterSpacing="2">STOCK RESEARCH · {diagram.id.toUpperCase()} · DESIGN</text>
    <text x="36" y="72" fill="#082c38" fontSize="25" fontWeight="700">{pick(diagram.title, lang)}</text>
    {layout.edges.map(edge => {
      const onRoute = route.some((id, i) => id === edge.from && route[i + 1] === edge.to);
      const related = edge.from === active || edge.to === active;
      const emphasized = route.length ? onRoute : related;
      const label = diagramLines(pick(edge.label, lang), lang === 'zh' ? 12 : 23);
      const labelHeight = label.length * 16 + 12;
      return <g key={edge.index} opacity={hasSelection && !emphasized ? .26 : 1}>
        <path d={edge.path} fill="none" stroke={diagramPalette[edge.kind]} strokeWidth={emphasized ? 3.6 : 2} strokeDasharray={edge.kind === 'retry' ? '8 5' : undefined} markerEnd={`url(#${prefix}-${edge.kind})`} className={playing && onRoute ? 'fd-moving-edge' : undefined}/>
        <rect x={edge.labelX - 84} y={edge.labelY - labelHeight / 2} width="168" height={labelHeight} rx="7" fill="#fcfcf8" stroke={diagramPalette[edge.kind]} strokeOpacity=".23"/>
        <text x={edge.labelX} textAnchor="middle" fill={diagramPalette[edge.kind]} fontSize="12" fontWeight="600">{label.map((line, i) => <tspan key={i} x={edge.labelX} y={edge.labelY - (label.length - 1) * 8 + i * 16 + 4}>{line}</tspan>)}</text>
      </g>;
    })}
    {layout.nodes.map(node => {
      const selected = node.id === active;
      const visited = route.includes(node.id);
      const terminal = node.kind === 'end';
      const fill = selected ? '#dff2eb' : terminal ? '#f1f3f4' : '#fff';
      const stroke = selected || visited ? '#087f78' : '#8b9ea2';
      const lines = diagramLines(node.label, node.kind === 'decision' ? 22 : 29);
      return <g key={node.id} data-node-id={node.id} role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined} aria-label={node.label} aria-pressed={onSelect ? selected : undefined} onClick={onSelect ? () => onSelect(node.id) : undefined} onKeyDown={onSelect ? event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(node.id); } } : undefined} style={onSelect ? { cursor: 'pointer', outlineOffset: '6px' } : undefined}>
        <title>{`${node.label} · ${pick(node.detail, lang)}`}</title>
        {node.kind === 'decision' ? <polygon points={`${node.x + 140},${node.y} ${node.x + 280},${node.y + 56} ${node.x + 140},${node.y + 112} ${node.x},${node.y + 56}`} fill={fill} stroke={stroke} strokeWidth={selected ? 3 : 1.6}/> : <rect x={node.x} y={node.y} width="280" height="112" rx={terminal || node.kind === 'start' ? 38 : 12} fill={fill} stroke={stroke} strokeWidth={selected ? 3 : 1.6}/>}
        <text x={node.x + 140} textAnchor="middle" fill="#082c38" fontSize="14" fontWeight="600" pointerEvents="none">{lines.map((line, i) => <tspan key={i} x={node.x + 140} y={node.y + 56 - (lines.length - 1) * 10 + i * 20 + 4}>{line}</tspan>)}</text>
      </g>;
    })}
    <text x="36" y={layout.height - 22} fontSize="11" fill="#536b72">{lang === 'zh' ? '虛構教學設計 · 原截止及預算適用於所有重試 · 節點技術名稱保留英文' : 'Teaching design · retries retain the original deadline and budget · node names match the technical contracts'}</text>
  </svg>;
}
