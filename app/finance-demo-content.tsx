'use client';

import Link from 'next/link';
import { useEffect, useReducer, useRef, useState } from 'react';
import { ArrowRight, Check, Code2, Database, Download, FileText, Layers, RotateCcw, Search, ShieldCheck } from 'lucide-react';
import { type Copy, type Lang, pick } from '../lib/curriculum';
import {
  financeDemoAnalysis, financeDemoEvidence, financeDemoExport, financeDemoPages,
  financeDemoPreparedMarkdown, financeDemoQuestions, financeDemoReducer, financeDemoSamples,
  initialFinanceDemo, type FinanceDemoScenario, type FinanceDemoState,
} from '../lib/finance-demo';

const steps = [
  { en: 'Choose reports', zh: '選擇財報' },
  { en: 'Convert', zh: '轉換' },
  { en: 'Index & ask', zh: '索引及提問' },
  { en: 'Check evidence', zh: '核對證據' },
  { en: 'Read & export', zh: '閱讀及匯出' },
] satisfies Copy[];

const phase = { choose: 0, source: 0, review: 1, 'ocr-required': 1, rejected: 1, markdown: 1, indexed: 2, evidence: 3, result: 4 } satisfies Record<FinanceDemoState['kind'], number>;

const owners = [
  { name: 'Next.js + Spring Boot', detail: { en: 'The browser lets you choose reports. In the real app, Spring checks login, report access and versions before creating a processing job.', zh: '瀏覽器讓你選擇財報。真實應用中，Spring 建立處理工作前先核對登入、財報權限及版本。' }, usage: { en: 'No model needed to select or register a report.', zh: '選擇及登記財報毋須模型。' } },
  { name: 'Python + MarkItDown', detail: { en: 'A private worker converts the file once and saves Markdown beside the original. Standard local conversion uses no LLM. Review tables and preserve page references explicitly.', zh: '私人 worker 轉換檔案一次，把 Markdown 與原檔一同儲存。標準本機轉換不使用 LLM；表格須覆核，頁碼須明確保留。' }, usage: { en: 'OCR, vision or cloud conversion may add charges.', zh: 'OCR、視覺模型或雲端轉換可能另外收費。' } },
  { name: 'Python + PostgreSQL / pgvector', detail: { en: 'Split the saved Markdown into evidence passages with report, year, page and version metadata. Create a keyword index and evaluated embeddings for later retrieval.', zh: '把已儲存 Markdown 分成證據段落，附財報、年份、頁碼及版本，再建立關鍵詞索引及經評估的嵌入供檢索。' }, usage: { en: 'Hosted embedding calls can consume model usage. This demo creates none.', zh: '託管嵌入模型可能產生用量；示範不會建立嵌入。' } },
  { name: 'LangGraph + Python + optional LLM', detail: { en: 'Retrieve permitted evidence from the saved index. Calculate reviewed figures in Python. For an explanation, a model drafts from that evidence; check units, periods and citations. Missing causes produce a partial answer.', zh: '從已儲存索引檢索獲准證據，再以 Python 計算已覆核數字。需要解釋時，模型依該證據草擬，再核對單位、期間及引用；缺少原因便提供部分答案。' }, usage: { en: 'Arithmetic skips the answer LLM. Explanations use selected passages, not the whole report. Text here is prepared, with no model call.', zh: '算術略過答案 LLM；解釋使用所選段落，毋須整份報告。此處文字是預先編寫，沒有模型呼叫。' } },
  { name: 'Python → Spring Boot → Next.js', detail: { en: 'Python saves the validated analysis. Spring checks access and returns the result through its API. The user can inspect citations and export the analysis. This demo downloads a real local Markdown file.', zh: 'Python 儲存已驗證分析。Spring 核對權限並經 API 回傳結果；使用者可核對引用及匯出分析。此示範可下載真正的本機 Markdown 檔案。' }, usage: { en: 'Formatting an existing result needs no new model call.', zh: '把已有結果排成檔案毋須再次呼叫模型。' } },
] satisfies { name: string; detail: Copy; usage: Copy }[];

export default function FinanceDemoContent({ lang }: { lang: Lang }) {
  const [state, dispatch] = useReducer(financeDemoReducer, initialFinanceDemo);
  const [inspectedPage, setInspectedPage] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const citationTrigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (state.kind !== 'choose') headingRef.current?.focus();
  }, [state.kind]);
  const stage = phase[state.kind];
  const owner = owners[stage];
  const scenario = state.kind === 'choose' ? null : state.scenario;
  const sample = financeDemoSamples.find(item => item.id === scenario);
  const pages = scenario === null ? [] : financeDemoPages(scenario);
  const inspected = pages.find(page => page.id === inspectedPage);
  const hasMarkdown = state.kind === 'markdown' || state.kind === 'indexed' || state.kind === 'evidence' || state.kind === 'result';
  const canAsk = state.kind === 'indexed' || state.kind === 'evidence' || state.kind === 'result';
  const result = state.kind === 'result' ? financeDemoAnalysis(state.scenario, state.question) : null;
  const select = (next: FinanceDemoScenario) => { setInspectedPage(null); dispatch({ type: 'select', scenario: next }); };
  const restart = () => { setInspectedPage(null); dispatch({ type: 'restart' }); };
  const inspect = (page: string, trigger: HTMLButtonElement) => {
    citationTrigger.current = trigger;
    setInspectedPage(page);
    window.requestAnimationFrame(() => {
      sourceRef.current?.focus();
      sourceRef.current?.scrollIntoView({ block: 'center' });
    });
  };
  const closeSource = () => { setInspectedPage(null); citationTrigger.current?.focus(); };
  const download = () => {
    if (state.kind !== 'result') return;
    const url = URL.createObjectURL(new Blob([financeDemoExport(state, lang)], { type: 'text/markdown;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `democo-sample-analysis-${lang}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return <main className="utility-page finance-page finance-demo-page">
    <header className="utility-hero fd-hero">
      <Link className="fd-back" href="/finance-project">← {lang === 'zh' ? '返回項目指南' : 'Back to the project guide'}</Link>
      <p className="eyebrow">REPORT TO ANSWER · INTERACTIVE PRODUCT DEMO</p>
      <h1>{lang === 'zh' ? '親手走一次財報分析流程' : 'Try the report-analysis workflow'}</h1>
      <p>{lang === 'zh' ? '載入兩份示例財報，看 PDF 內容怎樣變成 Markdown、證據及附引用答案。每一步都解釋使用者要做甚麼，以及後端由誰負責。' : 'Load two sample reports and see how their content becomes Markdown, evidence and a cited answer. Each step explains what you do and which service would handle the work.'}</p>
      <div className="fd-notice"><span className="fd-dot" aria-hidden="true"/><div><strong>{lang === 'zh' ? '離線示範 · 全部資料均屬虛構' : 'Offline demonstration · all data is fictional'}</strong><p>{lang === 'zh' ? '使用預先編寫的段落及答案。此頁不會上載或轉換 PDF、建立向量、呼叫模型或驗證真實帳戶。匯出會在你的瀏覽器產生示例 .md 檔。' : 'Uses prepared passages and answers. This page does not upload or convert PDFs, create vectors, call models or authenticate real accounts. Export creates a sample .md file in your browser.'}</p></div></div>
      <div className="fd-hero-links"><a href="#demo-workspace">{lang === 'zh' ? '開始操作示範' : 'Start the walkthrough'} <ArrowRight size={16} aria-hidden="true"/></a><Link href="/finance-project#finance-markitdown">{lang === 'zh' ? '閱讀 MarkItDown 指南' : 'Read the MarkItDown guide'}</Link><Link href="/finance-project/proposal">{lang === 'zh' ? '開發及部署提案' : 'Development and deployment proposal'}</Link></div>
    </header>

    <section className="fd-workshop" id="demo-workspace" aria-labelledby="fd-samples-title">
      <div className="fd-section-heading"><div><p className="eyebrow">01 · PICK A LEARNING SCENARIO</p><h2 id="fd-samples-title">{lang === 'zh' ? '先試完整流程，再看例外情況' : 'Start with a supported answer, then try an exception'}</h2></div><button className="fd-reset" type="button" onClick={restart}><RotateCcw size={15} aria-hidden="true"/>{lang === 'zh' ? '重新開始' : 'Reset demo'}</button></div>
      <div className="fd-samples" role="group" aria-label={lang === 'zh' ? '選擇虛構財報情境' : 'Choose a fictional report scenario'}>{financeDemoSamples.map(item => <button type="button" key={item.id} aria-pressed={scenario === item.id} onClick={() => select(item.id)}><span>{item.tag}</span><strong>{pick(item.title, lang)}</strong><small>{pick(item.detail, lang)}</small><i aria-hidden="true">{scenario === item.id ? '✓' : '→'}</i></button>)}</div>

      <ol className="fd-progress" aria-label={lang === 'zh' ? '分析流程進度' : 'Analysis workflow progress'}>{steps.map((step, index) => <li key={step.en} data-current={index === stage} data-done={index < stage} aria-current={index === stage ? 'step' : undefined}><span>{index < stage ? <Check size={14} aria-hidden="true"/> : index + 1}</span><b>{pick(step, lang)}</b></li>)}</ol>

      <div className="fd-workspace">
        <article className="fd-task" aria-live="polite" aria-atomic="false">
          <div className="fd-task-heading"><p className="eyebrow">{stage + 1} / {steps.length} · {sample ? pick(sample.title, lang) : lang === 'zh' ? '準備開始' : 'READY WHEN YOU ARE'}</p><h2 ref={headingRef} tabIndex={-1}>{pick(steps[stage], lang)}</h2></div>

          {state.kind === 'choose' && <div className="fd-welcome"><div className="fd-mini-flow" aria-hidden="true"><FileText/><ArrowRight/><Code2/><ArrowRight/><Search/><ArrowRight/><ShieldCheck/></div><h3>{lang === 'zh' ? '「為何現金流下跌？」' : '“Why did cash flow fall?”'}</h3><p>{lang === 'zh' ? 'DemoCo 的示例數字為 HKD 100m 至 HKD 80m。跟著按鈕，查看系統怎樣核對數字、找到原因及引用原文。先按下方按鈕，或選擇上方其他情境。' : 'DemoCo’s sample figures go from HKD100m to HKD80m. Follow the buttons to check the numbers, find the explanation and cite the source. Start below or choose another scenario above.'}</p><button className="fd-primary" type="button" onClick={() => select('supported')}>{lang === 'zh' ? '載入兩份示例財報' : 'Load the two sample reports'} <ArrowRight size={17} aria-hidden="true"/></button></div>}

          {state.kind === 'source' && <><p className="fd-instruction">{lang === 'zh' ? '已選擇 DemoCo 2024 及 2025 年報示例。下方是虛構的原文預覽，讓你知道轉換後應保留甚麼。' : 'The DemoCo 2024 and 2025 report examples are selected. These fictional source previews show what the conversion should preserve.'}</p><SourcePreview pages={pages} lang={lang}/>{state.scenario === 'scanned' && <div className="fd-scan"><FileText size={44} aria-hidden="true"/><h3>{lang === 'zh' ? '掃描頁面示例' : 'Scanned-page example'}</h3><p>{lang === 'zh' ? '此示例沒有可擷取文字。按模擬轉換，看看流程在哪裏停下。' : 'This example has no extractable text. Simulate conversion to see where processing stops.'}</p><div aria-hidden="true"><i/><i/><i/><i/></div></div>}<div className="fd-action"><button type="button" className="fd-primary" onClick={() => dispatch({ type: 'convert' })}>{lang === 'zh' ? '模擬 MarkItDown 轉換' : 'Simulate MarkItDown conversion'} <ArrowRight size={17} aria-hidden="true"/></button><small>{lang === 'zh' ? '顯示預先準備的結果，不會實際執行轉換。' : 'Shows a prepared result; no converter actually runs.'}</small></div></>}

          {state.kind === 'review' && <div className="fd-blocked fd-review"><span className="fd-status">AWAITING REVIEW</span><h3>{lang === 'zh' ? '先覆核錯誤讀取的數字' : 'Review a misread number before indexing'}</h3><p>{lang === 'zh' ? '原文 2025 年現金流是 HKD 80m，轉換候選卻讀成 HKD 800m。索引及問答已暫停。' : 'The source shows 2025 cash flow of HKD80m, but the conversion candidate reads HKD800m. Indexing and questions are paused.'}</p><div className="fd-review-values"><div><small>{lang === 'zh' ? '原文 · 2025 · 第 48 頁' : 'Source · 2025 · page 48'}</small><strong>HKD 80m</strong></div><div><small>{lang === 'zh' ? '錯誤轉換候選' : 'Incorrect conversion candidate'}</small><strong>HKD 800m</strong></div></div><p>{lang === 'zh' ? '真實應用由 Spring 核對覆核者權限及財報版本，再由 Python 記錄修正及恢復處理。以下按鈕只模擬該決定。' : 'In the real app, Spring verifies reviewer access and report versions. Python records the authorized correction and resumes processing. These buttons only simulate that decision.'}</p><div className="fd-button-row"><button type="button" className="fd-primary" onClick={() => dispatch({ type: 'approve-review' })}>{lang === 'zh' ? '模擬獲授權覆核：使用 80m' : 'Simulate authorized review: use 80m'}</button><button type="button" className="fd-secondary" onClick={() => dispatch({ type: 'reject-review' })}>{lang === 'zh' ? '模擬拒絕此轉換' : 'Simulate rejecting the conversion'}</button></div></div>}

          {state.kind === 'ocr-required' && <div className="fd-blocked"><span className="fd-status">OCR REQUIRED</span><h3>{lang === 'zh' ? '未找到可用文字，流程停下' : 'No usable text: stop before indexing'}</h3><p>{lang === 'zh' ? '這份掃描示例不能走標準文字擷取。需要另外設定 OCR 或視覺處理並覆核結果；這可能產生費用。示範不會自動呼叫付費服務，也不會編造 Markdown。' : 'This scanned example cannot use standard text extraction. Configure OCR or vision processing separately and review its output; that may incur charges. The demo does not call a paid service or invent Markdown.'}</p><button type="button" className="fd-primary" onClick={() => select('supported')}>{lang === 'zh' ? '改試文字 PDF 示例' : 'Try the text-PDF example'}</button><Link href="/finance-project#finance-markitdown">{lang === 'zh' ? '查看轉換與費用指南' : 'Read the conversion and cost guide'} →</Link></div>}

          {state.kind === 'rejected' && <div className="fd-blocked"><span className="fd-status">CONVERSION REJECTED</span><h3>{lang === 'zh' ? '這個版本不能繼續分析' : 'This conversion cannot continue to analysis'}</h3><p>{lang === 'zh' ? '沒有建立索引或答案。真實流程會保留拒絕及原因，等待更正來源或重新處理；不是讓模型自行批准。你可以選另一個示例或重試覆核情境。' : 'No index or answer was created. The real workflow records the rejection and reason, then waits for a corrected source or another conversion. A model cannot approve itself. Choose another example or retry the review scenario.'}</p><button type="button" className="fd-secondary" onClick={() => select('review')}>{lang === 'zh' ? '重試覆核情境' : 'Retry the review scenario'}</button></div>}

          {hasMarkdown && <details className="fd-artifacts" open={state.kind === 'markdown'}><summary><FileText size={17} aria-hidden="true"/>{lang === 'zh' ? '比較原文及預先準備的 Markdown' : 'Compare the source and prepared Markdown'}<span>PDF → .md</span></summary><p>{lang === 'zh' ? '示意資料已保留年份、單位及頁碼。真實轉換須自行驗證這些對應；不能假設 MarkItDown 自動保留全部頁碼或表格。' : 'The example includes years, units and page references. Verify these mappings in real conversion; MarkItDown does not guarantee all page references or tables are preserved.'}</p><div className="fd-artifact-columns"><div><h3>{lang === 'zh' ? '虛構來源摘錄' : 'Fictional source excerpts'}</h3><SourcePreview pages={pages} lang={lang}/></div><div><h3>{lang === 'zh' ? '預先準備的 Markdown' : 'Prepared sample Markdown'}</h3><pre tabIndex={0}><code>{financeDemoPreparedMarkdown(state.scenario)}</code></pre></div></div></details>}

          {state.kind === 'markdown' && <div className="fd-action"><p>{lang === 'zh' ? '把轉換結果儲存一次，再分成可檢索段落。每段都要帶著原文出處。' : 'Save the conversion once, then split it into searchable passages. Keep the original source attached to every passage.'}</p><button type="button" className="fd-primary" onClick={() => dispatch({ type: 'index' })}><Layers size={17} aria-hidden="true"/>{lang === 'zh' ? '建立示例索引' : 'Build the sample index'}</button><small>{lang === 'zh' ? '使用固定段落；不會連接資料庫或呼叫嵌入模型。' : 'Uses fixed passages; no database connection or embedding call.'}</small></div>}

          {canAsk && <div className="fd-question-panel"><span className="fd-status">{lang === 'zh' ? '示例索引可供使用' : 'SAMPLE INDEX READY'}</span><h3>{lang === 'zh' ? '選一個問題' : 'Choose a question'}</h3><p>{lang === 'zh' ? '這是預設問題示範。再次提問會重用相同轉換及索引。' : 'These are preset demonstration questions. Asking again reuses the same conversion and index.'}</p><div className="fd-questions">{financeDemoQuestions.map(question => <button type="button" key={question.id} aria-pressed={(state.kind === 'evidence' || state.kind === 'result') && state.question === question.id} onClick={() => { setInspectedPage(null); dispatch({ type: 'ask', question: question.id }); }}><Search size={17} aria-hidden="true"/>{pick(question.title, lang)}<ArrowRight size={16} aria-hidden="true"/></button>)}</div></div>}

          {(state.kind === 'evidence' || state.kind === 'result') && <div className="fd-evidence"><h3>{lang === 'zh' ? '這次問題找到的證據' : 'Evidence selected for this question'}</h3><p>{lang === 'zh' ? '下方只是從預設示例選出的段落，並非即時執行向量搜尋。模型需要的是相關證據及提示，毋須每次接收整份 Markdown。' : 'These passages are selected from the prepared example, not a live vector search. The model would receive relevant evidence and the prompt, rather than the whole Markdown file each time.'}</p>{financeDemoEvidence(state.scenario, state.question).map(item => <button className="fd-evidence-card" type="button" key={item.id} aria-expanded={inspectedPage === item.id} aria-controls="fd-source-preview" onClick={event => inspect(item.id, event.currentTarget)}><span>{item.id} · {item.year} · {lang === 'zh' ? '頁' : 'p.'} {item.page}</span><strong>{pick(item.title, lang)}</strong><p>{pick(item.text, lang)}</p><small>{lang === 'zh' ? '查看虛構來源摘錄 ↗' : 'Inspect the fictional source excerpt ↗'}</small></button>)}</div>}

          {state.kind === 'evidence' && <div className="fd-action"><button type="button" className="fd-primary" onClick={() => dispatch({ type: 'validate' })}><ShieldCheck size={17} aria-hidden="true"/>{lang === 'zh' ? '核對計算並顯示示例答案' : 'Check the calculation and show the sample answer'}</button><small>{lang === 'zh' ? '計算由程式完成；原因解釋是預先編寫的示例。' : 'Code performs the calculation; the explanation is prepared sample text.'}</small></div>}

          {state.kind === 'result' && result && <section className={`fd-result fd-result-${result.kind}`} aria-labelledby="fd-result-title"><span className="fd-status">{result.kind === 'partial' ? 'PARTIAL · MISSING CAUSE' : state.question === 'cashflow-change' ? 'CHECKED CODE RESULT' : 'SUPPORTED SAMPLE ANSWER'}</span><h3 id="fd-result-title">{lang === 'zh' ? '經核對的示例結果' : 'The checked sample result'}</h3><div className="fd-result-metrics"><div><small>2024 · HKD m</small><strong>{result.before}</strong></div><ArrowRight size={22} aria-hidden="true"/><div><small>2025 · HKD m</small><strong>{result.after}</strong></div><div><small>{lang === 'zh' ? '變動' : 'Change'}</small><strong>{result.changePercent}%</strong></div></div><code className="fd-calculation">{result.calculation}</code><p>{pick(result.body, lang)}</p><div className="fd-citations">{result.evidence.map(item => <button type="button" key={item.id} aria-expanded={inspectedPage === item.id} aria-controls="fd-source-preview" onClick={event => inspect(item.id, event.currentTarget)}>{item.year} · {lang === 'zh' ? '第' : 'p.'} {item.page}{lang === 'zh' ? '頁' : ''} ↗</button>)}</div><ul className="fd-checks"><li><Check size={15} aria-hidden="true"/>{lang === 'zh' ? '相同公司、HKD 百萬及年度範圍' : 'Same company, HKD millions and annual periods'}</li><li><Check size={15} aria-hidden="true"/>{lang === 'zh' ? '算術核對及來源引用' : 'Arithmetic check and source references'}</li><li><Check size={15} aria-hidden="true"/>{result.kind === 'partial' ? lang === 'zh' ? '缺少原因已明確標示，沒有推測' : 'Missing cause stated without guessing' : lang === 'zh' ? '僅使用示例中有支持的內容' : 'Claims limited to the supplied example evidence'}</li></ul><button className="fd-primary" type="button" onClick={download}><Download size={17} aria-hidden="true"/>{lang === 'zh' ? '下載示例分析 .md' : 'Download the sample analysis .md'}</button><small className="fd-export-note">{lang === 'zh' ? '檔案包含相同答案、計算、虛構資料聲明及引用。上方可改問另一個問題，毋須重新轉換。' : 'The file includes this answer, calculation, fictional-data notice and references. Choose another question above without converting again.'}</small></section>}
        </article>

        <aside className="fd-system">
          <div className="fd-system-heading"><Code2 size={18} aria-hidden="true"/><p className="eyebrow">{lang === 'zh' ? '理解背後的系統' : 'INSIDE THIS STEP'}</p></div><h3>{owner.name}</h3><p>{pick(owner.detail, lang)}</p><div className="fd-usage"><strong>{lang === 'zh' ? '用量怎樣產生？' : 'Where does usage come from?'}</strong><p>{pick(owner.usage, lang)}</p><span>{lang === 'zh' ? '本示範的模型呼叫：0' : 'Model calls in this demo: 0'}</span></div><div className="fd-service-path" aria-label={lang === 'zh' ? '建議服務分工' : 'Proposed service ownership'}><span data-active={stage === 0 || stage === 4}>Next.js + Spring <small>UI · ACL · reports</small></span><i aria-hidden="true">↓</i><span data-active={stage === 1}>Python + MarkItDown <small>convert once · cache</small></span><i aria-hidden="true">↓</i><span data-active={stage === 2}><Database size={14} aria-hidden="true"/> PostgreSQL / pgvector <small>facts · evidence · index</small></span><i aria-hidden="true">↓</i><span data-active={stage === 3}>LangGraph + Python <small>retrieve · calculate · validate</small></span></div><p className="fd-system-note">{lang === 'zh' ? '先在本機開發。部署階段才以 Docker 打包並部署到 EC2。MarkItDown 可直接放在 Python worker，不必另開公開 MCP 服務。' : 'Develop locally first. Package with Docker and deploy to EC2 during the deployment stage. MarkItDown can run inside the Python worker without a public conversion MCP service.'}</p><Link href="/finance-project#finance-markitdown">{lang === 'zh' ? '閱讀實作指南' : 'Read the implementation guide'} →</Link>
          {inspected && <div ref={sourceRef} tabIndex={-1} id="fd-source-preview" className="fd-source-inspector" role="region" aria-label={lang === 'zh' ? '所選引用的原文' : 'Source for the selected citation'}><span>{lang === 'zh' ? '虛構來源' : 'FICTIONAL SOURCE'} · {inspected.year} · p.{inspected.page}</span><h4>{pick(inspected.title, lang)}</h4><blockquote>{pick(inspected.text, lang)}</blockquote><button type="button" onClick={closeSource}>{lang === 'zh' ? '關閉原文預覽' : 'Close source preview'}</button></div>}
        </aside>
      </div>
    </section>

    <section className="fd-next" aria-labelledby="fd-next-title"><div><p className="eyebrow">02 · BUILD YOUR FIRST REAL VERSION</p><h2 id="fd-next-title">{lang === 'zh' ? '先用兩份真實文字 PDF 驗證轉換' : 'Check conversion on two real text PDFs first'}</h2><p>{lang === 'zh' ? '從公開年報開始，核對表格、頁碼、期間及單位。通過後才加入索引、問答及部署。Webb-site 可補充公司資料，但此示範沒有連接該網站。' : 'Start with public annual reports. Check tables, pages, periods and units before adding indexing, questions and deployment. Webb-site can supplement company information; this demo does not connect to that site.'}</p></div><div><a href="/downloads/financial-report-markitdown-guide.md" download="FINANCIAL_REPORT_MARKITDOWN_GUIDE.md">{lang === 'zh' ? '下載 MarkItDown 開發指南' : 'Download the MarkItDown developer guide'} <Download size={17} aria-hidden="true"/></a><Link href="/finance-project#finance-langgraph">{lang === 'zh' ? '查看 LangGraph 流程設計' : 'Explore the LangGraph design'} →</Link></div></section>
  </main>;
}

function SourcePreview({ pages, lang }: { pages: ReturnType<typeof financeDemoPages>; lang: Lang }) {
  return <div className="fd-source-pages">{pages.map(page => <div className="fd-paper" key={page.id}><span>DEMOCO · {page.year} · {lang === 'zh' ? '虛構摘錄' : 'FICTIONAL EXCERPT'}</span><h4>{pick(page.title, lang)}</h4><p>{pick(page.text, lang)}</p><footer><code>{page.id}</code><small>{lang === 'zh' ? '原 PDF 頁碼' : 'Original PDF page'} {page.page}</small></footer></div>)}</div>;
}
