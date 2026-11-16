'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { pick, type Lang } from '../lib/curriculum';
import { openRouterCalls, openRouterDiagram, openRouterGuide, openRouterReferences, openRouterScenarios } from '../lib/finance-openrouter';
import { FinanceDiagramCanvas } from './finance-diagram';

export default function FinanceOpenRouterContent({ lang }: { lang: Lang }) {
  const [scenarioId, setScenarioId] = useState('supported');
  const scenario = openRouterScenarios.find(item => item.id === scenarioId) ?? openRouterScenarios[0];
  return <main className="utility-page finance-page vd-page"><Link className="fr-inline-link" href="/finance-project"><ArrowLeft size={16}/>{lang === 'zh' ? '返回股票研究項目' : 'Back to the stock research project'}</Link>
    <header className="utility-hero"><p className="eyebrow">OPENROUTER · EVERY GENERATIVE CALL · SERVER ONLY</p><h1>{lang === 'zh' ? 'Scope、補查、報告，全部經 OpenRouter。' : 'Scope, refinement and reports through OpenRouter.'}</h1><p>{lang === 'zh' ? '共用一個伺服器 gateway，固定模型／provider、限制用量，保留隱私及證據驗證。新聞、embedding、重排及資料庫各自負責其他工作。' : 'Use one server-side gateway with explicit models/providers, bounded usage, privacy and evidence checks. News, embeddings, reranking and the database keep their separate jobs.'}</p><div className="fr-hero-actions"><a className="primary-action" href="#openrouter-calls">{lang === 'zh' ? '查看每次呼叫' : 'See every call'}</a><a className="secondary-action" href="/downloads/stock-research-openrouter-guide.md" download>{lang === 'zh' ? '下載雙語整合指南' : 'Download bilingual integration guide'}</a></div></header>
    <div className="fr-disclosure"><GitBranch size={24}/><p>{lang === 'zh' ? '已加入可供未來研究服務使用的 Python adapter 及離線 HTTP fixture 測試；網站沒有使用你的 API key 或發出付費呼叫。真實 OpenRouter／金融後端及持久預算整合為 NOT RUN。要上線仍須提供私人設定、持久 reservation callback、經測試隱私 sanitizer 及服務接線。' : 'The repo includes a Python adapter for the future research service and offline HTTP-fixture tests. This website uses no API key and makes no paid calls. Live OpenRouter/finance-backend and durable-budget integration are NOT RUN. Live use still needs private configuration, a durable reservation callback, a tested privacy sanitizer and service wiring.'}</p></div>
    <section className="finance-section" id="openrouter-calls"><h2>{lang === 'zh' ? '每個生成 LLM 呼叫在哪裡？' : 'Where is every generative LLM call?'}</h2><div className="vd-models">{openRouterCalls.map(call => <article key={call.id}><p className="eyebrow">OPENROUTER · {call.id.toUpperCase()} · MAX 1 ATTEMPT</p><h3>{pick(call.title, lang)}</h3><p>{pick(call.when, lang)}</p><p>{pick(call.input, lang)} → <code>{call.output}</code></p><code>{call.modelEnv}</code><p>{lang === 'zh' ? '沒有角色覆寫則用 OPENROUTER_MODEL。' : 'Uses OPENROUTER_MODEL when no role override is set.'}</p><strong>{call.tokens} output tokens · ≤{call.seconds}s</strong><p className="vd-caption">{lang === 'zh' ? '均受剩餘 60 秒處理預算限制，不是實測延遲。' : 'Clipped to the remaining 60s active budget; not measured latency.'}</p></article>)}</div></section>
    <section className="finance-section" id="openrouter-demo"><h2>{lang === 'zh' ? '哪些情境需要幾次呼叫？' : 'How many calls does each scenario need?'}</h2><div className="fg-scenarios">{openRouterScenarios.map(item => <button type="button" key={item.id} aria-pressed={scenarioId === item.id} onClick={() => setScenarioId(item.id)}>{pick(item.title, lang)}</button>)}</div><article className="vd-stage" aria-live="polite"><h3>{scenario.roles.join(' → ')}</h3><p>{pick(scenario.result, lang)}</p><strong>{lang === 'zh' ? '規劃／示例嘗試：' : 'Planned/illustrated attempts: '}{scenario.roles.length} / 3</strong><p>{lang === 'zh' ? '真實外部呼叫：0。新聞與搜尋次數另計；API 失敗不算「沒有新聞」。' : 'Real external calls: 0. News/search budgets are separate; an API outage does not mean no news exists.'}</p></article></section>
    <section className="finance-section" id="openrouter-flow"><h2>{lang === 'zh' ? '每角色共用同一 API 邊界' : 'Every role shares one API boundary'}</h2><FinanceDiagramCanvas diagram={openRouterDiagram} lang={lang}/></section>
    <section className="finance-section" id="openrouter-setup"><h2>{lang === 'zh' ? '如何套用到你的 app？' : 'How do you apply this in your app?'}</h2><div className="fr-scope-grid fr-evidence-grid">{openRouterGuide.map(item => <article key={item.title.en}><h3>{pick(item.title, lang)}</h3><p>{pick(item.body, lang)}</p></article>)}</div><pre className="fr-tree"><code>{`# Private Python service environment; never NEXT_PUBLIC_ or browser storage.
OPENROUTER_API_KEY=<your-private-key>
OPENROUTER_MODEL=<exact-reviewed-model-slug>
OPENROUTER_PROVIDER=<approved-provider-endpoint>
# Optional: OPENROUTER_SCOPE_MODEL / OPENROUTER_REFINE_MODEL / OPENROUTER_REPORT_MODEL
# Optional matching *_PROVIDER overrides. Start with the shared settings above.`}</code></pre><pre className="fr-tree"><code>{`# Adapter uses httpx + Pydantic; no model SDK required.
# In FastAPI lifespan: load Settings.from_env(), create one shared gateway.
async with OpenRouterGateway(
    Settings.from_env(),
    reserve_call=durable_run_ledger.reserve,  # Implement atomically in PostgreSQL.
    sanitize=privacy_service.sanitize,       # Supply the tested privacy policy.
) as gateway:
    scope = await gateway.complete("scope", safe_scope_payload, run_id=owned_run_id)
    if scope.result.decision == "accepted":
        # Host refreshes news once, pins snapshot, retrieves and checks evidence.
        if missing_facets and search_budget_remains:
            refinement = await gateway.complete("refine", safe_refine_payload, run_id=owned_run_id)
            # Host performs search 2 of 2 and rechecks selection/coverage.
        if evidence_gate_passed:
            report = await gateway.complete("report", safe_report_payload, run_id=owned_run_id)
# Sketch only: prerequisite variables come from code-owned graph checks.`}</code></pre><p>{lang === 'zh' ? '這裡是接線示意，ledger 及 privacy service 須由 host 提供。可先在 repo 執行下面完全離線的 adapter 示範；它不讀私人金鑰、不連 OpenRouter。' : 'This is a wiring sketch: the host must provide the ledger and privacy service. Start with the repo’s completely offline adapter demo below; it reads no private key and never connects to OpenRouter.'}</p><pre className="fr-tree"><code>{`python3 -m venv integrations/finance_openrouter/.venv
source integrations/finance_openrouter/.venv/bin/activate
python -m pip install -r integrations/finance_openrouter/requirements.txt
python -m integrations.finance_openrouter.demo
python -m unittest discover -s integrations/finance_openrouter/tests -v
# Expected: 3 fixture attempts, 0 real external calls; live integration NOT RUN.`}</code></pre><div className="fr-hero-actions"><a href="/downloads/finance-openrouter-client.py" download>{lang === 'zh' ? '下載 Python adapter' : 'Download Python adapter'}</a><a href="/downloads/finance-openrouter-nodes.py" download>{lang === 'zh' ? '下載 graph 節點接線' : 'Download graph node wiring'}</a><a href="/downloads/finance-openrouter.env.example" download>{lang === 'zh' ? '下載私人設定範本' : 'Download server configuration template'}</a></div><p><Link href="/finance-project/workflows#finance-privacy">{lang === 'zh' ? 'PII 政策' : 'PII policy'}</Link> · <Link href="/finance-project/checkpoints">AsyncPostgresSaver</Link> · <Link href="/finance-project/rerank-hnsw">{lang === 'zh' ? 'Embedding 與重排' : 'Embeddings and reranking'}</Link> · <Link href="/finance-project/workflows">{lang === 'zh' ? '整體工作流程' : 'Overall workflow'}</Link></p></section>
    <section className="finance-section"><h2>{lang === 'zh' ? '官方參考' : 'Official references'}</h2><ul>{openRouterReferences.map(item => <li key={item.url}><a href={item.url}>{item.title}</a></li>)}</ul></section>
  </main>;
}
