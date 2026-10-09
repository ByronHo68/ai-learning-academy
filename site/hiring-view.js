import { hiringCapstone, hiringSkills, hiringSources, hiringVerifiedAt, specialistTracks } from './hiring-track.js';
import { topicById, pick } from './curriculum.js';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

function renderTopicLinks(ids, lang) {
  const text = (copy) => escapeHtml(pick(copy, lang));
  const label = escapeHtml(lang === 'zh' ? '相關課堂' : 'Related lessons');
  return `<nav class="hiring-topic-links" aria-label="${label}">${ids.map((id) => {
    const topic = topicById(id);
    if (!topic) return '';
    const url = escapeHtml(`#/lesson/${encodeURIComponent(topic.slug)}`);
    return `<a href="${url}">${text(topic.title)} →</a>`;
  }).join('')}</nav>`;
}

export function renderHiringBanner(lang) {
  lang = lang === 'en' ? 'en' : 'zh';
  const text = (copy) => escapeHtml(pick(copy, lang));
  return `<aside class="hiring-banner"><div><p class="eyebrow">${escapeHtml('BUILD · MEASURE · EXPLAIN')}</p>
    <h2>${text({ zh: '招聘者會想睇到咩能力？', en: 'What would an AI engineering recruiter want to see?' })}</h2>
    <p>${text({ zh: '10 個能力指南、20 個生活例子，同一個連成完整作品嘅實作計劃。唔只記工具名：用 code、測試同結果證明。', en: '10 competency guides, 20 everyday examples, and one portfolio project. Go beyond tool names: show code, tests, and results.' })}</p></div>
    <a href="${escapeHtml('#/hiring-readiness')}">${text({ zh: 'AI Developer 求職實戰', en: 'AI developer hiring guide' })} →</a>
  </aside>`;
}

export function renderHiringContent(lang, selectedSkill = '') {
  lang = lang === 'en' ? 'en' : 'zh';
  const text = (copy) => escapeHtml(pick(copy, lang));
  const label = (zh, en) => text({ zh, en });
  const list = (items) => items.map((item) => `<li>${text(item)}</li>`).join('');
  const openSkill = hiringSkills.find((skill) => skill.id === selectedSkill)?.id ?? hiringSkills[0]?.id;

  const index = hiringSkills.map((skill, skillIndex) => {
    const url = escapeHtml(`#/hiring-readiness?skill=${encodeURIComponent(skill.id)}`);
    return `<a href="${url}"><span>${escapeHtml(String(skillIndex + 1).padStart(2, '0'))}</span>${text(skill.title)}</a>`;
  }).join('');

  const skills = hiringSkills.map((skill, skillIndex) => {
    const dailyExamples = skill.dailyExamples.map((example, exampleIndex) => `<article>
      <span class="everyday-example-number">${escapeHtml(String(exampleIndex + 1).padStart(2, '0'))}</span>
      <h4>${text(example.title)}</h4><p>${text(example.story)}</p>
      <div class="everyday-connection"><b>${label('對應概念', 'How it connects')}</b><p>${text(example.connection)}</p></div>
    </article>`).join('');
    const steps = skill.steps.map((step, stepIndex) => `<li><span>${escapeHtml(stepIndex + 1)}</span><p>${text(step)}</p></li>`).join('');
    const sourceLinks = skill.sourceIds.map((id) => {
      const source = hiringSources.find((item) => item.id === id);
      return source ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.publisher)} · ${escapeHtml(source.title)} ↗</a>` : '';
    }).join('');
    return `<details class="hiring-skill" id="${escapeHtml(`hire-${skill.id}`)}" tabindex="-1"${skill.id === openSkill ? ' open' : ''}>
      <summary><span>${escapeHtml(String(skillIndex + 1).padStart(2, '0'))}</span><h2>${text(skill.title)}</h2><i aria-hidden="true">+</i></summary>
      <div class="hiring-skill-body"><p class="hiring-explanation">${text(skill.explanation)}</p>
        <section class="everyday-examples"><header>
          <p class="eyebrow">${label('生活例子 → 技術概念', 'EVERYDAY LIFE → TECHNICAL IDEA')}</p>
          <h3>${label('先用熟悉嘅情境理解', 'Start with familiar situations')}</h3>
        </header><div class="everyday-example-grid">${dailyExamples}</div></section>
        <div class="rich-concept-bridges">
          <section><small>${label('比喻', 'METAPHOR')}</small><h3>${text(skill.metaphorTitle)}</h3><p>${text(skill.metaphor)}</p></section>
          <section><small>${label('AI 工作情境', 'AI WORK SCENARIO')}</small><p>${text(skill.example)}</p></section>
        </div>
        <ol class="rich-concept-steps">${steps}</ol>
        <div class="code-example rich-code-example hiring-code">
          <header><div><span><small>${escapeHtml(skill.language)}</small><b>${text(skill.codeTitle)}</b></span></div>
            <button type="button" data-action="copy-code">${label('複製 Code', 'Copy code')}</button>
          </header><pre><code>${escapeHtml(skill.code)}</code></pre>
          <footer><p>${label('最小教學例子，唔係完整 production 實作；練習需加入測試、授權、錯誤處理同真實量度。', 'Minimal teaching example, not a complete production implementation. Add tests, authorization, error handling, and real measurements.')}</p></footer>
        </div>
        <div class="hiring-proof-grid">
          <section><h3>${label('實作練習', 'Practical drill')}</h3><p>${text(skill.drill.task)}</p><b>${label('要展示嘅結果', 'Observable result')}</b><p>${text(skill.drill.pass)}</p></section>
          <section><h3>${label('作品要有咩證據？', 'What should your portfolio prove?')}</h3><ul>${list(skill.evidence)}</ul></section>
        </div>
        <details class="hiring-interview"><summary>${label('面試練習：', 'Interview practice: ')}${text(skill.interview.question)}</summary>
          <p><b>${label('好答案會解釋：', 'A good answer explains: ')}</b>${text(skill.interview.answer)}</p>
          <small>${label('原創練習題，唔係上述公司嘅真實面試題。', 'Original practice prompt, not an actual interview question from the referenced employers.')}</small>
        </details>
        ${renderTopicLinks(skill.topicIds, lang)}<div class="hiring-skill-sources">${sourceLinks}</div>
      </div>
    </details>`;
  }).join('');

  const specialists = specialistTracks.map((track) => `<article>
    <h3>${text(track.title)}</h3><p>${text(track.explanation)}</p><b>${label('可展示嘅證據', 'Evidence to show')}</b><p>${text(track.evidence)}</p>
    ${renderTopicLinks(track.topicIds, lang)}
  </article>`).join('');
  const phases = hiringCapstone.phases.map((phase, phaseIndex) => `<li><span>${escapeHtml(phaseIndex + 1)}</span><p>${text(phase)}</p></li>`).join('');
  const sources = hiringSources.map((source) => `<article>
    <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.publisher)} · ${escapeHtml(source.title)} ↗</a><p>${text(source.note)}</p>
  </article>`).join('');

  return `<main class="utility-page hiring-page">
    <div class="utility-hero"><p class="eyebrow">${escapeHtml('AI DEVELOPER · RECRUITER LENS')}</p>
      <h1>${label('由「識工具」，變成「有證據嘅 AI Developer」', 'From knowing tools to proving AI engineering ability')}</h1>
      <p>${label('如果我招聘 applied AI developer，我會睇你點定義問題、寫程式、量度品質、守住安全同處理失敗。以下係練習指南，唔係自動招聘評分。', 'If I were hiring an applied AI developer, I would look for problem framing, working code, measured quality, safe boundaries, and failure handling. This is a practice guide, not an automated hiring score.')}</p>
    </div>
    <aside class="hiring-notice"><strong>${label('Junior 先學核心；專門職位再加深', 'Core first for juniors; specialize for the role')}</strong>
      <p>${label('以下優先次序係教學判斷，參考少量有經驗職位嘅描述，唔係所有公司嘅門檻。唔需要識晒 framework、Kubernetes 或訓練大模型先開始申請。讀完、測驗過關或開過每張卡，都唔代表已驗證 production 能力，亦唔保證獲聘。', 'These priorities are editorial teaching judgment informed by a small sample of experienced-role descriptions, not universal requirements. You do not need every framework, Kubernetes, or large-model training before applying. Reading, passing quizzes, or opening cards does not verify production ability or guarantee employment.')}</p>
    </aside>
    <nav class="hiring-index" aria-label="${label('能力指南目錄', 'Competency guide contents')}">${index}</nav>
    <section class="hiring-skills" aria-label="${label('十個核心能力', 'Ten core competencies')}">${skills}</section>
    <section class="hiring-specialists"><header><p class="eyebrow">${escapeHtml('OPTIONAL · ROLE-DEPENDENT')}</p>
      <h2>${label('深度學習同 OpenCV：按職位揀專項', 'Deep learning and OpenCV: specialize for the role')}</h2>
      <p>${label('Applied LLM、computer vision、模型訓練同研究職位唔係同一張技能清單。先揀方向，再加以下證據。', 'Applied LLM, computer vision, model-training, and research roles do not share one identical checklist. Choose a direction, then build the relevant evidence.')}</p>
    </header><div>${specialists}</div></section>
    <section class="hiring-capstone"><p class="eyebrow">${escapeHtml('ONE PROJECT · TEN COMPETENCIES')}</p>
      <h2>${text(hiringCapstone.title)}</h2><p>${text(hiringCapstone.description)}</p><ol>${phases}</ol>
      <div class="hiring-proof-grid">
        <section><h3>${label('交付物', 'Deliverables')}</h3><ul>${list(hiringCapstone.deliverables)}</ul></section>
        <section><h3>${label('Demo 時要驗證', 'Verify during the demo')}</h3><ul>${list(hiringCapstone.acceptance)}</ul></section>
      </div>
      <p class="hiring-disclaimer">${label('練習目標由你同 reviewer 約定；唔係僱主招聘門檻。用合成或獲授權資料，唔公開 secrets、真實客戶資料或未獲許可嘅公司 code。', 'Agree exercise targets with your reviewer; they are not employer hiring thresholds. Use synthetic or authorized data. Never publish secrets, real customer data, or unapproved company code.')}</p>
      <a class="primary-button" href="${escapeHtml('#/assessment')}">${label('接住做課程總評同 production brief', 'Continue to the assessment and production brief')} →</a>
    </section>
    <section class="hiring-source-list"><h2>${label('招聘參考，同教學判斷分開', 'Employer references, separated from teaching judgment')}</h2>
      <p>${label('參考職位核實日期：', 'Role descriptions checked: ')}<time datetime="${escapeHtml(hiringVerifiedAt)}">${escapeHtml(hiringVerifiedAt)}</time>${label('。職位會更改或關閉；以下只係小樣本，唔係整體招聘市場統計。', '. Postings may change or close; this small sample is not a labor-market survey.')}</p>
      ${sources}
    </section>
  </main>`;
}
