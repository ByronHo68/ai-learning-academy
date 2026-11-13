import { pick, type Lang } from '../lib/curriculum';
import { financeEmbeddingDiagram, financeEmbeddingGuide } from '../lib/finance-embeddings';
import { FinanceDiagramCanvas } from './finance-diagram';

export function FinanceEmbeddingContent({ lang }: { lang: Lang }) {
  return <section className="finance-section" id="finance-embeddings">
    <h2>{lang === 'zh' ? 'Embedding 放在哪一步？文件與問題各一次。' : 'Where do embeddings happen? Documents and queries have separate steps.'}</h2>
    <div className="fr-scope-grid fr-evidence-grid">{financeEmbeddingGuide.map(item => <article key={item.title.en}><h3>{pick(item.title, lang)}</h3><p>{pick(item.body, lang)}</p></article>)}</div>
    <FinanceDiagramCanvas diagram={financeEmbeddingDiagram} lang={lang}/>
    <p><a href="/downloads/stock-research-embedding-guide.md" download>{lang === 'zh' ? '下載 embedding 流程指南' : 'Download the embedding workflow guide'}</a></p>
  </section>;
}
