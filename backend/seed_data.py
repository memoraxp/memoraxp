from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import Edition, Token


# Analytics, collectors, contacts and sales below are explicitly demo/seed UI data
# transcribed from the original static manager script. They are not operational data.
EDITIONS = [
    {
        "slug": "aura", "name": "Edição Aura", "module": "Artist", "status": "ativa", "token_code": "AURA", "token_total": 100,
        "unit_price": 35, "public_page": "edicao-aura.html", "manager_page": "manager-aura.html",
        "configuration": {"seed_demo": True, "image": "assets/Capa.jpg", "tile": "assets/MC1.png", "titleLogo": "assets/Aura logo.png", "digitalCard": {"front": "assets/WP04.png", "back": "assets/WP03.png"}, "wallpapers": [{"name": "WP03.png", "src": "assets/WP03.png"}, {"name": "WP04.png", "src": "assets/WP04.png"}], "sold": 42, "activeTokens": 31, "qrReads": 621, "checkins": 0, "revenue": "R$ 1.470,00", "stock": 27, "campaign": "R$ 6.800,00 de R$ 10.000,00"},
    },
    {
        "slug": "distance", "name": "Edição Distance And Belief", "module": "Music", "status": "ativa", "token_code": "ADAB", "token_total": 100,
        "unit_price": 35, "public_page": "edicao-distance-and-belief.html", "manager_page": "manager-distance-and-belief.html",
        "configuration": {"seed_demo": True, "image": "assets/Capa.jpg", "tile": "assets/MC2.png", "titleLogo": "assets/distance.png", "digitalCard": {"front": "assets/distance-card-front.png", "back": "assets/distance-card-back.png"}, "wallpapers": [{"name": "WP01.png", "src": "assets/WP01.png"}, {"name": "WP02.png", "src": "assets/WP02.png"}], "sold": 57, "activeTokens": 36, "qrReads": 304, "checkins": 0, "revenue": "R$ 1.995,00", "stock": 7, "campaign": "Campanha não ativa neste módulo"},
    },
    {
        "slug": "fourkaos", "name": "Edição Fourkaos", "module": "Stage", "status": "ativa", "token_code": "FKOS", "token_total": 100,
        "unit_price": 35, "public_page": "edicao-fourkaos.html", "manager_page": "manager-fourkaos.html",
        "configuration": {"seed_demo": True, "image": "assets/fourkaos-background.jpg", "tile": "assets/MC3.png", "titleLogo": "assets/LOGO FOURKAOS.png", "digitalCard": {"front": "assets/WP07.png", "back": "assets/WP08.png"}, "wallpapers": [{"name": "WP07.png", "src": "assets/WP07.png"}, {"name": "WP08.png", "src": "assets/WP08.png"}], "sold": 68, "activeTokens": 24, "qrReads": 774, "checkins": 241, "revenue": "R$ 2.380,00", "stock": 8, "campaign": "R$ 11.420,00 de R$ 16.000,00"},
    },
    {
        "slug": "toninho-borbo-biplano", "name": "Edição Toninho Borbo | Biplano", "module": "Music", "status": "ativa", "token_code": "TBRB", "token_total": 100,
        "unit_price": 35, "public_page": "edicao-toninho-borbo-biplano.html", "manager_page": "manager-toninho-borbo-biplano.html",
        "configuration": {"seed_demo": True, "image": "assets/Capatoninho.jpg", "tile": "assets/MC4.png", "titleLogo": "assets/toninho-biplano-logo.png", "digitalCard": {"front": "assets/Capatoninho.jpg", "back": "assets/WP02.png"}, "wallpapers": [{"name": "WP01.png", "src": "assets/WP01.png"}, {"name": "WP02.png", "src": "assets/WP02.png"}], "sold": 67, "activeTokens": 0, "qrReads": 412, "checkins": 0, "revenue": "R$ 2.345,00", "stock": 33, "campaign": "R$ 7.200,00 de R$ 12.000,00"},
    },
]


def seed(db: Session) -> dict[str, int]:
    edition_count = token_count = 0
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
    db.commit()
    return {"editions_created": edition_count, "tokens_created": token_count}
