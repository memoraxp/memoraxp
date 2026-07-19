from __future__ import annotations

from datetime import datetime, timedelta, timezone
from io import BytesIO
from pathlib import Path
import subprocess
import sys

from sqlalchemy import select
from PIL import Image

from backend.models import CapsuleEntry, DifusoraPost, Edition, MediaAsset, PasswordCredential, Session, Token, User
from backend.security import new_session, safe_return_url, verify_password


ROOT = Path(__file__).resolve().parent.parent


def image_bytes(color: str, image_format: str = "PNG") -> bytes:
    stream = BytesIO()
    Image.new("RGB", (4, 4), color).save(stream, format=image_format)
    return stream.getvalue()


def test_manager_login_success_failure_and_password_hash(env):
    client = env["client"]
    failed = env["login"](password="wrong")
    assert failed.status_code == 401
    assert failed.json()["error"]["code"] == "invalid_credentials"
    response = env["login"]()
    assert response.status_code == 200
    assert response.json()["editions"][0]["slug"] == "aura"
    assert response.cookies.get("memora_session")
    assert "HttpOnly" in response.headers["set-cookie"]
    with env["db"]() as db:
        credential = db.scalar(select(PasswordCredential))
        assert credential.password_hash != "correct-horse-battery"
        assert verify_password(credential.password_hash, "correct-horse-battery")


def test_logout_revokes_session(env):
    assert env["login"]().status_code == 200
    response = env["client"].post("/api/auth/logout", headers=env["headers"]())
    assert response.status_code == 200
    assert env["client"].get("/api/auth/me").status_code == 401
    with env["db"]() as db:
        assert db.scalar(select(Session).order_by(Session.created_at.desc())).revoked_at is not None


def test_expired_and_revoked_sessions_rejected(env):
    env["login"]()
    with env["db"]() as db:
        row = db.scalar(select(Session).order_by(Session.created_at.desc()))
        row.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        db.commit()
    assert env["client"].get("/api/auth/me").status_code == 401


def test_protected_html_and_api_redirect_or_reject(env):
    client = env["client"]
    client.cookies.clear(); client.get("/api/editions")
    assert client.get("/memora-id.html", follow_redirects=False).headers["location"] == "/index.html#login"
    assert client.get("/manager-aura.html", follow_redirects=False).status_code == 303
    assert client.get("/api/me/dashboard").status_code == 401


def test_manager_is_scoped_to_assigned_edition(env):
    env["login"]()
    client = env["client"]
    assert client.get("/api/manager/editions/aura/dashboard").status_code == 200
    assert client.get("/api/manager/editions/distance/dashboard").status_code == 403
    forbidden = client.post("/api/manager/editions/distance/difusora", json={"text": "No"}, headers=env["headers"]())
    assert forbidden.status_code == 403


def test_public_reads_and_authorized_difusora(env):
    assert env["client"].get("/api/editions/aura/difusora").json() == []
    assert len(env["client"].get("/api/editions/aura/capsule").json()) == 6
    env["login"]()
    created = env["client"].post("/api/manager/editions/aura/difusora", json={"text": "Hello", "tag": "news"}, headers=env["headers"]())
    assert created.status_code == 201
    assert env["client"].get("/api/editions/aura/difusora").json()[0]["text"] == "Hello"


def test_unauthorized_difusora_deletion(env):
    env["login"]()
    created = env["client"].post("/api/manager/editions/aura/difusora", json={"text": "Keep"}, headers=env["headers"]()).json()
    env["client"].cookies.clear(); env["client"].get("/api/editions")
    response = env["client"].delete(f"/api/manager/editions/aura/difusora/{created['id']}", headers=env["headers"]())
    assert response.status_code == 401


def test_capsule_with_and_without_image(env, png_bytes):
    env["login"]()
    client = env["client"]
    plain = client.post("/api/manager/editions/aura/capsule", data={"text": "Memory", "event_date": "2026-07-18"}, headers=env["headers"]())
    assert plain.status_code == 201 and plain.json()["image_url"] is None
    photo = client.post("/api/manager/editions/aura/capsule", data={"text": "Photo", "event_date": "2026-07-18"}, files={"image": ("photo.png", png_bytes, "image/png")}, headers=env["headers"]())
    assert photo.status_code == 201 and photo.json()["image_url"].startswith("/assets/aura/")
    with env["db"]() as fresh_db:
        plain_row = fresh_db.get(CapsuleEntry, plain.json()["id"])
        photo_row = fresh_db.get(CapsuleEntry, photo.json()["id"])
        assert plain_row is not None and plain_row.image_asset_id is None
        assert photo_row is not None and photo_row.image_asset_id is not None


def test_invalid_oversized_and_non_image_uploads(env, png_bytes):
    env["login"](); client = env["client"]
    endpoint = "/api/manager/editions/aura/assets/edition_cover"
    bad = client.put(endpoint, files={"file": ("bad.png", b"not-image", "image/png")}, headers=env["headers"]())
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "invalid_image"
    wrong = client.put(endpoint, files={"file": ("x.txt", b"text", "text/plain")}, headers=env["headers"]())
    assert wrong.status_code == 415
    huge = client.put(endpoint, files={"file": ("x.png", b"x" * 2200, "image/png")}, headers=env["headers"]())
    assert huge.status_code in {413, 422}


def test_asset_slot_validation(env, png_bytes):
    env["login"]()
    response = env["client"].put("/api/manager/editions/aura/assets/unknown", files={"file": ("x.png", png_bytes, "image/png")}, headers=env["headers"]())
    assert response.status_code == 422


def test_manager_card_and_multiple_wallpaper_assets_refetch_from_api(env, png_bytes):
    env["login"](); client = env["client"]
    created = []
    for role, filename in (("card_front", "front.png"), ("card_back", "back.png")):
        response = client.put(
            f"/api/manager/editions/aura/assets/{role}",
            files={"file": (filename, png_bytes, "image/png")},
            headers=env["headers"](),
        )
        assert response.status_code == 201
        created.append(response.json())
    for order, filename in enumerate(("wallpaper-one.png", "wallpaper-two.png")):
        response = client.put(
            "/api/manager/editions/aura/assets/wallpaper",
            data={"sort_order": order},
            files={"file": (filename, png_bytes, "image/png")},
            headers=env["headers"](),
        )
        assert response.status_code == 201
        created.append(response.json())

    dashboard_assets = client.get("/api/manager/editions/aura/dashboard").json()["assets"]
    public_assets = client.get("/api/editions/aura/assets").json()
    for role in ("card_front", "card_back"):
        assert len([asset for asset in dashboard_assets if asset["role"] == role]) == 1
    assert [asset["public_filename"] for asset in dashboard_assets if asset["role"] == "wallpaper"] == ["wallpaper-one.png", "wallpaper-two.png"]
    assert {asset["id"] for asset in dashboard_assets} == {asset["id"] for asset in public_assets}

    removed = client.delete(f"/api/manager/editions/aura/assets/{created[0]['id']}", headers=env["headers"]())
    assert removed.status_code == 200
    assert not [asset for asset in client.get("/api/manager/editions/aura/dashboard").json()["assets"] if asset["role"] == "card_front"]


def test_scoped_asset_route_is_database_backed_versioned_and_cacheable(env, png_bytes):
    env["login"]()
    created = env["client"].put(
        "/api/manager/editions/aura/assets/edition_cover",
        files={"file": ("Cover image.png", png_bytes, "image/png")},
        headers=env["headers"](),
    )
    assert created.status_code == 201
    asset = created.json()
    assert asset["edition_slug"] == "aura"
    assert asset["role"] == "edition_cover"
    assert asset["public_filename"] == "Cover image.png"
    assert asset["url"].startswith("/assets/aura/Cover%20image.png?v=")
    assert asset["mime_type"] == "image/png"
    assert asset["width"] == 4 and asset["height"] == 4
    response = env["client"].get(asset["url"])
    assert response.status_code == 200 and response.content == png_bytes
    assert response.headers["content-type"] == "image/png"
    assert int(response.headers["content-length"]) == len(png_bytes)
    assert response.headers["etag"]
    assert response.headers["cache-control"] == "public, max-age=31536000, immutable"
    cached = env["client"].get(asset["url"], headers={"If-None-Match": response.headers["etag"]})
    assert cached.status_code == 304 and not cached.content


def test_same_public_filename_is_isolated_by_edition(env):
    env["login"]()
    aura_data = image_bytes("red", "JPEG")
    aura = env["client"].put(
        "/api/manager/editions/aura/assets/edition_cover",
        files={"file": ("Capa.jpg", aura_data, "image/jpeg")},
        headers=env["headers"](),
    ).json()
    env["login"]("distance@example.com", "distance-manager-password")
    blue = image_bytes("blue", "JPEG")
    distance = env["client"].put(
        "/api/manager/editions/distance/assets/edition_cover",
        files={"file": ("Capa.jpg", blue, "image/jpeg")},
        headers=env["headers"](),
    ).json()
    assert aura["url"].startswith("/assets/aura/Capa.jpg?v=")
    assert distance["url"].startswith("/assets/distance/Capa.jpg?v=")
    assert env["client"].get(aura["url"]).content == aura_data
    assert env["client"].get(distance["url"]).content == blue


def test_asset_route_rejects_unknown_deleted_and_traversal_paths(env, png_bytes):
    assert env["client"].get("/assets/" + "Capa" + ".jpg").status_code == 404
    assert env["client"].get("/assets/not-an-edition/missing.png").status_code == 404
    assert env["client"].get("/assets/aura/missing.png").status_code == 404
    for path in (
        "/assets/aura/%2e%2e/secret.png",
        "/assets/aura/%252e%252e",
        "/assets/aura/http%3Aevil.png",
        "/assets/aura/name%5Cevil.png",
    ):
        assert env["client"].get(path).status_code in {400, 404}
    env["login"]()
    asset = env["client"].put(
        "/api/manager/editions/aura/assets/edition_cover",
        files={"file": ("deleted.png", png_bytes, "image/png")},
        headers=env["headers"](),
    ).json()
    assert env["client"].delete(f"/api/manager/editions/aura/assets/{asset['id']}", headers=env["headers"]()).status_code == 200
    assert env["client"].get(asset["url"]).status_code == 404


def test_replacing_single_asset_preserves_public_filename_and_changes_version(env, png_bytes):
    env["login"]()
    first = env["client"].put(
        "/api/manager/editions/aura/assets/edition_cover",
        files={"file": ("stable.png", png_bytes, "image/png")},
        headers=env["headers"](),
    ).json()
    second_data = image_bytes("green")
    second = env["client"].put(
        "/api/manager/editions/aura/assets/edition_cover",
        files={"file": ("replacement.png", second_data, "image/png")},
        headers=env["headers"](),
    ).json()
    assert second["public_filename"] == "stable.png"
    assert first["url"] != second["url"]
    assert env["client"].get("/assets/aura/stable.png").content == second_data
    with env["db"]() as db:
        old = db.get(MediaAsset, first["id"])
        assert old.deleted_at is not None


def test_duplicate_active_public_filename_within_edition_is_rejected(env, png_bytes):
    env["login"]()
    first = env["client"].put(
        "/api/manager/editions/aura/assets/wallpaper",
        files={"file": ("unique-wallpaper.png", png_bytes, "image/png")},
        headers=env["headers"](),
    )
    duplicate = env["client"].put(
        "/api/manager/editions/aura/assets/product_image",
        files={"file": ("unique-wallpaper.png", png_bytes, "image/png")},
        headers=env["headers"](),
    )
    assert first.status_code == 201
    assert duplicate.status_code == 409
    assert duplicate.json()["error"]["code"] == "public_filename_conflict"


def test_asset_apis_and_configuration_never_expose_unscoped_edition_paths(env, png_bytes):
    env["login"]()
    env["client"].put(
        "/api/manager/editions/aura/assets/edition_tile",
        files={"file": ("tile.png", png_bytes, "image/png")},
        headers=env["headers"](),
    )
    dashboard = env["client"].get("/api/manager/editions/aura/dashboard").json()
    public = env["client"].get("/api/editions/aura/assets").json()
    assert all(asset["url"].startswith("/assets/aura/") for asset in dashboard["assets"] + public)
    assert not {"image", "cover", "tile", "titleLogo", "title_logo", "digitalCard", "wallpapers"}.intersection(dashboard["edition"]["configuration"])


def test_collector_dashboard_uses_authoritative_edition_tile(env, png_bytes):
    env["login"]()
    tile = env["client"].put(
        "/api/manager/editions/aura/assets/edition_tile",
        files={"file": ("collector-tile.png", png_bytes, "image/png")},
        headers=env["headers"](),
    ).json()
    with env["db"]() as db:
        collector = db.scalar(select(User).where(User.email == "collector@example.com"))
        token = db.scalar(select(Token).where(Token.edition.has(slug="aura"), Token.status == "available"))
        token.owner_user_id = collector.id
        token.status = "active"
        from starlette.requests import Request
        scope = {"type": "http", "headers": [], "client": ("test", 1), "method": "GET", "path": "/", "scheme": "http", "server": ("testserver", 80), "query_string": b""}
        _, raw = new_session(db, collector, Request(scope), env["settings"])
        db.commit()
    env["client"].cookies.clear()
    env["client"].cookies.set("memora_session", raw)
    token_data = env["client"].get("/api/me/dashboard").json()["tokens"][0]
    assert token_data["edition"]["image_asset"]["id"] == tile["id"]
    assert token_data["edition"]["image_asset"]["url"].startswith("/assets/aura/")


def test_frontend_has_intentional_missing_states_and_legacy_validator_passes():
    manager = (ROOT / "assets/memora-manager.js").read_text()
    public_assets = (ROOT / "assets/memora-edition-assets.js").read_text()
    assert "Nenhuma capa cadastrada" in manager
    assert "Nenhum wallpaper cadastrado." in manager and "Nenhum wallpaper cadastrado." in public_assets
    assert "apiAsset?.url ||" not in manager
    for page in ROOT.glob("edicao-*.html"):
        source = page.read_text()
        assert "data-edition-cover-image hidden" in source
        assert "data-card-front-missing" in source
    result = subprocess.run([sys.executable, "scripts/check_legacy_asset_paths.py"], cwd=ROOT, capture_output=True, text=True)
    assert result.returncode == 0, result.stdout + result.stderr
    assert "0 forbidden references" in result.stdout


def test_safe_return_url():
    assert safe_return_url("/memora-id.html?x=1") == "/memora-id.html?x=1"
    for value in ["https://evil.example/", "//evil.example/x", "/%2f%2fevil.example/x", "/a/../manager", "/a/%2e%2e/manager", "\\evil", "javascript:alert(1)"]:
        assert safe_return_url(value) == "/memora-id.html"


def test_csrf_rejection(env):
    response = env["client"].post("/api/auth/manager/login", json={"email": "aura@example.com", "password": "correct-horse-battery"}, headers=env["headers"](csrf=False))
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "csrf_failed"


def test_legacy_import_idempotency(env, png_bytes):
    env["login"](); client = env["client"]
    payload = {"text": "Old post", "legacy_id": "legacy-post-1"}
    first = client.post("/api/manager/editions/aura/difusora", json=payload, headers=env["headers"]())
    second = client.post("/api/manager/editions/aura/difusora", json=payload, headers=env["headers"]())
    assert first.json()["duplicate"] is False and second.json()["duplicate"] is True
    data = {"legacy_id": "legacy-cover"}
    first_asset = client.put("/api/manager/editions/aura/assets/edition_cover", data=data, files={"file": ("x.png", png_bytes, "image/png")}, headers=env["headers"]())
    second_asset = client.put("/api/manager/editions/aura/assets/edition_cover", data=data, files={"file": ("x.png", png_bytes, "image/png")}, headers=env["headers"]())
    assert first_asset.json()["duplicate"] is False and second_asset.json()["duplicate"] is True


def test_token_activation_cannot_claim_owned_or_disabled(env):
    client = env["client"]
    with env["db"]() as db:
        user = db.scalar(select(User).where(User.email == "collector@example.com"))
        edition = db.scalar(select(Edition).where(Edition.slug == "aura"))
        available = db.scalar(select(Token).where(Token.edition_id == edition.id, Token.status == "available"))
        disabled = db.scalars(select(Token).where(Token.edition_id == edition.id, Token.status == "available")).all()[1]
        disabled.status = "disabled"
        # Direct fixture session is the permitted local/test authentication path.
        from starlette.requests import Request
        scope = {"type": "http", "headers": [], "client": ("test", 1), "method": "GET", "path": "/", "scheme": "http", "server": ("testserver", 80), "query_string": b""}
        _, raw = new_session(db, user, Request(scope), env["settings"])
        available_serial, disabled_serial = available.serial, disabled.serial
        db.commit()
    client.cookies.set("memora_session", raw)
    activated = client.post("/api/tokens/activate", json={"serial": available_serial}, headers=env["headers"]())
    assert activated.status_code == 200
    assert client.post("/api/tokens/activate", json={"serial": available_serial}, headers=env["headers"]()).status_code == 409
    assert client.post("/api/tokens/activate", json={"serial": disabled_serial}, headers=env["headers"]()).json()["error"]["code"] == "token_disabled"
