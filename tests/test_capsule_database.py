from __future__ import annotations

import os
import sqlite3
import subprocess
import sys
from datetime import date, datetime, timezone
from pathlib import Path

from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker

import backend.main as main_module
from backend.config import APPLICATION_ROOT, Settings, sqlite_database_path
from backend.database import Base
from backend.models import CapsuleEntry, Edition, EditionMembership, PasswordCredential, User
from backend.seed_data import CAPSULE_SEED, seed


def database(tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'seed.db'}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine, expire_on_commit=False)


def test_alembic_creates_authoritative_asset_schema_without_capsule_url(tmp_path):
    path = tmp_path / "current.db"
    environment = {**os.environ, "DATABASE_URL": f"sqlite:///{path}"}
    subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=APPLICATION_ROOT,
        env=environment,
        check=True,
        capture_output=True,
        text=True,
    )
    with sqlite3.connect(path) as connection:
        capsule_columns = {row[1] for row in connection.execute("PRAGMA table_info(capsule_entries)")}
        asset_columns = {row[1] for row in connection.execute("PRAGMA table_info(media_assets)")}
        revision = connection.execute("SELECT version_num FROM alembic_version").fetchone()[0]
    assert "source_image_url" not in capsule_columns
    assert {"role", "public_filename", "content_sha256", "width", "height"}.issubset(asset_columns)
    assert "slot" not in asset_columns
    assert revision == "20260718_0003"


def test_seed_creates_24_capsule_entries_without_static_image_urls(tmp_path):
    factory = database(tmp_path)
    with factory() as db:
        first = seed(db)
        second = seed(db)
        assert first == {"editions_created": 4, "tokens_created": 400, "capsule_entries_created": 24}
        assert second == {"editions_created": 0, "tokens_created": 0, "capsule_entries_created": 0}
        assert db.scalar(select(func.count(CapsuleEntry.id))) == 24
        for slug in CAPSULE_SEED:
            edition = db.scalar(select(Edition).where(Edition.slug == slug))
            rows = db.scalars(
                select(CapsuleEntry)
                .where(CapsuleEntry.edition_id == edition.id)
                .order_by(CapsuleEntry.event_date)
            ).all()
            assert len(rows) == 6
            assert all(row.image_asset_id is None for row in rows)
        seed_user = db.scalar(select(User).where(User.email == "seed@memora.local"))
        assert seed_user.display_name == "Memora"
        assert db.get(PasswordCredential, seed_user.id) is None
        assert db.scalar(select(EditionMembership).where(EditionMembership.user_id == seed_user.id)) is None


def test_seed_preserves_manager_created_entry(tmp_path):
    factory = database(tmp_path)
    with factory() as db:
        seed(db)
        edition = db.scalar(select(Edition).where(Edition.slug == "aura"))
        manager = User(email="author@example.com", display_name="Author")
        db.add(manager)
        db.flush()
        row = CapsuleEntry(
            edition_id=edition.id,
            author_user_id=manager.id,
            text="Manager memory",
            event_date=date(2027, 1, 2),
            legacy_id="manager-memory",
        )
        db.add(row)
        db.commit()
        row_id = row.id
        assert seed(db)["capsule_entries_created"] == 0
    with factory() as db:
        persisted = db.get(CapsuleEntry, row_id)
        assert persisted.text == "Manager memory"
        assert persisted.event_date == date(2027, 1, 2)


def test_seed_configuration_contains_no_edition_image_keys(tmp_path):
    factory = database(tmp_path)
    with factory() as db:
        seed(db)
        for edition in db.scalars(select(Edition)).all():
            assert not {"image", "cover", "tile", "titleLogo", "title_logo", "digitalCard", "wallpapers"}.intersection(edition.configuration)


def test_relative_sqlite_url_is_resolved_against_repository_root(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    settings = Settings(database_url="sqlite:///./var/cwd-independent.db", upload_root=tmp_path / "uploads")
    assert sqlite_database_path(settings.database_url) == APPLICATION_ROOT / "var/cwd-independent.db"
    app = main_module.create_app(settings)
    assert Path(app.state.session_factory.kw["bind"].url.database) == APPLICATION_ROOT / "var/cwd-independent.db"


def test_post_id_persists_in_new_session_public_get_and_manager_dashboard(env, png_bytes):
    assert env["login"]().status_code == 200
    response = env["client"].post(
        "/api/manager/editions/aura/capsule",
        files={
            "text": (None, "Multipart persistence"),
            "event_date": (None, "2028-07-18"),
            "image": ("memory.png", png_bytes, "image/png"),
        },
        headers=env["headers"](),
    )
    assert response.status_code == 201
    entry_id = response.json()["id"]
    with env["db"]() as fresh_db:
        assert fresh_db.scalar(select(CapsuleEntry.id).where(CapsuleEntry.id == entry_id)) == entry_id
    public = env["client"].get("/api/editions/aura/capsule")
    assert entry_id in [entry["id"] for entry in public.json()]
    dashboard = env["client"].get("/api/manager/editions/aura/dashboard")
    assert entry_id in [entry["id"] for entry in dashboard.json()["capsule"]]
    expected_fields = {"id", "text", "event_date", "author", "image_url", "created_at", "legacy_id", "duplicate"}
    assert set(response.json()) == expected_fields


def test_seeded_capsule_entries_have_explicit_missing_image_state(env):
    for slug in CAPSULE_SEED:
        entries = env["client"].get(f"/api/editions/{slug}/capsule").json()
        assert all(entry["image_url"] is None for entry in entries)


def test_capsule_visible_after_application_and_client_recreation(env):
    env["login"]()
    created = env["client"].post(
        "/api/manager/editions/aura/capsule",
        files={"text": (None, "Survives recreation"), "event_date": (None, "2029-01-01")},
        headers=env["headers"](),
    )
    entry_id = created.json()["id"]
    recreated_app = main_module.create_app(env["settings"])
    recreated_client = env["client_class"](recreated_app)
    response = recreated_client.get("/api/editions/aura/capsule")
    assert entry_id in [entry["id"] for entry in response.json()]


def test_public_ordering_is_deterministic_and_matches_dashboard(env):
    with env["db"]() as db:
        edition = db.scalar(select(Edition).where(Edition.slug == "aura"))
        author = db.scalar(select(User).where(User.email == "aura@example.com"))
        created_at = datetime(2030, 1, 1, tzinfo=timezone.utc)
        for entry_id in ["00000000-0000-0000-0000-00000000000a", "00000000-0000-0000-0000-00000000000c", "00000000-0000-0000-0000-00000000000b"]:
            db.add(CapsuleEntry(id=entry_id, edition_id=edition.id, author_user_id=author.id, text=entry_id[-1], event_date=date(2030, 1, 1), created_at=created_at))
        db.commit()
    public_ids = [entry["id"] for entry in env["client"].get("/api/editions/aura/capsule").json()]
    assert public_ids[:3] == [
        "00000000-0000-0000-0000-00000000000c",
        "00000000-0000-0000-0000-00000000000b",
        "00000000-0000-0000-0000-00000000000a",
    ]
    env["login"]()
    manager_ids = [entry["id"] for entry in env["client"].get("/api/manager/editions/aura/dashboard").json()["capsule"]]
    assert manager_ids == public_ids


def test_soft_deleted_entries_are_excluded_and_legacy_duplicate_conflicts(env):
    env["login"]()
    payload = {"text": (None, "Legacy memory"), "event_date": (None, "2028-01-01"), "legacy_id": (None, "legacy-capsule-1")}
    first = env["client"].post("/api/manager/editions/aura/capsule", files=payload, headers=env["headers"]())
    assert first.status_code == 201
    active_duplicate = env["client"].post("/api/manager/editions/aura/capsule", files=payload, headers=env["headers"]())
    assert active_duplicate.status_code == 200
    assert active_duplicate.json()["duplicate"] is True
    entry_id = first.json()["id"]
    deleted = env["client"].delete(f"/api/manager/editions/aura/capsule/{entry_id}", headers=env["headers"]())
    assert deleted.status_code == 200
    assert entry_id not in [entry["id"] for entry in env["client"].get("/api/editions/aura/capsule").json()]
    conflict = env["client"].post("/api/manager/editions/aura/capsule", files=payload, headers=env["headers"]())
    assert conflict.status_code == 409
    assert conflict.json()["error"]["code"] == "capsule_legacy_deleted"


def test_mutable_capsule_responses_are_no_store(env):
    public = env["client"].get("/api/editions/aura/capsule")
    assert public.headers["cache-control"] == "no-store"
    env["login"]()
    dashboard = env["client"].get("/api/manager/editions/aura/dashboard")
    assert dashboard.headers["cache-control"] == "no-store"
    created = env["client"].post(
        "/api/manager/editions/aura/capsule",
        files={"text": (None, "No cache"), "event_date": (None, "2028-02-02")},
        headers=env["headers"](),
    )
    assert created.headers["cache-control"] == "no-store"
