import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: 'The Stock Research RAG Storyline | AI 學習院',
  description: 'Animate the path from n8n news to chunks, OpenRouter embedding requests, PostgreSQL metadata, retrieval and a cited answer.',
};

export default function FinanceRagPage() {
  return <AcademyClient view="finance-rag"/>;
}
