from __future__ import annotations

import os
import secrets
from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from sqlalchemy.orm import Session

from backend.config import Settings
from backend.models import Edition, MediaAsset, User


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

