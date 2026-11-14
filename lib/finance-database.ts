import type { Copy } from './curriculum';

const t = (en: string, zh: string): Copy => ({ en, zh });

export const financeDatabase = {
  title: t('PostgreSQL is the finance database', 'PostgreSQL 是金融項目的資料庫'),
  introduction: t('One PostgreSQL service holds evidence, full-text indexes, optional pgvector embeddings, reports and feedback. LangGraph uses PostgreSQL checkpoints in a separate database. The browser simulation still stores only temporary page state.', '一個 PostgreSQL 服務保存證據、全文索引、可選 pgvector 向量、報告及回饋；LangGraph 在獨立資料庫保存 PostgreSQL checkpoints。瀏覽器模擬仍只使用暫存頁面狀態。'),
  flow: ['n8n → PostgreSQL snapshot', 'Full-text default · pgvector candidate', 'Admitted hybrid → RRF → reranker', 'Optional review → selection revision → evidence gate', 'LLM → validate → PostgreSQL report'],
  responsibilities: [
    { name: 'evidence_selection_revisions (proposed extension)', detail: t('Append a selection revision bound to the authenticated owner, run/thread, snapshot and candidate revision. Save selected/highlighted/excluded IDs, system ranks, validated user order, timestamps and selection limitations; the final report references that revision. Validate snapshot membership and permissions, require highlights to be selected and exclusions to be disjoint, and atomically check the expected revision. These records never modify stored news. Persist remaining active time and an absolute review expiry alongside checkpoints; do not hold a database transaction while awaiting the user.', '選取版本以只追加紀錄綁定已驗證擁有者、run/thread、快照及候選版本，存已選／標記／排除 ID、系統排名、已驗證用戶次序、時間及限制；最終報告引用此版本。核對快照成員及權限、標記屬已選及排除不重疊，以原子操作核對預期版本。不改新聞原文；checkpoint 另存剩餘處理預算及絕對覆核期限，等待用戶時不持有 transaction。') },
    { name: 'Shared news + versioned company profiles', detail: t('Extend the evidence model with shared macro/geopolitical document versions and company-profile versions, plus explicit snapshot membership. Keep shared news tagged by topic, region and sector. A profile belongs to its company and keeps reporting/effective/review dates. Every run manifest records the selected versions. The SQL examples below demonstrate the company-news subset; shared-context membership and retrieval are part of the proposed backend extension.', '證據模型擴展共用宏觀／地緣文件版本、公司背景版本及明確快照成員關聯。共用新聞按主題、地域、行業標記；公司背景保存所屬公司及報告／生效／覆核日期。任務清單記錄選用版本。下方 SQL 範例示範公司新聞子集；共用背景成員關聯及檢索屬未來後端擴展。') },
    { name: 'snapshots + evidence_chunks', detail: t('Store dated, versioned excerpts and their source URLs. Query one pinned snapshot with company, permission, publication and first-seen filters. Freeze content after publication; permission revocations still exclude sources.', '保存有日期及版本的節錄和來源網址；查詢固定快照並檢查公司、權限、發布及首次取得時間。發布後凍結內容，撤銷權限仍須排除來源。') },
    { name: 'tsvector + GIN + ts_rank_cd', detail: t('The default sparse path is native PostgreSQL full-text search. GIN indexes lexemes and ts_rank_cd ranks matching passages by term coverage and proximity. The English configuration fits the initial English news corpus; other languages need separate evaluation.', '預設 sparse 路徑用 PostgreSQL 原生全文搜尋；GIN 索引字詞，ts_rank_cd 按詞語覆蓋及距離排序匹配段落。English 設定適用首版英文新聞；其他語言須另行評估。') },
    { name: 'pgvector → RRF → cross-encoder', detail: t('pgvector adds vector columns and distance search inside PostgreSQL. Start with exact filtered search; measure before adding HNSW. Approximate filtering can return too few rows, so evaluate recall under the same filters. Fuse 20 candidates per path to 20, rerank to 10, and pass at most 6 excerpts to the LLM.', 'pgvector 在 PostgreSQL 內加入向量欄位及距離搜尋。先用過濾後精確搜尋，量度後再加 HNSW。近似搜尋過濾後可能不足筆數，須在相同條件下評估召回。每路徑取 20、融合成 20、重排成 10，最多 6 段送 LLM。') },
    { name: 'runs + reports + report_sources + feedback', detail: t('Persist the run owner, question, active deadline and remaining budget, counters, validated report and citation links. Save a report and its source links in one transaction. Unique run IDs make retries idempotent. Feedback is a separate record and never changes frozen evidence.', '保存任務擁有者、問題、處理時限及剩餘預算、計數、已驗證報告及引用關聯。報告與來源關聯用同一 transaction 保存，唯一任務 ID 讓重試具冪等性；回饋另存，不改凍結證據。') },
    { name: 'research_checkpoints · AsyncPostgresSaver', detail: t('Use langgraph-checkpoint-postgres and a server-owned thread_id mapped to the authenticated run. Run setup once as a migration, keep the async saver open for the application lifespan, and resume with the saved counters and remaining active budget. Only explicit review wait pauses active time, with an absolute 15-minute review expiry. Checkpoints do not authorize a user or make external tool effects exactly-once.', '使用 langgraph-checkpoint-postgres，thread_id 由伺服器建立並連結已認證任務。setup 作一次性 migration；async saver 在 app 生命週期保持開啟，恢復保留計數及剩餘處理預算；只有明確覆核等待暫停計時，另有 15 分鐘絕對覆核期限。Checkpoint 不負責授權，也不能保證外部工具只執行一次。') },
  ],
  operations: [
    t('Keep DATABASE_URL and CHECKPOINT_DATABASE_URL server-side. Use Psycopg 3 with bounded pools, parameterized SQL and short transactions. Set statement and pool timeouts within the remaining run deadline; never hold a transaction open while waiting for an LLM or news API.', 'DATABASE_URL 及 CHECKPOINT_DATABASE_URL 只留伺服器。用 Psycopg 3、有上限連線池、參數化 SQL 及短 transaction；SQL 和連線池 timeout 不超出任務剩餘時限，等 LLM 或新聞 API 時不保持 transaction。'),
    t('Give n8n an ingestion-only role; keep report and checkpoint access in the research service. Use separate databases and roles for research, checkpoints, n8n internal state and Langfuse. Langfuse still needs its own ClickHouse, Redis/Valkey and object-storage services.', 'n8n 使用只供匯入的角色；報告及 checkpoint 權限留在研究服務。Research、checkpoints、n8n 內部狀態及 Langfuse 分別使用獨立資料庫與角色；Langfuse 仍需要 ClickHouse、Redis／Valkey 及物件儲存。'),
    t('A vector or reranker failure may fall back to working PostgreSQL full-text search. If PostgreSQL is unavailable, both paths fail: return unavailable. Retry only a complete idempotent transaction for a transient error, with bounded backoff inside the original deadline. Never retry authorization or validation failures.', '向量或重排失敗可回退可用的 PostgreSQL 全文搜尋。PostgreSQL 中斷會令兩路徑都失敗，回傳 unavailable。暫時錯誤只可在原時限內有限退避重試完整冪等 transaction；授權或驗證失敗不重試。'),
    t('Use versioned SQL migrations. Pin the PostgreSQL major and pgvector extension version; keep database storage on a persistent volume or managed PostgreSQL. Back up each application/checkpoint database with pg_dump, test pg_restore into a separate database, and retain roles/configuration separately. A container restart is not a restore test.', '使用版本化 SQL migration，固定 PostgreSQL 主版本及 pgvector 版本；資料放持久 volume 或託管 PostgreSQL。各 app／checkpoint 資料庫用 pg_dump 備份，pg_restore 還原至獨立資料庫實測，角色及設定另存。重啟容器不等於還原測試。'),
  ],
};

export const financePostgresSchema = `-- Proposed finance schema; run once in an empty dedicated research database.
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
`;

export const financePostgresQuery = `-- Psycopg named parameters; never interpolate the question into SQL.
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
`;

export const financePostgresCheckpoint = `# Proposed FastAPI lifespan wiring; build_graph supplies tested finance nodes.
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
`;
