from __future__ import annotations

from datetime import date, datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.config import Settings, settings_dependency
from backend.database import get_db
from backend.models import CapsuleEntry, DifusoraPost, EditionMembership, MediaAsset, Token, User
from backend.routers.public import asset_out, post_out
from backend.schemas import DifusoraCreate
from backend.security import require_edition_membership, require_user
from backend.services import ALLOWED_ROLES, SINGLE_ASSET_ROLES, capsule_out, get_capsule_entries, persist_image

router = APIRouter(prefix="/api/manager", tags=["manager"])


@router.get("/editions")
async def manager_editions(user: User = Depends(require_user), db: Session = Depends(get_db)):
    memberships = db.scalars(select(EditionMembership).where(EditionMembership.user_id == user.id).order_by(EditionMembership.created_at)).all()
    return [{"slug": item.edition.slug, "name": item.edition.name, "role": item.role, "manager_page": item.edition.manager_page, "public_page": item.edition.public_page, "module": item.edition.module, "status": item.edition.status} for item in memberships]


@router.get("/editions/{edition_slug}/dashboard")
async def edition_dashboard(edition_slug: str, user: User = Depends(require_user), db: Session = Depends(get_db)):
    edition, membership = require_edition_membership(edition_slug, user, db)
    counts = dict(db.execute(select(Token.status, func.count(Token.id)).where(Token.edition_id == edition.id).group_by(Token.status)).all())
    posts = db.scalars(select(DifusoraPost).where(DifusoraPost.edition_id == edition.id, DifusoraPost.deleted_at.is_(None)).order_by(DifusoraPost.created_at.desc())).all()
    entries = get_capsule_entries(db, edition.id)
    assets = db.scalars(select(MediaAsset).where(MediaAsset.edition_id == edition.id, MediaAsset.deleted_at.is_(None), MediaAsset.role != "capsule_image").order_by(MediaAsset.role, MediaAsset.sort_order)).all()
    return {
        "edition": {"slug": edition.slug, "name": edition.name, "module": edition.module, "status": edition.status, "token_code": edition.token_code, "token_total": edition.token_total, "unit_price": edition.unit_price, "public_page": edition.public_page, "manager_page": edition.manager_page, "configuration": edition.configuration},
        "role": membership.role,
        "profile": {"id": user.id, "email": user.email, "display_name": user.display_name, "avatar_url": user.avatar_url},
        "token_counts": {key: counts.get(key, 0) for key in ("available", "sold", "active", "disabled")},
        "difusora": [post_out(row) for row in posts],
        "capsule": [capsule_out(row) for row in entries],
        "assets": [asset_out(row) for row in assets],
        "analytics_notice": "Configuration analytics are seed/demo placeholders, not operational reporting.",
    }


@router.post("/editions/{edition_slug}/difusora", status_code=201)
async def create_post(payload: DifusoraCreate, edition_slug: str, user: User = Depends(require_user), db: Session = Depends(get_db)):
    edition, _ = require_edition_membership(edition_slug, user, db, writable=True)
    if payload.legacy_id:
        existing = db.scalar(select(DifusoraPost).where(DifusoraPost.edition_id == edition.id, DifusoraPost.legacy_id == payload.legacy_id))
        if existing:
            return post_out(existing, duplicate=True)
    row = DifusoraPost(edition_id=edition.id, author_user_id=user.id, text=payload.text.strip(), tag=payload.tag, legacy_id=payload.legacy_id)
    db.add(row); db.commit(); db.refresh(row)
    return post_out(row)


@router.delete("/editions/{edition_slug}/difusora/{post_id}")
async def delete_post(edition_slug: str, post_id: str, user: User = Depends(require_user), db: Session = Depends(get_db)):
    edition, _ = require_edition_membership(edition_slug, user, db, writable=True)
    row = db.scalar(select(DifusoraPost).where(DifusoraPost.id == post_id, DifusoraPost.edition_id == edition.id, DifusoraPost.deleted_at.is_(None)))
    if not row:
        raise HTTPException(status_code=404, detail={"code": "post_not_found", "message": "Post not found"})
    row.deleted_at = datetime.now(timezone.utc); db.commit()
    return {"ok": True}


@router.post("/editions/{edition_slug}/capsule", status_code=201)
async def create_capsule(
    edition_slug: str,
    response: Response,
    text: str = Form(min_length=1, max_length=1000),
    event_date: date = Form(),
    legacy_id: str | None = Form(default=None, max_length=255),
    image: UploadFile | None = File(default=None),
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
    settings: Settings = Depends(settings_dependency),
):
    edition, _ = require_edition_membership(edition_slug, user, db, writable=True)
    if legacy_id:
        existing = db.scalar(select(CapsuleEntry).where(CapsuleEntry.edition_id == edition.id, CapsuleEntry.legacy_id == legacy_id))
        if existing:
            if existing.deleted_at is not None:
                raise HTTPException(status_code=409, detail={"code": "capsule_legacy_deleted", "message": "A deleted timeline entry already uses this legacy ID"})
            response.status_code = 200
            return capsule_out(existing, duplicate=True)
    if image and image.filename:
        public_filename = Path(image.filename).name
        filename_conflict = db.scalar(
            select(MediaAsset).where(
                MediaAsset.edition_id == edition.id,
                MediaAsset.public_filename == public_filename,
                MediaAsset.deleted_at.is_(None),
            )
        )
        if filename_conflict:
            raise HTTPException(status_code=409, detail={"code": "public_filename_conflict", "message": "An active asset already uses this public filename"})
    asset = await persist_image(image, edition, user, "capsule_image", db, settings, legacy_id=f"{legacy_id}:image" if legacy_id else None) if image and image.filename else None
    row = CapsuleEntry(edition_id=edition.id, author_user_id=user.id, text=text.strip(), event_date=event_date, image_asset_id=asset.id if asset else None, legacy_id=legacy_id)
    db.add(row)
    try:
        db.commit()
    except Exception:
        db.rollback()
        if asset:
            (settings.upload_root / asset.storage_path).unlink(missing_ok=True)
        raise
    db.refresh(row)
    return capsule_out(row)


@router.delete("/editions/{edition_slug}/capsule/{entry_id}")
async def delete_capsule(edition_slug: str, entry_id: str, user: User = Depends(require_user), db: Session = Depends(get_db)):
    edition, _ = require_edition_membership(edition_slug, user, db, writable=True)
    row = db.scalar(select(CapsuleEntry).where(CapsuleEntry.id == entry_id, CapsuleEntry.edition_id == edition.id, CapsuleEntry.deleted_at.is_(None)))
    if not row:
        raise HTTPException(status_code=404, detail={"code": "capsule_entry_not_found", "message": "Capsule entry not found"})
    row.deleted_at = datetime.now(timezone.utc); db.commit()
    return {"ok": True}


@router.put("/editions/{edition_slug}/assets/{role}", status_code=201)
async def put_asset(
    edition_slug: str,
    role: str,
    file: UploadFile = File(),
    sort_order: int = Form(default=0, ge=0, le=10000),
    legacy_id: str | None = Form(default=None, max_length=255),
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
    settings: Settings = Depends(settings_dependency),
):
    edition, _ = require_edition_membership(edition_slug, user, db, writable=True)
    if role not in ALLOWED_ROLES or role == "capsule_image":
        raise HTTPException(status_code=422, detail={"code": "invalid_asset_role", "message": "Unsupported asset role"})
    if legacy_id:
        existing = db.scalar(select(MediaAsset).where(MediaAsset.edition_id == edition.id, MediaAsset.role == role, MediaAsset.legacy_id == legacy_id))
        if existing:
            return asset_out(existing, duplicate=True)
    previous = []
    if role in SINGLE_ASSET_ROLES:
        previous = db.scalars(select(MediaAsset).where(MediaAsset.edition_id == edition.id, MediaAsset.role == role, MediaAsset.deleted_at.is_(None))).all()
        for old in previous:
            old.deleted_at = datetime.now(timezone.utc)
    stable_filename = previous[0].public_filename if previous else None
    candidate_filename = stable_filename or Path(file.filename or "asset").name
    filename_conflict = db.scalar(
        select(MediaAsset).where(
            MediaAsset.edition_id == edition.id,
            MediaAsset.public_filename == candidate_filename,
            MediaAsset.deleted_at.is_(None),
        )
    )
    if filename_conflict and filename_conflict not in previous:
        raise HTTPException(status_code=409, detail={"code": "public_filename_conflict", "message": "An active asset already uses this public filename"})
    row = await persist_image(file, edition, user, role, db, settings, sort_order=sort_order, legacy_id=legacy_id, public_filename=stable_filename)
    try:
        db.commit()
    except Exception:
        db.rollback()
        (settings.upload_root / row.storage_path).unlink(missing_ok=True)
        raise
    db.refresh(row)
    return asset_out(row)


@router.delete("/editions/{edition_slug}/assets/{asset_id}")
async def delete_asset(edition_slug: str, asset_id: str, user: User = Depends(require_user), db: Session = Depends(get_db), settings: Settings = Depends(settings_dependency)):
    edition, _ = require_edition_membership(edition_slug, user, db, writable=True)
    row = db.scalar(select(MediaAsset).where(MediaAsset.id == asset_id, MediaAsset.edition_id == edition.id, MediaAsset.deleted_at.is_(None)))
    if not row:
        raise HTTPException(status_code=404, detail={"code": "asset_not_found", "message": "Asset not found"})
    row.deleted_at = datetime.now(timezone.utc); db.commit()
    path = (settings.upload_root / row.storage_path).resolve()
    if settings.upload_root.resolve() in path.parents:
        path.unlink(missing_ok=True)
    return {"ok": True}
