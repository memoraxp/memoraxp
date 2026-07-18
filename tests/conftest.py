from __future__ import annotations

import asyncio
from io import BytesIO

import pytest
import httpx
from PIL import Image
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

import backend.main as main_module
from backend.config import Settings, settings_dependency
from backend.database import Base, get_db
from backend.models import EditionMembership, PasswordCredential, User
from backend.security import hash_password
from backend.seed_data import seed


@pytest.fixture
def env(tmp_path, monkeypatch):
    engine = create_engine(f"sqlite:///{tmp_path / 'test.db'}", connect_args={"check_same_thread": False})
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    with factory() as db:
        seed(db)
        from backend.models import Edition
        editions = {edition.slug: edition for edition in db.scalars(select(Edition)).all()}
        aura = User(email="aura@example.com", display_name="Aura Manager")
        distance = User(email="distance@example.com", display_name="Distance Manager")
        collector = User(email="collector@example.com", display_name="Collector")
        db.add_all([aura, distance, collector]); db.flush()
        db.add_all([
            PasswordCredential(user_id=aura.id, password_hash=hash_password("correct-horse-battery")),
            PasswordCredential(user_id=distance.id, password_hash=hash_password("distance-manager-password")),
            EditionMembership(user_id=aura.id, edition_id=editions["aura"].id, role="manager"),
            EditionMembership(user_id=distance.id, edition_id=editions["distance"].id, role="manager"),
        ])
        db.commit()
    settings = Settings(database_url=f"sqlite:///{tmp_path / 'test.db'}", upload_root=tmp_path / "uploads", app_base_url="http://testserver", max_upload_bytes=2048)

    async def override_db():
        with factory() as db:
            yield db

    monkeypatch.setattr(main_module, "SessionLocal", factory)
    app = main_module.create_app(settings)
    app.dependency_overrides[get_db] = override_db
    async def override_settings():
        return settings
    app.dependency_overrides[settings_dependency] = override_settings
    class Client:
        def __init__(self):
            self.cookies = httpx.Cookies()

        def request(self, method, path, **kwargs):
            async def send():
                async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver", cookies=self.cookies) as session:
                    response = await session.request(method, path, **kwargs)
                    self.cookies.update(session.cookies)
                    return response
            return asyncio.run(send())

        def get(self, path, **kwargs): return self.request("GET", path, **kwargs)
        def post(self, path, **kwargs): return self.request("POST", path, **kwargs)
        def put(self, path, **kwargs): return self.request("PUT", path, **kwargs)
        def delete(self, path, **kwargs): return self.request("DELETE", path, **kwargs)

    client = Client()
    client.get("/api/editions")

    def headers(csrf=True):
        result = {"Origin": "http://testserver"}
        if csrf:
            result["X-CSRF-Token"] = client.cookies.get("memora_csrf")
        return result

    def login(email="aura@example.com", password="correct-horse-battery"):
        return client.post("/api/auth/manager/login", json={"email": email, "password": password}, headers=headers())

    yield {"client": client, "db": factory, "headers": headers, "login": login, "settings": settings}


@pytest.fixture
def png_bytes():
    stream = BytesIO()
    Image.new("RGB", (4, 4), "red").save(stream, format="PNG")
    return stream.getvalue()
