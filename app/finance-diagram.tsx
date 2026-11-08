'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Download, Maximize2, Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { pick, type Lang } from '../lib/curriculum';
import { layoutFinanceDiagram, type FinanceDiagram } from '../lib/finance-diagrams';
import { financeGraphScenarios, financeScenarioPath, type FinanceGraphScenarioId } from '../lib/finance-graph';
import { FinanceDiagramSvg } from './finance-diagram-svg';

export function FinanceDiagramCanvas({ diagram, lang }: { diagram: FinanceDiagram; lang: Lang }) {
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<string | undefined>();
  const [scenario, setScenario] = useState<'all' | FinanceGraphScenarioId>('all');
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const svgContainer = useRef<HTMLDivElement>(null);
  const prefix = useId().replaceAll(':', '');
  const layout = useMemo(() => layoutFinanceDiagram(diagram), [diagram]);
  const path = useMemo(() => scenario === 'all' ? [] : financeScenarioPath(scenario), [scenario]);
  const active = selected ?? path[position];
  const node = diagram.nodes.find(item => item.id === active);
  const outgoing = diagram.edges.filter(edge => edge.from === active);
  const incoming = diagram.edges.filter(edge => edge.to === active);

  useEffect(() => {
    if (!canvas.current) return;
    canvas.current.scrollTo({ left: Math.max(0, (layout.width * zoom - canvas.current.clientWidth) / 2), top: 0 });
  }, [layout.width, zoom]);

  useEffect(() => {
    if (!playing || !path.length) return;
    const timer = window.setTimeout(() => {
      setPosition(previous => Math.min(previous + 1, path.length - 1));
      if (position + 1 >= path.length - 1) setPlaying(false);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [playing, path, position]);

  useEffect(() => {
    if (!canvas.current || !svgContainer.current) return;
    const placed = layout.nodes.find(item => item.id === active);
    if (!placed) return;
    const scale = svgContainer.current.clientWidth / layout.width;
    canvas.current.scrollTo({ top: Math.max(0, placed.y * scale - canvas.current.clientHeight / 3), left: Math.max(0, placed.x * scale - canvas.current.clientWidth / 3), behavior: 'instant' });
  }, [active, layout, scenario, zoom]);

  useEffect(() => {
    const stop = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', stop);
    return () => document.removeEventListener('visibilitychange', stop);
  }, []);

  function selectNode(id: string) { setSelected(id); setScenario('all'); setPlaying(false); }
  return <div className="fd-diagram">
    <div className="fd-toolbar"><div className="fd-zoom"><button type="button" onClick={() => setZoom(value => Math.max(.35, value - .2))} disabled={zoom <= .35} aria-label={lang === 'zh' ? '縮小圖表' : 'Zoom out diagram'}><ZoomOut size={17}/></button><span>{Math.round(zoom * 100)}%</span><button type="button" onClick={() => setZoom(value => Math.min(2, value + .2))} disabled={zoom >= 2} aria-label={lang === 'zh' ? '放大圖表' : 'Zoom in diagram'}><ZoomIn size={17}/></button><button type="button" onClick={() => { setZoom(1); canvas.current?.scrollTo({ top: 0, left: 0 }); }}><Maximize2 size={16}/>100%</button><button type="button" onClick={() => { if (canvas.current) setZoom(Math.max(.2, Math.min(1, canvas.current.clientWidth / layout.width))); }}>{lang === 'zh' ? '符合寬度' : 'Fit width'}</button></div><a href={`/downloads/finance-diagrams/${diagram.id}-${lang}.svg`} download><Download size={16}/>SVG</a><a href={`/downloads/finance-diagrams/${diagram.id}-${lang}.mmd`} download>Mermaid ↓</a></div>
    {diagram.id === 'overall' && <div className="fd-scenarios"><label htmlFor={`${prefix}-scenario`}>{lang === 'zh' ? '追蹤情境' : 'Trace a scenario'}</label><select id={`${prefix}-scenario`} value={scenario} onChange={event => { const next = financeGraphScenarios.find(item => item.id === event.target.value); setScenario(next?.id ?? 'all'); setSelected(undefined); setPosition(0); setPlaying(false); }}><option value="all">{lang === 'zh' ? '全部路徑' : 'All routes'}</option>{financeGraphScenarios.map(item => <option key={item.id} value={item.id}>{pick(item.title, lang)}</option>)}</select>{path.length > 0 && <><button type="button" onClick={() => { if (position === path.length - 1) setPosition(0); setPlaying(value => !value); }}>{playing ? <Pause size={15}/> : <Play size={15}/>} {playing ? lang === 'zh' ? '暫停' : 'Pause' : lang === 'zh' ? '播放路徑' : 'Play route'}</button><button type="button" disabled={position >= path.length - 1} onClick={() => { setPlaying(false); setPosition(value => value + 1); }}>{lang === 'zh' ? '下一步' : 'Next step'}</button><button type="button" onClick={() => { setPlaying(false); setPosition(0); }} aria-label={lang === 'zh' ? '重播情境' : 'Restart scenario'}><RotateCcw size={15}/></button><span>{position + 1}/{path.length}</span></>}</div>}
    <div className="fd-legend"><span data-kind="flow">{lang === 'zh' ? '繼續' : 'Continue'}</span><span data-kind="retry">{lang === 'zh' ? '有限重試／恢復' : 'Bounded retry / resume'}</span><span data-kind="fallback">{lang === 'zh' ? '回退' : 'Fallback'}</span><span data-kind="stop">{lang === 'zh' ? '停止／退出' : 'Stop / exit'}</span><small>{lang === 'zh' ? '◇ 決策　▢ 工作　▭ 開始／結束' : '◇ Decision　▢ Work　▭ Start / end'}</small></div>
    <div className="fd-workspace"><div className="fd-canvas" ref={canvas} tabIndex={0} aria-label={lang === 'zh' ? '可捲動工作流程圖' : 'Scrollable workflow diagram'}><div ref={svgContainer} style={{ width: `${layout.width * zoom}px` }}><FinanceDiagramSvg diagram={diagram} lang={lang} prefix={prefix} active={active} route={path.slice(0, position + 1)} onSelect={selectNode} playing={playing}/></div></div><aside className="fd-inspector" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
      <p className="eyebrow">{lang === 'zh' ? '點選節點閱讀' : 'SELECT A NODE'}</p><h4>{node?.label ?? (lang === 'zh' ? '順住箭嘴睇，遇到菱形就問「邊個條件？」' : 'Follow the arrows. A diamond asks which condition applies.')}</h4><p>{node ? pick(node.detail, lang) : lang === 'zh' ? '點節點查看交接資料及下一步。紫色回圈會回到較早一步，但不能重設預算。圖太大可縮放，或捲動檢視。' : 'Select a node for its data handoff and next step. A purple loop returns to earlier work without resetting the budget. Zoom or scroll to explore the diagram.'}</p>
      {node && <><button type="button" className="fd-clear" onClick={() => { setSelected(undefined); setScenario('all'); setPlaying(false); }}>{lang === 'zh' ? '顯示全部路徑' : 'Show all routes'}</button>{outgoing.map((edge, i) => <div className="fd-handoff" key={i}><button type="button" onClick={() => selectNode(edge.to)}>{pick(edge.label, lang)} → {edge.to}</button><p>{pick(edge.detail, lang)}</p></div>)}{outgoing.length === 0 && <p className="fd-end-note">{lang === 'zh' ? '此分支到此結束；不會自動循環。' : 'This branch ends here. It does not loop automatically.'}</p>}{incoming.length > 0 && <details><summary>{lang === 'zh' ? '由邊一步到達？' : 'Which steps lead here?'}</summary>{incoming.map((edge, i) => <p key={i}>{edge.from} → {pick(edge.label, lang)}</p>)}</details>}</>}
    </aside></div>
    <p className="fd-caption">{lang === 'zh' ? '離線設計圖，並非後端實際執行；動畫時間不代表真實延遲。節點名稱沿用技術合約，解說及條件提供雙語。' : 'Offline design diagram, not a backend execution. Animation timing is illustrative. Node names match the technical contracts; explanations and conditions are bilingual.'}</p>
  </div>;
}
