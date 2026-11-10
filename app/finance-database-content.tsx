import { type Lang, pick } from '../lib/curriculum';
import { financeDatabase, financePostgresCheckpoint, financePostgresQuery, financePostgresSchema } from '../lib/finance-database';

export function FinanceDatabaseContent({ lang }: { lang: Lang }) {
  return <section className="finance-section" id="finance-database">
    <p className="eyebrow">DATABASE · POSTGRESQL + PGVECTOR</p>
    <h2>{pick(financeDatabase.title, lang)}</h2>
    <p>{pick(financeDatabase.introduction, lang)}</p>
    <ol className="proposal-notes">{financeDatabase.flow.map(step => <li key={step}>{step}</li>)}</ol>
    <div className="fr-scope-grid">{financeDatabase.responsibilities.map(item => <div key={item.name}><h3>{item.name}</h3><p>{pick(item.detail, lang)}</p></div>)}</div>
    <h3>{lang === 'zh' ? '連線、重試及備份' : 'Connections, retries and backups'}</h3>
    <ul className="proposal-notes">{financeDatabase.operations.map(item => <li key={item.en}>{pick(item, lang)}</li>)}</ul>
    <details className="proposal-workflow"><summary>{lang === 'zh' ? '查看 PostgreSQL 資料表範例' : 'Inspect the PostgreSQL schema example'}</summary><pre className="fr-tree"><code>{financePostgresSchema}</code></pre></details>
    <details className="proposal-workflow"><summary>{lang === 'zh' ? '查看全文及向量查詢範例' : 'Inspect full-text and vector query examples'}</summary><pre className="fr-tree"><code>{financePostgresQuery}</code></pre></details>
    <details className="proposal-workflow"><summary>{lang === 'zh' ? '查看 LangGraph PostgreSQL checkpoint 接線' : 'Inspect LangGraph PostgreSQL checkpoint wiring'}</summary><pre className="fr-tree"><code>{financePostgresCheckpoint}</code></pre></details>
    <p><a className="fr-inline-link" href="/downloads/finance-postgresql-schema.sql" download>{lang === 'zh' ? '下載 SQL schema' : 'Download the SQL schema'} ↓</a></p>
    <a className="fr-inline-link" href="/downloads/stock-research-postgresql-guide.md" download>{lang === 'zh' ? '下載 PostgreSQL 指南及範例' : 'Download the PostgreSQL guide and examples'} ↓</a>
  </section>;
}
