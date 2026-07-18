from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from authlib.integrations.requests_client import OAuth2Session
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.config import Settings, settings_dependency
from backend.database import get_db
from backend.models import EditionMembership, OAuthAccount, OAuthLoginTransaction, Session as LoginSession, User
from backend.schemas import ManagerLogin, UserOut
from backend.security import hash_password, new_session, safe_return_url, session_from_request, token_digest, verify_password

router = APIRouter(prefix="/api/auth", tags=["authentication"])
INVALID_LOGIN = {"code": "invalid_credentials", "message": "Invalid email or password"}
DUMMY_HASH = hash_password("not-a-real-manager-password")


def set_session_cookie(response: Response, token: str, settings: Settings) -> None:
    response.set_cookie("memora_session", token, max_age=settings.session_ttl_days * 86400, httponly=True, secure=settings.session_cookie_secure or settings.is_production, samesite="lax", path="/")


def user_payload(db: Session, user: User) -> dict:
    memberships = db.scalars(select(EditionMembership).where(EditionMembership.user_id == user.id)).all()
    return {
        "user": UserOut.model_validate(user).model_dump(),
        "editions": [
            {"slug": item.edition.slug, "name": item.edition.name, "role": item.role, "manager_page": item.edition.manager_page, "public_page": item.edition.public_page}
            for item in memberships
        ],
    }


@router.post("/manager/login")
async def manager_login(payload: ManagerLogin, request: Request, db: Session = Depends(get_db), settings: Settings = Depends(settings_dependency)):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    credential = user.password_credential if user else None
    valid = verify_password(credential.password_hash if credential else DUMMY_HASH, payload.password)
    memberships = db.scalars(select(EditionMembership).where(EditionMembership.user_id == user.id)).all() if user and valid else []
    if not user or not user.is_active or not credential or not valid or not memberships:
        raise HTTPException(status_code=401, detail=INVALID_LOGIN)
    user.last_login_at = datetime.now(timezone.utc)
    _, raw = new_session(db, user, request, settings)
    db.commit()
    response = JSONResponse(user_payload(db, user))
    set_session_cookie(response, raw, settings)
    return response


@router.post("/logout")
async def logout(request: Request, db: Session = Depends(get_db)):
    row = session_from_request(request, db)
    if row:
        row.revoked_at = datetime.now(timezone.utc)
        db.commit()
    response = JSONResponse({"ok": True})
    response.delete_cookie("memora_session", path="/")
    return response


@router.get("/me")
async def auth_me(request: Request, db: Session = Depends(get_db)):
    row = session_from_request(request, db)
    if not row:
        raise HTTPException(status_code=401, detail={"code": "authentication_required", "message": "Authentication required"})
    db.commit()
    return user_payload(db, row.user)


@router.get("/google/start")
async def google_start(next: str | None = None, db: Session = Depends(get_db), settings: Settings = Depends(settings_dependency)):
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=503, detail={"code": "google_oauth_not_configured", "message": "Google login is not configured for this environment"})
    state = secrets.token_urlsafe(40)
    transaction = OAuthLoginTransaction(state_hash=token_digest(state), next_url=safe_return_url(next), expires_at=datetime.now(timezone.utc) + timedelta(minutes=10))
    db.add(transaction)
    db.commit()
    client = OAuth2Session(settings.google_client_id, settings.google_client_secret, scope="openid email profile", redirect_uri=settings.google_redirect_uri)
    url, _ = client.create_authorization_url("https://accounts.google.com/o/oauth2/v2/auth", state=state, prompt="select_account")
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(request: Request, state: str = "", code: str = "", db: Session = Depends(get_db), settings: Settings = Depends(settings_dependency)):
    now = datetime.now(timezone.utc)
    transaction = db.scalar(select(OAuthLoginTransaction).where(OAuthLoginTransaction.state_hash == token_digest(state))) if state else None
    if not transaction or transaction.used_at is not None or transaction.expires_at.replace(tzinfo=transaction.expires_at.tzinfo or timezone.utc) <= now or not code:
        raise HTTPException(status_code=400, detail={"code": "invalid_oauth_callback", "message": "OAuth callback is invalid or expired"})
    transaction.used_at = now
    client = OAuth2Session(settings.google_client_id, settings.google_client_secret, scope="openid email profile", redirect_uri=settings.google_redirect_uri)
    try:
        client.fetch_token("https://oauth2.googleapis.com/token", code=code)
        profile_response = client.get("https://openidconnect.googleapis.com/v1/userinfo")
        profile_response.raise_for_status()
        profile = profile_response.json()
    except Exception:
        raise HTTPException(status_code=502, detail={"code": "oauth_provider_error", "message": "Google authentication could not be completed"}) from None
    subject, email = str(profile.get("sub", "")), str(profile.get("email", "")).lower()
    if not subject or not email or not profile.get("email_verified"):
        raise HTTPException(status_code=400, detail={"code": "invalid_google_identity", "message": "Google did not return a verified identity"})
    account = db.scalar(select(OAuthAccount).where(OAuthAccount.provider == "google", OAuthAccount.provider_subject == subject))
    user = account.user if account else db.scalar(select(User).where(User.email == email))
    if not user:
        user = User(email=email, display_name=str(profile.get("name") or email.split("@", 1)[0]), avatar_url=profile.get("picture"), last_login_at=now)
        db.add(user); db.flush()
    if not account:
        db.add(OAuthAccount(user_id=user.id, provider="google", provider_subject=subject, provider_username=email))
    user.display_name = str(profile.get("name") or user.display_name)
    user.avatar_url = profile.get("picture") or user.avatar_url
    user.last_login_at = now
    _, raw = new_session(db, user, request, settings)
    db.commit()
    response = RedirectResponse(safe_return_url(transaction.next_url))
    set_session_cookie(response, raw, settings)
    return response
