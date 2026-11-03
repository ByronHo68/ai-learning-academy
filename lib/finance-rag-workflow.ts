import type { Copy } from './curriculum';

export const financeRagNodes = {
  question: {
    keyword: 'QUESTION',
    title: { en: 'Ask a question and choose the reports', zh: '提問並選擇財報' },
    detail: { en: 'Collect the question, selected company, reporting years and answer language. For a Chinese question over English PDFs, use a suitable multilingual embedding model and an English keyword rewrite; preserve company identifiers, years and accounting terms. Keep the original question alongside the rewrite.', zh: '收集問題、所選公司、報告年份及回答語言。以中文查詢英文 PDF 時，使用合適的多語嵌入模型及英文關鍵詞改寫，保留公司識別、年份及會計用語，同時保存原問題。' },
    tools: 'Next.js → Spring research service → private Python',
  },
  scope: {
    keyword: 'ACCESS + SCOPE',
    title: { en: 'Restrict both searches to the right evidence', zh: '限定兩條搜尋路徑的證據範圍' },
    detail: { en: 'The backend checks caller access and resolves the permitted company, periods and exact report versions. Apply those constraints inside both dense and keyword queries. Keep source page and chunk IDs on every candidate so later ranking never loses provenance.', zh: '後端核對呼叫者權限，確定獲准公司、期間及確切報告版本。在向量及關鍵詞查詢中套用相同限制。每個候選段落保留來源頁及 chunk ID，排序後仍可追溯。' },
    tools: 'Spring report scope · service-authenticated FastAPI · SQL filters',
  },
  dense: {
    keyword: 'DENSE VECTOR',
    title: { en: 'Find similar meaning', zh: '搜尋相近語意' },
    detail: { en: 'Embed the question with the same model and dimensions used for the passage index. Search permitted passages by vector similarity, even when wording differs. Start with exact pgvector search for the six-PDF baseline. Consider HNSW only after measuring latency and recall, including restrictive company/year filters.', zh: '以段落索引相同的模型及維度嵌入問題，按向量相似度搜尋獲准段落，尋找措辭不同但語意相近的內容。六份 PDF 基準先用 pgvector 精確搜尋；量度延遲及召回率，包括嚴格公司／年份篩選後，才考慮 HNSW。' },
    tools: 'Embedding model · pgvector · exact search first',
  },
  keyword: {
    keyword: 'KEYWORD SEARCH',
    title: { en: 'Find specific financial terms', zh: '搜尋特定財務用語' },
    detail: { en: 'Search normalized terms such as “expected credit losses” and “HKFRS 9” in the same permitted report scope. Use PostgreSQL tsvector, a GIN index and ts_rank_cd. This is lexical retrieval; it is not built-in BM25 or learned sparse embeddings. A learned sparse model is a later comparison, not a prerequisite for hybrid search.', zh: '在相同獲准報告範圍搜尋標準化用語，例如「expected credit losses」及「HKFRS 9」。使用 PostgreSQL tsvector、GIN 索引及 ts_rank_cd。這是詞彙檢索，並非內建 BM25 或學習式稀疏嵌入；後者留作日後比較，混合搜尋毋須先加入。' },
    tools: 'PostgreSQL · tsvector · GIN · ts_rank_cd',
  },
  fusion: {
    keyword: 'RRF FUSION',
    title: { en: 'Combine the two rankings', zh: '合併兩份排名' },
    detail: { en: 'Reciprocal Rank Fusion combines ranking positions from the dense and keyword lists. Use stable chunk IDs to merge duplicate candidates, retaining their contribution from each list. Do not directly add raw similarity and text-ranking scores: they have different scales. Keep the source and report-version metadata.', zh: 'Reciprocal Rank Fusion 以向量及關鍵詞清單中的排名位置合併結果。用固定 chunk ID 合併重複候選，保留其在兩份排名的貢獻。相似度與文字排名分數尺度不同，不直接相加，並保留來源及報告版本資料。' },
    tools: 'Python · RRF · chunk-ID deduplication',
  },
  rerank: {
    keyword: 'OPTIONAL RERANK',
    title: { en: 'Reorder the shortlisted passages if needed', zh: '有需要時重排候選段落' },
    detail: { en: 'First evaluate the fused ranking on checked questions. If relevant evidence is present but ranks poorly, test a reranker on the bounded candidate list. Compare quality, latency and cost before enabling it. A reranker cannot retrieve a page that neither search returned, and must preserve access and source metadata.', zh: '先以已核對問題評估合併排名。若相關證據已存在但位置太後，再以有限候選清單測試重排模型，對比品質、延遲及成本後才啟用。重排不能找回兩條搜尋路徑都未找到的頁面，亦須保留權限及來源資料。' },
    tools: 'Optional reranker · bounded candidates · evaluation',
  },
  evidence: {
    keyword: 'ENOUGH EVIDENCE?',
    title: { en: 'Check whether the sources support this question', zh: '檢查來源是否足以回答問題' },
    detail: { en: 'Build a bounded evidence bundle and check company, years, versions and coverage of the requested claims. A high similarity score alone is not proof. If a required source or explanation is absent, stop the full-answer generation path and identify the gap. Numerical facts can be available while the cause of a change remains unsupported.', zh: '建立範圍受限證據組，核對公司、年份、版本及來源是否涵蓋所需主張。高相似度本身不是證明。缺少必要來源或解釋時，停止完整答案生成並指出缺口；即使已有數字，變動原因仍可能沒有支持。' },
    tools: 'Evidence builder · source coverage checks · LangGraph state',
  },
  llm: {
    keyword: 'SELECTED LLM',
    title: { en: 'Draft from evidence and checked calculations', zh: '依證據及已核對計算草擬' },
    detail: { en: 'Load reviewed numerical facts from SQL and calculate changes with Python Decimal. Give the model those results and retrieved passages with source IDs. The model router enforces the approved provider, task tier, capabilities and remaining budget. Draft a cited explanation; do not let the LLM invent missing figures or perform authoritative financial arithmetic.', zh: '從 SQL 讀取已覆核數據，以 Python Decimal 計算變動。把計算結果、檢索段落及來源 ID 交給模型；路由器限制獲准供應商、任務級別、能力及剩餘預算。模型草擬附引用解釋，不能編造缺失數字或負責權威財務算術。' },
    tools: 'Reviewed SQL facts · Python Decimal · model router · LLM API',
  },
  validate: {
    keyword: 'VALIDATE',
    title: { en: 'Check every material claim before returning it', zh: '回傳前核對重要主張' },
    detail: { en: 'Validate the response schema, source-page targets, numerical values, units and periods. Check that the cited passages support each material claim. Return a complete answer only when the required checks pass. Unsupported claims become explicit limitations or a review request; a second model’s agreement alone is not evidence.', zh: '驗證回應結構、來源頁位置、數值、單位及期間，再核對引用段落是否支持重要主張。所需檢查通過後才回傳完整答案；未獲支持的主張須標示限制或要求覆核，第二個模型同意並不能作為證據。' },
    tools: 'Pydantic · deterministic checks · source review',
  },
  answer: {
    keyword: 'ANSWER / PARTIAL',
    title: { en: 'Return the checked result and its sources', zh: '回傳已核對結果及來源' },
    detail: { en: 'Show the supported answer with clickable PDF pages, calculation inputs and the run ID. If validation leaves unresolved claims, clearly label the result as partial or awaiting review and explain what remains unresolved. Preserve model, retrieval and report-version details for reproducibility.', zh: '顯示有支持的答案、可點擊 PDF 頁面、計算輸入及執行 ID。若驗證後仍有未解決主張，清楚標示部分結果或待覆核，說明尚未解決內容，並保存模型、檢索及報告版本以便重現。' },
    tools: 'Saved run · citations · Next.js result view',
  },
  missing: {
    keyword: 'MISSING EVIDENCE',
    title: { en: 'Explain the gap and the next step', zh: '說明證據缺口及下一步' },
    detail: { en: 'Skip the full-answer LLM call. Show which report, period, page or causal explanation is missing, and request the required source or manual review. Return already checked facts only when clearly labelled as partial. A stronger model cannot supply evidence that is absent from the permitted reports.', zh: '略過完整答案 LLM 呼叫，指出缺少哪份報告、期間、頁面或原因解釋，要求補充來源或人工覆核。已核對數據只可在清楚標示部分結果時回傳；更強模型不能補出獲准報告中不存在的證據。' },
    tools: 'Structured limitation · saved status · review action',
  },
} satisfies Record<string, { keyword: string; title: Copy; detail: Copy; tools: string }>;
