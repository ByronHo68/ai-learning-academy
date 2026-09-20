# AI Learning Academy — Rich Animated Edition

The dependency-powered React/TypeScript edition of the bilingual visual AI curriculum. It includes 13 lessons, 104 quiz questions, and 59 expanded concept workshops, including seven applied production-engineering labs. Every core concept has its own deep explanation, metaphor, real-world example, three implementation steps, and syntax-highlighted code sample.

This branch intentionally uses Next.js, Motion, Lucide, and Prism for richer interactions and animation. For the zero-install Node 18.18 edition, use the [`codex/plain-node18`](https://github.com/ByronHo68/ai-learning-academy/tree/codex/plain-node18) branch.

## Start it

Requirements: Node.js 22.13 or newer and npm 10 or newer.

```bash
npm install
npm start
```

`npm start` creates a fresh production build and then serves the site at [http://localhost:3000](http://localhost:3000). Pass a different port when needed:

```bash
npm start -- --port 4000
```

For development with live reload:

```bash
npm run dev
```

## Content and saved progress

- Course content is stored in `lib/curriculum.ts` and compiled into the app.
- Expanded metaphors, examples, steps, and code are stored in `lib/concepts.ts`.
- Seven production labs cover API contracts, provider fallback policy, RAG data lifecycle, tool security, telemetry and cost, evaluation gates, and incident-ready releases. Their data lives in `lib/production-track.js`.
- The API lesson uses a provider-neutral OpenRouter example instead of the source PDFs' Volcengine/Doubao-specific setup.
- Motion respects the learner's `prefers-reduced-motion` system setting.
- Progress, recap notes, quiz attempts, and review dates stay in the learner's browser using local storage.
- Settings includes progress export/import for moving data between browsers.
- No secrets or environment variables are required to read the course.
- `NEXT_PUBLIC_SITE_URL` is optional and only controls canonical/social-preview URLs after deployment. Copy `.env.example` to `.env.local` if you want to set it locally.

## PDF guide and review record

- [Bilingual AI learning roadmap and quiz guide](docs/guide/ai-learning-roadmap-bilingual-quiz-guide.pdf) — the consolidated 49-page guide.
- [Complete PDF corpus review](docs/PDF_CORPUS_REVIEW.md) — the 39-file, 1,339-page manifest, generated concept map, and OpenRouter migration notes.

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
