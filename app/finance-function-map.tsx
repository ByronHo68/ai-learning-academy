'use client';

import { useId, useState } from 'react';
import { ArrowDown, ArrowRight, Check, GitBranch, ShieldCheck, X } from 'lucide-react';
import { type Lang, pick } from '../lib/curriculum';
import type { FinanceFunctionGuide } from '../lib/finance-project';
import { financeFunctionRoutes } from '../lib/finance-workflows';

export function FinanceFunctionMindmap({ guide, lang }: { guide: FinanceFunctionGuide; lang: Lang }) {
  const [selected, setSelected] = useState(0);
  const detailId = useId();
  const step = guide.steps[selected] ?? guide.steps[0];
  const entry = guide.entry;
  const entryText = entry.kind === 'http' ? `${entry.method} ${entry.path}\n${entry.example}` : entry.kind === 'developer' ? entry.command : `${entry.caller}\n${entry.contract}`;
  return <div className="fr-mindmap" data-function={guide.id}>
    <dl className="fr-contract"><div><dt>{lang === 'zh' ? '輸入' : 'Input'}</dt><dd>{pick(guide.input, lang)}</dd></div><div><dt>{lang === 'zh' ? '輸出' : 'Output'}</dt><dd>{pick(guide.output, lang)}</dd></div></dl>
    <div className="fr-entry"><span>{entry.kind === 'http' ? 'HTTP · PROPOSED API' : entry.kind === 'developer' ? 'DEVELOPER / CLI' : 'INTERNAL CALL'} · {lang === 'zh' ? '建議入口，未在此網站實作' : 'Proposed entry, not implemented by this website'}</span><pre><code>{entryText}</code></pre></div>
    <h4>{lang === 'zh' ? '條件路由及資料交接' : 'Conditional routing and data handoffs'}</h4>
    <ol className="fr-route-list">{financeFunctionRoutes[guide.id].map((route, index) => <li key={index}><strong>{route.from} → {route.to}</strong><p>{pick(route.when, lang)}</p><small>{lang === 'zh' ? '交接資料：' : 'Handoff: '}{pick(route.payload, lang)}</small></li>)}</ol>
    <div className="fr-flow-root"><GitBranch size={20} aria-hidden="true"/><strong>{pick(guide.title, lang)}</strong><span>{lang === 'zh' ? '沿箭嘴閱讀，點選步驟了解技術' : 'Follow the arrows; select a step to inspect its technique'}</span></div>
    <ArrowDown className="fr-down" size={20} aria-hidden="true"/>
    <ol className="fr-flow-steps" aria-label={`${pick(guide.title, lang)} · ${lang === 'zh' ? '處理流程' : 'processing workflow'}`}>
      {guide.steps.map((item, index) => <li key={item.id}><button type="button" aria-pressed={selected === index} aria-controls={detailId} onClick={() => setSelected(index)}><span>{String(index + 1).padStart(2, '0')} · {item.keyword}</span><strong>{pick(item.action, lang)}</strong><small>{item.tools}</small></button>{index < guide.steps.length - 1 && <ArrowRight className="fr-step-arrow" size={20} aria-hidden="true"/>}</li>)}
    </ol>
    <section className="fr-step-detail" id={detailId} aria-live="polite" aria-atomic="true">
      <div><p className="eyebrow">{String(selected + 1).padStart(2, '0')} · {step.keyword}</p><h4>{pick(step.action, lang)}</h4><p className="fr-step-tools">{step.tools}</p></div>
      <dl><div><dt>{lang === 'zh' ? '點樣應用？' : 'How is it applied?'}</dt><dd>{pick(step.how, lang)}</dd></div><div><dt>{lang === 'zh' ? '點解用呢項技術？' : 'Why use this technique?'}</dt><dd>{pick(step.why, lang)}</dd></div></dl>
      <div className="fr-files"><span>{lang === 'zh' ? '將來 app 嘅建議檔案' : 'Proposed application files'}</span>{step.proposedFiles.map(file => <code key={file}>{file}</code>)}</div>
    </section>
    <ArrowDown className="fr-down" size={20} aria-hidden="true"/>
    <div className="fr-decision"><ShieldCheck size={22} aria-hidden="true"/><div><strong>{lang === 'zh' ? '檢查通過？證據足夠？' : 'Checks passed? Enough evidence?'}</strong><span>{lang === 'zh' ? '依條件走不同回傳分支' : 'Follow the matching return branch'}</span></div></div>
    <div className="fr-branches">{guide.branches.map(branch => <section key={branch.kind} data-outcome={branch.kind}><div>{branch.kind === 'success' ? <Check size={17} aria-hidden="true"/> : branch.kind === 'failure' ? <X size={17} aria-hidden="true"/> : <GitBranch size={17} aria-hidden="true"/>}<h4>{branch.kind === 'success' ? lang === 'zh' ? '成功' : 'Success' : branch.kind === 'failure' ? lang === 'zh' ? '失敗' : 'Failure' : lang === 'zh' ? '資料不足／有限結果' : 'Insufficient / limited'}</h4></div><p className="fr-branch-condition">{pick(branch.condition, lang)}</p><p>{pick(branch.result, lang)}</p><small>{pick(branch.next, lang)}</small></section>)}</div>
    <p className="fr-return-path">{entry.kind === 'http' ? lang === 'zh' ? '回傳路徑：FastAPI → Next.js 伺服器 → 瀏覽器顯示結果或錯誤' : 'Return path: FastAPI → Next.js server → browser result or error' : entry.kind === 'developer' ? lang === 'zh' ? '回傳路徑：程序 → 開發者／CI 記錄；唔係瀏覽器 API' : 'Return path: process → developer / CI record, not a browser API' : lang === 'zh' ? '回傳路徑：此步驟 → graph 內部呼叫者；最終驗證後結果才送到使用者' : 'Return path: this step → internal graph caller; only the final validated output reaches the user'}</p>
    <div className="fr-acceptance"><strong>{lang === 'zh' ? '點樣證明做得到？' : 'How do you prove it works?'}</strong><ul>{guide.acceptance.map(item => <li key={item.en}>{pick(item, lang)}</li>)}</ul></div>
  </div>;
}
