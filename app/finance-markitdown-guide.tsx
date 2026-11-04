'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { type Copy, type Lang, pick } from '../lib/curriculum';

const concepts = [
  { keyword: 'MARKITDOWN', title: { en: 'Convert the document', zh: '轉換文件' }, detail: { en: 'A Python library turns PDF content into Markdown. Standard local conversion uses no LLM tokens. Save the result so the same report does not need conversion for every question.', zh: 'Python 函式庫把 PDF 內容轉成 Markdown。標準本機轉換不使用 LLM token；儲存結果，毋須每次提問都重新轉換同一財報。' } },
  { keyword: 'MCP · OPTIONAL', title: { en: 'Let an agent call the converter', zh: '讓 Agent 呼叫轉換工具' }, detail: { en: 'The optional MCP server exposes conversion as a tool. MCP connects the caller to MarkItDown; it does not compress a report or reduce tokens by itself.', zh: '可選的 MCP server 把轉換功能公開為工具。MCP 連接呼叫者與 MarkItDown，本身不會壓縮財報或減少 token。' } },
  { keyword: 'RAG', title: { en: 'Retrieve the evidence you need', zh: '只取回需要的證據' }, detail: { en: 'Split saved Markdown into sections and search permitted reports. Send relevant passages and reviewed facts to the model, rather than repeatedly including the entire document.', zh: '把已儲存的 Markdown 分段，並搜尋獲准存取的財報。把相關段落及已覆核數據交給模型，避免反覆帶入整份文件。' } },
] satisfies { keyword: string; title: Copy; detail: Copy }[];

const workflow = [
  { keyword: '01 · SOURCE', title: { en: 'Keep the original', zh: '保留原始來源' }, detail: { en: 'Spring Boot checks login, report ACL and the upload. Keep the source URL, file hash, reporting period and original PDF.', zh: 'Spring Boot 核對登入、財報 ACL 及上載文件；保留來源網址、檔案雜湊、報告期間及原始 PDF。' } },
  { keyword: '02 · CONVERT ONCE', title: { en: 'Create and check Markdown', zh: '產生並檢查 Markdown' }, detail: { en: 'A private Python worker runs MarkItDown. Review tables and page mapping before marking extracted facts as trusted.', zh: '私人 Python worker 執行 MarkItDown；先覆核表格及頁面對照，才把擷取數據標記為可信。' } },
  { keyword: '03 · SAVE + INDEX', title: { en: 'Reuse the same report', zh: '重用同一份財報' }, detail: { en: 'Save versioned Markdown, reviewed facts and source-linked chunks. PostgreSQL and pgvector support keyword and semantic retrieval.', zh: '儲存有版本的 Markdown、已覆核數據及附來源的段落；以 PostgreSQL 及 pgvector 支援關鍵詞與語意檢索。' } },
  { keyword: '04 · ASK + VERIFY', title: { en: 'Explain with evidence', zh: '根據證據解釋' }, detail: { en: 'LangGraph retrieves scoped evidence. Python calculates figures, the model explains them, and validation checks the answer and citations before export.', zh: 'LangGraph 取回限定範圍的證據；Python 計算數字，模型負責解釋，再驗證答案及引用後匯出。' } },
] satisfies { keyword: string; title: Copy; detail: Copy }[];

export function FinanceMarkitdownGuide({ lang }: { lang: Lang }) {
  const [integration, setIntegration] = useState<'python' | 'mcp'>('python');
  const detailId = useId();
  const direct = integration === 'python';
  const commands = direct ? "pip install 'markitdown[pdf]'\nmarkitdown report.pdf -o report.md" : 'pip install markitdown-mcp\nmarkitdown-mcp';

  return <section className="finance-section markitdown-guide" id="finance-markitdown" aria-labelledby="finance-markitdown-title">
    <div className="finance-section-heading"><p className="eyebrow">PDF → MARKDOWN → EVIDENCE</p><h2 id="finance-markitdown-title">{lang === 'zh' ? '用 MarkItDown 處理財報，再把證據交給 AI' : 'Use MarkItDown to prepare reports for AI'}</h2><p>{lang === 'zh' ? '使用 Microsoft 的現成轉換器，先把文字 PDF 轉成 Markdown，再重用結果。以下指南解釋真正需要建立的部分；互動示範使用預先準備的虛構內容，不會上載文件、執行轉換或呼叫模型。' : 'Use Microsoft’s existing converter to turn text PDFs into Markdown, then reuse the result. This guide explains what you need to build. The interactive demo uses prepared fictional content; it does not upload files, run conversion or call a model.'}</p></div>

    <div className="markitdown-concepts">{concepts.map(item => <article key={item.keyword}><span>{item.keyword}</span><h3>{pick(item.title, lang)}</h3><p>{pick(item.detail, lang)}</p></article>)}</div>

    <div className="markitdown-workflow"><h3>{lang === 'zh' ? '從原始文件到可核對的答案' : 'From the original file to a checkable answer'}</h3><ol>{workflow.map(item => <li key={item.keyword}><span>{item.keyword}</span><h4>{pick(item.title, lang)}</h4><p>{pick(item.detail, lang)}</p></li>)}</ol></div>

    <div className="markitdown-integration">
      <h3>{lang === 'zh' ? '先選擇如何接入你的項目' : 'Choose how to connect the converter'}</h3>
      <div className="markitdown-options" role="group" aria-label={lang === 'zh' ? 'MarkItDown 接入方式' : 'MarkItDown integration method'}>
        <button type="button" aria-pressed={direct} aria-controls={detailId} onClick={() => setIntegration('python')}>{lang === 'zh' ? '直接 Python · 建議先做' : 'Direct Python · start here'}</button>
        <button type="button" aria-pressed={!direct} aria-controls={detailId} onClick={() => setIntegration('mcp')}>{lang === 'zh' ? 'MCP 工具 · 按需要加入' : 'MCP tool · optional'}</button>
      </div>
      <div id={detailId} className="markitdown-integration-detail" aria-live="polite" aria-atomic="true">
        <h4>{direct ? (lang === 'zh' ? '在私人 Python worker 直接使用函式庫' : 'Use the library inside your private Python worker') : (lang === 'zh' ? '讓受信任 Agent 呼叫 convert_to_markdown' : 'Let a trusted agent call convert_to_markdown')}</h4>
        <p>{direct ? (lang === 'zh' ? '先用以下 CLI 指令檢查一份文字 PDF。整合時由 worker 呼叫 MarkItDown 函式庫，把輸出儲存到財報版本；毋須為這一步啟動額外 MCP server。' : 'First check one text PDF with these CLI commands. In the application, the worker calls the MarkItDown library and saves the output against the report version. This step needs no additional MCP server.') : (lang === 'zh' ? '以下指令啟動預設 STDIO server，供 MCP 客戶端連接；工具名稱為 convert_to_markdown(uri)。保留在私人或受信任本機環境。上游 server 沒有驗證功能，不應直接公開為 EC2 網際網路端點。' : 'These commands start the default STDIO server for an MCP client. Its tool is convert_to_markdown(uri). Keep it private or local with trusted callers. The upstream server has no authentication; do not expose it directly as a public EC2 endpoint.')}</p>
        <pre tabIndex={0} aria-label={lang === 'zh' ? '本機指令' : 'Local commands'}><code>{commands}</code></pre>
        <p className="markitdown-detail-note">{direct ? (lang === 'zh' ? '先在本機 Python 虛擬環境安裝並測試；部署階段才把相同依賴放入 Docker 映像。' : 'Install and test in a local Python virtual environment first. Add the same dependency to your Docker image at deployment.') : (lang === 'zh' ? '不要每次提問都讓工具回傳整份長 Markdown。由你的介接層儲存轉換結果，之後按權限只回傳所需證據。此工具與 Spring 的財報研究 MCP 是不同責任。' : 'Avoid returning an entire long Markdown document on every question. Have your adapter store conversion output, then return only permitted evidence for later questions. This converter has a different role from your Spring research MCP tools.')}</p>
      </div>
    </div>

    <div className="markitdown-checks">
      <article><h3>{lang === 'zh' ? '費用在甚麼地方產生？' : 'Where does usage cost arise?'}</h3><ul><li>{lang === 'zh' ? '標準本機轉換：只有本機運算，不使用 LLM token。' : 'Standard local conversion uses local compute and no LLM tokens.'}</li><li>{lang === 'zh' ? '可選 OCR、vision 或 Azure 服務：可能產生模型或服務費。' : 'Optional OCR, vision or Azure services may incur model or service charges.'}</li><li>{lang === 'zh' ? '託管 embedding 及答案模型：按供應商計費；這個示範不會呼叫它們。' : 'Hosted embeddings and answer models have provider-specific usage charges. This demo calls neither.'}</li></ul><p>{lang === 'zh' ? 'Markdown 不保證比直接 PDF 輸入便宜。以同一批問題量度實際用量；重點是轉換一次、儲存並只取回相關內容。' : 'Markdown is not guaranteed to cost less than direct PDF input. Compare actual usage on the same questions. Convert once, cache the result and retrieve relevant content.'}</p></article>
      <article><h3>{lang === 'zh' ? '哪些內容仍須覆核？' : 'What still needs review?'}</h3><ul><li>{lang === 'zh' ? '掃描頁可能沒有可擷取文字，需要另設 OCR 路徑。' : 'Scanned pages may have no extractable text and need a separate OCR path.'}</li><li>{lang === 'zh' ? '核對表格欄位、負數、報告年份、幣別及千／百萬單位。' : 'Check table columns, negative values, reporting year, currency and thousand/million units.'}</li><li>{lang === 'zh' ? '明確保存原始頁面對照；不要假設 Markdown 自動保留可引用的頁碼。' : 'Preserve explicit original-page mapping. Do not assume Markdown automatically keeps reliable page citations.'}</li></ul><p>{lang === 'zh' ? '遇到有歧義的數據，暫停並由獲授權人員覆核。證據不足時回傳部分答案及缺少內容。' : 'Pause ambiguous facts for authorized review. When evidence is missing, return a partial answer and explain the gap.'}</p></article>
    </div>

    <div className="markitdown-actions"><Link className="markitdown-primary" href="/finance-project/demo">{lang === 'zh' ? '試用逐步互動示範' : 'Try the guided demo'} →</Link><a href="/downloads/financial-report-markitdown-guide.md" download="FINANCIAL_REPORT_MARKITDOWN_GUIDE.md">{lang === 'zh' ? '下載開發指南（英文 Markdown）' : 'Download the developer guide (Markdown)'} ↓</a></div>
    <div className="markitdown-sources"><a href="https://github.com/microsoft/markitdown" target="_blank" rel="noreferrer">Microsoft · MarkItDown ↗</a><a href="https://github.com/microsoft/markitdown/tree/main/packages/markitdown-mcp" target="_blank" rel="noreferrer">Microsoft · MarkItDown MCP ↗</a></div>
  </section>;
}
