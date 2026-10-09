// Original teaching material. These exercises are not employer pass standards.
// Shared by the rich website and the dependency-free Node 18 edition.
const c = (zh, en) => ({ zh, en });
const daily = (titleZh, titleEn, storyZh, storyEn, connectionZh, connectionEn) => ({
  title: c(titleZh, titleEn), story: c(storyZh, storyEn), connection: c(connectionZh, connectionEn),
});

export const hiringVerifiedAt = '2026-10-09';
export const hiringSources = [
  { id: 'anthropic-applied', title: 'Applied AI Engineer, Startups', publisher: 'Anthropic', url: 'https://job-boards.greenhouse.io/anthropic/jobs/5432575008', verifiedAt: hiringVerifiedAt,
    note: c('此有經驗職位重視 Python、已交付的 LLM 系統、context engineering、agents、評估與技術溝通；用來理解能力方向，並非初級職位的最低要求。', 'This experienced role emphasizes Python, shipped LLM systems, context engineering, agents, evaluations, and technical communication. It informs competency priorities, not junior minimum requirements.') },
  { id: 'microsoft-production', title: 'Production Safety', publisher: 'Microsoft AI', url: 'https://job-boards.greenhouse.io/microsoftcorporation/jobs/4434528009', verifiedAt: hiringVerifiedAt,
    note: c('職位描述涵蓋可靠服務、CI/CD、分階段發佈與回滾、監察、延遲／成本，以及事故處理；全球規模與 Kubernetes 是此職位背景，不是所有初級職位的必備清單。', 'The role covers reliable services, CI/CD, staged releases and rollback, monitoring, latency/cost, and incident response. Global-scale operations and Kubernetes are role-specific, not a universal junior checklist.') },
  { id: 'microsoft-measurement', title: 'Safety Post-training', publisher: 'Microsoft AI', url: 'https://job-boards.greenhouse.io/microsoftcorporation/jobs/4430492009', verifiedAt: hiringVerifiedAt,
    note: c('職位重視資料品質、可重現評估、實驗設計、指標與生產回饋。模型訓練、RL 與進階統計屬專門方向；本課程先建立量度與實驗基礎。', 'The role emphasizes data quality, reproducible evaluations, experimental design, metrics, and production feedback. Model training, RL, and advanced statistics are specialist areas; this curriculum begins with measurement fundamentals.') },
];

export const hiringSkills = [
  {
    id: 'problem-framing', title: c('把業務問題變成可驗證的工程目標', 'Turn a business problem into a testable engineering goal'),
    explanation: c('先說清楚誰遇到甚麼問題、現在如何處理、錯誤有甚麼代價，再決定是否需要 AI。訂出輸入、輸出、成功指標、延遲／成本限制與人工接手條件，並建立不用 AI 的 baseline。強候選人能比較「規則已足夠」與「需要理解非結構化內容」，不會因為 agents 流行就增加複雜度。小型實驗要記錄假設與失敗，而不是只展示一次成功。', 'Identify the user, current workflow, and cost of mistakes before choosing AI. Define inputs, outputs, success metrics, latency/cost constraints, and human escalation. Build a non-AI baseline so complexity must earn its place. A strong candidate distinguishes a rule-based task from one requiring interpretation of unstructured information. Record hypotheses and failed cases; one impressive demo does not establish useful or reliable behavior.'),
    metaphorTitle: c('先知道要過哪條河，才揀橋', 'Choose the river crossing before choosing the bridge'),
    metaphor: c('若只要過一條小溪，踏石已足夠；先建大型吊橋可能更慢、更貴，也增加維修問題。需求決定工具，工具不應反過來製造需求。', 'Stepping stones may solve a small stream crossing. A suspension bridge can add cost and maintenance without benefit. The need should determine the tool, not the other way around.'),
    example: c('為支援團隊減少重複查詢：先量度常見 FAQ 的規則回覆，再測試檢索系統是否改善陌生表達。退款、帳戶修改等高風險要求仍交給有權限的人；目標是可量度的工作改善，不是把所有對話自動化。', 'Reduce repetitive support questions: first measure rule-based FAQ replies, then test whether retrieval helps with unfamiliar wording. Refunds and account changes remain with authorized humans. The goal is measurable workflow improvement, not automation of every conversation.'),
    language: 'JavaScript', codeTitle: c('教學片段：先寫一個可測 baseline（Node 18，.mjs）', 'Teaching fragment: a testable baseline (Node 18, .mjs)'),
    code: `import assert from 'node:assert/strict';
const route = text => /opening hours/i.test(text) ? 'faq' : 'human';
const cases = [
  ['What are your opening hours?', 'faq'],
  ['Refund my last order', 'human'],
];
for (const [input, expected] of cases) assert.equal(route(input), expected);
console.log('baseline: 2/2 checks passed');
// A toy router, not a complete support or authorization system.`,
    steps: [c('用一句話寫出使用者、痛點及錯誤後果。', 'Write one sentence naming the user, pain, and consequence of mistakes.'), c('列出非 AI baseline、量度方法與人工接手條件。', 'Specify a non-AI baseline, measurement method, and escalation conditions.'), c('以相同測試集比較方案；記錄改善、成本與限制。', 'Compare alternatives on the same cases; record gains, costs, and limitations.')],
    dailyExamples: [
      daily('買吸塵機之前', 'Before buying a vacuum', '家中只需清理一小格抽屜，先試抹布；若每天有大量地毯灰塵，才比較吸塵機。', 'For one dusty drawer, try a cloth first. For daily carpet cleaning, compare vacuum cleaners.', '抽屜／地毯是問題規模；抹布是 baseline；清潔時間與殘留灰塵是指標。AI 方案也要證明額外複雜度有價值。', 'The drawer/carpet defines scope; the cloth is the baseline; time and remaining dust are metrics. An AI solution must likewise justify extra complexity.'),
      daily('約朋友食飯', 'Planning dinner with friends', '先問預算、飲食限制與到達時間，再訂餐廳；不能只因為餐廳最潮就選它。', 'Ask about budget, dietary needs, and arrival times before booking; popularity alone is not a reason to choose.', '限制條件等於需求契約；不同餐廳等於方案；滿足大家需要才是成功，不是使用最新框架。', 'Constraints form the requirements contract; restaurants are solution options; success means meeting needs, not using the newest framework.'),
    ],
    topicIds: ['t1', 't2', 't9', 't10'], sourceIds: ['anthropic-applied'],
    evidence: [c('一頁需求文件：使用者、baseline、成功指標、風險、限制與不做的事。', 'A one-page brief: user, baseline, metrics, risks, constraints, and non-goals.'), c('可重跑的比較報告，清楚列出樣本數、失敗案例與未量度項目。', 'A reproducible comparison showing sample size, failure cases, and unmeasured items.')],
    interview: { question: c('這個功能為甚麼需要 AI？如果不用 AI 呢？', 'Why does this feature need AI? What if you did not use AI?'), answer: c('先解釋使用者需求與規則 baseline，展示在哪些案例 AI 真正有改善；指出成本、錯誤風險及保持人工處理的部分。若 baseline 足夠，願意選較簡單方案。', 'Explain the user need and rule-based baseline, show where AI adds value, and identify costs, risks, and human-only actions. Be willing to choose the simpler design if it meets the need.') },
    drill: { task: c('為一個合成 FAQ 流程寫需求與非 AI router，建立 12 個有預期結果的案例，至少包含模糊與高風險查詢。此數目是學習練習。', 'Write a brief and non-AI router for synthetic FAQs with 12 expected-result cases, including ambiguous and high-risk requests. This count is a learning exercise.'), pass: c('輸出逐案 expected／actual、總結與所有失敗案例；高風險查詢不得自動執行動作，報告不得聲稱未量度的節省時間。', 'Print expected/actual results, a summary, and every failure; never execute high-risk actions automatically or claim unmeasured time savings.') },
  },
  {
    id: 'software-engineering', title: c('能讀、測、修與交付程式', 'Read, test, debug, and ship software'),
    explanation: c('AI 開發首先是軟件工程：能用 Python 或 JavaScript 寫清晰函式、理解資料結構、HTTP 與資料庫，分清 I/O 等待和 CPU 工作。為輸入訂 schema、為錯誤訂回應；用單元測試與整合測試守住契約。Git、環境設定、依賴版本與可重跑指令讓別人接手。可以用 AI 協助寫碼，但必須解釋、驗證與修正生成內容，不能把看似合理的程式當成證據。', 'AI development is software engineering first: write clear Python or JavaScript, understand data structures, HTTP and databases, and distinguish I/O waits from CPU work. Define input schemas and error behavior; use unit and integration tests to protect contracts. Git, environment configuration, dependency versions, and repeatable commands make handover possible. AI-assisted code still needs your explanation, verification, and debugging; plausible code is not evidence of correctness.'),
    metaphorTitle: c('好廚房不只靠好食譜', 'A good kitchen needs more than a recipe'),
    metaphor: c('食材標籤、量杯、清潔流程與交更紀錄讓不同廚師做出一致結果。schema、測試、錯誤處理與版本控制就是工程的廚房制度。', 'Ingredient labels, measuring tools, cleaning routines, and shift notes help different cooks produce consistent results. Schemas, tests, error handling, and version control serve the same engineering purpose.'),
    example: c('模型回傳「3 件商品」後，結帳服務仍要驗證數量是整數、不能是負數，並測試缺少欄位。對話理解與可靠的金額／庫存計算應分層，不能讓模型代替所有資料驗證。', 'After a model returns “3 items,” checkout still validates that quantity is an integer and nonnegative, and tests missing fields. Conversation understanding and reliable money/inventory logic belong in separate layers; the model does not replace validation.'),
    language: 'JavaScript', codeTitle: c('教學片段：資料契約與邊界測試（Node 18，.mjs）', 'Teaching fragment: a contract and boundary tests (Node 18, .mjs)'),
    code: `import assert from 'node:assert/strict';
function quantity(value) {
  if (!Number.isInteger(value) || value < 1 || value > 20)
    throw new TypeError('quantity must be an integer from 1 to 20');
  return value;
}
assert.equal(quantity(3), 3);
for (const bad of [0, -1, 1.5, '3', undefined])
  assert.throws(() => quantity(bad), TypeError);
console.log('contract: valid input + 5 invalid inputs verified');
// No HTTP server or payment implementation is included.`,
    steps: [c('把關鍵邏輯拆成容易測試的小函式。', 'Separate important logic into small testable functions.'), c('測正常、缺失、錯型別、邊界與例外情況。', 'Test normal, missing, wrong-type, boundary, and failure cases.'), c('從乾淨 checkout 重跑指令，寫清楚設定與限制。', 'Run from a clean checkout and document setup and limitations.')],
    dailyExamples: [
      daily('填快遞表格', 'Filling a delivery form', '地址漏了門牌，即使包裹包得很漂亮，也可能無法送達。', 'A beautifully packed parcel can still fail delivery when its apartment number is missing.', '包裝像介面；地址欄位像 schema。先驗證必需欄位，失敗時給出明確錯誤，而不是猜一個地址。', 'Packaging is the interface; address fields are a schema. Validate required fields and report clear errors rather than guessing an address.'),
      daily('維修單車', 'Repairing a bicycle', '換完煞車後，先在安全地方測試，再出街；保留換過甚麼零件的紀錄。', 'After replacing brakes, test in a safe place before riding outside and keep a record of changed parts.', '安全試車是測試；零件紀錄是 Git history；能找出哪次改動造成問題，比「昨日還能用」更可靠。', 'A safe test ride is testing; the parts record is Git history. Locating the change that caused a fault is more useful than saying it worked yesterday.'),
    ],
    topicIds: ['t1', 't5'], sourceIds: ['anthropic-applied', 'microsoft-production'],
    evidence: [c('一個可乾淨啟動的 repository，含 README、測試及錯誤處理。', 'A repository that starts from a clean checkout with a README, tests, and error handling.'), c('一份 bug 修復紀錄：重現、根因、修正與防止再犯的測試。', 'A bug-fix record: reproduction, root cause, correction, and a regression test.')],
    interview: { question: c('AI 寫的函式通過一次示範，你如何知道它可靠？', 'An AI-written function passed one demo. How do you know it is reliable?'), answer: c('讀懂契約與副作用，測正常與惡意／缺失輸入，查看錯誤處理及依賴；保留回歸測試。一次示範不是可靠性證明。', 'Understand the contract and side effects, test normal and hostile/missing inputs, inspect errors and dependencies, and keep regression tests. One demo is not a reliability proof.') },
    drill: { task: c('寫一個支援 ticket 驗證器及測試：正常、缺欄位、超長文字、錯型別、無權限；不用任何外部套件。', 'Write a support-ticket validator and tests for valid, missing, oversized, wrong-type, and unauthorized inputs without external packages.'), pass: c('測試命令逐項顯示結果，錯誤輸入不進入下一步；README 的指令在乾淨環境可重跑，沒有真實密鑰。', 'The test command reports each result, invalid input cannot proceed, README commands reproduce in a clean environment, and no real secrets are present.') },
  },
  {
    id: 'ml-foundations', title: c('懂模型如何學習，以及何時會看似成功', 'Understand learning and misleading model success'),
    explanation: c('模型學習的是資料中的規律，不是把訓練答案記住就代表能處理新情況。train 用來學參數，validation 用來選模型與閾值，test 留到決定完成後才作最後評估；同一人的重複紀錄或未來資訊跨越分割會造成 leakage。類別不平衡時 accuracy 可掩蓋少數類失敗，要看 precision、recall 與錯誤代價。閾值改變取捨；模型分數即使寫成 0.8，也未必是校準後的 80% 機率。需要新資料、切片分析與泛化測試，而不只是訓練分數。', 'A model must generalize to unseen cases, not merely memorize training answers. Training fits parameters; validation selects models and thresholds; the test set is reserved for final assessment after decisions are fixed. Duplicate entities or future information crossing splits cause leakage. With class imbalance, accuracy can hide minority-class failures: inspect precision, recall, and mistake costs. Thresholds change the tradeoff, and a score of 0.8 is not automatically a calibrated 80% probability. Use new data and slice analysis, not training scores alone.'),
    metaphorTitle: c('背熟練習答案不等於識考試', 'Memorizing practice answers is not understanding'),
    metaphor: c('練習題像 train，模擬試像 validation，未見過的正式試像 test。若老師先把正式試答案給你，分數很好也不能證明你真的理解。', 'Practice questions are training, mock exams are validation, and an unseen final exam is testing. Seeing the final answers early makes a high score meaningless as evidence of understanding.'),
    example: c('100 個 ticket 只有 5 個緊急；全部預測「不緊急」也有 95% accuracy，卻漏掉全部緊急情況。先按使用者／時間分割，再用 validation 選閾值，量度緊急類別的 precision、recall；最後只評一次保留 test。', 'Only 5 of 100 tickets are urgent: predicting “not urgent” every time gives 95% accuracy while missing every urgent case. Split by user/time as appropriate, choose a threshold on validation, measure urgent-class precision/recall, and evaluate the held-out test only after fixing decisions.'),
    language: 'Python', codeTitle: c('教學片段：相同分數，不同閾值的取捨（Python 標準庫）', 'Teaching fragment: threshold tradeoffs (Python standard library)'),
    code: `labels = [1, 1, 0, 0, 0, 0]
scores = [0.90, 0.65, 0.85, 0.40, 0.20, 0.10]  # not necessarily calibrated
def metrics(threshold):
    predicted = [int(score >= threshold) for score in scores]
    tp = sum(p == 1 and y == 1 for p, y in zip(predicted, labels))
    fp = sum(p == 1 and y == 0 for p, y in zip(predicted, labels))
    fn = sum(p == 0 and y == 1 for p, y in zip(predicted, labels))
    return {"precision": tp / (tp + fp) if tp + fp else None,
            "recall": tp / (tp + fn) if tp + fn else None}
for threshold in (0.5, 0.8):
    print(threshold, metrics(threshold))
# Toy evaluation only: no training, calibration, or statistical confidence claim.`,
    steps: [c('按實際使用情境分割資料，檢查重複及未來資訊 leakage。', 'Split data for the real use case and check duplicates and future-information leakage.'), c('比較簡單 baseline；在 validation 量度類別指標並選閾值。', 'Compare a simple baseline; measure class metrics and choose thresholds on validation.'), c('固定決定後用保留 test，報告樣本量、分佈與限制。', 'After fixing decisions, use the held-out test and report sample size, distribution, and limitations.')],
    dailyExamples: [
      daily('天氣 app 的信心', 'Confidence in a weather app', '若 app 很多次說「八成會下雨」，但那些日子其實只有一半下雨，數字不一定可信。', 'If an app often says an 80% chance of rain but only half of those days are rainy, its numbers may not be trustworthy.', '這是在看 calibration：同一信心範圍的預測與實際頻率是否接近。高分數或高 accuracy 不會自動代表機率準確。', 'This is calibration: does observed frequency agree with predictions in the same confidence range? A high score or accuracy does not automatically mean accurate probabilities.'),
      daily('家中煙霧警報', 'A household smoke alarm', '警報太敏感，煎蛋都響；太遲鈍，真正冒煙也不響。你要權衡打擾與漏報的代價。', 'An alarm that is too sensitive triggers on cooking; one that is too insensitive misses real smoke. Weigh nuisance alarms against missed danger.', '敏感度像分類閾值；漏報影響 recall，亂報影響 precision。閾值應按風險選，而不是只追求一個總分。', 'Sensitivity resembles a decision threshold; missed danger affects recall and false alarms affect precision. Select thresholds for risk, not just a single overall score.'),
    ],
    topicIds: ['t3', 't7', 't10'], sourceIds: ['microsoft-measurement'],
    evidence: [c('資料分割圖與 leakage 檢查，說明為何選時間或群組分割。', 'A split diagram and leakage checks explaining time-based or grouped splitting.'), c('baseline／模型的 confusion matrix、閾值比較與不平衡類別分析；不虛構信心區間。', 'Baseline/model confusion matrices, threshold comparisons, and imbalance analysis without invented confidence intervals.')],
    interview: { question: c('模型 accuracy 95%，你會上線嗎？', 'A model has 95% accuracy. Would you release it?'), answer: c('先問類別比例、baseline、leakage、test 是否獨立、錯誤代價與切片表現。再看 precision／recall、閾值與校準；95% 可能只是在猜最多的類別。', 'Ask about class balance, baseline, leakage, test independence, mistake costs, and slice performance. Inspect precision/recall, thresholds, and calibration; 95% may only reflect guessing the majority class.') },
    drill: { task: c('用合成的 20 個分數與標籤比較兩個閾值，加入重複使用者並寫分割檢查；20 是教學樣本，不代表統計充分。', 'Compare two thresholds using 20 synthetic scores/labels and add duplicate users with split checks; 20 is a teaching sample, not proof of statistical adequacy.'), pass: c('輸出每個閾值的 TP／FP／FN、precision／recall，展示拒絕跨 split 重複的測試，以及「分數未驗證為校準機率」的說明。', 'Print TP/FP/FN and precision/recall for each threshold, show a test rejecting cross-split duplicates, and state that scores have not been verified as calibrated probabilities.') },
  },
  {
    id: 'data-engineering', title: c('建立可信資料與可追溯流程', 'Build trustworthy data and traceable pipelines'),
    explanation: c('模型和 RAG 的上限受資料品質限制。理解清理、去重、schema、缺失欄位、時間／版本、標註一致性與 lineage；資料不是下載一次就永遠正確。pipeline 要可重跑、記錄接受／拒絕數、不要把私人資料放進公開 repository。權限、保留期、刪除與來源更新要貫穿資料庫、索引與快取。初級工程師不必立即處理 PB 級資料，但要能證明每筆測試資料從哪裏來、如何變化及誰可以用。', 'Data quality constrains both models and RAG. Understand cleaning, deduplication, schemas, missing fields, timestamps/versions, annotation consistency, and lineage; downloaded data is not permanently correct. Pipelines should be reproducible and record accepted/rejected counts without exposing private data. Permissions, retention, deletion, and source updates must reach databases, indexes, and caches. A junior need not process petabytes, but should explain where each test record came from, how it changed, and who may use it.'),
    metaphorTitle: c('超市食材的批次標籤', 'Batch labels on supermarket ingredients'),
    metaphor: c('食材要有來源、日期與批次；發現一批有問題時才能追蹤與回收。資料的來源 ID、版本及轉換紀錄就是批次標籤。', 'Ingredients need origins, dates, and batch labels so a faulty batch can be traced and recalled. Source IDs, versions, and transformation records serve this purpose for data.'),
    example: c('匯入支援 FAQ 時，拒絕空白內容，去除同 ID 重複，保留來源版本與可讀角色；一份 internal 文件不能因為做了 embedding 就變成所有人可查。', 'When importing support FAQs, reject empty text, deduplicate IDs, and preserve source versions and readable roles. Embedding an internal document does not make it safe for everyone to retrieve.'),
    language: 'Python', codeTitle: c('教學片段：匯入報告與去重（Python 標準庫）', 'Teaching fragment: import reporting and deduplication (Python standard library)'),
    code: `rows = [
    {"id": "faq-1", "text": "Hours: 09:00-17:00", "version": 1},
    {"id": "faq-1", "text": "duplicate", "version": 1},
    {"id": "faq-2", "text": " ", "version": 1},
]
accepted, rejected, seen = [], [], set()
for row in rows:
    if row["id"] in seen or not row["text"].strip():
        rejected.append(row["id"])
        continue
    seen.add(row["id"])
    accepted.append(row)
assert len(accepted) == 1 and len(rejected) == 2
print({"accepted": len(accepted), "rejected": len(rejected)})
# Toy fixtures only; a real importer also validates schema and authorization.`,
    steps: [c('定義 schema、來源、授權、版本與刪除規則。', 'Define schema, sources, permissions, versions, and deletion rules.'), c('建立可重跑轉換，測試空值、重複與壞資料。', 'Build repeatable transformations and test missing, duplicate, and malformed data.'), c('輸出品質報告，追蹤資料到索引／快取的生命週期。', 'Report quality and trace the lifecycle through indexes and caches.')],
    dailyExamples: [
      daily('通訊錄重複聯絡人', 'Duplicate address-book contacts', '同一朋友有三份聯絡資料，舊電話混在新電話中；合併前先判斷是否同一個人。', 'A friend has three contact entries mixing old and new numbers; identify the same person before merging.', '去重需要穩定 ID 與更新規則，不能只因姓名相同就合併；錯誤資料會傳到搜尋結果與下游服務。', 'Deduplication needs stable IDs and update rules, not name matching alone; bad records propagate into search results and downstream services.'),
      daily('共用雪櫃清理', 'Cleaning a shared fridge', '餐盒寫着主人與日期；食物過期後，要連同分裝的小盒一起處理，不能只丟原盒。', 'Lunchboxes have owners and dates; when food expires, remove its portioned containers too, not just the original box.', '主人是權限，日期是保留期，分裝盒是索引／快取副本。刪除與權限必須同步到派生資料。', 'Owners represent permissions, dates retention, and portioned boxes derived index/cache copies. Deletion and access rules must reach derived data.'),
    ],
    topicIds: ['t3', 't7', 't8', 't13'], sourceIds: ['microsoft-measurement'],
    evidence: [c('使用合成或獲授權資料的 pipeline，含 schema、版本與拒絕原因報告。', 'A synthetic or authorized-data pipeline with schemas, versions, and rejection reasons.'), c('刪除及權限測試，證明不可讀文件不進檢索結果。', 'Deletion and permission tests proving unreadable documents cannot appear in retrieval.')],
    interview: { question: c('資料集乾淨，是甚麼意思？你如何證明？', 'What does “clean data” mean, and how would you demonstrate it?'), answer: c('按任務定義 schema、缺值、重複、標註、來源與權限要求，提供可重跑檢查及拒絕紀錄；承認檢查未涵蓋的問題，不能只憑目視。', 'Define task-specific schema, missing-value, duplicate, annotation, provenance, and permission requirements; provide repeatable checks and rejection logs, and acknowledge uncovered issues rather than relying on visual inspection.') },
    drill: { task: c('建立一個合成 FAQ 匯入器，包含重複 ID、空白、缺版本與不同角色；測試重跑及刪除後的檢索。', 'Build a synthetic FAQ importer with duplicate IDs, blank text, missing versions, and different roles; test reruns and retrieval after deletion.'), pass: c('逐項輸出 accepted／rejected 原因；重跑不增加重複；刪除或無權限的文件沒有出現在搜尋結果。', 'Print acceptance/rejection reasons; reruns add no duplicates; deleted or unauthorized documents do not appear in search results.') },
  },
  {
    id: 'llm-rag', title: c('讓 LLM 回答有根據，並知道何時不知道', 'Ground LLM answers and handle missing evidence'),
    explanation: c('理解 tokens、context 限制、提示與結構化輸出只是起點。RAG 要先找到有權限且相關的證據，再要求回答引用來源；來源存在不代表支持每句答案。量度 retrieval 與 generation 兩層，測試沒有答案、文件過期與互相矛盾時如何拒答或接手。選模型要比較任務品質、延遲、成本與資料政策，不能假設較大模型永遠較好。先用簡單檢索 baseline，再評估 embeddings、hybrid search 或 reranking 是否改善。', 'Tokens, context limits, prompting, and structured output are starting points. RAG must retrieve authorized, relevant evidence, then ground the answer in it; an existing citation does not necessarily support every claim. Evaluate retrieval and generation separately and handle missing, stale, or conflicting evidence. Compare models on task quality, latency, cost, and data policy rather than assuming bigger is better. Start with simple retrieval before testing embeddings, hybrid search, or reranking.'),
    metaphorTitle: c('開卷考試也要引用對頁', 'An open-book exam still needs the right page'),
    metaphor: c('帶了整本書不代表答案正確。要先找到相關章節，再確認書中文字真的支持答案；沒有內容時不能亂填一個頁碼。', 'Having the whole book does not make an answer correct. Find the relevant passage and verify it supports the answer; do not invent a page number when the information is absent.'),
    example: c('顧客問營業時間，系統引用已核准 FAQ；問員工薪酬時，先做權限篩選，而不是把私人文件傳給模型再叫它保密。找不到退款條款時回覆資料不足，而不是編一個政策。', 'For opening hours, cite an approved FAQ. For employee compensation, filter permissions before sending documents to a model rather than asking it to keep private material secret. If a refund policy is absent, report insufficient evidence rather than inventing one.'),
    language: 'Python', codeTitle: c('教學片段：有權限的字詞檢索 baseline（不是 embedding）', 'Teaching fragment: authorized keyword baseline (not embeddings)'),
    code: `docs = [
    {"id": "hours", "text": "opening hours 09:00-17:00", "roles": ["public"]},
    {"id": "salary", "text": "salary private", "roles": ["hr"]},
]
def retrieve(query, role):
    terms = set(query.lower().split())
    return [d for d in docs if role in d["roles"]
            and terms & set(d["text"].lower().split())]
assert retrieve("salary", "public") == []
matches = retrieve("opening hours", "public")
print({"answer": matches[0]["text"], "source": matches[0]["id"]}
      if matches else {"answer": "Insufficient evidence", "source": None})
# Role must come from trusted server identity in a real application.`,
    steps: [c('先驗證文件權限與版本，再建立檢索 baseline。', 'Validate document permissions and versions, then build a retrieval baseline.'), c('把回答連到支持它的片段，測試缺資料與矛盾資料。', 'Link answers to supporting passages and test missing/conflicting information.'), c('分別量度檢索命中、回答支持度、延遲與成本。', 'Measure retrieval success, answer support, latency, and cost separately.')],
    dailyExamples: [
      daily('問店員退貨規則', 'Asking about returns', '可靠店員會查店舖條款，指出適用條件；找不到條款時會請主管確認，而不是憑印象作承諾。', 'A reliable clerk checks the shop policy and its conditions; if it cannot be found, they ask a supervisor rather than promise from memory.', '查條款是 retrieval，根據條款回答是 generation；主管接手是缺證據時的安全出口。', 'Looking up the policy is retrieval; answering from it is generation; escalation is the safe exit when evidence is missing.'),
      daily('朋友傳來一張舊價目表', 'An old menu from a friend', '價目表是真的，但可能是去年版本；不能只因有相片就認為今日仍是那個價錢。', 'The menu photo is genuine but may be from last year; having a photo does not prove the price is current.', '來源真實、版本新舊與內容是否支持當前問題是不同檢查。RAG 需要三者，不只是一個 citation。', 'Authenticity, freshness, and support for the current question are separate checks. RAG needs all three, not just a citation.'),
    ],
    topicIds: ['t2', 't3'], sourceIds: ['anthropic-applied'],
    evidence: [c('有來源、權限與版本的 FAQ assistant；包含缺資料時的行為。', 'A FAQ assistant with sources, permissions, versions, and explicit missing-evidence behavior.'), c('相同案例下 baseline／RAG 的比較，列出 retrieval 與回答層的個別錯誤。', 'Baseline/RAG comparisons on the same cases with separate retrieval and answer errors.')],
    interview: { question: c('回答附了來源連結，為甚麼仍可能是 hallucination？', 'Why can an answer with a source link still be a hallucination?'), answer: c('來源可能不相關、過期、無權限或沒有支持該句。檢查 claim 到片段的對應，分開檢索與生成錯誤，沒有證據就不要補猜。', 'The source may be irrelevant, stale, unauthorized, or fail to support the claim. Check claim-to-passage support, separate retrieval from generation errors, and do not fill evidence gaps with guesses.') },
    drill: { task: c('用合成 FAQ 測試可回答、無答案、過期、矛盾及私人文件五類問題；先用字詞 baseline，再選一項改進。', 'Test answerable, missing, stale, conflicting, and private-document questions with synthetic FAQs; begin with a keyword baseline and choose one improvement.'), pass: c('輸出來源 ID、支持片段、檢索與回答結果；無權限內容不送往回答階段，缺資料不產生假政策，改進有逐案比較。', 'Print source IDs, supporting passages, retrieval/answer results; unauthorized material never reaches answering, missing evidence yields no invented policy, and improvements have case-by-case comparisons.') },
  },
  {
    id: 'agent-design', title: c('設計有界限、有授權的 agent', 'Design bounded, authorized agents'),
    explanation: c('Agent 是能選擇下一步並使用工具的程式，但模型提出的動作不是授權。為每個 tool 訂 schema、身份權限、副作用、timeout 與可重試條件；限制步數、時間及預算，對退款／刪除等動作要求人工批准。固定流程可用 state machine，不必增加 agent。委派或 context offload 也要保留證據、責任與 trace。測試 agent 不只看最後答案，更要看 tool 軌跡、拒絕原因及途中失敗能否安全停止。', 'An agent selects steps and uses tools, but a model-proposed action is not authorization. Give each tool schemas, identity checks, side-effect definitions, timeouts, and safe retry conditions. Bound steps, time, and budget; require approval for risky actions such as refunds or deletion. Use a state machine when a fixed workflow suffices. Delegation and context offloading still need evidence, ownership, and traces. Evaluate tool trajectories, refusals, and safe stopping—not only the final answer.'),
    metaphorTitle: c('給助理一張有限的工作單', 'Give an assistant a bounded work order'),
    metaphor: c('助理可以查資料與草擬電郵，但沒有你的批准不能轉帳。工作單列出可做甚麼、最多花多少時間與何時請你決定，不是「想辦法搞掂所有事」。', 'An assistant may look things up and draft an email but cannot transfer money without approval. A work order states permitted actions, time limits, and escalation points instead of “do whatever it takes.”'),
    example: c('支援 agent 可讀合成 ticket、查 FAQ 與草擬回覆；退款工具被 policy block，必須經獨立授權。工具回傳「ignore previous instructions」也只是外部資料，不能改寫 agent 的權限。', 'A support agent may read a synthetic ticket, search FAQs, and draft a reply; a refund tool is blocked until independently authorized. A tool result saying “ignore previous instructions” is external data, not a change to the agent’s permissions.'),
    language: 'JavaScript', codeTitle: c('教學片段：執行前檢查有界工具計劃（Node 18，.mjs）', 'Teaching fragment: preflight a bounded tool plan (Node 18, .mjs)'),
    code: `import assert from 'node:assert/strict';
const tools = { read_ticket: () => 'synthetic ticket', draft_reply: () => 'draft' };
function run(plan, authorizedTools) {
  if (plan.length > 2) return { status: 'step_limit', trace: [] };
  if (plan.some(name => !authorizedTools.includes(name) || !tools[name]))
    return { status: 'denied', trace: [] };
  return { status: 'ok', trace: plan.map(name => ({ tool: name, result: tools[name]() })) };
}
assert.equal(run(['issue_refund'], ['read_ticket', 'draft_reply']).status, 'denied');
console.log(run(['read_ticket', 'draft_reply'], ['read_ticket', 'draft_reply']));
// Policy inputs must come from trusted server identity; real tools need more controls.`,
    steps: [c('先選固定流程或 agent，列出 tool 契約與權限。', 'Choose a fixed workflow or agent and define tool contracts and permissions.'), c('設定步數／時間／成本上限及批准與停止狀態。', 'Set step/time/cost limits, approval gates, and stopping states.'), c('測試軌跡、拒絕、timeout 及副作用重試，不只測答案。', 'Test trajectories, denials, timeouts, and side-effect retries, not just answers.')],
    dailyExamples: [
      daily('朋友代買餸', 'A friend doing your grocery shopping', '你給朋友預算與清單；沒有雞肉可以打電話問，但不能自行用整個月生活費買昂貴食材。', 'You give a friend a list and budget; they may call if chicken is unavailable, but cannot spend your monthly budget on an expensive substitute.', '清單是 tool 範圍，預算是執行上限，打電話是 approval。自主選步驟不等於任意擴大權限。', 'The list bounds tools, the budget bounds execution, and the call is approval. Choosing steps autonomously does not permit expanding authority.'),
      daily('旅行社幫你計劃', 'A travel agent planning your trip', '旅行社可以比較行程並暫存草稿，但真正付款訂票前仍要你確認日期與金額。', 'A travel agent can compare trips and save a draft, but needs your confirmation before paying for tickets.', '查詢與草擬是低風險動作；付款是副作用。agent 要把建議、批准與執行分開，才能安全重試與追蹤。', 'Queries and drafts are lower-risk actions; payment is a side effect. Separate proposal, approval, and execution for safe retries and traceability.'),
    ],
    topicIds: ['t4', 't5', 't6', 't13'], sourceIds: ['anthropic-applied', 'microsoft-production'],
    evidence: [c('工具契約、權限表與狀態圖，清楚標記需要人工批准的動作。', 'Tool contracts, a permission matrix, and a state diagram marking human-approved actions.'), c('可重跑的正常與拒絕／步數超限軌跡；沒有真實金錢或資料副作用。', 'Reproducible normal, denied, and step-limit traces without real financial or data side effects.')],
    interview: { question: c('agent 可以呼叫退款工具，代表它可以退款嗎？', 'If an agent can call a refund tool, may it issue refunds?'), answer: c('不代表。工具可見性不是身份授權；服務端要驗證角色、金額、批准與 idempotency。模型計劃和外部文字都不能繞過 policy。', 'No. Tool visibility is not identity authorization; the server verifies role, amount, approval, and idempotency. Model plans and external text cannot bypass policy.') },
    drill: { task: c('建立合成支援 agent／state machine，可查詢與草擬，但退款須拒絕；加入未知工具、無限循環請求與惡意工具文字。', 'Build a synthetic support agent/state machine that queries and drafts but denies refunds; add unknown tools, loop attempts, and malicious tool text.'), pass: c('輸出 tool trace 與停止原因；越權／未知工具未被執行、超過步數會停止、惡意文字沒有改變權限。', 'Print tool traces and stopping reasons; unauthorized/unknown tools never execute, step limits stop execution, and hostile text does not change permissions.') },
  },
  {
    id: 'evaluation', title: c('用可重現證據量度品質', 'Measure quality with reproducible evidence'),
    explanation: c('先定義「好」是甚麼：任務完成、證據支持、工具正確性、安全、延遲與成本可能互相衝突。建立版本化案例與預期結果，把開發集和保留評估集分開；記錄模型、prompt、資料版本及設定。逐類分析失敗，不只看平均分。LLM judge 也可能偏誤，需用人工標註樣本校準並檢查一致性。樣本少要承認不確定性；網站的練習通過數不能冒充真實客戶效果或聘請機率。', 'Define quality explicitly: task completion, evidence support, tool correctness, safety, latency, and cost can conflict. Version cases and expected results, separate development and held-out evaluation, and record model, prompt, data, and settings. Inspect failure slices, not only averages. An LLM judge can be biased and needs calibration against human-labeled examples. Small samples carry uncertainty; exercise pass counts are not customer impact or hiring probabilities.'),
    metaphorTitle: c('驗收不是只看最好的一件貨', 'Inspection is not showing the best item'),
    metaphor: c('驗貨要抽查不同批次與故障類型，記錄標準和不合格品。只展示最漂亮的一件，不能證明整批貨都有同一品質。', 'Inspection samples different batches and failure types using recorded standards and rejected items. Showing the finest item does not establish the quality of the whole batch.'),
    example: c('支援 assistant 用同一套合成案例比較規則 baseline 與新版本，分開公開 FAQ、私人問題、缺答案與工具失敗。記錄有多少題、哪裏失敗及實際量度時間，避免選擇性展示成功對話。', 'Compare a support assistant and rule-based baseline on the same synthetic cases, separating public FAQs, private requests, missing answers, and tool failures. Record sample counts, failures, and measured runtime instead of cherry-picking successful conversations.'),
    language: 'Python', codeTitle: c('教學片段：逐案評估與失敗清單（Python 標準庫）', 'Teaching fragment: case-level evaluation and failures (Python standard library)'),
    code: `import json
def route(text):
    return "faq" if "hours" in text.lower() else "human"
cases = [
    {"id": "public-1", "input": "Opening hours?", "expected": "faq"},
    {"id": "risk-1", "input": "Refund me", "expected": "human"},
    {"id": "missing-1", "input": "Unknown policy", "expected": "human"},
]
results = [{**case, "actual": route(case["input"])} for case in cases]
failures = [r for r in results if r["actual"] != r["expected"]]
print(json.dumps({"cases": len(results), "failures": failures, "results": results}, indent=2))
assert not failures
# Exact labels suit this toy router; free-text answers need task-specific grading.`,
    steps: [c('訂出品質維度、案例分類與標註準則。', 'Define quality dimensions, case slices, and labeling rules.'), c('固定案例及版本，用同一指令量度 baseline 與候選方案。', 'Freeze cases and versions and evaluate baseline/candidate with the same command.'), c('公開失敗、樣本量與限制；新問題加到下一輪測試。', 'Report failures, sample size, and limitations; add new issues to the next test round.')],
    dailyExamples: [
      daily('試新洗衣液', 'Testing a new detergent', '不能拿新洗衣液洗乾淨衣服、舊洗衣液洗油污衣服，再說新產品更好。要用相近污漬與洗法比較。', 'Do not wash clean clothes with the new detergent and oily clothes with the old one, then declare a winner. Compare similar stains and wash settings.', '相同案例與設定是公平比較；控制變因避免把資料差異當成模型改善，失敗污漬就是 error slices。', 'Shared cases/settings enable a fair comparison; controls stop data differences masquerading as model improvements, and failed stain types are error slices.'),
      daily('練習投籃', 'Practicing basketball shots', '只記錄入球的影片會看起來非常準；真實命中率要包括所有嘗試，也要看近投與遠投。', 'A video of successful shots makes you look accurate; a real hit rate includes every attempt and separates near and far shots.', '全部嘗試是完整評估集，近／遠投是切片；少量成功示範不能證明泛化品質。', 'All attempts form the evaluation set; near/far shots are slices. A few successful demos cannot establish generalization quality.'),
    ],
    topicIds: ['t3', 't6', 't7', 't10', 't13'], sourceIds: ['anthropic-applied', 'microsoft-measurement'],
    evidence: [c('版本化案例、標註準則與單一可重跑命令。', 'Versioned cases, labeling rules, and one reproducible evaluation command.'), c('baseline／候選方案報告，含逐案結果、切片、失敗與未量度項目。', 'A baseline/candidate report with case results, slices, failures, and unmeasured items.')],
    interview: { question: c('新 prompt 在三個示範都成功，可以說更好了嗎？', 'A new prompt succeeds on three demos. Can you call it better?'), answer: c('只能說這三例成功。要用未被反覆調校的保留案例、相同設定及清楚標準比較；量度失敗切片與成本，說明樣本量及不確定性。', 'Only those three cases succeeded. Compare on held-out cases not repeatedly tuned against, using shared settings and clear criteria; inspect failure slices and costs and state sample size and uncertainty.') },
    drill: { task: c('為合成 assistant 建立 20 個固定案例，分四類並比較兩個版本；故意放入一個回歸。此數目只是練習目標。', 'Create 20 frozen cases in four slices for a synthetic assistant and compare two versions, deliberately introducing one regression. The count is an exercise target.'), pass: c('命令輸出逐案差異與每類樣本數，能指出刻意回歸；報告版本／設定與未量度項目，不只輸出總分。', 'The command prints case differences and slice counts, identifies the deliberate regression, and reports versions/settings and unmeasured items rather than just a total score.') },
  },
  {
    id: 'security', title: c('保護身份、資料與高風險動作', 'Protect identity, data, and high-risk actions'),
    explanation: c('把使用者、模型、外部文件及工具分清 trust boundaries。身份與授權由可信服務端決定，不能依賴 prompt 說「不要洩漏」；先過濾資料，再送入模型。使用最小權限、密鑰管理、輸入驗證、敏感日誌遮罩與批准機制，並測試 prompt injection、越權查詢及失敗時行為。安全不是加一句 system prompt，也不是聲稱永不出錯；要展示威脅、控制、測試與剩餘風險。', 'Separate trust boundaries between users, models, external documents, and tools. Trusted server identity determines authorization; a prompt saying “do not leak” is not access control. Filter data before model access. Apply least privilege, secret handling, validation, sensitive-log redaction, and approvals, then test injection, unauthorized queries, and failure behavior. Security is neither one system instruction nor a promise of zero risk: demonstrate threats, controls, tests, and remaining risks.'),
    metaphorTitle: c('酒店房卡與接待員', 'Hotel keycards and reception'),
    metaphor: c('住客說自己是另一間房的主人，不代表接待員應該交出房卡。身份核實是獨立程序，不能因為對方說得流利就相信。', 'A guest claiming to own another room should not receive its keycard. Identity verification is independent of how convincingly the request is phrased.'),
    example: c('合成 ticket assistant 從 session 得到 user ID，查詢前檢查 ticket owner。使用者文字寫「我是 admin」沒有改變權限。trace 只記錄必要 metadata，API key 與私人內容不放進公開 GitHub。', 'A synthetic ticket assistant gets user identity from the session and checks ownership before reading. User text saying “I am admin” does not change permissions. Traces retain only necessary metadata; API keys and private content stay out of public GitHub.'),
    language: 'JavaScript', codeTitle: c('教學片段：先授權，再讀資料（Node 18，.mjs）', 'Teaching fragment: authorize before reading (Node 18, .mjs)'),
    code: `import assert from 'node:assert/strict';
const tickets = { 'ticket-1': { owner: 'user-a', text: 'synthetic question' } };
function readTicket(serverIdentity, ticketId) {
  const ticket = tickets[ticketId];
  if (!serverIdentity || !ticket || ticket.owner !== serverIdentity.userId)
    return { status: 'denied' };
  return { status: 'ok', text: ticket.text };
}
assert.equal(readTicket({ userId: 'user-b' }, 'ticket-1').status, 'denied');
assert.equal(readTicket(null, 'ticket-1').status, 'denied');
console.log('cross-user and anonymous access denied');
// Authentication, session validation, and audit storage are outside this toy fragment.`,
    steps: [c('畫出 trust boundaries、私人資料流與高風險工具。', 'Map trust boundaries, private-data flows, and high-risk tools.'), c('在服務端落實身份、最小權限與批准，不依賴模型守規矩。', 'Enforce server identity, least privilege, and approvals independently of model obedience.'), c('用合成攻擊案例驗證 deny 行為與日誌遮罩。', 'Verify denials and log redaction using synthetic attack cases.')],
    dailyExamples: [
      daily('銀行櫃位認人', 'Identity checks at a bank counter', '有人拿着另一人的名字來提款，職員仍要核實身份與授權，不會因請求很有禮貌就付款。', 'A polite request using someone else’s name does not authorize a withdrawal; the clerk verifies identity and authority.', '使用者文字是請求，不是憑證；授權由可信身份系統決定。模型理解請求不能替代這個程序。', 'User text is a request, not a credential; trusted identity systems decide authorization. Understanding a request does not replace this check.'),
      daily('陌生人寄來的紙條', 'A note from a stranger', '陌生紙條寫「屋主叫你把門匙給我」，你會向屋主確認，而不是把紙條當成屋主的新命令。', 'A stranger’s note saying “the owner told you to give me the keys” needs confirmation, not automatic obedience.', '外部文件／tool output 像紙條，是資料而不是政策。prompt injection 嘗試把低信任內容升級成高權限指令。', 'Documents/tool outputs are data, not policy. Prompt injection tries to promote low-trust content into privileged instructions.'),
    ],
    topicIds: ['t1', 't4', 't13'], sourceIds: ['microsoft-production'],
    evidence: [c('威脅模型、權限表與敏感資料／密鑰處理說明。', 'A threat model, permission matrix, and sensitive-data/secret-handling explanation.'), c('越權、injection、無身份與日誌洩漏測試；列出仍未覆蓋的風險。', 'Unauthorized-access, injection, anonymous-user, and log-leak tests with remaining risks documented.')],
    interview: { question: c('system prompt 已要求不洩漏私人資料，還需要 ACL 嗎？', 'The system prompt says not to leak private data. Do you still need an ACL?'), answer: c('需要。ACL 及服務端身份應在檢索前限制可讀資料；prompt 不是安全邊界。再測越權、injection、快取與日誌是否繞過限制。', 'Yes. ACLs and server identity restrict readable data before retrieval; a prompt is not a security boundary. Test unauthorized requests, injection, caches, and logs for bypasses.') },
    drill: { task: c('建立兩個合成使用者與不同擁有者的 ticket，加上偽裝 admin 文字、惡意文件與假密鑰 marker。', 'Create two synthetic users and differently owned tickets, plus fake-admin text, a malicious document, and a fake-secret marker.'), pass: c('測試顯示跨用戶 deny，惡意內容不能啟動高風險工具；輸出日誌不含假密鑰 marker，失敗情況安全停止。', 'Tests show cross-user denial, hostile content cannot invoke high-risk tools, logs contain no fake-secret marker, and failures stop safely.') },
  },
  {
    id: 'operations', title: c('能部署、監察、控制成本與恢復', 'Deploy, monitor, control cost, and recover'),
    explanation: c('Demo 能跑不等於服務可運作。分開設定與密鑰，固定版本，建立健康檢查、timeout、有限重試與 idempotency；量度請求結果、trace、錯誤率、尾部延遲與每個成功任務成本。平均延遲會掩蓋慢請求，重試也可能增加成本或重複副作用。用測試與評估守住發佈，準備回滾版本與 runbook，演練供應商 timeout／quota 及服務重啟。初級重點是能重現與恢復一個小服務，不是立即管理全球叢集。', 'A running demo is not an operable service. Separate configuration/secrets, pin versions, add health checks, timeouts, bounded retries, and idempotency. Measure outcomes, traces, errors, tail latency, and cost per successful task; averages hide slow requests and retries can add cost or duplicate side effects. Gate releases with tests/evaluations, keep a rollback version and runbook, and rehearse provider timeouts/quotas and restarts. A junior should reproduce and recover a small service, not immediately manage a global cluster.'),
    metaphorTitle: c('開餐廳要準備繁忙時間與停電', 'A restaurant must handle rushes and outages'),
    metaphor: c('試煮一碟菜成功，不代表晚市能準時供應。要知道排隊、出餐時間、食材成本與停電後如何恢復；新菜出問題也要能換回舊餐單。', 'Cooking one good dish does not prove the dinner service works. Track queues, serving times, ingredient costs, and recovery from an outage; a faulty new menu needs a safe return to the old one.'),
    example: c('合成 support API 設定 timeout 與有限重試，記錄 request ID、版本及結果；模擬 provider 失敗時，顯示服務不可用或人工接手。新版本出現回歸，就按 runbook 回到已驗證版本，而不是默默再重試無限次。', 'A synthetic support API uses timeouts and bounded retries and records request IDs, versions, and outcomes. Simulated provider failure yields an unavailable response or escalation. A regressed release follows a runbook back to a verified version instead of silently retrying forever.'),
    language: 'Python', codeTitle: c('教學片段：尾部延遲與成功任務成本（合成紀錄）', 'Teaching fragment: tail latency and cost per success (synthetic records)'),
    code: `from math import ceil
records = [
    {"ms": 120, "cost": 0.01, "ok": True},
    {"ms": 140, "cost": 0.01, "ok": True},
    {"ms": 900, "cost": 0.02, "ok": False},
]
latencies = sorted(r["ms"] for r in records)
successes = sum(r["ok"] for r in records)
print({"requests": len(records), "successes": successes,
       "p95_ms": latencies[ceil(0.95 * len(latencies)) - 1],
       "cost_per_success": sum(r["cost"] for r in records) / successes if successes else None})
# Nearest-rank p95 on 3 synthetic rows is an illustration, not an SLO measurement.
# Deployment, timeouts, retry accounting, and rollback must be tested separately.`,
    steps: [c('提供可重現啟動、健康檢查、版本及設定方式。', 'Provide reproducible startup, health checks, versioning, and configuration.'), c('量度品質、錯誤、p95 延遲與成功任務成本，保留安全 trace。', 'Measure quality, errors, p95 latency, and cost per success with safe traces.'), c('模擬失敗並演練停止、人工接手、回滾與恢復。', 'Simulate failures and rehearse stopping, escalation, rollback, and recovery.')],
    dailyExamples: [
      daily('等巴士時間', 'Waiting for a bus', '平均等五分鐘，但每二十次有一次等很久；對趕返工的人，最慢的那些等待非常重要。', 'The average wait is five minutes, but occasionally it is much longer; those slow waits matter to someone getting to work.', '平均值與尾部延遲不同；p95 描述一個分位位置，不代表最大值，也不能用幾次測試聲稱穩定服務。', 'An average differs from tail latency; p95 is a percentile, not the maximum, and a few tests do not establish stable service performance.'),
      daily('網上付款按鈕', 'An online payment button', '付款後畫面沒反應，你再按一次；可靠系統應查原交易，而不是把每次點擊當成新付款。', 'A payment screen stalls and you click again; a reliable system should check the original transaction, not charge anew on every click.', '網絡 timeout 不代表動作未發生。重試需要 idempotency 與狀態查詢，否則恢復操作本身可造成損害。', 'A timeout does not prove an action did not happen. Retries need idempotency and status checks or recovery itself can cause harm.'),
    ],
    topicIds: ['t1', 't6', 't8', 't12', 't13'], sourceIds: ['microsoft-production'],
    evidence: [c('可重現部署與版本化 runbook，含健康檢查、設定與回滾。', 'Reproducible deployment and a versioned runbook with health checks, configuration, and rollback.'), c('真實量度或清楚標示為合成的延遲／成本報告，以及一次故障恢復紀錄。', 'Measured or explicitly synthetic latency/cost reporting plus a failure-recovery record.')],
    interview: { question: c('provider timeout 後直接重試，可能出甚麼問題？', 'What can go wrong if you simply retry after a provider timeout?'), answer: c('原動作可能已完成，會重複副作用、增加成本與流量。需要 timeout budget、有限重試、idempotency／狀態查詢及安全接手；用 trace 確認原因。', 'The original action may already have completed, causing duplicate effects, cost, and load. Use timeout budgets, bounded retries, idempotency/status checks, safe escalation, and traces to investigate.') },
    drill: { task: c('啟動一個合成服務，模擬 timeout、quota 與新版本回歸；寫回滾指令，保留舊版本並重跑健康／評估測試。', 'Start a synthetic service, inject timeouts, quotas, and a release regression; document rollback, keep the prior version, and rerun health/evaluation checks.'), pass: c('輸出故障 trace、重試次數、實際量度時間及成功／失敗數；回滾後舊版本與測試結果可辨認，不聲稱未量度的 SLA。', 'Print failure traces, retry counts, measured time, and success/failure counts; identify the restored version and post-rollback test results without claiming an unmeasured SLA.') },
  },
  {
    id: 'communication', title: c('清楚解釋決定，誠實展示自己的貢獻', 'Explain decisions and represent your contribution honestly'),
    explanation: c('Recruiter 與工程團隊需要知道你實際做過甚麼、為何這樣設計，以及別人能否驗證。README 要有問題、架構、啟動方式、評估、風險與限制；用短文解釋一個 trade-off 和一次失敗。區分自己寫的內容、團隊工作、引用、AI 協助及合成結果，不把教學 demo 稱為客戶生產系統。面試時能修改與解釋程式，比背框架名字有價值。沒有資料的改善數字要標成未量度，不能包裝成已證實成果。', 'Recruiters and engineering teams need to know what you actually did, why you chose the design, and how others can verify it. A README should explain the problem, architecture, setup, evaluation, risks, and limits; discuss one tradeoff and one failure. Distinguish your work, team contributions, citations, AI assistance, and synthetic results instead of presenting a teaching demo as a customer production system. Explain and modify code rather than recite framework names. Mark unmeasured improvements as unmeasured, not proven impact.'),
    metaphorTitle: c('食譜要讓另一個人煮得出', 'A recipe should let someone else cook it'),
    metaphor: c('只展示食物照片不夠；要有食材、步驟、時間及失敗提示。如果食譜由朋友提供，也要清楚說明你改良了哪部分。', 'A food photo is not enough: include ingredients, steps, timing, and failure tips. If a friend supplied the recipe, explain which parts you improved.'),
    example: c('Portfolio 寫「我做了資料驗證、權限測試與評估 runner；介面由模板改寫；AI 協助初稿，我逐項驗證」。報告使用合成 ticket，列出失敗與未量度的使用者效益，讓面試官能重跑，而不是假稱節省 80% 成本。', 'A portfolio states: “I implemented validation, authorization tests, and the eval runner; the UI adapts a template; AI helped draft code that I verified.” It identifies synthetic tickets, failures, and unmeasured user benefits so an interviewer can reproduce it instead of accepting invented savings.'),
    language: 'JavaScript', codeTitle: c('教學片段：只把有證據的成果標成已量度（Node 18）', 'Teaching fragment: separate measured claims from pending work (Node 18)'),
    code: `const report = {
  project: 'synthetic-support-demo',
  myContribution: ['validator', 'permission tests', 'evaluation runner'],
  reused: ['UI template'],
  aiAssistance: 'drafting; reviewed and tested by the author',
  customerImpact: { status: 'not measured' },
  artifacts: ['README', 'test command', 'evaluation cases'],
  limits: ['synthetic data', 'no real customer deployment'],
};
console.log(JSON.stringify(report, null, 2));
// This describes evidence; it does not certify quality or predict a hiring decision.`,
    steps: [c('寫清楚自己的改動、引用／重用與 AI 協助。', 'State your changes, cited/reused work, and AI assistance.'), c('用架構圖、啟動指令及結果讓別人重現；說明失敗。', 'Enable reproduction with architecture, commands, and results, including failures.'), c('練習解釋 trade-off，標明合成、未量度及未完成項目。', 'Practice explaining tradeoffs and label synthetic, unmeasured, and incomplete items.')],
    dailyExamples: [
      daily('小組功課匯報', 'Presenting group coursework', '四人合作完成報告；你應說自己整理數據與做圖，不能把整份成果都說成獨自完成。', 'Four people produce a report; if you organized data and charts, say so rather than claiming you completed everything alone.', '貢獻範圍是 evidence ledger；誠實區分團隊、工具與自己的工作，才可評估你真正能做甚麼。', 'Contribution scope forms an evidence ledger. Distinguishing team/tool work from your own lets others assess your actual ability.'),
      daily('借朋友一個組裝櫃', 'Helping a friend assemble a cabinet', '朋友看完成照片仍不知怎樣做；有零件清單、步驟及你裝錯過的位置，才容易跟着完成。', 'A finished photo does not tell your friend how to assemble the cabinet; parts, steps, and known mistakes make the process reproducible.', '照片像 demo；步驟像 README；錯誤紀錄像 runbook。可重現和能解釋比漂亮展示更有證據價值。', 'The photo is a demo, steps a README, and mistakes a runbook. Reproducibility and explanation provide stronger evidence than presentation alone.'),
    ],
    topicIds: ['t1', 't10', 't13'], sourceIds: ['anthropic-applied', 'microsoft-production'],
    evidence: [c('有來源及貢獻說明的 portfolio README，別人可按指令重跑。', 'A reproducible portfolio README with sources and contribution disclosure.'), c('一頁設計取捨與事故／失敗反思，數字連到實際輸出或標明未量度。', 'A design-tradeoff and failure reflection linking numbers to actual outputs or labeling them unmeasured.')],
    interview: { question: c('這個 project 你自己做了哪部分？你會改甚麼？', 'Which parts of this project did you personally implement, and what would you change?'), answer: c('指出具體檔案、測試與設計決定，承認重用／AI 協助，展示一個可重現失敗及下一步。不要把沒有客戶的 demo 說成生產成果。', 'Identify concrete files, tests, and decisions, disclose reuse/AI help, and show one reproducible failure and next step. Do not describe a demo without customers as production impact.') },
    drill: { task: c('為 capstone 寫一頁 README，再錄或練習五分鐘 walkthrough，包含一個設計取捨、一個失敗及自己的貢獻。', 'Write a one-page capstone README and record or rehearse a five-minute walkthrough with a design tradeoff, a failure, and your contribution.'), pass: c('另一人按 README 可重跑測試；每個成果數字有輸出證據或未量度標記，能指出重用來源與自己修改的部分。', 'Another person can reproduce tests from the README; every outcome number has output evidence or an unmeasured label, and reused sources and your changes are identifiable.') },
  },
];

// Optional, role-dependent depth. No learner needs all three to apply for an applied role.
export const specialistTracks = [
  { id: 'deep-learning-cv', title: c('專門方向：Deep Learning／Computer Vision', 'Specialist: deep learning and computer vision'),
    explanation: c('適合影像／視訊或深度學習職位。OpenCV 主要提供影像處理與電腦視覺工具，可與模型一起使用，但不等於神經網絡模型本身。學習 tensors、訓練與推論、資料增強、CNN／Transformer 基礎，以及 detection／segmentation 指標；用獨立資料評估與分析光線、類別及場景切片。這是按職位選的深度，不是每位 applied AI developer 的共同門檻。', 'For image/video or deep-learning roles. OpenCV supplies image-processing and vision tools and can work with models, but is not itself a neural-network model. Learn tensors, training/inference, augmentation, CNN/Transformer foundations, and detection/segmentation metrics; evaluate independent data and slices such as lighting/classes/scenes. This is role-dependent depth, not a universal applied-AI prerequisite.'),
    evidence: c('用獲授權或合成影像建立小型 baseline，展示獨立測試、逐類錯誤與 preprocessing／模型的分工；如需套件，另用相應環境。', 'Build a small baseline with authorized/synthetic images and show independent tests, class-level errors, and the distinction between preprocessing and the model; use a separate dependency environment if needed.'), topicIds: ['t7', 't8', 't11'] },
  { id: 'training-inference', title: c('專門方向：模型調整與推論效能', 'Specialist: model adaptation and inference efficiency'),
    explanation: c('適合 fine-tuning、model serving 或 ML infrastructure 職位。先證明 prompting／RAG baseline 的限制，再研究 adapters、資料契約、訓練實驗、記憶體、quantization、batching 與 KV cache。調整後仍要量度品質、延遲、成本及回歸；速度變快不代表任務更好。可以從小模型和有限資料開始，不需要訓練 frontier model。', 'For fine-tuning, model-serving, or ML infrastructure roles. Establish limitations of prompting/RAG baselines before studying adapters, data contracts, training experiments, memory, quantization, batching, and KV caches. Measure quality, latency, cost, and regressions after changes; speed is not task quality. Start with small models and limited data rather than training a frontier model.'),
    evidence: c('一個可重現的小型對照實驗：資料版本、baseline、設定、品質與效能報告、回滾及硬件限制。', 'A reproducible small controlled experiment with data versions, baseline, settings, quality/performance reporting, rollback, and hardware limitations.'), topicIds: ['t7', 't12', 't13'] },
  { id: 'research', title: c('專門方向：研究與實驗推理', 'Specialist: research and experimental reasoning'),
    explanation: c('適合 research engineer／scientist 方向。學會讀原始論文、清楚定義假設、復現 baseline、做 ablation、設計公平比較及分析統計不確定性。區分原創發現、復現、負面結果與尚未驗證猜想；資料洩漏與 benchmark contamination 都會破壞結論。證據與可重現方法比堆砌術語重要，此方向可按學歷／研究要求另作準備。', 'For research engineer/scientist paths. Read original papers, define hypotheses, reproduce baselines, run ablations, make fair comparisons, and analyze statistical uncertainty. Distinguish novel findings, reproductions, negative results, and unverified ideas; leakage and benchmark contamination can invalidate conclusions. Evidence and reproducible methods matter more than jargon, with role-specific education/research expectations considered separately.'),
    evidence: c('一份可重現論文復現或小實驗，含假設、對照、ablation、結果、失敗與對原文的差異；沒有新發現也要誠實報告。', 'A reproducible paper reproduction or small experiment with hypotheses, controls, ablations, results, failures, and deviations from the original; report honestly even without a new finding.'), topicIds: ['t7', 't10', 't11'] },
];

export const hiringCapstone = {
  title: c('綜合作品：有權限邊界的支援 assistant', 'Capstone: a permission-aware support assistant'),
  description: c('只用合成 ticket 與 FAQ，建立從需求到恢復的可重現小系統。先有非 AI baseline，再加有證據的回答；只允許查詢與草擬，高風險動作交人批准。以下目標是教學驗收，不是僱主通過標準、正式安全認證或聘請保證。', 'Use only synthetic tickets and FAQs to build a reproducible small system from requirements through recovery. Begin with a non-AI baseline, then add evidence-grounded answers. Allow querying/drafting only and escalate risky actions for approval. These are teaching acceptance targets, not employer thresholds, security certification, or a hiring guarantee.'),
  phases: [
    c('1．界定問題：寫需求、風險、身份與權限；用固定案例量度非 AI baseline。', '1. Frame: document requirements, risks, identity, and permissions; measure a non-AI baseline on fixed cases.'),
    c('2．建立證據流程：驗證與版本化合成 FAQ，先篩權限，再檢索及回答；缺資料時明確接手。', '2. Ground: validate/version synthetic FAQs, filter permissions before retrieval/answering, and explicitly escalate missing evidence.'),
    c('3．驗證與攻擊：重跑保留評估集、權限與 tool 軌跡測試，注入壞資料、injection、timeout 及回歸。', '3. Verify and challenge: rerun held-out evals, permission/tool-trajectory tests, and inject malformed data, injection, timeouts, and regressions.'),
    c('4．部署與交接：可重現啟動，監察實際延遲／成本，演練回滾，說明自己的貢獻與未完成部分。', '4. Operate and hand over: reproduce startup, monitor measured latency/cost, rehearse rollback, and explain your contribution and incomplete work.'),
  ],
  deliverables: [
    c('需求 brief、非 AI baseline 及取捨紀錄。', 'A requirements brief, non-AI baseline, and tradeoff record.'),
    c('合成資料與 schema／版本／權限表。', 'Synthetic data with schema, versions, and a permission matrix.'),
    c('回答支持片段、來源 ID 與有界 tool trace。', 'Supporting answer passages, source IDs, and bounded tool traces.'),
    c('可重跑評估與 failure tests，含逐案結果及限制。', 'Reproducible evaluations/failure tests with case results and limitations.'),
    c('啟動／部署與回滾 runbook；安全監察與量度報告。', 'Startup/deployment and rollback runbooks with safe monitoring and measurement reports.'),
    c('Portfolio README：貢獻、重用來源、AI 協助與未量度成果。', 'A portfolio README stating contributions, reused sources, AI assistance, and unmeasured outcomes.'),
  ],
  acceptance: [
    c('同一命令輸出 baseline／候選版本逐案結果、樣本數與失敗；教學目標不冒充生產品質保證。', 'One command reports baseline/candidate case results, sample counts, and failures without claiming production quality from teaching targets.'),
    c('跨使用者及私人文件案例顯示 deny；回答只引用可讀證據，缺資料不編答案，退款等動作不自動執行。', 'Cross-user/private-document cases show denial; answers cite readable evidence only, missing evidence produces no invention, and refunds or similar actions never execute automatically.'),
    c('timeout／quota／回歸演練輸出可觀察結果，執行有上限，回滾後能辨認已恢復版本並重跑健康及評估測試。', 'Timeout/quota/regression drills produce observable results, execution is bounded, and rollback identifies the restored version and reruns health/evaluation tests.'),
    c('另一人可從 README 重現；每個成果聲稱有對應輸出或未量度標記，清楚區分自己的工作、模板、引用及 AI 協助。', 'Another person can reproduce from the README; each outcome claim links to output evidence or an unmeasured label and distinguishes your work, templates, citations, and AI help.'),
  ],
};
