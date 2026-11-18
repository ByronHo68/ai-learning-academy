import type { Copy } from './curriculum';
import type { FinanceDiagram } from './finance-diagrams';
import measurements from './finance-chunk-fixture.json';
import news from '../public/downloads/stock-research-chunk-news.json';

const t = (en: string, zh: string): Copy => ({ en, zh });

export const chunkExample = news;
export const chunkMeasurements = measurements;
export const chunkPresetNames = [
  { id: 'balanced', label: t('320 tokens · 48 overlap', '320 token · 重疊 48') },
  { id: 'no-overlap', label: t('320 tokens · no overlap', '320 token · 不重疊') },
  { id: 'small', label: t('240 tokens · 36 overlap', '240 token · 重疊 36') },
  { id: 'large', label: t('400 tokens · 60 overlap', '400 token · 重疊 60') },
];

export const chunkConcepts = [
  { id: 'article', title: t('Article version', '文章版本'), short: t('One source record', '一筆來源記錄'),
    body: t('Store the full permitted and sanitized article once. A correction creates a new article version. Each entry in your news array starts its own chunk sequence.', '每篇允許使用及已清理的文章全文只儲存一次。修正內容時建立新版本。news 陣列的每篇文章有獨立的切段序列。') },
  { id: 'chunk', title: t('Chunk', '段落片段（chunk）'), short: t('One searchable excerpt', '一段可搜尋原文'),
    body: t('A chunk is a contiguous excerpt from one article. Search may return the part about operating costs without sending a whole 8,000-character briefing to the report model.', 'Chunk 是同篇文章的一段連續原文。搜尋可以只找出談營運成本的段落，報告模型毋須讀完整 8,000 字元的報道。') },
  { id: 'tokenizer', title: t('Tokenizer', 'Tokenizer 分詞器'), short: t('Measure passage length', '量度段落長度'),
    body: t('An embedding model counts tokens. Measure each passage with the pinned tokenizer, including the E5 prefix and special tokens when checking the input limit.', 'Embedding 模型按 token 計長度。用固定 tokenizer 量度每段，檢查輸入上限時亦計 E5 前綴及特殊 token。') },
  { id: 'overlap', title: t('Overlap', '重疊'), short: t('Carry context across a cut', '切段後保留前文'),
    body: t('The next chunk starts a little before the previous end. This can preserve context for a split sentence. Group overlapping hits by article version when selecting evidence so one article does not crowd out others.', '下一段從上一段末端前稍早的位置開始，可保留句子前文。選擇證據時把重疊命中按文章版本組合，避免一篇文章佔滿候選。') },
  { id: 'metadata', title: t('Metadata', '中繼資料（metadata）'), short: t('Locate and cite the excerpt', '定位及引用原文'),
    body: t('A chunk keeps its article version, sequence number, source field and character range. Join the article’s title, publisher, URL and timestamps when you need to filter or cite it.', '每段保存文章版本、段號、來源欄位及字元範圍。篩選或引用時，再查文章標題、出版者、網址及時間。') },
  { id: 'embedding', title: t('Embedding', 'Embedding 向量'), short: t('Search by meaning', '按語義搜尋'),
    body: t('Encode each passage with the same compatible model and revision used for the query. Store the vector with its chunk ID and configuration. Rerank the resulting candidates against the question.', '每段用與查詢相容的相同模型及版本編碼。向量附 chunk ID 及設定儲存，然後按問題對檢索候選重排。') },
];

export const chunkMetadataGuide = [
  { title: t('Store source fields on the article version', '在文章版本存來源欄位'),
    body: t('Map title, summary, publisher, url and publishedAt from each news item. Store the sanitized content. Read document_id, version_id and first_seen_at from news_ingest.versions. Company and shared topic scope come from validated batch membership. Keep a missing publication date or URL null.', '每篇 news 把 title、summary、publisher、url 及 publishedAt 對應至文章版本，並存清理後的 content。document_id、version_id 及 first_seen_at 來自 news_ingest.versions；公司及共享主題來自已核對的批次成員。缺發布日期或 URL 時保留 null。') },
  { title: t('Store offsets and policy on the chunk', '在段落保存範圍及策略'),
    body: t('Use (version_id, chunker_config, chunk_index) as the unique key. Include source_field, start_char, end_char, text hash and token count. Offsets are zero-based Unicode code points with an exclusive end in the exact stored sanitized field. The browser uses code points to slice the same text.', '用 (version_id, chunker_config, chunk_index) 作唯一鍵，另存來源欄位、起訖字元、文字雜湊及 token 數。範圍是已存清理文字的 Unicode 碼點，由 0 開始，不包含終點。瀏覽器按同一單位切出原文。') },
  { title: t('Store the embedding configuration with the vector', '向量附 embedding 設定'),
    body: t('Keep chunk_id, model ID and revision, dimension, passage prefix and normalization with the vector record. Reuse an embedding only when its exact input and configuration match. A different chunking policy or embedding space needs new evaluated rows.', '向量記錄保存 chunk_id、模型 ID 及版本、維度、passage 前綴及正規化。只有完全相同輸入及設定才重用向量。改切段策略或向量空間就建立新資料並評估。') },
  { title: t('Apply the report snapshot at retrieval time', '檢索時套用報告快照'),
    body: t('The snapshot pins allowed versions, the chunk and embedding configuration, the ready vector set and the cutoff. Check publication time, first-seen time and permissions before retrieval. A missing date cannot support an as-of claim. Chunks can appear in more than one snapshot.', '快照固定允許版本、切段及 embedding 設定、已就緒向量及截止時間。查詢前核對發佈時間、首次取得時間及權限。沒有日期的來源不能支持指定時間主張。同段可出現在多個快照。') },
];

export const chunkReferences = [
  { title: 'Multilingual E5-small model card', url: 'https://huggingface.co/intfloat/multilingual-e5-small' },
  { title: 'BGE-M3 model card', url: 'https://huggingface.co/BAAI/bge-m3' },
  { title: 'Sentence Transformers model API', url: 'https://www.sbert.net/docs/package_reference/sentence_transformer/model.html' },
];

export const chunkEncoderExample = `from sentence_transformers import SentenceTransformer

MODEL = "${measurements.model}"
REVISION = "${measurements.revision}"
encoder = SentenceTransformer(MODEL, revision=REVISION)
encoder.max_seq_length = 512

# chunk_text is a validated excerpt from the stored article version.
passage = f"passage: {chunk_text}"
query = "query: MSFT 的基建成本有甚麼變化？"
for value in (passage, query):
    ids = encoder.tokenizer(value, truncation=False)["input_ids"]
    if len(ids) > encoder.max_seq_length:
        raise ValueError("Input exceeds the embedding token budget")

document_vector, query_vector = encoder.encode(
    [passage, query], normalize_embeddings=True
)  # one 384D vector per input
`;

const node = (id: string, label: string, en: string, zh: string) => ({ id, label, detail: t(en, zh) });
const edge = (from: string, to: string, en: string, zh: string, kind: FinanceDiagram['edges'][number]['kind'] = 'flow') =>
  ({ from, to, label: t(en, zh), detail: t(en, zh), kind });

export const financeChunkDiagram: FinanceDiagram = {
  id: 'chunking',
  title: t('From n8n news to searchable passages', '由 n8n 新聞到可檢索段落'),
  nodes: [
    node('payload', 'n8n NEWS ARRAY', 'The company flow requests up to three YFinance articles. Treat each item as a separate document.', '公司流程要求最多三篇 YFinance 文章。每篇獨立處理。'),
    node('intake', 'CHECK CONTENT SIZE', 'Keep the existing 100,000 UTF-16 units per content field. The proposed server or bridge byte cap acts before parsing, and the proposed item policy evaluates each parsed field.', '保留每個 content 欄位 100,000 UTF-16 碼元上限。建議 server 或 bridge 先限制位元組，再對解析後的欄位逐項判斷。'),
    node('summary', 'KEEP VALIDATED SUMMARY', 'Proposed fallback for oversized article text. Validate the provider summary and store its source field, timestamps and reason for reduced coverage.', '長文超限的建議回退。驗證供應商摘要，保存來源欄位、日期及覆蓋減少的原因。'),
    node('skip', 'RECORD ACQUISITION GAP', 'An oversized response is rejected at transport. For a parsed oversized item without a valid summary, the proposed policy records a skip and keeps processing eligible items.', '傳輸拒絕超大回應。若解析後的超長項目無有效摘要，建議記錄略過，繼續處理合資格項目。'),
    node('commit', 'VALIDATE, SANITIZE, COMMIT', 'Deduplicate and store immutable versions in news_ingest.versions. The receipt returns committed version IDs.', '去重並保存固定版本至 news_ingest.versions。收據回傳已提交版本 ID。'),
    node('outbox', 'READ COMMITTED VERSION', 'The proposed indexing worker follows a pending embedding_outbox entry to the sanitized source field.', '建議的索引 worker 根據 embedding_outbox 待處理記錄讀取清理後來源欄位。'),
    node('split', 'TOKENIZE AND SPLIT', 'Keep each chunk within one article. Prefer paragraphs or sentences near the target and validate the full model input.', '不跨文章切段。優先在目標附近的段落或句尾切開，再檢查完整模型輸入。'),
    node('empty', 'RECORD MISSING TEXT', 'If both content and summary are blank, record the gap and skip encoding.', 'content 及 summary 都沒有文字，就記錄缺口並跳過編碼。'),
    node('metadata', 'WRITE CHUNK METADATA', 'Persist the version, source field, exact offsets, chunk order, policy, hash and token count.', '保存版本、來源欄位、確實範圍、次序、策略、雜湊及 token 數。'),
    node('embed', 'ENCODE E5 BATCH', 'Check every prefixed passage against the model limit. The proposed worker processes at most 32 chunks per article in one batch and can stop earlier at its time budget.', '每段計前綴後檢查模型上限。建議 worker 每篇每批最多處理 32 段，亦可在時間預算前停止。'),
    node('ready', 'SAVE VECTORS AND PROGRESS', 'Use idempotent writes keyed by chunk and embedding configuration. Save ready and planned counts. Mark the outbox complete only after all expected rows commit.', '依段落及 embedding 設定作冪等寫入，保存已就緒及計劃段數。所有預期記錄提交後才標記 outbox 完成。'),
    node('queue', 'QUEUE REMAINING CHUNKS', 'Resume from saved indexing progress with the same article version and model configuration. Newly ready vectors belong to later snapshots.', '使用相同文章版本及模型設定，從已存索引進度繼續。新就緒向量供之後的快照使用。'),
    node('snapshot', 'PIN RETRIEVAL SNAPSHOT', 'The report host admits eligible versions and pins the configuration and ready vector set. Sparse remains the default until evaluated hybrid admission.', '報告 host 接納合資格版本，固定設定及已就緒向量。混合評估獲准前預設全文。'),
    node('retrieve', 'SEARCH, RERANK, CITE', 'Retrieve permitted passages within the cutoff and rerank in admitted hybrid. Group overlapping hits by version, stay within the source-read and context budgets, and report any coverage gaps.', '在截止與權限內檢索；已准入混合模式可重排。按版本組合重疊命中，遵守讀取及 context 預算，並報告覆蓋缺口。'),
  ],
  edges: [
    edge('payload','intake','Response within byte limit','回應符合位元組上限'),
    edge('payload','skip','Response too large','回應超大','stop'),
    edge('intake','commit','Content within field limit','正文符合欄位上限'),
    edge('intake','summary','Oversized + usable summary','超長且有可用摘要','fallback'),
    edge('intake','skip','Oversized + no usable summary','超長且無可用摘要','stop'),
    edge('summary','commit','Summary coverage recorded','已記錄摘要覆蓋'),
    edge('commit','outbox','New version queued','新版本入列'),
    edge('outbox','split','Content or summary','全文或摘要'),
    edge('outbox','empty','No usable text','無可用文字','stop'),
    edge('split','metadata','Exact text slices','確實原文範圍'),
    edge('metadata','embed','After chunk creation','切段後編碼'),
    edge('embed','ready','Commit completed batch','提交已完成的一批'),
    edge('ready','queue','Chunks remain','尚有餘下段落'),
    edge('queue','embed','Next worker batch','下一批處理','retry'),
    edge('metadata','snapshot','Sparse search uses admitted text','全文搜尋用已准入原文'),
    edge('ready','snapshot','Admitted hybrid only','只限已准入混合'),
    edge('snapshot','retrieve','Eligible versions and cutoff','合資格版本及截止'),
  ],
};
