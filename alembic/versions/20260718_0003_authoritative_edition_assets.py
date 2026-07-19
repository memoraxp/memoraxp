"""Normalize authoritative edition assets and remove capsule URL strings.

Revision ID: 20260718_0003
Revises: 20260718_0002
"""

from __future__ import annotations

import hashlib
from pathlib import Path

import sqlalchemy as sa
from alembic import op

from backend.config import get_settings


revision = "20260718_0003"
down_revision = "20260718_0002"
branch_labels = None
depends_on = None

ROLES = (
    "edition_cover", "edition_tile", "title_logo", "card_front", "card_back",
    "wallpaper", "illustrator_avatar", "manager_avatar", "hero_image", "profile_image",
    "product_image", "capsule_image",
)
IMAGE_KEYS = {"image", "cover", "tile", "titleLogo", "title_logo", "digitalCard", "wallpapers"}


def _columns(table: str) -> set[str]:
    return {column["name"] for column in sa.inspect(op.get_bind()).get_columns(table)}


def _clean_configuration(value):
    if not isinstance(value, dict):
        return value
    cleaned = {key: item for key, item in value.items() if key not in IMAGE_KEYS}
    for key in ("illustrator", "manager"):
        nested = cleaned.get(key)
        if isinstance(nested, dict):
            nested = dict(nested)
            nested.pop("avatar", None)
            cleaned[key] = nested
    return cleaned


def _upgrade_media_assets() -> None:
    columns = _columns("media_assets")
    if "slot" in columns:
        with op.batch_alter_table("media_assets") as batch_op:
            batch_op.alter_column("slot", new_column_name="role", existing_type=sa.String(length=30))
    columns = _columns("media_assets")
    with op.batch_alter_table("media_assets") as batch_op:
        if "public_filename" not in columns:
            batch_op.add_column(sa.Column("public_filename", sa.String(length=255), nullable=True))
        if "content_sha256" not in columns:
            batch_op.add_column(sa.Column("content_sha256", sa.String(length=64), nullable=True))
        if "width" not in columns:
            batch_op.add_column(sa.Column("width", sa.Integer(), nullable=True))
        if "height" not in columns:
            batch_op.add_column(sa.Column("height", sa.Integer(), nullable=True))

    media = sa.table(
        "media_assets",
        sa.column("id", sa.String),
        sa.column("edition_id", sa.String),
        sa.column("role", sa.String),
        sa.column("storage_path", sa.String),
        sa.column("original_filename", sa.String),
        sa.column("public_filename", sa.String),
        sa.column("content_sha256", sa.String),
        sa.column("deleted_at", sa.DateTime),
    )
    connection = op.get_bind()
    root = get_settings().upload_root.resolve()
    rows = connection.execute(sa.select(media)).mappings().all()
    used: dict[str, set[str]] = {}
    for row in rows:
        filename = Path(row["original_filename"] or "asset").name[:255]
        edition_names = used.setdefault(row["edition_id"], set())
        if row["deleted_at"] is None and filename in edition_names:
            path = Path(filename)
            filename = f"{path.stem}-{row['role']}{path.suffix}"[:255]
        if row["deleted_at"] is None:
            edition_names.add(filename)
        stored = (root / row["storage_path"]).resolve()
        digest = hashlib.sha256(stored.read_bytes()).hexdigest() if root in stored.parents and stored.is_file() else hashlib.sha256(row["id"].encode()).hexdigest()
        connection.execute(
            media.update().where(media.c.id == row["id"]).values(public_filename=filename, content_sha256=digest)
        )

    with op.batch_alter_table("media_assets") as batch_op:
        batch_op.alter_column("public_filename", existing_type=sa.String(length=255), nullable=False)
        batch_op.alter_column("content_sha256", existing_type=sa.String(length=64), nullable=False)

    checks = {item["name"] for item in sa.inspect(connection).get_check_constraints("media_assets")}
    with op.batch_alter_table("media_assets") as batch_op:
        if "ck_media_asset_slot" in checks:
            batch_op.drop_constraint("ck_media_asset_slot", type_="check")
        if "ck_media_asset_role" not in checks:
            values = ",".join(f"'{role}'" for role in ROLES)
            batch_op.create_check_constraint("ck_media_asset_role", f"role IN ({values})")
    indexes = {item["name"] for item in sa.inspect(connection).get_indexes("media_assets")}
    if "uq_media_active_public_filename" not in indexes:
        op.create_index(
            "uq_media_active_public_filename", "media_assets", ["edition_id", "public_filename"],
            unique=True, sqlite_where=sa.text("deleted_at IS NULL"), postgresql_where=sa.text("deleted_at IS NULL"),
        )
    if "uq_media_active_single_role" not in indexes:
        condition = sa.text("deleted_at IS NULL AND role NOT IN ('wallpaper','product_image','capsule_image')")
        op.create_index(
            "uq_media_active_single_role", "media_assets", ["edition_id", "role"],
            unique=True, sqlite_where=condition, postgresql_where=condition,
        )


def _migrate_capsule_images() -> None:
    if "source_image_url" not in _columns("capsule_entries"):
        return
    connection = op.get_bind()
    capsule = sa.table(
        "capsule_entries",
        sa.column("id", sa.String),
        sa.column("edition_id", sa.String),
        sa.column("image_asset_id", sa.String),
        sa.column("source_image_url", sa.String),
    )
    media = sa.table(
        "media_assets",
        sa.column("id", sa.String),
        sa.column("edition_id", sa.String),
        sa.column("role", sa.String),
        sa.column("deleted_at", sa.DateTime),
    )
    covers = dict(connection.execute(
        sa.select(media.c.edition_id, media.c.id).where(media.c.role == "edition_cover", media.c.deleted_at.is_(None))
    ).all())
    rows = connection.execute(sa.select(capsule.c.id, capsule.c.edition_id).where(capsule.c.source_image_url.is_not(None))).all()
    for entry_id, edition_id in rows:
        connection.execute(capsule.update().where(capsule.c.id == entry_id).values(image_asset_id=covers.get(edition_id)))
    with op.batch_alter_table("capsule_entries") as batch_op:
        batch_op.drop_column("source_image_url")


def _clean_edition_configuration() -> None:
    connection = op.get_bind()
    editions = sa.table("editions", sa.column("id", sa.String), sa.column("configuration", sa.JSON))
    for edition_id, configuration in connection.execute(sa.select(editions.c.id, editions.c.configuration)).all():
        cleaned = _clean_configuration(configuration)
        if cleaned != configuration:
            connection.execute(editions.update().where(editions.c.id == edition_id).values(configuration=cleaned))


def upgrade() -> None:
    _upgrade_media_assets()
    _migrate_capsule_images()
    _clean_edition_configuration()


def downgrade() -> None:
    with op.batch_alter_table("capsule_entries") as batch_op:
        batch_op.add_column(sa.Column("source_image_url", sa.String(length=2048), nullable=True))
