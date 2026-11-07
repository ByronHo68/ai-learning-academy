import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';

export const metadata: Metadata = {
  title: 'MCP 圖解及動畫 | MCP Visual Guide | AI 學習院',
  description: 'Understand MCP with a bilingual mind map, animated news workflow, tools/resources/prompts examples and n8n setup guide.',
};

export default function FinanceMcpPage() {
  return <AcademyClient view="finance-mcp"/>;
}
