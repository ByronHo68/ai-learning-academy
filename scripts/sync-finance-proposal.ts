import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { Copy } from '../lib/curriculum';
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
  const lines = ['flowchart TD', `  input[${JSON.stringify(guide.title.en)}]`];
  guide.steps.forEach((step, index) => lines.push(`  s${index}[${JSON.stringify(step.keyword)}]`, `  ${index === 0 ? 'input' : `s${index - 1}`} --> s${index}`));
  lines.push(`  s${guide.steps.length - 1} --> check{Checks pass?}`);
  guide.branches.forEach((branch, index) => lines.push(`  check -->|${branch.kind}| b${index}[${JSON.stringify(branch.result.en)}]`));
  return `\`\`\`mermaid\n${lines.join('\n')}\n\`\`\``;
}
function functionMarkdown(guide: FinanceFunctionGuide): string {
  return [`## ${guide.title.en} / ${guide.title.zh}`, both(guide.purpose), `**Input / 輸入**\n\n${both(guide.input)}`, `**Output / 輸出**\n\n${both(guide.output)}`, `### Entry contract / 入口\n\n\`\`\`text\n${entryText(guide.entry)}\n\`\`\``, diagram(guide), ...guide.steps.map((step, index) => `### ${index + 1}. ${step.keyword}\n\n${both(step.action)}\n\nTools: ${step.tools}\n\n**How / 如何應用**\n\n${both(step.how)}\n\n**Why / 為何使用**\n\n${both(step.why)}\n\nProposed files / 建議檔案: ${step.proposedFiles.map(file => `\`${file}\``).join(', ')}`), '### Return branches / 回傳分支', ...guide.branches.map(branch => `**${branch.kind}**\n\n${both(branch.condition)}\n\n${both(branch.result)}\n\n${both(branch.next)}`), '### Acceptance / 驗收', ...guide.acceptance.map(check => `- ${check.en}\n- ${check.zh}`)].join('\n\n');
}
const assurance = `## Revised news, retrieval and observability requirements / 新版要求\n\n${financePromptFlow.join(' → ')}\n\n${financeAssurance.map(item => `### ${item.title.en} / ${item.title.zh}\n\n${item.points.map(both).join('\n\n')}`).join('\n\n')}`;
const adrMarkdown = (adr: typeof financeAdrs[number]) => `# ADR-${adr.id}: ${adr.title.en} / ${adr.title.zh}\n\nStatus: accepted design, implementation pending. Date: 2026-11-06.\n\n## Decision / 決定\n\n${both(adr.decision)}\n\n## Tradeoff / 取捨\n\n${both(adr.tradeoff)}\n\n## Verification / 驗證\n\n${both(adr.verification)}\n`;
const reviewerPack = ['# Stock research reviewer pack / 股票研究審閱材料',
  'Design artifacts plus a local synthetic evaluation harness. Live n8n, Qdrant, model and telemetry integrations are not implemented in this academy. The browser demo remains fictional.',
  assurance, ...financeAdrs.map(adrMarkdown),
  '## Reproduce and inspect\n\nRun `npm run proposal:check`, `npm run finance:eval:test` and `python3 evals/finance/evaluate.py --check`. See `evals/finance/README.md` for the live-run protocol. [Evaluation report card](stock-research-eval-report.md) · [Frozen golden set and injection fixtures](stock-research-eval-fixtures.json).',
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
const guide = [intro, estimate, assurance, stack, ...financeFunctions.map(functionMarkdown), folders, stages, ...financeEngineeringWorkflows.map(functionMarkdown), deferred, references].join('\n\n') + '\n';
const proposal = [intro, estimate, assurance, stages, folders, stack, '## Function contracts and individual workflows / 每項功能及獨立流程', ...financeFunctions.map(functionMarkdown), cases, deployment, ...financeEngineeringWorkflows.map(functionMarkdown), deferred, references].join('\n\n') + '\n';
const research = financeFunctions.find(item => item.id === 'research');
const recovery = financeFunctions.find(item => item.id === 'recovery');
if (!research || !recovery) throw new Error('Research and recovery guides are required.');
const graph = [intro, `## Bounded agent design / 有限研究流程\n\nUse one research graph. A mandatory node calls refresh_company_news through n8n MCP for each new prompt before retrieval. The model then chooses between search_company_evidence and read_source. It may refine a query once. Keep company identity, dates, source IDs, evidence, attempted searches, validation errors and report status in typed run state.\n\n使用一個研究 graph，每個新提示由固定節點先經 n8n MCP 呼叫 refresh_company_news；模型其後在兩個研究工具中選擇，最多修正搜尋一次。狀態保存公司、日期、來源、證據、搜尋次數、驗證錯誤及報告狀態。\n\nProposed limits: ${financeRuntimeLimits.searchRounds} searches, ${financeRuntimeLimits.sourceReads} source reads, ${financeRuntimeLimits.llmCalls} model calls and ${financeRuntimeLimits.timeoutSeconds} seconds per run. Enforce budgets in code, not in article text.\n\nCheckpoint state is run-scoped memory. Long-term user memory is deferred. Read-only source lookup does not need repeated human approval. Ask for clarification when identity is ambiguous; require explicit approval before any future externally visible action. The first release does not trade, send or publish reports automatically.\n\nCheckpoint 保存單次研究進度，跨任務長期記憶延後。唯讀查詢不用逐次批准；公司不明確時先澄清。將來如有外發動作須先獲批准；首版不自動交易、發送或發布報告。`, assurance, functionMarkdown(research), functionMarkdown(recovery), cases, references].join('\n\n') + '\n';
const outputs: Array<[string, string]> = [
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
