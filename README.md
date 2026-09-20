# AI Learning Academy

A zero-dependency, bilingual AI curriculum built with plain HTML, CSS, and JavaScript. It includes all 13 lessons, 59 detailed concept workshops, 104 quiz questions, interactive visual walkthroughs, remediation, spaced review, a cumulative assessment, a production build brief, and browser-local progress. Every core concept has a deeper explanation, its own metaphor, a realistic example, an implementation sequence, and copyable code.

## Start — no install required

Requirement: **Node.js 18.18.x**.

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). A different port also works:

```bash
npm start -- --port 4000
```

There are no dependencies or dev dependencies. You do **not** need to run `npm install`, and the app does not need the source PDFs, a database, an account, environment variables, or a paid API.

The API lesson now uses OpenRouter as a provider-neutral example. Its sample keeps `OPENROUTER_API_KEY` on the server; the learning site itself never calls a paid API.

You can also start it without npm:

```bash
node server.mjs
```

## Project structure

- `site/index.html` — application shell and metadata
- `site/styles.css` — responsive interface styles
- `site/app.js` — routing, interactions, quizzes, and local progress
- `site/curriculum.js` — all lesson, quiz, and source content
- `site/concepts.js` — base concept/metaphor/example/code workshops
- `site/production-track.js` — seven applied production-engineering workshops
- `server.mjs` — zero-dependency static server using Node built-ins
- `scripts/build.mjs` — copies the static site to `dist/`

Progress stays in the learner's browser with local storage. Settings can export/import a versioned JSON backup.

## PDF guide and review record

- [Bilingual AI learning roadmap and quiz guide](docs/guide/ai-learning-roadmap-bilingual-quiz-guide.pdf) — the consolidated 49-page guide.
- [Complete PDF corpus review](docs/PDF_CORPUS_REVIEW.md) — the 39-file, 1,339-page manifest, generated concept map, and OpenRouter migration notes.

The raw topic PDFs are intentionally excluded because parts of the source set contain credential-like strings and potentially private or licensed material.

## Commands

```bash
npm start      # serve at localhost:3000
npm run build  # create static dist/
npm test       # validate content and zero-dependency contract
```

## Static hosting

Run `npm run build`, then publish the generated `dist/` folder to GitHub Pages, Cloudflare Pages, Netlify, or any static host. Hash-based routes keep every view working without special redirect configuration.
