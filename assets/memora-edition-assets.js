(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const bySlot = (assets, slot) => assets.filter((asset) => asset.slot === slot);
  const warnMissing = (slot, selector) => console.warn(`Memora edition asset '${slot}' has no matching element for selector: ${selector}`);

  const applyImageSlot = (asset, slot, selector, callback) => {
    if (!asset) return;
    const nodes = document.querySelectorAll(selector);
    if (!nodes.length) warnMissing(slot, selector);
    nodes.forEach((image) => {
      image.src = asset.url;
      image.dataset.apiAssetUrl = asset.url;
      callback?.(image);
    });
  };

  const applyAssets = (assets) => {
    const cover = bySlot(assets, "edition_cover").at(-1);
    const front = bySlot(assets, "card_front").at(-1);
    const back = bySlot(assets, "card_back").at(-1);
    const wallpapers = bySlot(assets, "wallpaper");

    applyImageSlot(cover, "edition_cover", "[data-edition-cover-image]");
    applyImageSlot(front, "card_front", '[data-card-side="front"], [data-card-image="front"], [data-digital-card-front]');
    applyImageSlot(back, "card_back", '[data-card-side="back"], [data-card-image="back"], [data-digital-card-back]', (image) => {
      image.hidden = false;
      image.parentElement?.querySelector("[data-digital-card-back-fallback]")?.setAttribute("hidden", "");
    });

    if (wallpapers.length) {
      const downloads = document.querySelectorAll("[data-wallpaper-downloads]");
      const galleries = document.querySelectorAll("[data-wallpaper-gallery]");
      if (!downloads.length && !galleries.length) warnMissing("wallpaper", "[data-wallpaper-downloads], [data-wallpaper-gallery]");
      downloads.forEach((container) => {
        container.innerHTML = wallpapers.map((asset) => `<a href="${escapeHtml(asset.url)}" download="${escapeHtml(asset.original_filename)}">${escapeHtml(asset.original_filename)}</a>`).join("");
      });
      galleries.forEach((container) => {
        container.dataset.apiAssetsApplied = "true";
        container.innerHTML = wallpapers.map((asset) => `<a class="biplano-wallpaper-thumb" href="${escapeHtml(asset.url)}" download="${escapeHtml(asset.original_filename)}" aria-label="Baixar ${escapeHtml(asset.original_filename)}"><img src="${escapeHtml(asset.url)}" alt="${escapeHtml(asset.original_filename)}"><span>${escapeHtml(asset.original_filename)}</span></a>`).join("");
      });
    }
  };

  const refresh = async () => {
    const slug = document.body.dataset.editionId;
    if (!slug) return [];
    const assets = await window.MemoraAPI.get(`/api/editions/${encodeURIComponent(slug)}/assets`);
    applyAssets(assets);
    return assets;
  };

  window.MemoraEditionAssets = { apply: applyAssets, refresh };
  document.addEventListener("DOMContentLoaded", () => refresh().catch((error) => console.error("Edition assets API request failed", error)));
})();
