# Stock research reviewer pack / 股票研究審閱材料

Design artifacts plus a local synthetic evaluation harness. Live finance n8n, pgvector retrieval, model and telemetry integrations are not implemented in this academy. The synthetic evaluation harness executes PostgreSQL full-text search. The browser demo remains fictional.

## PostgreSQL database design / PostgreSQL 資料庫設計

One PostgreSQL service holds evidence, full-text indexes, optional pgvector embeddings, reports and feedback. LangGraph uses PostgreSQL checkpoints in a separate database. The browser simulation still stores only temporary page state.

一個 PostgreSQL 服務保存證據、全文索引、可選 pgvector 向量、報告及回饋；LangGraph 在獨立資料庫保存 PostgreSQL checkpoints。瀏覽器模擬仍只使用暫存頁面狀態。

See `/finance-project/n8n` and the [n8n integration guide](/downloads/stock-research-n8n-guide.md) for per-question acquisition, daily batches, PostgreSQL metadata isolation and the handoff to evidence review.

n8n → PostgreSQL snapshot → Full-text default · pgvector candidate → Admitted hybrid → RRF → reranker → Optional review → selection revision → evidence gate → LLM → validate → PostgreSQL report

### YFinance MCP integration / YFinance MCP 整合

Use ranaroussi/yfinance as the underlying Python data library. The selected YFinance MCP server wraps it with discoverable tools. This app adds a private HTTP adapter so deterministic n8n HTTP Request nodes can call the stdio server and receive validated JSON. n8n owns provider retries.

以 ranaroussi/yfinance 作底層 Python 資料擷取函式庫。所選 YFinance MCP server 包裝成可發現工具；app 加入私人 HTTP adapter，讓固定 n8n HTTP Request 節點呼叫 stdio server，取得已驗證 JSON。供應商重試由 n8n 控制。

Install the pinned Python requirements in integrations/yfinance/.venv. Copy .env.example to .env.local and set YFINANCE_BRIDGE_TOKEN. Run the discovery command to inspect the selected tool schemas.

在 integrations/yfinance/.venv 安裝固定 Python 依賴；複製 .env.example 至 .env.local，設定 YFINANCE_BRIDGE_TOKEN。先執行發現命令查看工具 schema。

Start the private adapter on port 8002. In n8n, create a Header Auth credential named X-YFinance-Token. POST validated company arguments to /news or /quote. For Dockerized n8n, use an adapter service on the same private network and its service hostname.

在 8002 啟動私人 adapter；n8n 建立 X-YFinance-Token Header Auth 憑證。將已驗證公司參數 POST 至 /news 或 /quote。n8n 若在 Docker，adapter 服務應在相同私人網絡，以服務名稱連接。

Keep the existing refresh_company_news workflow contract. Inside it, call /news, validate its response, deduplicate and commit evidence in PostgreSQL, then return the acquisition receipt. Request /quote separately when the report needs price context, and store its timestamped observation ID in the snapshot.

保留 refresh_company_news 流程合約，內部呼叫 /news、驗證回傳、去重並提交 PostgreSQL，最後交回擷取紀錄。報告需要價格時另行呼叫 /quote，將有時間戳的觀察 ID 保存至快照。

Use one adapter call per n8n attempt. Route errors by retryable and remaining time. HTTP 401/422 stops, while retryable 429/503/504 follows the existing bounded n8n retry loop. Daily macro/geopolitical sources and versioned company profiles continue through their own acquisition paths.

每次 n8n 嘗試只呼叫 adapter 一次；按 retryable 及餘下時間路由。HTTP 401／422 停止，可重試 429／503／504 沿用有限 n8n 回圈；每日宏觀／地緣及版本化公司背景使用各自擷取路徑。

## Optional evidence review / 可選證據覆核

Proposed design and offline teaching demo only; the live finance backend is not implemented.

建議設計及離線教學示範；真實金融後端尚未實作。

### Your feedback here means evidence review / 此處回饋指證據覆核

Before generation, show up to six proposed report sources, original excerpts, source links/dates and the system relevance rank, with other ranked candidates shown separately. You can exclude articles, highlight topics and change the discussion order. Call this evidence review so it is distinct from post-report ratings/corrections, which are stored separately. Exclusion changes this report selection and never deletes news from PostgreSQL.

生成前展示最多六個建議報告來源、原文、連結／日期及系統相關排序，其他排序候選另列。你可排除文章、標記主題及改討論次序。將這步稱「證據覆核」，與報告生成後另存的評分／更正分開；排除只改本次選取，不刪 PostgreSQL 新聞。

### System rank and your order stay separate / 系統排名與你的次序分開

Preserve system_ordered_ids and reranker scores, then store user_ordered_ids as an exact, duplicate-free permutation of selected IDs in the selection revision. Order can affect what the model attends to and how the report is organized; treat it as presentation/emphasis preference, not a new relevance or truth score. Pass the preference alongside evidence to context assembly. Required facets and counter-evidence take priority over arbitrary trimming. Recheck coverage after trimming and disclose exclusions; never increase forecast confidence because an article moved up. Reordering alone makes no provider, search or embedding call. Validate the selection cap before resume. Preserve selected source IDs when shortening excerpts; if a selected source cannot fit or support is lost, stop with an explained context/evidence gap rather than silently dropping it.

保留 system_ordered_ids 及重排分數，再將 user_ordered_ids 存選取版本；它必須是所有已選 ID 的完整不重複排列。次序可影響模型注意及報告組織，只作呈現／重點偏好，不是新相關性或真實分數。建立 context 時連同證據傳入；必要面向及反方證據不能因裁剪優先次序而失去。裁剪後重查覆蓋並交代排除，不能因文章移前而提高信心；單純改次序不呼叫供應商、搜尋或 embedding。恢復前核對選取上限；縮短節錄仍須保留所選來源 ID，若放不下或支持流失須說明 context／證據缺口並停止，不能暗中刪掉所選來源。

### Where the review belongs / 覆核放在哪一步

Retrieve → rerank → optional evidence review → validate selection → evidence gate → context → LLM → validation. Default full-text search and sparse fallback enter the same review step. Choose automatic or review mode at request creation. Automatic mode uses the system selection and still passes all evidence checks.

檢索 → 重排 → 可選證據覆核 → 驗證選取 → 證據關卡 → context → LLM → 驗證。預設全文及 sparse 回退都經同一步。建立請求時選自動或覆核模式；自動沿用系統選取，仍須通過所有證據檢查。

### Highlight, exclude, reset, generate / 標記、排除、重設、生成

Highlight asks for more discussion of a supported topic. It does not raise relevance scores, factual reliability or forecast confidence. Exclude from report removes a passage from this report selection; it never deletes stored news. Move up/down sets your discussion order without changing system scores. Reset restores system recommendations and their order. Generate submits the selection for validation and coverage checks before the LLM is allowed to run.

標記要求多討論有證據支持的主題，不提高相關分數、真實性或預測信心。「排除此報告」只改本次選取，不刪新聞。上移／下移只改討論次序，不改系統分數；重設還原系統建議及次序；生成先提交選取，驗證及覆蓋檢查通過後才可呼叫 LLM。

### Coverage and confirmation bias / 覆蓋及確認偏誤

Show the question’s required facets, source dates, original excerpts, provenance and opposing evidence beside the controls. Recheck coverage after every submitted selection and after context trimming. An excluded dissenting source remains visible in the audit and report limitations; an exclusion cannot justify a broader claim. Missing required support triggers at most one refinement or an insufficient result. Highlighting an irrelevant passage does not make it admissible.

操作旁展示問題必要面向、日期、原文、來源及反方證據。每次提交及裁剪 context 後重查覆蓋；被排除的反方來源保留於核對紀錄及報告限制，不能因排除而擴大結論。必要支持不足最多補查一次，否則回證據不足；標記無關段落亦不能令它合資格。

### Snapshot and selection are different records / 快照與選取是不同紀錄

PostgreSQL keeps immutable news versions and the run’s frozen snapshot manifest. Add append-only evidence_selection_revisions keyed by owner_id, run_id, thread_id, snapshot_id, candidate_revision and selection_revision, with selected/highlighted/excluded IDs and timestamps. Store final selection_revision with the report. The authenticated server derives owner_id, validates IDs against permitted snapshot candidates, requires highlighted IDs to be selected and excluded IDs to be disjoint, and uses an atomic revision check so a second browser tab cannot overwrite a newer selection.

PostgreSQL 保存不可變新聞版本及任務固定快照。另加只追加 evidence_selection_revisions，以擁有者、run、thread、快照、候選及選取版本綁定，保存已選／標記／排除 ID 及時間；報告引用最終選取版本。伺服器從驗證身分取得 owner_id，核對 ID 屬可用候選、標記屬已選及排除不重疊，並以原子版本核對避免另一分頁覆蓋新選取。

### LangGraph pause and authenticated resume / LangGraph 暫停及身分驗證恢復

Use interrupt() in a dedicated review node after retrieval has completed, a PostgreSQL checkpointer and Command(resume=...) with the same authenticated thread. The interrupted node starts again from its beginning on resume: keep news fetching, retrieval and other expensive side effects outside it. Validate the submitted schema, ownership, revision, permissions and expiry at the API boundary, then recheck the saved selection in the graph. Never pass arbitrary client state or article instructions into Command.

檢索完成後由獨立覆核節點用 interrupt() 暫停，以 PostgreSQL checkpointer 保存；用相同已驗證 thread 及 Command(resume=...) 恢復。恢復會從中斷節點開頭重跑，新聞抓取、檢索及昂貴副作用須在節點外。API 邊界核對格式、擁有者、版本、權限及期限，再由 graph 核對已存選取；不能把任意 client 狀態或文章指令傳入 Command。

### Two clocks, bounded review / 兩個時鐘，有上限覆核

Proposed change: 60 seconds of active processing plus a 15-minute review window from the first pause. Persist the remaining active budget before waiting; only intentional review wait is excluded. Network waits and crash recovery still count. On resume use only the saved remainder, preserve the original evidence cutoff and all counters: one refresh, two searches, six source reads and three LLM calls. The review window is absolute and is not extended by edits or a second search. Expired review stops before generation and requires a new request. Report processing latency and review-wait/wall-clock latency separately; the 60s target applies to processing only.

建議改為 60 秒處理預算，加首次暫停起 15 分鐘覆核期。等待前保存剩餘處理預算，只有刻意覆核等待可扣除；網絡等待及故障恢復仍計時。恢復只用餘額，保留原證據截止及全部計數：一次刷新、兩次搜尋、六次來源讀取、三次 LLM。編輯或第二輪不延長覆核期；過期停止生成並須新請求。分開報處理延遲、覆核等待及總耗時，60 秒目標只適用處理。

### Refinement does not erase your choices / 補查不會抹掉選擇

Allow at most two candidate rounds and one submitted selection per round. Local edits before Generate need no graph loop. Refinement uses the same snapshot, preserves exclusions/highlights for known source IDs and exposes new candidates for a second review within the original window. Reset is explicit. New candidates are not silently approved, excluded sources are not silently reintroduced and no edit grants another refresh or search budget. After the second failed coverage check, stop as insufficient.

最多兩輪候選，每輪提交一次選取；生成前的本機編輯毋須 graph 迴圈。補查用相同快照，保留已知來源的排除／標記；原覆核期內展示新候選再覆核，重設須明確操作。不暗中批准新候選或重新加入被排除來源；編輯不增加刷新或搜尋預算。第二次覆蓋檢查仍不足就停止。

### Prompt injection stays outside the controls / 提示注入不能控制操作

Article text, highlighted passages and optional user notes remain untrusted data. They cannot change the company allowlist, scope route, budget, tool arguments or system policy. Selection controls submit source IDs and enumerated actions rather than executable instructions. Keep the scope gate before news access. Trace selection revisions, pause/resume and gate outcomes with redacted IDs; do not expose article text or private notes in public traces.

文章、標記原文及可選筆記仍是不可信資料，不能改公司清單、範圍路由、預算、工具參數或系統規則。操作只傳來源 ID 及固定動作，不傳可執行指令；scope gate 維持在新聞存取前。追蹤選取版本、暫停／恢復及關卡結果，公開 trace 只用清理 ID，不放文章或私人筆記。

### What must be verified in the future backend / 未來後端必須驗證甚麼

Live review checks are NOT RUN. Before enabling the feature, test another owner’s IDs, stale revisions, revoked permissions, duplicate/concurrent resumes, expiry during a pause, crash recovery and injection inside a highlighted article. Verify that no rejected submission advances the graph, no source is deleted, known exclusions survive refinement, completed acquisition is not repeated and all budgets only decrease. Evaluate automatic reports separately from user-curated selections on the frozen golden set; do not count human choices as a retrieval improvement.

真實覆核檢查為 NOT RUN。啟用前測其他擁有者 ID、舊版本、權限撤銷、重複／並行恢復、等待期間過期、故障恢復及標記文章內注入。核對被拒提交不推進 graph、不刪來源、補查保留排除、已完成抓取不重做，全部預算只減少。凍結 golden set 分開評估自動及人手選取報告，不能把人手選擇當檢索改善。

```json
{
  "disclosure": "Fictional proposed record; the academy has no live report backend",
  "owner_id": "server-derived-owner",
  "run_id": "example-run",
  "thread_id": "example-run",
  "snapshot_id": "snapshot-msft-example",
  "candidate_revision": 1,
  "selection_revision": 2,
  "selected_ids": [
    "costs-v1-c1",
    "demand-v2-c1"
  ],
  "highlighted_ids": [
    "costs-v1-c1"
  ],
  "system_ordered_ids": [
    "costs-v1-c1",
    "demand-v2-c1",
    "outlook-v1-c1"
  ],
  "user_ordered_ids": [
    "demand-v2-c1",
    "costs-v1-c1"
  ],
  "excluded_ids": [
    "outlook-v1-c1"
  ],
  "missing_facets": [
    "earnings outlook"
  ],
  "selection_limitations": [
    "The only outlook passage was excluded; no outlook forecast is supported."
  ],
  "remaining_active_ms": 32000,
  "review_expires_at": "2026-11-13T01:15:00Z"
}
```

```python
## Design sketch: API/storage/budget helpers must be implemented and tested.
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

## API resume sketch (server-owned config; never accept arbitrary thread state):
## owner = authenticate_request()
## selection = validate_and_commit_selection(owner, payload, expected_revision)
## graph.invoke(Command(resume={"selection_revision": selection.revision}),
##              {"configurable": {"thread_id": selection.thread_id}})
## Scope/news/retrieval are completed nodes and are not re-run on this resume.

```

[LangGraph interrupts documentation](https://docs.langchain.com/oss/python/langgraph/interrupts)

[Lost in the Middle: evidence-position effects in studied models](https://arxiv.org/abs/2307.03172)


### Document embeddings: during indexing / 文件 embedding：建立索引時

After company/daily news is validated, deduplicated and committed, split permitted text into versioned chunks. An indexing worker embeds new or changed chunks, then stores vectors with chunk ID, text hash, model/version and dimension in PostgreSQL pgvector. Company-profile excerpts use the same pipeline. This happens before those chunks can participate in vector search, rather than after reranking.

公司／每日新聞驗證、去重及提交後，將允許文字切成有版本段落。索引 worker 嵌入新增／改動段落，再把向量、chunk ID、文字 hash、模型／版本及維度存 PostgreSQL pgvector。公司背景原文亦經此流程；須先有向量才可向量搜尋，並非重排後才 embedding。

### Question embeddings: just before vector retrieval / 問題 embedding：向量檢索之前

On an accepted request, first refresh company news and pin the evidence snapshot. If the evaluated hybrid mode is enabled, encode the current query using the same compatible model/configuration as document vectors, then search pgvector under the snapshot, time and permission filters. Combine with full-text results and rerank question–passage pairs. A refined query needs its own query embedding; unchanged document chunks do not need another embedding.

有效請求先刷新公司新聞及固定快照。若已啟用通過評估的混合模式，用與文件向量相容的相同模型／設定編碼當前查詢，再在快照、時間及權限條件下搜尋 pgvector，合併全文結果後重排問題與原文配對。補查的新 query 須再編碼；未改動文件不須重嵌入。

### Pending vectors do not block sparse search / 向量未就緒不阻擋全文搜尋

Full-text indexing remains the default and uses no embeddings. Run document embedding as a separate idempotent indexing job keyed by chunk hash and model. Pin the model/version and vector-ready chunk IDs with the run snapshot; refinement/resume reuse that view. Newly completed embeddings become available to the next request. Do not label pending embeddings as a complete hybrid index. A candidate vector/model failure falls back to working full-text evidence within budget. Neither n8n acquisition success nor an evidence snapshot promises that its vectors are ready. Hybrid remains blocked until it beats the written frozen evaluation margins.

全文索引仍是預設，不用 embedding。文件嵌入作獨立冪等索引工作，以段落 hash 及模型為鍵，快照固定模型／版本及向量已就緒段落 ID，補查／恢復沿用此視圖；新完成向量供下次請求用，不能把待完成向量稱完整混合索引。向量／模型失敗可在預算內回退可用全文證據；n8n 抓取成功及固定快照不代表向量已就緒。混合模式仍須超越凍結評估書面門檻才准入。

### Embeddings, reranking and review do different jobs / Embedding、重排及覆核分工不同

Embeddings help find semantically similar passages. Reranking scores relevance to the exact question using the passage text. Evidence review shows the proposed sources and system rank, lets you exclude or reorder them, and records your preferred discussion order. None of these steps establishes factual support or predicts stock returns. The evidence gate and citation checks still decide which claims may be released.

Embedding 協助找語義相似段落；重排用原文評估對當前問題的相關性。證據覆核展示建議來源及系統排序，讓你排除或改討論次序。這些步驟本身都不證明事實支持或預測股票回報；證據關卡及引用驗證仍決定哪些主張可發布。

### Three evidence streams / 三條證據來源

Each accepted prompt refreshes company news through n8n MCP. A separate daily n8n Schedule Trigger calls Alpha Vantage NEWS_SENTIMENT for macro/fiscal news and a broad feed for geopolitical tagging, with explicit coverage limits, into shared PostgreSQL records. Maintain sourced, versioned profiles for MSFT, AAPL and NVDA: business segments, products, geographic and supply-chain exposure, and financial figures with reporting periods. Review profiles after filings or material changes. Configure the daily time and workflow timezone when publishing n8n.

每個有效提示經 n8n MCP 刷新公司新聞。獨立每日 n8n Schedule Trigger 經 Alpha Vantage NEWS_SENTIMENT 抓宏觀／財政及廣泛候選另作地緣標記，明示覆蓋限制，再存至 PostgreSQL 共用記錄。MSFT、AAPL、NVDA 各有附來源及版本背景：業務、產品、地域與供應鏈曝險，以及附報告期間財務數據。財報或重大變化後覆核背景；發布 n8n 時設定每日時間及時區。

### Snapshot = the evidence version used for this report / Snapshot＝這份報告使用的證據版本

Fetching acquires news. A snapshot pins a manifest of eligible source/chunk versions, completed daily batch IDs, company-profile version, cutoff and coverage status under snapshot_id. Retrieval selects passages from that fixed collection. Later news creates a version for the next run. Refinement and resume reuse the same snapshot. Permission revocations are still checked. This is a run-level evidence manifest rather than a full database backup.

抓取是取得新聞；snapshot 按 snapshot_id 固定可用來源／切段版本、完整每日批次 ID、公司背景版本、截止時間及覆蓋狀態。檢索從這份固定集合挑段落。新新聞供下一次任務使用；補查及恢復沿用原快照，撤銷使用權仍須檢查。這是任務證據清單，並非完整資料庫備份。

### Rerank = relevance to your question / Rerank＝與問題的相關性排序

For “How could export restrictions affect NVDA?”, the reranker compares the question with each candidate passage. It can put an export-policy article ahead of an unrelated earnings article. Its score measures relevance. The LLM then combines policy evidence with the dated company profile to explain a possible business-impact chain, assumptions, counter-evidence and uncertainty. Stock-return estimates require a separately validated model.

例如「出口限制可能如何影響 NVDA？」重排器比較問題與每段原文，可把出口政策文章排在無關財報文章前。分數量度相關性。LLM 再結合政策證據及有日期公司背景，解釋可能業務影響鏈、假設、反方證據及不確定性。股票回報估計須另行驗證模型。

### n8n owns acquisition retries / n8n 負責抓取重試

Proposed policy: at most 3 provider attempts, with 1s then 2s backoff plus jitter. Each attempt is capped at 10s and clipped to a 25s acquisition deadline and the remaining run deadline. Retry transient network failures, selected 5xx and rate limits only when Retry-After fits. Invalid arguments, authorization failures and malformed responses return typed errors. The host sends one logical refresh with a stable run_id. After an MCP timeout, reconcile the existing execution/receipt before resubmitting. Search refinement has its own two-search limit.

建議最多 3 次供應商嘗試，等待 1 秒、2 秒加 jitter。每次最多 10 秒，同時受 25 秒抓取階段及任務剩餘時限限制。只在餘額足夠時重試暫時網絡錯誤、指定 5xx 或限流。無效參數、授權或格式錯誤回傳結構化錯誤。Host 以固定 run_id 發出一次邏輯刷新；MCP 超時先核對原執行／紀錄。搜尋補查另有兩次上限。

### Show freshness for each stream / 各來源明示新鮮度

A daily batch is current as of its last successful fetch. Failed daily ingestion preserves the previous completed batch and records the failure. Show fetched_at, publication/first-seen times and coverage separately for company, macro, geopolitics and profiles. Retrieve shared news by topic, region, sector and a supported exposure mechanism. If the question needs a missing or stale stream, explain the gap and withhold that conclusion. Shared news can be relevant without naming a ticker.

每日批次只代表最後成功擷取時的資料；失敗保留上一完整批次並記錄失敗。公司、宏觀、地緣及背景各自顯示擷取、發布／首次取得時間及覆蓋。共用新聞按主題、地域、行業及有證據曝險關係檢索；所需來源缺少或過期就交代缺口。共用新聞即使沒有 ticker 仍可能相關。

### Fictional snapshot manifest / 虛構快照清單

```json
{
  "disclosure": "Fictional evidence-manifest example",
  "snapshot_id": "snapshot-nvda-example-001",
  "company": "NVDA",
  "as_of": "2026-11-11T01:00:00Z",
  "company_news_version_ids": [
    "nvda-news-v3"
  ],
  "daily_batch_ids": {
    "macro": "macro-batch-example",
    "geopolitics": "geo-batch-example"
  },
  "company_profile_version": "nvda-profile-v2",
  "retrieval_index": {
    "mode": "sparse",
    "embedding_model": null,
    "vector_ready_chunk_ids": []
  },
  "eligible_chunk_ids": [
    "nvda-news-v3-c1",
    "geo-policy-v1-c2",
    "nvda-profile-v2-c4"
  ],
  "coverage": {
    "company": "ok",
    "macro": "ok",
    "geopolitics": "ok",
    "profile": "reviewed"
  }
}
```

## Revised news, retrieval and observability requirements / 新版要求

Prompt + company + horizon → scope gate → n8n MCP → refresh_company_news → Versioned evidence + time filters → Sparse / gated hybrid → rank → Optional review → validate selection → evidence gate → Context → conditional forecast + citations → Validate → feedback + trace URL

### Fresh news for every prompt / 每個提示都取得新聞

n8n owns provider retries for company refresh and independent daily macroeconomic/geopolitical acquisition. Use stable execution keys and typed receipts. Each report pins company-news versions, eligible completed daily batches and a sourced company-profile version in its PostgreSQL evidence manifest.

n8n 負責公司刷新及獨立每日宏觀／地緣抓取的供應商重試；使用固定執行鍵及結構化紀錄。每份報告在 PostgreSQL 證據清單固定公司新聞版本、合資格完整每日批次及附來源公司背景版本。

Every new valid research prompt creates a run and must call refresh_company_news through the n8n MCP Server Trigger before retrieval. A deterministic graph node enforces this; the LLM cannot skip it. Resume reuses the same refresh receipt.

每個有效研究提示都建立任務，檢索前必須經 n8n MCP Server Trigger 呼叫 refresh_company_news。由固定 graph 節點強制執行，LLM 不能略過；恢復任務重用原刷新紀錄。

n8n exposes a Custom Workflow Tool for approved news APIs/RSS. Validate company, query, UTC window and result limit; use fixed provider URLs, server credentials, bounded retries and run_id idempotency. A schedule may warm the store but never replaces the per-prompt call.

n8n 以 Custom Workflow Tool 接駁核准新聞 API／RSS。驗證公司、問題、UTC 時段及筆數；使用固定供應商網址、伺服器憑證、有限重試及 run_id 冪等鍵。排程可預熱資料，但不能取代每個提示的呼叫。

Return source_id, canonical URL, published_at, first_seen_at, fetched_at, content hash, permitted excerpt, snapshot_id and provider status. Deduplicate syndicated stories. Outage, partial coverage or stale data is visible; never silently describe old news as fresh.

回傳來源 ID、原網址、發布／首次取得／擷取時間、內容 hash、允許節錄、快照 ID 及供應商狀態。同一轉載新聞去重；中斷、覆蓋不足或過期資料必須明示，不能將舊聞稱為即時。

### Measured retrieval / 有量度依據的檢索

Freeze corpus, prompts, graded relevance labels (0/1/2), expected abstentions and SHA-256 manifest before tuning. The checked-in v1 set has 18 fictional cases across three tickers and is a harness smoke test. A separate human-reviewed, licensed news holdout is required for production admission; do not tune on either test set.

調參前凍結語料、問題、0／1／2 相關性標籤、預期拒答及 SHA-256 清單。v1 有三個 ticker 共 18 個虛構案例，只驗證評估工具；正式准入另須人工核對、獲授權的新聞保留集，不能用測試集調參。

Compare PostgreSQL full-text search (tsvector + GIN + ts_rank_cd) sparse, pgvector dense + PostgreSQL full-text with reciprocal rank fusion, and hybrid + a pinned cross-encoder reranker. Use identical chunks, company/permission/time filters and candidate budgets: 20 per branch, fuse to 20, rerank to 10, pass at most 6 excerpts to the model. Filter both published_at and first_seen_at at the as-of cutoff.

比較 PostgreSQL 全文搜尋（tsvector＋GIN＋ts_rank_cd）、pgvector dense＋PostgreSQL 全文 的 RRF 混合檢索，以及加固定版本 cross-encoder 的混合檢索。共用切段、公司／權限／時間條件及預算：每分支 20、融合至 20、重排至 10、最多 6 段送模型。發布及首次取得時間都須早於截止點。

Report macro recall@5/10 and nDCG@5/10 on answerable cases; report empty-evidence cases separately. Before enabling hybrid + reranking, require absolute gains of at least +0.03 recall@10 and +0.05 nDCG@10 over sparse, no per-company regression, citation-precision ≥0.95 and no decline from sparse. These are proposed acceptance thresholds, not measured improvements.

可回答案例報告 macro recall@5／10 及 nDCG@5／10；無證據案例分開計算。啟用混合＋重排前，對 sparse 的 recall@10 須至少增加 0.03、nDCG@10 至少增加 0.05（絕對值），各公司不可倒退，引用精準度 ≥0.95 且不低於 sparse。這些是建議門檻，並非已量度提升。

Citation-precision means supported claim–source pairs / all emitted pairs, judged against the actual excerpt; an existing URL alone is insufficient. Also require 100% citation coverage for material factual claims, correct abstention on all no-evidence cases, and report sample counts. Zero citations means N/A, never a perfect score. Missing evidence blocks admission and keeps sparse active.

引用精準度＝原文支持的主張與來源配對／所有輸出配對；有網址並不足夠。重要事實須 100% 附引用、所有無證據案例正確拒答，並報告樣本數。零引用是 N/A，不能算滿分；未齊評估資料則不准入，維持 sparse。

### Observable runs · Langfuse + LangSmith / 可觀察任務 · Langfuse＋LangSmith

Create an OpenTelemetry root span per research run and child spans for MCP refresh, each provider attempt, ingestion, sparse/dense retrieval, fusion, reranking, every model/tool call, validation and export. Propagate W3C traceparent across HTTP; explicitly instrument the n8n workflow and correlate its execution ID when automatic context propagation is unavailable.

每次研究建立 OpenTelemetry 根 span，MCP 刷新、供應商每次嘗試、匯入、稀疏／向量檢索、融合、重排、每次模型／工具呼叫、驗證及下載都有子 span。HTTP 傳遞 W3C traceparent；n8n 工作流程須加 instrumentation，無自動傳遞時記錄 execution ID 關聯。

Self-hosted Langfuse owns operational traces. LangSmith adds dataset experiments, prompt comparisons and evaluator feedback. Export one instrumented span tree through a redacting OTel Collector to both backends; correlate run_id, trace_id, dataset hash, model/prompt/reranker versions. Do not double-instrument LangGraph or sum duplicate token counts across products.

自架 Langfuse 保存運行記錄；LangSmith 提供資料集實驗、提示比較及評估回饋。同一組 spans 經遮蔽敏感資料的 OTel Collector 分送兩邊，關聯任務／trace ID、資料 hash 及模型／提示／重排版本。避免重複 instrumentation 或將兩邊 token 相加。

Record actual input/output tokens (unknown stays null), tool errors/retries and end-to-end plus stage latency. Publish p50/p95 over at least 30 completed live runs with sample size, concurrency, warm/cold conditions and failed-run counts; a single demo has duration, not its own p95. Initial processing p95 target: ≤60 s; report review-wait duration, wall-clock latency, timeout rate and automatic/review cohorts separately. Do not keep a live root span open during human wait; correlate resumed segments by run_id.

記錄實際輸入／輸出 token（未知保留 null）、工具錯誤／重試、全程及各階段延遲。至少 30 次已完成真實任務才報 p50／p95，附樣本數、並行數、冷暖狀態及失敗數；單次 demo 只有耗時，沒有自己的 p95。初步處理 p95 目標 ≤60 秒；另報覆核等待、總耗時、超時比例，分開自動／覆核樣本。等待用戶時不保持 live root span，恢復片段以 run_id 關聯。

Every live demo must save one verified shareable trace URL in its report and report card. Exporters flush before resolving the link; verify that a reviewer can open it. Redact keys, personal prompts and restricted article text before export or sharing. Private production traces remain private; share sanitized demonstration runs. If export fails, retain the report but mark the observable-demo gate incomplete.

每次真實 demo 的報告及成績表須保存一條已驗證可分享 trace URL；先 flush 再取得連結，確認審閱者可開啟。匯出或分享前遮蔽金鑰、私人提示及受限文章；正式私人 trace 保持私人，只分享清理過的示範。匯出失敗可保留報告，但可觀察 demo 驗收仍未完成。

### Prompt-specific feedback and prediction / 針對提示的回饋及預測

Persist the original question, company, horizon, as-of time and refresh receipt with every answer. Return a direct answer, cited observed facts, base/upside/downside scenarios, assumptions, invalidation signals, conflicting evidence and limitations. Label forecasts as inference; citations support inputs, not guaranteed future outcomes.

每個答案保存原問題、公司、期間、截止時間及刷新紀錄。回傳直接答案、有引用事實、基本／上行／下行情境、假設、失效訊號、矛盾證據及限制。預測須標明推論；引用支持輸入事實，不能保證未來結果。

Example prompt: “How could rising costs affect MSFT margins over 1–3 months?” Discuss cost evidence and offsetting revenue or pricing evidence. Do not reuse a generic Hold/Reduce paragraph for every question. Missing current evidence returns insufficient evidence; unsupported calibrated probabilities or price targets are omitted.

例如「成本上升可能如何影響 MSFT 未來 1–3 個月利潤率？」應分析成本證據及收入／定價抵銷因素，不能每題重用同一段 Hold／Reduce。缺少當前證據就回覆不足，不輸出未驗證機率或目標價。

Store user helpfulness/correction feedback as a separate record tied to run_id and prompt_version. Feedback is not a market outcome label and never silently edits the frozen golden set. Predictive accuracy requires a later time-split outcome study with no future information leakage; retrieval scores do not establish trading performance.

用戶有用度／更正回饋另存，連結 run_id 及 prompt_version。回饋不是市場結果標籤，不能靜默更改凍結資料集。預測準確度須日後按時間切分、避免未來資料滲漏的結果研究；檢索分數不代表交易表現。

# ADR-001: n8n owns news acquisition; LangGraph owns research / n8n 管新聞擷取；LangGraph 管研究

Status: accepted design, implementation pending. Date: 2026-11-06. PostgreSQL revision: 2026-11-11.

## Decision / 決定

Accept one mandatory refresh_company_news MCP call per new prompt, backed by an allowlisted n8n workflow. Keep search_company_evidence and read_source in the research service.

每個新提示必須呼叫一次 refresh_company_news MCP，由核准 n8n 工作流程處理；搜尋及讀取來源由研究服務負責。

## Tradeoff / 取捨

Adds a network dependency and provider cost. A dated replay is reproducible but cannot be labelled fresh.

增加網絡依賴及供應商成本；有日期重播可重現，但不能稱為即時。

## Verification / 驗證

Trace two different prompts and show two refresh receipts. Resume one run and show no duplicate acquisition. Exercise timeout and partial-provider results.

追蹤兩個不同提示及兩份刷新紀錄；恢復一次任務不重複擷取；檢查超時及部分供應商結果。


# ADR-002: Sparse is the baseline; hybrid must earn admission / Sparse 為基線；混合檢索須通過准入

Status: accepted design, implementation pending. Date: 2026-11-06. PostgreSQL revision: 2026-11-11.

## Decision / 決定

Retain PostgreSQL full-text search as the default and rollback path. Trial pgvector dense + PostgreSQL full-text, RRF and a version-pinned cross-encoder on the same frozen corpus.

保留 PostgreSQL 全文搜尋 為預設及回退路徑；同一凍結語料試行 pgvector dense＋PostgreSQL 全文、RRF 及固定版本 cross-encoder。

## Tradeoff / 取捨

Embedding storage, reranker compute and extra failure modes are justified only by measured quality; an HNSW index is not proof of relevance.

向量儲存、重排計算及額外故障須以品質改善支持；HNSW 索引不代表相關性更高。

## Verification / 驗證

Require +0.03 recall@10, +0.05 nDCG@10, no company regression, citation and abstention gates. Publish sparse / hybrid / hybrid+rerank ablations; missing results keep the candidate blocked.

要求 recall@10 +0.03、nDCG@10 +0.05、公司不倒退及引用／拒答達標；公布三種配置消融，未有結果則阻擋候選。


# ADR-003: Freeze evidence and separate facts from forecasts / 凍結證據，分清事實與預測

Status: accepted design, implementation pending. Date: 2026-11-06. PostgreSQL revision: 2026-11-11.

## Decision / 決定

Version immutable excerpts and qrels; filter published_at and first_seen_at. Generate question-specific conditional scenarios and retain explicit abstention.

版本化不可變節錄及相關性標籤；檢查發布及首次取得時間；按問題產生條件式情境，保留明確拒答。

## Tradeoff / 取捨

Conservative answers sometimes abstain. The synthetic starter validates mechanics only; real-news evaluation needs independent human labels and a held-out time period.

保守答案可能拒答；虛構種子只驗證機制，真實新聞須獨立人工標籤及保留時段。

## Verification / 驗證

Hash-check fixtures; reject future/late-ingested sources; manually judge claim support and record disagreement. Never claim return prediction from retrieval metrics.

核對 fixture hash；拒絕未來／延後取得來源；人工核對主張並記錄分歧；不能用檢索指標聲稱回報預測能力。


# ADR-004: One OTel trace tree, two observability destinations / 一組 OTel traces，兩個觀察平台

Status: accepted design, implementation pending. Date: 2026-11-06. PostgreSQL revision: 2026-11-11.

## Decision / 決定

Self-host Langfuse for operations; use LangSmith for experiments and feedback. A Collector exports sanitized spans with common run IDs to both.

自架 Langfuse 作運維，LangSmith 作實驗及回饋；Collector 將清理後 spans 及相同任務 ID 傳送兩邊。

## Tradeoff / 取捨

Two destinations add cost and operations. LangSmith credentials and deployment/licensing must be configured; do not assume it is a free self-hosted service. Export outages must be visible.

兩個平台增加成本及運維；須設定 LangSmith 憑證及部署／授權，不能假設是免費自架服務；匯出中斷必須可見。

## Verification / 驗證

Check span parentage across n8n, token totals, redaction and one accessible demo trace URL. Report latency distributions only with their actual run count.

核對跨 n8n span 父子關係、token 總數、遮蔽及可開啟 demo URL；延遲分佈必須附真實任務數。


# ADR-005: Retrieved content has no tool authority / 檢索內容沒有工具權限

Status: accepted design, implementation pending. Date: 2026-11-06. PostgreSQL revision: 2026-11-11.

## Decision / 決定

Treat articles, metadata and MCP results as untrusted data. Code enforces tool allowlists, provider URLs, schema limits, deadlines and citation membership. No arbitrary URL fetch, shell, credential access or trading tool.

文章、metadata 及 MCP 結果都是不可信資料；程式強制工具清單、供應商網址、schema、時限及引用集合；不提供任意網址擷取、shell、憑證存取或交易工具。

## Tradeoff / 取捨

No prompt or injection classifier guarantees safety. Structural boundaries limit effects, while adversarial fixtures measure the remaining behavior.

提示或注入分類器不能保證安全；結構邊界限制影響，對抗 fixtures 量度剩餘行為。

## Verification / 驗證

Replay direct/indirect override, exfiltration, forged citations, metadata attacks, poisoned tool results, future evidence and retry-budget attacks. Any unauthorized call or secret leak fails the release gate.

重播直接／間接覆寫、外洩、假引用、metadata 攻擊、污染工具結果、未來證據及重試預算攻擊；任何越權呼叫或秘密洩漏都阻擋發布。


# ADR-006: Publish evidence before adding infrastructure / 先公布證據，再增加基建

Status: accepted design, implementation pending. Date: 2026-11-06. PostgreSQL revision: 2026-11-11.

## Decision / 決定

Ship six short ADRs, the frozen set, injection fixtures, rerun commands and a public report card. Mark unexecuted live checks NOT RUN. Promotion requires the approved real-news holdout and live safety/trace evidence, not just the synthetic score.

交付六份短 ADR、凍結集、注入 fixtures、重跑命令及公開成績表；未執行真實檢查標明 NOT RUN。准入須真實新聞保留集及安全／trace 證據，不能只看虛構分數。

## Tradeoff / 取捨

The larger scope replaces the former 60–90 hour estimate with a provisional 120–180 hours at 15 hours/week. Re-estimate after the first working MCP and trace slice.

新增範圍將原先 60–90 小時改為暫估 120–180 小時、每週 15 小時；完成首條 MCP 及 trace 流程後重新估算。

## Verification / 驗證

A reviewer can reproduce local metrics and see missing live results without reading the code. Changes to labels or thresholds create a new documented evaluation version.

審閱者毋須先讀程式便可重現本機指標及看到尚欠真實結果；改標籤或門檻須建立新評估版本並解釋。


## Reproduce and inspect

Set up the PostgreSQL 18 evaluation database and Python dependencies using `evals/finance/README.md`. Then run `npm run proposal:check`, `npm run finance:eval:test` and `python3 evals/finance/evaluate.py --check`. [Evaluation report card](../public/downloads/stock-research-eval-report.md) · [Frozen golden set and injection fixtures](../public/downloads/stock-research-eval-fixtures.json).

## Official references

- [n8n: MCP Server Trigger and workflow tools](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/)
- [pgvector: vector and hybrid search](https://github.com/pgvector/pgvector#hybrid-search)
- [Langfuse: self-hosting architecture](https://langfuse.com/self-hosting)
- [Langfuse: OpenTelemetry ingestion](https://langfuse.com/integrations/native/opentelemetry)
- [LangSmith: OpenTelemetry and Collector fan-out](https://docs.langchain.com/langsmith/trace-with-opentelemetry)
- [LangSmith: sharing sanitized traces](https://docs.langchain.com/langsmith/manage-trace)
- [LangGraph: Graph API, state and conditional edges](https://docs.langchain.com/oss/python/langgraph/graph-api)
- [LangGraph: workflows and agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents)
- [LangGraph: persistence and checkpoints](https://docs.langchain.com/oss/python/langgraph/persistence)
- [FastAPI: typed request bodies](https://fastapi.tiangolo.com/tutorial/body/)
- [PostgreSQL: full-text search and ranking](https://www.postgresql.org/docs/current/textsearch-controls.html)
- [PostgreSQL: backup and restore](https://www.postgresql.org/docs/current/backup-dump.html)
- [LangGraph: PostgreSQL checkpoint setup](https://docs.langchain.com/oss/python/langgraph/add-memory)
- [Docker Compose: production deployment](https://docs.docker.com/compose/how-tos/production/)
