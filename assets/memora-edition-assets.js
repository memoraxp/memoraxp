(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const byRole = (assets, role) => assets.filter((asset) => asset.role === role);
  const warnMissing = (role) => console.warn(`Memora edition asset '${role}' is not registered for edition '${document.body.dataset.editionId}'.`);

  const applyImageRole = (asset, role, selector) => {
    const nodes = document.querySelectorAll(selector);
    nodes.forEach((image) => {
      if (asset) {
        image.src = asset.url;
        image.dataset.apiAssetUrl = asset.url;
        image.hidden = false;
      } else {
        image.removeAttribute("src");
        delete image.dataset.apiAssetUrl;
        image.hidden = true;
      }
    });
    if (!asset) warnMissing(role);
  };

  const applyAssets = (assets) => {
    const getSingle = (role) => byRole(assets, role).at(-1) || null;
    const cover = getSingle("edition_cover");
    const front = getSingle("card_front");
    const back = getSingle("card_back");
    const titleLogo = getSingle("title_logo");
    const illustratorAvatar = getSingle("illustrator_avatar");
    const heroImage = getSingle("hero_image");
    const profileImage = getSingle("profile_image");
    const productImages = byRole(assets, "product_image");
    const wallpapers = byRole(assets, "wallpaper");

    applyImageRole(cover, "edition_cover", "[data-edition-cover-image]");
    applyImageRole(front, "card_front", '[data-card-side="front"], [data-card-image="front"], [data-digital-card-front]');
    applyImageRole(back, "card_back", '[data-card-side="back"], [data-card-image="back"], [data-digital-card-back]');
    applyImageRole(titleLogo, "title_logo", "[data-title-logo]");
    applyImageRole(illustratorAvatar, "illustrator_avatar", "[data-illustrator-avatar]");
    applyImageRole(heroImage, "hero_image", "[data-edition-hero-image]");
    applyImageRole(profileImage, "profile_image", "[data-profile-image]");
    document.querySelectorAll("[data-product-image-index]").forEach((image) => {
      const asset = productImages[Number(image.dataset.productImageIndex)] || null;
      if (asset) {
        image.src = asset.url;
        image.hidden = false;
      } else {
        image.removeAttribute("src");
        image.hidden = true;
      }
    });
    if (!productImages.length) warnMissing("product_image");
    document.body.style.setProperty("--edition-cover-image", cover ? `url("${cover.url}")` : "none");
    document.body.style.setProperty("--edition-hero-image", heroImage ? `url("${heroImage.url}")` : "none");

    document.querySelectorAll("[data-edition-cover-open]").forEach((button) => { button.hidden = !cover; });
    document.querySelectorAll("[data-title-logo-fallback]").forEach((heading) => { heading.hidden = Boolean(titleLogo); });
    document.querySelectorAll("[data-digital-card-back-fallback]").forEach((fallback) => { fallback.hidden = Boolean(back); });
    document.querySelectorAll("[data-card-front-missing]").forEach((fallback) => { fallback.hidden = Boolean(front); });

    const downloads = document.querySelectorAll("[data-wallpaper-downloads]");
    const galleries = document.querySelectorAll("[data-wallpaper-gallery]");
    const wallpaperMarkup = wallpapers.length
      ? wallpapers.map((asset) => `<a class="biplano-wallpaper-thumb" href="${escapeHtml(asset.url)}" download="${escapeHtml(asset.public_filename)}" aria-label="Baixar ${escapeHtml(asset.public_filename)}"><img src="${escapeHtml(asset.url)}" alt="${escapeHtml(asset.public_filename)}"><span>${escapeHtml(asset.public_filename)}</span></a>`).join("")
      : '<p class="biplano-empty-state">Nenhum wallpaper cadastrado.</p>';
    downloads.forEach((container) => { container.innerHTML = wallpaperMarkup; });
    galleries.forEach((container) => {
      container.dataset.apiAssetsApplied = "true";
      container.innerHTML = wallpaperMarkup;
    });
    if (!wallpapers.length) warnMissing("wallpaper");
  };

  const refresh = async () => {
    const slug = document.body.dataset.editionId;
    if (!slug) return [];
    const assets = await window.MemoraAPI.get(`/api/editions/${encodeURIComponent(slug)}/assets`);
    applyAssets(assets);
    document.dispatchEvent(new CustomEvent("memora:edition-assets-ready", { detail: { assets } }));
    return assets;
  };

  window.MemoraEditionAssets = { apply: applyAssets, refresh, byRole };
  document.addEventListener("DOMContentLoaded", () => {
    window.MemoraEditionAssets.ready = refresh().catch((error) => {
      console.error("Edition assets API request failed", error);
      document.dispatchEvent(new CustomEvent("memora:edition-assets-ready", { detail: { assets: [], error } }));
      return [];
    });
  });
})();
