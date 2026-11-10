# Finance project content architecture

## Problem

The academy teaches a future application through three existing routes. The previous financial-report scope repeated function metadata across workflow, API, map, model and example registries. The user now wants a smaller stock-news research project for job applications. All three routes and the static office edition must describe the same scope.

## Usage

The guide renders `financeFunctions` and `financeEngineeringWorkflows` from `lib/finance-project.ts`. Each item carries its entry contract, processing steps, technique explanations, proposed files, acceptance checks and return branches. `FinanceFunctionMindmap({ guide, lang })` renders one complete item. The proposal reads the same stages and folder tree. The demo imports the same supported-company list but owns its scripted transitions separately.

Run `npm run proposal:sync` to generate the Markdown guide, proposal, graph design and downloads. Run `npm run proposal:check` to detect drift. Rebuild the office edition with `npm run office:build` after source changes.

## Shape

- `lib/finance-project.ts` owns explanatory function content, companies, stages, stack and deferred scope.
- `lib/finance-proposal.ts` owns estimates, proposed runtime limits and deployment instructions.
- `app/finance-function-map.tsx` renders an entry, ordered workflow, technique inspector and return branches.
- The three existing content components retain their public exports and shared bilingual Shell.
- `lib/finance-demo.ts` owns a pure, explicitly offline simulation. It does not execute the proposed Python graph.
- `scripts/sync-finance-proposal.ts` derives documentation from the typed catalogs. Generated Markdown is never a second editable owner.

HTTP, internal operations and developer commands are distinct entry variants. This prevents ingestion or validation from acquiring invented public APIs. The renderer accepts one complete function rather than coordinating parallel arrays. Demo states distinguish successful, insufficient and interrupted runs so a report is not displayed before validation.

## Synthesis decision

Two independent sketches compared a typed catalog with a documentation-first generator using structured Markdown blocks. An independent review scored the catalog 28/30 and the documentation-first design 25/30 on scope consistency, ownership, workflows, honest simulation, integration and accessibility. The catalog is the base because it keeps the existing TypeScript boundary and needs less parsing infrastructure.

The final design takes generated documentation and explicit evaluation/deployment workflows from the documentation-first alternative. It rejects a general graph editor and a new fenced-data schema. Those interfaces would add authoring and validation work without a requested capability.

## Tradeoffs

- A curated, dated snapshot makes the first interview demo reproducible. It does not demonstrate live global news coverage.
- One Python service keeps the first application small. Spring Boot, MCP, multi-user access and advanced retrieval remain explicit later scope.
- The browser demonstrates checkpoint behavior within one session. Persistent PostgreSQL recovery belongs to the proposed Python application.
- Workflow diagrams use accessible HTML and responsive connectors. They explain control flow without requiring canvas or generated images.

## Verification

Verify bilingual function coverage, each entry type, return branches, generated-document consistency and the offline reducer. Exercise all four scenarios in the browser, including export and recovery. Build the source app and regenerate the office export, then test the real Node 18 server. Keep financial fixtures and measured engineering results clearly separate.
