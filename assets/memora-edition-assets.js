(() => {
  const bySlot = (assets, slot) => assets.filter((asset) => asset.slot === slot);
  document.addEventListener("DOMContentLoaded", async () => {
    const slug = document.body.dataset.editionId;
    if (!slug) return;
    try {
      const assets = await window.MemoraAPI.get(`/api/editions/${encodeURIComponent(slug)}/assets`);
      const cover = bySlot(assets, "edition_cover").at(-1);
      if (cover) document.querySelectorAll("[data-edition-cover-image]").forEach((image) => { image.src = cover.url; });
      const front = bySlot(assets, "card_front").at(-1), back = bySlot(assets, "card_back").at(-1);
      if (front) document.querySelectorAll('[data-card-side="front"], [data-card-image="front"], [data-digital-card-front]').forEach((image) => { image.src = front.url; });
      if (back) document.querySelectorAll('[data-card-side="back"], [data-card-image="back"], [data-digital-card-back]').forEach((image) => { image.src = back.url; image.hidden = false; image.parentElement?.querySelector('[data-digital-card-back-fallback]')?.setAttribute("hidden", ""); });
      const wallpapers = bySlot(assets, "wallpaper");
      document.querySelectorAll("[data-wallpaper-downloads]").forEach((container) => { if (wallpapers.length) container.innerHTML = wallpapers.map((asset) => `<a href="${asset.url}" download>${asset.original_filename}</a>`).join(""); });
      document.querySelectorAll("[data-wallpaper-gallery]").forEach((container) => { if (wallpapers.length) container.innerHTML = wallpapers.map((asset) => `<a class="biplano-wallpaper-thumb" href="${asset.url}" download><img src="${asset.url}" alt="${asset.original_filename}"><span>${asset.original_filename}</span></a>`).join(""); });
    } catch (error) { console.error("Edition assets API:", error); }
  });
})();
