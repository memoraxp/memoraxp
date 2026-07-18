from __future__ import annotations

import argparse
import getpass
import os
from datetime import datetime, timezone

from sqlalchemy import select

from backend.config import get_settings, sqlite_database_path
from backend.database import SessionLocal
from backend.models import Edition, EditionMembership, PasswordCredential, User
from backend.security import hash_password
from backend.seed_data import seed
from backend.services import get_capsule_entries


def create_manager(args) -> None:
    password = os.environ.get(args.password_env) if args.password_env else None
    password = password or getpass.getpass("Manager password: ")
    confirmation = password if args.password_env else getpass.getpass("Confirm password: ")
    if password != confirmation:
        raise SystemExit("Passwords must match and contain at least 12 characters.")
    with SessionLocal() as db:
        edition = db.scalar(select(Edition).where(Edition.slug == args.edition))
        if not edition:
            raise SystemExit("Edition not found. Run the seed command first.")
        email = args.email.strip().lower()
        user = db.scalar(select(User).where(User.email == email))
        if not user:
            user = User(email=email, display_name=args.display_name)
            db.add(user); db.flush()
        if user.password_credential:
            user.password_credential.password_hash = hash_password(password)
            user.password_credential.password_changed_at = datetime.now(timezone.utc)
        else:
            db.add(PasswordCredential(user_id=user.id, password_hash=hash_password(password)))
        membership = db.scalar(select(EditionMembership).where(EditionMembership.user_id == user.id, EditionMembership.edition_id == edition.id))
        if not membership:
            db.add(EditionMembership(user_id=user.id, edition_id=edition.id, role=args.role))
        db.commit()
    print(f"Manager {email} can access {edition.slug} as {args.role}.")


def inspect_capsule(edition_slug: str) -> None:
    database_path = sqlite_database_path(get_settings().database_url)
    print(f"database_path: {database_path if database_path else '<non-SQLite database>'}")
    with SessionLocal() as db:
        edition = db.scalar(select(Edition).where(Edition.slug == edition_slug))
        if not edition:
            raise SystemExit(f"Edition not found: {edition_slug}")
        entries = get_capsule_entries(db, edition.id)
        print(f"edition_slug: {edition.slug}")
        print(f"active_capsule_entries: {len(entries)}")
        for entry in entries:
            print(f"{entry.id}\t{entry.event_date.isoformat()}\t{entry.legacy_id or '-'}\t{entry.text}")


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m backend.cli")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("seed", help="Seed the four editions and token inventory")
    manager = sub.add_parser("create-manager", help="Create/update a manager and membership")
    manager.add_argument("--email", required=True)
    manager.add_argument("--display-name", required=True)
    manager.add_argument("--edition", required=True)
    manager.add_argument("--role", choices=["owner", "manager", "editor", "viewer"], default="manager")
    manager.add_argument("--password-env", help="Read the password from this environment variable")
    inspect = sub.add_parser("inspect-capsule", help="Inspect active database timeline entries")
    inspect.add_argument("--edition", required=True)
    args = parser.parse_args()
    if args.command == "seed":
        with SessionLocal() as db:
            print(seed(db))
    elif args.command == "create-manager":
        create_manager(args)
    else:
        inspect_capsule(args.edition)


if __name__ == "__main__":
    main()
