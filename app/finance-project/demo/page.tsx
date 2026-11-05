import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: '股票研究操作示範 | Stock Research Demo | AI 學習院',
  description: 'Try an offline stock-news research simulation: sourced report, insufficient evidence, injected instructions and checkpoint recovery.',
};

export default function FinanceDemoPage() {
  return <AcademyClient view="finance-demo" />;
}
