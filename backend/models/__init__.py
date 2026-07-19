from __future__ import annotations

import enum
import uuid
from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import JSON, Boolean, CheckConstraint, Date, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


def uuid4() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Role(str, enum.Enum):
    owner = "owner"
    manager = "manager"
    editor = "editor"
    viewer = "viewer"


class TokenStatus(str, enum.Enum):
    available = "available"
    sold = "sold"
    active = "active"
    disabled = "disabled"


class AssetRole(str, enum.Enum):
    edition_cover = "edition_cover"
    edition_tile = "edition_tile"
    title_logo = "title_logo"
    card_front = "card_front"
    card_back = "card_back"
    wallpaper = "wallpaper"
    illustrator_avatar = "illustrator_avatar"
    manager_avatar = "manager_avatar"
    hero_image = "hero_image"
    profile_image = "profile_image"
    product_image = "product_image"
    capsule_image = "capsule_image"


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(160))
    avatar_url: Mapped[str | None] = mapped_column(String(2048))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    oauth_accounts: Mapped[list[OAuthAccount]] = relationship(back_populates="user", cascade="all, delete-orphan")
    password_credential: Mapped[PasswordCredential | None] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")


class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"
    __table_args__ = (UniqueConstraint("provider", "provider_subject", name="uq_oauth_provider_subject"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid4)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    provider: Mapped[str] = mapped_column(String(50))
    provider_subject: Mapped[str] = mapped_column(String(255))
    provider_username: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    user: Mapped[User] = relationship(back_populates="oauth_accounts")


class PasswordCredential(Base):
    __tablename__ = "password_credentials"
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    password_hash: Mapped[str] = mapped_column(String(512))
    password_changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    user: Mapped[User] = relationship(back_populates="password_credential")


class Session(Base):
    __tablename__ = "sessions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid4)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ip_address: Mapped[str | None] = mapped_column(String(64))
    user_agent: Mapped[str | None] = mapped_column(String(512))
    user: Mapped[User] = relationship()


class Edition(Base):
    __tablename__ = "editions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid4)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    module: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), default="ativa")
    token_code: Mapped[str] = mapped_column(String(30))
    token_total: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[int] = mapped_column(Integer)
    public_page: Mapped[str] = mapped_column(String(255))
    manager_page: Mapped[str] = mapped_column(String(255))
    configuration: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class EditionMembership(Base):
    __tablename__ = "edition_memberships"
    __table_args__ = (
        UniqueConstraint("edition_id", "user_id", name="uq_edition_membership"),
        CheckConstraint("role IN ('owner','manager','editor','viewer')", name="ck_edition_membership_role"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid4)
    edition_id: Mapped[str] = mapped_column(ForeignKey("editions.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    edition: Mapped[Edition] = relationship()
    user: Mapped[User] = relationship()


class Token(Base):
    __tablename__ = "tokens"
    __table_args__ = (CheckConstraint("status IN ('available','sold','active','disabled')", name="ck_token_status"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid4)
    edition_id: Mapped[str] = mapped_column(ForeignKey("editions.id", ondelete="CASCADE"), index=True)
    serial: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(20), default=TokenStatus.available.value)
    owner_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    activated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    edition: Mapped[Edition] = relationship()


class DifusoraPost(Base):
    __tablename__ = "difusora_posts"
    __table_args__ = (UniqueConstraint("edition_id", "legacy_id", name="uq_difusora_legacy"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid4)
    edition_id: Mapped[str] = mapped_column(ForeignKey("editions.id", ondelete="CASCADE"), index=True)
    author_user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    text: Mapped[str] = mapped_column(String(1000))
    tag: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    legacy_id: Mapped[str | None] = mapped_column(String(255))
    author: Mapped[User] = relationship()


class MediaAsset(Base):
    __tablename__ = "media_assets"
    __table_args__ = (
        UniqueConstraint("edition_id", "role", "legacy_id", name="uq_media_legacy"),
        CheckConstraint(
            "role IN ('edition_cover','edition_tile','title_logo','card_front','card_back','wallpaper','illustrator_avatar','manager_avatar','hero_image','profile_image','product_image','capsule_image')",
            name="ck_media_asset_role",
        ),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid4)
    edition_id: Mapped[str] = mapped_column(ForeignKey("editions.id", ondelete="CASCADE"), index=True)
    created_by_user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    role: Mapped[str] = mapped_column(String(40), index=True)
    storage_path: Mapped[str] = mapped_column(String(1024), unique=True)
    original_filename: Mapped[str] = mapped_column(String(255))
    public_filename: Mapped[str] = mapped_column(String(255))
    mime_type: Mapped[str] = mapped_column(String(100))
    content_sha256: Mapped[str] = mapped_column(String(64))
    width: Mapped[int | None] = mapped_column(Integer)
    height: Mapped[int | None] = mapped_column(Integer)
    size_bytes: Mapped[int] = mapped_column(Integer)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    legacy_id: Mapped[str | None] = mapped_column(String(255))
    edition: Mapped[Edition] = relationship()


Index(
    "uq_media_active_public_filename",
    MediaAsset.edition_id,
    MediaAsset.public_filename,
    unique=True,
    sqlite_where=text("deleted_at IS NULL"),
    postgresql_where=text("deleted_at IS NULL"),
)
Index(
    "uq_media_active_single_role",
    MediaAsset.edition_id,
    MediaAsset.role,
    unique=True,
    sqlite_where=text("deleted_at IS NULL AND role NOT IN ('wallpaper','product_image','capsule_image')"),
    postgresql_where=text("deleted_at IS NULL AND role NOT IN ('wallpaper','product_image','capsule_image')"),
)


class CapsuleEntry(Base):
    __tablename__ = "capsule_entries"
    __table_args__ = (UniqueConstraint("edition_id", "legacy_id", name="uq_capsule_legacy"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid4)
    edition_id: Mapped[str] = mapped_column(ForeignKey("editions.id", ondelete="CASCADE"), index=True)
    author_user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    text: Mapped[str] = mapped_column(String(1000))
    event_date: Mapped[date] = mapped_column(Date)
    image_asset_id: Mapped[str | None] = mapped_column(ForeignKey("media_assets.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    legacy_id: Mapped[str | None] = mapped_column(String(255))
    author: Mapped[User] = relationship()
    image_asset: Mapped[MediaAsset | None] = relationship()


class OAuthLoginTransaction(Base):
    __tablename__ = "oauth_login_transactions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid4)
    state_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    next_url: Mapped[str] = mapped_column(String(2048), default="/memora-id.html")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
