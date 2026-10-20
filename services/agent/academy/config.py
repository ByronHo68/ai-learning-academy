from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")
    lab_auth_token: str = Field(min_length=32)
    bank_api_token: str = Field(min_length=32)
    bank_approval_secret: str = Field(min_length=32)
    bank_mcp_url: str = "http://127.0.0.1:8081/mcp"
    agent_data_dir: Path = Path("data")
    model_api_key: str = ""
    model_base_url: str = "https://openrouter.ai/api/v1"
    model_name: str = ""
    model_input_usd_per_million: float | None = Field(default=None, ge=0)
    model_output_usd_per_million: float | None = Field(default=None, ge=0)
    langfuse_public_key: str = ""
    langfuse_secret_key: str = ""
    langfuse_base_url: str = "https://cloud.langfuse.com"

    @property
    def live_configured(self) -> bool:
        return bool(self.model_api_key and self.model_name)

    @property
    def tracing_configured(self) -> bool:
        return bool(self.langfuse_public_key and self.langfuse_secret_key)
