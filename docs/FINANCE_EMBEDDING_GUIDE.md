# Document and query embeddings / 文件及查詢 embedding

Proposed indexing and retrieval design, not a live finance service.

## Document embeddings: during indexing / 文件 embedding：建立索引時

After company/daily news is validated, deduplicated and committed, split permitted text into versioned chunks. An indexing worker embeds new or changed chunks, then stores vectors with chunk ID, text hash, model/version and dimension in PostgreSQL pgvector. Company-profile excerpts use the same pipeline. This happens before those chunks can participate in vector search, rather than after reranking.

公司／每日新聞驗證、去重及提交後，將允許文字切成有版本段落。索引 worker 嵌入新增／改動段落，再把向量、chunk ID、文字 hash、模型／版本及維度存 PostgreSQL pgvector。公司背景原文亦經此流程；須先有向量才可向量搜尋，並非重排後才 embedding。

## Question embeddings: just before vector retrieval / 問題 embedding：向量檢索之前

On an accepted request, first refresh company news and pin the evidence snapshot. If the evaluated hybrid mode is enabled, encode the current query using the same compatible model/configuration as document vectors, then search pgvector under the snapshot, time and permission filters. Combine with full-text results and rerank question–passage pairs. A refined query needs its own query embedding; unchanged document chunks do not need another embedding.

有效請求先刷新公司新聞及固定快照。若已啟用通過評估的混合模式，用與文件向量相容的相同模型／設定編碼當前查詢，再在快照、時間及權限條件下搜尋 pgvector，合併全文結果後重排問題與原文配對。補查的新 query 須再編碼；未改動文件不須重嵌入。

## Pending vectors do not block sparse search / 向量未就緒不阻擋全文搜尋

Full-text indexing remains the default and uses no embeddings. Run document embedding as a separate idempotent indexing job keyed by chunk hash and model. Pin the model/version and vector-ready chunk IDs with the run snapshot; refinement/resume reuse that view. Newly completed embeddings become available to the next request. Do not label pending embeddings as a complete hybrid index. A candidate vector/model failure falls back to working full-text evidence within budget. Neither n8n acquisition success nor an evidence snapshot promises that its vectors are ready. Hybrid remains blocked until it beats the written frozen evaluation margins.

全文索引仍是預設，不用 embedding。文件嵌入作獨立冪等索引工作，以段落 hash 及模型為鍵，快照固定模型／版本及向量已就緒段落 ID，補查／恢復沿用此視圖；新完成向量供下次請求用，不能把待完成向量稱完整混合索引。向量／模型失敗可在預算內回退可用全文證據；n8n 抓取成功及固定快照不代表向量已就緒。混合模式仍須超越凍結評估書面門檻才准入。

## Embeddings, reranking and review do different jobs / Embedding、重排及覆核分工不同

Embeddings help find semantically similar passages. Reranking scores relevance to the exact question using the passage text. Evidence review shows the proposed sources and system rank, lets you exclude or reorder them, and records your preferred discussion order. None of these steps establishes factual support or predicts stock returns. The evidence gate and citation checks still decide which claims may be released.

Embedding 協助找語義相似段落；重排用原文評估對當前問題的相關性。證據覆核展示建議來源及系統排序，讓你排除或改討論次序。這些步驟本身都不證明事實支持或預測股票回報；證據關卡及引用驗證仍決定哪些主張可發布。

[Embedding workflow SVG](../public/downloads/finance-diagrams/embeddings-en.svg) · [繁中 SVG](../public/downloads/finance-diagrams/embeddings-zh.svg)
