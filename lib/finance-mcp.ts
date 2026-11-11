import type { Copy } from './curriculum';

const copy = (en: string, zh: string): Copy => ({ en, zh });

export const mcpIntroduction = copy(
  'MCP means Model Context Protocol: a shared message format that lets an AI application discover and use another program’s capabilities. Think of a common plug: the app asks for a named operation, and the connected program does the work.',
  'MCP 即 Model Context Protocol（模型上下文協定）：讓 AI 應用程式用統一格式，查詢及使用另一個程式的功能。可以想像成通用插頭：app 提出指定要求，接駁的程式負責執行。',
);

export const mcpMindmap = [
  { id: 'purpose', count: 'WHY', title: copy('Why connect?', '點解要連接？'), summary: copy('Give the app access to useful work.', '讓 app 使用外部功能。'), leaves: ['News', 'Files', 'Databases'],
    detail: copy('For this project, the research app asks n8n to refresh approved news. A common interface helps when several AI applications need the same tool. A direct API is also a valid choice for one fixed integration; MCP adds discovery and a reusable contract.', '此項目由研究 app 要求 n8n 刷新核准新聞。多個 AI app 要用同一工具時，統一介面方便重用。單一固定整合亦可直接用 API；MCP 增加功能發現及可重用合約。') },
  { id: 'roles', count: '3', title: copy('Roles: who talks?', '角色：邊個同邊個講？'), summary: copy('Host → client → server', '主程式 → 客戶端 → 伺服器'), leaves: ['Host', 'Client', 'Server'],
    detail: copy('Host = the research application. Client = its MCP connector, inside the host. Server = the n8n endpoint exposing the news tool. These are roles, not three separate machines. The host can connect to several servers. An LLM can suggest a tool; host code decides whether it may run.', 'Host 是研究應用程式；client 是 app 內的 MCP 連接器；server 是提供新聞工具的 n8n 端點。這是三個角色，毋須三部電腦。Host 可連接多個 server。LLM 可建議工具，由 host 程式決定是否執行。') },
  { id: 'capabilities', count: '3', title: copy('Capabilities: what is offered?', '功能：提供啲咩？'), summary: copy('Tools · resources · prompts', '工具 · 資源 · 提示範本'), leaves: ['Tools → do', 'Resources → read', 'Prompts → reuse'],
    detail: copy('Tool: run refresh_company_news. Resource: read a saved article by URI. Prompt: load a reusable research template. A server can offer a subset. This project’s proposed n8n endpoint exposes tools; the resource and prompt examples below illustrate other possible servers. Your typed question is not automatically an MCP prompt template.', 'Tool 執行 refresh_company_news；resource 按 URI 讀取已儲存文章；prompt 載入研究提示範本。Server 可以只提供部分功能。本項目的 n8n 端點計劃提供 tools；下方 resource 及 prompt 示範其他 server 的可能功能。你輸入的問題不會自動變成 MCP prompt 範本。') },
  { id: 'transports', count: '2', title: copy('Transports: how do messages travel?', '傳輸：訊息點樣傳？'), summary: copy('stdio · Streamable HTTP', 'stdio · Streamable HTTP'), leaves: ['stdio → local process', 'HTTP → endpoint'],
    detail: copy('stdio carries messages through a local process’s input/output. Streamable HTTP connects to an HTTP endpoint, local or remote; this is the proposed n8n route. Older HTTP+SSE transport is legacy. SSE streaming can also be used inside Streamable HTTP. Local/remote describes location, not another capability type; custom transports can exist.', 'stdio 用本機程序的輸入／輸出傳訊；Streamable HTTP 連接本機或遠端 HTTP 端點，本項目計劃用它連 n8n。舊 HTTP+SSE 傳輸屬舊版；Streamable HTTP 本身亦可用 SSE 串流。本機／遠端是位置分類，並非額外功能種類；亦可有自訂傳輸。') },
] satisfies Array<{ id: string; count: string; title: Copy; summary: Copy; leaves: string[]; detail: Copy }>;

export const mcpExamples = [
  { id: 'tool', title: copy('Tool: refresh the news', 'Tool：刷新新聞'), method: 'tools/call',
    purpose: copy('Run work with validated arguments. This tool may fetch approved provider APIs and commit an evidence snapshot in PostgreSQL. Its name is our proposed contract, not a built-in MCP command.', '用已驗證參數執行工作。此工具可讀取核准供應商 API 並在 PostgreSQL 提交證據快照。這是我們建議的工具名稱，並非 MCP 內建指令。'),
    request: { method: 'tools/call', params: { name: 'refresh_company_news', arguments: { company: 'MSFT', query: 'cloud margins', as_of: '2026-10-30T16:00:00Z', run_id: 'fictional-run-001', deadline: '2026-10-30T16:01:00Z' } } },
    result: { run_id: 'fictional-run-001', company_news_version_ids: ['fictional-msft-news-v1'], provider_status: 'ok', articles_added: 3, fetched_at: '2026-10-30T16:00:00Z', attempt_count: 1 },
    note: copy('Fictional tool-result data. The client validates it before the graph retrieves evidence; the refresh result is not yet a financial answer.', '虛構工具回傳資料。Client 先驗證，graph 再檢索證據；刷新結果仍未是金融答案。') },
  { id: 'resource', title: copy('Resource: read an article', 'Resource：讀取文章'), method: 'resources/read',
    purpose: copy('Read content identified by a URI from a resource-capable server. The host chooses what to include in context. Article text has no authority to change application rules.', '從支援 resources 的 server 按 URI 讀取內容。Host 決定放哪些內容入上下文；文章文字不能改寫應用程式規則。'),
    request: { method: 'resources/read', params: { uri: 'news://fictional-msft-001/article-01' } },
    result: { uri: 'news://fictional-msft-001/article-01', text: 'Fictional excerpt: infrastructure costs may pressure cloud margins.' },
    note: copy('Illustrative resource URI, not a live link. The current finance design uses a read_source tool; resources are an alternative interface.', '示範 resource URI，並非真實連結。目前金融設計用 read_source 工具；resource 是另一種介面選擇。') },
  { id: 'prompt', title: copy('Prompt: reuse a template', 'Prompt：重用範本'), method: 'prompts/get',
    purpose: copy('Load a named template selected by the user. Retrieving the template does not call the LLM or generate an answer.', '載入使用者選擇的具名範本。取回範本本身不會呼叫 LLM 或生成答案。'),
    request: { method: 'prompts/get', params: { name: 'company_research', arguments: { company: 'MSFT' } } },
    result: { messages: [{ role: 'user', content: { type: 'text', text: 'Research MSFT. Separate cited facts, assumptions and conditional scenarios.' } }] },
    note: copy('Illustrative prompt-capable server. This n8n design only needs the news tool; it does not assume prompts/get is available.', '示範支援 prompts 的 server。此 n8n 設計只需新聞工具，沒有假設端點支援 prompts/get。') },
];

export const mcpToolDefinition = {
  name: 'refresh_company_news',
  description: 'Refresh approved news for one supported company and return snapshot metadata.',
  inputSchema: {
    type: 'object', additionalProperties: false,
    properties: { company: { type: 'string', enum: ['MSFT', 'AAPL', 'NVDA'] }, query: { type: 'string', minLength: 1, maxLength: 500 }, as_of: { type: 'string', format: 'date-time' }, run_id: { type: 'string', minLength: 1 }, deadline: { type: 'string', format: 'date-time' } },
    required: ['company', 'query', 'as_of', 'run_id', 'deadline'],
  },
};

export const mcpSetup = [
  copy('Build the news sub-workflow: validate company/query/cutoff → call approved news APIs → normalize dates and deduplicate → commit articles/chunks and a snapshot in PostgreSQL → return snapshot metadata. Use a restricted ingestion role; keep provider and database credentials in n8n credentials.', '建立新聞子流程：驗證公司／問題／截止時間 → 呼叫核准新聞 API → 整理日期及去重 → PostgreSQL 提交文章／切段及快照 → 回傳快照資料。用受限匯入角色，供應商及資料庫憑證放 n8n credentials。'),
  copy('Add an MCP Server Trigger. Attach a Custom n8n Workflow Tool that exposes this sub-workflow as refresh_company_news. Ordinary workflow nodes belong inside the sub-workflow; the trigger connects to tool nodes.', '加入 MCP Server Trigger，接 Custom n8n Workflow Tool，把子流程公開為 refresh_company_news。一般工作流程節點放在子流程內；trigger 連接的是 tool 節點。'),
  copy('Configure authentication and copy the displayed test endpoint. Test while n8n is listening; publish the workflow before using its production endpoint. Use a compatible Streamable HTTP client.', '設定認證及複製畫面上的測試端點；n8n 監聽時測試。發布流程後才使用正式端點，並選相容的 Streamable HTTP client。'),
  copy('In the Python host, configure the endpoint and credentials server-side. Check the SDK/server protocol versions, discover capabilities, list tools and verify the tool schema. The browser never receives these credentials.', '在 Python host 伺服器端設定端點及憑證，確認 SDK／server 協定版本相容，發現功能、列出工具及核對 schema。憑證不傳到瀏覽器。'),
  copy('The LangGraph scope gate accepts a supported question, then its refresh node calls the tool once. Validate the result and pin its snapshot. Retrieve and rerank only eligible evidence, check sufficiency, then build LLM context and validate the answer.', 'LangGraph 範圍檢查接納支援問題後，refresh 節點呼叫工具一次。驗證回傳及固定快照，再檢索和重排合資格證據、檢查是否足夠，最後建立 LLM 上下文及驗證答案。'),
  copy('Record sanitized spans for refresh, retrieval, reranking and generation. Send OpenTelemetry to the configured Langfuse/LangSmith setup. Test empty results, irrelevant requests and outages; attach a real trace only after a real run.', '為刷新、檢索、重排及生成記錄已去敏感資料的 spans，把 OpenTelemetry 送到已設定的 Langfuse／LangSmith。測試空結果、不相關問題及服務故障；真實執行後才附真實 trace。'),
];

export const mcpOwnership = [
  { name: 'LangGraph', job: copy('Chooses the next step and enforces budgets.', '決定下一步，執行用量及次數上限。') },
  { name: 'MCP', job: copy('Carries tool discovery, calls and results.', '傳送功能發現、工具呼叫及結果。') },
  { name: 'n8n', job: copy('Runs the news-fetching workflow.', '執行抓取新聞的工作流程。') },
  { name: 'PostgreSQL + pgvector', job: copy('Finds candidate evidence by meaning / words.', '按語意／字詞搜尋候選證據。') },
  { name: 'Reranker', job: copy('Reorders candidates for this question.', '按這條問題重排候選證據。') },
  { name: 'LLM + validator', job: copy('Writes from selected evidence; checks support.', '按選定證據撰寫，再核對支持度。') },
];

type Hop = 'app' | 'mcp' | 'provider' | 'retrieval' | 'model';
type Step = { title: Copy; from: Copy; to: Copy; channel: Hop; message: string; explanation: Copy };
const step = (title: Copy, from: Copy, to: Copy, channel: Hop, message: string, explanation: Copy): Step => ({ title, from, to, channel, message, explanation });
const graph = copy('Research app · LangGraph', '研究 app · LangGraph');
const client = copy('MCP client inside the app', 'App 內的 MCP client');
const n8n = copy('n8n · MCP server', 'n8n · MCP server');
const user = copy('You', '你');
const index = copy('PostgreSQL evidence index', 'PostgreSQL 證據索引');
const gate = copy('Evidence check', '證據檢查');

export const mcpStorySteps = {
  scope: step(copy('Check the question', '先睇問題'), user, graph, 'app', 'MSFT · cloud margins · next quarter', copy('Code checks company, topic and horizon before any external call. A valid question can continue.', '程式先檢查公司、題目及期間，合適才可進行外部呼叫。')),
  discover: step(copy('Read the tool menu', '睇工具餐牌'), client, n8n, 'mcp', 'tools/list → refresh_company_news + inputSchema', copy('After compatible setup, the client learns the tool name and accepted arguments. Discovery can be cached; it need not repeat for each prompt.', '完成相容設定後，client 讀取工具名稱及參數格式。工具發現可快取，毋須每題重做。')),
  call: step(copy('Ask n8n to refresh', '叫 n8n 刷新'), client, n8n, 'mcp', 'tools/call → refresh_company_news({ company: "MSFT", query: "cloud margins", as_of: "…", run_id: "same-run", deadline: "…" })', copy('The graph sends one logical refresh with a stable run_id. n8n owns provider retries and timeouts. If the host loses the response, reconcile the existing execution before resubmitting.', 'Graph 以固定 run_id 發出一次邏輯刷新；n8n 控制供應商重試及超時。Host 遺失回應時，重新發送前先核對原執行。')),
  fetch: step(copy('Fetch and store news', '抓新聞及儲存'), n8n, copy('News API → PostgreSQL', '新聞 API → PostgreSQL'), 'provider', 'approved API → bounded provider retries → normalize → commit evidence versions', copy('n8n owns provider timeouts and transient retries, records publication/first-seen times and commits evidence to PostgreSQL before returning the receipt.', 'n8n 控制供應商超時及暫時錯誤重試，記錄發布／首次取得時間並提交證據至 PostgreSQL 後回傳紀錄。')),
  result: step(copy('Return receipt and pin evidence', '回傳紀錄及固定證據'), n8n, client, 'mcp', '{ run_id: "fictional-run-001", company_news_version_ids: ["news-v1"], provider_status: "ok" }', copy('The receipt travels back over MCP. The host validates it, then pins company-news versions together with eligible completed daily macro/geopolitical batches and a dated company-profile version. This manifest receives snapshot_id.', '紀錄經 MCP 回傳。Host 驗證後，將公司新聞版本與合資格完整每日宏觀／地緣批次及有日期背景版本固定成清單，編配 snapshot_id。')),
  retrieve: step(copy('Find candidate excerpts', '搵候選段落'), graph, index, 'retrieval', 'question + company + snapshot + date filters → candidate excerpts', copy('Assume articles are indexed. PostgreSQL full-text search matches words; pgvector searches embeddings in the same database. The vector/hybrid candidate stays experimental until it passes the written evaluation margin.', '假設文章已有索引：PostgreSQL 全文搜尋比對字詞，pgvector 在同一資料庫搜尋向量。向量／混合候選方案須通過指定評估差距才可採用。')),
  rerank: step(copy('Put useful evidence first', '把有用證據排前'), index, copy('Reranker → evidence check', '重排器 → 證據檢查'), 'retrieval', 'candidate list → question-specific order → selected source IDs', copy('Reranking changes the order; it does not create missing facts. Check freshness, company and question coverage. Scores are relevance signals, not forecast confidence.', '重排改變次序，不會創造缺失事實。核對新鮮度、公司及問題覆蓋；分數代表相關性，並非預測信心。')),
  context: step(copy('Pack the LLM input', '準備 LLM 輸入'), gate, copy('Context builder', '上下文組裝'), 'app', 'policy + original question + dated excerpts + source IDs', copy('Keep retrieved text separate from instructions. Include only eligible excerpts within the token budget; reject embedded commands. A database is not passed wholesale to the model.', '檢索文字與指令分開。只加入 token 上限內合資格段落，排除內嵌指令；不會把整個資料庫塞入模型。')),
  generate: step(copy('Write a grounded draft', '按證據寫草稿'), copy('Context builder', '上下文組裝'), copy('LLM', 'LLM'), 'model', 'selected evidence → cited facts + conditional scenarios', copy('The LLM API produces a draft addressing the question. This call is separate from MCP. A price guarantee or unsupported probability cannot be inferred from retrieval scores.', 'LLM API 按問題產生草稿，這次呼叫與 MCP 分開。檢索分數不能推出價格保證或無支持的機率。')),
  answer: step(copy('Validate and return', '驗證再回覆'), copy('Citation validator', '引用驗證'), user, 'app', 'supported claims → report; invalid claims → withhold', copy('Check source IDs and material claims before showing the report. A live run should include its trace URL. This animation uses fictional data and makes zero external calls.', '顯示報告前核對來源 ID 及重要主張。真實執行應附 trace URL；此動畫使用虛構資料，外部呼叫次數是零。')),
  refine: step(copy('Evidence is too thin: try once more', '證據太少：再試一次'), gate, graph, 'app', 'coverage missing → refine query once, same snapshot', copy('Keep the original question and snapshot. One narrower retrieval attempt is allowed; do not refresh news again or reset the search budget.', '保留原問題及快照，只容許一次較精準檢索；不重新刷新新聞或重設搜尋上限。')),
  insufficient: step(copy('Say what is missing', '講清楚欠缺咩'), gate, user, 'app', 'insufficient_evidence · missing: dated evidence about margins', copy('After two searches, stop without an LLM forecast. Explain the missing evidence and suggest a narrower question or a better source.', '兩次搜尋後停止，不生成 LLM 預測。說明欠缺證據，建議收窄問題或補充來源。')),
  irrelevant: step(copy('Return to the supported scope', '帶返支援範圍'), graph, user, 'app', 'out_of_scope · try a question about MSFT, AAPL or NVDA', copy('For “Write a birthday poem”, the scope gate returns immediately. No MCP news call, retrieval or financial generation is needed.', '遇到「寫一首生日詩」，範圍檢查即時回覆，毋須 MCP 新聞呼叫、檢索或金融生成。')),
  unavailable: step(copy('Report a service failure', '交代服務故障'), graph, user, 'app', 'service_unavailable · news refresh timed out', copy('A failed tool is different from an empty evidence set. Show the failed dependency and allow a later retry; do not claim news is fresh or invent a report.', '工具失敗與沒有證據不同。顯示失敗服務，容許稍後重試；不能聲稱新聞已刷新或編造報告。')),
} satisfies Record<string, Step>;

export const mcpScenarios = [
  { id: 'supported', title: copy('Enough evidence', '證據足夠'), prompt: copy('How might cloud costs affect MSFT margins next quarter?', '雲端成本可能點影響 MSFT 下季利潤率？'), path: ['scope', 'discover', 'call', 'fetch', 'result', 'retrieve', 'rerank', 'context', 'generate', 'answer'] },
  { id: 'insufficient', title: copy('Insufficient evidence', '證據不足'), prompt: copy('What do the available sources say about MSFT margins next quarter?', '現有來源點講 MSFT 下季利潤率？'), path: ['scope', 'discover', 'call', 'fetch', 'result', 'retrieve', 'rerank', 'refine', 'retrieve', 'rerank', 'insufficient'] },
  { id: 'irrelevant', title: copy('Irrelevant prompt', '問題不相關'), prompt: copy('Write a birthday poem.', '寫一首生日詩。'), path: ['scope', 'irrelevant'] },
  { id: 'outage', title: copy('n8n unavailable', 'n8n 無法使用'), prompt: copy('Research the risks to MSFT cloud margins.', '研究 MSFT 雲端利潤率風險。'), path: ['scope', 'discover', 'call', 'unavailable'] },
] satisfies Array<{ id: string; title: Copy; prompt: Copy; path: Array<keyof typeof mcpStorySteps> }>;

export const mcpReferences = [
  { title: 'MCP architecture & roles', url: 'https://modelcontextprotocol.io/docs/learn/architecture' },
  { title: 'Tools, resources & prompts', url: 'https://modelcontextprotocol.io/docs/learn/server-concepts' },
  { title: 'Standard transports', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic/transports' },
  { title: 'Protocol versions & compatibility', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning' },
  { title: 'n8n MCP Server Trigger', url: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/' },
  { title: 'n8n MCP Client Tool', url: 'https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolmcp/' },
];

export const mcpVersionNote = copy('Checked 8 November 2026. The 2026-07-28 MCP specification uses per-request version metadata and server/discover. Older 2025-11-25 integrations use initialize → notifications/initialized. Use the setup supported by your actual SDK and n8n version. Examples here show method/argument fragments and domain data, not complete wire messages or a tested n8n export.', '2026 年 11 月 8 日核對：2026-07-28 規格使用每次請求的版本 metadata 及 server/discover；舊 2025-11-25 整合用 initialize → notifications/initialized。請依實際 SDK 及 n8n 版本設定。此處只示範方法／參數片段及業務資料，並非完整線上訊息或經測試的 n8n 匯出檔。');

export const mcpMindmapMermaid = `mindmap
  root((MCP))
    Purpose
      Discover capabilities
      Reuse a tool contract
    Roles
      Host - research app
      Client - inside host
      Server - n8n endpoint
    Server capabilities
      Tools - execute
      Resources - read
      Prompts - templates
    Standard transports
      stdio - local process
      Streamable HTTP - local or remote endpoint`;

export const mcpWorkflowMermaid = `flowchart TD
  Q[User question] --> S{Scope check}
  S -->|Irrelevant| O[Explain supported scope]
  S -->|Supported| C[Host MCP client]
  C -->|MCP tools/call| N[n8n MCP Server Trigger + Workflow Tool]
  N -->|Provider API| A[Fetch news and commit PostgreSQL snapshot]
  A --> N
  N -->|MCP tool result| P[Validate and pin snapshot]
  C -->|Failure| U[Service unavailable]
  P --> R[PostgreSQL full-text or admitted pgvector hybrid]
  R -->|Admitted hybrid| K[Rerank eligible excerpts]
  R -->|Full-text default| E{Enough evidence?}
  R -->|PostgreSQL unavailable| U
  K --> E
  E -->|No, first search| F[Refine once]
  F --> R
  E -->|No, second search| I[Insufficient evidence]
  E -->|Yes| X[Question + policy + cited context]
  X --> L[LLM API]
  L --> V{Citation validation}
  V -->|Pass| B[Cited report]
  V -->|Fail| W[Withhold draft]`;
