import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { financeDatabase, financePostgresSchema, financePostgresQuery, financePostgresCheckpoint } from '../lib/finance-database';
import type { Copy } from '../lib/curriculum';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FinanceDiagramSvg } from '../app/finance-diagram-svg';
import { financeDiagrams, financeDiagramMermaid, financeRetryRules } from '../lib/finance-diagrams';
import { mcpExamples, mcpIntroduction, mcpMindmap, mcpMindmapMermaid, mcpOwnership, mcpReferences, mcpScenarios, mcpSetup, mcpStorySteps, mcpToolDefinition, mcpVersionNote, mcpWorkflowMermaid } from '../lib/finance-mcp';
import { financeFunctionRoutes } from '../lib/finance-workflows';
import { financeContextExample, financeGraphNodes, financeGraphScenarios, financeGraphState, financeGraphWiring, financeScenarioPath } from '../lib/finance-graph';
import { financeAdrs, financeAssurance, financePromptFlow } from '../lib/finance-assurance';
import { financeCompanies, financeDeferred, financeEngineeringWorkflows, financeFunctions, financeReferences, financeRepositoryTree, financeStack, financeStages, type FinanceFunctionGuide } from '../lib/finance-project';
import { financeComposeDesign, financeDeploymentNotes, financeInterviewCases, financeLocalCommands, financePlan, financeRuntimeLimits } from '../lib/finance-proposal';

const root = new URL('../', import.meta.url);
const both = (value: Copy) => `${value.en}\n\n${value.zh}`;
const allFunctions = [...financeFunctions, ...financeEngineeringWorkflows];
if (new Set(allFunctions.map(item => item.id)).size !== allFunctions.length) throw new Error('Function IDs must be unique.');
if (financeCompanies.length !== 3 || new Set(financeCompanies.map(item => item.id)).size !== 3) throw new Error('The first release supports exactly three companies.');
if (financeStages.reduce((total, stage) => total + stage.hours, 0) !== financePlan.hoursMin) throw new Error('Stage hours do not match the core estimate.');
if (financePlan.hoursMin + financePlan.contingencyHours !== financePlan.hoursMax) throw new Error('Contingency must be included in the total estimate.');
for (const guide of allFunctions) {
  if (!guide.steps.length || !guide.branches.some(branch => branch.kind === 'success') || !guide.branches.some(branch => branch.kind === 'failure')) throw new Error(`Missing paths for ${guide.id}.`);
  if (new Set(guide.steps.map(step => step.id)).size !== guide.steps.length) throw new Error(`Duplicate step ID in ${guide.id}.`);
  for (const step of guide.steps) for (const value of [step.action, step.how, step.why]) {
    if (!value.en.trim() || !value.zh.trim()) throw new Error(`Missing translation in ${guide.id}/${step.id}.`);
  }
}

function entryText(entry: FinanceFunctionGuide['entry']): string {
  switch (entry.kind) {
    case 'http': return `${entry.method} ${entry.path}\n${entry.example}`;
    case 'internal': return `${entry.caller}\n${entry.contract}`;
    case 'developer': return entry.command;
    default: { const exhaustive: never = entry; return exhaustive; }
  }
}
function diagram(guide: FinanceFunctionGuide): string {
  const routes = financeFunctionRoutes[guide.id];
  const names = [...new Set(routes.flatMap(route => [route.from, route.to]))];
  const lines = ['flowchart TD', ...names.map((name, index) => `  n${index}[${JSON.stringify(name)}]`),
    ...routes.map(route => `  n${names.indexOf(route.from)} -->|${JSON.stringify(route.when.en)}| n${names.indexOf(route.to)}`)];
  return `\`\`\`mermaid\n${lines.join('\n')}\n\`\`\``;

}
function functionMarkdown(guide: FinanceFunctionGuide): string {
  return [`## ${guide.title.en} / ${guide.title.zh}`, both(guide.purpose), `**Input / 輸入**\n\n${both(guide.input)}`, `**Output / 輸出**\n\n${both(guide.output)}`, `### Entry contract / 入口\n\n\`\`\`text\n${entryText(guide.entry)}\n\`\`\``, diagram(guide), ...financeFunctionRoutes[guide.id].map(route => `**${route.from} → ${route.to}**\n\n${both(route.when)}\n\nHandoff / 交接資料:\n\n${both(route.payload)}`), ...guide.steps.map((step, index) => `### ${index + 1}. ${step.keyword}\n\n${both(step.action)}\n\nTools: ${step.tools}\n\n**How / 如何應用**\n\n${both(step.how)}\n\n**Why / 為何使用**\n\n${both(step.why)}\n\nProposed files / 建議檔案: ${step.proposedFiles.map(file => `\`${file}\``).join(', ')}`), '### Return branches / 回傳分支', ...guide.branches.map(branch => `**${branch.kind}**\n\n${both(branch.condition)}\n\n${both(branch.result)}\n\n${both(branch.next)}`), '### Acceptance / 驗收', ...guide.acceptance.map(check => `- ${check.en}\n- ${check.zh}`)].join('\n\n');
}
const databaseOverview = [
  '## PostgreSQL database design / PostgreSQL 資料庫設計',
  both(financeDatabase.introduction),
  financeDatabase.flow.join(' → '),
];
const database = [
  ...databaseOverview,
  ...financeDatabase.responsibilities.map(item => `### ${item.name}\n\n${both(item.detail)}`),
  '### Connections, retries and backups / 連線、重試及備份',
  ...financeDatabase.operations.map(both),
  '### Schema example / 資料表範例\n\n```sql\n' + financePostgresSchema + '\n```',
  '### Retrieval query / 檢索查詢\n\n```sql\n' + financePostgresQuery + '\n```',
  '### Checkpoint wiring / Checkpoint 接線\n\n```python\n' + financePostgresCheckpoint + '\n```',
].join('\n\n');
const assurance = `## Revised news, retrieval and observability requirements / 新版要求\n\n${financePromptFlow.join(' → ')}\n\n${financeAssurance.map(item => `### ${item.title.en} / ${item.title.zh}\n\n${item.points.map(both).join('\n\n')}`).join('\n\n')}`;
const adrMarkdown = (adr: typeof financeAdrs[number]) => `# ADR-${adr.id}: ${adr.title.en} / ${adr.title.zh}\n\nStatus: accepted design, implementation pending. Date: 2026-11-06. PostgreSQL revision: 2026-11-11.\n\n## Decision / 決定\n\n${both(adr.decision)}\n\n## Tradeoff / 取捨\n\n${both(adr.tradeoff)}\n\n## Verification / 驗證\n\n${both(adr.verification)}\n`;
const reviewerPack = ['# Stock research reviewer pack / 股票研究審閱材料',
  'Design artifacts plus a local synthetic evaluation harness. Live finance n8n, pgvector retrieval, model and telemetry integrations are not implemented in this academy. The synthetic evaluation harness executes PostgreSQL full-text search. The browser demo remains fictional.',
  ...databaseOverview, assurance, ...financeAdrs.map(adrMarkdown),
  '## Reproduce and inspect\n\nSet up the PostgreSQL 18 evaluation database and Python dependencies using `evals/finance/README.md`. Then run `npm run proposal:check`, `npm run finance:eval:test` and `python3 evals/finance/evaluate.py --check`. [Evaluation report card](stock-research-eval-report.md) · [Frozen golden set and injection fixtures](stock-research-eval-fixtures.json).',
  '## Official references\n\n' + financeReferences.map(item => `- [${item.title}](${item.url})`).join('\n'),
].join('\n\n') + '\n';
const intro = `# Stock research assistant / 股票研究助手\n\nThree supported companies, one bounded research agent, one cited report.\n\n3 間公司、1 個有執行上限的研究 agent、1 頁有來源報告。\n\nThis academy contains a working offline teaching simulation and a proposed application design. It does not run a Python finance service, fetch current market news or issue real investment recommendations. All demo events, news and ratings are fictional.\n\n此學習網站提供可操作的離線教學模擬及未來 app 設計，沒有運行 Python 金融服務或抓取即時新聞；示範事件、新聞及評級全部虛構。\n\nSupported company identities: ${financeCompanies.map(company => `${company.name} (${company.id})`).join(', ')}. Real company identities do not make the demo fixtures real news.\n\nGenerated from \`lib/finance-project.ts\` and \`lib/finance-proposal.ts\`. Run \`npm run proposal:sync\`; do not edit the generated files.\n`;
const estimate = `## Scope and estimate / 範圍及工時\n\n${financePlan.hoursMin}–${financePlan.hoursMax} total hours at ${financePlan.weeklyHours} hours per week, approximately ${financePlan.weeksMin}–${financePlan.weeksMax} weeks. Core stages total ${financePlan.hoursMin} hours. The ${financePlan.contingencyHours}-hour reserve is included, not additional. Subjective difficulty: ${financePlan.difficulty}.\n\n${both(financePlan.assumption)}\n\nEach new prompt must refresh news through n8n MCP and pin its permitted evidence snapshot. Show provider status, publication/first-seen times and refresh time. An offline replay is not current news.\n\n每個新提示須經 n8n MCP 刷新並固定允許使用的證據快照；顯示供應商狀態、發布／首次取得及刷新時間。離線重播不等於即時新聞。`;
const stages = `## Delivery stages / 開發階段\n\n${financeStages.map(stage => `### Week ${stage.week}: ${stage.title.en} / ${stage.title.zh}\n\n${stage.hours} hours\n\n${stage.tasks.map(task => `- ${task.en}\n- ${task.zh}`).join('\n')}\n\nAcceptance / 驗收:\n\n${both(stage.done)}`).join('\n\n')}`;
const stack = `## Technique ownership / 技術責任\n\n${financeStack.map(item => `### ${item.name}\n\n${item.tools}\n\n**How / 如何應用**\n\n${both(item.how)}\n\n**Why / 為何使用**\n\n${both(item.why)}`).join('\n\n')}`;
const folders = `## Proposed file hierarchy and local startup / 建議檔案及本機啟動\n\nThis is the proposed standalone app. These services and commands are not implemented in this academy repository.\n\n\`\`\`text\n${financeRepositoryTree}\n\`\`\`\n\n\`\`\`sh\n${financeLocalCommands}\n\`\`\``;
const deployment = `## Docker and EC2 / Docker 及 EC2\n\n\`\`\`yaml\n${financeComposeDesign}\n\`\`\`\n\n${financeDeploymentNotes.map(note => `- ${note.en}\n- ${note.zh}`).join('\n\n')}`;
const cases = `## Evaluation and interview evidence / 評估及面試證據\n\n${financeInterviewCases.map(item => `- ${item.en}\n- ${item.zh}`).join('\n\n')}\n\nStart with the frozen 18-case synthetic set and eight injection fixtures. Add a separately reviewed real-news holdout; publish actual results, dataset hashes and rerun commands. Test factual support and failure behavior. A Hold label has no universal correct answer and is not proof of a profitable strategy.\n\n先用凍結 18 個虛構案例及八個注入 fixtures，再加獨立審閱真實新聞保留集；附資料 hash、執行命令及真實結果。評估事實支持度及失敗處理；Hold 標籤沒有普遍標準答案，亦不能證明策略盈利。`;
const deferred = `## Deferred scope / 後續擴展\n\n${financeDeferred.map(item => `### ${item.name}\n\n${both(item.reason)}`).join('\n\n')}`;
const references = `## References / 官方參考\n\n${financeReferences.map(item => `- [${item.title}](${item.url})`).join('\n')}`;
const guide = [intro, estimate, database, assurance, stack, ...financeFunctions.map(functionMarkdown), folders, stages, ...financeEngineeringWorkflows.map(functionMarkdown), deferred, references].join('\n\n') + '\n';
const proposal = [intro, estimate, database, assurance, stages, folders, stack, '## Function contracts and individual workflows / 每項功能及獨立流程', ...financeFunctions.map(functionMarkdown), cases, deployment, ...financeEngineeringWorkflows.map(functionMarkdown), deferred, references].join('\n\n') + '\n';
const graphWalkthrough = [
  '## Vector retrieval → reranking → LLM / 向量檢索 → 重排 → LLM',
  'Assumption: news is already chunked and indexed in PostgreSQL; the live app still refreshes every accepted prompt through n8n and pins the new snapshot. The website only plays deterministic fictional scenarios. No live graph, vector, reranker or model call is made.\n\n假設新聞已切段及索引；真實版仍須經 n8n 刷新每個已接納提示並固定新快照。網站只播放固定虛構情境，沒有真實 graph、向量、重排或模型呼叫。',
  '### State / 狀態\n\n' + both(financeGraphState),
  ...Object.entries(financeGraphNodes).map(([id, node]) => `### ${node.label} (\`${id}\`)\n\nReads: ${node.input}\n\nWrites / handoff: ${node.output}\n\n${both(node.how)}`),
  '## Scenario routes / 情境路徑',
  ...financeGraphScenarios.map(scenario => `### ${scenario.title.en} / ${scenario.title.zh}\n\n${both(scenario.prompt)}\n\n\`\`\`text\n${financeScenarioPath(scenario.id).map(key => financeGraphNodes[key].label).join(' → ')}\n\`\`\`\n\n${both(scenario.result)}`),
  '## Exact context envelope / 模型上下文\n\nFictional supported-case example. Source excerpts are untrusted data, separate from policy and user intent. Scores are not confidence. Trim within a token budget, then recheck coverage.\n\n\`\`\`json\n' + financeContextExample + '\n\`\`\`',
  '## Python graph wiring / Python graph 接線\n\nProposed wiring only. Supply real typed nodes, enforced budgets, provider adapters and a durable checkpointer before execution. The API owns thread authorization; a resumed run retains its original deadline.\n\n\`\`\`python\n' + financeGraphWiring + '\n\`\`\`',
].join('\n\n');
const research = financeFunctions.find(item => item.id === 'research');
const recovery = financeFunctions.find(item => item.id === 'recovery');
if (!research || !recovery) throw new Error('Research and recovery guides are required.');
const graph = [intro, database, graphWalkthrough, `## Bounded agent design / 有限研究流程\n\nUse one research graph. A mandatory node calls refresh_company_news through n8n MCP for each new prompt before retrieval. Code-owned nodes call search_company_evidence and read_source in the documented order. A query planner may refine once within the same limits; the model cannot choose a privileged route. Keep company identity, dates, source IDs, evidence, attempted searches, validation errors and report status in typed run state.\n\n使用一個研究 graph，每個新提示由固定節點先經 n8n MCP 呼叫 refresh_company_news；程式節點其後按文件次序呼叫搜尋及讀取工具；查詢規劃最多修正一次，模型不能自行選取特權路由。狀態保存公司、日期、來源、證據、搜尋次數、驗證錯誤及報告狀態。\n\nProposed limits: ${financeRuntimeLimits.searchRounds} searches, ${financeRuntimeLimits.sourceReads} source reads, ${financeRuntimeLimits.llmCalls} model calls and ${financeRuntimeLimits.timeoutSeconds} seconds per run. Enforce budgets in code, not in article text.\n\nCheckpoint state is run-scoped memory. Long-term user memory is deferred. Read-only source lookup does not need repeated human approval. Ask for clarification when identity is ambiguous; require explicit approval before any future externally visible action. The first release does not trade, send or publish reports automatically.\n\nCheckpoint 保存單次研究進度，跨任務長期記憶延後。唯讀查詢不用逐次批准；公司不明確時先澄清。將來如有外發動作須先獲批准；首版不自動交易、發送或發布報告。`, assurance, functionMarkdown(research), functionMarkdown(recovery), cases, references].join('\n\n') + '\n';
const mcpGuide = [
  '# MCP visual guide / MCP 圖解指南',
  'Generated from `lib/finance-mcp.ts`. Open `/finance-project/mcp` for the playable bilingual animation and interactive mind map. Run `npm run proposal:sync` to regenerate this guide.',
  'Teaching simulation only. All example news and tool-result data are fictional; no live n8n, vector database or model calls occur. Setup steps describe the future finance app.\n\n純教學模擬；新聞及工具回傳均為虛構，沒有真實 n8n、向量資料庫或模型呼叫。設定步驟描述未來金融 app。',
  both(mcpIntroduction),
  '## Mind map / 心智圖\n\n```mermaid\n' + mcpMindmapMermaid + '\n```',
  ...mcpMindmap.map(item => `### ${item.title.en} / ${item.title.zh}\n\n${both(item.detail)}`),
  'The counts describe core roles, server capabilities and standard transports; they are not an exhaustive list of optional protocol features. Servers may offer a subset of capabilities.\n\n數目是核心角色、server 功能及標準傳輸的分類，並非所有選用功能；server 可只提供部分功能。',
  '## Workflow / 工作流程\n\n```mermaid\n' + mcpWorkflowMermaid + '\n```',
  'RAG retrieves evidence before generation. MCP connects the host to the news tool. In this design, the research app queries PostgreSQL directly, then calls the reranker and LLM separately from MCP. The candidate hybrid index is allowed only after passing the existing written evaluation gates.\n\nRAG 先檢索證據再生成；MCP 連接 host 與新聞工具。研究 app 直接查詢 PostgreSQL；重排及 LLM 呼叫與 MCP 分開。候選混合索引須通過現有書面評估門檻。',
  ...mcpOwnership.map(item => `- **${item.name}**: ${item.job.en} / ${item.job.zh}`),
  '## Animation scenarios / 動畫情境',
  ...mcpScenarios.map(item => `### ${item.title.en} / ${item.title.zh}\n\n${both(item.prompt)}\n\n${item.path.map((id, index) => `${index + 1}. ${mcpStorySteps[id].title.en} / ${mcpStorySteps[id].title.zh}${mcpStorySteps[id].channel === 'mcp' ? ' [MCP]' : ''}`).join('\n')}`),
  '## Step explanations / 每步解說',
  ...Object.values(mcpStorySteps).map(item => `### ${item.title.en} / ${item.title.zh}\n\n${item.from.en} → ${item.to.en}\n\n${both(item.explanation)}\n\n\`\`\`text\n${item.message}\n\`\`\``),
  '## Three examples / 三種例子',
  ...mcpExamples.map(item => `### ${item.title.en} / ${item.title.zh}\n\n${both(item.purpose)}\n\nRequest fragment / 要求片段:\n\n\`\`\`json\n${JSON.stringify(item.request, null, 2)}\n\`\`\`\n\nSimplified result data / 簡化回傳資料:\n\n\`\`\`json\n${JSON.stringify(item.result, null, 2)}\n\`\`\`\n\n${both(item.note)}`),
  '### Proposed tool definition / 建議工具定義\n\n```json\n' + JSON.stringify(mcpToolDefinition, null, 2) + '\n```',
  '## Connect n8n / 連接 n8n\n\nResearch app MCP client → n8n MCP Server Trigger → Custom n8n Workflow Tool → news sub-workflow. The reverse direction uses an n8n MCP Client Tool to consume another server. The Server Trigger supports Streamable HTTP and legacy SSE, not stdio.\n\n研究 app 作 client，n8n 作 server；相反方向由 n8n MCP Client Tool 使用外部 server。Server Trigger 支援 Streamable HTTP 及舊 SSE，未支援 stdio。',
  ...mcpSetup.map((item, i) => `${i + 1}. ${item.en}\n\n   ${item.zh}`),
  '## Version compatibility / 版本相容\n\n' + both(mcpVersionNote),
  '## References / 官方參考\n\n' + mcpReferences.map(item => `- [${item.title}](${item.url})`).join('\n'),
].join('\n\n') + '\n';
const outputs: Array<[string, string]> = [
  ['docs/FINANCE_MCP_GUIDE.md', mcpGuide],
  ['public/downloads/stock-research-mcp-guide.md', mcpGuide],
  ['public/downloads/stock-research-graph.py', financeGraphWiring],
  ['docs/FINANCE_REVIEW_PACK.md', reviewerPack.replaceAll('](stock-research-', '](../public/downloads/stock-research-')],
  ['public/downloads/stock-research-review-pack.md', reviewerPack],
  ...financeAdrs.map(adr => [`docs/finance-adrs/${adr.id}.md`, adrMarkdown(adr)] satisfies [string, string]),
  ['docs/FINANCIAL_REPORT_PROJECT.md', guide],
  ['docs/FINANCIAL_REPORT_DEVELOPMENT_PROPOSAL.md', proposal],
  ['docs/FINANCIAL_REPORT_LANGGRAPH_DESIGN.md', graph],
  ['public/downloads/stock-research-project.md', guide],
  ['public/downloads/financial-report-development-proposal.md', proposal],
  ['public/downloads/financial-report-langgraph-design.md', graph],
];
const atlas = [
  '# Stock research workflow atlas / 股票研究流程圖集',
  'Open `/finance-project/workflows` for the interactive mind map and twelve connected diagrams. These are proposed designs and offline teaching paths, not live service runs. Node names match the technical contracts; edge conditions and explanations are bilingual.',
  '開啟 `/finance-project/workflows` 查看互動心智圖及十二張連線圖。這些是建議設計及離線教學路徑，並非真實服務執行；節點名稱沿用技術合約，條件及解說提供雙語。',
  `Per run: ${financeRuntimeLimits.newsRefreshes} news refresh, ${financeRuntimeLimits.searchRounds} searches including failures, ${financeRuntimeLimits.sourceReads} source reads, at most ${financeRuntimeLimits.llmCalls} LLM calls and the original ${financeRuntimeLimits.timeoutSeconds}s deadline. No retry or resume resets the budget. Purple = bounded refinement/resume; amber = fallback; red = stop; teal = continue.`,
  ...financeRetryRules.map(rule => `## ${rule.title.en} / ${rule.title.zh}\n\n${both(rule.body)}`),
  ...financeDiagrams.map(diagram => `## ${diagram.title.en} / ${diagram.title.zh}\n\n[English SVG](finance-diagrams/${diagram.id}-en.svg) · [繁體中文 SVG](finance-diagrams/${diagram.id}-zh.svg)\n\n\`\`\`mermaid\n${financeDiagramMermaid(diagram, 'en')}\n\`\`\`\n\n${diagram.edges.map(edge => `- **${edge.from} → ${edge.to}** — ${edge.label.en} / ${edge.label.zh}\n  ${edge.detail.en}\n  ${edge.detail.zh}`).join('\n\n')}`),
].join('\n\n') + '\n';
outputs.push(['docs/FINANCE_POSTGRESQL_GUIDE.md', database + '\n'], ['public/downloads/stock-research-postgresql-guide.md', database + '\n'], ['public/downloads/finance-postgresql-schema.sql', financePostgresSchema]);
outputs.push(['public/downloads/stock-research-workflow-atlas.md', atlas], ['docs/FINANCE_WORKFLOW_ATLAS.md', atlas.replaceAll('](finance-diagrams/', '](../public/downloads/finance-diagrams/')]);
for (const diagram of financeDiagrams) for (const lang of ['en', 'zh'] satisfies Array<'en' | 'zh'>) {
  const svg = renderToStaticMarkup(createElement(FinanceDiagramSvg, { diagram, lang, prefix: `${diagram.id}-${lang}` }));
  outputs.push([`public/downloads/finance-diagrams/${diagram.id}-${lang}.svg`, svg + '\n'], [`public/downloads/finance-diagrams/${diagram.id}-${lang}.mmd`, financeDiagramMermaid(diagram, lang) + '\n']);
}
for (const [path, content] of outputs) {
  const target = new URL(path, root);
  if (process.argv.includes('--check')) {
    if (await readFile(target, 'utf8') !== content) throw new Error(`Stale ${path}. Run npm run proposal:sync.`);
  } else {
    await mkdir(new URL('./', target), { recursive: true });
    await writeFile(target, content);
  }
}
console.log(process.argv.includes('--check') ? 'Finance documents match the typed catalog.' : 'Generated finance guide, proposal and graph design.');
