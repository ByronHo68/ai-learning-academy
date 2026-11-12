"""Pinned upstream MCP server with quote-time fields retained in its JSON result."""
from yfinance_mcp.server import mcp
from yfinance_mcp.types import PRICE_FIELDS

# The pinned upstream tool reads this list when selecting fields from ticker.info.
# Keep the market price and its matching timestamp together for normalization.
for field in ("regularMarketPrice", "regularMarketTime", "regularMarketPreviousClose",
              "marketState", "exchangeTimezoneName"):
    if field not in PRICE_FIELDS:
        PRICE_FIELDS.append(field)

if __name__ == "__main__":
    mcp.run(transport="stdio")
