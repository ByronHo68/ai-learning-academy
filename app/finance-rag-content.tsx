'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, GitBranch, Layers, Pause, Play, RotateCcw } from 'lucide-react';
import { pick, type Lang } from '../lib/curriculum';
import {
  joinRagEmbeddings, ragAnswer, ragArticle, ragChunks, ragContext, ragEmbedding, ragEmbeddingRequest,
  ragExampleResponse, ragGap, ragHostedStorage, ragLinks, ragModelChoices, ragNews, ragQueryRequest, ragQuestion,
  ragScenarios, ragStoryPath, ragWorkflow, type RagStoryScenario,
} from '../lib/finance-rag-story';
import { FinanceDiagramCanvas } from './finance-diagram';

const chunkIds = ragChunks.map(chunk => chunk.chunk_id);
const goodReply = ragExampleResponse(false);
const invalidReply = ragExampleResponse(true);
const goodJoin = joinRagEmbeddings(goodReply, chunkIds);
const invalidJoin = joinRagEmbeddings(invalidReply, chunkIds);
const handoffStages = new Set(['request', 'response', 'join', 'store']);

function Payload({ title, value }: { title: string; value: unknown }) {
  return <article className="rag-payload"><h4>{title}</h4><pre>{JSON.stringify(value, null, 2)}</pre></article>;
}

function EmbeddingHandoff({ lang, invalid, step }: { lang: Lang; invalid: boolean; step: string }) {
  const zh = lang === 'zh';
  const [inputIndex, setInputIndex] = useState(0);
  const reply = invalid ? invalidReply : goodReply;
  const joined = invalid ? invalidJoin : goodJoin;
  const visibleReply = step !== 'request';
  const visibleRows = step === 'join' || step === 'store';
  const previewReply = {
    ...reply,
    data: reply.data.map(({ embedding, ...item }) => ({ ...item, embedding: embedding.slice(0, 3) })),
  };

  return <div className="rag-handoff">
    <h4>{zh ? '輸入位置 → API index → 段落 ID' : 'Input position → API index → chunk ID'}</h4>
    <p>{zh ? '選取輸入位置，查看回應中相同 index 的向量。模型回應可以按不同次序排列。' : 'Select an input position to trace the corresponding API index. The example returns the vectors in reverse order.'}</p>
    <div className="rag-map">
      <div>
        <strong>{zh ? 'Worker 的本機對照' : 'Worker’s local input map'}</strong>
        {chunkIds.map((id, index) => <button key={id} type="button" aria-pressed={inputIndex === index}
          onClick={() => setInputIndex(index)}><code>input[{index}]</code><ArrowRight size={14}/><code>{id}</code></button>)}
      </div>
      <div>
        <strong>{zh ? 'OpenRouter 回傳次序' : 'OpenRouter reply order'}</strong>
        {visibleReply ? reply.data.map(item => <div className="rag-map-item" key={item.index} data-active={item.index === inputIndex}>
          <code>index: {item.index}</code>
          <span>{item.embedding.length} {zh ? '維' : 'dimensions'}</span>
        </div>) : <p>{zh ? '下一步查看回應。' : 'Advance to see the response.'}</p>}
      </div>
    </div>
    <div className="rag-payload-grid">
      <Payload title="POST https://openrouter.ai/api/v1/embeddings" value={ragEmbeddingRequest}/>
      {visibleReply && <Payload title={zh ? '模擬回應 · 向量只顯示前 3 個值' : 'Simulated reply · first 3 values per vector'} value={previewReply}/>}
    </div>
    {visibleRows && (joined.kind === 'validated' ?
      <div className="rag-result">
        <p>{zh ? '核對成功。以 chunk_id 對應資料庫原文及來源，再以 (chunk_id, model_key) 寫入向量。' : 'Validation passed. Join on chunk_id to recover the text and source, then write the vector by (chunk_id, model_key).'}</p>
        <Payload title={zh ? 'App 配對結果 · 向量預覽' : 'App’s joined record · vector preview'} value={{
          ...ragChunks[inputIndex],
          source_url: ragArticle.source_url,
          published_at: ragArticle.published_at,
          model_key: joined.rows[inputIndex].model_key,
          dimensions: joined.rows[inputIndex].embedding.length,
          embedding_preview: joined.rows[inputIndex].embedding.slice(0, 3),
        }}/>
      </div> :
      <p className="rag-result rag-stop">{zh ? '拒絕整批向量。index 1 回傳 384 維，應為 1,536 維。使用快照內仍可用的全文證據。' : 'Reject the batch. Index 1 returned 384 dimensions and the worker expected 1,536. The run can use eligible full-text evidence in its snapshot.'}</p>)}
  </div>;
}

function RagStory({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const [scenario, setScenario] = useState<RagStoryScenario>('hybrid');
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const path = ragStoryPath(scenario);
  const stage = path[position];
  const last = position === path.length - 1;
  const running = playing && !last;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setPosition(position + 1), 2400);
    const pauseIfHidden = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', pauseIfHidden);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', pauseIfHidden);
    };
  }, [position, running]);

  function show(next: number) {
    setPlaying(false);
    setPosition(next);
  }

  const stepDetail = stage.id === 'retrieve' && scenario === 'invalid' ?
    (zh ? '向量批次無效。此例以已接納的全文索引搜尋同一快照，毋須為問題建立向量。' : 'The vector batch failed. This run searches the same snapshot with full-text retrieval and skips query embedding.') :
    pick(stage.detail, lang);

  return <section className="finance-section" id="rag-animation">
    <h2>{zh ? '逐步追蹤一篇新聞' : 'Follow one article through RAG'}</h2>
    <p>{zh ? '用下一步查看資料如何交接，或直接跳到「配對」檢查向量及 metadata。' : 'Advance to inspect each handoff, or jump to Join to match vectors to your metadata.'}</p>
    <div className="vd-scenarios" role="group" aria-label={zh ? 'RAG 情境' : 'RAG scenarios'}>
      {ragScenarios.map(item => <button key={item.id} type="button" aria-pressed={item.id === scenario}
        onClick={() => { setScenario(item.id); show(0); }}>{pick(item.label, lang)}</button>)}
    </div>
    <div className="vd-controls">
      <button type="button" onClick={() => {
        if (last) setPosition(0);
        setPlaying(!running);
      }}>{running ? <Pause size={16}/> : <Play size={16}/>}
        {running ? (zh ? '暫停' : 'Pause') : (zh ? '播放' : 'Play')}
      </button>
      <button type="button" disabled={position === 0} onClick={() => show(position - 1)}>{zh ? '上一步' : 'Previous'}</button>
      <button type="button" disabled={last} onClick={() => show(position + 1)}>{zh ? '下一步' : 'Next'}</button>
      <button type="button" onClick={() => show(0)}><RotateCcw size={16}/>{zh ? '重設' : 'Reset'}</button>
      <span>{position + 1} / {path.length}</span>
    </div>
    <ol className="rag-steps">
      {path.map((item, i) => <li key={item.id}><button type="button" aria-current={position === i ? 'step' : undefined}
        onClick={() => show(i)}>{i + 1}. {pick(item.label, lang)}</button></li>)}
    </ol>
    <article className="vd-stage rag-stage">
      <h3 aria-live={running ? 'off' : 'polite'}>{pick(stage.title, lang)}</h3>
      <p>{stepDetail}</p>
      {stage.id === 'fetch' && <Payload title="YFinance MCP → n8n" value={ragNews}/>}
      {stage.id === 'admit' && <Payload title="stock_rag.source_versions · example excerpt" value={ragArticle}/>}
      {stage.id === 'chunk' && <Payload title="stock_rag.chunks · example fields" value={ragChunks}/>}
      {handoffStages.has(stage.id) && <EmbeddingHandoff lang={lang} invalid={scenario === 'invalid'} step={stage.id}/>}
      {stage.id === 'snapshot' && <Payload title={zh ? '快照預覽' : 'Snapshot preview'} value={{
        snapshot_id: ragContext.snapshot_id,
        company: ragNews.symbol,
        as_of: '2026-11-20T10:00:00Z',
        eligible_chunk_ids: chunkIds,
        ready_vector_chunk_ids: scenario === 'invalid' ? [] : chunkIds,
      }}/>}
      {stage.id === 'retrieve' && scenario !== 'invalid' && <Payload title={zh ? '混合檢索：同一模型編碼問題' : 'Hybrid retrieval: encode the question with the same model'} value={{ ...ragQueryRequest, input: [pick(ragQuestion, lang)] }}/>}
      {stage.id === 'rerank' && <ol className="rag-passages">{[ragChunks[1], ragChunks[0]].map(chunk =>
        <li key={chunk.chunk_id}><code>{chunk.chunk_id}</code> {chunk.excerpt}</li>)}</ol>}
      {stage.id === 'review' && <p className="rag-result">{scenario === 'insufficient' ?
        (zh ? '排除 demo-c2 後，只剩描述容量的 demo-c1。' : 'Removing demo-c2 leaves demo-c1, which describes capacity.') :
        (zh ? '選取 demo-c2 做支出證據，引用 ID 為 S1。' : 'Select demo-c2 for spending evidence and assign citation ID S1.')}</p>}
      {stage.id === 'generate' && <Payload title="POST /chat/completions · context excerpt" value={{ ...ragContext, question: pick(ragQuestion, lang) }}/>}
      {stage.id === 'validate' && <div className="rag-result"><blockquote>{pick(ragAnswer, lang)}</blockquote>
        <p><code>[S1] → demo-c2 → demo-source-v1</code> · <a href={ragArticle.source_url}>{ragArticle.title}</a></p></div>}
      {stage.id === 'gap' && <p className="rag-result rag-stop">{pick(ragGap, lang)}</p>}
    </article>
  </section>;
}

export default function FinanceRagContent({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  return <main className="utility-page finance-page vd-page rag-page">
    <Link className="fr-inline-link" href="/finance-project"><ArrowLeft size={16}/>{zh ? '返回股票研究項目' : 'Back to the stock research project'}</Link>
    <header className="utility-hero">
      <p className="eyebrow">RAG · n8n · OpenRouter · PostgreSQL</p>
      <h1>{zh ? '跟著一篇新聞走到有引用的答案。' : 'Follow one news article to a cited answer.'}</h1>
      <p>{zh ? 'RAG 即檢索增強生成：先檢索原文，將相關段落加入 prompt，再生成及核對答案。試試你的 app 如何把 OpenRouter 回傳的向量配對至自己保存的 metadata。' : 'Retrieval-augmented generation finds evidence, adds the relevant passages to a prompt, and generates an answer. See how your app matches OpenRouter’s vectors to its own metadata before any report uses the passages.'}</p>
      <div className="fr-hero-actions">
        <a className="primary-action" href="#rag-animation"><Play size={17}/>{zh ? '播放 RAG 故事' : 'Play the RAG storyline'}</a>
        <a className="secondary-action" href="#rag-flow"><GitBranch size={17}/>{zh ? '查看項目流程' : 'See the workflow'}</a>
        <a className="secondary-action" href="/downloads/stock-research-rag-story.md" download>{zh ? '下載步驟及 JSON' : 'Download steps and JSON'}</a>
      </div>
    </header>
    <div className="fr-disclosure"><Layers size={23}/><p>{zh ? '此離線教材使用虛構新聞及模擬 API 回應。配對及維度檢查在瀏覽器執行。正式檢索仍以全文為預設，OpenRouter embedding 是待評估的候選。' : 'This offline lesson uses fictional news and simulated API replies. The browser runs the index and dimension checks. Full-text retrieval remains the project default, and OpenRouter embedding is a candidate for evaluation.'}</p></div>
    <RagStory lang={lang}/>
    <section className="finance-section" id="rag-flow">
      <h2>{zh ? '工作流程：建索引與回答問題' : 'The indexing and question workflows'}</h2>
      <p>{zh ? '文件向量由背景 worker 建立。收到問題時，LangGraph 固定已接納證據及已就緒向量，再進行檢索。圖中的兩段流程可在不同時間執行。' : 'A background worker builds document vectors. On an accepted question, LangGraph pins eligible evidence and ready vectors before searching. These two parts of the workflow can run at different times.'}</p>
      <FinanceDiagramCanvas diagram={ragWorkflow} lang={lang}/>
      <p><Link href="/finance-project/n8n">n8n</Link> · <Link href="/finance-project/chunking">{zh ? '切段及 metadata' : 'Chunking and metadata'}</Link> · <Link href="/finance-project/rerank-hnsw">{zh ? '重排與 HNSW' : 'Reranking and HNSW'}</Link> · <Link href="/finance-project/report#report-story">{zh ? '報告設計與匯出' : 'Report design and export'}</Link></p>
    </section>
    <section className="finance-section" id="rag-models">
      <h2>{zh ? '選擇 embedding 模型' : 'Choose an embedding model'}</h2>
      <div className="rag-payload-grid">{ragModelChoices.map(model => <article className="rag-payload" key={model.title}>
        <h3><code>{model.title}</code></h3><strong>{pick(model.badge, lang)}</strong><p>{pick(model.body, lang)}</p>
      </article>)}</div>
      <p>{pick(ragHostedStorage, lang)}</p>
      <ul>{ragLinks.map(link => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul>
    </section>
  </main>;
}
