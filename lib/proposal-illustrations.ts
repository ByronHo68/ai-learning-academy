import type { Copy } from './curriculum';

export type ProposalIllustrationData = {
  src: string;
  width: number;
  height: number;
  title: Copy;
  alt: Copy;
  caption: Copy;
  keywords: { label: string; meaning: Copy }[];
};

export const proposalIllustrations = {
  roadmap: {
    src: '/proposal-illustrations/v1/roadmap.webp', width: 1536, height: 1024,
    title: { en: 'The eight-stage project journey', zh: '八個階段的項目旅程' },
    alt: {
      en: 'An illustrated development roadmap labels eight stages: Scope, Setup, Upload, Verify, Compare, Research, Automate and Deploy. Reports become reviewed facts, cited research and a deployed portfolio application.',
      zh: '開發路線插圖標示八個階段：Scope、Setup、Upload、Verify、Compare、Research、Automate 及 Deploy。財報轉成已覆核數據、附引用研究及已部署作品。',
    },
    caption: { en: 'Build the source-to-answer journey first, then automate and release it. The stage cards below specify the tasks, hours and checks.', zh: '先建立由來源到答案的完整流程，再加入自動化及發佈。下方階段卡片列明任務、工時及驗收。' },
    keywords: [
      { label: 'SCOPE', meaning: { en: 'Choose reports, metric definitions and checked examples.', zh: '選擇財報、指標定義及已核對範例。' } },
      { label: 'SETUP', meaning: { en: 'Create the frontend, API, database and deployment foundations.', zh: '建立前端、API、資料庫及部署基礎。' } },
      { label: 'UPLOAD', meaning: { en: 'Complete one report journey with extraction, review and source viewing.', zh: '完成一份財報的上載、擷取、覆核及來源檢視流程。' } },
      { label: 'VERIFY', meaning: { en: 'Expand the dataset and approve facts with their evidence.', zh: '擴充資料集，按證據接納財務數據。' } },
      { label: 'COMPARE', meaning: { en: 'Check compatible periods and units before calculating or charting.', zh: '計算或繪圖前，核對期間及單位相容。' } },
      { label: 'RESEARCH', meaning: { en: 'Retrieve evidence and produce cited answers with LangGraph.', zh: '檢索證據，透過 LangGraph 產生附引用答案。' } },
      { label: 'AUTOMATE', meaning: { en: 'Save a brief and trigger one controlled n8n ingestion workflow.', zh: '儲存摘要，觸發一條受控 n8n 匯入流程。' } },
      { label: 'DEPLOY', meaning: { en: 'Evaluate, deploy to EC2 and prepare the interview demonstration.', zh: '完成評估、部署至 EC2，並準備面試展示。' } },
    ],
  },
  ec2: {
    src: '/proposal-illustrations/v1/ec2.webp', width: 1536, height: 1024,
    title: { en: 'How the services fit on EC2', zh: 'EC2 上的服務怎樣串連' },
    alt: {
      en: 'A labelled Docker-on-EC2 illustration connects a browser and HTTPS gateway to web, API, worker, PostgreSQL, Redis and n8n services on one host. S3 stores files outside the host, and EBS supplies attached persistent storage.',
      zh: '附標籤的 Docker 與 EC2 插圖，把瀏覽器及 HTTPS 閘道連到同一主機上的 Web、API、Worker、PostgreSQL、Redis 及 n8n。S3 在主機外儲存檔案，EBS 提供附加持久儲存。',
    },
    caption: { en: 'Docker Compose runs separate services on one EC2 host. S3 holds original PDFs; EBS preserves local data. One host does not provide automatic failover.', zh: 'Docker Compose 在一個 EC2 主機執行獨立服務。S3 保留原始 PDF，EBS 保留本機資料；單一主機不提供自動故障切換。' },
    keywords: [
      { label: 'EC2', meaning: { en: 'One virtual server hosts the Docker Compose services.', zh: '一個虛擬伺服器執行 Docker Compose 服務。' } },
      { label: 'Browser', meaning: { en: 'The visitor or owner uses the application.', zh: '訪客或擁有者使用應用程式。' } },
      { label: 'HTTPS', meaning: { en: 'Encrypt the public connection to the gateway.', zh: '加密通往閘道的公開連線。' } },
      { label: 'Caddy', meaning: { en: 'Handle TLS and proxy permitted web and API routes.', zh: '處理 TLS，轉送獲准前端及 API 路由。' } },
      { label: 'Web', meaning: { en: 'Next.js renders the interface.', zh: 'Next.js 提供使用者介面。' } },
      { label: 'API', meaning: { en: 'FastAPI checks access and manages resources.', zh: 'FastAPI 核對權限及管理資源。' } },
      { label: 'Worker', meaning: { en: 'Celery runs extraction and LangGraph analysis.', zh: 'Celery 執行擷取及 LangGraph 分析。' } },
      { label: 'PostgreSQL', meaning: { en: 'Store facts, evidence, jobs and checkpoints.', zh: '儲存數據、證據、工作及檢查點。' } },
      { label: 'Redis', meaning: { en: 'Carry queued work to the worker.', zh: '把排隊工作交予背景工作服務。' } },
      { label: 'n8n', meaning: { en: 'Trigger controlled ingestion and inspect completion.', zh: '觸發受控匯入並檢查完成狀態。' } },
      { label: 'S3', meaning: { en: 'Keep private PDFs and off-host backups.', zh: '保留私人 PDF 及異地主機備份。' } },
      { label: 'EBS', meaning: { en: 'Persist attached database and configuration data.', zh: '持久儲存附加資料庫及設定資料。' } },
    ],
  },
  release: {
    src: '/proposal-illustrations/v1/release.webp', width: 1536, height: 1024,
    title: { en: 'Release with a path back', zh: '發佈時保留回復路徑' },
    alt: {
      en: 'A labelled release sequence shows Test, Build, Push, Backup, Deploy and Verify. A conditional Rollback branch returns to the previous application image when release checks fail.',
      zh: '發佈流程插圖標示 Test、Build、Push、Backup、Deploy 及 Verify；檢查失敗時，條件式 Rollback 分支回到上一應用映像。',
    },
    caption: { en: 'Test and publish an immutable image, preserve a backup, deploy, then verify. Roll back an application image only when it is compatible with the database schema.', zh: '測試並發佈不可變映像、保留備份、部署，再驗證。應用映像必須與資料庫結構相容，才可回滾。' },
    keywords: [
      { label: 'TEST', meaning: { en: 'Run code checks, tests and the evaluation gate.', zh: '執行程式檢查、測試及評估關卡。' } },
      { label: 'BUILD', meaning: { en: 'Package the tested code into container images.', zh: '把已測試程式封裝成容器映像。' } },
      { label: 'PUSH', meaning: { en: 'Publish commit-tagged images and record digests in ECR.', zh: '把附提交標籤映像發佈至 ECR，記錄摘要。' } },
      { label: 'BACKUP', meaning: { en: 'Pause writes, drain workers and save a verified database backup.', zh: '暫停寫入、等待背景工作結束，儲存已驗證資料庫備份。' } },
      { label: 'DEPLOY', meaning: { en: 'Run migrations and start the selected release on EC2.', zh: '執行遷移，在 EC2 啟動指定版本。' } },
      { label: 'VERIFY', meaning: { en: 'Check readiness and the seeded user journey before resuming ingestion.', zh: '恢復匯入前，核對就緒狀態及預設使用流程。' } },
      { label: 'ROLLBACK', meaning: { en: 'On failure, restore a compatible prior image. A database restore is a separate recovery action.', zh: '失敗時恢復相容舊映像；資料庫還原屬另一項恢復操作。' } },
    ],
  },
} satisfies Record<'roadmap' | 'ec2' | 'release', ProposalIllustrationData>;
