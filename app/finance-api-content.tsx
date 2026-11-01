import { type Lang, pick } from '../lib/curriculum';
import type { FinanceApiWorkflow } from '../lib/finance-api-workflows';

function ExampleCode({ value }: { value: object }) {
  return <pre><code>{JSON.stringify(value, null, 2)}</code></pre>;
}

export function FinanceApiContent({ workflow, lang }: { workflow: FinanceApiWorkflow; lang: Lang }) {
  const stages = <><p className="finance-api-services">{workflow.services}</p><ol className="finance-api-processing">{workflow.processing.map((item, index) => <li key={item.en}><b>{index + 1}</b><p>{pick(item, lang)}</p></li>)}</ol></>;
  if (workflow.kind === 'pipeline') return <section className="finance-api" aria-label={lang === 'zh' ? '建議 CI 工作流程' : 'Proposed CI workflow'}>
    <div className="finance-api-heading"><span>CI / CD</span><h5>{lang === 'zh' ? '操作人員流程 · 非公開 API' : 'Operator workflow · no public API'}</h5></div>
    <p className="finance-api-route">{workflow.trigger}</p>
    <h6>{lang === 'zh' ? '觸發輸入範例' : 'Example trigger inputs'}</h6><ExampleCode value={workflow.input}/>
    {stages}<h6>{lang === 'zh' ? '完成結果範例' : 'Example completion result'}</h6><ExampleCode value={workflow.output}/>
    <p className="finance-api-note">{pick(workflow.failure, lang)}</p>
  </section>;

  const request = workflow.request;
  const result = workflow.result;
  const requestLabel = request.kind === 'query' ? 'URL query parameters' : request.kind === 'multipart' ? 'multipart/form-data' : request.kind === 'json' ? 'application/json' : 'No request body';
  return <section className="finance-api" aria-label={lang === 'zh' ? '建議 API 工作流程' : 'Proposed API workflow'}>
    <div className="finance-api-heading"><span>{workflow.method}</span><h5>{lang === 'zh' ? 'API 合約與資料流' : 'API contract and data flow'}</h5></div>
    <p className="finance-api-route"><code>{workflow.path}</code></p>
    <p className="finance-api-access">{lang === 'zh' ? '所需角色' : 'Required role'}: <strong>{workflow.access}</strong> · {lang === 'zh' ? '登入驗證後仍須核對每份資源權限。' : 'Check resource access after authentication.'}</p>
    <div className="finance-api-examples">
      <div><h6>{lang === 'zh' ? '1 · 請求' : '1 · Request'}</h6>
        <pre className="finance-api-headers"><code>{`Authorization: Bearer <${workflow.access === 'service' ? 'service' : 'session'}-token>${request.kind === 'json' ? '\nContent-Type: application/json' : ''}${workflow.idempotencyKey ? '\nIdempotency-Key: <stable-operation-id>' : ''}`}</code></pre>
        <p className="finance-api-format">{requestLabel}</p>
        {request.kind !== 'none' && <ExampleCode value={request.example}/>}
        {request.kind === 'multipart' && <p className="finance-api-note">{lang === 'zh' ? '此處列出表單欄位，並非 JSON 請求。讓瀏覽器自動設定 multipart boundary。' : 'These are form fields, not a JSON body. Let the browser set the multipart boundary.'}</p>}
        {request.kind === 'query' && <p className="finance-api-note">{lang === 'zh' ? '以 URLSearchParams 編碼至網址；GET 不傳 JSON 內容。' : 'Encode these in the URL with URLSearchParams; GET sends no JSON body.'}</p>}
      </div>
      <div><h6>{lang === 'zh' ? '2 · 回應' : '2 · Response'} <span>HTTP {result.status}</span></h6>
        {result.kind === 'file' ? <><pre><code>{`Content-Type: ${result.contentType}\nContent-Disposition: inline; filename="report.pdf"\n\n<PDF binary bytes>`}</code></pre><p className="finance-api-note">{pick(result.description, lang)}</p></> : <ExampleCode value={result.example}/>}
        {result.kind === 'accepted' && <p className="finance-api-note">{lang === 'zh' ? '202 只表示工作已接納，尚未完成。先顯示排隊狀態，再輪詢下方網址。' : '202 means accepted, still unfinished. Show the queued state, then poll the status URL below.'}</p>}
      </div>
    </div>
    <h6>{lang === 'zh' ? '3 · 後端處理及技術交接' : '3 · Backend processing and technology handoffs'}</h6>{stages}
    {result.kind === 'accepted' && <details className="finance-api-poll"><summary>{lang === 'zh' ? '4 · 輪詢及終止狀態範例' : '4 · Polling and terminal-state examples'}</summary>
      <p><code>GET {result.poll}</code></p>
      <p className="finance-api-note">{lang === 'zh' ? '輪詢使用相同權限，HTTP 200 回傳目前狀態；等候時逐步延長間隔，遵守 Retry-After。離開頁面即停止輪詢。完成或失敗時停止；若執行暫停待覆核，顯示覆核動作。重試只適用於允許重試的錯誤。' : 'Poll with the same authorization; HTTP 200 returns the current state. Back off while waiting and honor Retry-After. Stop polling when leaving the page or on completed/failed. If a run pauses for review, show the review action. Retry only permitted failures.'}</p>
      <div className="finance-api-examples"><div><h6>completed · HTTP 200</h6><ExampleCode value={result.completed}/></div><div><h6>failed · HTTP 200</h6><ExampleCode value={result.failed}/></div></div>
    </details>}
    <h6>{lang === 'zh' ? '常見拒絕情況' : 'Common rejection cases'}</h6>
    <ul className="finance-api-errors">{workflow.errors.map(error => <li key={error.code}><code>{error.status} · {error.code}</code><span>{pick(error.detail, lang)}</span></li>)}</ul>
    <p className="finance-api-note">{lang === 'zh' ? '錯誤 JSON 統一使用 { error: { code, message, requestId } }。所有端點另處理 401（未登入）、403（無權限）、429（限流）及 5xx（服務錯誤）。以上皆為虛構設計範例，不會發出請求。' : 'Error JSON uses { error: { code, message, requestId } }. Every endpoint also handles 401 (unauthenticated), 403 (forbidden), 429 (rate limited) and 5xx (service failure). All examples are fictional designs; no requests are sent.'}</p>
    {workflow.idempotencyKey && <p className="finance-api-note">{lang === 'zh' ? '同一操作重送時重用 Idempotency-Key；後端按身份及操作範圍去重。相同鍵配不同內容回傳 409；在文件註明保留期限。' : 'Reuse Idempotency-Key when resending the same operation. The backend scopes it to the actor and operation; different content with the same key returns 409. Document the retention window.'}</p>}
  </section>;
}
