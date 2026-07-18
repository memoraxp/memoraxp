from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import DifusoraPost, Token, User
from backend.schemas import TokenActivate, UserOut
from backend.security import require_user

router = APIRouter(prefix="/api", tags=["collector"])


@router.get("/me")
async def me(user: User = Depends(require_user)):
    return UserOut.model_validate(user)


@router.get("/me/dashboard")
async def dashboard(user: User = Depends(require_user), db: Session = Depends(get_db)):
    tokens = db.scalars(select(Token).where(Token.owner_user_id == user.id).order_by(Token.activated_at.desc())).all()
    edition_ids = [token.edition_id for token in tokens]
    edition_slugs = {token.edition_id: token.edition.slug for token in tokens}
    posts = db.scalars(select(DifusoraPost).where(DifusoraPost.edition_id.in_(edition_ids), DifusoraPost.deleted_at.is_(None)).order_by(DifusoraPost.created_at.desc()).limit(50)).all() if edition_ids else []
    return {
        "profile": UserOut.model_validate(user),
        "stats": {"tokens": len(tokens), "xp": 0, "memories": 0, "events": 0},
        "tokens": [{"id": token.id, "serial": token.serial, "status": token.status, "activated_at": token.activated_at, "edition": {"slug": token.edition.slug, "name": token.edition.name, "public_page": token.edition.public_page, "image": token.edition.configuration.get("tile") or token.edition.configuration.get("image")}} for token in tokens],
        "difusora": [{"id": post.id, "author": post.author.display_name, "text": post.text, "tag": post.tag, "created_at": post.created_at, "edition_slug": edition_slugs.get(post.edition_id)} for post in posts],
        "updates": [],
    }


@router.post("/tokens/activate")
async def activate_token(payload: TokenActivate, user: User = Depends(require_user), db: Session = Depends(get_db)):
    token = db.scalar(select(Token).where(Token.serial == payload.serial.strip()).with_for_update())
    if not token:
        raise HTTPException(status_code=404, detail={"code": "token_not_found", "message": "Token not found"})
    if token.status == "disabled":
        raise HTTPException(status_code=409, detail={"code": "token_disabled", "message": "Token is disabled"})
    if token.owner_user_id:
        code = "token_already_owned" if token.owner_user_id != user.id else "token_already_active"
        raise HTTPException(status_code=409, detail={"code": code, "message": "Token has already been activated"})
    if token.status not in {"available", "sold"}:
        raise HTTPException(status_code=409, detail={"code": "token_not_activatable", "message": "Token cannot be activated"})
    token.owner_user_id = user.id
    token.status = "active"
    token.activated_at = datetime.now(timezone.utc)
    db.commit()
    return {"id": token.id, "serial": token.serial, "status": token.status, "edition_slug": token.edition.slug}
