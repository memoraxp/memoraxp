# Edition asset path audit

All edition-owned runtime image references were removed from HTML, JavaScript, Python configuration/seed data, and CSS. Repository files are read only by the explicit one-time `scripts/generate_assets.py` importer; ordinary startup never scans them.

| Old repository location(s) | Edition | Role | Public filename(s) | Authoritative URL(s) | Runtime code changed |
|---|---|---|---|---|---|
| `assets/Capa.jpg` | Aura | `edition_cover` | `Capa.jpg` | `/assets/aura/Capa.jpg` | public page, manager view model, seed, CSS |
| `assets/MC1.png` | Aura | `edition_tile` | `MC1.png` | `/assets/aura/MC1.png` | manager and collector hives, seed |
| `assets/Aura logo.png` | Aura | `title_logo` | `Aura logo.png` | `/assets/aura/Aura%20logo.png` | public/manager headings, seed |
| `assets/WP03.png`, `assets/WP04.png` | Aura | `wallpaper`, `card_front`, `card_back` | `WP03.png`, `WP04.png`, `aura-card-front.png`, `aura-card-back.png` | `/assets/aura/{public_filename}` | gallery and card theater, seed |
| `assets/capadistance.png` | Distance | `edition_cover` | `capadistance.png` | `/assets/distance/capadistance.png` | public page, manager CSS/VM |
| `assets/MC2.png`, `assets/distance.png` | Distance | `edition_tile`, `title_logo` | `MC2.png`, `distance.png` | `/assets/distance/{public_filename}` | manager/collector hives and headings |
| `assets/distance-card-front.png`, `assets/distance-card-back.png`, `assets/WP01.png`, `assets/WP02.png` | Distance | card and wallpaper roles | source filenames | `/assets/distance/{public_filename}` | card theater and gallery |
| `assets/fourkaos-background.jpg` | Fourkaos | `edition_cover` | `fourkaos-background.jpg` | `/assets/fourkaos/fourkaos-background.jpg` | public page, manager CSS/VM |
| `assets/MC3.png`, `assets/LOGO FOURKAOS.png` | Fourkaos | `edition_tile`, `title_logo` | source filenames | `/assets/fourkaos/{public_filename}` | manager/collector hives and headings |
| `assets/WP07.png`, `assets/WP08.png` | Fourkaos | card and wallpaper roles | `WP07.png`, `WP08.png`, `fourkaos-card-front.png`, `fourkaos-card-back.png` | `/assets/fourkaos/{public_filename}` | card theater and gallery |
| `assets/Capatoninho.jpg` | Toninho Borbo Biplano | `edition_cover`, card source | `Capatoninho.jpg`, `toninho-card-front.jpg` | `/assets/toninho-borbo-biplano/{public_filename}` | public page, manager CSS/VM |
| `assets/MC4.png`, `assets/toninho-biplano-logo.png` | Toninho Borbo Biplano | `edition_tile`, `title_logo` | source filenames | `/assets/toninho-borbo-biplano/{public_filename}` | manager/collector hives and headings |
| `assets/WP01.png`, `assets/WP02.png` | Toninho Borbo Biplano | card and wallpaper roles | source filenames plus `toninho-card-back.png` | `/assets/toninho-borbo-biplano/{public_filename}` | card theater and gallery |
| `assets/avatareldon.png` | each edition | `illustrator_avatar` | `avatareldon.png` | `/assets/{edition_slug}/avatareldon.png` | public and manager illustrator cards |
| edition token/title artwork (`aura-memora.png`, `m2.png`, `memora fk.png`, `Memora TB.png`) | matching edition | `hero_image` | source filename | `/assets/{edition_slug}/{public_filename}` | public hero image; landing page uses text instead |
| `assets/gregg-mervine.jpg` | each edition | `profile_image` | `gregg-mervine.jpg` | `/assets/{edition_slug}/gregg-mervine.jpg` | public profile panels |
| `assets/Caneca 01.png` through `assets/Caneca 08.png` | matching edition | `product_image` | source filename | `/assets/{edition_slug}/{public_filename}` | public product panels |
| edition backgrounds in `styles.css`, `memora-manager.css`, `memora-id.css` | matching edition | cover/hero roles | API supplied | versioned scoped URL in a CSS custom property | all static edition background URLs removed |

Global `/assets` references intentionally retained: application JavaScript and CSS; `mlogo.png`; `pdf-img-000.png`, `pdf-img-005.png`, `pdf-img-007.png`, `pdf-img-012.png`, and `pdf-img-013.png` Memora branding/interface artwork; `avatar.png` as the generic account avatar; `colmeia.png`; `plane.png`; `memora-xp-coasters.png`; and `memora-xp-crew.png`. These are not edition-owned and remain on the static mount. The static handler rejects every other unscoped image filename, so repository edition artwork cannot remain accessible as a compatibility URL.

Validation status: `python scripts/check_legacy_asset_paths.py` reports no unresolved edition-owned runtime references.
