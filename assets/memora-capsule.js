(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const formatDate = (value) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
  const item = (entry) => `<article class="toninho-timeline-mock-item" data-api-capsule-entry><span class="toninho-timeline-mock-marker" aria-hidden="true"></span><div class="toninho-timeline-mock-content">${entry.image_url ? `<img src="${escapeHtml(entry.image_url)}" alt="Foto da recordação">` : ""}<p>${escapeHtml(entry.text)}</p><time datetime="${escapeHtml(entry.event_date)}">${escapeHtml(formatDate(entry.event_date))}</time></div></article>`;
  document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector("#capsula [data-timeline-scroll]");
    const slug = document.body.dataset.editionId;
    if (!timeline || !slug) return;
    try {
      const entries = await window.MemoraAPI.get(`/api/editions/${encodeURIComponent(slug)}/capsule`);
      timeline.querySelectorAll("[data-api-capsule-entry]").forEach((node) => node.remove());
      timeline.insertAdjacentHTML("afterbegin", entries.map(item).join(""));
    } catch (error) { console.error("Capsule API:", error); }
  });
})();

