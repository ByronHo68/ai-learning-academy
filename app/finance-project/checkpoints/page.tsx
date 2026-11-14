import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: 'LangGraph Checkpoints · AsyncPostgresSaver | AI 學習院',
  description: 'A bilingual mind map, restart/recovery simulation and workflow diagrams explain LangGraph checkpoints, AsyncPostgresSaver and their role in the stock research project.',
};

export default function FinanceCheckpointsPage() {
  return <AcademyClient view="finance-checkpoints"/>;
}
