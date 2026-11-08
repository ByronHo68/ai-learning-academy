import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: '股票研究工作流程圖集 | Workflow Atlas | AI 學習院',
  description: 'Explore the complete stock research workflow and eleven function graphs, with bounded retries, fallbacks, recovery and editable SVG/Mermaid downloads.',
};

export default function FinanceWorkflowsPage() { return <AcademyClient view="finance-workflows"/>; }
