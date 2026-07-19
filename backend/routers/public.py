from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import DifusoraPost, Edition, MediaAsset
from backend.schemas import AssetOut, CapsuleOut, EditionOut, PostOut
from backend.services import asset_url, capsule_out, get_capsule_entries

router = APIRouter(prefix="/api/editions", tags=["editions"])


def edition_or_404(db: Session, slug: str) -> Edition:
    edition = db.scalar(select(Edition).where(Edition.slug == slug))
    if not edition:
        raise HTTPException(status_code=404, detail={"code": "edition_not_found", "message": "Edition not found"})
    return edition


def post_out(row: DifusoraPost, *, duplicate: bool = False) -> PostOut:
    return PostOut(id=row.id, text=row.text, tag=row.tag, author=row.author.display_name, created_at=row.created_at, legacy_id=row.legacy_id, duplicate=duplicate)


def asset_out(row: MediaAsset, *, duplicate: bool = False) -> AssetOut:
    return AssetOut(
        id=row.id,
        edition_slug=row.edition.slug,
        role=row.role,
        public_filename=row.public_filename,
        url=asset_url(row) or "",
        mime_type=row.mime_type,
        width=row.width,
        height=row.height,
        size_bytes=row.size_bytes,
        sort_order=row.sort_order,
        legacy_id=row.legacy_id,
        duplicate=duplicate,
    )


@router.get("", response_model=list[EditionOut])
async def list_editions(db: Session = Depends(get_db)):
    return db.scalars(select(Edition).order_by(Edition.created_at)).all()


@router.get("/{edition_slug}", response_model=EditionOut)
async def get_edition(edition_slug: str, db: Session = Depends(get_db)):
    return edition_or_404(db, edition_slug)


@router.get("/{edition_slug}/difusora", response_model=list[PostOut])
async def get_difusora(edition_slug: str, db: Session = Depends(get_db)):
    edition = edition_or_404(db, edition_slug)
    rows = db.scalars(select(DifusoraPost).where(DifusoraPost.edition_id == edition.id, DifusoraPost.deleted_at.is_(None)).order_by(DifusoraPost.created_at.desc())).all()
    return [post_out(row) for row in rows]


@router.get("/{edition_slug}/capsule", response_model=list[CapsuleOut])
async def get_capsule(edition_slug: str, db: Session = Depends(get_db)):
    edition = edition_or_404(db, edition_slug)
    return [capsule_out(row) for row in get_capsule_entries(db, edition.id)]


@router.get("/{edition_slug}/assets", response_model=list[AssetOut])
async def get_assets(edition_slug: str, db: Session = Depends(get_db)):
    edition = edition_or_404(db, edition_slug)
    rows = db.scalars(select(MediaAsset).where(MediaAsset.edition_id == edition.id, MediaAsset.deleted_at.is_(None), MediaAsset.role != "capsule_image").order_by(MediaAsset.role, MediaAsset.sort_order, MediaAsset.created_at)).all()
    return [asset_out(row) for row in rows]
