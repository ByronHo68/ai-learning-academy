import type { Copy } from './curriculum';
import type { financeFunctionWorkflows } from './finance-function-workflows';

export type MapStep = { id: string; keyword: string; action: Copy; tools: string };
export type MapOutcomes =
  | { kind: 'binary'; success: Copy; failure: Copy }
  | { kind: 'partial'; success: Copy; partial: Copy; failure: Copy };
export type FinanceFunctionMap =
  | { kind: 'request'; entry: 'browser' | 'n8n' | 'operator'; steps: [MapStep, ...MapStep[]]; validation: Copy; outcomes: MapOutcomes; aiUse: Copy }
  | { kind: 'pipeline'; steps: [MapStep, ...MapStep[]]; validation: Copy; outcomes: MapOutcomes; aiUse: Copy };

// Function-specific processing only. The renderer supplies the transport/API path
// and derives asynchronous acceptance and polling from the API contract catalog.
export const financeFunctionMaps = {
  library: [
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'pdf', keyword: 'PDF CHECK', action: { en: 'Check file signature, upload limit and confirmed company metadata.', zh: '檢查檔案特徵、上載限制及已確認公司標籤。' }, tools: 'Pydantic · PDF signature checks' },
        { id: 'hash', keyword: 'CONTENT HASH', action: { en: 'Hash the bytes and find any existing document in the same access scope.', zh: '計算檔案雜湊，尋找相同存取範圍內的已有文件。' }, tools: 'Python hashlib · PostgreSQL unique key' },
        { id: 'store', keyword: 'ORIGINAL + RECORD', action: { en: 'Preserve the original object and create or reuse its immutable version record.', zh: '保留原始物件，建立或重用不可變版本記錄。' }, tools: 'S3 · PostgreSQL transaction' },
        { id: 'queue', keyword: 'EXTRACTION JOB', action: { en: 'Persist an extraction job, enqueue it and expose the job ID for status checks.', zh: '持久儲存擷取工作、加入佇列，並提供工作 ID 查詢狀態。' }, tools: 'PostgreSQL job ledger · Celery · Redis' },
        { id: 'worker', keyword: 'CANDIDATES READY', action: { en: 'The worker extracts source-linked candidates and records completion with review still required.', zh: '背景工作擷取附來源候選數據，記錄處理完成，但仍需覆核。' }, tools: 'Celery · pdfplumber · PostgreSQL candidate + job records' },
      ],
      validation: { en: 'The original is recoverable, extraction produced source-linked review candidates and the same logical job records completion. Processing completion is not human approval.', zh: '原檔可恢復、擷取已產生附來源覆核候選，而且同一邏輯工作已記錄完成；處理完成不等於人工接納。' },
      outcomes: { kind: 'binary', success: { en: 'After polling reports completion, show the stored document and candidates marked review required. Repeated uploads reuse the existing identity.', zh: '輪詢顯示完成後，顯示已儲存文件及標示仍需覆核的候選數據；重複上載重用原有識別。' }, failure: { en: 'Show the file, storage or job error with a request ID; retain recoverable state and permit only safe retries.', zh: '顯示檔案、儲存或工作錯誤及請求 ID；保留可恢復狀態，只容許安全重試。' } },
      aiUse: { en: 'Uploading uses file validation and storage. Embeddings and answer-generation LLMs are not called by the upload request.', zh: '上載使用檔案驗證及儲存；上載請求不呼叫嵌入模型或答案生成 LLM。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'metadata', keyword: 'METADATA SCHEMA', action: { en: 'Parse company identity, fiscal dates, report type and source URL.', zh: '解析公司身分、財政日期、報告類型及來源網址。' }, tools: 'Pydantic metadata schema' },
        { id: 'revision', keyword: 'REVISION CHECK', action: { en: 'Compare expectedRevision with the stored revision under edit authorization.', zh: '核對編輯權限，並比較 expectedRevision 與已儲存版本。' }, tools: 'PostgreSQL row version · transaction' },
        { id: 'save', keyword: 'SAVE LABELS', action: { en: 'Save confirmed labels with their previous values in the audit history.', zh: '儲存已確認標籤，在稽核歷史保留舊值。' }, tools: 'PostgreSQL metadata + audit tables' },
        { id: 'filters', keyword: 'SCOPED FILTERS', action: { en: 'Return the new revision for the library and subsequent company/period filters.', zh: '把新版本回傳資料庫畫面，供之後按公司及期間篩選。' }, tools: 'Typed response · React library state' },
      ],
      validation: { en: 'Date order, report type and company are valid, and the expected revision still matches.', zh: '日期次序、報告類型及公司有效，而且預期版本仍相符。' },
      outcomes: { kind: 'binary', success: { en: 'Refresh the report labels and display the saved revision.', zh: '更新報告標籤並顯示已儲存版本。' }, failure: { en: 'Keep the edit draft and show invalid fields or a revision conflict; reload before overwriting anything.', zh: '保留編輯草稿，顯示無效欄位或版本衝突；覆寫前先重新載入。' } },
      aiUse: { en: 'Metadata editing is a schema and database operation. No vector search, RAG or LLM call is needed.', zh: '標籤編輯是結構驗證及資料庫操作，毋須向量檢索、RAG 或 LLM。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'compare', keyword: 'REVISION HASH', action: { en: 'Check the replacement PDF and the version it claims to supersede.', zh: '檢查修訂 PDF 及其聲稱取代的版本。' }, tools: 'Python hashlib · document scope rules' },
        { id: 'append', keyword: 'APPEND VERSION', action: { en: 'Store a separate original object and link the new version to its predecessor.', zh: '另存原始物件，把新版本連結前一版本。' }, tools: 'S3 immutable objects · PostgreSQL' },
        { id: 'extract', keyword: 'EXTRACT + INDEX', action: { en: 'Extract new passages and produce version-labelled embeddings in the background.', zh: '在背景擷取新段落，產生附版本標籤的嵌入。' }, tools: 'Celery · pdfplumber · embedding API · pgvector' },
        { id: 'dependencies', keyword: 'DEPENDENT RESULTS', action: { en: 'Flag dependent facts and briefs for review while preserving old citation targets.', zh: '標示相關數據及摘要需覆核，同時保留舊引用目標。' }, tools: 'PostgreSQL lineage · dependency records' },
      ],
      validation: { en: 'The new version is extracted and separately indexed with candidates ready for review; its lineage is valid and both old and new originals remain addressable.', zh: '新版本已擷取並獨立建立索引，候選數據可供覆核；版本關係有效，而且新舊原檔均可定位。' },
      outcomes: { kind: 'binary', success: { en: 'After polling reports completion, show the linked, indexed revision and its review-required candidates. Historical citations keep their original targets.', zh: '輪詢顯示完成後，顯示已連結、已索引修訂及仍需覆核候選；歷史引用保留原有目標。' }, failure: { en: 'Show the conflict or failed indexing state. Keep the earlier searchable version and never overwrite its original.', zh: '顯示衝突或索引失敗狀態，保留舊版檢索能力，永不覆寫原檔。' } },
      aiUse: { en: 'Indexing may call an embedding model. Version storage does not require a chat LLM or generated research answer.', zh: '建立索引可呼叫嵌入模型；版本儲存毋須聊天 LLM 或生成研究答案。' },
    },
  ],
  extraction: [
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'original', keyword: 'LOAD ORIGINAL', action: { en: 'Resolve the authorized immutable PDF version and inspect its text layer.', zh: '解析獲准不可變 PDF 版本，檢查文字層。' }, tools: 'S3 adapter · PDF page inspection' },
        { id: 'parse', keyword: 'PDF PARSER', action: { en: 'Extract paragraphs, table regions, headings and notes without dropping year or unit labels.', zh: '擷取段落、表格區域、標題及附註，保留年份與單位標籤。' }, tools: 'pdfplumber · PyMuPDF if selected' },
        { id: 'candidates', keyword: 'CANDIDATE FACTS', action: { en: 'Save candidate rows with sign, scale, currency, period and evidence coordinates.', zh: '儲存候選列的正負號、單位、貨幣、期間及證據座標。' }, tools: 'Pydantic · PostgreSQL' },
        { id: 'vectors', keyword: 'PASSAGE INDEX', action: { en: 'Embed source-linked text passages and store their vectors separately from accepted numerical facts.', zh: '為附來源文字段落產生嵌入，把向量與已接納數值分開儲存。' }, tools: 'Embedding API · pgvector · PostgreSQL' },
        { id: 'review', keyword: 'REVIEW QUEUE', action: { en: 'Expose uncertain candidates for human checking against the original.', zh: '把不確定候選交予人工對照原文覆核。' }, tools: 'Review state · React review UI' },
      ],
      validation: { en: 'Extraction has readable content and valid provenance. Completion means candidates were produced, not that all values are verified.', zh: '擷取有可讀內容及有效來源；完成只代表已產生候選，不代表所有數值已驗證。' },
      outcomes: { kind: 'partial', success: { en: 'Show indexed passages and the candidate review queue.', zh: '顯示已索引段落及候選覆核佇列。' }, partial: { en: 'Keep readable pages and flag unreadable or uncertain pages for manual review or a separately scoped OCR workflow.', zh: '保留可讀頁，標示無法讀取或不確定頁面，交人工覆核或另行規劃 OCR。' }, failure: { en: 'Show parser or storage failure and retain the original for a bounded retry; empty extraction is not a verified report.', zh: '顯示解析或儲存失敗，保留原檔供有限重試；空擷取不等於已驗證報告。' } },
      aiUse: { en: 'An embedding model indexes passages. Parsing and candidate review do not need a chat-completion LLM.', zh: '嵌入模型為段落建立索引；解析及候選覆核毋須聊天生成 LLM。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'evidence', keyword: 'EVIDENCE LOOKUP', action: { en: 'Resolve the requested evidence ID within accessible report versions.', zh: '在可存取報告版本內解析指定證據 ID。' }, tools: 'PostgreSQL evidence lookup' },
        { id: 'location', keyword: 'PAGE + REGION', action: { en: 'Read the PDF page index, printed page label, table ID and bounding box.', zh: '讀取 PDF 頁索引、印刷頁碼、表格 ID 及範圍座標。' }, tools: 'Evidence schema · immutable version record' },
        { id: 'links', keyword: 'SOURCE TARGET', action: { en: 'Return the exact version and viewer page so citations can open the intended source.', zh: '回傳確切版本及檢視器頁碼，讓引用開啟指定來源。' }, tools: 'Typed metadata response · React citation link' },
      ],
      validation: { en: 'The evidence exists, access is allowed and its page/region belongs to the recorded immutable version.', zh: '證據存在、獲准存取，而且頁面及區域屬於記錄的不可變版本。' },
      outcomes: { kind: 'binary', success: { en: 'Display the source reference and correct PDF viewer target, with the printed page label shown separately.', zh: '顯示來源參照及正確 PDF 檢視目標，另行標示印刷頁碼。' }, failure: { en: 'Return missing-source or denied-access information. Block the affected claim instead of inventing another page.', zh: '回傳來源缺失或拒絕權限，阻止相關主張，不編造其他頁面。' } },
      aiUse: { en: 'Evidence resolution reads saved provenance. It does not search vectors or call an LLM.', zh: '證據定位讀取已儲存來源資料，不檢索向量或呼叫 LLM。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'candidate', keyword: 'LOAD CANDIDATE', action: { en: 'Load the candidate, uncertainty reason and original PDF evidence for the reviewer.', zh: '為覆核者載入候選數據、不確定原因及 PDF 原文證據。' }, tools: 'PostgreSQL · PDF.js review screen' },
        { id: 'decision', keyword: 'HUMAN DECISION', action: { en: 'Receive confirm, correct or reject with a reason and expected revision.', zh: '接收確認、更正或拒絕決定，附原因及預期版本。' }, tools: 'React review form · Pydantic' },
        { id: 'transaction', keyword: 'REVIEW TRANSACTION', action: { en: 'Check the current candidate revision and append the review event and accepted fact atomically.', zh: '核對目前候選版本，以原子交易新增覆核事件及已接納數據。' }, tools: 'PostgreSQL transaction · audit log' },
        { id: 'availability', keyword: 'VERIFIED FACTS', action: { en: 'Make accepted facts available for calculations while rejected candidates remain excluded.', zh: '讓已接納數據可用於計算，已拒絕候選繼續排除。' }, tools: 'Fact review state · typed response' },
      ],
      validation: { en: 'The reviewer is authorized, the decision and evidence are valid, and expectedRevision still matches.', zh: '覆核者獲准、決定及證據有效，而且 expectedRevision 仍相符。' },
      outcomes: { kind: 'binary', success: { en: 'Show the recorded review and accepted or rejected state, with the earlier history retained.', zh: '顯示已記錄覆核及接納或拒絕狀態，保留舊歷史。' }, failure: { en: 'Show stale-review or invalid-value feedback; keep unresolved candidates out of verified calculations.', zh: '顯示過期覆核或無效數值提示，未解決候選不進入已驗證計算。' } },
      aiUse: { en: 'A trusted person makes the review decision. A model-generated approval cannot authorize this action.', zh: '由可信人員作覆核決定；模型產生的批准不能授權此操作。' },
    },
  ],
  facts: [
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'scope', keyword: 'METRIC SCOPE', action: { en: 'Parse requested metric IDs, company, reporting period and document version.', zh: '解析指定指標 ID、公司、報告期間及文件版本。' }, tools: 'Pydantic query schema · metric dictionary' },
        { id: 'query', keyword: 'ACCEPTED FACTS', action: { en: 'Fetch only accepted, source-linked facts for the confirmed company and version.', zh: '只讀取已確認公司及版本中已接納、附來源數據。' }, tools: 'PostgreSQL scoped SQL query' },
        { id: 'shape', keyword: 'FIVE METRICS', action: { en: 'Return available revenue, profit, cash-flow, asset and liability records with explicit missing metric IDs.', zh: '回傳已有收入、盈利、現金流、資產及負債記錄，明確列出缺失指標 ID。' }, tools: 'Typed fact response · decimal strings' },
      ],
      validation: { en: 'Metric identifiers and scope are valid, and every returned amount retains its definition, units and evidence.', zh: '指標識別及範圍有效，每項回傳金額均保留定義、單位及證據。' },
      outcomes: { kind: 'partial', success: { en: 'Render the five available reviewed metric series with their evidence links.', zh: '顯示五項已有且已覆核的指標數列及證據連結。' }, partial: { en: 'Render available metrics and label missing metrics explicitly; absence is not zero.', zh: '顯示已有指標並明確標示缺失指標，缺失不是零。' }, failure: { en: 'Show unknown-metric, inaccessible-company or query failure; do not substitute a differently defined metric.', zh: '顯示未知指標、公司無法存取或查詢失敗，不以不同定義指標代替。' } },
      aiUse: { en: 'This endpoint reads reviewed SQL facts. An LLM does not invent missing metrics or generate their values.', zh: '此端點讀取已覆核 SQL 數據；LLM 不編造缺失指標或產生數值。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'facts', keyword: 'SOURCE UNITS', action: { en: 'Resolve authorized facts with their original amount, currency, scale and fiscal dates.', zh: '解析獲准數據及原始金額、貨幣、單位與財政日期。' }, tools: 'PostgreSQL fact metadata' },
        { id: 'context', keyword: 'PERIOD TYPE', action: { en: 'Preserve duration periods separately from balance-sheet dates and require known scales.', zh: '分開保留期間數據與資產負債表日期，要求單位已確認。' }, tools: 'Pydantic period schema · compatibility rules' },
        { id: 'normalize', keyword: 'DECIMAL SCALE', action: { en: 'Calculate the base-unit amount with Decimal while preserving the original value.', zh: '用 Decimal 計算基本單位金額，同時保留原值。' }, tools: 'Python Decimal' },
        { id: 'return', keyword: 'LABELLED VALUES', action: { en: 'Return both original and normalized values with currency, period and evidence.', zh: '回傳原始及標準化數值，附貨幣、期間及證據。' }, tools: 'Typed API response · React unit labels' },
      ],
      validation: { en: 'Currency, scale and period are known. Normalization changes scale only and never guesses an exchange rate.', zh: '貨幣、單位及期間已知；標準化只改單位，永不猜測匯率。' },
      outcomes: { kind: 'binary', success: { en: 'Show the normalized amount alongside its original presentation and fiscal context.', zh: '並列顯示標準化金額、原報格式及財政背景。' }, failure: { en: 'Show the unknown unit or incompatible currency and request correction before comparing values.', zh: '顯示未知單位或不相容貨幣，比較數值前要求更正。' } },
      aiUse: { en: 'Normalization uses metadata and Decimal arithmetic, not generated numbers or a language model.', zh: '標準化使用標籤及 Decimal 運算，不使用生成數字或語言模型。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'cause', keyword: 'REVISION REASON', action: { en: 'Distinguish an extraction correction from an issuer restatement and attach its source note.', zh: '分清擷取更正與發行人重列，附上來源說明。' }, tools: 'Revision schema · review form' },
        { id: 'conflict', keyword: 'EXPECTED VERSION', action: { en: 'Check the existing fact revision and authority to revise it.', zh: '核對已有數據版本及修訂權限。' }, tools: 'PostgreSQL revision check' },
        { id: 'append', keyword: 'APPEND FACT', action: { en: 'Append the new fact, supersedes link and audit event without deleting the earlier value.', zh: '新增數據、取代關係及稽核事件，不刪除舊值。' }, tools: 'PostgreSQL transaction · immutable fact history' },
        { id: 'stale', keyword: 'STALE RESULTS', action: { en: 'Find affected calculations and briefs and mark their saved snapshots as needing review.', zh: '尋找受影響計算及摘要，把已存快照標示需覆核。' }, tools: 'Dependency graph · React stale-state warning' },
      ],
      validation: { en: 'The revision reason and evidence are valid and the expected fact version is still current.', zh: '修訂原因及證據有效，預期數據版本仍是目前版本。' },
      outcomes: { kind: 'binary', success: { en: 'Show the new fact and its history, with affected earlier results clearly marked stale.', zh: '顯示新數據及歷史，清楚標示受影響舊結果已過期。' }, failure: { en: 'Show a conflict or evidence requirement and keep existing facts and briefs unchanged.', zh: '顯示衝突或所需證據，保留原有數據及摘要。' } },
      aiUse: { en: 'Revision lineage and invalidation are database operations. RAG and the LLM run only if the user starts a new research analysis.', zh: '版本關係及失效標記屬資料庫操作；只有使用者另開研究分析才執行 RAG 及 LLM。' },
    },
  ],
  research: [
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'agent', keyword: 'LANGGRAPH AGENT', action: { en: 'Create scoped state for the question, company, periods, report versions and answer language.', zh: '為問題、公司、期間、報告版本及答案語言建立限定狀態。' }, tools: 'LangGraph state · PostgreSQL checkpointer' },
        { id: 'embed', keyword: 'EMBEDDING', action: { en: 'Embed the scoped question while preserving the original financial terminology.', zh: '為限定範圍問題產生嵌入，保留原始財務用語。' }, tools: 'Configured embedding API' },
        { id: 'vectors', keyword: 'VECTOR DB', action: { en: 'Search passages using company, period, version and access filters before returning evidence.', zh: '檢索段落，回傳證據前按公司、期間、版本及權限篩選。' }, tools: 'PostgreSQL · pgvector · keyword ranking' },
        { id: 'context', keyword: 'RAG CONTEXT', action: { en: 'Build a bounded evidence bundle and calculate requested financial changes with code.', zh: '建立範圍受限證據組，用程式計算所需財務變動。' }, tools: 'Evidence builder · Python Decimal tools' },
        { id: 'model-router', keyword: 'MODEL ROUTER', action: { en: 'Classify the task and select an eligible, approved model within the owner’s budget. Use Sol or an evaluated alternative for routine cited analysis; consider Astra or DeepSeek V4 Pro for difficult reconciliation. Missing evidence pauses the answer instead of escalating.', zh: '分類任務，在擁有者預算內選擇合資格獲准模型。一般附引用分析可用 Sol 或已評估替代模型；複雜對賬可考慮 Astra 或 DeepSeek V4 Pro。缺少證據時暫停回答，不靠升級補出資料。' }, tools: 'llm/router.py · registry.py · config/models.yaml' },
        { id: 'llm', keyword: 'LLM API', action: { en: 'Draft structured claims in the selected language using only evidence and calculated results.', zh: '只根據證據及計算結果，以所選語言草擬結構化主張。' }, tools: 'Configured chat LLM · structured output schema' },
        { id: 'verify', keyword: 'CLAIM CHECK', action: { en: 'Resolve citations, recalculate figures and check support before selecting the answer branch.', zh: '選擇答案分支前，解析引用、重算數字及核對支持度。' }, tools: 'LangGraph verification · deterministic rules · fallible model check' },
      ],
      validation: { en: 'Claims use the requested company/year/version, calculations match reviewed facts and citations support the wording.', zh: '主張使用指定公司、年份及版本，計算符合已覆核數據，而且引用支持措辭。' },
      outcomes: { kind: 'partial', success: { en: 'Return the supported bilingual answer, formula and claim-level PDF citations to the user.', zh: '向使用者回傳有支持雙語答案、公式及逐項 PDF 引用。' }, partial: { en: 'Return supported figures and citations, then state that a cause or another requested point lacks evidence.', zh: '回傳有支持數字及引用，再說明原因或其他指定內容缺乏證據。' }, failure: { en: 'Return scope, provider or verification failure with a request/run ID. Never display an unverified draft as a completed answer.', zh: '回傳範圍、供應商或驗證失敗及請求／執行 ID，不把未驗證草稿當成完成答案。' } },
      aiUse: { en: 'This is the full RAG and agent path. The embedding model retrieves context; the chat LLM explains it; independent rules and review check the output.', zh: '這是完整 RAG 及 Agent 路徑：嵌入模型協助檢索、聊天 LLM 解釋內容，再由獨立規則及覆核檢查輸出。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'query', keyword: 'SEARCH SCOPE', action: { en: 'Validate the query, authorized report versions and bounded topK.', zh: '驗證查詢、獲准報告版本及有上限的 topK。' }, tools: 'Pydantic search schema · access rules' },
        { id: 'embedding', keyword: 'QUERY EMBEDDING', action: { en: 'Transform the question into a search vector.', zh: '把問題轉成搜尋向量。' }, tools: 'Embedding API' },
        { id: 'vector', keyword: 'VECTOR DB', action: { en: 'Combine filtered vector matches with keyword matches and rank the permitted passages.', zh: '結合已篩選向量及關鍵詞匹配，排序獲准段落。' }, tools: 'pgvector · PostgreSQL full-text search' },
        { id: 'bundle', keyword: 'EVIDENCE BUNDLE', action: { en: 'Return passage text, evidence IDs, report versions and page references for downstream RAG.', zh: '回傳段落原文、證據 ID、報告版本及頁面參照，供之後 RAG 使用。' }, tools: 'Retrieval response schema · LangGraph retrieval tool' },
      ],
      validation: { en: 'Every hit is authorized, belongs to the selected versions and retains a resolvable source reference.', zh: '每項結果均獲准、屬於選定版本，而且來源參照可解析。' },
      outcomes: { kind: 'partial', success: { en: 'Show a ranked evidence bundle from the selected reports.', zh: '顯示來自選定報告、已排序的證據組。' }, partial: { en: 'Return an empty or weak evidence result explicitly. Ask the user to change scope rather than silently searching another company.', zh: '明確回傳空白或不足證據結果，要求使用者調整範圍，不暗中搜尋另一公司。' }, failure: { en: 'Show access, embedding-provider or search failure and preserve the search query for a safe retry.', zh: '顯示權限、嵌入供應商或搜尋失敗，保留查詢供安全重試。' } },
      aiUse: { en: 'Retrieval calls an embedding model. It returns evidence without calling a chat LLM to generate an answer.', zh: '檢索呼叫嵌入模型，只回傳證據，不呼叫聊天 LLM 生成答案。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'snapshot', keyword: 'ANSWER SNAPSHOT', action: { en: 'Load the stored answer version, claims, evidence bundle and calculation inputs.', zh: '載入已儲存答案版本、主張、證據組及計算輸入。' }, tools: 'PostgreSQL run snapshot' },
        { id: 'resolve', keyword: 'CITATION LOOKUP', action: { en: 'Resolve each cited evidence ID to its exact report version and passage.', zh: '把每項引用證據 ID 解析至確切報告版本及段落。' }, tools: 'Evidence service · source records' },
        { id: 'arithmetic', keyword: 'FIGURE CHECK', action: { en: 'Recalculate numeric claims and verify period, unit and reporting basis.', zh: '重算數值主張，驗證期間、單位及報表口徑。' }, tools: 'Python Decimal · deterministic checks' },
        { id: 'support', keyword: 'SUPPORT CHECK', action: { en: 'Check whether the passages support the wording; flag uncertain model judgments for human review.', zh: '核對段落是否支持措辭，模型判斷不確定時標示需人工覆核。' }, tools: 'LangGraph verification · optional LLM support check · reviewer' },
        { id: 'policy', keyword: 'ANSWER POLICY', action: { en: 'Keep supported claims and remove or qualify unsupported explanations.', zh: '保留有支持主張，移除或限制無支持解釋。' }, tools: 'Conditional routing · structured answer policy' },
      ],
      validation: { en: 'The answer version is current, citation targets resolve, arithmetic matches and retained claims have evidence support.', zh: '答案版本正確、引用可解析、算術相符，而且保留主張有證據支持。' },
      outcomes: { kind: 'partial', success: { en: 'Return verified claims with original citations and their verification record.', zh: '回傳已核對主張、原始引用及核對記錄。' }, partial: { en: 'Return only supported claims with a list of removed claims and missing evidence; request review where needed.', zh: '只回傳有支持主張，列出已移除主張及缺失證據，需要時要求覆核。' }, failure: { en: 'Block an obsolete answer version or unusable evidence snapshot and show the error to the user.', zh: '阻止過期答案版本或不可用證據快照，向使用者顯示錯誤。' } },
      aiUse: { en: 'A support-check LLM can assist, but it is fallible. Citation existence, financial arithmetic and human review remain separate checks.', zh: '支持度檢查 LLM 可協助，但可能出錯；引用存在、財務算術及人工覆核仍分開檢查。' },
    },
  ],
  comparison: [
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'inputs', keyword: 'INPUT FACT IDS', action: { en: 'Load the explicit current and prior reviewed fact versions.', zh: '讀取明確指定本期及上期已覆核數據版本。' }, tools: 'PostgreSQL accepted facts' },
        { id: 'compatibility', keyword: 'LIKE-FOR-LIKE', action: { en: 'Check metric, annual periods, currency, scale and reporting basis.', zh: '核對指標、年度期間、貨幣、單位及報表口徑。' }, tools: 'Compatibility rules · Pydantic' },
        { id: 'decimal', keyword: 'DECIMAL CALC', action: { en: 'Calculate absolute movement and the permitted percentage using unrounded decimal inputs.', zh: '使用未捨入十進制輸入，計算絕對變動及容許百分比。' }, tools: 'Python Decimal' },
        { id: 'formula', keyword: 'FORMULA + SOURCE', action: { en: 'Return the inputs, formula, rounding policy and evidence references.', zh: '回傳輸入、公式、捨入規則及證據參照。' }, tools: 'Typed calculation response · React' },
      ],
      validation: { en: 'Inputs are reviewed and compatible. A zero base blocks a percentage; a negative base needs an explicit interpretation policy.', zh: '輸入已覆核且相容；零基數阻止百分比，負基數需明確解讀政策。' },
      outcomes: { kind: 'binary', success: { en: 'Show a reproducible change, its formula and the exact input citations.', zh: '顯示可重現變動、公式及確切輸入引用。' }, failure: { en: 'Show a zero-base, negative-base-policy, missing-fact or compatibility issue; do not invent a growth result.', zh: '顯示零基數、負基數政策、數據缺失或相容問題，不編造增長結果。' } },
      aiUse: { en: 'This calculation uses Decimal and reviewed facts. An LLM may later explain the returned result, but does not compute it here.', zh: '此計算使用 Decimal 及已覆核數據；LLM 可在之後解釋結果，但不在此處計算。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'selection', keyword: 'COMPANY SCOPE', action: { en: 'Resolve selected companies, metrics and comparable fiscal periods.', zh: '解析所選公司、指標及可比較財政期間。' }, tools: 'Pydantic comparison schema' },
        { id: 'records', keyword: 'REVIEWED RECORDS', action: { en: 'Read accepted fact versions with their currency, definitions and reporting basis.', zh: '讀取已接納數據版本、貨幣、定義及報表口徑。' }, tools: 'PostgreSQL scoped query' },
        { id: 'alignment', keyword: 'ALIGNED DATASET', action: { en: 'Normalize confirmed scales and leave missing or incompatible cells explicitly blocked.', zh: '統一已確認單位，明確保留缺失或不相容欄位。' }, tools: 'Python Decimal · pandas · compatibility rules' },
        { id: 'table', keyword: 'TABLE + CHART', action: { en: 'Return labelled rows and evidence links for the side-by-side table and chart.', zh: '回傳附標籤資料列及證據連結，供並排表格及圖表使用。' }, tools: 'Typed dataset · React · Plotly.js' },
      ],
      validation: { en: 'Every displayed cell is reviewed, compatible and source-linked. Blocked cells retain a named reason.', zh: '每個顯示欄位均已覆核、相容並附來源，被阻止欄位保留具名原因。' },
      outcomes: { kind: 'partial', success: { en: 'Render a comparable table and chart where each amount opens its source.', zh: '顯示可比較表格及圖表，每項金額可開啟來源。' }, partial: { en: 'Render compatible cells and explicit gaps with currency, period or missing-data warnings.', zh: '顯示相容欄位及明確空缺，附貨幣、期間或缺失數據提示。' }, failure: { en: 'Show an invalid selection, denied company or query failure and keep the prior view clearly labelled as old.', zh: '顯示無效選擇、公司權限拒絕或查詢失敗，並清楚標示舊畫面。' } },
      aiUse: { en: 'Comparison is SQL retrieval and deterministic alignment. Vector search and chat generation are not needed.', zh: '比較使用 SQL 讀取及確定性對齊，毋須向量搜尋及聊天生成。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'metadata', keyword: 'FACT CONTEXT', action: { en: 'Load period type, fiscal dates, definition, currency, scale, basis and revision lineage.', zh: '載入期間類型、財政日期、定義、貨幣、單位、口徑及版本關係。' }, tools: 'PostgreSQL fact schema' },
        { id: 'rules', keyword: 'COMPATIBILITY RULES', action: { en: 'Evaluate explicit rules for the requested comparison purpose.', zh: '按指定比較目的執行明確相容規則。' }, tools: 'Pure Python rule functions' },
        { id: 'scales', keyword: 'CONFIRMED SCALE', action: { en: 'Identify safe scale normalization and preserve the original presentations.', zh: '識別安全單位標準化，保留原報格式。' }, tools: 'Python Decimal · normalization plan' },
        { id: 'decision', keyword: 'ALLOW OR BLOCK', action: { en: 'Produce compatible true/false with named blockers and a user correction suggestion.', zh: '產生相容與否、具名阻擋原因及使用者修正建議。' }, tools: 'Typed decision response · React validation message' },
      ],
      validation: { en: 'Fact IDs resolve and the rules produce a documented decision. compatible:false is a valid check result, not an execution error.', zh: '數據 ID 可解析，規則可產生有記錄決定；compatible:false 是有效檢查結果，不是執行錯誤。' },
      outcomes: { kind: 'binary', success: { en: 'Return the compatibility decision. If false, show blockers and prevent the requested calculation while retaining HTTP 200 for the completed check.', zh: '回傳相容決定；如不相容，顯示阻擋原因並阻止計算，但完成的檢查仍為 HTTP 200。' }, failure: { en: 'Show unknown facts, invalid purpose or a failed check request; never approve unknown metadata.', zh: '顯示未知數據、無效目的或檢查請求失敗，未知標籤不可獲准。' } },
      aiUse: { en: 'Compatibility uses explicit rules. The language model cannot override a period, unit or definition blocker.', zh: '相容性使用明確規則，語言模型不能推翻期間、單位或定義阻擋。' },
    },
  ],
  workspace: [
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'filters', keyword: 'DASHBOARD FILTERS', action: { en: 'Parse company, metric IDs and the requested period range.', zh: '解析公司、指標 ID 及指定期間範圍。' }, tools: 'Pydantic query schema' },
        { id: 'series', keyword: 'SOURCE-LINKED SERIES', action: { en: 'Load accepted version-labelled facts and keep incompatible series separate.', zh: '載入已接納且附版本數據，把不相容數列分開。' }, tools: 'PostgreSQL · typed chart schema' },
        { id: 'gaps', keyword: 'VISIBLE GAPS', action: { en: 'Keep missing values null, preserve units and attach evidence to each available point.', zh: '缺失值保持 null，保留單位，為每個已有數據點附證據。' }, tools: 'Python series builder · no zero filling' },
        { id: 'render', keyword: 'CHART + DATA TABLE', action: { en: 'Render accessible tabular values and trend charts without connecting across missing periods.', zh: '顯示可存取數據表及趨勢圖，不跨缺失期間連線。' }, tools: 'React · Plotly.js connectgaps=false' },
      ],
      validation: { en: 'The query scope is current, units and periods are labelled, and missing points remain distinct from zero.', zh: '查詢範圍正確、單位及期間有標示，缺失點仍與零不同。' },
      outcomes: { kind: 'partial', success: { en: 'Display the requested company dashboard with traceable values and source links.', zh: '顯示指定公司儀表板，數值可追溯並附來源連結。' }, partial: { en: 'Show available points and explicit empty or missing-data states without inventing a continuous trend.', zh: '顯示已有數據點及明確空白或缺失狀態，不編造連續趨勢。' }, failure: { en: 'Show failed-query or invalid-filter feedback; do not label stale company data as a new successful result.', zh: '顯示查詢失敗或篩選無效提示，不把舊公司資料標示為新成功結果。' } },
      aiUse: { en: 'Charts read reviewed SQL facts. The LLM does not generate chart values or fill missing periods.', zh: '圖表讀取已覆核 SQL 數據；LLM 不產生圖表數值或填補缺失期間。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'citation', keyword: 'CITATION TARGET', action: { en: 'Resolve the clicked evidence ID to its immutable file version and viewer page.', zh: '把所選證據 ID 解析為不可變檔案版本及檢視器頁碼。' }, tools: 'PostgreSQL evidence service' },
        { id: 'access', keyword: 'SOURCE ACCESS', action: { en: 'Check the reader may access that exact version before requesting the object.', zh: '請求物件前，核對讀取者可存取確切版本。' }, tools: 'Resource authorization · S3 adapter' },
        { id: 'pdf', keyword: 'PDF BYTES', action: { en: 'Stream the original PDF through the authorized file endpoint.', zh: '經獲准檔案端點串流原始 PDF。' }, tools: 'application/pdf · Content-Disposition inline' },
        { id: 'page', keyword: 'OPEN EXACT PAGE', action: { en: 'Set the viewer page from metadata and display the printed page label separately.', zh: '按標籤設定檢視器頁碼，另行顯示印刷頁碼。' }, tools: 'PDF.js · React source panel' },
      ],
      validation: { en: 'The file is available, access is authorized and the viewer page points to the recorded source location.', zh: '檔案可用、存取獲准，而且檢視器頁碼對應記錄的來源位置。' },
      outcomes: { kind: 'binary', success: { en: 'Open the exact report page so the user can inspect the claim evidence.', zh: '開啟確切報告頁，供使用者檢查主張證據。' }, failure: { en: 'Show unavailable-file or denied-access feedback. Do not silently open another revision or approximate page.', zh: '顯示檔案無法取得或拒絕權限，不暗中開啟另一版本或近似頁面。' } },
      aiUse: { en: 'Opening evidence is an authorized file read. It does not require vector retrieval, RAG or an LLM.', zh: '開啟證據是獲准檔案讀取，毋須向量檢索、RAG 或 LLM。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'edit', keyword: 'EDITED BLOCKS', action: { en: 'Receive edited prose blocks with cited evidence IDs and an expected brief revision.', zh: '接收已編輯文字區塊、引用證據 ID 及預期摘要版本。' }, tools: 'React brief editor · Pydantic block schema' },
        { id: 'sources', keyword: 'CITATION ACCESS', action: { en: 'Resolve citation targets and preserve the originating run and fact snapshots.', zh: '解析引用目標，保留來源執行及數據快照。' }, tools: 'Evidence service · provenance records' },
        { id: 'revision', keyword: 'SAVE REVISION', action: { en: 'Check ownership and expectedRevision, then append the edited brief revision.', zh: '核對擁有權及 expectedRevision，再新增摘要編輯版本。' }, tools: 'PostgreSQL transaction · version history' },
        { id: 'status', keyword: 'SOURCE STATE', action: { en: 'Return the saved revision and any source-change warning without rewriting the user prose.', zh: '回傳已儲存版本及來源變更提示，不改寫使用者文字。' }, tools: 'Typed brief response · React saved-state indicator' },
      ],
      validation: { en: 'The editor owns the brief, its revision is current and all retained evidence links remain authorized and resolvable.', zh: '編輯者擁有摘要、版本正確，保留證據連結均獲准並可解析。' },
      outcomes: { kind: 'binary', success: { en: 'Show the saved editable brief with preserved citations and source-run provenance.', zh: '顯示已儲存可編輯摘要，保留引用及來源執行資料。' }, failure: { en: 'Keep the unsaved text and show revision conflict or invalid-citation feedback for the user to resolve.', zh: '保留未儲存文字，顯示版本衝突或無效引用，供使用者處理。' } },
      aiUse: { en: 'Saving a manual edit does not call an LLM. Optional AI drafting belongs to a separate cited analysis run whose provenance is retained.', zh: '儲存人工編輯不呼叫 LLM；選用 AI 草擬屬另一項附引用分析執行，並保留來源記錄。' },
    },
  ],
  automation: [
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'checkpoint', keyword: 'LOAD CHECKPOINT', action: { en: 'Load the same run, persisted state version and requested checkpoint.', zh: '載入同一執行、已持久儲存狀態版本及指定檢查點。' }, tools: 'LangGraph · PostgreSQL checkpointer' },
        { id: 'review', keyword: 'TRUSTED REVIEW', action: { en: 'Validate the stored human review, reviewer authority and expected state version on the server.', zh: '伺服器驗證已儲存人工覆核、覆核者權限及預期狀態版本。' }, tools: 'Review records · transactional resume policy' },
        { id: 'resume', keyword: 'RESUME AGENT', action: { en: 'Continue pending graph nodes from the checkpoint, reusing recorded tool results and operation identities.', zh: '由檢查點繼續未完成圖節點，重用已記錄工具結果及操作識別。' }, tools: 'LangGraph conditional nodes · retrieval and Decimal tools' },
        { id: 'draft', keyword: 'PENDING LLM CALL', action: { en: 'Call the configured LLM only if a remaining drafting step requires it, using the saved evidence context.', zh: '只有剩餘草擬步驟需要時才呼叫設定的 LLM，使用已儲存證據背景。' }, tools: 'RAG context · LLM API when required' },
        { id: 'save', keyword: 'SAVE NEXT STATE', action: { en: 'Persist the next checkpoint, verification decision and any review pause.', zh: '持久儲存下一檢查點、核對決定及需覆核暫停狀態。' }, tools: 'PostgreSQL checkpointer · LangGraph interrupts' },
      ],
      validation: { en: 'Resume authority and state version are valid, retained outputs are supported and replay does not duplicate side effects.', zh: '恢復權限及狀態版本有效，保留輸出有支持，而且重播不重複副作用。' },
      outcomes: { kind: 'partial', success: { en: 'Return the completed run with its supported answer and saved execution history.', zh: '回傳已完成執行、有支持答案及已儲存執行歷史。' }, partial: { en: 'Show a supported partial answer or an explicit paused-for-review state, with the action required to continue.', zh: '顯示有支持部分答案或明確待覆核暫停狀態，列出繼續所需操作。' }, failure: { en: 'Show unauthorized review, stale checkpoint or bounded execution failure; preserve state for inspection.', zh: '顯示未獲准覆核、過期檢查點或有限執行失敗，保留狀態供檢查。' } },
      aiUse: { en: 'LangGraph resumes only remaining work. A saved checkpoint is not permission to trust a client approval flag or repeat external actions.', zh: 'LangGraph 只恢復剩餘工作；已儲存檢查點不代表可相信客戶端批准標記或重複外部操作。' },
    },
    {
      kind: 'request', entry: 'n8n',
      steps: [
        { id: 'event', keyword: 'INGESTION EVENT', action: { en: 'Receive an authenticated scheduled or manual event with a stable event key.', zh: '接收已驗證排程或人工事件，附穩定事件鍵。' }, tools: 'HTTP request · service token' },
        { id: 'source', keyword: 'APPROVED SOURCE', action: { en: 'Validate the configured source, URL, redirects and download destination restrictions.', zh: '驗證已設定來源、網址、重新導向及下載目的地限制。' }, tools: 'Allowlist · network boundary checks' },
        { id: 'job', keyword: 'DEDUPLICATE JOB', action: { en: 'Create or reuse one logical ingestion job and record the source event.', zh: '建立或重用一項邏輯匯入工作，記錄來源事件。' }, tools: 'PostgreSQL unique key · durable job ledger' },
        { id: 'worker', keyword: 'DOWNLOAD + EXTRACT', action: { en: 'Let the worker fetch the approved PDF, store it and use the existing extraction pipeline.', zh: '由背景工作讀取獲准 PDF、儲存並使用原有擷取流程。' }, tools: 'Celery · S3 · pdfplumber · passage index' },
        { id: 'completion', keyword: 'COMPLETION RECORD', action: { en: 'The event caller polls the recorded job and records completion before any optional notification.', zh: '事件呼叫者輪詢已記錄工作，在選用通知前先記錄完成。' }, tools: 'Status polling · delivery record' },
      ],
      validation: { en: 'The service and source are authorized, replay reuses the same logical job, and processing really reached its reported state.', zh: '服務及來源獲准，重播重用同一邏輯工作，處理確實到達所報狀態。' },
      outcomes: { kind: 'binary', success: { en: 'Return the inspectable document/job result to the event caller and show it in the report library.', zh: '把可檢查文件及工作結果回傳事件呼叫者，並在財報資料庫顯示。' }, failure: { en: 'Record rejected source, invalid service token or failed processing; back off only permitted transient retries.', zh: '記錄來源拒絕、服務權杖無效或處理失敗，只對容許的暫時失敗退避重試。' } },
      aiUse: { en: 'n8n triggers ingestion rather than answering questions. Indexing can use embeddings; a chat LLM is called only by a separately requested analysis.', zh: 'n8n 觸發匯入而非回答問題；索引可用嵌入，聊天 LLM 只在另行請求分析時呼叫。' },
    },
    {
      kind: 'request', entry: 'browser',
      steps: [
        { id: 'eligibility', keyword: 'RETRY ELIGIBILITY', action: { en: 'Load the job and check retryable failure, expected attempt and attempt limit.', zh: '讀取工作，核對可重試失敗、預期次數及次數上限。' }, tools: 'PostgreSQL job ledger · retry policy' },
        { id: 'lease', keyword: 'ATOMIC LEASE', action: { en: 'Atomically acquire the next attempt on the same logical job.', zh: '以原子方式取得同一邏輯工作下一次嘗試的執行權。' }, tools: 'PostgreSQL transaction · reclaimable job lease' },
        { id: 'replay', keyword: 'SAFE REPLAY', action: { en: 'Reuse operation keys, committed outputs and checkpoints rather than creating another document.', zh: '重用操作鍵、已提交輸出及檢查點，不另建文件。' }, tools: 'Idempotent worker handlers · persisted checkpoints' },
        { id: 'commit', keyword: 'OUTPUT + OUTBOX', action: { en: 'Commit the result and durable notification event; recipients deduplicate external delivery by event ID.', zh: '提交結果及持久通知事件，接收方按事件 ID 對外部投遞去重。' }, tools: 'PostgreSQL transaction · outbox · delivery reconciliation' },
      ],
      validation: { en: 'Only one permitted attempt owns the job, result identity is stable and retry limits are respected.', zh: '只有一個獲准嘗試擁有工作，結果識別穩定，而且遵守重試上限。' },
      outcomes: { kind: 'binary', success: { en: 'Show the existing job completed on its later attempt, with one logical document/result and an audit history.', zh: '顯示原工作在後續嘗試完成，只有一份邏輯文件及結果，附稽核歷史。' }, failure: { en: 'Show already-running, retry-limit or persistent failure details. Unknown external delivery outcomes require reconciliation.', zh: '顯示正在執行、重試上限或持續失敗詳情，未知外部投遞結果需核對。' } },
      aiUse: { en: 'Retry control itself does not call an LLM. A resumed job may call its original model step only when safely required.', zh: '重試控制本身不呼叫 LLM；恢復工作只有在安全且需要時才呼叫原有模型步驟。' },
    },
  ],
  quality: [
    {
      kind: 'request', entry: 'operator',
      steps: [
        { id: 'dataset', keyword: 'CHECKED TEST SET', action: { en: 'Load the versioned, manually checked cases and separate held-out examples from development cases.', zh: '載入有版本、人工核對案例，分開保留及開發範例。' }, tools: 'Versioned JSON cases · source evidence' },
        { id: 'configs', keyword: 'BASELINE + CANDIDATE', action: { en: 'Resolve recorded parser, prompt, model and retrieval configurations for both runs.', zh: '解析兩次執行的已記錄解析器、提示、模型及檢索設定。' }, tools: 'Evaluation configuration registry' },
        { id: 'run', keyword: 'EVALUATION RUN', action: { en: 'Run extraction, retrieval, arithmetic and answer cases. Live mode invokes the real model path; offline fixtures stay labelled.', zh: '執行擷取、檢索、算術及答案案例；即時模式呼叫真實模型流程，離線範例保持標示。' }, tools: 'pytest · evaluation worker · LangGraph / LLM API in live mode' },
        { id: 'score', keyword: 'CASE-LEVEL CHECKS', action: { en: 'Compare expected figures, citations, support and abstention separately and retain raw failures.', zh: '分別比較預期數字、引用、支持度及拒答，保留原始失敗。' }, tools: 'Deterministic checks · human review · optional model judge' },
        { id: 'report', keyword: 'RELEASE GATE', action: { en: 'Persist the report and block release on the agreed critical failures.', zh: '持久儲存報告，指定重大失敗時阻止發佈。' }, tools: 'PostgreSQL · CI artifacts · Langfuse' },
      ],
      validation: { en: 'Dataset and configurations are recorded, all selected cases ran, and the release decision reflects critical failures rather than one aggregate score.', zh: '測試集及設定已記錄、所有所選案例已執行，發佈決定按重大失敗而非單一總分。' },
      outcomes: { kind: 'binary', success: { en: 'Return the completed evaluation report and its pass or blocked release gate. A blocked gate is a valid evaluation result.', zh: '回傳已完成評估報告及通過或阻擋的發佈決定；被阻擋是有效評估結果。' }, failure: { en: 'Show dataset, configuration or runner failure and do not claim that an incomplete evaluation passed.', zh: '顯示測試集、設定或執行器失敗，不聲稱未完成評估已通過。' } },
      aiUse: { en: 'Only live model cases call the LLM. Offline fixtures and optional model judges cannot establish live accuracy on their own.', zh: '只有即時模型案例呼叫 LLM；離線範例及選用模型評審本身不能證明即時準確率。' },
    },
    {
      kind: 'request', entry: 'operator',
      steps: [
        { id: 'trace', keyword: 'TRACE LOOKUP', action: { en: 'Resolve the operator-authorized trace within the permitted environment and run.', zh: '在獲准環境及執行範圍內，解析操作人員有權讀取的追蹤。' }, tools: 'PostgreSQL run index · Langfuse' },
        { id: 'redact', keyword: 'REDACTED SPANS', action: { en: 'Read timings, errors, token usage and model/prompt versions with sensitive fields removed.', zh: '讀取時間、錯誤、token 用量及模型／提示版本，移除敏感欄位。' }, tools: 'Structured logs · trace redaction policy' },
        { id: 'cost', keyword: 'USAGE + RATE', action: { en: 'Calculate cost only from actual recorded usage and the relevant dated pricing version.', zh: '只按實際已記錄用量及相關有日期價格版本計算成本。' }, tools: 'Python usage accounting · pricing ledger' },
        { id: 'inspect', keyword: 'DIAGNOSE FAILURE', action: { en: 'Return the trace and explicit missing telemetry so the operator can inspect the failing boundary.', zh: '回傳追蹤及明確缺失遙測，讓操作人員檢查出錯邊界。' }, tools: 'Operator trace response · regression case workflow' },
      ],
      validation: { en: 'Trace access is authorized, sensitive fields are redacted and unknown usage or pricing is not represented as zero.', zh: '追蹤存取獲准、敏感欄位已遮蔽，未知用量或價格不顯示為零。' },
      outcomes: { kind: 'partial', success: { en: 'Show the trace, recorded usage and cost with the model and pricing versions used.', zh: '顯示追蹤、已記錄用量及成本，附所用模型及價格版本。' }, partial: { en: 'Show the available trace while marking unavailable timings, usage or cost as unknown.', zh: '顯示已有追蹤，把未取得時間、用量或成本標示未知。' }, failure: { en: 'Show inaccessible or expired trace feedback without exposing private reports or credentials.', zh: '顯示追蹤無權存取或已過期提示，不暴露私人報告或憑證。' } },
      aiUse: { en: 'Reading a trace uses stored telemetry. It does not repeat the model call whose usage is being inspected.', zh: '讀取追蹤使用已儲存遙測，不會重複正在檢查其用量的模型呼叫。' },
    },
    {
      kind: 'pipeline',
      steps: [
        { id: 'ci', keyword: 'CI TRIGGER', action: { en: 'An authorized maintainer selects the reviewed commit and staging release.', zh: '獲准維護者選擇已審閱提交及測試環境發佈。' }, tools: 'GitHub Actions workflow_dispatch · environment controls' },
        { id: 'gates', keyword: 'TEST + EVALUATE', action: { en: 'Run type checks, tests and the agreed case-level evaluation release gate.', zh: '執行類型檢查、測試及指定逐案例評估發佈關卡。' }, tools: 'pytest · frontend checks · evaluation runner' },
        { id: 'image', keyword: 'BUILD + PUBLISH', action: { en: 'Build immutable images and record commit tags, digests and schema compatibility.', zh: '建立不可變映像，記錄提交標籤、摘要及資料結構相容性。' }, tools: 'Docker · ECR · GitHub OIDC' },
        { id: 'backup', keyword: 'BACKUP + MIGRATE', action: { en: 'Pause writes, drain workers and verify a backup before the controlled migration.', zh: '受控遷移前暫停寫入、等待背景工作結束，並驗證備份。' }, tools: 'SSM · PostgreSQL dump · Alembic' },
        { id: 'deploy', keyword: 'EC2 RELEASE', action: { en: 'Start the selected Compose release with mounted EBS and server-side secrets.', zh: '以已掛載 EBS 及伺服器機密啟動指定 Compose 版本。' }, tools: 'EC2 · Docker Compose · mount-gated startup' },
        { id: 'smoke', keyword: 'HEALTH + DEMO', action: { en: 'Check readiness, the cited-answer journey and the missing-evidence case before resuming traffic.', zh: '恢復流量前檢查就緒狀態、附引用答案流程及缺證據情境。' }, tools: 'HTTPS checks · Playwright · deployment runbook' },
      ],
      validation: { en: 'Tests and evaluation pass, services are ready, source citations work and the release can recover with the documented database policy.', zh: '測試及評估通過、服務就緒、來源引用可用，而且發佈可按已記錄資料庫政策恢復。' },
      outcomes: { kind: 'binary', success: { en: 'Record the deployed image digests and healthy release, then present the verified demonstration to the reviewer.', zh: '記錄已部署映像摘要及健康版本，再向審閱者展示已驗證示範。' }, failure: { en: 'Stop the rollout. Restore the previous image only with a compatible schema; database restoration is a separate recovery action.', zh: '停止發佈；只有資料結構相容才恢復舊映像，資料庫還原屬另一項恢復操作。' } },
      aiUse: { en: 'This is an operator CI pipeline, not a browser API request. Evaluation or the seeded smoke test may call a configured LLM only in live mode.', zh: '這是操作人員 CI 流程，不是瀏覽器 API 請求；評估或預設冒煙測試只有即時模式才可呼叫設定 LLM。' },
    },
  ],
} satisfies Record<keyof typeof financeFunctionWorkflows, [FinanceFunctionMap, FinanceFunctionMap, FinanceFunctionMap]>;
