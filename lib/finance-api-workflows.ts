import type { Copy } from './curriculum';
import type { financeFunctionWorkflows } from './finance-function-workflows';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type Example = { [key: string]: Json };
type Request = { kind: 'none' } | { kind: 'json' | 'query' | 'multipart'; example: Example };
type Result =
  | { kind: 'json'; status: 200 | 201; example: Example }
  | { kind: 'accepted'; status: 202; example: Example; poll: string; completed: Example; failed: Example }
  | { kind: 'file'; status: 200; contentType: 'application/pdf'; description: Copy };
type HttpWorkflow = {
  kind: 'http'; method: 'GET' | 'POST' | 'PATCH'; path: string;
  access: 'reader' | 'editor' | 'service' | 'operator';
  request: Request; idempotencyKey: boolean;
  processing: [Copy, Copy, Copy]; services: string; result: Result;
  errors: { status: number; code: string; detail: Copy }[];
};
type PipelineWorkflow = {
  kind: 'pipeline'; trigger: string; input: Example;
  processing: [Copy, Copy, Copy]; services: string; output: Example; failure: Copy;
};
export type FinanceApiWorkflow = HttpWorkflow | PipelineWorkflow;

const jobResult = ({ jobId, result }: { jobId: string; result: Example }): Result => ({
  kind: 'accepted', status: 202,
  example: { jobId, state: 'queued', statusUrl: `/api/v1/jobs/${jobId}` },
  poll: `/api/v1/jobs/${jobId}`,
  completed: { jobId, state: 'completed', result },
  failed: { jobId, state: 'failed', error: { code: 'PROCESSING_FAILED', retryable: true } },
});

// Proposed contracts for a future backend. These examples never execute requests.
// Each tuple follows the authoritative three-function order for its area.
export const financeApiWorkflows = {
  library: [
    {
      kind: 'http', method: 'POST', path: '/api/v1/documents', access: 'editor', idempotencyKey: true,
      request: { kind: 'multipart', example: { file: '<annual-report.pdf binary>', companyId: 'demo-co', periodEnd: '2025-12-31', sourceUrl: 'https://reports.example.invalid/annual.pdf' } },
      processing: [
        { en: 'React sends FormData. FastAPI authenticates the editor and checks PDF signature, size and company access.', zh: 'React 傳送 FormData；FastAPI 驗證編輯權限、PDF 特徵、大小及公司存取權。' },
        { en: 'Hash the bytes, store the immutable original in S3 and create a version record in PostgreSQL. Reuse an existing upload when its hash and scope match.', zh: '計算檔案雜湊，把不可變原檔存入 S3，在 PostgreSQL 建立版本；雜湊及範圍相同時重用已有檔案。' },
        { en: 'Commit a durable extraction job. Return its status URL; the browser polls with backoff until completed or failed.', zh: '提交持久擷取工作並回傳狀態網址；瀏覽器逐步延長輪詢間隔，直至完成或失敗。' },
      ], services: 'React → FastAPI / Pydantic → hashlib → S3 + PostgreSQL → worker',
      result: jobResult({ jobId: 'job-upload-01', result: { documentId: 'doc-01', versionId: 'ver-01', extractionState: 'review_required' } }),
      errors: [{ status: 415, code: 'UNSUPPORTED_FILE', detail: { en: 'Reject a file that is not a PDF.', zh: '拒絕並非 PDF 的檔案。' } }, { status: 413, code: 'FILE_TOO_LARGE', detail: { en: 'Show the configured upload limit.', zh: '顯示設定的上載大小限制。' } }],
    },
    {
      kind: 'http', method: 'PATCH', path: '/api/v1/document-versions/{versionId}/metadata', access: 'editor', idempotencyKey: false,
      request: { kind: 'json', example: { expectedRevision: 1, companyId: 'demo-co', periodStart: '2025-01-01', periodEnd: '2025-12-31', reportType: 'annual', sourceUrl: 'https://reports.example.invalid/annual.pdf' } },
      processing: [
        { en: 'Validate the company, report type, dates and source URL against the metadata schema.', zh: '按結構驗證公司、報告類型、日期及來源網址。' },
        { en: 'Check edit permission and expectedRevision in one database transaction; keep the prior metadata in the audit log.', zh: '在同一交易核對編輯權限及 expectedRevision，並於稽核記錄保留舊標籤。' },
        { en: 'Save the confirmed labels and refresh the report-library display from the returned revision.', zh: '儲存已確認標籤，按回傳版本更新財報資料庫畫面。' },
      ], services: 'React metadata form → FastAPI / Pydantic → PostgreSQL transaction',
      result: { kind: 'json', status: 200, example: { versionId: 'ver-01', revision: 2, metadataState: 'confirmed' } },
      errors: [{ status: 409, code: 'REVISION_CONFLICT', detail: { en: 'Reload the newer metadata before editing again.', zh: '重新載入最新標籤後再編輯。' } }, { status: 422, code: 'INVALID_PERIOD', detail: { en: 'Correct the fiscal dates; do not infer them silently.', zh: '修正財政日期，不可默默推斷。' } }],
    },
    {
      kind: 'http', method: 'POST', path: '/api/v1/documents/{documentId}/versions', access: 'editor', idempotencyKey: true,
      request: { kind: 'multipart', example: { file: '<revised-report.pdf binary>', supersedesVersionId: 'ver-01', reason: 'Issuer published a revised report' } },
      processing: [
        { en: 'Check the PDF, document ownership and the revision it claims to supersede.', zh: '檢查 PDF、文件權限及其取代的版本。' },
        { en: 'Store a new immutable object and version link; keep the original available to old citations.', zh: '儲存新不可變檔案及版本連結；舊引用仍可存取原版。' },
        { en: 'Queue extraction for the new version and flag dependent comparisons and briefs for review.', zh: '為新版本排程擷取，並標示相關比較及摘要需要覆核。' },
      ], services: 'React → FastAPI → S3 versioned objects + PostgreSQL → worker',
      result: jobResult({ jobId: 'job-revision-01', result: { documentId: 'doc-01', versionId: 'ver-02', supersedesVersionId: 'ver-01' } }),
      errors: [{ status: 409, code: 'VERSION_CONFLICT', detail: { en: 'A newer revision already exists; review it first.', zh: '已有更新版本，請先覆核。' } }, { status: 422, code: 'REPORT_SCOPE_MISMATCH', detail: { en: 'Confirm that the company and period belong to this document.', zh: '確認公司及期間屬於此文件。' } }],
    },
  ],
  extraction: [
    {
      kind: 'http', method: 'POST', path: '/api/v1/document-versions/{versionId}/extractions', access: 'editor', idempotencyKey: true,
      request: { kind: 'json', example: { parserVersion: 'pdf-parser-v1', mode: 'text-and-tables' } },
      processing: [
        { en: 'Authorize the version and check that its original PDF exists. Select a supported parser configuration.', zh: '驗證版本權限及原 PDF 存在，選擇支援的解析設定。' },
        { en: 'A worker runs PyMuPDF and pdfplumber, preserving table cells, coordinates and page identity.', zh: '背景工作使用 PyMuPDF 及 pdfplumber，保留儲存格、座標及頁面識別。' },
        { en: 'Store candidate facts with parser provenance and a review state. Parsing completion does not mean that every value is correct.', zh: '儲存附解析來源及覆核狀態的候選數據；解析完成不代表每項數值均正確。' },
      ], services: 'FastAPI → durable worker → PyMuPDF / pdfplumber → PostgreSQL',
      result: jobResult({ jobId: 'job-extract-01', result: { extractionId: 'ext-01', candidateCount: 12, reviewRequired: true } }),
      errors: [{ status: 404, code: 'VERSION_NOT_FOUND', detail: { en: 'Select an accessible document version.', zh: '選擇可存取的文件版本。' } }, { status: 422, code: 'OCR_REQUIRED', detail: { en: 'A scanned PDF needs an OCR workflow or manual handling.', zh: '掃描 PDF 需要 OCR 流程或人工處理。' } }],
    },
    {
      kind: 'http', method: 'GET', path: '/api/v1/evidence/{evidenceId}', access: 'reader', idempotencyKey: false, request: { kind: 'none' },
      processing: [
        { en: 'Authenticate the reader and resolve the evidence ID within accessible document versions.', zh: '驗證讀取權限，在可存取文件版本內解析證據 ID。' },
        { en: 'Read the immutable version, zero-based page index, printed label, table and bounding box.', zh: '讀取不可變版本、由零開始頁索引、印刷頁碼、表格及範圍座標。' },
        { en: 'Return metadata for a citation. Keep the printed page label separate from the PDF viewer page number.', zh: '回傳引用資料；印刷頁碼與 PDF 檢視器頁碼分開儲存。' },
      ], services: 'React citation → FastAPI → PostgreSQL evidence record',
      result: { kind: 'json', status: 200, example: { evidenceId: 'ev-01', versionId: 'ver-01', pageIndex: 41, viewerPage: 42, printedLabel: '40', tableId: 'table-03', bbox: [72, 120, 520, 420] } },
      errors: [{ status: 404, code: 'EVIDENCE_NOT_FOUND', detail: { en: 'Show a missing-source state rather than a different page.', zh: '顯示來源缺失，不要改開其他頁。' } }, { status: 403, code: 'SOURCE_FORBIDDEN', detail: { en: 'Do not return private source metadata.', zh: '不可回傳私人來源資料。' } }],
    },
    {
      kind: 'http', method: 'POST', path: '/api/v1/fact-candidates/{candidateId}/reviews', access: 'editor', idempotencyKey: true,
      request: { kind: 'json', example: { expectedRevision: 1, decision: 'correct', value: '80.00', evidenceId: 'ev-01', reason: 'Checked against the original table' } },
      processing: [
        { en: 'Require a permitted reviewer, a valid decision and the current candidate revision.', zh: '要求獲准覆核者、有效決定及目前候選版本。' },
        { en: 'Check the cited source and numeric schema; record the review, reviewer ID and reason atomically.', zh: '核對來源及數值結構，以交易記錄覆核、覆核者 ID 及原因。' },
        { en: 'Promote an accepted or corrected candidate into a fact; rejected candidates stay out of analysis.', zh: '把已接納或更正候選轉成正式數據；拒絕項目不進入分析。' },
      ], services: 'React review form → FastAPI → PostgreSQL review + fact transaction',
      result: { kind: 'json', status: 201, example: { reviewId: 'review-01', factId: 'fact-2025-ocf', candidateRevision: 2, state: 'accepted' } },
      errors: [{ status: 409, code: 'CANDIDATE_CHANGED', detail: { en: 'Inspect the newer candidate before approving it.', zh: '批准前先檢查更新候選。' } }, { status: 422, code: 'INVALID_REVIEW', detail: { en: 'Supply a valid value, reason and evidence.', zh: '提供有效數值、原因及證據。' } }],
    },
  ],
  facts: [
    {
      kind: 'http', method: 'GET', path: '/api/v1/companies/{companyId}/facts', access: 'reader', idempotencyKey: false,
      request: { kind: 'query', example: { periodEnd: '2025-12-31', metrics: 'revenue,net_profit,total_assets,total_liabilities,operating_cash_flow', versionId: 'ver-01' } },
      processing: [
        { en: 'Validate the requested metric identifiers, period and document version.', zh: '驗證指標識別、期間及文件版本。' },
        { en: 'Query accepted facts only, scoped to the company and version. Preserve evidence and metric definitions.', zh: '僅查詢指定公司及版本的已接納數據，保留證據及指標定義。' },
        { en: 'Return available facts and explicit missing metric IDs. Use decimal strings for financial values.', zh: '回傳已有數據及明確缺失指標；財務數值使用十進制字串。' },
      ], services: 'React filters → FastAPI / Pydantic → PostgreSQL fact query',
      result: { kind: 'json', status: 200, example: { items: [{ factId: 'fact-2025-ocf', metric: 'operating_cash_flow', value: '80.00', currency: 'HKD', scale: '1000000', evidenceId: 'ev-01' }], missingMetrics: ['revenue', 'net_profit', 'total_assets', 'total_liabilities'] } },
      errors: [{ status: 422, code: 'UNKNOWN_METRIC', detail: { en: 'Choose a supported metric identifier.', zh: '選擇支援的指標識別。' } }, { status: 404, code: 'COMPANY_NOT_FOUND', detail: { en: 'Select an accessible company.', zh: '選擇可存取的公司。' } }],
    },
    {
      kind: 'http', method: 'POST', path: '/api/v1/facts/normalizations', access: 'reader', idempotencyKey: false,
      request: { kind: 'json', example: { factIds: ['fact-2025-ocf'], targetScale: '1' } },
      processing: [
        { en: 'Resolve authorized facts and require known currency, scale and period metadata.', zh: '解析有權存取數據，要求已知貨幣、單位及期間標籤。' },
        { en: 'Use Python Decimal to multiply by the source scale and divide by the target scale; retain the original.', zh: '使用 Python Decimal 乘以來源單位再除以目標單位，保留原值。' },
        { en: 'Return the normalized value and its source metadata. This operation does not perform currency conversion.', zh: '回傳標準化數值及來源資料；此操作不進行貨幣兌換。' },
      ], services: 'FastAPI → PostgreSQL facts → Python Decimal',
      result: { kind: 'json', status: 200, example: { items: [{ factId: 'fact-2025-ocf', original: { value: '80.00', scale: '1000000' }, normalized: { value: '80000000', scale: '1', currency: 'HKD' }, periodEnd: '2025-12-31' }] } },
      errors: [{ status: 422, code: 'UNKNOWN_SCALE', detail: { en: 'Request review instead of guessing a multiplier.', zh: '要求覆核，不可猜測倍數。' } }, { status: 409, code: 'CURRENCY_MISMATCH', detail: { en: 'Keep different currencies separate.', zh: '不同貨幣分開處理。' } }],
    },
    {
      kind: 'http', method: 'POST', path: '/api/v1/facts/{factId}/revisions', access: 'editor', idempotencyKey: true,
      request: { kind: 'json', example: { expectedRevision: 1, kind: 'issuer_restatement', value: '78.00', evidenceId: 'ev-revised-01', reason: 'Revised issuer report' } },
      processing: [
        { en: 'Require edit permission and distinguish an issuer restatement from an extraction correction.', zh: '要求編輯權限，分清發行人重列與擷取更正。' },
        { en: 'Check the current revision and evidence; append a new fact linked to its predecessor in a transaction.', zh: '檢查目前版本及證據，以交易新增連結前版的數據。' },
        { en: 'Return the new fact and affected brief IDs so the UI can show that earlier results need review.', zh: '回傳新數據及受影響摘要 ID，讓介面標示舊結果需要覆核。' },
      ], services: 'React correction form → FastAPI → PostgreSQL immutable revisions + audit log',
      result: { kind: 'json', status: 201, example: { factId: 'fact-2025-ocf-r2', supersedesFactId: 'fact-2025-ocf', revision: 2, staleBriefIds: ['brief-01'] } },
      errors: [{ status: 409, code: 'REVISION_CONFLICT', detail: { en: 'Review the latest fact before revising it.', zh: '修訂前先覆核最新數據。' } }, { status: 422, code: 'EVIDENCE_REQUIRED', detail: { en: 'Attach evidence and a correction reason.', zh: '附上證據及更正原因。' } }],
    },
  ],
  research: [
    {
      kind: 'http', method: 'POST', path: '/api/v1/research/runs', access: 'reader', idempotencyKey: true,
      request: { kind: 'json', example: { question: 'Why did operating cash flow fall?', companyIds: ['demo-co'], periods: ['2024', '2025'], documentVersionIds: ['ver-01'], answerLanguage: 'en' } },
      processing: [
        { en: 'Validate question length, selected reports, language and access. Treat report text as evidence, never as system instructions.', zh: '驗證問題長度、所選報告、語言及權限；財報文字只作證據，不作系統指令。' },
        { en: 'Queue a LangGraph run: retrieve → check facts → calculate → draft → verify; persist checkpoints.', zh: '排程 LangGraph：檢索 → 核對數據 → 計算 → 草擬 → 驗證，持久儲存檢查點。' },
        { en: 'Poll the run status. Show a cited answer, an explicit partial answer or a failed state; never fabricate missing causes.', zh: '輪詢執行狀態；顯示附引用答案、明確部分答案或失敗狀態，不編造缺失原因。' },
      ], services: 'React → FastAPI → worker / LangGraph → pgvector + Decimal + LLM → PostgreSQL',
      result: { kind: 'accepted', status: 202, example: { runId: 'run-01', state: 'queued', statusUrl: '/api/v1/research/runs/run-01' }, poll: '/api/v1/research/runs/run-01', completed: { runId: 'run-01', state: 'completed', answerState: 'partial', answer: 'Operating cash flow fell 20%. The retrieved evidence does not establish why.', evidenceIds: ['ev-01', 'ev-02'] }, failed: { runId: 'run-01', state: 'failed', error: { code: 'MODEL_UNAVAILABLE', retryable: true } } },
      errors: [{ status: 422, code: 'SCOPE_REQUIRED', detail: { en: 'Ask the user to select company and periods.', zh: '要求使用者選擇公司及期間。' } }, { status: 429, code: 'RUN_LIMIT', detail: { en: 'Respect the retry delay and keep the draft question.', zh: '按重試等待時間處理，保留問題草稿。' } }],
    },
    {
      kind: 'http', method: 'POST', path: '/api/v1/retrieval/search', access: 'reader', idempotencyKey: false,
      request: { kind: 'json', example: { query: 'operating cash flow explanation', companyIds: ['demo-co'], documentVersionIds: ['ver-01'], topK: 5 } },
      processing: [
        { en: 'Validate scope and cap topK; enforce document authorization before searching.', zh: '驗證範圍及限制 topK，搜尋前強制核對文件權限。' },
        { en: 'Embed the query and combine filtered pgvector search with keyword retrieval and ranking.', zh: '為問題產生嵌入，結合有篩選的 pgvector、關鍵詞檢索及排序。' },
        { en: 'Return passages with evidence IDs and page references. An empty hit list is a valid insufficient-evidence result.', zh: '回傳附證據 ID 及頁面參照的段落；空結果是有效的證據不足結果。' },
      ], services: 'FastAPI → embedding API → PostgreSQL / pgvector + text search',
      result: { kind: 'json', status: 200, example: { hits: [{ evidenceId: 'ev-01', versionId: 'ver-01', viewerPage: 42, text: 'Operating cash flow: HKD 80 million.' }], evidenceState: 'found' } },
      errors: [{ status: 403, code: 'SCOPE_FORBIDDEN', detail: { en: 'Exclude reports the user cannot access.', zh: '排除使用者無權存取的報告。' } }, { status: 422, code: 'INVALID_SEARCH_SCOPE', detail: { en: 'Require valid report versions and a bounded topK.', zh: '要求有效報告版本及有上限的 topK。' } }],
    },
    {
      kind: 'http', method: 'POST', path: '/api/v1/research/runs/{runId}/verification', access: 'reader', idempotencyKey: false,
      request: { kind: 'json', example: { answerVersion: 1 } },
      processing: [
        { en: 'Load the server-stored answer and evidence snapshot for this authorized run and answer version.', zh: '按獲准執行及答案版本，讀取伺服器儲存的答案與證據快照。' },
        { en: 'Resolve citations and recalculate figures. Use an LLM support check as a fallible signal, with human review where necessary.', zh: '解析引用及重新計算；模型支持度檢查只作可能出錯的訊號，需要時交人覆核。' },
        { en: 'Keep supported claims, flag or remove unsupported claims and return missing-evidence reasons.', zh: '保留有支持主張，標示或移除無支持主張，回傳缺失證據原因。' },
      ], services: 'FastAPI → LangGraph verification → Decimal + evidence store + LLM',
      result: { kind: 'json', status: 200, example: { answerVersion: 1, answerState: 'partial', keptClaimIds: ['claim-change'], droppedClaimIds: ['claim-cause'], missingEvidence: ['Management explanation'], requiresHumanReview: true } },
      errors: [{ status: 404, code: 'RUN_NOT_FOUND', detail: { en: 'Select an existing accessible run.', zh: '選擇可存取的已有執行。' } }, { status: 409, code: 'ANSWER_CHANGED', detail: { en: 'Verify the latest answer version.', zh: '驗證最新答案版本。' } }],
    },
  ],
  comparison: [
    {
      kind: 'http', method: 'POST', path: '/api/v1/calculations/yoy', access: 'reader', idempotencyKey: false,
      request: { kind: 'json', example: { currentFactId: 'fact-2025-ocf', priorFactId: 'fact-2024-ocf', decimalPlaces: 2 } },
      processing: [
        { en: 'Load accepted facts and require matching metric definition, currency, comparable periods and normalized scale.', zh: '讀取已接納數據，要求指標定義、貨幣、可比較期間及標準單位相符。' },
        { en: 'Calculate (current − prior) ÷ prior × 100 using Decimal, preserving unrounded inputs.', zh: '使用 Decimal 計算（本期 − 上期）÷ 上期 × 100，保留未捨入輸入。' },
        { en: 'Return the formula, values, fact IDs and rounded display result. A zero prior value makes this percentage undefined.', zh: '回傳公式、數值、數據 ID 及顯示用捨入結果；上期為零時百分比無定義。' },
      ], services: 'FastAPI → PostgreSQL accepted facts → Python Decimal',
      result: { kind: 'json', status: 200, example: { current: '80000000', prior: '100000000', delta: '-20000000', percent: '-20.00', currency: 'HKD', formula: '(current-prior)/prior*100', inputFactIds: ['fact-2025-ocf', 'fact-2024-ocf'] } },
      errors: [{ status: 422, code: 'ZERO_BASE', detail: { en: 'Show the absolute change; do not divide by zero.', zh: '顯示絕對變動，不可除以零。' } }, { status: 409, code: 'INCOMPATIBLE_FACTS', detail: { en: 'Show the mismatched period, unit or definition.', zh: '顯示不相符期間、單位或定義。' } }],
    },
    {
      kind: 'http', method: 'POST', path: '/api/v1/comparisons', access: 'reader', idempotencyKey: false,
      request: { kind: 'json', example: { companyIds: ['demo-co', 'sample-co'], metricIds: ['operating_cash_flow'], periods: ['2025'] } },
      processing: [
        { en: 'Authorize each company and validate bounded metric and period selections.', zh: '驗證每間公司權限，限制並驗證指標及期間選擇。' },
        { en: 'Load reviewed facts, check compatibility per cell and normalize compatible scales without guessing exchange rates.', zh: '讀取已覆核數據，逐格檢查相容性及統一單位，不猜測匯率。' },
        { en: 'Return a table with sources and blocked cells. Render missing or incompatible values as gaps, not zeros.', zh: '回傳附來源及阻擋欄位的表格；缺失或不相容值顯示空缺，不作零。' },
      ], services: 'React comparison → FastAPI → PostgreSQL → Decimal → Plotly.js',
      result: { kind: 'json', status: 200, example: { rows: [{ companyId: 'demo-co', metric: 'operating_cash_flow', value: '80000000', currency: 'HKD', evidenceId: 'ev-01' }], blockedCells: [{ companyId: 'sample-co', value: null, reason: 'CURRENCY_MISMATCH' }] } },
      errors: [{ status: 422, code: 'INVALID_COMPARISON', detail: { en: 'Choose supported companies, metrics and periods.', zh: '選擇支援公司、指標及期間。' } }, { status: 403, code: 'COMPANY_FORBIDDEN', detail: { en: 'Remove a company outside the user’s access.', zh: '移除使用者權限範圍外公司。' } }],
    },
    {
      kind: 'http', method: 'POST', path: '/api/v1/comparisons/compatibility', access: 'reader', idempotencyKey: false,
      request: { kind: 'json', example: { factIds: ['fact-2025-ocf', 'fact-interim-ocf'], purpose: 'yoy' } },
      processing: [
        { en: 'Resolve the authorized facts and validate the intended comparison type.', zh: '解析獲准數據及驗證比較類型。' },
        { en: 'Check period duration, fiscal alignment, currency, metric definition and restatement lineage.', zh: '檢查期間長度、財政對齊、貨幣、指標定義及重列歷史。' },
        { en: 'Return compatible true or false with blockers. A valid check that finds incompatibility still returns HTTP 200.', zh: '回傳相容與否及阻擋原因；有效檢查發現不相容仍回傳 HTTP 200。' },
      ], services: 'FastAPI → PostgreSQL metadata → Python compatibility rules',
      result: { kind: 'json', status: 200, example: { compatible: false, blockers: [{ code: 'PERIOD_MISMATCH', detail: 'Annual and six-month reporting periods differ.' }] } },
      errors: [{ status: 404, code: 'FACT_NOT_FOUND', detail: { en: 'Choose existing accessible facts.', zh: '選擇可存取的已有數據。' } }, { status: 422, code: 'INVALID_PURPOSE', detail: { en: 'Use a supported comparison type.', zh: '使用支援比較類型。' } }],
    },
  ],
  workspace: [
    {
      kind: 'http', method: 'GET', path: '/api/v1/dashboard', access: 'reader', idempotencyKey: false,
      request: { kind: 'query', example: { companyId: 'demo-co', metricIds: 'operating_cash_flow', periodFrom: '2024', periodTo: '2025' } },
      processing: [
        { en: 'Validate company access, metric IDs and period range from URL query parameters.', zh: '由網址查詢參數驗證公司權限、指標及期間範圍。' },
        { en: 'Load reviewed facts and return separate series for incompatible units or definitions, with evidence IDs.', zh: '讀取已覆核數據；不相容單位或定義分開數列，附證據 ID。' },
        { en: 'React renders the series in Plotly with connectgaps false. Null values stay visible as missing data.', zh: 'React 以 Plotly 繪圖並設 connectgaps false；null 保留為缺失數據。' },
      ], services: 'React filters → FastAPI → PostgreSQL → Plotly.js',
      result: { kind: 'json', status: 200, example: { series: [{ metric: 'operating_cash_flow', currency: 'HKD', scale: '1000000', points: [{ period: '2024', value: null, evidenceId: null }, { period: '2025', value: '80.00', evidenceId: 'ev-01' }] }] } },
      errors: [{ status: 404, code: 'COMPANY_NOT_FOUND', detail: { en: 'Choose a company in the library.', zh: '選擇資料庫內公司。' } }, { status: 422, code: 'INVALID_RANGE', detail: { en: 'Correct the period range.', zh: '修正期間範圍。' } }],
    },
    {
      kind: 'http', method: 'GET', path: '/api/v1/evidence/{evidenceId}/file', access: 'reader', idempotencyKey: false,
      request: { kind: 'query', example: { disposition: 'inline' } },
      processing: [
        { en: 'Resolve evidence metadata and authorize the immutable document version on the server.', zh: '伺服器解析證據資料及驗證不可變文件版本權限。' },
        { en: 'Stream the authorized PDF from object storage with Content-Type application/pdf and Content-Disposition inline.', zh: '由物件儲存串流獲准 PDF，設定 Content-Type application/pdf 及 Content-Disposition inline。' },
        { en: 'The PDF viewer uses viewerPage from the evidence metadata, for example #page=42. A URL fragment is not sent to the server.', zh: 'PDF 檢視器按證據資料的 viewerPage 定位，例如 #page=42；網址片段不會傳送至伺服器。' },
      ], services: 'React PDF viewer → FastAPI authorization → S3 stream',
      result: { kind: 'file', status: 200, contentType: 'application/pdf', description: { en: 'Binary PDF bytes, not JSON. Content-Disposition: inline; filename="report.pdf". Use an authenticated viewer request; opening a new tab does not attach a Bearer header automatically.', zh: '回傳 PDF 二進制內容，不是 JSON。Content-Disposition: inline; filename="report.pdf"。使用已驗證的檢視器請求；開新分頁不會自動附 Bearer 標頭。' } },
      errors: [{ status: 403, code: 'SOURCE_FORBIDDEN', detail: { en: 'Do not expose a public storage URL.', zh: '不可暴露公開儲存網址。' } }, { status: 404, code: 'ORIGINAL_UNAVAILABLE', detail: { en: 'Show that the original could not be loaded.', zh: '顯示原檔未能載入。' } }],
    },
    {
      kind: 'http', method: 'PATCH', path: '/api/v1/briefs/{briefId}', access: 'editor', idempotencyKey: false,
      request: { kind: 'json', example: { expectedRevision: 1, blocks: [{ type: 'paragraph', text: 'Operating cash flow fell 20%.', evidenceIds: ['ev-01', 'ev-02'] }] } },
      processing: [
        { en: 'Create the initial brief through POST /api/v1/briefs. For edits, require ownership and the expected revision.', zh: '先經 POST /api/v1/briefs 建立摘要；編輯時要求擁有權及預期版本。' },
        { en: 'Validate the block schema and citation access; keep the originating run and fact snapshots separate from editable prose.', zh: '驗證內容區塊及引用權限；來源執行及數據快照與可編輯文字分開保留。' },
        { en: 'Save a new revision and return it. Flag changed source facts rather than silently rewriting the user’s notes.', zh: '儲存並回傳新版本；標示來源數據已變更，不默默改寫使用者筆記。' },
      ], services: 'React brief editor → FastAPI / Pydantic → PostgreSQL revisions + provenance',
      result: { kind: 'json', status: 200, example: { briefId: 'brief-01', revision: 2, sourceRunId: 'run-01', evidenceIds: ['ev-01', 'ev-02'], sourceState: 'current' } },
      errors: [{ status: 409, code: 'BRIEF_CONFLICT', detail: { en: 'Reload or merge the newer revision before saving.', zh: '儲存前重新載入或合併新版本。' } }, { status: 422, code: 'INVALID_CITATION', detail: { en: 'Repair inaccessible or missing evidence links.', zh: '修正無權存取或缺失證據連結。' } }],
    },
  ],
  automation: [
    {
      kind: 'http', method: 'POST', path: '/api/v1/research/runs/{runId}/resume', access: 'editor', idempotencyKey: true,
      request: { kind: 'json', example: { checkpointId: 'checkpoint-03', expectedStateVersion: 3, reviewId: 'review-01' } },
      processing: [
        { en: 'Load the persisted run and checkpoint. Verify on the server that this reviewer may resume this run.', zh: '載入持久執行及檢查點；由伺服器驗證覆核者是否可恢復此執行。' },
        { en: 'Validate the stored human review and state version in a transaction. A client-supplied approved flag is insufficient.', zh: '在交易內驗證已儲存人工覆核及狀態版本；客戶端傳 approved 並不足夠。' },
        { en: 'Queue continuation from the checkpoint; the UI polls the existing run until completion, failure or another review pause.', zh: '排程由檢查點繼續；介面輪詢原執行，直至完成、失敗或再度暫停覆核。' },
      ], services: 'React review → FastAPI → PostgreSQL / LangGraph checkpoint → worker',
      result: { kind: 'accepted', status: 202, example: { runId: 'run-01', state: 'queued', statusUrl: '/api/v1/research/runs/run-01' }, poll: '/api/v1/research/runs/run-01', completed: { runId: 'run-01', state: 'completed', answerVersion: 2, evidenceIds: ['ev-01'] }, failed: { runId: 'run-01', state: 'failed', error: { code: 'CONTINUATION_FAILED', retryable: true } } },
      errors: [{ status: 403, code: 'REVIEW_NOT_AUTHORIZED', detail: { en: 'Require a valid stored review by an authorized person.', zh: '要求獲准人員的有效已儲存覆核。' } }, { status: 409, code: 'CHECKPOINT_CHANGED', detail: { en: 'Refresh the state instead of resuming an old checkpoint.', zh: '更新狀態，不可恢復舊檢查點。' } }],
    },
    {
      kind: 'http', method: 'POST', path: '/api/v1/ingestion/events', access: 'service', idempotencyKey: true,
      request: { kind: 'json', example: { eventId: 'event-01', approvedSourceId: 'issuer-demo', documentUrl: 'https://reports.example.invalid/annual.pdf', companyId: 'demo-co', periodEnd: '2025-12-31' } },
      processing: [
        { en: 'n8n sends a service token and stable Idempotency-Key. Validate the event schema and configured source allowlist.', zh: 'n8n 傳送服務權杖及固定 Idempotency-Key；驗證事件結構及來源允許清單。' },
        { en: 'The backend enforces URL, redirect and network restrictions, deduplicates the event and creates a durable ingestion job.', zh: '後端強制網址、重新導向及網絡限制，去重事件及建立持久匯入工作。' },
        { en: 'Return the job ID promptly. The worker downloads and processes; n8n polls status before sending a completion notification.', zh: '迅速回傳工作 ID；背景工作下載及處理，n8n 輪詢狀態後才發送完成通知。' },
      ], services: 'n8n schedule / webhook → FastAPI → PostgreSQL job → download + extraction worker',
      result: jobResult({ jobId: 'job-ingest-01', result: { eventId: 'event-01', documentId: 'doc-01', versionId: 'ver-01' } }),
      errors: [{ status: 401, code: 'INVALID_SERVICE_TOKEN', detail: { en: 'Use the configured service credential, never a token embedded in browser code.', zh: '使用已設定服務憑證，不可把權杖寫入瀏覽器程式。' } }, { status: 403, code: 'SOURCE_NOT_APPROVED', detail: { en: 'Reject a download outside configured source rules.', zh: '拒絕來源規則範圍外下載。' } }],
    },
    {
      kind: 'http', method: 'POST', path: '/api/v1/jobs/{jobId}/retry', access: 'editor', idempotencyKey: true,
      request: { kind: 'json', example: { expectedAttempt: 1 } },
      processing: [
        { en: 'Check job access, a retryable failed state, the expected attempt and the retry limit.', zh: '檢查工作權限、可重試失敗狀態、預期次數及重試上限。' },
        { en: 'Atomically lease the next attempt on the same job and reuse step idempotency keys and checkpoints.', zh: '以原子操作取得同一工作下一次執行權，重用步驟去重鍵及檢查點。' },
        { en: 'Poll the same job. An outbox records notifications; external delivery can still repeat, so consumers deduplicate by event ID.', zh: '輪詢同一工作；寄件匣記錄通知，外部投遞仍可能重複，接收方按事件 ID 去重。' },
      ], services: 'React / n8n → FastAPI → PostgreSQL job lease + outbox → worker',
      result: jobResult({ jobId: 'job-retry-01', result: { attempt: 2, documentId: 'doc-01', duplicateDocumentsCreated: 0 } }),
      errors: [{ status: 409, code: 'JOB_ALREADY_RUNNING', detail: { en: 'Poll the existing attempt instead of starting another.', zh: '輪詢已有執行，不另開一次。' } }, { status: 422, code: 'RETRY_LIMIT_REACHED', detail: { en: 'Require an operator to inspect the failure.', zh: '交由操作人員檢查失敗。' } }],
    },
  ],
  quality: [
    {
      kind: 'http', method: 'POST', path: '/api/internal/evaluation-runs', access: 'operator', idempotencyKey: true,
      request: { kind: 'json', example: { datasetVersion: 'checked-cases-v1', candidateConfig: 'prompt-v2', baselineConfig: 'prompt-v1' } },
      processing: [
        { en: 'Require operator access and a versioned, manually checked dataset with expected facts and citations.', zh: '要求操作人員權限及有版本、人工核對的預期數據與引用測試集。' },
        { en: 'Run baseline and candidate under recorded configurations. Score arithmetic, citation validity, support and abstention separately.', zh: '按已記錄設定執行基線及候選；分別評估算術、引用有效性、支持度及拒答。' },
        { en: 'Persist case-level failures and the release gate. Poll for completion; do not infer quality from one aggregate score.', zh: '儲存逐案失敗及發佈門檻；輪詢至完成，不以單一總分推斷品質。' },
      ], services: 'Operator / CI → FastAPI → evaluation worker / pytest → PostgreSQL + Langfuse',
      result: { kind: 'accepted', status: 202, example: { evaluationRunId: 'eval-01', state: 'queued', statusUrl: '/api/internal/evaluation-runs/eval-01' }, poll: '/api/internal/evaluation-runs/eval-01', completed: { evaluationRunId: 'eval-01', state: 'completed', releaseGate: 'blocked', criticalFailureIds: ['case-wrong-year'] }, failed: { evaluationRunId: 'eval-01', state: 'failed', error: { code: 'DATASET_UNAVAILABLE', retryable: false } } },
      errors: [{ status: 403, code: 'OPERATOR_REQUIRED', detail: { en: 'Keep evaluation controls outside the public user surface.', zh: '評估控制不可放在公開使用者介面。' } }, { status: 422, code: 'INVALID_DATASET', detail: { en: 'Select a checked dataset and known configurations.', zh: '選擇已核對測試集及已知設定。' } }],
    },
    {
      kind: 'http', method: 'GET', path: '/api/internal/traces/{traceId}', access: 'operator', idempotencyKey: false, request: { kind: 'none' },
      processing: [
        { en: 'Require operator access and scope the trace to the permitted environment and run.', zh: '要求操作人員權限，限定可存取環境及執行。' },
        { en: 'Read redacted spans, model and prompt versions, timings and usage. Never return service credentials or raw private reports.', zh: '讀取已遮蔽追蹤、模型與提示版本、時間及用量；不可回傳服務憑證或私人原報。' },
        { en: 'Compute cost only when usage and a recorded pricing version are available; otherwise show unknown rather than zero.', zh: '僅在有用量及已記錄價格版本時計算成本，否則顯示未知而非零。' },
      ], services: 'Operator UI → FastAPI → Langfuse / OpenTelemetry + usage ledger',
      result: { kind: 'json', status: 200, example: { traceId: 'trace-01', runId: 'run-01', promptVersion: 'prompt-v2', model: 'configured-model', spans: [{ name: 'retrieval', durationMs: 120 }], usage: { inputTokens: 1200, outputTokens: 180 }, totalCost: null, costState: 'pricing_unavailable' } },
      errors: [{ status: 403, code: 'OPERATOR_REQUIRED', detail: { en: 'Do not expose traces through a public endpoint.', zh: '不可經公開端點暴露追蹤。' } }, { status: 404, code: 'TRACE_NOT_FOUND', detail: { en: 'Show trace retention or missing-run information.', zh: '顯示追蹤保留期或執行缺失資料。' } }],
    },
    {
      kind: 'pipeline', trigger: 'GitHub Actions · workflow_dispatch',
      input: { proposedWorkflow: '.github/workflows/deploy.yml', environment: 'staging', imageTag: 'sha-EXAMPLE' },
      processing: [
        { en: 'A permitted maintainer triggers CI. Run type checks, tests and the evaluation release gate against the selected commit.', zh: '獲准維護者觸發 CI，針對所選提交執行類型檢查、測試及評估發佈門檻。' },
        { en: 'Build and tag an immutable Docker image; inject environment secrets through deployment configuration.', zh: '建立並標記不可變 Docker 映像，經部署設定注入環境機密。' },
        { en: 'Deploy to staging, check readiness and smoke-test a cited demo. Retain the prior image for rollback.', zh: '部署測試環境、檢查就緒狀態及附引用示範，保留上一映像以便回滾。' },
      ], services: 'GitHub Actions → pytest / evaluation gate → Docker registry → AWS → health checks',
      output: { deploymentId: 'deploy-01', environment: 'staging', imageTag: 'sha-EXAMPLE', state: 'healthy', previousImageTag: 'sha-PREVIOUS' },
      failure: { en: 'Stop on a failed test or evaluation gate. If readiness fails after deployment, restore the previous image. This is a proposed operator pipeline, not a public deployment API or an existing workflow file.', zh: '測試或評估門檻失敗即停止；部署後就緒檢查失敗則恢復上一映像。這是建議的操作流程，並非公開部署 API，亦非已存在的工作流程檔案。' },
    },
  ],
} satisfies Record<keyof typeof financeFunctionWorkflows, [FinanceApiWorkflow, FinanceApiWorkflow, FinanceApiWorkflow]>;
