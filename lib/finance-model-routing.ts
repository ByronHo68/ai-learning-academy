import type { Copy } from './curriculum';

export type ModelTier = 'economy' | 'balanced' | 'deep';
export type ModelProvider = 'openai' | 'deepseek';
export type EvidenceState = 'available' | 'missing' | 'conflicting';
export type RoutingMode = 'auto' | ModelTier;
export type ModelRoutingInput = {
  prompt: string;
  provider: ModelProvider;
  budget: ModelTier;
  evidence: EvidenceState;
  mode: RoutingMode;
};
export type ModelRoutingDecision =
  | { kind: 'clarify' | 'blocked'; reason: Copy }
  | { kind: 'code'; reason: Copy; task: Copy }
  | { kind: 'model'; reason: Copy; tier: ModelTier; modelId: string; needsEvidence: boolean };

const tierOrder: Record<ModelTier, number> = { economy: 0, balanced: 1, deep: 2 };
const modelIds: Record<ModelProvider, Record<ModelTier, string>> = {
  openai: { economy: 'gpt-6-luna', balanced: 'gpt-6.1-sol', deep: 'gpt-6-astra' },
  deepseek: { economy: 'deepseek-flash', balanced: 'deepseek-flash', deep: 'deepseek-v4-pro' },
};

const explanation = /\b(why|explain|interpret|justify|cause|reason|analyse|analyze|assess|evaluate|recommend|compare|translat\w*|summari[sz]e)\b|為何|为什么|為什麼|原因|解釋|解释|分析|評估|评估|總結|总结|建議|建议|比較|比较|翻譯|翻译/i;
const complex = /\b(reconcil\w*|restat\w*|conflict\w*|contradict\w*|multi[- ]?year|multi[- ]?company|cross[- ]?company|accounting treatment|accounting policy|consolidat\w*|impairment)\b|重列|重述|對賬|对账|調節|调节|矛盾|衝突|冲突|跨公司|多間公司|多家公司|多年|會計政策|会计政策|會計處理|会计处理|減值|减值/i;
const financialContext = /\b(reports?|annual|company|companies|revenue|profit|cash[-\s]*flow|financial|margin|asset|liabilit\w*|statements?|earnings|debt|figures?|citations?|evidence)\b|財報|财报|年報|年报|公司|收入|利潤|利润|盈利|現金流|现金流|財務|财务|資產|资产|負債|负债|報表|报表|證據|证据|引用|數字|数字/i;
const definition = /^(?:what (?:is|are)|define|explain (?:the meaning of|what)|give (?:a|me a) (?:short )?definition)\b|^(?:甚麼是|什麼是|什么是|解釋甚麼是|解释什么是|定義|定义)/i;
const transformation = /\b(translat\w*|classify|label|rewrite|shorten|summari[sz]e (?:this (?:paragraph|text)|the (?:provided|following)))\b|翻譯|翻译|分類|分类|標籤|标签|改寫|改写|縮短|缩短|總結(?:這段|以下|提供)|总结(?:这段|以下|提供)/i;
const additionalAnalysis = /\b(?:and|also|then)\b.*\b(?:explain|analyse|analyze|compare|reconcil\w*|assess|verify|why)\b|\bwhy\b|(?:並|并|再|及).*(?:分析|解釋|解释|比較|比较|對賬|对账|核對|核对)|為何|为什么|為什麼|原因/i;

// This deterministic teaching demo never calls a provider or claims semantic understanding.
export function routeFinancePrompt(input: ModelRoutingInput): ModelRoutingDecision {
  const prompt = input.prompt.trim();
  if (!prompt) return { kind: 'clarify', reason: { en: 'Enter a task first. The demo needs a prompt to illustrate routing.', zh: '先輸入任務，示範才能說明如何選擇處理路徑。' } };
  if (prompt.length > 4000) return { kind: 'clarify', reason: { en: 'Use a prompt of at most 4,000 characters for this small routing demo. Production routing must measure the complete context separately.', zh: '此簡單示範請使用最多 4,000 字元；正式系統須另行量度完整上下文。' } };

  const hasExplanation = explanation.test(prompt);
  const isPureCalculation = /^(?:calculate|compute|work out)\b|^(?:計算|计算)/i.test(prompt) && !hasExplanation && !complex.test(prompt);
  const isPureLookup = /^(?:show|list|fetch|look up|open)\b|^(?:顯示|显示|列出|查找|開啟|开启)/i.test(prompt)
    && /\b(reviewed|verified|accepted|saved|source page|citation)\b|已覆核|已核對|已核对|已驗證|已验证|已儲存|已储存|來源頁|来源页|引用/i.test(prompt)
    && !hasExplanation && !complex.test(prompt);
  if (isPureCalculation || isPureLookup) {
    const hasLiteralCalculation = /\bfrom\s+[-+]?\d[\d,.]*\s+to\s+[-+]?\d|\d[\d,.]*\s*[+*/×÷]\s*\d|\d[\d,.]*\s*(?:變成|变成|減去|减去|加上|乘以|除以)\s*\d/i.test(prompt);
    const referencesYears = /\b(?:19|20)\d{2}\b/.test(prompt);
    if (input.evidence !== 'available' && (isPureLookup || !hasLiteralCalculation || referencesYears)) {
      return { kind: 'blocked', reason: { en: 'Load and review the required facts first. A calculator or database query cannot resolve missing or conflicting source values.', zh: '先讀取及覆核所需數據；計算器或資料庫查詢不能解決缺失或矛盾的來源數值。' } };
    }
    return {
      kind: 'code',
      task: isPureCalculation ? { en: 'Provided or reviewed inputs → compatibility rules → Python Decimal → result', zh: '已提供或覆核輸入 → 相容規則 → Python Decimal → 結果' } : { en: 'Authorization → stored facts or citation → database/file read', zh: '權限核對 → 已存數據或引用 → 資料庫／檔案讀取' },
      reason: { en: 'This looks like a narrow calculation or saved-data lookup. Use deterministic code; choosing a model in the prompt does not make an LLM necessary. The result still needs input and access checks.', zh: '這看來是單純計算或已存資料查詢，使用確定性程式即可；提示提到模型不代表需要 LLM，結果仍須核對輸入及權限。' },
    };
  }

  const isDefinition = definition.test(prompt) && !additionalAnalysis.test(prompt) && !/\b(our|this company|these companies|fell|fall|declin\w*|increas\w*)\b|本公司|這間公司|这家公司|下跌|下降|上升/i.test(prompt);
  const isTransformation = transformation.test(prompt) && !additionalAnalysis.test(prompt);
  const hasSeveralCompanies = /\b(?:compare|between|across)\b.*\b(?:companies|firms|businesses)\b|比較.*(?:公司|企業)|比较.*(?:公司|企业)/i.test(prompt);
  const hasSeveralYears = /\b(?:compare|across|over)\b.*\b(?:years|periods)\b|比較.*(?:年|期)|比较.*(?:年|期)/i.test(prompt);
  const hasComplexAnalysis = !isDefinition && !isTransformation && (complex.test(prompt) || hasSeveralCompanies || hasSeveralYears);
  const needsEvidence = !isDefinition && !isTransformation && (financialContext.test(prompt) || hasComplexAnalysis);
  if (needsEvidence && input.evidence === 'missing') {
    return { kind: 'blocked', reason: { en: 'Retrieve and check the selected report evidence first, or return an explicit insufficient-evidence result. A stronger model cannot supply missing source facts or invent a cause.', zh: '先檢索及核對選定財報證據，或明確回傳證據不足；更強模型不能補出缺失來源數據或編造原因。' } };
  }

  const requiredTier: ModelTier = hasComplexAnalysis || (needsEvidence && input.evidence === 'conflicting')
    ? 'deep' : isDefinition || isTransformation ? 'economy' : 'balanced';
  if (!needsEvidence && !isDefinition && !isTransformation && requiredTier !== 'deep' && !hasExplanation) {
    return { kind: 'clarify', reason: { en: 'This keyword demo cannot identify the task reliably. Specify whether you want a definition, a provided-text summary, a cited report explanation, or a comparison. Production routing needs validated task classification.', zh: '此關鍵詞示範不能可靠辨認任務；請說明要定義、提供文字的摘要、附引用財報解釋，或比較。正式路由須驗證任務分類。' } };
  }
  const tier = input.mode === 'auto' ? requiredTier : input.mode;
  if (tierOrder[tier] < tierOrder[requiredTier]) {
    return { kind: 'blocked', reason: { en: 'The selected tier is below this demo’s task requirement. Use automatic routing, select a suitable tier, or narrow the task; do not silently lower the quality requirement.', zh: '所選級別低於此示範判定的任務需要；改用自動路由、選擇合適級別或縮小任務，不能暗中降低品質要求。' } };
  }
  if (tierOrder[tier] > tierOrder[input.budget]) {
    return { kind: 'blocked', reason: { en: 'The required or explicitly selected tier exceeds the allowed budget. Ask the owner to change the cap or narrow the task. Prompt text cannot authorize extra spending or a different provider.', zh: '所需或明確選定級別超出預算上限；由擁有者更改上限或縮小任務。提示文字不能授權額外支出或更換供應商。' } };
  }
  const reason: Copy = needsEvidence && input.evidence === 'conflicting'
    ? { en: 'Conflicting evidence calls for deeper reconciliation within the approved provider. Preserve both sources, flag unresolved claims and require human review where needed; escalation does not guarantee correctness.', zh: '矛盾證據需要在已准許供應商內作較深入核對；保留雙方來源、標示未解決主張，需要時交人工覆核，升級模型不保證正確。' }
    : tier === 'deep'
      ? { en: 'The task involves several sources, periods or accounting judgments, or the owner explicitly selected deeper reasoning. Use the approved deep tier, then verify arithmetic and every material citation.', zh: '任務涉及多個來源、期間或會計判斷，或擁有者明確選擇深入推理；使用已批准的深入級別，再驗證算術及重要引用。' }
      : tier === 'balanced'
        ? { en: 'A report explanation or owner-selected balanced run needs judgment across retrieved evidence. Start with the approved balanced model; validate sources and outputs before returning an answer.', zh: '財報解釋或擁有者選擇的平衡級別，需要對檢索證據作判斷；先用已批准平衡模型，回傳前驗證來源及輸出。' }
        : { en: 'A focused definition or text transformation is a candidate for the economy tier. Check that meaning, figures and source references are preserved; measure quality on your own examples.', zh: '簡單定義或文字轉換可先試經濟級別；核對語意、數字及來源參照有否保留，並以自己的案例評估品質。' };
  return { kind: 'model', tier, modelId: modelIds[input.provider][tier], needsEvidence, reason };
}
