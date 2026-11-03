import type { Copy } from './curriculum';

export const financeBuildPhases = [
  { label: '01 · LOCAL', title: { en: 'Start the services on your computer', zh: '先在你的電腦啟動服務' }, detail: { en: 'Stage 1: run the web app, Python API and PostgreSQL as native processes. Add the worker and Redis when extraction needs background jobs.', zh: '第 1 階段：以本機程式執行網頁、Python API 及 PostgreSQL。擷取需要背景工作時，再加入 worker 及 Redis。' } },
  { label: '02 · FEATURES', title: { en: 'Complete and check the user journeys', zh: '完成及核對使用者流程' }, detail: { en: 'Stages 2–6: upload, review, compare and ask questions locally. Save reproducible examples and test failures as well as successful results.', zh: '第 2–6 階段：在本機上載、覆核、比較及提問。保留可重現範例，同時測試失敗與成功結果。' } },
  { label: '03 · DOCKER', title: { en: 'Package the working app', zh: '把已運作的應用打包' }, detail: { en: 'Start stage 7 by writing Dockerfiles and Compose configuration. Run the containers on your computer and repeat the same checked journeys, including the real n8n workflow.', zh: '第 7 階段先編寫 Dockerfile 及 Compose 設定。在電腦執行容器，重做相同驗證流程，包括真實 n8n 工作流程。' } },
  { label: '04 · EC2', title: { en: 'Deploy the tested images', zh: '部署已測試的映像' }, detail: { en: 'Continue stage 7: publish images, deploy to EC2, connect the domain and HTTPS, then verify permissions, persistent data, backups and recovery.', zh: '繼續第 7 階段：發佈映像、部署 EC2、連接網域及 HTTPS，再驗證權限、持久資料、備份及恢復。' } },
] satisfies { label: string; title: Copy; detail: Copy }[];

export const financeLocalProcesses = [
  { name: 'Next.js / React', address: '127.0.0.1:3000', when: { en: 'Stage 1', zh: '第 1 階段' }, role: { en: 'The page you open in the browser. Forms send relative /api requests to this same origin; the Next.js server forwards allowed paths to the selected backend.', zh: '這是瀏覽器開啟的網頁。表單把相對 /api 請求送到相同來源，再由 Next.js 伺服器轉送獲准路徑到所選後端。' } },
  { name: 'FastAPI / Python', address: '127.0.0.1:8000', when: { en: 'Stage 1', zh: '第 1 階段' }, role: { en: 'Checks identity, inputs and resource access; manages documents, facts and jobs. It connects to storage and the database, and returns JSON to the caller.', zh: '核對身分、輸入及資源權限，管理文件、數據及工作；連接儲存與資料庫，向呼叫者回傳 JSON。' } },
  { name: 'Spring Boot / Java', address: '127.0.0.1:8080', when: { en: 'Optional extra service', zh: '可選額外服務' }, role: { en: 'If you choose the Java variant, Next.js calls Java first. Java validates the contract and forwards to Python. Scope and estimate this extra service separately.', zh: '選用 Java 版本時，Next.js 先呼叫 Java，再由 Java 驗證合約及轉送 Python。這項額外服務須獨立規劃及估算。' } },
  { name: 'PostgreSQL + pgvector', address: '127.0.0.1:5432', when: { en: 'Database in stage 1; vectors in stage 5', zh: '第 1 階段資料庫；第 5 階段向量' }, role: { en: 'One database stores facts, evidence, jobs and checkpoints. The pgvector extension adds similarity search for passages; it is not a second database server.', zh: '同一資料庫儲存數據、證據、工作及檢查點。pgvector 擴充功能加入段落相似度搜尋，毋須另建資料庫伺服器。' } },
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
│   │   │   ├── api/{documents,facts,research,comparisons,
│   │   │   │        briefs,ingestion,operations}.py
│   │   │   ├── schemas.py
│   │   │   ├── domain/{calculations,reviews}.py
│   │   │   ├── storage.py
│   │   │   ├── retrieval.py
│   │   │   ├── agents/graph.py
│   │   │   ├── llm/{registry,router,providers}.py
│   │   │   ├── jobs/tasks.py
│   │   │   └── db/models.py
│   │   ├── alembic.ini
│   │   ├── migrations/
│   │   └── Dockerfile                     [stage 7]
│   └── java-api/                          [optional]
│       ├── pom.xml
│       ├── src/main/java/hk/finance/
│       │   ├── ApiApplication.java
│       │   ├── config/SecurityConfig.java
│       │   ├── controller/FinanceController.java
│       │   └── client/FinanceClient.java
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
  { path: 'apps/web/', purpose: { en: 'Everything the user sees and clicks', zh: '使用者看到及點選的介面' }, detail: { en: 'app/ contains route pages. components/ holds reusable forms, tables and evidence viewers. lib/api-client.ts sends typed requests. next.config.ts forwards permitted /api paths to the configured backend.', zh: 'app/ 放路由頁面；components/ 放可重用表單、表格及證據檢視器；lib/api-client.ts 傳送有型別請求；next.config.ts 把獲准 /api 路徑轉送至設定後端。' }, example: { en: 'To show an upload progress bar, edit the reports page and a shared progress component. Read the persisted job status from the API.', zh: '加入上載進度時，修改 reports 頁面及共用進度元件，從 API 讀取已儲存工作狀態。' } },
  { path: 'services/finance/app/api/ + schemas.py', purpose: { en: 'The boundary where a request enters', zh: '請求進入系統的邊界' }, detail: { en: 'main.py registers routes. Each API module owns a resource group; schemas.py defines accepted fields and response shapes. Check identity, resource access and input before calling business code.', zh: 'main.py 註冊路由；各 API 模組管理一組資源；schemas.py 定義可接受欄位及回應結構。呼叫業務程式前先檢查身分、資源權限及輸入。' }, example: { en: 'To reject a non-PDF upload, define its request rules here and return a clear error. Keep PDF extraction in the background task.', zh: '要拒絕非 PDF 上載，在此定義請求規則並回傳清楚錯誤；PDF 擷取由背景工作處理。' } },
  { path: 'services/finance/app/domain/ + db/ + migrations/', purpose: { en: 'Financial rules and durable records', zh: '財務規則及持久記錄' }, detail: { en: 'calculations.py owns Decimal arithmetic and compatibility rules. reviews.py controls candidate approval. db/models.py describes stored records. migrations/ changes the schema in a recorded order.', zh: 'calculations.py 管理 Decimal 算術及相容規則；reviews.py 控制候選數據覆核；db/models.py 定義儲存記錄；migrations/ 按記錄次序更改資料結構。' }, example: { en: 'To prevent a wrong growth percentage when the prior value is zero, add the policy to calculations.py and check it with a small known-value test.', zh: '避免上期為零時出現錯誤增長率，在 calculations.py 加入處理政策，再以已知數值測試。' } },
  { path: 'services/finance/app/storage.py + jobs/tasks.py', purpose: { en: 'Original files and slow background work', zh: '原始檔案及較慢的背景工作' }, detail: { en: 'storage.py hides local-file versus S3 access behind one interface. jobs/tasks.py runs extraction and analysis outside the HTTP request. API and worker use the same Python project and domain code.', zh: 'storage.py 以同一介面處理本機檔案及 S3；jobs/tasks.py 在 HTTP 請求之外執行擷取及分析。API 與 worker 使用同一 Python 專案及業務程式。' }, example: { en: 'To retry extraction safely, reuse the job identity, record the attempt and preserve the original file. Show the saved state in the browser.', zh: '安全重試擷取時，重用工作識別、記錄嘗試並保留原檔，再於瀏覽器顯示已儲存狀態。' } },
  { path: 'services/finance/app/retrieval.py + agents/graph.py', purpose: { en: 'Find evidence, then coordinate an answer', zh: '搜尋證據，再協調答案流程' }, detail: { en: 'retrieval.py filters passages by company, year, version and access before ranking them. graph.py defines allowed analysis steps, saved state, model calls and verification. Provider keys stay server-side.', zh: 'retrieval.py 先按公司、年份、版本及權限篩選段落，再排序；graph.py 定義獲准分析步驟、已儲存狀態、模型呼叫及驗證。供應商密鑰留在伺服器。' }, example: { en: 'To answer “why did cash flow fall?”, retrieve the matching report passages, calculate the change in code, draft from those sources and check each claim before returning it.', zh: '回答「現金流為何下跌」時，先檢索相符報告段落、以程式計算變動、依來源草擬，再核對每項主張後回傳。' } },
  { path: 'services/finance/app/llm/ + config/models.yaml', purpose: { en: 'Model choices and provider boundaries', zh: '模型選擇及供應商邊界' }, detail: { en: 'registry.py reads approved models and capabilities; router.py enforces task, evidence and budget policy; providers.py maps each API separately. Version the classifier prompt in prompts/router.md and test routes in evals/routing.json.', zh: 'registry.py 讀取獲准模型及能力；router.py 執行任務、證據及預算政策；providers.py 分別處理各 API。在 prompts/router.md 管理分類提示版本，以 evals/routing.json 測試分流。' }, example: { en: 'To add DeepSeek, verify account eligibility, implement its adapter and evaluate the same report questions before enabling its model IDs. Keep API keys out of YAML and the browser.', zh: '新增 DeepSeek 時，先核對帳戶資格、實作介接層，再以相同財報題目評估，之後才啟用模型 ID。API 密鑰不能放在 YAML 或瀏覽器。' } },
  { path: 'services/java-api/ · optional', purpose: { en: 'An additional Java entry service', zh: '額外的 Java 入口服務' }, detail: { en: 'ApiApplication starts Spring Boot; SecurityConfig checks caller access; FinanceController accepts requests; FinanceClient forwards scoped calls to Python. Python still checks resource permissions.', zh: 'ApiApplication 啟動 Spring Boot；SecurityConfig 檢查呼叫者權限；FinanceController 接收請求；FinanceClient 向 Python 轉送有範圍呼叫。Python 仍檢查資源權限。' }, example: { en: 'To practise Java integration, route one upload request through Java first. Keep one authoritative finance implementation in Python.', zh: '練習 Java 整合時，先令一個上載請求經過 Java；財報規則保持由同一 Python 實作負責。' } },
  { path: 'packages/contracts/ + workflows/n8n/', purpose: { en: 'Shared request types and automation definitions', zh: '共用請求型別及自動化定義' }, detail: { en: 'Generate client types from the implemented OpenAPI contract. Store n8n workflow exports without credentials; the workflow triggers the existing ingestion API and polls job status.', zh: '從已實作 OpenAPI 合約產生客戶端型別。儲存不含憑證的 n8n 匯出；工作流程觸發現有匯入 API 並輪詢工作狀態。' }, example: { en: 'When adding a request field, update the API schema and regenerate the client types so the form and backend agree.', zh: '新增請求欄位時，修改 API 結構並重新產生客戶端型別，令表單與後端一致。' } },
  { path: 'data/ + evals/ + tests/', purpose: { en: 'Inputs and evidence that the project works', zh: '輸入資料及專案運作的證據' }, detail: { en: 'manifests/ records source links and hashes. local/ holds development files and is ignored by Git. evals/ stores manually checked questions and expected evidence. tests/ verifies APIs and browser journeys.', zh: 'manifests/ 記錄來源連結及雜湊；local/ 放開發檔案並由 Git 忽略；evals/ 放人工核對問題及預期證據；tests/ 驗證 API 與瀏覽器流程。' }, example: { en: 'Keep a known answer and a missing-evidence case. The first must cite the right page; the second must explain the gap rather than invent a cause.', zh: '保留一個已知答案及一個缺失證據案例；前者須引用正確頁面，後者須說明缺口而非編造原因。' } },
  { path: 'deploy/ + Dockerfiles + .github/workflows/', purpose: { en: 'Packaging and release, added at stage 7', zh: '第 7 階段加入打包及發佈' }, detail: { en: 'Dockerfiles package web and backend code; Compose connects the services; Caddy configures HTTPS routing on EC2. CI starts with code checks and later adds image publication. .env.example documents variable names with placeholders.', zh: 'Dockerfile 打包前後端；Compose 連接服務；Caddy 設定 EC2 的 HTTPS 路由。CI 先執行程式檢查，之後加入映像發佈；.env.example 以佔位值記錄變數名稱。' }, example: { en: 'Before deploying, run the same checked upload-to-answer journey in local containers, restart them and confirm that database records and files survive.', zh: '部署前，在本機容器重做已核對的上載至回答流程，再重啟容器，確認資料庫記錄及檔案仍存在。' } },
] satisfies { path: string; purpose: Copy; detail: Copy; example: Copy }[];

export const financeBuildTerms = [
  { name: 'EMBEDDING', meaning: { en: 'A model converts a passage or question into numbers so similar meanings can be compared. Those numbers do not prove a fact is true.', zh: '模型把段落或問題轉成數字，以比較語意相似度；這些數字不能證明事實正確。' } },
  { name: 'VECTOR DB', meaning: { en: 'Stores those numeric representations with source links and finds similar passages. Here it is PostgreSQL with pgvector.', zh: '儲存這些數字及來源連結，搜尋相似段落；此專案使用 PostgreSQL 加 pgvector。' } },
  { name: 'RAG', meaning: { en: 'Find relevant source passages and include them in the model input so the answer can use evidence from your reports.', zh: '找出相關來源段落，放進模型輸入，讓答案使用你的報告證據。' } },
  { name: 'AGENT / LANGGRAPH', meaning: { en: 'A workflow chooses the next permitted step, carries state and calls tools or a model. The diagram defines what it may do.', zh: '工作流程選擇下一個獲准步驟、保留狀態並呼叫工具或模型；流程圖定義它可以做甚麼。' } },
  { name: 'VALIDATE', meaning: { en: 'Check inputs, access, company and year, arithmetic, evidence and output shape. Ask for review or return a clear limitation when a check cannot pass.', zh: '核對輸入、權限、公司年份、算術、證據及輸出結構；不能通過時要求覆核或清楚說明限制。' } },
  { name: 'JOB / POLLING', meaning: { en: 'A long operation has a saved job ID. HTTP 202 acknowledges it; the browser checks status later. Only the recorded final state says whether it succeeded.', zh: '長時間操作有已儲存工作 ID；HTTP 202 表示接納，瀏覽器稍後查狀態。只有最終記錄才表示是否成功。' } },
] satisfies { name: string; meaning: Copy }[];
