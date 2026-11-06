'use client';

import { useState } from 'react';
import { type Lang, pick } from '../lib/curriculum';
import { financeContextExample, financeGraphNodes, financeGraphScenarios, financeGraphState, financeGraphWiring, financeScenarioPath, type FinanceGraphScenarioId } from '../lib/finance-graph';

export function FinanceGraphContent({ lang }: { lang: Lang }) {
  const [scenarioId, setScenarioId] = useState<FinanceGraphScenarioId>('supported');
  const [position, setPosition] = useState(0);
  const scenario = financeGraphScenarios.find(item => item.id === scenarioId) ?? financeGraphScenarios[0];
  const path = financeScenarioPath(scenarioId);
  const current = path[position] ?? path[0];
  const detail = financeGraphNodes[current];
  const visited = path.slice(0, position + 1);
  return <section className="finance-section fg-section" id="finance-langgraph-map">
    <span id="finance-workflow" className="fr-anchor"/>
    <p className="eyebrow">LANGGRAPH · STATE → NODES → CONDITIONAL EDGES</p>
    <h2>{lang === 'zh' ? '由向量資料庫到 LLM：每一步點決定？' : 'From vector database to LLM: what happens at each step?'}</h2>
    <p>{lang === 'zh' ? '選情境，再逐步前進。這是固定案例的離線流程示範，沒有執行 LangGraph、向量搜尋、重排模型或 LLM。假設新聞已切段及索引；真實版在接納提示後仍須經 n8n 刷新，再固定快照。混合搜尋必須先通過准入評估。' : 'Choose a scenario and step through it. This is an offline walkthrough of fixed cases; it does not execute LangGraph, vector search, a reranker or an LLM. Assume news is already chunked and indexed. The live design still refreshes accepted prompts through n8n before pinning a snapshot. Hybrid search requires admission first.'}</p>
    <div className="fg-scenarios" role="group" aria-label={lang === 'zh' ? '流程情境' : 'Workflow scenarios'}>{financeGraphScenarios.map(item => <button type="button" key={item.id} aria-pressed={scenarioId === item.id} onClick={() => { setScenarioId(item.id); setPosition(0); }}>{pick(item.title, lang)}</button>)}</div>
    <p className="fg-prompt"><strong>{lang === 'zh' ? '案例提示：' : 'Case prompt: '}</strong>{pick(scenario.prompt, lang)}</p>
    <ol className="fg-path" aria-label={lang === 'zh' ? '此情境的節點及箭嘴' : 'Nodes and arrows for this scenario'}>{path.map((key, index) => <li key={`${key}-${index}`} data-visited={index <= position}><button type="button" aria-current={index === position ? 'step' : undefined} onClick={() => setPosition(index)}><small>{index + 1}</small>{financeGraphNodes[key].label}</button>{index < path.length - 1 && <span aria-hidden="true">→</span>}</li>)}</ol>
    <div className="fg-node" aria-live="polite" aria-atomic="true">
      <p className="eyebrow">{position + 1} / {path.length} · {detail.label}</p>
      <dl><div><dt>{lang === 'zh' ? '讀取' : 'Reads'}</dt><dd>{detail.input}</dd></div><div><dt>{lang === 'zh' ? '寫入／交給下一步' : 'Writes / hands off'}</dt><dd>{detail.output}</dd></div></dl>
      <p>{pick(detail.how, lang)}</p>
      <p>{lang === 'zh' ? '示範已走過：' : 'Walkthrough stages reached: '}{visited.filter(key => key === 'retrieve').length} {lang === 'zh' ? '輪檢索' : 'retrieval rounds'} · {visited.filter(key => key === 'generate').length} {lang === 'zh' ? '次生成階段' : 'generation stages'} · {lang === 'zh' ? '真實外部呼叫：0' : 'actual external calls: 0'}</p>
      {position === path.length - 1 && <p className="fg-outcome"><strong>{lang === 'zh' ? '回傳：' : 'Return: '}</strong>{pick(scenario.result, lang)}</p>}
    </div>
    <div className="proposal-actions"><button type="button" className="secondary-action" onClick={() => setPosition(0)} disabled={position === 0}>{lang === 'zh' ? '重新開始' : 'Restart'}</button><button type="button" className="primary-action" onClick={() => setPosition(previous => Math.min(previous + 1, path.length - 1))} disabled={position === path.length - 1}>{lang === 'zh' ? '下一個節點 →' : 'Next node →'}</button></div>
    <details className="proposal-workflow"><summary>{lang === 'zh' ? '實際送入 LLM 的內容係咩？' : 'What exactly is sent to the LLM?'}</summary><p>{lang === 'zh' ? '以下是「證據充足」案例的虛構輸入示例，並非目前所選情境的真實結果。無關提示或證據不足路徑不會走到生成。System policy、使用者問題及原文資料須分開；向量值與重排分數不能代替原文。' : 'This fictional input illustrates the sufficient-evidence case, not a live result for the selected scenario. Irrelevant and insufficient paths never reach generation. Keep system policy, user question and source data separate; vectors and reranker scores cannot replace excerpts.'}</p><pre><code>{financeContextExample}</code></pre></details>
    <details className="proposal-workflow"><summary>{lang === 'zh' ? 'LangGraph 狀態、節點實作及恢復設計' : 'LangGraph state, node implementation and recovery'}</summary><p>{pick(financeGraphState, lang)}</p><p>{lang === 'zh' ? '節點只回傳狀態更新；固定規則決定下一條 edge。工具回傳先驗證，LLM 不可設定 route。Checkpoint 用相同 thread_id；重試保留原時限及次數。對每個昂貴節點加 budget guard、錯誤分類及 OTel span。' : 'Nodes return state updates; code chooses the next edge. Validate tool results before state updates; the LLM cannot set route. Checkpoints use the same thread_id, original deadline and attempt counts. Wrap expensive nodes with budget guards, error mapping and OTel spans.'}</p><pre><code>{financeGraphWiring}</code></pre><a href="/downloads/stock-research-graph.py" download>{lang === 'zh' ? '下載 Python 接線示例（節點實作待接駁）' : 'Download Python wiring sketch (node implementations required)'}</a></details>
    <a className="fr-inline-link" href="/downloads/financial-report-langgraph-design.md" download>{lang === 'zh' ? '下載完整節點及情境設計' : 'Download the full node and scenario design'} ↓</a>
  </section>;
}
