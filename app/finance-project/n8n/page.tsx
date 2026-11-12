import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: 'n8n 新聞流程 | n8n news workflow | AI 學習院',
  description: 'What n8n is in the stock research projection, with a playable workflow for a fresh fetch, one retry, an outage, a reused receipt, an out-of-scope ticker, and the daily batch.',
};

export default function FinanceN8nPage() {
  return <AcademyClient view="finance-n8n"/>;
}
