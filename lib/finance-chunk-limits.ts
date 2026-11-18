import type { Copy } from './curriculum';
import { financeRuntimeLimits } from './finance-proposal';
import measurements from './finance-chunk-fixture.json';

const t = (en: string, zh: string): Copy => ({ en, zh });
const maxContentUnits = 100_000;
const chunksPerBatch = 32;
const reportReads = financeRuntimeLimits.sourceReads;
const unitsLabel = maxContentUnits.toLocaleString('en-US');

export const chunkLimitSettings = [
  {
    id: 'intake', title: t('n8n intake', 'n8n 接收'), amount: t(unitsLabel, unitsLabel),
    unit: t('UTF-16 code units per content field', '每個 content 欄位的 UTF-16 碼元'),
    body: t(
      'The current n8n validator enforces this limit after parsing. Put a separate response byte limit at the MCP server or HTTP bridge, so an oversized response can be stopped before buffering or parsing it.',
      '現有 n8n 驗證器於解析後執行此上限。MCP server 或 HTTP bridge 應另設回應位元組上限，讓超大回應在完整緩衝或解析前停止。',
    ),
  },
  {
    id: 'index', title: t('Background embedding', '背景 embedding'), amount: t(String(chunksPerBatch), String(chunksPerBatch)),
    unit: t('chunks per article in one worker batch (proposed)', '每篇文章每批最多段數（建議）'),
    body: t(
      'Keep the full admitted article. Start with a 320-token target and 48-token overlap. Stop at the chunk or time budget, save progress, and queue the remainder under the same article version and model configuration.',
      '保留已接納的全文。先試每段目標 320 token、重疊 48 token。到段數或時間上限就保存進度，並按同一文章版本及模型設定續排餘下段落。',
    ),
  },
  {
    id: 'report', title: t('Report evidence', '報告證據'), amount: t(String(reportReads), String(reportReads)),
    unit: t('source reads per research run (design limit)', '每次研究的來源讀取次數（設計上限）'),
    body: t(
      'Group hits by article version and remove duplicate overlap from selected text. Keep the source IDs for citations. Fit the selected passages to the report model’s token budget and recheck evidence coverage.',
      '按文章版本組合命中，刪除所選原文中的重疊重複，保留引用來源 ID。按報告模型的 token 預算選擇段落，再查證據覆蓋。',
    ),
  },
];

export const chunkLimitStatus = t(
  'This demo shows the proposed handling after a response has been parsed. Today the n8n validator rejects oversized content. The transport byte cap, summary fallback, per-article skip and background batching are integration steps.',
  '示範展示回應解析後的建議處理。現有 n8n 驗證器拒絕超長 content。傳輸位元組上限、摘要回退、逐篇略過及背景分批均待整合。',
);

type CaseCopy = { id: string; title: Copy; detail: Copy; report: Copy };
type FullBody = CaseCopy & { kind: 'full_body'; originalUnits: number; totalChunks: number };
type SummaryOnly = CaseCopy & { kind: 'summary_only'; originalUnits: number; totalChunks: number };
type Skipped = CaseCopy & { kind: 'skipped'; originalUnits: number };
type LimitCase = FullBody | SummaryOnly | Skipped;

export const chunkLimitCases: [FullBody, ...LimitCase[]] = [
  {
    id: 'ordinary', kind: 'full_body', originalUnits: 8_000,
    totalChunks: measurements.articles[0].variants[0].chunks.length,
    title: t('8,000-character news', '8,000 字元新聞'),
    detail: t('Store the full article supplied by n8n. All six chunks in this E5 example fit in one indexing batch.', '保存 n8n 提供的全文。這個 E5 範例的六段都可在一批完成索引。'),
    report: t('Select the passages that answer the question, under the source-read and context budgets.', '按來源讀取及 context 預算，選擇回答問題所需的段落。'),
  },
  {
    id: 'long', kind: 'full_body', originalUnits: 68_000, totalChunks: 48,
    title: t('Long article · more than one batch', '長文章 · 需要多批'),
    detail: t('This fictional article fits the intake limit and has 48 planned chunks. The first batch prepares 32 vectors and queues the other 16. The stored article is still complete.', '這篇虛構文章符合接收上限，計劃切 48 段。首批準備 32 個向量，其餘 16 段排隊。文章全文仍完整保存。'),
    report: t('In hybrid mode, freeze the ready set in each snapshot and record partial vector coverage while chunks are queued. Full-text search can use admitted passages that are already text-indexed.', '混合模式在快照固定已就緒的向量集合，並在餘下段落排隊時記錄部分向量覆蓋。全文檢索可使用已准入及已建立全文索引的段落。'),
  },
  {
    id: 'summary', kind: 'summary_only', originalUnits: 120_000, totalChunks: 1,
    title: t('Oversized · usable summary', '超長 · 有可用摘要'),
    detail: t('Keep the provider’s existing summary if it passes validation. Store it as summary, with the original URL and timestamps. Record that the article body exceeded the limit.', '供應商原有摘要通過驗證便可保留。以 summary 儲存，連同原有網址及日期，並記錄正文超過上限。'),
    report: t('Cite only what the summary supports, subject to the usual source checks. If the question needs missing detail, return insufficient evidence.', '通過一般來源核對後，只引用摘要能支持的主張。問題需要欠缺的細節時，回傳證據不足。'),
  },
  {
    id: 'skip', kind: 'skipped', originalUnits: 120_000,
    title: t('Oversized · no usable summary', '超長 · 無可用摘要'),
    detail: t('Write a skip reason to the intake record and leave this item out of the evidence set. No article version or chunk needs to be created for it.', '在接收記錄寫下略過原因，並把此項排除於證據集合。毋須建立文章版本或段落。'),
    report: t('Record the acquisition gap. Continue with other eligible sources and return insufficient evidence if they cannot answer the question.', '記錄抓取缺口。繼續使用其他合資格來源，若仍無法回答就回傳證據不足。'),
  },
];

export function chunkLimitExample(example: LimitCase, finishQueued: boolean) {
  const planned = example.kind === 'skipped' ? 0 : example.totalChunks;
  const ready = finishQueued ? planned : Math.min(planned, chunksPerBatch);
  const queued = planned - ready;
  const sourceField = example.kind === 'full_body' ? 'content' : example.kind === 'summary_only' ? 'summary' : null;
  return {
    intake: {
      original_content_utf16_units: example.originalUnits,
      max_content_utf16_units: maxContentUnits,
      source_coverage: example.kind,
      source_field: sourceField,
      reason: example.originalUnits > maxContentUnits ? 'content_over_limit' : null,
    },
    vector_index: {
      status: planned === 0 ? 'not_applicable' : queued > 0 ? 'partial' : 'complete',
      planned_chunks: planned,
      ready_chunks: ready,
      queued_chunks: queued,
    },
  };
}
