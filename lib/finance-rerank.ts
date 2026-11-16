import type { Copy } from './curriculum';
import type { FinanceDiagram } from './finance-diagrams';
import { toyCosine, type ToyVector } from './finance-vector-lesson';

const t = (en: string, zh: string): Copy => ({ en, zh });
export const rerankConcepts = [
  { id: 'embedding', title: t('Embedding model', 'Embedding 模型'), short: t('Text → reusable coordinates', '文字 → 可重用座標'), body: t('An embedding model encodes each passage and query separately. Start by evaluating intfloat/multilingual-e5-small: 384 dimensions, a 512-token window, passage: for documents and query: for questions, including Chinese questions. Pin the revision, prefixes, normalization and chunking configuration. HNSW stores links between these vectors; it does not create embeddings.', 'Embedding 模型分別編碼段落及問題。先評估 intfloat/multilingual-e5-small：384 維、512 token 視窗，文件加 passage:、問題加 query:，中文問題亦一樣。固定 revision、prefix、正規化及切段設定。HNSW 保存向量間連線，不產生 embedding。') },
  { id: 'exact', title: t('Exact vector search', '精確向量搜尋'), short: t('Compare every eligible vector', '比較全部合資格向量'), body: t('Exact search is your first pgvector baseline. It gives the nearest neighbours under the selected vector distance and filters, but semantic relevance is still a separate question. A small pilot may already be fast enough without HNSW. Measure real filtered queries before adding an approximate index.', '精確搜尋是 pgvector 起步基線，按所選距離及條件找最近鄰；語義相關性仍是另一問題。小型試驗可能毋須 HNSW 已足夠，先量度實際帶條件查詢，再加近似索引。') },
  { id: 'hnsw', title: t('HNSW index', 'HNSW 索引'), short: t('Graph shortcuts → candidate vectors', '圖連線捷徑 → 候選向量'), body: t('Hierarchical Navigable Small World is an approximate nearest-neighbour graph. Sparse upper layers guide the search towards a useful region; the base layer explores more neighbours. It can trade search work and memory for recall. It is a PostgreSQL index access method, separate from the LangGraph workflow graph, the embedding model and a reranker.', 'Hierarchical Navigable Small World 是近似最近鄰圖。稀疏上層引導搜尋到合適區域，底層再探索鄰居，以搜尋工作及記憶體與召回作取捨。它是 PostgreSQL 索引方法，與 LangGraph 工作流程圖、embedding 模型及重排器分開。') },
  { id: 'filters', title: t('Filtered ANN search', '帶條件 ANN 搜尋'), short: t('Keep WHERE; expect short result sets', '保留 WHERE，可能不足 k 筆'), body: t('Keep snapshot membership, model/policy configuration, permissions, company/global context and both timestamps in SQL. These protect returned evidence. In pgvector approximate scans, filtering happens after index traversal, so many visited rows may be rejected and LIMIT 20 can return fewer than 20. Iterative scans can explore more but still have caps. Never drop filters to fill the list. strict_order orders found results; it does not restore exact recall.', 'SQL 保留快照、模型／隱私設定、權限、公司／共用背景及兩個時間條件，保護回傳證據。pgvector 近似掃描是在索引探索後篩選，很多已訪列可能被拒，LIMIT 20 可少於 20 筆。Iterative scan 可多探索但仍有上限；不能刪條件湊筆數。strict_order 只排序已找到結果，不恢復精確召回。') },
  { id: 'fusion', title: t('Hybrid fusion', '混合融合'), short: t('Full-text ranks + vector ranks', '全文排名＋向量排名'), body: t('Your admitted hybrid path retrieves up to 20 candidates per branch, deduplicates by stable source/chunk identity and uses reciprocal rank fusion to keep 20. RRF combines ranks, not raw cosine values and reranker logits. Full-text can retrieve something HNSW missed. The browser animation isolates the dense branch so you can see the missed-candidate problem.', '已准入混合路徑每分支最多 20 候選，按穩定來源／切段身份去重，再用 RRF 保留 20。RRF 融合名次，不混加 cosine 與重排 logit。全文可能找到 HNSW 漏掉內容；瀏覽器動畫只示範 dense 分支，方便看清候選遺漏。') },
  { id: 'rerank', title: t('Cross-encoder reranker', 'Cross-encoder 重排器'), short: t('Question + passage → relevance score', '問題＋原文 → 相關性分數'), body: t('A cross-encoder reads each question–passage pair together. Evaluate BAAI/bge-reranker-v2-m3 for multilingual reranking, independently from your E5 embedding model. Score only the retrieved shortlist, then keep the top 10 before selecting at most 6 report excerpts. A high score is neither a probability of truth nor a stock-return estimate. Reranking cannot add a source that was never retrieved.', 'Cross-encoder 一起讀問題與原文配對，可評估 BAAI/bge-reranker-v2-m3 作多語重排，與 E5 embedding 模型獨立。只評已檢索小集合，保留前 10，再最多選 6 段作報告。高分不是事實機率或股票回報估計；重排不能加入從未檢索的來源。') },
  { id: 'review', title: t('Review and evidence gate', '覆核及證據關卡'), short: t('Your emphasis stays separate from model rank', '你的重點與模型排名分開'), body: t('After system ranking, users can exclude, highlight and reorder proposed news. Preserve system ranks and record discussion order separately. Validate selected IDs, permissions and coverage again before context assembly. Privacy removal and trimming can remove required support. Missing support returns insufficient; similarity or a reranker cannot waive that rule.', '系統排序後，用戶可排除、標記及改建議新聞次序。保留系統排名，討論次序另記；context 前重查所選 ID、權限及覆蓋。隱私移除及裁剪可令必要支持流失，支持不足回 insufficient，相似度或重排器不能免除此規則。') },
];

export const hnswSettings = [
  { name: 'm', phase: t('Build', '建立索引'), body: t('Graph connectivity setting. The documented default is 16. More links change memory, build/insert work and recall; do not copy a large value without measurement.', '圖連通設定，官方預設 16。更多連線改變記憶體、建立／插入工作及召回，未量度不要直接用大值。') },
  { name: 'ef_construction', phase: t('Build', '建立索引'), body: t('Candidate-list size during index construction; documented default 64. It affects the built graph. SET LOCAL ef_search does not rebuild that graph.', '建圖時的候選清單大小，官方預設 64，影響已建圖；SET LOCAL ef_search 不會重建圖。') },
  { name: 'hnsw.ef_search', phase: t('Query', '查詢'), body: t('Search candidate-list size; documented default 40. Compare settings such as 40/80/120 on real filtered queries. It is not top-k and not a count of nodes visited. Use SET LOCAL within the query transaction.', '搜尋候選清單大小，官方預設 40。可在實際條件查詢比較 40／80／120；它不是 top-k 或已訪節點數，在查詢 transaction 內用 SET LOCAL。') },
  { name: 'hnsw.iterative_scan', phase: t('Query · pgvector ≥0.8.0', '查詢 · pgvector ≥0.8.0'), body: t('strict_order can continue a filtered scan until enough rows are found or scan/resource limits are reached. Check max_scan_tuples, work_mem and the remaining deadline. It does not promise a full list or exact neighbours.', 'strict_order 可在帶條件掃描繼續找列，直到足夠或碰到掃描／資源上限。核對 max_scan_tuples、work_mem 及餘下時限，不保證足筆數或精確最近鄰。') },
];

export const rerankProjectSteps = [
  { title: t('Ingestion and index build', '匯入及建索引'), body: t('n8n fetches company/daily news and owns provider retries. Sanitize permitted excerpts before committing PostgreSQL evidence. A separate Python worker chunks and embeds new text with pinned E5 configuration. A migration/operator builds an optional HNSW cosine index over ready compatible vectors; do not build it per prompt or re-embed when only ef_search changes.', 'n8n 抓公司／每日新聞並控制供應商重試，允許節錄先清理再提交 PostgreSQL。獨立 Python worker 按固定 E5 設定切段及嵌入新文字；migration／操作者在就緒相容向量上建立可選 HNSW cosine 索引。不能每題重建，亦不因只改 ef_search 而重嵌入。') },
  { title: t('Per accepted prompt', '每個有效提示'), body: t('Sanitize before graph invocation, pass scope, refresh company news once and pin the snapshot/vector-ready view. Sparse remains default. Admitted hybrid embeds the query, searches full-text and exact/HNSW dense candidates under identical safety filters, fuses, reranks and enters evidence review. Resume/refinement keeps the same eligible corpus and remaining budgets. A snapshot does not freeze the physical ANN graph: new inserts can change approximate neighbours. Save retrieval settings, reranker revision and completed candidate IDs/ranks in the checkpoint; reuse completed results on resume. Repeatable ANN experiments need a frozen database/index view.', 'Graph 前清理、通過 scope、刷新公司新聞一次，再固定快照／向量就緒視圖。Sparse 仍是預設；已准入混合模式才嵌入問題，在相同安全條件下搜尋全文及 exact／HNSW 向量候選，融合、重排及進證據覆核。恢復／補查沿用合資格語料及剩餘預算。快照不凍結實體 ANN 圖，新插入可改近似鄰居；checkpoint 須存檢索設定、重排版本及已完成候選 ID／排名，恢復時重用結果。可重現 ANN 實驗須凍結資料庫／索引視圖。') },
  { title: t('Measure two different questions', '分開量度兩個問題'), body: t('First compare HNSW neighbour overlap with exact vector search under the same snapshot and filters, and measure latency/memory on the actual corpus. Separately test semantic relevance using the frozen golden set. Hybrid+reranking needs at least +0.03 recall@10 and +0.05 nDCG@10 over sparse, no company regression, citation precision ≥0.95 with no decline from sparse, and safety/abstention gates. ANN neighbour overlap is not that relevance recall and does not validate forecasts.', '先在同快照及條件下比較 HNSW 與 exact 的鄰居重疊，再量度實際語料的延遲／記憶體；另用凍結 golden set 評語義相關。混合＋重排須比 sparse 至少 recall@10 +0.03、nDCG@10 +0.05，各公司不倒退，引用精準度 ≥0.95 且不低於 sparse，並過安全／拒答關卡。ANN 鄰居重疊不是該相關召回，也不驗證預測。') },
  { title: t('Failure and short-list handling', '失敗及候選不足'), body: t('Too few filtered results can mean limited ANN exploration, not no news. Use a preselected larger scan setting or exact path within the same search budget, or surface the shortfall. Do not add hidden retrieval calls. Operational vector/reranker errors may use sparse fallback. Privacy failures stop the affected path. A PostgreSQL outage affects both branches; release only claims supported by available evidence.', '帶條件結果不足可能是 ANN 探索受限，不等於沒有新聞。可在同一搜尋預算內使用預先選定較大掃描或 exact 路徑，否則明示不足，不暗加檢索次數。向量／重排運作錯誤可回 sparse，隱私失敗停止該路徑；PostgreSQL 中斷影響兩分支，只發布可用證據支持的主張。') },
];

type QuestionId = 'costs' | 'rates' | 'missing';
export const rerankQuestions: Array<{ id: QuestionId; title: Copy; text: Copy; vector: ToyVector }> = [
  { id: 'costs', title: t('MSFT infrastructure costs', 'MSFT 基建成本'), text: t('Which evidence directly supports increased MSFT infrastructure spending?', '哪些證據直接支持 MSFT 基建支出增加？'), vector: [1, 0.1] },
  { id: 'rates', title: t('Interest-rate context', '利率背景'), text: t('Which passage describes a policy-rate increase?', '哪段原文描述政策利率上升？'), vector: [0, 1] },
  { id: 'missing', title: t('Missing export evidence', '缺少出口證據'), text: t('Which passage documents a new MSFT export restriction?', '哪段原文記錄新的 MSFT 出口限制？'), vector: [1, 0.1] },
];
export type RerankQuestionId = QuestionId;
type Grade = 0 | 1 | 2;
export type SearchToyDocument = { id: string; text: Copy; vector: ToyVector; excluded: Copy | null; grades: Record<QuestionId, Grade>; x: number; y: number };
export const searchToyDocuments: SearchToyDocument[] = [
  { id: 'entry', text: t('Fictional: a market roundup names MSFT.', '虛構：市場綜述提及 MSFT。'), vector: [0, 1], excluded: null, grades: { costs: 0, rates: 0, missing: 0 }, x: 65, y: 250 },
  { id: 'cloud', text: t('Fictional profile: MSFT operates capital-intensive cloud infrastructure.', '虛構背景：MSFT 經營資本密集的雲端基建。'), vector: [0.6, 0.8], excluded: null, grades: { costs: 1, rates: 0, missing: 0 }, x: 220, y: 255 },
  { id: 'keyword', text: t('Fictional: MSFT advertises tools for customers to manage their cloud costs; this reports no change in MSFT spending.', '虛構：MSFT 宣傳助客戶管理雲端成本的工具，沒有報道 MSFT 支出變化。'), vector: [0.95, 0.31], excluded: null, grades: { costs: 0, rates: 0, missing: 0 }, x: 395, y: 245 },
  { id: 'direct', text: t('Fictional: MSFT reports higher data-centre capital expenditure in a dated filing.', '虛構：MSFT 在有日期文件報告數據中心資本支出增加。'), vector: [0.9, 0.45], excluded: null, grades: { costs: 2, rates: 0, missing: 0 }, x: 590, y: 445 },
  { id: 'future', text: t('Fictional future article, beyond the frozen evidence cutoff.', '虛構未來文章，超過固定證據截止。'), vector: [1, 0.07], excluded: t('Outside snapshot / time cutoff', '快照／時間截止以外'), grades: { costs: 2, rates: 0, missing: 0 }, x: 590, y: 225 },
  { id: 'foreign', text: t('Fictional AAPL article outside the selected MSFT company filter.', '虛構 AAPL 文章，不符所選 MSFT 公司條件。'), vector: [1, 0.04], excluded: t('Wrong company / no permission in this run', '錯公司／本任務無權限'), grades: { costs: 2, rates: 0, missing: 0 }, x: 595, y: 330 },
  { id: 'bridge', text: t('Fictional: a general infrastructure discussion has no dated spending change.', '虛構：一般基建討論，沒有有日期支出變化。'), vector: [0.8, -0.6], excluded: null, grades: { costs: 1, rates: 0, missing: 0 }, x: 400, y: 390 },
  { id: 'macro', text: t('Fictional macro release: the policy interest rate increased.', '虛構宏觀公布：政策利率上升。'), vector: [-0.4, 0.9], excluded: null, grades: { costs: 0, rates: 2, missing: 0 }, x: 105, y: 435 },
  { id: 'noise', text: t('Fictional weather story with no documented company exposure.', '虛構天氣新聞，沒有已記錄公司曝險。'), vector: [-0.9, 0.1], excluded: null, grades: { costs: 0, rates: 0, missing: 0 }, x: 245, y: 475 },
];
export const searchToyEdges: Array<[string, string]> = [['entry', 'cloud'], ['entry', 'macro'], ['cloud', 'keyword'], ['cloud', 'macro'], ['keyword', 'future'], ['keyword', 'foreign'], ['keyword', 'bridge'], ['bridge', 'direct'], ['macro', 'noise']];
export const searchToyUpperIds = ['entry', 'cloud', 'macro'];
const byId = (id: string) => {
  const doc = searchToyDocuments.find(item => item.id === id);
  if (!doc) throw new Error(`Unknown toy document ${id}`);
  return doc;
};
export type RerankToyHit = { document: SearchToyDocument; similarity: number; grade: Grade };
export type SearchToyFrame = { kind: 'upper'; id: string } | { kind: 'base'; id: string } | { kind: 'retrieved' } | { kind: 'reranked' } | { kind: 'review' } | { kind: 'context' };
export function runRerankToy({ questionId, mode, exploration, topK }: { questionId: QuestionId; mode: 'graph' | 'exact'; exploration: number; topK: number }) {
  const question = rerankQuestions.find(item => item.id === questionId) ?? rerankQuestions[0];
  const similarity = (id: string) => toyCosine(question.vector, byId(id).vector);
  const compare = (a: string, b: string) => similarity(b) - similarity(a) || a.localeCompare(b);
  const upperPath = ['entry'];
  if (mode === 'graph') {
    const nearestUpper = [...searchToyUpperIds].sort(compare)[0];
    if (nearestUpper !== 'entry') upperPath.push(nearestUpper);
  }
  const visited: string[] = [];
  if (mode === 'exact') visited.push(...searchToyDocuments.map(item => item.id));
  else {
    const frontier = new Set([upperPath.at(-1) ?? 'entry']);
    const budget = Math.max(1, Math.min(searchToyDocuments.length, Math.floor(exploration)));
    while (frontier.size && visited.length < budget) {
      const next = [...frontier].sort(compare)[0];
      frontier.delete(next);
      visited.push(next);
      for (const [from, to] of searchToyEdges) {
        const neighbour = from === next ? to : to === next ? from : null;
        if (neighbour && !visited.includes(neighbour)) frontier.add(neighbour);
      }
    }
  }
  const count = Math.max(1, Math.min(4, Math.floor(topK)));
  const exact = searchToyDocuments.filter(doc => !doc.excluded).map(doc => doc.id).sort(compare).slice(0, count);
  const retrieved: RerankToyHit[] = visited.filter(id => !byId(id).excluded).sort(compare).slice(0, count).map(id => ({ document: byId(id), similarity: similarity(id), grade: byId(id).grades[question.id] }));
  const reranked = [...retrieved].sort((a, b) => b.grade - a.grade || b.similarity - a.similarity || a.document.id.localeCompare(b.document.id));
  const overlap = retrieved.filter(hit => exact.includes(hit.document.id)).length;
  const frames: SearchToyFrame[] = [
    ...(mode === 'graph' ? upperPath.map(id => ({ kind: 'upper', id } satisfies SearchToyFrame)) : []),
    ...visited.map(id => ({ kind: 'base', id } satisfies SearchToyFrame)),
    { kind: 'retrieved' }, { kind: 'reranked' }, { kind: 'review' }, { kind: 'context' },
  ];
  return { question, upperPath, visited, retrieved, reranked, exactIds: exact, overlap, frames, supported: reranked.some(hit => hit.grade === 2) };
}

const n = (id: string, label: string, en: string, zh: string) => ({ id, label, detail: t(en, zh) });
const e = (from: string, to: string, en: string, zh: string, kind: FinanceDiagram['edges'][number]['kind'] = 'flow') => ({ from, to, label: t(en, zh), detail: t(en, zh), kind });
export const rerankHnswDiagram: FinanceDiagram = {
  id: 'rerank_hnsw', title: t('Embedding → exact/HNSW → fusion → rerank', 'Embedding → exact／HNSW → 融合 → 重排'),
  nodes: [n('ingest', 'SANITIZED COMMITTED CHUNKS', 'n8n acquires permitted news. Commit sanitized versions before a separate document embedding worker runs.', 'n8n 抓允許新聞，先提交清理版本，再由獨立文件 embedding worker 處理。'), n('embed', 'E5 DOCUMENT VECTORS + MODEL KEY', 'Pin 384D model revision, prefixes, normalization, chunking and privacy policy.', '固定 384 維模型 revision、prefix、正規化、切段及隱私政策。'), n('index', 'OPTIONAL HNSW COSINE INDEX', 'Build outside user turns. Exact vector search remains the reference; ANN requires measured recall and resource checks.', '在用戶回合外建立，exact 向量搜尋作基準；ANN 須量度召回及資源。'), n('request', 'SCOPE → REFRESH → SNAPSHOT', 'After API privacy and scope, refresh once and pin the eligible text/vector-ready view. Independent ingestion continues.', 'API 隱私及 scope 後刷新一次，固定合資格文字／向量就緒視圖，獨立匯入繼續。'), n('query', 'QUERY EMBEDDING · HYBRID ONLY', 'Use compatible E5 configuration. Sparse is the default until frozen admission.', '用相容 E5 設定，凍結評估准入前預設 sparse。'), n('dense', 'FILTERED EXACT / HNSW SEARCH', 'Keep SQL filters. ANN may yield fewer than k; iterative_scan has caps and strict_order is not exact recall.', '保留 SQL 條件，ANN 可不足 k；iterative_scan 有上限，strict_order 不是 exact 召回。'), n('sparse', 'POSTGRESQL FULL-TEXT', 'Default path and the sparse branch of admitted hybrid. It needs no embeddings.', '預設路徑及已准入混合的 sparse 分支，毋須 embedding。'), n('fuse', 'RRF · FUSE TO 20', 'Use up to 20 candidates per branch, deduplicate and fuse ranks. Do not add cosine and neural logits.', '每分支最多 20，去重及融合名次，不直接相加 cosine 與神經 logit。'), n('rerank', 'BGE RERANKER CANDIDATE → TOP 10', 'Score sanitized question–passage pairs using a separately pinned model; no stock-impact probability.', '獨立固定模型評清理問題／原文配對，不是股價影響機率。'), n('review', 'REVIEW → GATE → ≤6 EXCERPTS', 'Show source order, allow exclusions/highlights/discussion preference, validate coverage before context and LLM.', '展示來源次序，允許排除／標記／討論偏好，context 及 LLM 前核對覆蓋。'), n('fallback', 'SPARSE FALLBACK / EXPLICIT FAILURE', 'Operational dense/reranker errors may use sparse within budget. Privacy failure stops; PostgreSQL outage affects both.', '向量／重排運作錯誤可在預算內回 sparse；隱私失敗停止，資料庫中斷影響兩者。')],
  edges: [e('ingest', 'embed', 'Index new versions', '索引新版本'), e('embed', 'index', 'Ready compatible vectors', '就緒相容向量'), e('index', 'dense', 'Stored index access path', '已存索引路徑'), e('request', 'query', 'Admitted hybrid', '已准入混合'), e('request', 'sparse', 'Default / hybrid branch', '預設／混合分支'), e('query', 'dense', 'Pinned query vector', '固定問題向量'), e('dense', 'fuse', 'Eligible dense candidates', '合資格向量候選'), e('sparse', 'fuse', 'Admitted hybrid only', '只限已准入混合'), e('sparse', 'review', 'Default ranking', '預設排序'), e('fuse', 'rerank', 'Shortlist original text', '小集合原文'), e('rerank', 'review', 'Relevance order', '相關性次序'), e('dense', 'fallback', 'Error / scan shortfall', '錯誤／掃描不足', 'fallback'), e('rerank', 'fallback', 'Operational error', '運作錯誤', 'fallback'), e('fallback', 'review', 'Working sparse, same budget', 'Sparse 可用，原預算', 'fallback')],
};
export const rerankReferences = [
  { title: 'pgvector: HNSW, filtering, iterative scans and exact comparison', url: 'https://github.com/pgvector/pgvector' },
  { title: 'Multilingual E5 small embedding model', url: 'https://huggingface.co/intfloat/multilingual-e5-small' },
  { title: 'BGE reranker v2 M3 model card', url: 'https://huggingface.co/BAAI/bge-reranker-v2-m3' },
  { title: 'Sentence Transformers: CrossEncoder usage', url: 'https://www.sbert.net/docs/cross_encoder/usage/usage.html' },
];
