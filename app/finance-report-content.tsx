'use client';

import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { ArrowLeft, Download, FileText, GitBranch, Pause, Play, RotateCcw } from 'lucide-react';
import { pick, type Lang } from '../lib/curriculum';
import {
  reportLessonConcepts, reportLessonDiagram, reportLessonDraft, reportLessonHistory, reportLessonInput,
  reportLessonMarkdown, reportLessonPrompt, reportLessonQuote, reportLessonSource, reportLessonSteps, reportLessonStories,
} from '../lib/finance-report-lesson';
import { FinanceDiagramCanvas } from './finance-diagram';

const guidePath = '/downloads/stock-research-report-design.md';
const samplePath = '/downloads/stock-research-report-example.md';

function PriceChart({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const title = useId();
  const rows = reportLessonHistory;
  const low = Math.min(...rows.map(row => row.close));
  const high = Math.max(...rows.map(row => row.close));
  const first = rows[0];
  const last = rows[rows.length - 1];
  const change = (last.close / first.close - 1) * 100;
  const axis = { left: 30, right: 495, top: 27, bottom: 153 };
  const points = rows.map((row, index) => ({
    ...row,
    x: axis.left + index / (rows.length - 1) * (axis.right - axis.left),
    y: axis.bottom - (row.close - low) / (high - low || 1) * (axis.bottom - axis.top),
  }));

  return <article className="report-chart">
    <div className="report-chart-heading">
      <div><h4>{zh ? '每日收市價' : 'Daily closing price'}</h4>
        <p>{zh ? '虛構 MSFT 數據 · USD · 調整後收市價' : 'Fictional MSFT series · USD · adjusted closes'}</p></div>
      <div><strong>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</strong>
        <p>{zh ? '首個至最後一個收市價' : 'First to last close'}</p></div>
    </div>
    <svg viewBox="0 0 570 191" role="img" aria-labelledby={title}>
      <title id={title}>{zh ? `虛構價格由 ${first.close} 至 ${last.close} 美元` : `Fictional prices from ${first.close} to ${last.close} USD`}</title>
      {[axis.top, (axis.top + axis.bottom) / 2, axis.bottom].map(y =>
        <line key={y} className="report-chart-rule" x1={axis.left} x2={axis.right} y1={y} y2={y}/>)}
      <polyline points={points.map(point => `${point.x},${point.y}`).join(' ')} className="report-chart-line"/>
      {points.map(point => <circle key={point.date} cx={point.x} cy={point.y} r={4} className="report-chart-point">
        <title>{point.date} · {point.close.toFixed(2)} USD</title>
      </circle>)}
      <text x={509} y={axis.top + 4}>{high.toFixed(2)}</text>
      <text x={509} y={axis.bottom + 4}>{low.toFixed(2)}</text>
      <text x={axis.left} y={178}>{first.date}</text>
      <text x={axis.right} y={178} textAnchor="end">{last.date}</text>
    </svg>
    <details>
      <summary>{zh ? '查看繪圖用價格' : 'Inspect the prices behind the chart'}</summary>
      <table>
        <thead><tr><th scope="col">{zh ? '日期' : 'Date'}</th><th scope="col">{zh ? '調整後收市價（USD）' : 'Adjusted close (USD)'}</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.date}><td>{row.date}</td><td>{row.close.toFixed(2)}</td></tr>)}</tbody>
      </table>
    </details>
  </article>;
}

function QuotePanel({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  return <article className="report-chart">
    <div className="report-chart-heading">
      <div><h4>{reportLessonQuote.symbol} · {zh ? '虛構報價' : 'Fictional quote'}</h4>
        <p>{zh ? '定時市場觀察' : 'Timestamped market observation'}</p></div>
      <strong>{reportLessonQuote.currency} {reportLessonQuote.price.toFixed(2)}</strong>
    </div>
    <dl className="report-quote-fields">
      <div><dt>{zh ? '市場時間' : 'Market time'}</dt><dd>{reportLessonQuote.market_timestamp}</dd></div>
      <div><dt>{zh ? '抓取時間' : 'Fetched at'}</dt><dd>{reportLessonQuote.fetched_at}</dd></div>
      <div><dt>{zh ? '價格基準' : 'Price basis'}</dt><dd>{reportLessonQuote.price_basis}</dd></div>
      <div><dt>{zh ? '抓取時市場狀態' : 'Market state at fetch'}</dt><dd>{zh ? '盤後' : 'Post-market'}</dd></div>
      <div><dt>{zh ? '延遲狀態' : 'Delay status'}</dt><dd>{zh ? '未知' : reportLessonQuote.delay_status}</dd></div>
    </dl>
    <details><summary>{zh ? '檢視報價 JSON' : 'Inspect the quote JSON'}</summary><pre>{JSON.stringify(reportLessonQuote, null, 2)}</pre></details>
  </article>;
}

function ReportPreview({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const [format, setFormat] = useState<'web' | 'markdown' | 'pdf'>('web');
  const formats: { id: typeof format; label: string }[] = [
    { id: 'web', label: zh ? '網頁' : 'Web' },
    { id: 'markdown', label: 'Markdown' },
    { id: 'pdf', label: zh ? 'PDF 版面' : 'PDF layout' },
  ];

  return <>
    <div className="vd-scenarios" role="group" aria-label={zh ? '報告格式' : 'Report format'}>
      {formats.map(item => <button type="button" key={item.id} aria-pressed={format === item.id}
        onClick={() => setFormat(item.id)}>{item.label}</button>)}
    </div>
    {format === 'markdown' ? <pre className="report-json">{reportLessonMarkdown}</pre> :
      <article className="report-sample" data-format={format}>
        <div className="report-sample-header">
          <p>{zh ? '虛構研究報告' : 'Fictional research report'}</p>
          <h4>{reportLessonInput.company} · {reportLessonInput.horizon}</h4>
          <p>{reportLessonInput.question}</p>
          <p><strong>{zh ? '證據截止' : 'Evidence cutoff'}</strong> {reportLessonInput.as_of}</p>
        </div>
        <h5>{zh ? '答案' : 'Answer'}</h5><p>{reportLessonDraft.answer}</p>
        <h5>{zh ? '支持證據' : 'Supporting evidence'}</h5>
        <ul>{reportLessonDraft.facts.map(fact => <li key={fact.claim}>{fact.claim} <code>[{fact.source_ids.join(', ')}]</code></li>)}</ul>
        <h5>{zh ? '條件情境' : 'Conditional scenarios'}</h5>
        {reportLessonDraft.scenarios.map(scenario => <dl className="report-scenario" key={scenario.kind}>
          <div><dt>{scenario.kind}</dt><dd>{scenario.inference} <code>[{scenario.source_ids.join(', ')}]</code></dd></div>
          <div><dt>{zh ? '假設' : 'Assumptions'}</dt><dd>{scenario.assumptions.join(' ')}</dd></div>
          <div><dt>{zh ? '失效訊號' : 'Invalidation signals'}</dt><dd>{scenario.invalidation_signals.join(' ')}</dd></div>
        </dl>)}
        <h5>{zh ? '限制' : 'Limitations'}</h5>
        <ul>{reportLessonDraft.limitations.map(limit => <li key={limit}>{limit}</li>)}</ul>
        <h5>{zh ? '來源' : 'Sources'}</h5>
        <ul><li>
          <code>[{reportLessonSource.source_id}]</code> {reportLessonSource.published_at} · <a href={reportLessonSource.url}>{reportLessonSource.title}</a>
        </li></ul>
      </article>}
    {format === 'pdf' && <p className="vd-caption">{zh ? 'PDF 模擬版面。正式匯出由已儲存的報告產生，並加入分頁及列印樣式。' : 'PDF layout preview. A production print exporter can paginate this same saved report and apply print styles.'}</p>}
    <p><a href={samplePath} download>{zh ? '下載 Markdown 範例' : 'Download the Markdown example'}</a></p>
  </>;
}

type StoryId = (typeof reportLessonStories)[number]['id'];

function ReportStory({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const [storyId, setStoryId] = useState<StoryId>('news');
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const story = reportLessonStories.find(item => item.id === storyId) ?? reportLessonStories[0];
  const stepId = story.path[position];
  const step = reportLessonSteps[stepId];
  const ending = position === story.path.length - 1;
  const running = playing && !ending;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setPosition(position + 1), 3200);
    function pauseIfHidden() {
      if (document.hidden) setPlaying(false);
    }
    document.addEventListener('visibilitychange', pauseIfHidden);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', pauseIfHidden);
    };
  }, [position, running]);

  function goTo(index: number) {
    setPlaying(false);
    setPosition(index);
  }

  return <section className="finance-section" id="report-story">
    <h2>{zh ? '同一個 app，三條路線' : 'Three questions, three report paths'}</h2>
    <div className="vd-scenarios" role="group" aria-label={zh ? '報告情境' : 'Report scenarios'}>
      {reportLessonStories.map(item => <button type="button" key={item.id} aria-pressed={storyId === item.id}
        onClick={() => { setStoryId(item.id); goTo(0); }}>{pick(item.title, lang)}</button>)}
    </div>
    <p className="report-question"><strong>{zh ? '問題' : 'Question'}</strong> {pick(story.question, lang)}</p>
    <div className="vd-controls">
      <button type="button" onClick={() => {
        if (ending) setPosition(0);
        setPlaying(!running);
      }}>{running ? <Pause size={16}/> : <Play size={16}/>}
        {running ? (zh ? '暫停' : 'Pause') : (zh ? '播放' : 'Play')}
      </button>
      <button type="button" disabled={position === 0} onClick={() => goTo(position - 1)}>{zh ? '上一步' : 'Back'}</button>
      <button type="button" disabled={ending} onClick={() => goTo(position + 1)}>{zh ? '下一步' : 'Next'}</button>
      <button type="button" onClick={() => goTo(0)}><RotateCcw size={16}/>{zh ? '重設' : 'Reset'}</button>
      <span>{position + 1} / {story.path.length}</span>
    </div>
    <ol className="rag-steps">
      {story.path.map((id, index) => <li key={id}>
        <button type="button" aria-current={position === index ? 'step' : undefined} onClick={() => goTo(index)}>
          {index + 1}. {pick(reportLessonSteps[id].title, lang)}
        </button>
      </li>)}
    </ol>
    <article className="vd-stage report-story-stage">
      <h3 aria-live={running ? 'off' : 'polite'}>{pick(step.title, lang)}</h3>
      <p>{pick(step.body, lang)}</p>
      {stepId === 'evidence' && <ul>{reportLessonInput.evidence.map(item =>
        <li key={item.source_id}><code>{item.source_id}</code> · {item.excerpt} <small>{item.published_at}</small></li>)}</ul>}
      {stepId === 'context' && <div className="rag-payload-grid">
        <article className="rag-payload"><h4>{zh ? 'system 訊息' : 'System message'}</h4><pre>{reportLessonPrompt}</pre></article>
        <article className="rag-payload"><h4>{zh ? 'user 訊息 · JSON 資料' : 'User message · JSON data'}</h4><pre>{JSON.stringify(reportLessonInput, null, 2)}</pre></article>
      </div>}
      {stepId === 'generate' && <article className="rag-payload"><h4>{zh ? '模擬 OpenRouter JSON 回應' : 'Simulated OpenRouter JSON response'}</h4><pre>{JSON.stringify(reportLessonDraft, null, 2)}</pre></article>}
      {stepId === 'validate' && <ul className="fr-check-list">
        <li>{zh ? 'Schema 及全部來源 ID 有效。' : 'The JSON schema and source IDs pass validation.'}</li>
        <li>{zh ? '每項聲稱都有相符的引文支持。' : 'The cited passages support the claims.'}</li>
        <li>{zh ? 'App 由資料庫取得來源 URL，再保存已核對報告及引用。' : 'The app resolves source URLs from stored data and saves the checked report and its citations.'}</li>
      </ul>}
      {(stepId === 'quote' || (stepId === 'render' && storyId === 'quote')) && <QuotePanel lang={lang}/>}
      {(stepId === 'history' || (stepId === 'render' && storyId === 'history')) && <PriceChart lang={lang}/>}
      {stepId === 'render' && storyId === 'news' && <ReportPreview lang={lang}/>}
    </article>
  </section>;
}

export default function FinanceReportContent({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const [topic, setTopic] = useState(reportLessonConcepts[0].id);
  const active = reportLessonConcepts.find(item => item.id === topic) ?? reportLessonConcepts[0];

  return <main className="utility-page finance-page vd-page report-design-page">
    <Link href="/finance-project" className="fr-inline-link"><ArrowLeft size={16}/>{zh ? '返回股票研究項目' : 'Back to the stock research project'}</Link>
    <header className="utility-hero">
      <p className="eyebrow">Stock research · OpenRouter · YFinance</p>
      <h1>{zh ? '從證據寫成一份可核對的股票報告。' : 'From evidence to a stock report you can check.'}</h1>
      <p>{zh ? '播放報告流程，查看選定的 RAG 證據、系統提示及 OpenRouter JSON。比較何時適合顯示有時間標記的報價、歷史走勢或有引用的研究報告。' : 'Follow selected RAG evidence into an OpenRouter report. See the exact system prompt and JSON, then compare when to use a quote, a price chart, or a cited report.'}</p>
      <div className="fr-hero-actions">
        <a className="primary-action" href="#report-story"><Play size={17}/>{zh ? '試三條報告路線' : 'Try the three storylines'}</a>
        <a className="secondary-action" href="#report-mindmap"><GitBranch size={17}/>{zh ? '查看設計心智圖' : 'See the design mind map'}</a>
        <a className="secondary-action" href={guidePath} download><Download size={17}/>{zh ? '下載設計指南' : 'Download the design guide'}</a>
      </div>
    </header>
    <div className="fr-disclosure"><FileText size={23}/><p>{zh ? '離線教材使用虛構證據、報價及價格序列。報價專用及走勢路線是建議功能；PDF 是版面預覽。' : 'The offline examples use fictional evidence and prices. Quote-only and price-history paths are proposed features. The PDF option previews a print layout.'}</p></div>
    <ReportStory lang={lang}/>
    <section className="finance-section" id="report-mindmap">
      <h2>{zh ? '心智圖：每項資料放在哪裡？' : 'Mind map for designing the report'}</h2>
      <div className="vd-map-root"><FileText size={22}/>{zh ? '一份已驗證的報告' : 'One validated report'}</div>
      <div className="vd-mindmap">{reportLessonConcepts.map(item =>
        <button key={item.id} type="button" aria-pressed={active.id === item.id} onClick={() => setTopic(item.id)}>
          <strong>{pick(item.title, lang)}</strong><span>{pick(item.short, lang)}</span>
        </button>)}</div>
      <article className="vd-concept" aria-live="polite"><h3>{pick(active.title, lang)}</h3><p>{pick(active.body, lang)}</p></article>
    </section>
    <section className="finance-section" id="report-workflow">
      <h2>{zh ? '工作流程：問題決定所需資料' : 'The question determines which data to fetch'}</h2>
      <FinanceDiagramCanvas diagram={reportLessonDiagram} lang={lang}/>
      <p><Link href="/finance-project/rag">{zh ? 'RAG 故事' : 'RAG storyline'}</Link> · <Link href="/finance-project/openrouter">{zh ? 'OpenRouter 設定' : 'OpenRouter setup'}</Link> · <Link href="/finance-project#finance-database">PostgreSQL</Link></p>
      <ul>
        <li><a href="https://openrouter.ai/docs/guides/features/structured-outputs">OpenRouter structured outputs</a></li>
        <li><a href="https://ranaroussi.github.io/yfinance/reference/api/yfinance.Ticker.history.html">YFinance price history</a></li>
      </ul>
    </section>
  </main>;
}
