import type { Copy } from './curriculum';
import type { FinanceDiagram } from './finance-diagrams';

const t = (en: string, zh: string): Copy => ({ en, zh });
export const financePrivacyPolicy = 'finance-pii-v1';
export const financePrivacyGuide = [
  { title: t('Before scope and before graph state', '範圍檢查及 graph state 之前'), body: t('At API entry, validate size/schema, redact emails and credit-card numbers, then create the sanitized request. Disable request-body capture in proxy/APM instrumentation. Only that request may enter scope, n8n arguments, graph state, checkpoints or prompt traces. Sanitize review comments and other follow-up text through the same entry boundary. Keep the original research intent, but store original_question as the sanitized wording. Do not save the raw prompt for later cleaning.', 'API 入口先核對大小／格式，遮蔽電郵及信用卡號，再建立清理後請求。關閉 proxy／APM 的 request body 擷取；只有清理後請求可進範圍檢查、n8n 參數、graph state、checkpoint 或提示 trace。覆核留言及其他後續文字同樣經入口。保留研究意圖，但 original_question 存清理後版本，不能先存原提示再清理。') },
  { title: t('News ingestion before searchable storage', '可搜尋儲存之前清理新聞'), body: t('Both company refresh and the daily macro/geopolitical job create sanitized excerpt versions before committing research evidence, chunking or embedding. Keep source IDs, attribution, publication/first-seen times and policy version. Permission to use text is still required. Repeated ingestion remains idempotent; source identity and story deduplication must not depend only on the redacted text. Existing unsafe chunks must be withdrawn and reprocessed before retrieval, including replacement vectors.', '公司刷新及每日宏觀／地緣工作都在提交研究證據、切段或 embedding 前建立清理節錄版本。保留來源 ID、出處、發布／首次取得時間及政策版本；仍須文字使用權。重複匯入保持冪等，來源身份／新聞去重不能只靠遮蔽後文字。已有不安全段落須撤出檢索，重新處理並替換向量後才可用。') },
  { title: t('Before reranking and every model/tool boundary', '重排及每次模型／工具邊界之前'), body: t('Recheck the query and retrieved excerpts before external rerankers, embedding providers and the report model. Direct scope/refinement LLM calls need the same wrappers. Validate and sanitize tool arguments before dispatch and tool results before returning a node update. If removal changes required support, return insufficient evidence instead of making a stronger claim. Raw context or draft must not enter a checkpoint between separate cleaning nodes.', '外部重排器、embedding 供應商及報告模型前，再查問題及檢索節錄。直接 scope／補查 LLM 呼叫也用相同 wrapper。工具參數在發出前核對清理，工具結果在回傳節點更新前處理。移除內容導致缺少支持則回證據不足，不能加強結論；不能在獨立清理節點之間把原 context／草稿存入 checkpoint。') },
  { title: t('Output filtering before state, streaming and release', 'State、串流及發布前清理輸出'), body: t('The generate wrapper buffers the response, sanitizes it and only then returns safe state. The initial design disables raw token streaming. Validate claims against the sanitized evidence, then perform a final privacy check before report storage/export. A detector failure stops the affected path with privacy_blocked; return a generic error and safe counts, never the offending value or raw exception. No automatic privacy retry or unsanitized fallback.', 'Generate wrapper 先緩衝回應，清理後才回傳安全 state；初版停用原始 token 串流。按清理證據核對主張，報告儲存／下載前再作最終隱私檢查。偵測器失敗以 privacy_blocked 停止該路徑，只回一般錯誤及安全計數，不帶觸發值或原 exception；不自動隱私重試，亦不回退原文。') },
  { title: t('Traces and n8n execution history', 'Traces 及 n8n 執行歷史'), body: t('Disable raw model/tool payload capture before callbacks export it. Record run IDs, policy version, match counts/types, status, tokens and timings. Apply an attribute allowlist and a redacting OTel Collector before Langfuse/LangSmith fan-out. A Collector cannot undo an earlier raw export. Configure n8n execution-data retention and error logs so raw provider payloads are not retained. AsyncPostgresSaver stores supplied state; it does not detect PII.', 'Callbacks 匯出前關閉原始模型／工具 payload 擷取。只記任務 ID、政策版本、匹配類型／計數、狀態、token 及時間；用 attribute allowlist，再經遮蔽 OTel Collector 分送 Langfuse／LangSmith。Collector 無法撤回先前原文匯出。設定 n8n 執行資料保留及錯誤 log，避免保留原供應商 payload。AsyncPostgresSaver 只存傳入 state，不偵測 PII。') },
  { title: t('Redaction policy and its limits', '遮蔽政策及限制'), body: t('Use redact for email and credit_card across model input, output and tool results. Mask would retain card digits that this app does not need. Preserve tickers, prices, percentages, dates and citation URLs; do not enable blanket URL redaction. Validate citation URLs separately and reject credentials/private query parameters instead of changing the evidence link. Built-ins do not cover every secret, phone, identity number or obfuscation. Add tested detectors for those needs. PII filtering does not stop prompt injection or replace permissions, scope and citation checks.', '模型輸入、輸出及工具結果的 email／credit_card 均用 redact。Mask 保留部分卡號，本 app 不需要。保留 ticker、價格、百分比、日期及引用 URL，不全面遮蔽 URL；引用網址另作驗證，含憑證／私人參數則拒絕，不能改造證據連結。內建偵測不涵蓋全部 secret、電話、身份號碼或變形寫法，按需要增加經測試偵測器。PII 清理不能阻止提示注入，也不取代權限、scope 及引用檢查。') },
];

export const financePrivacyMiddlewareExample = `# Proposed LangChain configuration, not an installed finance backend.
from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware

def build_research_agent(model, tools):
    return create_agent(
        model=model,
        tools=tools,
        middleware=[
            PIIMiddleware("email", strategy="redact", apply_to_input=True,
                          apply_to_output=True, apply_to_tool_results=True),
            PIIMiddleware("credit_card", strategy="redact", apply_to_input=True,
                          apply_to_output=True, apply_to_tool_results=True),
        ],
    )

# This optional list belongs to create_agent, not StateGraph(...).
# The finance scope/refine/report path uses OpenRouterGateway + a host sanitizer.
# If adopting create_agent later, pass a configured ChatOpenRouter with max_retries=0,
# and reserve EACH attempted model call durably. Never add an unbudgeted agent loop.
# The host must sanitize BEFORE invoking a graph with a checkpointer.
# Direct LLM calls in scope/refine/generate need explicit boundary wrappers.
# Filter tool arguments BEFORE dispatch, not just tool results afterwards.
# Model/tool callbacks and n8n logs need their own payload-capture policy.
# Start with buffered output: do not forward raw provider token chunks.
# Pin/test the installed LangChain version and its stream behavior.
# Syntax checked; live PIIMiddleware/model/checkpoint integration: NOT RUN.
`;

export const financePrivacyFixtures = [
  { id: 'email', title: t('Email in a prompt', '提示含電郵'), text: 'Research MSFT costs. Contact analyst@example.com.' },
  { id: 'card', title: t('Synthetic card in tool text', '工具文字含測試卡號'), text: 'Fictional provider text: test card 4242 4242 4242 4242. MSFT costs rose 2.5%.' },
  { id: 'finance', title: t('Keep useful financial facts', '保留有用金融事實'), text: 'MSFT price $420.50; margin 35%; as of 2026-11-16. Source: https://example.com/msft-report' },
  { id: 'failure', title: t('Detector unavailable', '偵測器不可用'), text: 'Synthetic request withheld because the detector failed.' },
];

export type PrivacyDemoResult = { kind: 'sanitized'; text: string; counts: { email: number; credit_card: number }; policy: string } | { kind: 'blocked'; reason: 'privacy_blocked' };
export function sanitizePrivacyDemo(text: string, detectorAvailable = true): PrivacyDemoResult {
  if (!detectorAvailable) return { kind: 'blocked', reason: 'privacy_blocked' };
  const counts = { email: 0, credit_card: 0 };
  const emailClean = text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, () => { counts.email++; return '[REDACTED_EMAIL]'; });
  const clean = emailClean.replace(/\b(?:\d[ -]?){12,18}\d\b/g, candidate => {
    const digits = candidate.replace(/\D/g, '');
    let total = 0;
    for (let i = digits.length - 1; i >= 0; i--) {
      let value = Number(digits[i]);
      if ((digits.length - 1 - i) % 2 === 1) { value *= 2; if (value > 9) value -= 9; }
      total += value;
    }
    if (total % 10 !== 0) return candidate;
    counts.credit_card++;
    return '[REDACTED_CREDIT_CARD]';
  });
  return { kind: 'sanitized', text: clean, counts, policy: financePrivacyPolicy };
}

const node = (id: string, label: string, en: string, zh: string) => ({ id, label, detail: t(en, zh) });
const edge = (from: string, to: string, en: string, zh: string, kind: FinanceDiagram['edges'][number]['kind'] = 'flow') => ({ from, to, label: t(en, zh), detail: t(en, zh), kind });
export const financePrivacyDiagram: FinanceDiagram = {
  id: 'privacy', title: t('PII protection at every data boundary', '每個資料邊界的 PII 保護'),
  nodes: [
    node('policy', 'EMAIL + CARD → REDACT', 'One versioned policy across entry, ingestion, models, persistence and telemetry. These branches show responsibilities, not parallel execution.', '同一版本政策涵蓋入口、匯入、模型、持久儲存及追蹤；分支表示責任，不代表並行執行。'),
    node('entry', 'API PRIVACY BEFORE GRAPH', 'Sanitize prompt and review text before any graph invocation, raw body logging, n8n arguments or checkpoint. Detector failure rejects the request.', '任何 graph 執行、body log、n8n 參數或 checkpoint 前清理提示及覆核文字，偵測失敗拒絕請求。'),
    node('scope', 'SANITIZED REQUEST → SCOPE', 'Custom scope calls use explicit wrappers. Sanitized original_question preserves research intent. No news refresh before scope accepts.', '自訂 scope 呼叫用明確 wrapper；original_question 存清理後研究意圖，scope 通過前不刷新新聞。'),
    node('ingest', 'n8n NEWS → SANITIZED EXCERPTS', 'Company/daily news is untrusted. Redact before committing the searchable excerpt. Disable raw n8n execution payload retention.', '公司／每日新聞均不可信，可搜尋節錄提交前清理，停用 n8n 原 payload 保留。'),
    node('store', 'POSTGRESQL + CHUNKS + VECTORS', 'Commit sanitized versions with provenance, policy and model keys. Idempotent dedup keeps stable source identity; unsafe historical vectors are withdrawn.', '提交清理版本、來源、政策及模型鍵；冪等去重保留穩定來源身份，舊不安全向量撤出。'),
    node('calls', 'RERANK / LLM / TOOL WRAPPERS', 'Sanitize input and tool arguments before dispatch. Sanitize results before returning a node state update. Buffer model output; disable raw streaming/callback capture.', '發出前清理輸入及工具參數；回傳節點 state 更新前清理結果。模型輸出先緩衝，停用原串流／callback 擷取。'),
    node('coverage', 'RECHECK SUPPORT + CITATIONS', 'Redaction cannot manufacture evidence. Lost support returns insufficient; privacy filtering cannot authorize tools or remove injection checks.', '清理不能製造證據，支持流失回證據不足；PII 清理不授權工具，也不能移除注入檢查。'),
    node('insufficient', 'INSUFFICIENT EVIDENCE → END', 'Redaction removed required support. Withhold the affected conclusion and explain the missing facet without exposing removed values.', '清理移除了必要支持，不發布受影響結論，說明缺少面向而不暴露已移除值。'),
    node('release', 'FINAL PRIVACY CHECK → SAVE', 'Check the sanitized draft before report persistence/export. Graph checkpoints contain safe state only, including the scope and generate updates.', '報告持久儲存／下載前檢查清理草稿；包含 scope／generate 更新的 checkpoint 只存安全 state。'),
    node('telemetry', 'SAFE ATTRIBUTES → COLLECTOR', 'Allowlist IDs, policy, counts, status, tokens and timing before export. No raw prompts, payloads or exception strings.', '匯出前只允許 ID、政策、計數、狀態、token 及時間，不帶原提示、payload 或 exception 字串。'),
    node('traces', 'LANGFUSE + LANGSMITH', 'Only sanitized operational spans reach both destinations; sharing requires the sanitized trace view.', '兩邊只收到清理運行 spans，分享須用清理 trace 視圖。'),
    node('stop', 'PRIVACY BLOCKED / WITHHOLD', 'Detector failure stops the affected path. No raw fallback, automatic privacy retry, raw checkpoint or sensitive error log.', '偵測失敗停止該路徑，不回退原文、自動重試、存原 checkpoint 或敏感 error log。'),
  ],
  edges: [edge('policy', 'entry', 'User/review entry', '用戶／覆核入口'), edge('entry', 'scope', 'Sanitized before persistence', '持久儲存前已清理'), edge('entry', 'stop', 'Detector failure', '偵測失敗', 'stop'), edge('policy', 'ingest', 'Independent news ingestion', '獨立新聞匯入'), edge('ingest', 'store', 'Sanitize before indexing', '索引前清理'), edge('ingest', 'stop', 'No safe excerpt', '無安全節錄', 'stop'), edge('policy', 'calls', 'Every external boundary', '每個外部邊界'), edge('calls', 'coverage', 'Sanitized state only', '只回安全 state'), edge('calls', 'stop', 'Cannot sanitize result', '結果無法清理', 'stop'), edge('coverage', 'release', 'Support remains', '仍有支持'), edge('coverage', 'insufficient', 'Required support lost', '必要支持流失', 'stop'), edge('release', 'stop', 'Final check fails', '最終檢查失敗', 'stop'), edge('policy', 'telemetry', 'Before callback/export', 'Callback／匯出之前'), edge('telemetry', 'traces', 'Redacted allowlisted spans', '清理且核准 spans')],
};

export const financePrivacyReferences = [
  { title: 'LangChain PIIMiddleware API', url: 'https://reference.langchain.com/python/langchain/agents/middleware/pii/PIIMiddleware' },
  { title: 'LangChain built-in middleware and PII detection', url: 'https://docs.langchain.com/oss/python/langchain/middleware/built-in#pii-detection' },
];
