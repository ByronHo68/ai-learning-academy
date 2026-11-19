# Collect stock-research news with n8n

Import these workflows to collect company and shared economic news into PostgreSQL. Use your existing YFinance MCP server. The exports do not replace or launch another YFinance server.

The workflows are inactive templates. Local JavaScript and database checks are supplied. Import, credentials, your MCP tool schema, provider access, and live execution still need verification in your n8n instance. No news API or LLM requests are made when generating the exports.

## Run the offline example

1. In n8n, choose **Import from file**.
2. Import `workflows/00-offline-demo.json`.
3. Select **Execute workflow**.
4. Inspect **Validate three news items**. Its single output item contains `symbol: "MSFT"` and a `news` array with three fictional articles.

The example needs no credentials, MCP endpoint, PostgreSQL connection, or API key.

## Connect your own company-news tool

1. Use an n8n release that includes the standalone **MCP Client** node, version 1.1. These exports also use Code v2, HTTP Request v4.2, Postgres v2.6, and Wait v1.1. Check the imported nodes in your installed release. They have not been imported into a live n8n instance here.
2. Import `workflows/01-company-news.json`.
3. Open **Fetch own MCP**. Set **MCP Endpoint URL** to your server's Streamable HTTP endpoint. Use SSE instead if that is your server's supported network transport.
4. Select your n8n Header Auth credential, or change the authentication type to match your server. Keep secrets in credentials.
5. Select your actual news tool from the tool list. `REPLACE_WITH_YOUR_NEWS_TOOL` is a placeholder, not an assumed tool name.
6. Check the discovered input schema. The example sends `{"symbol":"MSFT","max_items":3}`. If your tool uses `ticker`, `limit`, or another argument, change **JSON** to those names. The response normalizer still uses your supplied `symbol` and `news` contract.
7. Complete the database setup below and select that credential in **Claim batch** and **Commit complete batch**.
8. From a parent workflow, add **Execute Sub-workflow**, select this workflow, and pass the object in `examples/company-request.json`. Restrict which workflows may call it in n8n settings.
9. Execute the parent. Inspect the committed receipt and its `version_ids`.

The input is one item, not three separate n8n items:

```json
{
  "symbol": "MSFT",
  "batch_key": "research-run-001:MSFT"
}
```

Keep `batch_key` unchanged when reconciling the same logical request. Use a new key for a new research run. The allowlist is MSFT, AAPL, and NVDA. Edit **Company request** if your supported companies differ. Send one company per sub-workflow execution.

Your response shape is supported directly, inside MCP `structuredContent`, or as JSON in one MCP text-content block:

```json
{
  "symbol": "MSFT",
  "news": [
    {
      "title": "Fictional company announcement",
      "summary": null,
      "publisher": "Demo publisher",
      "publishedAt": "2026-11-17T08:00:00Z",
      "url": "https://example.com/article",
      "content": "Fictional source excerpt."
    }
  ]
}
```

Use JSON `null`, not the string `"null"`. The four nullable fields must still be present. `title` and `content` must be strings. `publishedAt` must be a timezone-qualified ISO timestamp or null. The complete three-article fixture is `examples/company-news.json`.

The tool is asked for three articles. Validation sorts the returned articles newest first, removes duplicate canonical URLs within the response, and keeps at most three. Zero, one, or two articles remain valid results. The workflow never invents missing articles. Three returned articles do not establish comprehensive coverage.

The last node returns a storage receipt, not the original provider response. It includes the completed batch key, immutable version IDs, coverage limitation, commit timestamp, and new-version count. To inspect the normalized news array, open **Validate company news**. A repeated completed key returns its existing receipt without another MCP call.

If your MCP server supports only stdio, expose it through your own private HTTP MCP transport or a private HTTP bridge first. The standalone n8n MCP Client does not execute a local Python stdio command. A bridge's ordinary REST JSON response belongs in an HTTP Request node, not in the MCP Client node. This folder assumes network MCP and does not modify your server.

## Create the collection tables

1. Use a separate research database, not n8n's metadata database or LangGraph checkpoint database.
2. Run `schema.sql` once as the schema owner. PostgreSQL 14 or newer is required.
3. Create a dedicated ingestion role and grant the permissions described at the end of `schema.sql`.
4. Create an n8n Postgres credential for that role. Select it in both database nodes of each live workflow.
5. Run the company workflow twice with the same key. The second execution must return the existing status or receipt without fetching again.

The new `news_ingest` schema is independent of existing research tables. It is a collection staging schema. The app must explicitly validate and admit these versions into its evidence model before report retrieval. The tables do not automatically populate the academy's proposed research backend.

Both database nodes bind values through query parameters. Article text is never interpolated into SQL. `commit_batch` writes evidence versions, membership, the embedding outbox, and completion status atomically.

## Configure the daily shared-news job

1. Import `workflows/02-daily-context.json`.
2. Select the research Postgres credential in both database nodes.
3. Create an n8n Query Auth credential whose parameter name is `apikey` and whose value is your Alpha Vantage key.
4. Select that credential in each **Fetch** HTTP node. Confirm your account's NEWS_SENTIMENT access and request quota.
5. Check the workflow timezone. The schedule is 08:00 Asia/Hong_Kong, equivalent to UTC midnight.
6. Execute **Manual daily run** before enabling the schedule.
7. Verify that all three validators succeed and the final receipt says `completed`.
8. Enable the schedule after checking provider usage, data permissions, and your account's quota.

The job runs separate `economy_macro` and `economy_fiscal` queries, then a broad feed for geopolitical candidates. There is no invented `geopolitics` topic. The broad feed is stored as `broad_candidates`; classification and geopolitical coverage evaluation remain a downstream task. Add `economy_monetary` as a separate, budgeted query if you need explicit monetary-policy coverage.

Each query covers a fixed 48-hour window ending at UTC midnight on the job's date. The overlap helps catch some late articles. It does not guarantee recovery of articles published outside that window. The first successful run owns the daily key; manual runs on the same UTC date reconcile that run. An intentional backfill needs a new explicit window and key.

Each query requests the latest 100 results. A completed batch means all required queries validated, not that every published article was collected. Feed limits and broad-feed selection can omit news. Quota spacing is 65 seconds between queries; adjust it to your plan. All queries, backoff waits, and rate-limit waits share a nine-minute logical acquisition deadline. The workflow timeout is ten minutes.

Alpha Vantage summaries are stored as `content`. They are not represented as full article text. The workflow does not visit arbitrary article URLs.

## Check retries and interrupted batches

The explicit n8n loop allows at most three attempts per query. Automatic node retries are disabled. HTTP 429 and selected 5xx responses, plus recognized transient transport codes, can retry with 1-second then 2-second exponential backoff plus jitter. HTTP `Retry-After` can lengthen the wait if the remaining budget allows it. Authentication, malformed payloads, unknown errors, and HTTP-200 Alpha Vantage quota messages stop the run.

MCP errors vary by server and n8n version. Only recognized transport codes trigger retries. Unclassified MCP errors stop safely. Extend the classifier after capturing a sanitized error fixture from your own server. Never classify an article's text as a retry instruction.

The company flow has a 25-second logical budget and a 10-second tool-call timeout. Connection setup is also subject to n8n's outer 60-second workflow timeout; this template does not promise a hard 25-second wall-clock cancellation of MCP handshakes.

A unique batch claim prevents concurrent executions from fetching for the same key. If a process fails after claiming, its row remains `pending`; it cannot become a completed source or silently restart. Reconcile the original n8n execution before an operator chooses a new recovery key. Automatic stale-claim recovery and failure-status reconciliation are not implemented. Retain the pending record for investigation.

## Verify locally

Run these from the repository root:

```sh
python3 integrations/n8n_stock_news/build.py
node --test integrations/n8n_stock_news/tests/workflows.test.mjs
```

The builder regenerates all three JSON exports and the examples from source snippets. Review changes to the snippets before rebuilding.

For database behavior checks, install `@electric-sql/pglite` into a temporary folder and point `PGLITE_MODULE` at its `dist/index.js`:

```sh
npm install --prefix /tmp/finance-n8n-sql-check --no-audit --no-fund @electric-sql/pglite
PGLITE_MODULE=/tmp/finance-n8n-sql-check/node_modules/@electric-sql/pglite/dist/index.js \
  node integrations/n8n_stock_news/tests/database.mjs
```

PGlite runs real PostgreSQL engine code locally. These checks cover sequential claims, replay, versioning, rollback, topic links, and the outbox. Concurrent claims, live PostgreSQL credentials, n8n import/runtime behavior, MCP calls, quotas, and provider access still require live acceptance tests.

Read [DESIGN.md](DESIGN.md) for embedding, snapshots, profile updates, forecast horizons, and limitations.

Use the [Cursor application build plan](../../docs/CURSOR_STOCK_RESEARCH_BUILD_PLAN.md) to build the complete application stage by stage. It covers the research API, database admission, checkpoints, OpenRouter, review UI, evaluated retrieval, and release checks beyond these collection templates.

Use the [PostgreSQL and RAG setup](../stock_research_db/README.md) to take completed batches into source versions, searchable chunks, embeddings, and report snapshots.

## Official references

- [n8n standalone MCP Client](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcpclient/)
- [n8n Postgres query parameters](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/)
- [n8n sub-workflow trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflowtrigger/)
- [Alpha Vantage news parameters](https://www.alphavantage.co/documentation/#news-sentiment)
