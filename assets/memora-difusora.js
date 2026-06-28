(() => {
  const storageKey = "memora:difusora:feed";

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const readRecords = () => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.text) : [];
    } catch (error) {
      return [];
    }
  };

  const writeRecords = (records) => {
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  };

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

  const getEditionId = (element) =>
    element.dataset.editionId ||
    element.closest("[data-edition-id]")?.dataset.editionId ||
    document.body?.dataset.editionId ||
    "";

  const getEditionPosts = (editionId) =>
    readRecords()
      .filter((post) => !editionId || post.editionId === editionId)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  const emptyState = (editionName) => `
    <article class="biplano-difusora-empty">
      <header><strong>Sem comunicados ainda</strong><small>Difusora</small></header>
      <p>Quando o manager publicar uma mensagem para ${escapeHtml(editionName || "esta edição")}, ela aparece aqui com data, hora e assinatura.</p>
    </article>
  `;

  const renderFeed = (feed) => {
    const editionId = getEditionId(feed);
    const editionName = feed.dataset.editionName || document.body?.dataset.editionName || "";
    const posts = getEditionPosts(editionId);

    if (!posts.length) {
      feed.innerHTML = emptyState(editionName);
      return;
    }

    feed.innerHTML = posts
      .map(
        (post) => `
          <article>
            <header>
              <strong>${escapeHtml(post.author || "Manager Memora")}</strong>
              <small>${escapeHtml(formatDateTime(post.createdAt))}</small>
            </header>
            <p>${escapeHtml(post.text)}</p>
            <footer>
              <span>${escapeHtml(post.editionName || editionName || "Edição Memora")}</span>
              <span>${escapeHtml(post.tag || "comunicado")}</span>
            </footer>
          </article>
        `
      )
      .join("");
  };

  const renderFeeds = () => {
    document.querySelectorAll("[data-edition-difusora-feed]").forEach(renderFeed);
  };

  const clearHistory = (button) => {
    const editionId = getEditionId(button);
    const shouldClearAll = button.dataset.difusoraClear === "all";

    if (shouldClearAll || !editionId) {
      window.localStorage.removeItem(storageKey);
    } else {
      writeRecords(readRecords().filter((post) => post.editionId !== editionId));
    }

    renderFeeds();
  };

  const bindControls = () => {
    document.querySelectorAll("[data-difusora-clear]").forEach((button) => {
      button.addEventListener("click", () => clearHistory(button));
    });

    window.addEventListener("focus", renderFeeds);
    window.addEventListener("storage", (event) => {
      if (event.key === storageKey) renderFeeds();
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderFeeds();
    bindControls();
  });
})();
