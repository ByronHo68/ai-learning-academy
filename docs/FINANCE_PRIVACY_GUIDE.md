# PII protection in the research workflow / 研究流程的 PII 保護

Open `/finance-project/workflows#finance-privacy` for the bilingual workflow and fixed synthetic examples. This is proposed backend wiring. The browser uses a limited regex/Luhn demonstration, not LangChain. Live privacy/model/checkpoint integration is NOT RUN.

開啟 `/finance-project/workflows#finance-privacy` 看雙語流程及固定合成例子。此為建議後端接線，瀏覽器只示範有限 regex／Luhn，不是 LangChain；真實隱私／模型／checkpoint 整合為 NOT RUN。

## Before scope and before graph state / 範圍檢查及 graph state 之前

At API entry, validate size/schema, redact emails and credit-card numbers, then create the sanitized request. Disable request-body capture in proxy/APM instrumentation. Only that request may enter scope, n8n arguments, graph state, checkpoints or prompt traces. Sanitize review comments and other follow-up text through the same entry boundary. Keep the original research intent, but store original_question as the sanitized wording. Do not save the raw prompt for later cleaning.

API 入口先核對大小／格式，遮蔽電郵及信用卡號，再建立清理後請求。關閉 proxy／APM 的 request body 擷取；只有清理後請求可進範圍檢查、n8n 參數、graph state、checkpoint 或提示 trace。覆核留言及其他後續文字同樣經入口。保留研究意圖，但 original_question 存清理後版本，不能先存原提示再清理。

## News ingestion before searchable storage / 可搜尋儲存之前清理新聞

Both company refresh and the daily macro/geopolitical job create sanitized excerpt versions before committing research evidence, chunking or embedding. Keep source IDs, attribution, publication/first-seen times and policy version. Permission to use text is still required. Repeated ingestion remains idempotent; source identity and story deduplication must not depend only on the redacted text. Existing unsafe chunks must be withdrawn and reprocessed before retrieval, including replacement vectors.

公司刷新及每日宏觀／地緣工作都在提交研究證據、切段或 embedding 前建立清理節錄版本。保留來源 ID、出處、發布／首次取得時間及政策版本；仍須文字使用權。重複匯入保持冪等，來源身份／新聞去重不能只靠遮蔽後文字。已有不安全段落須撤出檢索，重新處理並替換向量後才可用。

## Before reranking and every model/tool boundary / 重排及每次模型／工具邊界之前

Recheck the query and retrieved excerpts before external rerankers, embedding providers and the report model. Direct scope/refinement LLM calls need the same wrappers. Validate and sanitize tool arguments before dispatch and tool results before returning a node update. If removal changes required support, return insufficient evidence instead of making a stronger claim. Raw context or draft must not enter a checkpoint between separate cleaning nodes.

外部重排器、embedding 供應商及報告模型前，再查問題及檢索節錄。直接 scope／補查 LLM 呼叫也用相同 wrapper。工具參數在發出前核對清理，工具結果在回傳節點更新前處理。移除內容導致缺少支持則回證據不足，不能加強結論；不能在獨立清理節點之間把原 context／草稿存入 checkpoint。

## Output filtering before state, streaming and release / State、串流及發布前清理輸出

The generate wrapper buffers the response, sanitizes it and only then returns safe state. The initial design disables raw token streaming. Validate claims against the sanitized evidence, then perform a final privacy check before report storage/export. A detector failure stops the affected path with privacy_blocked; return a generic error and safe counts, never the offending value or raw exception. No automatic privacy retry or unsanitized fallback.

Generate wrapper 先緩衝回應，清理後才回傳安全 state；初版停用原始 token 串流。按清理證據核對主張，報告儲存／下載前再作最終隱私檢查。偵測器失敗以 privacy_blocked 停止該路徑，只回一般錯誤及安全計數，不帶觸發值或原 exception；不自動隱私重試，亦不回退原文。

## Traces and n8n execution history / Traces 及 n8n 執行歷史

Disable raw model/tool payload capture before callbacks export it. Record run IDs, policy version, match counts/types, status, tokens and timings. Apply an attribute allowlist and a redacting OTel Collector before Langfuse/LangSmith fan-out. A Collector cannot undo an earlier raw export. Configure n8n execution-data retention and error logs so raw provider payloads are not retained. AsyncPostgresSaver stores supplied state; it does not detect PII.

Callbacks 匯出前關閉原始模型／工具 payload 擷取。只記任務 ID、政策版本、匹配類型／計數、狀態、token 及時間；用 attribute allowlist，再經遮蔽 OTel Collector 分送 Langfuse／LangSmith。Collector 無法撤回先前原文匯出。設定 n8n 執行資料保留及錯誤 log，避免保留原供應商 payload。AsyncPostgresSaver 只存傳入 state，不偵測 PII。

## Redaction policy and its limits / 遮蔽政策及限制

Use redact for email and credit_card across model input, output and tool results. Mask would retain card digits that this app does not need. Preserve tickers, prices, percentages, dates and citation URLs; do not enable blanket URL redaction. Validate citation URLs separately and reject credentials/private query parameters instead of changing the evidence link. Built-ins do not cover every secret, phone, identity number or obfuscation. Add tested detectors for those needs. PII filtering does not stop prompt injection or replace permissions, scope and citation checks.

模型輸入、輸出及工具結果的 email／credit_card 均用 redact。Mask 保留部分卡號，本 app 不需要。保留 ticker、價格、百分比、日期及引用 URL，不全面遮蔽 URL；引用網址另作驗證，含憑證／私人參數則拒絕，不能改造證據連結。內建偵測不涵蓋全部 secret、電話、身份號碼或變形寫法，按需要增加經測試偵測器。PII 清理不能阻止提示注入，也不取代權限、scope 及引用檢查。

[Privacy workflow SVG](../public/downloads/finance-diagrams/privacy-en.svg) · [繁中 SVG](../public/downloads/finance-diagrams/privacy-zh.svg)

## LangChain configuration / LangChain 設定

```python
# Proposed LangChain configuration, not an installed finance backend.
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

# This list belongs to create_agent, not StateGraph(...).
# The host must sanitize BEFORE invoking a graph with a checkpointer.
# Direct LLM calls in scope/refine/generate need explicit boundary wrappers.
# Filter tool arguments BEFORE dispatch, not just tool results afterwards.
# Model/tool callbacks and n8n logs need their own payload-capture policy.
# Start with buffered output: do not forward raw provider token chunks.
# Pin/test the installed LangChain version and its stream behavior.
# Syntax checked; live PIIMiddleware/model/checkpoint integration: NOT RUN.

```

## Verification / 驗證

Use synthetic email/card fixtures across prompts, tools, model output and review comments. Assert no detected values in checkpoint writes, embeddings, callback exports, exceptions, n8n execution history or report downloads. Test detector failure and partial streams; retain financial facts and verified citations. Local teaching tests do not establish complete production PII detection.

- [LangChain PIIMiddleware API](https://reference.langchain.com/python/langchain/agents/middleware/pii/PIIMiddleware)

- [LangChain built-in middleware and PII detection](https://docs.langchain.com/oss/python/langchain/middleware/built-in#pii-detection)
