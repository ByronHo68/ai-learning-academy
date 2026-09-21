import type { Metadata } from 'next';
import './globals.css';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-learning-academy.byronho680.chatgpt.site';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'AI 學習院 | Visual AI Academy',
  description: '用 65 個概念工作坊、專屬比喻、可執行 code、互動視覺與精準回饋，真正理解 AI。',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'AI 學習院 | Visual AI Academy',
    description: '13 個互動主題、65 個概念工作坊，由安全 request 行到可靠 AI 系統。',
    url: siteOrigin,
    siteName: 'AI 學習院',
    locale: 'zh_HK',
    type: 'website',
    images: [{
      url: new URL('/og.png', siteOrigin).toString(),
      width: 1200,
      height: 630,
      alt: 'AI 學習院 — Visual AI Academy',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 學習院 | Visual AI Academy',
    description: '13 個互動主題、65 個概念工作坊，由安全 request 行到可靠 AI 系統。',
    images: [new URL('/og.png', siteOrigin).toString()],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
