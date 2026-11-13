import type { Copy } from './curriculum';

const t = (en: string, zh: string): Copy => ({ en, zh });

export const financeReviewGuide = [
  { title: t('Your feedback here means evidence review', '此處回饋指證據覆核'), body: t('Before generation, show up to six proposed report sources, original excerpts, source links/dates and the system relevance rank, with other ranked candidates shown separately. You can exclude articles, highlight topics and change the discussion order. Call this evidence review so it is distinct from post-report ratings/corrections, which are stored separately. Exclusion changes this report selection and never deletes news from PostgreSQL.', '生成前展示最多六個建議報告來源、原文、連結／日期及系統相關排序，其他排序候選另列。你可排除文章、標記主題及改討論次序。將這步稱「證據覆核」，與報告生成後另存的評分／更正分開；排除只改本次選取，不刪 PostgreSQL 新聞。') },
  { title: t('System rank and your order stay separate', '系統排名與你的次序分開'), body: t('Preserve system_ordered_ids and reranker scores, then store user_ordered_ids as an exact, duplicate-free permutation of selected IDs in the selection revision. Order can affect what the model attends to and how the report is organized; treat it as presentation/emphasis preference, not a new relevance or truth score. Pass the preference alongside evidence to context assembly. Required facets and counter-evidence take priority over arbitrary trimming. Recheck coverage after trimming and disclose exclusions; never increase forecast confidence because an article moved up. Reordering alone makes no provider, search or embedding call. Validate the selection cap before resume. Preserve selected source IDs when shortening excerpts; if a selected source cannot fit or support is lost, stop with an explained context/evidence gap rather than silently dropping it.', '保留 system_ordered_ids 及重排分數，再將 user_ordered_ids 存選取版本；它必須是所有已選 ID 的完整不重複排列。次序可影響模型注意及報告組織，只作呈現／重點偏好，不是新相關性或真實分數。建立 context 時連同證據傳入；必要面向及反方證據不能因裁剪優先次序而失去。裁剪後重查覆蓋並交代排除，不能因文章移前而提高信心；單純改次序不呼叫供應商、搜尋或 embedding。恢復前核對選取上限；縮短節錄仍須保留所選來源 ID，若放不下或支持流失須說明 context／證據缺口並停止，不能暗中刪掉所選來源。') },
  { title: t('Where the review belongs', '覆核放在哪一步'), body: t('Retrieve → rerank → optional evidence review → validate selection → evidence gate → context → LLM → validation. Default full-text search and sparse fallback enter the same review step. Choose automatic or review mode at request creation. Automatic mode uses the system selection and still passes all evidence checks.', '檢索 → 重排 → 可選證據覆核 → 驗證選取 → 證據關卡 → context → LLM → 驗證。預設全文及 sparse 回退都經同一步。建立請求時選自動或覆核模式；自動沿用系統選取，仍須通過所有證據檢查。') },
  { title: t('Highlight, exclude, reset, generate', '標記、排除、重設、生成'), body: t('Highlight asks for more discussion of a supported topic. It does not raise relevance scores, factual reliability or forecast confidence. Exclude from report removes a passage from this report selection; it never deletes stored news. Move up/down sets your discussion order without changing system scores. Reset restores system recommendations and their order. Generate submits the selection for validation and coverage checks before the LLM is allowed to run.', '標記要求多討論有證據支持的主題，不提高相關分數、真實性或預測信心。「排除此報告」只改本次選取，不刪新聞。上移／下移只改討論次序，不改系統分數；重設還原系統建議及次序；生成先提交選取，驗證及覆蓋檢查通過後才可呼叫 LLM。') },
  { title: t('Coverage and confirmation bias', '覆蓋及確認偏誤'), body: t('Show the question’s required facets, source dates, original excerpts, provenance and opposing evidence beside the controls. Recheck coverage after every submitted selection and after context trimming. An excluded dissenting source remains visible in the audit and report limitations; an exclusion cannot justify a broader claim. Missing required support triggers at most one refinement or an insufficient result. Highlighting an irrelevant passage does not make it admissible.', '操作旁展示問題必要面向、日期、原文、來源及反方證據。每次提交及裁剪 context 後重查覆蓋；被排除的反方來源保留於核對紀錄及報告限制，不能因排除而擴大結論。必要支持不足最多補查一次，否則回證據不足；標記無關段落亦不能令它合資格。') },
  { title: t('Snapshot and selection are different records', '快照與選取是不同紀錄'), body: t('PostgreSQL keeps immutable news versions and the run’s frozen snapshot manifest. Add append-only evidence_selection_revisions keyed by owner_id, run_id, thread_id, snapshot_id, candidate_revision and selection_revision, with selected/highlighted/excluded IDs and timestamps. Store final selection_revision with the report. The authenticated server derives owner_id, validates IDs against permitted snapshot candidates, requires highlighted IDs to be selected and excluded IDs to be disjoint, and uses an atomic revision check so a second browser tab cannot overwrite a newer selection.', 'PostgreSQL 保存不可變新聞版本及任務固定快照。另加只追加 evidence_selection_revisions，以擁有者、run、thread、快照、候選及選取版本綁定，保存已選／標記／排除 ID 及時間；報告引用最終選取版本。伺服器從驗證身分取得 owner_id，核對 ID 屬可用候選、標記屬已選及排除不重疊，並以原子版本核對避免另一分頁覆蓋新選取。') },
  { title: t('LangGraph pause and authenticated resume', 'LangGraph 暫停及身分驗證恢復'), body: t('Use interrupt() in a dedicated review node after retrieval has completed, a PostgreSQL checkpointer and Command(resume=...) with the same authenticated thread. The interrupted node starts again from its beginning on resume: keep news fetching, retrieval and other expensive side effects outside it. Validate the submitted schema, ownership, revision, permissions and expiry at the API boundary, then recheck the saved selection in the graph. Never pass arbitrary client state or article instructions into Command.', '檢索完成後由獨立覆核節點用 interrupt() 暫停，以 PostgreSQL checkpointer 保存；用相同已驗證 thread 及 Command(resume=...) 恢復。恢復會從中斷節點開頭重跑，新聞抓取、檢索及昂貴副作用須在節點外。API 邊界核對格式、擁有者、版本、權限及期限，再由 graph 核對已存選取；不能把任意 client 狀態或文章指令傳入 Command。') },
  { title: t('Two clocks, bounded review', '兩個時鐘，有上限覆核'), body: t('Proposed change: 60 seconds of active processing plus a 15-minute review window from the first pause. Persist the remaining active budget before waiting; only intentional review wait is excluded. Network waits and crash recovery still count. On resume use only the saved remainder, preserve the original evidence cutoff and all counters: one refresh, two searches, six source reads and three LLM calls. The review window is absolute and is not extended by edits or a second search. Expired review stops before generation and requires a new request. Report processing latency and review-wait/wall-clock latency separately; the 60s target applies to processing only.', '建議改為 60 秒處理預算，加首次暫停起 15 分鐘覆核期。等待前保存剩餘處理預算，只有刻意覆核等待可扣除；網絡等待及故障恢復仍計時。恢復只用餘額，保留原證據截止及全部計數：一次刷新、兩次搜尋、六次來源讀取、三次 LLM。編輯或第二輪不延長覆核期；過期停止生成並須新請求。分開報處理延遲、覆核等待及總耗時，60 秒目標只適用處理。') },
  { title: t('Refinement does not erase your choices', '補查不會抹掉選擇'), body: t('Allow at most two candidate rounds and one submitted selection per round. Local edits before Generate need no graph loop. Refinement uses the same snapshot, preserves exclusions/highlights for known source IDs and exposes new candidates for a second review within the original window. Reset is explicit. New candidates are not silently approved, excluded sources are not silently reintroduced and no edit grants another refresh or search budget. After the second failed coverage check, stop as insufficient.', '最多兩輪候選，每輪提交一次選取；生成前的本機編輯毋須 graph 迴圈。補查用相同快照，保留已知來源的排除／標記；原覆核期內展示新候選再覆核，重設須明確操作。不暗中批准新候選或重新加入被排除來源；編輯不增加刷新或搜尋預算。第二次覆蓋檢查仍不足就停止。') },
  { title: t('Prompt injection stays outside the controls', '提示注入不能控制操作'), body: t('Article text, highlighted passages and optional user notes remain untrusted data. They cannot change the company allowlist, scope route, budget, tool arguments or system policy. Selection controls submit source IDs and enumerated actions rather than executable instructions. Keep the scope gate before news access. Trace selection revisions, pause/resume and gate outcomes with redacted IDs; do not expose article text or private notes in public traces.', '文章、標記原文及可選筆記仍是不可信資料，不能改公司清單、範圍路由、預算、工具參數或系統規則。操作只傳來源 ID 及固定動作，不傳可執行指令；scope gate 維持在新聞存取前。追蹤選取版本、暫停／恢復及關卡結果，公開 trace 只用清理 ID，不放文章或私人筆記。') },
  { title: t('What must be verified in the future backend', '未來後端必須驗證甚麼'), body: t('Live review checks are NOT RUN. Before enabling the feature, test another owner’s IDs, stale revisions, revoked permissions, duplicate/concurrent resumes, expiry during a pause, crash recovery and injection inside a highlighted article. Verify that no rejected submission advances the graph, no source is deleted, known exclusions survive refinement, completed acquisition is not repeated and all budgets only decrease. Evaluate automatic reports separately from user-curated selections on the frozen golden set; do not count human choices as a retrieval improvement.', '真實覆核檢查為 NOT RUN。啟用前測其他擁有者 ID、舊版本、權限撤銷、重複／並行恢復、等待期間過期、故障恢復及標記文章內注入。核對被拒提交不推進 graph、不刪來源、補查保留排除、已完成抓取不重做，全部預算只減少。凍結 golden set 分開評估自動及人手選取報告，不能把人手選擇當檢索改善。') },
];

export const financeReviewExample = JSON.stringify({
  disclosure: 'Fictional proposed record; the academy has no live report backend',
  owner_id: 'server-derived-owner', run_id: 'example-run', thread_id: 'example-run',
  snapshot_id: 'snapshot-msft-example', candidate_revision: 1, selection_revision: 2,
  selected_ids: ['costs-v1-c1', 'demand-v2-c1'], highlighted_ids: ['costs-v1-c1'],
  system_ordered_ids: ['costs-v1-c1', 'demand-v2-c1', 'outlook-v1-c1'],
  user_ordered_ids: ['demand-v2-c1', 'costs-v1-c1'],
  excluded_ids: ['outlook-v1-c1'], missing_facets: ['earnings outlook'],
  selection_limitations: ['The only outlook passage was excluded; no outlook forecast is supported.'],
  remaining_active_ms: 32000, review_expires_at: '2026-11-13T01:15:00Z',
}, null, 2);

export const financeReviewSketch = `# Design sketch: API/storage/budget helpers must be implemented and tested.
from langgraph.types import interrupt, Command

def review_node(state):
    if state["review_mode"] == "automatic":
        return system_selection_update(state)  # Route to selection validation.
    if review_expired(state):
        return {"route": "review_expired"}
    # Candidate payload is already persisted. This node may execute twice.
    # The wrapper saves remaining active time once before the first interrupt.
    resume = interrupt(review_payload(state))
    # API has authenticated and atomically saved an ID-only selection revision.
    # Reload and validate the server record; do not trust client-provided state.
    return load_validated_selection_update(state, resume["selection_revision"])

# API resume sketch (server-owned config; never accept arbitrary thread state):
# owner = authenticate_request()
# selection = validate_and_commit_selection(owner, payload, expected_revision)
# graph.invoke(Command(resume={"selection_revision": selection.revision}),
#              {"configurable": {"thread_id": selection.thread_id}})
# Scope/news/retrieval are completed nodes and are not re-run on this resume.
`;

export const financeReviewSources = [
  { id: 'costs', title: t('Cloud infrastructure costs', '雲端基建成本'), facet: 'costs', excerpt: t('Fictional source: infrastructure spending increased this period.', '虛構來源：本期基建支出上升。') },
  { id: 'demand', title: t('Demand counter-evidence', '需求反方證據'), facet: 'demand', excerpt: t('Fictional source: customer demand remains resilient despite higher costs.', '虛構來源：成本上升但客戶需求仍穩健。') },
  { id: 'outlook', title: t('Earnings outlook', '盈利展望'), facet: 'outlook', excerpt: t('Fictional source: management gives a dated earnings-outlook range.', '虛構來源：管理層提供附日期盈利展望區間。') },
];

export function financeReviewCoverage(excludedIds: readonly string[]) {
  return financeReviewSources.filter(source => excludedIds.includes(source.id)).map(source => source.facet);
}

export function moveFinanceReviewSource({ orderedIds, excludedIds, sourceId, direction }: {
  orderedIds: readonly string[]; excludedIds: readonly string[]; sourceId: string; direction: 'up' | 'down';
}): string[] {
  const selected = orderedIds.filter(id => !excludedIds.includes(id));
  const position = selected.indexOf(sourceId);
  const adjacentId = selected[position + (direction === 'up' ? -1 : 1)];
  if (position < 0 || adjacentId === undefined) return [...orderedIds];
  // Swap selected entries while excluded cards keep their inspection positions.
  return orderedIds.map(id => id === sourceId ? adjacentId : id === adjacentId ? sourceId : id);
}
