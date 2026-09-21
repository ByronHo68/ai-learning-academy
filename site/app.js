import { pick, sources, topicById, topicBySlug, topics } from './curriculum.js';
import { detailsForTopic } from './concepts.js';

const STORAGE_KEY = 'ai-academy-progress-v1';
const app = document.querySelector('#app');
const transient = {
  practice: {}, quiz: {}, visual: {}, assessment: { answers: {}, submitted: false },
  capstone: { answers: {}, submitted: false }, glossary: '', message: '',
};
let visualTimer = null;

const copy = {
  zh: { path:'學習路線', review:'溫習', assessment:'總評', map:'概念圖', glossary:'詞彙', settings:'設定', start:'開始第一課', continue:'繼續學習', progress:'整體進度', mastered:'主題已掌握', learn:'理解', examples:'例子', practice:'練習', quiz:'測驗', recap:'重點溫習', sources:'來源' },
  en: { path:'Learning path', review:'Review', assessment:'Assessment', map:'Concept map', glossary:'Glossary', settings:'Settings', start:'Start topic one', continue:'Continue learning', progress:'Overall progress', mastered:'topics mastered', learn:'Learn', examples:'Examples', practice:'Practice', quiz:'Quiz', recap:'Review', sources:'Sources' },
};

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[character]);
const text = (value) => escapeHtml(pick(value, state.lang));
const nowIso = () => new Date().toISOString();
const scorePercent = (attempt) => attempt.total ? Math.round((attempt.score / attempt.total) * 100) : 0;

function emptyProgress() {
  return { status:'not-started', recapReached:false, practiceComplete:false, remediated:[], bestScore:0, latestScore:0, attempts:[] };
}

function initialState() {
  return {
    version:1, lang:'zh',
    topicProgress:Object.fromEntries(topics.map((topic) => [topic.id, emptyProgress()])),
    reviewQueue:[], safetyChecks:[false, false, false, false], notes:{},
    cumulative:{ bestScore:0, attempts:[], capstoneComplete:false },
  };
}

function normalizeState(value) {
  const base = initialState();
  if (!value || value.version !== 1 || typeof value !== 'object') return base;
  base.lang = value.lang === 'en' ? 'en' : 'zh';
  base.safetyChecks = base.safetyChecks.map((_, index) => value.safetyChecks?.[index] === true);
  base.notes = Object.fromEntries(topics.map((topic) => [topic.id, typeof value.notes?.[topic.id] === 'string' ? value.notes[topic.id].slice(0, 10000) : '']));
  for (const topic of topics) {
    const raw = value.topicProgress?.[topic.id] || {};
    const attempts = Array.isArray(raw.attempts) ? raw.attempts.filter((attempt) => attempt && Number.isFinite(attempt.score) && Number.isFinite(attempt.total) && Array.isArray(attempt.missed)) : [];
    base.topicProgress[topic.id] = deriveProgress({
      ...emptyProgress(), recapReached:raw.recapReached === true, practiceComplete:raw.practiceComplete === true,
      remediated:Array.isArray(raw.remediated) ? [...new Set(raw.remediated.filter((item) => typeof item === 'string'))] : [],
      attempts, latestScore:attempts.length ? scorePercent(attempts.at(-1)) : 0,
      bestScore:attempts.reduce((best, attempt) => Math.max(best, scorePercent(attempt)), 0),
      lastStudied:typeof raw.lastStudied === 'string' ? raw.lastStudied : undefined,
    });
  }
  base.reviewQueue = Array.isArray(value.reviewQueue) ? value.reviewQueue.filter((item) => item && typeof item.id === 'string' && topicById(item.topicId) && [1,3,7].includes(item.day)) : [];
  const cumulativeAttempts = Array.isArray(value.cumulative?.attempts) ? value.cumulative.attempts : [];
  base.cumulative = { attempts:cumulativeAttempts, bestScore:cumulativeAttempts.reduce((best, attempt) => Math.max(best, scorePercent(attempt)), 0), capstoneComplete:value.cumulative?.capstoneComplete === true };
  return base;
}

function deriveProgress(progress) {
  const latest = progress.attempts.at(-1);
  const remediated = latest ? latest.missed.every((id) => progress.remediated.includes(id)) : false;
  let status = 'in-progress';
  if (!latest && !progress.recapReached && !progress.practiceComplete) status = 'not-started';
  else if (progress.recapReached && progress.practiceComplete && progress.bestScore >= 80 && remediated) status = 'mastered';
  else if (latest && progress.latestScore < 80) status = 'needs-review';
  return { ...progress, status };
}

function loadState() {
  try { return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch { return initialState(); }
}

let state = loadState();
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  document.documentElement.lang = state.lang === 'zh' ? 'zh-Hant' : 'en';
}

function route() {
  const raw = location.hash.slice(1) || '/';
  const [path, query = ''] = raw.split('?');
  return { path, params:new URLSearchParams(query) };
}

function statusLabel(status) {
  const labels = state.lang === 'zh'
    ? { 'not-started':'未開始', 'in-progress':'進行中', 'needs-review':'需要溫習', mastered:'已掌握' }
    : { 'not-started':'Not started', 'in-progress':'In progress', 'needs-review':'Needs review', mastered:'Mastered' };
  return labels[status];
}

function header() {
  const ui = copy[state.lang];
  return `<header class="app-header">
    <a class="brand" href="#/" aria-label="AI Academy home"><span class="brand-mark" aria-hidden="true">AI</span><span><strong>${state.lang === 'zh' ? 'AI 學習院' : 'AI Academy'}</strong><small>Visual learning academy</small></span></a>
    <nav class="app-nav" aria-label="Primary navigation"><a href="#/">${ui.path}</a><a href="#/review">${ui.review}</a><a href="#/assessment">${ui.assessment}</a><a href="#/map">${ui.map}</a><a href="#/glossary">${ui.glossary}</a></nav>
    <div class="header-actions"><button class="language-button" data-action="language" type="button"><b class="${state.lang === 'zh' ? 'active-lang' : ''}">繁中</b><span>/</span><b class="${state.lang === 'en' ? 'active-lang' : ''}">EN</b></button><a class="settings-link" href="#/settings" aria-label="${ui.settings}">⚙</a></div>
  </header>`;
}

function shell(content) {
  return `${header()}<div id="main-content" tabindex="-1">${content}</div><footer class="site-footer"><span>AI 學習院 · Visual AI Academy</span><span>Zero dependencies · Node 18.18 · Local-first progress</span></footer>`;
}

function dashboard() {
  const ui = copy[state.lang];
  const mastered = Object.values(state.topicProgress).filter((item) => item.status === 'mastered').length;
  const percent = Math.round((mastered / topics.length) * 100);
  const current = topics.find((topic) => state.topicProgress[topic.id].status !== 'mastered') || topics[0];
  const safety = state.lang === 'zh'
    ? ['已輪換任何曾外露嘅 credentials','只使用獲授權或合成資料','Secrets 由 server 環境注入，logs 已遮罩','清楚標示已實作、已驗證、設計同下一步']
    : ['Rotate any exposed credentials','Use only authorized or synthetic data','Inject secrets server-side and redact logs','Label implemented, verified, designed, and next'];
  const due = state.reviewQueue.filter((item) => !item.done && Date.parse(item.dueAt) <= Date.now()).length;
  return shell(`<main>
<section class="dashboard-hero"><div class="dashboard-copy"><p class="eyebrow"><span>13 ${state.lang === 'zh' ? '個主題' : 'TOPICS'}</span> · ${state.lang === 'zh' ? '由基礎到安全上線' : 'FOUNDATIONS TO SAFE RELEASE'}</p><h1>${state.lang === 'zh' ? '唔只識用 AI。<br>真正理解佢點運作。' : 'Don’t just use AI.<br>Understand how it works.'}</h1><p class="hero-lede">${state.lang === 'zh' ? '每個核心概念都有深入解釋、專屬比喻、真實例子、逐步拆解同可複製 code，由一個安全 request 行到完整 AI system。' : 'Every core concept includes a deep explanation, its own metaphor, a real example, a step-by-step breakdown, and copyable code—from one safe request to a complete AI system.'}</p><div class="hero-actions"><a class="primary-action" href="#/lesson/${current.slug}">${mastered ? ui.continue : ui.start}<span>→</span></a><a class="secondary-action" href="#/map">${ui.map}</a></div><div class="trust-row"><span>✓ 65 ${state.lang === 'zh' ? '個概念工作坊' : 'concept workshops'}</span><span>✓ ${state.lang === 'zh' ? '無需安裝、無付費 API' : 'No install, no paid API'}</span><span>✓ Node 18.18</span></div></div>
    <div class="progress-orbit"><div class="orbit-heading"><div><small>${ui.progress}</small><strong>${percent}%</strong></div><span>${mastered}/13</span></div><div class="orbit-track"><i style="width:${Math.max(percent,2)}%"></i></div><div class="mini-path">${topics.slice(0,6).map((topic) => `<div class="mini-node ${state.topicProgress[topic.id].status}"><b>${String(topic.order).padStart(2,'0')}</b><span>${text(topic.title)}</span><em>${statusLabel(state.topicProgress[topic.id].status)}</em></div>`).join('')}</div><a class="continue-card" href="#/lesson/${current.slug}"><span><small>${ui.continue}</small><b>${text(current.title)}</b></span><i>→</i></a></div></section>
    <section class="safety-gate"><div class="gate-number">P0</div><div class="gate-copy"><p class="eyebrow">${state.lang === 'zh' ? '開始之前' : 'BEFORE YOU START'}</p><h2>${state.lang === 'zh' ? '安全重設 · Safety reset' : 'Safety reset'}</h2><p>${state.lang === 'zh' ? '開始 AI project 前要確認嘅工程底線。' : 'Engineering preconditions before starting an AI project.'}</p></div><div class="safety-list">${safety.map((label,index) => `<label><input type="checkbox" data-safety="${index}" ${state.safetyChecks[index] ? 'checked' : ''}><span>✓</span>${escapeHtml(label)}</label>`).join('')}</div></section>
    <section class="learning-loop-section"><div><p class="eyebrow">ONE REPEATABLE RHYTHM</p><h2>${state.lang === 'zh' ? '掃、畫、跑、改、講' : 'Scan, Map, Run, Change, Explain'}</h2></div><div class="loop-track">${[['掃','Scan','10m'],['畫','Map','15m'],['跑','Run','45m'],['改','Change','20m'],['講','Explain','5m']].map(([zh,en,time],index) => `<div class="loop-step"><span>${String(index+1).padStart(2,'0')}</span><b>${state.lang === 'zh' ? zh : en}</b><small>${state.lang === 'zh' ? en : time}</small><em>${time}</em></div>`).join('')}</div></section>
    <section class="dashboard-intelligence"><div class="dashboard-status-grid"><article><span>01</span><p>${state.lang === 'zh' ? '到期溫習' : 'Reviews due'}</p><strong>${due}</strong><small>${state.reviewQueue.filter((item) => !item.done).length} ${state.lang === 'zh' ? '項排期' : 'scheduled'}</small><a href="#/review">${state.lang === 'zh' ? '開啟隊列' : 'Open queue'} →</a></article><article><span>02</span><p>${state.lang === 'zh' ? '完整課程' : 'Complete curriculum'}</p><strong>13</strong><small>104 quiz questions · 5 example modes</small><a href="#/glossary">${state.lang === 'zh' ? '搜尋詞彙' : 'Search vocabulary'} →</a></article><article><span>03</span><p>${state.lang === 'zh' ? '跨主題能力' : 'Cross-topic readiness'}</p><strong>${state.cumulative.bestScore}%</strong><small>${state.cumulative.capstoneComplete ? 'Capstone ✓' : 'Capstone ○'}</small><a href="#/assessment">${state.lang === 'zh' ? '開始總評' : 'Start assessment'} →</a></article></div></section>
    <section class="course-section"><div class="section-heading"><div><p class="eyebrow">${state.lang === 'zh' ? '課程總覽' : 'COURSE OVERVIEW'}</p><h2>${state.lang === 'zh' ? '由安全 request，行到可靠 AI 系統' : 'From a safe request to a reliable AI system'}</h2></div><div class="progress-summary"><div><span>${ui.progress}</span><b>${percent}%</b></div><div class="progress-track"><i style="width:${Math.max(percent,2)}%"></i></div><small>${mastered} / 13 ${ui.mastered}</small></div></div><div class="full-module-grid">${topics.map(courseCard).join('')}</div></section>
  </main>`);
}

function courseCard(topic) {
  const progress = state.topicProgress[topic.id];
  const prerequisites = topic.prerequisites.length ? topic.prerequisites.map((id) => text(topicById(id).title)).join(' · ') : (state.lang === 'zh' ? '無，直接開始' : 'None—start here');
  return `<article class="course-card ${progress.status}"><div class="course-card-top"><span>${String(topic.order).padStart(2,'0')}</span><em>${text(topic.group)}</em><i>${statusLabel(progress.status)}</i></div><h3>${text(topic.title)}</h3><p>${text(topic.subtitle)}</p><div class="course-meta"><span>◷ ${topic.minutes} min</span><span>${topic.quiz.length} questions</span></div><small class="course-prerequisite">${state.lang === 'zh' ? '先備' : 'Prerequisite'}: ${prerequisites}</small><a href="#/lesson/${topic.slug}">${progress.status === 'not-started' ? (state.lang === 'zh' ? '開始主題' : 'Start topic') : copy[state.lang].continue} →</a></article>`;
}

const lessonTabs = ['learn','examples','practice','quiz','recap','sources'];
function lesson(topic, activeTab) {
  const progress = state.topicProgress[topic.id];
  const previous = topics[topic.order - 2];
  const next = topics[topic.order];
  const body = activeTab === 'examples' ? examplesTab(topic) : activeTab === 'practice' ? practiceTab(topic) : activeTab === 'quiz' ? quizTab(topic) : activeTab === 'recap' ? recapTab(topic) : activeTab === 'sources' ? sourcesTab(topic) : learnTab(topic);
  return shell(`<main class="lesson-layout"><aside class="lesson-sidebar"><a class="back-link" href="#/">← ${state.lang === 'zh' ? '返回路線' : 'Back to path'}</a><div class="sidebar-progress"><span>${copy[state.lang].progress}</span><b>${statusLabel(progress.status)}</b><div><i style="width:${progress.bestScore}%"></i></div></div><nav>${topics.map((item) => `<a class="${item.id === topic.id ? 'active' : ''} ${state.topicProgress[item.id].status === 'mastered' ? 'done' : ''}" href="#/lesson/${item.slug}"><span>${String(item.order).padStart(2,'0')}</span><b>${text(item.title)}</b><i>${state.topicProgress[item.id].status === 'mastered' ? '✓' : '→'}</i></a>`).join('')}</nav></aside><div class="lesson-main"><div class="breadcrumbs"><a href="#/">${copy[state.lang].path}</a><span>›</span><b>${text(topic.title)}</b></div><section class="lesson-hero"><div class="lesson-number">${String(topic.order).padStart(2,'0')}</div><div><p>${text(topic.group)} · ${topic.minutes} MIN</p><h1>${text(topic.title)}</h1><span>${text(topic.subtitle)}</span></div><span class="status-badge ${progress.status}">${statusLabel(progress.status)}</span></section><div class="lesson-tabs">${lessonTabs.map((tab,index) => `<a class="${activeTab === tab ? 'active' : ''}" href="#/lesson/${topic.slug}?tab=${tab}"><span>0${index+1}</span>${copy[state.lang][tab]}</a>`).join('')}</div><div class="topic-pager">${previous ? `<a href="#/lesson/${previous.slug}">← ${text(previous.title)}</a>` : '<span></span>'}<small>${topic.order} / 13</small>${next ? `<a href="#/lesson/${next.slug}">${text(next.title)} →</a>` : '<span></span>'}</div>${body}</div></main>`);
}

function learnTab(topic) {
  return `<div class="lesson-content"><section class="orientation-card"><p class="eyebrow">${state.lang === 'zh' ? '開場問題' : 'OPENING PROBLEM'}</p><h2>${text(topic.orientation.openingProblem)}</h2><div class="one-sentence"><b>${state.lang === 'zh' ? '一句講清' : 'ONE-SENTENCE MODEL'}</b><p>${text(topic.orientation.oneSentence)}</p></div><div class="objectives"><h3>${state.lang === 'zh' ? '完成後你可以' : 'YOU WILL BE ABLE TO'}</h3>${topic.orientation.objectives.map((objective,index) => `<div><span>${index+1}</span><p><b>${text(objective.statement)}</b><small>${text(objective.evidence)}</small></p></div>`).join('')}</div></section>
    <section class="layered-grid" id="${topic.id}-mechanism"><article class="definition-block"><span>01</span><p class="eyebrow">${state.lang === 'zh' ? '初學者解釋' : 'BEGINNER VIEW'}</p><h2>${text(topic.title)}</h2><p>${text(topic.explanation.beginner)}</p></article><article class="analogy-block"><span>02</span><p class="eyebrow">ANALOGY</p><h2>${text(topic.explanation.analogy)}</h2><div><b>${state.lang === 'zh' ? '比喻限制' : 'WHERE IT BREAKS'}</b><p>${text(topic.explanation.analogyLimit)}</p></div></article></section>
    <section class="deep-dive"><p class="eyebrow">DEEP DIVE</p><h2>${state.lang === 'zh' ? '由概念落到機制' : 'From concept to mechanism'}</h2><p>${text(topic.explanation.deepDive)}</p><ol>${topic.explanation.mechanisms.map((item) => `<li>${text(item)}</li>`).join('')}</ol></section>${conceptWorkshop(topic)}${visualLab(topic)}
    <section class="misconception-grid"><div><p class="eyebrow">MISCONCEPTIONS</p><h2>${state.lang === 'zh' ? '常見錯覺，逐個拆' : 'Common assumptions, corrected'}</h2></div>${topic.misconceptions.map((item,index) => `<article><span>0${index+1}</span><h3>${text(item.claim)}</h3><p>${text(item.correction)}</p></article>`).join('')}</section>
    <section class="vocabulary-section"><p class="eyebrow">VOCABULARY</p><div class="vocabulary-grid">${topic.vocabulary.map((item) => `<article><small>${escapeHtml(item.zhTerm)}</small><h3>${escapeHtml(item.term)}</h3><p>${text(item.definition)}</p></article>`).join('')}</div></section></div>`;
}

function conceptWorkshop(topic) {
  const details = detailsForTopic(topic.id);
  return `<section class="concept-workshop"><header><div><p class="eyebrow">CONCEPT WORKSHOP</p><h2>${state.lang === 'zh' ? '每個概念：解釋 → 比喻 → 例子 → Code' : 'Every concept: explanation → metaphor → example → code'}</h2><p>${state.lang === 'zh' ? '先建立心智模型，再將抽象概念落到可檢查嘅實作。Code 係最小教學例子，使用前要配合你嘅環境、測試同權限。' : 'Build a mental model first, then turn the abstraction into an inspectable implementation. Code is a minimal teaching example—adapt it to your environment, tests, and permissions.'}</p></div><strong>${details.length} LABS</strong></header><div class="concept-lab-list">${details.map((detail,index) => `<article class="concept-lab-card"><div class="concept-lab-index"><span>${String(index+1).padStart(2,'0')}</span><i>${escapeHtml(detail.language)}</i></div><div class="concept-lab-body"><h3>${text(detail.title)}</h3><p class="concept-explanation">${text(detail.explanation)}</p><div class="concept-bridges"><section><small>${state.lang === 'zh' ? '比喻 · METAPHOR' : 'METAPHOR'}</small><h4>${text(detail.metaphorTitle)}</h4><p>${text(detail.metaphor)}</p></section><section><small>${state.lang === 'zh' ? '實例 · EXAMPLE' : 'REAL EXAMPLE'}</small><p>${text(detail.example)}</p></section></div><ol class="concept-steps">${detail.steps.map((step,stepIndex) => `<li><span>${stepIndex+1}</span>${text(step)}</li>`).join('')}</ol><div class="code-example"><header><div><small>${escapeHtml(detail.language)}</small><b>${text(detail.codeTitle)}</b></div><button data-action="copy-code" type="button">${state.lang === 'zh' ? '複製 Code' : 'Copy code'}</button></header><pre><code>${escapeHtml(detail.code)}</code></pre></div></div></article>`).join('')}</div></section>`;
}

function visualLab(topic) {
  const model = transient.visual[topic.id] ||= { step:0, playing:false, speed:1, parameter:topic.visual.parameter?.defaultValue ?? 0 };
  const total = topic.visual.steps.length;
  const progress = Math.round(((model.step + 1) / total) * 100);
  return `<section class="visual-lab" id="${topic.id}-visual"><header><div><p class="eyebrow">INTERACTIVE VISUAL</p><h2>${text(topic.visual.title)}</h2><p>${text(topic.visual.teachingPurpose)}</p></div><span>${model.step+1} / ${total}</span></header><div class="visual-stage"><div class="flow-diagram">${topic.visual.steps.map((step,index) => `<button class="flow-node ${index === model.step ? 'active' : ''} ${index < model.step ? 'done' : ''}" data-action="visual-step" data-topic="${topic.id}" data-step="${index}"><span>${String(index+1).padStart(2,'0')}</span><b>${text(step.label)}</b></button>`).join('<i>→</i>')}</div><p class="visual-narration" aria-live="polite">${text(topic.visual.steps[model.step].narration)}</p><div class="metric-grid"><article><small>${state.lang === 'zh' ? '流程進度' : 'Flow progress'}</small><strong>${progress}%</strong><div><i style="width:${progress}%"></i></div></article><article><small>${state.lang === 'zh' ? '目前參數' : 'Current parameter'}</small><strong>${escapeHtml(String(model.parameter))}${escapeHtml(topic.visual.parameter?.unit || '')}</strong><div><i style="width:${Math.min(100, Math.max(4, Number(model.parameter) * 10))}%"></i></div></article></div></div><div class="visual-controls"><button data-action="visual-play" data-topic="${topic.id}">${model.playing ? '❚❚ Pause' : '▶ Play'}</button><button data-action="visual-replay" data-topic="${topic.id}">↻ Replay</button><label>Speed <select data-visual-speed="${topic.id}"><option value="0.5" ${model.speed === .5 ? 'selected' : ''}>0.5×</option><option value="1" ${model.speed === 1 ? 'selected' : ''}>1×</option><option value="2" ${model.speed === 2 ? 'selected' : ''}>2×</option></select></label>${topic.visual.parameter ? `<label class="parameter-control"><span>${text(topic.visual.parameter.label)}</span><input type="range" min="${topic.visual.parameter.min}" max="${topic.visual.parameter.max}" value="${model.parameter}" data-visual-parameter="${topic.id}"><output>${model.parameter}${escapeHtml(topic.visual.parameter.unit)}</output></label>` : ''}</div><details class="static-alternative"><summary>${state.lang === 'zh' ? '文字替代' : 'Text alternative'}</summary><p>${text(topic.visual.textAlternative)}</p></details></section>`;
}

function examplesTab(topic) {
  const role = { minimal:'MINIMAL', worked:'WORKED', realistic:'REAL WORLD', failure:'FAILURE', nonExample:'NON-EXAMPLE' };
  return `<div class="examples-page"><div class="section-title"><p class="eyebrow">FIVE ANGLES</p><h2>${state.lang === 'zh' ? '同一概念，轉五個鏡頭' : 'One concept, five lenses'}</h2></div><div class="example-stack">${topic.examples.map((example,index) => `<article class="example-card ${example.role}"><div><span>${String(index+1).padStart(2,'0')}</span><small>${role[example.role]}</small></div><section><h3>${text(example.title)}</h3><p>${text(example.body)}</p><aside><b>${state.lang === 'zh' ? '改一個假設' : 'CHANGE ONE ASSUMPTION'}</b>${text(example.changedAssumption)}</aside></section></article>`).join('')}</div></div>`;
}

function practiceTab(topic) {
  const session = transient.practice[topic.id] ||= { answer:null, submitted:false };
  return `<div class="practice-page"><div class="section-title"><p class="eyebrow">GUIDED PRACTICE</p><h2>${state.lang === 'zh' ? '先做一個低風險決定' : 'Make one low-risk decision'}</h2></div><section class="practice-card"><fieldset><legend>${text(topic.practice.prompt)}</legend>${topic.practice.options.map((option,index) => `<label><input type="radio" name="practice-${topic.id}" data-answer-type="practice" data-topic="${topic.id}" value="${index}" ${session.answer === index ? 'checked' : ''}><span class="radio-ui"></span><b>${text(option)}</b></label>`).join('')}</fieldset><button class="primary-button" data-action="practice-submit" data-topic="${topic.id}" ${session.answer === null ? 'disabled' : ''}>${state.lang === 'zh' ? '檢查答案' : 'Check answer'}</button>${session.submitted ? `<div class="practice-feedback ${session.answer === topic.practice.correctIndex ? 'correct' : 'wrong'}" role="status"><b>${session.answer === topic.practice.correctIndex ? '✓' : '!'}</b><p>${text(topic.practice.feedback)}</p></div>` : ''}</section></div>`;
}

function quizTab(topic) {
  const session = transient.quiz[topic.id] ||= { answers:{}, submitted:false };
  const retry = state.topicProgress[topic.id].attempts.length > 0;
  const score = topic.quiz.filter((question) => question.options.find((option) => option.id === session.answers[question.id])?.correct).length;
  return `<div class="quiz-shell"><div class="section-title"><p class="eyebrow">MASTERY CHECK · 80%</p><h2>${state.lang === 'zh' ? '8 題測驗，提交前唔顯示答案' : 'Eight questions; answers stay hidden until submission'}</h2></div><form class="plain-quiz">${topic.quiz.map((question,index) => `<article class="quiz-question ${session.submitted ? (question.options.find((option) => option.id === session.answers[question.id])?.correct ? 'correct' : 'wrong') : ''}"><p>${String(index+1).padStart(2,'0')} · ${escapeHtml(question.coverage.toUpperCase())}</p><fieldset><legend>${text(retry ? question.retryPrompt : question.prompt)}</legend>${question.options.map((option) => `<label><input type="radio" name="${question.id}" data-answer-type="quiz" data-topic="${topic.id}" data-question="${question.id}" value="${option.id}" ${session.answers[question.id] === option.id ? 'checked' : ''} ${session.submitted ? 'disabled' : ''}><span class="radio-ui"></span><b>${text(option.label)}</b></label>`).join('')}</fieldset>${session.submitted ? `<div class="answer-feedback"><b>${question.options.find((option) => option.id === session.answers[question.id])?.correct ? '✓' : '!'}</b><p>${text(question.options.find((option) => option.id === session.answers[question.id])?.feedback || question.rationale)}</p>${question.options.find((option) => option.id === session.answers[question.id])?.correct ? '' : `<button type="button" data-action="remediate" data-topic="${topic.id}" data-question="${question.id}">${state.lang === 'zh' ? '返回解釋並標記溫習' : 'Review explanation'} →</button>`}</div>` : ''}</article>`).join('')}<div class="quiz-submit-bar">${session.submitted ? `<div><strong>${score} / ${topic.quiz.length}</strong><span>${Math.round(score/topic.quiz.length*100)}% · ${score >= 7 ? (state.lang === 'zh' ? '達到門檻' : 'Threshold met') : (state.lang === 'zh' ? '需要溫習' : 'Review needed')}</span></div><button type="button" class="primary-button" data-action="quiz-reset" data-topic="${topic.id}">${state.lang === 'zh' ? '再試新情境' : 'Try changed scenarios'}</button>` : `<span>${Object.keys(session.answers).length} / ${topic.quiz.length} ${state.lang === 'zh' ? '已回答' : 'answered'}</span><button type="button" class="primary-button" data-action="quiz-submit" data-topic="${topic.id}" ${Object.keys(session.answers).length < topic.quiz.length ? 'disabled' : ''}>${state.lang === 'zh' ? '提交測驗' : 'Submit quiz'}</button>`}</div></form></div>`;
}

function recapTab(topic) {
  const progress = state.topicProgress[topic.id];
  return `<div class="recap-page"><div class="section-title"><p class="eyebrow">RETRIEVAL RECAP</p><h2>${state.lang === 'zh' ? '唔睇筆記，先講一次' : 'Explain it once without notes'}</h2></div><section class="recap-card"><ol>${topic.recap.essentialIdeas.map((idea) => `<li>${text(idea)}</li>`).join('')}</ol><label><b>${text(topic.recap.ownWordsPrompt)}</b><textarea data-note="${topic.id}" maxlength="10000" placeholder="${state.lang === 'zh' ? '用自己說話寫低…' : 'Write it in your own words…'}">${escapeHtml(state.notes[topic.id] || '')}</textarea></label><div class="review-cadence"><span>DAY 1</span><span>DAY 3</span><span>DAY 7</span></div><button class="primary-button" data-action="recap-complete" data-topic="${topic.id}">${progress.recapReached ? '✓ ' + (state.lang === 'zh' ? '已完成重點溫習' : 'Recap completed') : (state.lang === 'zh' ? '完成重點溫習' : 'Complete recap')}</button></section></div>`;
}

function sourcesTab(topic) {
  const used = sources.filter((source) => topic.sourceIds.includes(source.id));
  return `<div class="sources-page"><div class="current-block"><p class="eyebrow">CURRENT DEVELOPMENT</p><span>${escapeHtml(topic.current.status.toUpperCase())}</span><h2>${text(topic.current.text)}</h2><small>${state.lang === 'zh' ? '最後核實' : 'Last verified'}: ${topic.current.verifiedAt}</small></div><div class="source-list">${used.map((source,index) => `<article><span>${String(index+1).padStart(2,'0')}</span><div><small>${escapeHtml(source.publisher)} · ${escapeHtml(source.kind)}</small><h3>${escapeHtml(source.title)}</h3><p>${text(source.note)}</p><time>${escapeHtml(source.date)} · verified ${escapeHtml(source.verifiedAt)}</time></div>${source.url ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">↗</a>` : '<i>LOCAL</i>'}</article>`).join('')}</div></div>`;
}

function reviewPage() {
  const pending = state.reviewQueue.filter((item) => !item.done).sort((a,b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
  return shell(`<main class="utility-page"><div class="utility-hero"><p class="eyebrow">RETRIEVAL PRACTICE</p><h1>${state.lang === 'zh' ? 'Day 1 / 3 / 7 溫習隊列' : 'Day 1 / 3 / 7 review queue'}</h1><p>${state.lang === 'zh' ? '錯題會安排三次唔同距離嘅提取練習。' : 'Missed concepts create three spaced retrieval checks.'}</p></div>${pending.length ? `<div class="review-columns">${[1,3,7].map((day) => `<section><header><span>DAY ${day}</span><b>${pending.filter((item) => item.day === day).length}</b></header>${pending.filter((item) => item.day === day).map((item) => { const topic = topicById(item.topicId); const question = topic.quiz.find((entry) => entry.id === item.questionId); const due = Date.parse(item.dueAt) <= Date.now(); return `<article class="${due ? 'due' : 'scheduled'}"><div class="review-meta"><small>${text(topic.title)}</small><time>${due ? (state.lang === 'zh' ? '到期' : 'Due') : new Intl.DateTimeFormat(state.lang === 'zh' ? 'zh-HK' : 'en',{month:'short',day:'numeric'}).format(new Date(item.dueAt))}</time></div><p>${text(question.retryPrompt)}</p><div><a href="#/lesson/${topic.slug}?tab=quiz">${state.lang === 'zh' ? '開啟測驗' : 'Open quiz'}</a><button data-action="review-done" data-id="${item.id}" ${due ? '' : 'disabled'}>✓ ${due ? (state.lang === 'zh' ? '完成' : 'Done') : (state.lang === 'zh' ? '未到期' : 'Scheduled')}</button></div></article>`; }).join('') || `<p class="column-empty">${state.lang === 'zh' ? '冇排期' : 'Clear'}</p>`}</section>`).join('')}</div>` : `<div class="empty-state"><span>✓</span><h2>${state.lang === 'zh' ? '而家冇待辦溫習' : 'Nothing scheduled'}</h2><p>${state.lang === 'zh' ? '完成測驗後，錯題會喺呢度排期。' : 'Complete a quiz and missed concepts will appear here.'}</p><a href="#/">${state.lang === 'zh' ? '返回學習路線' : 'Return to the path'} →</a></div>`}</main>`);
}

function mapPage() {
  return shell(`<main class="utility-page"><div class="utility-hero"><p class="eyebrow">KNOWLEDGE MAP</p><h1>${state.lang === 'zh' ? '13 個概念點樣連埋一齊' : 'How the 13 concepts connect'}</h1><p>${state.lang === 'zh' ? '由基礎主線，分到資料、產品、部署同治理。' : 'Foundations branch into knowledge, agents, products, deployment, and governance.'}</p></div><div class="concept-map">${topics.map((topic) => `<a href="#/lesson/${topic.slug}" class="concept-node level-${Math.min(topic.prerequisites.length,3)} ${state.topicProgress[topic.id].status}"><span>${String(topic.order).padStart(2,'0')}</span><div><b>${text(topic.title)}</b><small>${topic.prerequisites.length ? `${state.lang === 'zh' ? '先備' : 'Prereq'}: ${topic.prerequisites.map((id) => id.toUpperCase()).join(', ')}` : (state.lang === 'zh' ? '起點' : 'Starting point')}</small></div><i>${state.topicProgress[topic.id].status === 'mastered' ? '✓' : '→'}</i></a>`).join('')}</div></main>`);
}

function glossaryPage() {
  const query = transient.glossary.toLowerCase();
  const terms = topics.flatMap((topic) => topic.vocabulary.map((item) => ({ ...item, topic }))).filter((item) => `${item.term} ${item.zhTerm} ${pick(item.definition,state.lang)}`.toLowerCase().includes(query));
  return shell(`<main class="utility-page"><div class="utility-hero glossary-hero"><p class="eyebrow">BILINGUAL GLOSSARY</p><h1>${state.lang === 'zh' ? '60+ 個核心詞彙，一次講清' : 'Core vocabulary, clearly defined'}</h1><label class="search-box"><span>⌕</span><input data-glossary-search value="${escapeHtml(transient.glossary)}" placeholder="${state.lang === 'zh' ? '搜尋 Token、冪等性、評估…' : 'Search token, idempotency, evaluation…'}"><b>${terms.length}</b></label></div><div class="glossary-grid">${terms.map((item) => `<article><div><span>${escapeHtml(item.zhTerm)}</span><em>${String(item.topic.order).padStart(2,'0')}</em></div><h2>${escapeHtml(item.term)}</h2><p>${text(item.definition)}</p><a href="#/lesson/${item.topic.slug}">${text(item.topic.title)} →</a></article>`).join('')}</div></main>`);
}

function productionBuildBrief() {
  const zh = state.lang === 'zh';
  const steps = zh ? [
    'API 合約：登入、輸入 schema、5 秒 timeout、取消、明確錯誤；key 只在 backend。',
    '資料生命週期：合成訂單、最新政策、tenant filter、更新/刪除及快取失效。',
    'Agent 控制：只可讀自己訂單、草擬退款；真正寫入需人批核及 idempotency key。',
    '評測：有版本嘅正常、粵英雙語、資料缺失、越權同 injection cases；critical failure 令 CI fail。',
    '維運：traceId、model/prompt 版本、p95、錯誤率、token/成本；模擬 429、timeout 同壞 JSON。',
    '發佈：canary stop gate、上一個穩定版本、rollback runbook，同脫敏 incident regression。',
  ] : [
    'API contract: sign-in, input schema, five-second timeout, cancellation, explicit errors; key only on the backend.',
    'Data lifecycle: synthetic orders, current policy, tenant filtering, updates/deletion, and cache invalidation.',
    'Agent controls: read only the user’s order and draft a refund; writes require human approval and an idempotency key.',
    'Evaluation: versioned normal, bilingual, missing-data, unauthorized, and injection cases; critical failures fail CI.',
    'Operations: trace ID, model/prompt versions, p95, error rate, tokens/cost; inject 429s, timeouts, and malformed JSON.',
    'Release: canary stop gate, previous stable version, rollback runbook, and redacted incident regression.',
  ];
  return `<section class="production-build" aria-labelledby="production-build-title"><p class="eyebrow">PART 3 · HANDS-ON PRODUCTION BUILD</p><h2 id="production-build-title">${zh ? '由答啱到真正交付' : 'From correct answers to a working service'}</h2><p>${zh ? '比喻：設計檢查似駕駛筆試；真正上路前，仲要喺受控場地開車、處理故障同證明會安全停車。只用合成資料，唔需要真實 API key。' : 'Metaphor: the design checkpoint is the driving theory exam. Before driving independently, build in a controlled environment, handle failures, and prove you can stop safely. Use synthetic data; no real API key is required.'}</p><ol>${steps.map((step,index) => `<li><span>${String(index+1).padStart(2,'0')}</span><p>${escapeHtml(step)}</p></li>`).join('')}</ol><div class="production-build-gate"><b>${zh ? '交付證據與通過條件' : 'Evidence and pass criteria'}</b><p>${zh ? '提交可執行 repo、測試同 CI 結果、評測資料/版本/每個 slice 成績、脫敏 trace、威脅模型、成本與 p95 報告、rollback runbook。跨 tenant 讀取、未批核退款或 PII 洩漏必須 0 次；任何 critical failure 都不能靠平均分抵銷。呢個網站唔會自動驗證你個 repo，必須由真人 code review。' : 'Submit a runnable repo, tests and CI result, evaluation dataset/version/per-slice scores, redacted traces, threat model, cost and p95 report, and rollback runbook. Cross-tenant reads, unapproved refunds, and PII leaks must be zero; an average score cannot offset a critical failure. This website cannot verify your repo automatically—require human code review.'}</p></div></section>`;
}

function assessmentPage() {
  const questions = topics.map((topic) => ({ topic, question:topic.quiz.find((item) => item.coverage === 'transfer') || topic.quiz.at(-1) }));
  const session = transient.assessment;
  const score = questions.filter(({ question }) => question.options.find((option) => option.id === session.answers[question.id])?.correct).length;
  const capstone = capstoneQuestions();
  return shell(`<main class="utility-page assessment-shell"><div class="utility-hero"><p class="eyebrow">CUMULATIVE ASSESSMENT + CAPSTONE</p><h1>${state.lang === 'zh' ? '將 13 個主題連成一個決定' : 'Turn 13 topics into one sound decision'}</h1><p>${state.lang === 'zh' ? '13 題跨主題情境題，再完成安全發布 capstone。' : 'Complete 13 cross-topic scenarios, then a safe-release capstone.'}</p></div><div class="assessment-overview"><div><span>${state.lang === 'zh' ? '最佳總評' : 'Best assessment'}</span><strong>${state.cumulative.bestScore}%</strong></div><div><span>${state.lang === 'zh' ? '總評次數' : 'Attempts'}</span><strong>${state.cumulative.attempts.length}</strong></div><div><span>Capstone</span><strong>${state.cumulative.capstoneComplete ? '✓' : '○'}</strong></div></div><section class="assessment-block"><header><div><p class="eyebrow">PART 1</p><h2>${state.lang === 'zh' ? '13 題跨主題總評' : '13-topic cumulative assessment'}</h2></div><span>${Object.keys(session.answers).length} / 13</span></header><div class="assessment-list">${questions.map(({topic,question},index) => `<article class="assessment-card"><p>${String(index+1).padStart(2,'0')} · ${text(topic.title)}</p><fieldset><legend>${text(question.prompt)}</legend>${question.options.map((option) => `<label><input type="radio" name="assessment-${question.id}" data-answer-type="assessment" data-question="${question.id}" value="${option.id}" ${session.answers[question.id] === option.id ? 'checked' : ''} ${session.submitted ? 'disabled' : ''}><span class="radio-ui"></span><b>${text(option.label)}</b></label>`).join('')}</fieldset>${session.submitted ? `<div class="answer-feedback"><b>${question.options.find((option) => option.id === session.answers[question.id])?.correct ? '✓' : '!'}</b><p>${text(question.rationale)}</p></div>` : ''}</article>`).join('')}</div><div class="quiz-submit-bar">${session.submitted ? `<div><strong>${score} / 13</strong><span>${Math.round(score/13*100)}%</span></div><button class="primary-button" data-action="assessment-reset">${state.lang === 'zh' ? '重新評估' : 'Retry assessment'}</button>` : `<span>${Object.keys(session.answers).length} / 13</span><button class="primary-button" data-action="assessment-submit" ${Object.keys(session.answers).length < 13 ? 'disabled' : ''}>${state.lang === 'zh' ? '提交總評' : 'Submit assessment'}</button>`}</div></section><section class="capstone-lab"><header><p class="eyebrow">PART 2 · CAPSTONE</p><h2>${state.lang === 'zh' ? '上線一個安全退款助手' : 'Release a safe refund assistant'}</h2></header><div>${capstone.map((item,index) => `<fieldset><legend><span>${index+1}</span>${escapeHtml(item.prompt)}</legend>${item.options.map((option,optionIndex) => `<label><input type="radio" name="capstone-${item.id}" data-answer-type="capstone" data-question="${item.id}" value="${optionIndex}" ${transient.capstone.answers[item.id] === optionIndex ? 'checked' : ''}><span class="radio-ui"></span><b>${escapeHtml(option)}</b></label>`).join('')}${transient.capstone.submitted ? `<p class="${transient.capstone.answers[item.id] === item.correct ? 'correct' : 'wrong'}">${transient.capstone.answers[item.id] === item.correct ? '✓' : '!'} ${escapeHtml(item.feedback)}</p>` : ''}</fieldset>`).join('')}</div><button class="primary-button" data-action="capstone-submit" ${Object.keys(transient.capstone.answers).length < capstone.length ? 'disabled' : ''}>${state.lang === 'zh' ? '提交 Capstone' : 'Submit capstone'}</button></section></main>`);
}

function capstoneQuestions() {
  return state.lang === 'zh' ? [
    {id:'data',prompt:'最新政策同客戶訂單應點取得？',options:['檢索政策；host 按身份只查該客戶訂單','把所有訂單放入 prompt','每日微調政策'],correct:0,feedback:'新鮮知識用檢索；tenant 權限由 host 強制。'},
    {id:'action',prompt:'真正退款前應有邊組控制？',options:['授權、金額預覽、人批核、idempotency key','只睇模型 confidence','timeout 後無限重試'],correct:0,feedback:'高影響 side effect 要由模型外控制。'},
    {id:'eval',prompt:'邊個評估組合最可靠？',options:['凍結 regression set、adversarial cases、live monitoring','只睇平均答案長度','發布後先定指標'],correct:0,feedback:'離線 gate 同線上監察要連成 evidence loop。'},
    {id:'release',prompt:'Canary 出現越權，應該？',options:['停止、rollback、保存 trace、加 regression','擴大流量','刪除舊版本'],correct:0,feedback:'安全門檻必須可以停止同回滾發布。'},
  ] : [
    {id:'data',prompt:'How should current policy and customer orders be retrieved?',options:['Retrieve policy; host authorizes only that customer’s orders','Put every order in the prompt','Fine-tune policy daily'],correct:0,feedback:'Use retrieval for freshness; the host enforces tenant access.'},
    {id:'action',prompt:'What controls belong before a real refund?',options:['Authorization, amount preview, approval, idempotency key','Only model confidence','Unlimited retries'],correct:0,feedback:'High-impact side effects need controls outside the model.'},
    {id:'eval',prompt:'Which evaluation combination is strongest?',options:['Frozen regressions, adversarial cases, live monitoring','Average answer length only','Choose metrics after release'],correct:0,feedback:'Offline gates and online monitoring form one evidence loop.'},
    {id:'release',prompt:'The canary shows unauthorized action. What next?',options:['Stop, roll back, preserve trace, add regression','Increase traffic','Delete the old version'],correct:0,feedback:'Safety thresholds must stop and reverse a release.'},
  ];
}

function settingsPage() {
  return shell(`<main class="utility-page settings-page"><div class="utility-hero"><p class="eyebrow">LOCAL-FIRST SETTINGS</p><h1>${state.lang === 'zh' ? '你控制自己嘅學習資料' : 'You control your learning data'}</h1><p>${state.lang === 'zh' ? '進度只存喺呢個 browser；可以匯出、匯入或重設。' : 'Progress stays in this browser; export, import, or reset it.'}</p></div><section class="settings-grid"><article><span>01</span><h2>${state.lang === 'zh' ? '語言' : 'Language'}</h2><p>${state.lang === 'zh' ? '繁體中文同 English 隨時切換。' : 'Switch between Traditional Chinese and English.'}</p><button data-action="language">${state.lang === 'zh' ? 'Switch to English' : '切換到繁體中文'}</button></article><article><span>02</span><h2>${state.lang === 'zh' ? '備份與轉移' : 'Backup & transfer'}</h2><p>JSON ${state.lang === 'zh' ? '包括 attempts、review queue 同 mastery；冇帳戶資料。' : 'includes attempts, review queue, and mastery—no account data.'}</p><div><button data-action="export">${state.lang === 'zh' ? '匯出進度' : 'Export progress'}</button><button data-action="import">${state.lang === 'zh' ? '匯入進度' : 'Import progress'}</button><input id="import-progress" type="file" accept="application/json" hidden></div></article><article class="danger-setting"><span>03</span><h2>${state.lang === 'zh' ? '重設進度' : 'Reset progress'}</h2><p>${state.lang === 'zh' ? '刪除此 browser 入面所有學習記錄。' : 'Delete all learning records in this browser.'}</p><button data-action="reset">${state.lang === 'zh' ? '重設所有進度' : 'Reset all progress'}</button></article></section>${transient.message ? `<p class="settings-message" role="status">${escapeHtml(transient.message)}</p>` : ''}<section class="storage-note"><b>Storage schema v1</b><p>${state.lang === 'zh' ? '純本機儲存，無追蹤、無登入、無 API key。' : 'Local storage only: no tracking, sign-in, or API key.'}</p></section></main>`);
}

function render() {
  clearInterval(visualTimer); visualTimer = null;
  const current = route();
  const lessonMatch = current.path.match(/^\/lesson\/([^/]+)$/);
  if (lessonMatch) {
    const topic = topicBySlug(lessonMatch[1]);
    if (topic) app.innerHTML = lesson(topic, lessonTabs.includes(current.params.get('tab')) ? current.params.get('tab') : 'learn');
    else app.innerHTML = dashboard();
  } else if (current.path === '/review') app.innerHTML = reviewPage();
  else if (current.path === '/assessment') {
    app.innerHTML = assessmentPage();
    const checkpoint = app.querySelector('.capstone-lab');
    checkpoint?.insertAdjacentHTML('afterend', productionBuildBrief());
    const checkpointLabel = checkpoint?.querySelector('.eyebrow');
    if (checkpointLabel) checkpointLabel.textContent = 'PART 2 · DESIGN CHECKPOINT';
    const checkpointButton = checkpoint?.querySelector('[data-action="capstone-submit"]');
    if (checkpointButton) checkpointButton.textContent = state.lang === 'zh' ? '提交設計檢查' : 'Submit design checkpoint';
    const intro = app.querySelector('.utility-hero p:last-child');
    if (intro) intro.textContent = state.lang === 'zh'
      ? '先做 13 題總評，再完成設計檢查同實作 brief。選擇題只證明理解，唔等於已部署 production 系統。'
      : 'Complete 13 scenarios, then the design checkpoint and hands-on build brief. Multiple-choice answers do not verify a production deployment.';
    const introLabel = app.querySelector('.utility-hero .eyebrow');
    if (introLabel) introLabel.textContent = 'CUMULATIVE ASSESSMENT + PRODUCTION BUILD';
    const overview = app.querySelector('.assessment-overview > div:last-child span');
    if (overview) overview.textContent = state.lang === 'zh' ? '設計檢查' : 'Design checkpoint';
  }
  else if (current.path === '/map') app.innerHTML = mapPage();
  else if (current.path === '/glossary') app.innerHTML = glossaryPage();
  else if (current.path === '/settings') app.innerHTML = settingsPage();
  else app.innerHTML = dashboard();
  const dashboardCheckpoint = app.querySelector('.dashboard-status-grid article:last-child small');
  if (dashboardCheckpoint) dashboardCheckpoint.textContent = state.cumulative.capstoneComplete
    ? (state.lang === 'zh' ? '設計檢查已完成' : 'Design checkpoint complete')
    : (state.lang === 'zh' ? '設計檢查未完成' : 'Design checkpoint pending');
  bindVisualTimer();
}

function bindVisualTimer() {
  const active = Object.entries(transient.visual).find(([,model]) => model.playing);
  if (!active || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const [topicId, model] = active;
  visualTimer = setInterval(() => {
    const topic = topicById(topicId);
    if (model.step >= topic.visual.steps.length - 1) { model.playing = false; clearInterval(visualTimer); }
    else model.step += 1;
    render();
  }, 1200 / model.speed);
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'language') { state.lang = state.lang === 'zh' ? 'en' : 'zh'; save(); render(); }
  if (action === 'visual-step') { const model = transient.visual[button.dataset.topic]; model.step = Number(button.dataset.step); model.playing = false; render(); }
  if (action === 'visual-play') { const model = transient.visual[button.dataset.topic]; model.playing = !model.playing; render(); }
  if (action === 'visual-replay') { const model = transient.visual[button.dataset.topic]; model.step = 0; model.playing = !matchMedia('(prefers-reduced-motion: reduce)').matches; render(); }
  if (action === 'practice-submit') { const topic = topicById(button.dataset.topic); const session = transient.practice[topic.id]; session.submitted = true; const progress = state.topicProgress[topic.id]; state.topicProgress[topic.id] = deriveProgress({ ...progress, practiceComplete:session.answer === topic.practice.correctIndex || progress.practiceComplete, lastStudied:nowIso() }); save(); render(); }
  if (action === 'quiz-submit') submitQuiz(button.dataset.topic);
  if (action === 'quiz-reset') { transient.quiz[button.dataset.topic] = { answers:{}, submitted:false }; render(); }
  if (action === 'remediate') { const progress = state.topicProgress[button.dataset.topic]; state.topicProgress[button.dataset.topic] = deriveProgress({ ...progress, remediated:[...new Set([...progress.remediated, button.dataset.question])], lastStudied:nowIso() }); save(); const topic = topicById(button.dataset.topic); location.hash = `#/lesson/${topic.slug}?tab=learn`; }
  if (action === 'recap-complete') { const progress = state.topicProgress[button.dataset.topic]; state.topicProgress[button.dataset.topic] = deriveProgress({ ...progress, recapReached:true, lastStudied:nowIso() }); save(); render(); }
  if (action === 'review-done') { state.reviewQueue = state.reviewQueue.map((item) => item.id === button.dataset.id ? { ...item, done:true } : item); save(); render(); }
  if (action === 'assessment-submit') submitAssessment();
  if (action === 'assessment-reset') { transient.assessment = { answers:{}, submitted:false }; render(); }
  if (action === 'capstone-submit') { const questions = capstoneQuestions(); transient.capstone.submitted = true; if (questions.every((item) => transient.capstone.answers[item.id] === item.correct)) state.cumulative.capstoneComplete = true; save(); render(); }
  if (action === 'copy-code') { const code = button.closest('.code-example')?.querySelector('code')?.textContent || ''; navigator.clipboard?.writeText(code); button.textContent = state.lang === 'zh' ? '已複製 ✓' : 'Copied ✓'; window.setTimeout(() => { button.textContent = state.lang === 'zh' ? '複製 Code' : 'Copy code'; }, 1200); }
  if (action === 'export') exportProgress();
  if (action === 'import') document.querySelector('#import-progress').click();
  if (action === 'reset' && confirm(state.lang === 'zh' ? '確定重設所有本機進度？' : 'Reset all local progress?')) { state = initialState(); transient.message = state.lang === 'zh' ? '進度已重設。' : 'Progress reset.'; save(); render(); }
});

document.addEventListener('change', (event) => {
  const input = event.target;
  if (input.matches('[data-safety]')) { state.safetyChecks[Number(input.dataset.safety)] = input.checked; save(); }
  if (input.dataset.answerType === 'practice') { const session = transient.practice[input.dataset.topic] ||= { answer:null, submitted:false }; session.answer = Number(input.value); session.submitted = false; render(); }
  if (input.dataset.answerType === 'quiz') { const session = transient.quiz[input.dataset.topic] ||= { answers:{}, submitted:false }; session.answers[input.dataset.question] = input.value; render(); }
  if (input.dataset.answerType === 'assessment') { transient.assessment.answers[input.dataset.question] = input.value; render(); }
  if (input.dataset.answerType === 'capstone') { transient.capstone.answers[input.dataset.question] = Number(input.value); transient.capstone.submitted = false; render(); }
  if (input.dataset.visualParameter) { transient.visual[input.dataset.visualParameter].parameter = Number(input.value); render(); }
  if (input.dataset.visualSpeed) { transient.visual[input.dataset.visualSpeed].speed = Number(input.value); render(); }
  if (input.id === 'import-progress') importProgress(input.files?.[0]);
});

document.addEventListener('input', (event) => {
  const input = event.target;
  if (input.dataset.note) { state.notes[input.dataset.note] = input.value; save(); }
  if (input.matches('[data-glossary-search]')) { transient.glossary = input.value; render(); const next = document.querySelector('[data-glossary-search]'); next.focus(); next.setSelectionRange(next.value.length,next.value.length); }
});

function submitQuiz(topicId) {
  const topic = topicById(topicId); const session = transient.quiz[topicId];
  const missed = topic.quiz.filter((question) => !question.options.find((option) => option.id === session.answers[question.id])?.correct).map((question) => question.id);
  const attempt = { at:nowIso(), score:topic.quiz.length - missed.length, total:topic.quiz.length, missed };
  const previous = state.topicProgress[topicId];
  state.topicProgress[topicId] = deriveProgress({ ...previous, attempts:[...previous.attempts,attempt], latestScore:scorePercent(attempt), bestScore:Math.max(previous.bestScore,scorePercent(attempt)), lastStudied:attempt.at });
  state.reviewQueue.push(...missed.flatMap((questionId) => [1,3,7].map((day) => ({ id:`${attempt.at}-${questionId}-${day}`, topicId, questionId, day, dueAt:new Date(Date.now()+day*86400000).toISOString(), done:false }))));
  session.submitted = true; save(); render();
}

function submitAssessment() {
  const questions = topics.map((topic) => topic.quiz.find((item) => item.coverage === 'transfer') || topic.quiz.at(-1));
  const missed = questions.filter((question) => !question.options.find((option) => option.id === transient.assessment.answers[question.id])?.correct).map((question) => question.id);
  const attempt = { at:nowIso(), score:questions.length - missed.length, total:questions.length, missed };
  state.cumulative.attempts.push(attempt); state.cumulative.bestScore = Math.max(state.cumulative.bestScore,scorePercent(attempt)); transient.assessment.submitted = true; save(); render();
}

function exportProgress() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'ai-academy-progress.json'; anchor.click(); URL.revokeObjectURL(url);
  transient.message = state.lang === 'zh' ? '進度已匯出。' : 'Progress exported.'; render();
}

function importProgress(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { try { const parsed = JSON.parse(String(reader.result)); if (parsed.version !== 1) throw new Error(); state = normalizeState(parsed); transient.message = state.lang === 'zh' ? '進度已匯入。' : 'Progress imported.'; save(); render(); } catch { transient.message = state.lang === 'zh' ? '檔案格式無效。' : 'Invalid progress file.'; render(); } };
  reader.readAsText(file);
}

function updateOnlineStatus() {
  const banner = document.querySelector('#offline-banner');
  banner.hidden = navigator.onLine;
  banner.innerHTML = `<b>${state.lang === 'zh' ? '離線模式' : 'Offline mode'}</b><span>${state.lang === 'zh' ? '課堂、測驗同進度仍可用；外部來源連結要恢復連線。' : 'Lessons, quizzes, and progress still work; external sources require a connection.'}</span>`;
}

window.addEventListener('hashchange', () => { render(); scrollTo({top:0,behavior:'instant'}); });
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
save(); render(); updateOnlineStatus();
