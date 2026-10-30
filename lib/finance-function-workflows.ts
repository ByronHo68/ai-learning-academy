import type { Copy } from './curriculum';

type FunctionStep = { action: Copy; tools: string };
type FunctionWorkflow = {
  title: Copy;
  steps: [FunctionStep, FunctionStep, FunctionStep, FunctionStep];
  result: Copy;
  failure: Copy;
};

export const financeFunctionWorkflows = {
  library: [
    {
      title: { en: 'Upload annual-report PDFs', zh: '上載年度財報 PDF' },
      steps: [
        { action: { en: 'Select a PDF and company; submit the file with a visible upload status.', zh: '選擇 PDF 及公司，送出檔案並顯示上載狀態。' }, tools: 'Next.js · React' },
        { action: { en: 'Validate file signature, size limits and required metadata; compute a content hash.', zh: '驗證檔案特徵、大小限制及必要資料，並計算內容雜湊。' }, tools: 'FastAPI · Pydantic · Python hashlib' },
        { action: { en: 'Store the original file and a versioned document record using the hash to detect duplicates.', zh: '儲存原檔及有版本文件記錄，利用雜湊辨認重複內容。' }, tools: 'S3-compatible storage · PostgreSQL' },
        { action: { en: 'Create an extraction job and return its document ID and processing state.', zh: '建立擷取工作，回傳文件 ID 及處理狀態。' }, tools: 'FastAPI · background worker' },
      ],
      result: { en: 'A stored original with a stable document ID and a queued extraction job.', zh: '已儲存原檔、穩定文件 ID，以及排隊中的擷取工作。' },
      failure: { en: 'Reject invalid files before processing. Return the existing document for a duplicate; retain a recoverable failed state if storage or job creation fails.', zh: '處理前拒絕無效檔案；重複內容回傳原有文件；儲存或建工作失敗時保留可恢復狀態。' },
    },
    {
      title: { en: 'Label company, period and source', zh: '標示公司、期間及來源' },
      steps: [
        { action: { en: 'Enter company identity, report type, fiscal start/end dates and source URL.', zh: '輸入公司身分、報告類型、財政起訖日期及來源網址。' }, tools: 'React form' },
        { action: { en: 'Validate date order and report type; distinguish a stock code from a company identity.', zh: '驗證日期次序及報告類型，分開股票代號與公司身分。' }, tools: 'FastAPI · Pydantic' },
        { action: { en: 'Link the confirmed metadata to the immutable document version.', zh: '把已確認中繼資料連結不可變文件版本。' }, tools: 'PostgreSQL' },
        { action: { en: 'Use the confirmed company and period as filters throughout retrieval and comparisons.', zh: '在檢索及比較中，以已確認公司及期間作篩選條件。' }, tools: 'SQL filters · retrieval service' },
      ],
      result: { en: 'A report that can be selected unambiguously by company, period and version.', zh: '可按公司、期間及版本明確選取的報告。' },
      failure: { en: 'Keep unconfirmed metadata in draft and exclude it from cross-company comparisons; do not guess a year from a filename.', zh: '未確認資料保留草稿並排除跨公司比較；不可憑檔名猜測年份。' },
    },
    {
      title: { en: 'Keep originals and revisions', zh: '保留原檔與修訂版本' },
      steps: [
        { action: { en: 'Receive a second file for an existing company and fiscal period.', zh: '收到同一公司及財政期間的另一份檔案。' }, tools: 'React · FastAPI' },
        { action: { en: 'Compare its content hash and ask for revision confirmation when the bytes differ.', zh: '比較內容雜湊；內容不同時要求確認是否修訂版本。' }, tools: 'Python hashlib · review form' },
        { action: { en: 'Save a new version with a supersedes link; retain the original object and facts.', zh: '儲存新版本及取代關係；保留原檔與舊數據。' }, tools: 'PostgreSQL · file storage' },
        { action: { en: 'Index the new version separately; let users choose it while old citations still resolve.', zh: '獨立索引新版本，讓使用者選用，同時確保舊引用仍可開啟。' }, tools: 'pgvector · version-filtered retrieval' },
      ],
      result: { en: 'An explicit report-version history with stable historical citations.', zh: '清楚的報告版本歷史及穩定的舊引用。' },
      failure: { en: 'Do not overwrite files or silently merge different versions. A failed reindex leaves the prior searchable version intact.', zh: '不可覆寫檔案或暗中合併版本；重新索引失敗時保留舊版檢索能力。' },
    },
  ],
  extraction: [
    {
      title: { en: 'Extract text and financial tables', zh: '擷取文字及財務表格' },
      steps: [
        { action: { en: 'Load the stored PDF and inspect each page for a text layer.', zh: '讀取已儲存 PDF，檢查每頁是否有文字層。' }, tools: 'Background worker · PyMuPDF' },
        { action: { en: 'Read paragraphs, table regions, column headings and surrounding notes.', zh: '讀取段落、表格區域、欄位標題及附近附註。' }, tools: 'PyMuPDF · pdfplumber' },
        { action: { en: 'Produce candidate rows while preserving negatives, currency, scale and year labels.', zh: '產生候選列，並保留負號、貨幣、單位及年份標籤。' }, tools: 'Python parsing · Pydantic' },
        { action: { en: 'Save candidates and provenance for review; index text passages separately from numerical facts.', zh: '儲存候選數據及來源供覆核；文字段落與數值數據分開索引。' }, tools: 'PostgreSQL · embeddings · pgvector' },
      ],
      result: { en: 'Searchable passages and structured candidate values, each linked to its source.', zh: '可搜尋段落及結構化候選數值，各自附上來源。' },
      failure: { en: 'Flag unreadable or scanned pages for OCR/manual handling. Never treat an empty extraction as a verified report.', zh: '無法讀取或掃描頁標記需 OCR／人工處理；不可把空白擷取當成已覆核財報。' },
    },
    {
      title: { en: 'Retain page and table references', zh: '保留頁碼及表格位置' },
      steps: [
        { action: { en: 'Capture the PDF page index, printed page label and text/table region during extraction.', zh: '擷取時記錄 PDF 頁面索引、印刷頁碼及文字／表格區域。' }, tools: 'PyMuPDF · pdfplumber' },
        { action: { en: 'Create an evidence ID containing document version and region references.', zh: '建立證據 ID，包含文件版本及區域參照。' }, tools: 'Pydantic · PostgreSQL' },
        { action: { en: 'Attach evidence IDs to passages, reviewed facts and calculation inputs.', zh: '把證據 ID 附於段落、已覆核數據及計算輸入。' }, tools: 'Extraction service · calculation service' },
        { action: { en: 'Resolve each citation to the original file and the correct PDF page.', zh: '把每項引用解析為原始檔案及正確 PDF 頁面。' }, tools: 'FastAPI · browser PDF viewer' },
      ],
      result: { en: 'A traceable path from an answer or figure back to its original report location.', zh: '由答案或數字追溯至原始報告位置的路徑。' },
      failure: { en: 'A missing or invalid evidence reference blocks the affected claim. Printed page 42 must not be assumed to be PDF page 42.', zh: '證據參照缺失或無效時阻止相關主張；不可假設印刷第 42 頁等於 PDF 第 42 頁。' },
    },
    {
      title: { en: 'Review uncertain values', zh: '覆核不確定數值' },
      steps: [
        { action: { en: 'Flag conflicting headings, missing units or ambiguous extracted values.', zh: '標記標題衝突、單位缺失或含糊數值。' }, tools: 'Python validation rules' },
        { action: { en: 'Show the candidate beside its PDF source with the reason review is needed.', zh: '把候選數據與 PDF 原文並排，顯示需覆核原因。' }, tools: 'React · PDF viewer' },
        { action: { en: 'Let the reviewer confirm, correct or reject it and record a reason.', zh: '讓覆核者確認、更正或拒絕，並記錄原因。' }, tools: 'React form · FastAPI' },
        { action: { en: 'Save the review event and expose only accepted facts to verified comparisons.', zh: '儲存覆核事件；已驗證比較只使用接納數據。' }, tools: 'PostgreSQL transaction · audit history' },
      ],
      result: { en: 'An accepted fact or an explicit unresolved/rejected candidate with review history.', zh: '已接納數據，或明確未解決／已拒絕候選項，附覆核歷史。' },
      failure: { en: 'If review is incomplete, keep the value out of verified calculations. Reject stale edits when another review changed the record.', zh: '覆核未完成時不納入已驗證計算；其他覆核已更改記錄時拒絕過期修改。' },
    },
  ],
  facts: [
    {
      title: { en: 'Start with five financial metrics', zh: '先處理五項財務指標' },
      steps: [
        { action: { en: 'Define revenue, net profit, operating cash flow, total assets and total liabilities precisely.', zh: '準確定義收入、淨利潤、經營現金流、總資產及總負債。' }, tools: 'Versioned metric dictionary' },
        { action: { en: 'Map extracted row labels to definitions and retain the original wording.', zh: '把擷取列名稱對應指標定義，保留原文措辭。' }, tools: 'Python mapping rules · review UI' },
        { action: { en: 'Parse amounts as decimal values and attach source, period, basis and review status.', zh: '以十進位解析金額，附來源、期間、口徑及覆核狀態。' }, tools: 'Python Decimal · Pydantic' },
        { action: { en: 'Store accepted metric records and expose them through a typed facts endpoint.', zh: '儲存接納的指標記錄，透過有型別數據 API 提供。' }, tools: 'PostgreSQL · FastAPI' },
      ],
      result: { en: 'Five consistently defined metric series where available, with explicit gaps otherwise.', zh: '有資料時提供五項定義一致的指標數列；缺失處明確顯示。' },
      failure: { en: 'Send ambiguous mappings for review; do not substitute an adjusted profit figure for a different net-profit definition.', zh: '含糊對應交予覆核；不可用經調整盈利取代不同定義的淨利潤。' },
    },
    {
      title: { en: 'Track currency, scale and period', zh: '記錄貨幣、單位及期間' },
      steps: [
        { action: { en: 'Read currency and scale from table headers and fiscal dates from the report context.', zh: '從表頭讀取貨幣及單位，從報告背景讀取財政日期。' }, tools: 'pdfplumber · metadata service' },
        { action: { en: 'Distinguish duration metrics such as revenue from balance-sheet values at a specific date.', zh: '分開收入等期間指標與特定日期的資產負債表數值。' }, tools: 'Pydantic fact schema' },
        { action: { en: 'Preserve the reported amount and derive a base-unit amount only when the scale is confirmed.', zh: '保留報告金額；只有確認單位後才推導基本單位金額。' }, tools: 'Python Decimal · PostgreSQL' },
        { action: { en: 'Show units and dates on API results, tables, charts and calculation previews.', zh: '在 API 結果、表格、圖表及計算預覽顯示單位及日期。' }, tools: 'FastAPI · React · Plotly.js' },
      ],
      result: { en: 'Financial facts retain both their original presentation and validated comparison context.', zh: '財務數據同時保留原報格式及已驗證比較背景。' },
      failure: { en: 'Unknown currency, scale or period prevents a comparable-value calculation; never assume HKD because a company is listed in Hong Kong.', zh: '貨幣、單位或期間不明時阻止可比值計算；不可因公司在香港上市便假設港元。' },
    },
    {
      title: { en: 'Record corrections and restatements', zh: '記錄更正及重列數字' },
      steps: [
        { action: { en: 'Identify a changed comparative value or a reviewer correction and its source note.', zh: '識別有變動的比較數值或覆核更正，以及來源附註。' }, tools: 'Python diff · review UI' },
        { action: { en: 'Record whether the event is an extraction correction or a company-issued restatement.', zh: '記錄事件屬擷取更正，還是公司發出的重列。' }, tools: 'Pydantic event schema' },
        { action: { en: 'Append the new fact and a link to the earlier fact without destroying the earlier value.', zh: '新增數據及連至舊數據的關係，不刪除原值。' }, tools: 'PostgreSQL transaction · audit history' },
        { action: { en: 'Display the selected basis and invalidate derived results that use the superseded fact.', zh: '顯示所選口徑，並令使用被取代數據的衍生結果失效。' }, tools: 'Dependency tracking · React' },
      ],
      result: { en: 'An auditable history showing which fact version each answer or chart used.', zh: '可審核歷史，顯示每個答案或圖表使用的數據版本。' },
      failure: { en: 'A conflicting update requires review; existing briefs keep their old inputs and are marked stale rather than silently rewritten.', zh: '衝突更新需覆核；舊摘要保留原輸入並標記過期，不可暗中重寫。' },
    },
  ],
  research: [
    {
      title: { en: 'Ask in English or Traditional Chinese', zh: '英文或繁體中文提問' },
      steps: [
        { action: { en: 'Submit a question with selected companies, periods and preferred answer language.', zh: '提交問題、選定公司、期間及答案語言。' }, tools: 'React chat form' },
        { action: { en: 'Validate scope and size; ask for clarification if company or period is ambiguous.', zh: '驗證範圍及長度；公司或期間含糊時要求釐清。' }, tools: 'FastAPI · Pydantic' },
        { action: { en: 'Retrieve bilingual evidence using the confirmed scope while retaining original financial terms.', zh: '按已確認範圍檢索雙語證據，保留原文財務用語。' }, tools: 'Embedding model · pgvector · SQL filters' },
        { action: { en: 'Generate a structured answer in the requested language with unchanged source references.', zh: '以指定語言產生結構化答案，保留來源參照。' }, tools: 'LangGraph · LLM API' },
      ],
      result: { en: 'A scoped bilingual research answer whose translated wording still points to the original evidence.', zh: '有明確範圍的雙語研究答案，翻譯措辭仍連結原始證據。' },
      failure: { en: 'Do not guess missing scope or translate a metric into a different accounting definition. Explain unsupported language or provider failure.', zh: '不可猜測缺失範圍或把指標翻譯成另一會計定義；說明語言或供應商失敗。' },
    },
    {
      title: { en: 'Retrieve relevant report passages', zh: '檢索相關財報段落' },
      steps: [
        { action: { en: 'Split extracted text into passages that retain headings, document version and page references.', zh: '切分擷取文字為段落，保留標題、文件版本及頁面參照。' }, tools: 'Python chunking · PostgreSQL' },
        { action: { en: 'Embed passages and store vectors alongside searchable text and provenance.', zh: '把段落轉為 embedding，連同可搜尋文字及來源儲存。' }, tools: 'Embedding API · pgvector · PostgreSQL full-text search' },
        { action: { en: 'Filter by company, period and version, then rank semantic and keyword matches.', zh: '按公司、期間及版本篩選，再排列語意及關鍵字匹配。' }, tools: 'SQL filters · hybrid retrieval' },
        { action: { en: 'Return an evidence bundle containing passage IDs, original text, pages and matched facts.', zh: '回傳證據組，包含段落 ID、原文、頁碼及相關數據。' }, tools: 'FastAPI · LangGraph retrieval node' },
      ],
      result: { en: 'A bounded evidence bundle from the correct report versions for answer drafting.', zh: '來自正確報告版本、範圍受限的證據組，供草擬答案。' },
      failure: { en: 'An empty or weak result returns insufficient evidence; never widen to another company or year without telling the user.', zh: '空白或不足結果回傳證據不足；不可未告知使用者便擴大至另一公司或年份。' },
    },
    {
      title: { en: 'Cite evidence or say what is missing', zh: '引用證據或說明缺失' },
      steps: [
        { action: { en: 'Draft separate factual claims using only the retrieved evidence and calculated results.', zh: '只根據檢索證據及計算結果，草擬逐項事實主張。' }, tools: 'LLM API · structured output schema' },
        { action: { en: 'Resolve cited IDs and verify figures and claim support against the original passages.', zh: '解析引用 ID，對照原始段落核對數字及主張支持。' }, tools: 'LangGraph verification node · deterministic checks · reviewer' },
        { action: { en: 'Remove or qualify unsupported explanations; preserve a supported numerical answer where possible.', zh: '移除或限制無證據解釋；可行時保留有支持的數值答案。' }, tools: 'Answer policy · LangGraph conditional routing' },
        { action: { en: 'Render claim-level source links and a clear list of unresolved questions.', zh: '顯示逐項來源連結及清楚的未解問題清單。' }, tools: 'FastAPI response schema · React' },
      ],
      result: { en: 'A cited answer, a supported partial answer or an explicit insufficient-evidence response.', zh: '附引用答案、有支持的部分答案，或明確證據不足回應。' },
      failure: { en: 'Unresolvable IDs or unsupported causal claims fail verification. A model checker is fallible, so evaluate it against labelled cases.', zh: '無法解析 ID 或無支持因果主張會核對失敗；模型檢查亦會錯，需以標記案例評估。' },
    },
  ],
  comparison: [
    {
      title: { en: 'Calculate year-on-year change', zh: '計算按年變化' },
      steps: [
        { action: { en: 'Select two reviewed facts for the same metric and compatible annual periods.', zh: '選擇相同指標及相容年度期間的兩個已覆核數據。' }, tools: 'PostgreSQL query · FastAPI' },
        { action: { en: 'Validate currency, scale, basis and denominator before any arithmetic.', zh: '計算前驗證貨幣、單位、口徑及分母。' }, tools: 'Pydantic · compatibility rules' },
        { action: { en: 'Compute absolute change and percentage change with decimal arithmetic; retain the formula.', zh: '以十進位運算計算絕對及百分比變化，保留公式。' }, tools: 'Python Decimal' },
        { action: { en: 'Return inputs, result, rounding policy and citations to the dashboard and answer.', zh: '把輸入、結果、捨入規則及引用回傳儀表板及答案。' }, tools: 'FastAPI · React · LangGraph calculation tool' },
      ],
      result: { en: 'A reproducible calculation, such as the fictional 100 → 80 giving −20%.', zh: '可重現的計算，例如虛構 100 → 80 得出 −20%。' },
      failure: { en: 'A zero denominator has no percentage growth result. Flag negative-base interpretation and reject missing or incompatible inputs.', zh: '零分母不提供百分比增長；標示負基數解讀限制，並拒絕缺失或不相容輸入。' },
    },
    {
      title: { en: 'Compare companies side by side', zh: '並排比較公司' },
      steps: [
        { action: { en: 'Choose companies, metrics and comparable fiscal periods.', zh: '選擇公司、指標及可比較財政期間。' }, tools: 'React comparison controls' },
        { action: { en: 'Fetch reviewed fact versions and check definitions, currency and reporting basis.', zh: '讀取已覆核數據版本，檢查定義、貨幣及報表口徑。' }, tools: 'SQL · compatibility service' },
        { action: { en: 'Build an aligned comparison dataset with explicit missing or blocked cells.', zh: '建立對齊比較資料集，明確顯示缺失或被阻止的儲存格。' }, tools: 'pandas · Python Decimal' },
        { action: { en: 'Render the table and chart with period labels, units, caveats and source links.', zh: '顯示表格及圖表，附期間、單位、注意事項及來源連結。' }, tools: 'React · Plotly.js' },
      ],
      result: { en: 'An inspectable comparison where every displayed number retains its own source.', zh: '可逐項檢查的比較，每個數字均保留各自來源。' },
      failure: { en: 'Block incompatible cells instead of silently converting currencies or presenting differently defined profits as equivalent.', zh: '阻止不相容儲存格，不可暗中換算貨幣或把不同盈利定義當作相同。' },
    },
    {
      title: { en: 'Check periods and definitions', zh: '檢查期間及定義' },
      steps: [
        { action: { en: 'Read each fact’s period type, start/end dates, metric definition, scale, currency and basis.', zh: '讀取每項數據的期間類型、起訖、指標定義、單位、貨幣及口徑。' }, tools: 'PostgreSQL fact schema' },
        { action: { en: 'Apply explicit compatibility rules to the requested comparison.', zh: '對指定比較套用明確相容規則。' }, tools: 'Pure Python rules · Pydantic' },
        { action: { en: 'Normalize confirmed scale differences using decimal arithmetic while retaining originals.', zh: '以十進位運算統一已確認單位差異，同時保留原值。' }, tools: 'Python Decimal' },
        { action: { en: 'Return an allowed comparison or named blocking reasons and a suggested user correction.', zh: '回傳可比較結果，或具名阻止原因及建議修正。' }, tools: 'FastAPI · React validation messages' },
      ],
      result: { en: 'A documented comparison decision with every normalization visible.', zh: '有記錄的比較決定，清楚顯示每項正規化。' },
      failure: { en: 'Do not infer that annual and interim values or differently defined metrics are interchangeable. Unknown metadata blocks approval.', zh: '不可假設全年與中期值或不同定義指標可互換；資料不明時阻止通過。' },
    },
  ],
  workspace: [
    {
      title: { en: 'Dashboard and trend charts', zh: '儀表板與趨勢圖' },
      steps: [
        { action: { en: 'Select a company, metric and period range in the workspace.', zh: '在工作區選擇公司、指標及期間範圍。' }, tools: 'Next.js · React controls' },
        { action: { en: 'Request reviewed, version-labelled facts with units and provenance.', zh: '請求已覆核、附版本的數據，以及單位及來源。' }, tools: 'FastAPI · PostgreSQL' },
        { action: { en: 'Prepare chart series without replacing missing values with zero or crossing unknown periods.', zh: '準備圖表數列，不把缺失當零，也不跨未知期間連線。' }, tools: 'Python/pandas · typed chart schema' },
        { action: { en: 'Render charts and an accessible data table; link values back to evidence.', zh: '顯示圖表及可存取資料表，讓數值連回證據。' }, tools: 'Plotly.js · React' },
      ],
      result: { en: 'A dashboard with traceable numbers, labelled units and visible data gaps.', zh: '數字可追溯、單位有標示、缺失清楚可見的儀表板。' },
      failure: { en: 'Display loading, empty and failed-query states explicitly; do not show stale company data as if the new query succeeded.', zh: '明確顯示載入、空白及查詢失敗狀態；不可把舊公司資料當成新查詢成功。' },
    },
    {
      title: { en: 'Open the cited PDF page', zh: '開啟引用的 PDF 頁面' },
      steps: [
        { action: { en: 'Click a source link attached to a claim, figure or calculation input.', zh: '點擊主張、數字或計算輸入所附來源連結。' }, tools: 'React citation link' },
        { action: { en: 'Resolve the evidence ID to its document version and PDF page index.', zh: '把證據 ID 解析為文件版本及 PDF 頁面索引。' }, tools: 'FastAPI · PostgreSQL evidence lookup' },
        { action: { en: 'Check access when accounts exist and serve the exact stored original.', zh: '有帳戶時檢查存取權，並提供準確的已存原檔。' }, tools: 'Authorization policy · file storage' },
        { action: { en: 'Open the viewer at that PDF page while displaying the printed page label separately.', zh: '檢視器開啟指定 PDF 頁面，另行顯示印刷頁碼。' }, tools: 'Browser PDF viewer · React' },
      ],
      result: { en: 'The user can inspect the evidence behind a statement without searching the entire PDF.', zh: '使用者毋須搜尋整份 PDF，便能檢查主張背後證據。' },
      failure: { en: 'Show missing-file or denied-access errors. Do not fall back to another revision or an approximate page without disclosure.', zh: '顯示檔案缺失或權限拒絕；不可未說明便改開另一版本或近似頁面。' },
    },
    {
      title: { en: 'Save an editable research brief', zh: '儲存可編輯研究摘要' },
      steps: [
        { action: { en: 'Choose reviewed answers, comparisons and a brief outline.', zh: '選擇已覆核答案、比較及摘要大綱。' }, tools: 'React workspace' },
        { action: { en: 'Assemble facts, attributed commentary, interpretation and limitations with citations.', zh: '整理事實、歸屬明確的評論、推論及限制，附引用。' }, tools: 'LangGraph · LLM API · structured schema' },
        { action: { en: 'Let the analyst edit the draft while retaining source links and a change history.', zh: '讓分析員修改草稿，保留來源連結及修改歷史。' }, tools: 'React editor · FastAPI' },
        { action: { en: 'Save a versioned brief snapshot with the exact fact, report, prompt and model versions used.', zh: '儲存有版本摘要快照，記錄確切數據、報告、prompt 及模型版本。' }, tools: 'PostgreSQL · provenance records' },
      ],
      result: { en: 'An editable, reproducible research draft with evidence preserved.', zh: '可編輯、可重現並保留證據的研究草稿。' },
      failure: { en: 'Flag edits that invalidate citations. Save conflicts require resolution; later source changes mark the snapshot stale rather than rewriting it.', zh: '修改令引用失效時標記；儲存衝突需處理；日後來源改變只標記快照過期，不重寫。' },
    },
  ],
  automation: [
    {
      title: { en: 'LangGraph analysis checkpoints', zh: 'LangGraph 分析檢查點' },
      steps: [
        { action: { en: 'Create a run ID and scoped state containing question, company, periods and document versions.', zh: '建立執行 ID 及限定狀態，包含問題、公司、期間及文件版本。' }, tools: 'FastAPI · LangGraph state schema' },
        { action: { en: 'Execute retrieve, validate, calculate and draft nodes with explicit tool results.', zh: '執行檢索、驗證、計算及草擬節點，明確儲存工具結果。' }, tools: 'LangGraph · retrieval and calculation tools' },
        { action: { en: 'Persist checkpoints and route failed verification or review requests to a paused state.', zh: '儲存檢查點；核對失敗或需覆核時導向暫停狀態。' }, tools: 'LangGraph interrupts · PostgreSQL checkpointer' },
        { action: { en: 'Resume the same authorized run after review and return a verified or partial answer.', zh: '覆核後恢復同一獲授權執行，回傳已核對或部分答案。' }, tools: 'FastAPI resume endpoint · LangGraph' },
      ],
      result: { en: 'A visible, resumable analysis run whose evidence and state survive process restarts.', zh: '可見且可恢復的分析執行；程序重啟後仍保留證據及狀態。' },
      failure: { en: 'Require trusted review input; cap retries and execution time. Checkpoint replay must not repeat external side effects.', zh: '覆核輸入需可信；限制重試及執行時間；檢查點重播不可重複外部副作用。' },
    },
    {
      title: { en: 'n8n ingestion triggers', zh: 'n8n 匯入觸發器' },
      steps: [
        { action: { en: 'Receive an authenticated upload event or check an approved source on a configured schedule.', zh: '接收已驗證上載事件，或按設定排程檢查指定來源。' }, tools: 'n8n webhook · schedule trigger' },
        { action: { en: 'Validate the event and send document metadata with a stable ingestion key to the API.', zh: '驗證事件，連同穩定匯入 key 把文件資料送至 API。' }, tools: 'n8n HTTP Request · FastAPI authentication' },
        { action: { en: 'Let the backend deduplicate, store and queue extraction; n8n records the returned job ID.', zh: '由後端去重、儲存及排隊擷取；n8n 記錄回傳工作 ID。' }, tools: 'FastAPI · PostgreSQL · background worker' },
        { action: { en: 'Check completion and issue an opted-in notification once per completed job.', zh: '檢查完成狀態，對每個已完成工作發送一次自選通知。' }, tools: 'n8n · notification connector · delivery record' },
      ],
      result: { en: 'A report enters the existing processing pipeline with an inspectable job record.', zh: '財報進入原有處理流程，並有可檢查工作記錄。' },
      failure: { en: 'Reject unknown sources and unauthenticated events. Back off on transient errors and deduplicate webhook or notification retries.', zh: '拒絕未知來源及未驗證事件；暫時失敗採退避重試，並對 webhook 及通知重試去重。' },
    },
    {
      title: { en: 'Retry jobs without duplicates', zh: '重試工作而不重複匯入' },
      steps: [
        { action: { en: 'Derive a stable key from the document content and operation version.', zh: '根據文件內容及操作版本產生穩定 key。' }, tools: 'Python hashlib · versioned job schema' },
        { action: { en: 'Create or reuse a job atomically under a unique database constraint.', zh: '利用資料庫唯一約束，以原子方式建立或重用工作。' }, tools: 'PostgreSQL transaction · unique index' },
        { action: { en: 'Run bounded attempts with persisted status and reclaimable worker ownership after a crash.', zh: '限制嘗試次數、持久儲存狀態，並在崩潰後可重新取得工作擁有權。' }, tools: 'Background worker · PostgreSQL job lease' },
        { action: { en: 'Commit outputs once and use a durable delivery record for any notification.', zh: '只提交一次輸出；通知使用持久傳送記錄。' }, tools: 'PostgreSQL transaction · outbox pattern' },
      ],
      result: { en: 'Repeated delivery converges on one logical document/job result with an audit trail.', zh: '重複傳送最終收斂至同一邏輯文件／工作結果，並保留審核記錄。' },
      failure: { en: 'Test crashes before and after commit. External delivery can still duplicate without destination idempotency; expose that limit and reconcile unknown outcomes.', zh: '測試提交前後崩潰；目的地不支援冪等時外部傳送仍可能重複，需說明限制並核對未知結果。' },
    },
  ],
  quality: [
    {
      title: { en: 'Manually checked evaluation cases', zh: '人工核對評估案例' },
      steps: [
        { action: { en: 'Choose versioned reports and write labelled questions with expected figures, pages and allowed answers.', zh: '選擇有版本報告，編寫標記問題及預期數字、頁面與容許答案。' }, tools: 'Versioned JSON dataset · human review' },
        { action: { en: 'Separate development cases from held-out cases grouped by company/report to reduce leakage.', zh: '按公司／報告分組，分開開發與保留案例以減少洩漏。' }, tools: 'Python dataset tooling · Git' },
        { action: { en: 'Run extraction, retrieval, calculation and answer checks separately, including failure cases.', zh: '分開執行擷取、檢索、計算及答案檢查，包括失敗案例。' }, tools: 'pytest · evaluation runner' },
        { action: { en: 'Store raw per-case results and compare with a simple baseline before accepting a change.', zh: '儲存逐案例原始結果，與簡單基準比較後才接納更改。' }, tools: 'CI artifacts · Langfuse evaluation records' },
      ],
      result: { en: 'A reproducible quality report with sample size, failure categories and inspected examples.', zh: '可重現品質報告，包含樣本數、失敗類別及已檢查例子。' },
      failure: { en: 'Do not tune repeatedly on held-out answers or claim mock tests establish live model accuracy. Block releases on agreed critical failures.', zh: '不可反覆依保留答案調校，或聲稱 mock 測試證明即時模型準確率；指定重大失敗阻止發布。' },
    },
    {
      title: { en: 'Trace failures and model cost', zh: '追蹤失敗及模型成本' },
      steps: [
        { action: { en: 'Attach a run/trace ID to the request and propagate it through graph nodes and tools.', zh: '為請求附執行／追蹤 ID，並傳至圖節點及工具。' }, tools: 'FastAPI middleware · LangGraph instrumentation' },
        { action: { en: 'Record timings, provider errors, token usage and model/prompt versions with sensitive data redacted.', zh: '記錄時間、供應商錯誤、token 用量及模型／prompt 版本，並遮罩敏感資料。' }, tools: 'Langfuse · structured logs' },
        { action: { en: 'Calculate cost from actual usage and a dated rate table; keep unavailable usage explicitly unknown.', zh: '按實際用量及有日期費率表計算成本；未取得用量明確保留未知。' }, tools: 'Python usage accounting · PostgreSQL' },
        { action: { en: 'Inspect a failed trace, identify the failing boundary and add a regression case.', zh: '檢查失敗追蹤，找出出錯邊界並加入回歸案例。' }, tools: 'Langfuse trace UI · pytest' },
      ],
      result: { en: 'Traceable failures and measured latency/cost, including cost per successful task.', zh: '可追蹤失敗及實測延遲／成本，包括每次成功任務成本。' },
      failure: { en: 'Missing telemetry is not zero cost. Keep secrets out of logs and avoid turning an optional telemetry outage into a lost analysis result.', zh: '遙測缺失不等於零成本；秘密不可寫入紀錄，選用遙測故障不應令分析結果遺失。' },
    },
    {
      title: { en: 'Reproducible deployment and demo', zh: '可重現部署與展示' },
      steps: [
        { action: { en: 'Pin compatible dependencies and provide sample reports, environment templates and migration commands.', zh: '固定相容依賴，提供範例報告、環境範本及遷移指令。' }, tools: 'Dependency lockfiles · Docker Compose · PostgreSQL migrations' },
        { action: { en: 'Run tests, evaluation gates and image builds for each reviewed change.', zh: '對每個已審閱更改執行測試、評估關卡及映像建置。' }, tools: 'GitHub Actions · pytest · Docker' },
        { action: { en: 'Deploy configured services with server-side secrets, health checks and a retained previous image.', zh: '部署已設定服務，使用伺服器秘密、健康檢查及保留前版映像。' }, tools: 'AWS · Docker · secret storage' },
        { action: { en: 'Run the cited-answer and missing-evidence demos, then rehearse rollback and document limits.', zh: '執行附引用答案及缺證據展示，再演練回滾並記錄限制。' }, tools: 'Browser checks · deployment runbook' },
      ],
      result: { en: 'A reviewer can start the project, reproduce evidence and recover from a failed release.', zh: '審閱者能啟動項目、重現證據，並從失敗發布恢復。' },
      failure: { en: 'Stop rollout on failed health/evaluation checks. Shared deployment requires authentication and per-user report access before exposure.', zh: '健康／評估檢查失敗時停止發布；多人部署公開前需有登入及逐用戶報告權限。' },
    },
  ],
} satisfies Record<string, [FunctionWorkflow, FunctionWorkflow, FunctionWorkflow]>;
