import asyncio
import hashlib
import hmac
import json
import httpx2
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client
from .config import Settings

TOOLS = {"get_account_summary", "list_transactions", "open_review_case"}


class BankClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def request(self, name: str | None, arguments: dict | None = None):
        async with httpx2.AsyncClient(
            headers={"Authorization": f"Bearer {self.settings.bank_api_token}"},
            timeout=20,
        ) as http:
            async with streamable_http_client(self.settings.bank_mcp_url, http_client=http) as streams:
                async with ClientSession(*streams, read_timeout_seconds=20) as client:
                    await client.initialize()
                    if name is None:
                        return [tool.name for tool in (await client.list_tools()).tools]
                    if name not in TOOLS:
                        raise ValueError("Tool is not allowed")
                    result = await client.call_tool(name, arguments)
                    if result.is_error:
                        raise ValueError("Bank rejected the tool request")
                    if result.structured_content is not None:
                        return result.structured_content
                    text = "".join(item.text for item in result.content if item.type == "text")
                    return json.loads(text)

    def call(self, name: str, arguments: dict):
        return asyncio.run(self.request(name, arguments))

    def list_tools(self) -> list[str]:
        return asyncio.run(self.request(None))

    def approval_proof(self, *, run_id: str, account_id: str, reason: str) -> str:
        payload = f"{run_id}\n{account_id}\n{reason}".encode()
        return hmac.new(self.settings.bank_approval_secret.encode(), payload, hashlib.sha256).hexdigest()
