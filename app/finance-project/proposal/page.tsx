import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: '開發提案與 EC2 部署 | Development Proposal | AI 學習院',
  description: 'A staged financial-report project proposal: 20-week estimate, developer tasks, Docker Compose on EC2, backup and recovery, and an optional Kubernetes extension.',
};

export default function FinanceProposalPage() {
  return <AcademyClient view="finance-proposal" />;
}
