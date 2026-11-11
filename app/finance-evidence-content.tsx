import { pick, type Lang } from '../lib/curriculum';
import { financeEvidenceGuide, financeSnapshotExample } from '../lib/finance-evidence';

export function FinanceEvidenceContent({ lang }: { lang: Lang }) {
  return <section className="finance-section" id="finance-evidence">
    <h2>{lang === 'zh' ? '新聞、背景、快照及重排點樣連起？' : 'How do news, profiles, snapshots and reranking fit together?'}</h2>
    <div className="fr-scope-grid">{financeEvidenceGuide.map(item => <article key={item.title.en}><h3>{pick(item.title, lang)}</h3><p>{pick(item.body, lang)}</p></article>)}</div>
    <details className="proposal-workflow"><summary>{lang === 'zh' ? '查看一份虛構 snapshot 清單' : 'Inspect a fictional snapshot manifest'}</summary><pre className="fr-tree"><code>{financeSnapshotExample}</code></pre></details>
    <p><a href="/downloads/finance-diagrams/overall-en.svg" download>{lang === 'zh' ? '下載英文整體 SVG' : 'Download the overall SVG in English'}</a> · <a href="/downloads/finance-diagrams/overall-zh.svg" download>{lang === 'zh' ? '下載繁中整體 SVG' : 'Download the overall SVG in Traditional Chinese'}</a></p>
    <p><a href="/downloads/finance-diagrams/sources-en.svg" download>{lang === 'zh' ? '下載詳細 n8n 新聞刷新 SVG' : 'Download the detailed n8n news-refresh SVG'}</a></p>
  </section>;
}
