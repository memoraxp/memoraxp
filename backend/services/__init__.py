from __future__ import annotations

import os
import secrets
from io import BytesIO
from pathlib import Path
from urllib.parse import unquote, urlsplit

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from backend.config import Settings
from backend.models import CapsuleEntry, Edition, MediaAsset, User
from backend.schemas import CapsuleOut


ALLOWED_IMAGES = {"image/jpeg": ("JPEG", ".jpg"), "image/png": ("PNG", ".png"), "image/webp": ("WEBP", ".webp")}
ALLOWED_SLOTS = {"edition_cover", "card_front", "card_back", "wallpaper", "capsule_image"}


async def persist_image(
    upload: UploadFile,
    edition: Edition,
    user: User,
    slot: str,
    db: Session,
    settings: Settings,
    *,
    sort_order: int = 0,
    legacy_id: str | None = None,
) -> MediaAsset:
    if slot not in ALLOWED_SLOTS:
        raise HTTPException(status_code=422, detail={"code": "invalid_asset_slot", "message": "Unsupported asset slot"})
    declared = (upload.content_type or "").lower()
    if declared not in ALLOWED_IMAGES:
        raise HTTPException(status_code=415, detail={"code": "unsupported_image_type", "message": "Only JPEG, PNG and WebP images are accepted"})

    data = await upload.read(settings.max_upload_bytes + 1)
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail={"code": "upload_too_large", "message": "Image exceeds the upload limit"})
    if not data:
        raise HTTPException(status_code=422, detail={"code": "empty_upload", "message": "Image is empty"})

    expected_format, extension = ALLOWED_IMAGES[declared]
    try:
        with Image.open(BytesIO(data)) as image:
            actual = image.format
            image.verify()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(status_code=422, detail={"code": "invalid_image", "message": "File contents are not a valid image"}) from None
    if actual != expected_format:
        raise HTTPException(status_code=422, detail={"code": "image_type_mismatch", "message": "Declared and detected image formats differ"})

    target_dir = (settings.upload_root / edition.slug / slot).resolve()
    root = settings.upload_root.resolve()
    if root not in target_dir.parents:
        raise HTTPException(status_code=422, detail={"code": "invalid_upload_path", "message": "Invalid upload path"})
    target_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{secrets.token_hex(20)}{extension}"
    final_path = target_dir / filename
    temp_path = target_dir / f".{filename}.tmp"
    try:
        with temp_path.open("xb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_path, final_path)
        relative = final_path.relative_to(root).as_posix()
        row = MediaAsset(
            edition_id=edition.id,
            created_by_user_id=user.id,
            slot=slot,
            storage_path=relative,
            original_filename=Path(upload.filename or "upload").name[:255],
            mime_type=declared,
            size_bytes=len(data),
            sort_order=sort_order,
            legacy_id=legacy_id,
        )
        db.add(row)
        db.flush()
        return row
    except Exception:
        temp_path.unlink(missing_ok=True)
        final_path.unlink(missing_ok=True)
        raise


def asset_url(asset: MediaAsset | None) -> str | None:
    return f"/uploads/{asset.storage_path}" if asset and not asset.deleted_at else None


def validate_source_image_url(value: str) -> str:
    """Accept only local application paths for trusted server seed data."""
    decoded = value
    for _ in range(3):
        next_value = unquote(decoded)
        if next_value == decoded:
            break
        decoded = next_value
    parsed = urlsplit(decoded)
    if (
        not decoded.startswith("/")
        or decoded.startswith("//")
        or parsed.scheme
        or parsed.netloc
        or parsed.query
        or parsed.fragment
        or "\\" in decoded
        or any(ord(character) < 32 for character in decoded)
        or any(segment in {".", ".."} for segment in parsed.path.split("/"))
    ):
        raise ValueError(f"Unsafe source image URL: {value!r}")
    return value


def capsule_entries_query(edition_id: str):
    return (
        select(CapsuleEntry)
        .options(joinedload(CapsuleEntry.author), joinedload(CapsuleEntry.image_asset))
        .where(CapsuleEntry.edition_id == edition_id, CapsuleEntry.deleted_at.is_(None))
        .order_by(CapsuleEntry.event_date.desc(), CapsuleEntry.created_at.desc(), CapsuleEntry.id.desc())
    )


def get_capsule_entries(db: Session, edition_id: str) -> list[CapsuleEntry]:
    return list(db.scalars(capsule_entries_query(edition_id)).all())


def capsule_out(row: CapsuleEntry, *, duplicate: bool = False) -> CapsuleOut:
    return CapsuleOut(
        id=row.id,
        text=row.text,
        event_date=row.event_date,
        author=row.author.display_name,
        image_url=asset_url(row.image_asset) or row.source_image_url,
        created_at=row.created_at,
        legacy_id=row.legacy_id,
        duplicate=duplicate,
    )
