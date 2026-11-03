'use client';

import { useId, useState } from 'react';
import { type Lang, pick } from '../lib/curriculum';
import { financeRagNodes } from '../lib/finance-rag-workflow';

type RagNodeId = keyof typeof financeRagNodes;

export function FinanceRagWorkflow({ lang }: { lang: Lang }) {
  const detailId = useId();
  const [selected, setSelected] = useState<RagNodeId>('fusion');
  const active = financeRagNodes[selected];
  const node = (id: RagNodeId) => {
    const item = financeRagNodes[id];
    return <button type="button" className={`rag-flow-node rag-flow-${id}`} aria-pressed={selected === id} aria-controls={detailId} onClick={() => setSelected(id)}><span>{item.keyword}</span><strong>{pick(item.title, lang)}</strong><small>{item.tools}</small></button>;
  };
  const arrow = <span className="rag-flow-arrow" aria-hidden="true">→</span>;

  return <section className="finance-section rag-guide" id="finance-rag-workflow" aria-labelledby="finance-rag-title">
    <div className="finance-section-heading"><p className="eyebrow">HYBRID RAG · FIND EVIDENCE BEFORE ANSWERING</p><h2 id="finance-rag-title">{lang === 'zh' ? '建議的 RAG 工作流程' : 'The proposed RAG workflow'}</h2><p>{lang === 'zh' ? '把語意相似搜尋與關鍵詞搜尋並行，再合併成一組可引用的證據。以下是未來財報專案的互動設計圖，並非正在執行的檢索服務。點選節點可查看它的責任、技術及檢查。' : 'Search by meaning and by keywords in parallel, then combine the results into evidence the answer can cite. This is an interactive design for your future finance project, not a running retrieval service. Select a node to see its responsibility, technology and checks.'}</p></div>

    <div className="rag-guide-summary"><p><b>DENSE + KEYWORD</b>{lang === 'zh' ? '先各自建立及驗證搜尋。' : 'Build and check each search first.'}</p><p><b>HYBRID + RRF</b>{lang === 'zh' ? '以名次合併兩組結果。' : 'Combine both result rankings.'}</p><p><b>HNSW · LATER</b>{lang === 'zh' ? '量度速度及召回率後才加入。' : 'Add after measuring speed and recall.'}</p></div>

    <div className="rag-guide-workspace">
      <div className="rag-flow" role="group" aria-label={lang === 'zh' ? '混合檢索至答案的流程圖' : 'Hybrid retrieval to answer workflow diagram'}>
        <div className="rag-flow-row rag-flow-entry">{node('question')}{arrow}{node('scope')}</div>
        <p className="rag-flow-connector"><span aria-hidden="true">↓</span>{lang === 'zh' ? '兩條搜尋路徑均套用相同權限及報告範圍' : 'Apply the same access and report scope to both searches'}</p>
        <div className="rag-flow-parallel"><div><p className="rag-flow-lane-label">A · {lang === 'zh' ? '按意思搜尋' : 'SEARCH BY MEANING'}</p>{node('dense')}</div><div><p className="rag-flow-lane-label">B · {lang === 'zh' ? '按詞語搜尋' : 'SEARCH BY TERMS'}</p>{node('keyword')}</div></div>
        <p className="rag-flow-connector"><span aria-hidden="true">↓</span>{lang === 'zh' ? '合併兩組候選段落' : 'Bring both candidate lists together'}</p>
        <div className="rag-flow-row rag-flow-combine">{node('fusion')}{arrow}{node('rerank')}</div>
        <p className="rag-flow-connector"><span aria-hidden="true">↓</span>{lang === 'zh' ? '檢查證據能否支持問題' : 'Check whether the evidence supports the question'}</p>
        <div className="rag-flow-gate">{node('evidence')}</div>
        <div className="rag-flow-outcomes">
          <div className="rag-flow-supported"><p className="rag-flow-lane-label">YES · {lang === 'zh' ? '有足夠支持證據' : 'SUFFICIENT EVIDENCE'} <span aria-hidden="true">↓</span></p>{node('llm')}<span className="rag-flow-down" aria-hidden="true">↓</span>{node('validate')}<span className="rag-flow-down" aria-hidden="true">↓</span>{node('answer')}</div>
          <div className="rag-flow-insufficient"><p className="rag-flow-lane-label">NO · {lang === 'zh' ? '證據不足' : 'INSUFFICIENT EVIDENCE'} <span aria-hidden="true">↓</span></p>{node('missing')}<p className="rag-flow-stop">{lang === 'zh' ? '指出缺少的來源或原因證據。更強模型不能補出缺失事實。' : 'Identify the missing source or causal evidence. A stronger model cannot supply the missing facts.'}</p><a href="#finance-models">{lang === 'zh' ? '查看模型選擇及預算規則' : 'Explore model selection and budget rules'} →</a></div>
        </div>
      </div>

      <aside className="rag-guide-detail" id={detailId} aria-live="polite" aria-atomic="true"><p className="eyebrow">{lang === 'zh' ? '所選步驟' : 'SELECTED STEP'}</p><span className="rag-guide-detail-keyword">{active.keyword}</span><h3>{pick(active.title, lang)}</h3><p>{pick(active.detail, lang)}</p><dl><dt>{lang === 'zh' ? '技術' : 'Technology'}</dt><dd>{active.tools}</dd><dt>{lang === 'zh' ? '核心工作流程檔案' : 'Core workflow files'}</dt><dd><code>services/finance/app/retrieval.py</code><code>services/finance/app/agents/graph.py</code></dd></dl><p className="rag-guide-detail-note">{lang === 'zh' ? '先本機開發及測試；第 7 階段再把相同程式、資料庫擴充功能及 migration 打包到 Docker。' : 'Develop and test locally first. At stage 7, package the same code, database extension and migrations in Docker.'}</p></aside>
    </div>

    <details className="rag-guide-explainer"><summary>{lang === 'zh' ? 'Dense、Sparse、HNSW 及 Hybrid 有甚麼分別？' : 'How are dense, sparse, HNSW and hybrid different?'}</summary><div className="rag-guide-concepts"><article><h3>Dense vectors</h3><p>{lang === 'zh' ? '把段落和問題轉成數字表示，搜尋語意相似內容。首版用 pgvector 的精確搜尋作基準；中英跨語言檢索須用合適的多語嵌入模型並驗證。' : 'Represent passages and questions numerically to search for similar meaning. Start with exact pgvector search as the baseline; evaluate a suitable multilingual embedding model for Chinese questions over English reports.'}</p></article><article><h3>Keyword / sparse</h3><p>{lang === 'zh' ? '首版用 PostgreSQL tsvector、GIN 及 ts_rank_cd 搜尋詞語，這不是 BM25。學習式稀疏模型以加權詞語表示內容，可作之後的獨立實驗；混合搜尋不要求先加入這種模型。' : 'Start with PostgreSQL tsvector, GIN and ts_rank_cd for term matching; this is not BM25. Learned sparse models represent content with weighted terms and can be a later experiment. Hybrid retrieval does not require adding one first.'}</p></article><article><h3>Hybrid + RRF</h3><p>{lang === 'zh' ? 'Hybrid 是合併搜尋方式；RRF 是依名次合併的方法，毋須把不同尺度的原始分數直接相加。依 chunk ID 合併重複候選並保留來源頁碼。' : 'Hybrid combines retrieval methods. RRF merges their ranks without directly adding raw scores measured on different scales. Merge duplicate candidates by chunk ID and preserve source pages.'}</p></article><article><h3>HNSW</h3><p>{lang === 'zh' ? 'HNSW 是加速近似向量搜尋的索引。它需要額外記憶體與建立時間，亦可能漏掉候選；先比較精確搜尋的速度及召回率，特別測試公司、年份及版本篩選後的結果。' : 'HNSW is an index for faster approximate vector search. It adds memory and build costs and can miss candidates. Compare latency and recall against exact search, especially when company, year and version filters apply.'}</p></article></div><p className="rag-guide-note">{lang === 'zh' ? '首版資料是六份英文 PDF。中文問題的關鍵詞路徑可先改寫成英文，保留公司代碼、年份及財務詞語；改寫結果也要驗證。財務數字取自已覆核 SQL 數據，算術由 Python Decimal 處理。' : 'The first release uses six English PDFs. For Chinese questions, the keyword branch can use an English rewrite that preserves company codes, years and financial terms; validate the rewrite too. Read financial values from reviewed SQL facts and calculate with Python Decimal.'}</p></details>

    <div className="rag-guide-evaluation"><h3>{lang === 'zh' ? '怎樣證明這個設計有幫助？' : 'How do you show that this helps?'}</h3><p>{lang === 'zh' ? '用相同的已標記問題比較 dense-only、keyword-only 及 hybrid。記錄有關來源是否被找到、排名、錯公司／錯年份、引用正確性及延遲。之後才比較 reranker 或 HNSW；不要把更複雜當成更準確。' : 'Compare dense-only, keyword-only and hybrid on the same labelled questions. Record relevant-source retrieval, ranking, wrong-company/year results, citation correctness and latency. Then evaluate a reranker or HNSW; added complexity needs evidence of benefit.'}</p><div className="rag-guide-sources"><a href="https://github.com/pgvector/pgvector#hybrid-search" target="_blank" rel="noreferrer">pgvector · hybrid search ↗</a><a href="https://github.com/pgvector/pgvector#filtering" target="_blank" rel="noreferrer">HNSW · filtered search ↗</a><a href="https://www.postgresql.org/docs/current/textsearch-controls.html#TEXTSEARCH-RANKING" target="_blank" rel="noreferrer">PostgreSQL · text ranking ↗</a></div></div>
  </section>;
}
