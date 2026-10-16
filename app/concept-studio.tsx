'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LayoutGroup, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight, Braces, Check, Database, FileJson, GitBranch, LockKeyhole, Pause, Play, RotateCcw, Search, ShieldCheck, SkipBack, SkipForward, SlidersHorizontal, X } from 'lucide-react';
import { type Lang } from '../lib/curriculum';
import { agentOutcome, evaluateThreshold, inspectModel, lookupOrder, retrieveDocuments, transformIntents, validationPoints, visualDocuments, visualOrders, type VisualLesson } from '../lib/junior-simulations';

const text = (lang: Lang, zh: string, en: string) => lang === 'zh' ? zh : en;
const pair = (zh: string, en: string) => ({ zh, en });
const concepts = [
  { id: 'python', icon: Braces, name: pair('資料變形', 'Transform'), title: pair('兩個寫法，如何變成同一個計數？', 'How do two spellings become one count?'), subtitle: pair('跟住一筆資料，由 JSON 文字到可以測試的結果。', 'Follow a record from JSON text to a result you can test.'), stages: [pair('輸入', 'Input'), pair('解析', 'Parse'), pair('驗證', 'Validate'), pair('標準化', 'Normalize'), pair('計數', 'Count')], options: [pair('有效資料', 'Valid records'), pair('錯誤型別', 'Wrong type'), pair('損壞 JSON', 'Broken JSON')] },
  { id: 'backend', icon: Database, name: pair('API 與權限', 'API access'), title: pair('知道訂單編號，就能讀取訂單嗎？', 'Does knowing an order ID grant access?'), subtitle: pair('改變身份或訂單，觀察同一個查詢如何得到不同結果。', 'Change the identity or order and watch the same query return a different result.'), stages: [pair('請求', 'Request'), pair('身份', 'Identity'), pair('資料合約', 'Contract'), pair('篩選', 'Query'), pair('回應', 'Response')], options: [pair('自己訂單', 'Own order'), pair('他人訂單', 'Other owner'), pair('沒有身份', 'No identity')] },
  { id: 'model', icon: ShieldCheck, name: pair('模型邊界', 'Model output'), title: pair('看似合理的回覆，能直接執行嗎？', 'Can a plausible response be executed?'), subtitle: pair('看回覆通過每一道檢查；格式正確仍然只是提案。', 'Watch the response cross each check. Correct structure still produces only a proposal.'), stages: [pair('回覆', 'Response'), pair('完成狀態', 'Completion'), pair('JSON', 'JSON'), pair('Schema', 'Schema'), pair('提案', 'Proposal')], options: [pair('有效提案', 'Valid proposal'), pair('模型拒絕', 'Refusal'), pair('損壞 JSON', 'Broken JSON'), pair('偽造批准', 'Forged approval')] },
  { id: 'retrieval', icon: Search, name: pair('檢索', 'Retrieval'), title: pair('先決定能看甚麼，再決定哪份最相關。', 'Filter access before ranking relevance.'), subtitle: pair('看文件離開候選集、按詞彙配對排序，再進入 top-k。', 'Watch documents leave the candidate pool, rank by tag matches, and enter the top-k results.'), stages: [pair('問題', 'Query'), pair('權限／版本', 'Scope'), pair('排序', 'Rank'), pair('Top-k', 'Top-k'), pair('衡量', 'Measure')], options: [pair('退款 + 送貨', 'Refund + delivery'), pair('中文退款', 'Chinese refund'), pair('沒有答案', 'No match')] },
  { id: 'evaluation', icon: SlidersHorizontal, name: pair('評估', 'Evaluation'), title: pair('門檻移動，哪一種錯誤會增加？', 'Move the threshold. Which errors change?'), subtitle: pair('四個固定驗證樣本。圓點是真實正例，方塊是真實負例。', 'Four fixed validation cases. Circles are actual positives; squares are actual negatives.'), stages: [pair('樣本', 'Cases'), pair('分數', 'Scores'), pair('門檻', 'Threshold'), pair('分類', 'Classify'), pair('指標', 'Metrics')], options: [pair('門檻 0.50', 'Threshold 0.50'), pair('門檻 0.30', 'Threshold 0.30'), pair('門檻 0.80', 'Threshold 0.80'), pair('自訂門檻', 'Custom threshold')] },
  { id: 'agent', icon: GitBranch, name: pair('Agent 流程', 'Agent flow'), title: pair('Agent 可以提議；誰可以批准？', 'An agent can propose. Who can approve?'), subtitle: pair('親手批准模擬操作，再重送同一個請求，觀察寫入次數。', 'Approve a simulated action, then replay the same request and watch the write count.'), stages: [pair('提議', 'Propose'), pair('權限檢查', 'Policy'), pair('等待批准', 'Approval'), pair('查重', 'Replay key'), pair('結果', 'Result')], options: [pair('正常提案', 'Normal proposal'), pair('偽造批准', 'Forged approval'), pair('禁止工具', 'Forbidden tool')] },
] as const;

function Panel({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <div className={`studio-panel ${className}`}><h4>{label}</h4>{children}</div>;
}

function Result({ label, value, detail, tone = 'neutral' }: { label: string; value: string; detail: string; tone?: string }) {
  return <motion.div className={`studio-result ${tone}`} layout>
    <small>{label}</small><motion.strong key={value} initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }}>{value}</motion.strong><span>{detail}</span>
  </motion.div>;
}

function PythonScene({ lang, step, scenario }: { lang: Lang; step: number; scenario: number }) {
  const raw = scenario === 2 ? '[{"intent":"Refund"},' : scenario === 1 ? '[{"intent":"Refund"},{"intent":3}]' : '[{"intent":"Refund"},{"intent":" refund "}]';
  const result = transformIntents(raw);
  const failed = result.failure !== null && step >= result.failure;
  return <div className="studio-three">
    <Panel label={text(lang, '01 · 傳入文字', '01 · Incoming text')}><FileJson size={27}/><code className="studio-raw">{raw}</code><span className="studio-tag">JSON → Python</span></Panel>
    <Panel label={text(lang, '02 · 資料工作台', '02 · Record workbench')}>
      <div className="studio-tickets">{[0, 1].map(index => <motion.div key={index} className={`studio-ticket ${failed && (scenario === 2 || index === 1) ? 'bad' : ''}`} animate={{ opacity: step >= 1 ? 1 : .4, x: step >= 3 ? 9 : 0, scale: step >= 3 ? .95 : 1 }}>
        <small>{`row ${index}`}</small><motion.code key={`${step >= 3}-${scenario}-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{scenario === 2 ? '…' : index === 1 && scenario === 1 ? '3  (int)' : step >= 3 ? '"refund"' : index === 0 ? '"Refund"' : '" refund "'}</motion.code>
        {step >= 2 && <span>{failed && index === 1 ? <X size={16}/> : <Check size={16}/>}</span>}
      </motion.div>)}</div>
      <code className="studio-operation">{step >= 3 ? '.strip().lower()' : step >= 2 ? 'isinstance(intent, str)' : 'json.loads(raw)'}</code>
    </Panel>
    <Panel label={text(lang, '03 · 函式結果', '03 · Function result')}>
      <div className="studio-count"><div><motion.i animate={{ height: step === 4 ? '100%' : '4%' }}/></div><motion.strong key={step === 4 ? 2 : 0} initial={{ scale: .8 }} animate={{ scale: 1 }}>{step === 4 ? result.counts.refund : '—'}</motion.strong><span>refund</span></div>
      <Result label={text(lang, '結果', 'Outcome')} value={failed ? result.error : step === 4 ? '{"refund": 2}' : '…'} detail={failed ? text(lang, '先修正輸入，沒有回傳部分計數。', 'Fix the input. No partial counts are returned.') : text(lang, '相同意圖合併成同一個 key。', 'Equivalent intents share one key.')} tone={failed ? 'bad' : step === 4 ? 'good' : 'neutral'}/>
    </Panel>
  </div>;
}

function BackendScene({ lang, step, scenario }: { lang: Lang; step: number; scenario: number }) {
  const orderId = scenario === 1 ? 'HK-2' : 'HK-1';
  const user = scenario === 2 ? null : 'alice';
  const result = lookupOrder(orderId, user);
  const finished = step >= (result.stoppedAt === 1 ? 1 : 4);
  return <div className="studio-three">
    <Panel label={text(lang, '請求與可信身份', 'Request + trusted identity')}>
      <div className={`studio-identity ${!user && step >= 1 ? 'bad' : ''}`}><ShieldCheck size={26}/><strong>{user ?? 'anonymous'}</strong><small>{text(lang, '身份來自伺服器驗證', 'Identity from server verification')}</small></div>
      <code className="studio-raw">{`{"order_id":"${orderId}"}`}</code>
      <span className="studio-tag">{text(lang, 'Body 不能指定 owner', 'Body cannot choose the owner')}</span>
    </Panel>
    <Panel label={text(lang, '參數化 SQL · 兩個條件都要成立', 'Parameterized SQL · both conditions required')}>
      <div className="studio-query"><code>id = <b>{step >= 3 ? orderId : '?'}</b></code><span>AND</span><code>owner = <b>{step >= 3 ? user : '?'}</b></code></div>
      <div className="studio-db">{visualOrders.map(order => <motion.div key={order.id} animate={{ opacity: step >= 3 && result.row?.id !== order.id ? .45 : 1, x: step >= 3 && result.row?.id === order.id ? 8 : 0 }} className={step >= 3 && result.row?.id === order.id ? 'selected' : ''}><Database size={17}/><b>{order.id}</b><span>{order.owner}</span>{step >= 3 && (result.row?.id === order.id ? <Check size={17}/> : <LockKeyhole size={17}/>)}</motion.div>)}</div>
    </Panel>
    <Panel label={text(lang, '只回傳容許的結果', 'Return only allowed data')}>
      <div className="studio-orb"><motion.div animate={{ scale: finished ? 1.08 : .9 }}><ShieldCheck size={42}/></motion.div></div>
      <Result label="HTTP" value={finished ? String(result.status) : '…'} detail={finished ? result.row ? `${result.row.id} · ${result.row.status}` : result.status === 401 ? 'unauthenticated' : 'not_found' : text(lang, '等候合約與權限檢查', 'Waiting for contract and access checks')} tone={finished ? result.status === 200 ? 'good' : 'bad' : 'neutral'}/>
    </Panel>
  </div>;
}

function ModelScene({ lang, step, scenario }: { lang: Lang; step: number; scenario: number }) {
  const result = inspectModel(['valid', 'refusal', 'broken', 'extra'][scenario]);
  const failed = result.failure !== null && step >= result.failure;
  return <div className="studio-model-layout">
    <Panel label={text(lang, '不可信的模型回覆', 'Untrusted model response')}><Braces size={27}/><code className="studio-raw">{result.raw}</code><small>{text(lang, '模擬資料；沒有呼叫模型', 'Fixture only; no model is called')}</small></Panel>
    <div className="studio-gates">{[pair('完成且無拒絕', 'Complete, no refusal'), pair('可解析 JSON', 'Parseable JSON'), pair('只接受指定欄位', 'Allowed fields only')].map((label, index) => {
      const n = index + 1;
      const denied = result.failure === n && step >= n;
      const passed = step >= n && (!result.failure || result.failure > n);
      return <motion.div key={index} className={`studio-gate ${denied ? 'bad' : passed ? 'good' : ''}`} animate={{ scale: step === n ? 1.04 : 1 }}><span>{denied ? <X/> : passed ? <Check/> : <LockKeyhole/>}</span><b>{label[lang]}</b><small>{['finish_reason', 'json.loads', 'additionalProperties: false'][index]}</small></motion.div>;
    })}</div>
    <Result label={text(lang, '應用程式決定', 'Application decision')} value={failed ? 'handoff' : step === 4 ? 'proposal' : '…'} detail={failed ? text(lang, '不執行工具；交給明確的失敗處理。', 'No tool execution. Take the explicit failure path.') : text(lang, '格式通過 ≠ 事實正確 ≠ 已獲授權。', 'Valid shape ≠ factual correctness ≠ authorization.')} tone={failed ? 'bad' : step === 4 ? 'good' : 'neutral'}/>
  </div>;
}

function RetrievalScene({ lang, step, scenario, k }: { lang: Lang; step: number; scenario: number; k: number }) {
  const query = ['refund and delivery', '點樣退款？', 'What is the weather?'][scenario];
  const ranked = retrieveDocuments(query, 2);
  const found = retrieveDocuments(query, k);
  const relevant = scenario === 0 ? ['returns-v2', 'delivery-v1'] : scenario === 1 ? ['returns-v2'] : [];
  const recall = relevant.length ? found.filter(doc => relevant.includes(doc.id)).length / relevant.length : null;
  const visible = step >= 2 ? ranked : step >= 1 ? visualDocuments.filter(doc => doc.tenant === 'shop-a' && doc.active) : visualDocuments;
  return <div className="studio-retrieval">
    <div className="studio-search"><Search size={21}/><strong>{query}</strong><span>shop-a</span></div>
    <div className="studio-retrieval-columns">
      <Panel label={text(lang, '候選文件 → 篩選 → 排序', 'Candidates → filter → rank')}>
        <div className="studio-docs">{visible.map((doc, index) => <motion.div layout layoutId={`doc-${doc.id}`} key={doc.id} className={`studio-doc ${step >= 3 && found.some(d => d.id === doc.id) ? 'selected' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <FileJson size={22}/><div><b>{doc.title[lang]}</b><small>{doc.id} · {doc.tenant}</small></div><span>{step >= 2 ? `#${index + 1} · ${'score' in doc ? doc.score : 0}` : doc.active ? 'v ✓' : 'v ✕'}</span>
        </motion.div>)}</div>
        {step >= 1 && <div className="studio-excluded"><LockKeyhole size={16}/>{text(lang, '已排除：過期版本 + 其他商戶；不參與評分。', 'Excluded: old version + other tenant. Neither is scored.')}</div>}
        {step >= 2 && visible.length === 0 && <div className="studio-empty"><Search size={30}/>{text(lang, '沒有配對詞彙', 'No matching tags')}</div>}
      </Panel>
      <Panel label={text(lang, '取回的證據', 'Retrieved evidence')}>
        <div className="studio-evidence">{step >= 3 && found.map(doc => <motion.div key={doc.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}><Check size={18}/><b>{doc.id}</b></motion.div>)}{(step < 3 || !found.length) && <span>{step < 3 ? text(lang, '等候篩選與排序', 'Waiting for filtering and ranking') : text(lang, '沒有證據 → 不作答', 'No evidence → abstain')}</span>}</div>
        <Result label={`Recall@${k}`} value={step === 4 ? recall === null ? 'N/A' : `${Math.round(recall * 100)}%` : '…'} detail={recall === null ? text(lang, '沒有相關文件的案例，獨立檢查棄答。', 'No relevant documents: evaluate abstention separately.') : text(lang, `取回 ${found.length} / ${relevant.length} 份已標記相關文件。`, `Retrieved ${found.length} / ${relevant.length} labeled relevant documents.`)} tone={step === 4 && recall === 1 ? 'good' : 'neutral'}/>
      </Panel>
    </div>
  </div>;
}

function EvaluationScene({ lang, step, threshold }: { lang: Lang; step: number; threshold: number }) {
  const result = evaluateThreshold(threshold);
  const names = { tp: pair('TP · 找對正例', 'TP · Correct positive'), fp: pair('FP · 誤報', 'FP · False alarm'), fn: pair('FN · 漏報', 'FN · Missed positive'), tn: pair('TN · 找對負例', 'TN · Correct negative') };
  const dot = (id: string) => <motion.span layoutId={`sample-${id}`} key={id} className={`studio-sample ${['A', 'B'].includes(id) ? 'positive' : 'negative'}`}>{id}</motion.span>;
  return <div className="studio-evaluation">
    <div className="studio-axis-label"><span>{text(lang, '預測為負例', 'Predict negative')}</span><b>score ≥ {threshold.toFixed(2)}</b><span>{text(lang, '預測為正例', 'Predict positive')}</span></div>
    <div className="studio-score-axis">
      <motion.div className="studio-positive-zone" animate={{ left: `${threshold * 100}%` }}/>
      <motion.div className="studio-threshold" animate={{ left: `${threshold * 100}%` }}><span>{threshold.toFixed(2)}</span></motion.div>
      {validationPoints.map((point, index) => <div key={point.id} className="studio-score-point" style={{ left: `${step === 0 ? 17 + index * 22 : point.score * 100}%` }}>{step < 3 ? dot(point.id) : <span className="studio-dot-origin"/>}<small>{point.score.toFixed(1)}</small></div>)}
      <span className="studio-axis-zero">0</span><span className="studio-axis-one">1</span>
    </div>
    <div className="studio-confusion">{(['tp', 'fp', 'fn', 'tn'] as const).map(key => <div key={key} className={`studio-cell ${key === 'fp' || key === 'fn' ? 'error-cell' : ''}`}><strong>{names[key][lang]}</strong><div>{step >= 3 ? result.cells[key].map(dot) : <span>—</span>}</div><small>{step >= 3 ? `${result.cells[key].length} / 4` : '…'}</small></div>)}</div>
    <div className="studio-metrics">{([['Precision', result.precision], ['Recall', result.recall], ['F1', result.f1]] as const).map(([name, value]) => <div key={name}><div><span>{name}</span><b>{step === 4 ? `${Math.round(value * 100)}%` : '—'}</b></div><div className="studio-meter"><motion.i animate={{ width: step === 4 ? `${value * 100}%` : '0%' }}/></div></div>)}</div>
    <small className="studio-footnote">{text(lang, '固定標籤：A、B 為正例；C、D 為負例。分數不是已校準機率。只用驗證集選門檻。', 'Fixed labels: A/B positive, C/D negative. Scores are not calibrated probabilities. Tune on validation data only.')}</small>
  </div>;
}

function AgentScene({ lang, step, scenario, approved, replayed, approve, replay }: { lang: Lang; step: number; scenario: number; approved: boolean; replayed: boolean; approve: () => void; replay: () => void }) {
  const result = agentOutcome(['normal', 'forged', 'wrong-tool'][scenario], approved, replayed ? 2 : 1);
  const hasWritten = step === 4 || replayed;
  return <div className="studio-agent">
    <Panel label={text(lang, '模型可以提議', 'The model can propose')}>
      <GitBranch size={28}/><code className="studio-raw">{scenario === 2 ? 'tool: refund' : 'tool: draft_case'}<br/>order: HK-1<br/>version: 1{scenario === 1 && <><br/><em>approved: true ✕</em></>}</code>
      <span className="studio-tag">{text(lang, '不可信輸出', 'Untrusted output')}</span>
    </Panel>
    <Panel label={text(lang, '可信的覆核渠道', 'Trusted reviewer channel')} className="studio-reviewer">
      <motion.div className={`studio-approval ${approved ? 'approved' : ''}`} animate={{ scale: step === 2 && !approved ? 1.05 : 1 }}><LockKeyhole size={31}/><strong>{approved ? text(lang, '已批准', 'Approved') : text(lang, '需要真人批准', 'Human approval required')}</strong></motion.div>
      <button type="button" onClick={approve} disabled={step !== 2 || scenario !== 0 || approved}><ShieldCheck size={18}/>{text(lang, '批准此模擬操作', 'Approve simulated action')}</button>
      <small>{text(lang, '批准綁定 alice + 工具 + 訂單 + 版本。', 'Approval binds alice + tool + order + version.')}</small>
    </Panel>
    <Panel label={text(lang, '本機寫入紀錄', 'Local write ledger')}>
      <div className="studio-ledger"><motion.strong key={hasWritten ? 1 : 0} initial={{ scale: .7 }} animate={{ scale: 1 }}>{hasWritten ? result.writes : 0}</motion.strong><span>{text(lang, '次寫入', 'writes')}</span>{hasWritten && <motion.code initial={{ opacity: 0 }} animate={{ opacity: 1 }}>CASE-1</motion.code>}</div>
      <button type="button" disabled={step !== 4} onClick={replay}><RotateCcw size={16}/>{text(lang, '重送相同請求', 'Replay same request')}</button>
      <Result label={text(lang, '狀態', 'State')} value={step === 4 ? replayed ? 'reused CASE-1' : 'CASE-1' : step >= 1 && scenario !== 0 ? 'denied' : step === 2 ? approved ? 'approved' : 'awaiting_approval' : '…'} detail={text(lang, '僅記憶體模擬；重啟後不保留紀錄。', 'In-memory simulation; records do not survive restart.')} tone={step === 4 ? 'good' : scenario !== 0 && step >= 1 ? 'bad' : 'neutral'}/>
    </Panel>
  </div>;
}

function caption(id: VisualLesson, step: number, scenario: number, lang: Lang, approved: boolean) {
  const regular: Record<VisualLesson, ReturnType<typeof pair>[]> = {
    python: [pair('先看原始文字。兩個 intent 的大小寫及空格不同。', 'Start with raw text. The two intents differ in case and whitespace.'), pair('解析只把 JSON 變成資料結構，還未證明每個欄位可用。', 'Parsing creates data structures. It does not establish that each field is usable.'), pair('逐筆檢查：必須是非空字串。拒絕錯誤型別，避免把 3 當作意圖。', 'Check every record for a nonempty string. Reject wrong types instead of treating 3 as an intent.'), pair('去掉首尾空格，再把英文字母轉成小寫。兩筆資料現在相同。', 'Trim whitespace and lowercase English letters. Both values now match.'), pair('相同 key 累加兩次，refund 的計數是 2。', 'Increment the same key twice. The refund count is 2.')],
    backend: [pair('客戶端只提供 order_id；alice 的身份由伺服器驗證。', 'The client supplies order_id. The server verifies alice’s identity.'), pair('先取得可信身份。沒有身份就回 401，不進入查詢。', 'Require a trusted identity. Without it, return 401 before querying.'), pair('檢查 JSON 欄位與型別。這個示例只接受 order_id。', 'Check the JSON fields and types. This example accepts only order_id.'), pair('id 和 owner 條件同時套用。參數化避免把輸入當成 SQL 指令。', 'Apply id and owner together. Parameters keep input separate from SQL instructions.'), pair('只回傳已獲授權的資料。找不到或不屬於你，都回 404。', 'Return only authorized data. Missing and other-owner orders both return 404.')],
    model: [pair('這是模型輸出，不能當成可信指令。先預測哪一關會截停它。', 'This is model output, not a trusted instruction. Predict which gate will stop it.'), pair('完成狀態與拒絕訊號先檢查，截斷或拒絕不當作成功。', 'Check completion and refusal first. Truncation or refusal is not success.'), pair('解析 JSON。語法錯誤必須走明確的失敗分支。', 'Parse JSON. Invalid syntax takes an explicit failure path.'), pair('檢查必填欄位、型別及額外欄位。模型不能加入 approved。', 'Check required fields, types and extras. The model cannot add approved.'), pair('輸出只是提案。訂單存在、所有權及執行權限還要由主程式檢查。', 'The result is a proposal. The host still checks existence, ownership and permission to act.')],
    retrieval: [pair('這是詞彙／標籤基準，不是 embedding。先看四份合成文件。', 'This is a lexical/tag baseline, not embeddings. Start with four synthetic documents.'), pair('先排除其他商戶和過期版本。相似度不能授予存取權。', 'Remove other-tenant and outdated documents first. Similarity cannot grant access.'), pair('只評分有權讀取的文件。數字是配對詞彙數，同分按 ID 排序。', 'Score only allowed documents. Numbers count tag matches; ties sort by ID.'), pair('Top-k 是最多取回幾份。沒有配對也不會硬湊結果。', 'Top-k limits result count. No matches means no forced results.'), pair('改變 k，比較取回數／已標記相關數。高 Recall 不代表答案正確。', 'Change k and compare retrieved versus labeled relevant documents. High recall does not prove answer correctness.')],
    evaluation: [pair('A、B 的真實標籤為正；C、D 為負。先固定資料，才比較門檻。', 'A/B have positive labels; C/D negative. Fix the data before comparing thresholds.'), pair('將每個樣本放在分數軸上。分數高低與真實標籤不是同一件事。', 'Place each case on the score axis. A score and a ground-truth label are different things.'), pair('分數大於或等於門檻才預測為正。門檻越低，判為正的案例越多。', 'Predict positive when score ≥ threshold. A lower threshold flags more cases.'), pair('圓點與方塊移入四格：找對、誤報、漏報、正確排除。', 'Move the circles and squares into four cells: hits, false alarms, misses and correct negatives.'), pair('拖動門檻，觀察 Precision、Recall、F1 改變。先決定誤報與漏報成本。', 'Drag the threshold to change precision, recall and F1. Decide the costs of false alarms and misses first.')],
    agent: [pair('模型提出 draft_case，不直接執行。所有資料均為本機模擬。', 'The model proposes draft_case without executing it. All data is simulated locally.'), pair('主程式檢查工具、所有權與版本；模型寫 approved 不會得到批准。', 'The host checks tool, ownership and version. A model-written approved field grants nothing.'), pair('流程在這裡停下。由你按可信覆核按鈕，批准這一個具體操作。', 'The flow pauses here. Use the trusted reviewer button to approve this specific action.'), pair('批准後仍先檢查操作 key，重複請求沿用既有結果。', 'After approval, check the action key. Duplicate requests reuse an existing result.'), pair('重送同一個請求：結果仍是 CASE-1，寫入次數維持 1。', 'Replay the same request: the result remains CASE-1 and the write count stays at 1.')],
  };
  if (id === 'python' && scenario === 2 && step >= 1) return text(lang, 'JSON 語法已損壞，在解析時停止；後續驗證與計數不會執行。', 'Broken JSON stops at parsing. Validation and counting never run.');
  if (id === 'python' && scenario === 1 && step >= 2) return text(lang, '第二筆 intent 是數字。ValueError 截停函式，不回傳部分結果。', 'The second intent is a number. ValueError stops the function without a partial result.');
  if (id === 'backend' && scenario === 2 && step >= 1) return text(lang, '沒有可信身份 → 401。資料庫完全沒有被查詢。', 'No trusted identity → 401. The database is never queried.');
  if (id === 'model' && scenario > 0 && step >= [4, 1, 2, 3][scenario]) return text(lang, '檢查失敗 → handoff。不會把未通過的回覆送去執行工具。', 'Check failed → handoff. Rejected output never reaches tool execution.');
  if (id === 'agent' && scenario > 0 && step >= 1) return text(lang, '主程式拒絕提案，寫入維持 0；真人批准也不能繞過工具合約。', 'The host denies the proposal. Writes remain 0; human approval cannot bypass the tool contract.');
  if (id === 'agent' && approved && step === 2) return text(lang, '這個操作已經獲批准。下一步檢查是否已處理過相同操作。', 'This action is approved. Next, check whether the same action has already been handled.');
  return regular[id][step][lang];
}

function SimulationPlayer({ id, lang, stillFrames, onStillFrames }: { id: VisualLesson; lang: Lang; stillFrames: boolean; onStillFrames: (value: boolean) => void }) {
  const concept = concepts.find(item => item.id === id)!;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [scenario, setScenario] = useState(0);
  const [threshold, setThreshold] = useState(.5);
  const [k, setK] = useState(1);
  const [approved, setApproved] = useState(false);
  const [replayed, setReplayed] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const reduced = stillFrames || Boolean(prefersReducedMotion);
  const root = useRef<HTMLDivElement>(null);
  const terminal = id === 'python' ? [4, 2, 1][scenario] : id === 'backend' && scenario === 2 ? 1 : id === 'model' ? [4, 1, 2, 3][scenario] : id === 'agent' ? scenario > 0 ? 1 : approved ? 4 : 2 : 4;
  const running = playing && step < terminal;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setStep(current => Math.min(current + 1, terminal)), 2200);
    return () => window.clearTimeout(timer);
  }, [running, step, terminal]);

  useEffect(() => {
    const stopWhenHidden = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', stopWhenHidden);
    const observer = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) setPlaying(false); }, { threshold: .12 });
    if (root.current) observer.observe(root.current);
    return () => { document.removeEventListener('visibilitychange', stopWhenHidden); observer.disconnect(); };
  }, []);

  function reset() { setStep(0); setPlaying(false); setApproved(false); setReplayed(false); }
  function chooseCase(index: number) { reset(); setScenario(index); if (id === 'evaluation' && index < 3) setThreshold([.5, .3, .8][index]); }
  function play() {
    if (running) { setPlaying(false); return; }
    if (step === terminal) { reset(); setPlaying(true); } else setPlaying(true);
  }
  const description = caption(id, step, scenario, lang, approved);
  return <MotionConfig reducedMotion={reduced ? 'always' : 'never'} transition={{ duration: reduced ? 0 : .5, ease: 'easeInOut' }}>
    <div className={`studio-player ${reduced ? 'still-frames' : ''} ${running ? 'is-playing' : ''}`} ref={root}>
      <div className="studio-scene-heading"><div><h3>{concept.title[lang]}</h3><p>{concept.subtitle[lang]}</p></div><span className="studio-simulation-label">{text(lang, '互動模擬', 'INTERACTIVE SIMULATION')}</span></div>
      <div className="studio-case-controls"><label htmlFor={`case-${id}`}>{text(lang, '改變案例', 'Change the case')}<select id={`case-${id}`} value={scenario} onChange={event => chooseCase(Number(event.target.value))}>{concept.options.map((option, index) => <option value={index} key={index}>{option[lang]}</option>)}</select></label>
        {id === 'retrieval' && <label htmlFor="studio-k">Top-k <select id="studio-k" value={k} onChange={event => { setK(Number(event.target.value)); setStep(4); setPlaying(false); }}><option value={1}>1</option><option value={2}>2</option></select></label>}
        {id === 'evaluation' && <label htmlFor="studio-threshold" className="studio-slider">{text(lang, '判定門檻', 'Decision threshold')} <output>{threshold.toFixed(2)}</output><input id="studio-threshold" type="range" min="0.1" max="0.95" step="0.05" value={threshold} onChange={event => { setThreshold(Number(event.target.value)); setScenario(3); setStep(4); setPlaying(false); }}/></label>}
        <button className="studio-motion-toggle" type="button" aria-pressed={reduced} disabled={Boolean(prefersReducedMotion)} onClick={() => onStillFrames(!stillFrames)}>{text(lang, '減少動態', 'Reduce motion')}{reduced && <Check size={14}/>}</button>
      </div>
      <ol className="studio-flow" aria-label={text(lang, '動畫步驟', 'Animation steps')}>{concept.stages.map((label, index) => <li key={index} className={`${index === step ? 'current' : index < step ? 'complete' : ''} ${index > terminal ? 'unreachable' : ''}`}><button type="button" onClick={() => { setStep(index); setPlaying(false); }} disabled={index > terminal} aria-current={index === step ? 'step' : undefined}><span>{index < step ? <Check size={13}/> : String(index + 1).padStart(2, '0')}</span>{label[lang]}</button>{index < 4 && <i aria-hidden="true"><motion.b animate={{ scaleX: step > index ? 1 : 0 }}/><ArrowRight size={13}/></i>}</li>)}</ol>
      <div className="studio-player-controls"><div><button type="button" className="studio-play" onClick={play}>{running ? <Pause size={17}/> : <Play size={17}/>} {running ? text(lang, '暫停', 'Pause') : step === terminal ? text(lang, '重播', 'Replay') : text(lang, '播放', 'Play')}</button><button type="button" onClick={() => { setStep(Math.max(0, step - 1)); setPlaying(false); }} disabled={step === 0} aria-label={text(lang, '上一步', 'Previous step')}><SkipBack size={17}/></button><button type="button" onClick={() => { setStep(Math.min(terminal, step + 1)); setPlaying(false); }} disabled={step === terminal} aria-label={text(lang, '下一步', 'Next step')}><SkipForward size={17}/></button><button type="button" onClick={reset} aria-label={text(lang, '重設動畫', 'Reset animation')}><RotateCcw size={17}/></button></div><a href={`#${id}`}>{text(lang, '打開課堂與程式', 'Open lesson & code')}<ArrowDown size={15}/></a></div>
      <LayoutGroup id={`studio-${id}`}><div className="studio-canvas" aria-label={concept.name[lang]}>
        {id === 'python' && <PythonScene lang={lang} step={step} scenario={scenario}/>}
        {id === 'backend' && <BackendScene lang={lang} step={step} scenario={scenario}/>}
        {id === 'model' && <ModelScene lang={lang} step={step} scenario={scenario}/>}
        {id === 'retrieval' && <RetrievalScene lang={lang} step={step} scenario={scenario} k={k}/>}
        {id === 'evaluation' && <EvaluationScene lang={lang} step={step} threshold={threshold}/>}
        {id === 'agent' && <AgentScene lang={lang} step={step} scenario={scenario} approved={approved} replayed={replayed} approve={() => { setApproved(true); setStep(3); setPlaying(false); }} replay={() => { setReplayed(true); setStep(3); setPlaying(true); }}/>}</div></LayoutGroup>
      <div className="studio-caption" role="status" aria-live="polite" aria-atomic="true"><span>{String(step + 1).padStart(2, '0')}</span><p>{description}</p></div>
      <p className="studio-boundary">{text(lang, '合成資料 · 不會呼叫 API 或執行真實操作 · 動畫幫你理解，實作能力仍需程式與測試證明。', 'Synthetic data · No API calls or real actions · Use the animation to understand; demonstrate ability with code and tests.')}</p>
    </div>
  </MotionConfig>;
}

export default function ConceptStudio({ lang, selected, onSelect }: { lang: Lang; selected: VisualLesson; onSelect: (id: VisualLesson) => void }) {
  const [stillFrames, setStillFrames] = useState(false);
  return <section className="concept-studio" id="concept-studio" aria-labelledby="studio-title">
    <header className="studio-header"><div><p className="eyebrow">CONCEPTS IN MOTION</p><h2 id="studio-title">{text(lang, '看見概念如何運作', 'See the concept in motion')}</h2><p>{text(lang, '選一個概念，按播放，再改變案例。先預測結果，再看哪一步改變。', 'Pick a concept, press play, then change the case. Predict the outcome before watching it change.')}</p></div><span className="studio-count-label">06 <small>{text(lang, '視覺實驗', 'VISUAL LABS')}</small></span></header>
    <div className="studio-selector" role="group" aria-label={text(lang, '選擇動畫概念', 'Choose an animated concept')}>{concepts.map((concept, index) => <button key={concept.id} type="button" aria-pressed={selected === concept.id} onClick={() => onSelect(concept.id)}><concept.icon size={19}/><span>{concept.name[lang]}</span><small>{String(index + 1).padStart(2, '0')}</small></button>)}</div>
    <SimulationPlayer key={selected} id={selected} lang={lang} stillFrames={stillFrames} onStillFrames={setStillFrames}/>
  </section>;
}
