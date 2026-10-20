'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Activity, ArrowRight, Bot, Check, Clock3, Database, FlaskConical, GitBranch, Play, ShieldCheck, Terminal, X } from 'lucide-react';
import type { Lang } from '../lib/curriculum';
import type { Engine, EvalCase, EvalReport, Health, Mode, Run } from '../lib/lab-contracts';
import { labRequest } from '../lib/lab-api';

type View = 'run' | 'evals' | 'compare';
const active = (run: Run | null) => run?.status === 'queued' || run?.status === 'running';
const money = (value: number | null | undefined) => value == null ? '—' : `$${value.toFixed(6)}`;
const milliseconds = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${Math.round(value)}ms`;
const errorText = (error: unknown) => error instanceof Error ? error.message : 'The request failed.';

function Flow({ run, mode, zh }: { run: Run | null; mode: Mode; zh: boolean }) {
  const reduced = useReducedMotion();
  const [cursor, setCursor] = useState<number | null>(null);
  const total = run?.events.length ?? 0;
  useEffect(() => {
    if (cursor === null) return;
    const timer = window.setTimeout(() => setCursor(cursor < total ? cursor + 1 : null), 1000);
    return () => window.clearTimeout(timer);
  }, [cursor, total]);
  const replaying = cursor !== null;
  const events = replaying ? (run?.events ?? []).slice(0, cursor) : run?.events ?? [];
  const stage = run?.status === 'awaiting_approval' ? 'approval' : events.at(-1)?.step ?? '';
  const nodes = [
    { key: 'input', title: zh ? '你的要求' : 'Your request', subtitle: '01 · INPUT', icon: Terminal, done: !!run },
    { key: 'agent', title: mode === 'supervisor' ? 'Supervisor' : 'Single agent', subtitle: '02 · PLAN', icon: Bot, done: events.some(e => ['supervisor', 'single_agent'].includes(e.step)) },
    { key: 'tools', title: 'MCP → Java', subtitle: '03 · EVIDENCE', icon: Database, done: events.some(e => e.kind === 'tool') },
    { key: 'approval', title: zh ? '人工批准' : 'Human approval', subtitle: '04 · IF WRITING', icon: ShieldCheck, done: events.some(e => e.step === 'human_decision') },
    { key: 'memory', title: zh ? '儲存結果' : 'Saved result', subtitle: '05 · CHECKPOINT', icon: Check, done: run?.status === 'completed' && (!replaying || cursor === total) },
  ];
  return <div className="lab-flow" aria-label={zh ? 'Agent 執行流程' : 'Agent execution flow'}>
    <div className="lab-flow-top"><span><i className={active(run) || replaying ? 'lab-pulse' : ''}/>{replaying ? (zh ? '重播 · 已儲存事件' : 'REPLAY · SAVED EVENTS') : active(run) ? (zh ? '執行中 · 即時事件' : 'RUNNING · LIVE EVENTS') : run?.status === 'awaiting_approval' ? (zh ? '已暫停 · 等待你批准' : 'PAUSED · YOUR DECISION') : (zh ? '執行路徑' : 'EXECUTION PATH')}</span><small>LangGraph + SQLite</small></div>
    <div className="lab-flow-nodes">{nodes.map((node, index) => {
      const Icon = node.icon;
      const current = node.key === 'approval' && stage === 'approval';
      return <div className="lab-flow-step" key={node.key}>
        <motion.div className={`lab-node ${node.done ? 'done' : ''} ${current ? 'waiting' : ''}`}
          animate={current && !reduced ? { boxShadow: ['0 0 0 0 #fbbf2420', '0 0 0 8px #fbbf2400'] } : { boxShadow: '0 0 0 0 transparent' }}
          transition={{ repeat: current && !reduced ? Infinity : 0, duration: 1.8 }}>
          <small>{node.subtitle}</small><Icon size={25}/><b>{node.title}</b>
          <span>{node.done ? (zh ? '已完成' : 'Complete') : current ? (zh ? '等你決定' : 'Decision needed') : '· · ·'}</span>
        </motion.div>
        {index < nodes.length - 1 && <ArrowRight className={`lab-connector ${(active(run) || replaying) && !reduced ? 'moving' : ''}`} size={19}/>}
      </div>;
    })}</div>
    <AnimatePresence>{mode === 'supervisor' && <motion.div className="lab-helpers" initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
      <span>↳</span><div className={events.some(e => e.step === 'account_helper') ? 'done' : ''}><Bot size={17}/>{zh ? '戶口分析助手' : 'Account specialist'}</div>
      <div className={events.some(e => e.step === 'policy_helper') ? 'done' : ''}><ShieldCheck size={17}/>{zh ? '政策審查助手' : 'Policy specialist'}</div><small>{zh ? '各自處理範圍，再交主管整合' : 'Scoped specialist calls → supervisor synthesis'}</small>
    </motion.div>}</AnimatePresence>
    <p>{zh ? '箭嘴表示資料流；完成標記來自後端事件。只有開立個案需要批准。' : 'Arrows show data flow; completion markers come from backend events. Only case creation requires approval.'}</p>
    {run && ['completed', 'failed'].includes(run.status) && total > 0 && <div className="lab-replay"><button type="button" onClick={() => setCursor(replaying ? null : 0)}><Play size={12}/>{replaying ? (zh ? '停止重播' : 'Stop replay') : (zh ? '逐步重播紀錄' : 'Replay recorded steps')}</button><span aria-live="polite">{replaying ? `${cursor} / ${total} · ${events.at(-1)?.step ?? 'request'}` : (zh ? '重播不會呼叫模型或工具' : 'Replay makes no model or tool calls')}</span></div>}
  </div>;
}

function RunMetrics({ run, zh }: { run: Run | null; zh: boolean }) {
  const metrics = run?.metrics;
  return <div className="lab-metrics">
    <div><Clock3 size={17}/><small>{zh ? '處理時間' : 'Processing time'}</small><strong>{metrics ? milliseconds(metrics.active_ms) : '—'}</strong><span>{zh ? '不包括等你批准的時間' : 'Excludes approval wait'}</span></div>
    <div><Activity size={17}/><small>{zh ? '模型成本 · USD' : 'Model cost · USD'}</small><strong>{money(metrics?.cost_usd)}</strong><span>{metrics?.cost_basis === 'configured_rates' ? (zh ? '按設定單價估算' : 'Estimated from configured rates') : metrics?.cost_basis === 'no_model' ? (zh ? '離線模式，沒有模型費用' : 'Offline · no model calls') : (zh ? '未提供用量或單價' : 'Usage or pricing unavailable')}</span></div>
    <div><Bot size={17}/><small>{zh ? '模型呼叫 / tokens' : 'Model calls / tokens'}</small><strong>{metrics ? metrics.model_calls : '—'} <em>/ {metrics ? metrics.input_tokens + metrics.output_tokens : '—'}</em></strong><span>{metrics ? `${metrics.input_tokens} in · ${metrics.output_tokens} out` : (zh ? '執行後顯示' : 'Available after a run')}</span></div>
    <div><Database size={17}/><small>{zh ? '已載入記憶' : 'Memory loaded'}</small><strong>{run?.memory_turns ?? '—'} <em>{zh ? '輪對話' : 'turns'}</em></strong><span>{zh ? 'SQLite · 最近 6 輪' : 'SQLite · latest 6 turns'}</span></div>
  </div>;
}

function Trace({ run, zh }: { run: Run | null; zh: boolean }) {
  const reduced = useReducedMotion();
  return <section className="lab-panel lab-trace"><div className="lab-panel-heading"><h2>{zh ? '執行紀錄' : 'Run trace'}</h2><span>{run?.events.length ?? 0} events</span></div>
    {!run?.events.length && <div className="lab-empty"><Activity size={28}/><p>{zh ? '執行要求後，這裏會逐步顯示真正的 agent、工具和儲存事件。' : 'Run a request to see actual agent, tool, and checkpoint events arrive here.'}</p></div>}
    <ol aria-live="polite" aria-relevant="additions">{run?.events.map((event, index) => <motion.li key={`${run.id}-${index}`} initial={reduced ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}><i className={event.kind}/><div><b>{event.step}</b><p>{event.detail}</p></div><time>{milliseconds(event.elapsed_ms)}</time></motion.li>)}</ol>
    {run && <div className="lab-trace-footer">
      {run.metrics.trace_url && /^https?:\/\//.test(run.metrics.trace_url) ? <a href={run.metrics.trace_url} target="_blank" rel="noreferrer">Open in Langfuse ↗</a> : <span>{run.metrics.tracing === 'enabled' ? (zh ? 'Langfuse 已啟用，連結尚未提供。' : 'Langfuse enabled; trace link not yet available.') : (zh ? '本地紀錄已儲存。設定 Langfuse keys 後可匯出追蹤。' : 'Local trace saved. Configure Langfuse keys to export traces.')}</span>}
      <code>{run.id.slice(0, 8)}</code>
    </div>}
  </section>;
}

function Setup({ zh }: { zh: boolean }) {
  return <details className="lab-setup"><summary><Terminal size={18}/>{zh ? '啟動方式與架構' : 'Start the lab & explore the architecture'}<span>Python · Java · Next.js</span></summary>
    <div className="lab-setup-grid"><section><h3>{zh ? '第一次啟動' : 'First-time setup'}</h3><pre><code>{'npm run lab:setup\nnpm run lab:start'}</code></pre><p>{zh ? '需要 Node 22、Python 3.13 和 Java 21。Setup 安裝 Python 套件、下載經校驗的 Maven、編譯 Java，並產生本地服務金鑰。' : 'Requires Node 22, Python 3.13, and Java 21. Setup installs Python dependencies, verifies Maven, builds Java, and generates local service credentials.'}</p></section>
      <section><h3>{zh ? '接駁真實模型及 Langfuse' : 'Connect a live model & Langfuse'}</h3><p>{zh ? '在 .env.lab 設定 MODEL_API_KEY、MODEL_NAME 及兼容 OpenAI 的 MODEL_BASE_URL，然後重新啟動。模型必須支援 JSON Schema structured output。' : 'Set MODEL_API_KEY, MODEL_NAME, and an OpenAI-compatible MODEL_BASE_URL in .env.lab, then restart. The model must support JSON Schema structured output.'}</p><p>{zh ? '加入 LANGFUSE_PUBLIC_KEY、LANGFUSE_SECRET_KEY、LANGFUSE_BASE_URL。設定每百萬 tokens 單價後，頁面會顯示估算成本。' : 'Add LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, and LANGFUSE_BASE_URL. Configure token rates to display estimated cost.'}</p></section></div>
    <div className="lab-architecture"><b>Browser</b><ArrowRight size={16}/><b>Next.js proxy</b><ArrowRight size={16}/><b>FastAPI + LangGraph</b><ArrowRight size={16}/><b>MCP / Spring Boot</b></div>
    <p>{zh ? '示範戶口 HK-001。Java 同時提供 REST API 及 MCP tools，Python 經 MCP 呼叫同一個 service layer。只開立覆核個案，沒有資金轉移功能。' : 'Synthetic account HK-001. Java exposes REST APIs and MCP tools backed by the same service layer. The only write opens a review case; the service has no money-transfer operation.'}</p>
    <div className="lab-tools"><code>get_account_summary</code><code>list_transactions</code><code>open_review_case</code></div>
  </details>;
}

function Comparison({ report, zh }: { report: EvalReport | null; zh: boolean }) {
  const reduced = useReducedMotion();
  const summaries = (['single', 'supervisor'] satisfies Mode[]).map(mode => {
    const rows = report?.rows.filter(row => row.mode === mode) ?? [];
    const times = rows.map(row => row.active_ms).sort((a, b) => a - b);
    const median = times.length ? (times[Math.floor((times.length - 1) / 2)] + times[Math.ceil((times.length - 1) / 2)]) / 2 : 0;
    const p95 = times.length ? times[Math.ceil(times.length * .95) - 1] : 0;
    return { mode, count: rows.length, passed: rows.filter(row => row.passed).length, median, p95,
      cost: rows.length && rows.every(row => row.cost_usd !== null) ? rows.reduce((sum, row) => sum + (row.cost_usd ?? 0), 0) : null };
  });
  const maxTime = Math.max(1, ...summaries.map(s => s.median));
  return <section className="lab-comparison"><div className="lab-comparison-cards">{summaries.map(summary => <article className="lab-panel" key={summary.mode}>
    <div className="lab-panel-heading"><h2>{summary.mode === 'single' ? 'Single agent' : 'Supervisor + helpers'}</h2>{summary.mode === 'single' ? <Bot size={24}/> : <GitBranch size={24}/>}</div>
    <p>{summary.mode === 'single' ? (zh ? '一個角色負責計劃和回答，路徑較短。' : 'One role plans and answers, with a shorter execution path.') : (zh ? '主管分派戶口與政策助手，再整合答案。' : 'A supervisor delegates to account and policy specialists, then synthesizes.')}</p>
    <div className="lab-score"><strong>{summary.count ? Math.round(summary.passed / summary.count * 100) : '—'}<small>%</small></strong><span>{summary.passed} / {summary.count} {zh ? '通過' : 'passed'}</span></div>
    <dl><div><dt>{zh ? '中位處理時間' : 'Median processing time'}</dt><dd>{summary.count ? milliseconds(summary.median) : '—'}</dd></div>
      <div><dt>p95</dt><dd>{summary.count ? milliseconds(summary.p95) : '—'}</dd></div><div><dt>{zh ? '合計模型成本 · USD' : 'Total model cost · USD'}</dt><dd>{money(summary.cost)}</dd></div></dl>
    <div className="lab-bar" aria-hidden="true"><motion.i initial={{ width: 0 }} animate={{ width: `${summary.median / maxTime * 100}%` }} transition={{ duration: reduced ? 0 : .7 }}/></div>
  </article>)}</div>
    <p className="lab-method">{zh ? '同一資料集、同一模型、相同工具和評分規則；逐題輪替執行次序。時間和成本包括 MCP 呼叫及記憶準備對話，不包括人工等待。這是單次實驗，不能當作穩定效能結論。離線測試比較流程，真實模型測試才可比較 AI 質素。' : 'Same dataset, model, tools, and scoring rules; execution order alternates by case. Time and cost include MCP calls and memory setup turns, and exclude human wait. One pass is not a stable performance benchmark. Offline results compare workflow behavior; live evaluations are needed to compare AI quality.'}</p>
  </section>;
}

export default function AgentLabContent({ lang, view }: { lang: Lang; view: View }) {
  const zh = lang === 'zh';
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [engine, setEngine] = useState<Engine>('offline');
  const [mode, setMode] = useState<Mode>('single');
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [cases, setCases] = useState<EvalCase[]>([]);
  const [reports, setReports] = useState<EvalReport[]>([]);
  const [report, setReport] = useState<EvalReport | null>(null);
  const [filter, setFilter] = useState('all');

  const connect = useCallback(async (code?: string) => {
    setConnecting(true); setError('');
    try {
      const found = await labRequest('Health', 'health', { accessCode: code });
      setHealth(found);
      const [history, evaluations] = await Promise.all([labRequest('RunIndex', 'runs'), labRequest('EvalIndex', 'evals')]);
      setRuns(history.runs); setRun(history.runs[0] ?? null);
      setCases(evaluations.cases); setReports(evaluations.reports); setReport(evaluations.reports[0] ?? null);
      setAccessCode('');
    } catch (failure) { setError(errorText(failure)); }
    finally { setConnecting(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => { void connect(); }, 0); return () => window.clearTimeout(timer); }, [connect]);

  useEffect(() => {
    if (!runs.some(item => active(item))) return;
    const abort = new AbortController();
    const timer = window.setInterval(() => {
      void labRequest('RunIndex', 'runs', { signal: abort.signal }).then(value => {
        setRuns(value.runs); setRun(current => value.runs.find(item => item.id === current?.id) ?? current);
      }).catch(failure => { if (!abort.signal.aborted) setError(errorText(failure)); });
    }, 1000);
    return () => { abort.abort(); window.clearInterval(timer); };
  }, [runs]);
  useEffect(() => {
    if (report?.status !== 'running') return;
    const abort = new AbortController();
    const timer = window.setInterval(() => {
      void labRequest('EvalIndex', 'evals', { signal: abort.signal }).then(value => {
        setReports(value.reports); setReport(value.reports.find(item => item.id === report.id) ?? null);
      }).catch(failure => { if (!abort.signal.aborted) setError(errorText(failure)); });
    }, 1500);
    return () => { abort.abort(); window.clearInterval(timer); };
  }, [report]);

  async function startRun() {
    setBusy(true); setError('');
    try {
      const next = await labRequest('Run', 'runs', { body: { question, mode, engine, language: lang } });
      setRun(next); setRuns(current => [next, ...current]);
    } catch (failure) { setError(errorText(failure)); } finally { setBusy(false); }
  }
  async function approve(approved: boolean) {
    if (!run) return;
    setBusy(true); setError('');
    try {
      const next = await labRequest('Run', `runs/${run.id}/approval`, { body: { approved } });
      setRun(next); setRuns(current => current.map(item => item.id === next.id ? next : item));
    }
    catch (failure) { setError(errorText(failure)); } finally { setBusy(false); }
  }
  async function startEval() {
    setBusy(true); setError('');
    try {
      const next = await labRequest('EvalReport', 'evals', { body: { engine, modes: ['single', 'supervisor'] } });
      setReport(next); setReports(current => [next, ...current]);
    } catch (failure) { setError(errorText(failure)); } finally { setBusy(false); }
  }
  const examples = zh ? ['查詢我的戶口結餘。', '請顯示最近三項交易。', '請為咖啡店收費開立覆核個案。'] : ['What is my balance?', 'Show my recent transactions.', 'Open a review case for the cafe charge.'];
  const displayMode = run?.mode ?? mode;
  const runBlocked = busy || active(run) || runs.some(item => item.status === 'awaiting_approval' || active(item)) || !health?.bank_connected;
  const selectedRows = report?.rows.filter(row => filter === 'all' || (filter === 'failed' ? !row.passed : row.category === filter)) ?? [];
  const selectedCases = cases.filter(item => filter === 'all' || item.category === filter);

  return <main className="agent-lab">
    <header className="lab-hero"><div><p className="eyebrow">BUILD · RUN · MEASURE</p><h1>{zh ? 'Agent 工程實驗室' : 'Agent engineering lab'}</h1><p>{zh ? '由學懂概念，到親手驗證：一個有工具、有記憶、懂得停低等你批准的系統。' : 'Move from understanding concepts to testing a system with tools, memory, and a human approval step.'}</p></div>
      <div className="lab-service-badge"><i className={health?.bank_connected ? 'connected' : ''}/><span>{connecting ? (zh ? '正在連線…' : 'Connecting…') : health?.bank_connected ? (zh ? 'Python + Java 已連線' : 'Python + Java connected') : (zh ? '服務未連線' : 'Services disconnected')}<small>{zh ? '只使用合成銀行資料' : 'Synthetic banking data only'}</small></span>{!health?.bank_connected && !connecting && <button type="button" onClick={() => { void connect(accessCode); }}>{zh ? '重試' : 'Retry'}</button>}</div></header>
    <nav className="lab-tabs" aria-label={zh ? '實驗室導覽' : 'Lab navigation'}>
      <Link href="/agent-lab" aria-current={view === 'run' ? 'page' : undefined}><Play size={17}/>{zh ? '執行 Agent' : 'Run agent'}</Link>
      <Link href="/agent-lab/evals" aria-current={view === 'evals' ? 'page' : undefined}><FlaskConical size={18}/>{zh ? '評估 · 50 題' : 'Evaluations · 50 cases'}</Link>
      <Link href="/agent-lab/compare" aria-current={view === 'compare' ? 'page' : undefined}><GitBranch size={18}/>{zh ? '多 Agent 比較' : 'Multi-agent comparison'}</Link>
    </nav>
    {error && <div className="lab-error" role="alert"><b>{zh ? '需要處理' : 'Needs attention'}</b><p>{error}</p><button type="button" onClick={() => { void connect(accessCode); }}>{zh ? '重新連線' : 'Reconnect'}</button></div>}
    {!health && !connecting && <div className="lab-connect"><label>{zh ? '私人實驗室存取碼（如有設定）' : 'Private lab access code (if configured)'}<input type="password" autoComplete="current-password" value={accessCode} onChange={event => setAccessCode(event.target.value)}/></label><button type="button" onClick={() => { void connect(accessCode); }}>{zh ? '連線' : 'Connect'}</button></div>}
    <div className="lab-controls"><label>{zh ? '執行方式' : 'Execution engine'}<select value={engine} onChange={event => { if (event.target.value === 'offline' || event.target.value === 'live') setEngine(event.target.value); }} disabled={busy || active(run) || report?.status === 'running'}>
      <option value="offline">{zh ? '離線流程測試 · 無 LLM' : 'Offline workflow test · no LLM'}</option><option value="live" disabled={!health?.live_configured}>{zh ? '真實模型' : 'Live model'}{health?.model ? ` · ${health.model}` : (zh ? ' · 未設定' : ' · not configured')}</option>
    </select></label><p>{engine === 'offline' ? (zh ? '規則式測試驅動器；真正執行 LangGraph、MCP、Java 及資料庫。結果不代表 LLM 質素。' : 'A rule-based test driver executes the real graph, MCP, Java service, and database. Results do not measure LLM quality.') : (zh ? '會呼叫你設定的模型服務並產生費用。' : 'Calls your configured model provider and incurs usage charges.')}</p></div>
    {view === 'run' ? <>
      <div className="lab-workbench"><section className="lab-panel lab-composer"><div className="lab-panel-heading"><h2>{zh ? '試一個銀行服務情境' : 'Try a banking support request'}</h2><span>HK-001</span></div>
        <form onSubmit={event => { event.preventDefault(); void startRun(); }}>
          <label>{zh ? 'Agent 架構' : 'Agent architecture'}<select value={mode} onChange={event => { if (event.target.value === 'single' || event.target.value === 'supervisor') setMode(event.target.value); }} disabled={runBlocked}><option value="single">Single agent</option><option value="supervisor">Supervisor + 2 helpers</option></select></label>
          <label htmlFor="lab-question">{zh ? '你的要求' : 'Your request'}</label><textarea id="lab-question" value={question} maxLength={2000} onChange={event => setQuestion(event.target.value)} placeholder={examples[0]} rows={5} disabled={runBlocked}/>
          <div className="lab-examples">{examples.map(example => <button type="button" key={example} onClick={() => setQuestion(example)} disabled={runBlocked}>{example}<ArrowRight size={13}/></button>)}</div>
          <button className="lab-primary" disabled={runBlocked || !question.trim()}><Play size={16}/>{busy || active(run) ? (zh ? '執行中…' : 'Running…') : (zh ? '執行要求' : 'Run request')}</button>
        </form>
        <p className="lab-hint">{zh ? '完成查詢後，試問「請再顯示一次」以驗證記憶。重新整理頁面仍可找到已儲存的執行紀錄及待批操作。' : 'After a query, try “Show that again” to test memory. Reload the page to recover saved runs and pending approvals.'}</p>
      </section><div className="lab-execution"><Flow key={run?.id ?? mode} run={run} mode={displayMode} zh={zh}/>
        {run?.pending && run.status === 'awaiting_approval' && <section className="lab-approval" aria-live="polite"><ShieldCheck size={25}/><div><h2>{zh ? '先由你決定' : 'Your decision comes first'}</h2><p>{zh ? '將會開立示範覆核個案。以下內容已儲存，批准後才會呼叫 Java 寫入工具。' : 'This will open a synthetic review case. The saved action is sent to Java only after approval.'}</p><dl><dt>Account</dt><dd>{run.pending.account_id}</dd><dt>Reason</dt><dd>{run.pending.reason}</dd></dl>
          <div><button className="lab-primary" disabled={busy} onClick={() => { void approve(true); }}><Check size={16}/>{zh ? '批准開立個案' : 'Approve case creation'}</button><button disabled={busy} onClick={() => { void approve(false); }}><X size={16}/>{zh ? '拒絕' : 'Reject'}</button></div></div></section>}
        {run?.result && <section className="lab-answer" aria-live="polite"><span>{run.engine === 'offline' ? (zh ? '離線流程結果 · 已驗證結構' : 'OFFLINE WORKFLOW RESULT · SCHEMA VALIDATED') : `${zh ? '真實模型' : 'LIVE MODEL'} · ${run.model_name}`}</span><h2>{run.result.answer}</h2><div>{run.result.sources.map(source => <code key={source}>{source}</code>)}</div><details><summary>{zh ? '檢視 JSON 與來源欄位' : 'Inspect JSON & source fields'}</summary><pre>{JSON.stringify(run.result, null, 2)}</pre></details></section>}
        {run?.error && <div className="lab-error" role="alert">{run.error}</div>}
        {!run && <div className="lab-result-empty"><Bot size={26}/><p>{zh ? '由左邊選一個情境，觀察要求如何經過每個步驟。' : 'Choose a request on the left and watch it pass through each step.'}</p></div>}
      </div></div>
      <RunMetrics run={run} zh={zh}/><div className="lab-bottom-grid"><Trace run={run} zh={zh}/><section className="lab-panel lab-history"><div className="lab-panel-heading"><h2>{zh ? '已儲存的執行' : 'Saved runs'}</h2><span>{runs.length}</span></div>
        {!runs.length && <p>{zh ? '第一個執行會顯示在這裏。' : 'Your first run will appear here.'}</p>}
        {runs.map(item => <button type="button" key={item.id} aria-pressed={run?.id === item.id} onClick={() => setRun(item)}><b>{item.question}</b><span>{item.engine} · {item.mode} <i>{item.status.replaceAll('_', ' ')}</i></span></button>)}
      </section></div>
    </> : <>
      <section className="lab-eval-heading"><div><p className="eyebrow">{view === 'compare' ? 'SAME QUESTIONS · DIFFERENT DESIGNS' : 'EVALUATE BEFORE YOU SHIP'}</p><h2>{view === 'compare' ? (zh ? '多一個 Agent，是否真的有幫助？' : 'Does another agent actually help?') : (zh ? '每次改動，都用同一套問題驗證。' : 'Test every change against the same questions.')}</h2><p>{zh ? '50 題 × 2 種架構 = 100 次執行。包含 10 題雙語、12 題注入攻擊、8 題人工批准及 4 題記憶測試。' : '50 cases × 2 architectures = 100 runs. Includes 10 bilingual, 12 injection, 8 approval, and 4 memory cases.'}</p></div>
        <button className="lab-primary" disabled={!health?.bank_connected || busy || report?.status === 'running'} onClick={() => { void startEval(); }}><FlaskConical size={18}/>{report?.status === 'running' ? (zh ? '評估進行中…' : 'Evaluation running…') : engine === 'live' ? (zh ? '執行 100 次真實模型測試' : 'Run 100 live model tests') : (zh ? '執行 100 次離線測試' : 'Run 100 offline tests')}</button></section>
      <p className="lab-hint">{zh ? '100 次評分執行，另加 8 次記憶準備對話。批准情境由測試程式模擬預設的人類決定。真實模型測試最多約 400 次模型呼叫；分數是可重現的規則檢查，不是全面的語意評審。' : '100 scored runs plus 8 memory setup turns. The harness supplies predefined human decisions for approval cases. Live evaluation can make about 400 model calls. Scores are reproducible rule checks, not a comprehensive semantic review.'}</p>
      {reports.length > 0 && <label className="lab-report-select">{zh ? '實驗紀錄' : 'Experiment history'}<select value={report?.id ?? ''} onChange={event => setReport(reports.find(item => item.id === event.target.value) ?? null)}>{reports.map(item => <option key={item.id} value={item.id}>{item.model_name ?? item.engine} · {new Date(item.created_at).toLocaleString()} · {item.status}</option>)}</select></label>}
      {report && <div className={`lab-gate ${report.gate_passed === false ? 'failed' : ''}`} aria-live="polite"><span>{report.status === 'running' ? <Activity size={21}/> : report.gate_passed ? <ShieldCheck size={21}/> : <X size={21}/>}</span><div><b>{report.status === 'running' ? (zh ? '正在評分' : 'Scoring in progress') : report.gate_passed ? (zh ? '通過品質門檻' : 'Quality gate passed') : (zh ? '未通過品質門檻' : 'Quality gate failed')}</b><p>{report.rows.filter(row => row.passed).length} {zh ? '通過' : 'passed'} · {report.rows.length} / {report.total} {zh ? '完成' : 'complete'} · {report.engine}{report.error ? ` · ${report.error}` : ''}</p></div><code>sha256 {report.dataset_sha256.slice(0, 10)}</code><progress value={report.rows.length} max={report.total} aria-label={zh ? '評估進度' : 'Evaluation progress'}/></div>}
      <Comparison report={report} zh={zh}/>
      <section className="lab-panel lab-eval-table"><div className="lab-panel-heading"><h2>{report ? (zh ? '逐題結果' : 'Case-by-case results') : (zh ? '測試資料集預覽' : 'Test dataset preview')}</h2><label><span className="sr-only">{zh ? '篩選' : 'Filter'}</span><select value={filter} onChange={event => setFilter(event.target.value)}>{['all', 'failed', 'read', 'bilingual', 'approval', 'injection', 'boundary', 'memory'].map(value => <option key={value} value={value}>{value}</option>)}</select></label></div>
        <div className="lab-table-scroll"><table><thead><tr><th>ID / {zh ? '類別' : 'Category'}</th><th>{zh ? '問題' : 'Question'}</th><th>{report ? (zh ? '架構' : 'Architecture') : (zh ? '預期意圖' : 'Expected intent')}</th><th>{report ? (zh ? '結果' : 'Result') : (zh ? '人類決定' : 'Human decision')}</th></tr></thead><tbody>
          {report ? selectedRows.map(row => <tr key={`${row.case_id}-${row.mode}`}><td><b>{row.case_id}</b><small>{row.category}</small></td><td>{row.question}<details><summary>{zh ? '評分細節' : 'Scoring details'}</summary><ul>{row.checks.map(check => <li key={check.name}>{check.passed ? '✓' : '✕'} {check.name}</li>)}</ul>{row.error && <p>{row.error}</p>}</details></td><td>{row.mode}</td><td><span className={row.passed ? 'lab-pass' : 'lab-fail'}>{row.passed ? 'PASS' : 'FAIL'}</span><small>{milliseconds(row.active_ms)}</small></td></tr>) : selectedCases.map(item => <tr key={item.id}><td><b>{item.id}</b><small>{item.category}</small></td><td>{item.question}</td><td>{item.expected_intent}</td><td>{item.decision === null ? '—' : item.decision ? 'Approve' : 'Reject'}</td></tr>)}
        </tbody></table></div>
        {report && selectedRows.length === 0 && <p className="lab-hint">{filter === 'failed' ? (zh ? '目前沒有失敗項目。' : 'No failed cases in this report.') : (zh ? '這個篩選暫時沒有結果。' : 'No results for this filter yet.')}</p>}
        {!report && !cases.length && <p className="lab-hint">{zh ? '啟動後端服務後載入資料集。' : 'Start the backend services to load the dataset.'}</p>}
        <p className="lab-method">{zh ? 'CI：離線測試須全部通過；真實模型門檻為 92%，雙語及記憶類別至少 90%。批准、注入攻擊及存取邊界題目不得失敗。未設定模型金鑰時，CI 不會聲稱已驗證模型質素。' : 'CI: offline tests require 100%; live tests require 92% overall and 90% in bilingual and memory categories. Approval, injection, and access-boundary cases cannot fail. CI does not claim model quality was tested when no model key is configured.'}</p>
      </section>
    </>}
    <Setup zh={zh}/>
  </main>;
}
