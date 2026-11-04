import { type Copy, type Lang, pick } from './curriculum';

export type FinanceDemoScenario = 'supported' | 'missing' | 'review' | 'scanned';
export type FinanceDemoQuestion = 'cashflow-change' | 'cashflow-reason';
type ReadableScenario = Exclude<FinanceDemoScenario, 'scanned'>;

export type FinanceDemoSourcePage = {
  id: string;
  year: number;
  page: number;
  title: Copy;
  text: Copy;
};

export const financeDemoSamples: Array<{
  id: FinanceDemoScenario;
  title: Copy;
  detail: Copy;
  tag: string;
}> = [
  {
    id: 'supported',
    title: { en: 'Complete evidence', zh: '證據齊備' },
    detail: { en: 'Compare two fictional reports, then explain the change using a cited source.', zh: '比較兩份虛構年報，再引用原文解釋變化。' },
    tag: 'TEXT PDF',
  },
  {
    id: 'missing',
    title: { en: 'Missing explanation', zh: '缺少原因證據' },
    detail: { en: 'The figures are available, but the supplied pages do not explain the cause.', zh: '數字齊備，但提供的頁面沒有解釋原因。' },
    tag: 'PARTIAL ANSWER',
  },
  {
    id: 'review',
    title: { en: 'A table needs review', zh: '表格需要覆核' },
    detail: { en: 'Compare an incorrect extracted value with the printed sample before continuing.', zh: '先比較錯誤擷取值與原文範例，覆核後才繼續。' },
    tag: 'HUMAN REVIEW',
  },
  {
    id: 'scanned',
    title: { en: 'Scanned document', zh: '掃描文件' },
    detail: { en: 'Stop when the sample has no extractable text and identify the OCR requirement.', zh: '範例沒有可擷取文字時停止，並指出需要 OCR。' },
    tag: 'OCR REQUIRED',
  },
];

export const financeDemoQuestions: Array<{ id: FinanceDemoQuestion; title: Copy }> = [
  { id: 'cashflow-change', title: { en: 'How much did operating cash flow change?', zh: '經營現金流變動了多少？' } },
  { id: 'cashflow-reason', title: { en: 'Why did operating cash flow fall?', zh: '經營現金流為何下跌？' } },
];

const before = { year: 2024, page: 42, amount: 100 };
const after = { year: 2025, page: 48, amount: 80 };
const causePage = 49;
const units: Copy = { en: 'HKD million', zh: '百萬港元' };

export const financeDemoSourcePages: FinanceDemoSourcePage[] = [
  {
    id: 'demo-2024-cashflow', year: before.year, page: before.page,
    title: { en: '2024 operating cash flow', zh: '2024 年經營現金流' },
    text: {
      en: `DemoCo annual report ${before.year}, page ${before.page}. Consolidated cash flow statement. Currency: HKD. Units: millions. Net cash generated from operating activities: ${before.amount}.`,
      zh: `DemoCo ${before.year} 年年報，第 ${before.page} 頁。綜合現金流量表。貨幣：港元。單位：百萬。經營活動產生的現金淨額：${before.amount}。`,
    },
  },
  {
    id: 'demo-2025-cashflow', year: after.year, page: after.page,
    title: { en: '2025 operating cash flow', zh: '2025 年經營現金流' },
    text: {
      en: `DemoCo annual report ${after.year}, page ${after.page}. Consolidated cash flow statement. Currency: HKD. Units: millions. Net cash generated from operating activities: ${after.amount}.`,
      zh: `DemoCo ${after.year} 年年報，第 ${after.page} 頁。綜合現金流量表。貨幣：港元。單位：百萬。經營活動產生的現金淨額：${after.amount}。`,
    },
  },
  {
    id: 'demo-2025-explanation', year: after.year, page: causePage,
    title: { en: 'Management explains the change', zh: '管理層解釋變化' },
    text: {
      en: `DemoCo annual report ${after.year}, page ${causePage}. Management attributes the decline in operating cash flow to increased trade receivables, which tied up cash in working capital.`,
      zh: `DemoCo ${after.year} 年年報，第 ${causePage} 頁。管理層把經營現金流下跌歸因於應收貿易賬款增加，令更多現金佔用在營運資金。`,
    },
  },
];

export function financeDemoPages(scenario: FinanceDemoScenario): FinanceDemoSourcePage[] {
  if (scenario === 'scanned') return [];
  return financeDemoSourcePages.filter(page => scenario !== 'missing' || page.id !== 'demo-2025-explanation');
}

/** Prepared teaching content, not output from a converter running in this website. */
export function financeDemoPreparedMarkdown(scenario: FinanceDemoScenario): string {
  const pages = financeDemoPages(scenario);
  if (pages.length === 0) return '';
  return [
    '# DemoCo sample annual-report excerpts',
    '> Fictional teaching fixture. Prepared Markdown; no PDF conversion has run.',
    'Currency: HKD | Units: millions',
    ...pages.map(page => `## ${page.year} report, original page ${page.page}\n\n<!-- source: ${page.id} -->\n\n${page.text.en}`),
  ].join('\n\n');
}

export type FinanceDemoState =
  | { kind: 'choose' }
  | { kind: 'source'; scenario: FinanceDemoScenario }
  | { kind: 'review'; scenario: 'review' }
  | { kind: 'ocr-required'; scenario: 'scanned' }
  | { kind: 'rejected'; scenario: 'review' }
  | { kind: 'markdown'; scenario: ReadableScenario }
  | { kind: 'indexed'; scenario: ReadableScenario }
  | { kind: 'evidence'; scenario: ReadableScenario; question: FinanceDemoQuestion }
  | { kind: 'result'; scenario: ReadableScenario; question: FinanceDemoQuestion };

export type FinanceDemoAction =
  | { type: 'select'; scenario: FinanceDemoScenario }
  | { type: 'convert' }
  | { type: 'approve-review' }
  | { type: 'reject-review' }
  | { type: 'index' }
  | { type: 'ask'; question: FinanceDemoQuestion }
  | { type: 'validate' }
  | { type: 'restart' };

export const initialFinanceDemo: FinanceDemoState = { kind: 'choose' };

export function financeDemoReducer(state: FinanceDemoState, action: FinanceDemoAction): FinanceDemoState {
  switch (action.type) {
    case 'select': return { kind: 'source', scenario: action.scenario };
    case 'restart': return initialFinanceDemo;
    case 'convert': {
      if (state.kind !== 'source') return state;
      if (state.scenario === 'scanned') return { kind: 'ocr-required', scenario: 'scanned' };
      if (state.scenario === 'review') return { kind: 'review', scenario: 'review' };
      return { kind: 'markdown', scenario: state.scenario };
    }
    case 'approve-review': return state.kind === 'review' ? { kind: 'markdown', scenario: 'review' } : state;
    case 'reject-review': return state.kind === 'review' ? { kind: 'rejected', scenario: 'review' } : state;
    case 'index': return state.kind === 'markdown' ? { kind: 'indexed', scenario: state.scenario } : state;
    case 'ask': return state.kind === 'indexed' || state.kind === 'evidence' || state.kind === 'result'
      ? { kind: 'evidence', scenario: state.scenario, question: action.question }
      : state;
    case 'validate': return state.kind === 'evidence'
      ? { kind: 'result', scenario: state.scenario, question: state.question }
      : state;
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

export function financeDemoEvidence(scenario: FinanceDemoScenario, question: FinanceDemoQuestion): FinanceDemoSourcePage[] {
  return financeDemoPages(scenario).filter(page => question === 'cashflow-reason' || page.id !== 'demo-2025-explanation');
}

export function financeDemoAnalysis(scenario: ReadableScenario, question: FinanceDemoQuestion): {
  kind: 'supported' | 'partial';
  body: Copy;
  calculation: string;
  before: number;
  after: number;
  changePercent: number;
  evidence: FinanceDemoSourcePage[];
} {
  const changePercent = (after.amount - before.amount) / before.amount * 100;
  const numericAnswer: Copy = {
    en: `Operating cash flow fell from HKD${before.amount} million in ${before.year} [${before.year} p.${before.page}] to HKD${after.amount} million in ${after.year} [${after.year} p.${after.page}], a change of ${changePercent}%.`,
    zh: `經營現金流由 ${before.year} 年的 ${before.amount} 百萬港元 [${before.year} p.${before.page}]，下跌至 ${after.year} 年的 ${after.amount} 百萬港元 [${after.year} p.${after.page}]，變動為 ${changePercent}%。`,
  };
  const missingCause = scenario === 'missing' && question === 'cashflow-reason';
  const explanation: Copy = question === 'cashflow-change' ? { en: '', zh: '' } : missingCause ? {
    en: 'The supplied pages do not explain the cause. The figures support the decline, but the available evidence cannot establish why it happened.',
    zh: '提供的頁面沒有解釋原因。數字能支持現金流下跌，但現有證據不足以判斷成因。',
  } : {
    en: `The fictional management commentary attributes the decline to increased trade receivables tying up cash in working capital [${after.year} p.${causePage}].`,
    zh: `虛構管理層說明把下跌歸因於應收貿易賬款增加，令更多現金佔用在營運資金 [${after.year} p.${causePage}]。`,
  };
  return {
    kind: missingCause ? 'partial' : 'supported',
    body: { en: [numericAnswer.en, explanation.en].filter(Boolean).join('\n\n'), zh: [numericAnswer.zh, explanation.zh].filter(Boolean).join('\n\n') },
    calculation: `(${after.amount} - ${before.amount}) / ${before.amount} × 100 = ${changePercent}%`,
    before: before.amount,
    after: after.amount,
    changePercent,
    evidence: financeDemoEvidence(scenario, question),
  };
}

export function financeDemoExport(state: Extract<FinanceDemoState, { kind: 'result' }>, lang: Lang): string {
  const analysis = financeDemoAnalysis(state.scenario, state.question);
  const question = financeDemoQuestions.find(item => item.id === state.question);
  const title = lang === 'zh' ? 'DemoCo 虛構分析範例' : 'DemoCo fictional sample analysis';
  const notice = lang === 'zh'
    ? '離線教學範例。公司、數字、頁碼及來源內容均為虛構。此網站沒有上載或轉換 PDF，亦沒有呼叫模型。'
    : 'Offline teaching example. The company, figures, page numbers and source content are fictional. This website has not uploaded or converted a PDF or called a model.';
  const review = state.scenario === 'review' ? lang === 'zh'
    ? '覆核範例：模擬覆核者核對原文後採用 80 百萬港元。這不是實際權限或審批服務。'
    : 'Review example: a simulated reviewer checked the prepared source and accepted HKD80 million. This is not a running authorization or approval service.' : '';
  return [
    `# ${title}`,
    `> ${notice}`,
    `${lang === 'zh' ? '結果' : 'Result'}: ${analysis.kind}`,
    `${lang === 'zh' ? '來源貨幣及單位' : 'Source currency and units'}: ${pick(units, lang)}`,
    `## ${lang === 'zh' ? '問題' : 'Question'}\n\n${question ? pick(question.title, lang) : state.question}`,
    `## ${lang === 'zh' ? '答案' : 'Answer'}\n\n${pick(analysis.body, lang)}`,
    `## ${lang === 'zh' ? '計算' : 'Calculation'}\n\n${analysis.calculation}`,
    review,
    `## ${lang === 'zh' ? '準備的來源證據' : 'Prepared source evidence'}`,
    ...analysis.evidence.map(page => `### ${page.year} p.${page.page} · ${pick(page.title, lang)}\n\nSource ID: ${page.id}\n\n${pick(page.text, lang)}`),
  ].filter(Boolean).join('\n\n') + '\n';
}
