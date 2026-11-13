import type { Copy } from './curriculum';

const t = (en: string, zh: string): Copy => ({ en, zh });
export type FinanceRouteKind = 'flow' | 'retry' | 'fallback' | 'stop';
export type FinanceRoute = { from: string; to: string; when: Copy; payload: Copy; label: Copy; kind: FinanceRouteKind };
const route = (from: string, to: string, en: string, zh: string, outputEn: string, outputZh: string, label: Copy, kind: FinanceRouteKind = 'flow'): FinanceRoute => ({ from, to, when: t(en, zh), payload: t(outputEn, outputZh), label, kind });

export const financeFunctionRoutes = {
  company: [
    route('Prompt + selection', 'Scope gate', 'Validate company, horizon and question intent.', '驗證公司、期間及問題意圖。', 'Original question + canonical company + horizon', '原問題＋標準公司＋期間', t('Validate', '驗證')),
    route('Scope gate', 'Clarify → END', 'Company or intent is ambiguous.', '公司或意圖不明確。', 'One clarification question; no news/retrieval calls', '一個澄清問題；不呼叫新聞或檢索', t('Ambiguous', '不明確'), 'stop'),
    route('Scope gate', 'Out of scope → END', 'Clearly unrelated or unsupported company.', '明顯無關或公司未支援。', 'Explain scope and show a supported example prompt', '交代範圍並提供支援問題例子', t('Unrelated', '不相關'), 'stop'),
    route('Scope gate', 'News refresh', 'Supported company research question.', '支援公司研究問題。', 'Validated ResearchRequest; unknown coverage may be refreshed', '已驗證 ResearchRequest；未知覆蓋可刷新', t('Supported', '範圍符合')),
  ],
  sources: [
    route('Startup: MCP discovery', 'Ready for accepted request', 'Connect to n8n over Streamable HTTP, list tools and validate the refresh schema. Compile with PostgreSQL checkpoints.', '以 Streamable HTTP 連接 n8n、列出及核對工具 schema，再以 PostgreSQL checkpoint 編譯。', 'Verified tool capability; startup performs no news acquisition', '已核對工具功能；啟動階段不抓新聞', t('Capability ready', '功能就緒')),
    route('Startup: MCP discovery', 'Unavailable → END', 'Required tool or authenticated endpoint is unavailable.', '所需工具或已認證端點不可用。', 'Readiness diagnostic', '就緒診斷', t('Startup failed', '啟動失敗'), 'stop'),
    route('Ready for accepted request', 'n8n validate + deduplicate run', 'The host sends one logical refresh after scope acceptance.', 'Host 通過範圍檢查後發出一次邏輯刷新。', 'company + original question + run_id + deadline', '公司＋原問題＋任務 ID＋時限', t('New accepted prompt', '新有效提示')),
    route('n8n validate + deduplicate run', 'Return structured receipt', 'This run already committed its evidence.', '此任務已提交證據。', 'Existing receipt; resume reuses completed work', '原紀錄；恢復重用已完成工作', t('Receipt exists', '已有紀錄')),
    route('n8n validate + deduplicate run', 'In progress → END', 'An atomic run claim already belongs to a running execution; do not start another provider call.', '原子任務鍵已屬執行中的工作，不另開供應商呼叫。', 'Existing execution ID and pending status for reconciliation', '原執行 ID 及待完成狀態供核對', t('Already running', '已在執行'), 'stop'),
    route('n8n validate + deduplicate run', 'n8n provider attempt', 'Valid new acquisition, atomic run lease claimed, matching request fingerprint and time remaining.', '有效新抓取、已原子取得任務 lease、請求指紋相符且仍有時間。', 'Allowlisted source and bounded timeout', '核准來源及有限 timeout', t('Fetch required', '需要抓取')),
    route('n8n validate + deduplicate run', 'Rejected → END', 'Invalid arguments, unsupported company or failed authorization.', '參數無效、公司未支援或授權失敗。', 'Typed non-retryable error', '不重試結構化錯誤', t('Reject', '拒絕'), 'stop'),
    route('n8n provider attempt', 'Normalize + validate records', 'Successful response, including a valid empty response. Cap each call at 10s and clip it to the remaining 25s acquisition phase and run deadline.', '成功回應，包括有效空結果；每次最多 10 秒，受餘下 25 秒抓取階段及任務時限限制。', 'Raw records and provider status', '原記錄及供應商狀態', t('Call ≤10s, within 25s', '每次≤10秒，階段25秒')),
    route('n8n provider attempt', 'n8n retry decision', 'Provider request failed.', '供應商請求失敗。', 'Error class + attempt count + remaining time', '錯誤分類＋次數＋剩餘時間', t('Fetch failed', '抓取失敗')),
    route('n8n retry decision', 'n8n backoff + jitter', 'Transient error, fewer than 3 attempts and enough time for another attempt. Respect Retry-After.', '暫時錯誤、少於 3 次且仍有時間再試；遵守 Retry-After。', 'Wait 1s then 2s plus jitter; clip to job deadline', '等待 1 秒、2 秒加 jitter；受工作時限限制', t('Transient, attempts <3', '暫時錯誤，次數<3'), 'retry'),
    route('n8n backoff + jitter', 'n8n provider attempt', 'The bounded wait completes before the original deadline.', '有限等待在原時限內完成。', 'Same run_id; incremented attempt count', '相同 run_id；增加次數', t('Wait 1s / 2s + jitter', '等待1／2秒＋jitter'), 'retry'),
    route('n8n retry decision', 'Unavailable → END', 'Permanent failure, exhausted attempts or insufficient remaining time.', '永久失敗、次數用完或餘下時間不足。', 'Provider unavailable; host does not blindly retry MCP', '供應商不可用；Host 不盲目重試 MCP', t('Stop fetching', '停止抓取'), 'stop'),
    route('Normalize + validate records', 'Commit PostgreSQL evidence', 'Validate source identity, dates and permissions; deduplicate syndicated stories and chunk permitted text.', '核對身份、日期及權限，轉載去重並切分允許原文。', 'Versioned company-news records + coverage status', '有版本公司新聞＋覆蓋狀態', t('Valid records', '有效記錄')),
    route('Normalize + validate records', 'Rejected → END', 'Provider payload is malformed or violates the evidence contract.', '供應商內容格式或證據合約無效。', 'Typed validation error', '結構化驗證錯誤', t('Invalid response', '回應無效'), 'stop'),
    route('Commit PostgreSQL evidence', 'Return structured receipt', 'Evidence and receipt are durably committed with an idempotency key.', '證據及紀錄用冪等鍵持久提交。', 'company_news_version_ids + fetched_at + status + execution_id', '公司新聞版本＋擷取時間＋狀態＋執行 ID', t('Commit confirmed', '提交確認')),
    route('Commit PostgreSQL evidence', 'Unavailable → END', 'Storage failed or commit outcome needs reconciliation.', '儲存失敗或須核對提交結果。', 'Storage error; no successful receipt claimed', '儲存錯誤；不聲稱成功', t('Storage failed', '儲存失敗'), 'stop'),
    route('Return structured receipt', 'Pin combined snapshot', 'Host validates the receipt and reads eligible completed daily batches and the company-profile version.', 'Host 驗證紀錄，讀取合資格完整每日批次及公司背景版本。', 'Company + macro + geopolitical + profile version manifest', '公司＋宏觀＋地緣＋背景版本清單', t('Combine evidence versions', '組合證據版本')),
    route('Pin combined snapshot', 'Retrieve', 'Required coverage is available under the fixed cutoff and current permissions.', '固定截止及當前權限下所需覆蓋足夠。', 'snapshot_id + version IDs + per-stream freshness', 'snapshot_id＋版本 ID＋各來源新鮮度', t('Snapshot ready', '快照就緒')),
    route('Pin combined snapshot', 'Insufficient → END', 'The question requires missing or stale evidence.', '問題所需證據缺少或過期。', 'Coverage gap and dated supported facts', '覆蓋缺口及有日期支持事實', t('Coverage gap', '覆蓋不足'), 'stop'),
  ],
  retrieval: [
    route('PostgreSQL → full-text / pgvector', 'Unavailable → END', 'The shared PostgreSQL service is unavailable; neither retrieval path can run.', '共用 PostgreSQL 服務中斷，兩條檢索路徑均不可用。', 'Database failure; preserve the original deadline and counters', '資料庫故障；保留原時限及計數', t('Database unavailable', '資料庫不可用'), 'stop'),
    route('PostgreSQL → full-text / pgvector', 'Candidates', 'Company, permissions and both timestamps pass.', '公司、權限及兩個時間戳符合。', '20 candidates per branch: chunk IDs + passages + original ranks', '每分支 20 候選：切段 ID＋原文＋初始排序', t('Apply filters', '套用篩選')),
    route('Candidates', 'Optional evidence review', 'Use the default full-text ranking while hybrid is blocked.', '混合檢索未獲准入時採用預設全文排序。', 'Ranked passages + sparse mode', '已排序原文＋sparse 模式', t('Full-text default', '預設全文搜尋')),
    route('Candidates', 'RRF fusion + reranker', 'Use hybrid after it passes admission.', '混合檢索通過准入後採用。', 'Deduplicated top 20 → cross-encoder top 10', '去重前 20 → cross-encoder 前 10', t('Admitted mode', '已准入模式')),
    route('RRF fusion + reranker', 'Optional evidence review', 'Ranking succeeds using the admitted mode.', '使用已准入模式成功排序。', 'Ranked passages and actual mode', '已排序原文及實際模式', t('Ranking succeeds', '排序成功')),
    route('PostgreSQL → full-text / pgvector', 'Sparse fallback', 'Vector retrieval fails but PostgreSQL full-text search remains available.', '向量檢索失敗，但 PostgreSQL 全文搜尋仍可用。', 'Same snapshot and deadline', '相同快照及時限', t('Vector path fails', '向量路徑失敗'), 'fallback'),
    route('RRF fusion + reranker', 'Sparse fallback', 'Reranker fails while a working sparse path remains within the deadline.', '重排失敗，但時限內 sparse 仍可用。', 'Original question and snapshot; no fabricated scores', '原問題及快照；不捏造分數', t('Reranker fails', '重排失敗'), 'fallback'),
    route('Sparse fallback', 'Optional evidence review', 'Use the working sparse result within the original budget.', '原預算內使用可用 sparse 結果。', 'Passages + fallback_reason', '原文＋回退原因', t('Sparse works', 'Sparse 可用'), 'fallback'),
    route('Optional evidence review', 'Validate selection revision', 'Automatic mode uses system recommendations; review mode shows original ranks and proposed news, then pauses for highlights, exclusions or user discussion order.', '自動用系統建議；覆核展示原排名及建議新聞，可標記、排除或改討論次序。', 'Same snapshot; ID-only selection; saved remaining budget', '相同快照；只傳 ID 選取；保存剩餘預算', t('Auto / user submits', '自動／用戶提交')),
    route('Optional evidence review', 'Review expired → END', 'The absolute 15-minute window from the first pause has expired.', '首次暫停起 15 分鐘絕對期限已過。', 'Preserved checkpoint; new request required', '保留 checkpoint；須新請求', t('Window expired', '期限已過'), 'stop'),
    route('Validate selection revision', 'Evidence gate', 'Owner, run, thread, snapshot, revision, permitted IDs and expiry pass API and graph checks.', 'API 及 graph 核對擁有者、任務、thread、快照、版本、可用 ID 及期限。', 'Selected/highlighted/excluded IDs + system rank + validated user order; no changed truth scores', '已選／標記／排除 ID＋系統排名＋已核對用戶次序；不改真實分數', t('Recheck after exclusion', '排除後重查')),
    route('Sparse fallback', 'Unavailable → END', 'Sparse also fails or the deadline expires.', 'Sparse 亦失敗或已超時。', 'Dependency error, not an empty evidence claim', '依賴錯誤，不聲稱沒有證據', t('No working path', '沒有可用路徑'), 'stop'),
    route('Evidence gate', 'Refine query once', 'First search lacks coverage and the original budget remains.', '首次搜尋覆蓋不足，原預算仍有餘額。', 'Missing facets; preserve company, cutoff and snapshot', '缺失面向；保留公司、截止及快照', t('Gap after search 1', '首次搜尋有缺口'), 'retry'),
    route('Refine query once', 'PostgreSQL → full-text / pgvector', 'Search again with a narrower query; at most two searches total, including failed attempts.', '收窄查詢再搜尋；包含失敗嘗試總共最多兩次。', 'Same snapshot, new query, retained search counter', '相同快照、新查詢、保留搜尋計數', t('Search 2 of 2', '第 2／2 次搜尋'), 'retry'),
    route('Evidence gate', 'Insufficient → END', 'The second search still lacks support, or no refinement budget remains.', '第二次搜尋仍不足，或沒有補查預算。', 'Missing facets; no forecast', '缺失面向；不作預測', t('Still insufficient', '仍不足'), 'stop'),
    route('Evidence gate', 'Build context', 'Relevant, current passages cover the question.', '相關且當前原文足以覆蓋問題。', 'At most 6 excerpts, stable citation IDs and provenance', '最多 6 節錄、穩定引用 ID 及來源記錄', t('Enough support', '支持足夠')),
  ],
  research: [
    route('Validated request → scope → refresh → snapshot → retrieve → rank', 'Optional review + selection validation', 'Code owns mandatory ordering and budgets. Sparse default also enters review.', '程式控制必需次序及預算；預設 sparse 亦經覆核。', 'Ranked candidates, fixed snapshot, review mode and candidate revision', '已排序候選、固定快照、覆核模式及候選版本', t('Ranked evidence', '已排序證據')),
    route('Optional review + selection validation', 'Evidence gate', 'Automatic selection or authenticated resume passes validation within the review window.', '自動選取或已驗證恢復在覆核期內通過核對。', 'Selection revision, exclusions, highlights and remaining budgets', '選取版本、排除、標記及剩餘預算', t('Validate then recheck', '驗證後重查')),
    route('Optional review + selection validation', 'Review expired → END', 'The review window is over; do not generate from this paused run.', '覆核期已過，不能用暫停任務生成。', 'Expired status and saved checkpoint', '過期狀態及已存 checkpoint', t('Window expired', '期限已過'), 'stop'),
    route('Evidence gate', 'Refine → retrieve', 'First attempt only, and budget remains.', '只限首次嘗試，而且仍有預算。', 'Refined query; same original question and snapshot', '修正查詢；相同原問題及快照', t('Gap + budget', '缺口＋有預算'), 'retry'),
    route('Refine → retrieve', 'Optional review + selection validation', 'Recheck the second retrieval under the same snapshot; retain known choices and review new candidates within the original window.', '同一快照重查第二輪；保留已知選擇，原期限內覆核新候選。', 'Updated candidates; attempts = 2; no reset of exclusions or budgets', '更新候選；次數 = 2；不重設排除或預算', t('Search 2 of 2', '第 2／2 次搜尋'), 'retry'),
    route('Evidence gate', 'Insufficient → END', 'Second attempt fails to cover the question.', '第二次仍未覆蓋問題。', 'Supported facts + missing facets; no forecast', '有支持事實＋缺失面向；不作預測', t('Still insufficient', '仍不足'), 'stop'),
    route('Evidence gate', 'Context → LLM → validation', 'All required facets have support; conflicts are retained.', '所有所需面向有支持，矛盾證據保留。', 'Prompt-specific draft with citations and conditional scenarios', '針對提示的草稿、引用及條件式情境', t('Enough evidence', '證據足夠')),
    route('Context → LLM → validation', 'Save → answer', 'Validation passes within the budget.', '預算內通過驗證。', 'Validated cited answer', '已驗證引用答案', t('Validation passed', '驗證通過')),
    route('Context → LLM → validation', 'Blocked → END', 'Citation or support validation fails.', '引用或支持驗證失敗。', 'Withheld draft and validation errors', '不發布草稿及驗證錯誤', t('Invalid citation', '引用無效'), 'stop'),
    route('Context → LLM → validation', 'Unavailable → END', 'Deadline, call limit or dependency failure.', '超時、超額或依賴失敗。', 'Typed error + resumable checkpoint when safe', '結構化錯誤＋安全時可恢復 checkpoint', t('Timeout / error', '超時／錯誤'), 'stop'),
  ],
  report: [
    route('Selected passages', 'Context envelope', 'Deduplicate, read original excerpts and enforce token budget.', '去重、讀原文並限制 token。', 'Question, horizon, as_of, evidence[], missing_facets[], conflicts[]', '問題、期間、截止、證據、缺失面向及矛盾', t('Read + trim', '讀取＋裁剪')),
    route('Context envelope', 'Draft', 'System policy and user question stay separate from untrusted excerpts.', '系統規則及使用者問題與不可信原文分開。', 'Direct answer + observed facts + conditional scenarios + citation IDs', '直接答案＋觀察事實＋條件式情境＋引用 ID', t('Generate draft', '生成草稿')),
    route('Draft', 'Validation', 'Require claim support; a reranker score is not confidence.', '要求主張支持；重排分數不是信心。', 'Draft only; never stream an unvalidated recommendation', '只產生草稿；不串流未驗證建議', t('Check support', '核對支持')),
    route('Validation', 'Blocked → END', 'Unknown citation or unsupported factual claim.', '未知引用或無支持事實。', 'Do not release draft', '不發布草稿', t('Invalid', '無效'), 'stop'),
    route('Validation', 'Display + report rating', 'Persist before exposing the final answer.', '先保存，再顯示最終答案。', 'Report ID, trace URL/status; separate feedback linked to run_id', '報告 ID、trace URL／狀態；回饋另存並連結 run_id', t('Valid + saved', '有效＋已存')),
  ],
  validation: [
    route('Draft + evidence', 'Validation checks', 'Ignore embedded instructions; check IDs, dates, company, coverage and factual support.', '忽略內嵌指令，檢查 ID、日期、公司、覆蓋及事實支持。', 'Validation errors or a validated report', '驗證錯誤或已驗證報告', t('Check claims', '核對主張')),
    route('Validation checks', 'Blocked → END', 'A required validation fails.', '必要驗證失敗。', 'validation_failed; no draft publication', 'validation_failed；不發布草稿', t('Any failure', '任一失敗'), 'stop'),
    route('Validation checks', 'Persist report', 'Every material factual claim has excerpt support.', '所有重要事實主張有原文支持。', 'Validated result and source references', '已驗證結果及來源引用', t('All pass', '全部通過')),
  ],
  export: [
    route('Report ID → authorized lookup', 'Saved result', 'Caller owns the report; ID exists.', '呼叫者擁有報告且 ID 存在。', 'Saved question, answer, sources, dates, trace status', '已存問題、答案、來源、日期及 trace 狀態', t('Authorized', '有權限')),
    route('Report ID → authorized lookup', '404 / conflict → END', 'No exportable validated record exists.', '沒有可下載的已驗證紀錄。', 'Typed error; no regeneration', '結構化錯誤；不重新生成', t('Not exportable', '不能匯出'), 'stop'),
    route('Saved result', 'Serialize → download', 'Include insufficient status and fictional labels where applicable.', '適用時保留證據不足狀態及虛構標籤。', 'Markdown identical to displayed report; zero LLM calls', '與畫面相同 Markdown；零 LLM 呼叫', t('No new LLM call', '不再呼叫 LLM')),
  ],
  recovery: [
    route('run_id → authenticate', 'PostgreSQL checkpoint', 'Resolve the same thread and original request.', '解析相同 thread 及原請求。', 'Saved snapshot, completed node results, attempts and remaining budget', '快照、已完成結果、次數及剩餘預算', t('Same owner / run', '相同擁有者／任務')),
    route('PostgreSQL checkpoint', '404 / 409 → END', 'Cannot safely resume the saved state.', '無法安全恢復儲存狀態。', 'Keep saved state; explain recovery failure', '保留狀態並交代恢復失敗', t('Unsafe state', '狀態不安全'), 'stop'),
    route('PostgreSQL checkpoint', 'Next unfinished / interrupted node', 'Active budget remains; review resumes also require a valid selection revision and unexpired review window. Interrupted nodes restart at their beginning; use idempotency keys for effects.', '仍有處理預算；覆核恢復另須有效選取版本及未過期覆核期。中斷節點從頭開始，副作用須用冪等鍵。', 'Same refresh receipt and search count; no budget reset', '相同刷新紀錄及搜尋次數；不重設預算', t('Resume, same budget', '原預算恢復'), 'retry'),
    route('PostgreSQL checkpoint', 'Stopped → END', 'A later fresh prompt requires a new run.', '稍後新研究須建立新任務。', 'Supported partial findings and explicit expiry', '有支持的部分發現及明確過期狀態', t('Expired', '已過期'), 'stop'),
  ],
  evaluation: [
    route('Frozen manifest → verify hash → run configurations', 'Observed outputs', 'Corpus, qrels and policy match the reviewed version.', '語料、qrels 及政策符合已核對版本。', 'Sparse, hybrid and reranked rankings on identical prompts', '相同提示的 sparse、混合及重排排序', t('Frozen inputs', '凍結輸入')),
    route('Observed outputs', 'Score retrieval + citations + safety', 'Use actual outcomes and independently judged support.', '使用實際結果及獨立支持度判斷。', 'recall/nDCG, citation precision, abstentions, injection outcomes', 'recall／nDCG、引用精準度、拒答及注入結果', t('Measure', '量度')),
    route('Score retrieval + citations + safety', 'Block admission', 'Synthetic-only, live checks missing or thresholds fail.', '只有虛構測試、缺真實檢查或未達門檻。', 'Sparse remains active; NOT RUN stays visible', '維持 sparse；明示 NOT RUN', t('Gate failed', '未過門檻'), 'stop'),
    route('Score retrieval + citations + safety', 'Approve versioned candidate', 'Real-news holdout, safety and tracing also pass.', '真實新聞保留集、安全及追蹤亦通過。', 'Approved retrieval version + public report card', '核准檢索版本＋公開成績表', t('All gates pass', '全部通過')),
  ],
  observability: [
    route('Run start → root span', 'Span events', 'Propagate context into MCP and provider attempts.', 'Context 傳入 MCP 及供應商嘗試。', 'trace_id, run_id, parent spans, errors and actual usage', 'trace_id、run_id、父 spans、錯誤及實際用量', t('Record actual work', '記錄實際工作')),
    route('Span events', 'Redact → Collector → Langfuse / LangSmith', 'Keep one instrumentation tree; do not double-count tokens.', '保留一組 instrumentation；不重複計 token。', 'Sanitized operational traces and experiment feedback', '清理後運行 traces 及實驗回饋', t('Redact + export', '去敏感資料＋匯出')),
    route('Redact → Collector → Langfuse / LangSmith', 'Mark demo evidence incomplete', 'Trace cannot be flushed or opened by a reviewer.', 'Trace 不能 flush 或審閱者無法開啟。', 'Preserved answer + unavailable trace status', '保留答案＋trace 不可用狀態', t('Trace unavailable', 'Trace 不可用'), 'stop'),
    route('Redact → Collector → Langfuse / LangSmith', 'Report card', 'At least 30 completed runs for latency percentiles.', '延遲百分位至少需要 30 次已完成任務。', 'One actual URL per demo; cohort p50/p95 with failures', '每 demo 一個實際 URL；樣本 p50／p95 及失敗數', t('Trace verified', 'Trace 已核對')),
  ],
  deployment: [
    route('Verified source + evals → build images', 'Local containers + PostgreSQL', 'Configure private n8n, PostgreSQL and telemetry. Apply database and checkpoint migrations.', '設定私人 n8n、PostgreSQL 及追蹤端點。執行資料庫及 checkpoint migrations。', 'Versioned images and server-only configuration', '版本化映像及只供伺服器設定', t('Build + configure', '建置＋設定')),
    route('Local containers + PostgreSQL', 'Smoke tests → backup restore', 'Exercise normal, insufficient, irrelevant and outage paths.', '測試正常、資料不足、無關及中斷路徑。', 'Health, routing, persistence and recovery evidence', '健康、路由、持久性及恢復證據', t('Verify recovery', '驗證恢復')),
    route('Smoke tests → backup restore', 'Stop / rollback', 'Retain the last valid image and persistent data.', '保留最後有效映像及持久資料。', 'Failure reason and recovery action', '失敗原因及恢復動作', t('Checks fail', '檢查失敗'), 'stop'),
    route('Smoke tests → backup restore', 'Private deployment', 'Access control and backups verified.', '已驗證訪問控制及備份。', 'Release ID + reproducible demo and trace URL', '發布 ID＋可重現 demo 及 trace URL', t('Checks pass', '檢查通過')),
  ],
} satisfies Record<string, FinanceRoute[]>;

export type FinanceFunctionId = keyof typeof financeFunctionRoutes;
