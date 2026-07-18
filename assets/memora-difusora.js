(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const formatDate = (value) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  const editionSlug = (element) => element.dataset.editionId || element.closest("[data-edition-id]")?.dataset.editionId || document.body.dataset.editionId;
  const render = async (feed) => {
    const slug = editionSlug(feed);
    if (!slug) return;
    try {
      const posts = await window.MemoraAPI.get(`/api/editions/${encodeURIComponent(slug)}/difusora`);
      feed.innerHTML = posts.length ? posts.map((post) => `<article><header><strong>${escapeHtml(post.author)}</strong><small>${escapeHtml(formatDate(post.created_at))}</small></header><p>${escapeHtml(post.text)}</p><footer><span>${escapeHtml(post.tag || "comunicado")}</span></footer></article>`).join("") : `<article class="biplano-difusora-empty"><header><strong>Sem comunicados ainda</strong><small>Difusora</small></header><p>Os novos comunicados desta edição aparecerão aqui.</p></article>`;
    } catch (error) {
      feed.innerHTML = `<article><p>Não foi possível carregar a Difusora. ${escapeHtml(error.message)}</p></article>`;
    }
  };
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-edition-difusora-feed]").forEach(render);
    document.querySelectorAll("[data-difusora-clear]").forEach((button) => button.remove());
  });
})();
