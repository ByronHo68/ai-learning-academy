import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: 'OpenRouter · Every research LLM call | AI 學習院',
  description: 'Apply OpenRouter to scope, refinement and report generation with one Python gateway, private configuration, strict schemas, bounded calls and privacy checks.',
};

export default function FinanceOpenRouterPage() {
  return <AcademyClient view="finance-openrouter"/>;
}
