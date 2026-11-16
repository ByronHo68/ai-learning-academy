import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: 'Reranking & HNSW · PostgreSQL retrieval | AI 學習院',
  description: 'A bilingual mind map, layered graph animation and news reranking demo explain HNSW, embeddings, cross-encoders and their role in the stock research workflow.',
};

export default function FinanceRerankPage() {
  return <AcademyClient view="finance-rerank"/>;
}
