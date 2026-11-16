'use client';

import { useState } from 'react';
import { pick, type Lang } from '../lib/curriculum';
import { financePrivacyDiagram, financePrivacyFixtures, financePrivacyGuide, financePrivacyMiddlewareExample, financePrivacyReferences, sanitizePrivacyDemo } from '../lib/finance-privacy';
import { FinanceDiagramCanvas } from './finance-diagram';

export function FinancePrivacyContent({ lang }: { lang: Lang }) {
  const [selected, setSelected] = useState('email');
  const fixture = financePrivacyFixtures.find(item => item.id === selected) ?? financePrivacyFixtures[0];
  const result = sanitizePrivacyDemo(fixture.text, fixture.id !== 'failure');
  return <section className="finance-section" id="finance-privacy">
    <p className="eyebrow">PII · EMAIL + CREDIT CARD → REDACT</p><h2>{lang === 'zh' ? '先清理私人資料，再進研究流程' : 'Sanitize private data before research begins'}</h2>
    <p>{lang === 'zh' ? '這是建議後端的隱私流程及固定合成資料示範。PIIMiddleware 並未安裝到金融服務，亦沒有連 LLM、n8n 或資料庫。遮蔽不等於提示注入防護，不能略過 scope、權限或引用檢查。' : 'This is a proposed backend privacy workflow with fixed synthetic examples. PIIMiddleware is not installed in a finance service; this page makes no LLM, n8n or database calls. Redaction does not prevent prompt injection or waive scope, permissions or citation checks.'}</p>
    <div className="fr-scope-grid fr-evidence-grid">{financePrivacyGuide.map(item => <article key={item.title.en}><h3>{pick(item.title, lang)}</h3><p>{pick(item.body, lang)}</p></article>)}</div>
    <FinanceDiagramCanvas diagram={financePrivacyDiagram} lang={lang}/>
    <h3>{lang === 'zh' ? '合成示例：甚麼移除，甚麼保留？' : 'Synthetic examples: what is removed and what stays?'}</h3>
    <div className="fg-scenarios" role="group" aria-label={lang === 'zh' ? '隱私示例' : 'Privacy examples'}>{financePrivacyFixtures.map(item => <button type="button" key={item.id} aria-pressed={item.id === selected} onClick={() => setSelected(item.id)}>{pick(item.title, lang)}</button>)}</div>
    <p>{lang === 'zh' ? '沒有可輸入私人資料的欄位；下列文字全部是固定合成示例。本頁簡化的 regex／Luhn 計算不是 LangChain SDK，也不是完整 PII 偵測器。' : 'There is no field for entering private data. Every example below is a fixed synthetic fixture. This page uses simplified regex/Luhn checks, not the LangChain SDK or a complete PII detector.'}</p>
    <div className="fr-scope-grid fr-evidence-grid"><article><h4>{lang === 'zh' ? '合成輸入（只供教學）' : 'Synthetic input (teaching only)'}</h4><pre className="fr-tree">{fixture.text}</pre></article><article aria-live="polite"><h4>{lang === 'zh' ? '允許交給後端下一步' : 'Allowed handoff to the next backend stage'}</h4><pre className="fr-tree">{result.kind === 'sanitized' ? result.text : 'privacy_blocked: no graph invocation / no raw fallback'}</pre><p>{result.kind === 'sanitized' ? `${result.policy} · email: ${result.counts.email} · credit_card: ${result.counts.credit_card}` : lang === 'zh' ? '只記安全錯誤類別，不記觸發值或原 exception。' : 'Record only the safe error category, never the offending value or raw exception.'}</p></article></div>
    <details className="proposal-workflow"><summary>{lang === 'zh' ? 'PIIMiddleware 設定及 LangGraph 接線限制' : 'PIIMiddleware configuration and LangGraph wiring limits'}</summary><p>{lang === 'zh' ? '設定屬於 create_agent；自訂 StateGraph 節點須另包裝。入口清理必須在 graph invoke 之前，不能把它放在已保存原提示的第一個節點才做。Generate 節點亦須在回傳 state 更新前清理模型結果。' : 'This configuration belongs to create_agent. Custom StateGraph nodes need separate wrappers. Entry sanitization must precede graph invocation; cleaning in a first node is too late if the raw input was already checkpointed. The generate node must sanitize model results before returning its state update.'}</p><pre className="fr-tree"><code>{financePrivacyMiddlewareExample}</code></pre></details>
    <p><a href="/downloads/stock-research-privacy-guide.md" download>{lang === 'zh' ? '下載雙語隱私流程指南' : 'Download the bilingual privacy workflow guide'}</a> · <a href="/downloads/stock-research-pii-middleware.py" download>{lang === 'zh' ? '下載 Python 設定範例' : 'Download Python configuration example'}</a></p><ul>{financePrivacyReferences.map(item => <li key={item.url}><a href={item.url}>{item.title}</a></li>)}</ul>
  </section>;
}
