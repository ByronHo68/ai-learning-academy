# AI Learning Academy

A portable Node.js/Next.js edition of the bilingual visual AI curriculum. All 13 lessons, 104 quiz questions, explanations, source references, and remediation content are included in the repository. The running app does not need the source PDFs, a database, or a paid API.

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
- Progress, recap notes, quiz attempts, and review dates stay in the learner's browser using local storage.
- Settings includes progress export/import for moving data between browsers.
- No secrets or environment variables are required to read the course.
- `NEXT_PUBLIC_SITE_URL` is optional and only controls canonical/social-preview URLs after deployment. Copy `.env.example` to `.env.local` if you want to set it locally.

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

The included GitHub Actions workflow checks types, linting, tests, and the production build on every push and pull request.

## Useful commands

```bash
npm run check             # TypeScript, ESLint, and content/progress tests
npm run build             # Standard Node/Next.js production build
npm run start:production  # Serve an existing build without rebuilding
npm run sites:build       # Build the existing ChatGPT Sites deployment target
```
