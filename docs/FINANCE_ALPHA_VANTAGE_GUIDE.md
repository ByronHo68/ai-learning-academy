# Alpha Vantage daily-news design / Alpha Vantage 每日新聞設計

Proposed n8n configuration. Live Alpha Vantage execution and coverage evaluation are NOT RUN.

## Alpha Vantage supplies the daily news / Alpha Vantage 供應每日新聞

Use n8n HTTP Request with GET https://www.alphavantage.co/query and function=NEWS_SENTIMENT. Store apikey in an n8n Query Auth credential, outside exported workflow JSON and public traces. Company news and quotes still use the separate YFinance bridge. This is a provider configuration design; no Alpha Vantage requests have been made by the academy.

n8n HTTP Request 用 GET https://www.alphavantage.co/query，function=NEWS_SENTIMENT。apikey 存 n8n Query Auth，不放匯出流程 JSON 或公開 trace。公司新聞及價格仍用獨立 YFinance bridge；這是供應商設定設計，學院沒有發送 Alpha Vantage 請求。

## Separate macro and fiscal requests / 宏觀與財政分開請求

Request economy_macro and economy_fiscal separately, union the responses and deduplicate shared articles. A comma-separated topics parameter requires articles to match both topics; it is not an OR search. economy_monetary is available for an optional interest-rate/inflation stream, with an explicit extra request budget. Omit tickers for shared context so articles need not name MSFT, AAPL or NVDA.

economy_macro 及 economy_fiscal 分開請求，合併回應並去重。topics 用逗號會要求同時符合兩主題，不是 OR。可選 economy_monetary 抓利率／通脹新聞，但須另加請求預算。共用背景不設 tickers，文章毋須點名 MSFT、AAPL 或 NVDA。

## Geopolitics needs a coverage check / 地緣政治須檢查覆蓋

The documented topic list has no geopolitics filter or free-text search parameter. Fetch a broad NEWS_SENTIMENT candidate feed, then tag permitted titles/summaries for events such as sanctions, tariffs, conflict and export restrictions, with regions and provenance. Tagging is your classification step, not an Alpha Vantage query capability. A financial-news feed may miss geopolitical events: show limited coverage and abstain when a required event is absent.

官方主題清單沒有 geopolitics 篩選或自由文字搜尋參數。抓廣泛 NEWS_SENTIMENT 候選，再按允許標題／摘要標記制裁、關稅、衝突、出口限制、地域及來源。標記是你的分類步驟，不是 Alpha Vantage 查詢功能。金融新聞可能漏地緣事件；須明示覆蓋有限，所需事件缺少時拒絕相關結論。

## Freeze the UTC window and detect truncation / 固定 UTC 視窗並偵測截斷

Add time_from/time_to in YYYYMMDDTHHMM UTC to every planned request. Start from the last successful watermark with a small configured overlap and freeze the end at job creation. Preserve provider publication time, first_seen_at and fetched_at separately. A capped response is not proof of complete coverage: reaching the limit flags possible truncation. Split the window only within the request budget, otherwise mark that stream incomplete and keep the previous completed batch eligible.

每個請求加 YYYYMMDDTHHMM UTC 的 time_from/time_to。由最後成功 watermark 加設定的小重疊起計，工作建立時固定結束時間。發布、首次取得及抓取時間分開保存。達結果上限代表可能截斷，不能當完整覆蓋；只在預算內拆視窗，否則標記來源未完整並沿用上一完整批次。

## Count requests across the whole daily job / 計算整個每日工作的請求數

The base plan has three queries: macro, fiscal and broad geopolitical candidates. At most three transient attempts per query means at most nine provider requests, including failed attempts, all clipped to the shared daily deadline. Account quotas and rate spacing may reduce that cap. Handle provider error/rate-limit JSON even when HTTP is 200; do not treat it as an empty feed. An exhausted quota does not cause rapid retries. Confirm NEWS_SENTIMENT entitlement and quota for the configured key before enabling the job.

基本方案三個查詢：宏觀、財政及廣泛地緣候選；每查詢最多三次暫時錯誤嘗試，即最多九次供應商請求，包含失敗，並受共用每日時限限制。帳戶配額及速率間隔可令上限更低。HTTP 200 仍須檢查供應商錯誤／限流 JSON，不能當空新聞；配額用完不能密集重試。啟用前確認金鑰有 NEWS_SENTIMENT 權限及配額。

## Prepare evidence before embedding it / Embedding 之前先準備證據

Normalize the response, deduplicate canonical URL/content versions, attach stream/topic/region/permission metadata and commit a completed batch with its receipt in PostgreSQL. Chunk permitted article text or summaries. Embed only new or changed chunks using a pinned model/version; reuse vectors only for the same text hash and model. Provider sentiment scores are stored metadata: they are not embeddings, your reranker scores or validated stock-return forecasts.

先正規化、按 URL／內容版本去重，加來源／主題／地域／權限 metadata，在 PostgreSQL 提交完整批次及收據。將允許原文或摘要切段，以固定模型／版本只嵌入新增或改動段落；只有相同文字 hash 和模型才可重用向量。供應商情緒分數只是 metadata，不是 embedding、你的重排分數或已驗證股票回報預測。

```json
{
  "disclosure": "Proposed n8n HTTP Request configuration; not a live response",
  "method": "GET",
  "url": "https://www.alphavantage.co/query",
  "credential": "n8n Query Auth: apikey (private; not exported)",
  "queries": [
    {
      "id": "macro",
      "purpose": {
        "en": "Macroeconomic news",
        "zh": "宏觀經濟新聞"
      },
      "parameters": {
        "function": "NEWS_SENTIMENT",
        "topics": "economy_macro",
        "sort": "LATEST",
        "limit": 1000
      }
    },
    {
      "id": "fiscal",
      "purpose": {
        "en": "Fiscal-policy news",
        "zh": "財政政策新聞"
      },
      "parameters": {
        "function": "NEWS_SENTIMENT",
        "topics": "economy_fiscal",
        "sort": "LATEST",
        "limit": 1000
      }
    },
    {
      "id": "geopolitics_candidates",
      "purpose": {
        "en": "Broad news for geopolitical tagging",
        "zh": "供地緣政治標記的廣泛新聞"
      },
      "parameters": {
        "function": "NEWS_SENTIMENT",
        "sort": "LATEST",
        "limit": 1000
      }
    }
  ],
  "shared_parameters": {
    "time_from": "{{ frozen_window_from_utc }}",
    "time_to": "{{ frozen_window_to_utc }}"
  },
  "optional_topic": "economy_monetary (separate request; adjust job budget)",
  "geopolitics": "Post-fetch tagging; coverage is limited to returned financial news"
}
```

[Alpha Vantage NEWS_SENTIMENT parameters](https://www.alphavantage.co/documentation/#news-sentiment)
