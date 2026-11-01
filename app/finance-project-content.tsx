'use client';

import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { type Lang, pick } from '../lib/curriculum';
import { financeAreas, financeBuildStages, financeStack, financeWorkflow } from '../lib/finance-project';
import { financeFunctionWorkflows } from '../lib/finance-function-workflows';
import { type FinanceIllustration, financeAreaIllustrations, financeOverviewIllustration } from '../lib/finance-illustrations';
import { financeApiWorkflows } from '../lib/finance-api-workflows';
import { FinanceApiContent } from './finance-api-content';

function IllustrationArt({ illustration, lang }: { illustration: FinanceIllustration; lang: Lang }) {
  return <div className="finance-illustration-art" data-layout={illustration.steps.length === 5 ? 'overview' : 'panels'}>
    {/* eslint-disable-next-line @next/next/no-img-element -- Local WebP files are shared with the office server without an image optimizer. */}
    <img src={illustration.src} width={illustration.width} height={illustration.height} alt={pick(illustration.alt, lang)} loading="lazy" decoding="async" />
    <div className="finance-illustration-keywords" aria-hidden="true">{illustration.steps.map(item => <span key={item.keyword}>{item.keyword}</span>)}</div>
  </div>;
}

function IllustratedConcept({ illustration, lang }: { illustration: FinanceIllustration; lang: Lang }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  return <figure className="finance-illustration">
    <div className="finance-illustration-image">
      <IllustrationArt illustration={illustration} lang={lang}/>
      <button type="button" className="finance-illustration-expand" onClick={() => dialog.current?.showModal()}>{lang === 'zh' ? '開啟完整插圖' : 'Open full-size illustration'} ↗</button>
      <dialog ref={dialog} className="finance-illustration-dialog" aria-labelledby={titleId}>
        <div className="finance-illustration-dialog-header"><p id={titleId}>{pick(illustration.caption, lang)}</p><button type="button" onClick={() => dialog.current?.close()}>{lang === 'zh' ? '關閉' : 'Close'} ×</button></div>
        <IllustrationArt illustration={illustration} lang={lang}/>
        <p className="finance-illustration-dialog-legend">{illustration.steps.map((item, index) => <span key={item.keyword}>{index + 1} · <strong>{item.keyword}</strong> — {pick(item, lang)}</span>)}</p>
      </dialog>
    </div>
    <figcaption><p className="eyebrow">{lang === 'zh' ? '用圖像理解' : 'THE VISUAL STORY'}</p><p className="finance-illustration-caption">{pick(illustration.caption, lang)}</p>
      <ol>{illustration.steps.map((item, index) => <li key={item.en}><b>{index + 1}</b><span><strong>{item.keyword}</strong> — {pick(item, lang)}</span></li>)}</ol>
      <p className="finance-illustration-note">{lang === 'zh' ? 'ChatGPT 生成的概念插圖；圖中形狀及走勢只作比喻，並非真實財務數據。實際流程與技術以下方文字為準。' : 'ChatGPT-generated concept illustration. Shapes and trends are metaphors, not real financial data. The text below specifies the actual workflow and tools.'}</p>
    </figcaption>
  </figure>;
}

export function FinanceProjectBanner({ lang }: { lang: Lang }) {
  return <aside className="hiring-banner finance-banner">
    <div><p className="eyebrow">FINANCE · PORTFOLIO PROJECT</p>
      <h2>{lang === 'zh' ? '把 AI 知識連成財報研究工具' : 'Connect your AI skills in a finance project'}</h2>
      <p>{lang === 'zh' ? '探索互動心智圖、24 項功能的逐步流程、每步技術及分階段驗收；由財報走到有引用的答案。' : 'Explore the mind map, step-by-step workflows for 24 functions, tools at each step and build stages—from reports to cited answers.'}</p>
    </div><Link href="/finance-project">{lang === 'zh' ? '探索財報分析項目' : 'Explore the financial report project'} →</Link>
  </aside>;
}

export default function FinanceProjectContent({ lang }: { lang: Lang }) {
  const [selected, setSelected] = useState(financeAreas[0]);
  const [step, setStep] = useState(0);
  const [scenario, setScenario] = useState<'supported' | 'missing'>('supported');
  const reducedMotion = useReducedMotion();
  const currentStep = financeWorkflow[step];
  const selectedFunctions = financeFunctionWorkflows[selected.id];

  return <main className="utility-page finance-page">
    <header className="utility-hero finance-hero">
      <p className="eyebrow">{lang === 'zh' ? 'FINANCE PROJECT BLUEPRINT · 證據 → 分析 → 解釋' : 'FINANCE PROJECT BLUEPRINT · EVIDENCE → ANALYSIS → EXPLANATION'}</p>
      <h1>{lang === 'zh' ? '香港財報分析助手' : 'Hong Kong Financial Report Analyst'}</h1>
      <p>{lang === 'zh' ? '把公開年報轉為可追溯數據，讓使用者比較公司、理解業績，並逐頁核對 AI 答案。適合結合你的銀行、Java／React、SQL 及 AI 知識。' : 'Turn public annual reports into traceable facts so a user can compare companies, understand results and verify AI answers against the source. Connect banking, Java/React, SQL and AI knowledge in one project.'}</p>
      <div className="finance-question"><span>{lang === 'zh' ? '使用者的問題' : 'THE USER’S QUESTION'}</span><p>{lang === 'zh' ? '「經營現金流為何下跌？比較這兩年的數字，並顯示原文證據。」' : '“Why did operating cash flow fall? Compare the two years and show the original evidence.”'}</p></div>
      <p className="finance-guide-note">{lang === 'zh' ? '這是項目設計及離線互動教學，並非已完成的財報分析服務。以下示例數字、頁碼及公司均為虛構；不會上載文件或呼叫模型。' : 'This is a project blueprint and offline learning guide, not a completed report-analysis service. The walkthrough uses fictional figures, page numbers and a fictional company. It does not upload files or call a model.'}</p>
    </header>

    <nav className="finance-section-links" aria-label={lang === 'zh' ? '項目指南目錄' : 'Project guide contents'}>
      <a href="#finance-pictures">{lang === 'zh' ? '圖像入門' : 'Picture guide'}</a>
      <a href="#finance-map">{lang === 'zh' ? '互動心智圖' : 'Mind map'}</a>
      <a href="#finance-functions">{lang === 'zh' ? '每項功能流程' : 'Function workflows'}</a>
      <a href="#finance-workflow">{lang === 'zh' ? '答案如何產生' : 'Answer walkthrough'}</a>
      <a href="#finance-stack">{lang === 'zh' ? '技術分工' : 'Technology stack'}</a>
      <a href="#finance-stages">{lang === 'zh' ? '建立次序' : 'Build stages'}</a>
      <Link href="/finance-project/proposal">{lang === 'zh' ? '開發提案及 EC2 部署' : 'Development proposal and EC2'}</Link>
    </nav>

    <aside className="hiring-banner finance-banner finance-proposal-banner"><div><p className="eyebrow">BUILD THE PROJECT · DEPLOY ON EC2</p><h2>{lang === 'zh' ? '按八個階段，把構想變成求職作品' : 'Turn this blueprint into a portfolio project'}</h2><p>{lang === 'zh' ? '查看每週 15 小時的 20 週提案、開發任務、驗收條件，以及 Docker Compose、EC2、備份與回滾設計。附完整 Markdown 下載。' : 'Read the 20-week plan at 15 hours per week, developer tasks, acceptance checks and the Docker Compose deployment design for EC2, including backup and rollback. Download the full Markdown proposal.'}</p></div><Link href="/finance-project/proposal">{lang === 'zh' ? '開啟開發提案' : 'Open the development proposal'} →</Link></aside>

    <section className="finance-section" id="finance-pictures" aria-labelledby="finance-pictures-title"><div className="finance-section-heading"><p className="eyebrow">START HERE · SEE THE IDEA</p><h2 id="finance-pictures-title">{lang === 'zh' ? '先看一張圖，理解整個項目' : 'Understand the project in one picture'}</h2><p>{lang === 'zh' ? '從左至右跟隨五個場景。重點是原始來源一直保留下來，計算有根據，最後仍能由人核對。' : 'Follow the five scenes from left to right. The original source stays connected, calculations have inputs and a person can check the final answer.'}</p></div><IllustratedConcept illustration={financeOverviewIllustration} lang={lang}/></section>

    <section className="finance-section" id="finance-map" aria-labelledby="finance-map-title">
      <div className="finance-section-heading"><p className="eyebrow">01 · EXPLORE THE PROJECT</p><h2 id="finance-map-title">{lang === 'zh' ? '由整體走入每個功能' : 'See the whole project, then explore a function'}</h2>
        <p>{lang === 'zh' ? '每條分支都有三項功能。點選任何分支，下面會顯示輸入、輸出、技術及驗收條件。右側分支是成果及工程支援，並非單一路徑的下一步。' : 'Each branch contains three functions. Select a branch to inspect its inputs, outputs, tools and acceptance checks below. The branches describe connected responsibilities, not a strict execution sequence.'}</p>
      </div>
      <div className="finance-map" role="group" aria-label={lang === 'zh' ? '可選取的財報分析項目心智圖' : 'Selectable financial report project mind map'}>
        <svg className="finance-map-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {[12.5, 37.5, 62.5, 87.5].map(y => <g key={y}><path d={`M 50 50 C 36 50 38 ${y} 25 ${y}`} /><path d={`M 50 50 C 64 50 62 ${y} 75 ${y}`} /></g>)}
        </svg>
        <div className="finance-map-root"><span aria-hidden="true">HK</span><strong>{lang === 'zh' ? '財報分析助手' : 'Financial Report Analyst'}</strong><p>{lang === 'zh' ? '來源可靠 · 計算可重現 · 解釋有證據' : 'Traceable sources. Reproducible calculations. Supported explanations.'}</p></div>
        {financeAreas.map((area, index) => <button key={area.id} type="button"
          className={`finance-map-branch ${selected.id === area.id ? 'is-selected' : ''}`}
          data-side={index < 4 ? 'left' : 'right'} data-row={index % 4 + 1}
          aria-pressed={selected.id === area.id} aria-controls="finance-area-detail"
          onClick={() => setSelected(area)}>
          <span className="finance-branch-number">{String(index + 1).padStart(2, '0')}</span><strong>{pick(area.title, lang)}</strong>
          <span className="finance-branch-functions">{financeFunctionWorkflows[area.id].map(item => <span key={item.title.en}>{pick(item.title, lang)}</span>)}</span>
        </button>)}
      </div>

      <div id="finance-area-detail" className="finance-area-detail" aria-live="polite" aria-atomic="true">
        <motion.article key={selected.id} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18 }}>
          <div className="finance-detail-heading"><span className="eyebrow">{lang === 'zh' ? '已選取分支' : 'SELECTED BRANCH'}</span><h3>{pick(selected.title, lang)}</h3><p>{pick(selected.purpose, lang)}</p></div>
          <div className="finance-detail-grid">
            <section><h4>{lang === 'zh' ? '輸入' : 'Input'}</h4><p>{pick(selected.input, lang)}</p><h4>{lang === 'zh' ? '輸出' : 'Output'}</h4><p>{pick(selected.output, lang)}</p></section>
            <section><h4>{lang === 'zh' ? '功能清單' : 'Functions'}</h4><ul>{selectedFunctions.map(item => <li key={item.title.en}>{pick(item.title, lang)}</li>)}</ul><h4>{lang === 'zh' ? '使用技術' : 'Technology'}</h4><p className="finance-tools">{selected.technology}</p></section>
            <section className="finance-detail-checks"><h4>{lang === 'zh' ? '怎樣證明它正確' : 'How to prove it works'}</h4><ul>{selected.checks.map(check => <li key={check.en}>{pick(check, lang)}</li>)}</ul></section>
          </div>
          <p className="finance-later"><b>{lang === 'zh' ? '之後擴展：' : 'Later extension: '}</b>{pick(selected.later, lang)}</p>
          <Link className="finance-lesson-link" href={`/learn/${selected.lesson.slug}`}>{lang === 'zh' ? '連回課程：' : 'Connect to the course: '}{pick(selected.lesson.title, lang)} →</Link>
          <a className="finance-lesson-link finance-function-jump" href="#finance-functions">{lang === 'zh' ? '查看這三項功能的完整流程' : 'See the complete workflows for these three functions'} ↓</a>
        </motion.article>
      </div>
    </section>

    <section className="finance-section" id="finance-functions" aria-labelledby="finance-functions-title">
      <div className="finance-section-heading"><p className="eyebrow">02 · EVERY FUNCTION, STEP BY STEP</p><h2 id="finance-functions-title">{lang === 'zh' ? '24 項功能，各有清楚流程' : 'A clear workflow for every function'}</h2><p>{lang === 'zh' ? '選擇範疇並展開功能，查看步驟、技術及 API 請求／回應範例。23 項功能有建議 API；部署則有 CI 工作流程。所有合約均為未來實作設計，不會即時發出請求。插圖上的英文關鍵詞可對應下方技術。' : 'Choose an area and expand a function to see its steps, tools and request/response examples. There are proposed APIs for 23 functions and a CI workflow for deployment. All contracts describe a future implementation; no requests are sent. English keywords on each illustration connect the picture to the technology below.'}</p></div>
      <div className="finance-api-reading-guide"><b>{lang === 'zh' ? '怎樣閱讀 API 流程' : 'HOW TO READ AN API WORKFLOW'}</b><p><span>Client</span> → <span>Request</span> → <span>Auth + Validation</span> → <span>Service / Worker</span> → <span>Database</span> → <span>Response</span></p><small>{lang === 'zh' ? 'GET 讀取 · POST 建立或執行動作 · PATCH 修改 · 200 成功 · 201 已建立 · 202 已接納但未完成。範例 ID、公司、網址及結果均為虛構。' : 'GET reads · POST creates or performs an action · PATCH edits · 200 success · 201 created · 202 accepted, still unfinished. Example IDs, companies, URLs and results are fictional.'}</small></div>
      <div className="finance-function-areas" role="group" aria-label={lang === 'zh' ? '選擇功能流程範疇' : 'Choose a function workflow area'}>{financeAreas.map(area => <button key={area.id} type="button" aria-pressed={selected.id === area.id} aria-controls="finance-function-list" onClick={() => setSelected(area)}>{pick(area.title, lang)}</button>)}</div>
      <div id="finance-function-list" className="finance-function-list" key={selected.id}>
        <h3>{pick(selected.title, lang)} <span>· {lang === 'zh' ? '3 項功能' : '3 functions'}</span></h3>
        <IllustratedConcept illustration={financeAreaIllustrations[selected.id]} lang={lang}/>
        {selectedFunctions.map((item, index) => <details className="finance-function" key={item.title.en} open={index === 0}>
          <summary><span>{String(index + 1).padStart(2, '0')}</span><h4>{pick(item.title, lang)}</h4><i aria-hidden="true">+</i></summary>
          <div className="finance-function-body"><ol className="finance-function-flow" aria-label={`${pick(item.title, lang)} · ${lang === 'zh' ? '步驟及技術' : 'steps and tools'}`}>{item.steps.map((functionStep, stepIndex) => <li key={stepIndex}><span className="finance-function-step-number">{stepIndex + 1}</span><p>{pick(functionStep.action, lang)}</p><div><b>{lang === 'zh' ? '技術' : 'Tools'}</b><span>{functionStep.tools}</span></div></li>)}</ol>
            <dl className="finance-function-outcomes"><div><dt>{lang === 'zh' ? '預期結果' : 'Expected result'}</dt><dd>{pick(item.result, lang)}</dd></div><div><dt>{lang === 'zh' ? '失敗時怎樣處理' : 'Failure handling'}</dt><dd>{pick(item.failure, lang)}</dd></div></dl>
            <FinanceApiContent workflow={financeApiWorkflows[selected.id][index]} lang={lang}/>
          </div>
        </details>)}
      </div>
    </section>

    <section className="finance-section" id="finance-workflow" aria-labelledby="finance-workflow-title">
      <div className="finance-section-heading"><p className="eyebrow">03 · FOLLOW ONE QUESTION</p><h2 id="finance-workflow-title">{lang === 'zh' ? '從問題到有證據的答案' : 'From a question to a supported answer'}</h2><p>{lang === 'zh' ? '逐步查看 LangGraph 應協調的工作。切換「缺少原因證據」，觀察數值正確但無法解釋原因時應如何處理。所有內容均為離線教學範例。' : 'Step through the work LangGraph would coordinate. Switch to missing causal evidence to see how the answer changes even when the numbers are correct. All outputs are offline teaching examples.'}</p></div>
      <fieldset className="finance-scenario"><legend>{lang === 'zh' ? '選擇教學情境' : 'Choose the teaching scenario'}</legend>
        <label><input type="radio" name="finance-scenario" checked={scenario === 'supported'} onChange={() => setScenario('supported')} />{lang === 'zh' ? '有數字及原因證據' : 'Figures and explanation available'}</label>
        <label><input type="radio" name="finance-scenario" checked={scenario === 'missing'} onChange={() => setScenario('missing')} />{lang === 'zh' ? '缺少原因證據' : 'Missing causal evidence'}</label>
      </fieldset>
      <ol className="finance-workflow-steps" aria-label={lang === 'zh' ? '分析步驟' : 'Analysis steps'}>{financeWorkflow.map((item, index) => <li key={item.title.en}><button type="button" aria-current={index === step ? 'step' : undefined} onClick={() => setStep(index)}><span>{index + 1}</span>{pick(item.title, lang)}</button></li>)}</ol>
      <div className="finance-walkthrough" aria-live="polite" aria-atomic="true">
        <p className="eyebrow">{step + 1} / {financeWorkflow.length} · {lang === 'zh' ? '虛構 DemoCo 範例' : 'FICTIONAL DEMOCO EXAMPLE'}</p>
        <h3>{pick(currentStep.title, lang)}</h3><p>{pick(currentStep.action, lang)}</p>
        <div className={`finance-step-output ${scenario === 'missing' ? 'needs-evidence' : ''}`}><b>{lang === 'zh' ? '這一步的結果' : 'Result of this step'}</b><p>{pick(scenario === 'supported' ? currentStep.evidence : currentStep.missing, lang)}</p></div>
      </div>
      <div className="finance-step-controls"><button type="button" disabled={step === 0} onClick={() => setStep(value => Math.max(0, value - 1))}>← {lang === 'zh' ? '上一步' : 'Previous'}</button><button type="button" disabled={step === financeWorkflow.length - 1} onClick={() => setStep(value => Math.min(financeWorkflow.length - 1, value + 1))}>{lang === 'zh' ? '下一步' : 'Next'} →</button></div>
    </section>

    <section className="finance-section" id="finance-stack" aria-labelledby="finance-stack-title"><div className="finance-section-heading"><p className="eyebrow">04 · TECHNOLOGY OWNERSHIP</p><h2 id="finance-stack-title">{lang === 'zh' ? '每項技術有一個清楚責任' : 'Give each technology a clear responsibility'}</h2><p>{lang === 'zh' ? 'LangGraph 管分析狀態，n8n 管外圍觸發與通知。這個項目以 Python 為主要分析服務；Java、C# 及 UiPath 可按真實整合需要再加入。' : 'LangGraph owns analysis state; n8n owns surrounding triggers and notifications. Use Python for the core analysis service. Add Java, C# or UiPath only when an actual integration calls for them.'}</p></div>
      <div className="finance-stack-table"><table><caption className="finance-sr-only">{lang === 'zh' ? '建議技術、責任及資料流' : 'Suggested technology, responsibility and data flow'}</caption><thead><tr><th scope="col">{lang === 'zh' ? '層面' : 'Layer'}</th><th scope="col">{lang === 'zh' ? '技術' : 'Tools'}</th><th scope="col">{lang === 'zh' ? '負責甚麼及怎樣串連' : 'Responsibility and handoffs'}</th></tr></thead><tbody>{financeStack.map(row => <tr key={row.layer.en}><th scope="row">{pick(row.layer, lang)}</th><td>{row.tools}</td><td><p>{pick(row.role, lang)}</p><p className="finance-stack-flow"><b>{lang === 'zh' ? '資料流' : 'Data flow'}</b>{pick(row.workflow, lang)}</p></td></tr>)}</tbody></table></div>
    </section>

    <section className="finance-section" id="finance-stages" aria-labelledby="finance-stages-title"><div className="finance-section-heading"><p className="eyebrow">05 · BUILD IN CHECKABLE STAGES</p><h2 id="finance-stages-title">{lang === 'zh' ? '先完成小而可靠的版本' : 'Start with a small, reliable version'}</h2><p>{lang === 'zh' ? '首版重點是來源、數字、引用及比較；完成核心後再擴展排程、OCR 及多人功能。' : 'The first version focuses on sources, figures, citations and comparisons. Add schedules, OCR and shared access after that core works.'}</p></div>
      <ol className="finance-build-stages">{financeBuildStages.map(stage => <li key={stage.title.en}><h3>{pick(stage.title, lang)}</h3><p>{pick(stage.scope, lang)}</p><p><b>{lang === 'zh' ? '完成條件：' : 'Done when: '}</b>{pick(stage.done, lang)}</p></li>)}</ol>
      <p className="finance-portfolio"><b>{lang === 'zh' ? '最後展示：' : 'Final demonstration: '}</b>{lang === 'zh' ? '由一個真實使用者問題開始，展示來源、計算及答案；再示範一個因證據不足而只提供部分答案的案例。附上 repo、重跑指令、評估結果及你實際負責的工作。' : 'Start with a user question, show the source, calculation and answer, then demonstrate a partial answer caused by missing evidence. Include the repository, rerun commands, evaluation results and your own contribution.'}</p>
    </section>
  </main>;
}
