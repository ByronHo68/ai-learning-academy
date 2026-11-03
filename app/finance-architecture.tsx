'use client';

import { useId, useState } from 'react';
import { type Copy, type Lang, pick } from '../lib/curriculum';
import { financeArchitectureNodes, financeMcpTools } from '../lib/finance-architecture';

type ArchitectureNodeId = keyof typeof financeArchitectureNodes;
const branches: ArchitectureNodeId[] = ['web','identity','mcp','reports','spring','python','data','guardrails','delivery'];
type EntrySource = 'web' | 'mcp';
const paths = {
  web: [
    { keyword: 'NEXT.JS', title: { en: 'Owner asks a report question', zh: '擁有者提出財報問題' }, detail: { en: 'The website uses a protected session after OIDC login; public visitors inspect saved examples.', zh: 'OIDC 登入後網站使用受保護 session；公開訪客查看已儲存範例。' } },
    { keyword: 'SPRING SECURITY', title: { en: 'Check session, role and report access', zh: '核對 session、角色及財報權限' }, detail: { en: 'Reject unauthenticated or forbidden actions before starting analysis.', zh: '分析前拒絕未登入或無權操作。' } },
    { keyword: 'SPRING SERVICES', title: { en: 'Manage reports or request research', zh: '管理財報或要求研究' }, detail: { en: 'Report CRUD ends here. An analysis request gets scoped report IDs and a durable run contract.', zh: '財報 CRUD 在此處理；分析請求附限定報告 ID 及持久執行合約。' } },
    { keyword: 'PRIVATE PYTHON', title: { en: 'Retrieve → calculate → route model → validate', zh: '檢索 → 計算 → 選模型 → 驗證' }, detail: { en: 'Use service authentication and trusted user scope. LangGraph coordinates the checked RAG flow below.', zh: '使用服務驗證及可信使用者範圍，LangGraph 協調下方已核對 RAG 流程。' } },
    { keyword: 'RETURN TO WEBSITE', title: { en: 'Cited answer, partial result or clear error', zh: '附引用答案、部分結果或清楚錯誤' }, detail: { en: 'Python records status; Spring returns the result to Next.js. Long jobs return 202 first and are polled through Spring.', zh: 'Python 記錄狀態，Spring 向 Next.js 回傳結果；長工作先回傳 202，再經 Spring 輪詢。' } },
  ],
  mcp: [
    { keyword: 'EXTERNAL AI CLIENT', title: { en: 'Request one allowed tool', zh: '請求一項獲准工具' }, detail: { en: 'The client obtains an OAuth access token for the finance MCP resource from the configured authorization server.', zh: '客戶端從已設定授權伺服器取得以財報 MCP 為資源的 OAuth access token。' } },
    { keyword: 'SPRING /mcp', title: { en: 'Validate token and required tool scope', zh: '驗證 token 及所需工具範圍' }, detail: { en: 'Check issuer, audience and expiry. Configure MCP discovery and resource metadata as part of the integration.', zh: '核對簽發者、audience 及有效期；整合時設定 MCP discovery 及 resource metadata。' } },
    { keyword: 'TOOL + REPORT POLICY', title: { en: 'Check schema, allowlist and report ACL', zh: '核對結構、工具清單及財報 ACL' }, detail: { en: 'Scopes do not grant access to every report. Derive user identity from the verified token, not tool arguments.', zh: '有 scope 不代表可存取所有財報；使用者身分取自已驗證 token，不取自工具參數。' } },
    { keyword: 'SHARED SPRING SERVICES', title: { en: 'Reuse report rules and private Python tools', zh: '重用財報規則及私人 Python 工具' }, detail: { en: 'Search, reviewed facts and evidence use existing scoped services. These three read-only tools do not trigger a paid answer-model call.', zh: '搜尋、已覆核數據及證據使用既有限定服務；這三項唯讀工具不觸發付費答案模型呼叫。' } },
    { keyword: 'MCP TOOL RESULT', title: { en: 'Return structured data to the AI client', zh: '把結構化資料回傳 AI 客戶端' }, detail: { en: 'Return source IDs and limitations. The external client may generate its own answer; its model, costs and output checks belong to that client.', zh: '回傳來源 ID 及限制；外部客戶端可自行生成答案，其模型、費用及輸出檢查由該客戶端負責。' } },
  ],
} satisfies Record<EntrySource, { keyword: string; title: Copy; detail: Copy }[]>;

export function FinanceArchitecture({ lang }: { lang: Lang }) {
  const id = useId();
  const [selected, setSelected] = useState<ArchitectureNodeId>('spring');
  const [source, setSource] = useState<EntrySource>('web');
  const active = financeArchitectureNodes[selected];
  return <section className="finance-section architecture-guide" id="finance-architecture" aria-labelledby={`${id}-title`}>
    <div className="finance-section-heading"><p className="eyebrow">SELECTED DESIGN · NEXT.JS → SPRING BOOT → PYTHON</p><h2 id={`${id}-title`}>{lang === 'zh' ? 'Java、Python 及 MCP 的分工心智圖' : 'Java, Python and MCP: the architecture mind map'}</h2><p>{lang === 'zh' ? '已選定以 Spring Boot 負責登入、API 權限及財報管理；Python 負責檢索及分析。MCP 是同一 Spring 應用的另一個入口，外部 AI 客戶端重用相同服務。這是未來財報專案的設計，尚未啟動身分服務、MCP 或雲端資源。' : 'Spring Boot owns login, API permissions and report management; Python owns retrieval and analysis. MCP is another entrance to the same Spring application, letting external AI clients reuse its services. This is a design for the future finance project; it does not start identity services, MCP endpoints or cloud resources.'}</p></div>
    <p className="architecture-map-hint">{lang === 'zh' ? '點選分支看責任及檔案。連線表示分工關係；下方另有按次序的請求流程。' : 'Select a branch to inspect its responsibility and files. Lines show relationships; the ordered request workflows follow below.'}</p>
    <div className="architecture-map" role="group" aria-label={lang === 'zh' ? '以 Spring Boot 為中心的架構心智圖' : 'Architecture mind map centered on Spring Boot'}>
      <svg className="architecture-map-lines" viewBox="0 0 900 600" preserveAspectRatio="none" aria-hidden="true"><path d="M450 300 L150 100 M450 300 L450 100 M450 300 L750 100 M450 300 L150 300 M450 300 L750 300 M450 300 L150 500 M450 300 L450 500 M450 300 L750 500"/></svg>
      {branches.map(key => { const item=financeArchitectureNodes[key]; return <button type="button" key={key} className={`architecture-map-node architecture-map-${key}`} aria-pressed={selected===key} aria-controls={`${id}-detail`} onClick={()=>setSelected(key)}><span>{item.keyword}</span><strong>{pick(item.title,lang)}</strong><small>{item.tools}</small></button>; })}
    </div>
    <div className="architecture-detail" id={`${id}-detail`} aria-live="polite"><div><p className="eyebrow">{active.keyword}</p><h3>{pick(active.title,lang)}</h3><p>{pick(active.detail,lang)}</p></div><div className="architecture-files"><b>{lang==='zh'?'建議檔案':'Proposed files'}</b>{active.files.map(file=><code key={file}>{file}</code>)}</div></div>

    <div className="architecture-workflow" id="finance-mcp-workflow"><h3>{lang==='zh'?'跟隨一次請求：網站或 MCP':'Follow a request: website or MCP'}</h3><div className="architecture-source" role="group" aria-label={lang==='zh'?'選擇請求入口':'Choose a request entrance'}><button type="button" aria-pressed={source==='web'} onClick={()=>setSource('web')}>{lang==='zh'?'網站研究流程':'Website research'}</button><button type="button" aria-pressed={source==='mcp'} onClick={()=>setSource('mcp')}>{lang==='zh'?'外部 AI · MCP 工具':'External AI · MCP tools'}</button></div><ol className="architecture-path" aria-label={lang==='zh'?'所選入口的處理次序':'Processing order for the selected entrance'}>{paths[source].map((step,index)=><li key={step.keyword}><span>{index+1}</span><div><b>{step.keyword}</b><h4>{pick(step.title,lang)}</h4><p>{pick(step.detail,lang)}</p></div></li>)}</ol><div className="architecture-denied"><b>REJECT → RETURN</b><p>{lang==='zh'?'Token／session 無效回傳 401；scope 或財報權限不足回傳 403。MCP 工具參數或執行錯誤按協定回傳結構化工具錯誤；沒有模型可提升權限。':'Invalid tokens or sessions return 401; insufficient scopes or report permissions return 403. MCP argument and execution failures use the protocol’s structured tool errors. Model output cannot grant access.'}</p></div></div>

    <details className="architecture-tools"><summary>{lang==='zh'?'首版三項唯讀 MCP 工具及權限':'The first three read-only MCP tools and scopes'}</summary><div className="architecture-tool-grid">{financeMcpTools.map(tool=><article key={tool.name}><h4><code>{tool.name}</code></h4><span>{tool.scope}</span><p>{pick(tool.description,lang)}</p><p><b>{lang==='zh'?'回傳：':'Returns: '}</b>{pick(tool.returns,lang)}</p></article>)}</div><p>{lang==='zh'?'工具不接受任意 SQL、網址、檔案路徑或憑證；每項工具仍核對財報 ACL。PDF 與工具結果屬不可信資料，不能改變工具、權限、模型供應商或預算。先測試過期 token、錯 audience、scope 不足及惡意 PDF，再接外部 AI 客戶端。':'Tools accept no arbitrary SQL, URLs, file paths or credentials. Each tool checks report ACLs. PDFs and tool results are untrusted data and cannot change tools, permissions, model providers or budgets. Test expired tokens, wrong audiences, insufficient scopes and malicious PDFs before connecting an external AI client.'}</p></details>
    <div className="architecture-sources"><a href="#finance-rag-workflow">{lang==='zh'?'繼續看 Python 內部 RAG 流程':'Continue to the internal Python RAG workflow'} ↓</a><a href="https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html" target="_blank" rel="noreferrer">Spring AI · MCP server ↗</a><a href="https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html" target="_blank" rel="noreferrer">Spring Security · OAuth ↗</a><a href="https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization" target="_blank" rel="noreferrer">MCP · authorization ↗</a></div>
  </section>;
}
