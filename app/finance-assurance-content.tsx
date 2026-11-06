import { type Lang, pick } from '../lib/curriculum';
import { financeAdrs, financeAssurance, financePromptFlow } from '../lib/finance-assurance';

export function FinanceAssuranceContent({ lang }: { lang: Lang }) {
  return <section className="finance-section" id="finance-assurance">
    <p className="eyebrow">NEWS → RETRIEVAL → PREDICTION → EVIDENCE</p>
    <h2>{lang === 'zh' ? 'n8n MCP、量度檢索及可審閱證據' : 'n8n MCP, measured retrieval and reviewable evidence'}</h2>
    <p>{lang === 'zh' ? '以下是新版 app 的驗收設計。此網站只提供離線模擬、可重跑評估工具及文件；真實 n8n、向量搜尋、LLM、Langfuse 及 LangSmith 尚未接通。' : 'These are acceptance requirements for the revised app. This website provides an offline simulation, a rerunnable evaluation harness and documentation. Live n8n, vector search, LLM, Langfuse and LangSmith services are not connected.'}</p>
    <ol className="proposal-notes">{financePromptFlow.map(step => <li key={step}>{step}</li>)}</ol>
    {financeAssurance.map(item => <article key={item.id} id={`finance-assurance-${item.id}`}>
      <h3>{pick(item.title, lang)}</h3><ul className="proposal-notes">{item.points.map(point => <li key={point.en}>{pick(point, lang)}</li>)}</ul>
    </article>)}
    <h3>{lang === 'zh' ? '六份架構決策紀錄（ADR）' : 'Six architecture decision records (ADRs)'}</h3>
    {financeAdrs.map(adr => <details className="proposal-workflow" key={adr.id}><summary>ADR-{adr.id} · {pick(adr.title, lang)}</summary>
      <p><strong>{lang === 'zh' ? '決定：' : 'Decision: '}</strong>{pick(adr.decision, lang)}</p>
      <p><strong>{lang === 'zh' ? '取捨：' : 'Tradeoff: '}</strong>{pick(adr.tradeoff, lang)}</p>
      <p><strong>{lang === 'zh' ? '驗證：' : 'Verification: '}</strong>{pick(adr.verification, lang)}</p>
    </details>)}
    <div className="proposal-actions">
      <a className="secondary-action" href="/downloads/stock-research-review-pack.md" download>{lang === 'zh' ? '下載設計及六份 ADR' : 'Download requirements + six ADRs'}</a>
      <a className="secondary-action" href="/downloads/stock-research-eval-report.md" download>{lang === 'zh' ? '下載評估成績表' : 'Download evaluation report card'}</a>
      <a className="secondary-action" href="/downloads/stock-research-eval-fixtures.json" download>{lang === 'zh' ? '下載凍結集及注入測試' : 'Download frozen set + injection fixtures'}</a>
    </div>
  </section>;
}
