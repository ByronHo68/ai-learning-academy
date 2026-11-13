'use client';

import { useState } from 'react';
import { pick, type Lang } from '../lib/curriculum';
import { financeReviewCoverage, financeReviewExample, financeReviewGuide, financeReviewSketch, financeReviewSources } from '../lib/finance-review';

export function FinanceReviewContent({ lang }: { lang: Lang }) {
  const [highlighted, setHighlighted] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const missing = financeReviewCoverage(excluded);
  const missingLabels = financeReviewSources.filter(source => missing.includes(source.facet)).map(source => pick(source.title, lang));
  function toggle(id: string, action: 'highlight' | 'exclude') {
    setSubmitted(false);
    if (action === 'highlight') setHighlighted(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]);
    else {
      setExcluded(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]);
      setHighlighted(ids => ids.filter(value => value !== id));
    }
  }
  return <section className="finance-section" id="finance-evidence-review">
    <p className="eyebrow">HUMAN IN THE LOOP · PROPOSED DESIGN</p>
    <h2>{lang === 'zh' ? '重排之後，讓你覆核證據' : 'Review the evidence after ranking'}</h2>
    <p>{lang === 'zh' ? '先找相關證據，再讓你選擇重點，最後重新檢查足不足夠回答。以下是離線教學示範；新聞、ID 及結果都是虛構，沒有呼叫 n8n、PostgreSQL 或 LLM。' : 'Find relevant evidence, choose what to emphasize, then recheck whether it supports the answer. This is an offline teaching demo with fictional sources, IDs and outcomes. It makes no n8n, PostgreSQL or LLM calls.'}</p>
    <p className="fd-budget">{lang === 'zh' ? '檢索 → 重排／全文 → 可選覆核 → 驗證選取 → 證據關卡 → context → LLM → 驗證' : 'Retrieve → rerank / full-text → optional review → validate selection → evidence gate → context → LLM → validation'}</p>
    <div className="fr-review-demo">
      <h3>{lang === 'zh' ? '試一試：標記重點或排除此報告' : 'Try highlighting or excluding evidence'}</h3>
      <p>{lang === 'zh' ? '教學規則：成本、需求及展望三個面向都需要支持。試排除盈利展望，再按「檢查選取」。' : 'Teaching rule: costs, demand and outlook each need support. Try excluding the earnings outlook, then check your selection.'}</p>
      <div className="fr-scope-grid fr-evidence-grid">{financeReviewSources.map(source => <article key={source.id}>
        <h4>{pick(source.title, lang)}</h4><p>{pick(source.excerpt, lang)}</p>
        <div className="fr-review-actions">
          <button type="button" aria-pressed={highlighted.includes(source.id)} disabled={excluded.includes(source.id)} onClick={() => toggle(source.id, 'highlight')}>{highlighted.includes(source.id) ? (lang === 'zh' ? '已標記：' : 'Highlighted: ') : (lang === 'zh' ? '標記：' : 'Highlight: ')}{pick(source.title, lang)}</button>
          <button type="button" aria-pressed={excluded.includes(source.id)} onClick={() => toggle(source.id, 'exclude')}>{excluded.includes(source.id) ? (lang === 'zh' ? '重新加入：' : 'Include again: ') : (lang === 'zh' ? '排除此報告：' : 'Exclude from report: ')}{pick(source.title, lang)}</button>
        </div>
      </article>)}</div>
      <div className="fr-review-actions">
        <button type="button" onClick={() => { setHighlighted([]); setExcluded([]); setSubmitted(false); }}>{lang === 'zh' ? '重設為系統建議' : 'Reset to system recommendation'}</button>
        <button type="button" onClick={() => setSubmitted(true)}>{lang === 'zh' ? '檢查選取（離線）' : 'Check selection (offline)'}</button>
      </div>
      <p role="status" aria-live="polite">{submitted ? (missing.length ? (lang === 'zh' ? `證據不足：缺少 ${missingLabels.join('、')}。真實流程最多補查一次；仍不足就不生成預測。` : `Insufficient evidence: missing ${missingLabels.join(', ')}. The proposed workflow refines at most once, then withholds a forecast if support is still missing.`) : (lang === 'zh' ? '三個面向有支持，可進入 context 建立及後續驗證；這裡沒有生成報告。' : 'All three facets have support. Context building and later validation may proceed; no report is generated here.')) : (lang === 'zh' ? '選擇尚未提交；你可繼續編輯。' : 'Selection has not been submitted; you can keep editing.')}</p>
      <p>{lang === 'zh' ? `已標記 ${highlighted.length} · 已排除 ${excluded.length} · 新聞原文及快照不變 · 信心不因標記提高` : `${highlighted.length} highlighted · ${excluded.length} excluded · stored news and snapshot unchanged · highlights do not raise confidence`}</p>
      {highlighted.length > 0 && <p>{lang === 'zh' ? '討論重點（仍須證據支持）：' : 'Discussion emphasis (support still required): '}{financeReviewSources.filter(source => highlighted.includes(source.id)).map(source => pick(source.title, lang)).join(' · ')}</p>}
    </div>
    <div className="fr-scope-grid fr-evidence-grid">{financeReviewGuide.map(item => <article key={item.title.en}><h3>{pick(item.title, lang)}</h3><p>{pick(item.body, lang)}</p></article>)}</div>
    <details className="proposal-workflow"><summary>{lang === 'zh' ? '選取紀錄及 LangGraph 暫停／恢復接線示例' : 'Selection record and LangGraph pause/resume sketch'}</summary><pre className="fr-tree"><code>{financeReviewExample}</code></pre><pre className="fr-tree"><code>{financeReviewSketch}</code></pre><p><a href="https://docs.langchain.com/oss/python/langgraph/interrupts" target="_blank" rel="noreferrer">LangGraph interrupts documentation</a></p></details>
    <p><a href="/finance-project/workflows#project-diagram">{lang === 'zh' ? '在整體動畫選「重排後標記重點」或「排除導致支持不足」' : 'Play “Highlight after reranking” or “Exclusion removes required support” in the overall workflow'}</a></p>
    <p><a href="/downloads/stock-research-evidence-review.md" download>{lang === 'zh' ? '下載雙語覆核設計指南' : 'Download the bilingual evidence-review guide'}</a> · <a href="/downloads/finance-diagrams/retrieval-en.svg" download>{lang === 'zh' ? '下載檢索及覆核 SVG' : 'Download retrieval and review SVG'}</a></p>
  </section>;
}
