"""Fail when edition-owned repository image paths enter ordinary runtime code."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SCAN_SUFFIXES = {".html", ".js", ".py", ".css"}
EXCLUDED = {
    Path("scripts/generate_assets.py"),
    Path("scripts/check_legacy_asset_paths.py"),
}
EDITION_FILENAMES = {
    "Capa.jpg", "Capatoninho.jpg", "capadistance.png", "avatareldon.png",
    "Aura logo.png", "distance.png", "LOGO FOURKAOS.png", "toninho-biplano-logo.png",
    "distance-card-front.png", "distance-card-back.png", "fourkaos-background.jpg",
    "fourkaos-band.jpg", "fourkaos-logo-vermelha.png", "toninho-biplano-background.png",
    "aura-memora.png", "memora fk.png", "Memora TB.png", "m2.png",
    "gregg-mervine.jpg", "fundo.png", "fundo.jpg",
    *(f"WP{number:02d}.png" for number in range(1, 9)),
    *(f"MC{number}.png" for number in range(1, 5)),
    *(f"Caneca {number:02d}.png" for number in range(1, 9)),
}
FILENAME_PATTERN = "|".join(re.escape(name) for name in sorted(EDITION_FILENAMES, key=len, reverse=True))
UNSCOPED_PATTERN = re.compile(
    rf"(?:^|[\"'`(= :,])(?:\.\./|\.\/)*?/?assets/(?:{FILENAME_PATTERN})(?=$|[\"'`) ?#])"
    rf"|url\([\"']?(?:{FILENAME_PATTERN})[\"']?\)"
)


def violations() -> list[str]:
    found = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.suffix not in SCAN_SUFFIXES:
            continue
        relative = path.relative_to(ROOT)
        if relative in EXCLUDED or any(part in {".git", ".venv", "node_modules", "__pycache__"} for part in relative.parts):
            continue
        for line_number, line in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), start=1):
            if UNSCOPED_PATTERN.search(line):
                found.append(f"{relative}:{line_number}: {line.strip()}")
    return found


def main() -> int:
    found = violations()
    if found:
        print("Forbidden unscoped edition asset references found:")
        print("\n".join(found))
        return 1
    print("Legacy edition asset path check passed: 0 forbidden references.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
