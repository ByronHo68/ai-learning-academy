import type { Copy } from './curriculum';
import type { FinanceDiagram } from './finance-diagrams';

const copy = (en: string, zh: string): Copy => ({ en, zh });

export type N8nChannel = 'app' | 'n8n' | 'outside' | 'stop';
export type N8nStage = 'ask' | 'scope' | 'call' | 'n8n' | 'receipt' | 'pin' | 'handoff';

export type N8nStep = {
  id: string;
  stage: N8nStage;
  tone: 'go' | 'wait' | 'stop';
  title: Copy;
  from: Copy;
  to: Copy;
  channel: N8nChannel;
  message: string;
  explanation: Copy;
};

export type N8nScenario = {
  id: string;
  title: Copy;
  prompt: Copy;
  stageLabels?: Partial<Record<N8nStage, Copy>>;
  steps: [N8nStep, ...N8nStep[]];
};

const you = copy('You', '你');
const app = copy('Research app', '研究 app');
const n8n = copy('n8n', 'n8n');
const adapter = copy('YFinance adapter', 'YFinance adapter');
const db = copy('PostgreSQL', 'PostgreSQL');
const dailyProviders = copy('Approved macro / geopolitical API or RSS', '核准宏觀／地緣 API 或 RSS');

const hop = (
  id: string,
  stage: N8nStage,
  tone: N8nStep['tone'],
  title: Copy,
  from: Copy,
  to: Copy,
  channel: N8nChannel,
  message: string,
  explanation: Copy,
): N8nStep => ({ id, stage, tone, title, from, to, channel, message, explanation });

const stageDefinitions = {
  ask: { id: 'ask', label: copy('Your question', '你的問題') },
  scope: { id: 'scope', label: copy('Scope gate', '範圍檢查') },
  call: { id: 'call', label: copy('App calls once', 'App 只叫一次') },
  n8n: { id: 'n8n', label: copy('Inside n8n', 'n8n 內部') },
  receipt: { id: 'receipt', label: copy('Receipt', '收據') },
  pin: { id: 'pin', label: copy('Pinned snapshot', '固定快照') },
  handoff: { id: 'handoff', label: copy('Review → report', '覆核 → 報告') },
} satisfies Record<N8nStage, { id: N8nStage; label: Copy }>;
export const n8nStages = Object.values(stageDefinitions);

export const n8nRoles = [
  { name: 'LangGraph host', job: copy('Checks the question, then calls refresh_company_news once.', '檢查問題，然後只呼叫 refresh_company_news 一次。') },
  { name: 'n8n', job: copy('Validates the call, fetches news, retries a short outage, saves rows, and returns a receipt.', '驗證呼叫、抓新聞、短暫故障就重試、保存紀錄，然後交回收據。') },
  { name: 'YFinance adapter', job: copy('Private HTTP bridge on port 8002. n8n calls POST /news or POST /quote.', '私人 HTTP 橋接，埠 8002。n8n 呼叫 POST /news 或 POST /quote。') },
  { name: 'PostgreSQL', job: copy('Stores versioned news. The n8n ingestion role cannot write reports, selections or checkpoints.', '保存版本新聞；n8n 匯入角色不能寫報告、選取或 checkpoint。') },
  { name: 'Research graph + model', job: copy('Searches the snapshot, ranks evidence, optionally pauses for review, rechecks coverage, then generates and validates the cited report.', '搜尋快照、排序、可選暫停覆核及重查覆蓋後，才生成及驗證引用報告。') },
];

export const n8nLimits = [
  { value: '1', label: copy('logical refresh per question', '每題一次邏輯刷新') },
  { value: '3', label: copy('provider attempts, then stop', '供應商最多 3 次，然後停止') },
  { value: '10s', label: copy('cap on each news call', '每次新聞呼叫上限') },
  { value: '25s', label: copy('whole acquisition budget', '整段抓取預算') },
];

export const n8nStart = [
  copy('Run n8n as a separate service using the official Docker Compose guide. Pin a reviewed stable image version. The office website remains a dependency-free Node 18 bundle; n8n runs in its own container.', 'n8n 按官方 Docker Compose 指南獨立執行，固定已核對的 stable 映像版本。Office 網站仍是免依賴 Node 18 bundle；n8n 在自己的容器執行。'),
  copy('Configure PostgreSQL for n8n metadata with DB_TYPE=postgresdb and the settings below. Create an n8n_metadata database and its own role; keep research evidence and LangGraph checkpoints in separate databases. Bind the editor to 127.0.0.1:5678, persist the n8n data directory and its encryption key, then create the owner account in the local editor.', '設定 DB_TYPE=postgresdb 及下方參數，建立獨立 n8n_metadata 資料庫和角色。研究證據及 LangGraph checkpoints 使用不同資料庫。編輯器綁定 127.0.0.1:5678，持久保存 n8n 資料目錄及加密金鑰，再在本機編輯器建立擁有者帳戶。'),
  copy('Practice with Manual Trigger → Edit Fields (symbol MSFT) → Execute. Inspect the execution. This practice workflow does not fetch news or populate the finance database.', '先練習 Manual Trigger → Edit Fields（symbol MSFT）→ Execute，再看執行紀錄；這條練習不抓新聞或寫入金融資料庫。'),
  copy('Create a called sub-workflow with explicit inputs, then connect an MCP Server Trigger to a Custom n8n Workflow Tool named refresh_company_news. Use authenticated Streamable HTTP. Test URLs work while listening; after publishing, configure the host with the production URL and its separate MCP credential.', '建立明確輸入的子流程，再將 MCP Server Trigger 連接名為 refresh_company_news 的 Custom n8n Workflow Tool。使用已認證 Streamable HTTP；測試 URL 要保持 listening，發布後 host 改用 production URL 及獨立 MCP 憑證。'),
  copy('For company news, use HTTP Request POST /news with X-YFinance-Token in an n8n Header Auth credential. In Docker use http://yfinance-bridge:8002 on a shared private network; native n8n may use 127.0.0.1:8002. POST /quote is a separate numerical observation, outside the news vector index. The Python bridge already exists in integrations/yfinance; these n8n workflows are still proposed.', '公司新聞用 HTTP Request POST /news，X-YFinance-Token 存 n8n Header Auth。Docker 共用私人網絡用 http://yfinance-bridge:8002；本機 n8n 才用 127.0.0.1:8002。POST /quote 為獨立數值觀察，不進新聞向量索引。Python bridge 已在 integrations/yfinance，n8n 流程仍屬建議設計。'),
  copy('Build a second Schedule Trigger workflow for approved macro/geopolitical API or RSS sources. Configure its time and timezone. Validate, deduplicate and commit a complete batch before making it eligible for snapshots; failure keeps the prior completed batch with its original timestamp.', '另建 Schedule Trigger 流程抓核准宏觀／地緣 API 或 RSS，設定時間及時區。驗證、去重並提交完整批次後才可入快照；失敗保留上一完整批次及原時間。'),
];

export const n8nDatabaseEnvironment = `# Example environment for the n8n service, not finance evidence credentials.
# Provision the separate database/role first; keep real secrets out of Git.
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n_metadata
DB_POSTGRESDB_USER=n8n_runtime
DB_POSTGRESDB_PASSWORD=<private-n8n-database-password>
N8N_ENCRYPTION_KEY=<persistent-private-encryption-key>
GENERIC_TIMEZONE=Asia/Hong_Kong
TZ=Asia/Hong_Kong
# Bind Compose ports to 127.0.0.1:5678:5678; persist /home/node/.n8n.
# Evidence writes use a separate ingestion-only PostgreSQL credential in n8n.`;

const reportHandoff: N8nStep[] = [
  hop('search', 'handoff', 'go', copy('Search and rank the snapshot', '搜尋並排序快照'), app, db, 'app', 'full-text default · admitted hybrid may rerank', copy('The research graph searches fixed evidence versions. Reranking measures relevance to the question, not future stock returns. No provider fetch is repeated.', '研究 graph 搜尋固定版本；重排量度問題相關性，不是未來股票回報，也不再抓供應商。')),
  hop('review', 'handoff', 'wait', copy('Optional evidence review', '可選證據覆核'), app, you, 'app', 'highlight / exclude / reset · same snapshot', copy('Automatic mode keeps system recommendations. Review mode checkpoints after ranking. Highlights change emphasis; exclusions trigger a new coverage check. The snapshot stays unchanged.', '自動模式沿用系統建議；覆核模式在排序後保存 checkpoint。標記只改重點，排除後重查覆蓋，快照不變。')),
  hop('gate', 'handoff', 'go', copy('Validate selection and coverage', '驗證選取及覆蓋'), app, app, 'app', 'owner + revision + source IDs + required facets', copy('Only permitted, current and supporting evidence can pass. A gap allows at most one refinement, then insufficient. Review resumes preserve counters and remaining processing time; n8n does not restart.', '只有可用、合時且有支持證據才通過；缺口最多補查一次，再回不足。覆核恢復保留計數及處理餘額，不重啟 n8n。')),
  hop('report', 'handoff', 'go', copy('Generate, validate and save', '生成、驗證及保存'), app, you, 'app', 'fictional sufficient-evidence path · cited report', copy('This teaching case assumes coverage passes. The LLM receives original excerpts, highlights and selection limitations. Release only after citation/support validation and save the report with its selection revision.', '此虛構案例假設覆蓋通過；LLM 收到原文、標記及選取限制。引用及支持驗證後才發布，報告保存所用選取版本。')),
];

export const n8nScenarios: N8nScenario[] = [
  {
    id: 'fresh',
    title: copy('News arrives', '新聞到手'),
    prompt: copy('How could export limits affect NVDA?', '出口限制可能如何影響 NVDA？'),
    steps: [
      hop('ask', 'ask', 'go', copy('You ask one question', '你問一條問題'), you, app, 'app', 'NVDA · not sent yet', copy('The question names a supported company. Nothing has been fetched.', '問題點名一家支援範圍內的公司。此時還沒有抓新聞。')),
      hop('scope', 'scope', 'go', copy('Scope lets it through', '範圍檢查放行'), app, app, 'app', 'company NVDA', copy('Both the company and research intent pass. A supported ticker alone cannot authorize an unrelated or malicious request.', '公司及研究意圖都通過；只有支援 ticker 不能批准無關或惡意請求。')),
      hop('call', 'call', 'go', copy('The app calls once', 'App 只叫一次'), app, n8n, 'n8n', 'refresh_company_news · run_1842', copy('The model cannot skip this call. n8n owns every provider retry inside it.', '模型不能跳過這次呼叫。裡面的供應商重試全部由 n8n 負責。')),
      hop('validate', 'n8n', 'go', copy('Check the run id', '核對任務 id'), n8n, n8n, 'n8n', 'attempt 0 of 3', copy('run_1842 has no receipt yet, so a fetch is allowed.', 'run_1842 還沒有收據，所以可以抓取。')),
      hop('fetch', 'n8n', 'go', copy('Ask the adapter', '呼叫 adapter'), n8n, adapter, 'outside', 'POST /news · NVDA · 10s cap', copy('One attempt. The call is clipped to 10 seconds and to the 25-second acquisition budget.', '只打一次。呼叫上限 10 秒，並且受 25 秒抓取預算限制。')),
      hop('save', 'n8n', 'go', copy('Save the articles', '保存文章'), n8n, db, 'outside', '3 articles · ingestion role', copy('The JSON matches the news schema. n8n writes with an ingestion-only database role.', 'JSON 符合新聞 schema。n8n 用只供匯入的資料庫角色寫入。')),
      hop('receipt', 'receipt', 'go', copy('Return the receipt', '交回收據'), n8n, app, 'n8n', 'version ids · fetched_at · ready', copy('n8n is finished for this question. The receipt is the proof of what was saved.', 'n8n 對這題的工作結束。收據證明保存了什麼。')),
      hop('pin', 'pin', 'go', copy('Pin the snapshot', '固定快照'), app, app, 'app', 'company news + daily batch + profile', copy('Search and the cited note start after this. They are outside n8n.', '之後的搜尋和有引用的報告在 n8n 之外。')),
      ...reportHandoff,
    ],
  },
  {
    id: 'blip',
    title: copy('One retry, then success', '重試一次後成功'),
    prompt: copy('How could rising costs affect AAPL margins?', '成本上升可能如何影響 AAPL 利潤率？'),
    steps: [
      hop('ask', 'ask', 'go', copy('A second question', '第二條問題'), you, app, 'app', 'AAPL · new run', copy('A different question needs its own receipt.', '另一條問題要有自己的收據。')),
      hop('scope', 'scope', 'go', copy('AAPL is supported', 'AAPL 在範圍內'), app, app, 'app', 'company AAPL', copy('The company and research intent pass the tool-free scope gate.', '公司及研究意圖通過沒有工具的 scope gate。')),
      hop('call', 'call', 'go', copy('One logical call', '一次邏輯呼叫'), app, n8n, 'n8n', 'run_1843', copy('The app does not retry the provider. n8n does.', 'App 不會向供應商重試。重試由 n8n 做。')),
      hop('fail', 'n8n', 'wait', copy('The first call fails', '第一次失敗'), n8n, adapter, 'outside', '503 · attempt 1 of 3', copy('A retryable 503. Turn the HTTP node’s own automatic retry off.', '可重試的 503。HTTP 節點自帶的自動重試要關掉。')),
      hop('wait', 'n8n', 'wait', copy('Wait, then try again', '等待後再試'), n8n, n8n, 'n8n', 'wait 1s + jitter', copy('The next wait, if needed, is 2 seconds plus jitter. Honor Retry-After when it fits the deadline.', '如果還要再等，下一次是 2 秒加 jitter。Retry-After 仍在時限內就遵守它。')),
      hop('save', 'n8n', 'go', copy('Attempt 2 succeeds', '第 2 次成功'), n8n, db, 'outside', 'attempt 2 of 3 · articles saved', copy('n8n saves the rows and stops retrying.', 'n8n 保存紀錄後就停止重試。')),
      hop('receipt', 'receipt', 'go', copy('One receipt', '一張收據'), n8n, app, 'n8n', 'status ready', copy('The failed attempt is history. It is not a second refresh.', '失敗的嘗試是歷史，不是第二次刷新。')),
      hop('pin', 'pin', 'go', copy('Pin this run', '固定這次任務'), app, app, 'app', 'snapshot pinned', copy('The app does not ask n8n to fetch AAPL again.', 'App 不會再請 n8n 抓一次 AAPL。')),
      ...reportHandoff,
    ],
  },
  {
    id: 'down',
    title: copy('Provider stays down', '供應商持續故障'),
    prompt: copy('How could costs affect MSFT?', '成本可能如何影響 MSFT？'),
    steps: [
      hop('ask', 'ask', 'go', copy('MSFT is in scope', 'MSFT 在範圍內'), you, app, 'app', 'MSFT', copy('A supported company can still meet a down provider.', '支援範圍內的公司仍可能碰到故障的供應商。')),
      hop('call', 'call', 'go', copy('The app waits', 'App 等候結果'), app, n8n, 'n8n', 'run_1844', copy('One call. The app waits for a typed result.', '只呼叫一次。App 等候結構化結果。')),
      hop('a1', 'n8n', 'wait', copy('Attempt 1 fails', '第 1 次失敗'), n8n, n8n, 'n8n', '503 · wait 1s', copy('Transient failure, and time remains.', '暫時失敗，而且還有時間。')),
      hop('a2', 'n8n', 'wait', copy('Attempt 2 fails', '第 2 次失敗'), n8n, n8n, 'n8n', '503 · wait 2s + jitter', copy('Still retryable.', '仍然可以重試。')),
      hop('a3', 'n8n', 'stop', copy('Attempt 3 stops', '第 3 次停止'), n8n, n8n, 'stop', 'attempts exhausted', copy('Three attempts is the cap. n8n stops fetching.', '三次就是上限。n8n 停止抓取。')),
      hop('receipt', 'receipt', 'stop', copy('Unavailable', '供應商不可用'), n8n, app, 'stop', 'status unavailable', copy('The app must not immediately fire the same tool call again.', 'App 不應立刻再發同一次工具呼叫。')),
      hop('pin', 'pin', 'stop', copy('Say the source failed', '說明來源失敗'), app, you, 'stop', 'no fresh rows', copy('There is no fresh snapshot. The report must not describe old news as new.', '沒有新的快照。報告不能把舊新聞說成新的。')),
    ],
  },
  {
    id: 'resume',
    title: copy('Same run, old receipt', '同一任務，舊收據'),
    prompt: copy('Same NVDA question, resumed', '同一條 NVDA 問題，恢復執行'),
    steps: [
      hop('ask', 'ask', 'go', copy('The host timed out', 'Host 超時了'), you, app, 'app', 'run_1842 again', copy('Resume, or a lost response, uses the original run id.', '恢復執行，或遺失的回應，都用原來的任務 id。')),
      hop('call', 'call', 'go', copy('Look up the run first', '先查找任務'), app, n8n, 'n8n', 'reconcile run_1842', copy('The app does not blindly send a second fetch.', 'App 不會盲目再抓一次。')),
      hop('validate', 'n8n', 'go', copy('The receipt exists', '收據已經存在'), n8n, n8n, 'n8n', 'receipt found', copy('This run already committed its evidence.', '這個任務已經提交了證據。')),
      hop('receipt', 'receipt', 'go', copy('Reuse it', '沿用收據'), n8n, app, 'n8n', 'no second fetch', copy('Yahoo is not called again.', '不會再呼叫 Yahoo。')),
      hop('pin', 'pin', 'go', copy('Keep the same snapshot', '沿用同一個快照'), app, app, 'app', 'budget unchanged', copy('Search continues from the original snapshot. The budget is not reset.', '搜尋沿用原來的快照。預算不會重設。')),
      ...reportHandoff,
    ],
  },
  {
    id: 'reject',
    title: copy('Out of scope', '超出範圍'),
    prompt: copy('What about TSLA?', 'TSLA 又如何？'),
    stageLabels: {
      call: copy('No tool call', '不呼叫工具'),
      n8n: copy('n8n stays idle', 'n8n 不啟動'),
      receipt: copy('No receipt', '沒有收據'),
      pin: copy('Explain and stop', '說明並停止'),
    },
    steps: [
      hop('ask', 'ask', 'go', copy('An unsupported ticker', '不支援的代號'), you, app, 'app', 'TSLA', copy('Someone asks for a company this app does not cover.', '有人問這個 app 不涵蓋的公司。')),
      hop('scope', 'scope', 'stop', copy('Stop before n8n', '在 n8n 之前停止'), app, you, 'stop', 'MSFT · AAPL · NVDA', copy('The scope gate stops the question. n8n never starts. No receipt and no database write.', '範圍檢查停住這條問題。n8n 不會啟動。沒有收據，也沒有資料庫寫入。')),
    ],
  },
  {
    id: 'empty', title: copy('Valid empty news response', '有效空新聞回應'),
    prompt: copy('MSFT is supported, but the provider returns no articles.', 'MSFT 在範圍內，但供應商沒有文章。'),
    steps: [
      hop('call', 'call', 'go', copy('An accepted research request', '已接納研究請求'), app, n8n, 'n8n', 'refresh_company_news · new run', copy('Scope has already passed. Use the same validation and bounded acquisition workflow.', '範圍已通過，沿用相同驗證及有限抓取流程。')),
      hop('fetch', 'n8n', 'go', copy('The provider returns an empty list', '供應商回傳空清單'), adapter, n8n, 'outside', 'HTTP 200 · articles=[] · schema valid', copy('A valid empty response is not a transient failure and must not trigger a provider retry.', '有效空回應不是暫時故障，不能因此重試供應商。')),
      hop('receipt', 'receipt', 'go', copy('Commit the empty receipt', '提交空結果收據'), n8n, app, 'n8n', 'status empty · 0 new version IDs', copy('Persist the observed result and fetch timestamp. Old stored news is not relabelled as newly published.', '保存觀察結果及抓取時間；不把舊新聞改稱新發布。')),
      hop('coverage', 'pin', 'stop', copy('Explain the evidence gap', '說明證據缺口'), app, you, 'stop', 'current-news question lacks current evidence', copy('For this current-news case, no eligible current evidence remains. Return supported dated facts and the gap, without a forecast. Other questions may still use eligible snapshot evidence.', '此當前新聞案例沒有合資格當前證據；只回有日期支持事實及缺口，不作預測。其他問題仍可用合資格快照證據。')),
    ],
  },
  {
    id: 'invalid', title: copy('Invalid request stops', '無效請求停止'),
    prompt: copy('A direct tool call supplies an unsupported symbol or malformed arguments.', '直接工具呼叫帶不支援代號或格式錯誤參數。'),
    steps: [
      hop('call', 'call', 'go', copy('The tool boundary receives input', '工具邊界收到輸入'), app, n8n, 'n8n', 'untrusted tool arguments', copy('The host normally filters these inputs, but the workflow must enforce its own boundary.', 'Host 通常已過濾輸入，但流程仍須執行自身邊界檢查。')),
      hop('reject', 'n8n', 'stop', copy('Reject before provider access', '供應商存取前拒絕'), n8n, app, 'stop', 'invalid_request · provider attempts = 0', copy('Validate schema, allowlisted company, owner/run binding and deadline. Invalid arguments or authentication failures do not retry and do not write evidence.', '核對 schema、公司清單、擁有者／任務綁定及時限；無效參數或認證失敗不重試、不寫證據。')),
    ],
  },
  {
    id: 'daily_failure', title: copy('Daily batch fails', '每日批次失敗'),
    prompt: copy('The scheduled macro/geopolitical provider remains unavailable.', '排程宏觀／地緣供應商持續不可用。'),
    stageLabels: { ask: copy('Daily clock', '每日時鐘'), receipt: copy('Failure status', '失敗狀態'), pin: copy('Prior completed batch', '上一完整批次') },
    steps: [
      hop('clock', 'ask', 'go', copy('Start the daily job', '開始每日工作'), n8n, n8n, 'n8n', 'schedule + timezone + stable batch key', copy('This job has its own deadline and is independent of user requests.', '工作有獨立時限，不依賴使用者問題。')),
      hop('fetch', 'n8n', 'wait', copy('Provider attempts fail', '供應商嘗試失敗'), n8n, dailyProviders, 'outside', 'bounded transient retries · at most 3 attempts', copy('Use approved daily-news APIs or RSS, not the company-only /news endpoint. Stop sooner if the daily acquisition budget expires.', '用核准每日新聞 API 或 RSS，不是只抓公司的 /news 端點；每日抓取預算用完須提早停。')),
      hop('failure', 'receipt', 'stop', copy('Record failure without publishing a partial batch', '記錄失敗，不發布部分批次'), n8n, db, 'stop', 'failed batch is ineligible for snapshots', copy('Keep the failure and execution IDs for reconciliation and tracing.', '保留失敗及執行 ID 供核對和追蹤。')),
      hop('retain', 'pin', 'stop', copy('Retain the last completed batch', '保留最後完整批次'), db, app, 'stop', 'prior batch ID + original fetched_at + stale status', copy('The app sees the actual age and decides whether that evidence supports this question. Missing required freshness produces insufficient evidence, not a guessed update.', 'App 看實際資料年齡，判斷是否支持問題；所需新鮮度不足就回證據不足，不能猜更新。')),
    ],
  },
  {
    id: 'daily',
    title: copy('Daily context batch', '每日背景批次'),
    prompt: copy('Nobody asked. The clock starts.', '沒有人發問。時鐘自己啟動。'),
    stageLabels: {
      ask: copy('Daily clock', '每日時鐘'),
      scope: copy('No user question', '沒有使用者問題'),
      call: copy('App is idle', 'App 閒置'),
      receipt: copy('Batch status', '批次狀態'),
      pin: copy('Evidence pool', '證據池'),
    },
    steps: [
      hop('clock', 'ask', 'go', copy('The schedule fires', '排程啟動'), n8n, n8n, 'n8n', 'Schedule Trigger · your timezone', copy('This workflow runs even when nobody asks. Set the clock and timezone when you publish it.', '即使沒有人發問，這條流程也會跑。發布時設定時間和時區。')),
      hop('fetch', 'n8n', 'go', copy('Fetch shared context', '抓取共用背景'), n8n, dailyProviders, 'outside', 'approved API / RSS · independent job deadline', copy('The same retry limits apply, with this job’s own deadline.', '同樣的重試上限，但使用這份工作自己的時限。')),
      hop('save', 'n8n', 'go', copy('Commit the batch', '提交批次'), n8n, db, 'outside', 'shared evidence pool', copy('Company refresh is a different workflow. This batch is context, not the answer.', '公司刷新是另一條流程。這批資料是背景，不是答案。')),
      hop('ready', 'pin', 'go', copy('Make this completed batch eligible', '令此完整批次可入快照'), db, app, 'app', 'completed batch ID + versions + fetched_at', copy('A later accepted question can pin these exact versions. This successful path does not claim that the daily job failed.', '之後有效問題可固定這些版本；成功路徑不會聲稱每日工作失敗。')),
    ],
  },
];

export function n8nStageLabel(scenario: N8nScenario, stage: N8nStage) {
  return scenario.stageLabels?.[stage] ?? stageDefinitions[stage].label;
}

export const n8nIntegrationGuide = [
  { title: copy('One request, one committed receipt', '一個請求，一份已提交收據'), body: copy('Treat refresh_company_news as a deterministic workflow tool. Validate the schema, authenticated run binding and deadline. Atomically claim a unique owner/run key with a request fingerprint. A completed duplicate returns its receipt; a running duplicate returns its execution status. Conflicting arguments for the same key are rejected. A host timeout reconciles that execution, without starting another fetch.', 'refresh_company_news 是固定流程工具，須驗證 schema、已認證任務綁定及時限。以原子操作取得唯一擁有者／任務鍵及請求指紋；已完成重複回傳收據，執行中重複回傳狀態，相同鍵但參數不同須拒絕。Host 超時只核對原執行，不另開抓取。') },
  { title: copy('Normalize → deduplicate → commit', '正規化 → 去重 → 提交'), body: copy('Validate the adapter response schema. Use canonical article identity plus content hash as a unique version key in PostgreSQL; unchanged content updates last_seen_at, while changed content creates a new version. Commit evidence and its receipt in one transaction before returning success. Keep article text untrusted; no arbitrary URL fetch or article-provided SQL. Story-level deduplication still runs before LLM context assembly.', '驗證 adapter 回應 schema。PostgreSQL 用正規化文章身分加內容 hash 作唯一版本鍵；相同內容只更新 last_seen_at，內容改變才建新版本。證據及收據須同一 transaction 提交後才回成功。文章仍不可信，不執行任意 URL 或文章 SQL；LLM context 前仍做新聞故事層去重。') },
  { title: copy('Three acquisition paths', '三條抓取路徑'), body: copy('Company news uses Python YFinance MCP through POST /news. Price uses POST /quote and is stored as a timestamped numerical observation, outside the news index. Daily macro/geopolitical news uses separately approved API/RSS providers with its own schedule, timezone, batch key and deadline. Company profiles are sourced, versioned records maintained separately.', '公司新聞經 Python YFinance MCP 的 POST /news。價格用 POST /quote，存有時間戳數值觀察，不進新聞索引。每日宏觀／地緣新聞經獨立核准 API／RSS，有自己的排程、時區、批次鍵及時限。公司背景則獨立維護附來源版本記錄。') },
  { title: copy('n8n metadata is separate from finance evidence', 'n8n 管理資料與金融證據分開'), body: copy('Use PostgreSQL for n8n workflows, credentials and execution metadata, in n8n_metadata with its own role. A separate ingestion credential writes only permitted finance evidence and acquisition receipts. Research reports, selection revisions and checkpoints are owned by the research service. n8n metadata migrations must not run against the research or checkpoint database.', 'n8n 流程、憑證及執行管理資料用 PostgreSQL 的 n8n_metadata 及專用角色。另一匯入憑證只可寫允許證據及抓取收據；研究服務擁有報告、選取版本及 checkpoints。n8n 管理資料 migration 不能對研究或 checkpoint 資料庫執行。') },
  { title: copy('The handoff to LangGraph', '交回 LangGraph 之後'), body: copy('The host pins the receipt’s exact news versions, eligible completed daily batches, company profile and optional quote observation. Search and rank that snapshot, optionally review evidence, validate selection, recheck coverage, then build context and generate. Hybrid retrieval stays behind the frozen evaluation gate. Review pause/resume does not call n8n again or reset acquisition counters; only deliberate human wait pauses the proposed 60-second processing budget, with a fixed 15-minute review window from the first pause.', 'Host 固定收據新聞版本、合資格完整每日批次、公司背景及可選價格觀察。從快照搜尋排序，可選覆核、驗證選取、重查覆蓋，才建 context 及生成。混合檢索仍須過凍結評估門檻；覆核暫停／恢復不再叫 n8n，不重設抓取次數，只有刻意人手等待暫停建議 60 秒處理預算，首次暫停起另設固定 15 分鐘覆核期。') },
  { title: copy('Trace the boundary and verify it live', '追蹤邊界並真實驗證'), body: copy('Correlate run_id, trace_id and n8n execution ID. Record each provider attempt, retry reason, latency, ingestion counts and receipt status with OpenTelemetry; export sanitized run segments to Langfuse/LangSmith. These lesson scenarios make zero external calls. Live acceptance remains NOT RUN: verify concurrent duplicate calls, provider timeouts, valid empty results, malformed JSON, transaction rollback, daily failure and one accessible trace URL before treating the design as working.', '以 run_id、trace_id 及 n8n execution ID 關聯。OpenTelemetry 記每次供應商嘗試、重試原因、延遲、匯入數量及收據狀態，清理後送 Langfuse／LangSmith。教材沒有外部呼叫；真實驗收仍為 NOT RUN，須測並行重複、超時、有效空結果、壞 JSON、transaction 回滾、每日失敗及可開啟 trace URL。') },
];

export const n8nReceiptExample = JSON.stringify({
  disclosure: 'Fictional proposed acquisition receipt, not raw YFinance JSON',
  run_id: 'run_1842', execution_id: 'example-n8n-execution', status: 'ready',
  company: 'NVDA', company_news_version_ids: ['nvda-news-v3'], new_versions: 1, unchanged_versions: 2,
  fetched_at: '2026-11-13T01:00:00Z', committed_at: '2026-11-13T01:00:01Z',
  provider_attempts: 1, provider_status: 'ok', trace_id: 'fictional-trace-id',
}, null, 2);

export const n8nReferences = [
  { title: 'Official Docker Compose installation', url: 'https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose.md' },
  { title: 'n8n PostgreSQL database settings', url: 'https://docs.n8n.io/deploy/host-n8n/configure-n8n/choose-n8ns-database.md' },
  { title: 'MCP Server Trigger and authentication', url: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/' },
  { title: 'HTTP Request node', url: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/' },
];

const dailyNode = (id: string, label: string, en: string, zh: string) => ({ id, label, detail: copy(en, zh) });
const dailyEdge = (from: string, to: string, en: string, zh: string, kind: FinanceDiagram['edges'][number]['kind'] = 'flow') => ({ from, to, label: copy(en, zh), detail: copy(en, zh), kind });
export const financeN8nDailyDiagram: FinanceDiagram = {
  id: 'n8n_daily', title: copy('n8n daily macro + geopolitical news', 'n8n 每日宏觀及地緣新聞'),
  nodes: [
    dailyNode('schedule', 'n8n SCHEDULE + TIMEZONE', 'Independent daily job; no user prompt is required.', '獨立每日工作，不需要用戶提示。'),
    dailyNode('claim', 'n8n CLAIM BATCH KEY', 'Atomically claim stream + scheduled window + configuration version. An existing execution is reconciled, not duplicated.', '原子取得來源＋排程期間＋設定版本批次鍵；已有執行先核對，不重複。'),
    dailyNode('pending', 'IN PROGRESS → END', 'Return the existing execution status; do not launch another provider attempt or publish an incomplete batch.', '回傳原執行狀態，不另開供應商嘗試或發布未完整批次。'),
    dailyNode('fetch', 'n8n APPROVED API / RSS', 'Macro/geopolitical providers are separate from the company-only YFinance endpoint. Up to 3 transient attempts within this job’s deadline.', '宏觀／地緣供應商與只抓公司的 YFinance 端點分開；工作時限內最多 3 次暫時錯誤嘗試。'),
    dailyNode('retry', 'n8n RETRY DECISION', 'Retry transient failures only; stop at 3 attempts or the job deadline. Invalid schema/auth is permanent.', '只重試暫時錯誤，3 次或工作時限即停；格式／認證錯誤不重試。'),
    dailyNode('wait', 'n8n BACKOFF + JITTER', 'Wait 1s then 2s plus jitter, honor Retry-After and clip to the remaining job budget.', '等待 1 秒、2 秒加 jitter，遵守 Retry-After 並限制於工作餘額。'),
    dailyNode('normalize', 'VALIDATE + DEDUPLICATE', 'Normalize provenance, dates, topics, regions and version hashes. Quarantine invalid records without publishing an incomplete batch.', '正規化來源、日期、主題、地域及版本 hash；隔離無效記錄，不發布未完整批次。'),
    dailyNode('commit', 'COMMIT COMPLETE BATCH', 'Evidence versions and batch completion are committed atomically. Snapshot eligibility starts only after commit.', '證據版本及批次完成狀態原子提交，之後才可入快照。'),
    dailyNode('failure', 'RECORD FAILED JOB', 'Persist failure and execution IDs; an uncommitted or partial batch is not eligible evidence.', '保存失敗及執行 ID；未提交或部分批次不能當合資格證據。'),
    dailyNode('prior', 'RETAIN PRIOR COMPLETED BATCH', 'Keep the original fetched_at and show failure/staleness; do not claim it is today’s successful fetch.', '保留原 fetched_at 及失敗／過期狀態，不能聲稱今日成功抓取。'),
    dailyNode('pool', 'POSTGRESQL EVIDENCE POOL', 'A later accepted request pins eligible versions and rechecks freshness for its question. No report is generated by the daily job.', '之後有效請求固定合資格版本，再按問題重查新鮮度；每日工作不生成報告。'),
  ],
  edges: [
    dailyEdge('schedule', 'claim', 'Daily trigger', '每日觸發'),
    dailyEdge('claim', 'fetch', 'New batch lease', '新批次 lease'),
    dailyEdge('claim', 'pool', 'Existing completed batch', '已有完整批次'),
    dailyEdge('claim', 'pending', 'Existing running execution', '已有執行中工作', 'stop'),
    dailyEdge('fetch', 'normalize', 'Response received', '收到回應'),
    dailyEdge('fetch', 'retry', 'Provider error', '供應商錯誤'),
    dailyEdge('retry', 'wait', 'Transient + time left', '暫時錯誤＋有餘額', 'retry'),
    dailyEdge('wait', 'fetch', 'Same batch; next attempt', '同批次下一嘗試', 'retry'),
    dailyEdge('retry', 'failure', 'Permanent / exhausted', '永久錯誤／用完', 'stop'),
    dailyEdge('normalize', 'commit', 'Valid batch', '批次有效'),
    dailyEdge('normalize', 'failure', 'Invalid / incomplete', '無效／未完整', 'stop'),
    dailyEdge('commit', 'pool', 'Complete versions ready', '完整版本就緒'),
    dailyEdge('commit', 'failure', 'Transaction rolled back', 'Transaction 已回滾', 'stop'),
    dailyEdge('failure', 'prior', 'Preserve prior batch', '保留舊完整批次', 'fallback'),
    dailyEdge('prior', 'pool', 'Original age + failure status', '原年齡＋失敗狀態', 'fallback'),
  ],
};
