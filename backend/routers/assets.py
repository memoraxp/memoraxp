from __future__ import annotations

import logging
import hashlib

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.config import Settings, settings_dependency
from backend.database import get_db
from backend.models import Edition, MediaAsset
from backend.services import valid_edition_slug, valid_public_filename


LOGGER = logging.getLogger("memora.assets")
router = APIRouter(tags=["assets"])


def _not_found(message: str) -> HTTPException:
    return HTTPException(status_code=404, detail={"code": "asset_not_found", "message": message})


def _etag_matches(header: str | None, etag: str) -> bool:
    if not header:
        return False
    return any(value.strip().removeprefix("W/") in {"*", etag} for value in header.split(","))


@router.get("/assets/{edition_slug}/{filename:path}", include_in_schema=True)
async def get_edition_asset(
    edition_slug: str,
    filename: str,
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(settings_dependency),
):
    if not valid_edition_slug(edition_slug) or not valid_public_filename(filename):
        LOGGER.warning("Rejected invalid edition asset path: edition=%r filename=%r", edition_slug, filename)
        raise _not_found("Edition asset not found")

    edition = db.scalar(select(Edition).where(Edition.slug == edition_slug))
    if not edition:
        LOGGER.info("Edition asset requested for unknown edition: %s", edition_slug)
        raise _not_found("Edition not found")
    asset = db.scalar(
        select(MediaAsset).where(
            MediaAsset.edition_id == edition.id,
            MediaAsset.public_filename == filename,
            MediaAsset.deleted_at.is_(None),
        )
    )
    if not asset:
        LOGGER.info("Missing active edition asset: edition=%s filename=%s", edition_slug, filename)
        raise _not_found("Edition asset not found")

    root = settings.upload_root.resolve()
    path = (root / asset.storage_path).resolve()
    if root not in path.parents or not path.is_file():
        LOGGER.error("Stored edition asset is unavailable: asset_id=%s storage_path=%r", asset.id, asset.storage_path)
        raise _not_found("Stored edition asset is unavailable")
    content = path.read_bytes()
    if len(content) != asset.size_bytes or hashlib.sha256(content).hexdigest() != asset.content_sha256:
        LOGGER.error("Stored edition asset failed integrity validation: asset_id=%s", asset.id)
        raise _not_found("Stored edition asset failed integrity validation")

    etag = f'"{asset.content_sha256}"'
    headers = {
        "ETag": etag,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": str(asset.size_bytes),
        "Content-Disposition": f'inline; filename="{asset.public_filename}"',
    }
    if _etag_matches(request.headers.get("if-none-match"), etag):
        return Response(status_code=304, headers={key: value for key, value in headers.items() if key != "Content-Length"})
    return Response(content=content, media_type=asset.mime_type, headers=headers)
