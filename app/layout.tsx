import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-learning-academy.byronho680.chatgpt.site'),
  title: 'AI 學習院 | Visual AI Academy',
  description: '用互動視覺、實驗、練習與精準回饋，真正理解 AI。',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'AI 學習院 | Visual AI Academy',
    description: '13 個互動主題，由安全 request 行到可靠 AI 系統。',
    url: 'https://ai-learning-academy.byronho680.chatgpt.site',
    siteName: 'AI 學習院',
    locale: 'zh_HK',
    type: 'website',
    images: [{
      url: 'https://ai-learning-academy.byronho680.chatgpt.site/og.png',
      width: 1200,
      height: 630,
      alt: 'AI 學習院 — Visual AI Academy',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 學習院 | Visual AI Academy',
    description: '13 個互動主題，由安全 request 行到可靠 AI 系統。',
    images: ['https://ai-learning-academy.byronho680.chatgpt.site/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
