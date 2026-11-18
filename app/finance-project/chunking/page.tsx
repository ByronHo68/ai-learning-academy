import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: 'News Chunking & Metadata · Stock Research | AI 學習院',
  description: 'Split your n8n news into searchable passages. Try measured E5 token windows, inspect metadata and follow the PostgreSQL indexing workflow.',
};

export default function FinanceChunkingPage() {
  return <AcademyClient view="finance-chunking"/>;
}
