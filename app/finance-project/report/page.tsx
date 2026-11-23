import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: 'Stock Report Design · From Evidence to Export | AI 學習院',
  description: 'Follow a stock research report through retrieval, OpenRouter, citation checks, and rendering. Compare a news report, a quote lookup, and a price chart.',
};

export default function FinanceReportPage() {
  return <AcademyClient view="finance-report"/>;
}
