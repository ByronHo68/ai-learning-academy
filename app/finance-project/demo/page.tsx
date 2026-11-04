import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: '財報助手操作示範 | Financial Report Demo | AI 學習院',
  description: 'Try a fictional report-analysis workflow: MarkItDown conversion, evidence retrieval, review, validation and a downloadable sample analysis.',
};

export default function FinanceDemoPage() {
  return <AcademyClient view="finance-demo" />;
}
