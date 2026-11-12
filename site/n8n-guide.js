const stages = [
  { id: 'ask', en: 'Your question', zh: '你的問題' },
  { id: 'scope', en: 'Scope gate', zh: '範圍檢查' },
  { id: 'call', en: 'App calls once', zh: 'App 只叫一次' },
  { id: 'n8n', en: 'Inside n8n', zh: 'n8n 內部' },
  { id: 'receipt', en: 'Receipt', zh: '收據' },
  { id: 'pin', en: 'Pinned snapshot', zh: '固定快照' },
];

const scenarios = [
  {
    id: 'fresh',
    en: 'News arrives',
    zh: '新聞到手',
    steps: [
      step('ask', 'You ask about one supported company.', '你問一家支援範圍內的公司。', 'NVDA · not sent', 'NVDA · 尚未送出', 'How could export limits affect NVDA?'),
      step('scope', 'The scope gate recognises NVDA and lets the question through.', '範圍檢查認出 NVDA，放行這條問題。', 'company NVDA', '公司 NVDA', 'Supported company'),
      step('call', 'The app sends one logical refresh. The model cannot skip this box.', 'App 送出一次邏輯刷新。模型不能跳過這一格。', 'run_1842 · 1 call', 'run_1842 · 1 次呼叫', 'refresh_company_news'),
      step('n8n', 'n8n checks that run_1842 has no receipt yet.', 'n8n 確認 run_1842 還沒有收據。', 'attempt 0 of 3', '第 0 次，上限 3', 'Validate run_id'),
      step('n8n', 'n8n posts the company to the private adapter. This call is capped at 10 seconds.', 'n8n 把公司傳給私人 adapter。這次呼叫上限 10 秒。', 'POST /news · NVDA', 'POST /news · NVDA', 'Provider attempt 1'),
      step('n8n', 'The JSON matches the news schema. n8n writes the rows with an ingestion-only database role.', 'JSON 符合新聞 schema。n8n 用只供匯入的資料庫角色寫入紀錄。', '3 articles', '3 則文章', 'Commit evidence'),
      step('receipt', 'n8n returns version ids, fetched_at, and a provider status. Its work for this question is over.', 'n8n 交回版本 id、fetched_at 和供應商狀態。它對這題的工作結束。', 'status ready', '狀態 ready', 'Structured receipt'),
      step('pin', 'The app pins company news, the latest daily batch, and the company profile. Search starts after this, outside n8n.', 'App 固定公司新聞、最新每日批次和公司背景。之後的搜尋在 n8n 之外。', 'snapshot pinned', '快照已固定', 'n8n is finished'),
    ],
  },
  {
    id: 'blip',
    en: 'One retry, then success',
    zh: '重試一次後成功',
    steps: [
      step('ask', 'A second question still deserves its own receipt.', '第二條問題仍然要有自己的收據。', 'AAPL · new run', 'AAPL · 新任務', 'Margin pressure on AAPL'),
      step('scope', 'AAPL is supported, so the app may call the tool.', 'AAPL 在支援範圍內，App 可以呼叫工具。', 'company AAPL', '公司 AAPL', 'Supported company'),
      step('call', 'One call leaves the app. n8n owns every provider retry inside that call.', 'App 只送出一次。這一次裡面的供應商重試全由 n8n 負責。', 'run_1843', 'run_1843', 'One logical call'),
      step('n8n', 'The first news call fails with a retryable 503.', '第一次新聞呼叫以可重試的 503 失敗。', '503 · attempt 1', '503 · 第 1 次', 'Provider attempt 1'),
      step('n8n', 'n8n waits 1 second plus jitter. The HTTP node’s built-in retry stays off.', 'n8n 等待 1 秒加 jitter。HTTP 節點自帶的重試保持關閉。', 'wait 1s', '等待 1 秒', 'Backoff'),
      step('n8n', 'Attempt 2 returns valid articles. n8n saves them and stops retrying.', '第 2 次交回有效文章。n8n 保存後就停止重試。', 'attempt 2 of 3', '第 2 次，上限 3', 'Provider attempt 2'),
      step('receipt', 'The receipt records the successful attempt. The failed attempt is history, not a second refresh.', '收據記下成功的那一次。失敗的嘗試是歷史，不是第二次刷新。', 'status ready', '狀態 ready', 'One receipt'),
      step('pin', 'The app pins this run’s rows. It does not ask n8n to fetch AAPL again.', 'App 固定這次任務的紀錄，不會再請 n8n 抓一次 AAPL。', 'snapshot pinned', '快照已固定', 'n8n is finished'),
    ],
  },
  {
    id: 'down',
    en: 'Provider stays down',
    zh: '供應商持續故障',
    steps: [
      step('ask', 'MSFT is a real company, but the news source can still be down.', 'MSFT 是真實公司，新聞來源仍可能故障。', 'MSFT', 'MSFT', 'Cost pressure on MSFT'),
      step('scope', 'The question is in scope. Failure happens later, at the provider.', '問題在範圍內。失敗發生在後面的供應商。', 'company MSFT', '公司 MSFT', 'Supported company'),
      step('call', 'The app makes its one call and then waits for a typed result.', 'App 發出那一次呼叫，然後等待結構化結果。', 'run_1844', 'run_1844', 'One logical call'),
      step('n8n', 'Attempt 1 fails. n8n waits 1 second.', '第 1 次失敗。n8n 等待 1 秒。', 'attempt 1 · 503', '第 1 次 · 503', 'Retryable failure'),
      step('n8n', 'Attempt 2 fails. n8n waits 2 seconds plus jitter.', '第 2 次失敗。n8n 等待 2 秒加 jitter。', 'attempt 2 · 503', '第 2 次 · 503', 'Retryable failure'),
      step('n8n', 'Attempt 3 fails. Three attempts is the cap, so n8n stops.', '第 3 次失敗。三次就是上限，n8n 停止。', 'attempt 3 · exhausted', '第 3 次 · 已用完', 'Stop fetching'),
      step('receipt', 'The result is provider unavailable. The app must not immediately fire the same tool call again.', '結果是供應商不可用。App 不應立刻再發同一次工具呼叫。', 'status unavailable', '狀態 unavailable', 'Typed failure'),
      step('pin', 'There is no fresh company-news snapshot. The report must say the source failed. It must not describe old news as new.', '沒有新的公司新聞快照。報告必須說明來源失敗，不能把舊新聞說成新的。', 'no fresh rows', '沒有新紀錄', 'Do not invent news'),
    ],
  },
  {
    id: 'resume',
    en: 'Same run, old receipt',
    zh: '同一任務，舊收據',
    steps: [
      step('ask', 'The host timed out, or you resumed the same run.', 'Host 超時了，或你恢復同一個任務。', 'run_1842 again', '再次 run_1842', 'Same NVDA question'),
      step('scope', 'The question is still valid. The run id is the part that matters now.', '問題仍然有效。現在重要的是任務 id。', 'run_1842', 'run_1842', 'Supported company'),
      step('call', 'The app looks up the original execution before sending a second fetch.', 'App 在第二次抓取之前，先查找原來的執行。', 'reconcile first', '先核對', 'Do not blind-retry'),
      step('n8n', 'n8n finds the receipt already stored for run_1842.', 'n8n 找到 run_1842 已經保存的收據。', 'receipt exists', '收據已存在', 'Deduplicate run'),
      step('receipt', 'It returns that receipt. Yahoo is not called again.', '它交回那張收據，不會再呼叫 Yahoo。', 'reused receipt', '沿用收據', 'No second fetch'),
      step('pin', 'Search continues from the original snapshot. The budget is not reset.', '搜尋沿用原來的快照。預算不會重設。', 'same snapshot', '同一快照', 'n8n is finished'),
    ],
  },
  {
    id: 'reject',
    en: 'Question is out of scope',
    zh: '問題超出範圍',
    labels: {
      call: { en: 'No tool call', zh: '不呼叫工具' },
      n8n: { en: 'n8n stays idle', zh: 'n8n 不啟動' },
      receipt: { en: 'No receipt', zh: '沒有收據' },
      pin: { en: 'Explain and stop', zh: '說明並停止' },
    },
    steps: [
      step('ask', 'Someone asks for a company this app does not cover.', '有人問這個 app 不涵蓋的公司。', 'TSLA', 'TSLA', 'Unsupported ticker'),
      step('scope', 'The scope gate stops the question. n8n never starts.', '範圍檢查停住這條問題。n8n 不會啟動。', 'no tool call', '沒有工具呼叫', 'Stop before news'),
      step('pin', 'The app explains which companies it can research and shows an example. No receipt, no database write.', 'App 說明它能研究哪些公司，並給一個例子。沒有收據，也沒有資料庫寫入。', 'MSFT · AAPL · NVDA', 'MSFT · AAPL · NVDA', 'n8n was not involved'),
    ],
  },
  {
    id: 'daily',
    en: 'Daily context batch',
    zh: '每日背景批次',
    labels: {
      ask: { en: 'Daily clock', zh: '每日時鐘' },
      scope: { en: 'No user question', zh: '沒有使用者問題' },
      call: { en: 'App is idle', zh: 'App 閒置' },
      receipt: { en: 'Batch status', zh: '批次狀態' },
      pin: { en: 'Evidence pool', zh: '證據池' },
    },
    steps: [
      step('ask', 'Nobody asked a question. The clock inside n8n starts this other workflow.', '沒有人發問。n8n 裡的時鐘啟動另一條流程。', 'schedule', '排程', 'Separate from prompts'),
      step('n8n', 'The Schedule Trigger fetches approved macro and geopolitical sources.', 'Schedule Trigger 抓取已核准的宏觀與地緣來源。', 'daily job', '每日工作', 'Own deadline'),
      step('n8n', 'Completed rows land in the shared evidence pool. Company refresh is a different workflow.', '完成的紀錄進入共用證據池。公司刷新是另一條流程。', 'batch committed', '批次已提交', 'Shared context'),
      step('pin', 'Later, a real question pins this batch next to that question’s company news. The batch alone is not a report.', '稍後，真實問題會把這批資料和該題的公司新聞一起固定。只有這批資料還不是報告。', 'waiting for a prompt', '等待一條問題', 'Not a substitute'),
    ],
  },
];

const toneFor = {
  fresh: ['', '', '', '', '', '', '', ''],
  blip: ['', '', '', 'wait', 'wait', '', '', ''],
  down: ['', '', '', 'wait', 'wait', 'stop', 'stop', 'stop'],
  resume: ['', '', '', '', '', ''],
  reject: ['', 'stop', 'stop'],
  daily: ['', '', '', ''],
};

function step(stage, en, zh, packetEn, packetZh, insideEn, insideZh) {
  return { stage, en, zh, packetEn, packetZh, insideEn, insideZh: insideZh || zh };
}

const state = {
  lang: localStorage.getItem('n8n-guide-lang') === 'zh' ? 'zh' : 'en',
  scenario: 0,
  index: 0,
  playing: false,
  timer: 0,
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pipeline = document.querySelector('[data-pipeline]');
const scenarioRow = document.querySelector('[data-scenarios]');
const substeps = document.querySelector('[data-substeps]');
const narration = document.querySelector('[data-narration]');
const packet = document.querySelector('[data-packet]');
const count = document.querySelector('[data-count]');

pipeline.innerHTML = stages.map((stage, index) => `
  <div class="stage" data-stage="${stage.id}">
    <small>${String(index + 1).padStart(2, '0')}</small>
    <strong data-en>${stage.en}</strong>
    <strong data-zh hidden>${stage.zh}</strong>
    <div class="bar" aria-hidden="true"><i></i></div>
  </div>
`).join('');

scenarioRow.innerHTML = scenarios.map((scenario, index) => `
  <button class="pill" type="button" data-scenario="${index}" aria-pressed="${index === 0}">
    <span data-en>${scenario.en}</span>
    <span data-zh hidden>${scenario.zh}</span>
  </button>
`).join('');

function text(node) {
  return state.lang === 'zh' ? node.zh : node.en;
}

function applyLanguage() {
  document.documentElement.lang = state.lang === 'zh' ? 'zh-Hant' : 'en';
  document.querySelectorAll('[data-en]').forEach((node) => {
    node.hidden = state.lang !== 'en';
  });
  document.querySelectorAll('[data-zh]').forEach((node) => {
    node.hidden = state.lang !== 'zh';
  });
  document.querySelectorAll('[data-lang-label]').forEach((node) => {
    node.classList.toggle('on', node.getAttribute('data-lang-label') === state.lang);
  });
  document.querySelectorAll('[data-action="play"]').forEach((button) => {
    const zh = button.hasAttribute('data-zh');
    button.textContent = state.playing
      ? (zh ? '暫停' : 'Pause')
      : (zh ? '播放路徑' : 'Play the path');
  });
  render();
}

function currentScenario() {
  return scenarios[state.scenario];
}

function render() {
  const scenario = currentScenario();
  const current = scenario.steps[state.index];
  if (!current) return;
  const tones = toneFor[scenario.id];
  const tone = tones[state.index] || '';
  document.querySelectorAll('[data-stage]').forEach((node) => {
    const id = node.getAttribute('data-stage');
    const label = (scenario.labels && scenario.labels[id]) || stages.find((item) => item.id === id);
    node.querySelector('[data-en]').textContent = label.en;
    node.querySelector('[data-zh]').textContent = label.zh;
    const reached = scenario.steps.slice(0, state.index + 1).some((item) => item.stage === id);
    node.className = 'stage';
    if (!reached) return;
    if (id === current.stage && tone === 'stop') node.classList.add('is-stop');
    else if (id === current.stage && tone === 'wait') node.classList.add('is-wait');
    else if (id === current.stage) node.classList.add('is-current');
    else node.classList.add('is-done');
  });

  const inside = [];
  scenario.steps.forEach((item, index) => {
    if (item.stage !== 'n8n' && item.stage !== 'receipt') return;
    const marker = index < state.index ? 'is-done' : index === state.index ? 'is-current' : '';
    inside.push(`<li class="substep ${marker}"><b>${state.lang === 'zh' ? item.insideZh : item.insideEn}</b><span>${state.lang === 'zh' ? item.packetZh : item.packetEn}</span></li>`);
  });
  if (!inside.length) {
    const stopped = state.index > 0;
    const idle = stopped
      ? (state.lang === 'zh'
        ? 'n8n 不啟動。範圍檢查在呼叫工具之前就停了。'
        : 'n8n does not start. The scope gate stops the question before any tool call.')
      : (state.lang === 'zh'
        ? '先看範圍。超出 MSFT、AAPL、NVDA 就不會進入 n8n。'
        : 'Scope is checked first. Anything outside MSFT, AAPL, and NVDA never enters n8n.');
    inside.push(`<li class="substep ${stopped ? 'is-stop' : ''}"><b>${idle}</b><span>MSFT · AAPL · NVDA</span></li>`);
  }
  substeps.innerHTML = inside.join('');
  narration.textContent = text(current);
  count.textContent = state.lang === 'zh'
    ? `第 ${state.index + 1} 步，共 ${scenario.steps.length} 步`
    : `Step ${state.index + 1} of ${scenario.steps.length}`;
  packet.innerHTML = `
    <div><dt>${state.lang === 'zh' ? '這一手' : 'This handoff'}</dt><dd>${state.lang === 'zh' ? current.packetZh : current.packetEn}</dd></div>
    <div><dt>${state.lang === 'zh' ? '流程' : 'Workflow'}</dt><dd>${text(scenario)}</dd></div>
  `;
}

function stop() {
  state.playing = false;
  window.clearInterval(state.timer);
  applyLanguage();
}

function play() {
  if (state.playing) {
    stop();
    return;
  }
  if (state.index >= currentScenario().steps.length - 1) state.index = 0;
  state.playing = true;
  applyLanguage();
  state.timer = window.setInterval(() => {
    if (state.index >= currentScenario().steps.length - 1) {
      stop();
      return;
    }
    state.index += 1;
    render();
  }, 1600);
}

function choose(index) {
  stop();
  state.scenario = index;
  state.index = 0;
  document.querySelectorAll('[data-scenario]').forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.getAttribute('data-scenario')) === index));
  });
  render();
}

document.querySelector('[data-player]').addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest('button') : null;
  if (!target || target.hidden) return;
  const scenario = target.getAttribute('data-scenario');
  const action = target.getAttribute('data-action');
  if (scenario !== null) choose(Number(scenario));
  if (action === 'play') play();
  if (action === 'step') {
    stop();
    state.index = Math.min(currentScenario().steps.length - 1, state.index + 1);
    render();
  }
  if (action === 'restart') choose(state.scenario);
});

document.querySelector('[data-action="language"]').addEventListener('click', () => {
  state.lang = state.lang === 'en' ? 'zh' : 'en';
  localStorage.setItem('n8n-guide-lang', state.lang);
  applyLanguage();
});

document.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
  if (event.key === 'ArrowRight') {
    stop();
    state.index = Math.min(currentScenario().steps.length - 1, state.index + 1);
    render();
  }
  if (event.key === 'ArrowLeft') {
    stop();
    state.index = Math.max(0, state.index - 1);
    render();
  }
});

applyLanguage();
if (!reducedMotion) play();
