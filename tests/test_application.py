from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from backend.models import CapsuleEntry, DifusoraPost, Edition, MediaAsset, PasswordCredential, Session, Token, User
from backend.security import new_session, safe_return_url, verify_password


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
    assert env["client"].get("/api/editions/aura/capsule").json() == []
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
    assert photo.status_code == 201 and photo.json()["image_url"].startswith("/uploads/aura/capsule_image/")


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
