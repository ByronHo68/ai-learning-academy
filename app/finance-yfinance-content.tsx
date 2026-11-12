import { pick, type Lang } from '../lib/curriculum';
import { yfinanceCommands, yfinanceContracts, yfinanceDecision, yfinanceNewsExample, yfinanceQuoteExample, yfinanceReferences, yfinanceSetup } from '../lib/finance-yfinance';

export function FinanceYfinanceContent({ lang }: { lang: Lang }) {
  return <section className="finance-section" id="finance-yfinance">
    <h2>{lang === 'zh' ? 'YFinance MCP：新聞 JSON 及股票報價' : 'YFinance MCP for news JSON and stock quotes'}</h2>
    <p>{pick(yfinanceDecision, lang)}</p>
    <pre className="fr-tree"><code>LangGraph → n8n MCP → HTTP adapter → MCP stdio → yfinance → Yahoo Finance</code></pre>
    <p>{lang === 'zh' ? 'Adapter 程式已加入此 repository，支援 MSFT、AAPL、NVDA。2026 年 11 月 12 日已實測工具發現、MSFT 新聞及報價呼叫；網站本身展示離線例子，n8n 及 PostgreSQL 完整接線按下面指南實作。' : 'The adapter code is included in this repository for MSFT, AAPL and NVDA. Tool discovery, MSFT news and quote calls were live-tested on 12 November 2026. The website displays offline examples. Follow the guide to connect your n8n and PostgreSQL workflows.'}</p>
    <ol className="proposal-notes">{yfinanceSetup.map(item => <li key={item.en}>{pick(item, lang)}</li>)}</ol>
    <details className="proposal-workflow"><summary>{lang === 'zh' ? '安裝及本機啟動命令' : 'Installation and local startup commands'}</summary><pre className="fr-tree"><code>{yfinanceCommands}</code></pre></details>
    <div className="fr-scope-grid">
      <div><h3>{lang === 'zh' ? '新聞：虛構格式例子' : 'News · fictional format example'}</h3><details className="proposal-workflow"><summary>POST /news · {`{"symbol":"MSFT","max_items":5}`}</summary><pre className="fr-tree"><code>{yfinanceNewsExample}</code></pre></details><p>{lang === 'zh' ? '標題、摘要及網址經驗證後入庫。去重 hash 保留修訂版本；缺少發布日期保持 null，再由證據篩選處理。' : 'Store validated titles, summaries and URLs. Deduplication hashes preserve revised versions. Missing publication dates stay null for the evidence gate to handle.'}</p></div>
      <div><h3>{lang === 'zh' ? '報價：虛構格式例子' : 'Quote · fictional format example'}</h3><details className="proposal-workflow"><summary>POST /quote · {`{"symbol":"MSFT"}`}</summary><pre className="fr-tree"><code>{yfinanceQuoteExample}</code></pre></details><p>{lang === 'zh' ? '顯示價格、貨幣、價格依據、交易時間及擷取時間。收市後可能回傳上一交易時段價格；delay_status 保持 unknown，除非供應商另有可靠證據。' : 'Display price, currency, price basis, market time and fetch time. A closed market may return the previous session’s observation. Delay status stays unknown unless reliable provider evidence establishes it.'}</p></div>
    </div>
    <h3>{lang === 'zh' ? '下載 JSON schemas' : 'Download JSON schemas'}</h3>
    <p>{lang === 'zh' ? 'MCP outputSchema 描述字串回傳 envelope；adapter 再解析字串內 JSON，按 app schema 驗證，回傳結構化資料。' : 'The discovered MCP outputSchema describes a string-result envelope. The adapter parses the JSON inside that string, validates the application schema and returns structured data.'}</p>
    <ul>{yfinanceContracts.map(item => <li key={item.file}><a href={`/downloads/yfinance/${item.file}`} download>{pick(item.label, lang)}</a></li>)}</ul>
    <p>{lang === 'zh' ? 'yfinance 作者定位為個人研究及教學用途；公開或商業使用須核對資料權利。' : 'The yfinance authors describe personal research and educational use. Check provider data rights for public or commercial distribution.'}</p>
    <p><a className="fr-inline-link" href="/downloads/stock-research-yfinance-guide.md" download>{lang === 'zh' ? '下載完整安裝、n8n 及儲存指南' : 'Download the complete installation, n8n and storage guide'} ↓</a></p>
    <ul>{yfinanceReferences.map(item => <li key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.title} ↗</a></li>)}</ul>
  </section>;
}
