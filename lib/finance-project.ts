import type { Copy } from './curriculum';

type ProjectArea = {
  id: string;
  title: Copy;
  purpose: Copy;
  functions: Copy[];
  input: Copy;
  output: Copy;
  technology: string;
  checks: Copy[];
  later: Copy;
  lesson: { slug: string; title: Copy };
};

export const financeAreas: ProjectArea[] = [
  {
    id: 'library', title: { en: 'Report library', zh: '財報資料庫' },
    purpose: { en: 'Know exactly which company, period and document each answer describes.', zh: '清楚知道每個答案屬於哪間公司、哪個期間及哪份文件。' },
    functions: [
      { en: 'Upload annual-report PDFs', zh: '上載年度財報 PDF' },
      { en: 'Label company, period and source', zh: '標示公司、期間及來源' },
      { en: 'Keep originals and revisions', zh: '保留原檔與修訂版本' },
    ],
    input: { en: 'Public annual reports; company identity, fiscal period, source URL and upload date.', zh: '公開年報；公司身分、財政期間、來源網址及上載日期。' },
    output: { en: 'A versioned document record and the original PDF. A duplicate upload reuses the same document identity.', zh: '有版本的文件記錄及原始 PDF。重複上載沿用同一文件身分。' },
    technology: 'Next.js · FastAPI · PostgreSQL · S3-compatible file storage',
    checks: [
      { en: 'Reject unsupported files and show failed uploads without losing existing reports.', zh: '拒絕不支援的檔案；顯示上載失敗，同時保留原有財報。' },
      { en: 'Separate a revised report from the older version; never silently replace its citations.', zh: '修訂年報與舊版分開；不可暗中替換舊答案的引用。' },
    ],
    later: { en: 'Interim reports, watchlists and approved-source discovery.', zh: '中期報告、自選公司名單及指定來源搜尋。' },
    lesson: { slug: 'ai-python-foundations', title: { en: 'Python and API foundations', zh: 'Python 與 API 基礎' } },
  },
  {
    id: 'extraction', title: { en: 'Read text and tables', zh: '讀取文字與表格' },
    purpose: { en: 'Turn PDF pages into traceable evidence, while keeping uncertain extraction visible.', zh: '把 PDF 頁面轉為可追溯的證據，並清楚顯示不確定的擷取結果。' },
    functions: [
      { en: 'Extract text and financial tables', zh: '擷取文字及財務表格' },
      { en: 'Retain page and table references', zh: '保留頁碼及表格位置' },
      { en: 'Review uncertain values', zh: '覆核不確定數值' },
    ],
    input: { en: 'A text-based PDF from the library, including table headings, notes and printed page labels.', zh: '資料庫內可選取文字的 PDF，包括表頭、附註及印刷頁碼。' },
    output: { en: 'Text passages and candidate financial facts linked to the PDF page index and printed page label.', zh: '文字段落及候選財務數據，連結 PDF 頁面索引及印刷頁碼。' },
    technology: 'PyMuPDF · pdfplumber · Pydantic',
    checks: [
      { en: 'Keep parentheses, negative signs, units and column-year headings when reading tables.', zh: '讀表格時保留括號、負號、單位及各欄年份。' },
      { en: 'Mark ambiguous rows for review. A scanned page requests OCR rather than returning an empty success.', zh: '含糊列標記待覆核；掃描頁應要求 OCR，不可把空白結果當成功。' },
    ],
    later: { en: 'OCR for scanned reports and region highlighting in the PDF viewer.', zh: '掃描年報 OCR，以及 PDF 原文區域標示。' },
    lesson: { slug: 'rag-graphrag', title: { en: 'Retrieval and provenance', zh: '檢索與來源追蹤' } },
  },
  {
    id: 'facts', title: { en: 'Verified financial facts', zh: '已覆核財務數據' },
    purpose: { en: 'Store numbers as financial facts with context, rather than isolated values inside a prompt.', zh: '把數字連同財務背景儲存，而非只放進 prompt。' },
    functions: [
      { en: 'Start with five financial metrics', zh: '先處理五項財務指標' },
      { en: 'Track currency, scale and period', zh: '記錄貨幣、單位及期間' },
      { en: 'Record corrections and restatements', zh: '記錄更正及重列數字' },
    ],
    input: { en: 'Candidate revenue, net profit, operating cash flow, total assets and total liabilities values.', zh: '候選營業收入、淨利潤、經營現金流、總資產及總負債數值。' },
    output: { en: 'A fact with company, metric definition, period, currency, scale, consolidated basis, source, version and review status.', zh: '每項數據包含公司、指標定義、期間、貨幣、單位、綜合報表口徑、來源、版本及覆核狀態。' },
    technology: 'PostgreSQL · Python Decimal · Pydantic',
    checks: [
      { en: 'A missing value stays missing; it must never become zero.', zh: '缺失值必須保持缺失，不可變成零。' },
      { en: 'Preserve original and restated values with their report versions and show which one is used.', zh: '按報告版本保留原報及重列數字，並顯示實際採用哪個。' },
    ],
    later: { en: 'Sector-specific metric definitions and an analyst correction history.', zh: '行業專屬指標定義及分析員更正歷史。' },
    lesson: { slug: 'fine-tuning-data', title: { en: 'Data quality and lineage', zh: '資料品質與血緣' } },
  },
  {
    id: 'research', title: { en: 'Ask with evidence', zh: '有證據的問答' },
    purpose: { en: 'Answer a specific financial question using the selected reports and identifiable evidence.', zh: '根據選定財報及可識別證據回答具體財務問題。' },
    functions: [
      { en: 'Ask in English or Traditional Chinese', zh: '英文或繁體中文提問' },
      { en: 'Retrieve relevant report passages', zh: '檢索相關財報段落' },
      { en: 'Cite evidence or say what is missing', zh: '引用證據或說明缺失' },
    ],
    input: { en: 'A question, selected companies and periods, reviewed facts and version-filtered passages.', zh: '問題、選定公司及期間、已覆核數據，以及按版本篩選的段落。' },
    output: { en: 'An answer with claim-level citations, calculated figures and a clear distinction between reported reasons and interpretation.', zh: '答案包含逐項主張引用及計算數字，並區分報告所述原因與推論。' },
    technology: 'FastAPI · LangGraph · LLM API · embeddings · PostgreSQL/pgvector',
    checks: [
      { en: 'A citation must support its claim, not simply point to a page containing the same keyword.', zh: '引用必須支持相關主張，不能只是指向包含相同關鍵字的頁面。' },
      { en: 'A numerical change can be calculated without evidence of its cause; do not invent a reason.', zh: '可以計算數值變化，但若缺乏原因證據，不可自行編造解釋。' },
    ],
    later: { en: 'Follow-up questions and retrieval comparisons. Add GraphRAG only if relationship questions justify it.', zh: '追問及檢索方案比較；只有關係型問題確實需要時才加入 GraphRAG。' },
    lesson: { slug: 'langgraph-observability-evals', title: { en: 'LangGraph and evaluation', zh: 'LangGraph 與評估' } },
  },
  {
    id: 'comparison', title: { en: 'Calculate and compare', zh: '計算與比較' },
    purpose: { en: 'Make comparisons reproducible and reject comparisons that mix incompatible financial facts.', zh: '令比較可重現，並拒絕混合不相容財務數據。' },
    functions: [
      { en: 'Calculate year-on-year change', zh: '計算按年變化' },
      { en: 'Compare companies side by side', zh: '並排比較公司' },
      { en: 'Check periods and definitions', zh: '檢查期間及定義' },
    ],
    input: { en: 'Reviewed facts with matching metric definitions, annual periods, currency, scale and reporting basis.', zh: '已覆核數據，且指標定義、年度期間、貨幣、單位及報表口徑相容。' },
    output: { en: 'A comparison table or chart with the formula, inputs, source references and any blocked calculation.', zh: '比較表或圖，顯示公式、輸入、來源及被阻止的計算。' },
    technology: 'Python Decimal · pandas · Plotly.js',
    checks: [
      { en: 'Do not calculate percentage growth from a zero denominator; explain negative-base limitations.', zh: '分母為零時不可計算增長率；負基數時說明解讀限制。' },
      { en: 'Do not silently mix annual/interim periods, HKD/RMB, thousands/millions or different profit definitions.', zh: '不可暗中混合全年／中期、港元／人民幣、千／百萬或不同盈利定義。' },
    ],
    later: { en: 'Explicit, sourced FX conversion and additional sector-appropriate ratios.', zh: '明確且附來源的匯率換算，以及合適的行業比率。' },
    lesson: { slug: 'ai-python-foundations', title: { en: 'Typed calculation tools', zh: '有型別的計算工具' } },
  },
  {
    id: 'workspace', title: { en: 'Research workspace', zh: '研究工作區' },
    purpose: { en: 'Let an analyst move easily between an explanation, the numbers and the original evidence.', zh: '讓分析員輕鬆切換解釋、數字及原始證據。' },
    functions: [
      { en: 'Dashboard and trend charts', zh: '儀表板與趨勢圖' },
      { en: 'Open the cited PDF page', zh: '開啟引用的 PDF 頁面' },
      { en: 'Save an editable research brief', zh: '儲存可編輯研究摘要' },
    ],
    input: { en: 'Reviewed facts, chart series, answers and their document/page references.', zh: '已覆核數據、圖表數列、答案及文件／頁面引用。' },
    output: { en: 'A workspace with selected company/period, evidence links and a draft brief containing facts, commentary and limitations.', zh: '工作區顯示選定公司／期間、證據連結，以及包含事實、評論及限制的摘要草稿。' },
    technology: 'Next.js · React · TypeScript · Plotly.js · browser PDF viewer',
    checks: [
      { en: 'Clicking a citation opens the correct PDF version and page, including when printed numbering differs.', zh: '點擊引用時開啟正確 PDF 版本及頁面，包括印刷頁碼不同的情況。' },
      { en: 'Show missing data visibly; do not draw a zero bar or join a trend across an unknown value.', zh: '清楚顯示缺失資料；不可畫成零值柱或跨缺失值連接趨勢。' },
    ],
    later: { en: 'Downloadable briefs, analyst notes and saved comparison views.', zh: '可下載摘要、分析員筆記及已儲存比較畫面。' },
    lesson: { slug: 'portfolio-evidence-integrity', title: { en: 'Portfolio evidence', zh: '作品集證據' } },
  },
  {
    id: 'automation', title: { en: 'Workflow and automation', zh: '流程與自動化' },
    purpose: { en: 'Keep analysis state separate from the triggers that bring reports into the system.', zh: '把分析狀態與報告匯入觸發器分開。' },
    functions: [
      { en: 'LangGraph analysis checkpoints', zh: 'LangGraph 分析檢查點' },
      { en: 'n8n ingestion triggers', zh: 'n8n 匯入觸發器' },
      { en: 'Retry jobs without duplicates', zh: '重試工作而不重複匯入' },
    ],
    input: { en: 'A manual upload in the first version; later, an approved report-source event.', zh: '首版由手動上載觸發；之後才加入指定財報來源事件。' },
    output: { en: 'A resumable analysis run with status and errors; later, an optional report-ready notification.', zh: '可恢復的分析執行記錄，包含狀態及錯誤；之後可選擇發送報告完成通知。' },
    technology: 'LangGraph · PostgreSQL checkpoints · n8n webhooks/schedules · background worker',
    checks: [
      { en: 'After a timeout, retry the same ingestion job without creating duplicate documents or notifications.', zh: '逾時後重試同一匯入工作，不可重複建立文件或通知。' },
      { en: 'Keep API keys on the server. The office guide works without n8n, live models or external services.', zh: 'API key 只放在伺服器。辦公室指南不依賴 n8n、即時模型或外部服務。' },
    ],
    later: { en: 'Scheduled watchlist checks and opt-in notifications from approved sources.', zh: '定時檢查自選公司，以及由指定來源觸發的自選通知。' },
    lesson: { slug: 'agents-mcp-a2a', title: { en: 'Bounded agent workflows', zh: '受控 Agent 流程' } },
  },
  {
    id: 'quality', title: { en: 'Evaluation and delivery', zh: '評估與交付' },
    purpose: { en: 'Prove that the project handles real financial-document failure modes and can be rerun by a reviewer.', zh: '證明項目能處理財報失敗情況，並可由審閱者重新執行。' },
    functions: [
      { en: 'Manually checked evaluation cases', zh: '人工核對評估案例' },
      { en: 'Trace failures and model cost', zh: '追蹤失敗及模型成本' },
      { en: 'Reproducible deployment and demo', zh: '可重現部署與展示' },
    ],
    input: { en: 'Versioned reports, labelled questions, expected facts/citations, configuration and raw run results.', zh: '有版本財報、標記問題、預期數據／引用、設定及原始執行結果。' },
    output: { en: 'Per-case extraction/retrieval/answer results, traces, tests, a runnable README and a short demo.', zh: '逐案例擷取／檢索／答案結果、追蹤、測試、可執行 README 及短片展示。' },
    technology: 'pytest · Langfuse · Docker · GitHub Actions · AWS',
    checks: [
      { en: 'Test absent evidence, wrong year, restatements, unit mismatches, prompt injection and provider timeouts.', zh: '測試缺證據、錯年份、重列、單位不符、prompt injection 及供應商逾時。' },
      { en: 'Report measured quality, sample size and cost honestly; separate offline fixtures from live model results.', zh: '誠實報告實測品質、樣本數及成本；分開離線範例與即時模型結果。' },
    ],
    later: { en: 'Authentication before a shared deployment, per-user report access and deletion propagation.', zh: '多人部署前加入登入、逐用戶報告權限及刪除傳播。' },
    lesson: { slug: 'evaluation-safety-governance', title: { en: 'Evaluation and governance', zh: '評估與治理' } },
  },
];

export const financeWorkflow: { title: Copy; action: Copy; evidence: Copy; missing: Copy }[] = [
  { title: { en: 'Scope', zh: '確定範圍' }, action: { en: 'Choose the company, two annual periods and the exact cash-flow metric.', zh: '選定公司、兩個年度期間及確切現金流指標。' }, evidence: { en: 'Fictional DemoCo · FY2024 → FY2025 · consolidated operating cash flow.', zh: '虛構 DemoCo · FY2024 → FY2025 · 綜合經營現金流。' }, missing: { en: 'The company and periods are known; the explanation still needs evidence.', zh: '已知公司及期間；原因解釋仍需要證據。' } },
  { title: { en: 'Retrieve', zh: '檢索證據' }, action: { en: 'Retrieve the cash-flow table and any management explanation, filtered by document version.', zh: '按文件版本檢索現金流表，以及管理層的相關解釋。' }, evidence: { en: 'Sample table: PDF page 42. Sample commentary: PDF page 18.', zh: '範例表格：PDF 第 42 頁。範例評論：PDF 第 18 頁。' }, missing: { en: 'Sample table found on page 42. No passage explaining the cause was found.', zh: '找到第 42 頁範例表格，但找不到解釋原因的段落。' } },
  { title: { en: 'Validate', zh: '驗證數據' }, action: { en: 'Check the metric, annual period, reporting basis, currency, scale and review status.', zh: '檢查指標、年度期間、報表口徑、貨幣、單位及覆核狀態。' }, evidence: { en: 'Both reviewed inputs use HKD millions and the same metric definition: 100 → 80.', zh: '兩個已覆核輸入均為百萬港元，指標定義相同：100 → 80。' }, missing: { en: 'The two numerical inputs are supported. A supported causal explanation is still missing.', zh: '兩個數字輸入有支持證據，但仍缺乏有根據的原因解釋。' } },
  { title: { en: 'Calculate', zh: '程式計算' }, action: { en: 'A deterministic calculation tool computes the change and retains the input citations.', zh: '由確定性計算工具計算變化，並保留輸入引用。' }, evidence: { en: '(80 − 100) ÷ 100 × 100 = −20%. The change is −HKD 20 million.', zh: '(80 − 100) ÷ 100 × 100 = −20%。變化為負 2,000 萬港元。' }, missing: { en: 'The same −20% change is calculable; a correct number does not establish why it changed.', zh: '仍可計算出 −20% 變化；數字正確不代表已知道變化原因。' } },
  { title: { en: 'Draft', zh: '草擬答案' }, action: { en: 'Draft a concise explanation and attach citations to each factual claim.', zh: '草擬簡潔解釋，並為每項事實主張附上引用。' }, evidence: { en: 'Draft: cash flow fell 20% [42]. In this fictional passage, management attributes the decline to higher working capital [18].', zh: '草稿：現金流下跌 20% [42]。在虛構段落中，管理層把跌幅歸因於營運資金增加 [18]。' }, missing: { en: 'Draft only the supported numerical change. State that the retrieved material does not establish a cause.', zh: '只草擬有證據的數值變化，並說明檢索資料未能確立原因。' } },
  { title: { en: 'Verify', zh: '核對引用' }, action: { en: 'Check that the cited page, document version, figures and wording actually support each claim.', zh: '檢查引用頁面、文件版本、數字及措辭是否確實支持每項主張。' }, evidence: { en: 'Keep the calculated fact separate from the attributed management explanation; neither proves causation independently.', zh: '分開計算事實與管理層所述解釋；兩者均不構成獨立因果證明。' }, missing: { en: 'Reject an invented working-capital explanation. A page containing a related keyword is insufficient.', zh: '拒絕編造營運資金解釋；頁面包含相關關鍵字並不足夠。' } },
  { title: { en: 'Present', zh: '展示結果' }, action: { en: 'Show the answer, formula, input facts and clickable PDF evidence in the workspace.', zh: '在工作區顯示答案、公式、輸入數據及可點擊 PDF 證據。' }, evidence: { en: 'Supported answer: −20%, with table [42] and an explicitly attributed explanation [18].', zh: '有證據答案：−20%，附表格 [42] 及明確歸屬管理層的解釋 [18]。' }, missing: { en: 'Partial answer: −20% [42]. The cause could not be established from the retrieved report material.', zh: '部分答案：−20% [42]。未能從檢索到的報告資料確立原因。' } },
];

export const financeBuildStages: { title: Copy; scope: Copy; done: Copy }[] = [
  { title: { en: '1 · Trust the source', zh: '1 · 先確保來源可靠' }, scope: { en: 'Three same-sector companies, two annual periods each, text-based PDFs and five metrics. Manual upload and review first.', zh: '三間同行業公司，每間兩個年度期間；可選取文字 PDF 及五項指標。先手動上載與覆核。' }, done: { en: 'Every accepted fact opens the correct source page. Corrections and missing values remain visible.', zh: '每項接納數據可開啟正確來源頁；更正及缺失值清楚可見。' } },
  { title: { en: '2 · Answer and compare', zh: '2 · 問答與比較' }, scope: { en: 'Bilingual cited questions, deterministic calculations, company comparisons and a basic dashboard.', zh: '雙語附引用問答、確定性計算、公司比較及基本儀表板。' }, done: { en: 'A frozen set checks wrong-year retrieval, unsupported explanations, zero denominators and unit mismatches.', zh: '固定案例檢查錯年檢索、無證據解釋、零分母及單位不符。' } },
  { title: { en: '3 · Make the demo reviewable', zh: '3 · 令展示可審閱' }, scope: { en: 'LangGraph verification flow, traces, evaluation results, Docker setup and an editable brief.', zh: 'LangGraph 核對流程、追蹤、評估結果、Docker 設定及可編輯摘要。' }, done: { en: 'A reviewer runs the project from a clean checkout, reproduces a failure and checks the cited answer.', zh: '審閱者從乾淨 checkout 啟動項目、重現一次失敗，並核對附引用答案。' } },
  { title: { en: '4 · Extend after the core works', zh: '4 · 核心完成後再擴展' }, scope: { en: 'n8n schedules, watchlists, OCR, brief downloads and shared-user access when needed.', zh: '按需要加入 n8n 排程、自選公司、OCR、摘要下載及多人存取。' }, done: { en: 'Retries do not duplicate reports or notifications. Shared access has authentication and per-user authorization.', zh: '重試不會重複報告或通知；多人存取有身分驗證及逐用戶授權。' } },
];

export const financeStack: { layer: Copy; tools: string; role: Copy }[] = [
  { layer: { en: 'Interface', zh: '介面' }, tools: 'Next.js · React · TypeScript · Plotly.js', role: { en: 'Library, dashboard, comparison charts, chat and evidence viewer.', zh: '資料庫、儀表板、比較圖、問答及證據檢視器。' } },
  { layer: { en: 'API and extraction', zh: 'API 與擷取' }, tools: 'Python · FastAPI · Pydantic · PyMuPDF · pdfplumber', role: { en: 'Validate requests, read reports and produce structured candidate facts.', zh: '驗證請求、讀取財報及產生結構化候選數據。' } },
  { layer: { en: 'Data and retrieval', zh: '資料與檢索' }, tools: 'PostgreSQL · pgvector · S3-compatible storage', role: { en: 'Facts and metadata in SQL; embeddings for passages; originals in file storage.', zh: 'SQL 儲存數據及中繼資料；embedding 搜尋段落；檔案儲存保留原檔。' } },
  { layer: { en: 'Analysis', zh: '分析' }, tools: 'LangGraph · LLM API · embedding model · Python Decimal', role: { en: 'Scope, retrieve, validate, calculate, draft, verify and present. Model choice stays configurable.', zh: '確定範圍、檢索、驗證、計算、草擬、核對及展示；模型可設定。' } },
  { layer: { en: 'Automation later', zh: '後續自動化' }, tools: 'n8n · background worker · PostgreSQL checkpoints', role: { en: 'Trigger approved-source ingestion and notifications; LangGraph owns analysis state.', zh: '觸發指定來源匯入及通知；分析狀態由 LangGraph 負責。' } },
  { layer: { en: 'Quality and delivery', zh: '品質與交付' }, tools: 'pytest · Langfuse · Docker · GitHub Actions · AWS', role: { en: 'Evaluate, trace, package and deploy the future application.', zh: '評估、追蹤、封裝及部署未來應用程式。' } },
];
