"""Add trusted source image URL to capsule entries.

Revision ID: 20260718_0002
Revises: 20260718_0001
"""

import sqlalchemy as sa
from alembic import op


revision = "20260718_0002"
down_revision = "20260718_0001"
branch_labels = None
depends_on = None


def _has_column(name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(column["name"] == name for column in inspector.get_columns("capsule_entries"))


def upgrade() -> None:
    # The initial revision historically used metadata.create_all(), so a brand-new
    # database may already reflect the current model. Existing databases do not.
    if not _has_column("source_image_url"):
        op.add_column("capsule_entries", sa.Column("source_image_url", sa.String(length=2048), nullable=True))


def downgrade() -> None:
    if _has_column("source_image_url"):
        with op.batch_alter_table("capsule_entries") as batch_op:
            batch_op.drop_column("source_image_url")
