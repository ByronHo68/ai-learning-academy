'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { type Lang, pick, topicById } from '../lib/curriculum';
import { juniorLessons } from '../lib/junior-track';
import { juniorExamples } from '../lib/junior-examples';
import { juniorProjects } from '../lib/junior-projects';
import { hkJobs, juniorSequence, marketReviewedAt } from '../lib/hk-market';
import ConceptStudio from './concept-studio';
import { type VisualLesson } from '../lib/junior-simulations';

export function JuniorBanner({lang}:{lang:Lang}) {
  return <aside className="hiring-banner junior-banner"><div><p className="eyebrow">HONG KONG · JUNIOR PATH</p><h2>{lang==='zh'?'先親手建立，再用成果證明':'Build it yourself. Show the evidence.'}</h2><p>{lang==='zh'?'6 課 Python 實作、3 個漸進項目，同 13 份香港職位描述。先學核心，再選專項。':'Six Python labs, three progressive projects and 13 Hong Kong role descriptions. Core skills first, then a specialist track.'}</p></div><Link href="/junior-path">{lang==='zh'?'開始初級實作路線':'Start the junior practice path'} →</Link></aside>;
}

function LabCode({id,lang}:{id:keyof typeof juniorExamples;lang:Lang}) {
  const [status,setStatus]=useState('');
  const code=juniorExamples[id];
  const copy=async()=>{try{await navigator.clipboard.writeText(code);setStatus(lang==='zh'?'已複製':'Copied');}catch{setStatus(lang==='zh'?'請選取程式碼手動複製':'Please select and copy the code manually');}};
  return <div className="rich-code-example junior-code"><header><b>{id}.py · Python 3.11+</b><div><button onClick={copy}>{lang==='zh'?'複製':'Copy'}</button><a href={`/junior-path/labs/${id}`} download={`${id}.py`}>{lang==='zh'?'下載 .py':'Download .py'}</a></div></header>
    <Highlight theme={themes.nightOwl} code={code} language="python">{({className,style,tokens,getLineProps,getTokenProps})=><pre className={className} style={style} tabIndex={0} aria-label={`${id}.py`}>{tokens.map((line,i)=><div {...getLineProps({line})} key={i}>{line.map((token,j)=><span {...getTokenProps({token})} key={j}/>)}</div>)}</pre>}</Highlight>
    <footer><p>{lang==='zh'?'離線可執行示例；包含內建檢查，沒有真實 API 呼叫。':'Offline runnable example with built-in checks and no live API calls.'} <code>python {id}.py</code></p><span role="status">{status}</span></footer>
  </div>;
}

function JobLinks({ids}:{ids:string[]}) {
  return <div className="hiring-skill-sources">{ids.map(id=>{const job=hkJobs.find(j=>j.id===id);return job?<a key={id} href={job.url} target="_blank" rel="noreferrer">{id} · {job.employer} ↗</a>:null;})}</div>;
}

export default function JuniorContent({lang}:{lang:Lang}) {
  const [visualLesson,setVisualLesson]=useState<VisualLesson>('python');
  useEffect(()=>{
    const openHash=()=>{const target=document.getElementById(decodeURIComponent(window.location.hash.slice(1)));if(target instanceof HTMLDetailsElement)target.open=true;if(target)target.scrollIntoView({block:'start'});};
    openHash();window.addEventListener('hashchange',openHash);return()=>window.removeEventListener('hashchange',openHash);
  },[]);
  const labels={objective:lang==='zh'?'學習目標':'Learning objective',prior:lang==='zh'?'先備知識':'Prerequisites',why:lang==='zh'?'工作上為何需要':'Why it matters',walkthrough:lang==='zh'?'例子逐步解讀':'Worked example',mistakes:lang==='zh'?'常見錯誤與診斷':'Mistakes and diagnosis',exercise:lang==='zh'?'獨立練習':'Independent exercise',check:lang==='zh'?'驗證方法':'Check your result',independent:lang==='zh'?'之後要能獨立做到':'What you should do independently'};
  return <main className="utility-page hiring-page junior-page">
    <div className="utility-hero"><p className="eyebrow">HONG KONG · APPLIED AI · ENTRY / JUNIOR</p><h1>{lang==='zh'?'由基礎到可展示的 AI 作品':'From foundations to demonstrable AI work'}</h1><p>{lang==='zh'?'完成一課的意思係能改、能測、能解釋。先用六個互動動畫看見概念，再用完整離線程式實作；作品仍要由你親手完成及接受審閱。':'Completing a lesson means changing, testing and explaining it. Explore six animated concepts, then work through complete offline programs; you build the projects and have the work reviewed.'}</p></div>
    <ConceptStudio lang={lang} selected={visualLesson} onSelect={setVisualLesson}/>
    <aside className="hiring-notice"><strong>{lang==='zh'?'先做診斷，按能力開始':'Start with a practical diagnostic'}</strong><p>{lang==='zh'?'試由空白檔讀 JSON、驗證欄位、寫一個拒絕壞輸入的測試，再用 Git diff 解釋改動。做唔到就由第一課開始。能做到可直接去 HTTP／SQL。閱讀、測驗分數及網站進度不代表實作能力或就業保證。':'From a blank file, read JSON, validate a field, write a rejection test and explain the Git diff. Start at lesson one if you cannot do this; otherwise begin with HTTP/SQL. Reading, quiz scores and site progress do not establish practical proficiency or guarantee employment.'}</p></aside>
    <section className="junior-sequence"><h2>{lang==='zh'?'核心學習次序':'Core learning sequence'}</h2><ol>{juniorSequence.map((step,i)=><li key={i}>{pick(step,lang)}</li>)}</ol><p>{lang==='zh'?'選修：企業 low-code／cloud 整合、電商／語音、模型訓練。稍後：GraphRAG、多 agent、A2A、Kubernetes、GPU serving、LoRA／RL。SQL、測試及安全雖未必每份廣告逐項寫出，仍支撐可靠 API 同資料存取。':'Optional tracks: enterprise low-code/cloud integration, commerce/voice and model training. Later: GraphRAG, multi-agent systems, A2A, Kubernetes, GPU serving and LoRA/RL. SQL, testing and security support reliable APIs and data access even when an ad does not list each foundation.'}</p></section>
    <section className="junior-setup"><h2>{lang==='zh'?'執行與版本控制':'Run and version your work'}</h2><p>{lang==='zh'?'使用 Python 3.11+。先建立新練習資料夾，把每課 .py 下載到其中；以下是 macOS/Linux 指令。Windows 用 py -m venv .venv，再直接執行 .venv\\Scripts\\python.exe python.py。六個例子只用 standard library，無需安裝套件。':'Use Python 3.11+. Create a new practice folder and download the lesson .py files there. Commands below use macOS/Linux. On Windows use py -m venv .venv, then .venv\\Scripts\\python.exe python.py. The six examples use only the standard library.'}</p><pre tabIndex={0}>{`python3 -m venv .venv
source .venv/bin/activate
python --version
python python.py
python -m unittest discover -s tests -v
# Run unittest after creating your own tests/ directory.
git init
git switch -c practice/intent-counter
git status
git diff`}</pre><p>{lang==='zh'?'先把 .venv/、.env、__pycache__/ 加到 .gitignore，再 git add 指定的程式與測試，檢查 git diff --staged，最後 git commit。每次修正先重現、加測試、再改 code。項目加入外部套件後用獨立環境、固定相容版本並記錄安裝／測試指令。':'Ignore .venv/, .env and __pycache__/ before staging named source/test files. Inspect git diff --staged, then commit. Reproduce, test and fix each bug. For projects with external packages, use an isolated environment, pin compatible versions and record installation/test commands.'}</p></section>
    <nav className="hiring-index" aria-label={lang==='zh'?'初級課堂目錄':'Junior lesson contents'}>{juniorLessons.map((lesson,i)=><a href={`#${lesson.id}`} key={lesson.id} onClick={()=>{const el=document.getElementById(lesson.id);if(el instanceof HTMLDetailsElement)el.open=true;}}><span>{String(i+1).padStart(2,'0')}</span>{pick(lesson.title,lang)}</a>)}</nav>
    <section className="hiring-skills">{juniorLessons.map((lesson,i)=><details className="hiring-skill junior-lesson" id={lesson.id} key={lesson.id} open={i===0}>
      <summary><span>{String(i+1).padStart(2,'0')}</span><h2>{pick(lesson.title,lang)}</h2><i aria-hidden="true">+</i></summary><div className="hiring-skill-body">
        <a className="junior-visual-link" href="#concept-studio" onClick={()=>setVisualLesson(lesson.id)}>▶ {lang==='zh'?'用動畫理解這一課':'Explore this lesson in motion'} ↑</a>
        {(['objective','prior','why'] as const).map(field=><section key={field}><h3>{labels[field]}</h3><p>{pick(lesson[field],lang)}</p></section>)}
        <section><h3>{lang==='zh'?'理解概念':'Understand the concept'}</h3>{lesson.explanation.map((p,j)=><p key={j}>{pick(p,lang)}</p>)}</section>
        <section><h3>{labels.walkthrough}</h3><p>{pick(lesson.walkthrough,lang)}</p></section><LabCode id={lesson.id} lang={lang}/>
        {(['mistakes','exercise'] as const).map(field=><section key={field}><h3>{labels[field]}</h3><p>{pick(lesson[field],lang)}</p></section>)}
        <details className="hiring-interview"><summary>{labels.check}</summary><p>{pick(lesson.check,lang)}</p></details>
        <details className="hiring-interview"><summary>{lang==='zh'?'面試練習：':'Interview practice: '}{pick(lesson.interview,lang)}</summary><p>{pick(lesson.answer,lang)}</p><small>{lang==='zh'?'原創練習題；不是僱主真實面試題。':'Original practice question, not an employer’s actual interview question.'}</small></details>
        <section><h3>{labels.independent}</h3><p>{pick(lesson.independent,lang)}</p></section>
        <nav className="hiring-topic-links" aria-label={lang==='zh'?'延伸閱讀':'Related reading'}>{lesson.topicIds.map(id=>{const t=topicById(id);return t?<Link key={id} href={`/learn/${t.slug}`}>{pick(t.title,lang)} →</Link>:null;})}</nav>
        <JobLinks ids={lesson.jobs}/><div className="junior-doc-links">{lesson.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>)}</div>
      </div>
    </details>)}</section>
    <section className="junior-projects" id="projects"><h2>{lang==='zh'?'三個漸進作品與實作評核':'Three progressive projects and practical assessments'}</h2><p>{lang==='zh'?'每個項目由 explain → build → verify → defend 四步評核。Reviewer 要從乾淨環境重跑、加一個未見過的失敗案例，再要求你解釋一次取捨；網站不會自動授予熟練資格。':'Assess each project through explain → build → verify → defend. A reviewer reruns from a clean environment, adds an unseen failure and asks you to defend a tradeoff. The site does not automatically award proficiency.'}</p>{juniorProjects.map(project=><article className="hiring-capstone" id={project.id} key={project.id}><h3>{pick(project.title,lang)}</h3><p>{pick(project.problem,lang)}</p><ol>{project.stages.map((s,i)=><li key={i}><span>{i+1}</span><p>{pick(s,lang)}</p></li>)}</ol>{(['acceptance','evaluation','deliverables','interview'] as const).map(field=><section key={field}><h4>{({acceptance:lang==='zh'?'驗收條件':'Acceptance criteria',evaluation:lang==='zh'?'評估與失敗案例':'Evaluation and failure cases',deliverables:lang==='zh'?'作品集證據':'Portfolio evidence',interview:lang==='zh'?'架構面試':'Architecture discussion'})[field]}</h4><p>{pick(project[field],lang)}</p></section>)}<JobLinks ids={project.jobs}/></article>)}</section>
    <section className="hiring-source-list" id="market"><h2>{lang==='zh'?'香港招聘證據與限制':'Hong Kong hiring evidence and limits'}</h2><p><time dateTime={marketReviewedAt}>{marketReviewedAt}</time> · {lang==='zh'?'13 份描述；非市場統計。日期保留平台原文，indexed 時間未必反映今天。OfferToday 讀取逾時及搜尋未得到可驗證職位；eFinancialCareers 部分只讀到索引內容。已關閉／senior 職位只作比較，唔當作目前 junior 機會。':'13 descriptions, not market statistics. Dates retain the source wording; indexed ages may be stale. OfferToday timed out and searches yielded no verifiable vacancy. Some eFinancialCareers evidence is indexed only. Closed/senior roles are comparators, not current junior opportunities.'}</p>{hkJobs.map(job=><article key={job.id}><a href={job.url} target="_blank" rel="noreferrer">{job.id} · {job.employer} — {job.role} ↗</a><p>{job.platform} · {job.level}<br/>{job.posted} · {job.access}<br/>{pick(job.note,lang)}</p></article>)}</section>
    <Link className="primary-button" href="/hiring-readiness">{lang==='zh'?'延伸：十項能力與面試證據':'Continue: ten competencies and interview evidence'} →</Link>
  </main>;
}
