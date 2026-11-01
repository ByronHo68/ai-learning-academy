# AI Learning Academy — Rich Animated Edition

## Office computers with Node 18 or restricted npm access

This branch includes a prebuilt copy of the current animated website in [`office`](office/README.md). Download this branch, open a terminal in the extracted project folder, and run `npm start` or `node office/server.mjs`. Node 18.18.1 works. No npm install or registry access is needed. `npm start` also works inside `office`. Developing and rebuilding the source app still needs Node 22 and installed packages. The live agent lab needs its separate backend setup.

The dependency-powered React/TypeScript edition of the bilingual visual AI curriculum. It includes 13 lessons, 104 quiz questions, and 80 expanded concept workshops. Fifteen engineering workshops come from a complete 651-unique-document Markdown corpus review, covering Git, Python async, networking, FastAPI, PostgreSQL, Redis, queues, microservices, media delivery, Docker, Kubernetes, and safe deployment. The production labs also cover provenance-safe GraphRAG, MCP policy gateways, deterministic agent tests, durable jobs, Deep Agents, and LangSmith. Every workshop has its own explanation, metaphor, real-world example, three implementation steps, and syntax-highlighted code sample.

This branch intentionally uses Next.js, Motion, Lucide, and Prism for richer interactions and animation. For the zero-install Node 18.18 edition, use the [`codex/plain-node18`](https://github.com/ByronHo68/ai-learning-academy/tree/codex/plain-node18) branch.

## Develop the source app

Requirements: Node.js 22.13 or newer and npm 10 or newer.

```bash
npm install
npm run start:source
```

`npm run start:source` creates a fresh production build and then serves the source app at [http://localhost:3000](http://localhost:3000). Pass a different port when needed:

```bash
npm run start:source -- --port 4000
```

For development with live reload:

```bash
npm run dev
```

## Working agent lab

The new `/agent-lab`, `/agent-lab/evals`, and `/agent-lab/compare` pages connect to a real FastAPI/LangGraph backend and a Java Spring Boot MCP service. They include saved approvals and memory, three bank tools, structured results, Langfuse instrumentation, and a 50-case evaluation gate for both single-agent and supervisor designs.

```bash
npm run lab:setup  # Python 3.13 + Java 21; installs local dependencies
npm run lab:start  # Starts the website, Python API, and Java service
```

Start in the clearly labeled offline workflow mode. Add your model and Langfuse credentials to `.env.lab` to enable live calls and exported traces. These integrations do not require keys to read the lessons. See [Agent Lab setup, architecture, evaluation and hosting](docs/AGENT_LAB.md).

## Content and saved progress

- Course content is stored in `lib/curriculum.ts` and compiled into the app.
- Expanded metaphors, examples, steps, and code are stored in `lib/concepts.ts`.
- Every one of the 80 concept workshops now starts with two bilingual everyday scenarios (160 total) and an explicit explanation of how the situation connects to the technical idea. These live in `lib/everyday-examples.js` and cover shopping, cooking, travel, studying, phones, and home life.
- Thirteen production labs live in `lib/production-track.js`; fifteen Markdown-derived engineering labs live in `lib/markdown-track.js`.
- The API lesson uses a provider-neutral OpenRouter example instead of the source PDFs' Volcengine/Doubao-specific setup.
- Motion respects the learner's `prefers-reduced-motion` system setting.
- Progress, recap notes, quiz attempts, and review dates stay in the learner's browser using local storage.
- Settings includes progress export/import for moving data between browsers.
- No secrets or environment variables are required to read the course.
- `NEXT_PUBLIC_SITE_URL` is optional and only controls canonical/social-preview URLs after deployment. Copy `.env.example` to `.env.local` if you want to set it locally.

## AI developer hiring practice

### Finance portfolio project

Open `/finance-project` from the dashboard or concept map. The bilingual **Hong Kong Financial Report Analyst** blueprint includes an eight-branch interactive mind map, 24 functions, input/output contracts, acceptance checks, a seven-step answer walkthrough with a missing-evidence scenario, a technology stack and four build stages. It connects report extraction, reviewed financial facts, cited answers, comparisons, dashboards, LangGraph and later n8n automation. The walkthrough uses fictional offline examples; this is a guide to building the application, not an operational finance service. See [the project blueprint and mind map](docs/FINANCIAL_REPORT_PROJECT.md).

The **Function workflows** section at `/finance-project#finance-functions` covers all 24 functions. Select an area, then expand a function to see four processing steps, the tools used at each step, its expected result and failure handling. The technology stack also shows data handoffs for all six layers. Everything is available in English and Traditional Chinese without live services.

The **Picture guide** at `/finance-project#finance-pictures` uses a ChatGPT-generated overview. Each function area also has its own four-scene concept illustration, with numbered English/Traditional Chinese captions and accessible descriptions. All nine images are checked-in local WebP files, so they work in the office package without image-generation services. The illustrations are metaphors; the written function workflows specify the actual design. Generation prompts are retained in `docs/FINANCE_ILLUSTRATION_PROMPTS.json`.

Open `/hiring-readiness` from the navigation, dashboard, or concept map. Ten bilingual competency guides include twenty everyday examples, code, practical drills, portfolio evidence, and original interview prompts. They cover problem framing, software, ML fundamentals, data, RAG, agents, evaluation, security, operations, and communication, with optional vision/training/research paths. Reading or quiz completion is not hiring certification.

- [Bilingual AI Developer Hiring Guide](docs/AI_DEVELOPER_HIRING_GUIDE.md) — evidence-based portfolio plan and interview discussion rubric.
- Content: `lib/hiring-track.js`; job references checked on 2026-10-09. These are a small sample of experienced roles, not universal junior requirements or a hiring guarantee.

## PDF guide and review record

- [Bilingual AI learning roadmap and quiz guide](docs/guide/ai-learning-roadmap-bilingual-quiz-guide.pdf) — the consolidated 49-page guide.
- [Complete PDF corpus review](docs/PDF_CORPUS_REVIEW.md) — the 39-file, 1,339-page manifest, generated concept map, and OpenRouter migration notes.
- [Complete code-Markdown corpus review](docs/CODE_MARKDOWN_CORPUS_REVIEW.md) — 1,375 instances, 651 unique documents, exclusions, source map, and the fifteen added engineering workshops.

The raw topic PDFs are intentionally excluded because parts of the source set contain credential-like strings and potentially private or licensed material.

## Push to GitHub

Create an empty GitHub repository. This working folder is already a Git repository, so connect it and push:

```bash
git remote add origin https://github.com/YOUR-USERNAME/ai-learning-academy.git
git push -u origin main
```

If you start from the downloadable ZIP instead, initialise it first:

```bash
git init
git add .
git commit -m "Initial AI Learning Academy"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ai-learning-academy.git
git push -u origin main
```

The included GitHub Actions workflow checks types, linting, tests, and the production build on `main`, both `codex/*` editions, and pull requests.

## Useful commands

```bash
npm run check             # TypeScript, ESLint, and content/progress tests
npm run build             # Standard Node/Next.js production build
npm run start:production  # Serve an existing build without rebuilding
npm run sites:build       # Build the existing ChatGPT Sites deployment target
```

## Hong Kong junior curriculum review (2026-10-15)

Start at `/junior-path`: six complete bilingual Python lessons with offline programs, independent exercises, checks and interview guidance, plus three progressive project briefs. The 13 original topics remain a reference library. Quiz completion is labeled as a knowledge check, not practical proficiency.

- Review, hiring matrix, audit and remaining work: [Hong Kong curriculum review](docs/HK_CURRICULUM_REVIEW_2026-10-15.md).
- New content: `lib/junior-track.ts`, `lib/junior-examples.ts`, `lib/junior-projects.ts`; dated evidence: `lib/hk-market.ts`.
- Python examples can be copied or downloaded from each lesson. They run offline using Python 3.11+ and its standard library. No live model calls were made.
- The older 80 workshops contain conceptual fragments; some require setup, dependencies or external variables. They are not all standalone executable labs.
- Review includes public and indexed descriptions from 13 Hong Kong roles, including explicitly labeled experienced/closed comparators. OfferToday was inaccessible; eFinancialCareers access was limited. This is a qualitative sample, not a labor-market survey.

### Animated concept studio

The junior path starts with six interactive visual explanations of data transformation, API access, model validation, retrieval, evaluation and agent approval. Play or step through each sequence, switch failure cases, compare top-k/threshold outcomes, and open the corresponding lesson. English and Traditional Chinese, narrow mobile layouts, reduced motion and keyboard controls are supported. See [animation notes and checks](docs/CONCEPT_ANIMATIONS.md).
