# Stock research RAG storyline / 股票研究 RAG 故事

Open `/finance-project/rag` to play the bilingual walkthrough. The data and vectors below are fictional. The animation runs the response checks and index join locally.

開啟 `/finance-project/rag` 播放雙語示範。以下資料及向量均為虛構。動畫在本機執行回應驗證及 index 配對。

[Workflow SVG](finance-diagrams/rag_story-en.svg) · [繁中 SVG](finance-diagrams/rag_story-zh.svg)

## Follow the data / 跟著資料走

### 1. n8n receives news from YFinance MCP / n8n 從 YFinance MCP 接收新聞

n8n asks the configured tool for up to three company articles. The story follows one item from the news array. Daily macro news and curated profiles can supply other eligible evidence.

n8n 向固定工具索取最多三篇公司新聞。故事追蹤 news 陣列中的一篇。每日宏觀新聞及經審核的公司背景也可提供其他合資格證據。

### 2. Commit a source version with provenance / 保存來源版本及出處

n8n validates, sanitizes, deduplicates and commits the batch. The app admits eligible versions after checking rights, dates and source scope. The app owns the article ID, URL, timestamps and policy.

n8n 驗證、清理、去重及提交批次。App 檢查權限、日期及來源範圍後才接納版本，並管理文章 ID、網址、時間及政策。

### 3. Save excerpts and their locations / 保存節錄及原文位置

Use the pinned chunking policy. This short example has two passages to make the batch easy to inspect. Save each chunk ID, source ID, offsets and text under stock_rag.chunks.

使用固定切段策略。此短例有兩段，方便檢視批次。把段落 ID、來源 ID、範圍及文字存入 stock_rag.chunks。

### 4. The worker sends sanitized text to OpenRouter / 背景 worker 將已清理文字送往 OpenRouter

POST /embeddings from a server-side worker with an approved model and provider. The input array contains permitted excerpts. The worker keeps a local list of chunk IDs in that same order.

由伺服器的 worker 用核准模型及供應商 POST /embeddings。input 陣列包含允許的節錄。Worker 在本機按相同順序保留段落 ID。

### 5. The reply identifies each vector by input index / 回應以輸入索引識別每個向量

OpenRouter returns the model and a data array. Each item has index and embedding. The example reverses the item order so you can see why the index matters. Your citation metadata lives in your database.

OpenRouter 回傳模型及 data 陣列，每項有 index 與 embedding。例子刻意倒序，展示 index 的用途。你的引用 metadata 保存在自己的資料庫。

### 6. Match each vector to your chunk ID / 將每個向量配對至段落 ID

Check the returned model, finite vector values, dimension, and exactly one result for each input index. Use inputChunkIds[index] to attach the vector. Reject an invalid batch before writing any vector.

核對回傳模型、有限數值、向量維度，以及每個輸入 index 恰好有一項結果。用 inputChunkIds[index] 配對。整批不合格時在寫入任何向量前拒絕。

### 7. Store vectors separately from source text / 分開保存向量及來源文字

Save each validated vector by chunk ID and model configuration in a compatible pgvector table. The source and chunk tables keep the title, date, URL and excerpt. Reuse exact matching vectors on replay.

把每個已核對的向量按段落 ID 及模型設定存入相容的 pgvector 表。來源及段落表保留標題、日期、網址及節錄。重跑時重用完全相符的向量。

### 8. Pin evidence for the accepted question / 為已接納的問題固定證據

LangGraph checks scope and calls the required n8n refresh. It freezes eligible chunk IDs, the as-of cutoff and ready vectors for this run. Search and any refinement reuse that snapshot.

LangGraph 檢查範圍並呼叫指定 n8n 刷新，把合資格段落、as-of 截止及已就緒向量固定於本次任務。檢索與補查沿用此快照。

### 9. Find candidate passages / 找出候選段落

Full-text search is the project default. In admitted hybrid mode, encode the question with the same compatible model and settings, search pgvector under snapshot filters, and combine dense and full-text candidates.

項目預設全文檢索。混合模式獲准後，用相同相容的模型及設定為問題編碼，在快照過濾下搜尋 pgvector，再結合向量與全文候選。

### 10. Prioritize direct support for the question / 優先選直接支持問題的原文

A reranker compares the question with each candidate’s text. The passage about spending and margins goes ahead of the capacity announcement for this question. The order represents relevance.

重排器比較問題與每段候選文字。對此問題，支出及利潤段落比容量公告更靠前。次序表示相關程度。

### 11. Check selection and evidence coverage / 覆核選取及證據覆蓋

In review mode the user can highlight, remove or reorder candidates. Check that selected IDs are in the snapshot, then recheck coverage after exclusions and context trimming.

覆核模式可標記、移除或重排候選。確認所選 ID 在快照中，並在排除及裁剪 context 後重查覆蓋。

### 12. Give the report model text and citation IDs / 把原文及引用 ID 交給報告模型

Augment the prompt with selected excerpts and citation IDs. Call the separate OpenRouter chat endpoint to draft the report. The generation model gets the evidence text and citation references.

把選定節錄及引用 ID 加進 prompt。另呼叫 OpenRouter chat endpoint 擬稿。生成模型收到證據文字及引用參照。

### 13. Verify support before releasing the answer / 確認原文支持才發布答案

Check that each material claim is supported by its cited excerpt and that all IDs belong to the snapshot. Return an explicit evidence gap when support is missing.

檢查每項重要主張都有引用原文支持，及所有 ID 屬於快照。缺少支持時，明確回傳證據缺口。

## Inspect the JSON / 檢視 JSON

### YFinance MCP response / YFinance MCP 回應

```json
{
  "symbol": "MSFT",
  "news": [
    {
      "title": "Fictional MSFT cloud capacity update",
      "publisher": "Academy example",
      "url": "https://example.com/msft-cloud-update",
      "publishedAt": "2026-11-20T08:00:00Z",
      "summary": "A fictional update about cloud capacity and costs.",
      "content": "In this fictional update, MSFT plans to add cloud computing capacity at two sites.\n\nThe company expects higher infrastructure spending and has not disclosed a margin forecast."
    }
  ]
}
```

### App-owned source and chunks / App 保存的來源及段落

```json
{
  "source": {
    "source_id": "demo-source-v1",
    "news_version_id": "demo-news-v1",
    "symbol": "MSFT",
    "title": "Fictional MSFT cloud capacity update",
    "publisher": "Academy example",
    "source_url": "https://example.com/msft-cloud-update",
    "published_at": "2026-11-20T08:00:00Z",
    "first_seen_at": "2026-11-20T09:00:00Z"
  },
  "chunks": [
    {
      "chunk_id": "demo-c1",
      "source_id": "demo-source-v1",
      "source_field": "content",
      "ordinal": 0,
      "char_start": 0,
      "char_end": 82,
      "excerpt": "In this fictional update, MSFT plans to add cloud computing capacity at two sites."
    },
    {
      "chunk_id": "demo-c2",
      "source_id": "demo-source-v1",
      "source_field": "content",
      "ordinal": 1,
      "char_start": 84,
      "char_end": 175,
      "excerpt": "The company expects higher infrastructure spending and has not disclosed a margin forecast."
    }
  ]
}
```

### OpenRouter request / OpenRouter 請求

`POST https://openrouter.ai/api/v1/embeddings`

```json
{
  "model": "openai/text-embedding-3-small",
  "dimensions": 1536,
  "encoding_format": "float",
  "input": [
    "In this fictional update, MSFT plans to add cloud computing capacity at two sites.",
    "The company expects higher infrastructure spending and has not disclosed a margin forecast."
  ]
}
```

### Simulated response / 模擬回應

The preview displays three values per vector. The full simulated reply has 1,536 dimensions per vector. The worker matches `inputChunkIds[0]` to `data` item with `index: 0`, even though that item appears second.

預覽只展示每個向量三個值。完整模擬回應每個向量有 1,536 維。即使 index 0 排在第二項，worker 仍會將其對應 inputChunkIds[0]。

```json
{
  "object": "list",
  "model": "openai/text-embedding-3-small",
  "data": [
    {
      "object": "embedding",
      "index": 1,
      "embedding": [
        0.048,
        -0.016,
        0.071
      ]
    },
    {
      "object": "embedding",
      "index": 0,
      "embedding": [
        -0.023,
        0.042,
        0.008
      ]
    }
  ]
}
```

### Joined view assembled by your app / App 組合的檢視資料

```json
{
  "chunk": {
    "chunk_id": "demo-c1",
    "source_id": "demo-source-v1",
    "source_field": "content",
    "ordinal": 0,
    "char_start": 0,
    "char_end": 82,
    "excerpt": "In this fictional update, MSFT plans to add cloud computing capacity at two sites."
  },
  "source": {
    "source_id": "demo-source-v1",
    "news_version_id": "demo-news-v1",
    "symbol": "MSFT",
    "title": "Fictional MSFT cloud capacity update",
    "publisher": "Academy example",
    "source_url": "https://example.com/msft-cloud-update",
    "published_at": "2026-11-20T08:00:00Z",
    "first_seen_at": "2026-11-20T09:00:00Z"
  },
  "vector": {
    "chunk_id": "demo-c1",
    "model_key": "openrouter:text-embedding-3-small:1536:plain:v1",
    "dimensions": 1536,
    "embedding_preview": [
      -0.023,
      0.042,
      0.008
    ]
  }
}
```

### Query embedding and report context / 問題向量及報告 context

```json
{
  "model": "openai/text-embedding-3-small",
  "dimensions": 1536,
  "encoding_format": "float",
  "input": [
    "What did MSFT say about cloud infrastructure costs?"
  ]
}
```

```json
{
  "question": "What did MSFT say about cloud infrastructure costs?",
  "snapshot_id": "demo-snapshot",
  "evidence": [
    {
      "citation_id": "S1",
      "chunk_id": "demo-c2",
      "excerpt": "The company expects higher infrastructure spending and has not disclosed a margin forecast."
    }
  ]
}
```

The fictional update says MSFT expects higher infrastructure spending. It does not provide a margin forecast. [S1]

虛構消息指出 MSFT 預期基建支出增加，並未提供利潤率預測。[S1]

## Choose the embedding model / 選擇 embedding 模型

### openai/text-embedding-3-small

Hosted example · 1,536 dimensions

託管範例 · 1,536 維

Try this candidate when you want OpenRouter to handle document and query embeddings. Send plain excerpts and questions with the same model and dimensions. Keep credentials on the server and approve the provider and data policy before sending content.

如果希望由 OpenRouter 處理文件與查詢向量，可測試此候選。以相同模型及維度傳送節錄及問題文字。憑證留在伺服器；送出內容前核准供應商與資料政策。

### intfloat/multilingual-e5-small

Local candidate · 384 dimensions

本機候選 · 384 維

This matches the current stock_rag.embeddings and SQL examples. E5 uses passage: for chunks and query: for questions. The 320/48 chunk lesson measures E5 tokens. Recheck length with the hosted model’s tokenizer if you use that model.

此模型符合目前 stock_rag.embeddings 與 SQL 範例。E5 段落用 passage:，問題用 query:。320/48 切段課程使用 E5 token。改用託管模型時按其 tokenizer 重查長度。

The hosted candidate needs a separate vector(1536) store and matching write, retrieval and snapshot wiring. Re-embed the corpus when changing model configuration. Never mix model spaces, even if their dimensions match. Compare both candidates with PostgreSQL full-text on your frozen evaluation set before exposing hybrid retrieval.

託管候選需要獨立 vector(1536) 儲存及相符的寫入、檢索、快照接線。變更模型設定後重做資料向量。即使維度相同，也不可混用不同模型空間。啟用混合檢索前，以凍結評估集比較兩個候選及 PostgreSQL 全文。

- [OpenRouter embeddings API](https://openrouter.ai/docs/api/api-reference/embeddings/submit-an-embedding-request)

- [OpenRouter text-embedding-3-small](https://openrouter.ai/openai/text-embedding-3-small)

- [Multilingual E5-small model card](https://huggingface.co/intfloat/multilingual-e5-small)
