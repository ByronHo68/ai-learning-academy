'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Pause, Play, RotateCcw, SkipBack, SkipForward, Workflow } from 'lucide-react';
import { pick, type Lang } from '../lib/curriculum';
import { n8nLimits, n8nRoles, n8nScenarios, n8nStageLabel, n8nStages, n8nStart, n8nDatabaseEnvironment, n8nIntegrationGuide, n8nReceiptExample, n8nReferences, financeN8nDailyDiagram } from '../lib/finance-n8n';
import { financeFunctionDiagram } from '../lib/finance-diagrams';
import { FinanceDiagramCanvas } from './finance-diagram';
import { FinanceAlphaVantageContent } from './finance-alpha-vantage-content';

function N8nAnimation({ lang }: { lang: Lang }) {
  const [player, setPlayer] = useState({ scenario: 0, position: 0, playing: false });
  const [delay, setDelay] = useState(1800);
  const scenario = n8nScenarios[player.scenario] ?? n8nScenarios[0];
  const step = scenario.steps[player.position] ?? scenario.steps[0];
  const last = player.position === scenario.steps.length - 1;

  useEffect(() => {
    if (!player.playing) return undefined;
    const timer = window.setTimeout(() => {
      setPlayer(previous => {
        const active = n8nScenarios[previous.scenario] ?? n8nScenarios[0];
        const position = Math.min(previous.position + 1, active.steps.length - 1);
        return { ...previous, position, playing: position < active.steps.length - 1 };
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [delay, player.playing, player.position, player.scenario]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlayer(previous => ({ ...previous, playing: false }));
    };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden);
  }, []);

  const seek = (position: number) => setPlayer(previous => ({ ...previous, position, playing: false }));
  const seen = scenario.steps.slice(0, player.position + 1);
  const reached = new Set(seen.map(item => item.stage));
  const stopped = seen.some(item => item.tone === 'stop');

  return <section className="finance-section mcp-story" id="n8n-animation">
    <p className="eyebrow">02 · WATCH ONE QUESTION</p>
    <h2>{lang === 'zh' ? '按播放，睇一條問題點樣走過 n8n' : 'Press play. Watch one question move through n8n.'}</h2>
    <p>{lang === 'zh' ? '階段格展示 n8n 抓取到研究 app 覆核及報告的交接。每日批次不需要使用者提示。動畫不呼叫真實服務；出現 Wait 不代表實際等待或重試。' : 'The stages show n8n acquisition followed by the research app’s review and report. Daily jobs need no user question. This animation makes no live calls; Wait is illustrative.'}</p>
    <div className="mcp-choice-row" role="group" aria-label={lang === 'zh' ? '動畫情境' : 'Animation scenario'}>
      {n8nScenarios.map((item, index) => <button type="button" key={item.id} aria-pressed={player.scenario === index} onClick={() => setPlayer({ scenario: index, position: 0, playing: false })}>{pick(item.title, lang)}</button>)}
    </div>
    <div className="mcp-player" data-playing={player.playing}>
      <div className="mcp-player-top"><span>{lang === 'zh' ? '離線教學動畫 · 真實外部呼叫 0 次' : 'Offline teaching animation · 0 real external calls'}</span><span>{player.position + 1} / {scenario.steps.length}</span></div>
      <p className="mcp-question">“{pick(scenario.prompt, lang)}”</p>
      <div className="n8n-rail" aria-label={lang === 'zh' ? '流程階段' : 'Workflow stages'}>
        {n8nStages.map((stage, index) => {
          const current = step.stage === stage.id;
          const hasStep = scenario.steps.some(item => item.stage === stage.id);
          const state = !reached.has(stage.id) ? (!hasStep && stopped ? 'stop' : 'waiting') : current && step.tone === 'stop' ? 'stop' : current && step.tone === 'wait' ? 'wait' : current ? 'current' : 'done';
          return <button type="button" key={stage.id} data-state={state} disabled={!hasStep} aria-current={current ? 'step' : undefined} onClick={() => {
            const next = scenario.steps.findIndex(item => item.stage === stage.id);
            if (next >= 0) seek(next);
          }}>
            <small>{String(index + 1).padStart(2, '0')}</small>
            <strong>{pick(n8nStageLabel(scenario, stage.id), lang)}</strong>
            <i />
          </button>;
        })}
      </div>
      <div className="mcp-transfer" key={`${scenario.id}-${player.position}`} data-channel={step.channel}>
        <div className="mcp-endpoint"><small>{lang === 'zh' ? '由' : 'FROM'}</small><strong>{pick(step.from, lang)}</strong></div>
        <div className="mcp-cable" aria-hidden="true"><span className="mcp-packet"><ArrowRight size={17}/></span></div>
        <div className="mcp-endpoint"><small>{lang === 'zh' ? '到' : 'TO'}</small><strong>{pick(step.to, lang)}</strong></div>
      </div>
      <div className="mcp-stage-detail" aria-live={player.playing ? 'off' : 'polite'} aria-atomic="true">
        <h3>{pick(step.title, lang)}</h3>
        <p>{pick(step.explanation, lang)}</p>
        <pre><code>{step.message}</code></pre>
      </div>
      <div className="mcp-controls">
        <button type="button" className="mcp-play" onClick={() => setPlayer(previous => ({ ...previous, position: last ? 0 : previous.position, playing: !previous.playing }))}>
          {player.playing ? <Pause size={17}/> : <Play size={17}/>}{player.playing ? (lang === 'zh' ? '暫停' : 'Pause') : last ? (lang === 'zh' ? '重播' : 'Replay') : (lang === 'zh' ? '播放動畫' : 'Play animation')}
        </button>
        <button type="button" disabled={player.position === 0} onClick={() => seek(player.position - 1)}><SkipBack size={16}/>{lang === 'zh' ? '上一步' : 'Back'}</button>
        <button type="button" disabled={last} onClick={() => seek(player.position + 1)}>{lang === 'zh' ? '下一步' : 'Next'}<SkipForward size={16}/></button>
        <button type="button" onClick={() => seek(0)}><RotateCcw size={16}/>{lang === 'zh' ? '重設' : 'Reset'}</button>
        <label>{lang === 'zh' ? '每步' : 'Each step'} <select value={delay} onChange={event => setDelay(Number(event.target.value))}><option value={1800}>{lang === 'zh' ? '1.8 秒' : '1.8 sec'}</option><option value={4000}>{lang === 'zh' ? '4 秒 · 慢讀' : '4 sec · slow'}</option></select></label>
      </div>
    </div>
    <ol className="mcp-timeline" aria-label={lang === 'zh' ? '完整情境流程' : 'Complete scenario workflow'}>
      {scenario.steps.map((item, index) => <li key={item.id} data-state={index === player.position ? 'active' : index < player.position ? 'visited' : 'waiting'}><button type="button" onClick={() => seek(index)} aria-current={index === player.position ? 'step' : undefined}><span>{index < player.position ? <Check size={14}/> : index + 1}</span>{pick(item.title, lang)}</button></li>)}
    </ol>
  </section>;
}

export default function FinanceN8nContent({ lang }: { lang: Lang }) {
  return <main className="utility-page finance-page mcp-page">
    <Link className="fr-inline-link" href="/finance-project"><ArrowLeft size={15}/>{lang === 'zh' ? '返回股票研究項目' : 'Back to the stock research project'}</Link>
    <header className="mcp-hero">
      <div>
        <p className="eyebrow">N8N · ACQUISITION → RESEARCH HANDOFF</p>
        <h1>{lang === 'zh' ? <>n8n 負責抓新聞。<br/>報告遲啲先寫。</> : <>n8n fetches the news.<br/>The report comes later.</>}</h1>
        <p>{lang === 'zh' ? 'n8n 是一個視覺化流程執行器。在這個項目裡，它是研究 app 同新聞來源之間的辦事員：收下一條已接納的問題，交出公司新聞，並用一張收據證明保存了什麼。' : 'n8n is a visual workflow runner. In this project it is the clerk between the research app and the news source: one accepted question comes in, company news goes out, and a receipt proves what was saved.'}</p>
        <a className="primary-action" href="#n8n-animation"><Play size={18}/>{lang === 'zh' ? '播放流程' : 'Play the workflow'}</a>
      </div>
      <div className="mcp-hero-sketch" aria-label={lang === 'zh' ? '研究 app 叫 n8n 抓一次新聞' : 'The research app asks n8n to fetch news once'}>
        <span className="mcp-sketch-caption">{lang === 'zh' ? '這個項目，一句講晒' : 'THIS PROJECT, IN ONE EXCHANGE'}</span>
        <div><strong>{lang === 'zh' ? '研究 app' : 'Research app'}</strong><p>{lang === 'zh' ? '「幫我刷新 NVDA 新聞，只用這一個 run id。」' : '“Refresh the NVDA news. Use this one run id.”'}</p><small>LANGGRAPH HOST</small></div>
        <span className="mcp-plug"><Workflow size={24}/> n8n <span aria-hidden="true">↓ ↑</span></span>
        <div><strong>{lang === 'zh' ? '收據' : 'Receipt'}</strong><p>{lang === 'zh' ? '「抓完了。這是版本、時間同供應商狀態。」' : '“Fetched. Here are the versions, time, and provider status.”'}</p><small>THEN SNAPSHOT → REVIEW → REPORT</small></div>
      </div>
    </header>
    <div className="n8n-limits">
      {n8nLimits.map(item => <div key={item.value}><strong>{item.value}</strong><span>{pick(item.label, lang)}</span></div>)}
    </div>
    <div className="fr-disclosure"><BookOpen size={21} aria-hidden="true"/><p>{lang === 'zh' ? '這是股票研究規劃裡的 n8n 部分。動畫同例子都是離線教材。Office 版用 Node.js 18 時，在項目資料夾執行 node office/server.mjs，不要 npm install。' : 'This is the n8n slice of the stock research projection. The animation and examples stay offline. On the office edition with Node.js 18, start from the project folder with node office/server.mjs. Do not npm install.'}</p></div>

    <section className="finance-section" id="n8n-roles">
      <p className="eyebrow">01 · WHO DOES THE JOB</p>
      <h2>{lang === 'zh' ? 'n8n 負責抓取、驗證及匯入' : 'n8n owns acquisition, validation and ingestion'}</h2>
      <div className="mcp-ownership">{n8nRoles.map(item => <div key={item.name}><strong>{item.name}</strong><p>{pick(item.job, lang)}</p></div>)}</div>
      <p>{lang === 'zh' ? '每個有效問題經 YFinance 刷新公司新聞。獨立每日 Schedule Trigger 向 Alpha Vantage 抓宏觀／財政及廣泛候選，再作地緣標記；完整批次補充報告快照。' : 'Every accepted question refreshes company news through YFinance. A separate daily Schedule Trigger calls Alpha Vantage for macro/fiscal news and broad candidates for geopolitical tagging. It runs independently, and its completed batch supplements the report snapshot.'}</p>
    </section>

    <FinanceAlphaVantageContent lang={lang}/>
    <N8nAnimation lang={lang}/>
    <section className="finance-section" id="n8n-connected-workflow">
      <p className="eyebrow">CONNECTED WORKFLOWS · SAME CATALOG AS THE ATLAS</p>
      <h2>{lang === 'zh' ? '每題刷新與每日背景，是兩條獨立流程' : 'Per-question refresh and daily context are separate workflows'}</h2>
      <p>{lang === 'zh' ? '點節點看資料交接與停止條件；紫色回圈只在 n8n 內重試。SVG 與畫面由同一份資料生成。' : 'Select nodes to inspect handoffs and stopping conditions. Purple provider-retry loops stay inside n8n. SVG downloads use the same diagram data.'}</p>
      <h3>{lang === 'zh' ? '每個有效問題：公司新聞' : 'Every accepted question: company news'}</h3>
      <FinanceDiagramCanvas diagram={financeFunctionDiagram('sources')} lang={lang}/>
      <h3>{lang === 'zh' ? '每日排程：宏觀與地緣新聞' : 'Daily schedule: macro and geopolitical news'}</h3>
      <FinanceDiagramCanvas diagram={financeN8nDailyDiagram} lang={lang}/>
      <p><Link href="/finance-project/workflows#project-diagram">{lang === 'zh' ? '看完整研究流程及覆核情境 →' : 'Follow the full research workflow and review scenarios →'}</Link> · <Link href="/finance-project#finance-evidence-review">{lang === 'zh' ? '試用標記、排除及重查覆蓋' : 'Try highlights, exclusions and coverage checks'}</Link></p>
    </section>
    <section className="finance-section" id="n8n-integration">
      <h2>{lang === 'zh' ? '點樣接入你的 app' : 'How it connects to your app'}</h2>
      <div className="fr-scope-grid fr-evidence-grid">{n8nIntegrationGuide.map(item => <article key={item.title.en}><h3>{pick(item.title, lang)}</h3><p>{pick(item.body, lang)}</p></article>)}</div>
      <details className="proposal-workflow"><summary>{lang === 'zh' ? '查看虛構已提交收據' : 'Inspect a fictional committed receipt'}</summary><pre className="fr-tree"><code>{n8nReceiptExample}</code></pre></details>
      <p><a href="/downloads/stock-research-n8n-guide.md" download>{lang === 'zh' ? '下載雙語 n8n 整合指南' : 'Download the bilingual n8n integration guide'}</a></p>
    </section>


    <p><Link href="/finance-project/checkpoints">{lang === 'zh' ? '為何 checkpoint 與 n8n 收據要分開？試重啟及恢復動畫 →' : 'Why keep checkpoints separate from n8n receipts? Try restart and recovery →'}</Link></p>
    <section className="finance-section" id="n8n-start">
      <p className="eyebrow">03 · OPEN N8N ITSELF</p>
      <h2>{lang === 'zh' ? '第一次點打開 n8n' : 'How to open n8n the first time'}</h2>
      <p>{lang === 'zh' ? '網站與 n8n 是兩個程序。這裡建議以 Docker Compose 執行 n8n；下方為 n8n service 的環境設定示例，不是啟動指令。' : 'The website and n8n are separate programs. This guide recommends Docker Compose for n8n. The example below configures the n8n service environment; it is not a launch command.'}</p>
      <pre className="n8n-command"><code>{n8nDatabaseEnvironment}</code></pre>
      <div className="n8n-steps">
        {n8nStart.map((item, index) => <article key={item.en}><em>{index + 1}</em><p>{pick(item, lang)}</p></article>)}
      </div>
      <p>{lang === 'zh' ? '第 2 週的完成線很小：兩條不同、而且在支援範圍內的問題，各自留下一張刷新收據。超時先用同一個 run_id 查找，再決定要不要重送。Settings 裡的 Instance-level MCP 是另一個功能，這個項目用的是流程上的 MCP Server Trigger。' : 'Week 2 is done when two different supported questions leave two refresh receipts. A timeout looks up that same run_id before sending the call again. Settings → Instance-level MCP is a different feature. This project uses the MCP Server Trigger on the workflow.'}</p>
      <p><a href="https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose.md">{lang === 'zh' ? 'n8n 官方 Compose 安裝' : 'Official n8n Compose installation'}</a> · <Link href="/finance-project/mcp">{lang === 'zh' ? 'MCP 點樣把 app 接到 n8n' : 'How MCP connects the app to n8n'}</Link> · <Link href="/finance-project#finance-yfinance">{lang === 'zh' ? 'YFinance adapter' : 'YFinance adapter'}</Link></p>
    </section>

    <section className="finance-section" id="n8n-retry">
      <p className="eyebrow">04 · RETRY RULES ALREADY IN THE PROJECTION</p>
      <h2>{lang === 'zh' ? '邊啲可以重試，邊啲必須停' : 'What may retry, and what must stop'}</h2>
      <div className="mcp-ownership">
        <div><strong>{lang === 'zh' ? '可以重試' : 'May retry'}</strong><p>{lang === 'zh' ? '連線中斷、部分 HTTP 500，以及 429、503、504。少於 3 次且有餘額才再試；每次最多 10 秒，同受 25 秒抓取預算及處理時限限制，遵守 Retry-After。先等 1 秒，再等 2 秒，加少量 jitter。' : 'A dropped connection, selected HTTP 500s, and 429, 503, or 504. Only while attempts are under 3 and enough time remains for the clipped next attempt; each call is at most 10 seconds inside the 25-second acquisition budget and active run deadline. Honor Retry-After. Wait 1 second, then 2 seconds, plus a little jitter.'}</p></div>
        <div><strong>{lang === 'zh' ? '必須停止' : 'Must stop'}</strong><p>{lang === 'zh' ? 'HTTP 401 或 422、不認識的公司，或不符合 schema 的內容。關掉 HTTP 節點自帶的自動重試。明確的 Wait 分支先是重試。' : 'HTTP 401 or 422, an unknown company, or a body that does not match the schema. Leave the HTTP node’s built-in retry off. The explicit Wait branch is the only retry.'}</p></div>
      </div>
      <p>{lang === 'zh' ? '此項目把 n8n 管理資料存 PostgreSQL 的 n8n_metadata；新聞證據、報告及 checkpoints 用不同資料庫與角色。只用預設值會用 SQLite，必須明確設定 DB_TYPE=postgresdb。' : 'This project uses PostgreSQL n8n_metadata for workflow metadata, with separate databases and roles for evidence, reports and checkpoints. n8n defaults to SQLite unless DB_TYPE=postgresdb is configured.'}</p>
    </section>
    <section className="finance-section"><h2>{lang === 'zh' ? '官方參考' : 'Official references'}</h2><ul>{n8nReferences.map(item => <li key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></li>)}</ul></section>
  </main>;
}
