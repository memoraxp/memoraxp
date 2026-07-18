from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url


APPLICATION_ROOT = Path(__file__).resolve().parent.parent


def normalize_database_url(value: str, *, base_dir: Path = APPLICATION_ROOT) -> str:
    """Resolve SQLite files independently of the process working directory."""
    url = make_url(value)
    if not url.drivername.startswith("sqlite") or not url.database or url.database == ":memory:":
        return value
    database = Path(url.database)
    if not database.is_absolute():
        database = base_dir / database
    return url.set(database=str(database.resolve())).render_as_string(hide_password=False)


def sqlite_database_path(value: str) -> Path | None:
    url = make_url(normalize_database_url(value))
    if not url.drivername.startswith("sqlite") or not url.database or url.database == ":memory:":
        return None
    return Path(url.database).resolve()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=APPLICATION_ROOT / ".env", env_file_encoding="utf-8", extra="ignore")

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

    @field_validator("database_url", mode="after")
    @classmethod
    def resolve_database_url(cls, value: str) -> str:
        return normalize_database_url(value)

    @field_validator("upload_root", mode="after")
    @classmethod
    def resolve_upload_root(cls, value: Path) -> Path:
        return value.resolve() if value.is_absolute() else (APPLICATION_ROOT / value).resolve()

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


async def settings_dependency() -> Settings:
    """FastAPI dependency wrapper that avoids unnecessary worker threads."""
    return get_settings()
