import type { Copy } from './curriculum';

const t = (en: string, zh: string): Copy => ({ en, zh });

export const financeEvidenceGuide = [
  { title: t('Three evidence streams', '三條證據來源'), body: t('Each accepted prompt refreshes company news through n8n MCP. A separate daily n8n Schedule Trigger fetches macroeconomic and geopolitical news into shared PostgreSQL records. Maintain sourced, versioned profiles for MSFT, AAPL and NVDA: business segments, products, geographic and supply-chain exposure, and financial figures with reporting periods. Review profiles after filings or material changes. Configure the daily time and workflow timezone when publishing n8n.', '每個有效提示經 n8n MCP 刷新公司新聞。獨立每日 n8n Schedule Trigger 抓宏觀及地緣政治新聞，存至 PostgreSQL 共用記錄。MSFT、AAPL、NVDA 各有附來源及版本背景：業務、產品、地域與供應鏈曝險，以及附報告期間財務數據。財報或重大變化後覆核背景；發布 n8n 時設定每日時間及時區。') },
  { title: t('Snapshot = the evidence version used for this report', 'Snapshot＝這份報告使用的證據版本'), body: t('Fetching acquires news. A snapshot pins a manifest of eligible source/chunk versions, completed daily batch IDs, company-profile version, cutoff and coverage status under snapshot_id. Retrieval selects passages from that fixed collection. Later news creates a version for the next run. Refinement and resume reuse the same snapshot. Permission revocations are still checked. This is a run-level evidence manifest rather than a full database backup.', '抓取是取得新聞；snapshot 按 snapshot_id 固定可用來源／切段版本、完整每日批次 ID、公司背景版本、截止時間及覆蓋狀態。檢索從這份固定集合挑段落。新新聞供下一次任務使用；補查及恢復沿用原快照，撤銷使用權仍須檢查。這是任務證據清單，並非完整資料庫備份。') },
  { title: t('Rerank = relevance to your question', 'Rerank＝與問題的相關性排序'), body: t('For “How could export restrictions affect NVDA?”, the reranker compares the question with each candidate passage. It can put an export-policy article ahead of an unrelated earnings article. Its score measures relevance. The LLM then combines policy evidence with the dated company profile to explain a possible business-impact chain, assumptions, counter-evidence and uncertainty. Stock-return estimates require a separately validated model.', '例如「出口限制可能如何影響 NVDA？」重排器比較問題與每段原文，可把出口政策文章排在無關財報文章前。分數量度相關性。LLM 再結合政策證據及有日期公司背景，解釋可能業務影響鏈、假設、反方證據及不確定性。股票回報估計須另行驗證模型。') },
  { title: t('n8n owns acquisition retries', 'n8n 負責抓取重試'), body: t('Proposed policy: at most 3 provider attempts, with 1s then 2s backoff plus jitter. Each attempt is capped at 10s and clipped to a 25s acquisition deadline and the remaining run deadline. Retry transient network failures, selected 5xx and rate limits only when Retry-After fits. Invalid arguments, authorization failures and malformed responses return typed errors. The host sends one logical refresh with a stable run_id. After an MCP timeout, reconcile the existing execution/receipt before resubmitting. Search refinement has its own two-search limit.', '建議最多 3 次供應商嘗試，等待 1 秒、2 秒加 jitter。每次最多 10 秒，同時受 25 秒抓取階段及任務剩餘時限限制。只在餘額足夠時重試暫時網絡錯誤、指定 5xx 或限流。無效參數、授權或格式錯誤回傳結構化錯誤。Host 以固定 run_id 發出一次邏輯刷新；MCP 超時先核對原執行／紀錄。搜尋補查另有兩次上限。') },
  { title: t('Show freshness for each stream', '各來源明示新鮮度'), body: t('A daily batch is current as of its last successful fetch. Failed daily ingestion preserves the previous completed batch and records the failure. Show fetched_at, publication/first-seen times and coverage separately for company, macro, geopolitics and profiles. Retrieve shared news by topic, region, sector and a supported exposure mechanism. If the question needs a missing or stale stream, explain the gap and withhold that conclusion. Shared news can be relevant without naming a ticker.', '每日批次只代表最後成功擷取時的資料；失敗保留上一完整批次並記錄失敗。公司、宏觀、地緣及背景各自顯示擷取、發布／首次取得時間及覆蓋。共用新聞按主題、地域、行業及有證據曝險關係檢索；所需來源缺少或過期就交代缺口。共用新聞即使沒有 ticker 仍可能相關。') },
];

export const financeSnapshotExample = JSON.stringify({
  disclosure: 'Fictional evidence-manifest example', snapshot_id: 'snapshot-nvda-example-001', company: 'NVDA',
  as_of: '2026-11-11T01:00:00Z', company_news_version_ids: ['nvda-news-v3'],
  daily_batch_ids: { macro: 'macro-batch-example', geopolitics: 'geo-batch-example' },
  company_profile_version: 'nvda-profile-v2',
  eligible_chunk_ids: ['nvda-news-v3-c1', 'geo-policy-v1-c2', 'nvda-profile-v2-c4'],
  coverage: { company: 'ok', macro: 'ok', geopolitics: 'ok', profile: 'reviewed' },
}, null, 2);

export const financePreparationNodes = [
  { id: 'daily', label: 'DAILY n8n SCHEDULE', detail: t('Configure daily time and timezone in n8n. Acquisition runs independently of user prompts.', 'n8n 設定每日時間及時區，抓取獨立於用戶問題。') },
  { id: 'global_news', label: 'MACRO + GEOPOLITICAL NEWS', detail: t('Fetch approved sources using n8n-owned bounded retries. Preserve topics, regions, dates, provenance and permissions.', '以 n8n 有限重試抓核准來源，保留主題、地域、日期、來源及權限。') },
  { id: 'profiles', label: 'VERSIONED COMPANY PROFILES', detail: t('MSFT / AAPL / NVDA profiles have sourced facts, reporting periods, effective dates and review dates. Update after material changes.', 'MSFT／AAPL／NVDA 背景附來源、報告期間、生效及覆核日期；重大變化後更新。') },
  { id: 'evidence_pool', label: 'POSTGRESQL EVIDENCE POOL', detail: t('Store completed daily batches and profile versions. Pin eligible completed versions without waiting for the next daily schedule.', '保存完整每日批次及背景版本；固定合資格完整版本，不等待下一次每日排程。') },
  { id: 'daily_failure', label: 'DAILY FETCH FAILURE', detail: t('n8n records exhausted/permanent failure. Retain the previous completed batch and its original fetched_at. Coverage checks decide whether its age is acceptable for this question.', 'n8n 記錄重試用完／永久失敗；保留上一完整批次及原 fetched_at，再按問題檢查其時效是否足夠。') },
];
