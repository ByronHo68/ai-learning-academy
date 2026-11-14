## PostgreSQL database design / PostgreSQL 資料庫設計

One PostgreSQL service holds evidence, full-text indexes, optional pgvector embeddings, reports and feedback. LangGraph uses PostgreSQL checkpoints in a separate database. The browser simulation still stores only temporary page state.

一個 PostgreSQL 服務保存證據、全文索引、可選 pgvector 向量、報告及回饋；LangGraph 在獨立資料庫保存 PostgreSQL checkpoints。瀏覽器模擬仍只使用暫存頁面狀態。

Open `/finance-project/vector-db` for the vector database mind map, animated search, model candidates and standalone Python/PostgreSQL tutorial. 中文：向量資料庫心智圖、搜尋動畫、模型候選及 Python 教學。

Open `/finance-project/checkpoints` for the checkpoint mind map, AsyncPostgresSaver tutorial, restart/recovery simulation and downloadable Python example.

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

### evidence_selection_revisions (proposed extension)

Append a selection revision bound to the authenticated owner, run/thread, snapshot and candidate revision. Save selected/highlighted/excluded IDs, system ranks, validated user order, timestamps and selection limitations; the final report references that revision. Validate snapshot membership and permissions, require highlights to be selected and exclusions to be disjoint, and atomically check the expected revision. These records never modify stored news. Persist remaining active time and an absolute review expiry alongside checkpoints; do not hold a database transaction while awaiting the user.

選取版本以只追加紀錄綁定已驗證擁有者、run/thread、快照及候選版本，存已選／標記／排除 ID、系統排名、已驗證用戶次序、時間及限制；最終報告引用此版本。核對快照成員及權限、標記屬已選及排除不重疊，以原子操作核對預期版本。不改新聞原文；checkpoint 另存剩餘處理預算及絕對覆核期限，等待用戶時不持有 transaction。

### Shared news + versioned company profiles

Extend the evidence model with shared macro/geopolitical document versions and company-profile versions, plus explicit snapshot membership. Keep shared news tagged by topic, region and sector. A profile belongs to its company and keeps reporting/effective/review dates. Every run manifest records the selected versions. The SQL examples below demonstrate the company-news subset; shared-context membership and retrieval are part of the proposed backend extension.

證據模型擴展共用宏觀／地緣文件版本、公司背景版本及明確快照成員關聯。共用新聞按主題、地域、行業標記；公司背景保存所屬公司及報告／生效／覆核日期。任務清單記錄選用版本。下方 SQL 範例示範公司新聞子集；共用背景成員關聯及檢索屬未來後端擴展。

### snapshots + evidence_chunks

Store dated, versioned excerpts and their source URLs. Query one pinned snapshot with company, permission, publication and first-seen filters. Freeze content after publication; permission revocations still exclude sources.

保存有日期及版本的節錄和來源網址；查詢固定快照並檢查公司、權限、發布及首次取得時間。發布後凍結內容，撤銷權限仍須排除來源。

### tsvector + GIN + ts_rank_cd

The default sparse path is native PostgreSQL full-text search. GIN indexes lexemes and ts_rank_cd ranks matching passages by term coverage and proximity. The English configuration fits the initial English news corpus; other languages need separate evaluation.

預設 sparse 路徑用 PostgreSQL 原生全文搜尋；GIN 索引字詞，ts_rank_cd 按詞語覆蓋及距離排序匹配段落。English 設定適用首版英文新聞；其他語言須另行評估。

### pgvector → RRF → cross-encoder

pgvector adds vector columns and distance search inside PostgreSQL. Start with exact filtered search; measure before adding HNSW. Approximate filtering can return too few rows, so evaluate recall under the same filters. Fuse 20 candidates per path to 20, rerank to 10, and pass at most 6 excerpts to the LLM.

pgvector 在 PostgreSQL 內加入向量欄位及距離搜尋。先用過濾後精確搜尋，量度後再加 HNSW。近似搜尋過濾後可能不足筆數，須在相同條件下評估召回。每路徑取 20、融合成 20、重排成 10，最多 6 段送 LLM。

### runs + reports + report_sources + feedback

Persist the run owner, question, active deadline and remaining budget, counters, validated report and citation links. Save a report and its source links in one transaction. Unique run IDs make retries idempotent. Feedback is a separate record and never changes frozen evidence.

保存任務擁有者、問題、處理時限及剩餘預算、計數、已驗證報告及引用關聯。報告與來源關聯用同一 transaction 保存，唯一任務 ID 讓重試具冪等性；回饋另存，不改凍結證據。

### research_checkpoints · AsyncPostgresSaver

Use langgraph-checkpoint-postgres and a server-owned thread_id mapped to the authenticated run. Run setup once as a migration, keep the async saver open for the application lifespan, and resume with the saved counters and remaining active budget. Only explicit review wait pauses active time, with an absolute 15-minute review expiry. Checkpoints do not authorize a user or make external tool effects exactly-once.

使用 langgraph-checkpoint-postgres，thread_id 由伺服器建立並連結已認證任務。setup 作一次性 migration；async saver 在 app 生命週期保持開啟，恢復保留計數及剩餘處理預算；只有明確覆核等待暫停計時，另有 15 分鐘絕對覆核期限。Checkpoint 不負責授權，也不能保證外部工具只執行一次。

### Connections, retries and backups / 連線、重試及備份

Keep DATABASE_URL and CHECKPOINT_DATABASE_URL server-side. Use Psycopg 3 with bounded pools, parameterized SQL and short transactions. Set statement and pool timeouts within the remaining run deadline; never hold a transaction open while waiting for an LLM or news API.

DATABASE_URL 及 CHECKPOINT_DATABASE_URL 只留伺服器。用 Psycopg 3、有上限連線池、參數化 SQL 及短 transaction；SQL 和連線池 timeout 不超出任務剩餘時限，等 LLM 或新聞 API 時不保持 transaction。

Give n8n an ingestion-only role; keep report and checkpoint access in the research service. Use separate databases and roles for research, checkpoints, n8n internal state and Langfuse. Langfuse still needs its own ClickHouse, Redis/Valkey and object-storage services.

n8n 使用只供匯入的角色；報告及 checkpoint 權限留在研究服務。Research、checkpoints、n8n 內部狀態及 Langfuse 分別使用獨立資料庫與角色；Langfuse 仍需要 ClickHouse、Redis／Valkey 及物件儲存。

A vector or reranker failure may fall back to working PostgreSQL full-text search. If PostgreSQL is unavailable, both paths fail: return unavailable. Retry only a complete idempotent transaction for a transient error, with bounded backoff inside the original deadline. Never retry authorization or validation failures.

向量或重排失敗可回退可用的 PostgreSQL 全文搜尋。PostgreSQL 中斷會令兩路徑都失敗，回傳 unavailable。暫時錯誤只可在原時限內有限退避重試完整冪等 transaction；授權或驗證失敗不重試。

Use versioned SQL migrations. Pin the PostgreSQL major and pgvector extension version; keep database storage on a persistent volume or managed PostgreSQL. Back up each application/checkpoint database with pg_dump, test pg_restore into a separate database, and retain roles/configuration separately. A container restart is not a restore test.

使用版本化 SQL migration，固定 PostgreSQL 主版本及 pgvector 版本；資料放持久 volume 或託管 PostgreSQL。各 app／checkpoint 資料庫用 pg_dump 備份，pg_restore 還原至獨立資料庫實測，角色及設定另存。重啟容器不等於還原測試。

### Schema example / 資料表範例

```sql
-- Proposed finance schema; run once in an empty dedicated research database.
-- A migration role installs the extension; runtime roles do not need DDL rights.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE SCHEMA research;

CREATE TABLE research.snapshots (
  snapshot_id uuid PRIMARY KEY,
  company text NOT NULL CHECK (company IN ('MSFT', 'AAPL', 'NVDA')),
  as_of timestamptz NOT NULL,
  refreshed_at timestamptz NOT NULL,
  UNIQUE (snapshot_id, company)
);
CREATE TABLE research.evidence_chunks (
  snapshot_id uuid NOT NULL,
  chunk_id text NOT NULL,
  company text NOT NULL,
  canonical_url text NOT NULL,
  published_at timestamptz NOT NULL,
  first_seen_at timestamptz NOT NULL,
  content_hash text NOT NULL,
  excerpt text NOT NULL,
  permitted boolean NOT NULL DEFAULT false,
  search_text tsvector GENERATED ALWAYS AS
    (to_tsvector('english'::regconfig, excerpt)) STORED,
  embedding vector(384), -- 384D multilingual-e5-small candidate; pin revision/config; evaluation required
  embedding_model text,
  PRIMARY KEY (snapshot_id, chunk_id),
  FOREIGN KEY (snapshot_id, company) REFERENCES research.snapshots (snapshot_id, company),
  CHECK ((embedding IS NULL) = (embedding_model IS NULL))
);
CREATE INDEX evidence_text_gin ON research.evidence_chunks USING gin(search_text);
-- No HNSW index yet: exact filtered vector search is the first candidate.

CREATE TABLE research.runs (
  run_id uuid PRIMARY KEY,
  owner_id text NOT NULL,
  question text NOT NULL,
  horizon text NOT NULL,
  snapshot_id uuid REFERENCES research.snapshots,
  deadline timestamptz NOT NULL, -- Active segment deadline, clipped to saved remainder.
  remaining_active_ms integer NOT NULL DEFAULT 60000 CHECK (remaining_active_ms BETWEEN 0 AND 60000),
  review_mode text NOT NULL DEFAULT 'automatic' CHECK (review_mode IN ('automatic', 'review')),
  review_expires_at timestamptz, -- First pause + 15 minutes; never extend on edits/refinement.
  search_attempts integer NOT NULL DEFAULT 0 CHECK (search_attempts BETWEEN 0 AND 2),
  UNIQUE (run_id, snapshot_id)
);
CREATE TABLE research.reports (
  run_id uuid PRIMARY KEY,
  snapshot_id uuid NOT NULL,
  body jsonb NOT NULL,
  trace_url text,
  UNIQUE (run_id, snapshot_id),
  FOREIGN KEY (run_id, snapshot_id) REFERENCES research.runs (run_id, snapshot_id)
);
CREATE TABLE research.report_sources (
  run_id uuid NOT NULL,
  snapshot_id uuid NOT NULL,
  chunk_id text NOT NULL,
  PRIMARY KEY (run_id, chunk_id),
  FOREIGN KEY (run_id, snapshot_id) REFERENCES research.reports (run_id, snapshot_id),
  FOREIGN KEY (snapshot_id, chunk_id) REFERENCES research.evidence_chunks (snapshot_id, chunk_id)
);
CREATE TABLE research.feedback (
  feedback_id uuid PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES research.reports,
  correction text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- The saver owns checkpoint tables in a separate research_checkpoints database.
-- Ingestion must validate source company/time/permissions before publishing a snapshot.
-- This DDL does not implement app authorization, immutability or semantic citation validation.

```

### Retrieval query / 檢索查詢

```sql
-- Psycopg named parameters; never interpolate the question into SQL.
-- Use the same eligibility conditions for sparse and dense candidates.
WITH eligible AS (
  SELECT c.* FROM research.evidence_chunks c
  JOIN research.snapshots s USING (snapshot_id, company)
  WHERE c.snapshot_id = %(snapshot_id)s AND c.company = %(company)s
    AND c.permitted
    AND c.published_at >= %(published_after)s
    AND c.published_at <= s.as_of AND c.first_seen_at <= s.as_of
), query AS (
  SELECT websearch_to_tsquery('english', %(query)s) AS terms
)
SELECT chunk_id, excerpt, ts_rank_cd(search_text, terms) AS score
FROM eligible, query WHERE search_text @@ terms
ORDER BY score DESC, chunk_id COLLATE "C" LIMIT 20;

-- Dense candidate: reuse the exact eligible CTE above, with the same parameters.
-- The query vector must match the pinned model and dimension.
-- For the dense query, mark eligible AS MATERIALIZED to scan the filtered set exactly.
-- SELECT chunk_id, excerpt FROM eligible
-- WHERE embedding IS NOT NULL AND embedding_model = %(embedding_model)s
-- ORDER BY embedding <=> %(query_embedding)s::vector, chunk_id LIMIT 20;
-- RRF merges ranks, not incomparable text/vector score values.
-- Check the query plan with EXPLAIN before claiming a GIN or HNSW speedup.

```

### Checkpoint wiring / Checkpoint 接線

```python
# Proposed FastAPI lifespan wiring; build_graph supplies tested finance nodes.
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from app.graph import build_graph
from app.nodes import nodes  # Proposed, tested implementations of each finance node.

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncPostgresSaver.from_conn_string(
        os.environ["CHECKPOINT_DATABASE_URL"]
    ) as saver:
        # Run await saver.setup() once in the deployment migration step.
        app.state.research_graph = build_graph(nodes=nodes, checkpointer=saver)
        yield

app = FastAPI(lifespan=lifespan)
# After authenticating the owner and validating the request:
# config = {"configurable": {"thread_id": str(server_owned_run_id)}}
# result = await app.state.research_graph.ainvoke(initial_state, config)
# Failure continuation: await graph.ainvoke(None, config).
# Pending evidence-review interrupt: await graph.ainvoke(Command(resume=validated_selection), config).
# Import Command from langgraph.types. Do not use None as a review decision.
# Preserve counters and active-time remainder; only explicit review wait pauses time.
# Review expiry is absolute. Deduplicate external writes by run_id.

```
