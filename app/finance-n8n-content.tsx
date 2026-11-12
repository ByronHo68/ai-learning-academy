'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Pause, Play, RotateCcw, SkipBack, SkipForward, Workflow } from 'lucide-react';
import { pick, type Lang } from '../lib/curriculum';
import { n8nLimits, n8nRoles, n8nScenarios, n8nStageLabel, n8nStages, n8nStart, type N8nStage } from '../lib/finance-n8n';

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
    <p>{lang === 'zh' ? '六格是整條路徑。下面的傳送顯示這一步由誰交到誰。這頁不會呼叫真實 n8n、Yahoo 或 PostgreSQL。' : 'The six boxes are the whole path. The handoff below shows who passes this step to whom. This page does not call live n8n, Yahoo, or PostgreSQL.'}</p>
    <div className="mcp-choice-row" role="group" aria-label={lang === 'zh' ? '動畫情境' : 'Animation scenario'}>
      {n8nScenarios.map((item, index) => <button type="button" key={item.id} aria-pressed={player.scenario === index} onClick={() => setPlayer({ scenario: index, position: 0, playing: false })}>{pick(item.title, lang)}</button>)}
    </div>
    <div className="mcp-player" data-playing={player.playing}>
      <div className="mcp-player-top"><span>{lang === 'zh' ? '離線教學動畫 · 真實外部呼叫 0 次' : 'Offline teaching animation · 0 real external calls'}</span><span>{player.position + 1} / {scenario.steps.length}</span></div>
      <p className="mcp-question">“{pick(scenario.prompt, lang)}”</p>
      <div className="n8n-rail" aria-label={lang === 'zh' ? '六段路徑' : 'Six-stage path'}>
        {n8nStages.map((stage, index) => {
          const current = step.stage === stage.id;
          const hasStep = scenario.steps.some(item => item.stage === stage.id);
          const state = !reached.has(stage.id) ? (!hasStep && stopped ? 'stop' : 'waiting') : current && step.tone === 'stop' ? 'stop' : current && step.tone === 'wait' ? 'wait' : current ? 'current' : 'done';
          return <button type="button" key={stage.id} data-state={state} onClick={() => {
            const next = scenario.steps.findIndex(item => item.stage === stage.id);
            if (next >= 0) seek(next);
          }}>
            <small>{String(index + 1).padStart(2, '0')}</small>
            <strong>{pick(n8nStageLabel(scenario, stage.id as N8nStage), lang)}</strong>
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
        <p className="eyebrow">N8N · WEEK 2 OF THE PROJECTION</p>
        <h1>{lang === 'zh' ? <>n8n 負責抓新聞。<br/>報告遲啲先寫。</> : <>n8n fetches the news.<br/>The report comes later.</>}</h1>
        <p>{lang === 'zh' ? 'n8n 是一個視覺化流程執行器。在這個項目裡，它是研究 app 同新聞來源之間的辦事員：收下一條已接納的問題，交出公司新聞，並用一張收據證明保存了什麼。' : 'n8n is a visual workflow runner. In this project it is the clerk between the research app and the news source: one accepted question comes in, company news goes out, and a receipt proves what was saved.'}</p>
        <a className="primary-action" href="#n8n-animation"><Play size={18}/>{lang === 'zh' ? '播放流程' : 'Play the workflow'}</a>
      </div>
      <div className="mcp-hero-sketch" aria-label={lang === 'zh' ? '研究 app 叫 n8n 抓一次新聞' : 'The research app asks n8n to fetch news once'}>
        <span className="mcp-sketch-caption">{lang === 'zh' ? '這個項目，一句講晒' : 'THIS PROJECT, IN ONE EXCHANGE'}</span>
        <div><strong>{lang === 'zh' ? '研究 app' : 'Research app'}</strong><p>{lang === 'zh' ? '「幫我刷新 NVDA 新聞，只用這一個 run id。」' : '“Refresh the NVDA news. Use this one run id.”'}</p><small>LANGGRAPH HOST</small></div>
        <span className="mcp-plug"><Workflow size={24}/> n8n <span aria-hidden="true">↓ ↑</span></span>
        <div><strong>{lang === 'zh' ? '收據' : 'Receipt'}</strong><p>{lang === 'zh' ? '「抓完了。這是版本、時間同供應商狀態。」' : '“Fetched. Here are the versions, time, and provider status.”'}</p><small>THEN THE MODEL MAY WRITE</small></div>
      </div>
    </header>
    <div className="n8n-limits">
      {n8nLimits.map(item => <div key={item.value}><strong>{item.value}</strong><span>{pick(item.label, lang)}</span></div>)}
    </div>
    <div className="fr-disclosure"><BookOpen size={21} aria-hidden="true"/><p>{lang === 'zh' ? '這是股票研究規劃裡的 n8n 部分。動畫同例子都是離線教材。Office 版用 Node.js 18 時，在項目資料夾執行 node office/server.mjs，不要 npm install。' : 'This is the n8n slice of the stock research projection. The animation and examples stay offline. On the office edition with Node.js 18, start from the project folder with node office/server.mjs. Do not npm install.'}</p></div>

    <section className="finance-section" id="n8n-roles">
      <p className="eyebrow">01 · WHO DOES THE JOB</p>
      <h2>{lang === 'zh' ? 'n8n 只負責抓取' : 'n8n only owns the fetch'}</h2>
      <div className="mcp-ownership">{n8nRoles.map(item => <div key={item.name}><strong>{item.name}</strong><p>{pick(item.job, lang)}</p></div>)}</div>
      <p>{lang === 'zh' ? '有兩條流程。每條已接納的問題呼叫 refresh_company_news。另外一條 Schedule Trigger 每天抓宏觀同地緣新聞，即使沒有人發問。每日批次是背景，不能取代每題的公司新聞。' : 'There are two workflows. Every accepted question calls refresh_company_news. A separate Schedule Trigger fetches macroeconomic and geopolitical news once a day, even if nobody asks. That daily batch is context. It does not replace the company news for the question.'}</p>
    </section>

    <N8nAnimation lang={lang}/>

    <section className="finance-section" id="n8n-start">
      <p className="eyebrow">03 · OPEN N8N ITSELF</p>
      <h2>{lang === 'zh' ? '第一次點打開 n8n' : 'How to open n8n the first time'}</h2>
      <p>{lang === 'zh' ? '網站同 n8n 是兩樣東西。網站在 Node 18 用 office 伺服器就夠。n8n 本身要用 Docker。' : 'The website and n8n are two different programs. Node 18 runs the office website. n8n itself needs Docker.'}</p>
      <pre className="n8n-command"><code>{`mkdir -p "$HOME/n8n-local" && cd "$HOME/n8n-local"
curl -fsSL https://get.n8n.io | sh`}</code></pre>
      <div className="n8n-steps">
        {n8nStart.map((item, index) => <article key={item.en}><em>{index + 1}</em><p>{pick(item, lang)}</p></article>)}
      </div>
      <p>{lang === 'zh' ? '第 2 週的完成線很小：兩條不同、而且在支援範圍內的問題，各自留下一張刷新收據。超時先用同一個 run_id 查找，再決定要不要重送。Settings 裡的 Instance-level MCP 是另一個功能，這個項目用的是流程上的 MCP Server Trigger。' : 'Week 2 is done when two different supported questions leave two refresh receipts. A timeout looks up that same run_id before sending the call again. Settings → Instance-level MCP is a different feature. This project uses the MCP Server Trigger on the workflow.'}</p>
      <p><a href="https://docs.n8n.io/deploy/host-n8n/install-options/one-line-setup">{lang === 'zh' ? 'n8n 官方一行安裝' : 'Official n8n one-line setup'}</a> · <Link href="/finance-project/mcp">{lang === 'zh' ? 'MCP 點樣把 app 接到 n8n' : 'How MCP connects the app to n8n'}</Link> · <Link href="/finance-project#finance-yfinance">{lang === 'zh' ? 'YFinance adapter' : 'YFinance adapter'}</Link></p>
    </section>

    <section className="finance-section" id="n8n-retry">
      <p className="eyebrow">04 · RETRY RULES ALREADY IN THE PROJECTION</p>
      <h2>{lang === 'zh' ? '邊啲可以重試，邊啲必須停' : 'What may retry, and what must stop'}</h2>
      <div className="mcp-ownership">
        <div><strong>{lang === 'zh' ? '可以重試' : 'May retry'}</strong><p>{lang === 'zh' ? '連線中斷、部分 HTTP 500，以及 429、503、504。次數要少於 3，而且剩餘時間夠再打一次 10 秒呼叫。先等 1 秒，再等 2 秒，加少量 jitter。' : 'A dropped connection, selected HTTP 500s, and 429, 503, or 504. Only while attempts are under 3 and time remains for another 10-second call. Wait 1 second, then 2 seconds, plus a little jitter.'}</p></div>
        <div><strong>{lang === 'zh' ? '必須停止' : 'Must stop'}</strong><p>{lang === 'zh' ? 'HTTP 401 或 422、不認識的公司，或不符合 schema 的內容。關掉 HTTP 節點自帶的自動重試。明確的 Wait 分支先是重試。' : 'HTTP 401 or 422, an unknown company, or a body that does not match the schema. Leave the HTTP node’s built-in retry off. The explicit Wait branch is the only retry.'}</p></div>
      </div>
      <p>{lang === 'zh' ? 'n8n 安裝程式自帶的資料庫是 SQLite，它記住流程、憑證同執行清單。新聞文章要進 PostgreSQL。這是兩個資料庫。' : 'The database that comes with the n8n installer is SQLite. It remembers workflows, credentials, and the execution list. News articles go to PostgreSQL. Those are two databases.'}</p>
    </section>
  </main>;
}
