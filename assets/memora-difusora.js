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

  const formatCompactDateTime = (createdAt) => {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "Agora";

    const formatted = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(date);

    return formatted.replace(" de ", " ").replace(" de ", " ").replace(", ", " - ");
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

  const compactPost = (post, index, count) => {
    const dateTime = formatCompactDateTime(post.createdAt);
    const createdAt = new Date(post.createdAt);
    const dateTimeAttribute = Number.isNaN(createdAt.getTime()) ? "" : ` datetime="${escapeHtml(createdAt.toISOString())}"`;

    return `
      <article class="biplano-difusora-compact-post">
        <div class="biplano-difusora-compact-content">
          <header><strong>${escapeHtml(post.author || "Manager Memora")} publicou:</strong><time${dateTimeAttribute}>${escapeHtml(dateTime)}</time></header>
          <p>${escapeHtml(post.text)}</p>
        </div>
        <div class="biplano-difusora-compact-navigation" aria-label="Navega&ccedil;&atilde;o entre comunicados">
          <button type="button" data-difusora-navigate="-1" aria-label="Exibir publica&ccedil;&atilde;o anterior" ${count < 2 ? "disabled" : ""}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 15 7-7 7 7"/></svg></button>
          <button type="button" data-difusora-navigate="1" aria-label="Exibir pr&oacute;xima publica&ccedil;&atilde;o" ${count < 2 ? "disabled" : ""}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 9 7 7 7-7"/></svg></button>
        </div>
        <span class="sr-only">Comunicado ${index + 1} de ${count}</span>
      </article>
    `;
  };

  const renderCompactFeed = (feed, posts) => {
    if (!posts.length) { feed.dataset.difusoraIndex = "0"; feed.innerHTML = emptyState(feed.dataset.editionName); return; }
    const currentIndex = Number(feed.dataset.difusoraIndex || 0);
    const index = Number.isInteger(currentIndex) ? ((currentIndex % posts.length) + posts.length) % posts.length : 0;
    feed.dataset.difusoraIndex = String(index);
    feed.innerHTML = compactPost(posts[index], index, posts.length);
  };

  const renderFeed = (feed) => {
    const editionId = getEditionId(feed);
    const editionName = feed.dataset.editionName || document.body?.dataset.editionName || "";
    const posts = getEditionPosts(editionId);

    if (feed.hasAttribute("data-difusora-compact")) {
      renderCompactFeed(feed, posts);
      return;
    }

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

    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-difusora-navigate]");
      if (!button || button.disabled) return;
      const feed = button.closest("[data-edition-difusora-feed]");
      if (!feed) return;
      const direction = Number(button.dataset.difusoraNavigate);
      feed.dataset.difusoraIndex = String(Number(feed.dataset.difusoraIndex || 0) + direction);
      renderFeed(feed);
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
