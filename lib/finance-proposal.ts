import type { Copy } from './curriculum';

export const financePlan = {
  weeklyHours: 15, hoursMin: 120, hoursMax: 180, weeksMin: 8, weeksMax: 12,
  contingencyHours: 60, difficulty: '7–8 / 10',
  assumption: {
    en: 'Provisional estimate for one developer adding per-prompt n8n MCP news, measured hybrid RAG, self-hosted Langfuse and LangSmith. Re-estimate after the first live news-and-trace slice; Python learning, provider licensing and infrastructure may extend it. This remains an interview research app.',
    zh: '暫估一位開發者加入每題 n8n MCP 新聞、量度混合 RAG、自架 Langfuse 及 LangSmith。首條真實新聞與追蹤流程完成後重估；Python 學習、供應商授權及基建可能延長時間。目標仍是面試研究 app。',
  },
};
export const financeRuntimeLimits = { newsRefreshes: 1, searchRounds: 2, sourceReads: 6, llmCalls: 3, timeoutSeconds: 60 };

export const financeLocalCommands = `# Proposed application repository, after its scaffold exists.
# These commands do not start finance services in this academy repository.
# Configure private n8n MCP and approved news-provider credentials first.
# Start pinned Qdrant (candidate), OTel Collector and the official Langfuse stack
# separately; configure LangSmith server credentials. Dependencies may use Docker.
# Keep retrieval_mode=sparse until real-news evaluation and safety gates pass.

# Terminal 1: Python API on loopback
cd services/research
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
# Copy .env.example to .env.local; set the chosen provider key locally.
# Keep .env.local out of Git. The scaffold must load it server-side.
python -m app.ingest --manifest ../../data/manifest.json
python -m uvicorn app.main:app --env-file .env.local --host 127.0.0.1 --port 8000

# Terminal 2: Next.js UI
cd apps/web
npm ci
RESEARCH_API_URL=http://127.0.0.1:8000 npm run dev -- --hostname 127.0.0.1 --port 3000

# Terminal 3: verify before recording
cd services/research
source .venv/bin/activate
python -m pytest
python -m app.evaluate --golden ../../evals/golden.json --injections ../../evals/injections.json --policy ../../evals/retrieval-policy.json`;

export const financeComposeDesign = `# Proposed app-only deploy/compose.yaml; NOT the full infrastructure stack.
# Provision n8n, Qdrant, OTel Collector and the official Langfuse stack separately.
# Langfuse needs web/worker, PostgreSQL, ClickHouse, Redis/Valkey and object storage.
# Set private service URLs and LangSmith credentials in research.env.
# Copy deploy/research.env.example to deploy/research.env and set server secrets.
# Both container processes bind to 0.0.0.0 inside their private network.
# docker compose -f deploy/compose.yaml up -d --build
services:
  web:
    build: ../apps/web
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      RESEARCH_API_URL: http://research:8000
    depends_on:
      - research
    restart: unless-stopped
  research:
    build: ../services/research
    env_file: research.env
    environment:
      DATA_DIR: /data
    volumes:
      - research-data:/data
    restart: unless-stopped
volumes:
  research-data:`;

export const financeDeploymentNotes: Copy[] = [
  { en: 'Run Next.js and FastAPI natively first. Local n8n, Qdrant and self-hosted Langfuse dependencies may use their pinned official containers immediately; package the app after its checks pass.', zh: 'Next.js 與 FastAPI 先用本機程序；n8n、Qdrant 及自架 Langfuse 依賴可即時用固定版本官方容器。App 通過檢查後才包裝。' },
  { en: 'In containers, the Next.js server forwards requests to http://research:8000. A browser cannot resolve the Compose service name. Provider keys stay in Python.', zh: '容器內由 Next.js 伺服器轉送至 http://research:8000。瀏覽器不能解析 Compose 服務名稱；供應商金鑰只留在 Python。' },
  { en: 'On EC2, start the same images privately and verify health, the four scenarios and a restart. Use an access-controlled TLS tunnel for an interview, or add an HTTPS reverse proxy, access control and usage limits before public access.', zh: 'EC2 先以私人方式啟動相同映像，檢查健康狀態、四個情境及重啟。面試可用有訪問控制的 TLS 隧道；公開前須加入 HTTPS 反向代理、訪問控制及用量限制。' },
  { en: 'The example binds the web port to loopback and does not expose port 8000. Restrict SSH to the operator. DNS is needed only for an optional public hostname; it resolves names and does not process report data.', zh: '範例只將網站連接埠綁定 loopback，不公開 8000。SSH 限制指定操作者；只有使用公開網域時才需要 DNS，DNS 解析名稱而不處理報告資料。' },
  { en: 'Keep SQLite checkpoints and reports on the persistent volume. Back up with the SQLite backup mechanism and prove a restore. Keep the previous image tag for rollback without deleting the volume.', zh: 'SQLite checkpoint 及報告放在持久磁碟。用 SQLite 備份機制備份並實測還原；保留舊映像標籤供回退，勿刪持久磁碟。' },
  { en: 'A restart policy is not a backup, access-control system or availability guarantee. Keep the first deployment small; Kubernetes is deferred.', zh: '重啟策略不等於備份、權限系統或可用性保證。首個部署保持簡單；Kubernetes 延後。' },
];
export const financeInterviewCases: Copy[] = [
  { en: 'Supported report: every material fact links to an allowed source and its publication date.', zh: '正常報告：每個重要事實都有允許使用的來源及發布時間。' },
  { en: 'Insufficient evidence: use at most one additional search and return no rating when evidence remains inadequate.', zh: '資料不足：最多補查一次；仍不足就不輸出評級。' },
  { en: 'Injected article: ignore instructions inside retrieved content, preserve legitimate evidence and record the blocked instruction.', zh: '惡意文章：忽略檢索內容內的指令，保留有效證據並記錄被阻擋的指令。' },
  { en: 'Interrupted research: resume the correct run from a checkpoint without repeating the completed search.', zh: '研究中斷：由正確任務的 checkpoint 恢復，不重複已完成的搜尋。' },
];
