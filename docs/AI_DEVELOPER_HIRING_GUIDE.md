# AI Developer Hiring Guide / AI 開發者求職指南

Reviewed / 核實日期: 2026-10-09

Read the detailed bilingual lessons at `/hiring-readiness` (rich edition) or `#/hiring-readiness` (plain Node 18 edition). Each competency includes an explanation, metaphor, two everyday scenarios, code, a drill, and evidence to discuss.
詳細雙語課堂位於 `/hiring-readiness`（豐富版）或 `#/hiring-readiness`（純 JavaScript、Node 18 版）。每項能力都有解釋、比喻、兩個生活例子、程式碼、練習同可討論嘅證據。

This is an original learning and portfolio guide, not a hiring certificate, automated candidate assessment, or promise of employment. A reviewer must inspect the work; reading a card or passing a quiz does not verify production experience.
呢份係原創學習同作品集指南，唔係招聘認證、自動候選人評分或就業保證。必須由真人審閱成果；睇完卡片或測驗合格，唔等於證明有正式環境經驗。

## Recruiter lens / 招聘角度

I would look for someone who can explain a problem, build the smallest sound solution, measure whether it works, protect users, and improve it with a team. Framework names are supporting tools—not evidence by themselves.
我會搵識講清問題、交付最細但可靠方案、量度成效、保護使用者，同團隊改善系統嘅人。識講 framework 名只係工具知識，唔係能力證據。

Start with software, data, measurement, and communication. Add LLM/RAG and bounded agents where the problem needs them. Choose a specialist track after the shared foundation; one applicant need not master every AI role.
先打好軟件、數據、量度同溝通基礎；問題真係需要時先加 LLM/RAG 同受控 Agent。之後揀一條專門路線，唔需要一個人掌握所有 AI 職位。

## Ten core competencies / 十項核心能力

### 1. Problem framing / 問題定義

- Explain: who needs the system, the decision it supports, a non-AI baseline, success metrics, failure costs, and when to stop.
- 解釋：服務邊個、支援咩決定、非 AI 基準方案、成功指標、失敗代價，同停止條件。
- Everyday connection: choose a bus route before buying a car. The route is the need; the vehicle is an implementation choice.
- 生活對應：先決定要去邊，再決定搭巴士定買車。目的地係需求，交通工具先係實作選擇。
- Evidence / 證據: a one-page brief and an honest baseline comparison / 一頁需求說明同誠實基準比較。

### 2. Software engineering / 軟件工程

- Explain: readable code, types and schemas, HTTP APIs, SQL, Git review, deterministic tests, debugging, and failure handling.
- 解釋：可讀程式碼、型別同 schema、HTTP API、SQL、Git review、確定性測試、除錯同錯誤處理。
- Everyday connection: a restaurant needs a reliable order ticket before hiring a creative chef. An API contract is that ticket.
- 生活對應：餐廳請創意廚師之前，都要有可靠落單紙。API 合約就係張落單紙。
- Evidence / 證據: a small reviewed change, tests, and a bug reproduction / 一個受審閱改動、測試同 bug 重現步驟。

### 3. ML foundations / 機器學習基礎

- Explain: features, targets, training and inference, overfitting, held-out data, leakage, precision/recall, and threshold trade-offs.
- 解釋：特徵、目標、訓練同推論、過擬合、保留資料、洩漏、precision/recall，同門檻取捨。
- Everyday connection: practising the exact exam answers is memorisation; a new question checks generalisation.
- 生活對應：操同一份試卷答案可以只係死記；新題目先測到可唔可以舉一反三。
- Evidence / 證據: a simple baseline, leakage-safe split, and error analysis / 簡單基準、無洩漏分割同錯誤分析。

### 4. Data engineering / 數據工程

- Explain: schemas, quality checks, deduplication, provenance, consent, permissions, versioning, and deletion propagation.
- 解釋：schema、質素檢查、去重、來源、同意、權限、版本，同刪除點樣傳到衍生資料。
- Everyday connection: food labels record ingredients, expiry, and supplier; a data record needs comparable traceability.
- 生活對應：食物標籤記錄材料、到期日同供應商；數據都要有相似嘅可追溯記錄。
- Evidence / 證據: a data contract and a failing quality-check fixture / 數據合約同一個會觸發質素檢查嘅測試資料。

### 5. LLM and RAG / LLM 同檢索增強生成

- Explain: grounded answers, chunking/retrieval, citations, freshness, structured outputs, abstention, and cost constraints.
- 解釋：有根據答案、切分同檢索、引用、新鮮度、結構輸出、拒答，同成本限制。
- Everyday connection: an open-book exam still needs the right page and correct interpretation; having a book is not enough.
- 生活對應：開卷考試都要搵啱頁同理解啱內容；有本書唔等於一定答啱。
- Evidence / 證據: retrieval and answer metrics reported separately / 分開報告檢索同答案指標。

### 6. Agent design / Agent 設計

- Explain: bounded loops, typed tools, permissions, approval, cancellation, durable state, and safe repeated actions.
- 解釋：有上限迴圈、工具合約、權限、批核、取消、持久狀態，同安全重試。
- Everyday connection: a shopping assistant may suggest a purchase, but cannot spend unlimited money without approval.
- 生活對應：購物助手可以建議買嘢，但唔可以未批核就無限花錢。
- Evidence / 證據: scripted-model tests for stopping, denial, and retries / 模擬模型測試停止、拒絕同重試情況。

### 7. Evaluation / 評估

- Explain: frozen representative cases, baselines, rubrics, failure slices, uncertainty, grader checks, and release gates.
- 解釋：凍結代表性案例、基準、評分準則、失敗分層、不確定性、評分器核對，同發布關卡。
- Everyday connection: tasting one spoon does not prove every batch is safe; test different batches and record failures.
- 生活對應：試一啖唔代表每批都安全；要測唔同批次，同記低失敗。
- Evidence / 證據: versioned cases, raw results, and per-slice comparison / 有版本案例、原始結果同分層比較。

### 8. Security and safety / 保安同安全

- Explain: authentication versus authorization, tenant isolation, injection, secrets, output validation, and escalation.
- 解釋：身份驗證同授權分別、租戶隔離、注入攻擊、秘密、輸出驗證，同升級處理。
- Everyday connection: showing a building pass does not grant access to every resident's flat.
- 生活對應：有大廈出入證，唔代表可以入每個住戶屋企。
- Evidence / 證據: a threat model and negative permission tests / 威脅模型同拒絕越權嘅測試。

### 9. Operations / 維運

- Explain: traces, p95 latency, cost per successful task, quotas, failure isolation, deployment, rollback, and incident learning.
- 解釋：追蹤、p95 延遲、每次成功任務成本、配額、故障隔離、部署、回滾，同事故學習。
- Everyday connection: fire alarms and an exit plan matter even when a building's normal entrance works well.
- 生活對應：平時入門好順，都仍然需要火警鐘同逃生計劃。
- Evidence / 證據: a reproducible local load report and rollback drill / 可重現本機負載報告同回滾演習。

### 10. Communication and ownership / 溝通同承擔

- Explain: requirements, architecture trade-offs, code review, documentation, feedback, and your own contribution.
- 解釋：需求、架構取捨、程式碼審閱、文件、回饋，同自己實際貢獻。
- Everyday connection: a group meal needs clear responsibilities; saying “we cooked” does not say who prepared what.
- 生活對應：一班人煮飯要分工；講「我哋煮咗」未解釋到你負責咩。
- Evidence / 證據: an ADR, a reviewed PR, and a contribution statement / 架構決策記錄、受審閱 PR，同個人貢獻說明。

## Choose a specialist track / 揀一條專門路線

- Deep learning / computer vision: tensors, gradients, training loops, image preprocessing, augmentation, robustness, and task-specific error analysis. OpenCV is a vision toolkit; using it does not itself mean training a deep-learning model.
- 深度學習／電腦視覺：tensor、gradient、訓練迴圈、影像前處理、augmentation、穩健性，同任務錯誤分析。OpenCV 係視覺工具庫；使用佢唔等於有訓練深度學習模型。
- Fine-tuning / inference: justified adaptation, licensed data, leakage-safe splits, adapters, quantization, memory, serving benchmarks, and rollback. Show improvement over a simpler baseline before claiming value.
- 微調／推論：合理改模型原因、授權數據、無洩漏分割、adapter、量化、記憶體、服務基準同回滾。先證明比簡單方案改善，再講價值。
- Research: a precise hypothesis, controlled experiments, ablations, uncertainty, reproducibility, and limitations. Reproducing a result honestly is stronger than claiming novelty without evidence.
- 研究：清楚假設、受控實驗、消融分析、不確定性、可重現性同限制。誠實重現結果，比無證據聲稱創新更可信。

## One portfolio capstone / 一個作品集整合項目

Build a refund-policy assistant using synthetic orders and policies, a mock model, and no real payment actions. Label it a local prototype unless it has actually been independently reviewed and deployed.
用合成訂單同政策、模擬模型，建立退款政策助手；唔做真實付款。未真係被獨立審閱同部署之前，明確標示係本機原型。

1. Define users, non-AI baseline, success metric, and prohibited outcomes / 定義使用者、非 AI 基準、成功指標同禁止結果。
2. Enforce order ownership before retrieval; retain policy/version evidence / 檢索前強制訂單擁有權，保留政策同版本證據。
3. Return a typed answer or abstain; propose rather than execute refunds / 回傳合約格式答案或拒答，只建議而唔執行退款。
4. Test normal, missing-data, bilingual, injection, unauthorized, timeout, and replay cases / 測正常、缺資料、雙語、注入、越權、逾時同重試。
5. Report quality by slice, raw latency/cost data, configuration, and limitations / 分層報質素、原始延遲同成本、設定，同限制。
6. Rehearse rollback; document an injected failure and its prevention / 演習回滾，記錄一個注入故障同預防方法。

Submit a runnable README, pinned environment, diagram, ADR, reviewed diff, tests/CI, dataset manifest, evaluation report, redacted trace, and rollback runbook. Link each claim to its artifact; never publish secrets or private customer records.
提交可執行 README、固定環境、圖、ADR、受審閱改動、測試／CI、數據 manifest、評估報告、脫敏 trace，同回滾指引。每個主張連到證據；永遠唔公開秘密或私人客戶記錄。

## Interview rubric / 面試討論準則

Use these discussion levels separately for each competency—not as a hiring probability or universal pass score. The reviewer chooses role-relevant criteria and verifies artifacts.
逐項用以下層次討論，唔好轉成聘用機率或通用合格分。審閱者按職位揀相關準則，同核對證據。

- Explain: correctly describes the idea and its limitations / 講得清：正確解釋概念同限制。
- Apply: builds a small solution and tests expected and failure cases / 用得到：建立小方案，同測正常及失敗情況。
- Verify: reproduces results, compares a baseline, and explains errors / 驗得到：重現結果、比較基準，同解釋錯誤。
- Own: handles trade-offs, review, rollout, recovery, and follow-up / 承擔到：處理取捨、審閱、發布、復原，同跟進。

A junior can be strong with a bounded project, honest reasoning, working tests, and good response to feedback. Experienced roles may require independent ownership, production incidents, scale, and cross-team delivery; simulations are not substitutes for claiming those experiences.
初級候選人可以靠範圍清楚嘅項目、誠實推理、有效測試，同接受回饋表現出實力。有經驗職位可能要求獨立承擔、正式事故、規模同跨團隊交付；模擬演習唔可以冒充呢啲經歷。

Ask: “What failed?”, “Why not ordinary code?”, “How did you split the data?”, “Which metric hides harm?”, “What does the host enforce?”, and “What exactly did you change?” A good answer points to a concrete artifact and admits what is not yet known.
可以問：「邊度失敗過？」「點解唔用普通程式？」「數據點分？」「邊個指標可能掩蓋傷害？」「Host 強制咩？」「你實際改咗咩？」好答案會指向具體證據，同承認未知。

## Illustrative role sources / 參考職位來源

The following official postings were checked on 2026-10-09. They illustrate experienced applied engineering, production-safety, and post-training paths—not a market survey or universal junior requirements. Openings and requirements can change.
以下官方職位於 2026-10-09 核對，用作有經驗應用工程、正式安全維運，同後訓練路線例子；唔係市場調查或通用初級門檻。招聘狀態同要求會變。

- [Anthropic — Applied AI Engineer, Startups](https://job-boards.greenhouse.io/anthropic/jobs/5432575008): hands-on engineering, evaluations, architecture, and technical communication / 實作工程、評估、架構同技術溝通。
- [Microsoft AI — Production Safety](https://job-boards.greenhouse.io/microsoftcorporation/jobs/4434528009): reliable services, observability, safeguards, staged release, and recovery / 可靠服務、可觀測性、防護、分階段發布同復原。
- [Microsoft AI — Safety Post-training](https://job-boards.greenhouse.io/microsoftcorporation/jobs/4430492009): reproducible data/evaluation/training workflows and experimental judgment / 可重現數據、評估同訓練流程，以及實驗判斷。
