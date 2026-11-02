import type { Copy } from './curriculum';
import type { financeFunctionWorkflows } from './finance-function-workflows';

export type FinanceFunctionExample = {
  scenario: Copy;
  input: Copy;
  output: Copy;
  check: Copy;
  files: string[];
};

export const financeFunctionExamples = {
  library: [
    {
      scenario: { en: 'You upload the demo company’s 2025 annual report so the app can read it later.', zh: '你上載示範公司的 2025 年報，讓應用程式稍後讀取內容。' },
      input: { en: 'One PDF, the company ID, the reporting period and its source URL. The browser sends the file bytes and labels together.', zh: '一份 PDF、公司 ID、報告期間及來源網址；瀏覽器一起傳送檔案內容和標籤。' },
      output: { en: 'First: a job ID and “processing”. Later: the saved report and a list of extracted numbers to review. Store the original on your local disk during development; use the same storage interface with S3 when deployed.', zh: '先收到工作 ID 及「處理中」，之後看到已儲存報告和待覆核數字。開發時原檔存於本機磁碟，部署時透過同一儲存介面改用 S3。' },
      check: { en: 'Upload the same PDF twice: there should be one logical document. Upload a text file renamed .pdf: show a file error and create no extraction job.', zh: '同一 PDF 上載兩次，應只有一份邏輯文件；把文字檔改名為 .pdf 上載，應顯示檔案錯誤，且不建立擷取工作。' },
      files: ['apps/web/app/reports/page.tsx', 'services/finance/app/api/documents.py', 'services/finance/app/storage.py', 'services/finance/app/jobs/tasks.py'],
    },
    {
      scenario: { en: 'The report was labelled with the wrong year. You correct the dates without changing the PDF.', zh: '報告的年份標籤有誤；你修正日期，PDF 內容維持原樣。' },
      input: { en: 'The document version, corrected company and dates, report type, source URL and the metadata revision you originally loaded.', zh: '文件版本、更正的公司及日期、報告類型、來源網址，以及開啟編輯時讀取的標籤版本。' },
      output: { en: 'The library displays the corrected labels and a new revision number. The old labels remain in the edit history.', zh: '財報列表顯示更正標籤及新版本號，編輯歷史保留舊標籤。' },
      check: { en: 'Open the same record in two tabs. Save in one, then save the older form in the other: show a conflict and keep the newer saved labels.', zh: '用兩個分頁開啟同一記錄；先在一頁儲存，再於另一頁提交舊表單，應顯示衝突並保留較新標籤。' },
      files: ['apps/web/app/reports/page.tsx', 'services/finance/app/api/documents.py', 'services/finance/app/schemas.py', 'services/finance/app/db/models.py'],
    },
    {
      scenario: { en: 'The issuer publishes a revised PDF. You add it as version 2 while preserving version 1 for older citations.', zh: '發行人發布修訂 PDF；你新增第 2 版，同時保留第 1 版供舊引用使用。' },
      input: { en: 'The new PDF, the existing document ID, the version it replaces and a reason for the revision.', zh: '新 PDF、已有文件 ID、被取代版本及修訂原因。' },
      output: { en: 'A new version is extracted and indexed separately. Earlier research still opens its original PDF; affected saved results show “review needed”.', zh: '新版本獨立擷取及建立索引；舊研究仍開啟其原來 PDF，受影響的已存結果顯示「需要覆核」。' },
      check: { en: 'After adding version 2, open an old citation and confirm that it still shows version 1. A revision for another company must be rejected.', zh: '新增第 2 版後開啟舊引用，確認仍顯示第 1 版；屬於另一公司的修訂必須被拒絕。' },
      files: ['services/finance/app/api/documents.py', 'services/finance/app/storage.py', 'services/finance/app/jobs/tasks.py', 'services/finance/app/db/models.py'],
    },
  ],
  extraction: [
    {
      scenario: { en: 'You turn a saved PDF table into candidate numbers that a person can check.', zh: '你把已存 PDF 的表格轉成候選數字，交由人員核對。' },
      input: { en: 'A saved document version and a parser configuration. The worker reads the original PDF from the configured storage.', zh: '已存文件版本及解析設定；背景工作從設定的儲存位置讀取原 PDF。' },
      output: { en: 'Text passages and candidate rows retain their year, currency, unit and page. An embedding is a list of numbers used to find similar passages; it does not certify the financial values.', zh: '文字段落及候選列保留年份、貨幣、單位和頁面。嵌入是一組供搜尋相似段落的數字，不代表財務數值已獲確認。' },
      check: { en: 'Use one checked text PDF and compare a candidate with its table. Try an image-only scan: show that OCR or manual handling is needed, rather than reporting an empty extraction as verified.', zh: '用一份已核對文字 PDF，對照候選數字及原表；再試純掃描檔，應提示需要 OCR 或人工處理，不把空白擷取當成已驗證。' },
      files: ['services/finance/app/api/documents.py', 'services/finance/app/jobs/tasks.py', 'services/finance/app/retrieval.py', 'services/finance/app/db/models.py'],
    },
    {
      scenario: { en: 'You click the source beside a number and need the exact place where it appeared.', zh: '你點選數字旁的來源，想知道它在原報的確切位置。' },
      input: { en: 'An evidence ID such as ev-01. It identifies a saved source record, not a new AI search.', zh: '例如 ev-01 的證據 ID，指向已存來源記錄，而非重新發起 AI 搜尋。' },
      output: { en: 'The response identifies version 1, PDF viewer page 42, printed page label 40 and the table region. PDF page numbers and printed labels can differ because of cover pages.', zh: '回應指出第 1 版、PDF 檢視器第 42 頁、印刷頁碼 40 及表格範圍；封面等頁面可令兩種頁碼不同。' },
      check: { en: 'Confirm that ev-01 targets viewer page 42 rather than page 40. An unknown evidence ID must show “source missing”, without opening a substitute page.', zh: '確認 ev-01 指向檢視器第 42 頁而非第 40 頁；未知證據 ID 應顯示「來源缺失」，不能改開其他頁面。' },
      files: ['apps/web/components', 'services/finance/app/api/documents.py', 'services/finance/app/db/models.py'],
    },
    {
      scenario: { en: 'The parser is unsure about a table value. You inspect the source and correct it to HKD 80 million.', zh: '解析器未能確定表格數值；你查看原文，把它更正為港幣 8,000 萬元。' },
      input: { en: 'The candidate ID, current revision, confirm/correct/reject decision, evidence and review reason. A correction also supplies the checked value.', zh: '候選 ID、目前版本、確認／更正／拒絕決定、證據及覆核原因；更正時亦提供已核對數值。' },
      output: { en: 'A recorded human review and, when accepted, a financial fact available for calculations. Rejected candidates stay outside the calculation dataset.', zh: '產生人工覆核記錄；接納後成為可用於計算的財務數據，已拒絕候選不進入計算資料集。' },
      check: { en: 'Approve one candidate and reject another; only the accepted one should appear in verified facts. A stale candidate revision must require reloading before approval.', zh: '接納一項候選並拒絕另一項，已覆核數據只應包含接納項；候選版本過期時，必須重新載入才可批准。' },
      files: ['apps/web/app/reports/page.tsx', 'services/finance/app/api/facts.py', 'services/finance/app/domain/reviews.py', 'services/finance/app/db/models.py'],
    },
  ],
  facts: [
    {
      scenario: { en: 'You open a company’s financial summary and request the five agreed metrics for 2025.', zh: '你開啟公司財務摘要，查看 2025 年五項已約定指標。' },
      input: { en: 'Company, year, report version and the metric IDs for revenue, profit, cash flow, assets and liabilities.', zh: '公司、年份、報告版本，以及收入、盈利、現金流、資產和負債的指標 ID。' },
      output: { en: 'If only cash flow has been reviewed, show HKD 80 million with its evidence and label the other four metrics missing. The API reads checked database rows; it does not ask an LLM to fill gaps.', zh: '若只有現金流已覆核，顯示港幣 8,000 萬元及證據，其餘四項標示缺失；API 讀取已核對資料列，不要求 LLM 補造空缺。' },
      check: { en: 'Seed one accepted metric and one unreviewed candidate. Only the accepted metric should appear; missing metrics must not become zero.', zh: '放入一項已接納指標及一項未覆核候選，只應顯示已接納指標；缺失指標不可變成零。' },
      files: ['apps/web/app/workspace/page.tsx', 'services/finance/app/api/facts.py', 'services/finance/app/db/models.py'],
    },
    {
      scenario: { en: 'One report shows “80” in millions. You need the amount in base currency units before comparing it.', zh: '一份報告以百萬元列出「80」；比較前，你需要換成基本貨幣單位。' },
      input: { en: 'The reviewed fact with value 80.00, currency HKD, scale 1,000,000 and target scale 1.', zh: '已覆核數據：數值 80.00、貨幣 HKD、單位倍數 1,000,000，以及目標倍數 1。' },
      output: { en: 'Python Decimal calculates 80 × 1,000,000 = HKD 80,000,000. Keep the original value and fiscal period beside it. This changes the display unit, not the currency.', zh: 'Python Decimal 計算 80 × 1,000,000 = 港幣 80,000,000 元，並保留原值和財政期間；這是換算顯示單位，沒有兌換貨幣。' },
      check: { en: 'Check that 80 million and 80,000 thousand normalize equally. Remove the scale from a fixture: request a review instead of guessing the multiplier.', zh: '確認 80 百萬與 80,000 千換算後相等；移除範例的單位倍數，應要求覆核，不可猜測倍數。' },
      files: ['services/finance/app/api/facts.py', 'services/finance/app/domain/calculations.py', 'services/finance/app/schemas.py'],
    },
    {
      scenario: { en: 'A revised issuer report changes cash flow from HKD 80 million to HKD 78 million.', zh: '發行人的修訂報告把現金流由港幣 8,000 萬改為 7,800 萬元。' },
      input: { en: 'The existing fact ID and revision, the revised amount, the new evidence and a reason identifying this as an issuer restatement.', zh: '已有數據 ID 及版本、修訂金額、新證據，以及說明這是發行人重列的原因。' },
      output: { en: 'Create a new fact linked to the earlier amount. Keep both in history and mark briefs based on the old value as needing review.', zh: '新增與舊金額相連的數據，歷史保留兩者；使用舊數值的摘要標示為需要覆核。' },
      check: { en: 'Open a saved brief after revising its source fact: it should show a source-change warning. Submitting a revision without evidence must leave the existing fact untouched.', zh: '修訂來源數據後開啟已存摘要，應顯示來源變更提示；提交沒有證據的修訂時，原有數據應維持不變。' },
      files: ['services/finance/app/api/facts.py', 'services/finance/app/domain/reviews.py', 'services/finance/app/db/models.py', 'apps/web/app/workspace/page.tsx'],
    },
  ],
  research: [
    {
      scenario: { en: 'You ask: “Why did operating cash flow fall from 2024 to 2025?”', zh: '你問：「經營現金流為何由 2024 年到 2025 年下跌？」' },
      input: { en: 'The question, company, two years, selected report versions and answer language. LangGraph carries these choices through each analysis step.', zh: '問題、公司、兩個年份、所選報告版本及答案語言；LangGraph 在每個分析步驟保留這些選擇。' },
      output: { en: 'Retrieve relevant passages, calculate the change in code, then give that evidence to the LLM to draft an answer. With 100 million falling to 80 million, return −20% with citations. If no cause is evidenced, say so explicitly.', zh: '先找相關段落，以程式計算變動，再把證據交予 LLM 草擬答案；由 1 億跌至 8,000 萬，回傳 −20% 及引用。若沒有原因證據，明確說明。' },
      check: { en: 'Use a fixture containing the two amounts but no explanation. Expect a cited −20% partial answer, with no invented cause. Stop the model service and confirm the run shows a visible failure.', zh: '用只有兩個金額而無解釋的範例，應得到附引用的 −20% 部分答案，不編造原因；停止模型服務後，執行應顯示明確失敗。' },
      files: ['apps/web/app/research/page.tsx', 'services/finance/app/api/research.py', 'services/finance/app/agents/graph.py', 'services/finance/app/retrieval.py'],
    },
    {
      scenario: { en: 'You search for cash-flow explanations before generating an answer.', zh: '你先搜尋現金流解釋，再決定是否產生答案。' },
      input: { en: 'A search query, allowed report versions and a small result limit. The embedding model turns the query into numbers that can be compared with saved passage vectors.', zh: '搜尋文字、可存取報告版本及少量結果上限；嵌入模型把查詢轉成數字，與已存段落向量比較。' },
      output: { en: 'A ranked list of passages with exact source links. pgvector finds similar meaning; keyword matching helps retain financial terms. This step returns evidence, before the chat LLM writes anything.', zh: '得到附確切來源連結、按相關度排列的段落；pgvector 尋找相似意思，關鍵詞比對補充財務用語。這一步先回傳證據，聊天 LLM 尚未撰寫答案。' },
      check: { en: 'Add a very similar passage from another company or year. It must stay outside the selected scope. An empty search should return “no evidence found”, not an unrelated passage.', zh: '加入另一公司或年份的高度相似段落，它必須被範圍篩選排除；搜尋無結果時應顯示「找不到證據」，不回傳無關段落。' },
      files: ['apps/web/app/research/page.tsx', 'services/finance/app/api/research.py', 'services/finance/app/retrieval.py', 'services/finance/app/db/models.py'],
    },
    {
      scenario: { en: 'A draft says “cash flow fell 20% because customers paid late”. You check each part against the saved evidence.', zh: '草稿寫道「現金流因客戶延遲付款而下跌 20%」；你逐項核對已存證據。' },
      input: { en: 'The saved research run and answer version. Load its original evidence snapshot, rather than letting the browser supply replacement evidence.', zh: '已存研究執行及答案版本；載入原有證據快照，不讓瀏覽器替換驗證證據。' },
      output: { en: 'Keep the 20% calculation when the amounts support it. Remove the late-payment claim if no passage supports it. Model checking is one fallible signal; rules and human review still matter.', zh: '金額支持 20% 計算便保留；沒有段落支持延遲付款原因便移除。模型檢查可能出錯，仍須程式規則及人工覆核。' },
      check: { en: 'Verify a draft with one supported number and one unsupported cause. Show the kept claim, removed claim and missing evidence. An outdated answer version must show a conflict.', zh: '驗證包含一項有支持數字及一項無支持原因的草稿，應列出保留、移除主張及缺失證據；答案版本過期時應顯示衝突。' },
      files: ['services/finance/app/api/research.py', 'services/finance/app/agents/graph.py', 'services/finance/app/domain/calculations.py', 'evals'],
    },
  ],
  comparison: [
    {
      scenario: { en: 'You compare reviewed cash flow of HKD 100 million in 2024 with HKD 80 million in 2025.', zh: '你比較已覆核的現金流：2024 年港幣 1 億元，2025 年港幣 8,000 萬元。' },
      input: { en: 'The two fact IDs and display precision. The server reloads their checked amounts and confirms that periods, currency and definitions can be compared.', zh: '兩個數據 ID 及顯示精度；伺服器重新讀取已核對金額，確認期間、貨幣及定義可比較。' },
      output: { en: 'Show (80 − 100) ÷ 100 × 100 = −20.00%, the HKD 20 million decrease and both citations. Python Decimal performs the arithmetic.', zh: '顯示 (80 − 100) ÷ 100 × 100 = −20.00%、減少港幣 2,000 萬元及兩項引用；算術由 Python Decimal 執行。' },
      check: { en: 'Assert the result before display rounding. Replace the prior amount with zero: show that percentage change is undefined and retain the absolute movement.', zh: '在顯示捨入前核對結果；把上期金額改為零，應顯示百分比變動無定義，並保留絕對變動。' },
      files: ['apps/web/app/compare/page.tsx', 'services/finance/app/api/comparisons.py', 'services/finance/app/domain/calculations.py', 'tests'],
    },
    {
      scenario: { en: 'You put two companies side by side to compare the same annual cash-flow metric.', zh: '你並排查看兩間公司，比較相同的年度現金流指標。' },
      input: { en: 'Two company IDs, the metric and reporting year. Each cell is checked against its own source metadata.', zh: '兩間公司的 ID、指標及報告年份；每個儲存格都按自己的來源標籤核對。' },
      output: { en: 'Show compatible values with citations. If the second company reports in another currency, show a labelled gap instead of silently treating its amount as HKD.', zh: '顯示可比較數值及引用；若第二間公司使用另一貨幣，顯示附原因空缺，不暗中當作港幣。' },
      check: { en: 'Compare an HKD fixture with a USD fixture. The mismatched cell must be blocked while the valid cell stays visible; no automatic exchange rate should appear.', zh: '比較 HKD 及 USD 範例，不相符欄位必須被阻擋，但有效欄位仍可見；不可自動出現匯率換算。' },
      files: ['apps/web/app/compare/page.tsx', 'services/finance/app/api/comparisons.py', 'services/finance/app/domain/calculations.py'],
    },
    {
      scenario: { en: 'You accidentally select a full-year amount and a six-month amount for a year-on-year comparison.', zh: '你意外選了全年金額及六個月金額作按年比較。' },
      input: { en: 'The selected fact IDs and the intended comparison, such as year-on-year growth.', zh: '所選數據 ID 及比較目的，例如按年增長。' },
      output: { en: 'Return “not comparable” with the period mismatch. HTTP 200 means the check completed successfully; compatible: false means the calculation should not proceed.', zh: '回傳「不可比較」及期間不相符原因；HTTP 200 代表檢查已成功完成，compatible: false 代表計算不可繼續。' },
      check: { en: 'Test a matching annual pair and an annual-versus-interim pair. The second must give a clear blocker even when both amounts are valid numbers.', zh: '測試相符全年組合，以及全年對中期組合；即使兩個金額都是有效數字，後者仍須回傳清楚阻擋原因。' },
      files: ['services/finance/app/api/comparisons.py', 'services/finance/app/domain/calculations.py', 'services/finance/app/db/models.py', 'tests'],
    },
  ],
  workspace: [
    {
      scenario: { en: 'You choose a company and a year range to see its cash-flow trend.', zh: '你選擇公司及年份範圍，查看現金流趨勢。' },
      input: { en: 'Company, metric and start/end periods from the dashboard filters.', zh: '儀表板篩選器中的公司、指標及起訖期間。' },
      output: { en: 'A table and chart display reviewed values with source links. If 2024 is missing and 2025 is 80 million, show the 2024 gap rather than a line rising from zero.', zh: '表格及圖表顯示已覆核數值與來源連結；若缺少 2024 年而 2025 年為 8,000 萬，顯示 2024 年空缺，不畫成由零上升的線。' },
      check: { en: 'Load a fixture with a missing year. Confirm that it stays empty in both table and chart. Reverse the date range and show a filter error.', zh: '載入缺少年份的範例，確認表格及圖表均保留空缺；倒轉日期範圍時，應顯示篩選錯誤。' },
      files: ['apps/web/app/workspace/page.tsx', 'apps/web/components', 'services/finance/app/api/facts.py'],
    },
    {
      scenario: { en: 'You open a citation to check the actual PDF page behind an answer.', zh: '你開啟引用，查看答案背後的實際 PDF 頁面。' },
      input: { en: 'An evidence ID and an authenticated request for its PDF. The viewer reads the saved target page from the evidence metadata.', zh: '證據 ID 及已驗證身分的 PDF 請求；檢視器從證據資料讀取已存目標頁碼。' },
      output: { en: 'The backend checks permission and streams PDF bytes from local storage during development or S3 after deployment. PDF.js opens the correct version and page.', zh: '後端核對權限，再由開發時的本機儲存或部署後的 S3 串流 PDF 內容；PDF.js 開啟正確版本及頁面。' },
      check: { en: 'Open the citation and compare the visible page with the fixture. Remove file access: show an access error and do not expose an unrestricted storage link.', zh: '開啟引用，對照畫面頁面與範例；移除檔案權限後，應顯示拒絕存取，不提供無限制儲存連結。' },
      files: ['apps/web/components', 'services/finance/app/api/documents.py', 'services/finance/app/storage.py'],
    },
    {
      scenario: { en: 'You turn a research answer into a short editable brief while keeping its citations.', zh: '你把研究答案整理成可編輯短摘要，同時保留引用。' },
      input: { en: 'The brief ID, the revision you opened, edited text blocks and evidence IDs. Keep the originating run separately from editable prose.', zh: '摘要 ID、開啟時的版本、已修改文字區塊及證據 ID；來源研究執行與可編輯文字分開保留。' },
      output: { en: 'Save a new brief revision and show its source links. A user edit changes their notes; it does not rewrite the source financial facts.', zh: '儲存新摘要版本並顯示來源連結；使用者編輯的是筆記，不會改寫來源財務數據。' },
      check: { en: 'Edit and reload a brief: text and citations should survive. Save an older copy from a second tab: keep its draft and ask the user to resolve the conflict.', zh: '編輯後重新載入摘要，文字及引用應保留；從第二個分頁儲存舊副本，應保留草稿並要求處理衝突。' },
      files: ['apps/web/app/workspace/page.tsx', 'services/finance/app/api/briefs.py', 'services/finance/app/db/models.py'],
    },
  ],
  automation: [
    {
      scenario: { en: 'An analysis pauses for a human review. After an authorized review, you continue from the saved step.', zh: '分析暫停等待人工覆核；獲准人員覆核後，你從已存步驟繼續。' },
      input: { en: 'The run ID, saved checkpoint, expected state version and stored human review ID. A checkpoint is the analysis’s saved progress.', zh: '執行 ID、已存檢查點、預期狀態版本及已存人工覆核 ID；檢查點就是分析的進度存檔。' },
      output: { en: 'HTTP 202 acknowledges continuation. Poll the same run until it completes, fails or pauses again. LangGraph restores the saved context; the database still controls permission to resume.', zh: 'HTTP 202 表示已接納繼續執行；輪詢同一執行，直至完成、失敗或再次暫停。LangGraph 恢復已存背景資料，資料庫仍控制恢復權限。' },
      check: { en: 'Restart the local worker after a checkpoint, then resume with a valid review. An old checkpoint or an unapproved reviewer must be rejected without launching another continuation.', zh: '儲存檢查點後重啟本機背景工作，再以有效覆核恢復；舊檢查點或未獲准覆核者必須被拒絕，不另啟繼續執行。' },
      files: ['apps/web/app/research/page.tsx', 'services/finance/app/api/research.py', 'services/finance/app/agents/graph.py', 'services/finance/app/jobs/tasks.py'],
    },
    {
      scenario: { en: 'You test importing one approved PDF with a local script, then connect the same API to n8n during the Docker rehearsal.', zh: '你先以本機腳本測試匯入一份獲准 PDF，再於 Docker 演練把同一 API 接到 n8n。' },
      input: { en: 'A stable event ID, approved source, document URL, company and period. The script (or a supported native n8n release) sends a private service credential to your local API.', zh: '固定事件 ID、獲准來源、文件網址、公司及期間；腳本（或受支援的本機 n8n 版本）向本機 API 傳送私人服務憑證。' },
      output: { en: 'The API returns a durable job ID. The caller polls until the worker finishes downloading and extracting; the library then shows the result.', zh: 'API 回傳持久工作 ID；呼叫者透過輪詢等待背景工作下載及擷取完成，財報列表才顯示結果。' },
      check: { en: 'Replay the same event and confirm that it reuses one logical job. Try an unapproved download URL: reject it before any file is fetched.', zh: '重播同一事件，確認重用同一邏輯工作；嘗試未獲准下載網址，必須在讀取檔案前拒絕。' },
      files: ['workflows/n8n', 'services/finance/app/api/ingestion.py', 'services/finance/app/jobs/tasks.py', 'services/finance/app/db/models.py'],
    },
    {
      scenario: { en: 'A temporary download failure stops a job. You retry the same job after fixing the connection.', zh: '暫時下載失敗令工作停止；修復連線後，你重試同一工作。' },
      input: { en: 'The failed job ID, the attempt number you last saw and a stable retry key. The backend checks whether another attempt is already running.', zh: '失敗工作 ID、最後看到的嘗試次數及固定重試鍵；後端檢查是否已有另一次執行正在進行。' },
      output: { en: 'A later attempt runs under the same job identity. The user sees one document and the attempt history, rather than a second copy of the report.', zh: '後續嘗試沿用同一工作身分；使用者看到一份文件及嘗試歷史，不會新增另一份報告副本。' },
      check: { en: 'Submit two retry requests together: only one attempt should acquire the job. When the configured retry limit is reached, show an inspection message instead of looping forever.', zh: '同時提交兩次重試，只應有一次取得執行權；達設定重試上限時，顯示需要檢查，不可無限循環。' },
      files: ['services/finance/app/api/operations.py', 'services/finance/app/jobs/tasks.py', 'services/finance/app/db/models.py', 'tests'],
    },
  ],
  quality: [
    {
      scenario: { en: 'You change the research prompt and want to know whether it still answers checked examples correctly.', zh: '你修改研究提示，想知道它是否仍能正確回答已核對範例。' },
      input: { en: 'A versioned test dataset, the old configuration and the candidate configuration, including the model and prompt versions.', zh: '有版本的測試資料集、原有設定及候選設定，包括模型與提示版本。' },
      output: { en: 'A case-by-case report checks arithmetic, citations, evidence support and appropriate missing-evidence responses. The evaluation can complete successfully while its release decision is “blocked”.', zh: '逐案報告檢查算術、引用、證據支持及缺失證據處理；評估可成功完成，但發佈決定仍是「阻擋」。' },
      check: { en: 'Run locally with a deliberately wrong-year answer fixture. The report must identify that failed case and block release. A missing dataset should fail the evaluation itself.', zh: '本機執行時故意加入錯年份答案，報告必須指出該失敗案例並阻擋發佈；測試集缺失時，評估工作本身應失敗。' },
      files: ['evals', 'services/finance/app/api/operations.py', 'services/finance/app/jobs/tasks.py', 'tests'],
    },
    {
      scenario: { en: 'An answer is slow or fails. You inspect which step took time and whether model usage was recorded.', zh: '答案產生緩慢或失敗；你檢查哪一步耗時，以及是否記錄模型用量。' },
      input: { en: 'A trace ID from the failed or slow run, opened with operator access. A trace is a timeline of the request’s steps.', zh: '以操作人員權限開啟失敗或緩慢執行的追蹤 ID；追蹤就是請求各步驟的時間記錄。' },
      output: { en: 'Show retrieval and model timings, configuration versions and token usage. Calculate cost only with recorded prices; otherwise display “unknown”.', zh: '顯示檢索及模型耗時、設定版本和 token 用量；只有已記錄價格才計算成本，否則顯示「未知」。' },
      check: { en: 'Inspect a local run with missing pricing data: cost must be unknown, not zero. A normal reader must not be able to open operator traces or see service credentials.', zh: '檢查缺少價格資料的本機執行，成本必須是未知而非零；普通讀者不可開啟操作追蹤或看見服務憑證。' },
      files: ['services/finance/app/api/operations.py', 'services/finance/app/agents/graph.py', 'services/finance/app/db/models.py', 'evals'],
    },
    {
      scenario: { en: 'Your local user journeys work. At the deployment stage, you package the app with Docker and release it to EC2.', zh: '本機使用流程已能運作；到部署階段，你才用 Docker 封裝應用程式並發布到 EC2。' },
      input: { en: 'A tested Git commit, deployment configuration and runtime secrets kept outside the images. Build images, then test the Compose services locally before publishing them.', zh: '已測試 Git 提交、部署設定，以及放在映像之外的執行機密；先建立映像，在本機測試 Compose 服務後才發布。' },
      output: { en: 'A release record identifies the image versions running on EC2. The hosted page uses DNS, HTTPS and Caddy; readiness checks and a real cited-answer journey confirm the release works.', zh: '發佈記錄指出 EC2 正在執行的映像版本；託管頁面使用 DNS、HTTPS 及 Caddy，再透過就緒檢查與附引用答案流程確認可用。' },
      check: { en: 'In the local Compose rehearsal, stop the API and confirm readiness fails. On EC2, test the demo and persistent data; a failed release must stop or roll back only to a schema-compatible image.', zh: '本機 Compose 演練時停止 API，確認就緒檢查失敗；在 EC2 測試示範及持久資料。發佈失敗時必須停止，或只回滾至資料結構相容映像。' },
      files: ['deploy/compose.yaml', 'deploy/Caddyfile', '.github/workflows', 'tests'],
    },
  ],
} satisfies Record<keyof typeof financeFunctionWorkflows, [FinanceFunctionExample, FinanceFunctionExample, FinanceFunctionExample]>;
