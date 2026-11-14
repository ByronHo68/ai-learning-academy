'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Database, GitBranch, Pause, Play, RotateCcw, Save } from 'lucide-react';
import { pick, type Copy, type Lang } from '../lib/curriculum';
import { checkpointApplications, checkpointArchitectureDiagram, checkpointConcepts, checkpointDemoCanStep, checkpointDemoScenarios, checkpointDemoSnapshot, checkpointDemoTransition, checkpointRecoveryDiagram, checkpointReferences, checkpointThreadId, createCheckpointDemo, type CheckpointDemoAction, type CheckpointPhase } from '../lib/finance-checkpoints';
import { checkpointExampleCommands, checkpointPythonExample } from '../lib/finance-checkpoint-code';
import { FinanceDiagramCanvas } from './finance-diagram';

const phaseLabels: Record<CheckpointPhase, Copy> = {
  new: { en: 'Not started', zh: '未開始' }, accepted: { en: 'Accepted → refresh next', zh: '已接納 → 下一步刷新' },
  fetched: { en: 'News receipt saved', zh: '已存新聞收據' }, ranked: { en: 'Snapshot + ranking ready', zh: '快照及排序就緒' },
  review: { en: 'Paused for evidence review', zh: '暫停等證據覆核' }, reviewed: { en: 'Selection validated', zh: '選取已驗證' }, done: { en: 'Fictional result saved', zh: '虛構結果已存' },
};
const phaseOrder: CheckpointPhase[] = ['new', 'accepted', 'fetched', 'ranked', 'review', 'reviewed', 'done'];

function CheckpointDemo({ lang }: { lang: Lang }) {
  const [model, setModel] = useState(() => createCheckpointDemo('durable'));
  const [playing, setPlaying] = useState(false);
  const [order, setOrder] = useState<'recommended' | 'costs_first'>('recommended');
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const scenario = checkpointDemoScenarios.find(item => item.id === model.scenario) ?? checkpointDemoScenarios[0];
  const latest = model.history.at(-1);
  const inspected = model.history.find(item => item.id === inspectedId) ?? latest;
  const canStep = checkpointDemoCanStep(model);
  const atReview = model.live?.phase === 'review';
  function act(action: CheckpointDemoAction) {
    setPlaying(false);
    if (action.type === 'reset') { setInspectedId(null); setOrder('recommended'); }
    setModel(current => checkpointDemoTransition(current, action));
  }
  useEffect(() => {
    if (!playing || !canStep) return;
    const timer = window.setTimeout(() => {
      const updated = checkpointDemoTransition(model, { type: 'step' });
      setModel(updated);
      if (!checkpointDemoCanStep(updated)) setPlaying(false);
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [playing, canStep, model]);
  useEffect(() => {
    const pause = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);
  return <section className="finance-section" id="checkpoint-demo">
    <p className="eyebrow">TRY IT · SAVE → RESTART → RECOVER</p>
    <h2>{lang === 'zh' ? '關掉程序後，哪些進度仍然存在？' : 'What survives when the app process stops?'}</h2>
    <div className="mcp-choice-row" role="group" aria-label={lang === 'zh' ? 'Checkpoint 情境' : 'Checkpoint scenario'}>{checkpointDemoScenarios.map(item => <button type="button" key={item.id} aria-pressed={model.scenario === item.id} onClick={() => act({ type: 'reset', scenario: item.id })}>{pick(item.title, lang)}</button>)}</div>
    <p className="cp-instruction">{pick(scenario.instruction, lang)}</p>
    <ol className="cp-stage-rail" aria-label={lang === 'zh' ? '模擬研究階段' : 'Simulated research stages'}>{phaseOrder.map(phase => <li key={phase} data-current={model.live?.phase === phase} aria-current={model.live?.phase === phase ? 'step' : undefined}>{pick(phaseLabels[phase], lang)}</li>)}</ol>
    <div className="cp-save-flow" data-playing={playing && model.scenario !== 'memory_only'} aria-label={lang === 'zh' ? '保存進度的資料流' : 'Progress persistence data flow'}><span>Graph state</span><span className="cp-save-arrow" aria-hidden="true">→</span><strong>{model.scenario === 'memory_only' ? 'RAM only' : 'AsyncPostgresSaver'}</strong><span className="cp-save-arrow" aria-hidden="true">→</span><span>{model.scenario === 'memory_only' ? (lang === 'zh' ? '沒有持久 checkpoint' : 'No durable checkpoint') : 'PostgreSQL checkpoint'}</span></div>
    <div className="cp-actions">
      <button type="button" className="primary-action" disabled={!canStep} onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={16}/> : <Play size={16}/>} {lang === 'zh' ? (playing ? '暫停播放' : '播放至覆核／故障') : (playing ? 'Pause playback' : 'Play to review / crash')}</button>
      <button type="button" disabled={!canStep} onClick={() => act({ type: 'step' })}>{lang === 'zh' ? '下一個階段' : 'Next stage'}</button>
      <button type="button" disabled={model.live === null || model.live.phase === 'new'} onClick={() => act({ type: 'restart' })}>{lang === 'zh' ? '模擬 app 重啟' : 'Simulate app restart'}</button>
      <button type="button" disabled={model.live !== null} onClick={() => act({ type: 'recover' })}>{lang === 'zh' ? '找回保存任務' : 'Recover saved run'}</button>
      <button type="button" onClick={() => act({ type: 'reset', scenario: model.scenario })}><RotateCcw size={15}/> {lang === 'zh' ? '重設此情境' : 'Reset scenario'}</button>
    </div>
    <p className="cp-status" role="status" aria-live={playing ? 'off' : 'polite'}>{pick(model.message, lang)}</p>
    <div className="cp-storage-grid">
      <article><h3>{lang === 'zh' ? 'App RAM（模擬）' : 'App RAM (simulated)'}</h3><strong>{model.live ? pick(phaseLabels[model.live.phase], lang) : (lang === 'zh' ? '程序已停止，RAM 已空' : 'Process stopped; RAM empty')}</strong><p>{lang === 'zh' ? '程序內狀態；模擬重啟會清空此面板。' : 'In-process state. Simulated restart clears this panel.'}</p><pre><code>{model.live ? JSON.stringify(model.live, null, 2) : 'null'}</code></pre></article>
      <article><h3><Save size={18}/> {lang === 'zh' ? 'Checkpoint DB（模擬）' : 'Checkpoint DB (simulated)'}</h3><strong>{latest?.id ?? (lang === 'zh' ? '未有持久 checkpoint' : 'No durable checkpoint')}</strong><p>{model.scenario === 'memory_only' ? (lang === 'zh' ? '此比較只用程序記憶，沒有持久 saver。' : 'This comparison keeps progress only in process memory.') : (lang === 'zh' ? '此教學假設 sync durability 已完成寫入；不是真實資料庫。' : 'This lesson assumes sync durability has finished each shown write. This is not a real database.')}</p><p><code>thread_id: {checkpointThreadId}</code></p><p>{lang === 'zh' ? '最新下一節點：' : 'Latest next nodes: '}<code>{latest ? latest.next.join(' → ') || 'END' : '—'}</code></p><p>{lang === 'zh' ? 'n8n 收據（獨立於 checkpoint）：' : 'n8n receipt (separate from checkpoint): '}<strong>{model.receipt ? 'committed' : 'none'}</strong></p></article>
    </div>
    <div className="cp-counters" aria-label={lang === 'zh' ? '模擬計數，並非真實呼叫' : 'Simulation counters, not real calls'}>
      <p>{lang === 'zh' ? '模擬供應商抓取' : 'Simulated provider fetches'} <strong>{model.providerFetches}</strong></p><p>{lang === 'zh' ? '收據核對' : 'Receipt reconciliations'} <strong>{model.reconciliations}</strong></p><p>{lang === 'zh' ? '覆核節點進入次數' : 'Review node entries'} <strong>{model.reviewEntries}</strong></p><p>{lang === 'zh' ? '虛構生成階段' : 'Fictional generation stages'} <strong>{model.generationStages}</strong></p>
    </div>
    <p>{lang === 'zh' ? '真實外部呼叫：0。預算數字為示例，不是延遲量度。這裡的「重啟」只清空模擬 RAM；重新整理整個網頁會重設教材。' : 'Real external calls: 0. Budget numbers are illustrative, not latency measurements. Restart clears simulated RAM only; reloading the webpage resets the lesson.'}</p>
    <fieldset className="cp-review"><legend>{lang === 'zh' ? '覆核選取（虛構來源）' : 'Review selection (fictional sources)'}</legend>
      <label><input type="radio" name="checkpoint-order" checked={order === 'recommended'} onChange={() => setOrder('recommended')}/>{lang === 'zh' ? '系統建議：需求 → 成本' : 'Recommended: demand → costs'}</label>
      <label><input type="radio" name="checkpoint-order" checked={order === 'costs_first'} onChange={() => setOrder('costs_first')}/>{lang === 'zh' ? '我的次序：成本 → 需求' : 'My order: costs → demand'}</label>
      <div className="cp-actions"><button type="button" disabled={!atReview || model.blocked} onClick={() => act({ type: 'submit', order })}>{lang === 'zh' ? '提交選取並恢復' : 'Submit selection and resume'}</button><button type="button" disabled={!atReview || model.expired || model.blocked} onClick={() => act({ type: 'expire' })}>{lang === 'zh' ? '模擬覆核過期' : 'Expire review window'}</button></div>
    </fieldset>
    <details className="proposal-workflow" open={model.history.length > 0}><summary>{lang === 'zh' ? '查看 checkpoint 歷史及狀態內容' : 'Inspect checkpoint history and saved state'}</summary><p>{lang === 'zh' ? '點歷史只作查看，不會回到舊狀態執行。ID 及欄位是可讀教學視圖，不是原始 PostgreSQL 表格式。' : 'History selection only inspects data; it does not replay the run. IDs and fields form a readable teaching view, not the raw PostgreSQL table format.'}</p><div className="cp-history">{model.history.map(item => <button type="button" key={item.id} aria-pressed={inspected?.id === item.id} onClick={() => setInspectedId(item.id)}>{item.id} · {pick(phaseLabels[item.values.phase], lang)}</button>)}</div><button type="button" onClick={() => setInspectedId(null)}>{lang === 'zh' ? '查看最新版本' : 'Inspect latest'}</button><pre className="fr-tree"><code>{JSON.stringify(checkpointDemoSnapshot(inspected), null, 2)}</code></pre></details>
  </section>;
}

export default function FinanceCheckpointsContent({ lang }: { lang: Lang }) {
  const [conceptId, setConceptId] = useState('graph');
  const concept = checkpointConcepts.find(item => item.id === conceptId) ?? checkpointConcepts[0];
  return <main className="utility-page finance-page cp-page">
    <Link className="fr-inline-link" href="/finance-project"><ArrowLeft size={16}/>{lang === 'zh' ? '返回股票研究項目' : 'Back to the stock research project'}</Link>
    <header className="utility-hero"><p className="eyebrow">LANGGRAPH · AsyncPostgresSaver · CHECKPOINTS</p><h1>{lang === 'zh' ? '存低研究進度，重啟之後接住做。' : 'Save research progress. Continue after a restart.'}</h1><p>{lang === 'zh' ? 'LangGraph 執行流程；AsyncPostgresSaver 存取進度；checkpoint 是一份保存版本。用你的新聞研究流程，把三者分開看清楚。' : 'LangGraph runs the workflow. AsyncPostgresSaver saves and loads progress. A checkpoint is one saved version. Explore all three through your news-research project.'}</p><div className="fr-hero-actions"><a className="primary-action" href="#checkpoint-demo"><Play size={17}/>{lang === 'zh' ? '試模擬重啟及恢復' : 'Try restart and recovery'}</a><a className="secondary-action" href="#checkpoint-project-flow"><GitBranch size={17}/>{lang === 'zh' ? '看項目流程圖' : 'See the project workflow'}</a><a className="secondary-action" href="/downloads/stock-research-checkpoints-guide.md" download>{lang === 'zh' ? '下載雙語指南' : 'Download bilingual guide'}</a></div></header>
    <div className="fr-disclosure"><Database size={23}/><p>{lang === 'zh' ? '本頁是可操作的離線模擬，不會連 PostgreSQL、n8n 或 LLM，也不是已實作的金融後端。下載的 Python 教學程式需另設私人 PostgreSQL；語法已檢查，真實資料庫執行為 NOT RUN。' : 'This page is an interactive offline simulation. It connects to no PostgreSQL, n8n or LLM and does not implement the finance backend. The downloadable Python tutorial needs a separate private PostgreSQL database; syntax is checked, live database execution is NOT RUN.'}</p></div>
    <section className="finance-section" id="checkpoint-mindmap"><h2>{lang === 'zh' ? '心智圖：誰負責甚麼？' : 'Mind map: who does what?'}</h2><div className="cp-map-root"><GitBranch size={23}/>{lang === 'zh' ? '一個可恢復的研究任務' : 'One recoverable research run'}</div><div className="cp-mindmap">{checkpointConcepts.map(item => <button type="button" key={item.id} aria-pressed={conceptId === item.id} onClick={() => setConceptId(item.id)}><strong>{pick(item.title, lang)}</strong><span>{pick(item.short, lang)}</span></button>)}</div><article className="cp-concept" aria-live="polite"><h3>{pick(concept.title, lang)}</h3><p>{pick(concept.body, lang)}</p></article></section>
    <CheckpointDemo lang={lang}/>
    <section className="finance-section" id="checkpoint-project-flow"><h2>{lang === 'zh' ? '在你的項目，接在哪裡？' : 'Where does this apply in your project?'}</h2><FinanceDiagramCanvas diagram={checkpointArchitectureDiagram} lang={lang}/><h3>{lang === 'zh' ? '失敗恢復與覆核恢復，入口不同' : 'Failure recovery and review resume use different inputs'}</h3><FinanceDiagramCanvas diagram={checkpointRecoveryDiagram} lang={lang}/><div className="fr-scope-grid fr-evidence-grid">{checkpointApplications.map(item => <article key={item.title.en}><h3>{pick(item.title, lang)}</h3><p>{pick(item.body, lang)}</p></article>)}</div></section>
    <section className="finance-section" id="checkpoint-code"><h2>{lang === 'zh' ? 'Python 範例：兩次程序，共用同一個 thread' : 'Python example: two processes, one saved thread'}</h2><p>{lang === 'zh' ? '這是單用戶教學 CLI，只有虛構來源，不抓新聞或生成金融報告。Production API 仍須加擁有權、版本、權限、時限及預算驗證；範例不等於完整 app。' : 'This single-user teaching CLI uses fictional sources and makes no news or model calls. A production API still needs ownership, revision, permission, expiry and budget checks; the tutorial is not a complete app.'}</p><pre className="fr-tree"><code>{checkpointExampleCommands}</code></pre><details className="proposal-workflow"><summary>{lang === 'zh' ? '查看完整 Python 範例' : 'Inspect the complete Python example'}</summary><pre className="fr-tree"><code>{checkpointPythonExample}</code></pre></details><p><a href="/downloads/stock-research-checkpoint-demo.py" download>{lang === 'zh' ? '下載 Python 教學程式' : 'Download Python tutorial'}</a> · <Link href="/finance-project#finance-evidence-review">{lang === 'zh' ? '試來源排除與排序' : 'Try source exclusions and ordering'}</Link> · <Link href="/finance-project/n8n">{lang === 'zh' ? '看 n8n 收據及重試' : 'Explore n8n receipts and retries'}</Link></p></section>
    <section className="finance-section"><h2>{lang === 'zh' ? '官方參考' : 'Official references'}</h2><ul>{checkpointReferences.map(item => <li key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></li>)}</ul></section>
  </main>;
}
