from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import unquote, urlsplit

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from backend.config import Settings, get_settings
from backend.database import get_db
from backend.models import Edition, EditionMembership, Session, User


password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def new_session(db: DBSession, user: User, request: Request, settings: Settings | None = None) -> tuple[Session, str]:
    settings = settings or get_settings()
    raw = secrets.token_urlsafe(48)
    now = datetime.now(timezone.utc)
    row = Session(
        user_id=user.id,
        token_hash=token_digest(raw),
        created_at=now,
        last_seen_at=now,
        expires_at=now + timedelta(days=settings.session_ttl_days),
        ip_address=request.client.host if request.client else None,
        user_agent=(request.headers.get("user-agent") or "")[:512] or None,
    )
    db.add(row)
    db.flush()
    return row, raw


def session_from_request(request: Request, db: DBSession) -> Session | None:
    raw = request.cookies.get("memora_session")
    if not raw:
        return None
    row = db.scalar(select(Session).where(Session.token_hash == token_digest(raw)))
    now = datetime.now(timezone.utc)
    if not row or row.revoked_at is not None or as_utc(row.expires_at) <= now or not row.user.is_active:
        return None
    row.last_seen_at = now
    return row


def as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


async def require_user(request: Request, db: DBSession = Depends(get_db)) -> User:
    session = session_from_request(request, db)
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"code": "authentication_required", "message": "Authentication required"})
    return session.user


async def get_optional_user(request: Request, db: DBSession = Depends(get_db)) -> User | None:
    session = session_from_request(request, db)
    return session.user if session else None


def require_edition_membership(
    edition_slug: str,
    user: User,
    db: DBSession,
    *,
    writable: bool = False,
) -> tuple[Edition, EditionMembership]:
    edition = db.scalar(select(Edition).where(Edition.slug == edition_slug))
    if not edition:
        raise HTTPException(status_code=404, detail={"code": "edition_not_found", "message": "Edition not found"})
    membership = db.scalar(select(EditionMembership).where(EditionMembership.edition_id == edition.id, EditionMembership.user_id == user.id))
    if not membership or (writable and membership.role not in {"owner", "manager", "editor"}):
        raise HTTPException(status_code=403, detail={"code": "edition_forbidden", "message": "You cannot access this edition"})
    return edition, membership


def safe_return_url(value: str | None, default: str = "/memora-id.html") -> str:
    if not value:
        return default
    decoded = unquote(value)
    if "\\" in decoded or decoded.startswith("//") or any(ord(ch) < 32 for ch in decoded):
        return default
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc or not value.startswith("/") or value.startswith("//"):
        return default
    segments = unquote(parsed.path).split("/")
    if any(segment in {".", ".."} for segment in segments):
        return default
    return value


def csrf_matches(request: Request) -> bool:
    cookie = request.cookies.get("memora_csrf", "")
    header = request.headers.get("x-csrf-token", "")
    return bool(cookie and header and hmac.compare_digest(cookie, header))
