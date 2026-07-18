from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    app_base_url: str = "http://127.0.0.1:8000"
    database_url: str = "sqlite:///./var/memora.db"
    session_cookie_secure: bool = False
    session_ttl_days: int = Field(default=30, ge=1, le=365)
    csrf_secret: str = ""
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://127.0.0.1:8000/api/auth/google/callback"
    max_upload_bytes: int = Field(default=10_485_760, ge=1024, le=52_428_800)
    upload_root: Path = Path("var/uploads")

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


async def settings_dependency() -> Settings:
    """FastAPI dependency wrapper that avoids unnecessary worker threads."""
    return get_settings()
