from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ManagerLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=1024)
    next: str | None = None


class DifusoraCreate(BaseModel):
    text: str = Field(min_length=1, max_length=180)
    tag: str | None = Field(default=None, max_length=100)
    legacy_id: str | None = Field(default=None, max_length=255)


class TokenActivate(BaseModel):
    serial: str = Field(min_length=1, max_length=100)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    display_name: str
    avatar_url: str | None


class EditionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    name: str
    module: str
    status: str
    token_code: str
    token_total: int
    unit_price: int
    public_page: str
    manager_page: str
    configuration: dict[str, Any]


class PostOut(BaseModel):
    id: str
    text: str
    tag: str | None
    author: str
    created_at: datetime
    legacy_id: str | None = None
    duplicate: bool = False


class CapsuleOut(BaseModel):
    id: str
    text: str
    event_date: date
    author: str
    image_url: str | None
    created_at: datetime
    legacy_id: str | None = None
    duplicate: bool = False


class AssetOut(BaseModel):
    id: str
    edition_slug: str
    role: str
    public_filename: str
    url: str
    mime_type: str
    width: int | None
    height: int | None
    size_bytes: int
    sort_order: int
    legacy_id: str | None = None
    duplicate: bool = False
