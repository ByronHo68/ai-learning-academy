# News chunking and metadata / 新聞切段及中繼資料

Open `/finance-project/chunking` to play the example. It uses fictional news in the project’s n8n response format and precomputed measurements from the pinned E5 tokenizer.

開啟 `/finance-project/chunking` 播放示範。新聞是虛構內容，使用項目的 n8n 回傳格式及固定 E5 tokenizer 的實測結果。

## Mind map / 心智圖

### Article version / 文章版本

Store the full permitted and sanitized article once. A correction creates a new article version. Each entry in your news array starts its own chunk sequence.

每篇允許使用及已清理的文章全文只儲存一次。修正內容時建立新版本。news 陣列的每篇文章有獨立的切段序列。

### Chunk / 段落片段（chunk）

A chunk is a contiguous excerpt from one article. Search may return the part about operating costs without sending a whole 8,000-character briefing to the report model.

Chunk 是同篇文章的一段連續原文。搜尋可以只找出談營運成本的段落，報告模型毋須讀完整 8,000 字元的報道。

### Tokenizer / Tokenizer 分詞器

An embedding model counts tokens. Measure each passage with the pinned tokenizer, including the E5 prefix and special tokens when checking the input limit.

Embedding 模型按 token 計長度。用固定 tokenizer 量度每段，檢查輸入上限時亦計 E5 前綴及特殊 token。

### Overlap / 重疊

The next chunk starts a little before the previous end. This can preserve context for a split sentence. Group overlapping hits by article version when selecting evidence so one article does not crowd out others.

下一段從上一段末端前稍早的位置開始，可保留句子前文。選擇證據時把重疊命中按文章版本組合，避免一篇文章佔滿候選。

### Metadata / 中繼資料（metadata）

A chunk keeps its article version, sequence number, source field and character range. Join the article’s title, publisher, URL and timestamps when you need to filter or cite it.

每段保存文章版本、段號、來源欄位及字元範圍。篩選或引用時，再查文章標題、出版者、網址及時間。

### Embedding / Embedding 向量

Encode each passage with the same compatible model and revision used for the query. Store the vector with its chunk ID and configuration. Rerank the resulting candidates against the question.

每段用與查詢相容的相同模型及版本編碼。向量附 chunk ID 及設定儲存，然後按問題對檢索候選重排。

## Measure your text / 量度你的文字

- news[0] · content · 8000 Unicode characters · 1573 E5 tokens · 6 chunks at the 320 / 48 preset.

- news[1] · content · 2189 Unicode characters · 1496 E5 tokens · 6 chunks at the 320 / 48 preset.

- news[2] · summary · 115 Unicode characters · 22 E5 tokens · 1 chunks at the 320 / 48 preset.

If the article is 8,000 tokens, the fixed 320-token window with 48-token overlap gives 30 windows. The sentence-aware splitter can produce a different count.

若文章是 8,000 token，320 token 固定窗口與 48 token 重疊共 30 段。按句尾優先切段時，結果可有不同。

## Apply limits / 設定上限

This demo shows the proposed handling after a response has been parsed. Today the n8n validator rejects oversized content. The transport byte cap, summary fallback, per-article skip and background batching are integration steps.

示範展示回應解析後的建議處理。現有 n8n 驗證器拒絕超長 content。傳輸位元組上限、摘要回退、逐篇略過及背景分批均待整合。

### n8n intake / n8n 接收

100,000 UTF-16 code units per content field

100,000 每個 content 欄位的 UTF-16 碼元

The current n8n validator enforces this limit after parsing. Put a separate response byte limit at the MCP server or HTTP bridge, so an oversized response can be stopped before buffering or parsing it.

現有 n8n 驗證器於解析後執行此上限。MCP server 或 HTTP bridge 應另設回應位元組上限，讓超大回應在完整緩衝或解析前停止。

### Background embedding / 背景 embedding

32 chunks per article in one worker batch (proposed)

32 每篇文章每批最多段數（建議）

Keep the full admitted article. Start with a 320-token target and 48-token overlap. Stop at the chunk or time budget, save progress, and queue the remainder under the same article version and model configuration.

保留已接納的全文。先試每段目標 320 token、重疊 48 token。到段數或時間上限就保存進度，並按同一文章版本及模型設定續排餘下段落。

### Report evidence / 報告證據

6 source reads per research run (design limit)

6 每次研究的來源讀取次數（設計上限）

Group hits by article version and remove duplicate overlap from selected text. Keep the source IDs for citations. Fit the selected passages to the report model’s token budget and recheck evidence coverage.

按文章版本組合命中，刪除所選原文中的重疊重複，保留引用來源 ID。按報告模型的 token 預算選擇段落，再查證據覆蓋。

### 8,000-character news / 8,000 字元新聞

Store the full article supplied by n8n. All six chunks in this E5 example fit in one indexing batch.

保存 n8n 提供的全文。這個 E5 範例的六段都可在一批完成索引。

Select the passages that answer the question, under the source-read and context budgets.

按來源讀取及 context 預算，選擇回答問題所需的段落。

```json
{
  "intake": {
    "original_content_utf16_units": 8000,
    "max_content_utf16_units": 100000,
    "source_coverage": "full_body",
    "source_field": "content",
    "reason": null
  },
  "vector_index": {
    "status": "complete",
    "planned_chunks": 6,
    "ready_chunks": 6,
    "queued_chunks": 0
  }
}
```

### Long article · more than one batch / 長文章 · 需要多批

This fictional article fits the intake limit and has 48 planned chunks. The first batch prepares 32 vectors and queues the other 16. The stored article is still complete.

這篇虛構文章符合接收上限，計劃切 48 段。首批準備 32 個向量，其餘 16 段排隊。文章全文仍完整保存。

In hybrid mode, freeze the ready set in each snapshot and record partial vector coverage while chunks are queued. Full-text search can use admitted passages that are already text-indexed.

混合模式在快照固定已就緒的向量集合，並在餘下段落排隊時記錄部分向量覆蓋。全文檢索可使用已准入及已建立全文索引的段落。

```json
{
  "intake": {
    "original_content_utf16_units": 68000,
    "max_content_utf16_units": 100000,
    "source_coverage": "full_body",
    "source_field": "content",
    "reason": null
  },
  "vector_index": {
    "status": "partial",
    "planned_chunks": 48,
    "ready_chunks": 32,
    "queued_chunks": 16
  }
}
```

### Oversized · usable summary / 超長 · 有可用摘要

Keep the provider’s existing summary if it passes validation. Store it as summary, with the original URL and timestamps. Record that the article body exceeded the limit.

供應商原有摘要通過驗證便可保留。以 summary 儲存，連同原有網址及日期，並記錄正文超過上限。

Cite only what the summary supports, subject to the usual source checks. If the question needs missing detail, return insufficient evidence.

通過一般來源核對後，只引用摘要能支持的主張。問題需要欠缺的細節時，回傳證據不足。

```json
{
  "intake": {
    "original_content_utf16_units": 120000,
    "max_content_utf16_units": 100000,
    "source_coverage": "summary_only",
    "source_field": "summary",
    "reason": "content_over_limit"
  },
  "vector_index": {
    "status": "complete",
    "planned_chunks": 1,
    "ready_chunks": 1,
    "queued_chunks": 0
  }
}
```

### Oversized · no usable summary / 超長 · 無可用摘要

Write a skip reason to the intake record and leave this item out of the evidence set. No article version or chunk needs to be created for it.

在接收記錄寫下略過原因，並把此項排除於證據集合。毋須建立文章版本或段落。

Record the acquisition gap. Continue with other eligible sources and return insufficient evidence if they cannot answer the question.

記錄抓取缺口。繼續使用其他合資格來源，若仍無法回答就回傳證據不足。

```json
{
  "intake": {
    "original_content_utf16_units": 120000,
    "max_content_utf16_units": 100000,
    "source_coverage": "skipped",
    "source_field": null,
    "reason": "content_over_limit"
  },
  "vector_index": {
    "status": "not_applicable",
    "planned_chunks": 0,
    "ready_chunks": 0,
    "queued_chunks": 0
  }
}
```

## Store metadata / 儲存中繼資料

### Store source fields on the article version / 在文章版本存來源欄位

Map title, summary, publisher, url and publishedAt from each news item. Store the sanitized content. Read document_id, version_id and first_seen_at from news_ingest.versions. Company and shared topic scope come from validated batch membership. Keep a missing publication date or URL null.

每篇 news 把 title、summary、publisher、url 及 publishedAt 對應至文章版本，並存清理後的 content。document_id、version_id 及 first_seen_at 來自 news_ingest.versions；公司及共享主題來自已核對的批次成員。缺發布日期或 URL 時保留 null。

### Store offsets and policy on the chunk / 在段落保存範圍及策略

Use (version_id, chunker_config, chunk_index) as the unique key. Include source_field, start_char, end_char, text hash and token count. Offsets are zero-based Unicode code points with an exclusive end in the exact stored sanitized field. The browser uses code points to slice the same text.

用 (version_id, chunker_config, chunk_index) 作唯一鍵，另存來源欄位、起訖字元、文字雜湊及 token 數。範圍是已存清理文字的 Unicode 碼點，由 0 開始，不包含終點。瀏覽器按同一單位切出原文。

### Store the embedding configuration with the vector / 向量附 embedding 設定

Keep chunk_id, model ID and revision, dimension, passage prefix and normalization with the vector record. Reuse an embedding only when its exact input and configuration match. A different chunking policy or embedding space needs new evaluated rows.

向量記錄保存 chunk_id、模型 ID 及版本、維度、passage 前綴及正規化。只有完全相同輸入及設定才重用向量。改切段策略或向量空間就建立新資料並評估。

### Apply the report snapshot at retrieval time / 檢索時套用報告快照

The snapshot pins allowed versions, the chunk and embedding configuration, the ready vector set and the cutoff. Check publication time, first-seen time and permissions before retrieval. A missing date cannot support an as-of claim. Chunks can appear in more than one snapshot.

快照固定允許版本、切段及 embedding 設定、已就緒向量及截止時間。查詢前核對發佈時間、首次取得時間及權限。沒有日期的來源不能支持指定時間主張。同段可出現在多個快照。

## Run the tokenizer example / 執行 tokenizer 例子

[Three-article news response](stock-research-chunk-news.json) · [Tokenizer example](stock-research-chunk-example.py) · [Workflow SVG](finance-diagrams/chunking-en.svg) · [繁中 SVG](finance-diagrams/chunking-zh.svg)

```sh
python3 -m pip install tokenizers
curl -fL 'https://huggingface.co/intfloat/multilingual-e5-small/resolve/614241f622f53c4eeff9890bdc4f31cfecc418b3/tokenizer.json' -o tokenizer.json
python3 stock-research-chunk-example.py stock-research-chunk-news.json tokenizer.json
```

## Encode a passage and query / 編碼段落及查詢

Set `chunk_text` to the validated excerpt, then run this example with Sentence Transformers. The lesson measures tokenization. Model inference and PostgreSQL indexing are separate steps.

將 `chunk_text` 設為已核對原文，再用 Sentence Transformers 執行。教材量度分詞；模型推論及 PostgreSQL 索引是獨立步驟。

```python
from sentence_transformers import SentenceTransformer

MODEL = "intfloat/multilingual-e5-small"
REVISION = "614241f622f53c4eeff9890bdc4f31cfecc418b3"
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
```

- [Multilingual E5-small model card](https://huggingface.co/intfloat/multilingual-e5-small)

- [BGE-M3 model card](https://huggingface.co/BAAI/bge-m3)

- [Sentence Transformers model API](https://www.sbert.net/docs/package_reference/sentence_transformer/model.html)
