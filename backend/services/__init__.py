from __future__ import annotations

import os
import hashlib
import re
import secrets
from io import BytesIO
from pathlib import Path
from urllib.parse import quote

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from backend.config import Settings
from backend.models import CapsuleEntry, Edition, MediaAsset, User
from backend.schemas import CapsuleOut


ALLOWED_IMAGES = {"image/jpeg": ("JPEG", ".jpg"), "image/png": ("PNG", ".png"), "image/webp": ("WEBP", ".webp")}
ALLOWED_ROLES = {
    "edition_cover", "edition_tile", "title_logo", "card_front", "card_back",
    "wallpaper", "illustrator_avatar", "manager_avatar", "hero_image", "profile_image",
    "product_image", "capsule_image",
}
SINGLE_ASSET_ROLES = ALLOWED_ROLES - {"wallpaper", "product_image", "capsule_image"}
EDITION_SLUG_PATTERN = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")
PUBLIC_FILENAME_PATTERN = re.compile(r"[A-Za-z0-9][A-Za-z0-9._ ()-]{0,254}\Z")


async def persist_image(
    upload: UploadFile,
    edition: Edition,
    user: User,
    role: str,
    db: Session,
    settings: Settings,
    *,
    sort_order: int = 0,
    legacy_id: str | None = None,
    public_filename: str | None = None,
) -> MediaAsset:
    if role not in ALLOWED_ROLES:
        raise HTTPException(status_code=422, detail={"code": "invalid_asset_role", "message": "Unsupported asset role"})
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
            width, height = image.size
            image.verify()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(status_code=422, detail={"code": "invalid_image", "message": "File contents are not a valid image"}) from None
    if actual != expected_format:
        raise HTTPException(status_code=422, detail={"code": "image_type_mismatch", "message": "Declared and detected image formats differ"})

    public_filename = public_filename or Path(upload.filename or f"asset{extension}").name
    if not valid_public_filename(public_filename):
        raise HTTPException(status_code=422, detail={"code": "invalid_public_filename", "message": "Invalid public asset filename"})

    target_dir = (settings.upload_root / edition.slug / role).resolve()
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
            role=role,
            storage_path=relative,
            original_filename=Path(upload.filename or "upload").name[:255],
            public_filename=public_filename,
            mime_type=declared,
            content_sha256=hashlib.sha256(data).hexdigest(),
            width=width,
            height=height,
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
    if not asset or asset.deleted_at:
        return None
    filename = quote(asset.public_filename, safe="")
    return f"/assets/{asset.edition.slug}/{filename}?v={asset.content_sha256}"


def valid_edition_slug(value: str) -> bool:
    return bool(EDITION_SLUG_PATTERN.fullmatch(value))


def valid_public_filename(value: str) -> bool:
    return (
        bool(PUBLIC_FILENAME_PATTERN.fullmatch(value))
        and value not in {".", ".."}
        and "%" not in value
        and "/" not in value
        and "\\" not in value
        and not any(ord(character) < 32 or ord(character) == 127 for character in value)
    )


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
        image_url=asset_url(row.image_asset),
        created_at=row.created_at,
        legacy_id=row.legacy_id,
        duplicate=duplicate,
    )
