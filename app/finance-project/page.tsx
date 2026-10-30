import type { Metadata } from 'next';
import AcademyClient from '../academy-client';

export const metadata: Metadata = {
  title: '香港財報分析項目 | Financial Report Project | AI 學習院',
  description: 'Explore a bilingual financial-report project mind map, functions, evidence workflow, technology stack and build stages.',
};

export default function FinanceProjectPage() {
  return <AcademyClient view="finance-project" />;
}
