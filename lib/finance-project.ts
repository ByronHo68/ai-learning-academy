import type { Copy } from './curriculum';

const t = (en: string, zh: string): Copy => ({ en, zh });
export type FinanceCompanyId = 'MSFT' | 'AAPL' | 'NVDA';
export const financeCompanies: Array<{ id: FinanceCompanyId; name: string }> = [
  { id: 'MSFT', name: 'Microsoft' }, { id: 'AAPL', name: 'Apple' }, { id: 'NVDA', name: 'NVIDIA' },
];
type FinanceEntry =
  | { kind: 'http'; method: 'GET' | 'POST'; path: string; example: string }
  | { kind: 'internal'; caller: string; contract: string }
  | { kind: 'developer'; command: string };
export type FinanceFlowStep = {
  id: string; keyword: string; action: Copy; tools: string; how: Copy; why: Copy; proposedFiles: string[];
};
export type FinanceFunctionGuide = {
  id: string; title: Copy; purpose: Copy; input: Copy; output: Copy; entry: FinanceEntry;
  steps: [FinanceFlowStep, ...FinanceFlowStep[]];
  branches: Array<{ kind: 'success' | 'insufficient' | 'failure'; condition: Copy; result: Copy; next: Copy }>;
  acceptance: Copy[];
};
function returns(results: { success: Copy; insufficient: Copy; failure: Copy }): FinanceFunctionGuide['branches'] {
  return [
    { kind: 'success', condition: t('Required checks pass', '所需檢查通過'), result: results.success, next: t('Return the validated output to the caller.', '向呼叫者回傳已驗證結果。') },
    { kind: 'insufficient', condition: t('Valid request, incomplete evidence', '請求有效，但證據未齊'), result: results.insufficient, next: t('Explain the limitation and the next permitted step.', '交代限制及下一個允許步驟。') },
    { kind: 'failure', condition: t('Invalid input or an operational error', '輸入無效或程序出錯'), result: results.failure, next: t('Return an explicit error. Keep the last valid state.', '回傳明確錯誤，保留最後有效狀態。') },
  ];
}

export const financeFunctions: FinanceFunctionGuide[] = [
  {
    id: 'company', title: t('Choose a supported company', '選擇支援公司'),
    purpose: t('Resolve the company before any research begins.', '研究前先確定公司，避免搵錯標的。'),
    input: t('A selection of MSFT, AAPL or NVDA. Research horizon: 1–3 months.', '從 MSFT、AAPL、NVDA 選一間；研究範圍為未來 1–3 個月。'),
    output: t('A canonical company ID and the evidence snapshot coverage date.', '標準公司 ID 及證據快照覆蓋日期。'),
    entry: { kind: 'http', method: 'GET', path: '/api/companies', example: 'Next.js proxy → GET /companies → [{"id":"MSFT","name":"Microsoft"}, …]' },
    steps: [
      { id: 'select', keyword: 'SELECT', action: t('Show three supported identities in a selector.', '選單列出三個支援身份。'), tools: 'Next.js · TypeScript', how: t('Render options from one company catalog and submit its ID, not an arbitrary name.', '由同一公司清單產生選項，提交 ID 而非任意公司名。'), why: t('A fixed universe avoids ambiguous names and unsupported global coverage.', '固定範圍可避免同名公司及未支援的全球標的。'), proposedFiles: ['apps/web/app/page.tsx', 'services/research/app/companies.py'] },
      { id: 'parse', keyword: 'VALIDATE', action: t('Validate the selected company on the API boundary.', '在 API 邊界驗證所選公司。'), tools: 'FastAPI · Pydantic', how: t('Accept only the three catalog IDs and a supported horizon. Reject any other input before tool access.', '只接納清單內三個 ID 及支援的研究期間；工具執行前拒絕其他輸入。'), why: t('Browser controls do not prevent a caller from sending a forged request.', '瀏覽器選單無法阻止偽造請求，後端仍須驗證。'), proposedFiles: ['services/research/app/main.py', 'services/research/app/schemas.py'] },
      { id: 'confirm', keyword: 'CONFIRM', action: t('Display identity and coverage before starting.', '開始前顯示身份及資料覆蓋範圍。'), tools: 'Typed API response', how: t('Return company ID, display name and snapshot as-of date. Keep them with the run.', '回傳公司 ID、名稱及快照日期，並與研究任務一起保存。'), why: t('Users can see exactly which company and dated information are being analysed.', '使用者能確認研究哪間公司，以及資料截至何時。'), proposedFiles: ['apps/web/app/page.tsx', 'services/research/app/schemas.py'] },
    ],
    branches: returns({ success: t('200: supported identity and coverage shown.', '200：顯示支援公司及覆蓋日期。'), insufficient: t('Supported company has no snapshot: explain that research is unavailable.', '支援公司尚無快照：交代暫時無法研究。'), failure: t('422: unsupported ID or invalid horizon; do not start a run.', '422：公司 ID 或期間無效，不啟動研究。') }),
    acceptance: [t('A forged unsupported ticker is rejected by the backend, not merely hidden in the UI.', '偽造未支援 ticker 會由後端拒絕，不只在介面隱藏。')],
  },
  {
    id: 'sources', title: t('Prepare a dated evidence snapshot', '準備有日期的證據快照'),
    purpose: t('Start with a small reproducible corpus instead of building a global news crawler.', '先做可重跑的小型資料集，減少建立全球新聞爬蟲的工作。'),
    input: t('A developer-reviewed manifest of permitted company announcements or news excerpts.', '開發者核對過、允許使用的公司公告或新聞節錄清單。'),
    output: t('Stored evidence with source ID, company, URL, publication time and excerpt.', '已儲存的來源 ID、公司、網址、發布時間及原文節錄。'),
    entry: { kind: 'developer', command: 'python -m app.ingest --manifest ../../data/manifest.json' },
    steps: [
      { id: 'review', keyword: 'REVIEW', action: t('Choose a small set of sources for each supported company.', '為每間支援公司選取少量來源。'), tools: 'Curated manifest · source review', how: t('Record the original URL, publication time, company and permitted reuse. Keep excerpts within the allowed scope.', '記錄原網址、發布時間、公司及允許使用範圍；節錄遵守來源限制。'), why: t('A public page is not automatically a licence for full-text redistribution.', '公開網頁不等於可以任意轉載全文。'), proposedFiles: ['data/manifest.json', 'data/README.md'] },
      { id: 'ingest', keyword: 'NORMALISE', action: t('Validate and deduplicate source records.', '驗證並去除重複來源。'), tools: 'Python · Pydantic · content hash', how: t('Parse records at ingestion, reject missing dates or mismatched company IDs, and derive a stable source key.', '匯入時解析欄位，拒絕缺日期或公司不符的紀錄，並產生穩定來源鍵。'), why: t('Repeated ingestion should not duplicate articles or change existing evidence silently.', '重跑匯入不應產生重複文章或靜默改寫證據。'), proposedFiles: ['services/research/app/ingest.py', 'services/research/app/schemas.py'] },
      { id: 'store', keyword: 'STORE', action: t('Store approved excerpts and publish a coverage date.', '儲存核准節錄，公布覆蓋日期。'), tools: 'SQLite · FTS5', how: t('Upsert approved records and index searchable text. Save the snapshot version and ingestion outcome.', '以 upsert 儲存核准紀錄並建立文字索引，保存快照版本及匯入結果。'), why: t('A versioned local corpus makes the same interview case reproducible without live API access.', '版本化本機資料集，讓面試案例可在沒有即時 API 下重跑。'), proposedFiles: ['services/research/app/storage.py', 'data/manifest.json'] },
    ],
    branches: returns({ success: t('CLI exits 0 with imported, unchanged and rejected record counts.', 'CLI 以 0 結束，列出新增、未改動及拒絕紀錄數。'), insufficient: t('Quarantine incomplete records; expose the remaining coverage gap.', '隔離不完整紀錄，顯示資料覆蓋缺口。'), failure: t('Invalid manifest or storage failure: stop and keep the previous valid snapshot.', '清單無效或儲存失敗：停止並保留上一個有效快照。') }),
    acceptance: [t('Running the same manifest twice produces no duplicate sources.', '同一清單匯入兩次不會產生重複來源。')],
  },
  {
    id: 'retrieval', title: t('Retrieve and read the evidence', '檢索及閱讀證據'),
    purpose: t('Find relevant passages and retain their source identities for the report.', '找相關原文，並保留來源身份供報告引用。'),
    input: t('Validated company ID, research question and publication-date window.', '已驗證公司 ID、研究問題及發布日期範圍。'),
    output: t('Ranked source IDs and selected excerpts, or an explicit empty result.', '排序後來源 ID 及節錄，或明確空結果。'),
    entry: { kind: 'internal', caller: 'LangGraph tool node', contract: 'search_company_evidence(company_id, query, published_before) → source IDs\nread_source(source_id) → approved excerpt + metadata' },
    steps: [
      { id: 'filter', keyword: 'FILTER', action: t('Restrict evidence to the selected company and time window.', '先限制所選公司及日期範圍。'), tools: 'SQLite · SQL parameters', how: t('Apply company and date filters before ranking. Query only approved snapshot records.', '排序前先套用公司及日期條件，只查詢已核准快照紀錄。'), why: t('A relevant sentence about a different company or a later event is still wrong evidence.', '另一間公司或未來事件的相關句子，仍然係錯誤證據。'), proposedFiles: ['services/research/app/retrieval.py', 'services/research/app/storage.py'] },
      { id: 'search', keyword: 'SEARCH', action: t('Search passages with a simple text index.', '用簡單文字索引搜尋原文。'), tools: 'SQLite FTS5 · basic RAG', how: t('Rank matches for the question and return a small top-k with stable source IDs. Start without embeddings.', '按問題排序文字匹配，回傳少量 top-k 及穩定來源 ID；首版先不用 embeddings。'), why: t('A small curated corpus can demonstrate retrieval grounding before adding vector infrastructure.', '小型資料集已可展示檢索及證據支持，先減少向量基建工作。'), proposedFiles: ['services/research/app/retrieval.py'] },
      { id: 'read', keyword: 'READ SOURCE', action: t('Read a selected source through a restricted tool.', '透過受限制工具讀取指定來源。'), tools: 'read_source · typed tool output', how: t('Resolve an allowed source ID from the database. Return its excerpt, URL and publication date; do not fetch arbitrary URLs.', '從資料庫解析允許的來源 ID，回傳原文、網址及日期；不接受任意網址擷取。'), why: t('The model receives attributable evidence while the tool retains control over what can be read.', '模型取得可追溯證據，工具仍控制可讀資料範圍。'), proposedFiles: ['services/research/app/tools.py', 'services/research/app/schemas.py'] },
    ],
    branches: returns({ success: t('Return relevant excerpts with source IDs and dates to the graph.', '向 graph 回傳相關節錄、來源 ID 及日期。'), insufficient: t('Return an empty or limited result; let the graph refine once.', '回傳空或有限結果，由 graph 決定補查一次。'), failure: t('Reject an invalid source ID; return a typed tool error without exposing storage details.', '拒絕無效來源 ID，以結構化工具錯誤回覆，不公開儲存細節。') }),
    acceptance: [t('Wrong-company and future-dated records never enter the allowed evidence set.', '其他公司及未來日期的紀錄不會進入允許證據集。')],
  },
  {
    id: 'research', title: t('Run one bounded research agent', '運行一個有上限的研究 agent'),
    purpose: t('Let the agent select tools and fill an evidence gap within a controlled budget.', '讓 agent 選擇工具及補足證據，同時限制執行預算。'),
    input: t('Company ID, a news-research question and a snapshot date.', '公司 ID、新聞研究問題及快照日期。'),
    output: t('A validated research result or an explicit insufficient-evidence result.', '已驗證研究結果，或明確證據不足結果。'),
    entry: { kind: 'http', method: 'POST', path: '/api/research', example: '{"company_id":"MSFT","question":"Explain recent developments","horizon":"1-3m"}\nNext.js proxy → POST /research → run_id + result' },
    steps: [
      { id: 'plan', keyword: 'PLAN + TOOLS', action: t('Create typed run state and choose a permitted research tool.', '建立有型別的任務狀態，選擇允許的研究工具。'), tools: 'LangGraph · one tool-capable LLM', how: t('Track identity, query, source IDs, evidence and budgets. Expose only search_company_evidence and read_source.', '追蹤身份、查詢、來源、證據及預算，只提供兩個唯讀研究工具。'), why: t('A constrained tool boundary supports useful agent decisions without broad machine access.', '受限制工具邊界支援 agent 判斷，同時避免取得廣泛系統權限。'), proposedFiles: ['services/research/app/graph.py', 'services/research/app/tools.py'] },
      { id: 'gap', keyword: 'CHECK GAP', action: t('Assess whether the gathered evidence answers the question.', '判斷已取得證據是否足以回答。'), tools: 'Conditional edges · structured output', how: t('Use code checks for company, dates and source presence. Let the model describe any remaining information gap in a schema.', '以程式檢查公司、日期及來源；模型用固定格式描述尚欠資料。'), why: t('A fluent draft must not be treated as proof that the research is complete.', '文字流暢不代表研究已完成。'), proposedFiles: ['services/research/app/graph.py', 'services/research/app/schemas.py'] },
      { id: 'retry', keyword: 'REFINE ONCE', action: t('Refine once, or continue to reporting and validation.', '最多修正查詢一次，再進入報告及驗證。'), tools: 'Bounded loop · timeout · SQLite checkpoint', how: t('Allow two search rounds total. Persist progress and stop at the configured time, tool or model budget. Return no rating if evidence remains inadequate.', '總共最多兩輪搜尋；保存進度，到達時間、工具或模型上限就停止。仍不足則不評級。'), why: t('A bounded agent can recover and explain failure without looping or spending indefinitely.', '有上限的 agent 能恢復及解釋失敗，避免無限循環及用量。'), proposedFiles: ['services/research/app/graph.py', 'services/research/app/checkpoints.py'] },
    ],
    branches: returns({ success: t('200: return a validated report with run ID and source references.', '200：回傳已驗證報告、任務 ID 及來源引用。'), insufficient: t('200, status insufficient: return supported findings and no rating after the final search.', '200，狀態 insufficient：最後搜尋後只回傳有證據發現，不評級。'), failure: t('422 for bad input; 503 for unavailable dependencies. Preserve a resumable run when safe.', '輸入錯誤回 422；依賴不可用回 503。在安全情況保留可恢復任務。') }),
    acceptance: [t('The missing-evidence path performs at most one refinement and never invents the absent fact.', '資料不足路徑最多補查一次，不能捏造缺失事實。')],
  },
  {
    id: 'report', title: t('Explain news and the research stance', '解釋新聞及研究觀點'),
    purpose: t('Produce a readable Hold or Reduce view with evidence, risks and uncertainty.', '以易讀方式呈現持有或減持觀點、證據、風險及不確定因素。'),
    input: t('Approved evidence and the versioned research-rule result.', '核准證據及有版本的研究規則結果。'),
    output: t('Structured draft: stance, reasons, news impacts, citations and what to watch.', '結構化草稿：觀點、原因、新聞影響、引用及後續觀察。'),
    entry: { kind: 'internal', caller: 'LangGraph report node', contract: 'draft_report(evidence, rule_result) → ResearchReport draft' },
    steps: [
      { id: 'rules', keyword: 'APPLY RULES', action: t('Determine a transparent research stance in Python.', '由 Python 按透明規則產生研究觀點。'), tools: 'Pure Python · versioned rules', how: t('For the teaching rule, require demand, costs and outlook evidence. Maintained outlook gives Hold; lowered outlook gives Reduce; missing evidence gives no rating.', '教學規則要求需求、成本及展望證據。展望維持為 Hold，下調為 Reduce，缺證據則不評級。'), why: t('An explainable rule is auditable. It is a teaching rule, not a validated profitable strategy.', '可解釋規則方便核對；它是教學規則，並非已驗證盈利策略。'), proposedFiles: ['services/research/app/rules.py'] },
      { id: 'draft', keyword: 'EXPLAIN', action: t('Ask one LLM to explain the evidence and possible effects.', '由一個 LLM 解釋證據及可能影響。'), tools: 'One LLM · prompt template · Pydantic schema', how: t('Provide approved excerpts and the fixed rule result. Require source IDs, possible impact and uncertainty in each material explanation.', '提供核准原文及固定規則結果；每項重要解釋須有來源 ID、可能影響及不確定因素。'), why: t('News sentiment alone does not establish price direction or causation; expectations may already be priced in.', '新聞正負面不能單獨證明股價方向或因果，預期可能已反映在價格。'), proposedFiles: ['services/research/app/report.py', 'services/research/app/prompts.py', 'services/research/app/schemas.py'] },
      { id: 'present', keyword: 'PRESENT', action: t('Display the short research report after validation.', '驗證後顯示簡短研究報告。'), tools: 'Next.js · typed response', how: t('Show the dated stance, related news, reasons, risks and source controls on one page. Keep detailed traces expandable.', '同一頁展示有日期的觀點、新聞、原因、風險及來源；詳細執行記錄可展開。'), why: t('A reader can understand the conclusion first and inspect its evidence without reading a technical dashboard.', '讀者先理解結論，再核對證據，毋須閱讀複雜技術儀表板。'), proposedFiles: ['apps/web/components/research-report.tsx', 'apps/web/app/page.tsx'] },
    ],
    branches: returns({ success: t('Validated draft becomes a dated Hold or Reduce research report.', '已驗證草稿成為有日期的 Hold 或 Reduce 研究報告。'), insufficient: t('Show the supported news summary with No rating and the missing evidence.', '展示有證據的新聞摘要、無評級狀態及缺失資料。'), failure: t('Malformed model output stays unreleased; return a validation failure to the graph.', '模型格式無效則不發布草稿，向 graph 回傳驗證失敗。') }),
    acceptance: [t('Every news impact includes a source and uncertainty; no target price or invented confidence percentage appears.', '每項新聞影響都有來源及不確定因素；不出現目標價或捏造信心百分比。')],
  },
  {
    id: 'validation', title: t('Validate citations and tool boundaries', '驗證引用及工具邊界'),
    purpose: t('Stop unsupported output and keep article text from becoming an instruction.', '阻擋無根據輸出，避免文章文字變成系統指令。'),
    input: t('Draft report, approved source set and immutable run limits.', '報告草稿、核准來源集及不可由文章修改的任務上限。'),
    output: t('A pass result, actionable validation errors or an insufficient-evidence response.', '通過結果、可處理的驗證錯誤，或證據不足回覆。'),
    entry: { kind: 'internal', caller: 'Graph validation node and tool boundary', contract: 'validate_report(draft, allowed_sources, rules) → valid | insufficient | errors' },
    steps: [
      { id: 'boundaries', keyword: 'RESTRICT', action: t('Keep tool authority outside retrieved text.', '將工具權限放在檢索文字之外控制。'), tools: 'Allowlisted tools · validated arguments', how: t('Treat article text as untrusted data. Permit only read-only tools and server-enforced source filters. Never put keys into prompts.', '文章當作不可信資料，只允許唯讀工具及伺服器強制來源限制，金鑰不放進提示。'), why: t('Telling a model to ignore attacks is only one layer; code must enforce the accessible operations.', '叫模型忽略攻擊只係其中一層，程式必須限制可執行動作。'), proposedFiles: ['services/research/app/tools.py', 'services/research/app/prompts.py'] },
      { id: 'citations', keyword: 'VERIFY', action: t('Check structure, source membership, dates and rule agreement.', '檢查格式、來源歸屬、日期及規則一致性。'), tools: 'Pydantic · deterministic checks', how: t('Reject unknown citations, wrong-company evidence, future information and a stance inconsistent with the rule result. Evaluate whether cited passages support factual claims.', '拒絕未知引用、錯公司、未來資料及與規則不符的觀點，並評估原文是否支持事實主張。'), why: t('A source link can exist while failing to support the sentence next to it.', '來源連結存在，仍可能不支持旁邊的句子。'), proposedFiles: ['services/research/app/validation.py', 'services/research/app/schemas.py'] },
      { id: 'release', keyword: 'RELEASE OR STOP', action: t('Release only the supported result and record failures.', '只發布有支持的結果，並記錄失敗。'), tools: 'Graph conditional edge · structured trace', how: t('Return valid output, no rating for insufficient evidence, or a typed failure. Record source IDs and error categories without secrets.', '有效則回傳，證據不足則不評級，其他情況回傳結構化失敗；記錄來源 ID 及錯誤類別，避免記錄秘密。'), why: t('Visible failure is more useful than silently presenting an unsupported recommendation.', '明確交代失敗，能避免把無根據觀點當成已驗證建議。'), proposedFiles: ['services/research/app/validation.py', 'services/research/app/graph.py'] },
    ],
    branches: returns({ success: t('Release validated structured content to storage and UI.', '將已驗證內容交給儲存及介面。'), insufficient: t('Return No rating with supported facts; human approval cannot manufacture missing evidence.', '回傳無評級及有證據事實；人工批准不能補出缺失證據。'), failure: t('Block release and return validation_failed; do not leak keys or follow article instructions.', '阻擋發布並回傳 validation_failed，不洩漏金鑰或執行文章指令。') }),
    acceptance: [t('An attack fixture asking for keys or STRONG BUY cannot change permitted tools or the rule result.', '要求金鑰或 STRONG BUY 的攻擊範例，不能修改允許工具或規則結果。')],
  },
  {
    id: 'export', title: t('Save and download the report', '保存及下載報告'),
    purpose: t('Keep the reviewed result and export exactly what the user saw.', '保存已核對結果，下載內容與畫面一致。'),
    input: t('A validated report ID and Markdown export request.', '已驗證報告 ID 及 Markdown 下載請求。'),
    output: t('A stored report or Markdown with its evidence, dates and limitations.', '已儲存報告，或包含證據、日期及限制的 Markdown。'),
    entry: { kind: 'http', method: 'GET', path: '/api/reports/{report_id}/export', example: 'Next.js proxy → GET /reports/{report_id}/export\nContent-Type: text/markdown; charset=utf-8' },
    steps: [
      { id: 'persist', keyword: 'SAVE', action: t('Persist the final version with its research context.', '連同研究背景保存最終版本。'), tools: 'SQLite · transactions', how: t('Save the validated report, rule version, source IDs, snapshot date and run ID together. Use a stable report ID.', '一起保存報告、規則版本、來源 ID、快照日期及任務 ID，使用穩定報告 ID。'), why: t('A later export must refer to the same evidence instead of silently regenerating a new answer.', '稍後下載應使用相同證據，不能靜默重新產生另一個答案。'), proposedFiles: ['services/research/app/storage.py'] },
      { id: 'render', keyword: 'SERIALISE', action: t('Render Markdown from the stored validated result.', '從已儲存的驗證結果產生 Markdown。'), tools: 'Python serializer · no LLM call', how: t('Include stance, horizon, source URLs, publication dates, possible effects and uncertainty. Preserve demo labels for fixtures.', '包含觀點、期間、來源網址、發布日期、可能影響及不確定因素；範例保留虛構標籤。'), why: t('Downloading an existing report requires no additional model usage and should preserve provenance.', '下載已有報告不需額外模型用量，亦應保留來源記錄。'), proposedFiles: ['services/research/app/export.py'] },
      { id: 'download', keyword: 'DOWNLOAD', action: t('Return the file through the frontend route.', '透過前端路由回傳檔案。'), tools: 'FastAPI response · Next.js proxy', how: t('Look up the report ID, set the Markdown content type and filename, and stream the existing text.', '按報告 ID 查找，設定 Markdown 類型及檔名，再回傳已有文字。'), why: t('The first private single-user app needs one clear export path; public multi-user ownership checks come before sharing it.', '私人單用戶首版只需一條下載路徑；公開多人使用前須加擁有權檢查。'), proposedFiles: ['services/research/app/main.py', 'apps/web/app/api/[...path]/route.ts'] },
    ],
    branches: returns({ success: t('200: download the existing Markdown with evidence intact.', '200：下載保留證據的既有 Markdown。'), insufficient: t('An insufficient-evidence report can be saved and exported with its No rating status.', '證據不足報告可保存及下載，但必須保留無評級狀態。'), failure: t('404 for unknown report; reject unfinished or invalid report export.', '未知報告回 404；拒絕下載未完成或無效報告。') }),
    acceptance: [t('The downloaded report matches the displayed result and makes zero extra model calls.', '下載報告與畫面一致，額外模型呼叫為零。')],
  },
  {
    id: 'recovery', title: t('Resume an interrupted research run', '恢復中斷研究任務'),
    purpose: t('Recover completed work after a failure without starting the research again.', '失敗後恢復已完成工作，避免全部重做。'),
    input: t('A known run ID and its saved graph checkpoint.', '已知任務 ID 及其 graph checkpoint。'),
    output: t('A resumed run, a completed result, or a clear unavailable-checkpoint error.', '已恢復任務、已完成結果，或明確無可用 checkpoint 錯誤。'),
    entry: { kind: 'http', method: 'POST', path: '/api/research/{run_id}/resume', example: 'Next.js proxy → POST /research/{run_id}/resume\nResume only the selected saved run, within its existing budget.' },
    steps: [
      { id: 'checkpoint', keyword: 'CHECKPOINT', action: t('Persist graph progress under the run ID.', '按任務 ID 保存 graph 進度。'), tools: 'LangGraph checkpointer · SQLite', how: t('Save query, evidence references, tool results and remaining budget in the graph state. The Python app uses durable storage.', '在 graph 狀態保存查詢、來源、工具結果及剩餘預算；Python app 使用持久儲存。'), why: t('Checkpointing remembers a run. It is different from long-term user memory or permission to take new actions.', 'Checkpoint 記住單次任務，不等於長期用戶記憶或執行新動作的權限。'), proposedFiles: ['services/research/app/checkpoints.py', 'services/research/app/graph.py'] },
      { id: 'resume', keyword: 'RESUME', action: t('Load the matching checkpoint and continue safely.', '載入相符 checkpoint 並安全繼續。'), tools: 'Run identity · idempotent source reads', how: t('Resolve the saved run, validate its status and resume with the same thread identity. Reuse completed tool results and remaining limits.', '查找已儲存任務，核對狀態，以相同 thread 身份恢復；重用已完成工具結果及剩餘上限。'), why: t('Retries must not reset budgets, duplicate completed work or resume a different user’s run.', '重試不能重設預算、重複已完成工作或恢復其他用戶任務。'), proposedFiles: ['services/research/app/checkpoints.py', 'services/research/app/main.py'] },
      { id: 'surface', keyword: 'RETURN STATUS', action: t('Tell the user what resumed and what remains.', '告知使用者已恢復及尚欠工作。'), tools: 'Typed response · Next.js status view', how: t('Return the resumed status or existing final result. Reject unknown or incompatible checkpoints instead of inventing a fresh run.', '回傳恢復狀態或既有結果；拒絕未知或不相容 checkpoint，不靜默新開任務。'), why: t('A transparent recovery path is demonstrable engineering evidence for interviews.', '清晰可核對的恢復路徑，係面試可展示的工程能力。'), proposedFiles: ['apps/web/app/page.tsx', 'services/research/app/main.py'] },
    ],
    branches: returns({ success: t('Resume the saved run without repeating the completed search.', '恢復已儲存任務，不重複已完成搜尋。'), insufficient: t('Budget is exhausted: return supported findings and no rating instead of restarting.', '預算已用盡：回傳有證據發現及無評級，不重新開始。'), failure: t('404 for unknown run; 409 for incompatible checkpoint; leave the saved state intact.', '未知任務回 404；checkpoint 不相容回 409；保留儲存狀態。') }),
    acceptance: [t('Stop after the first search, resume, and show that the search count remains one.', '第一次搜尋後停止再恢復，搜尋次數維持一次。')],
  },
];

export const financeEngineeringWorkflows: FinanceFunctionGuide[] = [
  {
    id: 'evaluation', title: t('Evaluate the agent before the interview', '面試前評估 agent'),
    purpose: t('Demonstrate factual support and controlled failures with repeatable tests.', '以可重跑測試展示事實支持度及受控失敗處理。'),
    input: t('Versioned evidence and about 15–20 explicit evaluation cases.', '版本化證據及約 15–20 個明確評估案例。'),
    output: t('Actual case outcomes, tool traces, latency and model-usage records.', '真實案例結果、工具記錄、延遲及模型用量。'),
    entry: { kind: 'developer', command: 'python -m app.evaluate --cases ../../evals/cases.jsonl' },
    steps: [
      { id: 'cases', keyword: 'DEFINE CASES', action: t('Cover successful and adversarial research paths.', '涵蓋正常及對抗研究路徑。'), tools: 'JSONL fixtures · expected behaviors', how: t('Include wrong company, future date, missing outlook, forged citation, injected instruction and interrupted-run cases.', '加入錯公司、未來日期、缺展望、偽造引用、注入指令及中斷任務案例。'), why: t('A happy-path screenshot alone does not establish how the app behaves when evidence is wrong.', '只有成功畫面，無法展示證據有問題時 app 點處理。'), proposedFiles: ['evals/cases.jsonl', 'services/research/tests/test_research.py'] },
      { id: 'run', keyword: 'RUN + TRACE', action: t('Execute the graph and record real outcomes.', '執行 graph 並記錄真實結果。'), tools: 'pytest · evaluation runner · structured logs', how: t('Assert citation membership, factual support, bounded tools and recovery. Measure actual latency and provider usage without logging secrets.', '檢查引用、事實支持、工具上限及恢復；量度真實延遲及供應商用量，避免記錄秘密。'), why: t('Engineering metrics must describe work actually performed, including failures and retries.', '工程指標須反映實際工作，包括失敗及重試。'), proposedFiles: ['services/research/app/evaluate.py', 'services/research/tests/test_research.py'] },
      { id: 'publish', keyword: 'DOCUMENT', action: t('Publish the dataset version, rerun command and observed limits.', '附資料版本、重跑命令及已觀察限制。'), tools: 'README · GitHub Actions', how: t('Run deterministic tests in CI and keep live-provider evaluations opt-in. Record actual results and the model/configuration used.', 'CI 跑確定性測試，真實供應商評估由操作者啟動；記錄真實結果及模型設定。'), why: t('Reviewers can reproduce the evidence without paying for unexpected model calls.', '審閱者可重現結果，同時避免意外付費模型呼叫。'), proposedFiles: ['.github/workflows/check.yml', 'README.md'] },
    ],
    branches: returns({ success: t('Checks pass and the measured report is saved with its configuration.', '檢查通過，量度報告連同設定保存。'), insufficient: t('Missing credentials: skip live cases explicitly and report the reduced coverage.', '沒有憑證：明確跳過真實呼叫案例並交代覆蓋限制。'), failure: t('Fail the check, retain traces and block release until the defect is fixed.', '檢查失敗，保留記錄，修正缺陷前阻擋發布。') }),
    acceptance: [t('Show success, missing evidence, injected instructions and recovery using the same rerunnable dataset.', '用同一可重跑資料集展示正常、缺證據、注入指令及恢復四種情境。')],
  },
  {
    id: 'deployment', title: t('Package locally, then deploy privately', '本機包裝，再私人部署'),
    purpose: t('Add Docker only after the native app works; keep the first EC2 release small.', '本機 app 跑通後才加入 Docker，首個 EC2 發布保持簡單。'),
    input: t('A tested source revision, Dockerfiles and private server environment.', '已測試版本、Dockerfile 及私人伺服器環境。'),
    output: t('The same tested images running with persistent data and a checked recovery path.', '相同已測映像運行，並有持久資料及已核對恢復路徑。'),
    entry: { kind: 'developer', command: 'docker compose -f deploy/compose.yaml up -d --build' },
    steps: [
      { id: 'package', keyword: 'BUILD IMAGES', action: t('Package the Next.js and Python services.', '包裝 Next.js 及 Python 服務。'), tools: 'Docker · Compose', how: t('Create separate images, keep provider keys out of build layers, mount SQLite data and use the private research service name.', '建立獨立映像，不將供應商金鑰寫入映像層，掛載 SQLite 資料，使用私人 research 服務名稱。'), why: t('Container packaging should preserve the working app instead of introducing a new orchestration platform.', '容器包裝應保留已運作 app，避免同時引入新編排平台。'), proposedFiles: ['apps/web/Dockerfile', 'services/research/Dockerfile', 'deploy/compose.yaml'] },
      { id: 'smoke', keyword: 'VERIFY LOCALLY', action: t('Run the containers and test the four scenarios.', '運行容器並檢查四種情境。'), tools: 'Health endpoints · smoke tests', how: t('Verify frontend-to-API forwarding, source access and recovery after restarting a container. Confirm no secrets are delivered to the browser.', '核對前端轉送、來源存取及重啟後恢復，確認沒有秘密傳至瀏覽器。'), why: t('A successful image build does not prove that the services communicate or retain data.', '映像建立成功，不代表服務能互通或資料能保存。'), proposedFiles: ['deploy/compose.yaml', 'services/research/tests/test_research.py'] },
      { id: 'ec2', keyword: 'PRIVATE EC2', action: t('Run the tested release on one private EC2 deployment.', '將已測版本運行在一台私人 EC2 部署。'), tools: 'EC2 · persistent volume · controlled TLS access', how: t('Keep Python private, restrict SSH, require controlled HTTPS access, test SQLite backup/restore and retain a previous image tag.', 'Python 保持私人，限制 SSH，使用受控 HTTPS 存取，測試 SQLite 備份還原並保留舊映像標籤。'), why: t('The interview deployment needs a demonstrable operating and recovery procedure, not Kubernetes.', '面試部署需要可展示的運維及恢復程序，首版不用 Kubernetes。'), proposedFiles: ['deploy/README.md', 'deploy/research.env.example', 'deploy/compose.yaml'] },
    ],
    branches: returns({ success: t('A private smoke-tested release with recorded image tag and restored-backup proof.', '已完成私人 smoke test，記錄映像標籤及備份還原證據。'), insufficient: t('No cloud access yet: keep the local Docker demo and recording; continue job applications.', '暫無雲端：保留本機 Docker 示範及影片，繼續申請工作。'), failure: t('Stop the release or restore the previous image without deleting the data volume.', '停止發布或回退舊映像，不刪資料磁碟。') }),
    acceptance: [t('Restart retains data, backup restores, and the API port is not exposed publicly.', '重啟保留資料、備份可還原，API 連接埠不公開。')],
  },
];

export const financeStages: Array<{ week: number; hours: number; title: Copy; tasks: Copy[]; done: Copy }> = [
  { week: 1, hours: 15, title: t('Prepare evidence and the report contract', '準備證據及報告格式'), tasks: [t('Choose three companies and a permitted dated snapshot.', '選定三間公司及允許使用的有日期快照。'), t('Define schemas, ingestion and the company selector.', '定義 schema、匯入流程及公司選單。')], done: t('Resolve a supported company and retrieve its stored evidence reproducibly.', '可重現地選定支援公司並檢索其已儲存證據。') },
  { week: 2, hours: 15, title: t('Complete the bounded research path', '完成有上限的研究路徑'), tasks: [t('Add two tools, one LangGraph agent and one model.', '加入兩個工具、一個 LangGraph agent 及一個模型。'), t('Validate a sourced report and the insufficient-evidence path.', '驗證有來源報告及證據不足路徑。')], done: t('Produce one cited report or an honest no-rating result. Start applying with the project in progress.', '產生有引用報告或誠實的無評級結果；可以進行中項目開始申請。') },
  { week: 3, hours: 15, title: t('Polish one page and test failures', '完善一頁介面並測試失敗情境'), tasks: [t('Add source inspection, export and checkpoint recovery.', '加入來源核對、下載及 checkpoint 恢復。'), t('Prepare about 15–20 concrete evaluation cases and record actual outcomes.', '準備約 15–20 個明確評估案例，記錄真實結果。')], done: t('Demonstrate success, missing evidence, injected instructions and recovery.', '可展示正常、缺證據、注入指令及恢復情境。') },
  { week: 4, hours: 15, title: t('Package and explain the work', '包裝並解釋作品'), tasks: [t('Verify Docker locally; add private EC2 deployment if ready.', '本機驗證 Docker；準備好先加入私人 EC2 部署。'), t('Write the README and record a 2–3 minute walkthrough.', '撰寫 README，錄製 2–3 分鐘示範。')], done: t('A reviewer can run the app, understand its limits and reproduce the evaluation.', '審閱者可運行 app、理解限制及重跑評估。') },
];

export const financeStack: Array<{ name: string; tools: string; how: Copy; why: Copy }> = [
  { name: 'Frontend', tools: 'Next.js · React · TypeScript', how: t('One selector and report page; server-side API proxy keeps the backend address and keys private.', '一個選單及報告頁；伺服器 API 轉送避免向瀏覽器公開後端金鑰。'), why: t('Reuse existing web skills and keep the user journey short.', '重用現有網頁能力，保持使用流程簡短。') },
  { name: 'Backend', tools: 'Python · FastAPI · Pydantic', how: t('Validate requests, expose the small API and own retrieval, rules, storage and exports.', '驗證請求、提供少量 API，負責檢索、規則、儲存及下載。'), why: t('One backend reduces integration work while demonstrating the Python skills relevant to agent engineering.', '一個後端減少整合工作，同時展示 agent 工程所需 Python 能力。') },
  { name: 'Agent', tools: 'LangGraph · one LLM', how: t('Keep typed state, conditional evidence checks, a single refinement and persistent checkpoints.', '保存有型別狀態、條件式證據檢查、一次補查及持久 checkpoint。'), why: t('Demonstrate tool selection and controlled recovery rather than adding multiple agents without a need.', '展示工具選擇及受控恢復，先減少沒有實際需要的多 agent。') },
  { name: 'Evidence', tools: 'SQLite · FTS5 · basic RAG', how: t('Filter company/date, retrieve approved excerpts and attach stable source IDs to the model context.', '先過濾公司及日期，再檢索核准原文，將穩定來源 ID 放入模型上下文。'), why: t('Simple retrieval is sufficient for the small first corpus; vector search needs a measured reason to add it.', '小型首版資料集先用簡單檢索；有量度依據後再加向量搜尋。') },
  { name: 'Reliability', tools: 'pytest · structured logs · GitHub Actions', how: t('Test source support, malicious text, budgets and recovery; record actual latency and usage.', '測試來源支持、惡意文字、預算及恢復，記錄真實延遲及用量。'), why: t('Failure evidence helps a reviewer assess the system beyond a polished successful answer.', '失敗處理證據讓審閱者評估系統，而不只看成功答案。') },
  { name: 'Delivery', tools: 'Docker Compose · EC2', how: t('Develop natively, verify containers locally, then deploy the same images privately.', '原生本機開發、本機驗證容器，再私人部署相同映像。'), why: t('Show packaging and operations without making cloud setup a prerequisite for the first report.', '展示包裝及運維，同時不讓雲端設定阻礙首份報告。') },
];
export const financeDeferred: Array<{ name: string; reason: Copy }> = [
  { name: 'Spring Boot · OAuth · multi-user ACL', reason: t('Add for Java-focused roles or real shared workspaces. The first app is private and single-user. Public or multi-user access requires proper authorization first.', '投 Java 職位或真正多人工作區時再加。首版私人單用戶；公開或多人使用前須完成適當授權。') },
  { name: 'MCP · n8n · multi-agent', reason: t('Add MCP for real tool interoperability, n8n for an actual schedule, and more agents only after demonstrating a benefit.', '有跨工具接駁需要才加 MCP，有實際排程才用 n8n，多 agent 須先證明有幫助。') },
  { name: 'Dense + sparse · HNSW · reranking', reason: t('First measure retrieval errors on the small corpus. Add embeddings, hybrid ranking or ANN indexing only if they improve a documented evaluation.', '先量度小型資料集檢索錯誤，再按評估改善加入 embeddings、混合排序或 ANN 索引。') },
  { name: 'Model routing · fine-tuning', reason: t('Start with one provider/model. Add routing only after traces reveal a cost or quality problem. Fine-tuning is not required for the first cited report.', '先用一個供應商及模型；記錄顯示成本或品質問題後才加分流。首份有引用報告不需要微調。') },
  { name: 'Global markets · forecasting · strategies', reason: t('Global coverage, personal background searches, price targets, five strategy families, backtesting and the VIX filter are outside this job-first release.', '全球市場、人物背景、目標價、五類策略、回測及 VIX 過濾器不屬於今次求職首版。') },
  { name: 'PDF · UiPath · C# · Kubernetes', reason: t('No PDF extraction is needed for the curated text snapshot. Add automation or another language in a focused project; postpone cluster operations.', '文字快照不需抽取 PDF；自動化或另一語言可用獨立項目展示，叢集運維延後。') },
];
export const financeReferences = [
  { title: 'LangGraph: workflows and agents', url: 'https://docs.langchain.com/oss/python/langgraph/workflows-agents' },
  { title: 'LangGraph: persistence and checkpoints', url: 'https://docs.langchain.com/oss/python/langgraph/persistence' },
  { title: 'FastAPI: typed request bodies', url: 'https://fastapi.tiangolo.com/tutorial/body/' },
  { title: 'SQLite: FTS5 text search', url: 'https://www.sqlite.org/fts5.html' },
  { title: 'Docker Compose: production deployment', url: 'https://docs.docker.com/compose/how-tos/production/' },
];
export const financeRepositoryTree = `stock-research-agent/                 # proposed standalone app
├── apps/web/
│   ├── app/page.tsx                    # selector + report
│   ├── app/api/[...path]/route.ts      # server-only API proxy
│   ├── components/research-report.tsx
│   ├── Dockerfile
│   └── package.json / package-lock.json
├── services/research/
│   ├── app/
│   │   ├── main.py / schemas.py / companies.py
│   │   ├── ingest.py / storage.py / retrieval.py
│   │   ├── graph.py / tools.py / checkpoints.py
│   │   ├── rules.py / report.py / prompts.py
│   │   └── validation.py / export.py / evaluate.py
│   ├── tests/test_research.py
│   ├── requirements.txt               # pinned dependencies
│   ├── .env.example                   # no secrets
│   └── Dockerfile
├── data/manifest.json / README.md      # approved, dated evidence
├── evals/cases.jsonl
├── deploy/
│   ├── compose.yaml
│   ├── research.env.example / README.md
│   └── research.env                   # ignored, server secrets
├── .github/workflows/check.yml
├── .gitignore                         # .env.local, data files, databases
└── README.md

Native local: browser :3000 → Next.js server → FastAPI 127.0.0.1:8000
Docker later: browser → controlled HTTPS → web → research:8000 → data volume
SQLite reports/checkpoints persist on the data volume. Provider keys remain server-side.`;
