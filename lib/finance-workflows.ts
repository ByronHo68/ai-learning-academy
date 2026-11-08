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
    route('Validated request → n8n MCP refresh', 'Provider response', 'Every new accepted prompt; resume reuses its receipt.', '每個新接納提示；恢復時重用紀錄。', 'company + query + run_id + cutoff', '公司＋查詢＋任務 ID＋截止點', t('Once per new prompt', '每新問題一次')),
    route('Provider response', 'Pinned snapshot', 'Normalize and index records with dates, permitted text and valid identity.', '驗證日期、允許節錄及身份，再正規化及索引。', 'source_id/chunk_id, URL, published_at, first_seen_at, content hash', '來源／切段 ID、URL、發布／首次取得時間及內容 hash', t('Valid records', '有效記錄')),
    route('Provider response', 'Unavailable → END', 'Refresh failed; do not treat an outage as zero relevant news.', '刷新失敗；不能把故障當成沒有相關新聞。', 'Provider status and typed error; no current prediction', '供應商狀態及結構化錯誤；不作當前預測', t('Provider failed', '供應商失敗'), 'stop'),
    route('Provider response', 'Insufficient → END', 'The refresh completed but only stale evidence remains.', '刷新完成，但只有過期證據。', 'Freshness gap and dated supported facts; no current prediction', '新鮮度缺口及有日期支持事實；不作當前預測', t('Only stale evidence', '只有過期證據'), 'stop'),
    route('Pinned snapshot', 'Retrieve', 'Store and index acknowledgements agree on snapshot_id.', '儲存及索引確認相同 snapshot_id。', 'Immutable snapshot_id + allowed source IDs', '不可變 snapshot_id＋允許來源 ID', t('Snapshot ready', '快照就緒')),
  ],
  retrieval: [
    route('Question + snapshot → filtered sparse/dense search', 'Candidates', 'Company, permissions and both timestamps pass.', '公司、權限及兩個時間戳符合。', '20 candidates per branch: chunk IDs + passages + original ranks', '每分支 20 候選：切段 ID＋原文＋初始排序', t('Apply filters', '套用篩選')),
    route('Candidates', 'RRF fusion + reranker', 'Hybrid admission passed; otherwise use sparse.', '混合准入已通過；否則用 sparse。', 'Deduplicated top 20 → cross-encoder top 10', '去重前 20 → cross-encoder 前 10', t('Admitted mode', '已准入模式')),
    route('RRF fusion + reranker', 'Evidence gate', 'Ranking succeeds using the admitted mode.', '使用已准入模式成功排序。', 'Ranked passages and actual mode', '已排序原文及實際模式', t('Ranking succeeds', '排序成功')),
    route('RRF fusion + reranker', 'Sparse fallback', 'Reranker fails while a working sparse path remains within the deadline.', '重排失敗，但時限內 sparse 仍可用。', 'Original question and snapshot; no fabricated scores', '原問題及快照；不捏造分數', t('Reranker fails', '重排失敗'), 'fallback'),
    route('Sparse fallback', 'Evidence gate', 'Use the working sparse result within the original budget.', '原預算內使用可用 sparse 結果。', 'Passages + fallback_reason', '原文＋回退原因', t('Sparse works', 'Sparse 可用'), 'fallback'),
    route('Sparse fallback', 'Unavailable → END', 'Sparse also fails or the deadline expires.', 'Sparse 亦失敗或已超時。', 'Dependency error, not an empty evidence claim', '依賴錯誤，不聲稱沒有證據', t('No working path', '沒有可用路徑'), 'stop'),
    route('Evidence gate', 'Refine query once', 'First search lacks coverage and the original budget remains.', '首次搜尋覆蓋不足，原預算仍有餘額。', 'Missing facets; preserve company, cutoff and snapshot', '缺失面向；保留公司、截止及快照', t('Gap after search 1', '首次搜尋有缺口'), 'retry'),
    route('Refine query once', 'Question + snapshot → filtered sparse/dense search', 'Search again with a narrower query; at most two searches total, including failed attempts.', '收窄查詢再搜尋；包含失敗嘗試總共最多兩次。', 'Same snapshot, new query, retained search counter', '相同快照、新查詢、保留搜尋計數', t('Search 2 of 2', '第 2／2 次搜尋'), 'retry'),
    route('Evidence gate', 'Insufficient → END', 'The second search still lacks support, or no refinement budget remains.', '第二次搜尋仍不足，或沒有補查預算。', 'Missing facets; no forecast', '缺失面向；不作預測', t('Still insufficient', '仍不足'), 'stop'),
    route('Evidence gate', 'Build context', 'Relevant, current passages cover the question.', '相關且當前原文足以覆蓋問題。', 'At most 6 excerpts, stable citation IDs and provenance', '最多 6 節錄、穩定引用 ID 及來源記錄', t('Enough support', '支持足夠')),
  ],
  research: [
    route('Validated request → scope → refresh → retrieve → rerank', 'Evidence gate', 'Code owns mandatory ordering and budgets.', '程式控制必需次序及預算。', 'Typed state, original prompt, snapshot, attempts, deadline, trace_id', '型別狀態、原提示、快照、次數、時限及 trace_id', t('Bounded run', '有限次執行')),
    route('Evidence gate', 'Refine → retrieve', 'First attempt only, and budget remains.', '只限首次嘗試，而且仍有預算。', 'Refined query; same original question and snapshot', '修正查詢；相同原問題及快照', t('Gap + budget', '缺口＋有預算'), 'retry'),
    route('Refine → retrieve', 'Evidence gate', 'Recheck the second retrieval with the same filters.', '以相同條件重新檢查第二輪檢索。', 'Updated evidence; attempts = 2', '更新證據；次數 = 2', t('Search 2 of 2', '第 2／2 次搜尋'), 'retry'),
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
    route('Validation', 'Display + feedback', 'Persist before exposing the final answer.', '先保存，再顯示最終答案。', 'Report ID, trace URL/status; separate feedback linked to run_id', '報告 ID、trace URL／狀態；回饋另存並連結 run_id', t('Valid + saved', '有效＋已存')),
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
    route('run_id → authenticate', 'Checkpoint', 'Resolve the same thread and original request.', '解析相同 thread 及原請求。', 'Saved snapshot, completed node results, attempts and remaining budget', '快照、已完成結果、次數及剩餘預算', t('Same owner / run', '相同擁有者／任務')),
    route('Checkpoint', '404 / 409 → END', 'Cannot safely resume the saved state.', '無法安全恢復儲存狀態。', 'Keep saved state; explain recovery failure', '保留狀態並交代恢復失敗', t('Unsafe state', '狀態不安全'), 'stop'),
    route('Checkpoint', 'Next unfinished node', 'Deadline remains; replayed effects use idempotency keys.', '未超時；重播副作用使用冪等鍵。', 'Same refresh receipt and search count; no budget reset', '相同刷新紀錄及搜尋次數；不重設預算', t('Resume, same budget', '原預算恢復'), 'retry'),
    route('Checkpoint', 'Stopped → END', 'A later fresh prompt requires a new run.', '稍後新研究須建立新任務。', 'Supported partial findings and explicit expiry', '有支持的部分發現及明確過期狀態', t('Expired', '已過期'), 'stop'),
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
    route('Verified source + evals → build images', 'Local containers', 'Configure private n8n, Qdrant and telemetry endpoints.', '設定私人 n8n、Qdrant 及追蹤端點。', 'Versioned images and server-only configuration', '版本化映像及只供伺服器設定', t('Build + configure', '建置＋設定')),
    route('Local containers', 'Smoke tests → backup restore', 'Exercise normal, insufficient, irrelevant and outage paths.', '測試正常、資料不足、無關及中斷路徑。', 'Health, routing, persistence and recovery evidence', '健康、路由、持久性及恢復證據', t('Verify recovery', '驗證恢復')),
    route('Smoke tests → backup restore', 'Stop / rollback', 'Retain the last valid image and persistent data.', '保留最後有效映像及持久資料。', 'Failure reason and recovery action', '失敗原因及恢復動作', t('Checks fail', '檢查失敗'), 'stop'),
    route('Smoke tests → backup restore', 'Private deployment', 'Access control and backups verified.', '已驗證訪問控制及備份。', 'Release ID + reproducible demo and trace URL', '發布 ID＋可重現 demo 及 trace URL', t('Checks pass', '檢查通過')),
  ],
} satisfies Record<string, FinanceRoute[]>;

export type FinanceFunctionId = keyof typeof financeFunctionRoutes;
