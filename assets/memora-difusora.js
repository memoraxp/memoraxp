(() => {
  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const formatDateTime = (createdAt) => {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "Agora";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getEditionId = (element) => element.dataset.editionId
    || element.closest("[data-edition-id]")?.dataset.editionId
    || document.body?.dataset.editionId
    || "";

  const emptyState = (editionName) => `
    <article class="biplano-difusora-empty">
      <header><strong>Sem comunicados ainda</strong><small>Difusora</small></header>
      <p>Quando o manager publicar uma mensagem para ${escapeHtml(editionName || "esta edição")}, ela aparece aqui com data, hora e assinatura.</p>
    </article>
  `;

  const errorState = () => `
    <article class="biplano-difusora-empty" data-difusora-state="error">
      <header><strong>Difusora indisponível</strong><small>Erro</small></header>
      <p>Não foi possível carregar os comunicados agora. Tente novamente mais tarde.</p>
    </article>
  `;

  const renderFeed = async (feed) => {
    const editionId = getEditionId(feed);
    const editionName = feed.dataset.editionName || document.body?.dataset.editionName || "";
    if (!editionId) return;
    try {
      const posts = await window.MemoraAPI.get(`/api/editions/${encodeURIComponent(editionId)}/difusora`);
      feed.innerHTML = posts.length ? posts.map((post) => `
        <article data-difusora-post="${escapeHtml(post.id)}">
          <header>
            <strong>${escapeHtml(post.author || "Manager Memora")}</strong>
            <small>${escapeHtml(formatDateTime(post.created_at))}</small>
          </header>
          <p>${escapeHtml(post.text)}</p>
          <footer>
            <span>${escapeHtml(editionName || "Edição Memora")}</span>
            <span>${escapeHtml(post.tag || "comunicado")}</span>
          </footer>
        </article>
      `).join("") : emptyState(editionName);
    } catch (error) {
      feed.innerHTML = errorState();
      console.error("Difusora API request failed", { editionId, error });
    }
  };

  const renderFeeds = () => Promise.all(Array.from(document.querySelectorAll("[data-edition-difusora-feed]"), renderFeed));

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-difusora-clear]").forEach((button) => button.remove());
    renderFeeds();
    window.addEventListener("focus", renderFeeds);
    window.addEventListener("memora:difusora:refresh", renderFeeds);
  });
})();
