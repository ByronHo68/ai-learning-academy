'use client';

import { useId, useRef } from 'react';
import { type Lang, pick } from '../lib/curriculum';
import type { ProposalIllustrationData } from '../lib/proposal-illustrations';

type IllustrationProps = { illustration: ProposalIllustrationData; lang: Lang };

function IllustrationImage({ illustration, lang }: IllustrationProps) {
  // Local WebP assets are shared with the static office edition without an image optimizer.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={illustration.src} width={illustration.width} height={illustration.height} alt={pick(illustration.alt, lang)} loading="lazy" decoding="async" />;
}

function KeywordGuide({ illustration, lang }: IllustrationProps) {
  return <dl className="proposal-illustration-keywords">{illustration.keywords.map(keyword => <div key={keyword.label}><dt>{keyword.label}</dt><dd>{pick(keyword.meaning, lang)}</dd></div>)}</dl>;
}

export function ProposalIllustration({ illustration, lang }: IllustrationProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const dialogTitleId = useId();
  const note = lang === 'zh'
    ? 'AI 生成的教學概念插圖，並非實際部署畫面。標籤及圖形協助理解；實作細節以下方文字規格為準。'
    : 'AI-generated educational concept illustration, not a running deployment. Labels and objects explain the idea; the written specification defines the implementation.';

  return <figure className="proposal-illustration" aria-labelledby={titleId}>
    <div className="proposal-illustration-art">
      <IllustrationImage illustration={illustration} lang={lang}/>
      <button type="button" className="proposal-illustration-expand" onClick={() => dialog.current?.showModal()}>{lang === 'zh' ? '開啟完整插圖' : 'Open full-size illustration'} ↗</button>
      <dialog ref={dialog} className="proposal-illustration-dialog" aria-labelledby={dialogTitleId}>
        <div className="proposal-illustration-dialog-header"><h3 id={dialogTitleId}>{pick(illustration.title, lang)}</h3><button type="button" onClick={() => dialog.current?.close()}>{lang === 'zh' ? '關閉' : 'Close'} ×</button></div>
        <IllustrationImage illustration={illustration} lang={lang}/>
        <p className="proposal-illustration-caption">{pick(illustration.caption, lang)}</p>
        <KeywordGuide illustration={illustration} lang={lang}/>
        <p className="proposal-illustration-note">{note}</p>
      </dialog>
    </div>
    <figcaption>
      <p className="eyebrow">{lang === 'zh' ? '看圖理解 · ENGLISH KEYWORDS' : 'SEE THE IDEA · ENGLISH KEYWORDS'}</p>
      <h3 id={titleId}>{pick(illustration.title, lang)}</h3>
      <p className="proposal-illustration-caption">{pick(illustration.caption, lang)}</p>
      <KeywordGuide illustration={illustration} lang={lang}/>
      <p className="proposal-illustration-note">{note}</p>
    </figcaption>
  </figure>;
}
