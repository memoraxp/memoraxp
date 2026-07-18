(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const formatDate = (value) => {
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!parts) return String(value || "");
    const localDate = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]), 12);
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(localDate);
  };
  const item = (entry) => `<article class="toninho-timeline-mock-item" data-api-capsule-entry><span class="toninho-timeline-mock-marker" aria-hidden="true"></span><div class="toninho-timeline-mock-content">${entry.image_url ? `<img src="${escapeHtml(entry.image_url)}" alt="Foto da recordação">` : ""}<p>${escapeHtml(entry.text)}</p><time datetime="${escapeHtml(entry.event_date)}">${escapeHtml(formatDate(entry.event_date))}</time></div></article>`;
  const state = (message, kind) => `<article class="toninho-timeline-mock-item" data-api-capsule-state="${escapeHtml(kind)}"><span class="toninho-timeline-mock-marker" aria-hidden="true"></span><div class="toninho-timeline-mock-content"><p>${escapeHtml(message)}</p></div></article>`;

  document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector("#capsula [data-timeline-scroll]");
    const slug = document.body.dataset.editionId;
    if (!timeline || !slug) return;
    timeline.replaceChildren();
    try {
      const entries = await window.MemoraAPI.get(`/api/editions/${encodeURIComponent(slug)}/capsule`);
      timeline.innerHTML = entries.length ? entries.map(item).join("") : state("Ainda não há recordações nesta linha do tempo.", "empty");
      timeline.scrollTop = 0;
    } catch (error) {
      timeline.innerHTML = state("Não foi possível carregar a linha do tempo. Tente novamente mais tarde.", "error");
      console.error("Capsule API request failed", { slug, error });
    }
    document.querySelectorAll("#arte .biplano-menu-toggle").forEach((toggle) => {
      if (toggle.getAttribute("aria-expanded") === "false") toggle.click();
    });
  });
})();
