import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import AcademyClient from '../../academy-client';
import { topicBySlug, topics } from '../../../lib/curriculum';

export function generateStaticParams() {
  return topics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }):Promise<Metadata> {
  const { slug }=await params;
  const topic=topicBySlug(slug);
  if(!topic) return {};
  return {
    title: `${topic.title.zh} | AI 學習院`,
    description: `${topic.subtitle.zh} — ${topic.orientation.oneSentence.zh}`,
    openGraph: { title: `${topic.title.zh} | AI 學習院`, description: topic.orientation.oneSentence.zh, images: [] },
    twitter: { card: 'summary', title: `${topic.title.zh} | AI 學習院`, description: topic.orientation.oneSentence.zh, images: [] },
  };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = topicBySlug(slug);
  if (!topic) notFound();
  return <AcademyClient view="lesson" topicId={topic.id} />;
}
