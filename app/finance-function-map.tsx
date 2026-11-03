'use client';

import { useId, useState } from 'react';
import { type Copy, type Lang, pick } from '../lib/curriculum';
import type { FinanceApiWorkflow } from '../lib/finance-api-workflows';
import type { FinanceFunctionMap, MapStep } from '../lib/finance-function-maps';
import type { FinanceFunctionExample } from '../lib/finance-function-examples';

export type BackendLayout = 'java-python' | 'python';
export type BuildEnvironment = 'local' | 'deployed';
type Branch = 'success' | 'partial' | 'failure';

function entrySteps({ entry, backend, environment, includePython }: { entry: 'browser' | 'n8n' | 'operator'; backend: BackendLayout; environment: BuildEnvironment; includePython: boolean }): MapStep[] {
  if (environment === 'local') {
    const origin: MapStep = entry === 'browser'
      ? { id: 'entry', keyword: 'LOCAL FRONTEND', tools: 'Next.js dev · localhost:3000', action: { en: 'Open the page on your own computer. The browser sends /api requests to the same localhost:3000 origin, so your model keys stay on the backend.', zh: '在自己的電腦開啟頁面；瀏覽器把 /api 請求傳到同一 localhost:3000 來源，模型金鑰留在後端。' } }
      : entry === 'n8n'
        ? { id: 'entry', keyword: 'LOCAL EVENT TEST', tools: 'Local HTTP script · n8n when supported', action: { en: 'During development, send an authenticated sample ingestion event from a local script. Run native n8n only with a supported npm-capable release; otherwise connect real n8n in the deployment-stage Docker rehearsal.', zh: '開發時先以本機腳本傳送已驗證匯入事件；只有仍受支援的 npm 版本才直接執行 n8n，否則在部署階段的 Docker 演練接上真正 n8n。' } }
        : { id: 'entry', keyword: 'LOCAL OPERATOR', tools: 'Authenticated developer CLI', action: { en: 'Call the loopback-only operator endpoint with the required operator identity. Keep /api/internal blocked in the web proxy even on your laptop.', zh: '以所需操作人員身分呼叫只綁定本機的端點；即使在自己的電腦，網頁代理亦封鎖 /api/internal。' } };
    const localPath: MapStep[] = entry === 'browser' ? [{ id: 'local-proxy', keyword: 'DEV API PROXY', tools: 'Next.js rewrite · server-side HTTP', action: { en: 'Configure next.config.ts to forward permitted /api paths to 127.0.0.1:8080 for Java, or 127.0.0.1:8000 for Python. Preserve /api in the path and reject /api/internal. Localhost points to this computer; public DNS, Caddy and certificates arrive at deployment.', zh: '在 next.config.ts 把獲准 /api 路徑轉到 Java 的 127.0.0.1:8080 或 Python 的 127.0.0.1:8000，保留 /api 前綴並拒絕 /api/internal。localhost 指向這部電腦；公開 DNS、Caddy 及憑證在部署時加入。' } }] : [];
    const java: MapStep[] = backend === 'java-python' ? [{ id: 'java', keyword: 'JAVA API', tools: 'Spring Boot · 127.0.0.1:8080', action: { en: 'Run Spring as the selected API. Spring Security checks login and permissions; report operations stay in ReportService. Only extraction, retrieval and analysis use authenticated internal Python calls.', zh: 'Spring 是選定 API；Spring Security 核對登入及權限，財報操作在 ReportService 處理，只有擷取、檢索及分析才經驗證呼叫內部 Python。' } }] : [];
    return [origin, ...localPath, ...java, ...(includePython ? [{ id: 'python', keyword: 'PYTHON API', tools: 'FastAPI · 127.0.0.1:8000', action: { en: 'Run FastAPI with reload during development. It checks resource access and domain inputs, then calls the function below. PostgreSQL and Redis are installed locally; slow tasks run in a separate Celery process using the same Python project.', zh: '開發時以 reload 執行 FastAPI；它核對資源權限及領域輸入，再呼叫下方功能。PostgreSQL 與 Redis 在本機安裝，慢工作由共用 Python 項目的獨立 Celery 程序處理。' } }] : [])];
  }
  const origin: MapStep = entry === 'browser'
    ? { id: 'entry', keyword: 'FRONTEND', tools: 'Next.js · React', action: { en: 'Collect this function’s input and send its scoped request. Keep a visible loading and error state.', zh: '收集這項功能的輸入，傳送有範圍請求，顯示載入及錯誤狀態。' } }
    : entry === 'n8n'
      ? { id: 'entry', keyword: 'n8n TRIGGER', tools: 'n8n · service token', action: { en: 'An approved manual or scheduled workflow sends a service-authenticated event with a stable operation key.', zh: '獲准手動或排程流程傳送附服務驗證及固定操作鍵的事件。' } }
      : { id: 'entry', keyword: 'OPERATOR', tools: 'AWS IAM · Systems Manager', action: { en: 'An authorized operator uses private administration. The public gateway denies /api/internal routes.', zh: '獲准操作人員使用私人管理路徑；公開閘道拒絕 /api/internal 路由。' } };
  const transport: MapStep[] = entry === 'browser'
    ? [
      { id: 'dns', keyword: 'DNS LOOKUP', tools: 'DNS resolver · cache', action: { en: 'Resolve the domain to the server address when needed; cached DNS may be reused. DNS does not forward the application request.', zh: '需要時把網域解析為伺服器位址，可重用 DNS 快取；DNS 不轉送應用請求。' } },
      { id: 'https', keyword: 'HTTPS / CADDY', tools: 'TLS · EC2 reverse proxy', action: { en: 'Open the HTTPS connection and route the permitted API path to the backend. The frontend and API use the same origin.', zh: '建立 HTTPS 連線，把獲准 API 路徑轉送後端；前端與 API 使用同一來源。' } },
    ]
    : entry === 'n8n'
      ? [{ id: 'dns', keyword: 'SERVICE DNS', tools: 'Docker service discovery · private network', action: { en: 'Resolve the internal backend service name and call it over the configured private service connection, without passing through public Caddy routes.', zh: '解析內部後端服務名稱，經已設定私人服務連線呼叫，不經公開 Caddy 路由。' } }]
      : [{ id: 'private', keyword: 'SSM / PRIVATE', tools: 'Systems Manager · restricted administration', action: { en: 'Reach the operator endpoint through the authorized private administration path, with identity and role checks at the service.', zh: '經獲准私人管理路徑存取操作端點，服務仍核對身分及角色。' } }];
  const java: MapStep[] = backend === 'java-python' ? [{ id: 'java', keyword: 'JAVA API', tools: 'Spring Boot · Spring Security · WebClient', action: { en: 'Spring owns login, API permissions and report management. Its REST controllers and MCP adapter share report services. Delegate analysis only through authenticated private Python contracts; keep internal endpoints private.', zh: 'Spring 管登入、API 權限及財報管理，REST controller 與 MCP 介接層共用財報服務；分析才經已驗證合約交私人 Python，內部端點保持私人。' } }] : [];
  return [origin, ...transport, ...java, ...(includePython ? [{ id: 'python', keyword: 'PYTHON API', tools: 'FastAPI · Pydantic', action: { en: 'Recheck trusted identity, resource authorization and domain inputs before business processing. Return a structured rejection if these checks fail.', zh: '業務處理前重新核對可信身分、資源權限及領域輸入；檢查失敗時回傳結構化拒絕原因。' } }] : [])];
}

export function FinanceFunctionMindmap({ map, api, title, lang, backend, environment, example, modelRole }: { map: FinanceFunctionMap; api: FinanceApiWorkflow; title: Copy; lang: Lang; backend: BackendLayout; environment: BuildEnvironment; example: FinanceFunctionExample; modelRole: Copy }) {
  const [selected, setSelected] = useState('entry');
  const [branch, setBranch] = useState<Branch>('success');
  const detailId = useId();
  const isPipeline = map.kind === 'pipeline';
  const entry = map.kind === 'request' ? map.entry : 'operator';
  const reportManagement = api.kind === 'http' && ['/api/v1/documents', '/api/v1/document-versions/{versionId}/metadata', '/api/v1/documents/{documentId}/versions'].includes(api.path);
  const springReports = backend === 'java-python' && reportManagement;
  const transport = map.kind === 'request' ? entrySteps({ entry: map.entry, backend, environment, includePython: !springReports }) : [];
  const processingSteps = map.steps.map(node => ({ ...node, tools: (springReports ? node.tools.replaceAll('Pydantic', 'Jakarta Bean Validation').replaceAll('Python hashlib', 'Java MessageDigest') : node.tools).replaceAll('S3', environment === 'local' && !isPipeline ? 'Local file storage' : 'S3') }));
  const nodes = [...transport, ...processingSteps];
  const current = nodes.find(node => node.id === selected) ?? nodes[0];
  const outcomes = map.outcomes;
  const options: { id: Branch; label: Copy; text: Copy }[] = [
    { id: 'success', label: { en: 'PASS · success', zh: '通過 · 成功' }, text: outcomes.success },
  ];
  if (outcomes.kind === 'partial') options.push({ id: 'partial', label: { en: 'LIMITED · partial result', zh: '資料受限 · 部分結果' }, text: outcomes.partial });
  options.push({ id: 'failure', label: { en: 'FAIL · error result', zh: '失敗 · 錯誤結果' }, text: outcomes.failure });
  const active = options.find(option => option.id === branch) ?? options[0];
  const response = isPipeline ? (active.id === 'failure' ? 'CI state: failed / blocked' : 'CI state: completed')
    : api.kind === 'http' && api.result.kind === 'accepted'
      ? active.id === 'failure'
        ? 'Submission: HTTP 4xx / 5xx · Accepted job: status GET HTTP 200 / state failed'
        : active.id === 'partial'
          ? 'HTTP 200 · inspect persisted job/run state and available result'
          : 'HTTP 200 · job/run state: completed'
      : active.id === 'failure' ? 'HTTP 4xx / 5xx · structured error' : `HTTP ${api.kind === 'http' ? api.result.status : 200}${active.id === 'partial' ? ' · limited result' : ''}`;
  const pythonReturn = springReports ? '' : (environment === 'local' ? 'Python :8000 → ' : 'Python → ');
  const returnPath = isPipeline ? 'GitHub Actions → operator → deployment status'
    : environment === 'local' ? `${pythonReturn}${backend === 'java-python' ? 'Java :8080 → ' : ''}${entry === 'browser' ? 'Next.js :3000 → browser → user' : entry === 'n8n' ? 'local event caller → saved job → owner dashboard' : 'authenticated local operator'}`
    : entry === 'n8n' ? `${pythonReturn}${backend === 'java-python' ? 'Java → ' : ''}n8n status → saved job → owner dashboard`
      : entry === 'operator' ? `${pythonReturn}${backend === 'java-python' ? 'Java → ' : ''}private administration → operator`
        : `${pythonReturn}${backend === 'java-python' ? 'Java → ' : ''}Caddy / HTTPS → React → user`;
  const renderPath = ({ steps, label }: { steps: MapStep[]; label: string }) => <ol className="function-map-path" aria-label={label}>{steps.map((node, index) => <li key={node.id}><button type="button" aria-pressed={current.id === node.id} aria-controls={detailId} onClick={() => setSelected(node.id)}><span>{index + 1}</span><strong>{node.keyword}</strong><small>{node.tools}</small></button></li>)}</ol>;

  return <section className="function-mindmap" aria-label={`${pick(title, lang)} · ${lang === 'zh' ? '端到端心智圖' : 'end-to-end mind map'}`}>
    <div className="function-map-example"><p className="eyebrow">{lang === 'zh' ? '先看一個例子 · 虛構學習情境' : 'START WITH AN EXAMPLE · FICTIONAL LEARNING SCENARIO'}</p><h5>{pick(example.scenario, lang)}</h5><dl><div><dt>{lang === 'zh' ? '你提供甚麼' : 'What you provide'}</dt><dd>{pick(example.input, lang)}</dd></div><div><dt>{lang === 'zh' ? '你會看到甚麼' : 'What you see afterwards'}</dt><dd>{pick(example.output, lang)}</dd></div></dl></div>
    <div className="function-map-heading"><p className="eyebrow">REQUEST → PROCESS → VALIDATE → RETURN</p><h5>{lang === 'zh' ? '這項功能的端到端心智圖' : 'This function’s end-to-end mind map'}</h5><p>{lang === 'zh' ? '點選節點查看責任，選擇下方分支查看回傳結果。這是互動設計圖，不會發出請求。' : 'Select a node to inspect its responsibility, then explore a return branch below. This is an interactive design, not a live request.'}</p></div>
    {springReports && <p className="function-map-model"><b>{lang==='zh'?'Spring 財報管理端點':'Spring report-management endpoint'}</b>{lang==='zh'?'請求及財報資料由 Spring 擁有；上載／新版本之後的擷取工作才交私人 Python。標籤編輯不呼叫 Python。下方業務節點展示提交及背景處理，並非全部在同一 HTTP 請求內完成。':'Spring owns the request and report records. Uploads and new versions later delegate extraction to private Python; metadata edits do not call Python. The business nodes cover submission and background processing, rather than one synchronous HTTP request.'}</p>}
    <p className="function-map-environment">{isPipeline ? (lang === 'zh' ? '此功能在第 7 階段加入：先在本機測試 Docker，再部署 EC2。' : 'Add this function in stage 7: test Docker on your computer, then deploy to EC2.') : environment === 'local' ? (lang === 'zh' ? '開發模式：原始 PDF 經儲存介面放在 data/local；資料庫、工作程序及檢索邏輯在本機執行。Embedding／LLM API 仍需網絡及後端金鑰。' : 'Development mode: original PDFs live in data/local through the storage adapter. The database, worker and retrieval logic run locally. Embedding/LLM APIs still need internet access and a backend key.') : (lang === 'zh' ? '部署模式：相同功能以 Docker 執行，經網域與 HTTPS 存取；PDF 改用 S3，持久資料保存在 EBS。' : 'Deployment mode: the same function runs in Docker behind a domain and HTTPS; PDFs use S3 and persistent database storage uses EBS.')}</p>
    {transport.length > 0 && <div className="function-map-lane"><h6>{lang === 'zh' ? '1 · 呼叫者及連線' : '1 · Caller and connection'}</h6>{renderPath({ steps: transport, label: lang === 'zh' ? '呼叫者至後端的路徑' : 'Caller-to-backend path' })}
      <details className="function-map-early-error"><summary>{lang === 'zh' ? '連線或輸入檢查失敗時' : 'If connection or input checks fail'}</summary><p>{environment === 'local' ? (lang === 'zh' ? '先確認服務已啟動及埠號正確。連線拒絕代表沒有收到應用回應；代理亦可能回傳 502。身分、權限或輸入失敗會回傳 4xx 並停止處理。修正原因後才安全重試，避免重複寫入。' : 'First check that the process is running on the expected port. A refused connection has no application response; the proxy may return 502. Identity, permission or input checks return 4xx and stop processing. Fix the cause before a safe retry so you do not duplicate writes.') : (lang === 'zh' ? 'DNS／TLS 失敗由客戶端顯示網絡錯誤，尚未到達後端，沒有 API JSON。身分、權限或輸入失敗則由服務回傳 4xx，停止後續業務處理。不要自動重送可能重複寫入的操作。' : 'A DNS/TLS failure is a client network error: the backend was not reached, so there is no API JSON. Authentication, authorization or input rejection returns 4xx and stops business processing. Do not blindly replay operations that can duplicate writes.')}</p></details>
    </div>}
    {isPipeline && <p className="function-map-pipeline-note">{lang === 'zh' ? '由獲准操作人員觸發 GitHub Actions。此流程管理部署，不經公開 DNS、Java 或財報 API。' : 'An authorized operator triggers GitHub Actions. This is deployment control, outside the public DNS, Java and finance API request path.'}</p>}
    <div className="function-map-lane"><h6>{isPipeline ? (lang === 'zh' ? '1 · CI 執行路徑' : '1 · CI execution path') : (lang === 'zh' ? '2 · 功能處理路徑' : '2 · Function processing path')}</h6>{renderPath({ steps: processingSteps, label: lang === 'zh' ? '這項功能的處理節點' : 'Function-specific processing nodes' })}</div>
    <div className="function-map-node-detail" id={detailId} aria-live="polite"><b>{current.keyword}</b><p>{pick(current.action, lang)}</p><small>{current.tools}</small></div>
    {api.kind === 'http' && api.result.kind === 'accepted' && <aside className="function-map-async"><b>HTTP 202 · {lang === 'zh' ? '已接納，未完成' : 'accepted, unfinished'}</b><p>{lang === 'zh' ? '非同步合約：輸入驗證及持久工作建立後先回傳 202；背景工作之後完成。上圖涵蓋提交及背景處理，客戶端輪詢取得最終結果。工作接受前的拒絕為 4xx／5xx；接受後的工作失敗由狀態 GET 以 HTTP 200 回傳 failed。' : 'Asynchronous contract: after input validation and durable job creation, return 202 while the worker continues. The map covers submission and background work. Poll for the final result. Submission rejection uses 4xx/5xx; an accepted job’s failure is returned by status GET as HTTP 200 with state failed.'}</p><code>GET {api.result.poll}</code></aside>}
    <p className="function-map-ai"><b>{lang === 'zh' ? 'AI 在這裏做甚麼' : 'AI’s role here'}</b>{pick(map.aiUse, lang)}</p>
    <p className="function-map-model"><b>{lang === 'zh' ? '這項功能的模型選擇' : 'Model choice for this function'}</b>{pick(modelRole, lang)}<a href="#finance-models">{lang === 'zh' ? '查看候選模型、資格及提示分流示範' : 'Explore candidate models, eligibility and the prompt router'} →</a></p>
    <div className="function-map-validation"><span aria-hidden="true">◇</span><div><h6>VALIDATE · {lang === 'zh' ? '結果驗證' : 'result check'}</h6><p>{pick(map.validation, lang)}</p></div></div>
    <div className="function-map-branches" role="group" aria-label={lang === 'zh' ? '選擇結果分支' : 'Explore a result branch'}>{options.map(option => <button type="button" key={option.id} className={`function-map-branch ${option.id}`} aria-pressed={active.id === option.id} onClick={() => setBranch(option.id)}><b>{pick(option.label, lang)}</b><span>{pick(option.text, lang)}</span><small>↓ {lang === 'zh' ? '回傳呼叫者' : 'return to caller'}</small></button>)}</div>
    <div className={`function-map-return ${active.id}`} aria-live="polite"><p className="eyebrow">{lang === 'zh' ? '所選分支的示例回傳' : 'ILLUSTRATIVE RETURN FOR THE SELECTED BRANCH'}</p><code>{response}</code><p>{pick(active.text, lang)}</p><p className="function-map-return-path">{returnPath}</p>{entry === 'n8n' && !isPipeline && <small>{lang === 'zh' ? '事件呼叫者先儲存工作結果；使用者之後從工作狀態畫面讀取，並非把服務回應直接推送至瀏覽器。' : 'The event caller records the job result first. The user later reads saved status; this is not a direct push of the service response into the browser.'}</small>}</div>
    <details className="function-map-files"><summary>{lang === 'zh' ? '在哪些檔案開發？怎樣知道完成？' : 'Which files do I work on, and how do I check it?'}</summary><p>{lang === 'zh' ? '以下是未來財報項目的建議路徑，可對照上方檔案結構。' : 'These are proposed paths in the future finance application; match them to the folder guide above.'}</p><ul>{example.files.map(file => <li key={file}><code>{file}</code></li>)}</ul><b>{lang === 'zh' ? '完成條件' : 'Try this acceptance check'}</b><p>{pick(example.check, lang)}</p></details>
  </section>;
}
