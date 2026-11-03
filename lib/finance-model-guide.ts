import type { Copy } from './curriculum';
import type { financeFunctionWorkflows } from './finance-function-workflows';

export const financeModelCandidates = [
  {
    id: 'gpt-6-luna',
    name: 'OpenAI · Luna',
    role: { en: 'Economy candidate: classify a request, translate supplied text or draft a short summary.', zh: '經濟級別候選：分類請求、翻譯提供的文字，或草擬簡短摘要。' },
    caveat: { en: 'Treat this workload assignment as a hypothesis. Evaluate preserved figures, financial terminology and source references before enabling it.', zh: '這項工作分配是假設；啟用前須評估數字、財務用語及來源參照是否正確保留。' },
    url: 'https://developers.openai.com/api/docs/models',
  },
  {
    id: 'gpt-6.1-sol',
    name: 'OpenAI · Sol',
    role: { en: 'Balanced candidate: answer ordinary report questions using retrieved evidence and explain calculated changes.', zh: '平衡級別候選：依檢索證據回答一般財報問題，並解釋已計算的變動。' },
    caveat: { en: 'The proposed default still needs your report-specific evaluations. Code calculates ratios; the model explains evidence and cites pages.', zh: '這個建議預設仍須用你的財報案例評估。比率由程式計算，模型負責解釋證據及引用頁面。' },
    url: 'https://developers.openai.com/api/docs/models',
  },
  {
    id: 'gpt-6-astra',
    name: 'OpenAI · Astra',
    role: { en: 'Deep-reasoning candidate: reconcile conflicting disclosures, restatements or accounting policies across reports.', zh: '深入推理候選：核對不同報告中互相矛盾的披露、重列數字或會計政策。' },
    caveat: { en: 'Reserve for measured needs within the budget. Stronger reasoning cannot recover absent source facts or replace accounting review.', zh: '在預算內按實際評估需要使用；更強推理不能補回缺失的來源數據，也不能取代會計覆核。' },
    url: 'https://developers.openai.com/api/docs/models',
  },
  {
    id: 'deepseek-flash',
    name: 'DeepSeek · Flash',
    role: { en: 'Economy or balanced candidate: extraction, bilingual summaries and ordinary evidence-based questions; evaluate each task separately.', zh: '經濟或平衡級別候選：擷取、雙語摘要及一般證據問答；各項任務須獨立評估。' },
    caveat: { en: 'Supports thinking and non-thinking modes, vision, JSON and tools. Match the endpoint and request fields in the DeepSeek adapter.', zh: '支援思考及非思考模式、視覺、JSON 及工具；DeepSeek 介接層須使用相符端點及請求欄位。' },
    url: 'https://api-docs.deepseek.com/quick_start/pricing/',
  },
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek · V4 Pro',
    role: { en: 'Deep-reasoning candidate: compare several periods and investigate disagreements in extracted text and reviewed facts.', zh: '深入推理候選：比較多個期間，調查已擷取文字及已覆核數據中的分歧。' },
    caveat: { en: 'Does not support vision. Extract or OCR page images before this route, retain page references, and validate the resulting interpretation.', zh: '不支援視覺；使用此路徑前先擷取文字或對頁面影像作 OCR，保留頁面參照，再驗證解讀。' },
    url: 'https://api-docs.deepseek.com/quick_start/pricing/',
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Google · Gemini Flash-Lite',
    role: { en: 'Economy candidate: high-volume document parsing, simple extraction and short summaries.', zh: '經濟級別候選：大量文件解析、簡單擷取及短摘要。' },
    caveat: { en: 'Stable model with PDF, image and text input, structured output and tools. Test table extraction and bilingual wording on your own reports.', zh: '穩定版本，支援 PDF、影像及文字輸入、結構化輸出及工具。須以自己的財報測試表格擷取及雙語措辭。' },
    url: 'https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite',
  },
  {
    id: 'gemini-4-argon',
    name: 'Google · Gemini Argon',
    role: { en: 'Deep-reasoning candidate: difficult document comparisons and multi-step research with text or page images.', zh: '深入推理候選：利用文字或頁面影像，處理較難的文件比較及多步研究。' },
    caveat: { en: 'Stable reasoning model. Its context allowance combines input and output; explicit context caching is unsupported. Evaluate before adopting.', zh: '穩定推理模型；上下文額度合計輸入與輸出，且不支援明確建立的上下文快取。採用前須先評估。' },
    url: 'https://ai.google.dev/gemini-api/docs/models/gemini-4-argon',
  },
  {
    id: 'claude-sonnet-5-5',
    name: 'Anthropic · Claude Sonnet',
    role: { en: 'Balanced alternative: evidence-based report analysis, document interpretation and tool-assisted workflows.', zh: '平衡級別替代：依證據分析財報、解讀文件，並協調工具輔助流程。' },
    caveat: { en: 'Active model with text/image input and tool use. Use a Claude-specific adapter; validate supported parameters and account access before enabling.', zh: '現行受支援模型，可輸入文字／影像及使用工具。須用 Claude 專用介接層，啟用前核對參數支援及帳戶權限。' },
    url: 'https://platform.claude.com/docs/en/models/overview',
  },
] satisfies { id: string; name: string; role: Copy; caveat: Copy; url: string }[];

export const financeModelTasks = [
  {
    task: { en: 'Upload, permissions and saved records', zh: '上載、權限及已存記錄' },
    route: 'API + storage + PostgreSQL · no LLM',
    detail: { en: 'Validate the file, authorize access, save its hash and create a job. Listing, updating and deleting records use ordinary backend code and database transactions.', zh: '驗證檔案、核對權限、儲存雜湊並建立工作。列出、更新及刪除記錄由一般後端程式及資料庫交易處理。' },
  },
  {
    task: { en: 'Ratios, growth and comparisons of known values', zh: '比率、增長及已知數值比較' },
    route: 'Reviewed facts → Python Decimal → result',
    detail: { en: 'Check company, period, currency, unit and accounting basis first. Calculate with Decimal, handle zero denominators explicitly and retain input references. An LLM may explain the verified result afterwards.', zh: '先核對公司、期間、貨幣、單位及會計基準，再用 Decimal 計算，明確處理分母為零並保留輸入參照。LLM 可在之後解釋已驗證結果。' },
  },
  {
    task: { en: 'Build and search the evidence index', zh: '建立及搜尋證據索引' },
    route: 'text-embedding-3-small → pgvector',
    detail: { en: 'An embedding model converts passages and questions into vectors; it does not write answers. This is one candidate, subject to account and region eligibility. Keep the same model and dimensions for indexed passages and queries; changing them requires a new index.', zh: '嵌入模型把段落及問題轉成向量，不會撰寫答案。這只是候選之一，須符合帳戶及地區資格。索引段落與查詢須使用相同模型及維度；更換時須建立新索引。' },
  },
  {
    task: { en: 'Translate, label and extract supplied content', zh: '翻譯、標籤及擷取提供的內容' },
    route: 'Economy · Luna / DeepSeek Flash / Gemini Flash-Lite',
    detail: { en: 'Start from parsed text; use a vision-capable route only when images are needed. Produce candidate fields with source pages, then check schema, values and meaning. All model-to-task assignments here are proposed hypotheses requiring evaluations on your reports.', zh: '先使用已解析文字，只有需要影像時才選用支援視覺的路徑。產生附來源頁的候選欄位，再核對結構、數值及語意。此處所有模型與任務配對均屬建議假設，須以你的財報評估。' },
  },
  {
    task: { en: 'Answer an ordinary report question', zh: '回答一般財報問題' },
    route: 'Scoped retrieval → balanced · Sol / evaluated alternative',
    detail: { en: 'Retrieve authorized passages for the selected company and period. Send the question, evidence and calculated facts to the model, request page citations, and check each material claim before returning the answer.', zh: '檢索所選公司及期間內有權存取的段落，把問題、證據及已計算數據送至模型，要求頁面引用，並於回傳前核對重要主張。' },
  },
  {
    task: { en: 'Resolve accounting conflicts and complex comparisons', zh: '處理會計分歧及複雜比較' },
    route: 'Deep · Astra / DeepSeek V4 Pro / Gemini Argon',
    detail: { en: 'Preserve conflicting sources and distinguish reporting periods, restatements and accounting bases. Ask the model to explain supported differences and mark unresolved items for human review. Escalation cannot replace missing evidence.', zh: '保留互相矛盾的來源，區分報告期間、重列及會計基準。要求模型解釋有證據支持的差異，並把未解決項目交人工覆核。升級模型不能取代缺失證據。' },
  },
  {
    task: { en: 'Validate and decide what the user receives', zh: '驗證並決定回傳內容' },
    route: 'Code + source checks + human review when needed',
    detail: { en: 'Check the response schema, arithmetic, units, cited page existence and whether each source supports its claim. A second model can flag problems but cannot prove correctness. Return a checked answer, a bounded retry, an evidence gap or a review request.', zh: '核對回應結構、算術、單位、引用頁是否存在，以及來源能否支持主張。第二個模型可提示問題，但不能證明正確。回傳已核對答案、有限重試、證據缺口或覆核要求。' },
  },
] satisfies { task: Copy; route: string; detail: Copy }[];

export const financeRoutingSteps = [
  {
    keyword: 'CLASSIFY',
    title: { en: 'Turn the prompt into a typed task', zh: '把提示轉成有型別任務' },
    detail: { en: 'Check caller access and reserve any classifier-call budget first. Combine the prompt with the selected function and report IDs. Rules or an approved small classifier produce JSON such as task, tier, needsEvidence and reasonCode. Validate that JSON against an allowed schema; ask for clarification when the task is unclear.', zh: '先核對呼叫者權限及預留分類呼叫預算，再結合提示、所選功能及報告 ID，由規則或已批准的小型分類模型產生 task、tier、needsEvidence、reasonCode 等 JSON。按允許結構驗證 JSON；任務不清楚時要求澄清。' },
  },
  {
    keyword: 'POLICY',
    title: { en: 'Apply the owner’s limits', zh: '套用擁有者設定的限制' },
    detail: { en: 'The backend checks identity, approved providers, account/region eligibility, data permissions, cost caps and timeouts. “Use Astra” is a preference, not permission to spend more or send a report to another provider. Reject unauthorized choices before any model call.', zh: '後端核對身分、批准供應商、帳戶／地區資格、資料權限、費用上限及逾時。「用 Astra」只是偏好，不能授權額外支出或把財報送往另一供應商。模型呼叫前拒絕未獲授權的選擇。' },
  },
  {
    keyword: 'EVIDENCE',
    title: { en: 'Gather the facts the task needs', zh: '收集任務所需數據' },
    detail: { en: 'Retrieve permitted report passages and reviewed facts, then check company, year, version and source coverage. If evidence is missing, retrieve more within limits or return insufficient evidence. A larger model cannot cure a missing source.', zh: '檢索獲准財報段落及已覆核數據，再核對公司、年份、版本及來源涵蓋範圍。缺少證據時，在限制內再檢索或回傳證據不足；更大型模型不能補救缺失來源。' },
  },
  {
    keyword: 'ROUTE',
    title: { en: 'Choose code, an embedding model or a reasoning tier', zh: '選擇程式、嵌入模型或推理級別' },
    detail: { en: 'Use code for CRUD and arithmetic; embeddings for semantic search; economy for tested simple transformations; balanced for ordinary RAG; deep for supported complex analysis. Apply capability checks for images, tools, structured output and full context size. Keep the model ID in server configuration.', zh: 'CRUD 及算術用程式；語意搜尋用嵌入模型；已測試簡單文字轉換用經濟級別；一般 RAG 用平衡級別；有來源的複雜分析用深入級別。核對影像、工具、結構化輸出及完整上下文大小，模型 ID 存於伺服器設定。' },
  },
  {
    keyword: 'EXECUTE',
    title: { en: 'Run the bounded workflow', zh: '執行有限度工作流程' },
    detail: { en: 'LangGraph calls the selected provider adapter with the task, evidence and response schema. Keep API keys on the backend, limit tool actions and attempts, and record the route, model, token use, latency and source IDs. The browser displays saved job progress.', zh: 'LangGraph 把任務、證據及回應結構交給所選供應商介接層。API 密鑰保留於後端，限制工具行動及嘗試次數，記錄路徑、模型、token 用量、延遲及來源 ID。瀏覽器顯示已儲存工作進度。' },
  },
  {
    keyword: 'VALIDATE',
    title: { en: 'Check the answer against code and sources', zh: '以程式及來源核對答案' },
    detail: { en: 'Validate schema, recompute arithmetic and confirm page references, units and periods. Review whether evidence supports each important claim. Separate formatting errors, reasoning errors and missing evidence; use human review for unresolved accounting judgments.', zh: '驗證結構、重新計算算術，確認頁面參照、單位及期間，再覆核證據是否支持每項重要主張。區分格式錯誤、推理錯誤及證據不足；未解決的會計判斷交人工覆核。' },
  },
  {
    keyword: 'RETURN',
    title: { en: 'Return a result or a useful next step', zh: '回傳結果或清楚的下一步' },
    detail: { en: 'Pass: return the answer with citations and model used. A repairable error gets a bounded retry; harder reasoning may escalate only within approved limits. Missing evidence, exhausted retries or provider failure returns a clear status and next action. Never label a failed validation as success.', zh: '通過時回傳答案、引用及所用模型。可修復錯誤作有限重試；較難推理只能在批准限制內升級。證據不足、重試耗盡或供應商失敗時，回傳清楚狀態及下一步；驗證失敗不能標示成功。' },
  },
] satisfies { keyword: string; title: Copy; detail: Copy }[];

export const financeFunctionModelRoles = {
  library: [
    { en: 'No LLM for upload: validate, hash, store and queue in code. Any later extraction or embedding call belongs to the background job.', zh: '上載毋須 LLM：由程式驗證、計算雜湊、儲存及排隊。其後擷取或嵌入呼叫屬背景工作。' },
    { en: 'No LLM for confirmed labels: schema validation and a database transaction save company, period and source. Model suggestions cannot confirm metadata.', zh: '已確認標籤毋須 LLM：以結構驗證及資料庫交易儲存公司、期間及來源。模型建議不能確認中繼資料。' },
    { en: 'Versioning uses code. The new passage index can use text-embedding-3-small when eligible; it creates vectors, not a generated answer. Keep each version separate.', zh: '版本管理用程式；符合使用資格時，新段落索引可用 text-embedding-3-small，產生向量而非答案，各版本須分開。' },
  ],
  extraction: [
    { en: 'Start with PDF parsers and human review; embeddings index the resulting passages. Optional AI extraction can evaluate economy Luna or DeepSeek Flash, but every value remains a source-linked candidate until reviewed.', zh: '先用 PDF 解析器及人工覆核，再以嵌入模型索引段落。選用 AI 擷取時可評估經濟級別 Luna 或 DeepSeek Flash，但每項數值在覆核前仍是附來源候選。' },
    { en: 'No LLM for evidence locations: read stored document, page and region IDs. Validate the exact version and access rights in code.', zh: '證據定位毋須 LLM：讀取已存文件、頁面及區域 ID，由程式驗證確切版本及存取權。' },
    { en: 'A person confirms, corrects or rejects uncertain facts. Sol or Astra may explain an ambiguity in a separate analysis, but neither can submit a trusted human approval.', zh: '不確定數據由人員確認、更正或拒絕。Sol 或 Astra 可在獨立分析中解釋疑點，但不能提交可信人工批准。' },
  ],
  facts: [
    { en: 'No LLM for the five-metric endpoint: query reviewed SQL facts. An optional economy model may suggest label mappings during extraction; source review determines accepted values.', zh: '五項指標端點毋須 LLM：查詢已覆核 SQL 數據。選用經濟模型可在擷取時建議標籤對應，接納數值仍由來源覆核決定。' },
    { en: 'No LLM for units and periods: preserve source metadata and normalize confirmed scales with Decimal. Unknown units block calculation instead of triggering a model guess.', zh: '單位及期間毋須 LLM：保留來源標籤，用 Decimal 統一已確認單位。單位不明須阻止計算，不能觸發模型猜測。' },
    { en: 'Appending a correction is a database transaction. A separate difficult restatement analysis can try deep Astra or DeepSeek V4 Pro; source checks and human review still govern acceptance.', zh: '新增更正是資料庫交易。另行分析複雜重列時可試深入級別 Astra 或 DeepSeek V4 Pro，接納決定仍須來源核對及人工覆核。' },
  ],
  research: [
    { en: 'Embeddings retrieve evidence; balanced Sol drafts the ordinary RAG answer. Evaluate economy Luna for isolated translation and deep Astra for complex conflicts. Check terminology, figures and citations in either language.', zh: '嵌入模型協助檢索證據，平衡級別 Sol 草擬一般 RAG 答案。獨立翻譯可評估經濟 Luna，複雜衝突可評估深入 Astra；兩種語言均須核對用語、數字及引用。' },
    { en: 'Use an eligible embedding model such as text-embedding-3-small with pgvector and keyword search. Retrieval returns source passages; it does not need Luna, Sol or Astra to write an answer.', zh: '用符合使用資格的嵌入模型，例如 text-embedding-3-small，配合 pgvector 及關鍵字搜尋。檢索回傳來源段落，毋須 Luna、Sol 或 Astra 撰寫答案。' },
    { en: 'Code resolves citations and recalculates figures; source review checks claim support. A Sol support-check call can assist, but is not proof. Missing evidence returns a gap, not automatic Astra escalation.', zh: '由程式定位引用及重新計算數字，再對照來源核對主張。Sol 可協助檢查支持度，但不能作證明。證據不足須回傳缺口，不自動升級 Astra。' },
  ],
  comparison: [
    { en: 'No LLM for year-on-year arithmetic: use reviewed inputs and Python Decimal. A separately requested Sol explanation can describe the computed result with its sources.', zh: '按年算術毋須 LLM：使用已覆核輸入及 Python Decimal。另行請求的 Sol 解釋可依來源描述已計算結果。' },
    { en: 'The comparison table uses SQL, compatibility rules and deterministic alignment. Only a separately requested interpretation needs Sol or, for complex accounting conflicts, Astra or DeepSeek V4 Pro.', zh: '比較表使用 SQL、相容規則及確定性對齊。只有另行請求解讀才需 Sol；複雜會計分歧可考慮 Astra 或 DeepSeek V4 Pro。' },
    { en: 'No LLM decides compatibility: explicit code checks period, definition, currency and scale. A stronger model cannot override a failed rule or approve missing metadata.', zh: '相容性不由 LLM 決定：程式明確核對期間、定義、貨幣及單位。更強模型不能推翻不通過規則，也不能批准缺失資料。' },
  ],
  workspace: [
    { en: 'No LLM for chart data: read reviewed SQL facts and render the typed series. Missing values remain visible gaps; a model never fills them with invented numbers.', zh: '圖表數據毋須 LLM：讀取已覆核 SQL 數據，繪製有型別數列。缺失值保留可見缺口，模型不能以編造數字填補。' },
    { en: 'No model call: authorize the evidence ID and open the stored PDF at its recorded page. This is file access, not vector retrieval or RAG.', zh: '毋須模型呼叫：核對證據 ID 權限，按記錄頁碼開啟已存 PDF。這是檔案存取，不是向量檢索或 RAG。' },
    { en: 'Saving edits uses code. Optional AI drafting can try balanced Sol or Claude Sonnet 5.5 on reviewed evidence; validate claims and citations before saving the draft’s model and source versions.', zh: '儲存編輯使用程式。選用 AI 草擬可把已覆核證據交給平衡 Sol 或 Claude Sonnet 5.5；先驗證主張與引用，再儲存草稿的模型及來源版本。' },
  ],
  automation: [
    { en: 'LangGraph is the coordinator, not an LLM. Its router can select Luna, Sol or Astra by task and policy; only remaining model nodes run after resume. Validation uses code, source checks and authorized human review.', zh: 'LangGraph 是協調工具，不是 LLM。路由器可按任務及政策選擇 Luna、Sol 或 Astra；恢復後只執行剩餘模型節點。驗證依靠程式、來源核對及獲授權人工覆核。' },
    { en: 'No LLM for the n8n trigger, deduplication or status polling. The ingestion worker may create embeddings; a chat model runs only for a separately requested analysis.', zh: 'n8n 觸發、去重及狀態輪詢毋須 LLM。匯入 worker 可產生嵌入；聊天模型只用於另行請求的分析。' },
    { en: 'Retry policy is code with saved state and bounded attempts. Repeat a model step only when safe and necessary; log uncertain provider outcomes and never silently change provider or spending limits.', zh: '重試政策由程式、已存狀態及次數上限處理。只在安全且需要時重做模型步驟，記錄不確定供應商結果，不暗中更換供應商或支出限制。' },
  ],
  quality: [
    { en: 'Compare candidate routes such as Luna, Sol, Astra and DeepSeek against human-labelled reports. Measure extraction, retrieval and claim support separately; a model judge cannot establish correctness alone.', zh: '以人工標記財報比較 Luna、Sol、Astra 及 DeepSeek 等候選路徑。分開量度擷取、檢索及主張支持度，不能只靠模型評審判定正確。' },
    { en: 'No LLM for reading traces or calculating recorded usage cost. Store the exact model, prompt version, tokens, latency and dated rates; unknown usage stays unknown.', zh: '讀取追蹤或計算已記錄用量成本毋須 LLM。儲存確切模型、提示版本、token、延遲及有日期費率，未知用量保留未知。' },
    { en: 'Deployment and health checks use code. Keep model IDs and keys in server configuration; run paid live evaluations only when explicitly configured, with account/region checks and budget limits.', zh: '部署及健康檢查使用程式。模型 ID 及密鑰保留於伺服器設定；只有明確設定時才執行付費即時評估，並核對帳戶／地區資格及預算限制。' },
  ],
} satisfies Record<keyof typeof financeFunctionWorkflows, [Copy, Copy, Copy]>;
