import type { Copy } from './curriculum';
import type { financeFunctionWorkflows } from './finance-function-workflows';

export type FinanceIllustration = {
  src: string;
  width: number;
  height: number;
  alt: Copy;
  caption: Copy;
  steps: (Copy & { keyword: string })[];
};

export const financeOverviewIllustration: FinanceIllustration = {
  src: '/finance-illustrations/v1/overview.webp', width: 1536, height: 1024,
  alt: {
    en: 'Five illustrated stations connect annual reports, careful table extraction, tagged financial facts, a question with evidence and a calculator, and an analyst checking a cited brief against its original report.',
    zh: '五個圖像場景連接年報、仔細擷取表格、附標籤財務數據、問題與證據及計算機，以及對照原報覆核附引用摘要的分析員。',
  },
  caption: { en: 'Follow a report from its original source to an answer a person can check.', zh: '跟著一份報告，由原始來源走到可由人核對的答案。' },
  steps: [
    { keyword: 'Reports', en: 'Collect public reports and keep the originals.', zh: '收集公開財報，保留原檔。' },
    { keyword: 'Extraction', en: 'Read the tables while keeping their page references.', zh: '讀取表格，同時保留頁面參照。' },
    { keyword: 'Facts', en: 'Store facts with currency, period and source labels.', zh: '為數據記錄貨幣、期間及來源標籤。' },
    { keyword: 'RAG', en: 'Retrieve evidence and calculate with code before explaining.', zh: '先檢索證據及用程式計算，再作解釋。' },
    { keyword: 'Review', en: 'Compare the answer with the original evidence and review it.', zh: '把答案與原始證據對照並覆核。' },
  ],
};

export const financeAreaIllustrations = {
  library: {
    src: '/finance-illustrations/v1/library.webp', width: 1536, height: 1024,
    alt: { en: 'A report enters an upload tray, receives company/calendar/source tags, goes into a linked archive, and remains available beside a later revision.', zh: '報告放入上載托盤，附公司／日曆／來源標籤，進入有索引的檔案庫，並與日後修訂版本一同保留。' },
    caption: { en: 'Think of the report library as an archive with labels and a revision history.', zh: '把財報資料庫想成有標籤及修訂歷史的檔案庫。' },
    steps: [
      { keyword: 'Upload', en: 'Upload the report.', zh: '上載報告。' },
      { keyword: 'Metadata', en: 'Label its company, period and source.', zh: '標示公司、期間及來源。' },
      { keyword: 'Storage', en: 'Keep the original and a searchable record.', zh: '保留原檔及可搜尋記錄。' },
      { keyword: 'Versioning', en: 'Keep revisions linked to the original.', zh: '保留修訂版與原版的連結。' },
    ],
  },
  extraction: {
    src: '/finance-illustrations/v1/extraction.webp', width: 1536, height: 1024,
    alt: { en: 'A magnifying glass examines a report table, cells become structured cards, cards retain page bookmarks, and a reviewer checks an uncertain value against the original.', zh: '放大鏡檢查財報表格，儲存格轉為結構化卡片，卡片保留頁面書籤，覆核者再對照原文檢查不確定數值。' },
    caption: { en: 'Extraction is careful reading: move information into cards without losing where it came from.', zh: '擷取就像仔細閱讀：把資料轉成卡片，同時保留出處。' },
    steps: [
      { keyword: 'PDF Parser', en: 'Read the PDF text and tables.', zh: '讀取 PDF 文字及表格。' },
      { keyword: 'Table Data', en: 'Turn rows into candidate facts.', zh: '把資料列轉成候選數據。' },
      { keyword: 'Page ID', en: 'Keep each candidate linked to its page.', zh: '每項候選數據保留原頁連結。' },
      { keyword: 'Review', en: 'Ask a person to review uncertainty.', zh: '把不確定內容交予人覆核。' },
    ],
  },
  facts: {
    src: '/finance-illustrations/v1/facts.webp', width: 1536, height: 1024,
    alt: { en: 'Financial values become tagged tokens with currency, scale and calendar context, accepted tokens enter a ledger, and original and corrected records are retained together.', zh: '財務數值轉為附貨幣、單位及日曆背景的標籤項目，已接納項目進入帳冊，並一同保留原始及更正記錄。' },
    caption: { en: 'A number needs a label: what it measures, when, in which currency and from which source.', zh: '數字需要標籤：代表甚麼、哪個期間、甚麼貨幣，以及來自哪裏。' },
    steps: [
      { keyword: 'Metrics', en: 'Identify the financial metric.', zh: '識別財務指標。' },
      { keyword: 'Units', en: 'Attach currency, scale and period.', zh: '附上貨幣、單位及期間。' },
      { keyword: 'Verified', en: 'Store accepted facts; keep missing values explicit.', zh: '儲存已接納數據，明確保留缺失值。' },
      { keyword: 'Audit Trail', en: 'Record corrections without erasing history.', zh: '記錄更正，同時保留歷史。' },
    ],
  },
  research: {
    src: '/finance-illustrations/v1/research.webp', width: 1536, height: 1024,
    alt: { en: 'A scoped question leads to a search among report pages, selected evidence and a calculator support a draft, and a reviewer checks citations while an unresolved question stays open.', zh: '有範圍的問題引導財報頁面搜尋，選定證據與計算機支持草稿，覆核者檢查引用，而未解問題保持未解。' },
    caption: { en: 'Research is an open-book task. Find the relevant pages before drafting the answer.', zh: '研究像開卷作答：先找相關頁面，再草擬答案。' },
    steps: [
      { keyword: 'Query', en: 'Ask about a specific company and period.', zh: '針對指定公司及期間提問。' },
      { keyword: 'Retrieval', en: 'Retrieve relevant evidence from the right reports.', zh: '從正確財報檢索相關證據。' },
      { keyword: 'Generation', en: 'Use evidence and calculated results to draft.', zh: '利用證據及計算結果草擬答案。' },
      { keyword: 'Citations', en: 'Check citations and leave unsupported points unanswered.', zh: '核對引用，不為無證據內容編造答案。' },
    ],
  },
  comparison: {
    src: '/finance-illustrations/v1/comparison.webp', width: 1536, height: 1024,
    alt: { en: 'Two companies and reports are selected, matching calendars/currencies/scales are aligned, approved values enter a calculator, and side-by-side charts retain source bookmarks.', zh: '選擇兩間公司及財報，對齊日曆／貨幣／單位，把已通過數值送進計算機，並排圖表保留來源書籤。' },
    caption: { en: 'Compare like with like before calculating or drawing the chart.', zh: '先確保比較口徑相同，再計算或繪圖。' },
    steps: [
      { keyword: 'Select', en: 'Choose companies and metrics.', zh: '選擇公司及指標。' },
      { keyword: 'Validate', en: 'Check compatible periods, units and definitions.', zh: '檢查期間、單位及定義相容。' },
      { keyword: 'Calculate', en: 'Calculate with deterministic tools.', zh: '用確定性工具計算。' },
      { keyword: 'Compare', en: 'Show the comparison with its input sources.', zh: '顯示比較及其輸入來源。' },
    ],
  },
  workspace: {
    src: '/finance-illustrations/v1/workspace.webp', width: 1536, height: 1024,
    alt: { en: 'An analyst selects company and calendar cards, views charts, opens a bookmarked source PDF, and edits a research brief while keeping links to the original evidence.', zh: '分析員選擇公司及日曆卡片、查看圖表、開啟附書籤來源 PDF，並在保留原始證據連結的情況下編輯摘要。' },
    caption: { en: 'The workspace connects the chart, its evidence and your research notes.', zh: '工作區把圖表、證據及研究筆記連在一起。' },
    steps: [
      { keyword: 'Filter', en: 'Choose what to investigate.', zh: '選擇研究對象。' },
      { keyword: 'Dashboard', en: 'Explore the reviewed figures and trends.', zh: '查看已覆核數據及趨勢。' },
      { keyword: 'Evidence', en: 'Open a citation to inspect the original page.', zh: '開啟引用，檢查原始頁面。' },
      { keyword: 'Brief', en: 'Edit a brief while preserving source links.', zh: '編輯摘要，同時保留來源連結。' },
    ],
  },
  automation: {
    src: '/finance-illustrations/v1/automation.webp', width: 1536, height: 1024,
    alt: { en: 'A scheduled inbox event passes a checked doorway, becomes a durable work ticket, moves through a checkpointed analysis graph, and finishes with one recorded completion and notification.', zh: '排程收件事件通過已檢查入口、轉成持久工作票、經過有檢查點分析圖，最後形成一項已記錄完成結果及通知。' },
    caption: { en: 'Automation is a relay: n8n starts the job; the backend and LangGraph carry out and remember the analysis.', zh: '自動化像接力：n8n 啟動工作，後端及 LangGraph 執行並記住分析狀態。' },
    steps: [
      { keyword: 'Trigger', en: 'Trigger an approved ingestion event.', zh: '觸發獲准匯入事件。' },
      { keyword: 'Job Queue', en: 'Create or reuse a durable job.', zh: '建立或重用持久工作。' },
      { keyword: 'Checkpoint', en: 'Process with checkpoints and bounded retries.', zh: '以檢查點及有限重試處理。' },
      { keyword: 'Notify', en: 'Record completion before sending a notification.', zh: '先記錄完成，再發送通知。' },
    ],
  },
  quality: {
    src: '/finance-illustrations/v1/quality.webp', width: 1536, height: 1024,
    alt: { en: 'A human prepares checked report cases, expected and produced answers are compared, a trace reveals a mismatch, and a corrected software package is deployed with its previous version retained.', zh: '人員準備已核對財報案例、比較預期與產生答案、用追蹤找出差異，最後部署已更正軟件並保留前一版本。' },
    caption: { en: 'Prove the result, find the failure and keep a path back to a working version.', zh: '證明結果、找出失敗，並保留回到可用版本的路徑。' },
    steps: [
      { keyword: 'Test Set', en: 'Prepare manually checked evaluation cases.', zh: '準備人工核對評估案例。' },
      { keyword: 'Evaluate', en: 'Compare expected and actual outputs.', zh: '比較預期及實際輸出。' },
      { keyword: 'Trace', en: 'Trace mistakes, time and model usage.', zh: '追蹤錯誤、時間及模型用量。' },
      { keyword: 'Deploy', en: 'Deploy a tested version and retain rollback.', zh: '部署已測試版本，保留回滾能力。' },
    ],
  },
} satisfies Record<keyof typeof financeFunctionWorkflows, FinanceIllustration>;
