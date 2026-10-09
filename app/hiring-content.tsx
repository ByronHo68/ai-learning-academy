'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Highlight, themes, type Language } from 'prism-react-renderer';
import { hiringCapstone, hiringSkills, hiringSources, hiringVerifiedAt, specialistTracks } from '../lib/hiring-track.js';
import { Lang, pick, topicById } from '../lib/curriculum';

type HiringSkill = (typeof hiringSkills)[number];

export function HiringBanner({ lang }:{ lang:Lang }) {
  return <aside className="hiring-banner"><div><p className="eyebrow">BUILD · MEASURE · EXPLAIN</p><h2>{lang==='zh'?'招聘者會想睇到咩能力？':'What would an AI engineering recruiter want to see?'}</h2><p>{lang==='zh'?'10 個能力指南、20 個生活例子，同一個連成完整作品嘅實作計劃。唔只記工具名：用 code、測試同結果證明。':'10 competency guides, 20 everyday examples, and one portfolio project. Go beyond tool names: show code, tests, and results.'}</p></div><Link href="/hiring-readiness">{lang==='zh'?'AI Developer 求職實戰':'AI developer hiring guide'} →</Link></aside>;
}

function HiringCode({ skill,lang }:{ skill:HiringSkill;lang:Lang }) {
  const [copyStatus,setCopyStatus]=useState<'ready'|'copied'|'failed'>('ready');
  const language:Language=skill.language.toLowerCase()==='python'?'python':skill.language.toLowerCase()==='sql'?'sql':'javascript';
  const copy=async()=>{
    try { await navigator.clipboard.writeText(skill.code);setCopyStatus('copied'); }
    catch { setCopyStatus('failed'); }
  };
  return <div className="rich-code-example hiring-code">
    <header><div><span><small>{skill.language}</small><b>{pick(skill.codeTitle,lang)}</b></span></div><button type="button" onClick={copy}>{copyStatus==='copied'?(lang==='zh'?'已複製':'Copied'):(lang==='zh'?'複製 Code':'Copy code')}</button></header>
    <Highlight theme={themes.nightOwl} code={skill.code} language={language}>{({className,style,tokens,getLineProps,getTokenProps})=><pre className={className} style={style}>{tokens.map((line,index)=><div {...getLineProps({line})} key={index}>{line.map((token,tokenIndex)=><span {...getTokenProps({token})} key={tokenIndex}/>)}</div>)}</pre>}</Highlight>
    <footer><p role="status">{copyStatus==='failed'?(lang==='zh'?'未能使用剪貼簿；請選取 code 手動複製。':'Clipboard unavailable; select the code and copy it manually.'):copyStatus==='copied'?(lang==='zh'?'Code 已複製。':'Code copied.'):''}</p><p>{lang==='zh'?'最小教學例子，唔係完整 production 實作；練習需加入測試、授權、錯誤處理同真實量度。':'Minimal teaching example, not a complete production implementation. Add tests, authorization, error handling, and real measurements.'}</p></footer>
  </div>;
}

function TopicLinks({ ids,lang }:{ ids:string[];lang:Lang }) {
  return <nav className="hiring-topic-links" aria-label={lang==='zh'?'相關課堂':'Related lessons'}>{ids.map(id=>{
    const topic=topicById(id);
    return topic?<Link href={`/learn/${topic.slug}`} key={id}>{pick(topic.title,lang)} →</Link>:null;
  })}</nav>;
}

export default function HiringContent({ lang }:{ lang:Lang }) {
  const openSkill=(id:string)=>{
    if(!hiringSkills.some(skill=>`hire-${skill.id}`===id))return;
    const target=document.getElementById(id);
    if(target instanceof HTMLDetailsElement){target.open=true;target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'auto'});}
  };
  useEffect(()=>{
    const followHash=()=>{
      const id=window.location.hash.slice(1);
      if(!hiringSkills.some(skill=>`hire-${skill.id}`===id))return;
      const target=document.getElementById(id);
      if(target instanceof HTMLDetailsElement){target.open=true;target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'auto'});}
    };
    followHash();window.addEventListener('hashchange',followHash);
    return()=>window.removeEventListener('hashchange',followHash);
  },[]);
  return <main className="utility-page hiring-page">
    <div className="utility-hero"><p className="eyebrow">AI DEVELOPER · RECRUITER LENS</p><h1>{lang==='zh'?'由「識工具」，變成「有證據嘅 AI Developer」':'From knowing tools to proving AI engineering ability'}</h1><p>{lang==='zh'?'如果我招聘 applied AI developer，我會睇你點定義問題、寫程式、量度品質、守住安全同處理失敗。以下係練習指南，唔係自動招聘評分。':'If I were hiring an applied AI developer, I would look for problem framing, working code, measured quality, safe boundaries, and failure handling. This is a practice guide, not an automated hiring score.'}</p></div>
    <aside className="hiring-notice"><strong>{lang==='zh'?'Junior 先學核心；專門職位再加深':'Core first for juniors; specialize for the role'}</strong><p>{lang==='zh'?'以下優先次序係教學判斷，參考少量有經驗職位嘅描述，唔係所有公司嘅門檻。唔需要識晒 framework、Kubernetes 或訓練大模型先開始申請。讀完、測驗過關或開過每張卡，都唔代表已驗證 production 能力，亦唔保證獲聘。':'These priorities are editorial teaching judgment informed by a small sample of experienced-role descriptions, not universal requirements. You do not need every framework, Kubernetes, or large-model training before applying. Reading, passing quizzes, or opening cards does not verify production ability or guarantee employment.'}</p></aside>
    <nav className="hiring-index" aria-label={lang==='zh'?'能力指南目錄':'Competency guide contents'}>{hiringSkills.map((skill,index)=><a href={`#hire-${skill.id}`} onClick={()=>openSkill(`hire-${skill.id}`)} key={skill.id}><span>{String(index+1).padStart(2,'0')}</span>{pick(skill.title,lang)}</a>)}</nav>
    <section className="hiring-skills" aria-label={lang==='zh'?'十個核心能力':'Ten core competencies'}>{hiringSkills.map((skill,index)=><details className="hiring-skill" id={`hire-${skill.id}`} key={skill.id} tabIndex={-1} open={index===0}>
      <summary><span>{String(index+1).padStart(2,'0')}</span><h2>{pick(skill.title,lang)}</h2><i aria-hidden="true">+</i></summary>
      <div className="hiring-skill-body"><p className="hiring-explanation">{pick(skill.explanation,lang)}</p>
        <section className="everyday-examples"><header><p className="eyebrow">{lang==='zh'?'生活例子 → 技術概念':'EVERYDAY LIFE → TECHNICAL IDEA'}</p><h3>{lang==='zh'?'先用熟悉嘅情境理解':'Start with familiar situations'}</h3></header><div className="everyday-example-grid">{skill.dailyExamples.map((example,exampleIndex)=><article key={example.title.en}><span className="everyday-example-number">{String(exampleIndex+1).padStart(2,'0')}</span><h4>{pick(example.title,lang)}</h4><p>{pick(example.story,lang)}</p><div className="everyday-connection"><b>{lang==='zh'?'對應概念':'How it connects'}</b><p>{pick(example.connection,lang)}</p></div></article>)}</div></section>
        <div className="rich-concept-bridges"><section><small>{lang==='zh'?'比喻':'METAPHOR'}</small><h3>{pick(skill.metaphorTitle,lang)}</h3><p>{pick(skill.metaphor,lang)}</p></section><section><small>{lang==='zh'?'AI 工作情境':'AI WORK SCENARIO'}</small><p>{pick(skill.example,lang)}</p></section></div>
        <ol className="rich-concept-steps">{skill.steps.map((step,stepIndex)=><li key={stepIndex}><span>{stepIndex+1}</span><p>{pick(step,lang)}</p></li>)}</ol>
        <HiringCode skill={skill} lang={lang}/>
        <div className="hiring-proof-grid"><section><h3>{lang==='zh'?'實作練習':'Practical drill'}</h3><p>{pick(skill.drill.task,lang)}</p><b>{lang==='zh'?'要展示嘅結果':'Observable result'}</b><p>{pick(skill.drill.pass,lang)}</p></section><section><h3>{lang==='zh'?'作品要有咩證據？':'What should your portfolio prove?'}</h3><ul>{skill.evidence.map((item,evidenceIndex)=><li key={evidenceIndex}>{pick(item,lang)}</li>)}</ul></section></div>
        <details className="hiring-interview"><summary>{lang==='zh'?'面試練習：':'Interview practice: '}{pick(skill.interview.question,lang)}</summary><p><b>{lang==='zh'?'好答案會解釋：':'A good answer explains: '}</b>{pick(skill.interview.answer,lang)}</p><small>{lang==='zh'?'原創練習題，唔係上述公司嘅真實面試題。':'Original practice prompt, not an actual interview question from the referenced employers.'}</small></details>
        <TopicLinks ids={skill.topicIds} lang={lang}/>
        <div className="hiring-skill-sources">{skill.sourceIds.map(id=>{const source=hiringSources.find(item=>item.id===id);return source?<a href={source.url} target="_blank" rel="noreferrer" key={id}>{source.publisher} · {source.title} ↗</a>:null;})}</div>
      </div>
    </details>)}</section>
    <section className="hiring-specialists"><header><p className="eyebrow">OPTIONAL · ROLE-DEPENDENT</p><h2>{lang==='zh'?'深度學習同 OpenCV：按職位揀專項':'Deep learning and OpenCV: specialize for the role'}</h2><p>{lang==='zh'?'Applied LLM、computer vision、模型訓練同研究職位唔係同一張技能清單。先揀方向，再加以下證據。':'Applied LLM, computer vision, model-training, and research roles do not share one identical checklist. Choose a direction, then build the relevant evidence.'}</p></header><div>{specialistTracks.map(track=><article key={track.id}><h3>{pick(track.title,lang)}</h3><p>{pick(track.explanation,lang)}</p><b>{lang==='zh'?'可展示嘅證據':'Evidence to show'}</b><p>{pick(track.evidence,lang)}</p><TopicLinks ids={track.topicIds} lang={lang}/></article>)}</div></section>
    <section className="hiring-capstone"><p className="eyebrow">ONE PROJECT · TEN COMPETENCIES</p><h2>{pick(hiringCapstone.title,lang)}</h2><p>{pick(hiringCapstone.description,lang)}</p><ol>{hiringCapstone.phases.map((phase,index)=><li key={index}><span>{index+1}</span><p>{pick(phase,lang)}</p></li>)}</ol><div className="hiring-proof-grid"><section><h3>{lang==='zh'?'交付物':'Deliverables'}</h3><ul>{hiringCapstone.deliverables.map((item,index)=><li key={index}>{pick(item,lang)}</li>)}</ul></section><section><h3>{lang==='zh'?'Demo 時要驗證':'Verify during the demo'}</h3><ul>{hiringCapstone.acceptance.map((item,index)=><li key={index}>{pick(item,lang)}</li>)}</ul></section></div><p className="hiring-disclaimer">{lang==='zh'?'練習目標由你同 reviewer 約定；唔係僱主招聘門檻。用合成或獲授權資料，唔公開 secrets、真實客戶資料或未獲許可嘅公司 code。':'Agree exercise targets with your reviewer; they are not employer hiring thresholds. Use synthetic or authorized data. Never publish secrets, real customer data, or unapproved company code.'}</p><Link className="primary-button" href="/assessment">{lang==='zh'?'接住做課程總評同 production brief':'Continue to the assessment and production brief'} →</Link></section>
    <section className="hiring-source-list"><h2>{lang==='zh'?'招聘參考，同教學判斷分開':'Employer references, separated from teaching judgment'}</h2><p>{lang==='zh'?'參考職位核實日期：':'Role descriptions checked: '}<time dateTime={hiringVerifiedAt}>{hiringVerifiedAt}</time>{lang==='zh'?'。職位會更改或關閉；以下只係小樣本，唔係整體招聘市場統計。':' . Postings may change or close; this small sample is not a labor-market survey.'}</p>{hiringSources.map(source=><article key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.publisher} · {source.title} ↗</a><p>{pick(source.note,lang)}</p></article>)}</section>
  </main>;
}
