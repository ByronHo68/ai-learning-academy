import type { Copy } from './curriculum';
import type { FinanceDiagram } from './finance-diagrams';

const t = (en: string, zh: string): Copy => ({ en, zh });

export const ragEmbedding = {
  endpoint: 'https://openrouter.ai/api/v1/embeddings',
  model: 'openai/text-embedding-3-small',
  dimensions: 1536,
  modelKey: 'openrouter:text-embedding-3-small:1536:plain:v1',
};

export const ragLinks = [
  { label: 'OpenRouter embeddings API', href: 'https://openrouter.ai/docs/api/api-reference/embeddings/submit-an-embedding-request' },
  { label: 'OpenRouter text-embedding-3-small', href: 'https://openrouter.ai/openai/text-embedding-3-small' },
  { label: 'Multilingual E5-small model card', href: 'https://huggingface.co/intfloat/multilingual-e5-small' },
];

export const ragModelChoices = [
  {
    title: ragEmbedding.model, badge: t('Hosted example · 1,536 dimensions', '託管範例 · 1,536 維'),
    body: t(
      'Try this candidate when you want OpenRouter to handle document and query embeddings. Send plain excerpts and questions with the same model and dimensions. Keep credentials on the server and approve the provider and data policy before sending content.',
      '如果希望由 OpenRouter 處理文件與查詢向量，可測試此候選。以相同模型及維度傳送節錄及問題文字。憑證留在伺服器；送出內容前核准供應商與資料政策。',
    ),
  },
  {
    title: 'intfloat/multilingual-e5-small', badge: t('Local candidate · 384 dimensions', '本機候選 · 384 維'),
    body: t(
      'This matches the current stock_rag.embeddings and SQL examples. E5 uses passage: for chunks and query: for questions. The 320/48 chunk lesson measures E5 tokens. Recheck length with the hosted model’s tokenizer if you use that model.',
      '此模型符合目前 stock_rag.embeddings 與 SQL 範例。E5 段落用 passage:，問題用 query:。320/48 切段課程使用 E5 token。改用託管模型時按其 tokenizer 重查長度。',
    ),
  },
];

export const ragHostedStorage = t(
  'The hosted candidate needs a separate vector(1536) store and matching write, retrieval and snapshot wiring. Re-embed the corpus when changing model configuration. Never mix model spaces, even if their dimensions match. Compare both candidates with PostgreSQL full-text on your frozen evaluation set before exposing hybrid retrieval.',
  '託管候選需要獨立 vector(1536) 儲存及相符的寫入、檢索、快照接線。變更模型設定後重做資料向量。即使維度相同，也不可混用不同模型空間。啟用混合檢索前，以凍結評估集比較兩個候選及 PostgreSQL 全文。',
);

const capacity = 'In this fictional update, MSFT plans to add cloud computing capacity at two sites.';
const disclosure = 'The company expects higher infrastructure spending and has not disclosed a margin forecast.';

export const ragNews = {
  symbol: 'MSFT',
  news: [{
    title: 'Fictional MSFT cloud capacity update',
    publisher: 'Academy example',
    url: 'https://example.com/msft-cloud-update',
    publishedAt: '2026-11-20T08:00:00Z',
    summary: 'A fictional update about cloud capacity and costs.',
    content: [capacity, disclosure].join('\n\n'),
  }],
};

const source = ragNews.news[0];
export const ragChunks = [capacity, disclosure].map((text, ordinal) => {
  const start = ordinal === 0 ? 0 : capacity.length + 2;
  return {
    chunk_id: `demo-c${ordinal + 1}`,
    source_id: 'demo-source-v1',
    source_field: 'content',
    ordinal,
    char_start: start,
    char_end: start + text.length,
    excerpt: text,
  };
});

export const ragArticle = {
  source_id: 'demo-source-v1',
  news_version_id: 'demo-news-v1',
  symbol: ragNews.symbol,
  title: source.title,
  publisher: source.publisher,
  source_url: source.url,
  published_at: source.publishedAt,
  first_seen_at: '2026-11-20T09:00:00Z',
};

export const ragEmbeddingRequest = {
  model: ragEmbedding.model,
  dimensions: ragEmbedding.dimensions,
  encoding_format: 'float',
  input: ragChunks.map(chunk => chunk.excerpt),
};

export const ragQuestion = t('What did MSFT say about cloud infrastructure costs?', 'MSFT 如何說明雲端基建成本？');
export const ragQueryRequest = {
  ...ragEmbeddingRequest,
  input: [ragQuestion.en],
};
export const ragContext = {
  question: ragQuestion.en,
  snapshot_id: 'demo-snapshot',
  evidence: [{ citation_id: 'S1', chunk_id: ragChunks[1].chunk_id, excerpt: disclosure }],
};
export const ragAnswer = t(
  'The fictional update says MSFT expects higher infrastructure spending. It does not provide a margin forecast. [S1]',
  '虛構消息指出 MSFT 預期基建支出增加，並未提供利潤率預測。[S1]',
);
export const ragGap = t(
  'The selected source covers capacity. The costs passage was excluded, so this run lacks enough evidence to answer the costs question.',
  '所選來源只講容量。支出段落已被排除，本次任務沒有足夠證據回答成本問題。',
);

type EmbeddingResult = { index: number; embedding: number[] };
type JoinResult = { kind: 'rejected' } | {
  kind: 'validated';
  rows: (EmbeddingResult & { chunk_id: string; model_key: string })[];
};

function isEmbeddingResult(input: unknown): input is EmbeddingResult {
  return typeof input === 'object' && input !== null
    && 'index' in input && typeof input.index === 'number' && Number.isInteger(input.index)
    && 'embedding' in input && Array.isArray(input.embedding)
    && input.embedding.length === ragEmbedding.dimensions
    && input.embedding.every((value: unknown) => typeof value === 'number' && Number.isFinite(value))
    && input.embedding.some(value => value !== 0);
}

// The worker keeps the input's chunk IDs in order until it validates the whole reply.
export function joinRagEmbeddings(payload: unknown, chunkIds: readonly string[]): JoinResult {
  if (typeof payload !== 'object' || payload === null || 'error' in payload
      || !('model' in payload) || payload.model !== ragEmbedding.model
      || !('data' in payload) || !Array.isArray(payload.data) || payload.data.length !== chunkIds.length) {
    return { kind: 'rejected' };
  }
  const byIndex = new Map<number, EmbeddingResult>();
  for (const item of payload.data) {
    if (!isEmbeddingResult(item) || item.index < 0 || item.index >= chunkIds.length || byIndex.has(item.index)) {
      return { kind: 'rejected' };
    }
    byIndex.set(item.index, item);
  }
  const rows = [];
  for (const [index, chunk_id] of chunkIds.entries()) {
    const item = byIndex.get(index);
    if (!item) return { kind: 'rejected' };
    rows.push({ ...item, chunk_id, model_key: ragEmbedding.modelKey });
  }
  return { kind: 'validated', rows };
}

export type RagStoryScenario = 'hybrid' | 'invalid' | 'insufficient';

// Synthetic vectors in deliberately reversed response order, with visibly distinct prefixes.
export function ragExampleResponse(invalid: boolean) {
  const demoVector = (head: number[], size: number) => [
    ...head,
    ...Array.from({ length: size - head.length }, () => 0),
  ];
  return {
    object: 'list',
    model: ragEmbedding.model,
    data: [
      { object: 'embedding', index: 1, embedding: demoVector([0.048, -0.016, 0.071], invalid ? 384 : ragEmbedding.dimensions) },
      { object: 'embedding', index: 0, embedding: demoVector([-0.023, 0.042, 0.008], ragEmbedding.dimensions) },
    ],
  };
}

export const ragScenarios: { id: RagStoryScenario; label: Copy }[] = [
  { id: 'hybrid', label: t('Hybrid candidate succeeds', '混合檢索候選成功') },
  { id: 'invalid', label: t('Wrong vector dimensions', '向量維度錯誤') },
  { id: 'insufficient', label: t('Evidence excluded', '證據被排除') },
];

const ragStages = [
  { id: 'fetch', label: t('Fetch', '抓取'), title: t('n8n receives news from YFinance MCP', 'n8n 從 YFinance MCP 接收新聞'),
    detail: t('n8n asks the configured tool for up to three company articles. The story follows one item from the news array. Daily macro news and curated profiles can supply other eligible evidence.', 'n8n 向固定工具索取最多三篇公司新聞。故事追蹤 news 陣列中的一篇。每日宏觀新聞及經審核的公司背景也可提供其他合資格證據。') },
  { id: 'admit', label: t('Admit', '接納'), title: t('Commit a source version with provenance', '保存來源版本及出處'),
    detail: t('n8n validates, sanitizes, deduplicates and commits the batch. The app admits eligible versions after checking rights, dates and source scope. The app owns the article ID, URL, timestamps and policy.', 'n8n 驗證、清理、去重及提交批次。App 檢查權限、日期及來源範圍後才接納版本，並管理文章 ID、網址、時間及政策。') },
  { id: 'chunk', label: t('Chunk', '切段'), title: t('Save excerpts and their locations', '保存節錄及原文位置'),
    detail: t('Use the pinned chunking policy. This short example has two passages to make the batch easy to inspect. Save each chunk ID, source ID, offsets and text under stock_rag.chunks.', '使用固定切段策略。此短例有兩段，方便檢視批次。把段落 ID、來源 ID、範圍及文字存入 stock_rag.chunks。') },
  { id: 'request', label: t('Send text', '送出文字'), title: t('The worker sends sanitized text to OpenRouter', '背景 worker 將已清理文字送往 OpenRouter'),
    detail: t('POST /embeddings from a server-side worker with an approved model and provider. The input array contains permitted excerpts. The worker keeps a local list of chunk IDs in that same order.', '由伺服器的 worker 用核准模型及供應商 POST /embeddings。input 陣列包含允許的節錄。Worker 在本機按相同順序保留段落 ID。') },
  { id: 'response', label: t('Read vectors', '讀取向量'), title: t('The reply identifies each vector by input index', '回應以輸入索引識別每個向量'),
    detail: t('OpenRouter returns the model and a data array. Each item has index and embedding. The example reverses the item order so you can see why the index matters. Your citation metadata lives in your database.', 'OpenRouter 回傳模型及 data 陣列，每項有 index 與 embedding。例子刻意倒序，展示 index 的用途。你的引用 metadata 保存在自己的資料庫。') },
  { id: 'join', label: t('Join', '配對'), title: t('Match each vector to your chunk ID', '將每個向量配對至段落 ID'),
    detail: t('Check the returned model, finite vector values, dimension, and exactly one result for each input index. Use inputChunkIds[index] to attach the vector. Reject an invalid batch before writing any vector.', '核對回傳模型、有限數值、向量維度，以及每個輸入 index 恰好有一項結果。用 inputChunkIds[index] 配對。整批不合格時在寫入任何向量前拒絕。') },
  { id: 'store', label: t('Store', '儲存'), title: t('Store vectors separately from source text', '分開保存向量及來源文字'),
    detail: t('Save each validated vector by chunk ID and model configuration in a compatible pgvector table. The source and chunk tables keep the title, date, URL and excerpt. Reuse exact matching vectors on replay.', '把每個已核對的向量按段落 ID 及模型設定存入相容的 pgvector 表。來源及段落表保留標題、日期、網址及節錄。重跑時重用完全相符的向量。') },
  { id: 'snapshot', label: t('Freeze', '固定'), title: t('Pin evidence for the accepted question', '為已接納的問題固定證據'),
    detail: t('LangGraph checks scope and calls the required n8n refresh. It freezes eligible chunk IDs, the as-of cutoff and ready vectors for this run. Search and any refinement reuse that snapshot.', 'LangGraph 檢查範圍並呼叫指定 n8n 刷新，把合資格段落、as-of 截止及已就緒向量固定於本次任務。檢索與補查沿用此快照。') },
  { id: 'retrieve', label: t('Retrieve', '檢索'), title: t('Find candidate passages', '找出候選段落'),
    detail: t('Full-text search is the project default. In admitted hybrid mode, encode the question with the same compatible model and settings, search pgvector under snapshot filters, and combine dense and full-text candidates.', '項目預設全文檢索。混合模式獲准後，用相同相容的模型及設定為問題編碼，在快照過濾下搜尋 pgvector，再結合向量與全文候選。') },
  { id: 'rerank', label: t('Rerank', '重排'), title: t('Prioritize direct support for the question', '優先選直接支持問題的原文'),
    detail: t('A reranker compares the question with each candidate’s text. The passage about spending and margins goes ahead of the capacity announcement for this question. The order represents relevance.', '重排器比較問題與每段候選文字。對此問題，支出及利潤段落比容量公告更靠前。次序表示相關程度。') },
  { id: 'review', label: t('Review', '覆核'), title: t('Check selection and evidence coverage', '覆核選取及證據覆蓋'),
    detail: t('In review mode the user can highlight, remove or reorder candidates. Check that selected IDs are in the snapshot, then recheck coverage after exclusions and context trimming.', '覆核模式可標記、移除或重排候選。確認所選 ID 在快照中，並在排除及裁剪 context 後重查覆蓋。') },
  { id: 'generate', label: t('Generate', '生成'), title: t('Give the report model text and citation IDs', '把原文及引用 ID 交給報告模型'),
    detail: t('Augment the prompt with selected excerpts and citation IDs. Call the separate OpenRouter chat endpoint to draft the report. The generation model gets the evidence text and citation references.', '把選定節錄及引用 ID 加進 prompt。另呼叫 OpenRouter chat endpoint 擬稿。生成模型收到證據文字及引用參照。') },
  { id: 'validate', label: t('Validate', '驗證'), title: t('Verify support before releasing the answer', '確認原文支持才發布答案'),
    detail: t('Check that each material claim is supported by its cited excerpt and that all IDs belong to the snapshot. Return an explicit evidence gap when support is missing.', '檢查每項重要主張都有引用原文支持，及所有 ID 屬於快照。缺少支持時，明確回傳證據缺口。') },
];

const gapStage = {
  id: 'gap', label: t('Evidence gap', '證據不足'),
  title: t('Return insufficient evidence', '回傳證據不足'),
  detail: t('The remaining source covers capacity only. Explain the missing support and stop before report generation.', '剩餘來源只講容量。說明缺少的證據，在報告生成前停止。'),
};

export function ragStoryPath(scenario: RagStoryScenario) {
  if (scenario === 'invalid') return ragStages.filter(stage => stage.id !== 'store' && stage.id !== 'rerank');
  if (scenario === 'insufficient') return [...ragStages.filter(stage => stage.id !== 'generate' && stage.id !== 'validate'), gapStage];
  return ragStages;
}

export const ragWorkflow: FinanceDiagram = {
  id: 'rag_story',
  title: t('Stock research RAG from news to citation', '股票研究 RAG：由新聞到引用'),
  nodes: [
    ...ragStages.map(stage => ({ id: stage.id, label: stage.label.en.toUpperCase(), detail: stage.detail })),
    { id: 'gap', label: 'INSUFFICIENT EVIDENCE', detail: gapStage.detail },
  ],
  edges: ([
    ['fetch', 'admit', t('Validated n8n receipt','已驗證 n8n 收據')],
    ['admit', 'chunk', t('Admitted source','已接納來源')],
    ['chunk', 'request', t('Sanitized excerpts','已清理節錄')],
    ['request', 'response', t('Embedding response','Embedding 回應')],
    ['response', 'join', t('Model, indexes, vectors','模型、索引及向量')],
    ['join', 'store', t('All vectors validated','所有向量通過驗證')],
    ['join', 'snapshot', t('Invalid batch → full-text','無效批次 → 全文')],
    ['store', 'snapshot', t('Pin compatible ready vectors','固定相容已就緒向量')],
    ['snapshot', 'retrieve', t('Scope, cutoff and allowed IDs','範圍、截止及准許 ID')],
    ['retrieve', 'rerank', t('Admitted hybrid','混合已獲准')],
    ['retrieve', 'review', t('Default full-text','預設全文')],
    ['rerank', 'review', t('Ranked passages','已排序段落')],
    ['review', 'generate', t('Enough evidence','證據足夠')],
    ['review', 'gap', t('Missing support after checks','核對後支持不足')],
    ['generate', 'validate', t('Draft and citations','草稿及引用')],
  ] satisfies [string, string, Copy][]).map(([from, to, label]) => ({
    from, to, label, detail: label,
    kind: to === 'gap' ? 'stop' : from === 'join' && to === 'snapshot' ? 'fallback' : 'flow',
  })),
};
