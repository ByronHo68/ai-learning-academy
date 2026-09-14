# AI Learning Academy

A zero-dependency, bilingual AI curriculum built with plain HTML, CSS, and JavaScript. It includes all 13 lessons, 104 quiz questions, interactive visual walkthroughs, remediation, spaced review, a cumulative assessment, a capstone, and browser-local progress.

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

You can also start it without npm:

```bash
node server.mjs
```

## Project structure

- `site/index.html` — application shell and metadata
- `site/styles.css` — responsive interface styles
- `site/app.js` — routing, interactions, quizzes, and local progress
- `site/curriculum.js` — all lesson, quiz, and source content
- `server.mjs` — zero-dependency static server using Node built-ins
- `scripts/build.mjs` — copies the static site to `dist/`

Progress stays in the learner's browser with local storage. Settings can export/import a versioned JSON backup.

## Commands

```bash
npm start      # serve at localhost:3000
npm run build  # create static dist/
npm test       # validate content and zero-dependency contract
```

## Static hosting

Run `npm run build`, then publish the generated `dist/` folder to GitHub Pages, Cloudflare Pages, Netlify, or any static host. Hash-based routes keep every view working without special redirect configuration.
