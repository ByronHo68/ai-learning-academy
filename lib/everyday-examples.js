// Two everyday scenarios per workshop, with an explicit connection to the concept.
const c = (zh, en) => ({ zh, en });
const d = (zh, en, storyZh, storyEn, connectionZh, connectionEn) => ({
  title: c(zh, en), story: c(storyZh, storyEn), connection: c(connectionZh, connectionEn),
});

export const everydayExamples = {
  'Trust boundaries': [
    d('屋苑訪客登記', 'Checking a visitor at home', '有人話「我係你朋友」想入屋，保安仍會向你確認；一句自我介紹唔夠。', 'A visitor says they are your friend. Building security still checks with you before letting them in.', '訪客說話係輸入；你嘅確認係授權。Backend 同樣要核對用戶聲稱。', 'The visitor supplies a claim; your confirmation grants access. A backend must also verify user claims.'),
    d('代取外賣', 'Collecting someone else’s takeaway', '你知道隔離枱訂單號碼，但店員仍核對收據先交餐。知道編號唔代表擁有訂單。', 'You know another table’s order number, but the shop checks the receipt before handing over the food.', '訂單號係資料，收據係 ownership 證據；每次取資料都要驗權限。', 'An order ID is data; the receipt proves ownership. Each retrieval needs an access check.'),
  ],
  'Async work and cancellation': [
    d('洗衣時煮飯', 'Cooking while laundry runs', '洗衣機運行時你可以煮飯，唔使望住部機；突然要出門就要決定停邊項。', 'While the washing machine runs, you cook dinner instead of watching it. Leaving early means deciding what to stop.', '等待期間做其他工作係 async；取消要通知真正做緊工作嘅一方。', 'Doing other work while waiting is async. Cancellation must reach the component actually doing the work.'),
    d('取消的士預約', 'Cancelling a taxi booking', '你關掉預約畫面，司機可能仍在路上。要用取消功能，等服務確認收到。', 'Closing a taxi-booking screen may leave the driver on the way. You need a cancellation request and acknowledgment.', '關 UI 唔等於 backend 停工；cancel signal 要一路傳到下游。', 'Closing a UI does not stop backend work. The cancellation signal must reach downstream operations.'),
  ],
  'Deterministic code vs LLM': [
    d('超市找續', 'Making change at the supermarket', '買 $32 嘅貨畀 $50，收銀用減法找 $18；介紹送禮選擇先需要理解偏好。', 'For a $32 purchase paid with $50, subtraction gives $18 change. Gift suggestions require interpreting preferences.', '固定計算用 code；含糊語意先考慮 LLM，再驗證結果。', 'Use code for fixed calculations; consider an LLM for ambiguous meaning, then check its output.'),
    d('鬧鐘定行程建議', 'An alarm versus itinerary advice', '每日七點響鬧鐘係固定規則；問「雨天點安排約會」就有好多合理答案。', 'A daily seven-o’clock alarm follows a rule. Planning a rainy-day date has several reasonable answers.', '可以精確列出規則就 deterministic；開放式文字任務先有模型價值。', 'Precisely enumerable rules suit deterministic code; open-ended language tasks can benefit from a model.'),
  ],
  'Python environments and reproducible installs': [
    d('兩個烘焙工具箱', 'Two baking toolboxes', '蛋糕課用大模，曲奇課用細模，各自放一箱；同學照清單買先整到同款。', 'Cake class needs large molds and biscuit class small ones. Separate boxes and matching lists reproduce the same setup.', '工具箱係 virtual environment；清單連版本係 lock file，隔離加可重現。', 'The toolbox is a virtual environment; the versioned list is a lockfile. Together they isolate and reproduce dependencies.'),
    d('旅行執喼清單', 'A packing list for a trip', '只寫「帶充電器」可能帶錯插頭；寫明型號同規格，朋友先可以照住準備。', '“Pack a charger” may mean the wrong plug. Recording the model and specification lets a friend prepare the same kit.', 'Package 名稱不足以重建環境；版本、runtime 同安裝方式亦要固定。', 'Package names alone cannot recreate an environment; record versions, runtime, and installation method too.'),
  ],
  'A production API contract': [
    d('訂生日蛋糕', 'Ordering a birthday cake', '你填尺寸、口味、取貨日，店員核對過敏原，缺資料會問清楚，唔會亂出貨。', 'You provide size, flavor, and pickup date. The baker checks allergies and asks about missing details before making it.', '訂單表係 request schema；取貨承諾、拒單原因同成品要求係 API contract。', 'The form is the request schema; delivery promises, rejection reasons, and cake requirements form the API contract.'),
    d('圖書館借書', 'Borrowing a library book', '借書要有效證、未超上限同有庫存；失敗會講清楚原因，成功有到期日。', 'Borrowing needs a valid card, available stock, and room under the loan limit. Success includes a due date.', '身份、限額、錯誤碼同 response 欄位都要預先講明。', 'Identity, limits, error codes, and response fields must be defined in advance.'),
  ],
  'Git: commits, branches, and recoverable workflows': [
    d('改旅行計劃', 'Revising a travel plan', '你保存「原計劃」，另開「雨天版本」，朋友批准後先換成大家用嘅版本。', 'You save the original trip plan, draft a rainy-day version separately, and adopt it after your friends review it.', '存檔係 commit；另開版本係 branch；review 後合併係 merge。', 'The saved state is a commit; the alternative is a branch; adopting the reviewed change is a merge.'),
    d('作文修改歷史', 'Essay revision history', '每次修改標記「加例子」或「改結論」，老師可以睇到原因，亦可回復上一稿。', 'Label essay revisions “add examples” or “revise conclusion” so a teacher can understand changes and restore an earlier draft.', '細 commit 同清楚 message 令變更易 review，出錯易回復。', 'Small commits and clear messages make changes easy to review and recover.'),
  ],
  'Python async: waiting is not parallel computation': [
    d('侍應等廚房', 'A waiter waiting for the kitchen', '侍應落單後去招呼第二枱；但如果親自入廚房炒餸，其他枱仍要等。', 'After placing an order, a waiter serves another table. If they cook the meal themselves, those tables still wait.', '等出餐係 I/O；親自炒餸係 CPU。Async 釋放等待，唔會令重計算自動平行。', 'Waiting for food is I/O; cooking is CPU work. Async frees waiting time, but does not automatically parallelize computation.'),
    d('只准三煲湯', 'Only three pots at once', '你有三個爐頭，十個人要湯都唔可以同時開十煲；後面要排隊。', 'With three burners, ten soup orders cannot all cook at once. The rest must wait.', 'Semaphore 限制同時工作量；無界 concurrency 會超出下游容量。', 'A semaphore limits work in flight; unbounded concurrency can exceed downstream capacity.'),
  ],
  'HTTP/TCP: the real path of an API request': [
    d('寄包裹', 'Sending a parcel', '先搵地址，再安排運送、核對身份、到倉庫處理，最後收回簽收通知。', 'A parcel needs address lookup, transport, identity checks, warehouse handling, and a delivery receipt.', 'DNS 搵地址、TCP 搬運、TLS 驗身份同加密；HTTP 定義請求與回覆。', 'DNS finds the address, TCP transports bytes, TLS authenticates and encrypts, and HTTP defines the request and response.'),
    d('重按付款掣', 'Pressing Pay twice', '網絡慢，你按付款兩次；店舖用同一交易編號回覆原結果，唔再扣一次。', 'A slow network makes you press Pay twice. The shop uses one transaction ID and returns the original result.', 'Idempotency key 識別同一意圖，安全處理 retry；單靠 POST 唔會防重。', 'An idempotency key identifies one intent and makes retries safe; POST alone does not prevent duplicates.'),
  ],
  'Core CS: complexity, memory, and I/O set the ceiling': [
    d('搵電話聯絡人', 'Finding a phone contact', '一千個姓名逐個翻好慢；按姓名搜尋索引，可以直接縮細範圍。', 'Scanning a thousand contacts one by one is slow. A name index narrows the search immediately.', '資料結構改變查找成本；重複掃描會隨資料量增加而變慢。', 'Data structures change lookup cost; repeated scans become slower as the dataset grows.'),
    d('細枱整理照片', 'Sorting photos on a small table', '枱面只放到一百張相，搬幾千張出來會跌；分批從相簿取出先可處理。', 'A table holds only a hundred photos. Sorting thousands requires fetching manageable batches from albums.', '枱面係 RAM，相簿係 storage；batching 減記憶體需求，但仍有 I/O 成本。', 'The table is RAM and the album is storage. Batching reduces memory needs but still incurs I/O.'),
  ],
  'Token prediction': [
    d('手機自動完成', 'Phone autocomplete', '輸入「今晚食」後，手機提議「飯」；佢根據字句模式猜下一部分，唔知道你真正晚餐。', 'After “tonight we eat,” your phone suggests “dinner.” It predicts a continuation without knowing your actual meal.', 'Token prediction 估下一段文字；流暢或常見唔代表符合現實。', 'Token prediction estimates the next text piece; fluency and frequency do not guarantee factual truth.'),
    d('猜朋友口頭禪', 'Guessing a friend’s catchphrase', '朋友成日講「食咗飯未」，你聽到「食咗」就猜後半；今日佢可能講「藥未」。', 'A friend often says “have you eaten dinner?” You guess the ending, but today they might mean medicine.', '模型用 context 改變概率；熟悉模式仍可能估錯當下意思。', 'Context changes the model’s probabilities; familiar patterns can still lead to a wrong continuation.'),
  ],
  'A prompt is a draft specification': [
    d('叫朋友買早餐', 'Asking a friend to buy breakfast', '「買啲嘢食」太模糊；「買兩個無花生包，$30 內，冇貨就打電話」先清楚。', '“Buy food” is vague. “Two peanut-free buns, under $30; call if unavailable” gives usable instructions.', '數量係輸出要求，無花生係限制，冇貨打電話係 failure behavior。', 'Quantity specifies output, peanut-free sets a constraint, and calling when unavailable defines failure behavior.'),
    d('請人影相', 'Asking someone to take a photo', '你講明全身、橫向、要見背景，再畀一張示範；對方先知道你要咩效果。', 'You ask for a full-body landscape photo with the background visible and show a sample.', '任務、格式、context 同例子令 prompt 更清楚；結果仍要核對。', 'Task, format, context, and examples clarify a prompt; the result still needs checking.'),
  ],
  'Structured output': [
    d('填送貨表', 'Filling a delivery form', '地址、電話、日期各有格；全部格都填咗，電話仍可能填錯，要再核對。', 'Address, phone, and date have separate fields. A completed form can still contain the wrong phone number.', 'Schema 驗形狀同類型；語意驗證先知道內容是否合理。', 'A schema checks shape and types; semantic validation checks whether the content makes sense.'),
    d('食譜材料表', 'A recipe ingredient sheet', '每行都寫材料、數量、單位，容易購物；「鹽：兩公斤」格式啱但份量錯。', 'Ingredient, quantity, and unit make shopping easy. “Salt: two kilograms” follows the format but is an unreasonable amount.', 'Structured JSON 易交俾程式處理，但合法欄位唔等於正確決定。', 'Structured JSON is easy for software to process, but valid fields do not ensure a correct decision.'),
  ],
  'Multi-model APIs with OpenRouter': [
    d('同一 App 訂唔同餐廳', 'One app, several restaurants', '同一落單介面可以揀粥店或薄餅店，但價格、營業時間同過敏原各有不同。', 'One ordering interface lets you choose congee or pizza, but prices, hours, and allergens differ.', 'OpenRouter 統一 API 入口；每個 model 能力、費用同資料政策仍要個別確認。', 'OpenRouter provides a common API entry; each model’s capability, cost, and data policy still needs checking.'),
    d('旅行社代訂航班', 'Booking through a travel agent', '旅行社畀一張統一表格，但航空公司嘅行李額同改票規則唔會因此一樣。', 'A travel agent uses one form, while each airline keeps its own baggage and change rules.', '相容 interface 降低接駁成本，唔會令所有 provider contract 相同。', 'A compatible interface reduces integration work; it does not make every provider contract identical.'),
  ],
  'Provider fallback is a policy decision': [
    d('換餐廳要顧過敏', 'Changing restaurants with an allergy', '原餐廳關門，你只揀能確認無花生嘅後備店，唔會求其搵一間近嘅。', 'When your restaurant closes, you choose a backup that can confirm peanut-free food, not merely the closest one.', 'Fallback 必須符合原本資料、安全同功能要求，availability 只係其中一項。', 'Fallback must preserve data, safety, and capability requirements; availability is only one consideration.'),
    d('老師唔批嘅作業', 'A teacher declines an assignment', '老師因題目不合規而拒絕，你應修正題目；換個唔檢查嘅老師唔係合適後備。', 'If a teacher declines an unsuitable assignment, revise it rather than finding someone who ignores the reason.', '安全 refusal 同服務故障要分開；只有符合政策嘅錯誤先可 fallback。', 'Separate safety refusals from service failures; fallback applies only to policy-approved failure classes.'),
  ],
  'Chunking and semantic units': [
    d('把食譜分卡', 'Dividing a recipe into cards', '材料同相應做法放一張卡；在句子中間剪開，朋友會唔知兩杯水配邊一步。', 'Keep ingredients with their relevant instructions. Cutting mid-sentence can hide which step needs two cups of water.', 'Chunk 要保留完整語意；太碎失 context，太大又難精準 retrieve。', 'Chunks should preserve meaning: too small loses context, too large makes retrieval less precise.'),
    d('溫習按小節', 'Studying one section at a time', '一本書按小節做筆記，遇到承上啟下嘅定義，就在下一張再留一小段。', 'Make notes by section, retaining a small overlap when a definition carries into the next section.', '按語意分段加少量 overlap，幫檢索命中仍保留所需背景。', 'Semantic splitting with limited overlap helps retrieved passages retain the background they need.'),
  ],
  'Hybrid retrieval': [
    d('搵茶餐廳', 'Finding a café', '你既搜精確店名，亦搜「近地鐵、安靜、有插頭」；兩種線索一齊用。', 'Search both the exact café name and “quiet, near the station, with power sockets.” Combine the clues.', 'Keyword 找精確字詞；semantic search 找意思；hybrid 合併兩邊。', 'Keyword retrieval finds exact terms, semantic retrieval finds meaning, and hybrid retrieval combines them.'),
    d('搵一張舊收據', 'Finding an old receipt', '你記得單號 A17，同時記得係買雨具；單號找得準，意思搜尋補上記錯字嘅情況。', 'You remember receipt A17 and that it involved rain gear. Exact IDs help, while meaning covers imperfect wording.', 'Exact identifier 同語意線索互補；排名合併後仍要核對來源。', 'Exact identifiers and meaning complement each other; merged rankings still require source checks.'),
  ],
  'GraphRAG relationship reasoning': [
    d('家庭關係圖', 'A family relationship chart', '「阿明識阿玲」同「阿玲係阿芬姐姐」放在關係圖，先容易追到兩步關係。', 'A chart linking Ming to Ling and Ling to her sister Fan makes a two-hop relationship easy to follow.', 'Graph 保存 entity 同 relation，方便多步查詢；邊嘅類型不能亂推。', 'A graph stores entities and relations for multi-hop queries; edge types must not be casually inferred.'),
    d('朋友旅行安排', 'Friends planning a trip', '甲有車、乙有帳篷、丙同甲同區；連起人同資源，比一堆散訊息易安排。', 'One friend has a car, another a tent, and a third lives nearby. Linked people and resources simplify planning.', '關係連結有助跨文件整合；每項關係仍要有原訊息做證據。', 'Relations help connect facts across documents, and each relation still needs evidence from its original message.'),
  ],
  'Evaluate retrieval and generation separately': [
    d('買餸定煮餸出錯', 'Shopping error or cooking error?', '晚餐冇西蘭花：要先查有冇買漏，再查廚師有冇漏煮，兩種修法唔同。', 'Dinner lacks broccoli. Check whether the shopper missed it or the cook left it out; the fixes differ.', 'Retrieval 負責取證據；generation 負責用證據答，分開評估先搵到根因。', 'Retrieval supplies evidence; generation uses it. Evaluate each stage to locate the cause.'),
    d('查時刻表再覆朋友', 'Looking up a timetable for a friend', '你查咗錯站，或者查啱站但讀錯時間，都會令朋友遲到；要分兩步核對。', 'You may look up the wrong station or misread the right timetable. Check lookup and explanation separately.', '先測是否取到正確 passage，再測答案有冇忠於 passage。', 'First test whether the right passage was retrieved, then whether the answer faithfully used it.'),
  ],
  'RAG updates, deletion, and permissions': [
    d('家庭共享購物清單', 'A shared household shopping list', '奶已買好就刪清單；舊 screenshot 仍寫要買，照住買會重複。其他家庭亦唔應睇到。', 'Remove milk after buying it. An old screenshot can cause duplicate purchases, and other households should not see your list.', '來源、index 同 cache 都要同步更新；tenant filter 控制可見範圍。', 'Source, index, and cache must update together; tenant filters control visibility.'),
    d('換咗新巴士時間表', 'A replacement bus timetable', '新時間表生效，車站撤走舊表；司機私人電話表唔會同時公開。', 'When a new bus timetable takes effect, the old one is removed; drivers’ private contact sheets remain restricted.', 'Version、有效期、撤回同 ACL 先篩選，再做相關度排名。', 'Filter versions, effective dates, withdrawals, and access rights before ranking relevance.'),
  ],
  'GraphRAG: build from evidence, then route the question': [
    d('從聚會訊息畫人脈圖', 'Building a map from party messages', '兩個暱稱可能係同一人，先確認再合併；每條「帶蛋糕」關係都留訊息位置。', 'Two nicknames may identify one person. Confirm before merging, and keep the message behind each “bringing cake” link.', 'Canonicalization 合併身份；provenance 保留 edge 證據，模型提議要先驗。', 'Canonicalization merges identities; provenance preserves edge evidence, and model proposals require validation.'),
    d('問一個人定整個聚會', 'One guest or the whole party?', '問「阿強帶咩」只睇佢附近；問「大家偏好咩食物」就彙總各組。', '“What is Keung bringing?” examines his local links. “What food does everyone prefer?” summarizes groups.', 'Local query 跟 entity/subgraph；global query 跟 community 摘要。', 'Local queries use entities and subgraphs; global queries use community summaries.'),
  ],
  'PostgreSQL: transactions, indexes, and locks': [
    d('兩人搶最後一張票', 'Two people want the last ticket', '兩人同時見到最後一張票，售票員先鎖定並完成付款，唔可以賣兩次。', 'Two buyers see the last ticket. The seller reserves it while completing payment so it cannot be sold twice.', 'Transaction 同 lock 保護 concurrent update；constraint 守住唯一性。', 'Transactions and locks protect concurrent updates; constraints enforce uniqueness.'),
    d('書櫃目錄', 'A bookshelf catalog', '有作者索引，搵書更快；每次放新書亦要更新索引，唔係免費加速。', 'An author index speeds up finding books, but each new book also requires an index update.', 'Database index 換取讀取速度，同時增加儲存同寫入成本。', 'A database index improves reads while adding storage and write costs.'),
  ],
  'Redis: a cache is a copy, not the truth': [
    d('記低雪櫃有咩', 'A note about the fridge', '你寫低有兩盒奶，屋企人飲咗一盒，便利貼就過時；打開雪櫃先知實況。', 'Your note says two cartons of milk. Someone drinks one, making the note stale; the fridge holds the current truth.', 'Cache 係快讀副本，要 TTL 或 invalidation；正式資料另有來源。', 'A cache is a fast copy needing TTL or invalidation; authoritative data has a separate source.'),
    d('大家同時問庫存', 'Everyone asks about stock together', '便利貼過期時十人一齊問媽媽，好嘈；派一人查完更新，其他人等。', 'When the stock note expires, ten people ask Mum at once. One checks and updates it while the others wait.', 'Single-flight 或短鎖防 cache stampede，減少同一時間重算。', 'Single-flight work or a short lock prevents a cache stampede and redundant recomputation.'),
  ],
  'The agent loop': [
    d('煮湯試味', 'Tasting soup as you cook', '你想湯夠味：試一啖、決定加鹽、攪勻再試，夠味就停止。', 'You taste soup, decide to add salt, stir, and taste again. Once it is right, you stop.', '目標 → 決策 → tool action → observation，重複到完成或碰到上限。', 'Goal, decision, tool action, and observation repeat until completion or a limit is reached.'),
    d('搵唔見鎖匙', 'Looking for lost keys', '先查袋，再查枱，見到線索再換地方；搵十分鐘仍冇就請家人幫手。', 'Check your bag, then the table, and follow clues. After ten unsuccessful minutes, ask a family member for help.', 'Observation 改變下一步；step/time budget 同 handoff 防止無限循環。', 'Observations guide the next step; step and time budgets plus handoff prevent endless loops.'),
  ],
  'Tool contracts': [
    d('洗衣機操作面板', 'A washing-machine panel', '面板只收模式、溫度同時間；你輸入「幫我乾洗皮鞋」唔係支援功能。', 'The panel accepts mode, temperature, and time. “Dry-clean my leather shoes” is outside its supported functions.', 'Tool 有明確名稱、arguments 同能力範圍，超出合約要報錯。', 'A tool defines its name, arguments, and capability range; unsupported requests should fail explicitly.'),
    d('預約理髮', 'Booking a haircut', '表格收日期、髮型師同電話，成功回 bookingId；冇空位就回明確狀態。', 'The form accepts date, stylist, and phone. Success returns a booking ID; no availability produces a clear status.', 'Input/output schema 同失敗格式令 agent 知道點調用、點處理結果。', 'Input, output, and error schemas tell the agent how to call a tool and interpret its result.'),
  ],
  'MCP and A2A boundaries': [
    d('插座定同事分工', 'A socket versus a coworker', '電器插頭提供標準接駁；請另一位同事完成一份報告，就有任務、進度同交付物。', 'A socket connects an appliance. Asking a coworker to deliver a report introduces a task, progress, and a deliverable.', 'MCP 接駁工具/資料能力；A2A 協調 agent 任務，兩者仍要授權。', 'MCP connects tools and data capabilities; A2A coordinates agent tasks, and both still require authorization.'),
    d('旅館房卡', 'A hotel room card', '房卡用標準感應方式，但只開你嗰間房；識接駁唔等於可以入全部房。', 'A room card uses a standard reader but opens only your room. Knowing the interface does not grant all-room access.', 'Protocol 解決互通；application 決定 scope、身份同可用能力。', 'Protocols enable interoperability; the application determines identity, scopes, and permitted capabilities.'),
  ],
  'Agent harness and loop engineering': [
    d('單車手同煞車', 'A cyclist and the brakes', '單車手決定方向，但煞車、頭盔同限速保護行程，唔靠車手每次記得安全。', 'A cyclist chooses the route; brakes, a helmet, and speed limits help keep the ride under control.', '模型作決策；harness 管工具、budget、permission、stop 同 error recovery。', 'The model proposes decisions; the harness manages tools, budgets, permissions, stopping, and recovery.'),
    d('烘焙計時器', 'A baking timer', '你決定焗幾耐，但爐嘅最高溫、timer 同過熱保護仍由設備限制。', 'You choose baking time, while maximum temperature, timers, and overheating protection are enforced by the oven.', 'Host enforce 硬上限；prompt 提醒本身唔能保證 loop 會停止。', 'The host enforces hard limits; a reminder in the prompt cannot guarantee the loop stops.'),
  ],
  'Tool-security attack lab': [
    d('外賣袋入面嘅假字條', 'A fake note inside takeaway', '餐袋夾張「請把銀行密碼交司機」；你會當可疑內容，唔會當店舖授權。', 'A takeaway bag contains “give the driver your banking password.” You treat it as suspicious content, not authorization.', '外部文件可有 injection；內容唔能改變 host 工具權限。', 'External content may contain injection; it cannot change host tool permissions.'),
    d('測試陌生人借鎖匙', 'Testing a stranger’s key request', '演習請人假扮維修員借鎖匙；要確認保安真正拒絕，唔只講「我會小心」。', 'A drill has someone pose as a technician requesting keys. Verify security refuses the request, beyond promising to be careful.', 'Attack lab 要以執行紀錄證明副作用被擋，唔只看模型話術。', 'An attack lab proves blocked side effects through execution records, beyond the model’s wording.'),
  ],
  'Deep Agents: context offloading and delegation': [
    d('整理旅行資料', 'Organizing travel research', '機票細節存檔、群組舊對話寫摘要，酒店比較交朋友，最後收一份短建議。', 'Store flight details, summarize old group messages, and ask a friend to compare hotels and return a short recommendation.', '存檔係 offload；壓縮舊訊息係 summarize；獨立推理任務係 delegation。', 'Saving details is offloading, condensing messages is summarization, and isolated reasoning is delegation.'),
    d('整晚餐分工', 'Sharing dinner preparation', '你請朋友整甜品並講預算同過敏原；唔會為每一粒洋蔥都叫另一人開工。', 'Ask a friend to make dessert with a budget and allergy constraints; do not delegate every onion slice separately.', 'Subagent 要窄 task、input、tools 同 handoff；delegation 有協調成本。', 'A subagent needs a narrow task, inputs, tools, and handoff; delegation has coordination costs.'),
  ],
  'MCP gateway: identity, capability, quota, and audit': [
    d('健身中心櫃台', 'A gym reception desk', '職員核會員證、准入區域同剩餘課堂次數，再記錄入場；會員唔可自己填「VIP」。', 'Reception checks membership, permitted areas, and remaining class credits, then records entry. A guest cannot simply write “VIP.”', 'Gateway 由認證取 identity，再 enforce capability、quota 同 audit。', 'A gateway derives identity from authentication, then enforces capabilities, quotas, and audit records.'),
    d('共享廚房借設備', 'Borrowing shared kitchen equipment', '每戶只可借已批准設備，有時間限額；失敗會記原因，唔抄低住戶私人聊天。', 'Each household can borrow approved equipment within a time limit. Failures are recorded without copying private conversations.', 'Allowlist 同 timeout 限能力；audit 只留必要安全 metadata。', 'Allowlists and timeouts bound capability; audits retain only necessary safe metadata.'),
  ],
  'Prompt registries and semantic service boundaries': [
    d('家族食譜版本', 'Versions of a family recipe', '祖母食譜 v2 減咗糖，要寫明版本；家人試過批准後先用作聚會標準。', 'Grandma’s recipe v2 uses less sugar. Label the version and adopt it for gatherings after the family approves it.', 'Prompt registry 存 immutable version、批准同評測；request 指明用邊版。', 'A prompt registry stores immutable versions, approvals, and evaluations; requests specify which version to use.'),
    d('不同家庭嘅喜好', 'Different households’ preferences', '甲家無花生食譜唔可直接套乙家海鮮過敏；共享配方仍要各自條件。', 'One household’s peanut-free recipe may not suit another’s seafood allergy. Shared recipes still need household-specific constraints.', '共享服務要 tenant boundary；memory/cache 唔可跨身份或 policy 混用。', 'Shared services need tenant boundaries; memory and caches must not cross identities or policies.'),
  ],
  'Runnable pipeline': [
    d('早上出門順序', 'Your morning routine', '起床 → 洗面 → 換衫 → 出門；每一步完成嘅結果係下一步需要嘅狀態。', 'Wake up, wash, dress, then leave. Each step produces the state needed by the next.', 'Pipeline 明確連接 input/output；前一步失敗要有出口，唔好繼續用壞資料。', 'A pipeline links inputs and outputs explicitly; failures need an exit instead of passing bad data onward.'),
    d('沖咖啡流程', 'Making coffee', '磨豆輸出咖啡粉，沖泡輸出咖啡，最後加奶；磨豆機壞咗就不能假裝有粉。', 'Grinding produces grounds, brewing produces coffee, and milk finishes it. A broken grinder cannot pretend to provide grounds.', '每個 runnable 做一項工作，合約令替換、測試同組合更容易。', 'Each runnable performs one job; its contract makes replacement, testing, and composition easier.'),
  ],
  'Layered memory': [
    d('購物紙、日曆、地址簿', 'Shopping note, calendar, address book', '今日買餸紙用完就丟；下週約會放日曆；朋友地址長期放地址簿。', 'Discard today’s shopping note afterward, keep next week’s appointment in a calendar, and store a friend’s address longer.', '短期訊息、task state 同長期 fact 有唔同用途同 retention。', 'Short-term messages, task state, and long-term facts have different uses and retention periods.'),
    d('記住食物過敏', 'Remembering a food allergy', '朋友講一次花生過敏，你經確認後長期記住；今次想飲凍茶就只對今日有效。', 'Confirm and remember a friend’s peanut allergy, while today’s preference for iced tea may expire after the meal.', 'Memory 要分 durable preference 同暫時 context，亦要可更正同刪除。', 'Memory separates durable preferences from temporary context and supports correction and deletion.'),
  ],
  'Fallbacks and retries': [
    d('打電話冇人接', 'Calling when nobody answers', '第一次冇接，隔一陣再打兩次；之後留言，唔會連續打一百次。', 'If nobody answers, wait and try twice more, then leave a message instead of calling a hundred times.', 'Retry 要 backoff 同次數上限；fallback 係換另一種已批准處理方式。', 'Retries need backoff and a limit; fallback switches to another approved way of handling the task.'),
    d('付款失敗先查狀態', 'Checking a failed payment', '手機話 timeout，但銀行可能已扣款；先查交易，再決定是否重新付款。', 'Your phone reports a timeout, but payment may already have gone through. Check the transaction before paying again.', 'Timeout 唔代表零副作用；retry 前確認 idempotency 同已完成狀態。', 'Timeout does not imply no side effect; check idempotency and completion before retrying.'),
  ],
  'Middleware and runtime context': [
    d('演唱會入口檢票', 'Concert ticket checks', '所有人入場都經檢票同袋檢，入到唔同座位則由票上資訊決定。', 'Everyone passes ticket and bag checks; their ticket determines which seat they may use.', 'Middleware 做共通檢查；runtime context 帶已確認 user、trace 同權限。', 'Middleware performs common checks; runtime context carries verified identity, traces, and permissions.'),
    d('酒店住客早餐', 'Hotel breakfast access', '櫃台核房卡，再將房號同早餐資格交餐廳；客人說「我包早餐」唔算證據。', 'Reception checks your room card and passes breakfast eligibility to the restaurant; your claim alone is insufficient.', 'Context 由可信系統注入，唔由模型或 user arguments 自稱。', 'Trusted systems inject context; models and user arguments cannot grant themselves privileges.'),
  ],
  'Model seams and reproducible agent contract tests': [
    d('練習售貨對話', 'Rehearsing a sales conversation', '朋友照劇本扮客人：先問價、再退貨。每次同一台詞，容易核流程有冇改錯。', 'A friend follows a script: ask the price, then request a return. Repeating it reveals changes in your procedure.', 'Scripted model 固定決策，測 orchestration；真實客人/模型品質另作評估。', 'A scripted model fixes decisions to test orchestration; real customer or model quality requires separate evaluation.'),
    d('用假電話練急救', 'Practicing with a mock phone call', '演習電話固定回「已派車」，你測到報地址流程；但未證明真實救護到達時間。', 'A mock call always says an ambulance is dispatched. It tests address reporting, not actual ambulance arrival time.', 'Mock 證明 contract 同錯誤分支，唔證明外部服務真實能力。', 'Mocks verify contracts and failure paths, not the external service’s real-world performance.'),
  ],
  'FastAPI layering: validation, dependencies, and lifespan': [
    d('餐廳前台同廚房', 'Reception and the kitchen', '前台收有效訂單，廚房處理煮食，倉庫供貨；前台唔應包辦晒所有工作。', 'Reception accepts valid orders, the kitchen cooks, and storage supplies ingredients. Reception should not own every task.', 'Route 收 HTTP；service 做業務；repository/client 接資料同外部能力。', 'Routes handle HTTP, services handle business work, and repositories or clients supply data and external capabilities.'),
    d('泳池每日開關設備', 'Opening and closing a swimming pool', '水泵開館時啟動、收館先關，唔會每位泳客入場都買一部新泵。', 'The pool starts its pump when opening and stops it at closing, rather than buying a new pump per swimmer.', 'Lifespan 管共用 client/pool；dependency 將適合資源交每個 request。', 'Lifespan manages shared clients and pools; dependencies provide suitable resources to each request.'),
  ],
  'Graph state': [
    d('搬屋進度紙', 'A moving-house checklist', '紙上記「已執箱、未叫車、鎖匙已交」，每完成一步就更新，下一步睇最新狀態。', 'Record “boxes packed, van not booked, keys delivered.” Update after each step so the next task uses current state.', 'Graph state 係節點共用嘅任務資料；transition 依狀態決定下一步。', 'Graph state is task data shared by nodes; transitions choose the next step from that state.'),
    d('訂餐進度', 'An order’s progress', '同一訂單有已付款、準備中、已送出等欄位；唔應把未付款單直接標成已送。', 'An order tracks payment, preparation, and dispatch. An unpaid order should not jump straight to dispatched.', 'State schema 同合法 transition 保持 workflow 一致。', 'A state schema and legal transitions keep the workflow consistent.'),
  ],
  'Interrupt and safe resume': [
    d('煮飯停下接電話', 'Pausing cooking to answer a call', '你已加鹽，接完電話要睇記錄再繼續；由頭重做加鹽會太鹹。', 'You added salt before a call. Check what was already done when resuming, or repeating the step oversalts the food.', 'Resume 可能重跑 node；副作用要 idempotent 或移到可安全重播位置。', 'Resume may rerun a node; side effects must be idempotent or placed where replay is safe.'),
    d('網購等家人批准', 'Waiting for purchase approval', '你保存購物車後問家人，批准再付款；重開頁面唔應把同一件貨買兩次。', 'Save the cart, ask for approval, then pay. Reopening the page should not purchase the same item twice.', 'Checkpoint 保存狀態；approval interrupt 之後亦要防重執行。', 'A checkpoint preserves state; execution after an approval interrupt still needs duplicate protection.'),
  ],
  'Tracing and evaluation': [
    d('包裹追蹤同評分', 'Parcel tracking and service ratings', '追蹤顯示包裹卡在倉庫；評分問是否準時及完整。前者定位，後者判品質。', 'Tracking shows a parcel stuck in the warehouse; ratings ask whether it arrived on time and intact.', 'Trace 解釋一次流程發生咩；eval 用準則判斷流程是否達標。', 'A trace explains what happened in one run; evaluation judges whether it met defined criteria.'),
    d('記錄練跑', 'Keeping a running log', '手錶記每段速度，教練用目標判斷訓練成效；有好多數據唔等於達標。', 'Your watch records pace by segment; your coach compares it with a training target. Lots of data does not mean success.', 'Observability 提供證據；evaluation 需要目標、baseline 同 rubric。', 'Observability provides evidence; evaluation needs objectives, a baseline, and a rubric.'),
  ],
  'Reducers, parallel branches, and merging': [
    d('朋友各自買餸', 'Friends buying groceries separately', '兩人各加一份購物紀錄，回家要合併；最後一人嘅清單不能蓋掉另一人。', 'Two friends record purchases separately. Combine their lists rather than letting the last list overwrite the other.', 'Reducer 定義合併規則；append、sum 或 deduplicate 適用唔同 state。', 'A reducer defines merge rules; append, sum, and deduplication suit different state fields.'),
    d('統計班級問卷', 'Combining class surveys', '每組交人數同答案，要按 ID 去重再相加；先交定後交唔應改變總數。', 'Groups submit counts and answers. Deduplicate by ID and combine them; submission order should not change the result.', '平行結果需要穩定 merge；重送同不同次序都要測。', 'Parallel results need stable merging; test duplicates and different arrival orders.'),
  ],
  'Traces, latency, and cost per successful task': [
    d('外賣幾時到', 'When does takeaway arrive?', '九單十分鐘到，一單一小時；只報平均會隱藏最慢嗰位客人嘅體驗。', 'Nine orders arrive in ten minutes and one takes an hour. An average hides the slow customer’s experience.', '要睇尾部 latency 同各 stage；p95 描述較慢嘅請求。', 'Inspect tail latency and individual stages; p95 describes slower requests.'),
    d('煮焦後重煮成本', 'The cost of cooking again', '一餐材料 $40，煮焦再買 $40；成功嗰餐實際花 $80，唔只算最後嗰煲。', 'Ingredients cost $40. Burning dinner and buying them again makes the successful meal cost $80.', 'Cost per successful task 包含失敗、retry 同工具成本。', 'Cost per successful task includes failures, retries, and tool costs.'),
  ],
  'LangSmith: from traces to an improvement loop': [
    d('錯題簿再考一次', 'A mistake notebook and retest', '你記低錯題原因，整理成練習，改方法後重考，再觀察新考試有冇同樣錯。', 'Record why an answer was wrong, create a practice case, retest after changing your method, and watch future exams.', 'Trace 找 failure → 審核 dataset → offline regression → online monitoring。', 'Traces reveal failures, reviewed datasets preserve cases, offline regression checks changes, and online monitoring watches production.'),
    d('餐廳投訴變訓練', 'Turning a complaint into training', '客人話漏配菜，店舖用訂單記錄找原因，去掉私人資料，加入員工演習。', 'A missing-side-dish complaint is investigated through order records, stripped of personal details, and added to staff practice.', 'Run feedback 要轉成可重現、已脫敏 eval case，先有持續改善。', 'Run feedback becomes a reproducible, redacted evaluation case to support continuous improvement.'),
  ],
  'Backpressure: a system must say “too much, right now”': [
    d('茶餐廳排隊', 'A queue outside a café', '店內滿座就門外排隊並限長度；繼續塞人入廚房唔會令煮食更快。', 'When the café is full, customers join a bounded outside queue. Packing more people into the kitchen cannot speed cooking.', 'Bounded queue 同入口限流保住容量；過載要快拒或延後。', 'Bounded queues and ingress limits protect capacity; overload needs fast rejection or deferral.'),
    d('手機下載限速', 'Limiting phone downloads', '開十個下載令每個都卡；只開兩個，其他等，完成後再接下一個。', 'Ten simultaneous downloads stall. Allow two at a time and start another when one finishes.', '控制 concurrency 防資源耗盡；多 retry 可能放大過載。', 'Controlled concurrency prevents resource exhaustion; more retries can worsen overload.'),
  ],
  'Message queues: at-least-once delivery and idempotent consumers': [
    d('外賣單重印', 'A reprinted takeaway ticket', '印單機冇收到確認又印一張；廚師先看訂單號，已煮就唔再煮。', 'A printer missing acknowledgment prints the order again. The cook checks its ID before preparing a duplicate.', 'At-least-once 可重送；consumer 用 eventId 防重，完成後先 ack。', 'At-least-once delivery can repeat; consumers deduplicate by event ID and acknowledge after completion.'),
    d('掛號信重派', 'Registered mail redelivery', '收件人未簽收就可能再派；收到同一信兩次，唔代表要執行要求兩次。', 'Without a receipt, registered mail may be delivered again. Two deliveries do not require acting on the request twice.', 'Delivery 次數同業務 side effect 次數分開；durable 紀錄支援 replay。', 'Delivery count and business side-effect count are separate; durable records support safe replay.'),
  ],
  'Microservices: boundaries before services': [
    d('家務先定責任', 'Assigning chores before splitting rooms', '先定誰洗衫、誰買餸，各自有清單；唔係每個櫃桶都派一人管理。', 'Assign laundry and groceries with clear ownership; do not appoint a different manager for every drawer.', '按 business capability 同 data owner 劃邊界，拆分要有理由。', 'Define boundaries by business capability and data ownership; splitting should have a clear reason.'),
    d('一間廚房定幾個檔口', 'One kitchen or several stalls?', '小聚會一間廚房易協調；大型市集可分檔口，但要安排付款、送貨同聯絡。', 'One kitchen is easy for a small party. A market can use separate stalls but needs payments, delivery, and communication.', 'Modular monolith 協調簡單；microservices 可獨立運作但增加 network 同營運成本。', 'A modular monolith simplifies coordination; microservices enable independence while adding network and operational costs.'),
  ],
  'Fine-tuning compresses behavior': [
    d('練習寫字格式', 'Practicing a writing style', '你練好多次同一字體，之後自然寫得一致；但今日天氣仍要睇最新預報。', 'Repeated handwriting practice makes your style consistent, but today’s weather still needs a current forecast.', 'Fine-tuning 學行為、格式同風格；新鮮事實用 retrieval/API。', 'Fine-tuning learns behavior, format, and style; fresh facts come from retrieval or APIs.'),
    d('訓練接待員', 'Training a receptionist', '接待員學固定禮貌流程；今日仲有幾多房，仍要查系統，唔靠舊教材。', 'A receptionist learns polite procedures, but checks current room availability in the system instead of an old handbook.', '訓練壓縮常見反應，不能保證記住每日改變嘅資料。', 'Training compresses common responses but cannot guarantee knowledge of changing daily data.'),
  ],
  'Data contracts and lineage': [
    d('食品來源標籤', 'Food origin labels', '一盒蛋寫農場、批次同日期；出問題可以追返邊批，再通知受影響買家。', 'An egg carton records farm, batch, and date, allowing a recall to trace affected products and buyers.', 'Data contract 定欄位；lineage 追來源、轉換同下游影響。', 'Data contracts define fields; lineage traces origins, transformations, and downstream impact.'),
    d('班級成績表', 'A class grade sheet', '成績寫學生 ID、分數尺度同老師；只抄「85」就唔知屬誰或滿分幾多。', 'Grades include student ID, score scale, and teacher. A bare “85” hides whose score it is and the maximum.', 'Schema、unit、owner 同 source version 保留可解讀同可追查性。', 'Schemas, units, owners, and source versions preserve interpretability and traceability.'),
  ],
  'PEFT / LoRA': [
    d('校服加名牌', 'Adding a name badge to a uniform', '唔重造整套校服，只加小名牌標示班級；校服本身大部分保持原樣。', 'Add a small badge showing your class instead of remaking the whole uniform; most of it stays unchanged.', 'PEFT 只訓練少量參數；LoRA 加小型 low-rank update，唔更新全部權重。', 'PEFT trains a small parameter subset; LoRA adds a compact low-rank update without changing all base weights.'),
    d('相機加濾鏡', 'Adding a camera filter', '同一相機換小濾鏡可調風格；濾鏡唔會把本來冇影到嘅細節變返真實。', 'A small filter changes a camera’s style but cannot make missing captured detail real.', 'Adapter 改模型行為有容量限制，唔等於重建 base model 或增加事實證據。', 'Adapters change behavior within capacity limits; they do not rebuild the base model or supply factual evidence.'),
  ],
  'LoRA, QLoRA, and adapters': [
    d('輕裝底圖加透明紙', 'A compact base map with an overlay', '地圖縮細印刷省空間，另用透明紙標新路線；底圖同路線層各有用途。', 'Print a smaller base map to save space and draw a route on a separate transparent overlay.', 'QLoRA 用 quantized base 加訓練 adapter；量化同 adapter 係兩個選擇。', 'QLoRA combines a quantized base with a trainable adapter; quantization and adaptation are distinct choices.'),
    d('同一樂器兩份編曲', 'Two arrangements for one instrument', '同一鋼琴可用爵士或古典編曲；換編曲唔等於鋼琴本身換咗。', 'One piano can use jazz or classical arrangements; changing the arrangement does not replace the instrument.', 'Base model 共享，adapter 按任務切換；要檢查版本同相容性。', 'Tasks share a base model and switch adapters; versions and compatibility need checking.'),
  ],
  'Media pipeline': [
    d('手機影片剪生日片', 'Editing a birthday video', '先匯入影片、抽聲、加字幕、剪片、輸出；每步用上一個成品並保存進度。', 'Import video, extract audio, add captions, cut clips, and export. Each stage uses the previous artifact and records progress.', 'Pipeline 將 media 任務分 stage，artifact 同錯誤要逐步追蹤。', 'A pipeline splits media work into stages with tracked artifacts and errors.'),
    d('沖曬照片', 'Developing and printing photos', '相機原檔先保存，再修色、排版、印相；印失敗只重印，唔使重新影相。', 'Preserve originals, edit color, lay out, then print. A printing failure needs reprinting rather than retaking the photos.', 'Checkpoint 同 artifact lineage 令重試只重做失敗 stage。', 'Checkpoints and artifact lineage let retries repeat only the failed stage.'),
  ],
  'Catalog grounding': [
    d('按標籤買衫', 'Buying clothes from the label', '照片睇落似棉，唔代表係棉；問材料同尺寸要讀商品標籤。', 'A shirt may look cotton in a photo, but fabric and size should come from its label.', '視覺或模型猜測唔能代替 catalog 事實；價格、庫存同規格要查權威資料。', 'Visual or model guesses cannot replace catalog facts; use authoritative data for price, stock, and specifications.'),
    d('點餐查餐牌', 'Ordering from the menu', '朋友估套餐包飲品，但最新餐牌寫另收費；落單前照餐牌確認。', 'A friend guesses drinks are included, but the current menu charges separately. Check it before ordering.', 'Grounding 將答案綁到有效來源，避免模型把常見印象當商品事實。', 'Grounding ties answers to current sources instead of treating common assumptions as product facts.'),
  ],
  'Human review queue': [
    d('老師批改作文', 'A teacher reviewing essays', '自動檢查先找錯字，老師再睇內容；爭議同低信心篇章排前面。', 'Automatic checks find spelling errors, then a teacher reviews meaning. Disputed and uncertain essays go first.', 'Queue 將高風險或不確定 case 交人，按 priority 同 SLA 處理。', 'A queue routes risky or uncertain cases to people according to priority and service deadlines.'),
    d('朋友核旅行海報', 'Checking a travel poster', '你用模板整好海報，另一人確認日期、圖片授權同聯絡電話，批准先發出去。', 'You draft a poster; someone checks dates, image rights, and contact details before approving publication.', '模型先 draft；human approval gate 控制真正對外 side effect。', 'The model drafts first; human approval controls the external side effect.'),
  ],
  'Asset lifecycle, rights, and provenance': [
    d('分享朋友照片', 'Sharing a friend’s photo', '朋友准你私人留相，唔代表准你用作廣告；要記用途同撤回要求。', 'A friend lets you keep a photo privately, which does not grant advertising rights. Record purpose and withdrawal requests.', 'Asset 權限有 scope、有效期同撤回；存有檔案唔等於有發布權。', 'Asset rights have scope, validity, and withdrawal; possessing a file does not grant publication rights.'),
    d('相簿原相同修圖版', 'Original and edited album photos', '原相留來源，修圖版記修改人同日期；有人要求刪相，兩版同分享副本都要追。', 'Keep the original source and record who edited it and when. Deletion requests must reach edits and shared copies.', 'Lineage 連結 derivative，同步 rights/deletion 才完整管理生命週期。', 'Lineage links derivatives; propagating rights and deletion completes lifecycle management.'),
  ],
  'Durable long-running jobs: state machines, artifacts, and safe retries': [
    d('裝修進度簿', 'A renovation progress log', '換工人後靠進度簿知道油漆已完成；唔會拆掉原牆再由零開始。', 'A replacement worker reads the renovation log and knows painting is complete instead of restarting from the original walls.', 'Durable state 同 checkpoint 令 crash 後接手；source artifact 要保留。', 'Durable state and checkpoints allow recovery after a crash; source artifacts must be preserved.'),
    d('焗麵包失敗再試', 'Retrying a failed batch of bread', '記錄今次 batch，清走燒焦麵包；已保存配方同原材料來源唔跟住刪。', 'Label the failed batch and discard burned bread while keeping the recipe and ingredient-source records.', 'Retry 按 attempt 清生成物，保留 verified inputs，防重覆 side effect。', 'Retries clean outputs by attempt, preserve verified inputs, and prevent duplicate side effects.'),
  ],
  'Browser, server, and object-storage media flow': [
    d('搬屋貨倉同電話通知', 'A storage warehouse and status calls', '傢俬直接去貨倉，搬運公司電話只報「已入倉」，唔把梳化經電話搬一次。', 'Furniture goes directly to storage; the moving company’s call reports its status rather than transporting the sofa again.', 'Object storage 搬 bytes；API/SSE 傳 control 同 metadata。', 'Object storage handles bytes; APIs and SSE carry control information and metadata.'),
    d('雲端相簿上傳', 'Uploading a cloud photo album', '大影片直接上傳相簿，手機顯示百分比；網絡斷咗再連可續傳未完成部分。', 'Upload a large video to the album while the phone shows progress; after reconnecting, resume unfinished parts.', 'Multipart upload、checksum 同 progress event 分工，重連唔應重傳全部。', 'Multipart upload, checksums, and progress events have separate roles; reconnection should support resuming uploads.'),
  ],
  'Intent routing': [
    d('商場服務台', 'A shopping-center help desk', '你話「件衫想換碼」，職員帶你去退換部；問「洗手間在哪」就指路。', '“I need another size” goes to returns; “where is the toilet?” gets directions.', '先判斷 intent，再選適當流程或工具；唔同意圖有唔同能力需求。', 'Identify intent first, then choose the appropriate workflow or tool; different intents need different capabilities.'),
    d('電話問候定預約', 'A greeting or a booking?', '朋友講「明晚得閒嗎」，可能想約飯，先問清楚日期地點，唔立即訂枱。', '“Are you free tomorrow evening?” may mean dinner. Clarify the plan before booking a table.', '含糊 intent 要 clarification 或低風險 route，唔好直接執行高影響 action。', 'Ambiguous intent needs clarification or a low-risk route before consequential action.'),
  ],
  'Conversation state machine': [
    d('預約睇戲', 'Booking a film', '先揀戲、再揀時間、再揀位、最後付款；未有時間就不能問是否已取票。', 'Choose a film, time, seat, then pay. Without a time, the conversation cannot assume a completed booking.', 'Dialogue state 保存已收資料同合法下一步，避免跳步或重覆問。', 'Dialogue state stores collected information and legal next steps, preventing skipped or repeated steps.'),
    d('退貨對話', 'A returns conversation', '客服先要訂單號，再核退貨原因，確認政策後安排收件；中途改訂單要重新核對。', 'Support asks for an order ID, checks the reason and policy, then arranges pickup. Changing orders requires rechecking.', 'State transition 有前置條件；context 改變要使舊批准失效。', 'Transitions have prerequisites; changed context can invalidate earlier approvals.'),
  ],
  'Outcome metrics': [
    d('溫習是否真有效', 'Did studying actually work?', '你讀咗三小時唔代表識；隔日唔睇答案做得啱，先證明學到。', 'Reading for three hours does not prove learning. Solving problems correctly the next day without answers does.', 'Activity metric 同 outcome 分開；agent 調幾多 tools 唔等於解決問題。', 'Separate activity from outcomes; an agent’s tool-call count does not prove problem resolution.'),
    d('客服覆得快但冇解決', 'Fast support without a solution', '客服一秒回「收到」，但退款未完成；要睇解決率、時間同滿意度。', 'Support instantly says “received,” but the refund is unfinished. Measure resolution, completion time, and satisfaction.', 'Success criteria 要貼近用戶目標，同時量度品質、成本同安全。', 'Success criteria should reflect the user’s goal alongside quality, cost, and safety.'),
  ],
  'Voice turn-taking and interruption': [
    d('電話中改地址', 'Changing an address on a call', '對方讀地址時你講「唔係，係九樓」，佢要停下、聽修正再確認。', 'While someone reads your address, you interrupt: “No, the ninth floor.” They stop, listen, and confirm.', 'Barge-in 取消舊播放，更新 conversation state，避免講完過時回覆。', 'Barge-in cancels old playback and updates conversation state, preventing an outdated response from finishing.'),
    d('嘈雜街道唔好亂聽', 'A noisy street conversation', '巴士經過遮住說話，朋友會請你重講；唔會把喇叭声當你答「同意」。', 'A bus drowns out your words, so your friend asks again rather than treating the horn as consent.', 'VAD、ASR 同 turn detection 可出錯；關鍵承諾要明確確認。', 'VAD, speech recognition, and turn detection can fail; important commitments need explicit confirmation.'),
  ],
  'Evidence ledger': [
    d('家庭分攤開支', 'Splitting household expenses', '你記每筆金額、收據同付款人，月底大家可以核對，唔靠「我記得」。', 'Record amount, receipt, and payer for each expense so everyone can verify the monthly split.', 'Evidence ledger 把 claim 綁到 artifact、日期、來源同可檢查結果。', 'An evidence ledger ties claims to artifacts, dates, sources, and verifiable results.'),
    d('健身進步記錄', 'Recording fitness progress', '你話跑快咗，附同路線時間、日期同手錶紀錄，先知道係進步定短咗路。', 'Claiming a faster run needs route, date, time, and watch records to distinguish improvement from a shorter course.', '數據要有測量條件；證據先支持改善幅度同限制。', 'Measurements need conditions; evidence supports the improvement and its limits.'),
  ],
  'Claim taxonomy': [
    d('煮過、睇過、想煮', 'Cooked it, watched it, plan to cook it', '「我煮過」同「我睇過食譜」係兩回事；「我想試」亦不能當成果。', '“I cooked it,” “I read the recipe,” and “I want to try it” describe different levels of experience.', 'Completed、assisted、studied 同 planned claims 要分開，唔誇大貢獻。', 'Distinguish completed, assisted, studied, and planned claims to represent contributions accurately.'),
    d('旅行建議來源', 'Where travel advice comes from', '朋友親身去過、聽人講、網上猜測，三種可信程度唔同，要講清來源。', 'A friend’s firsthand visit, secondhand story, and online guess offer different evidence. State which supports the advice.', 'Claim 類型同 evidence level 影響信心；推論要標明。', 'Claim type and evidence level affect confidence; identify inferences explicitly.'),
  ],
  'Reproducible demo': [
    d('朋友照食譜整蛋糕', 'A friend follows your cake recipe', '食譜寫份量、爐溫、模尺寸，朋友照做整得近似，先有可重現證據。', 'Quantities, oven temperature, and tin size let a friend produce a similar cake and verify the recipe.', 'Demo 要有 setup、fixtures、steps 同預期輸出，另一人先可驗證。', 'A demo needs setup, fixtures, steps, and expected outputs so someone else can verify it.'),
    d('同學重做實驗', 'A classmate repeats an experiment', '只畀成功照片唔夠；記設備、條件、失敗情況同原始結果先可重做。', 'A success photo is insufficient. Record equipment, conditions, failures, and raw results to repeat the experiment.', '可重現交付包含限制同測試資料，唔只展示最佳一次。', 'Reproducible delivery includes limitations and test data, beyond a single best result.'),
  ],
  'Contribution scope and confidentiality': [
    d('朋友合拍短片', 'Making a video with friends', '你剪接，朋友拍攝同配樂，介紹作品時講清角色；私人花絮先問准再公開。', 'You edit while friends shoot and score the film. Credit each role and obtain permission for private behind-the-scenes clips.', 'Contribution scope 誠實 attribution；confidentiality 控制可公開 artifact。', 'Contribution scope supports honest attribution; confidentiality determines which artifacts may be shared.'),
    d('幫同事做簡報', 'Helping with a colleague’s slides', '你改版面唔代表完成全部研究；展示能力可用匿名樣本，唔帶公司客戶名單。', 'Improving the layout does not mean you did all the research. Show anonymized samples without a company’s customer list.', '區分設計、實作、研究同驗證；作品證據要符合資料權限。', 'Separate design, implementation, research, and verification; portfolio evidence must respect data permissions.'),
  ],
  'Multimodal alignment': [
    d('影片聲畫不同步', 'Video and audio out of sync', '朋友講「呢個杯」時畫面已轉去碟，你會認錯物件；聲畫時間要對齊。', 'A friend says “this cup” after the video switches to a plate, so you identify the wrong object.', 'Audio、video、text 要用共同 timestamp/context 對齊，唔只一起輸入。', 'Audio, video, and text need shared timestamps and context, beyond being supplied together.'),
    d('跟地圖語音指路', 'Following spoken map directions', '導航話「下一個路口左轉」，畫面要同目前位置一致，舊畫面會引你走錯。', '“Turn left at the next junction” needs a map matching your current location; a stale image sends you the wrong way.', '不同 modality 要對同一 entity 同狀態，亦要處理 stale data。', 'Different modalities must refer to the same entity and state, including handling stale data.'),
  ],
  'Realtime latency budget': [
    d('視像電話等回音', 'Waiting on a video call', '網絡等 0.3 秒、處理再等 0.5 秒、播放再等 0.2 秒，合共一秒先聽到。', 'Network adds 0.3 seconds, processing 0.5, and playback 0.2. Together they delay the reply by a second.', '總 latency 係各 stage 加 queue wait；每層要分配 budget。', 'Total latency combines stage times and queue waits; allocate a budget to each layer.'),
    d('點餐反應速度', 'A waiter’s response time', '侍應要先聽完、理解、問廚房再回你；任何一段太慢都令對話尷尬。', 'A waiter listens, interprets, checks with the kitchen, and replies. A slow stage makes the conversation awkward.', 'Measure speech end 到 first response，找出 ASR/model/TTS 或 transport 瓶頸。', 'Measure from speech end to first response to locate ASR, model, TTS, or transport bottlenecks.'),
  ],
  'Physical AI safety envelope': [
    d('電梯門遇到人', 'An elevator door meets a person', '感應到人就停止關門；就算系統判斷「快啲關比較好」，硬件仍有停止限制。', 'A door sensor stops an elevator from closing on a person, even if a controller prefers a faster closure.', 'Physical AI 指令要受速度、距離、force 同 emergency stop 硬限制。', 'Physical-AI commands need hard limits on speed, distance, force, and emergency stopping.'),
    d('掃地機近樓梯', 'A robot vacuum near stairs', '掃地機冇把握樓梯邊界就停下，唔靠「應該冇問題」繼續走。', 'A vacuum stops near an uncertain stair edge instead of continuing because it is “probably fine.”', '感測不確定時用 safe state；模型信心唔代替安全 envelope。', 'Sensor uncertainty requires a safe state; model confidence does not replace a safety envelope.'),
  ],
  'Video segmentation and cross-modal timelines': [
    d('找生日片吹蠟燭一刻', 'Finding the candle-blowing moment', '你標記說「許願」嘅聲音、蠟燭畫面同熄燈時間，前後多留兩秒先完整。', 'Mark “make a wish,” the candle image, and lights going out; retain a few seconds around them for context.', 'Segmentation 按事件定時間段；ASR timestamp 同 video frame 要同軸。', 'Segmentation defines event intervals; speech timestamps and video frames share one timeline.'),
    d('剪球賽精彩片段', 'Cutting a sports highlight', '入球前有傳波，之後有慶祝；只剪入球嗰一秒，觀眾睇唔明過程。', 'A goal has a preceding pass and following celebration. A one-second cut loses the event’s meaning.', 'Clip boundary 要保留語意同 cross-modal context，唔單靠固定秒數切。', 'Clip boundaries preserve meaning and cross-modal context instead of relying only on fixed durations.'),
  ],
  'Local is not automatically private': [
    d('日記在自己手機', 'A diary on your own phone', '日記存手機，但雲端備份或 app analytics 可能另有副本，唔係放本機就完全私隱。', 'A diary sits on your phone, yet cloud backups or app analytics may hold copies too.', 'Local deployment 仍要查 network、logs、telemetry、backup 同 access。', 'Local deployment still requires checking networks, logs, telemetry, backups, and access.'),
    d('家中文件夾', 'A folder at home', '文件留屋企但放開放書枱，室友可以睇；私人保存仲要鎖櫃同控制誰可入。', 'A document stays at home but on an open desk a flatmate can read. Privacy also needs controlled access.', '資料位置同身份權限分開；local 唔自動提供 encryption 或 authorization。', 'Data location and access rights are separate; local storage does not automatically provide encryption or authorization.'),
  ],
  'Quantization trade-offs': [
    d('四捨五入記帳', 'Rounding a budget', '把 $19.87 記成 $20，清單更簡單，但精細對帳會有誤差累積。', 'Recording $19.87 as $20 simplifies a budget but introduces errors in precise reconciliation.', '較少 bit 表示數值省 memory，但有 approximation error，要做 task eval。', 'Fewer bits save memory but introduce approximation error, so test the actual task.'),
    d('壓縮手機照片', 'Compressing phone photos', '壓縮相省空間，日常睇可能夠；放大讀細字時，丟失嘅細節就重要。', 'Compressed photos save space and may look fine normally, but missing detail matters when reading small text.', '這是壓縮 trade-off 比喻；模型量化要在品質、記憶體同速度間實測。', 'This illustrates a compression trade-off; measure model quantization’s quality, memory, and speed effects directly.'),
  ],
  'Capacity planning': [
    d('生日派對訂枱', 'Booking tables for a party', '估人數之外仲要睇座位、上菜速度同高峰時間，唔只問餐廳總面積。', 'Consider seats, meal-serving speed, and peak arrivals along with guest count, beyond the restaurant’s floor area.', '容量取決 workload、concurrency、memory 同 throughput，唔只硬件規格。', 'Capacity depends on workload, concurrency, memory, and throughput, beyond hardware specifications.'),
    d('細雪櫃買餸', 'Shopping for a small fridge', '一次買十日餸會塞滿雪櫃；計各項大小、保存期同食用速度先安排。', 'Ten days of groceries can fill a fridge. Plan sizes, shelf life, and consumption rate first.', 'Model weights、KV cache 同 runtime overhead 都佔容量，要預留高峰餘量。', 'Weights, KV cache, and runtime overhead all consume capacity; reserve headroom for peaks.'),
  ],
  'KV cache, batching, and tail latency': [
    d('接住上次講嘅故事', 'Continuing a story', '你用書籤記住已讀部分，下一次可接續；好多讀者同時都有書籤就要更多空間。', 'A bookmark lets you continue from what you read. Many simultaneous readers need space for all their bookmarks.', 'KV cache 重用之前 token 計算，但隨 context 同 active requests 增加 memory。', 'KV cache reuses earlier token computations but consumes more memory with context and active requests.'),
    d('等一齊出餐', 'Waiting to serve a batch', '一次整五杯咖啡有效率，但第一位客人可能等其他單；急單要分流。', 'Making five coffees together can be efficient, but the first customer waits for the batch; urgent orders need another lane.', 'Batching 提升 throughput 可能增加 queue latency；互動工作要睇 p95/TTFT。', 'Batching may improve throughput while increasing queue latency; interactive work needs p95 and time-to-first-token checks.'),
  ],
  'Docker: images, containers, volumes, and networks': [
    d('食譜、便當、雪櫃', 'Recipe, lunch box, fridge', '同一食譜整幾盒便當，每盒獨立；要跨日保留材料就放雪櫃，唔跟便當盒丟。', 'One recipe makes several independent lunch boxes. Ingredients kept across days go in the fridge instead of being discarded with a box.', 'Image 係模板，container 係 instance，volume 係持久資料。', 'The image is a template, containers are instances, and volumes hold persistent data.'),
    d('同屋不同房門牌', 'Room names in one flat', '屋企人用「廚房」搵到煮食位置；唔使每次記住今日邊個企在哪個角落。', 'Flatmates find cooking facilities by “kitchen,” without tracking which corner someone occupies today.', 'Container network 用 service name 定位服務；instance 可換，接駁名稱保持穩定。', 'Container networks use service names to locate services; instances can change while the connection name stays stable.'),
  ],
  'Kubernetes: desired state, probes, and safe rollouts': [
    d('餐廳維持三名侍應', 'Keeping three waiters available', '經理希望三人當值，一人離開就補位；新職員未準備好唔接客。', 'A manager wants three waiters on duty and replaces departures; a new waiter serves customers only when ready.', 'Controller 對齊 desired state；readiness 決定接流量，唔單靠 process 存在。', 'Controllers reconcile desired state; readiness decides traffic eligibility, beyond a process merely existing.'),
    d('換新菜單先試一枱', 'Trying a new menu at one table', '先畀一枱試新版菜單，確認廚房應付到再擴大；出錯就用返舊版。', 'Try a new menu at one table, expand after confirming the kitchen can handle it, and restore the old menu on failure.', 'Rollout、probe 同 canary 提供分階段更新，避免一次影響所有人。', 'Rollouts, probes, and canaries support staged updates that limit the initial impact.'),
  ],
  'Threat modeling': [
    d('離家前想防盜', 'Planning home security', '先想保護鎖匙、現金同文件，誰可接近，再找窗、門、共享密碼等入口。', 'Identify keys, cash, and documents, who can access them, and entrances such as windows, doors, and shared passwords.', '先定 assets、actors 同 trust boundary，再找 abuse path 同 mitigation。', 'Identify assets, actors, and trust boundaries before examining abuse paths and mitigations.'),
    d('家庭共享相簿', 'A shared family album', '要防陌生人看、家人誤公開同帳號被盜；三種情況需要不同控制。', 'Consider outsiders viewing photos, relatives sharing accidentally, and stolen accounts; each needs different controls.', 'Threat model 包括故意攻擊同誤用，按實際影響排優先次序。', 'Threat models include attacks and misuse, prioritized by actual impact.'),
  ],
  'Layered guardrails': [
    d('過馬路多重保護', 'Several protections at a crossing', '你睇燈、看車、用斑馬線，司機亦要煞車；一層出錯仲有其他保護。', 'You check lights and traffic and use a crossing; drivers must brake too. Other protections remain if one fails.', 'Input check、authorization、output validation 同 approval 各守不同位置。', 'Input checks, authorization, output validation, and approvals protect different stages.'),
    d('網購家長控制', 'Parental controls for shopping', '設消費限額、核付款人、貴價貨要批准，最後再看收據；唔只講一句「小心」。', 'Set a spending limit, verify the payer, require approval for costly items, and check receipts afterward.', '分層 host control 比單一 prompt 更能限制副作用；每層仍要測。', 'Layered host controls constrain side effects more reliably than a prompt alone; test each layer.'),
  ],
  'Release gates and incident loops': [
    d('新食譜請客前試煮', 'Testing a recipe before guests arrive', '先試味、查過敏原同份量，合格先請客；若有人不適，記原因並改下次檢查。', 'Test taste, allergens, and portions before serving guests. If someone becomes unwell, investigate and improve future checks.', 'Gate 定發布條件；incident 轉 regression，令同一問題唔再漏。', 'Gates define release criteria; incidents become regression cases to catch the same issue later.'),
    d('學校旅行出發清單', 'A checklist before a school trip', '人數、聯絡、交通都核對先出發；漏接一人後，下一次加點名步驟。', 'Check headcount, contacts, and transport before departure. A missed pickup leads to an added roll-call check next time.', '發布要可驗證 evidence，事故改善回到同一條 release 流程。', 'Releases need verifiable evidence; incident improvements feed back into the release process.'),
  ],
  'Red-team frozen sets and safety slices': [
    d('考試保留最易錯題', 'Keeping the questions you often miss', '總分九十分，但過馬路安全題錯咗仍要補考；保存題目每次再測。', 'A ninety-percent score still needs follow-up if the road-safety question is wrong. Keep that case for every retest.', '平均分不能蓋過 critical slice；frozen set 保留已知風險。', 'An average score cannot conceal a critical slice failure; frozen sets preserve known risks.'),
    d('測鎖唔只測正常開門', 'Testing a lock beyond normal use', '用正確鎖匙可開唔夠，仲要試錯匙、借用匙同拉扯；危險情況逐項記。', 'A correct key opening is insufficient. Try wrong keys, borrowed keys, and forced entry; record the risky cases.', 'Red-team 針對 abuse scenario，按 authorization、PII、injection 分開報告。', 'Red-team cases target abuse scenarios, reported separately for authorization, personal data, and injection.'),
  ],
  'Frozen evaluations and CI release gates': [
    d('新鞋用同一路試跑', 'Testing shoes on the same route', '新舊鞋在同一路、同距離比較，先知是否改善；換短路就唔公平。', 'Compare old and new shoes on the same route and distance; a shorter route would distort the result.', 'Frozen dataset 固定評測條件，CI 比 baseline 同 slices 決定可否發布。', 'A frozen dataset fixes evaluation conditions; CI compares baselines and slices before release.'),
    d('每次改食譜都重驗', 'Retesting each recipe revision', '少咗糖可能更好，但仍要驗過敏原同焗熟；一項安全失敗就唔出餐。', 'Less sugar may improve taste, but still check allergens and doneness; a safety failure stops service.', 'Quality 改善唔能抵消 critical safety fail，gate 要獨立檢查。', 'Quality gains cannot compensate for critical safety failures; gates check them independently.'),
  ],
  'Canary releases, rollback, and incident runbooks': [
    d('新洗衣液先試一件', 'Trying detergent on one garment', '新洗衣液先試舊毛巾，冇甩色再洗更多；出事知道點停同改用舊液。', 'Try detergent on an old towel before washing more clothes; know how to stop and return to the old product.', 'Canary 小範圍試、rollback 回穩定版，runbook 預寫停止同處理步驟。', 'Canaries start small, rollback restores a stable version, and a runbook predefines stopping and response steps.'),
    d('停電應急紙', 'A power-cut response sheet', '停電前寫電箱位置、負責人同聯絡電話，真出事先唔使臨時亂搵。', 'Write down the fuse box, responsible person, and contacts before a power cut so you can respond promptly.', 'Incident runbook 定 owner、threshold、證據保存同 communication。', 'An incident runbook defines owners, thresholds, evidence preservation, and communication.'),
  ],
  'Laptop to production: a rollback-ready release chain': [
    d('搬家先留舊鎖匙', 'Keeping old keys during a move', '新屋檢查水電、少量搬入、確認可住先退舊屋；唔會一開始就丟舊鎖匙。', 'Check utilities, move a little, and confirm the new home works before giving up the old one.', 'Staging → canary → production，保留 previous artifact 同可行 rollback。', 'Staging, canary, and production stages retain the previous artifact and a workable rollback path.'),
    d('換全家通訊地址', 'Changing a family address book', '先加新地址，通知大家並確認收到，再刪舊地址；過渡期間兩版都要看得明。', 'Add the new address, notify everyone, confirm receipt, then remove the old one; both versions work during transition.', 'Expand-and-contract migration 先加兼容欄位，遷移完成再移除舊欄。', 'Expand-and-contract migrations add compatible fields first and remove old fields after migration completes.'),
  ],
};

export function dailyExamplesForConcept(title) {
  const examples = everydayExamples[title];
  if (!examples) throw new Error(`Missing everyday examples for: ${title}`);
  return examples;
}
