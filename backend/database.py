from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    pass


def make_engine(url: str | None = None):
    database_url = url or get_settings().database_url
    kwargs = {"connect_args": {"check_same_thread": False}} if database_url.startswith("sqlite") else {}
    return create_engine(database_url, pool_pre_ping=True, **kwargs)


engine = make_engine()
SessionLocal = sessionmaker(bind=engine, class_=Session, expire_on_commit=False)


async def get_db() -> AsyncGenerator[Session, None]:
    with SessionLocal() as session:
        yield session
