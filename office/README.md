# Run the academy at the office

This folder contains the prebuilt animated learning website and a Node.js server with no npm dependencies. Use Node.js 18.18 or newer on Windows, macOS, or Linux. The server is tested locally on Node 18.18.1.

## Start the website

Download this branch from GitHub using **Code > Download ZIP** and extract it. Open a terminal in the extracted `office` folder, then run:

```bash
node --version
npm start
```

Open <http://127.0.0.1:3000>. Keep the terminal open while you use the website.

You can also clone the branch:

```bash
git clone --branch codex/node18-office-bundle --single-branch https://github.com/ByronHo68/ai-learning-academy.git
cd ai-learning-academy/office
npm start
```

`npm start` also works from the extracted project's main folder. It starts this same prebuilt office website. To run without npm from the main folder, use `node office/server.mjs`. Developing the editable Next.js edition needs Node 22 and npm packages; start that edition with `npm run start:source`.

No install is needed in `office`. If your workflow requires it, `npm ci --offline` or `npm install --offline` works without a populated npm cache. Do not run the install in the repository root.

If npm itself is blocked, use:

```bash
node server.mjs
```

For another port:

```bash
npm start -- --port 4000
```

## Fix a missing Next.js error

If you see `Cannot find module 'next/dist/bin/next'`, your copy is using the old source-app startup command. From the extracted project's main folder, run:

```bash
node office/server.mjs
```

You do not need to install Next.js. Download the latest `codex/node18-office-bundle` branch to make `npm start` work from the main folder too.

## Check the downloaded package

```bash
npm test
```

The test starts the real server and checks all exported files, page routes, Python downloads, missing pages, and the agent-lab availability message.

The lessons, animations, quizzes, concept workshops, hiring guides, junior lessons, Python downloads, and browser progress run locally. Progress is saved in this browser. Use Settings to export or import it. External reference links still need internet access.

The dashboard and concept map link to `/finance-project`: a bilingual Hong Kong Financial Report Analyst project guide. Its eight-branch mind map, function details, seven-step walkthrough, missing-evidence scenario, technology stack and build stages work offline. This is a blueprint for a future application; its example company, figures and page references are fictional, and it does not process real reports or call a model.

Open **Function workflows** to explore all 24 functions. Every function includes four processing steps, the tools at each step, an expected result and failure handling. The technology table also describes data handoffs for each layer. Select an area and expand its function guides; English and Traditional Chinese both work offline.

The agent lab pages are included, but running agents and evaluations requires the separate Python and Java services and the Next.js proxy in `codex/rich-animated-ts`. This office server returns an explanation when those pages request the lab API. It does not run those services.

## Rebuild after editing the source

On a machine with Node 22.13+ and access to the required npm packages, run these commands in the repository root:

```bash
npm ci
npm run office:build
npm run office:test
```

Commit the regenerated `office/site` files and `office/build-info.json` with your source changes. The build script uses an isolated temporary copy of the app and removes it afterwards. Only the temporary copy excludes the live lab API and enables static export. The source app keeps its normal backend behavior.

No `node_modules`, local service data, or `.env` credentials are needed in the office download.
