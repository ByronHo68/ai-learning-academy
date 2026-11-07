'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Pause, Play, Plug, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { pick, type Lang } from '../lib/curriculum';
import { mcpExamples, mcpIntroduction, mcpMindmap, mcpOwnership, mcpReferences, mcpScenarios, mcpSetup, mcpStorySteps, mcpToolDefinition, mcpVersionNote } from '../lib/finance-mcp';

function McpAnimation({ lang }: { lang: Lang }) {
  const [player, setPlayer] = useState({ scenario: 0, position: 0, playing: false });
  const [delay, setDelay] = useState(4500);
  const scenario = mcpScenarios[player.scenario] ?? mcpScenarios[0];
  const stepId = scenario.path[player.position] ?? 'scope';
  const current = mcpStorySteps[stepId];
  const last = player.position === scenario.path.length - 1;
  const isMcp = current.channel === 'mcp';

  useEffect(() => {
    if (!player.playing) return;
    const timer = window.setTimeout(() => {
      setPlayer(previous => {
        const position = Math.min(previous.position + 1, scenario.path.length - 1);
        return { ...previous, position, playing: position < scenario.path.length - 1 };
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [delay, player.playing, player.position, scenario]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlayer(previous => ({ ...previous, playing: false }));
    };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden);
  }, []);

  const seek = (position: number) => setPlayer(previous => ({ ...previous, position, playing: false }));
  return <section className="finance-section mcp-story" id="mcp-animation">
    <p className="eyebrow">02 · FOLLOW ONE QUESTION</p>
    <h2>{lang === 'zh' ? '按播放，睇清楚訊息去咗邊' : 'Press play. Follow the message.'}</h2>
    <p>{lang === 'zh' ? '先睇「證據足夠」，再轉情境。每步都指出由誰發送、誰執行，以及是否經 MCP。可以暫停、逐步前進或直接點步驟。' : 'Start with enough evidence, then change the scenario. Each step shows the sender, receiver and whether MCP carries the message. Pause, step through or jump to a stage.'}</p>
    <div className="mcp-choice-row" role="group" aria-label={lang === 'zh' ? '動畫情境' : 'Animation scenario'}>
      {mcpScenarios.map((item, i) => <button type="button" key={item.id} aria-pressed={player.scenario === i} onClick={() => setPlayer({ scenario: i, position: 0, playing: false })}>{pick(item.title, lang)}</button>)}
    </div>
    <div className="mcp-player" data-playing={player.playing}>
      <div className="mcp-player-top"><span>{lang === 'zh' ? '虛構離線動畫 · 真實外部呼叫 0 次' : 'Fictional offline animation · 0 real external calls'}</span><span>{player.position + 1} / {scenario.path.length}</span></div>
      <p className="mcp-question">“{pick(scenario.prompt, lang)}”</p>
      <div className="mcp-transfer" key={`${scenario.id}-${player.position}`} data-channel={current.channel}>
        <div className="mcp-endpoint"><small>{lang === 'zh' ? '由' : 'FROM'}</small><strong>{pick(current.from, lang)}</strong></div>
        <div className="mcp-cable" aria-hidden="true"><span className="mcp-packet"><ArrowRight size={17}/></span></div>
        <div className="mcp-endpoint"><small>{lang === 'zh' ? '到' : 'TO'}</small><strong>{pick(current.to, lang)}</strong></div>
      </div>
      <div className="mcp-stage-detail" aria-live={player.playing ? 'off' : 'polite'} aria-atomic="true">
        <span className={`mcp-channel ${isMcp ? 'is-mcp' : ''}`}>{isMcp ? lang === 'zh' ? '這一步經 MCP 傳訊' : 'This message crosses MCP' : lang === 'zh' ? '這一步是 app／服務內的工作' : 'This step uses application / service logic'}</span>
        <h3>{pick(current.title, lang)}</h3>
        <p>{pick(current.explanation, lang)}</p>
        <pre><code>{stepId === 'scope' ? pick(scenario.prompt, lang) : current.message}</code></pre>
      </div>
      <div className="mcp-controls">
        <button type="button" className="mcp-play" onClick={() => setPlayer(previous => ({ ...previous, position: last ? 0 : previous.position, playing: !previous.playing }))}>
          {player.playing ? <Pause size={17}/> : <Play size={17}/>}{player.playing ? lang === 'zh' ? '暫停' : 'Pause' : last ? lang === 'zh' ? '重播' : 'Replay' : lang === 'zh' ? '播放動畫' : 'Play animation'}
        </button>
        <button type="button" disabled={player.position === 0} onClick={() => seek(player.position - 1)}><SkipBack size={16}/>{lang === 'zh' ? '上一步' : 'Back'}</button>
        <button type="button" disabled={last} onClick={() => seek(player.position + 1)}>{lang === 'zh' ? '下一步' : 'Next'}<SkipForward size={16}/></button>
        <button type="button" onClick={() => seek(0)}><RotateCcw size={16}/>{lang === 'zh' ? '重設' : 'Reset'}</button>
        <label>{lang === 'zh' ? '每步' : 'Each step'} <select value={delay} onChange={event => setDelay(Number(event.target.value))}><option value={4500}>{lang === 'zh' ? '4.5 秒' : '4.5 sec'}</option><option value={8000}>{lang === 'zh' ? '8 秒 · 慢讀' : '8 sec · slow'}</option></select></label>
      </div>
    </div>
    <ol className="mcp-timeline" aria-label={lang === 'zh' ? '完整情境流程' : 'Complete scenario workflow'}>
      {scenario.path.map((id, i) => <li key={`${id}-${i}`} data-state={i === player.position ? 'active' : i < player.position ? 'visited' : 'waiting'}><button type="button" onClick={() => seek(i)} aria-current={i === player.position ? 'step' : undefined}><span>{i < player.position ? <Check size={14}/> : i + 1}</span>{pick(mcpStorySteps[id].title, lang)}{mcpStorySteps[id].channel === 'mcp' && <small>MCP</small>}</button></li>)}
    </ol>
    <p className="mcp-caption">{lang === 'zh' ? '播放時間只是教學節奏，並非真實延遲。尊重系統「減少動態效果」設定；沒有自動開始播放。' : 'Playback timing is for teaching, not measured latency. Motion respects your system’s reduced-motion preference. Playback starts only when you choose it.'}</p>
  </section>;
}

export default function FinanceMcpContent({ lang }: { lang: Lang }) {
  const [branch, setBranch] = useState(1);
  const [example, setExample] = useState(0);
  const [quiz, setQuiz] = useState<number | null>(null);
  const selected = mcpMindmap[branch] ?? mcpMindmap[0];
  const selectedExample = mcpExamples[example] ?? mcpExamples[0];
  return <main className="utility-page finance-page mcp-page">
    <Link className="fr-inline-link" href="/finance-project"><ArrowLeft size={15}/>{lang === 'zh' ? '返回股票研究項目' : 'Back to the stock research project'}</Link>
    <header className="mcp-hero">
      <div><p className="eyebrow">MCP · A VISUAL FIRST LESSON</p><h1>{lang === 'zh' ? <>MCP 到底<br/>幫你做啲咩？</> : <>What does MCP<br/>actually do?</>}</h1><p>{pick(mcpIntroduction, lang)}</p><a className="primary-action" href="#mcp-animation"><Play size={18}/>{lang === 'zh' ? '睇動畫解說' : 'Watch the explanation'}</a></div>
      <div className="mcp-hero-sketch" aria-label={lang === 'zh' ? '研究 app 透過 MCP 連接 n8n' : 'Research app connects to n8n through MCP'}>
        <span className="mcp-sketch-caption">{lang === 'zh' ? '你的項目，一句講晒' : 'YOUR PROJECT, IN ONE EXCHANGE'}</span>
        <div><strong>{lang === 'zh' ? '研究 app' : 'Research app'}</strong><p>{lang === 'zh' ? '「幫我刷新 MSFT 新聞。」' : '“Refresh the MSFT news.”'}</p><small>HOST + MCP CLIENT</small></div>
        <span className="mcp-plug"><Plug size={24}/> MCP <span aria-hidden="true">↓ ↑</span></span>
        <div><strong>n8n</strong><p>{lang === 'zh' ? '「流程完成，這是證據快照。」' : '“Workflow complete. Here is the snapshot.”'}</p><small>MCP SERVER + WORKFLOW</small></div>
      </div>
    </header>
    <div className="fr-disclosure"><BookOpen size={21} aria-hidden="true"/><p>{lang === 'zh' ? '這是已加入項目的互動教材。動畫、新聞及回傳資料均為虛構；未連接真實 n8n、向量資料庫或 LLM。下面的設定步驟是日後實作指南。' : 'This is an interactive lesson added to the project. Animation, news and returned data are fictional. No live n8n, vector database or LLM is connected. The setup steps below guide a future implementation.'}</p></div>
    <nav className="finance-section-links" aria-label={lang === 'zh' ? 'MCP 教材目錄' : 'MCP lesson contents'}><a href="#mcp-mindmap">{lang === 'zh' ? '心智圖及種類' : 'Mind map & types'}</a><a href="#mcp-animation">{lang === 'zh' ? '動畫流程' : 'Animated workflow'}</a><a href="#mcp-examples">{lang === 'zh' ? '三種例子' : 'Three examples'}</a><a href="#mcp-setup">{lang === 'zh' ? 'n8n 點接線' : 'Connect n8n'}</a><a href="#mcp-check">{lang === 'zh' ? '試下理解咗未' : 'Check your understanding'}</a></nav>

    <section className="finance-section" id="mcp-mindmap">
      <p className="eyebrow">01 · THE MIND MAP</p><h2>{lang === 'zh' ? '有幾多種？先分清楚分類方式' : 'How many types? It depends what you are counting.'}</h2>
      <p>{lang === 'zh' ? 'MCP 是一套協定。「角色」、「提供的功能」及「傳輸方法」是三個不同角度。點選分支睇例子。' : 'MCP is one protocol. Roles, capabilities and transports answer different questions. Select a branch to explore it.'}</p>
      <div className="mcp-mindmap"><div className="mcp-map-root"><Plug size={22}/><strong>Model Context Protocol</strong><span>{lang === 'zh' ? '讓 app 與工具講同一種語言' : 'A shared language for apps and tools'}</span></div>
        <div className="mcp-map-branches" role="group" aria-label={lang === 'zh' ? '心智圖分支' : 'Mind map branches'}>{mcpMindmap.map((item, i) => <button type="button" key={item.id} onClick={() => setBranch(i)} aria-pressed={branch === i} aria-controls="mcp-map-detail"><span className="mcp-count">{item.count}</span><strong>{pick(item.title, lang)}</strong><span>{pick(item.summary, lang)}</span><span className="mcp-leaves">{item.leaves.map(leaf => <small key={leaf}>{leaf}</small>)}</span></button>)}</div>
      </div>
      <div className="mcp-map-detail" id="mcp-map-detail" aria-live="polite"><h3>{pick(selected.title, lang)}</h3><p>{pick(selected.detail, lang)}</p></div>
      <p className="mcp-caption">{lang === 'zh' ? '以上是核心入門分類，並非全部選用功能或擴充的數目。每個 server 支援甚麼，須讀取它宣告的 capabilities。' : 'These are the core beginner categories, not a count of every optional feature or extension. Check each server’s advertised capabilities.'}</p>
    </section>

    <McpAnimation lang={lang}/>

    <section className="finance-section" id="mcp-responsibilities"><p className="eyebrow">03 · WHO DOES WHICH JOB?</p><h2>{lang === 'zh' ? 'MCP、RAG 同 LangGraph 點分？' : 'Where do MCP, RAG and LangGraph fit?'}</h2>
      <div className="mcp-ownership">{mcpOwnership.map(item => <div key={item.name}><strong>{item.name}</strong><p>{pick(item.job, lang)}</p></div>)}</div>
      <p>{lang === 'zh' ? 'RAG 是「先檢索證據，再把證據交給模型生成答案」的做法。MCP 可以接駁檢索工具，但此設計先用 MCP 叫 n8n 刷新新聞，之後的檢索及重排由 Python app 用資料庫／模型 API 處理。' : 'RAG means retrieving evidence and supplying it to the model before generation. MCP can expose a retrieval tool, but this design first uses MCP to refresh news through n8n. The Python app then uses database/model APIs for retrieval and reranking.'}</p>
      <p>{lang === 'zh' ? '向量搜尋不是文字 grep：它比較語意相似度；稀疏搜尋比較字詞。向量／混合索引仍須在凍結測試集超越稀疏基線的指定差距才可採用。' : 'Vector search compares meaning; text grep matches text patterns and sparse search ranks word matches. The hybrid index still must beat the sparse baseline by the written margin on the frozen evaluation set.'}</p>
      <Link className="fr-inline-link" href="/finance-project#finance-langgraph-map">{lang === 'zh' ? '再深入：11 種 LangGraph 情境及 Python 接線' : 'Go deeper: 11 LangGraph scenarios and Python wiring'} <ArrowRight size={16}/></Link>
    </section>

    <section className="finance-section" id="mcp-examples"><p className="eyebrow">04 · REQUEST → RESULT</p><h2>{lang === 'zh' ? '用三個短例子分清楚' : 'Three small examples make the difference clear.'}</h2>
      <div className="mcp-choice-row" role="group" aria-label={lang === 'zh' ? 'MCP 功能例子' : 'MCP capability examples'}>{mcpExamples.map((item, i) => <button type="button" key={item.id} aria-pressed={example === i} onClick={() => setExample(i)}>{pick(item.title, lang)}</button>)}</div>
      <div className="mcp-example" aria-live="polite"><h3>{pick(selectedExample.title, lang)}</h3><p>{pick(selectedExample.purpose, lang)}</p><div className="mcp-code-pair"><div><h4>{lang === 'zh' ? '要求 · 方法及參數片段' : 'Request · method / argument fragment'}</h4><pre><code>{JSON.stringify(selectedExample.request, null, 2)}</code></pre></div><div><h4>{lang === 'zh' ? '回傳 · 簡化業務資料' : 'Result · simplified domain data'}</h4><pre><code>{JSON.stringify(selectedExample.result, null, 2)}</code></pre></div></div><p>{pick(selectedExample.note, lang)}</p></div>
      <details className="mcp-details"><summary>{lang === 'zh' ? '工具點知道接受咩參數？睇 inputSchema' : 'How does a tool specify its arguments? Inspect inputSchema'}</summary><p>{lang === 'zh' ? 'tools/list 回傳的工具定義會帶 schema。Client 及 server 應驗證參數；公司／時間權限仍須程式執行。列出工具本身不會刷新新聞。' : 'tools/list includes a schema in each tool definition. Client and server validate arguments; code still enforces company/time permissions. Listing tools does not refresh news.'}</p><pre><code>{JSON.stringify(mcpToolDefinition, null, 2)}</code></pre></details>
      <details className="mcp-details"><summary>{lang === 'zh' ? '版本細節：點解有啲教學先叫 initialize？' : 'Version detail: why do some tutorials start with initialize?'}</summary><p>{pick(mcpVersionNote, lang)}</p><a href={mcpReferences[3].url} target="_blank" rel="noreferrer">{lang === 'zh' ? '官方版本相容說明' : 'Official version compatibility guide'} ↗</a></details>
    </section>

    <section className="finance-section" id="mcp-setup"><p className="eyebrow">05 · APPLY IT TO THIS PROJECT</p><h2>{lang === 'zh' ? '實際點樣連接 n8n？' : 'How would you connect n8n?'}</h2>
      <div className="mcp-direction"><div><span>{lang === 'zh' ? '此項目使用的方向' : 'DIRECTION USED IN THIS DESIGN'}</span><strong>Research app → n8n</strong><p>MCP client → MCP Server Trigger → Custom n8n Workflow Tool</p></div><div><span>{lang === 'zh' ? '另一種用途' : 'ANOTHER POSSIBLE DIRECTION'}</span><strong>n8n agent → external server</strong><p>{lang === 'zh' ? 'n8n 的 MCP Client Tool 讓 n8n 使用別人的工具；這是相反角色。' : 'The n8n MCP Client Tool lets an n8n agent use someone else’s tools. Here n8n takes the client role.'}</p></div></div>
      <ol className="mcp-setup-list">{mcpSetup.map((item, i) => <li key={item.en}><span>{i + 1}</span><p>{pick(item, lang)}</p></li>)}</ol>
      <p className="mcp-caption">{lang === 'zh' ? 'n8n Server Trigger 支援 Streamable HTTP 及舊 SSE，未支援 stdio。請複製 n8n 畫面上的 URL，不要假設固定路徑。供應商授權、使用限制及憑證仍由各服務處理。' : 'The n8n Server Trigger supports Streamable HTTP and legacy SSE, not stdio. Copy the URL shown by n8n rather than guessing its path. Provider permissions, usage limits and credentials remain service responsibilities.'}</p>
    </section>

    <section className="finance-section mcp-quiz" id="mcp-check"><p className="eyebrow">06 · ONE QUICK CHECK</p><h2>{lang === 'zh' ? 'MCP 工具成功回傳，但證據仍然不足。下一步係咩？' : 'The MCP call succeeded, but evidence is still insufficient. What next?'}</h2>
      <div className="mcp-quiz-answers">{(lang === 'zh' ? ['直接生成肯定的預測', '按上限再檢索一次；仍不足就說明缺口', '當成 MCP 服務故障'] : ['Generate a confident forecast', 'Use the one allowed refinement; if still thin, explain the gap', 'Treat it as an MCP service failure']).map((answer, i) => <button type="button" key={answer} aria-pressed={quiz === i} onClick={() => setQuiz(i)}>{answer}</button>)}</div>
      {quiz !== null && <p className="mcp-quiz-result" role="status">{quiz === 1 ? lang === 'zh' ? '答啱。工具執行成功 ≠ 證據足夠。LangGraph 的證據檢查決定繼續或停止。' : 'Correct. Successful tool execution does not establish enough evidence. LangGraph’s evidence check decides whether to continue.' : lang === 'zh' ? '再諗下：MCP 只交回工具結果。成功傳訊不保證內容足夠；資料不足亦不等於連線故障。' : 'Try again: MCP returned the tool result. Delivery success does not guarantee sufficient content, and thin evidence is different from a connection failure.'}</p>}
    </section>
    <footer className="fr-references"><h2>{lang === 'zh' ? '帶走心智圖及例子' : 'Keep the mind map and examples'}</h2><a href="/downloads/stock-research-mcp-guide.md" download>{lang === 'zh' ? '下載雙語 MCP 指南 · 包含 Mermaid 心智圖及流程圖' : 'Download the bilingual MCP guide · includes Mermaid mind map and workflow'} ↓</a><p className="mcp-caption">{lang === 'zh' ? '技術參考於 2026 年 11 月 8 日核對。' : 'Technical references checked on 8 November 2026.'}</p><ul>{mcpReferences.map(ref => <li key={ref.url}><a href={ref.url} target="_blank" rel="noreferrer">{ref.title} ↗</a></li>)}</ul></footer>
  </main>;
}
