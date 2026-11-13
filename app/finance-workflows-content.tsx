'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Download, GitBranch } from 'lucide-react';
import { pick, type Lang } from '../lib/curriculum';
import { financeDiagrams, financeOverallDiagram, financeRetryRules } from '../lib/finance-diagrams';
import { financeRuntimeLimits } from '../lib/finance-proposal';
import { FinanceDiagramCanvas } from './finance-diagram';
import { FinanceEvidenceContent } from './finance-evidence-content';
import { FinanceReviewContent } from './finance-review-content';

const groups = [
  { en: 'Get the right evidence', zh: '取得合適證據', ids: ['company', 'sources', 'n8n_daily', 'embeddings', 'retrieval'] },
  { en: 'Produce a checked answer', zh: '產生已核對答案', ids: ['research', 'report', 'validation', 'export'] },
  { en: 'Recover, measure and deliver', zh: '恢復、量度及交付', ids: ['recovery', 'evaluation', 'observability', 'deployment'] },
];

export default function FinanceWorkflowsContent({ lang }: { lang: Lang }) {
  const [selected, setSelected] = useState('overall');
  const diagram = financeDiagrams.find(item => item.id === selected) ?? financeOverallDiagram;
  return <main className="utility-page finance-page fd-page">
    <Link href="/finance-project" className="fr-inline-link"><ArrowLeft size={16}/>{lang === 'zh' ? '返回股票研究項目' : 'Back to the stock research project'}</Link>
    <header className="utility-hero"><p className="eyebrow">WORKFLOW ATLAS · 1 PROJECT + 11 FUNCTIONS + DAILY NEWS</p><h1>{lang === 'zh' ? '一眼睇全局，沿箭嘴睇細節' : 'See the project. Follow every decision.'}</h1><p>{lang === 'zh' ? '先用心智圖選功能，再看它的工作流程。菱形是條件判斷；回圈標明何時補查、如何回退，以及幾時必須停止。' : 'Use the mind map to choose a function, then follow its workflow. Diamonds mark decisions. Loops show when to refine, how to fall back and when to stop.'}</p><div className="fr-hero-actions"><a className="primary-action" href="#project-diagram" onClick={() => setSelected('overall')}><GitBranch size={18}/>{lang === 'zh' ? '睇整體工作流程' : 'Explore the overall workflow'}</a><a className="secondary-action" href="#finance-evidence-review">{lang === 'zh' ? '試用證據覆核' : 'Try evidence review'}</a><a className="secondary-action" href="/downloads/stock-research-workflow-atlas.md" download><Download size={16}/>{lang === 'zh' ? '下載全部圖解' : 'Download the atlas'}</a></div></header>
    <div className="fr-disclosure"><GitBranch size={22}/><p>{lang === 'zh' ? '這是未來金融 app 的離線設計圖集。網站可播放固定路徑，但沒有執行 n8n、LangGraph、向量搜尋或 LLM。SVG 可放大或用向量編輯器修改；Mermaid 是可編輯圖表原始碼。' : 'This atlas describes the future finance app. The website plays fixed paths without running n8n, LangGraph, vector search or an LLM. SVG exports scale cleanly and can be edited in a vector editor; Mermaid exports provide editable diagram source.'}</p></div>
    <section className="finance-section fd-project-map" id="project-mindmap"><p className="eyebrow">01 · FUNCTION MIND MAP</p><h2>{lang === 'zh' ? '11 個功能，分工點樣連起？' : 'How do the 11 functions fit together?'}</h2><p>{lang === 'zh' ? '這張圖是責任分類，不是執行次序。選功能會打開它的流程圖。' : 'This map groups responsibilities. It is not execution order. Choose a function to open its workflow.'}</p><a href="#project-diagram" className="fd-map-root" onClick={() => setSelected('overall')}><GitBranch size={24}/><strong>{lang === 'zh' ? '股票研究助手 · 整體流程' : 'Stock Research Agent · overall flow'}</strong></a><div className="fd-map-groups">{groups.map(group => <div key={group.en}><h3>{lang === 'zh' ? group.zh : group.en}</h3>{group.ids.map(id => { const item = financeDiagrams.find(diagram => diagram.id === id); return item && <a key={id} href="#project-diagram" onClick={() => setSelected(id)} aria-current={selected === id ? 'true' : undefined}>{pick(item.title, lang)}<span>↗</span></a>; })}</div>)}</div></section>
    <section className="finance-section" id="project-diagram"><p className="eyebrow">02 · CONNECTED WORKFLOW</p><h2>{pick(diagram.title, lang)}</h2><label className="fd-graph-picker">{lang === 'zh' ? '選擇圖表' : 'Choose a diagram'}<select value={selected} onChange={event => setSelected(event.target.value)}>{financeDiagrams.map(item => <option key={item.id} value={item.id}>{item.id === 'overall' ? lang === 'zh' ? '整體流程' : 'Overall workflow' : pick(item.title, lang)}</option>)}</select></label><FinanceDiagramCanvas key={diagram.id} diagram={diagram} lang={lang}/>{selected !== 'overall' && selected !== 'n8n_daily' && selected !== 'embeddings' && <Link className="fr-inline-link" href={`/finance-project#finance-function-${selected}`}>{lang === 'zh' ? '閱讀此功能的技術、輸入／輸出及驗收條件' : 'Read this function’s techniques, inputs, outputs and acceptance checks'} →</Link>}</section>
    <section className="finance-section" id="project-retries"><p className="eyebrow">03 · RETRY IS A DECISION</p><h2>{lang === 'zh' ? '幾時再試？幾時回退？幾時停止？' : 'Retry, fall back, resume—or stop?'}</h2><div className="fd-budget">{lang === 'zh' ? `每次任務：${financeRuntimeLimits.newsRefreshes} 次新聞刷新 · ${financeRuntimeLimits.searchRounds} 次搜尋 · 最多 ${financeRuntimeLimits.sourceReads} 個原文節錄 · 最多 ${financeRuntimeLimits.llmCalls} 次 LLM · ${financeRuntimeLimits.timeoutSeconds} 秒處理預算＋15 分鐘覆核期` : `Per run: ${financeRuntimeLimits.newsRefreshes} news refresh · ${financeRuntimeLimits.searchRounds} searches · up to ${financeRuntimeLimits.sourceReads} source excerpts · up to ${financeRuntimeLimits.llmCalls} LLM calls · ${financeRuntimeLimits.timeoutSeconds}s active processing + 15-minute review window`}</div><div className="fd-retry-rules">{financeRetryRules.map((rule, i) => <article key={rule.title.en}><span>0{i + 1}</span><h3>{pick(rule.title, lang)}</h3><p>{pick(rule.body, lang)}</p></article>)}</div><p>{lang === 'zh' ? '不是每個功能都需要回圈。無效引用會阻擋草稿，匯出只讀取已存結果；評估未過門檻就維持 sparse。' : 'Not every function needs a loop. Invalid citations block the draft, export reads the saved result, and failed evaluation keeps sparse retrieval active.'}</p></section>
    <footer className="fr-references"><p><Link href="/finance-project#finance-database">{lang === 'zh' ? '查看 PostgreSQL 設計及範例' : 'Explore the PostgreSQL design and examples'} →</Link></p><Link href="/finance-project/mcp">{lang === 'zh' ? 'MCP 仲未明？睇入門動畫及例子' : 'Need the MCP basics? Open the animation and examples'} →</Link><p>{lang === 'zh' ? '圖表由同一份型別化流程資料產生；下載與畫面使用相同節點及路徑。' : 'The diagrams use the same typed workflow data as the function guides. Downloads and the canvas share their nodes and routes.'}</p></footer>
    <Link className="fr-inline-link" href="/finance-project/n8n">{lang === 'zh' ? 'n8n 新聞抓取、每日批次及交回研究流程的動畫 →' : 'Play the n8n acquisition, daily batch and research handoff lesson →'}</Link>
    <FinanceEvidenceContent lang={lang}/>
    <FinanceReviewContent lang={lang}/>
  </main>;
}
