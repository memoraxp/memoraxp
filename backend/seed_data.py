from __future__ import annotations

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import CapsuleEntry, Edition, Token, User


# Analytics, collectors, contacts and sales below are explicitly demo/seed UI data
# transcribed from the original static manager script. They are not operational data.
EDITIONS = [
    {
        "slug": "aura", "name": "Edição Aura", "module": "Artist", "status": "ativa", "token_code": "AURA", "token_total": 100,
        "unit_price": 35, "public_page": "edicao-aura.html", "manager_page": "manager-aura.html",
        "configuration": {"seed_demo": True, "sold": 42, "activeTokens": 31, "qrReads": 621, "checkins": 0, "revenue": "R$ 1.470,00", "stock": 27, "campaign": "R$ 6.800,00 de R$ 10.000,00"},
    },
    {
        "slug": "distance", "name": "Edição Distance And Belief", "module": "Music", "status": "ativa", "token_code": "ADAB", "token_total": 100,
        "unit_price": 35, "public_page": "edicao-distance-and-belief.html", "manager_page": "manager-distance-and-belief.html",
        "configuration": {"seed_demo": True, "sold": 57, "activeTokens": 36, "qrReads": 304, "checkins": 0, "revenue": "R$ 1.995,00", "stock": 7, "campaign": "Campanha não ativa neste módulo"},
    },
    {
        "slug": "fourkaos", "name": "Edição Fourkaos", "module": "Stage", "status": "ativa", "token_code": "FKOS", "token_total": 100,
        "unit_price": 35, "public_page": "edicao-fourkaos.html", "manager_page": "manager-fourkaos.html",
        "configuration": {"seed_demo": True, "sold": 68, "activeTokens": 24, "qrReads": 774, "checkins": 241, "revenue": "R$ 2.380,00", "stock": 8, "campaign": "R$ 11.420,00 de R$ 16.000,00"},
    },
    {
        "slug": "toninho-borbo-biplano", "name": "Edição Toninho Borbo | Biplano", "module": "Music", "status": "ativa", "token_code": "TBRB", "token_total": 100,
        "unit_price": 35, "public_page": "edicao-toninho-borbo-biplano.html", "manager_page": "manager-toninho-borbo-biplano.html",
        "configuration": {"seed_demo": True, "sold": 67, "activeTokens": 0, "qrReads": 412, "checkins": 0, "revenue": "R$ 2.345,00", "stock": 33, "campaign": "R$ 7.200,00 de R$ 12.000,00"},
    },
]

CAPSULE_DATES = ["2026-03-14", "2026-06-12", "2026-08-15", "2026-09-06", "2026-09-22", "2026-10-03"]
CAPSULE_SEED = {
    "aura": {
        "memories": [
            "Foto da montagem da exposicao",
            "Relato da artista sobre a primeira tiragem",
            "Prints dos primeiros colecionadores",
        ],
    },
    "distance": {
        "memories": ["Video de ensaio", "Making of da capa", "Playlist comentada faixa a faixa"],
    },
    "fourkaos": {
        "memories": ["Check-ins da noite", "Setlist fotografado", "Relatos da comunidade no pós-show"],
    },
    "toninho-borbo-biplano": {
        "memories": ["Entrevista de 2016 sobre Biplano", "Faixas favoritas do Toninho", "Registros da criação do album"],
    },
}


def capsule_seed_rows(edition: Edition) -> list[dict]:
    values = CAPSULE_SEED[edition.slug]
    texts = [
        f"Início do arquivo da {edition.name}.",
        *values["memories"],
        "Novas memórias da comunidade entram neste arquivo após curadoria.",
        "Linha do tempo da edição atualizada.",
    ]
    return [
        {
            "legacy_id": f"seed-demo:{edition.slug}:capsule:{index:02d}",
            "event_date": date.fromisoformat(event_date),
            "text": text,
        }
        for index, (event_date, text) in enumerate(zip(CAPSULE_DATES, texts, strict=True), start=1)
    ]


def seed(db: Session) -> dict[str, int]:
    edition_count = token_count = capsule_count = 0
    seed_user = db.scalar(select(User).where(User.email == "seed@memora.local"))
    if not seed_user:
        seed_user = User(email="seed@memora.local", display_name="Memora")
        db.add(seed_user)
        db.flush()
    existing_serials = set(db.scalars(select(Token.serial)).all())
    for values in EDITIONS:
        edition = db.scalar(select(Edition).where(Edition.slug == values["slug"]))
        if not edition:
            edition = Edition(**values)
            db.add(edition); db.flush(); edition_count += 1
        for number in range(1, edition.token_total + 1):
            serial = f"{edition.token_code}-{number:03d}"
            if serial not in existing_serials:
                db.add(Token(edition_id=edition.id, serial=serial)); token_count += 1
                existing_serials.add(serial)
        existing_legacy_ids = set(
            db.scalars(
                select(CapsuleEntry.legacy_id).where(
                    CapsuleEntry.edition_id == edition.id,
                    CapsuleEntry.legacy_id.like(f"seed-demo:{edition.slug}:capsule:%"),
                )
            ).all()
        )
        for capsule_values in capsule_seed_rows(edition):
            if capsule_values["legacy_id"] in existing_legacy_ids:
                continue
            db.add(CapsuleEntry(edition_id=edition.id, author_user_id=seed_user.id, **capsule_values))
            capsule_count += 1
    db.commit()
    return {"editions_created": edition_count, "tokens_created": token_count, "capsule_entries_created": capsule_count}
