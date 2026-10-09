import type { Metadata } from 'next';
import AcademyClient from '../academy-client';

export const metadata: Metadata = {
  title: 'AI Developer 求職實戰 | AI 學習院',
  description: '用十個能力指南、生活例子、code、面試題同可驗證作品，練習 production AI developer 技能。',
};

export default function HiringReadinessPage() {
  return <AcademyClient view="hiring" />;
}
