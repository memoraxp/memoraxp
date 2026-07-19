from __future__ import annotations

import logging
import secrets
from pathlib import Path
from urllib.parse import urlsplit

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.config import Settings, get_settings, settings_dependency
from backend.database import get_db, make_session_factory
from backend.routers import assets, auth, collector, manager, public
from backend.security import csrf_matches, require_edition_membership, session_from_request

LOGGER = logging.getLogger("memora")
ROOT = Path(__file__).resolve().parent.parent
PUBLIC_HTML = {
    "/": "index.html",
    "/index.html": "index.html",
    "/edicao-aura.html": "edicao-aura.html",
    "/edicao-distance-and-belief.html": "edicao-distance-and-belief.html",
    "/edicao-fourkaos.html": "edicao-fourkaos.html",
    "/edicao-toninho-borbo-biplano.html": "edicao-toninho-borbo-biplano.html",
    "/edicoes/toninho-borbo-biplano/": "edicoes/toninho-borbo-biplano/index.html",
    "/m/TB001-x7K92PQa/": "m/TB001-x7K92PQa/index.html",
}
MANAGER_HTML = {
    "/manager-aura.html": ("manager-aura.html", "aura"),
    "/manager-distance-and-belief.html": ("manager-distance-and-belief.html", "distance"),
    "/manager-fourkaos.html": ("manager-fourkaos.html", "fourkaos"),
    "/manager-toninho-borbo-biplano.html": ("manager-toninho-borbo-biplano.html", "toninho-borbo-biplano"),
}
SAFE_CONTENT_TYPES = {"application/json", "multipart/form-data", "application/x-www-form-urlencoded"}
GLOBAL_STATIC_IMAGES = {
    "avatar.png", "colmeia.png", "memora-xp-coasters.png", "memora-xp-crew.png",
    "mlogo.png", "pdf-img-000.png", "pdf-img-005.png", "pdf-img-007.png",
    "pdf-img-012.png", "pdf-img-013.png", "plane.png",
}
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}


def error_body(detail, status_code: int) -> dict:
    if isinstance(detail, dict) and "code" in detail:
        return {"error": detail}
    return {"error": {"code": "request_error", "message": str(detail), "status": status_code}}


def same_origin_header(request: Request) -> bool:
    value = request.headers.get("origin") or request.headers.get("referer")
    if not value:
        return False
    parsed = urlsplit(value)
    request_host = request.headers.get("host", "")
    return parsed.scheme in {"http", "https"} and parsed.netloc == request_host


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    app = FastAPI(title="Memora API", version="0.1.0")
    app.state.settings = settings
    app.state.session_factory = make_session_factory(settings.database_url)

    async def app_db():
        with app.state.session_factory() as db:
            yield db

    async def app_settings():
        return settings

    app.dependency_overrides[get_db] = app_db
    app.dependency_overrides[settings_dependency] = app_settings

    @app.middleware("http")
    async def browser_security(request: Request, call_next):
        unsafe = request.method in {"POST", "PUT", "PATCH", "DELETE"}
        if unsafe and request.url.path.startswith("/api/"):
            content_length = request.headers.get("content-length")
            if content_length and content_length.isdigit() and int(content_length) > settings.max_upload_bytes + 65_536:
                return JSONResponse(error_body({"code": "request_too_large", "message": "Request exceeds the configured limit"}, 413), status_code=413)
            if not same_origin_header(request):
                return JSONResponse(error_body({"code": "invalid_origin", "message": "Unsafe request must be same-origin"}, 403), status_code=403)
            content_type = request.headers.get("content-type", "").split(";", 1)[0].lower()
            if content_length not in {None, "0"} and content_type not in SAFE_CONTENT_TYPES:
                return JSONResponse(error_body({"code": "unsupported_content_type", "message": "Unsupported request content type"}, 415), status_code=415)
            if not csrf_matches(request):
                return JSONResponse(error_body({"code": "csrf_failed", "message": "CSRF validation failed"}, 403), status_code=403)
        response = await call_next(request)
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store"
        if not request.cookies.get("memora_csrf"):
            response.set_cookie("memora_csrf", secrets.token_urlsafe(32), httponly=False, secure=settings.session_cookie_secure or settings.is_production, samesite="lax", path="/")
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
        return response

    @app.exception_handler(StarletteHTTPException)
    @app.exception_handler(HTTPException)
    async def http_error(_request: Request, exc: HTTPException):
        return JSONResponse(error_body(exc.detail, exc.status_code), status_code=exc.status_code, headers=exc.headers)

    @app.exception_handler(RequestValidationError)
    async def validation_error(_request: Request, exc: RequestValidationError):
        fields = [{"location": list(item["loc"]), "message": item["msg"], "type": item["type"]} for item in exc.errors()]
        return JSONResponse({"error": {"code": "validation_error", "message": "Request validation failed", "fields": fields}}, status_code=422)

    app.include_router(auth.router)
    app.include_router(collector.router)
    app.include_router(manager.router)
    app.include_router(public.router)
    # This database-backed route must precede the broad global static mount.
    app.include_router(assets.router)

    @app.get("/assets/{filename}", include_in_schema=False)
    async def global_asset(filename: str):
        candidate = Path(filename)
        if candidate.name != filename or candidate.suffix.lower() in IMAGE_SUFFIXES and filename not in GLOBAL_STATIC_IMAGES:
            LOGGER.info("Rejected unscoped non-global image request: %s", filename)
            raise HTTPException(status_code=404, detail={"code": "asset_not_found", "message": "Global asset not found"})
        path = ROOT / "assets" / filename
        if not path.is_file():
            raise HTTPException(status_code=404, detail={"code": "asset_not_found", "message": "Global asset not found"})
        return FileResponse(path)

    app.mount("/assets", StaticFiles(directory=ROOT / "assets"), name="assets")
    settings.upload_root.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.upload_root), name="uploads")
    media = ROOT / "media"
    if media.exists():
        app.mount("/media", StaticFiles(directory=media), name="media")
    else:
        LOGGER.warning("Static media directory is unavailable; continuing without /media.")

    def public_page(filename: str):
        async def serve():
            return FileResponse(ROOT / filename)
        return serve

    for path, filename in PUBLIC_HTML.items():
        app.add_api_route(path, public_page(filename), methods=["GET"], include_in_schema=False)

    @app.get("/styles.css", include_in_schema=False)
    async def styles():
        return FileResponse(ROOT / "styles.css", media_type="text/css")

    @app.get("/memora-id.html", include_in_schema=False)
    async def memora_id(request: Request):
        with app.state.session_factory() as db:
            if not session_from_request(request, db):
                return RedirectResponse("/index.html#login", status_code=303)
        return FileResponse(ROOT / "memora-id.html")

    def manager_page(request: Request, filename: str, slug: str):
        with app.state.session_factory() as db:
            session = session_from_request(request, db)
            if not session:
                return RedirectResponse("/index.html#login", status_code=303)
            try:
                require_edition_membership(slug, session.user, db)
            except HTTPException:
                return RedirectResponse("/index.html#login", status_code=303)
        return FileResponse(ROOT / filename)

    def protected_manager_page(filename: str, slug: str):
        async def serve(request: Request):
            return manager_page(request, filename, slug)
        return serve

    for path, (filename, slug) in MANAGER_HTML.items():
        app.add_api_route(path, protected_manager_page(filename, slug), methods=["GET"], include_in_schema=False)

    @app.get("/auth/instagram/", include_in_schema=False)
    @app.get("/auth/instagram/callback/", include_in_schema=False)
    async def obsolete_instagram():
        return RedirectResponse("/index.html#login", status_code=303)

    return app


app = create_app()
