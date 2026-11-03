import type { Copy } from './curriculum';

export type ProposalStage = {
  id: 'scope' | 'foundation' | 'slice' | 'facts' | 'workspace' | 'research' | 'automation' | 'release';
  number: number;
  hours: number;
  weeks: Copy;
  title: Copy;
  outcome: Copy;
  tasks: Copy[];
  acceptance: Copy;
  tools: string;
};

export const proposalStages = [
  {
    id: 'scope', number: 0, hours: 12,
    weeks: { en: 'Week 1', zh: '第 1 週' },
    title: { en: 'Confirm scope and sample reports', zh: '確認範圍及樣本財報' },
    outcome: { en: 'A dataset manifest, metric dictionary, checked examples and initial evaluation questions.', zh: '完成資料清單、指標字典、已核對範例及初步評估問題。' },
    tasks: [
      { en: 'Select three comparable HK-listed companies and two English text-based annual reports per company.', zh: '選擇三間可比較的香港上市公司，每間選兩份英文文字型年報。' },
      { en: 'Record source URLs, retrieval dates, fiscal periods, currencies, file hashes and document versions.', zh: '記錄來源網址、擷取日期、財政期間、貨幣、檔案雜湊及文件版本。' },
      { en: 'Inspect the statement layouts and define five metrics, their units and their reporting bases.', zh: '檢查報表版面，定義五項指標、單位及報表口徑。' },
      { en: 'Choose a canonical source version for each company-period-metric cell; retain alternative figures separately.', zh: '為每個公司、期間及指標欄位選定標準來源版本，其他版本的數值分開保留。' },
      { en: 'Prepare ten initial questions, including supported answers, missing explanations and wrong-year traps.', zh: '準備十條初步問題，包含有證據答案、缺失原因及錯誤年份情境。' },
    ],
    acceptance: { en: 'Each report has extractable text. The example value, unit and source page can be checked manually; unknown values stay explicit.', zh: '每份報告均可擷取文字；範例數值、單位及來源頁可人工核對，未知數據清楚標示。' },
    tools: 'Dataset manifest · metric dictionary · checked fixtures',
  },
  {
    id: 'foundation', number: 1, hours: 24,
    weeks: { en: 'Weeks 2 to 3', zh: '第 2 至 3 週' },
    title: { en: 'Establish the application and contracts', zh: '建立應用程式及介面合約' },
    outcome: { en: 'A reproducible frontend, API, database, storage adapter, migrations and API contract.', zh: '建立可重現啟動的前端、API、資料庫、儲存介面、遷移及 API 合約。' },
    tasks: [
      { en: 'Create the folder structure, local environment examples and health checks. Run the frontend and API directly on the computer.', zh: '建立資料夾結構、本機環境範例及健康檢查，直接在電腦啟動前端和 API。' },
      { en: 'Model documents, versions, evidence, candidates, facts, reviews, jobs, analysis runs and briefs.', zh: '設計文件、版本、證據、候選數據、正式數據、覆核、工作、分析執行及摘要模型。' },
      { en: 'Add owner authentication and read-only preview permissions; keep credentials on the server.', zh: '加入擁有者登入及唯讀預覽權限，把憑證留在伺服器。' },
      { en: 'Define request schemas, responses, errors, revision checks and job states, then generate OpenAPI documentation.', zh: '定義請求結構、回應、錯誤、版本檢查及工作狀態，再產生 OpenAPI 文件。' },
      { en: 'Build bilingual navigation, initial CI checks and the file-storage adapter.', zh: '建立雙語導覽、初步 CI 檢查及檔案儲存介面。' },
      { en: 'Install local PostgreSQL with pgvector and document loopback ports, migrations and start commands. Docker and EC2 begin in stage 7.', zh: '在本機安裝 PostgreSQL 及 pgvector，記錄本機連接埠、遷移及啟動指令；Docker 與 EC2 在第七階段才開始。' },
    ],
    acceptance: { en: 'A clean checkout starts through documented commands. The API reaches PostgreSQL, protected routes reject unauthenticated requests and no credentials enter tracked files or browser code.', zh: '全新取出的程式可按文件啟動；API 能連接 PostgreSQL，受保護路由拒絕未登入請求，憑證不進入受版本控制檔案或瀏覽器程式。' },
    tools: 'Next.js · React · TypeScript · FastAPI · Pydantic · native PostgreSQL/pgvector · Alembic · local processes',
  },
  {
    id: 'slice', number: 2, hours: 30,
    weeks: { en: 'Weeks 4 to 6', zh: '第 4 至 6 週' },
    title: { en: 'Build one complete report journey', zh: '完成一份財報的完整流程' },
    outcome: { en: 'One real upload, reviewed cash-flow values, a calculated change and clickable original evidence.', zh: '完成真實上載、現金流數值覆核、變動計算及可點選的原始證據。' },
    tasks: [
      { en: 'Validate one PDF and its confirmed metadata, calculate its hash and preserve the original.', zh: '驗證一份 PDF 及已確認標籤，計算雜湊並保留原檔。' },
      { en: 'Record a durable job, enqueue extraction and expose status for browser polling.', zh: '記錄持久工作、排程擷取，提供瀏覽器輪詢狀態。' },
      { en: 'Extract current and comparative operating-cash-flow candidates with page references.', zh: '擷取本期及比較期間的經營現金流候選數據，保留頁面參照。' },
      { en: 'Add a review form that opens the source page and accepts or corrects each candidate.', zh: '加入可開啟來源頁、接納或更正每項候選數據的覆核表單。' },
      { en: 'Check currency, scale, period and reporting basis, then calculate the change with Decimal.', zh: '檢查貨幣、單位、期間及報表口徑，再用 Decimal 計算變動。' },
      { en: 'Test repeated uploads, bounded retries and visible extraction failures before expanding the dataset.', zh: '擴大資料集前，測試重複上載、有限重試及可見的擷取失敗狀態。' },
    ],
    acceptance: { en: 'The journey works without manually inserting database rows. Duplicate upload creates no extra document, failed extraction is recoverable, and evidence opens the correct version and page. Re-estimate if parser repairs exceed the selected scope.', zh: '流程毋須人工插入資料庫記錄；重複上載不新增文件，擷取失敗可恢復，證據開啟正確版本及頁面。如解析修復超出所選範圍，重新估算。' },
    tools: 'FastAPI · pdfplumber · Celery · Redis · PostgreSQL · Python Decimal · PDF.js',
  },
  {
    id: 'facts', number: 3, hours: 42,
    weeks: { en: 'Weeks 7 to 9', zh: '第 7 至 9 週' },
    title: { en: 'Expand the library and verified facts', zh: '擴充財報資料庫及已覆核數據' },
    outcome: { en: 'Six reports, five metric definitions, reviewed fixtures, basic version links and correction history.', zh: '完成六份財報、五項指標定義、已覆核範例、基本版本連結及更正歷史。' },
    tasks: [
      { en: 'Expand extraction to the five selected metrics across six reports.', zh: '把擷取擴展至六份報告中的五項指定指標。' },
      { en: 'Add metadata editing, immutable originals, basic revision links and parser configuration records.', zh: '加入標籤編輯、不可變原檔、基本版本連結及解析設定記錄。' },
      { en: 'Store currency, scale, fiscal dates, metric definition, reporting basis, original wording and evidence with each accepted fact.', zh: '為每項接納數據儲存貨幣、單位、財政日期、指標定義、口徑、原文及證據。' },
      { en: 'Build the review queue and correction log, keeping candidates separate from accepted facts.', zh: '建立覆核佇列及更正記錄，分開候選與已接納數據。' },
      { en: 'Check up to 30 selected cells manually, record gaps and reject stale edits through expected-revision checks.', zh: '人工核對最多三十個指定欄位，記錄缺失，並以預期版本檢查拒絕過期編輯。' },
    ],
    acceptance: { en: 'Every accepted fixture matches its source and metadata. Corrections retain previous values and reviewer identity, and old citations still work after a new PDF version is stored.', zh: '每項接納範例均符合來源及標籤；更正保留舊值及覆核者身分，儲存新 PDF 版本後舊引用仍可使用。' },
    tools: 'PostgreSQL · SQLAlchemy · Pydantic · review UI · immutable file storage',
  },
  {
    id: 'workspace', number: 4, hours: 30,
    weeks: { en: 'Weeks 10 to 12', zh: '第 10 至 12 週' },
    title: { en: 'Build comparisons and workspace', zh: '建立比較功能及研究工作區' },
    outcome: { en: 'Company filters, comparison tables, trend charts, source viewing and deterministic calculation tests.', zh: '完成公司篩選、比較表格、趨勢圖、來源檢視及確定性計算測試。' },
    tasks: [
      { en: 'Add company, metric and period filters, comparison tables and trend charts.', zh: '加入公司、指標及期間篩選、比較表格與趨勢圖。' },
      { en: 'Normalize compatible scales without inventing currency exchange rates.', zh: '統一相容單位，不編造貨幣匯率。' },
      { en: 'Block incompatible periods, currencies, definitions and reporting bases, with a clear reason.', zh: '阻止不相容期間、貨幣、定義及報表口徑，清楚顯示原因。' },
      { en: 'Keep missing values distinct from zero and leave missing chart points disconnected.', zh: '分清缺失值與零，圖表缺失點不連線。' },
      { en: 'Show formulas, input fact IDs and original evidence for numerical results.', zh: '為數值結果顯示公式、輸入數據 ID 及原始證據。' },
      { en: 'For a non-positive prior value, show the absolute movement and flag the percentage instead of presenting ambiguous growth.', zh: '上期值非正數時顯示絕對變動並標示百分比問題，避免誤導的增長率。' },
    ],
    acceptance: { en: 'Arithmetic fixtures pass before display rounding. Missing values, zero or negative bases, interim-versus-annual periods and unit mismatches follow the documented result or blocking policy.', zh: '算術範例在顯示捨入前全部通過；缺失值、零或負基數、中期與全年期間及單位不符，均遵從已記錄結果或阻擋政策。' },
    tools: 'React · Plotly.js · PDF.js · FastAPI · Python Decimal · pytest',
  },
  {
    id: 'research', number: 5, hours: 48,
    weeks: { en: 'Weeks 13 to 16', zh: '第 13 至 16 週' },
    title: { en: 'Add cited research and LangGraph', zh: '加入附引用研究及 LangGraph' },
    outcome: { en: 'Bilingual cited research with saved graph state. Model routing is added design scope that needs a separate estimate beyond this original 48-hour stage.', zh: '完成雙語附引用研究及持久圖狀態；模型路由是新增設計範圍，須在原定 48 小時以外另行估算。' },
    tasks: [
      { en: 'Create passages with page and version provenance, then add filtered vector and keyword retrieval.', zh: '建立附頁面及版本來源的段落，再加入有範圍的向量及關鍵詞檢索。' },
      { en: 'Enforce company, period, version and access filters before returning evidence.', zh: '回傳證據前強制套用公司、期間、版本及存取篩選。' },
      { en: 'Implement scope, retrieve, validate, calculate, draft, verify and present as a LangGraph flow.', zh: '以 LangGraph 實作確定範圍、檢索、驗證、計算、草擬、核對及呈現流程。' },
      { en: 'Calculate numbers in code and treat report text as untrusted evidence, including embedded instructions.', zh: '以程式計算數字，把報告文字及當中的指令視為不可信證據。' },
      { en: 'Support both languages, attach evidence to material claims and distinguish reported commentary from interpretation.', zh: '支援兩種語言，為重要主張附證據，分清報告評論及程式詮釋。' },
      { en: 'Persist graph state, handle timeouts and missing evidence, and save approved examples for the read-only preview. Restrict live questions to the owner.', zh: '持久儲存圖狀態、處理逾時及證據缺失，為唯讀預覽儲存已核准範例，只有擁有者可即時提問。' },
      { en: 'Add a server-side model registry and validated prompt classifier. Use Luna for bounded language tasks, Sol for cited answers and Astra for complex evidence synthesis only when account eligibility and budget permit. SQL and Decimal tasks need no chat model.', zh: '加入後端模型清單及已驗證提示分類器；帳戶資格及預算允許時，Luna 處理有限語言工作、Sol 處理附引用答案、Astra 處理複雜證據分析。SQL 及 Decimal 工作毋須聊天模型。' },
      { en: 'Treat prompt effort as a preference. Enforce owner access, evidence, capabilities and total run budget in code. Missing evidence returns a partial answer; allow at most one paid escalation within the selected provider.', zh: '提示中的推理強度只屬偏好；以程式限制擁有者權限、證據、能力及執行總預算。缺證據時回傳部分答案；所選供應商內最多一次付費升級。' },
      { en: 'Build one eligible provider first. Evaluate DeepSeek Flash and Pro with a separate adapter before the owner enables them. Version the embedding index separately and rebuild it when the embedding model changes.', zh: '先完成一個符合使用資格的供應商；以獨立介面適配器評估 DeepSeek Flash 及 Pro，擁有者啟用後才使用。向量索引獨立版本化，更換 embedding 模型時重建。' },
    ],
    acceptance: { en: 'Wrong-company and wrong-year evidence stays out; unsupported explanations produce partial answers. Citations and saved state work. If routing is included, prompts cannot override provider, access or spending rules, and recorded node decisions explain the selected model.', zh: '排除錯公司及錯年份證據；無支持原因只提供部分答案，引用及持久狀態正常。若包含路由，提示不能更改供應商、權限或開支規則，記錄每個節點的模型選擇原因。' },
    tools: 'LangGraph · PostgreSQL checkpointer · pgvector · embeddings · Pydantic router · model registry · provider adapters · Python Decimal',
  },
  {
    id: 'automation', number: 6, hours: 24,
    weeks: { en: 'Weeks 17 to 18', zh: '第 17 至 18 週' },
    title: { en: 'Add a brief and one n8n workflow', zh: '加入研究摘要及一條 n8n 流程' },
    outcome: { en: 'A saved brief, local ingestion and replay evidence, and an n8n export when a supported native release is available.', zh: '完成已儲存摘要、本機匯入與重播證據；如有受支援本機版本，亦完成 n8n 匯出。' },
    tasks: [
      { en: 'Save an editable brief with its source run, fact IDs, citations and expected-revision checks.', zh: '儲存可編輯摘要，保留來源執行、數據 ID、引用及預期版本檢查。' },
      { en: 'Test one approved ingestion event locally. Use a supported, pinned npm-capable n8n release if available; otherwise prepare the contract with a local script and complete the n8n workflow in the stage 7 Docker rehearsal.', zh: '在本機測試一項獲准匯入事件；如有仍受支援的 npm 版本，固定 n8n 版本執行，否則先用本機腳本測試合約，再於第七階段 Docker 演練完成 n8n 流程。' },
      { en: 'Authenticate the service request and validate download destinations and redirects on the backend.', zh: '驗證服務請求身分，並由後端檢查下載目的地及重新導向。' },
      { en: 'Reuse a stable event key, create or reuse a durable job, poll status and record the terminal result.', zh: '重用固定事件鍵、建立或重用持久工作、輪詢狀態並記錄終止結果。' },
      { en: 'Demonstrate success, failure and replay, keeping credentials outside the export.', zh: '示範成功、失敗及重播，憑證不放入匯出檔。' },
    ],
    acceptance: { en: 'Edits preserve citations. Replaying an event creates one document and one logical job; changed content with the same key is rejected. Completion is recorded only after processing finishes. If native n8n is unavailable, prove this contract with a local script now and prove the actual n8n workflow in stage 7.', zh: '編輯保留引用；重播只建立一份文件及一項邏輯工作，相同鍵但不同內容則拒絕。處理完成後才記錄完成；若本機 n8n 不適用，先以腳本驗證合約，第七階段再驗證實際 n8n 流程。' },
    tools: 'React brief editor · PostgreSQL revisions · local ingestion script or pinned n8n · FastAPI · durable jobs',
  },
  {
    id: 'release', number: 7, hours: 30,
    weeks: { en: 'Weeks 19 to 20', zh: '第 19 至 20 週' },
    title: { en: 'Evaluate, deploy and prepare the portfolio', zh: '評估、部署及準備求職作品' },
    outcome: { en: 'A checked release, HTTPS EC2 deployment, runbook, backup and rollback evidence, and an interview demonstration.', zh: '完成已驗證版本、HTTPS EC2 部署、操作手冊、備份及回滾證據，以及面試示範。' },
    tasks: [
      { en: 'Freeze at least 30 evaluation cases and keep a held-out subset outside prompt tuning.', zh: '固定至少三十個評估案例，保留不參與提示調整的測試子集。' },
      { en: 'Record expected evidence, model configuration and actual case-level results.', zh: '記錄預期證據、模型設定及逐案實際結果。' },
      { en: 'For the added routing scope, evaluate enabled models against the same cases and evidence. Check missing sources, malformed routing output, provider outages and exhausted budgets. Record the added effort separately from the original stage allocation.', zh: '新增路由範圍須以相同案例及證據評估已啟用模型，檢查缺來源、路由格式錯誤、供應商中斷及預算用盡；額外工時與原階段預算分開記錄。' },
      { en: 'Add trace IDs, usage, timings and failures; show cost as unknown when pricing records are unavailable.', zh: '加入追蹤 ID、用量、時間及失敗記錄；缺少價格記錄時成本顯示未知。' },
      { en: 'Add Dockerfiles and Compose now. Run the containers locally and repeat upload, research, failure and restart checks before provisioning EC2.', zh: '在此階段加入 Dockerfile 及 Compose；先在本機容器重測上載、研究、失敗和重啟，再建立 EC2。' },
      { en: 'Complete the real n8n workflow during the local Docker rehearsal if stage 6 used a script because a supported native release was unavailable.', zh: '若第六階段因缺少受支援本機版本而用腳本測試，在本機 Docker 演練完成實際 n8n 流程。' },
      { en: 'Deploy tested images to EC2 with Docker Compose, HTTPS, protected owner actions and a read-only preview.', zh: '以 Docker Compose 把已測試映像部署至 EC2，加入 HTTPS、擁有者權限及唯讀預覽。' },
      { en: 'Verify persistent storage, backup restore, health checks and schema-compatible image rollback.', zh: '驗證持久儲存、備份還原、健康檢查及資料結構相容的映像回滾。' },
      { en: 'Prepare the README, architecture, API contract, evaluation report, limitations and a short video.', zh: '準備 README、架構、API 合約、評估報告、限制及短片。' },
    ],
    acceptance: { en: 'Another developer can reproduce the checked journey from the README. Release checks pass, and the video shows both a supported answer and a partial answer caused by missing evidence.', zh: '另一位開發者可按 README 重現已核對流程；發佈檢查通過，短片展示有證據答案及證據不足時的部分答案。' },
    tools: 'pytest · Playwright · Langfuse · GitHub Actions · ECR · EC2 · Docker Compose · Caddy · S3',
  },
] satisfies ProposalStage[];

type DeploymentStep = { title: Copy; action: Copy; tools: string };

export const proposalDeploymentSteps = [
  {
    title: { en: 'Provision the AWS resources', zh: '建立 AWS 資源' },
    action: { en: 'Create EC2, the security group, encrypted EBS, private S3 buckets, ECR repositories and scoped IAM roles. Record the region and resource IDs.', zh: '建立 EC2、安全群組、加密 EBS、私人 S3 儲存桶、ECR 儲存庫及限定 IAM 角色，記錄區域及資源 ID。' },
    tools: 'EC2 · VPC · EBS · S3 · ECR · IAM',
  },
  {
    title: { en: 'Prepare Docker and persistent storage', zh: '準備 Docker 及持久儲存' },
    action: { en: 'Install official packages and configure SSM access. Mount EBS at /srv/finance-data and gate Docker daemon startup on the verified mount, so restart policies cannot start containers on an empty root-disk directory.', zh: '安裝官方套件及設定 SSM，把 EBS 掛載於 /srv/finance-data。Docker daemon 必須先確認掛載才可啟動，避免重啟政策令容器使用根磁碟的空目錄。' },
    tools: 'Docker Engine · Compose · systemd · EBS · Systems Manager',
  },
  {
    title: { en: 'Connect the domain and HTTPS gateway', zh: '連接網域及 HTTPS 閘道' },
    action: { en: 'Point the domain to EC2 and configure Caddy with persistent certificates. Publish only ports 80 and 443; deny /api/internal paths before proxying permitted API routes.', zh: '把網域指向 EC2，設定 Caddy 及持久憑證。只公開 80 及 443 連接埠；轉送獲准 API 路由前先拒絕 /api/internal 路徑。' },
    tools: 'DNS · Caddy · TLS · security group',
  },
  {
    title: { en: 'Load protected runtime configuration', zh: '載入受保護執行設定' },
    action: { en: 'Fetch secrets into protected files and mount them only into consuming services. Use the EC2 role for temporary AWS credentials, verify container access, and retain the n8n encryption key for recovery.', zh: '把機密載入受保護檔案，只掛載至需要的服務。透過 EC2 角色取得臨時 AWS 憑證、驗證容器存取，並保留 n8n 加密鍵供還原。' },
    tools: 'IAM role · IMDSv2 · Secrets Manager or SSM parameters · Compose secrets',
  },
  {
    title: { en: 'Build and pull an immutable release', zh: '建立及拉取不可變發佈版本' },
    action: { en: 'Run CI checks and evaluation, build web and backend images for EC2, then publish commit tags and record digests. Use GitHub OIDC for ECR publication and pull the tested release through SSM administration.', zh: '執行 CI 及評估，為 EC2 建立前端及後端映像，發佈提交標籤並記錄摘要。以 GitHub OIDC 發佈至 ECR，再經 SSM 操作拉取已測試版本。' },
    tools: 'GitHub Actions · OIDC · Docker · ECR · release manifest · SSM',
  },
  {
    title: { en: 'Check readiness and migrate the schema', zh: '檢查就緒狀態及遷移資料結構' },
    action: { en: 'On first install, wait for PostgreSQL and Redis health checks before migrations. For updates, pause writes and ingestion, drain workers and take a verified backup before running the one-shot migration service.', zh: '首次安裝先等待 PostgreSQL 及 Redis 健康檢查通過，再執行遷移。更新時先暫停寫入及匯入、等待背景工作結束，並在一次性遷移服務前完成已驗證備份。' },
    tools: 'Compose --wait · PostgreSQL · Redis · Alembic · migrate service',
  },
  {
    title: { en: 'Start services and seed the demonstration', zh: '啟動服務及載入示範資料' },
    action: { en: 'Start API, worker, web, gateway and n8n. Create the owner securely, load the checked examples, import the credential-free workflow and configure its credentials privately.', zh: '啟動 API、背景工作、前端、閘道及 n8n。安全建立擁有者、載入已核對範例、匯入無憑證流程，再私下設定憑證。' },
    tools: 'Docker Compose · owner setup · dataset seed · n8n',
  },
  {
    title: { en: 'Prove the hosted journeys and persistence', zh: '驗證已部署流程及資料持久性' },
    action: { en: 'Check HTTPS, owner actions, read-only preview, authorized PDF evidence and replayed jobs. Recreate containers and reboot EC2; verify data survives and a missing EBS mount prevents startup.', zh: '檢查 HTTPS、擁有者操作、唯讀預覽、獲准 PDF 證據及工作重播。重建容器及重啟 EC2，確認資料仍存在，並驗證 EBS 掛載缺失時會阻止啟動。' },
    tools: 'Readiness endpoint · smoke checks · Playwright · EC2 reboot checks',
  },
  {
    title: { en: 'Verify backups, rollback and monitoring', zh: '驗證備份、回滾及監察' },
    action: { en: 'Schedule encrypted off-host backups and restore onto a separate target, including roles, pgvector and the n8n key. Test rollback with a compatible schema and configure log retention, health and spending alerts.', zh: '排程加密異地主機備份，於獨立目標還原角色、pgvector 及 n8n 加密鍵。測試相容資料結構下的回滾，設定日誌保留期、健康及開支警報。' },
    tools: 'PostgreSQL dumps · S3 backups · image digests · monitoring · spending alerts',
  },
] satisfies DeploymentStep[];

type ProposalService = { name: string; role: Copy; exposure: Copy; storage: Copy };

export const proposalServices = [
  {
    name: 'gateway',
    role: { en: 'Caddy reverse proxy and HTTPS certificates', zh: 'Caddy 反向代理及 HTTPS 憑證' },
    exposure: { en: 'Public host ports 80 and 443', zh: '主機公開 80 及 443 連接埠' },
    storage: { en: 'Certificate state on encrypted EBS', zh: '憑證狀態存於加密 EBS' },
  },
  {
    name: 'web',
    role: { en: 'Next.js production interface', zh: 'Next.js 正式環境介面' },
    exposure: { en: 'Through Caddy only', zh: '只經 Caddy 存取' },
    storage: { en: 'No required local application state', zh: '沒有必須保留的本機應用狀態' },
  },
  {
    name: 'api',
    role: { en: 'FastAPI resource API and access checks', zh: 'FastAPI 資源 API 及權限檢查' },
    exposure: { en: 'Permitted routes through Caddy only', zh: '只有獲准路由可經 Caddy 存取' },
    storage: { en: 'PostgreSQL records; original PDFs in S3', zh: '記錄存於 PostgreSQL，PDF 原檔存於 S3' },
  },
  {
    name: 'worker',
    role: { en: 'Celery extraction and LangGraph analysis', zh: 'Celery 擷取及 LangGraph 分析' },
    exposure: { en: 'No published host port', zh: '不公開主機連接埠' },
    storage: { en: 'Jobs, facts and checkpoints in PostgreSQL', zh: '工作、數據及檢查點存於 PostgreSQL' },
  },
  {
    name: 'postgres',
    role: { en: 'Facts, vectors, checkpoints and a separate n8n database', zh: '財務數據、向量、檢查點及獨立 n8n 資料庫' },
    exposure: { en: 'No published host port', zh: '不公開主機連接埠' },
    storage: { en: 'Explicit data directory on encrypted EBS', zh: '明確指定的加密 EBS 資料目錄' },
  },
  {
    name: 'redis',
    role: { en: 'Job broker with configured persistence', zh: '附持久設定的工作訊息代理' },
    exposure: { en: 'No published host port', zh: '不公開主機連接埠' },
    storage: { en: 'Persistence on EBS; PostgreSQL remains the job ledger', zh: '持久內容存於 EBS，工作記錄仍以 PostgreSQL 為準' },
  },
  {
    name: 'n8n',
    role: { en: 'Manual or scheduled ingestion workflow', zh: '手動或排程匯入流程' },
    exposure: { en: 'Host loopback only, through an SSM tunnel', zh: '只綁定主機回環位址，經 SSM 通道存取' },
    storage: { en: 'Separate database, persisted configuration and preserved encryption key', zh: '獨立資料庫、持久設定及保留的加密鍵' },
  },
  {
    name: 'migrate',
    role: { en: 'One-shot schema migration command', zh: '一次性資料結構遷移命令' },
    exposure: { en: 'No published host port', zh: '不公開主機連接埠' },
    storage: { en: 'Schema changes and revision recorded in PostgreSQL', zh: '結構變更及版本記錄於 PostgreSQL' },
  },
] satisfies ProposalService[];

type DeliveryOption = { title: Copy; effort: Copy; scope: Copy };

export const proposalDeliveryOptions = [
  {
    title: { en: 'Portfolio release', zh: '求職作品版本' },
    effort: { en: '300 hours · target 20 weeks', zh: '300 小時 · 目標 20 週' },
    scope: { en: 'Original provisional baseline: 240 planned hours plus 60 contingency hours for one chat model and one embedding model. Add the Docker packaging allowance below. Model routing and a second-provider evaluation add stage 5 and stage 7 scope that must be estimated before revising the target.', zh: '原暫定基準為 240 小時計劃工作及 60 小時緩衝，假設一個聊天及一個 embedding 模型。另加下方 Docker 封裝預算；模型路由及第二供應商評估增加第五、七階段範圍，須先估算再修訂目標。' },
  },
  {
    title: { en: 'Local development first, Docker at deployment', zh: '先本機開發，部署時才加入 Docker' },
    effort: { en: '+12 to 24 hours · revised total 312 to 324 hours', zh: '另加 12 至 24 小時 · 修訂總數 312 至 324 小時' },
    scope: { en: 'Approximately 21 to 22 weeks at 15 hours per week. Stages 0 to 6 use native local services; stage 7 adds Dockerfiles, Compose, a local container rehearsal and EC2 deployment. The allowance covers deferred packaging integration, before any EC2 learning or Java extension.', zh: '每週 15 小時計算，約 21 至 22 週。第零至六階段使用本機服務；第七階段加入 Dockerfile、Compose、本機容器演練及 EC2 部署。此額外預算用於延後封裝的整合，不含 EC2 學習或 Java 擴展。' },
  },
  {
    title: { en: 'Full 24-function extension', zh: '完整 24 項功能擴展' },
    effort: { en: '+90 to 150 hours · +6 to 10 weeks', zh: '另加 90 至 150 小時 · 6 至 10 週' },
    scope: { en: 'Deeper revision history, authorized checkpoint approval, recovery and operator interfaces after the portfolio release. With the local-first packaging allowance: 402 to 474 hours, approximately 27 to 32 weeks, before other options. OCR and public multi-user operation remain outside scope.', zh: '首版後補全版本歷史、獲准檢查點覆核、恢復及操作人員介面。連同本機優先封裝預算共 402 至 474 小時，約 27 至 32 週，其他選項另計；不含 OCR 及公開多用戶服務。' },
  },
  {
    title: { en: 'First EC2 deployment allowance', zh: '首次 EC2 部署額外預算' },
    effort: { en: '+12 to 24 hours · about +1 to 2 weeks', zh: '另加 12 至 24 小時 · 約 1 至 2 週' },
    scope: { en: 'Add for first-time AWS, IAM, HTTPS, storage and recovery learning. This is separate from Docker packaging: local-first plus this allowance totals 324 to 348 hours, approximately 22 to 24 weeks. Do not count packaging work twice.', zh: '首次學習 AWS、IAM、HTTPS、儲存及恢復程序時另加。此項與 Docker 封裝分開；本機優先加此預算共 324 至 348 小時，約 22 至 24 週，勿重複計算封裝工時。' },
  },
  {
    title: { en: 'Optional Kubernetes learning extension', zh: '可選 Kubernetes 學習擴展' },
    effort: { en: '+25 to 45 hours · about +2 to 3 weeks', zh: '另加 25 至 45 小時 · 約 2 至 3 週' },
    scope: { en: 'Add K3s after the Compose release: Deployments, Services, Ingress, secrets, probes, persistent volumes, Jobs, CronJobs and restore checks. This is separate from the 24-function extension; one EC2 node does not provide host failover.', zh: 'Compose 版本完成後再加入 K3s，實作 Deployments、Services、Ingress、機密、探針、持久磁碟、Jobs、CronJobs 及還原檢查。此預算獨立於 24 項功能擴展；單一 EC2 節點不具主機故障轉移能力。' },
  },
] satisfies DeliveryOption[];
