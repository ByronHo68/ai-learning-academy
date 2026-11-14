import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: 'Vector DB & Embeddings · PostgreSQL + pgvector | AI 學習院',
  description: 'Learn vector databases and embeddings through a bilingual mind map, animated news search, model comparison and PostgreSQL workflow for the stock research project.',
};

export default function FinanceVectorPage() {
  return <AcademyClient view="finance-vector"/>;
}
