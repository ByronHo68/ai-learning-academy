'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, GitBranch, Layers, Pause, Play, RotateCcw } from 'lucide-react';
import { pick, type Lang } from '../lib/curriculum';
import {
  chunkConcepts, chunkEncoderExample, chunkExample, chunkMeasurements,
  chunkMetadataGuide, chunkPresetNames, chunkReferences, financeChunkDiagram,
} from '../lib/finance-chunking';
import { FinanceDiagramCanvas } from './finance-diagram';

const downloads = '/downloads/';

function ChunkDemo({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const [articleIndex, setArticleIndex] = useState(0);
  const [presetId, setPresetId] = useState('balanced');
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const article = chunkExample.news[articleIndex];
  const measurement = chunkMeasurements.articles[articleIndex];
  const preset = measurement.variants.find(variant => variant.id === presetId) ?? measurement.variants[0];
  const chunk = preset.chunks[activeIndex];
  const previous = preset.chunks[activeIndex - 1];
  const overlapEnd = Math.min(chunk.endChar, Math.max(chunk.startChar, previous?.endChar ?? 0));
  const sourceField = measurement.sourceField;
  const body = Array.from((sourceField === 'summary' ? article.summary : article.content) ?? '');
  const ending = activeIndex === preset.chunks.length - 1;
  const running = playing && !ending;
  const versionId = `demo-v${articleIndex + 1}`;
  const chunkerConfig = `${chunkMeasurements.policy}:${chunkMeasurements.revision.slice(0, 12)}:${preset.target}:${preset.overlap}`;
  const chunkId = `${versionId}/${chunkerConfig}/${activeIndex}`;
  const format = (n: number) => n.toLocaleString(zh ? 'zh-HK' : 'en-US');

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setActiveIndex(index => index + 1), 1450);
    const pauseWhenHidden = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', pauseWhenHidden);
    };
  }, [activeIndex, running]);

  function show(index: number) {
    setPlaying(false);
    setActiveIndex(index);
  }

  const sourceMetadata = {
    document_id: `demo-doc-${articleIndex + 1}`,
    version_id: versionId,
    source_provider: 'own-yfinance-mcp',
    symbol: chunkExample.symbol,
    title: article.title,
    publisher: article.publisher,
    source_url: article.url,
    published_at: article.publishedAt,
    first_seen_at: '2026-11-17T09:00:00Z',
  };
  const chunkMetadata = {
    chunk_id: chunkId,
    version_id: versionId,
    chunk_index: activeIndex,
    source_field: sourceField,
    start_char: chunk.startChar,
    end_char: chunk.endChar,
    chunker_config: chunkerConfig,
    text_sha256: chunk.textSha256,
    text_tokens: chunk.textTokens,
    input_tokens: chunk.inputTokens,
  };
  const embeddingMetadata = {
    chunk_id: chunkId,
    model_id: chunkMeasurements.model,
    model_revision: chunkMeasurements.revision,
    dimensions: 384,
    prefix: 'passage: ',
    normalize: true,
  };

  return <section className="finance-section chunk-lab" id="chunk-demo">
    <h2>{zh ? '播放切段動畫' : 'Watch an article split into chunks'}</h2>
    <p>{zh ? '選擇一篇新聞和切段設定。時間軸以 Unicode 字元為單位，切段長度與重疊以 E5 token 為單位。' : 'Choose an article and a chunking preset. The timeline shows Unicode characters. E5 tokens determine the chunk size and overlap.'}</p>
    <div className="vd-settings">
      <label>{zh ? '新聞陣列' : 'News array'}
        <select value={articleIndex} onChange={event => { setArticleIndex(Number(event.target.value)); show(0); }}>
          <option value={0}>{zh ? 'news[0] · 8,000 字元英文報道' : 'news[0] · 8,000-character English article'}</option>
          <option value={1}>{zh ? 'news[1] · 中文報道' : 'news[1] · Chinese article'}</option>
          <option value={2}>{zh ? 'news[2] · 只有摘要' : 'news[2] · Summary only'}</option>
        </select>
      </label>
      <label>{zh ? '目標長度及重疊' : 'Target size and overlap'}
        <select value={presetId} onChange={event => { setPresetId(event.target.value); show(0); }}>
          {chunkPresetNames.map(preset => <option value={preset.id} key={preset.id}>{pick(preset.label, lang)}</option>)}
        </select>
      </label>
    </div>
    <div className="chunk-stats">
      <div><strong>{format(measurement.sourceChars)}</strong><span>{zh ? '來源字元' : 'Source characters'}</span></div>
      <div><strong>{format(measurement.sourceTokens)}</strong><span>{zh ? '來源 E5 token' : 'Source E5 tokens'}</span></div>
      <div><strong>{preset.chunks.length}</strong><span>{zh ? '此文章的段數' : 'Chunks for this article'}</span></div>
    </div>
    <div className="vd-controls">
      <button type="button" onClick={() => {
        if (ending) setActiveIndex(0);
        setPlaying(!running);
      }} disabled={preset.chunks.length < 2}>
        {running ? <Pause size={16}/> : <Play size={16}/>}
        {running ? (zh ? '暫停' : 'Pause') : (zh ? '播放' : 'Play')}
      </button>
      <button type="button" disabled={activeIndex === 0} onClick={() => show(activeIndex - 1)}>{zh ? '上一步' : 'Previous'}</button>
      <button type="button" disabled={ending} onClick={() => show(activeIndex + 1)}>{zh ? '下一步' : 'Next'}</button>
      <button type="button" onClick={() => show(0)}><RotateCcw size={16}/>{zh ? '重設' : 'Reset'}</button>
      <span>{activeIndex + 1} / {preset.chunks.length}</span>
    </div>
    <div className="chunk-track" aria-hidden="true">
      <div className="chunk-window" style={{ left: `${chunk.startChar / body.length * 100}%`, width: `${(chunk.endChar - chunk.startChar) / body.length * 100}%` }}/>
      <div className="chunk-overlap" style={{ left: `${chunk.startChar / body.length * 100}%`, width: `${(overlapEnd - chunk.startChar) / body.length * 100}%` }}/>
    </div>
    <div className="chunk-axis"><span>0</span><span>{format(measurement.sourceChars)} {zh ? '字元' : 'characters'}</span></div>
    <div className="vd-scenarios" aria-label={zh ? '選取段落' : 'Select a chunk'}>
      {preset.chunks.map((span, index) => <button type="button" key={span.startChar} aria-pressed={index === activeIndex}
        onClick={() => show(index)}>{zh ? '段落' : 'Chunk'} {index + 1}</button>)}
    </div>
    <article className="vd-stage chunk-passage">
      <h3 aria-live={running ? 'off' : 'polite'}>{sourceField}[{chunk.startChar}:{chunk.endChar}] · {chunk.inputTokens} / {chunkMeasurements.maxInput} {zh ? '模型輸入 token' : 'model input tokens'}</h3>
      <p className="vd-caption">{zh ? '橙色是與上一段重疊的原文。模型輸入已計 passage: 前綴及特殊 token。' : 'Orange marks text carried over from the previous chunk. The model input count includes the passage: prefix and special tokens.'}</p>
      <pre><mark>{body.slice(chunk.startChar, overlapEnd).join('')}</mark>{body.slice(overlapEnd, chunk.endChar).join('')}</pre>
      {sourceField === 'summary' && <p className="vd-verdict">{zh ? '來源是摘要。此樣本缺日期及 URL，先隔離，不可用於有日期的引用報告。' : 'This item contains a summary only. Keep it out of dated, cited reports until the missing publication date and source URL are verified.'}</p>}
    </article>
    <details><summary>{zh ? '檢查此段的三層 JSON metadata' : 'Inspect this chunk’s three metadata records'}</summary>
      <div className="chunk-records">
        <article><h3>{zh ? '文章來源' : 'Article source'}</h3><pre>{JSON.stringify(sourceMetadata, null, 2)}</pre></article>
        <article><h3>{zh ? '段落位置' : 'Chunk location'}</h3><pre>{JSON.stringify(chunkMetadata, null, 2)}</pre></article>
        <article><h3>{zh ? '向量設定' : 'Vector configuration'}</h3><pre>{JSON.stringify(embeddingMetadata, null, 2)}</pre></article>
      </div>
      <p className="vd-caption">{zh ? '正式資料使用儲存層生成的 ID。雜湊是此段確實文字的 SHA-256。' : 'In the app, use IDs from storage. The hash is the SHA-256 of the exact displayed passage.'}</p>
    </details>
  </section>;
}

export default function FinanceChunkingContent({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const [conceptId, setConceptId] = useState('chunk');
  const concept = chunkConcepts.find(item => item.id === conceptId) ?? chunkConcepts[0];
  return <main className="utility-page finance-page vd-page chunk-page">
    <Link className="fr-inline-link" href="/finance-project"><ArrowLeft size={16}/>{zh ? '返回股票研究項目' : 'Back to the stock research project'}</Link>
    <header className="utility-hero">
      <p className="eyebrow">n8n · YFinance MCP · PostgreSQL</p>
      <h1>{zh ? '把長篇新聞切成可引用的段落。' : 'Turn long news into passages you can cite.'}</h1>
      <p>{zh ? 'Chunk 是一段可獨立搜尋的文章原文。用你的 n8n 回傳格式試切段、看重疊，再為每段加上可追溯的 metadata。' : 'A chunk is a section of one article that you can search for on its own. Try splitting your n8n news response, then inspect how each chunk links back to its source.'}</p>
      <div className="fr-hero-actions">
        <a href="#chunk-demo" className="primary-action"><Play size={17}/>{zh ? '試 8,000 字元' : 'Try 8,000 characters'}</a>
        <a href="#chunk-workflow" className="secondary-action"><GitBranch size={17}/>{zh ? '查看項目流程' : 'See the project workflow'}</a>
        <a href={downloads + 'stock-research-chunk-news.json'} download className="secondary-action">{zh ? '下載三篇新聞 JSON' : 'Download three-article JSON'}</a>
      </div>
    </header>
    <div className="fr-disclosure"><Layers size={23}/><p>{zh ? '此離線動畫使用虛構新聞及預先量度的 E5 tokenizer 結果。每次只處理 news 陣列中的一篇文章。' : 'The offline animation uses fictional news and precomputed E5 tokenizer measurements. Each item in the news array is split separately.'}</p></div>

    <ChunkDemo lang={lang}/>

    <section className="finance-section" id="chunk-mindmap">
      <h2>{zh ? '心智圖：每段文字需要甚麼？' : 'Mind map for a searchable chunk'}</h2>
      <div className="vd-map-root"><Layers size={22}/>{zh ? '文章 → 可追溯的證據' : 'Article → traceable evidence'}</div>
      <div className="vd-mindmap">{chunkConcepts.map(item => <button type="button" key={item.id} aria-pressed={item.id === conceptId}
        onClick={() => setConceptId(item.id)}><strong>{pick(item.title, lang)}</strong><span>{pick(item.short, lang)}</span></button>)}</div>
      <article className="vd-concept" aria-live="polite"><h3>{pick(concept.title, lang)}</h3><p>{pick(concept.body, lang)}</p></article>
    </section>

    <section className="finance-section" id="chunk-metadata">
      <h2>{zh ? '在 PostgreSQL 怎樣寫 metadata？' : 'How to write the PostgreSQL metadata'}</h2>
      <div className="chunk-records">{chunkMetadataGuide.map(item => <article key={item.title.en}>
        <h3>{pick(item.title, lang)}</h3><p>{pick(item.body, lang)}</p>
      </article>)}</div>
      <p>{zh ? '索引欄位如 version_id、published_at 及 first_seen_at 用型別化欄位或可信的 join，彈性附加標籤可用 JSONB。報告引用包含 chunk_id 的來源 ID，可回查原文範圍及 URL。' : 'Use typed columns or trusted joins for filters such as version ID, publication time and first-seen time. JSONB can hold extra tags. A citation resolves through its chunk ID to the exact excerpt and source URL.'}</p>
    </section>

    <section className="finance-section" id="chunk-workflow">
      <h2>{zh ? '在你的項目哪一步切段？' : 'Where chunking fits in your project'}</h2>
      <p>{zh ? 'n8n 驗證、清理、去重及提交文章。索引 worker 讀取已提交的版本，切段並寫入 metadata，然後才做文件 embedding。報告 host 讀取已准入的版本和快照。' : 'n8n validates, sanitizes, deduplicates and commits articles. An indexing worker reads each committed version, splits the text and writes metadata before embedding it. The report host uses admitted versions through its evidence snapshot.'}</p>
      <FinanceDiagramCanvas diagram={financeChunkDiagram} lang={lang}/>
      <p><Link href="/finance-project/n8n">n8n</Link> · <Link href="/finance-project/vector-db">{zh ? '向量資料庫' : 'Vector DB'}</Link> · <Link href="/finance-project/rerank-hnsw">Rerank / HNSW</Link></p>
    </section>

    <section className="finance-section" id="chunk-model">
      <h2>{zh ? '先測試 multilingual-e5-small' : 'Start by evaluating multilingual-e5-small'}</h2>
      <p>{zh ? '現有 PostgreSQL 教學用 384 維。E5-small 可作中英檢索候選，輸入上限 512 token。由 320 個原文 token 及 48 個重疊 token 試起，保留前綴及特殊 token 的空間。BGE-M3 可作對照，密集向量 1,024 維，需獨立配置索引。' : 'E5-small is a candidate for English and Chinese retrieval. Its 384 dimensions fit the current PostgreSQL tutorial, and its input limit is 512 tokens. Try 320 source tokens with 48 tokens of overlap, leaving room for the prefix and special tokens. For comparison, BGE-M3 produces 1,024-dimensional dense vectors and needs a separate index configuration.'}</p>
      <article className="vd-stage">
        <h3>{zh ? '如果 8,000 指的是 token 呢？' : 'What if 8,000 means tokens?'}</h3>
        <p>{zh ? '320 token 固定窗口、重疊 48，每步前進 272 token。8,000 token 約分 30 段。實際段數受句尾、段落及重新分詞影響。對照上面的字元實測。' : 'With a fixed 320-token window and 48-token overlap, each next window advances 272 tokens. An 8,000-token article takes 30 fixed windows. Sentence breaks, paragraph breaks and tokenization can change the final count. The examples above show measured counts for character inputs.'}</p>
        <code>1 + ceil((8000 − 320) / (320 − 48)) = 30</code>
      </article>
      <p>{zh ? '固定模型、tokenizer 版本及切段策略。用凍結的評估集比較不同段長及重疊，檢查 recall、nDCG、引用精確率與延遲。現階段使用全文搜尋；混合檢索需通過既有門檻。' : 'Pin the model, tokenizer revision and chunking policy. Compare sizes and overlaps on the frozen evaluation set using recall, nDCG, citation precision and latency. Full-text search remains the default until hybrid passes its gates.'}</p>
      <details><summary>{zh ? 'Python 範例：段落及查詢 → 向量' : 'Python example: encode a passage and a query'}</summary><pre>{chunkEncoderExample}</pre></details>
      <div className="fr-hero-actions">
        <a className="secondary-action" href={downloads + 'stock-research-chunking-guide.md'} download>{zh ? '下載雙語指南' : 'Download the bilingual guide'}</a>
        <a className="secondary-action" href={downloads + 'stock-research-chunk-example.py'} download>{zh ? '下載 tokenizer 程式' : 'Download the tokenizer example'}</a>
      </div>
      <ul>{chunkReferences.map(reference => <li key={reference.title}><a href={reference.url}>{reference.title}</a></li>)}</ul>
    </section>
  </main>;
}
