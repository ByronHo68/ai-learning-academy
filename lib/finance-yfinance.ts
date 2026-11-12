import type { Copy } from './curriculum';

const t = (en: string, zh: string): Copy => ({ en, zh });

export const yfinanceDecision = t(
  'Use ranaroussi/yfinance as the underlying Python data library. The selected YFinance MCP server wraps it with discoverable tools. This app adds a private HTTP adapter so deterministic n8n HTTP Request nodes can call the stdio server and receive validated JSON. n8n owns provider retries.',
  '以 ranaroussi/yfinance 作底層 Python 資料擷取函式庫。所選 YFinance MCP server 包裝成可發現工具；app 加入私人 HTTP adapter，讓固定 n8n HTTP Request 節點呼叫 stdio server，取得已驗證 JSON。供應商重試由 n8n 控制。',
);

export const yfinanceSetup = [
  t('Install the pinned Python requirements in integrations/yfinance/.venv. Copy .env.example to .env.local and set YFINANCE_BRIDGE_TOKEN. Run the discovery command to inspect the selected tool schemas.', '在 integrations/yfinance/.venv 安裝固定 Python 依賴；複製 .env.example 至 .env.local，設定 YFINANCE_BRIDGE_TOKEN。先執行發現命令查看工具 schema。'),
  t('Start the private adapter on port 8002. In n8n, create a Header Auth credential named X-YFinance-Token. POST validated company arguments to /news or /quote. For Dockerized n8n, use an adapter service on the same private network and its service hostname.', '在 8002 啟動私人 adapter；n8n 建立 X-YFinance-Token Header Auth 憑證。將已驗證公司參數 POST 至 /news 或 /quote。n8n 若在 Docker，adapter 服務應在相同私人網絡，以服務名稱連接。'),
  t('Keep the existing refresh_company_news workflow contract. Inside it, call /news, validate its response, deduplicate and commit evidence in PostgreSQL, then return the acquisition receipt. Request /quote separately when the report needs price context, and store its timestamped observation ID in the snapshot.', '保留 refresh_company_news 流程合約，內部呼叫 /news、驗證回傳、去重並提交 PostgreSQL，最後交回擷取紀錄。報告需要價格時另行呼叫 /quote，將有時間戳的觀察 ID 保存至快照。'),
  t('Use one adapter call per n8n attempt. Route errors by retryable and remaining time. HTTP 401/422 stops, while retryable 429/503/504 follows the existing bounded n8n retry loop. Daily macro/geopolitical sources and versioned company profiles continue through their own acquisition paths.', '每次 n8n 嘗試只呼叫 adapter 一次；按 retryable 及餘下時間路由。HTTP 401／422 停止，可重試 429／503／504 沿用有限 n8n 回圈；每日宏觀／地緣及版本化公司背景使用各自擷取路徑。'),
];

export const yfinanceCommands = `# From the academy repository root; Python 3.13 was verified.
python3.13 -m venv integrations/yfinance/.venv
source integrations/yfinance/.venv/bin/activate
python -m pip install -r integrations/yfinance/requirements.txt
cp integrations/yfinance/.env.example integrations/yfinance/.env.local
# Edit .env.local and choose your service secret.
python -m integrations.yfinance.client discover
python -m uvicorn integrations.yfinance.api:app --env-file integrations/yfinance/.env.local --host 127.0.0.1 --port 8002`;

export const yfinanceNewsExample = JSON.stringify({
  schema_version: '1.0', provider: 'yfinance', symbol: 'MSFT', status: 'ok', fetched_at: '2026-11-12T03:00:00Z',
  articles: [{ article_id: 'fictional-url-hash', canonical_url: 'https://example.com/fictional-news', title: 'Fictional cloud update', publisher: 'Fixture publisher', summary: 'A fictional excerpt for schema illustration.', published_at: '2026-11-12T02:00:00Z', excerpt_hash: 'fictional-content-hash' }],
}, null, 2);

export const yfinanceQuoteExample = JSON.stringify({
  schema_version: '1.0', provider: 'yfinance', symbol: 'MSFT', price: 123.45, currency: 'USD', exchange: 'NMS',
  price_basis: 'regularMarketPrice', market_timestamp: '2026-11-11T21:00:00Z', timestamp_status: 'provided',
  fetched_at: '2026-11-12T03:00:00Z', market_state: 'POST', exchange_timezone: 'America/New_York',
  previous_close: 120, change: 3.45, change_percent: 2.875, delay_status: 'unknown',
}, null, 2);

export const yfinanceContracts = [
  { file: 'mcp-tools.json', label: t('Discovered MCP input/output schemas', '已發現 MCP 輸入／輸出 schemas') },
  { file: 'news-request.schema.json', label: t('News request schema', '新聞要求 schema') },
  { file: 'news-response.schema.json', label: t('News response schema', '新聞回應 schema') },
  { file: 'quote-request.schema.json', label: t('Quote request schema', '報價要求 schema') },
  { file: 'quote-response.schema.json', label: t('Quote response schema', '報價回應 schema') },
  { file: 'error-response.schema.json', label: t('Operational error schema', '運作錯誤 schema') },
];

export const yfinanceReferences = [
  { title: 'ranaroussi/yfinance', url: 'https://github.com/ranaroussi/yfinance' },
  { title: 'Pinned YFinance MCP wrapper', url: 'https://github.com/rizkydwicmt/yfinance-mcp-server/tree/5132e8de707435e715f4c1a89058cc0e9cac3d7b' },
  { title: 'yfinance news reference', url: 'https://ranaroussi.github.io/yfinance/reference/api/yfinance.Ticker.get_news.html' },
];
