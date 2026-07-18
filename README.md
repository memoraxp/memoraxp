# Memora

The existing static site is served by a same-origin FastAPI application. Its visual HTML/CSS remains in place; authentication, permissions, mutable edition content, uploads, and collector data now come from the backend.

## Local setup

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e ".[dev]"
cp .env.example .env
alembic upgrade head
python -m backend.cli seed
python -m backend.cli create-manager --email manager@example.com --display-name "Manager" --edition aura
uvicorn backend.main:app --reload
```

Open <http://127.0.0.1:8000/>. The manager command securely prompts for a password (minimum 12 characters). For non-interactive secret injection, use `--password-env NAME` and set that environment variable outside shell history.

The intentionally optional `media/` directory is mounted only when present. New manager uploads are stored below `var/uploads/`; they never modify `/media`.

## Architecture and security

- `backend/models` contains the SQLAlchemy 2 schema; `alembic/` owns schema creation. The application does not call `create_all()` at startup.
- PostgreSQL is selected with `DATABASE_URL` in production. SQLite is the zero-configuration local/test default.
- Manager passwords use Argon2. Authentication creates a random opaque token, stores only its SHA-256 digest in `sessions`, and sends the raw value only in the `HttpOnly`, `SameSite=Lax` `memora_session` cookie. Enable `SESSION_COOKIE_SECURE=true` behind production HTTPS.
- Unsafe browser requests require a matching same-origin `Origin`/`Referer`, a double-submit CSRF token, and a supported content type. Every manager read/write checks membership for the requested edition; writable roles are owner, manager, and editor.
- Google OpenID Connect uses a short-lived, single-use, server-side state transaction. Set the three `GOOGLE_*` variables and register the exact redirect URI with Google. If absent, the UI receives an explicit configuration error; there is no demo authentication endpoint.
- Uploads accept validated JPEG, PNG, and WebP images up to `MAX_UPLOAD_BYTES`. Pillow checks actual content, filenames are random, persistence is atomic, and normal `/uploads/...` URLs are returned.

Keep `CSRF_SECRET`, database credentials, Google credentials, and deployment secrets in the environment or a secret manager. Terminate TLS at a trusted proxy, enable secure cookies, restrict proxy headers, back up PostgreSQL and `UPLOAD_ROOT` together, and run `alembic upgrade head` as a deployment step.

## Data and migration

`python -m backend.cli seed` idempotently creates the four editions and their token inventory. Analytics copied from the old prototype are marked `seed_demo` and are not live sales, payment, WhatsApp, emergency, or reporting integrations.

Legacy browser data is never imported automatically. An authorized manager may explicitly load `assets/memora-local-migration.js` and run:

```js
await window.MemoraLocalMigration.run()
```

It restricts imports to writable memberships, converts supported data URLs to files, preserves legacy IDs, relies on server idempotency, reports imported/skipped/duplicate/failed items, and leaves legacy keys untouched. `memora.access.v1` is deliberately ignored. Outside this compatibility module, local storage is limited to the non-sensitive manager theme preference.

## Verification

```bash
pytest
alembic upgrade head
python -m backend.cli seed
git diff --check
git status --short
rg -n "localStorage|sessionStorage" .
```

