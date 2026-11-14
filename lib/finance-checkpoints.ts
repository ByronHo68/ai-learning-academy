import type { Copy } from './curriculum';
import type { FinanceDiagram } from './finance-diagrams';

const t = (en: string, zh: string): Copy => ({ en, zh });

export const checkpointConcepts = [
  { id: 'graph', title: t('LangGraph = the workflow runner', 'LangGraph＝流程執行器'), short: t('Runs steps and chooses edges', '執行節點及選路徑'), body: t('Your Python research service runs scope → n8n refresh → snapshot → search/rank → review → evidence checks → report. Nodes read state and return updates; code owns the routes. LangGraph is not the LLM, the news provider or the database.', 'Python 研究服務執行 scope → n8n 刷新 → 快照 → 搜尋／排序 → 覆核 → 證據檢查 → 報告。節點讀狀態再回傳更新，程式決定路徑。LangGraph 不是 LLM、新聞供應商或資料庫。') },
  { id: 'saver', title: t('AsyncPostgresSaver = the persistence adapter', 'AsyncPostgresSaver＝持久保存介面'), short: t('Saves and loads progress through async PostgreSQL I/O', '用 async PostgreSQL I/O 存取進度'), body: t('Compile the graph with checkpointer=saver. LangGraph asks this saver to store/load checkpoints and pending writes in PostgreSQL. Async means database I/O can be awaited without blocking the Python event loop; it does not automatically make graph nodes parallel or remove database latency.', '編譯 graph 時傳 checkpointer=saver。LangGraph 經 saver 在 PostgreSQL 存取 checkpoints 及 pending writes。Async 代表資料庫 I/O 可 await，不阻塞 Python event loop；不代表節點自動並行，亦不消除資料庫延遲。') },
  { id: 'record', title: t('Checkpoint = one saved progress record', 'Checkpoint＝一份已存進度'), short: t('State values plus execution metadata', '狀態值加執行 metadata'), body: t('A checkpointer records progress at graph super-step boundaries. The readable StateSnapshot view includes values, next nodes, config and tasks. In this sequential teaching graph, a completed node is usually a step. A checkpoint does not save arbitrary Python local variables or the exact CPU instruction where a process died.', 'Checkpointer 在 graph super-step 邊界保存進度；可讀的 StateSnapshot 包含 values、下一節點、config 及 tasks。此教學為順序 graph，一個完成節點通常是一個 step。Checkpoint 不保存任意 Python 區域變數，亦不記錄程序死亡時的 CPU 指令。') },
  { id: 'identity', title: t('thread_id finds the right saved run', 'thread_id 找回正確任務'), short: t('One authorized research run → one server-owned thread', '一個已授權研究任務 → 一個伺服器建立的 thread'), body: t('Your app maps its business run_id to a server-owned thread_id. checkpoint_id identifies a particular saved version; checkpoint_ns separates root/subgraph namespaces. For ordinary continuation, use the same thread and latest checkpoint. The API must authenticate the owner; knowing a thread ID is not permission to resume it.', 'App 把業務 run_id 對應到伺服器建立的 thread_id。checkpoint_id 識別某份保存版本，checkpoint_ns 分開主 graph／子 graph。一般恢復用同一 thread 的最新 checkpoint；API 仍須驗證擁有者，知道 ID 不代表有權恢復。') },
  { id: 'snapshot', title: t('News snapshot and checkpoint are different', '新聞快照與 checkpoint 不同'), short: t('Evidence used versus execution progress', '使用哪些證據，與執行到哪一步'), body: t('snapshot_id pins the exact news/profile/quote versions and retrieval view for a report. A checkpoint references that snapshot and records query results, selected IDs/order, counters and remaining budget. A run can have many checkpoints that all reference the same evidence snapshot. New checkpoints do not fetch newer news.', 'snapshot_id 固定報告的新聞／背景／價格版本及檢索視圖。Checkpoint 引用快照，記錄查詢結果、所選 ID／次序、計數及預算餘額。同一任務可有多份 checkpoint 都引用相同證據快照；新 checkpoint 不會抓新新聞。') },
  { id: 'underscore', title: t('What does _checkpoint mean?', '_checkpoint 是甚麼？'), short: t('A name in code, not another database service', '程式內名稱，不是另一資料庫服務'), body: t('The official concepts here are checkpoint and checkpointer. _checkpoint by itself is not a separate public LangGraph component; an example may use that spelling for a local/internal variable or helper. This project uses checkpointer=saver and a separate research_checkpoints database. The library owns its table schema; do not invent a mandatory table called _checkpoint.', '官方概念是 checkpoint 及 checkpointer；單獨 _checkpoint 不是另一個公開 LangGraph 元件，範例可用這名稱作區域／內部變數或 helper。本項目用 checkpointer=saver 及獨立 research_checkpoints 資料庫，資料表 schema 由套件管理，並非必須自建 _checkpoint 表。') },
];

export const checkpointApplications = [
  { title: t('At startup: attach the saver', '啟動時：接上 saver'), body: t('Initialize the checkpoint tables with await saver.setup() in a controlled migration/setup step. Keep AsyncPostgresSaver open for the Python application lifespan and compile the graph with it. The website and n8n do not instantiate this Python saver.', '受控 migration／setup 步驟用 await saver.setup() 建立所需表；Python app 生命週期保持 AsyncPostgresSaver 開啟並用它編譯 graph。網站及 n8n 不建立此 Python saver。') },
  { title: t('After news and ranking: preserve completed work', '新聞及排序後：保存已完成工作'), body: t('Save the n8n receipt reference, fixed snapshot ID, ranked candidates and search counter. If later work fails after these checkpoints were durably written, recovery can reuse the completed stages. Use durability="sync" when the next step must not start before its checkpoint write finishes; async saver I/O and graph durability="async" are different choices.', '保存 n8n 收據引用、固定 snapshot ID、排序候選及搜尋次數。後續失敗時，只要這些 checkpoint 已持久寫入，便可重用完成階段。若下一步必須等 checkpoint 寫完才開始，選 durability="sync"；async saver I/O 與 graph durability="async" 是不同選擇。') },
  { title: t('At evidence review: pause and resume', '證據覆核：暫停及恢復'), body: t('Place interrupt() in a dedicated review node after retrieval. Persist state, let the user exclude/reorder/highlight news, authenticate and validate the selection, then resume with Command(resume=...) on the same thread. The interrupted node starts again from its beginning; keep provider fetching and other expensive side effects outside it.', '檢索後在獨立 review 節點呼叫 interrupt()。保存狀態，讓用戶排除／排序／標記，驗證身分及選取後以同一 thread 的 Command(resume=...) 恢復。中斷節點從頭重跑，抓取供應商等昂貴副作用須放節點外。') },
  { title: t('After a failure: continue unfinished work', '失敗後：繼續未完成工作'), body: t('For a recoverable failed run, load its latest authorized checkpoint and continue with ainvoke(None, config). An interrupt waiting for a decision needs Command(resume=...), not None as the decision. Reuse original evidence, counters and the remaining active budget. Only intentional review wait pauses the proposed 60s processing clock; the first-pause 15-minute review expiry never extends.', '可恢復失敗任務載入最新已授權 checkpoint，以 ainvoke(None, config) 繼續；等待決定的 interrupt 則須 Command(resume=...)，不能以 None 當決定。沿用原證據、計數及處理餘額；只有刻意覆核等待暫停建議 60 秒處理計時，首次暫停起 15 分鐘覆核期不延長。') },
  { title: t('The saver does not make n8n exactly-once', 'Saver 不保證 n8n 只執行一次'), body: t('n8n may commit evidence before the graph records the returned receipt. A crash in that gap means the refresh node can run again. Stable run keys, atomic acquisition claims and receipt reconciliation prevent another provider fetch. Checkpoint writes and business-data writes are not automatically one transaction. Provider retries stay inside n8n.', 'n8n 可先提交證據，graph 才記錄收據；兩者之間故障，refresh 節點可能重跑。固定任務鍵、原子抓取 claim 及核對收據才可避免再抓供應商。Checkpoint 與業務資料寫入不會自動變同一 transaction；供應商重試仍在 n8n。') },
  { title: t('Keep storage responsibilities separate', '儲存職責分開'), body: t('research stores news, embeddings, selections and reports; research_checkpoints stores graph execution state; n8n_metadata stores workflow/execution settings. Long-term user memory is another application design, not automatically supplied by a checkpointer. Store serializable state and stable IDs, not live MCP sessions, connections or credentials. Live PostgreSQL recovery checks for this finance app remain NOT RUN.', 'research 存新聞、向量、選取及報告；research_checkpoints 存 graph 執行狀態；n8n_metadata 存流程／執行設定。長期用戶記憶要另行設計，checkpointer 不會自動提供。狀態存可序列化資料及穩定 ID，不存 MCP session、連線或憑證；此金融 app 的真實 PostgreSQL 恢復檢查仍為 NOT RUN。') },
];

export const checkpointReferences = [
  { title: 'LangGraph checkpointers and durability modes', url: 'https://docs.langchain.com/oss/python/langgraph/checkpointers' },
  { title: 'AsyncPostgresSaver package and connection setup', url: 'https://pypi.org/project/langgraph-checkpoint-postgres/' },
  { title: 'Interrupt and resume semantics', url: 'https://docs.langchain.com/oss/python/langgraph/interrupts' },
  { title: 'Fault tolerance and side-effect boundaries', url: 'https://docs.langchain.com/oss/python/langgraph/fault-tolerance' },
];

export type CheckpointDemoScenario = 'durable' | 'memory_only' | 'receipt_gap' | 'expired';
export const checkpointDemoScenarios: Array<{ id: CheckpointDemoScenario; title: Copy; instruction: Copy }> = [
  { id: 'durable', title: t('Saved review survives restart', '已存覆核可在重啟後恢復'), instruction: t('Play to the review, simulate an app restart, recover the saved run, then submit a selection. Watch the fetch count stay at one.', '播放至覆核，模擬 app 重啟，找回保存任務後提交選取；留意抓取次數仍是一。') },
  { id: 'memory_only', title: t('Without a durable saver', '沒有持久 saver'), instruction: t('Reach review and restart. This comparison keeps no durable graph state, so its recovery button cannot reconstruct the run.', '到覆核後重啟。此比較沒有持久 graph 狀態，恢復按鈕不能重建任務。') },
  { id: 'receipt_gap', title: t('Crash before receipt checkpoint', '收據 checkpoint 前故障'), instruction: t('The provider result commits, then the app crashes before checkpointing it. Recover and step again: receipt reconciliation prevents a second fetch.', '供應商結果已提交，但 app 在記錄 checkpoint 前故障。恢復再前進，核對原收據可避免第二次抓取。') },
  { id: 'expired', title: t('Expired review cannot resume', '過期覆核不能恢復'), instruction: t('Reach review, expire its window, then try submitting. The checkpoint still exists for audit, but generation stays blocked.', '到覆核後令期限過期，再嘗試提交；checkpoint 仍保留供核對，但不能生成。') },
];

export type CheckpointPhase = 'new' | 'accepted' | 'fetched' | 'ranked' | 'review' | 'reviewed' | 'done';
export type DemoProgress = { phase: CheckpointPhase; snapshotId: string | null; selectedIds: string[]; searchRounds: number; remainingActiveMs: number };
export type DemoCheckpoint = { id: string; threadId: string; values: DemoProgress; next: string[] };
export type CheckpointDemo = {
  scenario: CheckpointDemoScenario; live: DemoProgress | null; history: DemoCheckpoint[];
  reviewEntries: number; receipt: boolean; providerFetches: number; reconciliations: number; generationStages: number;
  expired: boolean; blocked: boolean; message: Copy;
};
export type CheckpointDemoAction = { type: 'step' | 'restart' | 'recover' | 'expire' } | { type: 'submit'; order: 'recommended' | 'costs_first' } | { type: 'reset'; scenario: CheckpointDemoScenario };
export const checkpointThreadId = 'fictional-run-msft-001';

export function createCheckpointDemo(scenario: CheckpointDemoScenario): CheckpointDemo {
  return { scenario, live: { phase: 'new', snapshotId: null, selectedIds: [], searchRounds: 0, remainingActiveMs: 60000 }, history: [], reviewEntries: 0, receipt: false, providerFetches: 0, reconciliations: 0, generationStages: 0, expired: false, blocked: false, message: t('Start an accepted research run. The panels below are a simulation, not a PostgreSQL connection.', '開始已接納研究任務；下方為模擬面板，沒有 PostgreSQL 連線。') };
}

const nextNodes: Record<CheckpointPhase, string[]> = { new: ['scope'], accepted: ['refresh'], fetched: ['snapshot', 'retrieve'], ranked: ['review'], review: ['review'], reviewed: ['gate', 'context'], done: [] };
function persistDemo(model: CheckpointDemo, values: DemoProgress, message: Copy): CheckpointDemo {
  const checkpoint: DemoCheckpoint = { id: `fictional-cp-${model.history.length + 1}`, threadId: checkpointThreadId, values, next: nextNodes[values.phase] };
  return { ...model, live: values, message, history: model.scenario === 'memory_only' ? [] : [...model.history, checkpoint] };
}
export function checkpointDemoCanStep(model: CheckpointDemo): boolean {
  return !model.blocked && model.live !== null && model.live.phase !== 'review' && model.live.phase !== 'done';
}

export function checkpointDemoTransition(model: CheckpointDemo, action: CheckpointDemoAction): CheckpointDemo {
  if (action.type === 'reset') return createCheckpointDemo(action.scenario);
  if (action.type === 'expire') return model.live?.phase === 'review' ? { ...model, expired: true, message: t('Review window expired. Saved progress remains, but it does not grant permission or a fresh budget.', '覆核期已過，保存進度仍在，但不授予權限或新預算。') } : model;
  if (action.type === 'restart') return model.live?.phase !== 'new' && model.live !== null ? { ...model, live: null, message: t('Simulated process stopped: RAM is empty. Inspect what remains in the checkpoint and receipt panels.', '模擬程序停止：RAM 已空，查看 checkpoint 及收據面板仍保留甚麼。') } : model;
  if (action.type === 'recover') {
    if (model.live !== null) return model;
    const saved = model.history.at(-1);
    if (!saved) return { ...model, message: t('No durable graph checkpoint exists in this comparison. It has no other recovery implementation; start a new request.', '此比較沒有持久 graph checkpoint，亦沒有其他恢復實作；須開新請求。') };
    if (model.expired) return { ...model, blocked: true, message: t('Owner/thread lookup finds the checkpoint, but expiry blocks this run. No report is generated.', '擁有者／thread 核對找到 checkpoint，但期限已過，不能生成報告。') };
    return { ...model, live: saved.values, message: saved.values.phase === 'review' ? t('Restored the same thread at review. Submit a decision with Command(resume=...); restoring alone does not approve news.', '已在同一 thread 找回覆核；須 Command(resume=...) 提交決定，找回不等於批准新聞。') : t('Restored saved state. Continue unfinished work with ainvoke(None, config); completed checkpoints are reused.', '找回已存狀態，以 ainvoke(None, config) 繼續未完成工作，重用已完成 checkpoints。') };
  }
  const live = model.live;
  if (!live || model.blocked) return model;
  if (action.type === 'submit') {
    if (live.phase !== 'review') return model;
    if (model.expired) return { ...model, blocked: true, message: t('Expired selection rejected before generation. Keep the checkpoint for audit; a new request needs fresh evidence.', '過期選取在生成前被拒絕；checkpoint 保留供核對，新請求須新證據。') };
    return persistDemo({ ...model, reviewEntries: model.reviewEntries + 1 }, { ...live, phase: 'reviewed', selectedIds: action.order === 'costs_first' ? ['costs-v2', 'demand-v1'] : ['demand-v1', 'costs-v2'] }, t('Fictional API validated owner, thread and selected IDs/order. Command(resume=...) re-enters the review node; earlier news/search nodes stay completed.', '虛構 API 已核對擁有者、thread 及選取 ID／次序；Command(resume=...) 重入覆核節點，之前新聞／搜尋節點保持完成。'));
  }
  switch (live.phase) {
    case 'new': return persistDemo(model, { ...live, phase: 'accepted' }, t('Scope accepted. With sync durability, initial graph progress is committed before the first provider-facing node starts.', '範圍已接納；sync durability 先提交初始進度，才開始接觸供應商的節點。'));
    case 'accepted': {
      if (model.scenario === 'receipt_gap' && !model.receipt) return { ...model, receipt: true, providerFetches: 1, live: null, message: t('n8n committed a fictional receipt, then the host crashed before checkpointing the result. Latest graph checkpoint still says refresh is unfinished.', 'n8n 已提交虛構收據，host 卻在 checkpoint 結果前故障；最新 graph checkpoint 仍顯示 refresh 未完成。') };
      const acquired = { ...model, receipt: true, providerFetches: model.receipt ? model.providerFetches : model.providerFetches + 1, reconciliations: model.reconciliations + (model.receipt ? 1 : 0) };
      return persistDemo(acquired, { ...live, phase: 'fetched', remainingActiveMs: 48000 }, model.receipt ? t('Refresh re-entered, found the existing run receipt and reconciled it. Provider fetch count stays one.', 'Refresh 重入，找到原任務收據並核對，供應商抓取仍為一次。') : t('n8n returned committed news version IDs. The graph now checkpoints the receipt reference; provider retries remain inside n8n.', 'n8n 回傳已提交新聞版本 ID；graph 保存收據引用，供應商重試仍由 n8n 負責。'));
    }
    case 'fetched': return persistDemo(model, { ...live, phase: 'ranked', snapshotId: 'fictional-evidence-snapshot-v1', selectedIds: ['demand-v1', 'costs-v2'], searchRounds: 1, remainingActiveMs: 32000 }, t('Pinned the evidence snapshot, completed one search and saved its ranked IDs. This teaching frame groups those completed stages.', '固定證據快照，完成一輪搜尋並存排序 ID；此教學畫面把幾個已完成階段合併展示。'));
    case 'ranked': return persistDemo({ ...model, reviewEntries: model.reviewEntries + 1 }, { ...live, phase: 'review', remainingActiveMs: 30000 }, t('interrupt() pauses review and saves progress. No report yet. Intentional review wait pauses active time; counters and absolute review expiry do not reset.', 'interrupt() 暫停覆核及保存進度，未生成報告；刻意等待暫停處理計時，但次數及絕對期限不重設。'));
    case 'reviewed': return persistDemo({ ...model, generationStages: model.generationStages + 1 }, { ...live, phase: 'done', remainingActiveMs: 18000 }, t('Evidence checks pass in this fictional case. Context → generation → validation → save complete. No real LLM call occurs; the existing report would be returned on later recovery.', '此虛構案例通過證據檢查；context → 生成 → 驗證 → 保存完成，沒有真實 LLM 呼叫；之後恢復會取回已有報告。'));
    case 'review':
    case 'done': return model;
    default: { const exhaustive: never = live.phase; return exhaustive; }
  }
}

export function checkpointDemoSnapshot(checkpoint: DemoCheckpoint | undefined) {
  if (!checkpoint) return { disclosure: 'No simulated durable checkpoint yet' };
  return { disclosure: 'Fictional readable StateSnapshot-style view, not the raw PostgreSQL schema', config: { configurable: { thread_id: checkpoint.threadId, checkpoint_ns: '', checkpoint_id: checkpoint.id } }, values: checkpoint.values, next: checkpoint.next, tasks: checkpoint.values.phase === 'review' ? [{ name: 'review', interrupts: ['awaiting selection'] }] : [] };
}

const node = (id: string, label: string, en: string, zh: string) => ({ id, label, detail: t(en, zh) });
const edge = (from: string, to: string, en: string, zh: string, kind: FinanceDiagram['edges'][number]['kind'] = 'flow') => ({ from, to, label: t(en, zh), detail: t(en, zh), kind });
export const checkpointArchitectureDiagram: FinanceDiagram = {
  id: 'checkpoint_architecture', title: t('Where AsyncPostgresSaver fits in your project', 'AsyncPostgresSaver 在項目的位置'),
  nodes: [
    node('api', 'PYTHON API + OWNER / RUN', 'Authenticate and resolve the server-owned thread before every start, inspect or resume.', '每次開始、查看或恢復前驗證身分，解析伺服器建立的 thread。'),
    node('graph', 'LANGGRAPH RESEARCH GRAPH', 'Runs nodes and conditional edges. Compile with checkpointer=saver once per application lifespan.', '執行節點及條件路徑；app 生命週期內以 checkpointer=saver 編譯。'),
    node('n8n', 'HOST refresh: n8n RECEIPT', 'The LangGraph refresh node calls n8n and checkpoints the returned receipt reference. n8n owns acquisition retries and receipt reconciliation; its daily Alpha Vantage job is separate.', 'LangGraph refresh 節點呼叫 n8n，並 checkpoint 回傳收據引用。n8n 管抓取重試及收據核對，每日 Alpha Vantage 工作獨立執行。'),
    node('rank', 'SNAPSHOT → SEARCH → RANK', 'Use the pinned evidence versions and retrieval view, then save ranked source IDs and search counters.', '用固定證據及檢索視圖，保存排序來源 ID 及搜尋次數。'),
    node('review', 'REVIEW interrupt()', 'Pause for source exclusions/order. Completed acquisition stays outside the interrupted node.', '暫停等來源排除／次序選擇；完成抓取放在中斷節點外。'),
    node('report', 'EVIDENCE GATE → LLM → REPORT', 'Check selected evidence and budgets, then validate and persist the result in the business database.', '查證據及預算，再驗證及把結果存業務資料庫。'),
    node('saver', 'AsyncPostgresSaver', 'Framework persistence adapter. Save graph state at checkpoint boundaries; async I/O is separate from durability mode.', '框架持久保存介面，在 checkpoint 邊界存 graph 狀態；async I/O 與 durability 模式不同。'),
    node('checkpoint_db', 'POSTGRESQL research_checkpoints', 'Library-owned checkpoint tables store thread-scoped progress; they do not replace news, reports or n8n metadata.', '套件管理的表存 thread 進度，不取代新聞、報告或 n8n 管理資料。'),
  ],
  edges: [edge('api', 'graph', 'Authorized thread config', '已授權 thread 設定'), edge('graph', 'n8n', 'Accepted request', '已接納請求'), edge('n8n', 'rank', 'Committed receipt', '已提交收據'), edge('rank', 'review', 'Ranked evidence', '已排序證據'), edge('review', 'report', 'Validated selection', '已驗證選取'), edge('graph', 'saver', 'Initial state / step boundaries', '初始狀態／step 邊界'), edge('n8n', 'saver', 'Receipt reference', '收據引用'), edge('rank', 'saver', 'Snapshot + IDs + counters', '快照＋ID＋次數'), edge('review', 'saver', 'Pending interrupt + state', '等待中斷＋狀態'), edge('report', 'saver', 'Report reference + status', '報告引用＋狀態'), edge('saver', 'checkpoint_db', 'Persist / load via async I/O', 'Async I/O 保存／載入')],
};
export const checkpointRecoveryDiagram: FinanceDiagram = {
  id: 'checkpoint_recovery', title: t('Recover a failed run or resume a review', '恢復失敗任務或繼續覆核'),
  nodes: [node('request', 'API: AUTHENTICATE OWNER', 'The client does not choose arbitrary thread state or another owner’s ID.', 'Client 不能指定任意 thread 狀態或另一擁有者 ID。'), node('load', 'LOAD LATEST AUTHORIZED CHECKPOINT', 'Resolve run → thread and use the saver to inspect saved progress.', '解析 run → thread，以 saver 查看已存進度。'), node('check', 'STATUS + BUDGET + EXPIRY', 'Check model/code compatibility, current permissions, remaining active budget and review expiry.', '核對模型／程式相容性、當前權限、處理餘額及覆核期限。'), node('review', 'PENDING REVIEW: Command(resume=...)', 'Validate and atomically save source selection revision, then re-enter the interrupted review node.', '驗證及原子保存來源選取版本，再重入中斷覆核節點。'), node('failed', 'FAILED NODE: ainvoke(None, config)', 'Continue unfinished work; if refresh was uncheckpointed, reconcile its external receipt first.', '繼續未完成工作；若 refresh 未記錄 checkpoint，先核對外部收據。'), node('done', 'ALREADY COMPLETE → RETURN REPORT', 'Return the saved result without another generation.', '取回已存結果，不再生成。'), node('continue', 'REUSE COMPLETED WORK', 'Keep the original snapshot, counters and remaining budget; validate again before release.', '保留原快照、次數及處理餘額，發布前再驗證。'), node('save', 'NEW CHECKPOINT / NEXT STEP', 'The saver writes the updated progress; original evidence and previous history stay identifiable.', 'Saver 寫更新進度，原證據及歷史仍可識別。'), node('stop', 'REJECT / EXPIRED / MISSING → END', 'Explain the failed authorization, expired budget or unavailable checkpoint. Do not silently create a fresh run.', '說明授權失敗、預算過期或無 checkpoint，不能暗中新建任務。')],
  edges: [edge('request', 'load', 'Owner / thread verified', '擁有者／thread 已核對'), edge('request', 'stop', 'Unauthorized', '未獲授權', 'stop'), edge('load', 'check', 'Checkpoint found', '找到 checkpoint'), edge('load', 'stop', 'Missing / storage unavailable', '缺少／儲存不可用', 'stop'), edge('check', 'stop', 'Invalid / expired', '無效／過期', 'stop'), edge('check', 'review', 'Waiting for selection', '等候選取'), edge('check', 'failed', 'Recoverable failure', '可恢復失敗'), edge('check', 'done', 'Saved report exists', '已有報告'), edge('review', 'continue', 'Validated resume payload', '已驗證恢復內容'), edge('failed', 'continue', 'Safe continuation', '安全繼續'), edge('continue', 'save', 'Within original limits', '原上限內')],
};
