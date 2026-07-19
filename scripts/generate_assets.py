"""Explicitly import repository edition artwork into authoritative asset storage.

This is a build/one-time migration command. Application startup never calls it.
Run Alembic first so the target database has the current asset schema.
"""

from __future__ import annotations

import hashlib
import shutil
from pathlib import Path

from PIL import Image
from sqlalchemy import select

from backend.config import APPLICATION_ROOT, get_settings
from backend.database import SessionLocal
from backend.models import CapsuleEntry, Edition, MediaAsset, User
from backend.seed_data import seed


SOURCE_ROOT = APPLICATION_ROOT / "assets"
ASSETS = {
    "aura": [
        ("edition_cover", "Capa.jpg", "Capa.jpg", 0),
        ("edition_tile", "MC1.png", "MC1.png", 0),
        ("title_logo", "Aura logo.png", "Aura logo.png", 0),
        ("card_front", "WP04.png", "aura-card-front.png", 0),
        ("card_back", "WP03.png", "aura-card-back.png", 0),
        ("wallpaper", "WP03.png", "WP03.png", 0),
        ("wallpaper", "WP04.png", "WP04.png", 1),
        ("illustrator_avatar", "avatareldon.png", "avatareldon.png", 0),
        ("hero_image", "aura-memora.png", "aura-memora.png", 0),
        ("profile_image", "gregg-mervine.jpg", "gregg-mervine.jpg", 0),
        ("product_image", "Caneca 03.png", "Caneca 03.png", 0),
        ("product_image", "Caneca 04.png", "Caneca 04.png", 1),
    ],
    "distance": [
        ("edition_cover", "capadistance.png", "capadistance.png", 0),
        ("edition_tile", "MC2.png", "MC2.png", 0),
        ("title_logo", "distance.png", "distance.png", 0),
        ("card_front", "distance-card-front.png", "distance-card-front.png", 0),
        ("card_back", "distance-card-back.png", "distance-card-back.png", 0),
        ("wallpaper", "WP01.png", "WP01.png", 0),
        ("wallpaper", "WP02.png", "WP02.png", 1),
        ("illustrator_avatar", "avatareldon.png", "avatareldon.png", 0),
        ("hero_image", "m2.png", "m2.png", 0),
        ("profile_image", "gregg-mervine.jpg", "gregg-mervine.jpg", 0),
        ("product_image", "Caneca 07.png", "Caneca 07.png", 0),
        ("product_image", "Caneca 08.png", "Caneca 08.png", 1),
    ],
    "fourkaos": [
        ("edition_cover", "fourkaos-background.jpg", "fourkaos-background.jpg", 0),
        ("edition_tile", "MC3.png", "MC3.png", 0),
        ("title_logo", "LOGO FOURKAOS.png", "LOGO FOURKAOS.png", 0),
        ("card_front", "WP07.png", "fourkaos-card-front.png", 0),
        ("card_back", "WP08.png", "fourkaos-card-back.png", 0),
        ("wallpaper", "WP07.png", "WP07.png", 0),
        ("wallpaper", "WP08.png", "WP08.png", 1),
        ("illustrator_avatar", "avatareldon.png", "avatareldon.png", 0),
        ("hero_image", "memora fk.png", "memora fk.png", 0),
        ("profile_image", "gregg-mervine.jpg", "gregg-mervine.jpg", 0),
        ("product_image", "Caneca 01.png", "Caneca 01.png", 0),
        ("product_image", "Caneca 02.png", "Caneca 02.png", 1),
    ],
    "toninho-borbo-biplano": [
        ("edition_cover", "Capatoninho.jpg", "Capatoninho.jpg", 0),
        ("edition_tile", "MC4.png", "MC4.png", 0),
        ("title_logo", "toninho-biplano-logo.png", "toninho-biplano-logo.png", 0),
        ("card_front", "Capatoninho.jpg", "toninho-card-front.jpg", 0),
        ("card_back", "WP02.png", "toninho-card-back.png", 0),
        ("wallpaper", "WP01.png", "WP01.png", 0),
        ("wallpaper", "WP02.png", "WP02.png", 1),
        ("illustrator_avatar", "avatareldon.png", "avatareldon.png", 0),
        ("hero_image", "Memora TB.png", "Memora TB.png", 0),
        ("profile_image", "gregg-mervine.jpg", "gregg-mervine.jpg", 0),
        ("product_image", "Caneca 05.png", "Caneca 05.png", 0),
        ("product_image", "Caneca 06.png", "Caneca 06.png", 1),
    ],
}
MIME_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}


def import_assets() -> dict[str, int]:
    settings = get_settings()
    imported = linked_capsules = 0
    with SessionLocal() as db:
        seed(db)
        creator = db.scalar(select(User).where(User.email == "seed@memora.local"))
        for slug, definitions in ASSETS.items():
            edition = db.scalar(select(Edition).where(Edition.slug == slug))
            if not edition:
                raise RuntimeError(f"Seeded edition is missing: {slug}")
            cover = None
            for role, source_name, public_filename, sort_order in definitions:
                legacy_id = f"generated:{slug}:{role}:{sort_order}"
                existing = db.scalar(select(MediaAsset).where(MediaAsset.edition_id == edition.id, MediaAsset.legacy_id == legacy_id))
                if existing:
                    if role == "edition_cover" and existing.deleted_at is None:
                        cover = existing
                    continue
                source = SOURCE_ROOT / source_name
                data = source.read_bytes()
                digest = hashlib.sha256(data).hexdigest()
                with Image.open(source) as image:
                    width, height = image.size
                extension = source.suffix.lower()
                target_dir = settings.upload_root / slug / role
                target_dir.mkdir(parents=True, exist_ok=True)
                target = target_dir / f"generated-{digest[:24]}{extension}"
                if not target.exists():
                    temporary = target.with_suffix(f"{target.suffix}.tmp")
                    shutil.copyfile(source, temporary)
                    temporary.replace(target)
                row = MediaAsset(
                    edition_id=edition.id,
                    created_by_user_id=creator.id,
                    role=role,
                    storage_path=target.relative_to(settings.upload_root).as_posix(),
                    original_filename=source_name,
                    public_filename=public_filename,
                    mime_type=MIME_TYPES[extension],
                    content_sha256=digest,
                    width=width,
                    height=height,
                    size_bytes=len(data),
                    sort_order=sort_order,
                    legacy_id=legacy_id,
                )
                db.add(row)
                db.flush()
                imported += 1
                if role == "edition_cover":
                    cover = row
            opening = db.scalar(select(CapsuleEntry).where(CapsuleEntry.edition_id == edition.id, CapsuleEntry.legacy_id == f"seed-demo:{slug}:capsule:01"))
            if opening and cover and opening.image_asset_id != cover.id:
                opening.image_asset_id = cover.id
                linked_capsules += 1
        db.commit()
    return {"assets_imported": imported, "capsule_images_linked": linked_capsules}


if __name__ == "__main__":
    print(import_assets())
