"""Application contracts. Provider JSON is parsed and normalized at this boundary."""
import hashlib
import json
import re
from datetime import datetime, timezone
from typing import Literal
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import (AwareDatetime, BaseModel, ConfigDict, Field, FiniteFloat,
                      HttpUrl, PositiveFloat)

Symbol = Literal["MSFT", "AAPL", "NVDA"]


class NewsRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    symbol: Symbol
    max_items: int = Field(default=5, ge=1, le=20, strict=True)


class QuoteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    symbol: Symbol


class RawArticle(BaseModel):
    title: str = Field(min_length=1)
    link: HttpUrl
    publisher: str | None = None
    summary: str | None = None
    publishedAt: AwareDatetime | None = None


class RawNews(BaseModel):
    symbol: Symbol
    articles: list[RawArticle]


class Article(BaseModel):
    model_config = ConfigDict(extra="forbid")
    article_id: str
    canonical_url: HttpUrl
    title: str
    publisher: str | None
    summary: str | None
    published_at: AwareDatetime | None
    excerpt_hash: str


class NewsResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: Literal["1.0"] = "1.0"
    provider: Literal["yfinance"] = "yfinance"
    symbol: Symbol
    status: Literal["ok", "empty"]
    fetched_at: AwareDatetime
    articles: list[Article]


class AdapterErrorDetail(BaseModel):
    model_config = ConfigDict(extra="forbid")
    code: str
    retryable: bool


class AdapterError(BaseModel):
    model_config = ConfigDict(extra="forbid")
    detail: AdapterErrorDetail


class RawQuote(BaseModel):
    symbol: Symbol
    currentPrice: FiniteFloat | None = None
    regularMarketPrice: FiniteFloat | None = None
    regularMarketTime: int | None = None
    regularMarketPreviousClose: FiniteFloat | None = None
    previousClose: FiniteFloat | None = None
    currency: str | None = None
    exchange: str | None = None
    marketState: str | None = None
    exchangeTimezoneName: str | None = None


class QuoteResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: Literal["1.0"] = "1.0"
    provider: Literal["yfinance"] = "yfinance"
    symbol: Symbol
    price: PositiveFloat
    currency: str | None
    exchange: str | None
    price_basis: Literal["regularMarketPrice", "currentPrice"]
    market_timestamp: AwareDatetime | None
    timestamp_status: Literal["provided", "not_provided"]
    fetched_at: AwareDatetime
    market_state: str | None
    exchange_timezone: str | None
    previous_close: FiniteFloat | None
    change: FiniteFloat | None
    change_percent: FiniteFloat | None
    delay_status: Literal["unknown"] = "unknown"


def canonical_url(url: str) -> str:
    parts = urlsplit(url)
    query = [(key, value) for key, value in parse_qsl(parts.query, keep_blank_values=True)
             if not key.lower().startswith("utm_") and key.lower() not in {"gclid", "fbclid"}]
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), parts.path,
                       urlencode(sorted(query)), ""))


def normalize_news(payload: object, request: NewsRequest, fetched_at: datetime) -> NewsResponse:
    raw = RawNews.model_validate(payload)
    if raw.symbol != request.symbol:
        raise ValueError("Provider returned the wrong symbol")
    articles = []
    seen = set()
    for item in raw.articles[:request.max_items]:
        url = canonical_url(str(item.link))
        title = re.sub(r"\s+", " ", item.title).strip()
        if not title:
            raise ValueError("Provider returned an empty title")
        summary = re.sub(r"\s+", " ", item.summary).strip() if item.summary else None
        excerpt = json.dumps([title, summary], ensure_ascii=False, separators=(",", ":"))
        digest = hashlib.sha256(excerpt.encode()).hexdigest()
        identity = hashlib.sha256(url.encode()).hexdigest()
        if (identity, digest) in seen:
            continue
        seen.add((identity, digest))
        articles.append(Article(article_id=identity, canonical_url=url, title=title,
                                publisher=item.publisher, summary=summary,
                                published_at=item.publishedAt, excerpt_hash=digest))
    return NewsResponse(symbol=request.symbol, status="ok" if articles else "empty",
                        fetched_at=fetched_at, articles=articles)


def normalize_quote(payload: object, symbol: Symbol, fetched_at: datetime) -> QuoteResponse:
    raw = RawQuote.model_validate(payload)
    if raw.symbol != symbol:
        raise ValueError("Provider returned the wrong symbol")
    # Match regular-session price to regular-session time. A fallback price has unknown time.
    has_regular_price = raw.regularMarketPrice is not None
    price = raw.regularMarketPrice if has_regular_price else raw.currentPrice
    if price is None or price <= 0:
        raise ValueError("Provider returned no positive latest price")
    timestamp = None
    if has_regular_price and raw.regularMarketTime is not None and raw.regularMarketTime > 0:
        timestamp = datetime.fromtimestamp(raw.regularMarketTime, timezone.utc)
        if timestamp > fetched_at:
            raise ValueError("Provider quote time is in the future")
    previous = raw.regularMarketPreviousClose
    if previous is None:
        previous = raw.previousClose
    change = price - previous if previous is not None and previous > 0 else None
    return QuoteResponse(
        symbol=symbol, price=price, currency=raw.currency, exchange=raw.exchange,
        price_basis="regularMarketPrice" if has_regular_price else "currentPrice",
        market_timestamp=timestamp, timestamp_status="provided" if timestamp else "not_provided",
        fetched_at=fetched_at, market_state=raw.marketState,
        exchange_timezone=raw.exchangeTimezoneName, previous_close=previous,
        change=change, change_percent=(change / previous * 100) if change is not None else None,
    )
