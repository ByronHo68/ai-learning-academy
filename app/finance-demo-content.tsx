'use client';

import Link from 'next/link';
import { useEffect, useReducer, useRef, useState } from 'react';
import { ArrowRight, Download, FileText, RotateCcw, Search, ShieldCheck } from 'lucide-react';
import { type Copy, type Lang, pick } from '../lib/curriculum';
import { financeCompanies } from '../lib/finance-project';
import {
  financeDemoAsOf, financeDemoExport, financeDemoProgress, financeDemoRatingRule, financeDemoReducer,
  financeDemoSamples, initialFinanceDemo,
  type FinanceDemoReport, type FinanceDemoScenario, type FinanceDemoSourceId, type FinanceDemoState,
} from '../lib/finance-demo';

const labels = {
  ready: { en: 'Choose a company and start', zh: '選公司，再開始研究' },
  retrieved: { en: 'Read the prepared sources', zh: '閱讀準備好的來源' },
  'needs-evidence': { en: 'The outlook evidence is missing', zh: '缺少盈利展望證據' },
  checked: { en: 'Evidence checks are complete', zh: '證據核對完成' },
  interrupted: { en: 'Research paused after the first search', zh: '第一次搜尋後，研究中斷' },
  draft: { en: 'Check the draft before release', zh: '發布前核對草稿' },
  result: { en: 'Your fictional research report', zh: '你的虛構研究報告' },
  'validation-failed': { en: 'The draft did not pass validation', zh: '草稿未通過驗證' },
} satisfies Record<FinanceDemoState['kind'], Copy>;

const phase = { ready: 0, retrieved: 1, 'needs-evidence': 1, checked: 2, interrupted: 1, draft: 3, result: 4, 'validation-failed': 3 } satisfies Record<FinanceDemoState['kind'], number>;
const steps = [
  { en: 'Company', zh: '選公司' }, { en: 'Evidence', zh: '找證據' },
  { en: 'Research', zh: '研究觀點' }, { en: 'Validate', zh: '驗證' }, { en: 'Report', zh: '報告' },
] satisfies Copy[];

function reportStance(report: FinanceDemoReport, lang: Lang): string {
  if (report.kind === 'insufficient') return lang === 'zh' ? '暫無評級' : 'No rating';
  if (report.stance === 'reduce') return lang === 'zh' ? 'Reduce · 減持研究觀點' : 'Reduce · research stance';
  return lang === 'zh' ? 'Hold · 持有研究觀點' : 'Hold · research stance';
}

export default function FinanceDemoContent({ lang }: { lang: Lang }) {
  const [state, dispatch] = useReducer(financeDemoReducer, initialFinanceDemo);
  const [inspected, setInspected] = useState<FinanceDemoSourceId | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const sourcePanel = useRef<HTMLDivElement>(null);
  const citationTrigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { if (state.kind !== 'ready') heading.current?.focus(); }, [state.kind]);
  const progress = financeDemoProgress(state);
  const company = financeCompanies.find(item => item.id === state.companyId);
  const report = state.kind === 'draft' || state.kind === 'result' ? state.report : null;
  const source = progress?.sources.find(item => item.id === inspected);
  const sample = financeDemoSamples.find(item => item.id === state.scenario);
  const selectScenario = (scenario: FinanceDemoScenario) => { setInspected(null); setDownloaded(false); dispatch({ type: 'select-scenario', scenario }); };
  const restart = () => { setInspected(null); setDownloaded(false); dispatch({ type: 'restart' }); };
  const inspect = (sourceId: FinanceDemoSourceId, trigger: HTMLButtonElement) => {
    citationTrigger.current = trigger;
    setInspected(sourceId);
    window.requestAnimationFrame(() => { sourcePanel.current?.focus(); sourcePanel.current?.scrollIntoView({ block: 'nearest' }); });
  };
  const download = () => {
    if (state.kind !== 'result') return;
    const url = URL.createObjectURL(new Blob([financeDemoExport(state, lang)], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.companyId.toLowerCase()}-fictional-research-${lang}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setDownloaded(true);
  };

  return <main className="utility-page finance-demo-page">
    <header className="utility-hero fd-hero">
      <Link href="/finance-project" className="fd-back">← {lang === 'zh' ? '返回股票研究項目' : 'Back to the stock research project'}</Link>
      <p className="eyebrow">STOCK RESEARCH ASSISTANT · OFFLINE WALKTHROUGH</p>
      <h1>{lang === 'zh' ? '試一次：由公司走到有來源報告' : 'Try it: from a company to a sourced report'}</h1>
      <p>{lang === 'zh' ? '選公司、讀消息、理解可能影響，再核對研究觀點。切換情境，看看資料不足、惡意指令及中斷時點樣處理。' : 'Choose a company, read the news and its possible impact, then check a research stance. Explore missing evidence, injected instructions and interrupted research.'}</p>
      <div className="fd-notice"><ShieldCheck size={24} aria-hidden="true"/><div><strong>{lang === 'zh' ? '全部消息、事件及評級均為虛構' : 'All news, events and ratings are fictional'}</strong><p>{lang === 'zh' ? 'Microsoft、Apple、NVIDIA 只展示首版支援名單。此頁沒有搜尋即時新聞、執行 Python／LangGraph、呼叫模型或發出投資建議。示範文字及工具事件預先準備。' : 'Microsoft, Apple and NVIDIA demonstrate the proposed supported list. This page does not search live news, run Python/LangGraph, call a model or give an investment recommendation. Text and tool events are prepared fixtures.'}</p></div></div>
    </header>

    <section className="fd-controls" aria-labelledby="fd-controls-title">
      <div className="fd-control-heading"><h2 id="fd-controls-title">{lang === 'zh' ? '選擇教學情境' : 'Choose a teaching scenario'}</h2><button type="button" className="fd-secondary" onClick={restart}><RotateCcw size={16} aria-hidden="true"/>{lang === 'zh' ? '重試此情境' : 'Restart this case'}</button></div>
      <label className="fd-company-label">{lang === 'zh' ? '公司（只作選單示範）' : 'Company (selector demonstration only)'}<select value={state.companyId} onChange={event => { const next = financeCompanies.find(item => item.id === event.target.value); if (next) { setInspected(null); setDownloaded(false); dispatch({ type: 'select-company', companyId: next.id }); } }}>{financeCompanies.map(item => <option key={item.id} value={item.id}>{item.id} · {item.name}</option>)}</select></label>
      <div className="fd-samples" role="group" aria-label={lang === 'zh' ? '研究情境' : 'Research scenario'}>{financeDemoSamples.map(item => <button type="button" key={item.id} aria-pressed={state.scenario === item.id} onClick={() => selectScenario(item.id)}><strong>{pick(item.title, lang)}</strong><span>{pick(item.detail, lang)}</span></button>)}</div>
    </section>

    <ol className="fd-progress" aria-label={lang === 'zh' ? '示範進度' : 'Demonstration progress'}>{steps.map((item, index) => <li key={item.en} data-current={phase[state.kind] === index} data-done={phase[state.kind] > index}><span>{index + 1}</span><b>{pick(item, lang)}</b></li>)}</ol>

    <div className="fd-workspace">
      <section className="fd-task" aria-labelledby="fd-task-title">
        <div className="fd-task-heading"><p className="eyebrow">{state.companyId} · {sample ? pick(sample.title, lang) : ''} · FICTIONAL</p><h2 id="fd-task-title" ref={heading} tabIndex={-1}>{pick(labels[state.kind], lang)}</h2></div>

        {state.kind === 'ready' && <div className="fd-welcome"><Search size={34} aria-hidden="true"/><h3>{lang === 'zh' ? '消息點解重要？會點影響研究觀點？' : 'Why does the news matter to the research case?'}</h3><p>{lang === 'zh' ? '示例會同時展示支持理由、風險、來源同不確定因素。評級只使用已定義的教學規則，不會憑空產生目標價。' : 'The sample shows supporting evidence, risks, sources and uncertainty together. A defined teaching rule determines the stance, without inventing a target price.'}</p><button type="button" className="fd-primary" onClick={() => dispatch({ type: 'retrieve' })}>{lang === 'zh' ? '開始模擬研究' : 'Start simulated research'}<ArrowRight size={17} aria-hidden="true"/></button></div>}

        {state.kind === 'interrupted' && <div className="fd-callout"><h3>{lang === 'zh' ? '第一次搜尋已完成，毋須重做' : 'The first search is already complete'}</h3><p>{lang === 'zh' ? '來源及搜尋次數保存在本頁記憶體快照。按繼續，觀察工具記錄只增加恢復事件；重新載入頁面會清除此示範進度。真實應用才使用 SQLite 持久檢查點。' : 'The sources and search count remain in this page’s memory snapshot. Resume adds a recovery event without repeating the search. Reloading clears this simulation; the proposed app uses durable SQLite checkpoints.'}</p><button type="button" className="fd-primary" onClick={() => dispatch({ type: 'resume' })}>{lang === 'zh' ? '從模擬檢查點繼續' : 'Resume simulated checkpoint'}</button></div>}

        {state.kind === 'needs-evidence' && <div className="fd-callout"><h3>{lang === 'zh' ? '先補資料，暫時唔評級' : 'Fill the evidence gap before rating'}</h3><p>{lang === 'zh' ? '訂單及成本範例齊備，但缺少盈利展望。Agent 應修改查詢，最多補查一次；仍不足就清楚交代限制。' : 'Orders and costs are available, but the earnings outlook is missing. The agent should refine its query once, then state the limitation if evidence remains insufficient.'}</p><button type="button" className="fd-primary" onClick={() => dispatch({ type: 'refine' })}>{lang === 'zh' ? '補查一次（最後一次）' : 'Search once more (final attempt)'}</button></div>}

        {(state.kind === 'retrieved' || state.kind === 'checked') && <div className="fd-step-explanation"><p>{state.kind === 'retrieved' ? lang === 'zh' ? '先核對公司、日期及來源內容。新聞中的文字不能修改系統指令、讀取秘密或自行改變評級規則。' : 'Check company, dates and source content first. Article text cannot change system instructions, access secrets or rewrite rating rules.' : lang === 'zh' ? '來源核對完成。教學規則要求訂單、成本及展望三類證據；缺少其中一類就返回無評級。' : 'Source checks are complete. The teaching rule requires orders, costs and outlook evidence; a missing category returns no rating.'}</p><button type="button" className="fd-primary" onClick={() => dispatch({ type: state.kind === 'retrieved' ? 'check' : 'draft' })}>{state.kind === 'retrieved' ? lang === 'zh' ? '核對來源及證據' : 'Check sources and evidence' : lang === 'zh' ? '建立報告草稿' : 'Create report draft'}<ArrowRight size={17} aria-hidden="true"/></button></div>}

        {report && <article className="fd-report" data-limited={report.kind === 'insufficient'}>
          <div className="fd-report-meta"><span>{state.kind === 'result' ? lang === 'zh' ? '已通過示例規則驗證' : 'Fixture rules validated' : lang === 'zh' ? '草稿 · 尚未驗證' : 'Draft · not yet validated'}</span><span>{financeDemoAsOf} · {lang === 'zh' ? '1–3 個月研究範圍' : '1–3 month research horizon'}</span></div>
          <p className="fd-report-company">{company?.name ?? state.companyId} · {state.companyId} · FICTIONAL</p>
          <h3>{reportStance(report, lang)}</h3><p className="fd-report-summary">{pick(report.summary, lang)}</p>
          <h4>{lang === 'zh' ? '相關消息、可能影響，同點解' : 'Related news, possible impact and why'}</h4>
          <div className="fd-news-list">{report.reasons.map(reason => { const item = progress?.sources.find(candidate => candidate.id === reason.sourceId); return <section className="fd-news-item" key={reason.sourceId}><h5>{item ? pick(item.headline, lang) : reason.sourceId}</h5><p>{pick(reason.text, lang)}</p>{item && <p className="fd-uncertainty"><b>{lang === 'zh' ? '仍有不確定因素：' : 'Uncertainty: '}</b>{pick(item.uncertainty, lang)}</p>}<button type="button" className="fd-citation" onClick={event => inspect(reason.sourceId, event.currentTarget)}>{lang === 'zh' ? '核對來源' : 'Check source'} · {reason.sourceId}</button></section>; })}</div>
          <div className="fd-watch"><h4>{lang === 'zh' ? '下一步留意咩？' : 'What should the research watch next?'}</h4><p>{pick(report.nextWatch, lang)}</p></div>
          <details className="fd-rating-rule"><summary>{lang === 'zh' ? '呢個示例點樣決定評級？' : 'How does this example decide the stance?'}</summary><p>{pick(financeDemoRatingRule, lang)}</p></details>
          {state.kind === 'draft' && <div className="fd-report-action"><button type="button" className="fd-primary" onClick={() => dispatch({ type: 'validate' })}><ShieldCheck size={17} aria-hidden="true"/>{lang === 'zh' ? '驗證引用及示例規則' : 'Validate citations and fixture rules'}</button><p>{lang === 'zh' ? '此示範檢查來源 ID、公司、日期、固定文字及教學規則，並非評估真實模型準確度。' : 'This checks source IDs, company, dates, prepared text and teaching rules. It does not measure real model accuracy.'}</p></div>}
          {state.kind === 'result' && <div className="fd-report-action"><button type="button" className="fd-primary" onClick={download}><Download size={17} aria-hidden="true"/>{lang === 'zh' ? '下載 Markdown 報告' : 'Download Markdown report'}</button><span role="status">{downloaded ? lang === 'zh' ? '已建立下載；檔案保留虛構標籤、日期及來源。' : 'Download created with fictional labels, dates and sources.' : lang === 'zh' ? '下載已有結果，不會產生模型用量。' : 'Export reuses the result with no model usage.'}</span></div>}
        </article>}

        {state.kind === 'validation-failed' && <div className="fd-callout" role="alert"><p>{pick(state.reason, lang)}</p><button type="button" className="fd-secondary" onClick={restart}>{lang === 'zh' ? '重新開始' : 'Start again'}</button></div>}

        {source && <div className="fd-source-panel" ref={sourcePanel} tabIndex={-1} aria-label={lang === 'zh' ? '來源原文' : 'Source excerpt'}><div className="fd-source-heading"><span><FileText size={16} aria-hidden="true"/>{source.id} · {source.publishedAt}</span><button type="button" className="fd-text-button" onClick={() => { setInspected(null); citationTrigger.current?.focus(); }}>{lang === 'zh' ? '關閉來源' : 'Close source'}</button></div><h3>{pick(source.headline, lang)}</h3><p>{pick(source.fact, lang)}</p><small>{lang === 'zh' ? '本機虛構來源，沒有外部新聞連結。真實版本會保存已核實來源網址及發布時間。' : 'Local fictional source, with no external news link. The real app preserves verified URLs and publication times.'}</small></div>}

        {progress && !report && <div className="fd-source-list"><h3>{lang === 'zh' ? '本次準備的來源' : 'Sources prepared for this case'}</h3>{progress.sources.map(item => <details key={item.id}><summary><span>{pick(item.headline, lang)}</span><small>{item.publishedAt}</small></summary><p>{pick(item.fact, lang)}</p><code>{item.id}</code></details>)}</div>}
      </section>

      <aside className="fd-system" aria-labelledby="fd-system-title"><p className="eyebrow">INSIDE THE DEMONSTRATION</p><h2 id="fd-system-title">{lang === 'zh' ? '點樣證明個流程可靠？' : 'How can you inspect the workflow?'}</h2><dl className="fd-run-facts"><div><dt>{lang === 'zh' ? '模擬搜尋' : 'Simulated searches'}</dt><dd>{progress?.searches ?? 0} / 2</dd></div><div><dt>{lang === 'zh' ? '真實模型呼叫' : 'Actual model calls'}</dt><dd>0</dd></div><div><dt>{lang === 'zh' ? '真實新聞 API 呼叫' : 'Actual news API calls'}</dt><dd>0</dd></div></dl><p>{lang === 'zh' ? '下面顯示此頁實際走過的模擬工具事件，唔係預先宣稱成功。' : 'The trace below records the simulated events you actually reached on this page.'}</p><ol className="fd-trace">{progress?.trace.map(event => <li key={event.id}><code>{event.tool}</code><p>{pick(event.detail, lang)}</p></li>) ?? <li>{lang === 'zh' ? '開始研究後顯示記錄。' : 'Start research to see the trace.'}</li>}</ol><details className="fd-engineering"><summary>{lang === 'zh' ? '真實版用咩技術？' : 'What powers the proposed real app?'}</summary><p>Next.js → FastAPI → LangGraph → n8n MCP → RAG</p><p>{lang === 'zh' ? '先用本機程序開發；Python 執行檢索與規則，LLM 依證據草擬解釋。SQLite 保存報告與持久檢查點。新版真實設計加入每題 n8n MCP 刷新、准入混合重排、OTel、自架 Langfuse 及 LangSmith；此離線模擬沒有呼叫它們。' : 'Develop with local processes first. Python retrieves evidence and applies rules; the LLM drafts explanations from that evidence. SQLite stores reports and durable checkpoints. The revised live design adds per-prompt n8n MCP refresh, gated hybrid reranking, OTel, self-hosted Langfuse and LangSmith. This offline simulation does not call them.'}</p></details><Link href="/finance-project#finance-functions">{lang === 'zh' ? '逐項功能、流程及技術原因' : 'Function workflows and technology decisions'} →</Link><Link href="/finance-project/proposal">{lang === 'zh' ? '查看 8–12 星期開發計劃' : 'See the 8–12 week development plan'} →</Link></aside>
    </div>
  </main>;
}
