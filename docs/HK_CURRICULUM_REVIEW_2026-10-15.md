# Hong Kong applied-AI curriculum review / 香港 AI 開發課程審閱

Access/review date: **15 October 2026, Hong Kong time**. Target: entry-level/junior AI Developer, AI Engineer, Generative AI Engineer and AI Agent Developer. Existing English/Hong Kong Traditional Chinese presentation preserved. The learner’s programming ability was not supplied; the new path begins with a practical diagnostic rather than assuming proficiency.

## 1. Assessment

The application is a useful conceptual reference, especially for trust boundaries, RAG provenance, bounded agents, evaluation and honest portfolio claims. It previously did **not establish readiness to build independently**: its main progression is quizzes and scenario choices; many of its 80 workshops are fragments with external variables, and the introductory Python lesson starts with architecture rather than basic programming. SQL and backend material are buried inside RAG/framework sections. Evaluation arrives after framework-heavy material. The hiring guide’s three global experienced-role references are not a Hong Kong junior sample.

The strongest junior evidence in this review asks for implementable Python/API skills, systematic debugging, testing, retrieval and measurement, rather than mastery of every orchestration framework. [Set Sail][J01], [Binance][J02] and [HKTV][J03] accept graduates, early-career applicants or project evidence, with differing requirements. This is an interpretation of a small qualitative sample, not a frequency estimate for the whole market.

**Implemented outcome:** `/junior-path` now supplies six complete bilingual lessons, six runnable offline Python programs, independent extensions, checks, interview guidance and three progressive project specifications. It is linked from the header, dashboard and existing hiring guide. Visible completion labels now say knowledge checks. Existing browser progress is preserved; the internal storage status name is unchanged for compatibility. Completing these pages still does not certify proficiency or guarantee employment.

香港初級路線先教能獨立完成的程式、測試及資料處理，再加 LLM／RAG／agent；原有十三課保留作延伸參考。網站知識進度不等於實作能力；作品要能由他人重跑、加入新失敗案例及審閱。

## 2. Evidence and limits

Thirteen distinct relevant role descriptions were examined across JobsDB, LinkedIn and eFinancialCareers, including public pages and clearly identified search-index descriptions. Four strongly inform the junior/assistant path (J01–J04); J05 is a lower-code EdTech contrast, J11 a stale indexed junior reference. Remaining roles illuminate adjacent or experienced expectations. Counts represent descriptions, not independent employers hiring the same role or confirmed open vacancies. Anonymous recruiter clients may overlap; no market percentages are inferred.

- JobsDB: four individual descriptions read. Relative posting ages are recorded as displayed at access.
- LinkedIn: public and indexed descriptions read. J04 and J13 are explicitly closed. J05’s relative posting age came from an older crawl, so no current availability is asserted. J02’s platform metadata conflicts with its body; the curriculum uses the explicit 0–3-year requirement, while recording the program’s broader limit.
- eFinancialCareers: J11’s live page returned maintenance; J12’s direct page was inaccessible. Requirements below come only from the visible indexed descriptions. J11’s crawl was about five months old; J12’s indexed crawl was today, but its posting date was absent. Neither is represented as a verified live vacancy.
- OfferToday: direct access to `https://www.offertoday.com` timed out; searches did not produce a verifiable relevant OfferToday vacancy. **No OfferToday requirements are claimed.**
- Job descriptions establish demand, not technical correctness. Technical additions were checked against Python, FastAPI, OpenRouter, scikit-learn, LangGraph and IETF documentation listed below. No paid/live model calls or deployments were performed.

Every row below was accessed **2026-10-15**. Relative ages are source wording; they have not been converted into invented calendar dates.

| ID / role source | Posting date/age shown | Seniority and evidence quality | Relevant demand, paraphrased |
|---|---|---|---|
| [J01 Set Sail — Junior Applied AI Engineer][J01] | 2 months ago | Public role text; graduate/0–1 year | Python, APIs/JSON/Git, tests, RAG debugging, data splits and classification metrics; cloud/containers bonus |
| [J02 Binance — Pioneer AI Agent Engineer][J02] | 1 month ago | Public text: 0–3 years; program up to 5; metadata conflicts | Tool/API integration, backend judgment, handoff, evaluation, reliability, latency/cost and explaining business value |
| [J03 HKTV — AI Engineer][J03] | 17d ago | Public text: 1–2 years; fresh graduates welcome | Python, LLM/RAG, evaluation, web/mobile integration; REST/Git/Docker/cloud listed as pluses |
| [J04 EdCity — AI Engineer / assistant consideration][J04] | 1 month ago | Indexed description; closed; 2 years, less for assistant | RAG/vector search, agents, cloud platforms, Chinese/English communication |
| [J05 Pan Lloyds — Junior AI Application Developer][J05] | Indexed “6 days ago”; crawl about 5 months old | Indexed text only; direct read failed; graduate contract | Educational prototypes, prompts/workflows, testing/documentation; coding advantageous, not essential in this role |
| [J06 Speedy — AI Programmer][J06] | 1h ago | Public text; working experience, years unspecified | Python, GitLab, databases/PostgreSQL, server administration; AI/MCP and containers preferred |
| [J07 Captiare — AI Engineer, Fintech][J07] | 6h ago | Public text; 2+ years | Python/Java, integration, debugging/testing, deployment/support and monitoring |
| [J08 Konica Minolta — Analyst Programmer][J08] | 6h ago | Public text; 3+ years | Requirements, LLM/RAG, output evaluation, SQL, Python/Node.js and low-code automation |
| [J09 Gammon — AI Automation Engineer / Assistant][J09] | 3 weeks ago | Public text; 2–5 years despite assistant title | Workflow integration, governance, troubleshooting, documentation and stakeholder communication |
| [J10 Pulsar — Developer, AI Agent][J10] | 2 days ago | Public text; 3–5 years | Production agent services, tool permissions, RAG/memory, evaluation/tracing, CI/CD and cost ownership |
| [J11 Michael Page — Junior AI Engineer, RAG][J11] | Indexed “29 days ago”; crawl about 5 months old | Indexed text only; live maintenance; 1–3 years | Programming, preprocessing, chunking/indexing/reranking; enterprise MLOps preferred |
| [J12 TEKsystems — Senior AI Engineer][J12] | Posting date absent; indexed crawl today | Indexed text only; 5+ years | Python/TypeScript, LLM integration, auditability, Kubernetes and CI/CD |
| [J13 Achieve — AI Engineer, LLM/RAG/agents][J13] | 3 months ago | Indexed text; closed; mid-senior comparator | Python backend, semantic/vector retrieval, agent/API workflows; inference optimization preferred |

### Requirements matrix

Priority is an editorial curriculum judgment. “Core” means practice independently on a bounded junior project; it does not mean every advertisement explicitly names the skill. Optional tool names are examples, not an instruction to learn competing stacks simultaneously.

| Competency | Supporting listings | Roles | Expected depth | Hiring priority | Practical evidence / interviewer lens |
|---|---|---|---|---|---|
| Python, debugging, tests, Git, reproducible environments | [J01][J01], [J02][J02], [J03][J03], [J06][J06], [J07][J07] | All four target roles | Functions, types, exceptions, data structures, one regression fix; environment skills are prerequisite inference | Core, first | A clean-checkout run, a failing case then fix, tests and readable diff; explain your own code |
| HTTP/API integration, JSON and backend contracts | [J01][J01], [J02][J02], [J06][J06], [J07][J07], [J08][J08] | Developer, GenAI, agent | Build one endpoint with validation and failure responses | Core | Project A plus HTTP tests; explain transport versus business validation |
| SQL/data preparation and access boundaries | [J01][J01], [J06][J06], [J08][J08], [J11][J11] | Developer/Engineer; business integrations | SELECT/JOIN, parameters, basic transaction, provenance and quality checks | Core foundation | Scoped query, duplicate/invalid fixtures and an unauthorized-read test |
| Essential ML: splits, leakage, baseline, precision/recall | [J01][J01], [J03][J03], [J11][J11] | Applied AI Engineer; GenAI quality | Explain and calculate metrics; choose validation settings without test leakage | Core measurement; training specialization optional | Split manifest, confusion matrix and error-cost explanation; explain a misleading accuracy score |
| LLM interfaces, prompting and structured outputs | [J01][J01], [J02][J02], [J03][J03], [J04][J04], [J07][J07] | GenAI / AI Developer | One model adapter; shape, refusal/incomplete and business checks | Core | Mock contract tests separately from live quality results; show valid JSON that is still wrong |
| Embeddings, retrieval, RAG, data/version handling | [J01][J01], [J03][J03], [J04][J04], [J11][J11], [J13][J13] | GenAI / Agent / AI Engineer | Build one basic retriever, compare baseline, separate retrieval from generation | Core for these application roles | Project B with relevant IDs, language slices, abstention and five diagnosed failures |
| Tools, workflow state, permissions and human handoff | [J02][J02], [J03][J03], [J10][J10], [J12][J12] | Agent Developer; workflow AI | Bounded workflow first, one framework later if helpful | Core for agents; advanced durability later | Project C with forged-approval, replay, cancellation and version-change tests |
| Evaluation, logging, latency, reliability and cost | [J01][J01], [J02][J02], [J03][J03], [J07][J07], [J10][J10] | All applied roles | Representative dataset, trace one failure, compare a baseline, measure a local workload | Core, alongside development | Per-case raw results, p95/sample size and cost per successful task; explain what mocks cannot prove |
| Security, governance, authentication/secrets | [J03][J03], [J07][J07], [J09][J09], [J10][J10], [J12][J12] | All; deeper in regulated industries | Host-enforced access, safe credentials, untrusted-input handling; authentication detail is prerequisite inference | Core basics; enterprise governance optional depth | Threat model plus negative tests; explain why prompts cannot authorize |
| Deployment/CI, cloud and integration | [J03][J03], [J04][J04], [J06][J06], [J07][J07], [J10][J10], [J12][J12] | Applied developer; cloud/enterprise track | Package one service and explain rollback; cloud stacks depend on employer | Basic delivery core; Kubernetes/GPU ops later | Local container, CI result, health check and rollback drill; simulations labeled honestly |
| Requirements, documentation, bilingual communication | [J01][J01], [J02][J02], [J03][J03], [J04][J04], [J07][J07], [J09][J09] | All; especially enterprise integration | Explain users, constraints, error costs and tradeoffs in clear language | Core | One-page brief, ADR and short demo; Cantonese/Mandarin requirements vary by employer |
| Low-code automation, voice, fine-tuning, infrastructure | [J05][J05], [J09][J09], [J10][J10], [J12][J12], [J13][J13] | Optional industry/specialist tracks | Choose only for target vacancies; senior production ownership is not a beginner prerequisite | Optional / later | One relevant integration or experiment, not a checklist of framework names |

Degrees and experience filters appear in several descriptions (including J01–J04). This platform can develop demonstrable skills but cannot substitute for every employer’s formal screening requirement. No inference about the learner’s qualifications is made.

## 3. Prioritized content audit

Scope: structural inventory of all 13 topics, 104 quiz questions, 80 concept workshops and ten hiring competencies; detailed inspection of the introductory, API, retrieval, framework, assessment and hiring flows and their source structure. This is **not** an exhaustive live-execution certification of all 80 older fragments or a full translation audit of every line.

P0 = prerequisite or misleading proficiency claim; P1 = important practical teaching gap; P2 = role-specific depth/organization. “Implemented” below refers to this local checkout only.

| Page / lesson | Current teaching | Action | Reason | Proposed improvement / status | Priority |
|---|---|---|---|---|---|
| `/learn/ai-python-foundations` | Trust boundaries, async, JSON, environments, Git, networking | Keep + Expand | Useful engineering but no gradual first Python program | Implemented junior Python + backend lessons before this reference; old lesson retained | P0 |
| Networking workshop | Browser → TCP/TLS → HTTP | Correct | Implied all HTTP uses TCP | Implemented HTTP/1.1/2 scope and HTTP/3 QUIC qualification; IETF reference below | P1 |
| `/learn/llm-principles-apis` | Tokens, prompting, schemas, OpenRouter, fallback | Keep + Expand | Fragments insufficient for response-failure practice | Implemented request-body construction, parser, rejection checks and separate mock/live exercise | P0 |
| `/learn/rag-graphrag` | Chunking, hybrid search, provenance, GraphRAG, SQL/cache | Keep + Reorder + Expand | Advanced graph/cache topics obscure basic retrieval and SQL | Implemented SQL prerequisite and bilingual baseline/Recall@k lesson; GraphRAG deferred in junior route; full embedding adapter still a project task | P0 |
| `/learn/agents-mcp-a2a` | Tools, loops, approval, MCP/A2A, Deep Agents | Keep + Reduce initial scope | Protocols/delegation are too much before a single tested workflow | Implemented scripted workflow with denial/replay checks; MCP retained as optional connectivity, A2A/multi-agent later | P1 |
| `/learn/langchain-applications` | Composition, middleware/memory, model seams, FastAPI | Keep + Reorder | Backend fundamentals should precede orchestration | Junior API contract now earlier; one framework after core; old fragments remain illustrative | P1 |
| `/learn/langgraph-observability-evals` | Checkpoints, interrupts, traces, reducers, queues/microservices | Keep + Reorder | Evaluation should not depend on learning multiple frameworks | Implemented early metric/failure practice; framework durability later; queue/microservices optional | P1 |
| `/learn/fine-tuning-data` | Adaptation decisions, data lineage, LoRA/QLoRA | Keep + Split emphasis | Data quality is core; model adaptation is not every junior’s prerequisite | New split/leakage lesson is core; LoRA/QLoRA later; overlapping adapter workshops still need merging | P1/P2 |
| `/learn/commerce-multimodal-data` | Catalog/media lineage, lifecycle, approvals, durable jobs | Keep as optional | Useful for HKTV/commerce, not all AI applicants | Junior route marks commerce/media optional; existing lesson unchanged | P2 |
| `/learn/service-sales-content-agents` | Routing, state, handoff, voice, outcome metrics | Keep + Expand | Strong business scenario but independent build needed | Projects B/C turn support into testable systems; voice remains optional | P1 |
| `/learn/portfolio-evidence-integrity` | Evidence ledger, honest claims, reproducible demos | Keep + Connect | Appropriate recruiter evidence | New projects specify artifacts and independent reviewer checks; keep prototype/production distinction | P1 |
| `/learn/multimodal-realtime-physical-ai` | Voice/video budgets and physical safety | Keep as optional | Specialist scope outside this core | Deferred in junior sequence; no unsupported deletion of useful specialist content | P2 |
| `/learn/open-local-models` | Licensing, memory, quantization, batching, containers/Kubernetes | Keep + Reorder | Container delivery useful; GPU/Kubernetes depth role-dependent | Project C uses a basic local container; local-model serving/Kubernetes deferred | P2 |
| `/learn/evaluation-safety-governance` | Frozen sets, threats, host policy, release/rollback | Keep + Move earlier | Strong principles need practical early measurement | New lessons bring validation/metrics into first projects; original used for delivery depth | P0/P1 |
| `/assessment`, quizzes and dashboard | Quiz/scenario decisions, production brief; “mastered” labels | Correct + Expand | Reading/choice success is not demonstrated ability | Implemented knowledge-check labels and independent project assessment; no change to saved progress | P0 |
| `/hiring-readiness` | Ten competencies, JS/Python fragments, one large capstone | Keep + Expand | Three global experienced-role sources; large jump to capstone | Implemented prominent junior-path link, 13 local role records and projects A→B→C; older references kept dated and separate | P0 |
| All workshop code presentation | Syntax highlighting and minimal fragments | Correct | “Working code” wording overstates standalone executability | Implemented clearer fragment label and link wording; six new programs are actually executed | P0 |
| English mode | Many titles/paragraphs translated; quiz/mechanism helpers default English to Chinese | Rewrite remaining translations | Language switch does not make all existing teaching English | Six new lessons/projects fully bilingual; legacy quiz/mechanism translation remains explicit backlog | P1 |
| Navigation / sequence | Thirteen topics place frameworks/advanced material early | Expand | No compact prerequisite-to-project path | Implemented `/junior-path`, header/dashboard/hiring entry points, deep links and related-topic links | P0 |
| Duplication | GraphRAG, LoRA, evals, trust boundaries repeated across tracks | Merge selectively | Repetition can aid practice but adds reading burden | Junior route reduces required scope; merging older cards and rebalancing lesson durations remains pending | P2 |

Foundations remain even when advertisements omit them: data structures and exceptions support debugging; HTTP/SQL support integration; leakage and probability/metric reasoning support trustworthy evaluation. No blanket demand for research-level mathematics, model pretraining, multiple frameworks or Kubernetes was inferred.

## 4. Revised learning sequence

1. **Diagnostic:** from a blank file parse JSON, reject invalid data, add a test and explain a diff. If unable, start at junior lesson 1. No evidence of the learner’s current ability was available.
2. **Software foundations:** junior Python → HTTP/SQL; use original t1/Git/FastAPI references where needed. Finish Project A before treating backend ability as demonstrated.
3. **Model interfaces:** original t2 concepts → junior structured-output boundary. Understand tokens/context/inference and model limitations before adapters.
4. **Data and measurement:** junior retrieval + ML evaluation; original t3 and the data portions of t7/t13. Compare deterministic and retrieval baselines. Finish Project B.
5. **Agents:** junior bounded workflow → relevant t4 concepts. Add LangChain or LangGraph only when its abstractions solve an observed problem; neither is a prerequisite for basic functions, tests or RAG. Finish Project C.
6. **Delivery and interviews:** t13 plus t10, with local deployment, CI, traces, latency/cost, recovery and evidence review. Draft the portfolio brief early and refine it throughout.

Optional tracks: enterprise low-code/Azure/Alibaba integrations (J04/J08/J09); e-commerce (J03); voice/customer support (J01); finance-specific governance/operations (J07/J10/J12). Advanced later: GraphRAG, multi-agent/A2A, distributed queues, Kubernetes, GPU serving, LoRA/QLoRA, RL and research experiments. The last group is not a prerequisite checklist for all four target roles.

## 5. Actual teaching changes completed

All six lessons are implemented inside the application, not merely outlined here. Each has a learning objective, prior knowledge, accessible explanation, practical reason, worked program, diagnosis notes, independent exercise, answer/check guidance, interview question/guidance and an independently observable outcome. Hypothetical Hong Kong scenarios and synthetic data are labeled.

| Lesson | Program and practical outcome | Independent extension |
|---|---|---|
| Python | Parse/validate/normalize intent records; valid and invalid cases | Per-language counts, unittest, reproducible bug fix and Git diff |
| Backend | SQLite ownership-filtered query and transport-independent status contract | JOIN, real FastAPI wrapper and HTTP tests; authentication stub explicitly limited |
| Model boundary | OpenRouter JSON-schema request construction plus response validator | Provider adapter, timeout/429/401 fixtures and business validation; live quality assessed separately |
| Retrieval | Version/tenant-filtered bilingual tag baseline and Recall@2 | One embedding retriever, frozen bilingual cases, generation/citation and abstention evaluation |
| ML evaluation | Confusion counts, precision/recall/F1, threshold comparison and group leakage | Train/validation/test experiment with class balance and error-cost comparison |
| Agent workflow | Scripted proposals, trusted approvals, tool restrictions, bounded loop and replay | Cancellation/timeouts, durable SQLite state, concurrent/crash tests |

Programs run offline with Python’s standard library; code is copyable/downloadable. A successful example run demonstrates those local assertions only. The backend example is **not an HTTP server**, the retrieval example **does not use embeddings or generate answers**, and the agent example **does not provide durable production idempotency**. These boundaries are taught explicitly, and the project extensions require the learner to implement and verify them.

## 6. Projects and readiness evidence

The application contains full problem statements, stages, constraints, acceptance criteria, failure cases, deliverables and architecture interview prompts for:

- **A — Support order API:** J01/J06/J07; Python, SQL, authorization and web/API integration. Evidence: runnable service, HTTP tests, schema/seed, reproducible bug fix and short demo. Test cross-user access, bad JSON, missing identity and injection.
- **B — Bilingual policy assistant:** J01/J03/J04/J11; data preparation, retrieval, model boundaries and measurement. Evidence: dataset/split/version manifests, raw per-case results, baseline comparison and five failure analyses. Test paraphrases, missing evidence, stale/other-tenant documents, injection and provider timeout.
- **C — Internal workflow with approval:** J02/J03/J09/J10/J12; bounded agents, durable state, permissions, operations and communication. Evidence: state diagram, reviewed code, replay/crash/concurrency tests, local container, traces, workload report and rollback runbook. No real refunds or messaging.

Assessment has four separate observations: **explain** the concept, **build** an unseen extension, **verify** expected and failure behavior, and **defend** a tradeoff with evidence. A reviewer must rerun the repository and introduce a failure the learner has not memorized. Projects are proposed coursework, not built applications or completed evidence belonging to the learner. Suggested metric thresholds in project briefs are instructional targets, not empirically established employer pass marks.

## 7. Verification and remaining work

Local verification completed on **16 October 2026, Hong Kong time**, with Node 22.22.2 and Python 3.13.7. Hiring research remains dated 15 October:

- `npm run check`: TypeScript and ESLint passed; **21/21 tests passed**. All six Python examples executed, with additional malformed-provider and unauthorized-retrieval tests. Existing progress/content tests still pass.
- `npm run build`: production build passed, including the new `/junior-path` route, six Python download routes and all 13 original lesson routes.
- Browser inspection: Chinese and English lesson content rendered; language switching and hash expansion worked. At a 390 × 844 viewport, document width was 390px, with no page-level horizontal overflow. Code blocks remain independently scrollable. Wrapping lesson numbers were corrected. Final interaction testing also exposed the existing header blur containing the fixed mobile menu, which covered the language control; disabling the blur at the mobile navigation breakpoint restores the menu to the bottom.
- After the fix, the mobile navigation starts at y=785 in the 844px viewport while the header ends at y=65; the language button changes the page correctly. Desktop checks at 1100px (English) and 1200px (Chinese) also have no page-level overflow. Screenshots are saved in `screenshots/hk-review/desktop-zh.jpg` and `screenshots/hk-review/mobile-zh.jpg` (local, ignored artifacts).
- Download verification: the browser saved `model.py`, and executing that downloaded file passed its checks. The production response returned HTTP 200 with the Python content type and attachment filename; tests verify all six file bodies/headers and reject unknown IDs. Downloads now use server attachment routes after a browser failure with the initial blob-based implementation. The copy button displayed its success status, but browser clipboard readback was empty, so copied payload verification remains unconfirmed.
- `git diff --check`: passed. The working tree was clean before edits; unrelated work was not overwritten.
- The original 80 fragments were not all executed. No live provider, embedding service, real authentication, cloud deployment or user portfolio was verified.

No publishing/deployment was performed. The local preview is served at `http://127.0.0.1:3100/junior-path`.

Remaining curriculum work:

1. Complete the legacy English quiz/mechanism/example translations; do not advertise fully translated old lessons meanwhile.
2. Merge overlapping GraphRAG/adapter/evaluation cards and recalibrate original lesson duration estimates. The new route already keeps them out of the required junior sequence.
3. Turn additional framework/cloud snippets into pinned, reproducible labs. Only the six new Python programs and the previously tested subsets have execution evidence.
4. Add a fully implemented embedding/model provider lab and real HTTP/authentication walkthrough. New project briefs specify the work, but no paid API integration has been tested here.
5. Add a complete supervised-learning baseline notebook and a production deployment lab with real monitoring; current metrics and operations work are bounded learning examples/briefs.
6. Obtain an independent review of the learner’s projects and recheck job availability when applying. This review cannot establish personal interview readiness from reading progress.

### Official technical references

Checked 2026-10-15; these verify patterns, not hiring demand. Model IDs are configuration choices; no unverified “latest model” was hardcoded.

- [Python control flow](https://docs.python.org/3/tutorial/controlflow.html) and [venv](https://docs.python.org/3/library/venv.html): functions, loops and isolated environments.
- [Python sqlite3](https://docs.python.org/3/library/sqlite3.html): parameters, connections and transaction behavior.
- [FastAPI request bodies](https://fastapi.tiangolo.com/tutorial/body/): typed request validation for the extension.
- [OpenRouter structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs): schema configuration, supported models and provider parameter support.
- [scikit-learn common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html) and [metrics](https://scikit-learn.org/stable/modules/model_evaluation.html): leakage, splitting and evaluation.
- [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts): resumption/replay considerations for later framework work.
- [IETF RFC 9114](https://www.rfc-editor.org/rfc/rfc9114.html): HTTP/3 uses QUIC, correcting the original TCP-only explanation.

[J01]: https://hk.linkedin.com/jobs/view/junior-applied-ai-engineer-set-sail-ai-at-set-sail-a-i-4453542018
[J02]: https://hk.linkedin.com/jobs/view/pioneer-talent-program-ai-agent-engineer-at-binance-4403990204
[J03]: https://hk.jobsdb.com/job/94911276
[J04]: https://hk.linkedin.com/jobs/view/ai-engineer-at-hong-kong-education-city-4453700468
[J05]: https://hk.linkedin.com/jobs/view/junior-ai-application-developer-contract-at-%E6%A8%82%E6%80%9D-pan-lloyds-4401439499
[J06]: https://hk.jobsdb.com/job/95290829
[J07]: https://hk.jobsdb.com/job/95280754
[J08]: https://hk.jobsdb.com/job/95281446
[J09]: https://hk.linkedin.com/jobs/view/ai-automation-engineer-assistant-ai-automation-engineer-at-gammon-construction-limited-4469385004
[J10]: https://hk.linkedin.com/jobs/view/developer-ai-agent-at-pulsar-4476421021
[J11]: https://www.efinancialcareers.com/jobs-Hong_Kong-Hong_Kong-Junior_AI_Engineer_RAG_Cutting_Edge_Solution.id24138240
[J12]: https://www.efinancialcareers.com/jobs-Hong_Kong-Hong_Kong-Senior_AI_Engineer.id24838010
[J13]: https://hk.linkedin.com/jobs/view/ai-engineer-%E2%80%93-llm-rag-agent-applications-at-achieve-group-4427220958
