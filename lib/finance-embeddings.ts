import type { Copy } from './curriculum';
import type { FinanceDiagram } from './finance-diagrams';

const t = (en: string, zh: string): Copy => ({ en, zh });

export const financeEmbeddingGuide = [
  { title: t('Document embeddings: during indexing', '文件 embedding：建立索引時'), body: t('After company/daily news is validated, deduplicated and committed, split permitted text into versioned chunks. An indexing worker embeds new or changed chunks, then stores vectors with chunk ID, text hash, model/version and dimension in PostgreSQL pgvector. Company-profile excerpts use the same pipeline. This happens before those chunks can participate in vector search, rather than after reranking.', '公司／每日新聞驗證、去重及提交後，將允許文字切成有版本段落。索引 worker 嵌入新增／改動段落，再把向量、chunk ID、文字 hash、模型／版本及維度存 PostgreSQL pgvector。公司背景原文亦經此流程；須先有向量才可向量搜尋，並非重排後才 embedding。') },
  { title: t('Question embeddings: just before vector retrieval', '問題 embedding：向量檢索之前'), body: t('On an accepted request, first refresh company news and pin the evidence snapshot. If the evaluated hybrid mode is enabled, encode the current query using the same compatible model/configuration as document vectors, then search pgvector under the snapshot, time and permission filters. Combine with full-text results and rerank question–passage pairs. A refined query needs its own query embedding; unchanged document chunks do not need another embedding.', '有效請求先刷新公司新聞及固定快照。若已啟用通過評估的混合模式，用與文件向量相容的相同模型／設定編碼當前查詢，再在快照、時間及權限條件下搜尋 pgvector，合併全文結果後重排問題與原文配對。補查的新 query 須再編碼；未改動文件不須重嵌入。') },
  { title: t('Pending vectors do not block sparse search', '向量未就緒不阻擋全文搜尋'), body: t('Full-text indexing remains the default and uses no embeddings. Run document embedding as a separate idempotent indexing job keyed by chunk hash and model. Pin the model/version and vector-ready chunk IDs with the run snapshot; refinement/resume reuse that view. Newly completed embeddings become available to the next request. Do not label pending embeddings as a complete hybrid index. A candidate vector/model failure falls back to working full-text evidence within budget. Neither n8n acquisition success nor an evidence snapshot promises that its vectors are ready. Hybrid remains blocked until it beats the written frozen evaluation margins.', '全文索引仍是預設，不用 embedding。文件嵌入作獨立冪等索引工作，以段落 hash 及模型為鍵，快照固定模型／版本及向量已就緒段落 ID，補查／恢復沿用此視圖；新完成向量供下次請求用，不能把待完成向量稱完整混合索引。向量／模型失敗可在預算內回退可用全文證據；n8n 抓取成功及固定快照不代表向量已就緒。混合模式仍須超越凍結評估書面門檻才准入。') },
  { title: t('Embeddings, reranking and review do different jobs', 'Embedding、重排及覆核分工不同'), body: t('Embeddings help find semantically similar passages. Reranking scores relevance to the exact question using the passage text. Evidence review shows the proposed sources and system rank, lets you exclude or reorder them, and records your preferred discussion order. None of these steps establishes factual support or predicts stock returns. The evidence gate and citation checks still decide which claims may be released.', 'Embedding 協助找語義相似段落；重排用原文評估對當前問題的相關性。證據覆核展示建議來源及系統排序，讓你排除或改討論次序。這些步驟本身都不證明事實支持或預測股票回報；證據關卡及引用驗證仍決定哪些主張可發布。') },
];

const node = (id: string, label: string, en: string, zh: string) => ({ id, label, detail: t(en, zh) });
const edge = (from: string, to: string, en: string, zh: string, kind: FinanceDiagram['edges'][number]['kind'] = 'flow') => ({ from, to, label: t(en, zh), detail: t(en, zh), kind });

export const financeEmbeddingDiagram: FinanceDiagram = {
  id: 'embeddings', title: t('Where document and question embeddings happen', '文件及問題在哪一步 embedding'),
  nodes: [
    node('news', 'COMMITTED NEWS + PROFILES', 'YFinance company news, Alpha Vantage daily batches and sourced profile versions are committed before indexing.', 'YFinance 公司新聞、Alpha Vantage 每日批次及附來源背景先提交，再建立索引。'),
    node('chunks', 'CHUNK + HASH + VERSION', 'Use permitted text, source IDs and dates. Only changed text/model combinations require new vectors.', '用允許文字、來源 ID 及日期；只有文字／模型組合變更才需新向量。'),
    node('document_embed', 'DOCUMENT EMBEDDING WORKER', 'Separate indexing job using the pinned model/version and compatible dimension; not a per-user LLM call.', '獨立索引工作，用固定模型／版本及相容維度，不是每用戶的 LLM 生成呼叫。'),
    node('vectors', 'POSTGRESQL pgvector + STATUS', 'Store chunk ID, hash, model and readiness. Reuse existing vectors only when hash and model match.', '存段落 ID、hash、模型及就緒狀態；只有 hash 和模型相同才重用向量。'),
    node('question', 'REFRESH → SNAPSHOT → QUERY', 'The original question and fixed evidence snapshot constrain all retrieval paths.', '原問題及固定快照限制所有檢索路徑。'),
    node('query_embed', 'QUERY EMBEDDING', 'Hybrid only: encode this query using the compatible pinned model. A refinement encodes its new query.', '只限混合模式：用相容固定模型編碼本次查詢；補查的新 query 再編碼。'),
    node('dense', 'FILTERED VECTOR SEARCH', 'Use ready vectors from this snapshot with the same model, time and permission filters.', '只用本快照已就緒向量及相同模型、時間、權限條件。'),
    node('sparse', 'POSTGRESQL FULL-TEXT', 'Default retrieval needs no embedding. It also supplies the sparse branch of admitted hybrid search.', '預設檢索毋須 embedding，亦供已准入混合模式的稀疏分支。'),
    node('fuse', 'HYBRID FUSION + RERANK', 'Fuse sparse/dense candidates and rescore question–passage relevance after frozen admission gates pass.', '通過凍結准入後融合稀疏／向量候選，再評問題與原文相關性。'),
    node('review', 'REVIEW SOURCES + USER ORDER', 'Show the system rank beside user order. Exclusion never deletes stored news or changes model scores.', '系統排名與用戶次序並列，排除不刪新聞或改模型分數。'),
    node('gate', 'COVERAGE → CONTEXT → LLM', 'Validate selected IDs/order, recheck support after exclusions/trimming, then generate and validate citations.', '核對所選 ID／次序，排除及裁剪後重查支持，再生成及驗證引用。'),
  ],
  edges: [
    edge('news', 'chunks', 'Indexing pipeline', '索引流程'),
    edge('news', 'sparse', 'Committed text + FTS index', '已提交文字及全文索引'),
    edge('chunks', 'document_embed', 'New / changed hash', '新增／改動 hash'),
    edge('chunks', 'vectors', 'Matching hash + model cached', '相同 hash＋模型已快取'),
    edge('document_embed', 'vectors', 'Persist ready vectors', '保存就緒向量'),
    edge('document_embed', 'sparse', 'Pending / failed; no blocking', '待完成／失敗，不阻擋', 'fallback'),
    edge('question', 'query_embed', 'Admitted hybrid only', '只限已准入混合'),
    edge('question', 'sparse', 'Default full-text', '預設全文'),
    edge('query_embed', 'dense', 'Query vector ready', '查詢向量就緒'),
    edge('query_embed', 'sparse', 'Embedding failure', '嵌入失敗', 'fallback'),
    edge('vectors', 'dense', 'Eligible indexed chunks', '合資格已索引段落'),
    edge('dense', 'fuse', 'Dense candidates', '向量候選'),
    edge('sparse', 'fuse', 'Hybrid sparse branch', '混合的稀疏分支'),
    edge('sparse', 'review', 'Default / fallback ranking', '預設／回退排序'),
    edge('fuse', 'review', 'Reranked passages', '已重排原文'),
    edge('review', 'gate', 'Validated selection revision', '已驗證選取版本'),
  ],
};
