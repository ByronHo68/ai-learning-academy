import type { Metadata } from 'next';
import AcademyClient from '../academy-client';

export const metadata: Metadata = {
  title: '股票研究 Agent 項目 | Stock Research Agent | AI 學習院',
  description: 'A job-first stock research assistant: three companies, one bounded agent, sourced reports, individual function workflows and technique explanations.',
};

export default function FinanceProjectPage() {
  return <AcademyClient view="finance-project" />;
}
