import { pick, type Lang } from '../lib/curriculum';
import { alphaVantageDailyGuide, alphaVantageDailyQueries, alphaVantageReference, alphaVantageRequestExample } from '../lib/finance-alpha-vantage';

export function FinanceAlphaVantageContent({ lang }: { lang: Lang }) {
  return <section className="finance-section" id="finance-alpha-vantage">
    <p className="eyebrow">DAILY NEWS · ALPHA VANTAGE · PROPOSED CONFIGURATION</p>
    <h2>{lang === 'zh' ? '每日宏觀、財政及地緣新聞：Alpha Vantage' : 'Daily macro, fiscal and geopolitical news: Alpha Vantage'}</h2>
    <p>{lang === 'zh' ? '宏觀及財政使用官方 topic；地緣政治須抓取後自行標記，不能假設有完整覆蓋。' : 'Macro and fiscal use documented topics. Geopolitics is tagged after retrieval; complete coverage cannot be assumed.'}</p>
    <div className="fr-scope-grid fr-evidence-grid">{alphaVantageDailyQueries.map(query => <article key={query.id}><h3>{pick(query.purpose, lang)}</h3><pre className="fr-tree"><code>{JSON.stringify(query.parameters, null, 2)}</code></pre></article>)}</div>
    <div className="fr-scope-grid fr-evidence-grid">{alphaVantageDailyGuide.map(item => <article key={item.title.en}><h3>{pick(item.title, lang)}</h3><p>{pick(item.body, lang)}</p></article>)}</div>
    <details className="proposal-workflow"><summary>{lang === 'zh' ? 'n8n HTTP Request 設定示例' : 'n8n HTTP Request configuration example'}</summary><pre className="fr-tree"><code>{alphaVantageRequestExample}</code></pre></details>
    <p><a href={alphaVantageReference.url} target="_blank" rel="noreferrer">{alphaVantageReference.title}</a> · <a href="/downloads/stock-research-alpha-vantage-guide.md" download>{lang === 'zh' ? '下載雙語設定指南' : 'Download the bilingual configuration guide'}</a></p>
  </section>;
}
