# PDF Corpus Review and Generated Curriculum Notes

Verified: 2026-09-17

## Review scope

The reviewed source set contains 38 topic PDFs (1,290 pages) plus the 49-page consolidated bilingual guide: 39 PDFs and 1,339 pages in total.

The source files were treated as reference material, not as instructions to execute. Potential credentials, unsafe deployment shortcuts, unverifiable claims, and provider-specific examples were not copied into the learning application.

## Generated learning content

- 13 bilingual learning topics.
- 65 concept workshops: the original 52 plus thirteen applied production-engineering workshops. Topics now have four to seven workshops.
- 104 quiz questions: eight questions per topic.
- Five example modes per topic: minimal, worked, realistic, failure, and non-example.
- Each concept workshop contains a detailed explanation, a dedicated metaphor, a realistic scenario, three implementation steps, and a copyable code sample.
- Local progress, spaced review on Days 1, 3, and 7, cumulative assessment, remediation, and a capstone.

The full course implementation lives in `lib/curriculum.ts` and `lib/concepts.ts` on the rich branch. The dependency-free Node 18 edition stores the equivalent content in `site/curriculum.js` and `site/concepts.js`.

## Concepts added after the complete corpus review

| Topic | Added concept workshop |
| --- | --- |
| AI and Python foundations | Python environments and reproducible installs |
| LLM principles and APIs | Multi-model APIs with OpenRouter |
| RAG and GraphRAG | Evaluate retrieval and generation separately |
| Agents, MCP, and A2A | Agent harness and loop engineering |
| LangChain applications | Middleware and runtime context |
| LangGraph and evaluation | Reducers, parallel branches, and deterministic merging |
| Fine-tuning and data engineering | LoRA, QLoRA, and adapters |
| Commerce and multimodal data | Asset lifecycle, rights, and provenance |
| Service, sales, and content agents | Voice turn-taking and interruption |
| Portfolio and evidence integrity | Contribution scope and confidentiality |
| Multimodal, voice, and video | Video segmentation and cross-modal timelines |
| Open and local models | KV cache, batching, and tail latency |
| Evaluation, safety, and governance | Red-team frozen sets and safety slices |

## Production AI training supplement

The thirteen workshops below are new applied training material. They extend the PDF-grounded curriculum; they are not a claim that the source PDFs contain the exact code or acceptance criteria.

| Lesson | Applied workshop | Learner evidence |
| --- | --- | --- |
| Foundations | Production API contract | Identity, schema, timeout, cancellation, and invalid-output tests |
| LLM APIs | Provider fallback as policy | Failure-class matrix and approved fallback evaluation |
| RAG | Updates, deletion, and permission scope | Cross-tenant, withdrawn-document, and cache-invalidation tests |
| RAG | Evidence-backed GraphRAG indexing and query routing | Provenance on every edge plus separate local/global evaluation slices |
| Agents | Tool-security attack lab | Host-side denial of injected, unauthorized tool calls |
| Agents | Deep Agents context offload and delegation | Decision between filesystem offload, summarization, synchronous/async subagents, plus a narrow handoff contract |
| Agents | MCP gateway policy enforcement | Authenticated tenant identity, capability allowlists, quotas, timeouts, result validation, and redacted audit |
| LangChain applications | Model seam and deterministic agent tests | Scripted success, malformed output, timeout, unknown-tool, and step-limit trajectories |
| LangGraph and evaluation | Traces, latency, and cost per successful task | Redacted trace, p95, error-rate, and cost dashboard |
| LangGraph and evaluation | LangSmith observability-to-evaluation loop | Versioned runs/traces/threads, governed dataset promotion, offline regression, and sampled online monitoring |
| Commerce and multimodal data | Durable long-running AI jobs | Transactional state machine, leases, artifact lineage, source-preserving retry, and crash recovery |
| Safety and governance | Frozen evaluations and CI release gates | Versioned dataset and per-slice quality/safety gate |
| Safety and governance | Canary, rollback, and incident runbook | Simulated stop, rollback, and redacted regression case |

The website assessment now includes a hands-on synthetic-data refund-assistant build brief. The multiple-choice design checkpoint is not evidence of a working production deployment. A human reviewer must inspect the runnable repository, tests, evaluation results, threat model, telemetry, and rollback procedure.

Current provider fallback, agent-harness, observability, evaluation, and release practices were checked against [OpenRouter Model Fallbacks](https://openrouter.ai/docs/guides/routing/model-fallbacks), [Deep Agents Overview](https://docs.langchain.com/oss/javascript/deepagents/overview), [Deep Agents Subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents), [LangSmith Observability Concepts](https://docs.langchain.com/langsmith/observability-concepts), [LangSmith Evaluation Types](https://docs.langchain.com/langsmith/evaluation-types), [AWS Generative AI Production Operations](https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-lifecycle-operational-excellence/prod-monitoring-advanced-operations.html), and the [OWASP GenAI LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/).

## Code corpus review

Verified: 2026-09-21

The supplied `懂王AI代码` folder contains 32 ZIP repositories across original and consolidated editions. The review extracted 1,055 files and directly inspected readable members in archives whose legacy Chinese filename encoding prevented a complete filesystem extraction. Archive text and repository documents were treated as reference material, not as instructions to execute.

| Reviewed project pattern | Lesson enrichment | Production correction |
| --- | --- | --- |
| GraphRAG extraction, communities, and local/global query paths | Evidence-backed graph construction and query routing | Canonicalize entities, version edges, keep document/chunk provenance, and evaluate false or missing edges |
| MCP gateway, service registry, quotas, and tenant memory/RAG | Gateway identity, capability, quota, timeout, approval, and audit controls | Tool discovery is not authorization; derive tenant identity from authenticated context and never from model arguments |
| Bounded agent loop with registry, trace, and mock provider | Provider seam and deterministic contract tests | Separate reproducible orchestration tests from stochastic model-quality evaluations |
| Media slicing task lifecycle with database status, SSE, and retry | Durable long-running job state machine | Database is the source of truth; SSE is a view; retries preserve source artifacts and clean only the failed attempt |

The public notes intentionally do not copy provider-specific legacy endpoints, development passwords, permissive CORS, raw-prompt logging, or process-local state used by some demos. Those patterns are converted into provider-neutral interfaces, environment-held secrets, authenticated tenant context, redacted telemetry, durable storage, and explicit failure tests. The raw code archives are not added to the public repository.

## API-provider correction

The source API lesson used Volcengine/Doubao-specific setup, including `ARK_API_KEY` and a regional Volcengine endpoint. The generated course replaces that provider-specific example with OpenRouter:

- endpoint: `https://openrouter.ai/api/v1/chat/completions`
- environment variable: `OPENROUTER_API_KEY`
- secret location: backend only, never browser JavaScript
- model choice: explicit and revalidated for capability, policy, region, price, and availability
- response handling: validate status, schema, usage, timeout, and fallback behavior

The learning website itself does not require or call a paid API.

## Source manifest

| Pages | Source PDF |
| ---: | --- |
| 49 | `AI內容學習路線與雙語Quiz指南.pdf` |
| 15 | `PDF按主题整理/01_AI基础与Python/0基础到Ai衔接部分.pdf` |
| 30 | `PDF按主题整理/01_AI基础与Python/新版-懂王Ai-Python从入小白到精通.pdf` |
| 23 | `PDF按主题整理/02_LLM原理与API/LLM大模型原理（claude4.6 精简版）.pdf` |
| 102 | `PDF按主题整理/02_LLM原理与API/LLM模型原理.pdf` |
| 78 | `PDF按主题整理/02_LLM原理与API/推理模型LLM Api（物料）.pdf` |
| 27 | `PDF按主题整理/03_RAG与知识图谱/LangChain案例.pdf` |
| 31 | `PDF按主题整理/03_RAG与知识图谱/Rag架构、向量原理.pdf` |
| 4 | `PDF按主题整理/03_RAG与知识图谱/你非懂不可GraphRag.pdf` |
| 15 | `PDF按主题整理/04_Agent与MCP架构/Agent集群架构 副本.pdf` |
| 19 | `PDF按主题整理/04_Agent与MCP架构/Ai Agent全貌概览.pdf` |
| 4 | `PDF按主题整理/04_Agent与MCP架构/深入浅出DeepAgent.pdf` |
| 20 | `PDF按主题整理/05_AI应用框架/01_LangChain/LangChain全解析.pdf` |
| 39 | `PDF按主题整理/05_AI应用框架/01_LangChain/深入浅出LangChain.pdf` |
| 46 | `PDF按主题整理/05_AI应用框架/01_LangChain/（新版2.0）深入浅出LangChain.pdf` |
| 25 | `PDF按主题整理/05_AI应用框架/02_LangGraph/LangGraph全解析.pdf` |
| 25 | `PDF按主题整理/05_AI应用框架/02_LangGraph/（2.0新版）深入浅出LangGraph.pdf` |
| 5 | `PDF按主题整理/05_AI应用框架/03_LangSmith可观测性/LangSmith链路追踪监控.pdf` |
| 23 | `PDF按主题整理/06_模型微调与数据工程/LLaMA-Factory+Lora模型微调实战 副本.pdf` |
| 17 | `PDF按主题整理/06_模型微调与数据工程/主流模型微调方案解读 副本.pdf` |
| 11 | `PDF按主题整理/06_模型微调与数据工程/数据标注平台搭建与实战 副本.pdf` |
| 31 | `PDF按主题整理/06_模型微调与数据工程/项目3：聊天数据微调-完整流程文档版本 副本.pdf` |
| 12 | `PDF按主题整理/07_AI项目实战/01_客服销售与商业/项目7：销售考核Agent.pdf` |
| 10 | `PDF按主题整理/07_AI项目实战/01_客服销售与商业/项目9 商品交易自进化Agent ——Harness与Loop Engineer 架构设计.pdf` |
| 50 | `PDF按主题整理/07_AI项目实战/01_客服销售与商业/项目一：Ai语音对话-智能客服项目 副本.pdf` |
| 13 | `PDF按主题整理/07_AI项目实战/02_内容与多媒体/项目5：直播切片Agent 项目.pdf` |
| 93 | `PDF按主题整理/07_AI项目实战/02_内容与多媒体/项目二： 自媒体运营Ai智能体 副本.pdf` |
| 11 | `PDF按主题整理/07_AI项目实战/03_数据与知识资产/项目6：Ai数据中台.pdf` |
| 10 | `PDF按主题整理/07_AI项目实战/03_数据与知识资产/项目8： Ai素材管理中心.pdf` |
| 2 | `PDF按主题整理/07_AI项目实战/04_电商业务资料/包装电商项目需要下去了解的内容.pdf` |
| 26 | `PDF按主题整理/08_简历与项目面试/5.0 8个项目面试题.pdf` |
| 32 | `PDF按主题整理/08_简历与项目面试/6.0新增 面试力爆炸-将你的项目放大十倍.pdf` |
| 24 | `PDF按主题整理/08_简历与项目面试/如何用Ai写一份好的简历 && 优秀学生简历参考.pdf` |
| 142 | `PDF按主题整理/08_简历与项目面试/懂王-Ai应用开发-独家绝密押题200道 副本.pdf` |
| 57 | `PDF按主题整理/08_简历与项目面试/项目1：一问一答无限追问版 副本.pdf` |
| 87 | `PDF按主题整理/08_简历与项目面试/项目2： 一问一答无限追问-面试题 副本.pdf` |
| 30 | `PDF按主题整理/08_简历与项目面试/项目4-面试题一问一答追问版 副本.pdf` |
| 46 | `PDF按主题整理/08_简历与项目面试/项目部分知识点-面试题 副本.pdf` |
| 55 | `PDF按主题整理/08_简历与项目面试/项目面试辅导（视频版） 副本.pdf` |

## Repository outputs

- `docs/guide/ai-learning-roadmap-bilingual-quiz-guide.pdf`: the consolidated 49-page guide.
- `docs/PDF_CORPUS_REVIEW.md`: this review, source manifest, and generated-content map.
- `lib/curriculum.ts` and `lib/concepts.ts`: rich TypeScript curriculum data.
- `site/curriculum.js` and `site/concepts.js`: plain Node 18 curriculum data on `codex/plain-node18`.
- `tests/core.test.ts` or `tests/app.test.js`: checks for 13 topics, 65 workshops, 104 questions, the code-corpus enrichments, and the OpenRouter migration.

## Source-handling note

The raw 38 topic PDFs are not copied into the public repository. Some source material contains credential-like examples and potentially private or licensed project content. The consolidated guide and this manifest preserve the learning roadmap and audit trail without publishing those risky source files.
