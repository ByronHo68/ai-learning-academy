"""Private HTTP adapter for deterministic n8n HTTP Request nodes."""
import asyncio
import os
import secrets
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import ValidationError

from .client import ProviderFailure, call_provider
from .models import NewsRequest, NewsResponse, QuoteRequest, QuoteResponse, normalize_news, normalize_quote


def create_app(token=None, caller=call_provider):
    @asynccontextmanager
    async def lifespan(app):
        app.state.token = token or os.environ.get("YFINANCE_BRIDGE_TOKEN")
        if not app.state.token:
            raise RuntimeError("Set YFINANCE_BRIDGE_TOKEN before starting the private adapter")
        yield

    app = FastAPI(title="Stock Research YFinance Adapter", version="1.0", lifespan=lifespan)
    # Bound subprocess creation while retaining an 8s total admission/call deadline.
    slots = asyncio.Semaphore(2)

    async def authorize(x_yfinance_token: str = Header(default="")):
        if not secrets.compare_digest(x_yfinance_token, app.state.token):
            raise HTTPException(401, detail={"code": "unauthorized", "retryable": False})

    async def fetch(tool, arguments, normalize):
        try:
            async with asyncio.timeout(8):
                async with slots:
                    payload = await caller(tool, arguments)
            return normalize(payload, datetime.now(timezone.utc))
        except TimeoutError:
            raise HTTPException(504, detail={"code": "provider_timeout", "retryable": True}) from None
        except ProviderFailure as error:
            raise HTTPException(error.http_status,
                                detail={"code": error.code, "retryable": error.retryable}) from None
        except (ValidationError, ValueError, OverflowError):
            raise HTTPException(502, detail={"code": "invalid_provider_response", "retryable": False}) from None

    @app.post("/news", response_model=NewsResponse, dependencies=[Depends(authorize)])
    async def news(request: NewsRequest):
        return await fetch("tool_get_news", request.model_dump(),
                           lambda payload, fetched: normalize_news(payload, request, fetched))

    @app.post("/quote", response_model=QuoteResponse, dependencies=[Depends(authorize)])
    async def quote(request: QuoteRequest):
        return await fetch("tool_get_stock_price", request.model_dump(),
                           lambda payload, fetched: normalize_quote(payload, request.symbol, fetched))

    return app


app = create_app()
