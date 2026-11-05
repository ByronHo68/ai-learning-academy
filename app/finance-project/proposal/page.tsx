import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: '股票研究開發提案 | Stock Research Build Plan | AI 學習院',
  description: 'A 4–6 week interview-demo plan: native local development, one Python agent, function workflows, evaluation and Docker deployment on EC2.',
};

export default function FinanceProposalPage() {
  return <AcademyClient view="finance-proposal" />;
}
