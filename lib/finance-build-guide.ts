import type { Copy } from './curriculum';

export const financeBuildPhases = [
  { label: '01 · LOCAL', title: { en: 'Start the services on your computer', zh: '先在你的電腦啟動服務' }, detail: { en: 'Stage 1: run Next.js, Spring Boot, the private Python service and PostgreSQL as native processes. Add the worker and Redis when extraction needs background jobs.', zh: '第 1 階段：以本機程式執行 Next.js、Spring Boot、私人 Python 服務及 PostgreSQL。擷取需要背景工作時，再加入 worker 及 Redis。' } },
  { label: '02 · FEATURES', title: { en: 'Complete and check the user journeys', zh: '完成及核對使用者流程' }, detail: { en: 'Stages 2–6: upload, review, compare and ask questions locally. Save reproducible examples and test failures as well as successful results.', zh: '第 2–6 階段：在本機上載、覆核、比較及提問。保留可重現範例，同時測試失敗與成功結果。' } },
  { label: '03 · DOCKER', title: { en: 'Package the working app', zh: '把已運作的應用打包' }, detail: { en: 'Start stage 7 by writing Dockerfiles and Compose configuration. Run the containers on your computer and repeat the same checked journeys, including the real n8n workflow.', zh: '第 7 階段先編寫 Dockerfile 及 Compose 設定。在電腦執行容器，重做相同驗證流程，包括真實 n8n 工作流程。' } },
  { label: '04 · EC2', title: { en: 'Deploy the tested images', zh: '部署已測試的映像' }, detail: { en: 'Continue stage 7: publish images, deploy to EC2, connect the domain and HTTPS, then verify permissions, persistent data, backups and recovery.', zh: '繼續第 7 階段：發佈映像、部署 EC2、連接網域及 HTTPS，再驗證權限、持久資料、備份及恢復。' } },
] satisfies { label: string; title: Copy; detail: Copy }[];

export const financeLocalProcesses = [
  { name: 'Next.js / React', address: '127.0.0.1:3000', when: { en: 'Stage 1', zh: '第 1 階段' }, role: { en: 'The browser interface. Forms use same-origin /api requests; Next.js forwards allowed routes to Spring Boot on port 8080. Spring owns the authenticated API contract.', zh: '這是瀏覽器介面。表單使用同來源 /api 請求，Next.js 把獲准路由交給 8080 埠的 Spring Boot；由 Spring 管理已驗證 API 合約。' } },
  { name: 'FastAPI / Python', address: '127.0.0.1:8000', when: { en: 'Stage 1', zh: '第 1 階段' }, role: { en: 'Private extraction, retrieval and analysis service. Validate service identity and trusted report scope; manage analysis facts, jobs, vectors and checkpoints. Receive immutable report references from Spring rather than owning report-management endpoints.', zh: '私人擷取、檢索及分析服務。核對服務身分及可信報告範圍，管理分析數據、工作、向量及檢查點；從 Spring 取得不可變報告參照，不管理對外財報端點。' } },
  { name: 'Spring Boot / Java', address: '127.0.0.1:8080', when: { en: 'Selected architecture · stage 1', zh: '已選架構 · 第 1 階段' }, role: { en: 'Own OIDC login integration, API permissions, report metadata and file lifecycle. Its /mcp module exposes three read-only tools on the same port. Call private Python for extraction, facts and analysis using distinct service authentication and trusted scope.', zh: '負責 OIDC 登入整合、API 權限、財報標籤及檔案生命週期；同一埠的 /mcp 模組公開三項唯讀工具。以獨立服務驗證及可信範圍，呼叫私人 Python 的擷取、數據及分析功能。' } },
  { name: 'PostgreSQL + pgvector', address: '127.0.0.1:5432', when: { en: 'Database in stage 1; vectors in stage 5', zh: '第 1 階段資料庫；第 5 階段向量' }, role: { en: 'One server uses separate reports and analysis schemas with separate write roles: Spring owns report metadata and ACLs; Python owns facts, vectors, jobs and checkpoints. Migrations have one owner per schema; pgvector adds passage similarity search.', zh: '同一伺服器使用獨立 report 與 analysis schema 及寫入角色：Spring 管財報標籤與 ACL，Python 管數據、向量、工作及檢查點。每個 schema 只有一方負責遷移；pgvector 加入段落相似搜尋。' } },
  { name: 'Redis + Celery worker', address: 'Redis: 127.0.0.1:6379', when: { en: 'Stage 2', zh: '第 2 階段' }, role: { en: 'Redis carries queued work. A separate Python worker takes a job, extracts a PDF or runs analysis, and records progress. The worker has no browser-facing HTTP port.', zh: 'Redis 傳遞排隊工作；獨立 Python worker 取得工作、擷取 PDF 或執行分析，再記錄進度。Worker 沒有供瀏覽器使用的 HTTP 連接埠。' } },
  { name: 'n8n', address: '127.0.0.1:5678 when running', when: { en: 'Contract in stage 6; Docker integration in stage 7', zh: '第 6 階段合約；第 7 階段 Docker 整合' }, role: { en: 'First test the event and status-polling contract with a local script. Run the real workflow in the deployment rehearsal. Native npm use is only an option while a pinned npm-capable release remains supported.', zh: '先用本機腳本測試事件及狀態輪詢合約，再於部署演練執行真實流程。只有固定且仍受支援、可用 npm 的版本，才考慮本機 npm 執行。' } },
] satisfies { name: string; address: string; when: Copy; role: Copy }[];

export const financeRepositoryTree = `finance-report-analyst/
├── apps/web/
│   ├── app/{reports,research,compare,workspace}/page.tsx
│   ├── components/
│   ├── lib/api-client.ts
│   ├── next.config.ts
│   └── Dockerfile                         [stage 7]
├── services/
│   ├── finance/
│   │   ├── pyproject.toml
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── api/{extraction,facts,research,comparisons,
│   │   │   │        evidence,operations}.py    [private contracts]
│   │   │   ├── schemas.py
│   │   │   ├── domain/{calculations,reviews}.py
│   │   │   ├── report_client.py             [scoped report references]
│   │   │   ├── retrieval.py
│   │   │   ├── agents/graph.py
│   │   │   ├── llm/{registry,router,providers}.py
│   │   │   ├── jobs/tasks.py
│   │   │   └── db/models.py
│   │   ├── alembic.ini
│   │   ├── migrations/
│   │   └── Dockerfile                     [stage 7]
│   └── java-api/                          [selected public API + MCP]
│       ├── pom.xml
│       ├── src/main/java/hk/finance/
│       │   ├── ApiApplication.java
│       │   ├── config/SecurityConfig.java
│       │   ├── controller/{Report,Research}Controller.java
│       │   ├── service/{Report,Finance}Service.java
│       │   ├── repository/ReportRepository.java
│       │   ├── storage/ReportStorage.java
│       │   ├── mcp/FinanceTools.java
│       │   └── client/FinanceClient.java
│       ├── src/main/resources/db/migration/ [reports schema only]
│       └── Dockerfile                     [stage 7]
├── packages/contracts/
├── workflows/n8n/
├── data/
│   ├── manifests/
│   └── local/                             [ignored by Git]
├── config/models.yaml                     [model policy; no secrets]
├── prompts/router.md
├── evals/routing.json
├── tests/
├── docs/
├── scripts/
├── deploy/                                [stage 7]
│   ├── compose.yaml
│   ├── compose.ec2.yaml
│   └── Caddyfile
├── .github/workflows/
├── .gitignore
└── .env.example`;

export const financeRepositoryFolders = [
  { path: 'apps/web/', purpose: { en: 'Everything the user sees and clicks', zh: '使用者看到及點選的介面' }, detail: { en: 'app/ contains route pages. components/ holds reusable forms, tables and evidence viewers. lib/api-client.ts sends typed requests. next.config.ts forwards permitted /api paths to Spring Boot. Browser code holds no model or service credentials.', zh: 'app/ 放路由頁面；components/ 放可重用表單、表格及證據檢視器；lib/api-client.ts 傳送有型別請求；next.config.ts 把獲准 /api 路徑交給 Spring Boot；瀏覽器不持有模型或服務憑證。' }, example: { en: 'To show an upload progress bar, edit the reports page and a shared progress component. Read the persisted job status from the API.', zh: '加入上載進度時，修改 reports 頁面及共用進度元件，從 API 讀取已儲存工作狀態。' } },
  { path: 'services/finance/app/api/ + schemas.py', purpose: { en: 'Private analysis contracts', zh: '私人分析合約' }, detail: { en: 'main.py registers private analysis routes. schemas.py defines service contracts and response shapes. Validate the calling service and trusted user/report scope; never accept identity or permissions from model-generated tool arguments.', zh: 'main.py 註冊私人分析路由；schemas.py 定義服務合約及回應。核對呼叫服務及可信使用者／財報範圍，不接受由模型工具參數提供的身分或權限。' }, example: { en: 'To reject an invalid analysis request, validate its report reference and requested operation here. Spring validates the original upload; Python runs extraction in a background task.', zh: '拒絕無效分析請求時，在此核對財報參照及操作；原始上載由 Spring 驗證，擷取由 Python 背景工作執行。' } },
  { path: 'services/finance/app/domain/ + db/ + migrations/', purpose: { en: 'Financial rules and durable records', zh: '財務規則及持久記錄' }, detail: { en: 'calculations.py owns Decimal arithmetic and compatibility rules. reviews.py controls candidate approval. db/models.py describes stored records. migrations/ changes the schema in a recorded order.', zh: 'calculations.py 管理 Decimal 算術及相容規則；reviews.py 控制候選數據覆核；db/models.py 定義儲存記錄；migrations/ 按記錄次序更改資料結構。' }, example: { en: 'To prevent a wrong growth percentage when the prior value is zero, add the policy to calculations.py and check it with a small known-value test.', zh: '避免上期為零時出現錯誤增長率，在 calculations.py 加入處理政策，再以已知數值測試。' } },
  { path: 'services/finance/app/report_client.py + jobs/tasks.py', purpose: { en: 'Scoped report access and slow background work', zh: '限定財報存取及較慢的背景工作' }, detail: { en: 'report_client.py obtains an authorized immutable report reference from Spring. Spring ReportStorage owns local-file versus S3 access. jobs/tasks.py runs extraction and analysis outside the HTTP request, using the same Python domain code.', zh: 'report_client.py 從 Spring 取得已授權不可變財報參照；本機檔案及 S3 由 Spring ReportStorage 管理。jobs/tasks.py 在 HTTP 之外以共用 Python 領域程式執行擷取及分析。' }, example: { en: 'To retry extraction safely, reuse the job identity, record the attempt and preserve the original file. Show the saved state in the browser.', zh: '安全重試擷取時，重用工作識別、記錄嘗試並保留原檔，再於瀏覽器顯示已儲存狀態。' } },
  { path: 'services/finance/app/retrieval.py + agents/graph.py', purpose: { en: 'Find evidence, then coordinate an answer', zh: '搜尋證據，再協調答案流程' }, detail: { en: 'retrieval.py filters passages by company, year, version and access before ranking them. graph.py defines allowed analysis steps, saved state, model calls and verification. Provider keys stay server-side.', zh: 'retrieval.py 先按公司、年份、版本及權限篩選段落，再排序；graph.py 定義獲准分析步驟、已儲存狀態、模型呼叫及驗證。供應商密鑰留在伺服器。' }, example: { en: 'To answer “why did cash flow fall?”, retrieve the matching report passages, calculate the change in code, draft from those sources and check each claim before returning it.', zh: '回答「現金流為何下跌」時，先檢索相符報告段落、以程式計算變動、依來源草擬，再核對每項主張後回傳。' } },
  { path: 'services/finance/app/llm/ + config/models.yaml', purpose: { en: 'Model choices and provider boundaries', zh: '模型選擇及供應商邊界' }, detail: { en: 'registry.py reads approved models and capabilities; router.py enforces task, evidence and budget policy; providers.py maps each API separately. Version the classifier prompt in prompts/router.md and test routes in evals/routing.json.', zh: 'registry.py 讀取獲准模型及能力；router.py 執行任務、證據及預算政策；providers.py 分別處理各 API。在 prompts/router.md 管理分類提示版本，以 evals/routing.json 測試分流。' }, example: { en: 'To add DeepSeek, verify account eligibility, implement its adapter and evaluate the same report questions before enabling its model IDs. Keep API keys out of YAML and the browser.', zh: '新增 DeepSeek 時，先核對帳戶資格、實作介接層，再以相同財報題目評估，之後才啟用模型 ID。API 密鑰不能放在 YAML 或瀏覽器。' } },
  { path: 'services/java-api/ · selected', purpose: { en: 'Login, report management and the MCP entry', zh: '登入、財報管理及 MCP 入口' }, detail: { en: 'SecurityConfig integrates OIDC login and OAuth access-token checks. ReportController and ReportService own report metadata, ACLs and storage. FinanceTools exposes read-only MCP tools through the same services. FinanceClient calls private Python with service identity and trusted scope. Flyway owns the reports schema.', zh: 'SecurityConfig 整合 OIDC 登入及 OAuth access token 核對；ReportController 與 ReportService 管財報標籤、ACL 及儲存。FinanceTools 透過相同服務公開唯讀 MCP 工具；FinanceClient 以服務身分及可信範圍呼叫私人 Python；Flyway 管 report schema。' }, example: { en: 'Implement one report upload in Spring and one read-only MCP evidence search. Reuse ReportService permissions and the existing Python retrieval implementation; test denial before trying an external client.', zh: '先在 Spring 實作一個財報上載及一項唯讀 MCP 證據搜尋，重用 ReportService 權限及既有 Python 檢索；外部客戶端測試前先驗證拒絕情境。' } },
  { path: 'packages/contracts/ + workflows/n8n/', purpose: { en: 'Shared request types and automation definitions', zh: '共用請求型別及自動化定義' }, detail: { en: 'Generate client types from the implemented OpenAPI contract. Store n8n workflow exports without credentials; the workflow triggers the existing ingestion API and polls job status.', zh: '從已實作 OpenAPI 合約產生客戶端型別。儲存不含憑證的 n8n 匯出；工作流程觸發現有匯入 API 並輪詢工作狀態。' }, example: { en: 'When adding a request field, update the API schema and regenerate the client types so the form and backend agree.', zh: '新增請求欄位時，修改 API 結構並重新產生客戶端型別，令表單與後端一致。' } },
  { path: 'data/ + evals/ + tests/', purpose: { en: 'Inputs and evidence that the project works', zh: '輸入資料及專案運作的證據' }, detail: { en: 'manifests/ records source links and hashes. local/ holds development files and is ignored by Git. evals/ stores manually checked questions and expected evidence. tests/ verifies APIs and browser journeys.', zh: 'manifests/ 記錄來源連結及雜湊；local/ 放開發檔案並由 Git 忽略；evals/ 放人工核對問題及預期證據；tests/ 驗證 API 與瀏覽器流程。' }, example: { en: 'Keep a known answer and a missing-evidence case. The first must cite the right page; the second must explain the gap rather than invent a cause.', zh: '保留一個已知答案及一個缺失證據案例；前者須引用正確頁面，後者須說明缺口而非編造原因。' } },
  { path: 'deploy/ + Dockerfiles + .github/workflows/', purpose: { en: 'Packaging and release, added at stage 7', zh: '第 7 階段加入打包及發佈' }, detail: { en: 'Dockerfiles package web and backend code; Compose connects the services; Caddy configures HTTPS routing on EC2. CI starts with code checks and later adds image publication. .env.example documents variable names with placeholders.', zh: 'Dockerfile 打包前後端；Compose 連接服務；Caddy 設定 EC2 的 HTTPS 路由。CI 先執行程式檢查，之後加入映像發佈；.env.example 以佔位值記錄變數名稱。' }, example: { en: 'Before deploying, run the same checked upload-to-answer journey in local containers, restart them and confirm that database records and files survive.', zh: '部署前，在本機容器重做已核對的上載至回答流程，再重啟容器，確認資料庫記錄及檔案仍存在。' } },
] satisfies { path: string; purpose: Copy; detail: Copy; example: Copy }[];

export const financeBuildTerms = [
  { name: 'EMBEDDING', meaning: { en: 'A model converts a passage or question into numbers so similar meanings can be compared. Those numbers do not prove a fact is true.', zh: '模型把段落或問題轉成數字，以比較語意相似度；這些數字不能證明事實正確。' } },
  { name: 'VECTOR DB', meaning: { en: 'Stores those numeric representations with source links and finds similar passages. Here it is PostgreSQL with pgvector.', zh: '儲存這些數字及來源連結，搜尋相似段落；此專案使用 PostgreSQL 加 pgvector。' } },
  { name: 'RAG', meaning: { en: 'Find relevant source passages and include them in the model input so the answer can use evidence from your reports.', zh: '找出相關來源段落，放進模型輸入，讓答案使用你的報告證據。' } },
  { name: 'AGENT / LANGGRAPH', meaning: { en: 'A workflow chooses the next permitted step, carries state and calls tools or a model. The diagram defines what it may do.', zh: '工作流程選擇下一個獲准步驟、保留狀態並呼叫工具或模型；流程圖定義它可以做甚麼。' } },
  { name: 'MCP / OAUTH / OIDC', meaning: { en: 'MCP connects an AI client to allowed tools; OAuth authorizes delegated tool access; OIDC identifies the signed-in user. Each still needs application permissions and prompt-injection controls.', zh: 'MCP 連接 AI 客戶端與獲准工具；OAuth 授權委派工具存取；OIDC 識別已登入使用者。三者仍須應用權限及提示注入控制。' } },
  { name: 'VALIDATE', meaning: { en: 'Check inputs, access, company and year, arithmetic, evidence and output shape. Ask for review or return a clear limitation when a check cannot pass.', zh: '核對輸入、權限、公司年份、算術、證據及輸出結構；不能通過時要求覆核或清楚說明限制。' } },
  { name: 'JOB / POLLING', meaning: { en: 'A long operation has a saved job ID. HTTP 202 acknowledges it; the browser checks status later. Only the recorded final state says whether it succeeded.', zh: '長時間操作有已儲存工作 ID；HTTP 202 表示接納，瀏覽器稍後查狀態。只有最終記錄才表示是否成功。' } },
] satisfies { name: string; meaning: Copy }[];
