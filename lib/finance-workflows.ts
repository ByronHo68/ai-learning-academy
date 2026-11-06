import type { Copy } from './curriculum';

const t = (en: string, zh: string): Copy => ({ en, zh });
type Route = { from: string; to: string; when: Copy; payload: Copy };
const route = (from: string, to: string, en: string, zh: string, outputEn: string, outputZh: string): Route => ({ from, to, when: t(en, zh), payload: t(outputEn, outputZh) });

export const financeFunctionRoutes = {
  company: [
    route('Prompt + selection', 'Scope gate', 'Validate company, horizon and question intent.', '驗證公司、期間及問題意圖。', 'Original question + canonical company + horizon', '原問題＋標準公司＋期間'),
    route('Scope gate', 'Clarify → END', 'Company or intent is ambiguous.', '公司或意圖不明確。', 'One clarification question; no news/retrieval calls', '一個澄清問題；不呼叫新聞或檢索'),
    route('Scope gate', 'Out of scope → END', 'Clearly unrelated or unsupported company.', '明顯無關或公司未支援。', 'Explain scope and show a supported example prompt', '交代範圍並提供支援問題例子'),
    route('Scope gate', 'News refresh', 'Supported company research question.', '支援公司研究問題。', 'Validated ResearchRequest; unknown coverage may be refreshed', '已驗證 ResearchRequest；未知覆蓋可刷新'),
  ],
  sources: [
    route('Validated request → n8n MCP refresh', 'Provider response', 'Every new accepted prompt; resume reuses its receipt.', '每個新接納提示；恢復時重用紀錄。', 'company + query + run_id + cutoff', '公司＋查詢＋任務 ID＋截止點'),
    route('Provider response', 'Pinned snapshot', 'Normalize and index records with dates, permitted text and valid identity.', '驗證日期、允許節錄及身份，再正規化及索引。', 'source_id/chunk_id, URL, published_at, first_seen_at, content hash', '來源／切段 ID、URL、發布／首次取得時間及內容 hash'),
    route('Provider response', 'Limited result / unavailable → END', 'Refresh failed or only stale evidence remains.', '刷新失敗或只有過期證據。', 'Provider status + freshness gap; no current prediction', '供應商狀態＋新鮮度缺口；不作當前預測'),
    route('Pinned snapshot', 'Retrieve', 'Store and index acknowledgements agree on snapshot_id.', '儲存及索引確認相同 snapshot_id。', 'Immutable snapshot_id + allowed source IDs', '不可變 snapshot_id＋允許來源 ID'),
  ],
  retrieval: [
    route('Question + snapshot → filtered sparse/dense search', 'Candidates', 'Company, permissions and both timestamps pass.', '公司、權限及兩個時間戳符合。', '20 candidates per branch: chunk IDs + passages + original ranks', '每分支 20 候選：切段 ID＋原文＋初始排序'),
    route('Candidates', 'RRF fusion + reranker', 'Hybrid admission passed; otherwise use sparse.', '混合准入已通過；否則用 sparse。', 'Deduplicated top 20 → cross-encoder top 10', '去重前 20 → cross-encoder 前 10'),
    route('RRF fusion + reranker', 'Evidence gate', 'Reranker succeeds; on reranker failure use working sparse within the same deadline.', '重排成功；若重排失敗則用相同時限內仍可用的 sparse。', 'Actual fallback mode; no fabricated reranker scores', '實際回退模式；不捏造重排分數'),
    route('Evidence gate', 'Refine once / limited result', 'Zero hits, weak support or missing required facets.', '零結果、支持弱或缺少所需面向。', 'Missing facets; preserve company, cutoff and snapshot', '缺失面向；保留公司、截止及快照'),
    route('Evidence gate', 'Build context', 'Relevant, current passages cover the question.', '相關且當前原文足以覆蓋問題。', 'At most 6 excerpts, stable citation IDs and provenance', '最多 6 節錄、穩定引用 ID 及來源記錄'),
  ],
  research: [
    route('Validated request → scope → refresh → retrieve → rerank', 'Evidence gate', 'Code owns mandatory ordering and budgets.', '程式控制必需次序及預算。', 'Typed state, original prompt, snapshot, attempts, deadline, trace_id', '型別狀態、原提示、快照、次數、時限及 trace_id'),
    route('Evidence gate', 'Refine → retrieve', 'First attempt only, and budget remains.', '只限首次嘗試，而且仍有預算。', 'Refined query; same original question and snapshot', '修正查詢；相同原問題及快照'),
    route('Refine → retrieve', 'Evidence gate', 'Recheck the second retrieval with the same filters.', '以相同條件重新檢查第二輪檢索。', 'Updated evidence; attempts = 2', '更新證據；次數 = 2'),
    route('Evidence gate', 'Insufficient → END', 'Second attempt fails to cover the question.', '第二次仍未覆蓋問題。', 'Supported facts + missing facets; no forecast', '有支持事實＋缺失面向；不作預測'),
    route('Evidence gate', 'Context → LLM → validation', 'All required facets have support; conflicts are retained.', '所有所需面向有支持，矛盾證據保留。', 'Prompt-specific draft with citations and conditional scenarios', '針對提示的草稿、引用及條件式情境'),
    route('Context → LLM → validation', 'Save → answer', 'Validation passes within the budget.', '預算內通過驗證。', 'Validated cited answer', '已驗證引用答案'),
    route('Context → LLM → validation', 'Blocked → END', 'Citation or support validation fails.', '引用或支持驗證失敗。', 'Withheld draft and validation errors', '不發布草稿及驗證錯誤'),
    route('Context → LLM → validation', 'Unavailable → END', 'Deadline, call limit or dependency failure.', '超時、超額或依賴失敗。', 'Typed error + resumable checkpoint when safe', '結構化錯誤＋安全時可恢復 checkpoint'),
  ],
  report: [
    route('Selected passages', 'Context envelope', 'Deduplicate, read original excerpts and enforce token budget.', '去重、讀原文並限制 token。', 'Question, horizon, as_of, evidence[], missing_facets[], conflicts[]', '問題、期間、截止、證據、缺失面向及矛盾'),
    route('Context envelope', 'Draft', 'System policy and user question stay separate from untrusted excerpts.', '系統規則及使用者問題與不可信原文分開。', 'Direct answer + observed facts + conditional scenarios + citation IDs', '直接答案＋觀察事實＋條件式情境＋引用 ID'),
    route('Draft', 'Validation', 'Require claim support; a reranker score is not confidence.', '要求主張支持；重排分數不是信心。', 'Draft only; never stream an unvalidated recommendation', '只產生草稿；不串流未驗證建議'),
    route('Validation', 'Blocked → END', 'Unknown citation or unsupported factual claim.', '未知引用或無支持事實。', 'Do not release draft', '不發布草稿'),
    route('Validation', 'Display + feedback', 'Persist before exposing the final answer.', '先保存，再顯示最終答案。', 'Report ID, trace URL/status; separate feedback linked to run_id', '報告 ID、trace URL／狀態；回饋另存並連結 run_id'),
  ],
  validation: [
    route('Draft + evidence', 'Validation checks', 'Ignore embedded instructions; check IDs, dates, company, coverage and factual support.', '忽略內嵌指令，檢查 ID、日期、公司、覆蓋及事實支持。', 'Validation errors or a validated report', '驗證錯誤或已驗證報告'),
    route('Validation checks', 'Blocked → END', 'A required validation fails.', '必要驗證失敗。', 'validation_failed; no draft publication', 'validation_failed；不發布草稿'),
    route('Validation checks', 'Persist report', 'Every material factual claim has excerpt support.', '所有重要事實主張有原文支持。', 'Validated result and source references', '已驗證結果及來源引用'),
  ],
  export: [
    route('Report ID → authorized lookup', 'Saved result', 'Caller owns the report; ID exists.', '呼叫者擁有報告且 ID 存在。', 'Saved question, answer, sources, dates, trace status', '已存問題、答案、來源、日期及 trace 狀態'),
    route('Report ID → authorized lookup', '404 / conflict → END', 'No exportable validated record exists.', '沒有可下載的已驗證紀錄。', 'Typed error; no regeneration', '結構化錯誤；不重新生成'),
    route('Saved result', 'Serialize → download', 'Include insufficient status and fictional labels where applicable.', '適用時保留證據不足狀態及虛構標籤。', 'Markdown identical to displayed report; zero LLM calls', '與畫面相同 Markdown；零 LLM 呼叫'),
  ],
  recovery: [
    route('run_id → authenticate', 'Checkpoint', 'Resolve the same thread and original request.', '解析相同 thread 及原請求。', 'Saved snapshot, completed node results, attempts and remaining budget', '快照、已完成結果、次數及剩餘預算'),
    route('Checkpoint', '404 / 409 → END', 'Cannot safely resume the saved state.', '無法安全恢復儲存狀態。', 'Keep saved state; explain recovery failure', '保留狀態並交代恢復失敗'),
    route('Checkpoint', 'Next unfinished node', 'Deadline remains; replayed effects use idempotency keys.', '未超時；重播副作用使用冪等鍵。', 'Same refresh receipt and search count; no budget reset', '相同刷新紀錄及搜尋次數；不重設預算'),
    route('Checkpoint', 'Stopped → END', 'A later fresh prompt requires a new run.', '稍後新研究須建立新任務。', 'Supported partial findings and explicit expiry', '有支持的部分發現及明確過期狀態'),
  ],
  evaluation: [
    route('Frozen manifest → verify hash → run configurations', 'Observed outputs', 'Corpus, qrels and policy match the reviewed version.', '語料、qrels 及政策符合已核對版本。', 'Sparse, hybrid and reranked rankings on identical prompts', '相同提示的 sparse、混合及重排排序'),
    route('Observed outputs', 'Score retrieval + citations + safety', 'Use actual outcomes and independently judged support.', '使用實際結果及獨立支持度判斷。', 'recall/nDCG, citation precision, abstentions, injection outcomes', 'recall／nDCG、引用精準度、拒答及注入結果'),
    route('Score retrieval + citations + safety', 'Block admission', 'Synthetic-only, live checks missing or thresholds fail.', '只有虛構測試、缺真實檢查或未達門檻。', 'Sparse remains active; NOT RUN stays visible', '維持 sparse；明示 NOT RUN'),
    route('Score retrieval + citations + safety', 'Approve versioned candidate', 'Real-news holdout, safety and tracing also pass.', '真實新聞保留集、安全及追蹤亦通過。', 'Approved retrieval version + public report card', '核准檢索版本＋公開成績表'),
  ],
  observability: [
    route('Run start → root span', 'Span events', 'Propagate context into MCP and provider attempts.', 'Context 傳入 MCP 及供應商嘗試。', 'trace_id, run_id, parent spans, errors and actual usage', 'trace_id、run_id、父 spans、錯誤及實際用量'),
    route('Span events', 'Redact → Collector → Langfuse / LangSmith', 'Keep one instrumentation tree; do not double-count tokens.', '保留一組 instrumentation；不重複計 token。', 'Sanitized operational traces and experiment feedback', '清理後運行 traces 及實驗回饋'),
    route('Redact → Collector → Langfuse / LangSmith', 'Mark demo evidence incomplete', 'Trace cannot be flushed or opened by a reviewer.', 'Trace 不能 flush 或審閱者無法開啟。', 'Preserved answer + unavailable trace status', '保留答案＋trace 不可用狀態'),
    route('Redact → Collector → Langfuse / LangSmith', 'Report card', 'At least 30 completed runs for latency percentiles.', '延遲百分位至少需要 30 次已完成任務。', 'One actual URL per demo; cohort p50/p95 with failures', '每 demo 一個實際 URL；樣本 p50／p95 及失敗數'),
  ],
  deployment: [
    route('Verified source + evals → build images', 'Local containers', 'Configure private n8n, Qdrant and telemetry endpoints.', '設定私人 n8n、Qdrant 及追蹤端點。', 'Versioned images and server-only configuration', '版本化映像及只供伺服器設定'),
    route('Local containers', 'Smoke tests → backup restore', 'Exercise normal, insufficient, irrelevant and outage paths.', '測試正常、資料不足、無關及中斷路徑。', 'Health, routing, persistence and recovery evidence', '健康、路由、持久性及恢復證據'),
    route('Smoke tests → backup restore', 'Stop / rollback', 'Retain the last valid image and persistent data.', '保留最後有效映像及持久資料。', 'Failure reason and recovery action', '失敗原因及恢復動作'),
    route('Smoke tests → backup restore', 'Private deployment', 'Access control and backups verified.', '已驗證訪問控制及備份。', 'Release ID + reproducible demo and trace URL', '發布 ID＋可重現 demo 及 trace URL'),
  ],
} satisfies Record<string, Route[]>;

export type FinanceFunctionId = keyof typeof financeFunctionRoutes;
