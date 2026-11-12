import json
import math
import unittest
from datetime import datetime, timezone
from pathlib import Path

from fastapi.testclient import TestClient
from jsonschema import Draft202012Validator, FormatChecker
from pydantic import ValidationError
from mcp.types import CallToolResult, TextContent

from integrations.yfinance.api import create_app
from integrations.yfinance.client import ProviderFailure, parse_provider_result
from integrations.yfinance.models import NewsRequest, normalize_news, normalize_quote

NOW = datetime(2026, 11, 12, 15, tzinfo=timezone.utc)
NEWS = {"symbol": "MSFT", "articles": [{"title": "Fictional cloud update", "publisher": "Fixture",
        "link": "https://example.com/story?utm_source=feed&story=1#top", "summary": "Fictional excerpt.",
        "publishedAt": "2026-11-12T14:00:00Z"}]}


class AdapterTests(unittest.TestCase):
    def test_mcp_rate_limit_errors_remain_retryable_in_both_error_formats(self):
        for result in [
            CallToolResult(isError=True, content=[TextContent(type="text", text="Too Many Requests. Rate limited.")]),
            CallToolResult(content=[TextContent(type="text", text='{"error":"HTTP 429"}')]),
        ]:
            with self.assertRaises(ProviderFailure) as raised:
                parse_provider_result(result)
            self.assertEqual(raised.exception.http_status, 429)
            self.assertTrue(raised.exception.retryable)
        data = parse_provider_result(CallToolResult(content=[TextContent(type="text", text='{"title":"429 stories"}')]))
        self.assertEqual(data, {"title": "429 stories"})

    def test_schema_examples_and_normalized_deduplication(self):
        raw = {**NEWS, "articles": NEWS["articles"] * 2}
        result = normalize_news(raw, NewsRequest(symbol="MSFT"), NOW)
        self.assertEqual(len(result.articles), 1)
        self.assertEqual(str(result.articles[0].canonical_url), "https://example.com/story?story=1")
        revised = {**NEWS, "articles": [{**NEWS["articles"][0], "summary": "A revision."}]}
        new = normalize_news(revised, NewsRequest(symbol="MSFT"), NOW)
        self.assertEqual(result.articles[0].article_id, new.articles[0].article_id)
        self.assertNotEqual(result.articles[0].excerpt_hash, new.articles[0].excerpt_hash)
        self.validate("news-response", result.model_dump(mode="json"))

    def test_whitespace_changes_do_not_create_false_revisions(self):
        spaced = {**NEWS, "articles": [{**NEWS["articles"][0],
                                       "title": "  Fictional   cloud update\n",
                                       "summary": "  Fictional excerpt.\n"}]}
        original = normalize_news(NEWS, NewsRequest(symbol="MSFT"), NOW)
        normalized = normalize_news(spaced, NewsRequest(symbol="MSFT"), NOW)
        self.assertEqual(original.articles[0].excerpt_hash, normalized.articles[0].excerpt_hash)

    def test_empty_news_and_malformed_news_are_different(self):
        result = normalize_news({"symbol": "MSFT", "articles": []}, NewsRequest(symbol="MSFT"), NOW)
        self.assertEqual(result.status, "empty")
        for raw in [{"symbol": "MSFT"}, {**NEWS, "symbol": "AAPL"},
                    {**NEWS, "articles": [{"title": "bad", "link": "file:///private"}]}]:
            with self.assertRaises((ValueError, ValidationError)):
                normalize_news(raw, NewsRequest(symbol="MSFT"), NOW)

    def test_quote_uses_matching_market_price_and_time(self):
        result = normalize_quote({"symbol": "MSFT", "currentPrice": 123, "regularMarketPrice": 120,
                                  "regularMarketTime": int(NOW.timestamp()) - 60,
                                  "previousClose": 100, "currency": "USD"}, "MSFT", NOW)
        self.assertEqual(result.price, 120)
        self.assertEqual(result.change_percent, 20)
        self.assertEqual(result.timestamp_status, "provided")
        self.assertEqual(result.delay_status, "unknown")
        self.validate("quote-response", result.model_dump(mode="json"))

    def test_quote_does_not_invent_currency_time_or_price(self):
        result = normalize_quote({"symbol": "MSFT", "currentPrice": 120,
                                  "regularMarketTime": int(NOW.timestamp())}, "MSFT", NOW)
        self.assertIsNone(result.market_timestamp)
        self.assertIsNone(result.currency)
        for value in [0, -1, math.inf, math.nan, None]:
            with self.assertRaises((ValueError, ValidationError)):
                normalize_quote({"symbol": "MSFT", "currentPrice": value}, "MSFT", NOW)

    def test_http_auth_and_scope_are_checked_before_provider_calls(self):
        calls = []

        async def provider(tool, arguments):
            calls.append(tool)
            return NEWS

        with TestClient(create_app(token="fixture-token", caller=provider)) as client:
            self.assertEqual(client.post("/news", json={"symbol": "MSFT"}).status_code, 401)
            headers = {"X-YFinance-Token": "fixture-token"}
            self.assertEqual(client.post("/news", json={"symbol": "TSLA"}, headers=headers).status_code, 422)
            self.assertEqual(client.post("/news", json={"symbol": "MSFT", "max_items": 21}, headers=headers).status_code, 422)
            self.assertEqual(client.post("/news", json={"symbol": "MSFT", "max_items": True}, headers=headers).status_code, 422)
            self.assertEqual(calls, [])
            response = client.post("/news", json={"symbol": "MSFT"}, headers=headers)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(calls, ["tool_get_news"])

    def test_quote_http_response_matches_the_downloaded_contract(self):
        async def provider(tool, arguments):
            self.assertEqual(tool, "tool_get_stock_price")
            self.assertEqual(arguments, {"symbol": "NVDA"})
            return {"symbol": "NVDA", "regularMarketPrice": 123.45,
                    "regularMarketTime": int(datetime.now(timezone.utc).timestamp()) - 60, "currency": "USD"}

        with TestClient(create_app(token="fixture-token", caller=provider)) as client:
            response = client.post("/quote", json={"symbol": "NVDA"},
                                   headers={"X-YFinance-Token": "fixture-token"})
            self.assertEqual(response.status_code, 200)
            self.validate("quote-response", response.json())

    def test_http_returns_error_without_retrying_or_claiming_empty_news(self):
        calls = []

        async def limited(tool, arguments):
            calls.append(tool)
            raise ProviderFailure("provider_rate_limited", 429, True)

        with TestClient(create_app(token="fixture-token", caller=limited)) as client:
            response = client.post("/news", json={"symbol": "MSFT"}, headers={"X-YFinance-Token": "fixture-token"})
            self.assertEqual(response.status_code, 429)
            self.assertEqual(response.json()["detail"], {"code": "provider_rate_limited", "retryable": True})
            self.validate("error-response", response.json())
            self.assertEqual(calls, ["tool_get_news"])

    def validate(self, name, value):
        path = Path(__file__).resolve().parents[3] / "public/downloads/yfinance" / (name + ".schema.json")
        schema = json.loads(path.read_text())
        Draft202012Validator(schema, format_checker=FormatChecker()).validate(value)


if __name__ == "__main__":
    unittest.main()
