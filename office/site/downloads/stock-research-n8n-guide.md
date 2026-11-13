# n8n acquisition and research handoff / n8n 抓取及研究交接

Open `/finance-project/n8n` for the bilingual offline animation. The Python YFinance bridge exists; n8n execution, ingestion and the live research backend remain proposed and NOT RUN.

打開 `/finance-project/n8n` 查看雙語離線動畫。Python YFinance bridge 已有實作；n8n 執行、匯入及真實研究後端仍是建議設計及 NOT RUN。

## Alpha Vantage daily-news design / Alpha Vantage 每日新聞設計

Proposed n8n configuration. Live Alpha Vantage execution and coverage evaluation are NOT RUN.

### Alpha Vantage supplies the daily news / Alpha Vantage 供應每日新聞

Use n8n HTTP Request with GET https://www.alphavantage.co/query and function=NEWS_SENTIMENT. Store apikey in an n8n Query Auth credential, outside exported workflow JSON and public traces. Company news and quotes still use the separate YFinance bridge. This is a provider configuration design; no Alpha Vantage requests have been made by the academy.

n8n HTTP Request 用 GET https://www.alphavantage.co/query，function=NEWS_SENTIMENT。apikey 存 n8n Query Auth，不放匯出流程 JSON 或公開 trace。公司新聞及價格仍用獨立 YFinance bridge；這是供應商設定設計，學院沒有發送 Alpha Vantage 請求。

### Separate macro and fiscal requests / 宏觀與財政分開請求

Request economy_macro and economy_fiscal separately, union the responses and deduplicate shared articles. A comma-separated topics parameter requires articles to match both topics; it is not an OR search. economy_monetary is available for an optional interest-rate/inflation stream, with an explicit extra request budget. Omit tickers for shared context so articles need not name MSFT, AAPL or NVDA.

economy_macro 及 economy_fiscal 分開請求，合併回應並去重。topics 用逗號會要求同時符合兩主題，不是 OR。可選 economy_monetary 抓利率／通脹新聞，但須另加請求預算。共用背景不設 tickers，文章毋須點名 MSFT、AAPL 或 NVDA。

### Geopolitics needs a coverage check / 地緣政治須檢查覆蓋

The documented topic list has no geopolitics filter or free-text search parameter. Fetch a broad NEWS_SENTIMENT candidate feed, then tag permitted titles/summaries for events such as sanctions, tariffs, conflict and export restrictions, with regions and provenance. Tagging is your classification step, not an Alpha Vantage query capability. A financial-news feed may miss geopolitical events: show limited coverage and abstain when a required event is absent.

官方主題清單沒有 geopolitics 篩選或自由文字搜尋參數。抓廣泛 NEWS_SENTIMENT 候選，再按允許標題／摘要標記制裁、關稅、衝突、出口限制、地域及來源。標記是你的分類步驟，不是 Alpha Vantage 查詢功能。金融新聞可能漏地緣事件；須明示覆蓋有限，所需事件缺少時拒絕相關結論。

### Freeze the UTC window and detect truncation / 固定 UTC 視窗並偵測截斷

Add time_from/time_to in YYYYMMDDTHHMM UTC to every planned request. Start from the last successful watermark with a small configured overlap and freeze the end at job creation. Preserve provider publication time, first_seen_at and fetched_at separately. A capped response is not proof of complete coverage: reaching the limit flags possible truncation. Split the window only within the request budget, otherwise mark that stream incomplete and keep the previous completed batch eligible.

每個請求加 YYYYMMDDTHHMM UTC 的 time_from/time_to。由最後成功 watermark 加設定的小重疊起計，工作建立時固定結束時間。發布、首次取得及抓取時間分開保存。達結果上限代表可能截斷，不能當完整覆蓋；只在預算內拆視窗，否則標記來源未完整並沿用上一完整批次。

### Count requests across the whole daily job / 計算整個每日工作的請求數

The base plan has three queries: macro, fiscal and broad geopolitical candidates. At most three transient attempts per query means at most nine provider requests, including failed attempts, all clipped to the shared daily deadline. Account quotas and rate spacing may reduce that cap. Handle provider error/rate-limit JSON even when HTTP is 200; do not treat it as an empty feed. An exhausted quota does not cause rapid retries. Confirm NEWS_SENTIMENT entitlement and quota for the configured key before enabling the job.

基本方案三個查詢：宏觀、財政及廣泛地緣候選；每查詢最多三次暫時錯誤嘗試，即最多九次供應商請求，包含失敗，並受共用每日時限限制。帳戶配額及速率間隔可令上限更低。HTTP 200 仍須檢查供應商錯誤／限流 JSON，不能當空新聞；配額用完不能密集重試。啟用前確認金鑰有 NEWS_SENTIMENT 權限及配額。

### Prepare evidence before embedding it / Embedding 之前先準備證據

Normalize the response, deduplicate canonical URL/content versions, attach stream/topic/region/permission metadata and commit a completed batch with its receipt in PostgreSQL. Chunk permitted article text or summaries. Embed only new or changed chunks using a pinned model/version; reuse vectors only for the same text hash and model. Provider sentiment scores are stored metadata: they are not embeddings, your reranker scores or validated stock-return forecasts.

先正規化、按 URL／內容版本去重，加來源／主題／地域／權限 metadata，在 PostgreSQL 提交完整批次及收據。將允許原文或摘要切段，以固定模型／版本只嵌入新增或改動段落；只有相同文字 hash 和模型才可重用向量。供應商情緒分數只是 metadata，不是 embedding、你的重排分數或已驗證股票回報預測。

```json
{
  "disclosure": "Proposed n8n HTTP Request configuration; not a live response",
  "method": "GET",
  "url": "https://www.alphavantage.co/query",
  "credential": "n8n Query Auth: apikey (private; not exported)",
  "queries": [
    {
      "id": "macro",
      "purpose": {
        "en": "Macroeconomic news",
        "zh": "宏觀經濟新聞"
      },
      "parameters": {
        "function": "NEWS_SENTIMENT",
        "topics": "economy_macro",
        "sort": "LATEST",
        "limit": 1000
      }
    },
    {
      "id": "fiscal",
      "purpose": {
        "en": "Fiscal-policy news",
        "zh": "財政政策新聞"
      },
      "parameters": {
        "function": "NEWS_SENTIMENT",
        "topics": "economy_fiscal",
        "sort": "LATEST",
        "limit": 1000
      }
    },
    {
      "id": "geopolitics_candidates",
      "purpose": {
        "en": "Broad news for geopolitical tagging",
        "zh": "供地緣政治標記的廣泛新聞"
      },
      "parameters": {
        "function": "NEWS_SENTIMENT",
        "sort": "LATEST",
        "limit": 1000
      }
    }
  ],
  "shared_parameters": {
    "time_from": "{{ frozen_window_from_utc }}",
    "time_to": "{{ frozen_window_to_utc }}"
  },
  "optional_topic": "economy_monetary (separate request; adjust job budget)",
  "geopolitics": "Post-fetch tagging; coverage is limited to returned financial news"
}
```

[Alpha Vantage NEWS_SENTIMENT parameters](https://www.alphavantage.co/documentation/#news-sentiment)


## Ownership / 分工

**LangGraph host**

Checks the question, then calls refresh_company_news once.

檢查問題，然後只呼叫 refresh_company_news 一次。

**n8n**

Validates the call, fetches news, retries a short outage, saves rows, and returns a receipt.

驗證呼叫、抓新聞、短暫故障就重試、保存紀錄，然後交回收據。

**YFinance adapter**

Private HTTP bridge on port 8002. n8n calls POST /news or POST /quote.

私人 HTTP 橋接，埠 8002。n8n 呼叫 POST /news 或 POST /quote。

**PostgreSQL**

Stores versioned news. The n8n ingestion role cannot write reports, selections or checkpoints.

保存版本新聞；n8n 匯入角色不能寫報告、選取或 checkpoint。

**Research graph + model**

Searches the snapshot, ranks evidence, optionally pauses for review, rechecks coverage, then generates and validates the cited report.

搜尋快照、排序、可選暫停覆核及重查覆蓋後，才生成及驗證引用報告。

- 1: logical refresh per question / 每題一次邏輯刷新
- 3: attempts per query, then stop / 每個查詢最多 3 次，然後停止
- 10s: cap on each news call / 每次新聞呼叫上限
- 25s: whole acquisition budget / 整段抓取預算

## One request, one committed receipt / 一個請求，一份已提交收據

Treat refresh_company_news as a deterministic workflow tool. Validate the schema, authenticated run binding and deadline. Atomically claim a unique owner/run key with a request fingerprint. A completed duplicate returns its receipt; a running duplicate returns its execution status. Conflicting arguments for the same key are rejected. A host timeout reconciles that execution, without starting another fetch.

refresh_company_news 是固定流程工具，須驗證 schema、已認證任務綁定及時限。以原子操作取得唯一擁有者／任務鍵及請求指紋；已完成重複回傳收據，執行中重複回傳狀態，相同鍵但參數不同須拒絕。Host 超時只核對原執行，不另開抓取。

## Normalize → deduplicate → commit / 正規化 → 去重 → 提交

Validate the adapter response schema. Use canonical article identity plus content hash as a unique version key in PostgreSQL; unchanged content updates last_seen_at, while changed content creates a new version. Commit evidence and its receipt in one transaction before returning success. Keep article text untrusted; no arbitrary URL fetch or article-provided SQL. Story-level deduplication still runs before LLM context assembly.

驗證 adapter 回應 schema。PostgreSQL 用正規化文章身分加內容 hash 作唯一版本鍵；相同內容只更新 last_seen_at，內容改變才建新版本。證據及收據須同一 transaction 提交後才回成功。文章仍不可信，不執行任意 URL 或文章 SQL；LLM context 前仍做新聞故事層去重。

## Three acquisition paths / 三條抓取路徑

Company news uses Python YFinance MCP through POST /news. Price uses POST /quote and is stored as a timestamped numerical observation, outside the news index. Daily macro/fiscal news uses Alpha Vantage NEWS_SENTIMENT, with geopolitical tagging of broad-feed candidates and explicit coverage limits. It has its own schedule, timezone, batch key and deadline. Company profiles are sourced, versioned records maintained separately.

公司新聞經 Python YFinance MCP 的 POST /news。價格用 POST /quote，存有時間戳數值觀察，不進新聞索引。每日宏觀／財政新聞用 Alpha Vantage NEWS_SENTIMENT，廣泛新聞另作地緣標記並明示覆蓋限制，有自己的排程、時區、批次鍵及時限。公司背景則獨立維護附來源版本記錄。

## n8n metadata is separate from finance evidence / n8n 管理資料與金融證據分開

Use PostgreSQL for n8n workflows, credentials and execution metadata, in n8n_metadata with its own role. A separate ingestion credential writes only permitted finance evidence and acquisition receipts. Research reports, selection revisions and checkpoints are owned by the research service. n8n metadata migrations must not run against the research or checkpoint database.

n8n 流程、憑證及執行管理資料用 PostgreSQL 的 n8n_metadata 及專用角色。另一匯入憑證只可寫允許證據及抓取收據；研究服務擁有報告、選取版本及 checkpoints。n8n 管理資料 migration 不能對研究或 checkpoint 資料庫執行。

## The handoff to LangGraph / 交回 LangGraph 之後

The host pins the receipt’s exact news versions, eligible completed daily batches, company profile and optional quote observation. Search and rank that snapshot, optionally review evidence, validate selection, recheck coverage, then build context and generate. Hybrid retrieval stays behind the frozen evaluation gate. Review pause/resume does not call n8n again or reset acquisition counters; only deliberate human wait pauses the proposed 60-second processing budget, with a fixed 15-minute review window from the first pause.

Host 固定收據新聞版本、合資格完整每日批次、公司背景及可選價格觀察。從快照搜尋排序，可選覆核、驗證選取、重查覆蓋，才建 context 及生成。混合檢索仍須過凍結評估門檻；覆核暫停／恢復不再叫 n8n，不重設抓取次數，只有刻意人手等待暫停建議 60 秒處理預算，首次暫停起另設固定 15 分鐘覆核期。

## Trace the boundary and verify it live / 追蹤邊界並真實驗證

Correlate run_id, trace_id and n8n execution ID. Record each provider attempt, retry reason, latency, ingestion counts and receipt status with OpenTelemetry; export sanitized run segments to Langfuse/LangSmith. These lesson scenarios make zero external calls. Live acceptance remains NOT RUN: verify concurrent duplicate calls, provider timeouts, valid empty results, malformed JSON, transaction rollback, daily failure and one accessible trace URL before treating the design as working.

以 run_id、trace_id 及 n8n execution ID 關聯。OpenTelemetry 記每次供應商嘗試、重試原因、延遲、匯入數量及收據狀態，清理後送 Langfuse／LangSmith。教材沒有外部呼叫；真實驗收仍為 NOT RUN，須測並行重複、超時、有效空結果、壞 JSON、transaction 回滾、每日失敗及可開啟 trace URL。

## Local setup / 本機設定

### 1

Run n8n as a separate service using the official Docker Compose guide. Pin a reviewed stable image version. The office website remains a dependency-free Node 18 bundle; n8n runs in its own container.

n8n 按官方 Docker Compose 指南獨立執行，固定已核對的 stable 映像版本。Office 網站仍是免依賴 Node 18 bundle；n8n 在自己的容器執行。

### 2

Configure PostgreSQL for n8n metadata with DB_TYPE=postgresdb and the settings below. Create an n8n_metadata database and its own role; keep research evidence and LangGraph checkpoints in separate databases. Bind the editor to 127.0.0.1:5678, persist the n8n data directory and its encryption key, then create the owner account in the local editor.

設定 DB_TYPE=postgresdb 及下方參數，建立獨立 n8n_metadata 資料庫和角色。研究證據及 LangGraph checkpoints 使用不同資料庫。編輯器綁定 127.0.0.1:5678，持久保存 n8n 資料目錄及加密金鑰，再在本機編輯器建立擁有者帳戶。

### 3

Practice with Manual Trigger → Edit Fields (symbol MSFT) → Execute. Inspect the execution. This practice workflow does not fetch news or populate the finance database.

先練習 Manual Trigger → Edit Fields（symbol MSFT）→ Execute，再看執行紀錄；這條練習不抓新聞或寫入金融資料庫。

### 4

Create a called sub-workflow with explicit inputs, then connect an MCP Server Trigger to a Custom n8n Workflow Tool named refresh_company_news. Use authenticated Streamable HTTP. Test URLs work while listening; after publishing, configure the host with the production URL and its separate MCP credential.

建立明確輸入的子流程，再將 MCP Server Trigger 連接名為 refresh_company_news 的 Custom n8n Workflow Tool。使用已認證 Streamable HTTP；測試 URL 要保持 listening，發布後 host 改用 production URL 及獨立 MCP 憑證。

### 5

For company news, use HTTP Request POST /news with X-YFinance-Token in an n8n Header Auth credential. In Docker use http://yfinance-bridge:8002 on a shared private network; native n8n may use 127.0.0.1:8002. POST /quote is a separate numerical observation, outside the news vector index. The Python bridge already exists in integrations/yfinance; these n8n workflows are still proposed.

公司新聞用 HTTP Request POST /news，X-YFinance-Token 存 n8n Header Auth。Docker 共用私人網絡用 http://yfinance-bridge:8002；本機 n8n 才用 127.0.0.1:8002。POST /quote 為獨立數值觀察，不進新聞向量索引。Python bridge 已在 integrations/yfinance，n8n 流程仍屬建議設計。

### 6

Build a second Schedule Trigger workflow for Alpha Vantage NEWS_SENTIMENT: separate economy_macro and economy_fiscal queries, plus a broad candidate feed for post-fetch geopolitical tagging. Configure its time and timezone. Validate, deduplicate and commit a complete batch before making it eligible for snapshots; failure keeps the prior completed batch with its original timestamp.

另建 Schedule Trigger 流程抓 Alpha Vantage NEWS_SENTIMENT：分開 economy_macro、economy_fiscal，再抓廣泛候選作地緣標記，設定時間及時區。驗證、去重並提交完整批次後才可入快照；失敗保留上一完整批次及原時間。

```dotenv
# Example environment for the n8n service, not finance evidence credentials.
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
# Evidence writes use a separate ingestion-only PostgreSQL credential in n8n.
```

## Fictional receipt / 虛構收據

```json
{
  "disclosure": "Fictional proposed acquisition receipt, not raw YFinance JSON",
  "run_id": "run_1842",
  "execution_id": "example-n8n-execution",
  "status": "ready",
  "company": "NVDA",
  "company_news_version_ids": [
    "nvda-news-v3"
  ],
  "new_versions": 1,
  "unchanged_versions": 2,
  "fetched_at": "2026-11-13T01:00:00Z",
  "committed_at": "2026-11-13T01:00:01Z",
  "provider_attempts": 1,
  "provider_status": "ok",
  "trace_id": "fictional-trace-id"
}
```

## News arrives / 新聞到手

How could export limits affect NVDA?

出口限制可能如何影響 NVDA？

1. **You ask one question / 你問一條問題** — You → Research app

The question names a supported company. Nothing has been fetched.

問題點名一家支援範圍內的公司。此時還沒有抓新聞。

NVDA · not sent yet

2. **Scope lets it through / 範圍檢查放行** — Research app → Research app

Both the company and research intent pass. A supported ticker alone cannot authorize an unrelated or malicious request.

公司及研究意圖都通過；只有支援 ticker 不能批准無關或惡意請求。

company NVDA

3. **The app calls once / App 只叫一次** — Research app → n8n

The model cannot skip this call. n8n owns every provider retry inside it.

模型不能跳過這次呼叫。裡面的供應商重試全部由 n8n 負責。

refresh_company_news · run_1842

4. **Check the run id / 核對任務 id** — n8n → n8n

run_1842 has no receipt yet, so a fetch is allowed.

run_1842 還沒有收據，所以可以抓取。

attempt 0 of 3

5. **Ask the adapter / 呼叫 adapter** — n8n → YFinance adapter

One attempt. The call is clipped to 10 seconds and to the 25-second acquisition budget.

只打一次。呼叫上限 10 秒，並且受 25 秒抓取預算限制。

POST /news · NVDA · 10s cap

6. **Save the articles / 保存文章** — n8n → PostgreSQL

The JSON matches the news schema. n8n writes with an ingestion-only database role.

JSON 符合新聞 schema。n8n 用只供匯入的資料庫角色寫入。

3 articles · ingestion role

7. **Return the receipt / 交回收據** — n8n → Research app

n8n is finished for this question. The receipt is the proof of what was saved.

n8n 對這題的工作結束。收據證明保存了什麼。

version ids · fetched_at · ready

8. **Pin the snapshot / 固定快照** — Research app → Research app

Search and the cited note start after this. They are outside n8n.

之後的搜尋和有引用的報告在 n8n 之外。

company news + daily batch + profile

9. **Search and rank the snapshot / 搜尋並排序快照** — Research app → PostgreSQL

The research graph searches fixed evidence versions. Reranking measures relevance to the question, not future stock returns. No provider fetch is repeated.

研究 graph 搜尋固定版本；重排量度問題相關性，不是未來股票回報，也不再抓供應商。

full-text default · admitted hybrid may rerank

10. **Optional evidence review / 可選證據覆核** — Research app → You

Automatic mode keeps system recommendations. Review mode checkpoints after ranking. Show system rank separately from user order. Highlights and order guide emphasis; exclusions trigger a new coverage check. The snapshot stays unchanged.

自動模式沿用系統建議；覆核模式在排序後保存 checkpoint。系統排名與用戶次序分開，標記及次序表達重點，排除後重查覆蓋，快照不變。

highlight / exclude / user order / reset · same snapshot

11. **Validate selection and coverage / 驗證選取及覆蓋** — Research app → Research app

Only permitted, current and supporting evidence can pass. A gap allows at most one refinement, then insufficient. Review resumes preserve counters and remaining processing time; n8n does not restart.

只有可用、合時且有支持證據才通過；缺口最多補查一次，再回不足。覆核恢復保留計數及處理餘額，不重啟 n8n。

owner + revision + source IDs + required facets

12. **Generate, validate and save / 生成、驗證及保存** — Research app → You

This teaching case assumes coverage passes. The LLM receives original excerpts, highlights and selection limitations. Release only after citation/support validation and save the report with its selection revision.

此虛構案例假設覆蓋通過；LLM 收到原文、標記及選取限制。引用及支持驗證後才發布，報告保存所用選取版本。

fictional sufficient-evidence path · cited report

## One retry, then success / 重試一次後成功

How could rising costs affect AAPL margins?

成本上升可能如何影響 AAPL 利潤率？

1. **A second question / 第二條問題** — You → Research app

A different question needs its own receipt.

另一條問題要有自己的收據。

AAPL · new run

2. **AAPL is supported / AAPL 在範圍內** — Research app → Research app

The company and research intent pass the tool-free scope gate.

公司及研究意圖通過沒有工具的 scope gate。

company AAPL

3. **One logical call / 一次邏輯呼叫** — Research app → n8n

The app does not retry the provider. n8n does.

App 不會向供應商重試。重試由 n8n 做。

run_1843

4. **The first call fails / 第一次失敗** — n8n → YFinance adapter

A retryable 503. Turn the HTTP node’s own automatic retry off.

可重試的 503。HTTP 節點自帶的自動重試要關掉。

503 · attempt 1 of 3

5. **Wait, then try again / 等待後再試** — n8n → n8n

The next wait, if needed, is 2 seconds plus jitter. Honor Retry-After when it fits the deadline.

如果還要再等，下一次是 2 秒加 jitter。Retry-After 仍在時限內就遵守它。

wait 1s + jitter

6. **Attempt 2 succeeds / 第 2 次成功** — n8n → PostgreSQL

n8n saves the rows and stops retrying.

n8n 保存紀錄後就停止重試。

attempt 2 of 3 · articles saved

7. **One receipt / 一張收據** — n8n → Research app

The failed attempt is history. It is not a second refresh.

失敗的嘗試是歷史，不是第二次刷新。

status ready

8. **Pin this run / 固定這次任務** — Research app → Research app

The app does not ask n8n to fetch AAPL again.

App 不會再請 n8n 抓一次 AAPL。

snapshot pinned

9. **Search and rank the snapshot / 搜尋並排序快照** — Research app → PostgreSQL

The research graph searches fixed evidence versions. Reranking measures relevance to the question, not future stock returns. No provider fetch is repeated.

研究 graph 搜尋固定版本；重排量度問題相關性，不是未來股票回報，也不再抓供應商。

full-text default · admitted hybrid may rerank

10. **Optional evidence review / 可選證據覆核** — Research app → You

Automatic mode keeps system recommendations. Review mode checkpoints after ranking. Show system rank separately from user order. Highlights and order guide emphasis; exclusions trigger a new coverage check. The snapshot stays unchanged.

自動模式沿用系統建議；覆核模式在排序後保存 checkpoint。系統排名與用戶次序分開，標記及次序表達重點，排除後重查覆蓋，快照不變。

highlight / exclude / user order / reset · same snapshot

11. **Validate selection and coverage / 驗證選取及覆蓋** — Research app → Research app

Only permitted, current and supporting evidence can pass. A gap allows at most one refinement, then insufficient. Review resumes preserve counters and remaining processing time; n8n does not restart.

只有可用、合時且有支持證據才通過；缺口最多補查一次，再回不足。覆核恢復保留計數及處理餘額，不重啟 n8n。

owner + revision + source IDs + required facets

12. **Generate, validate and save / 生成、驗證及保存** — Research app → You

This teaching case assumes coverage passes. The LLM receives original excerpts, highlights and selection limitations. Release only after citation/support validation and save the report with its selection revision.

此虛構案例假設覆蓋通過；LLM 收到原文、標記及選取限制。引用及支持驗證後才發布，報告保存所用選取版本。

fictional sufficient-evidence path · cited report

## Provider stays down / 供應商持續故障

How could costs affect MSFT?

成本可能如何影響 MSFT？

1. **MSFT is in scope / MSFT 在範圍內** — You → Research app

A supported company can still meet a down provider.

支援範圍內的公司仍可能碰到故障的供應商。

MSFT

2. **The app waits / App 等候結果** — Research app → n8n

One call. The app waits for a typed result.

只呼叫一次。App 等候結構化結果。

run_1844

3. **Attempt 1 fails / 第 1 次失敗** — n8n → n8n

Transient failure, and time remains.

暫時失敗，而且還有時間。

503 · wait 1s

4. **Attempt 2 fails / 第 2 次失敗** — n8n → n8n

Still retryable.

仍然可以重試。

503 · wait 2s + jitter

5. **Attempt 3 stops / 第 3 次停止** — n8n → n8n

Three attempts is the cap. n8n stops fetching.

三次就是上限。n8n 停止抓取。

attempts exhausted

6. **Unavailable / 供應商不可用** — n8n → Research app

The app must not immediately fire the same tool call again.

App 不應立刻再發同一次工具呼叫。

status unavailable

7. **Say the source failed / 說明來源失敗** — Research app → You

There is no fresh snapshot. The report must not describe old news as new.

沒有新的快照。報告不能把舊新聞說成新的。

no fresh rows

## Same run, old receipt / 同一任務，舊收據

Same NVDA question, resumed

同一條 NVDA 問題，恢復執行

1. **The host timed out / Host 超時了** — You → Research app

Resume, or a lost response, uses the original run id.

恢復執行，或遺失的回應，都用原來的任務 id。

run_1842 again

2. **Look up the run first / 先查找任務** — Research app → n8n

The app does not blindly send a second fetch.

App 不會盲目再抓一次。

reconcile run_1842

3. **The receipt exists / 收據已經存在** — n8n → n8n

This run already committed its evidence.

這個任務已經提交了證據。

receipt found

4. **Reuse it / 沿用收據** — n8n → Research app

Yahoo is not called again.

不會再呼叫 Yahoo。

no second fetch

5. **Keep the same snapshot / 沿用同一個快照** — Research app → Research app

Search continues from the original snapshot. The budget is not reset.

搜尋沿用原來的快照。預算不會重設。

budget unchanged

6. **Search and rank the snapshot / 搜尋並排序快照** — Research app → PostgreSQL

The research graph searches fixed evidence versions. Reranking measures relevance to the question, not future stock returns. No provider fetch is repeated.

研究 graph 搜尋固定版本；重排量度問題相關性，不是未來股票回報，也不再抓供應商。

full-text default · admitted hybrid may rerank

7. **Optional evidence review / 可選證據覆核** — Research app → You

Automatic mode keeps system recommendations. Review mode checkpoints after ranking. Show system rank separately from user order. Highlights and order guide emphasis; exclusions trigger a new coverage check. The snapshot stays unchanged.

自動模式沿用系統建議；覆核模式在排序後保存 checkpoint。系統排名與用戶次序分開，標記及次序表達重點，排除後重查覆蓋，快照不變。

highlight / exclude / user order / reset · same snapshot

8. **Validate selection and coverage / 驗證選取及覆蓋** — Research app → Research app

Only permitted, current and supporting evidence can pass. A gap allows at most one refinement, then insufficient. Review resumes preserve counters and remaining processing time; n8n does not restart.

只有可用、合時且有支持證據才通過；缺口最多補查一次，再回不足。覆核恢復保留計數及處理餘額，不重啟 n8n。

owner + revision + source IDs + required facets

9. **Generate, validate and save / 生成、驗證及保存** — Research app → You

This teaching case assumes coverage passes. The LLM receives original excerpts, highlights and selection limitations. Release only after citation/support validation and save the report with its selection revision.

此虛構案例假設覆蓋通過；LLM 收到原文、標記及選取限制。引用及支持驗證後才發布，報告保存所用選取版本。

fictional sufficient-evidence path · cited report

## Out of scope / 超出範圍

What about TSLA?

TSLA 又如何？

1. **An unsupported ticker / 不支援的代號** — You → Research app

Someone asks for a company this app does not cover.

有人問這個 app 不涵蓋的公司。

TSLA

2. **Stop before n8n / 在 n8n 之前停止** — Research app → You

The scope gate stops the question. n8n never starts. No receipt and no database write.

範圍檢查停住這條問題。n8n 不會啟動。沒有收據，也沒有資料庫寫入。

MSFT · AAPL · NVDA

## Valid empty news response / 有效空新聞回應

MSFT is supported, but the provider returns no articles.

MSFT 在範圍內，但供應商沒有文章。

1. **An accepted research request / 已接納研究請求** — Research app → n8n

Scope has already passed. Use the same validation and bounded acquisition workflow.

範圍已通過，沿用相同驗證及有限抓取流程。

refresh_company_news · new run

2. **The provider returns an empty list / 供應商回傳空清單** — YFinance adapter → n8n

A valid empty response is not a transient failure and must not trigger a provider retry.

有效空回應不是暫時故障，不能因此重試供應商。

HTTP 200 · articles=[] · schema valid

3. **Commit the empty receipt / 提交空結果收據** — n8n → Research app

Persist the observed result and fetch timestamp. Old stored news is not relabelled as newly published.

保存觀察結果及抓取時間；不把舊新聞改稱新發布。

status empty · 0 new version IDs

4. **Explain the evidence gap / 說明證據缺口** — Research app → You

For this current-news case, no eligible current evidence remains. Return supported dated facts and the gap, without a forecast. Other questions may still use eligible snapshot evidence.

此當前新聞案例沒有合資格當前證據；只回有日期支持事實及缺口，不作預測。其他問題仍可用合資格快照證據。

current-news question lacks current evidence

## Invalid request stops / 無效請求停止

A direct tool call supplies an unsupported symbol or malformed arguments.

直接工具呼叫帶不支援代號或格式錯誤參數。

1. **The tool boundary receives input / 工具邊界收到輸入** — Research app → n8n

The host normally filters these inputs, but the workflow must enforce its own boundary.

Host 通常已過濾輸入，但流程仍須執行自身邊界檢查。

untrusted tool arguments

2. **Reject before provider access / 供應商存取前拒絕** — n8n → Research app

Validate schema, allowlisted company, owner/run binding and deadline. Invalid arguments or authentication failures do not retry and do not write evidence.

核對 schema、公司清單、擁有者／任務綁定及時限；無效參數或認證失敗不重試、不寫證據。

invalid_request · provider attempts = 0

## Daily batch fails / 每日批次失敗

The scheduled macro/geopolitical provider remains unavailable.

排程宏觀／地緣供應商持續不可用。

1. **Start the daily job / 開始每日工作** — n8n → n8n

This job has its own deadline and is independent of user requests.

工作有獨立時限，不依賴使用者問題。

schedule + timezone + stable batch key

2. **Provider attempts fail / 供應商嘗試失敗** — n8n → Alpha Vantage NEWS_SENTIMENT

Use Alpha Vantage NEWS_SENTIMENT, separate from YFinance. Three planned queries have up to three attempts each, at most nine provider requests, all clipped to quota and the shared daily deadline.

用 Alpha Vantage NEWS_SENTIMENT，與 YFinance 分開。三個查詢各最多三次，總共最多九個請求，受配額及共用每日時限限制。

3 planned queries · ≤3 attempts/query · ≤9 requests/job

3. **Record failure without publishing a partial batch / 記錄失敗，不發布部分批次** — n8n → PostgreSQL

Keep the failure and execution IDs for reconciliation and tracing.

保留失敗及執行 ID 供核對和追蹤。

failed batch is ineligible for snapshots

4. **Retain the last completed batch / 保留最後完整批次** — PostgreSQL → Research app

The app sees the actual age and decides whether that evidence supports this question. Missing required freshness produces insufficient evidence, not a guessed update.

App 看實際資料年齡，判斷是否支持問題；所需新鮮度不足就回證據不足，不能猜更新。

prior batch ID + original fetched_at + stale status

## Daily context batch / 每日背景批次

Nobody asked. The clock starts.

沒有人發問。時鐘自己啟動。

1. **The schedule fires / 排程啟動** — n8n → n8n

This workflow runs even when nobody asks. Set the clock and timezone when you publish it.

即使沒有人發問，這條流程也會跑。發布時設定時間和時區。

Schedule Trigger · your timezone

2. **Fetch shared context / 抓取共用背景** — n8n → Alpha Vantage NEWS_SENTIMENT

Query macro and fiscal separately; classify geopolitical candidates after fetching a broad feed. Multiple topics use AND, and there is no documented geopolitics topic. The shared job deadline and account quota bound all requests.

宏觀及財政分開查詢，廣泛新聞抓取後再標記地緣候選。多個 topics 為 AND，沒有官方 geopolitics 主題；共用工作時限及帳戶配額限制全部請求。

economy_macro + economy_fiscal + broad feed → geo tags

3. **Commit the batch / 提交批次** — n8n → PostgreSQL

Company refresh is a different workflow. This batch is context, not the answer.

公司刷新是另一條流程。這批資料是背景，不是答案。

shared evidence pool

4. **Make this completed batch eligible / 令此完整批次可入快照** — PostgreSQL → Research app

A later accepted question can pin these exact versions. This successful path does not claim that the daily job failed.

之後有效問題可固定這些版本；成功路徑不會聲稱每日工作失敗。

completed batch ID + versions + fetched_at

## Diagrams / 圖解

[Per-question refresh SVG](finance-diagrams/sources-en.svg) · [Daily news SVG](finance-diagrams/n8n_daily-en.svg) · [Overall workflow SVG](finance-diagrams/overall-en.svg)

## Official references / 官方參考

- [Official Docker Compose installation](https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose.md)

- [n8n PostgreSQL database settings](https://docs.n8n.io/deploy/host-n8n/configure-n8n/choose-n8ns-database.md)

- [MCP Server Trigger and authentication](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/)

- [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
