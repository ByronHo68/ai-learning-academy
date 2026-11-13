import type { Copy } from './curriculum';

const copy = (en: string, zh: string): Copy => ({ en, zh });

export type N8nChannel = 'app' | 'n8n' | 'outside' | 'stop';
export type N8nStage = 'ask' | 'scope' | 'call' | 'n8n' | 'receipt' | 'pin';

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
  steps: N8nStep[];
};

const you = copy('You', '你');
const app = copy('Research app', '研究 app');
const n8n = copy('n8n', 'n8n');
const adapter = copy('YFinance adapter', 'YFinance adapter');
const db = copy('PostgreSQL', 'PostgreSQL');

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

export const n8nStages: Array<{ id: N8nStage; label: Copy }> = [
  { id: 'ask', label: copy('Your question', '你的問題') },
  { id: 'scope', label: copy('Scope gate', '範圍檢查') },
  { id: 'call', label: copy('App calls once', 'App 只叫一次') },
  { id: 'n8n', label: copy('Inside n8n', 'n8n 內部') },
  { id: 'receipt', label: copy('Receipt', '收據') },
  { id: 'pin', label: copy('Pinned snapshot', '固定快照') },
];

export const n8nRoles = [
  { name: 'LangGraph host', job: copy('Checks the question, then calls refresh_company_news once.', '檢查問題，然後只呼叫 refresh_company_news 一次。') },
  { name: 'n8n', job: copy('Validates the call, fetches news, retries a short outage, saves rows, and returns a receipt.', '驗證呼叫、抓新聞、短暫故障就重試、保存紀錄，然後交回收據。') },
  { name: 'YFinance adapter', job: copy('Private HTTP bridge on port 8002. n8n calls POST /news or POST /quote.', '私人 HTTP 橋接，埠 8002。n8n 呼叫 POST /news 或 POST /quote。') },
  { name: 'PostgreSQL', job: copy('Stores the news. n8n may insert evidence. It does not write reports or checkpoints.', '保存新聞。n8n 可以寫入證據，不能寫報告或 checkpoint。') },
  { name: 'The model', job: copy('Writes the cited note from the pinned snapshot, after n8n has finished.', 'n8n 完成之後，先用已固定的快照寫有引用的報告。') },
];

export const n8nLimits = [
  { value: '1', label: copy('logical refresh per question', '每題一次邏輯刷新') },
  { value: '3', label: copy('provider attempts, then stop', '供應商最多 3 次，然後停止') },
  { value: '10s', label: copy('cap on each news call', '每次新聞呼叫上限') },
  { value: '25s', label: copy('whole acquisition budget', '整段抓取預算') },
];

export const n8nStart = [
  copy('Install Docker and leave it running. n8n 3.0 is distributed with Docker. This academy’s Node.js 18.18 only runs the office website, and it is too old for n8n’s npm installer.', '安裝 Docker 並保持執行。n8n 3.0 用 Docker 發行。學院的 Node.js 18.18 只負責 office 網站，版本低於 n8n 的 npm 安裝要求。'),
  copy('Outside this git repository, create ~/n8n-local and run curl -fsSL https://get.n8n.io | sh. Open http://localhost:5678 and create the owner account on that machine.', '在這個 git 倉庫以外建立 ~/n8n-local，執行 curl -fsSL https://get.n8n.io | sh。打開 http://localhost:5678，在自己的電腦建立擁有者帳戶。'),
  copy('Learn the editor with a throwaway workflow: Manual Trigger, then Edit Fields with symbol MSFT, then Execute. Open that run under Executions. This practice flow is not the finance workflow.', '用一條可丟棄的流程熟悉編輯器：Manual Trigger，然後 Edit Fields 把 symbol 設為 MSFT，再 Execute。到 Executions 打開該次執行。這條練習流程不是財務流程。'),
  copy('Build the sub-workflow, then add an MCP Server Trigger connected to a Custom n8n Workflow Tool named refresh_company_news. The trigger connects to tool nodes. Use Streamable HTTP. This trigger does not speak stdio.', '先建子流程，再加 MCP Server Trigger，接上名為 refresh_company_news 的 Custom n8n Workflow Tool。Trigger 連接 tool 節點。使用 Streamable HTTP。這個 trigger 不支援 stdio。'),
  copy('When the adapter from the finance branch is running, give n8n a Header Auth credential whose header is X-YFinance-Token. POST the validated symbol to http://127.0.0.1:8002/news. If n8n itself is in Docker, 127.0.0.1 means the n8n container: use the adapter service name instead.', '財務分支的 adapter 在跑的時候，給 n8n 一個 Header Auth 憑證，標頭名稱是 X-YFinance-Token。把已驗證的 symbol POST 到 http://127.0.0.1:8002/news。若 n8n 自己在 Docker 裡，127.0.0.1 指的是 n8n 容器，要改用 adapter 的服務名稱。'),
];

export const n8nScenarios: N8nScenario[] = [
  {
    id: 'fresh',
    title: copy('News arrives', '新聞到手'),
    prompt: copy('How could export limits affect NVDA?', '出口限制可能如何影響 NVDA？'),
    steps: [
      hop('ask', 'ask', 'go', copy('You ask one question', '你問一條問題'), you, app, 'app', 'NVDA · not sent yet', copy('The question names a supported company. Nothing has been fetched.', '問題點名一家支援範圍內的公司。此時還沒有抓新聞。')),
      hop('scope', 'scope', 'go', copy('Scope lets it through', '範圍檢查放行'), app, app, 'app', 'company NVDA', copy('MSFT, AAPL, and NVDA are the only companies. NVDA is allowed.', '只支援 MSFT、AAPL、NVDA。NVDA 可以通過。')),
      hop('call', 'call', 'go', copy('The app calls once', 'App 只叫一次'), app, n8n, 'n8n', 'refresh_company_news · run_1842', copy('The model cannot skip this call. n8n owns every provider retry inside it.', '模型不能跳過這次呼叫。裡面的供應商重試全部由 n8n 負責。')),
      hop('validate', 'n8n', 'go', copy('Check the run id', '核對任務 id'), n8n, n8n, 'n8n', 'attempt 0 of 3', copy('run_1842 has no receipt yet, so a fetch is allowed.', 'run_1842 還沒有收據，所以可以抓取。')),
      hop('fetch', 'n8n', 'go', copy('Ask the adapter', '呼叫 adapter'), n8n, adapter, 'outside', 'POST /news · NVDA · 10s cap', copy('One attempt. The call is clipped to 10 seconds and to the 25-second acquisition budget.', '只打一次。呼叫上限 10 秒，並且受 25 秒抓取預算限制。')),
      hop('save', 'n8n', 'go', copy('Save the articles', '保存文章'), n8n, db, 'outside', '3 articles · ingestion role', copy('The JSON matches the news schema. n8n writes with an ingestion-only database role.', 'JSON 符合新聞 schema。n8n 用只供匯入的資料庫角色寫入。')),
      hop('receipt', 'receipt', 'go', copy('Return the receipt', '交回收據'), n8n, app, 'n8n', 'version ids · fetched_at · ready', copy('n8n is finished for this question. The receipt is the proof of what was saved.', 'n8n 對這題的工作結束。收據證明保存了什麼。')),
      hop('pin', 'pin', 'go', copy('Pin the snapshot', '固定快照'), app, app, 'app', 'company news + daily batch + profile', copy('Search and the cited note start after this. They are outside n8n.', '之後的搜尋和有引用的報告在 n8n 之外。')),
    ],
  },
  {
    id: 'blip',
    title: copy('One retry, then success', '重試一次後成功'),
    prompt: copy('How could rising costs affect AAPL margins?', '成本上升可能如何影響 AAPL 利潤率？'),
    steps: [
      hop('ask', 'ask', 'go', copy('A second question', '第二條問題'), you, app, 'app', 'AAPL · new run', copy('A different question needs its own receipt.', '另一條問題要有自己的收據。')),
      hop('scope', 'scope', 'go', copy('AAPL is supported', 'AAPL 在範圍內'), app, app, 'app', 'company AAPL', copy('The scope gate allows the tool call.', '範圍檢查允許呼叫工具。')),
      hop('call', 'call', 'go', copy('One logical call', '一次邏輯呼叫'), app, n8n, 'n8n', 'run_1843', copy('The app does not retry the provider. n8n does.', 'App 不會向供應商重試。重試由 n8n 做。')),
      hop('fail', 'n8n', 'wait', copy('The first call fails', '第一次失敗'), n8n, adapter, 'outside', '503 · attempt 1 of 3', copy('A retryable 503. Turn the HTTP node’s own automatic retry off.', '可重試的 503。HTTP 節點自帶的自動重試要關掉。')),
      hop('wait', 'n8n', 'wait', copy('Wait, then try again', '等待後再試'), n8n, n8n, 'n8n', 'wait 1s + jitter', copy('The next wait, if needed, is 2 seconds plus jitter. Honor Retry-After when it fits the deadline.', '如果還要再等，下一次是 2 秒加 jitter。Retry-After 仍在時限內就遵守它。')),
      hop('save', 'n8n', 'go', copy('Attempt 2 succeeds', '第 2 次成功'), n8n, db, 'outside', 'attempt 2 of 3 · articles saved', copy('n8n saves the rows and stops retrying.', 'n8n 保存紀錄後就停止重試。')),
      hop('receipt', 'receipt', 'go', copy('One receipt', '一張收據'), n8n, app, 'n8n', 'status ready', copy('The failed attempt is history. It is not a second refresh.', '失敗的嘗試是歷史，不是第二次刷新。')),
      hop('pin', 'pin', 'go', copy('Pin this run', '固定這次任務'), app, app, 'app', 'snapshot pinned', copy('The app does not ask n8n to fetch AAPL again.', 'App 不會再請 n8n 抓一次 AAPL。')),
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
      hop('fetch', 'n8n', 'go', copy('Fetch shared context', '抓取共用背景'), n8n, adapter, 'outside', 'macro + geopolitical sources', copy('The same retry limits apply, with this job’s own deadline.', '同樣的重試上限，但使用這份工作自己的時限。')),
      hop('save', 'n8n', 'go', copy('Commit the batch', '提交批次'), n8n, db, 'outside', 'shared evidence pool', copy('Company refresh is a different workflow. This batch is context, not the answer.', '公司刷新是另一條流程。這批資料是背景，不是答案。')),
      hop('keep', 'pin', 'go', copy('Keep yesterday if this fails', '失敗就保留昨天'), n8n, db, 'n8n', 'prior batch + failure status', copy('If retries run out, keep the previous completed batch and its original fetched_at.', '如果重試用完，保留上一份已完成的批次和原來的 fetched_at。')),
    ],
  },
];

export function n8nStageLabel(scenario: N8nScenario, stage: N8nStage) {
  return scenario.stageLabels?.[stage] ?? n8nStages.find(item => item.id === stage)!.label;
}
