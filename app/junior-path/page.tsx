import type { Metadata } from 'next';
import AcademyClient from '../academy-client';

export const metadata: Metadata = {
  title: '香港 Junior AI 實作路線 | AI 學習院',
  description: 'Six bilingual Python labs, three progressive projects and dated Hong Kong hiring evidence.',
  alternates: {canonical:'/junior-path'},
};

export default function JuniorPathPage() {
  return <AcademyClient view="junior"/>;
}
