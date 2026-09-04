'use client';

import Link from 'next/link';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Lang, Topic, pick, sources, topicById, topics } from '../lib/curriculum';
import {
  AcademyState, Attempt, TopicProgress, TopicStatus, createReviewItems,
  deriveStatus, emptyProgress, initialState, mergeProgress, normalizeAcademyState, scorePercent,
} from '../lib/progress';

const STORAGE_KEY = 'ai-academy-progress-v1';

const ui = {
  zh: {
    path:'學習路線', review:'溫習', assessment:'總評', map:'概念圖', glossary:'詞彙', settings:'設定', start:'開始第一課', continue:'繼續學習',
    progress:'整體進度', mastered:'主題已掌握', dashboard:'課程總覽', verified:'資料核實', foundation:'持久基礎', current:'當前發展',
    learn:'理解', examples:'例子', practice:'練習', quiz:'測驗', recap:'重點溫習', sources:'來源', next:'下一步', previous:'上一步',
  },
  en: {
    path:'Learning path', review:'Review', assessment:'Assessment', map:'Concept map', glossary:'Glossary', settings:'Settings', start:'Start topic one', continue:'Continue learning',
    progress:'Overall progress', mastered:'topics mastered', dashboard:'Course overview', verified:'Verification', foundation:'Durable foundation', current:'Current developments',
    learn:'Learn', examples:'Examples', practice:'Practice', quiz:'Quiz', recap:'Review', sources:'Sources', next:'Next', previous:'Previous',
  },
};

function useAcademyState() {
  const [state, setState] = useState<AcademyState>(initialState);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame=window.requestAnimationFrame(()=>{
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed:unknown = JSON.parse(stored);
          const normalized = normalizeAcademyState(parsed);
          if (normalized) setState(normalized);
        }
      } catch { /* Corrupt local progress falls back safely. */ }
      setReady(true);
    });
    return()=>window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => { if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state, ready]);
  useEffect(() => { document.documentElement.lang = state.lang === 'zh' ? 'zh-Hant' : 'en'; }, [state.lang]);
  return { state, setState, ready };
}

function useClock(){
  const [now,setNow]=useState(0);
  useEffect(()=>{const tick=()=>setNow(Date.now());const first=window.setTimeout(tick,0);const interval=window.setInterval(tick,60_000);return()=>{window.clearTimeout(first);window.clearInterval(interval)}},[]);
  return now;
}

function Header({ lang, setLang }: { lang:Lang; setLang:(lang:Lang)=>void }) {
  const text = ui[lang];
  return (
    <header className="app-header">
      <a className="skip-link" href="#main-content">{lang === 'zh' ? '跳到主要內容' : 'Skip to main content'}</a>
      <Link className="brand" href="/" aria-label={lang === 'zh' ? 'AI 學習院首頁' : 'AI Academy home'}>
        <span className="brand-mark" aria-hidden="true">AI</span>
        <span><strong>{lang === 'zh' ? 'AI 學習院' : 'AI Academy'}</strong><small>Visual learning academy</small></span>
      </Link>
      <nav className="app-nav" aria-label={lang === 'zh' ? '主要導覽' : 'Primary navigation'}>
        <Link href="/">{text.path}</Link><Link href="/review">{text.review}</Link><Link href="/assessment">{text.assessment}</Link><Link href="/concept-map">{text.map}</Link><Link href="/glossary">{text.glossary}</Link>
      </nav>
      <div className="header-actions">
        <button className="language-button" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} type="button" aria-label={lang === 'zh' ? 'Switch to English' : '切換到繁體中文'}>
          <b className={lang === 'zh' ? 'active-lang' : ''}>繁中</b><span aria-hidden="true">/</span><b className={lang === 'en' ? 'active-lang' : ''}>EN β</b>
        </button>
        <Link className="settings-link" href="/settings" aria-label={text.settings}>⚙</Link>
      </div>
    </header>
  );
}

function OnlineBanner({ lang }:{ lang:Lang }){
  const [online,setOnline]=useState(true);
  useEffect(()=>{const sync=()=>setOnline(window.navigator.onLine);window.addEventListener('online',sync);window.addEventListener('offline',sync);const timer=window.setTimeout(sync,0);return()=>{window.clearTimeout(timer);window.removeEventListener('online',sync);window.removeEventListener('offline',sync)}},[]);
  return online?null:<div className="offline-banner" role="status"><b>{lang==='zh'?'離線模式':'Offline mode'}</b><span>{lang==='zh'?'課堂、測驗同進度仍可用；外部來源連結要恢復連線先開到。':'Lessons, quizzes, and local progress still work; external sources require a connection.'}</span></div>;
}

function Shell({ children, state, setState }: { children:React.ReactNode; state:AcademyState; setState:React.Dispatch<React.SetStateAction<AcademyState>> }) {
  const setLang = (lang:Lang) => setState((current) => ({ ...current, lang }));
  return <><Header lang={state.lang} setLang={setLang}/><OnlineBanner lang={state.lang}/><div id="main-content" tabIndex={-1}>{children}</div><footer className="site-footer"><span>AI 學習院 · Visual AI Academy</span><span>Local-first learning · Verified 2026-09-03</span></footer></>;
}

const stateLabel = (status:TopicStatus, lang:Lang) => ({
  'not-started':lang === 'zh' ? '未開始' : 'Not started',
  'in-progress':lang === 'zh' ? '進行中' : 'In progress',
  'needs-review':lang === 'zh' ? '需要溫習' : 'Needs review',
  mastered:lang === 'zh' ? '已掌握' : 'Mastered',
}[status]);

function DashboardIntelligence({ state }: { state:AcademyState }) {
  const lang=state.lang; const now=useClock(); const due=state.reviewQueue.filter((item)=>!item.done&&Date.parse(item.dueAt)<=now).length; const scheduled=state.reviewQueue.filter((item)=>!item.done&&Date.parse(item.dueAt)>now).length;
  const reviewDate='2026-09-03'; const ageDays=Math.max(0,Math.floor((now-Date.parse(`${reviewDate}T00:00:00+08:00`))/86_400_000)); const stale=ageDays>30;
  const frontier=[
    {status:'Stable',title:lang==='zh'?'Responses 係 OpenAI 新項目建議入口':'Responses is OpenAI’s recommended entry point for new projects',source:'openai-responses'},
    {status:'Stable',title:lang==='zh'?'MCP 2026-07-28 採用逐 request 無狀態核心':'MCP 2026-07-28 uses a stateless per-request core',source:'mcp'},
    {status:'Stable',title:lang==='zh'?'A2A 1.0 定義 agent 任務互通':'A2A 1.0 defines interoperable agent tasks',source:'a2a'},
    {status:'Watch',title:lang==='zh'?'Realtime transport、模型同 voice 仍快速演進':'Realtime transports, models, and voices keep evolving',source:'openai-realtime'},
  ];
  return <section className="dashboard-intelligence" aria-labelledby="content-health-title">
    <div className="dashboard-status-grid">
      <article><span>01</span><p>{lang==='zh'?'到期溫習':'Reviews due'}</p><strong>{due}</strong><small>{scheduled} {lang==='zh'?'項已排期':'scheduled'}</small><Link href="/review">{lang==='zh'?'開啟隊列':'Open queue'} →</Link></article>
      <article><span>02</span><p>{lang==='zh'?'內容新鮮度':'Content freshness'}</p><strong className={stale?'stale':''}>{stale?(lang==='zh'?'需核實':'Review due'):(lang==='zh'?'最新':'Current')}</strong><small>{lang==='zh'?'最後核實':'Verified'} <time dateTime={reviewDate}>{reviewDate}</time> · 30-day threshold</small><Link href="/learn/ai-python-foundations">{lang==='zh'?'查看有日期來源':'See dated sources'} →</Link></article>
      <article><span>03</span><p>{lang==='zh'?'跨主題能力':'Cross-topic readiness'}</p><strong>{state.cumulative.bestScore}%</strong><small>{state.cumulative.capstoneComplete?(lang==='zh'?'Capstone 已完成':'Capstone complete'):(lang==='zh'?'Capstone 未完成':'Capstone pending')}</small><Link href="/assessment">{lang==='zh'?'開始總評':'Start assessment'} →</Link></article>
    </div>
    <div className="frontier-watch"><header><div><p className="eyebrow">FRONTIER WATCH</p><h2 id="content-health-title">{lang==='zh'?'會變嘅資訊，同持久概念分開':'Changeable facts, kept separate from durable concepts'}</h2></div><time dateTime={reviewDate}>{lang==='zh'?'核實於':'Verified'} {reviewDate}</time></header><div>{frontier.map((item)=>{const source=sources.find((entry)=>entry.id===item.source);return <a href={source?.url} target="_blank" rel="noreferrer" key={item.source}><span>{item.status}</span><b>{item.title}</b><i>↗</i></a>})}</div></div>
  </section>;
}

function Dashboard({ state, setState }: { state:AcademyState; setState:React.Dispatch<React.SetStateAction<AcademyState>> }) {
  const lang = state.lang; const text = ui[lang];
  const mastered = Object.values(state.topicProgress).filter((item) => item.status === 'mastered').length;
  const percent = Math.round((mastered / topics.length) * 100);
  const currentTopic = topics.find((topic) => ['not-started','in-progress','needs-review'].includes(state.topicProgress[topic.id].status)) ?? topics[0];
  const safetyLabels = lang === 'zh'
    ? ['已輪換任何曾外露嘅 credentials','只使用獲授權或合成資料','Secrets 由 server 環境注入，logs 已遮罩','清楚標示已實作、已驗證、設計同下一步']
    : ['Rotate any exposed credentials','Use only authorized or synthetic data','Inject secrets server-side and redact logs','Label implemented, verified, designed, and next'];
  const toggleSafety = (index:number) => setState((current) => ({ ...current, safetyChecks:current.safetyChecks.map((value, itemIndex) => itemIndex === index ? !value : value) }));
  return (
    <Shell state={state} setState={setState}>
      <main>
        <section className="dashboard-hero">
          <div className="dashboard-copy">
            <p className="eyebrow"><span>13 {lang === 'zh' ? '個主題' : 'TOPICS'}</span> · {lang === 'zh' ? '由基礎到安全上線' : 'FOUNDATIONS TO SAFE RELEASE'}</p>
            <h1>{lang === 'zh' ? <>唔只識用 AI。<br/>真正理解佢點運作。</> : <>Don’t just use AI.<br/>Understand how it works.</>}</h1>
            <p className="hero-lede">{lang === 'zh' ? '用可控制動畫、參數實驗、真實失敗案例同精準回饋，由一個安全 request 行到完整 AI system。' : 'Learn through controlled visuals, parameter labs, real failure cases, and precise feedback—from one safe request to a complete AI system.'}</p>
            <div className="hero-actions"><Link className="primary-action" href={`/learn/${currentTopic.slug}`}>{mastered ? text.continue : text.start}<span aria-hidden="true">→</span></Link><Link className="secondary-action" href="/concept-map">{text.map}</Link></div>
            <div className="trust-row"><span>✓ {lang === 'zh' ? '本機儲存進度' : 'Local progress'}</span><span>✓ {lang === 'zh' ? '無需付費 API' : 'No paid API'}</span><span>✓ {lang === 'zh' ? '鍵盤與減少動態支援' : 'Keyboard & reduced motion'}</span></div>
          </div>
          <div className="progress-orbit" aria-label={`${text.progress}: ${percent}%`}>
            <div className="orbit-heading"><div><small>{text.progress}</small><strong>{percent}%</strong></div><span>{mastered}/13</span></div>
            <div className="orbit-track"><i style={{ width:`${Math.max(percent,2)}%` }}/></div>
            <div className="mini-path">
              {topics.slice(0,6).map((topic,index) => <div className={`mini-node ${state.topicProgress[topic.id].status}`} key={topic.id}><b>{String(index+1).padStart(2,'0')}</b><span>{pick(topic.title,lang)}</span><em>{stateLabel(state.topicProgress[topic.id].status,lang)}</em></div>)}
            </div>
            <Link className="continue-card" href={`/learn/${currentTopic.slug}`}><span><small>{text.continue}</small><b>{pick(currentTopic.title,lang)}</b></span><i aria-hidden="true">→</i></Link>
          </div>
        </section>

        <section className="safety-gate" aria-labelledby="safety-title">
          <div className="gate-number">P0</div><div className="gate-copy"><p className="eyebrow">{lang === 'zh' ? '開始之前' : 'BEFORE YOU START'}</p><h2 id="safety-title">{lang === 'zh' ? '安全重設 · Safety reset' : 'Safety reset'}</h2><p>{lang === 'zh' ? '呢啲唔係閱讀任務，而係開始做 AI project 前要確認嘅工程底線。' : 'These are engineering preconditions before an AI project—not reading achievements.'}</p></div>
          <div className="safety-list">{safetyLabels.map((label,index) => <label key={label}><input type="checkbox" checked={state.safetyChecks[index]} onChange={() => toggleSafety(index)}/><span aria-hidden="true">✓</span>{label}</label>)}</div>
        </section>

        <section className="learning-loop-section"><div><p className="eyebrow">{lang === 'zh' ? '每課同一節奏' : 'ONE REPEATABLE RHYTHM'}</p><h2>{lang === 'zh' ? '掃、畫、跑、改、講' : 'Scan, Map, Run, Change, Explain'}</h2></div><div className="loop-track">{[['掃','Scan','10m'],['畫','Map','15m'],['跑','Run','45m'],['改','Change','20m'],['講','Explain','5m']].map(([zh,en,time],index)=><div className="loop-step" key={zh}><span>{String(index+1).padStart(2,'0')}</span><b>{lang === 'zh' ? zh : en}</b><small>{lang === 'zh' ? en : time}</small><em>{time}</em></div>)}</div></section>

        <DashboardIntelligence state={state}/>

        <section className="course-section" id="path">
          <div className="section-heading"><div><p className="eyebrow">{text.dashboard}</p><h2>{lang === 'zh' ? '由安全 request，行到可靠 AI 系統' : 'From a safe request to a reliable AI system'}</h2></div><div className="progress-summary"><div><span>{text.progress}</span><b>{percent}%</b></div><div className="progress-track"><i style={{width:`${Math.max(percent,2)}%`}}/></div><small>{mastered} / 13 {text.mastered}</small></div></div>
          <div className="full-module-grid">{topics.map((topic) => {
            const progress=state.topicProgress[topic.id];
            return <article className={`course-card ${progress.status}`} key={topic.id}>
              <div className="course-card-top"><span>{String(topic.order).padStart(2,'0')}</span><em>{pick(topic.group,lang)}</em><i>{stateLabel(progress.status,lang)}</i></div>
              <h3>{pick(topic.title,lang)}</h3><p>{pick(topic.subtitle,lang)}</p>
              <div className="course-meta"><span>◷ {topic.minutes} min</span><span>{topic.quiz.length} questions</span></div>
              <small className="course-prerequisite">{lang==='zh'?'先備':'Prerequisite'}: {topic.prerequisites.length?topic.prerequisites.map((id)=>topicById(id)?.title).filter(Boolean).map((title)=>title&&pick(title,lang)).join(' · '):(lang==='zh'?'無，直接開始':'None—start here')}</small>
              <Link href={`/learn/${topic.slug}`}>{progress.status === 'not-started' ? (lang === 'zh' ? '開始主題' : 'Start topic') : text.continue} →</Link>
            </article>;
          })}</div>
        </section>
      </main>
    </Shell>
  );
}

const tabIds = ['learn','examples','practice','quiz','recap','sources'] as const;
type LessonTab = typeof tabIds[number];

type VisualMetric = { label:string; value:number; display:string; direction:'good'|'risk'|'neutral' };
function visualMetrics(topicId:string, parameter:number, step:number, lang:Lang):VisualMetric[] {
  const metric=(zh:string,en:string,value:number,display:string,direction:VisualMetric['direction']):VisualMetric=>({label:lang==='zh'?zh:en,value:Math.max(0,Math.min(100,value)),display,direction});
  const stage=(step+1)/5;
  switch(topicId){
    case 't1': return [metric('剩餘時間','Time remaining',100-(step*18),`${Math.max(.2,parameter-step*.8).toFixed(1)}s`,'neutral'),metric('驗證覆蓋','Validation coverage',step*24,`${Math.min(100,step*24)}%`,'good')];
    case 't2': return [metric('最高 token 機率','Top-token probability',Math.max(18,94-parameter*3.2),`${Math.max(18,94-parameter*3.2).toFixed(0)}%`,'good'),metric('輸出多樣性','Output diversity',Math.min(96,parameter*5),`${Math.min(96,parameter*5).toFixed(0)}%`,'neutral')];
    case 't3': return [metric('證據覆蓋','Evidence coverage',Math.min(96,25+parameter*11),`${Math.min(96,25+parameter*11)}%`,'good'),metric('雜訊風險','Noise risk',Math.max(8,parameter*10),`${Math.max(8,parameter*10)}%`,'risk')];
    case 't4': return [metric('可探索範圍','Exploration room',parameter*12,`${parameter} calls`,'neutral'),metric('失控風險','Runaway risk',Math.max(5,(parameter-2)*16),`${Math.max(5,(parameter-2)*16)}%`,'risk')];
    case 't5': return [metric('暫時故障恢復','Transient recovery',30+parameter*17,`${Math.min(98,30+parameter*17)}%`,'good'),metric('重複副作用風險','Duplicate-effect risk',parameter*19,`${parameter*19}%`,'risk')];
    case 't6': return [metric('重播次數','Node replays',parameter*25,`${parameter}×`,'neutral'),metric('無冪等性重複風險','Duplicate risk without idempotency',parameter*30,`${parameter*30}%`,'risk')];
    case 't7': return [metric('泛化可信度','Generalization confidence',parameter*18,`${parameter}/5`,'good'),metric('資料缺陷風險','Data defect risk',100-parameter*18,`${100-parameter*18}%`,'risk')];
    case 't8': return [metric('可發佈信心','Publish confidence',parameter*19,`${parameter}/5`,'good'),metric('錯 claim 風險','Unsupported-claim risk',100-parameter*18,`${100-parameter*18}%`,'risk')];
    case 't9': return [metric('自動處理信號','Automation signal',parameter*18,`${parameter}/5`,'neutral'),metric('應升級比例','Escalation need',Math.max(10,100-parameter*17),`${Math.max(10,100-parameter*17)}%`,'risk')];
    case 't10': return [metric('證據完整度','Evidence completeness',parameter*20,`${parameter}/5`,'good'),metric('未支持 claim','Unsupported claim',100-parameter*20,`${100-parameter*20}%`,'risk')];
    case 't11': return [metric('預計 TTFT','Estimated TTFT',Math.min(100,parameter/8),`${Math.round(260+parameter*1.15)}ms`,'risk'),metric('流程完成','Pipeline complete',stage*100,`${Math.round(stage*100)}%`,'good')];
    case 't12': return [metric('相對記憶體','Relative memory',parameter*6.25,`${parameter}-bit`,'risk'),metric('品質保留估算','Estimated quality retention',55+parameter*2.6,`${Math.min(99,55+parameter*2.6).toFixed(0)}%`,'good')];
    case 't13': return [metric('爆炸半徑','Blast radius',parameter*24,`${parameter}/4`,'risk'),metric('Host 阻擋進度','Host control progress',step*24,`${Math.min(100,step*24)}%`,'good')];
    default: return [metric('流程進度','Flow progress',stage*100,`${Math.round(stage*100)}%`,'good')];
  }
}

function VisualLab({ topic, lang }: { topic:Topic; lang:Lang }) {
  const [step,setStep]=useState(0); const [playing,setPlaying]=useState(false); const [speed,setSpeed]=useState(1); const [parameter,setParameter]=useState(topic.visual.parameter?.defaultValue ?? 0); const [reducedMotion,setReducedMotion]=useState(false);
  useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>{setReducedMotion(query.matches);if(query.matches)setPlaying(false)};sync();query.addEventListener('change',sync);return()=>query.removeEventListener('change',sync)},[]);
  useEffect(() => { if (!playing||reducedMotion) return; const id=window.setInterval(()=>setStep((current)=>{ if(current>=topic.visual.steps.length-1){setPlaying(false);return current;} return current+1;}),1200/speed); return ()=>window.clearInterval(id); },[playing,reducedMotion,speed,topic.visual.steps.length]);
  const active=topic.visual.steps[step]; const metrics=visualMetrics(topic.id,parameter,step,lang);
  return <section className={`visual-lab ${topic.visual.kind}`} id={`${topic.id}-visual`} aria-labelledby={`${topic.id}-visual-title`}>
    <div className="visual-lab-heading"><div><p className="eyebrow">{lang==='zh'?'教學視覺':'TEACHING VISUAL'}</p><h2 id={`${topic.id}-visual-title`}>{pick(topic.visual.title,lang)}</h2><p>{pick(topic.visual.teachingPurpose,lang)}</p></div><span>{step+1} / {topic.visual.steps.length}</span></div>
    {topic.visual.parameter && <label className="lab-slider">{pick(topic.visual.parameter.label,lang)}<input type="range" min={topic.visual.parameter.min} max={topic.visual.parameter.max} value={parameter} onInput={(event)=>setParameter(Number(event.currentTarget.value))} onChange={(event)=>setParameter(Number(event.currentTarget.value))}/><output>{parameter}{topic.visual.parameter.unit}</output></label>}
    <div className="visual-stage" role="img" aria-label={pick(topic.visual.textAlternative,lang)}>
      {topic.visual.steps.map((item,index)=><div className={`visual-node ${index===step?'active':''} ${index<step?'complete':''}`} key={item.id}><span>{String(index+1).padStart(2,'0')}</span><b>{pick(item.label,lang)}</b>{index<topic.visual.steps.length-1&&<i aria-hidden="true">→</i>}</div>)}
    </div>
    <div className="visual-legend" aria-label={lang==='zh'?'圖例':'Legend'}><span><i className="complete"/>{lang==='zh'?'已經過':'Complete'}</span><span><i className="active"/>{lang==='zh'?'目前步驟':'Current step'}</span><span><i/>{lang==='zh'?'未執行':'Pending'}</span><em>{lang==='zh'?'讀數係教學情境模型，唔係 benchmark。':'Readouts are teaching-model scenarios, not benchmarks.'}</em></div>
    <div className="visual-narration"><span>{String(step+1).padStart(2,'0')}</span><p>{pick(active.narration,lang)} {topic.visual.parameter ? `${pick(topic.visual.parameter.label,lang)}: ${parameter}${topic.visual.parameter.unit}.` : ''}</p></div>
    <div className="visual-readout" aria-label={lang==='zh'?'參數結果':'Parameter results'}>{metrics.map((item)=><div key={item.label} className={item.direction}><p><span>{item.label}</span><b>{item.display}</b></p><div><i style={{width:`${item.value}%`}}/></div></div>)}</div>
    <div className="visual-controls" role="group" aria-label={lang==='zh'?'動畫控制':'Animation controls'}>
      <button onClick={()=>setStep((current)=>Math.max(0,current-1))} disabled={step===0} aria-label={ui[lang].previous}>←</button>
      <button className="play-control" onClick={()=>setPlaying((value)=>!value)} disabled={reducedMotion} aria-label={reducedMotion?(lang==='zh'?'已啟用減少動態；請用上一步或下一步':'Reduced motion is enabled; use previous or next'):(playing?(lang==='zh'?'暫停':'Pause'):(lang==='zh'?'播放':'Play'))}>{reducedMotion?'STEP':playing?'Ⅱ':'▶'}</button>
      <button onClick={()=>setStep((current)=>Math.min(topic.visual.steps.length-1,current+1))} disabled={step===topic.visual.steps.length-1} aria-label={ui[lang].next}>→</button>
      <button onClick={()=>{setPlaying(false);setStep(0)}}>{lang==='zh'?'重播':'Replay'}</button>
      <label>{lang==='zh'?'速度':'Speed'} <select value={speed} onChange={(event)=>setSpeed(Number(event.target.value))}><option value="0.5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option></select></label>
    </div>
    <details className="static-alternative"><summary>{lang==='zh'?'開啟靜態文字版本':'Open static text alternative'}</summary><p>{pick(topic.visual.textAlternative,lang)}</p><ol>{topic.visual.steps.map((item)=><li key={item.id}><b>{pick(item.label,lang)}</b> — {pick(item.narration,lang)}</li>)}</ol></details>
  </section>;
}

function Quiz({ topic, lang, progress, saveAttempt, openRemediation }: { topic:Topic; lang:Lang; progress:TopicProgress; saveAttempt:(attempt:Attempt)=>void; openRemediation:(questionId:string,sectionId:string)=>void }) {
  const [attemptIndex,setAttemptIndex]=useState(progress.attempts.length); const [questionIndex,setQuestionIndex]=useState(0); const [answers,setAnswers]=useState<Record<string,string>>({}); const [submitted,setSubmitted]=useState(false); const [retryMode,setRetryMode]=useState(false); const summaryRef=useRef<HTMLDivElement>(null);
  const questions=topic.quiz; const current=questions[questionIndex];
  const orderedOptions=useMemo(()=>stableShuffle(current.options,hash(`${current.id}-${attemptIndex}`)),[current,attemptIndex]);
  const score=questions.filter((question)=>question.options.find((option)=>option.id===answers[question.id])?.correct).length;
  const missed=questions.filter((question)=>!question.options.find((option)=>option.id===answers[question.id])?.correct).map((question)=>question.id);
  const complete=questions.every((question)=>answers[question.id]);
  const pendingRemediation=(progress.attempts.at(-1)?.missed??[]).filter((id)=>!progress.remediated.includes(id)).map((id)=>questions.find((question)=>question.id===id)).filter((question):question is Topic['quiz'][number]=>Boolean(question));
  const submit=()=>{ if(!complete)return; const attempt={at:new Date().toISOString(),score,total:questions.length,missed}; saveAttempt(attempt); setSubmitted(true); window.setTimeout(()=>summaryRef.current?.focus(),0); };
  const restart=()=>{setAttemptIndex((value)=>value+1);setQuestionIndex(0);setAnswers({});setSubmitted(false);setRetryMode(true)};
  return <section className="quiz-shell" aria-labelledby="quiz-title">
    <div className="quiz-heading"><div><p className="eyebrow">{lang==='zh'?'閉卷掌握測驗':'CLOSED-BOOK MASTERY QUIZ'}</p><h2 id="quiz-title">{lang==='zh'?'8 題 · 需要答啱 7 題':'8 questions · 7 correct required'}</h2></div><span>{questionIndex+1} / {questions.length}</span></div>
    {!submitted ? <>
      {pendingRemediation.length>0&&<aside className="pending-remediation" aria-labelledby="pending-remediation-title"><div><span>!</span><p><b id="pending-remediation-title">{lang==='zh'?'最新 attempt 仲有概念要重溫':'Your latest attempt still has concepts to review'}</b>{lang==='zh'?'逐個開啟精準解釋；返到測驗時清單會保留。':'Open each exact explanation; this list remains when you return.'}</p></div><div>{pendingRemediation.map((question)=><button key={question.id} onClick={()=>openRemediation(question.id,question.remediationSectionId)}>{question.id.toUpperCase()} · {pick(question.rationale,lang)} →</button>)}</div></aside>}
      <div className="question-progress">{questions.map((question,index)=><button key={question.id} onClick={()=>setQuestionIndex(index)} aria-current={index===questionIndex?'step':undefined} className={`${index===questionIndex?'current':''} ${answers[question.id]?'answered':''}`} aria-label={`${lang==='zh'?'題目':'Question'} ${index+1}`}>{index+1}</button>)}</div>
      <article className="question-card"><div className="question-meta"><span>{current.coverage}</span><span>{current.difficulty}</span><span>{current.objectiveId}</span></div><fieldset><legend>{pick(retryMode?current.retryPrompt:current.prompt,lang)}</legend>{orderedOptions.map((option)=><label className="quiz-option" key={option.id}><input type="radio" name={current.id} checked={answers[current.id]===option.id} onChange={()=>setAnswers((value)=>({...value,[current.id]:option.id}))}/><span className="radio-ui" aria-hidden="true"/><b>{pick(option.label,lang)}</b></label>)}</fieldset></article>
      <div className="quiz-actions"><button onClick={()=>setQuestionIndex((index)=>Math.max(0,index-1))} disabled={questionIndex===0}>← {ui[lang].previous}</button>{questionIndex<questions.length-1?<button className="primary-button" onClick={()=>setQuestionIndex((index)=>index+1)} disabled={!answers[current.id]}>{ui[lang].next} →</button>:<button className="primary-button" onClick={submit} disabled={!complete}>{lang==='zh'?'提交全部答案':'Submit all answers'}</button>}</div>
      {!complete&&questionIndex===questions.length-1&&<p className="form-hint">{lang==='zh'?'請先完成所有題目；上方圓點會顯示未答題。':'Complete every question; the indicators show what remains.'}</p>}
    </> : <div className="quiz-results" ref={summaryRef} tabIndex={-1} aria-live="polite">
      <div className={`score-card ${score>=7?'pass':'review'}`}><span>{score}/{questions.length}</span><div><small>{lang==='zh'?'最新成績':'Latest score'}</small><h3>{score>=7?(lang==='zh'?'已達分數要求':'Score threshold met'):(lang==='zh'?'需要溫習':'Needs review')}</h3><p>{lang==='zh'?'掌握仲需要完成 recap、練習，同所有錯題 remediation。':'Mastery also requires recap, practice, and remediation for every missed item.'}</p></div></div>
      <div className="result-list">{questions.map((question,index)=>{const selected=question.options.find((option)=>option.id===answers[question.id]);const correct=selected?.correct;return <details key={question.id} open={!correct}><summary><span className={correct?'result-correct':'result-wrong'}>{correct?'✓':'!'}</span><b>{index+1}. {pick(retryMode?question.retryPrompt:question.prompt,lang)}</b><em>{correct?(lang==='zh'?'答啱':'Correct'):(lang==='zh'?'要重溫':'Review')}</em></summary><div className="feedback-panel"><p className="rationale"><b>{lang==='zh'?'核心原則：':'Core principle: '}</b>{pick(question.rationale,lang)}</p>{question.options.map((option)=><div className={`option-feedback ${option.correct?'correct':''} ${selected?.id===option.id?'selected':''}`} key={option.id}><span>{option.correct?'✓':selected?.id===option.id?'×':'·'}</span><p><b>{pick(option.label,lang)}</b>{pick(option.feedback,lang)}</p></div>)}{!correct&&<button className="remediation-button" onClick={()=>openRemediation(question.id,question.remediationSectionId)}>{progress.remediated.includes(question.id)?(lang==='zh'?'✓ 再開精準解釋':'✓ Reopen exact explanation'):(lang==='zh'?'開啟精準解釋並重溫 →':'Open exact explanation →')}</button>}</div></details>})}</div>
      <div className="results-actions"><button className="primary-button" onClick={restart}>{missed.length?(lang==='zh'?'用新情境重試':'Retry with changed scenarios'):(lang==='zh'?'再試一次':'Try again')}</button><Link href="/review">{lang==='zh'?'查看 Day 1 / 3 / 7 溫習':'Open Day 1 / 3 / 7 review'} →</Link></div>
    </div>}
  </section>;
}

function stableShuffle<T>(items:T[], seed:number):T[]{ const array=[...items]; let value=seed; for(let index=array.length-1;index>0;index--){value=(value*9301+49297)%233280;const target=Math.floor((value/233280)*(index+1));[array[index],array[target]]=[array[target],array[index]];} return array; }
function hash(value:string){return value.split('').reduce((total,char)=>((total<<5)-total)+char.charCodeAt(0),7)>>>0;}

function Lesson({ topic, state, setState }: { topic:Topic; state:AcademyState; setState:React.Dispatch<React.SetStateAction<AcademyState>> }) {
  const lang=state.lang; const [tab,setTab]=useState<LessonTab>('learn'); const [practiceChoice,setPracticeChoice]=useState<number|null>(null); const [practiceSubmitted,setPracticeSubmitted]=useState(false); const progress=state.topicProgress[topic.id] ?? emptyProgress(); const currentIndex=topics.findIndex((item)=>item.id===topic.id); const previousTopic=topics[currentIndex-1]; const nextTopic=topics[currentIndex+1];
  useEffect(()=>{setState((current)=>{const item=current.topicProgress[topic.id]??emptyProgress();if(item.status!=='not-started')return current;return{...current,topicProgress:{...current.topicProgress,[topic.id]:{...item,status:'in-progress',lastStudied:new Date().toISOString()}}}})},[topic.id,setState]);
  const updateProgress=(updates:Partial<TopicProgress>)=>setState((current)=>{const old=current.topicProgress[topic.id]??emptyProgress();const merged=mergeProgress(old,{...updates,lastStudied:new Date().toISOString()});return{...current,topicProgress:{...current.topicProgress,[topic.id]:merged}}});
  const saveAttempt=(attempt:Attempt)=>setState((current)=>{const old=current.topicProgress[topic.id]??emptyProgress();const score=scorePercent(attempt);const pending={...old,latestScore:score,bestScore:Math.max(old.bestScore,score),attempts:[...old.attempts,attempt],remediated:old.remediated.filter((id)=>!attempt.missed.includes(id)),lastStudied:attempt.at};const merged={...pending,status:deriveStatus(pending)};return{...current,topicProgress:{...current.topicProgress,[topic.id]:merged},reviewQueue:[...current.reviewQueue,...createReviewItems(topic.id,attempt,Date.parse(attempt.at))]}});
  const markRemediated=(ids:string[])=>setState((current)=>{const old=current.topicProgress[topic.id]??emptyProgress();const merged=mergeProgress(old,{remediated:Array.from(new Set([...old.remediated,...ids])),lastStudied:new Date().toISOString()});return{...current,topicProgress:{...current.topicProgress,[topic.id]:merged}}});
  const submitPractice=()=>{if(practiceChoice===null)return;setPracticeSubmitted(true);if(practiceChoice===topic.practice.correctIndex)updateProgress({practiceComplete:true})};
  const scrollMode=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto' as const:'smooth' as const;
  const switchTab=(target:LessonTab)=>{setTab(target);if(target==='recap')updateProgress({recapReached:true});window.scrollTo({top:0,behavior:scrollMode()})};
  const openRemediation=(questionId:string,sectionId:string)=>{markRemediated([questionId]);setTab('learn');window.setTimeout(()=>document.getElementById(sectionId)?.scrollIntoView({behavior:scrollMode(),block:'start'}),0)};
  const openPracticeRemediation=()=>{setTab('learn');window.setTimeout(()=>document.getElementById(topic.practice.remediationSectionId)?.scrollIntoView({behavior:scrollMode(),block:'start'}),0)};
  const lessonSources=sources.filter((source)=>topic.sourceIds.includes(source.id));
  return <Shell state={state} setState={setState}>
    <main className="lesson-layout">
      <aside className="lesson-sidebar"><Link href="/" className="back-link">← {ui[lang].dashboard}</Link><div className="sidebar-progress"><span>{lang==='zh'?'主題進度':'Topic progress'}</span><b>{stateLabel(progress.status,lang)}</b><div><i style={{width:`${[progress.recapReached,progress.practiceComplete,progress.bestScore>=80,(progress.attempts.at(-1)?.missed.every((id)=>progress.remediated.includes(id))??false)].filter(Boolean).length*25}%`}}/></div></div><nav aria-label={lang==='zh'?'主題':'Topics'}>{topics.map((item)=><Link aria-current={item.id===topic.id?'page':undefined} className={`${item.id===topic.id?'active':''} ${state.topicProgress[item.id]?.status==='mastered'?'done':''}`} href={`/learn/${item.slug}`} key={item.id}><span>{String(item.order).padStart(2,'0')}</span><b>{pick(item.title,lang)}</b><i aria-hidden="true">{state.topicProgress[item.id]?.status==='mastered'?'✓':'›'}</i></Link>)}</nav></aside>
      <div className="lesson-main">
        <div className="breadcrumbs"><Link href="/">{ui[lang].dashboard}</Link><span>/</span><span>{String(topic.order).padStart(2,'0')}</span><span>/</span><b>{pick(topic.title,lang)}</b></div>
        <header className="lesson-hero"><div className="lesson-number">{String(topic.order).padStart(2,'0')}</div><div><p>{pick(topic.group,lang)} · {topic.minutes} MIN</p><h1>{pick(topic.title,lang)}</h1><span>{pick(topic.subtitle,lang)}</span></div><div className={`status-badge ${progress.status}`}>{stateLabel(progress.status,lang)}</div></header>
        <nav className="lesson-tabs" aria-label={lang==='zh'?'課堂段落':'Lesson sections'}>{tabIds.map((id,index)=><button aria-current={tab===id?'page':undefined} className={tab===id?'active':''} onClick={()=>switchTab(id)} key={id}><span>{String(index+1).padStart(2,'0')}</span>{ui[lang][id]}</button>)}</nav>
        <div className="topic-pager" aria-label={lang==='zh'?'上一課同下一課':'Previous and next topics'}>{previousTopic?<Link href={`/learn/${previousTopic.slug}`}>← <span>{pick(previousTopic.title,lang)}</span></Link>:<span/>}<small>{String(topic.order).padStart(2,'0')} / 13</small>{nextTopic?<Link href={`/learn/${nextTopic.slug}`}><span>{pick(nextTopic.title,lang)}</span> →</Link>:<Link href="/assessment"><span>{ui[lang].assessment}</span> →</Link>}</div>
        {tab==='learn'&&<div className="lesson-content">
          <section className="orientation-card"><p className="eyebrow">{lang==='zh'?'點解重要':'WHY IT MATTERS'}</p><h2>{pick(topic.orientation.openingProblem,lang)}</h2><div className="one-sentence"><b>{lang==='zh'?'一句講清':'IN ONE SENTENCE'}</b><p>{pick(topic.orientation.oneSentence,lang)}</p></div><div className="objectives"><h3>{lang==='zh'?'完成後你可以':'YOU WILL BE ABLE TO'}</h3>{topic.orientation.objectives.map((objective,index)=><div key={objective.id}><span>{index+1}</span><p><b>{pick(objective.statement,lang)}</b><small>{pick(objective.evidence,lang)}</small></p></div>)}</div></section>
          <section className="layered-grid"><article className="definition-block"><span>01</span><p className="eyebrow">{ui[lang].foundation}</p><h2>{lang==='zh'?'先用人話理解':'Start in plain language'}</h2><p>{pick(topic.explanation.beginner,lang)}</p></article><article className="analogy-block"><span>02</span><p className="eyebrow">{lang==='zh'?'比喻 + 邊界':'ANALOGY + LIMIT'}</p><h2>{pick(topic.explanation.analogy,lang)}</h2><div><b>{lang==='zh'?'比喻去到邊度會失效？':'Where does it break?'}</b><p>{pick(topic.explanation.analogyLimit,lang)}</p></div></article></section>
          <section className="mechanism-section" id={`${topic.id}-mechanism`}><div className="section-title"><p className="eyebrow">{lang==='zh'?'逐步機制':'STEP BY STEP'}</p><h2>{lang==='zh'?'資料點樣行，責任點樣分':'How data moves and responsibility changes'}</h2></div><ol>{topic.explanation.mechanisms.map((item,index)=><li key={index}><span>{String(index+1).padStart(2,'0')}</span><p>{pick(item,lang)}</p></li>)}</ol><details className="deep-dive"><summary><span>+</span>{lang==='zh'?'Go deeper · 技術版':'Go deeper · Technical view'}</summary><p>{pick(topic.explanation.deepDive,lang)}</p></details></section>
          <VisualLab topic={topic} lang={lang}/>
          <section className="vocab-section"><div className="section-title"><p className="eyebrow">{lang==='zh'?'詞彙':'VOCABULARY'}</p><h2>{lang==='zh'?'第一次見就講清楚':'Define it the first time'}</h2></div><div className="vocab-grid">{topic.vocabulary.map((item)=><article key={item.id}><p>{item.zhTerm}</p><h3>{item.term}</h3><span>{pick(item.definition,lang)}</span></article>)}</div></section>
          <section className="misconceptions"><div className="section-title"><p className="eyebrow">{lang==='zh'?'常見誤解':'COMMON MISCONCEPTIONS'}</p><h2>{lang==='zh'?'聽落合理，但其實錯':'Plausible—and wrong'}</h2></div>{topic.misconceptions.map((item)=><article key={item.id}><div>×</div><p><b>{pick(item.claim,lang)}</b><span>{pick(item.correction,lang)}</span></p></article>)}</section>
          <section className="current-block"><div><span>{ui[lang].verified}</span><strong>{topic.current.verifiedAt}</strong></div><p className="eyebrow">{ui[lang].current} · {topic.current.status}</p><h2>{pick(topic.current.text,lang)}</h2><div>{topic.current.sourceIds.map((sourceId)=>{const source=sources.find((item)=>item.id===sourceId);return source?.url?<a href={source.url} target="_blank" rel="noreferrer" key={sourceId}>{source.publisher} ↗</a>:null})}</div></section>
          <button className="wide-next" onClick={()=>switchTab('examples')}>{lang==='zh'?'下一節：五種例子':'Next: five example types'} <span>→</span></button>
        </div>}
        {tab==='examples'&&<section className="examples-page"><div className="page-intro"><p className="eyebrow">{ui[lang].examples}</p><h2>{lang==='zh'?'由最小例子，去到唔應該用嘅反例':'From a minimal case to when not to use it'}</h2><p>{lang==='zh'?'每個例子都要問：如果改變一個 assumption，結果同風險會點變？':'For every example, change one assumption and compare the result and risk.'}</p></div><div className="examples-list">{topic.examples.map((example,index)=><article className={`example-${example.role}`} key={example.id}><div><span>{String(index+1).padStart(2,'0')}</span><em>{example.role}</em></div><section><h3>{pick(example.title,lang)}</h3><p>{pick(example.body,lang)}</p><details><summary>{lang==='zh'?'改一個條件':'Change one assumption'}</summary><p>{pick(example.changedAssumption,lang)}</p></details></section></article>)}</div><button className="wide-next" onClick={()=>switchTab('practice')}>{lang==='zh'?'下一節：主動練習':'Next: active practice'} <span>→</span></button></section>}
        {tab==='practice'&&<section className="practice-page"><div className="page-intro"><p className="eyebrow">{ui[lang].practice}</p><h2>{lang==='zh'?'先預測，先至睇結果':'Predict before seeing the result'}</h2></div><article className="practice-card"><span className="practice-type">SCENARIO DECISION</span><fieldset><legend>{pick(topic.practice.prompt,lang)}</legend>{topic.practice.options.map((option,index)=><label key={index}><input type="radio" name="practice" checked={practiceChoice===index} onChange={()=>{setPracticeChoice(index);setPracticeSubmitted(false)}}/><span className="radio-ui"/><b>{pick(option,lang)}</b></label>)}</fieldset><button className="primary-button" onClick={submitPractice} disabled={practiceChoice===null}>{lang==='zh'?'提交預測':'Submit prediction'}</button>{practiceSubmitted&&practiceChoice!==null&&<div className={`practice-feedback ${practiceChoice===topic.practice.correctIndex?'correct':'wrong'}`} aria-live="polite"><span>{practiceChoice===topic.practice.correctIndex?'✓':'!'}</span><p><b>{practiceChoice===topic.practice.correctIndex?(lang==='zh'?'判斷正確':'Correct decision'):(lang==='zh'?'再諗一層':'Think one layer deeper')}</b>{pick(topic.practice.feedback,lang)}{practiceChoice!==topic.practice.correctIndex&&(lang==='zh'?' 回到「逐步機制」，找出真正嘅信任邊界。':' Return to the mechanism and identify the real trust boundary.')}</p>{practiceChoice!==topic.practice.correctIndex&&<button className="inline-remediation" onClick={openPracticeRemediation}>{lang==='zh'?'開啟逐步機制 →':'Open the exact mechanism →'}</button>}</div>}</article><div className="practice-status"><span>{progress.practiceComplete?'✓':'○'}</span><p><b>{lang==='zh'?'必要練習':'Required practice'}</b>{progress.practiceComplete?(lang==='zh'?'已完成，呢個 mastery 條件已通過。':'Complete—this mastery condition has passed.'):(lang==='zh'?'答啱先會記錄完成；可以無限重試。':'Correct completion is required; retries are unlimited.')}</p></div><button className="wide-next" onClick={()=>switchTab('quiz')}>{lang==='zh'?'下一節：掌握測驗':'Next: mastery quiz'} <span>→</span></button></section>}
        {tab==='quiz'&&<Quiz topic={topic} lang={lang} progress={progress} saveAttempt={saveAttempt} openRemediation={openRemediation}/>} 
        {tab==='recap'&&<section className="recap-page">
          <div className="page-intro"><p className="eyebrow">{ui[lang].recap}</p><h2>{lang==='zh'?'唔睇答案，自己講一次':'Retrieve it without looking'}</h2></div>
          <div className="recap-ideas">{topic.recap.essentialIdeas.map((idea,index)=><article key={index}><span>{index+1}</span><p>{pick(idea,lang)}</p></article>)}</div>
          <label className="own-words"><span>{lang==='zh'?'用自己說話解釋':'Explain in your own words'}</span><textarea value={state.notes[topic.id]??''} onChange={(event)=>setState((current)=>({...current,notes:{...current.notes,[topic.id]:event.target.value}}))} placeholder={pick(topic.recap.ownWordsPrompt,lang)} rows={5}/><small>{lang==='zh'?'筆記只存喺呢個 browser，會包括喺進度匯出檔案；唔會自動評分。':'This note stays in this browser, is included in progress exports, and is not auto-graded.'}</small></label>
          <div className="review-calendar">{topic.recap.reviewDays.map((day,index)=><article key={day}><span>DAY {day}</span><h3>{[lang==='zh'?'回想':'Recall',lang==='zh'?'情境':'Scenario',lang==='zh'?'遷移':'Transfer'][index]}</h3><p>{index===0?pick(topic.recap.essentialIdeas[0],lang):index===1?pick(topic.orientation.openingProblem,lang):pick(topic.recap.ownWordsPrompt,lang)}</p></article>)}</div>
          <section className="attempt-history" aria-labelledby="attempt-history-title"><header><div><p className="eyebrow">EVIDENCE OF LEARNING</p><h3 id="attempt-history-title">{lang==='zh'?'測驗紀錄同進步':'Quiz history and improvement'}</h3></div><div><span>{lang==='zh'?'最佳':'Best'} <b>{progress.bestScore}%</b></span><span>{lang==='zh'?'最新':'Latest'} <b>{progress.latestScore}%</b></span></div></header>{progress.attempts.length?<ol>{progress.attempts.map((attempt,index)=><li key={`${attempt.at}-${index}`}><span>#{index+1}</span><time dateTime={attempt.at}>{new Intl.DateTimeFormat(lang==='zh'?'zh-HK':'en',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(attempt.at))}</time><b>{scorePercent(attempt)}%</b><em>{attempt.missed.length?`${attempt.missed.length} ${lang==='zh'?'個概念要重溫':'to review'}`:(lang==='zh'?'全對':'Perfect')}</em></li>)}</ol>:<p>{lang==='zh'?'完成第一次測驗後，best、latest 同每次 attempt 會喺度顯示。':'Best, latest, and every attempt appear here after your first quiz.'}</p>}</section>
          <div className="mastery-gate"><h3>{lang==='zh'?'Mastery 關卡':'Mastery gate'}</h3>{[[progress.recapReached,lang==='zh'?'到達重點溫習':'Reached recap'],[progress.practiceComplete,lang==='zh'?'完成必要練習':'Required practice complete'],[progress.bestScore>=80,lang==='zh'?'最佳測驗達 80%（8 題要 7 題）':'Best quiz ≥80% (7 of 8)'],[progress.attempts.length>0&&(progress.attempts.at(-1)?.missed.every((id)=>progress.remediated.includes(id))??false),lang==='zh'?'完成最新錯題 remediation':'Latest missed concepts remediated']].map(([done,label],index)=><div key={index} className={done?'done':''}><span>{done?'✓':'○'}</span><p>{label}</p></div>)}<strong>{stateLabel(progress.status,lang)}</strong></div>
          {nextTopic?<Link className="wide-next" href={`/learn/${nextTopic.slug}`}>{lang==='zh'?'下一主題':'Next topic'}: {pick(nextTopic.title,lang)} <span>→</span></Link>:<Link className="wide-next" href="/assessment">{lang==='zh'?'完成 13 個主題總評同 Capstone':'Complete the cumulative assessment and capstone'} <span>→</span></Link>}
        </section>}
        {tab==='sources'&&<section className="sources-page"><div className="page-intro"><p className="eyebrow">{ui[lang].sources}</p><h2>{lang==='zh'?'可核對嘅課程來源':'Sources you can verify'}</h2><p>{lang==='zh'?'38 份原始 PDF 並唔喺 workspace，所以本網站冇聲稱讀過。以下只列實際檢查過嘅課程檔案同 primary sources。':'The catalog of 38 source PDFs is absent, so this site does not claim they were read. These are the course files and primary sources actually checked.'}</p></div><div className="source-list">{lessonSources.map((source)=><article key={source.id}><span className={`source-kind ${source.kind}`}>{source.kind}</span><div><h3>{source.title}</h3><p>{source.publisher} · {source.date}</p><small>{pick(source.note,lang)}</small></div><div><em>{lang==='zh'?'核實於':'Verified'} {source.verifiedAt}</em>{source.url&&<a href={source.url} target="_blank" rel="noreferrer">{lang==='zh'?'開啟來源':'Open source'} ↗</a>}</div></article>)}</div></section>}
      </div>
    </main>
  </Shell>;
}

function AssessmentPage({ state,setState }: { state:AcademyState; setState:React.Dispatch<React.SetStateAction<AcademyState>> }) {
  const lang=state.lang; const questions=useMemo(()=>topics.map((topic)=>({topic,question:topic.quiz.find((item)=>item.coverage==='application')??topic.quiz[0]})),[]);
  const [questionIndex,setQuestionIndex]=useState(0); const [answers,setAnswers]=useState<Record<string,string>>({}); const [submitted,setSubmitted]=useState(false); const resultRef=useRef<HTMLDivElement>(null);
  const score=questions.filter(({question})=>question.options.find((option)=>option.id===answers[question.id])?.correct).length; const complete=questions.every(({question})=>answers[question.id]); const current=questions[questionIndex];
  const capstone=[
    {id:'data',prompt:lang==='zh'?'退款政策每日會變，而且只能讀取登入客戶自己嘅訂單。第一個完整資料設計係？':'Refund policy changes daily and each user may see only their orders. What is the first complete data design?',options:[lang==='zh'?'授權 filter → 檢索最新政策同訂單 → 保留引用':'Authorization filter → retrieve current policy and order → retain citations',lang==='zh'?'把所有訂單放入 prompt，再叫模型守規則':'Put every order in the prompt and ask the model to behave',lang==='zh'?'每晚微調政策，唔需要檢索':'Fine-tune policy nightly and skip retrieval'],correct:0,feedback:lang==='zh'?'新鮮知識用檢索；tenant 同身份權限由 host 強制。':'Use retrieval for fresh knowledge; the host enforces tenant and identity boundaries.'},
    {id:'action',prompt:lang==='zh'?'Agent 建議退款，真正寫入前應有邊組控制？':'The agent proposes a refund. Which controls belong before the write?',options:[lang==='zh'?'Host 授權、金額預覽、人批核、idempotency key':'Host authorization, amount preview, human approval, and an idempotency key',lang==='zh'?'只睇模型 confidence':'Rely only on model confidence',lang==='zh'?'Timeout 後無限重試':'Retry forever after a timeout'],correct:0,feedback:lang==='zh'?'高影響 side effect 要由模型外控制，而且重試必須安全。':'High-impact side effects need controls outside the model and replay-safe retries.'},
    {id:'eval',prompt:lang==='zh'?'邊個評估組合最能阻止「demo 好睇、production 失敗」？':'Which evaluation combination best prevents a polished demo from failing in production?',options:[lang==='zh'?'凍結 regression set + adversarial cases + live trace/guardrail monitoring':'Frozen regression set + adversarial cases + live trace/guardrail monitoring',lang==='zh'?'只睇平均答案長度':'Check only average answer length',lang==='zh'?'發布後先決定成功指標':'Choose success metrics after release'],correct:0,feedback:lang==='zh'?'離線 gate 同線上監察要連成同一條 evidence loop。':'Offline gates and online monitoring must form one evidence loop.'},
    {id:'release',prompt:lang==='zh'?'Canary 顯示越權率超門檻。下一個動作係？':'The canary exceeds the unauthorized-action threshold. What happens next?',options:[lang==='zh'?'停止擴流、rollback、保存 trace 並加 regression case':'Stop rollout, roll back, preserve the trace, and add a regression case',lang==='zh'?'擴大流量收更多數據':'Increase traffic to gather more data',lang==='zh'?'刪除舊版本':'Delete the previous version'],correct:0,feedback:lang==='zh'?'預先定義嘅安全門檻必須真係可以停止同回滾發布。':'A predefined safety threshold must be able to stop and reverse a release.'},
  ];
  const [capstoneAnswers,setCapstoneAnswers]=useState<Record<string,number>>({}); const [capstoneSubmitted,setCapstoneSubmitted]=useState(false); const capstoneComplete=capstone.every((item)=>capstoneAnswers[item.id]===item.correct);
  const submit=()=>{if(!complete)return;const attempt:Attempt={at:new Date().toISOString(),score,total:questions.length,missed:questions.filter(({question})=>!question.options.find((option)=>option.id===answers[question.id])?.correct).map(({question})=>question.id)};setState((currentState)=>({...currentState,cumulative:{...currentState.cumulative,bestScore:Math.max(currentState.cumulative.bestScore,scorePercent(attempt)),attempts:[...currentState.cumulative.attempts,attempt]}}));setSubmitted(true);window.setTimeout(()=>resultRef.current?.focus(),0)};
  const submitCapstone=()=>{setCapstoneSubmitted(true);if(capstoneComplete)setState((currentState)=>({...currentState,cumulative:{...currentState.cumulative,capstoneComplete:true}}))};
  return <Shell state={state} setState={setState}><main className="utility-page assessment-shell">
    <div className="utility-hero"><p className="eyebrow">CUMULATIVE ASSESSMENT + CAPSTONE</p><h1>{lang==='zh'?'將 13 個主題連成一個決定':'Turn 13 topics into one sound decision'}</h1><p>{lang==='zh'?'先做 13 題跨主題情境題，再完成一個由資料、Agent、評估去到發布嘅 capstone。答案提交前完全隱藏。':'Complete 13 cross-topic scenarios, then a capstone spanning data, agents, evaluation, and release. Answers remain hidden until submission.'}</p></div>
    <div className="assessment-overview"><div><span>{lang==='zh'?'最佳總評':'Best assessment'}</span><strong>{state.cumulative.bestScore}%</strong></div><div><span>{lang==='zh'?'總評次數':'Attempts'}</span><strong>{state.cumulative.attempts.length}</strong></div><div><span>Capstone</span><strong>{state.cumulative.capstoneComplete?'✓':'○'}</strong></div></div>
    <section className="assessment-block" aria-labelledby="cumulative-title"><header><div><p className="eyebrow">PART 1 · RETRIEVAL</p><h2 id="cumulative-title">{lang==='zh'?'13 題跨主題總評':'13-topic cumulative assessment'}</h2></div><span>{questionIndex+1} / {questions.length}</span></header>
      {!submitted?<><div className="assessment-progress">{questions.map(({topic,question},index)=><button key={question.id} className={`${index===questionIndex?'current':''} ${answers[question.id]?'answered':''}`} onClick={()=>setQuestionIndex(index)} aria-label={`${pick(topic.title,lang)} · ${lang==='zh'?'題目':'question'} ${index+1}`}>{String(topic.order).padStart(2,'0')}</button>)}</div><article className="assessment-card"><p>{String(current.topic.order).padStart(2,'0')} · {pick(current.topic.title,lang)}</p><fieldset><legend>{pick(current.question.prompt,lang)}</legend>{stableShuffle(current.question.options,hash(`cumulative-${current.question.id}-${state.cumulative.attempts.length}`)).map((option)=><label key={option.id}><input type="radio" name={current.question.id} checked={answers[current.question.id]===option.id} onChange={()=>setAnswers((value)=>({...value,[current.question.id]:option.id}))}/><span className="radio-ui"/><b>{pick(option.label,lang)}</b></label>)}</fieldset></article><div className="quiz-actions"><button onClick={()=>setQuestionIndex((index)=>Math.max(0,index-1))} disabled={questionIndex===0}>← {ui[lang].previous}</button>{questionIndex<questions.length-1?<button className="primary-button" disabled={!answers[current.question.id]} onClick={()=>setQuestionIndex((index)=>index+1)}>{ui[lang].next} →</button>:<button className="primary-button" disabled={!complete} onClick={submit}>{lang==='zh'?'提交總評':'Submit assessment'}</button>}</div></>:<div className="assessment-results" ref={resultRef} tabIndex={-1} aria-live="polite"><div className={`score-card ${score>=11?'pass':'review'}`}><span>{score}/13</span><div><small>{lang==='zh'?'跨主題成績':'Cumulative score'}</small><h3>{score>=11?(lang==='zh'?'達到 80% 門檻':'80% threshold met'):(lang==='zh'?'先重溫薄弱主題':'Review weaker topics')}</h3><p>{lang==='zh'?'逐題打開相關課堂；重試會用每題嘅 changed scenario。':'Open the relevant lesson for each miss; retry uses each question’s changed scenario.'}</p></div></div><div className="cumulative-list">{questions.map(({topic,question},index)=>{const correct=question.options.find((option)=>option.id===answers[question.id])?.correct;return <article key={question.id} className={correct?'correct':'wrong'}><span>{correct?'✓':'!'}</span><div><b>{String(index+1).padStart(2,'0')} · {pick(topic.title,lang)}</b><p>{pick(question.rationale,lang)}</p></div><Link href={`/learn/${topic.slug}`}>{lang==='zh'?'開啟課堂':'Open lesson'} →</Link></article>})}</div><button className="primary-button" onClick={()=>{setAnswers({});setSubmitted(false);setQuestionIndex(0)}}>{lang==='zh'?'用新情境重試':'Retry with changed scenarios'}</button></div>}
    </section>
    <section className="capstone-lab" aria-labelledby="capstone-title"><header><p className="eyebrow">PART 2 · CAPSTONE</p><h2 id="capstone-title">{lang==='zh'?'上線一個安全退款助手':'Release a safe refund assistant'}</h2><p>{lang==='zh'?'情境：客服助手要讀最新政策、查登入客戶訂單、提出退款，並喺高風險動作前停低。':'Scenario: a support assistant reads current policy, checks the signed-in user’s order, proposes a refund, and pauses before high-risk action.'}</p></header><div>{capstone.map((item,index)=><fieldset key={item.id}><legend><span>{index+1}</span>{item.prompt}</legend>{item.options.map((option,optionIndex)=><label key={option}><input type="radio" name={`capstone-${item.id}`} checked={capstoneAnswers[item.id]===optionIndex} onChange={()=>{setCapstoneAnswers((value)=>({...value,[item.id]:optionIndex}));setCapstoneSubmitted(false)}}/><span className="radio-ui"/><b>{option}</b></label>)}{capstoneSubmitted&&<p className={capstoneAnswers[item.id]===item.correct?'correct':'wrong'}>{capstoneAnswers[item.id]===item.correct?'✓':'!'} {item.feedback}</p>}</fieldset>)}</div><button className="primary-button" disabled={capstone.some((item)=>capstoneAnswers[item.id]===undefined)} onClick={submitCapstone}>{lang==='zh'?'提交 Capstone':'Submit capstone'}</button>{capstoneSubmitted&&<div className={`capstone-result ${capstoneComplete?'complete':'review'}`} role="status"><span>{capstoneComplete?'✓':'!'}</span><p><b>{capstoneComplete?(lang==='zh'?'Capstone 完成':'Capstone complete'):(lang==='zh'?'有決定需要修正':'Some decisions need revision')}</b>{capstoneComplete?(lang==='zh'?'你已將資料新鮮度、權限、冪等性、評估同 rollback 串成一條 release path。':'You connected freshness, authorization, idempotency, evaluation, and rollback into one release path.'):(lang==='zh'?'先睇每步回饋，再重新提交；冇扣分。':'Review each explanation and resubmit without penalty.')}</p></div>}</section>
  </main></Shell>;
}

function ReviewPage({ state,setState }: { state:AcademyState; setState:React.Dispatch<React.SetStateAction<AcademyState>> }) {
  const lang=state.lang; const now=useClock(); const pending=state.reviewQueue.filter((item)=>!item.done); const grouped=([1,3,7] as const).map((day)=>({day,items:pending.filter((item)=>item.day===day).sort((a,b)=>Date.parse(a.dueAt)-Date.parse(b.dueAt))}));
  const complete=(id:string)=>setState((current)=>({...current,reviewQueue:current.reviewQueue.map((item)=>item.id===id?{...item,done:true}:item)}));
  return <Shell state={state} setState={setState}><main className="utility-page"><div className="utility-hero"><p className="eyebrow">RETRIEVAL PRACTICE</p><h1>{lang==='zh'?'Day 1 / 3 / 7 溫習隊列':'Day 1 / 3 / 7 review queue'}</h1><p>{lang==='zh'?'錯題會安排三次唔同距離嘅提取練習。到期先可以標記完成；排期項目會保留 attempt history。':'Missed concepts create three spaced retrieval checks. Only due items can be completed; scheduled work preserves attempt history.'}</p></div>{pending.length===0?<div className="empty-state"><span>✓</span><h2>{lang==='zh'?'而家冇待辦溫習':'Nothing scheduled'}</h2><p>{lang==='zh'?'完成一個測驗後，錯題會喺呢度排 Day 1 / 3 / 7。':'Complete a quiz and missed concepts will appear here.'}</p><Link href="/">{lang==='zh'?'返回學習路線':'Return to the path'} →</Link></div>:<div className="review-columns">{grouped.map((group)=><section key={group.day}><header><span>DAY {group.day}</span><b>{group.items.length}</b></header>{group.items.length===0?<p className="column-empty">{lang==='zh'?'冇排期':'Clear'}</p>:group.items.map((item)=>{const topic=topicById(item.topicId);const question=topic?.quiz.find((q)=>q.id===item.questionId);const isDue=Date.parse(item.dueAt)<=now;return <article key={item.id} className={isDue?'due':'scheduled'}><div className="review-meta"><small>{topic&&pick(topic.title,lang)}</small><time dateTime={item.dueAt}>{isDue?(lang==='zh'?'到期':'Due'):new Intl.DateTimeFormat(lang==='zh'?'zh-HK':'en',{month:'short',day:'numeric'}).format(new Date(item.dueAt))}</time></div><p>{question&&pick(question.retryPrompt,lang)}</p><div><Link href={topic?`/learn/${topic.slug}`:'/'}>{lang==='zh'?'開啟課堂':'Open lesson'}</Link><button onClick={()=>complete(item.id)} disabled={!isDue}>✓ {isDue?(lang==='zh'?'完成':'Done'):(lang==='zh'?'未到期':'Scheduled')}</button></div></article>})}</section>)}</div>}</main></Shell>;
}

function ConceptMap({ state,setState }: { state:AcademyState; setState:React.Dispatch<React.SetStateAction<AcademyState>> }) {
  const lang=state.lang;
  return <Shell state={state} setState={setState}><main className="utility-page"><div className="utility-hero"><p className="eyebrow">KNOWLEDGE MAP</p><h1>{lang==='zh'?'13 個概念點樣連埋一齊':'How the 13 concepts connect'}</h1><p>{lang==='zh'?'實線代表先備依賴。你可以由基礎主線開始，再分到資料、產品、部署同治理。':'Dependencies flow from foundations into knowledge, agents, products, deployment, and governance.'}</p></div><div className="concept-map" role="img" aria-label={lang==='zh'?'十三個主題依賴圖':'Dependency map for thirteen topics'}>{topics.map((topic)=><Link href={`/learn/${topic.slug}`} className={`concept-node level-${Math.min(topic.prerequisites.length,3)} ${state.topicProgress[topic.id].status}`} key={topic.id}><span>{String(topic.order).padStart(2,'0')}</span><div><b>{pick(topic.title,lang)}</b><small>{topic.prerequisites.length?`${lang==='zh'?'先備':'Prereq'}: ${topic.prerequisites.map((id)=>id.toUpperCase()).join(', ')}`:(lang==='zh'?'起點':'Starting point')}</small></div><i>{state.topicProgress[topic.id].status==='mastered'?'✓':'→'}</i></Link>)}</div><div className="map-legend"><span><i className="legend-foundation"/>{lang==='zh'?'較少先備':'Fewer prerequisites'}</span><span><i className="legend-advanced"/>{lang==='zh'?'跨主題整合':'Cross-topic integration'}</span></div></main></Shell>;
}

function Glossary({ state,setState }: { state:AcademyState; setState:React.Dispatch<React.SetStateAction<AcademyState>> }) {
  const lang=state.lang;const[query,setQuery]=useState('');const terms=topics.flatMap((topic)=>topic.vocabulary.map((item)=>({...item,topic})));const filtered=terms.filter((item)=>`${item.term} ${item.zhTerm} ${pick(item.definition,lang)}`.toLowerCase().includes(query.toLowerCase()));
  return <Shell state={state} setState={setState}><main className="utility-page"><div className="utility-hero glossary-hero"><p className="eyebrow">BILINGUAL GLOSSARY</p><h1>{lang==='zh'?'60+ 個核心詞彙，一次講清':'Core vocabulary, clearly defined'}</h1><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder={lang==='zh'?'搜尋 Token、冪等性、評估…':'Search token, idempotency, evaluation…'} /><b>{filtered.length}</b></label></div><div className="glossary-grid">{filtered.map((item)=><article key={`${item.topic.id}-${item.id}`}><div><span>{item.zhTerm}</span><em>{String(item.topic.order).padStart(2,'0')}</em></div><h2>{item.term}</h2><p>{pick(item.definition,lang)}</p><Link href={`/learn/${item.topic.slug}`}>{pick(item.topic.title,lang)} →</Link></article>)}</div>{filtered.length===0&&<div className="empty-state"><span>?</span><h2>{lang==='zh'?'搵唔到呢個詞':'No matching term'}</h2><p>{lang==='zh'?'試下 English technical term 或較短關鍵字。':'Try the English technical term or a shorter keyword.'}</p></div>}</main></Shell>;
}

function Settings({ state,setState }: { state:AcademyState; setState:React.Dispatch<React.SetStateAction<AcademyState>> }) {
  const lang=state.lang;const fileRef=useRef<HTMLInputElement>(null);const[message,setMessage]=useState('');
  const exportData=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='ai-academy-progress.json';anchor.click();URL.revokeObjectURL(url);setMessage(lang==='zh'?'進度已匯出。':'Progress exported.')};
  const importData=(event:ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const normalized=normalizeAcademyState(JSON.parse(String(reader.result)));if(!normalized)throw new Error();setState(normalized);setMessage(lang==='zh'?'進度已成功匯入。':'Progress imported.')}catch{setMessage(lang==='zh'?'檔案格式無效；原有進度冇改。':'Invalid file; existing progress was not changed.')}};reader.readAsText(file);event.target.value=''};
  const reset=()=>{if(window.confirm(lang==='zh'?'確定重設所有本機進度？呢個動作無法復原。':'Reset all local progress? This cannot be undone.')){setState(initialState());setMessage(lang==='zh'?'所有本機進度已重設。':'All local progress was reset.')}};
  return <Shell state={state} setState={setState}><main className="utility-page settings-page"><div className="utility-hero"><p className="eyebrow">LOCAL-FIRST SETTINGS</p><h1>{lang==='zh'?'你控制自己嘅學習資料':'You control your learning data'}</h1><p>{lang==='zh'?'進度只存喺呢個 browser。你可以匯出備份、匯入同版本資料，或者確認後重設。':'Progress stays in this browser. Export a backup, import matching versioned data, or reset with confirmation.'}</p></div><section className="settings-grid"><article><span>01</span><h2>{lang==='zh'?'語言':'Language'}</h2><p>{lang==='zh'?'繁體中文內容完整；English UI 同核心標題可切換，technical terms 保留英文。':'Traditional Chinese is complete; English UI and core titles are available, with technical terms preserved.'}</p><button onClick={()=>setState((current)=>({...current,lang:current.lang==='zh'?'en':'zh'}))}>{lang==='zh'?'Switch to English':'切換到繁體中文'}</button></article><article><span>02</span><h2>{lang==='zh'?'備份與轉移':'Backup & transfer'}</h2><p>{lang==='zh'?'JSON 包括 attempts、review queue、mastery 同設定；冇 API key 或帳戶資料。':'JSON includes attempts, review queue, mastery, and preferences—no API keys or account data.'}</p><div><button onClick={exportData}>{lang==='zh'?'匯出進度':'Export progress'}</button><button onClick={()=>fileRef.current?.click()}>{lang==='zh'?'匯入進度':'Import progress'}</button><input ref={fileRef} type="file" accept="application/json" onChange={importData} hidden/></div></article><article className="danger-setting"><span>03</span><h2>{lang==='zh'?'重設進度':'Reset progress'}</h2><p>{lang==='zh'?'刪除呢個 browser 入面所有完成狀態、測驗歷史同溫習隊列。':'Deletes completion states, quiz history, and review queue from this browser.'}</p><button onClick={reset}>{lang==='zh'?'重設所有進度':'Reset all progress'}</button></article></section>{message&&<p className="settings-message" role="status">{message}</p>}<section className="storage-note"><b>{lang==='zh'?'儲存 schema':'Storage schema'} v1</b><p>{lang==='zh'?'有效進度更新時會盡量保留；無效或損壞檔案會安全拒絕。':'Valid progress is preserved across updates where possible; malformed imports fail safely.'}</p></section></main></Shell>;
}

export default function AcademyClient({ view='dashboard', topicId }: { view?:'dashboard'|'lesson'|'review'|'assessment'|'map'|'glossary'|'settings'; topicId?:string }) {
  const {state,setState,ready}=useAcademyState();
  if(!ready)return <main className="loading-screen" aria-live="polite"><span className="brand-mark">AI</span><p>AI 學習院準備緊你嘅本機進度…</p></main>;
  if(view==='lesson'&&topicId){const topic=topicById(topicId);return topic?<Lesson topic={topic} state={state} setState={setState}/>:null;}
  if(view==='review')return <ReviewPage state={state} setState={setState}/>;
  if(view==='assessment')return <AssessmentPage state={state} setState={setState}/>;
  if(view==='map')return <ConceptMap state={state} setState={setState}/>;
  if(view==='glossary')return <Glossary state={state} setState={setState}/>;
  if(view==='settings')return <Settings state={state} setState={setState}/>;
  return <Dashboard state={state} setState={setState}/>;
}
