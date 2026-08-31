# Memora Studio — pacote de imagens da home

Este pacote contém as imagens usadas pelo site do Memora Studio em `memorastudio/assets/images/`.

## Arquivos principais

- `studio-hero.webp`: hero principal, com a logo oficial integrada à parede.
- `studio-hero-clean.webp`: versão alternativa sem logo embutida, ideal para sobrepor a logo oficial com HTML/CSS.
- `studio-cta.webp`: imagem panorâmica da chamada final.
- `session-reckless.webp`, `session-aura.webp`, `session-fourkaos.webp` e `session-distance-and-belief.webp`: cards da seção Recorded at Memora Studio.
- `sala-01.webp`, `sala-02.webp` e `sala-03.webp`: imagens da seção de salas.
- `memora-studio-logo.png` e `memora-studio-logo-icon.png`: arquivos oficiais enviados pelo proprietário da marca.

## Implementação recomendada

Use `object-fit: cover` nos cards e `background-size: cover` no hero/CTA. Os textos, botões, ícones, efeitos e controles devem ser construídos em HTML/CSS, e não incorporados às imagens. Preserve o canal alpha dos PNGs das logos e não aplique filtros de cor neles.

As imagens das sessions representam músicos fictícios e funcionam como material visual demonstrativo; elas não são fotografias reais das bandas nomeadas.
