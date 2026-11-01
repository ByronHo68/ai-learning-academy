'use client';

import Link from 'next/link';
import Markdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type Lang, pick } from '../lib/curriculum';
import { proposalStages, proposalDeploymentSteps, proposalServices, proposalDeliveryOptions } from '../lib/finance-proposal';
import proposalDocument from '../lib/finance-proposal-document.json';

function proposalUrl(url: string) {
  if (url === 'FINANCIAL_REPORT_PROJECT.md') return '/finance-project';
  if (url === '../lib/finance-function-workflows.ts' || url === '../lib/finance-api-workflows.ts') {
    return `https://github.com/ByronHo68/ai-learning-academy/blob/codex/rich-animated-ts/${url.slice(3)}`;
  }
  return defaultUrlTransform(url);
}

export default function FinanceProposalContent({ lang }: { lang: Lang }) {
  const plannedHours = proposalStages.reduce((total, stage) => total + stage.hours, 0);
  return <main className="utility-page finance-page proposal-page">
    <header className="utility-hero proposal-hero">
      <Link href="/finance-project" className="proposal-back">← {lang === 'zh' ? '返回財報項目指南' : 'Back to the finance project guide'}</Link>
      <p className="eyebrow">DEVELOPMENT PROPOSAL · 1 NOV 2026</p>
      <h1>{lang === 'zh' ? '由項目構想到 EC2 部署' : 'From project idea to an EC2 deployment'}</h1>
      <p>{lang === 'zh' ? '香港財報分析助手的開發提案。按一位開發者、每週 15 小時，建立可供面試展示的作品；逐階段交付、驗證，再以 Docker Compose 部署到 EC2。' : 'A development proposal for the Hong Kong Financial Report Analyst. One developer, 15 hours a week, building a job-search portfolio demo with checkable stages and Docker Compose on EC2.'}</p>
      <p className="proposal-draft">{lang === 'zh' ? '設計草稿及工時估算。此頁不會啟動雲端資源或部署服務；現有財報指南仍是離線教學。' : 'Design draft and effort estimate. This page does not provision cloud resources or deploy services; the current finance guide remains an offline learning tool.'}</p>
      <a className="proposal-download" href="/downloads/financial-report-development-proposal.md" download="FINANCIAL_REPORT_DEVELOPMENT_PROPOSAL.md">{lang === 'zh' ? '下載完整 Markdown 提案（英文）' : 'Download the full Markdown proposal'} ↓</a>
    </header>

    <nav className="finance-section-links" aria-label={lang === 'zh' ? '開發提案目錄' : 'Development proposal contents'}>
      <a href="#proposal-estimate">{lang === 'zh' ? '工期及範圍' : 'Timeline and scope'}</a>
      <a href="#proposal-stages">{lang === 'zh' ? '八個開發階段' : 'Eight development stages'}</a>
      <a href="#proposal-ec2">{lang === 'zh' ? 'EC2 架構' : 'EC2 architecture'}</a>
      <a href="#proposal-deployment">{lang === 'zh' ? '部署步驟' : 'Deployment steps'}</a>
      <a href="#proposal-spec">{lang === 'zh' ? '完整開發規格' : 'Full developer specification'}</a>
    </nav>

    <section className="finance-section" id="proposal-estimate" aria-labelledby="proposal-estimate-title">
      <div className="finance-section-heading"><p className="eyebrow">01 · THE WORKING BUDGET</p><h2 id="proposal-estimate-title">{lang === 'zh' ? '目標 20 週，預留修正時間' : 'A 20-week target with time for corrections'}</h2><p>{lang === 'zh' ? '首版規劃範圍為 18 至 22 週；這是工程估算，不是已量度的速度或交付保證。首次完成真實報告擷取後，重新估算餘下工作。' : 'Plan for 18–22 weeks for the first release. This is an engineering estimate, not a measured development speed or a delivery guarantee. Re-estimate after the first real report passes extraction checks.'}</p></div>
      <dl className="proposal-metrics"><div><dt>{lang === 'zh' ? '每週投入' : 'Weekly capacity'}</dt><dd>15 <span>{lang === 'zh' ? '小時' : 'hours'}</span></dd></div><div><dt>{lang === 'zh' ? '預計開發' : 'Planned work'}</dt><dd>{plannedHours} <span>{lang === 'zh' ? '小時' : 'hours'}</span></dd></div><div><dt>{lang === 'zh' ? '整合及修正預留' : 'Integration reserve'}</dt><dd>60 <span>{lang === 'zh' ? '小時' : 'hours'}</span></dd></div><div><dt>{lang === 'zh' ? '總預算' : 'Total effort'}</dt><dd>{plannedHours + 60} <span>{lang === 'zh' ? '小時' : 'hours'}</span></dd></div></dl>
      <p className="proposal-note">{lang === 'zh' ? '240 + 60 = 300 小時；300 ÷ 每週 15 小時 = 20 週。以下週次已包含預留時間，並非再加四週。' : '240 + 60 = 300 hours; 300 ÷ 15 hours per week = 20 weeks. The stage windows already include the reserve.'}</p>
      <div className="proposal-options">{proposalDeliveryOptions.map(option => <article key={option.title.en}><h3>{pick(option.title, lang)}</h3><p className="proposal-option-effort">{pick(option.effort, lang)}</p><p>{pick(option.scope, lang)}</p></article>)}</div>
      <div className="proposal-scope"><h3>{lang === 'zh' ? '首版保持範圍清楚' : 'Keep the first release bounded'}</h3><p>{lang === 'zh' ? '三間可比較公司、各兩個年度、六份英文文字 PDF、五項財務指標。中英雙語提問與回答；公開訪客查看預先產生的例子，只有登入擁有者能上載、編輯及發出付費模型請求。' : 'Three comparable companies, two annual periods each, six English text PDFs and five financial metrics. Support English and Traditional Chinese questions and answers. Public visitors inspect saved examples; the signed-in owner can upload, edit and submit paid model calls.'}</p><p>{lang === 'zh' ? 'OCR、自動匯率換算、預測、交易及公開多租戶服務另行規劃。首版涵蓋八個功能範疇；24 項功能的深入擴展在完整規格中列明。' : 'Scope OCR, automatic FX conversion, forecasting, trading and public multi-tenant operation separately. The portfolio covers all eight areas; the specification distinguishes limited implementations from the deeper 24-function extension.'}</p></div>
    </section>

    <section className="finance-section" id="proposal-stages" aria-labelledby="proposal-stages-title">
      <div className="finance-section-heading"><p className="eyebrow">02 · BUILD AND CHECK</p><h2 id="proposal-stages-title">{lang === 'zh' ? '每個階段都有可展示成果' : 'Every stage ends with a working result'}</h2><p>{lang === 'zh' ? '展開階段，查看開發任務、技術及驗收。第 5 至 6 週先完成一份真實報告的完整流程，第 16 週左右完成核心研究示範，再準備部署及面試材料。' : 'Expand a stage for its tasks, technology and acceptance check. Aim for one real report journey by week 5–6, the core research demo around week 16, then deployment and interview materials.'}</p></div>
      <div className="proposal-stage-list">{proposalStages.map((stage, index) => <details className="proposal-stage" id={`proposal-stage-${stage.id}`} key={stage.id} open={index === 0}>
        <summary><span className="proposal-stage-number">{String(stage.number).padStart(2, '0')}</span><span><strong>{pick(stage.title, lang)}</strong><small>{pick(stage.weeks, lang)} · {stage.hours} {lang === 'zh' ? '開發小時' : 'planned hours'}</small></span><i aria-hidden="true">+</i></summary>
        <div className="proposal-stage-body"><p className="proposal-stage-outcome">{pick(stage.outcome, lang)}</p><h4>{lang === 'zh' ? '開發任務' : 'Developer tasks'}</h4><ul>{stage.tasks.map(task => <li key={task.en}>{pick(task, lang)}</li>)}</ul><p className="proposal-stage-tools"><b>{lang === 'zh' ? '技術' : 'Tools'}</b>{stage.tools}</p><div className="proposal-stage-acceptance"><h4>{lang === 'zh' ? '通過條件' : 'Acceptance check'}</h4><p>{pick(stage.acceptance, lang)}</p></div></div>
      </details>)}</div>
    </section>

    <section className="finance-section" id="proposal-ec2" aria-labelledby="proposal-ec2-title">
      <div className="finance-section-heading"><p className="eyebrow">03 · DOCKER COMPOSE ON EC2</p><h2 id="proposal-ec2-title">{lang === 'zh' ? '一個 EC2 主機，清楚的服務分工' : 'One EC2 host with clear service boundaries'}</h2><p>{lang === 'zh' ? '以 Docker Compose 完成首版，再按需要加入 Kubernetes。以下是建議架構，不是正在運作的 AWS 資源。單一主機可接受維護停機，沒有自動故障切換。' : 'Ship the first release with Docker Compose, then add Kubernetes as a separate learning extension. This is a proposed architecture, not running AWS infrastructure. A single host accepts maintenance downtime and has no automatic failover.'}</p></div>
      <div className="proposal-architecture" role="group" aria-label={lang === 'zh' ? 'EC2 部署架構' : 'EC2 deployment architecture'}>
        <div className="proposal-traffic"><span>Browser</span><b aria-hidden="true">→</b><span>DNS + HTTPS</span><b aria-hidden="true">→</b><span>Caddy · 80 / 443</span></div>
        <div className="proposal-host"><p className="eyebrow">EC2 · DOCKER COMPOSE</p><div className="proposal-service-grid">{proposalServices.map(service => <article key={service.name}><h3>{service.name}</h3><p>{pick(service.role, lang)}</p><small>{pick(service.exposure, lang)}</small></article>)}</div></div>
        <div className="proposal-external"><p><b>S3</b>{lang === 'zh' ? '私人原始 PDF 及異地主機備份' : 'Private PDFs and off-host backups'}</p><p><b>EBS</b>{lang === 'zh' ? '加密資料、檢查點及憑證狀態' : 'Encrypted data, checkpoints and certificate state'}</p><p><b>ECR</b>{lang === 'zh' ? '按提交標記的不可變映像' : 'Immutable images tagged by commit'}</p><p><b>SSM</b>{lang === 'zh' ? '管理主機及 n8n 通道' : 'Host administration and n8n tunnel'}</p></div>
      </div>
      <p className="proposal-note">{lang === 'zh' ? 'API、背景工作及 n8n 須能對外連接獲准服務。資料庫及 Redis 不公開；Caddy 拒絕 /api/internal 路徑，後端仍保留操作人員權限檢查。' : 'The API, worker and n8n need outbound access to approved services. Keep database and Redis ports private. Caddy denies /api/internal paths, and the backend retains operator authorization.'}</p>
      <details className="proposal-storage"><summary>{lang === 'zh' ? '查看每個服務的持久儲存' : 'Inspect persistent storage for each service'}</summary><dl>{proposalServices.map(service => <div key={service.name}><dt>{service.name}</dt><dd>{pick(service.storage, lang)}</dd></div>)}</dl></details>
    </section>

    <section className="finance-section" id="proposal-deployment" aria-labelledby="proposal-deployment-title">
      <div className="finance-section-heading"><p className="eyebrow">04 · RELEASE AND RECOVER</p><h2 id="proposal-deployment-title">{lang === 'zh' ? '由映像建立走到可恢復的部署' : 'Build, release and recover'}</h2><p>{lang === 'zh' ? '第一階段先試行 EC2 路徑，第七階段驗證正式示範。完整規格第 10 節包含配置要求、指令範例、備份、還原及 K3s 擴展。' : 'Trial the EC2 path in stage 1 and verify the release in stage 7. Section 10 of the full specification includes configuration requirements, example commands, backup, restore and the K3s extension.'}</p></div>
      <ol className="proposal-deploy-list">{proposalDeploymentSteps.map((step, index) => <li key={step.title.en}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{pick(step.title, lang)}</h3><p>{pick(step.action, lang)}</p><small>{step.tools}</small></div></li>)}</ol>
      <div className="proposal-recovery"><h3>{lang === 'zh' ? '部署完成的證據' : 'What proves the deployment works'}</h3><p>{lang === 'zh' ? '測試 HTTPS、權限、重播去重、EC2 重啟後資料仍在、缺少 EBS 時 Docker 不啟動、在另一目標還原備份，以及相容資料庫版本下的映像回滾。' : 'Check HTTPS, permissions, replay deduplication, persistence after reboot, Docker refusing to start without EBS, a backup restored on a separate target and an image rollback against a compatible schema.'}</p><p>{lang === 'zh' ? '示範恢復目標：資料庫備份最多損失 24 小時資料；操作人員開始恢復後四個工作小時內完成。這些是待測目標，不是可用性承諾。' : 'Proposed recovery targets: at most 24 hours of database changes lost, and restoration within four working hours once the operator starts recovery. These are targets to test, not availability guarantees.'}</p></div>
    </section>

    <section className="finance-section" id="proposal-spec" aria-labelledby="proposal-spec-title">
      <div className="finance-section-heading"><p className="eyebrow">05 · THE COMPLETE HANDOFF</p><h2 id="proposal-spec-title">{lang === 'zh' ? '完整開發規格（英文）' : 'Full developer specification'}</h2><p>{lang === 'zh' ? '上方為雙語摘要；以下保留原始英文提案的全部十節，包括 24 項功能對照表及詳細 EC2 指令。Mermaid 架構保留為可複製原始碼。下載與此頁由同一 Markdown 文件產生。' : 'The bilingual summaries above are followed by all ten original English sections, including the 24-function coverage table and detailed EC2 commands. Mermaid diagrams remain as copyable source. The reader and download are generated from the same Markdown document.'}</p></div>
      <div className="proposal-document" lang="en">{proposalDocument.map(section => <details key={section.id} id={section.id}><summary><h3>{section.title}</h3><span aria-hidden="true">+</span></summary><div className="proposal-markdown"><Markdown remarkPlugins={[remarkGfm]} urlTransform={proposalUrl} components={{h3: ({ children }) => <h4>{children}</h4>,table: ({ children }) => <div className="proposal-markdown-table" role="region" aria-label="Specification table" tabIndex={0}><table>{children}</table></div>,pre: ({ children }) => <pre tabIndex={0}>{children}</pre>}}>{section.markdown}</Markdown></div></details>)}</div>
    </section>
  </main>;
}
