"""One MCP attempt per call. n8n owns retries and the overall execution receipt."""
import argparse
import asyncio
import json
import sys
from contextlib import asynccontextmanager
from dataclasses import dataclass
from datetime import timedelta
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp.types import CallToolResult

ROOT = Path(__file__).resolve().parents[2]
TOOLS = {"tool_get_news", "tool_get_stock_price"}


@dataclass
class ProviderFailure(Exception):
    code: str
    http_status: int
    retryable: bool


@asynccontextmanager
async def connect():
    parameters = StdioServerParameters(command=sys.executable,
                                      args=["-m", "integrations.yfinance.server"], cwd=str(ROOT))
    async with stdio_client(parameters) as (read, write):
        async with ClientSession(read, write, read_timeout_seconds=timedelta(seconds=8)) as session:
            await session.initialize()
            yield session


def leaves(error: BaseException):
    if isinstance(error, BaseExceptionGroup):
        for nested in error.exceptions:
            yield from leaves(nested)
    else:
        yield error


def parse_provider_result(result: CallToolResult) -> dict:
    text = "".join(block.text for block in result.content if block.type == "text")
    if result.isError:
        message = text.lower()
        if any(term in message for term in ("429", "too many requests", "rate limit")):
            raise ProviderFailure("provider_rate_limited", 429, True)
        raise ProviderFailure("mcp_tool_error", 502, False)
    payload = json.loads(text)
    if not isinstance(payload, dict):
        raise ProviderFailure("invalid_provider_response", 502, False)
    if "error" in payload:
        message = str(payload["error"]).lower()
        if any(term in message for term in ("429", "too many requests", "rate limit")):
            raise ProviderFailure("provider_rate_limited", 429, True)
        raise ProviderFailure("provider_error", 502, False)
    return payload


async def call_provider(name: str, arguments: dict) -> dict:
    if name not in TOOLS:
        raise ValueError("Tool is not allowed")
    try:
        async with asyncio.timeout(8):
            # A fresh process per HTTP attempt isolates a hung upstream session.
            async with connect() as session:
                tools = {tool.name: tool for tool in (await session.list_tools()).tools}
                if not TOOLS.issubset(tools):
                    raise ProviderFailure("tool_schema_mismatch", 502, False)
                properties = tools[name].inputSchema.get("properties", {})
                if not set(arguments).issubset(properties):
                    raise ProviderFailure("tool_schema_mismatch", 502, False)
                result = await session.call_tool(name, arguments)
                return parse_provider_result(result)
    except Exception as error:
        failures = list(leaves(error))
        for failure in failures:
            if isinstance(failure, ProviderFailure):
                raise failure from None
        if any(isinstance(failure, TimeoutError) for failure in failures):
            raise ProviderFailure("provider_timeout", 504, True) from None
        if any(isinstance(failure, (OSError, ConnectionError)) for failure in failures):
            raise ProviderFailure("transport_unavailable", 503, True) from None
        raise ProviderFailure("invalid_provider_response", 502, False) from None


async def discover():
    async with asyncio.timeout(15):
        async with connect() as session:
            tools = await session.list_tools()
            return {"upstream_commit": "5132e8de707435e715f4c1a89058cc0e9cac3d7b",
                    "tools": [tool.model_dump(mode="json") for tool in tools.tools if tool.name in TOOLS]}


async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["discover", "news", "quote"])
    parser.add_argument("--symbol", choices=["MSFT", "AAPL", "NVDA"], default="MSFT")
    args = parser.parse_args()
    if args.action == "discover":
        result = await discover()
    else:
        arguments = {"symbol": args.symbol}
        if args.action == "news":
            arguments["max_items"] = 5
        result = await call_provider("tool_get_news" if args.action == "news" else "tool_get_stock_price", arguments)
    print(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False))


if __name__ == "__main__":
    asyncio.run(main())
