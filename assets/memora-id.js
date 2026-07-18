(() => {
  const state = { activeTokenIndex: 0 };
  let hiveScrollFrame = 0;
  let dashboard = null;

  const escapeHtml = (value) =>
    String(value ?? "")
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
  const getHiveCells = () => Array.from(document.querySelectorAll("[data-token-index]"));

  const renderProfile = (profile, profileStats = {}) => {
    const name = document.querySelector("[data-profile-name]");
    const handle = document.querySelector("[data-profile-handle]");
    const contact = document.querySelector("[data-profile-contact]");
    const role = document.querySelector("[data-profile-role]");
    const avatar = document.querySelector("[data-profile-avatar]");
    const statsNode = document.querySelector("[data-profile-stats]");

    if (name) name.textContent = profile.display_name;
    if (handle) handle.textContent = profile.email;
    if (contact) contact.innerHTML = `<span>${escapeHtml(profile.email)}</span>`;
    if (role) role.textContent = "Colecionador de experiências";

    if (avatar) {
      avatar.src = profile.avatar_url || "assets/avatar.png";
      avatar.alt = `Avatar do colecionador ${profile.display_name}`;
    }

    if (statsNode) {
      statsNode.innerHTML = Object.entries(profileStats)
        .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
        .join("");
    }
  };

  const syncHiveEdgePadding = () => {
    const viewport = document.querySelector("[data-hive-viewport]");
    const track = document.querySelector("[data-token-grid]");
    const firstCell = getHiveCells()[0];
    if (!viewport || !track || !firstCell) return;

    const edgePadding = Math.max(0, (viewport.clientWidth - firstCell.offsetWidth) / 2);
    track.style.paddingInline = `${edgePadding}px`;
  };

  const animateHiveScroll = (viewport, left, behavior) => {
    window.cancelAnimationFrame(hiveScrollFrame);

    if (behavior === "auto" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      viewport.scrollTo({ left, behavior: "auto" });
      return;
    }

    const start = viewport.scrollLeft;
    const distance = left - start;
    const duration = 260;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      viewport.scrollLeft = start + distance * eased;

      if (progress < 1) {
        hiveScrollFrame = window.requestAnimationFrame(tick);
      }
    };

    hiveScrollFrame = window.requestAnimationFrame(tick);
  };

  const centerActiveCell = (behavior = "smooth") => {
    const viewport = document.querySelector("[data-hive-viewport]");
    const activeCell = document.querySelector("[data-token-index].is-active");
    if (!viewport || !activeCell) return;

    syncHiveEdgePadding();
    const left = activeCell.offsetLeft - (viewport.clientWidth - activeCell.offsetWidth) / 2;
    animateHiveScroll(viewport, left, behavior);
  };

  const syncTokenState = (options = {}) => {
    const cells = getHiveCells();
    const counter = document.querySelector("[data-token-counter]");
    if (!cells.length) return;

    if (counter) counter.textContent = `${state.activeTokenIndex + 1} / ${cells.length}`;

    cells.forEach((cell, index) => {
      const isActive = index === state.activeTokenIndex;
      cell.classList.toggle("is-active", isActive);
      if (isActive) {
        cell.setAttribute("aria-current", "true");
      } else {
        cell.removeAttribute("aria-current");
      }

      if (isActive && options.flash) {
        cell.classList.remove("is-flashing");
        void cell.offsetWidth;
        cell.classList.add("is-flashing");
      }
    });

    if (options.scroll) centerActiveCell();
  };

  function setActiveToken(index) {
    const cells = getHiveCells();
    if (!cells.length) return;
    state.activeTokenIndex = (index + cells.length) % cells.length;
    syncTokenState({ scroll: true, flash: true });
  }

  const getProfileMenuElements = () => ({
    button: document.querySelector("[data-profile-toggle]"),
    menu: document.querySelector("[data-profile-menu]"),
  });

  const profileMenuTransitionFallback = 2100;

  const setProfileMenuOpen = (isOpen, options = {}) => {
    const { button, menu } = getProfileMenuElements();
    if (!button || !menu) return;

    window.clearTimeout(menu.profileCloseTimer);
    if (menu.profileTransitionEnd) {
      menu.removeEventListener("transitionend", menu.profileTransitionEnd);
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    button.setAttribute("aria-expanded", String(isOpen));

    const finishOpen = () => {
      if (button.getAttribute("aria-expanded") !== "true") return;
      menu.style.height = "auto";
      menu.style.overflow = "auto";
    };

    const finishClose = () => {
      if (button.getAttribute("aria-expanded") === "true") return;
      menu.hidden = true;
      menu.style.height = "";
      menu.style.overflow = "";

      if (options.focusTrigger) {
        button.focus();
      }
    };

    if (isOpen) {
      menu.hidden = false;
      menu.classList.remove("is-open");
      menu.style.overflow = "hidden";
      menu.style.height = "0px";
      void menu.offsetHeight;
      menu.classList.add("is-open");

      if (reduceMotion) {
        finishOpen();
        return;
      }

      const targetHeight = menu.scrollHeight;
      menu.style.height = `${targetHeight}px`;

      menu.profileTransitionEnd = (event) => {
        if (event.propertyName !== "height") return;
        menu.removeEventListener("transitionend", menu.profileTransitionEnd);
        finishOpen();
      };
      menu.addEventListener("transitionend", menu.profileTransitionEnd);
      menu.profileCloseTimer = window.setTimeout(finishOpen, profileMenuTransitionFallback);
      return;
    }

    menu.style.overflow = "hidden";
    menu.style.height = `${menu.scrollHeight}px`;
    void menu.offsetHeight;
    menu.classList.remove("is-open");

    if (reduceMotion) {
      finishClose();
      return;
    }

    menu.style.height = "0px";
    menu.profileTransitionEnd = (event) => {
      if (event.propertyName !== "height") return;
      menu.removeEventListener("transitionend", menu.profileTransitionEnd);
      finishClose();
    };
    menu.addEventListener("transitionend", menu.profileTransitionEnd);
    menu.profileCloseTimer = window.setTimeout(finishClose, profileMenuTransitionFallback);
  };

  const toggleProfileMenu = () => {
    const { menu } = getProfileMenuElements();
    if (!menu) return;
    setProfileMenuOpen(menu.hidden);
  };

  const closeProfileMenu = (options = {}) => {
    const { menu } = getProfileMenuElements();
    if (!menu || menu.hidden) return;
    setProfileMenuOpen(false, options);
  };

  const renderHive = () => {
    const grid = document.querySelector("[data-token-grid]");
    if (grid && dashboard) {
      grid.innerHTML = dashboard.tokens.length
        ? dashboard.tokens.map((token, index) => `<a class="memora-id-honeycomb-cell" href="/${escapeHtml(token.edition.public_page)}" data-token-index="${index}" aria-label="Abrir ${escapeHtml(token.edition.name)}"><img src="${escapeHtml(token.edition.image || "assets/mlogo.png")}" alt="${escapeHtml(token.serial)}"></a>`).join("")
        : '<p class="memora-id-empty-state">Você ainda não ativou nenhum token.</p>';
    }
    getHiveCells().forEach((cell) => {
      cell.addEventListener("click", (event) => {
        if (Number(cell.dataset.tokenIndex) === state.activeTokenIndex) return;
        event.preventDefault();
        setActiveToken(Number(cell.dataset.tokenIndex));
      });
    });
    window.addEventListener("resize", () => centerActiveCell("auto"));
    syncTokenState();
    requestAnimationFrame(() => centerActiveCell("auto"));
  };

  const renderDifusora = () => {
    const feed = document.querySelector("[data-difusora-feed]");
    if (!feed) return;
    const posts = dashboard?.difusora || [];
    feed.innerHTML = posts.length
      ? posts.map(
        (post) => `
          <article>
            <header><strong>${escapeHtml(post.author)}</strong><small>${escapeHtml(formatDateTime(post.created_at))}</small></header>
            <p>${escapeHtml(post.text)}</p>
            <footer><span>${escapeHtml(post.tag || "comunicado")}</span><span>${escapeHtml(post.edition_slug || "Memora")}</span></footer>
          </article>
        `
      )
      .join("")
      : '<article class="memora-id-feed-empty"><header><strong>Sem comunicados ainda</strong><small>Difusora</small></header><p>Os comunicados das suas edições aparecerão aqui.</p></article>';
  };

  const renderUpdates = () => {
    const list = document.querySelector("[data-updates-list]");
    if (!list) return;
    const updates = dashboard?.updates || [];
    list.innerHTML = updates.length
      ? updates.map((item) => `<li><time>${escapeHtml(item.date)}</time><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></li>`).join("")
      : '<li class="memora-id-timeline-empty"><time>Agora</time><h3>Nenhuma atualização</h3><p>Novidades dos seus tokens aparecerão nesta linha do tempo.</p></li>';
  };

  const refreshCollectorDashboard = async () => {
    dashboard = await window.MemoraAPI.get("/api/me/dashboard");
    renderDifusora();
    renderUpdates();
    return dashboard;
  };

  const openModal = (title) => {
    const modal = document.querySelector("[data-mock-modal]");
    if (!modal) return;

    modal.hidden = false;
    modal.querySelector("[data-modal-title]").textContent = title;
    modal.querySelector("[data-modal-body]").textContent = `${title} esta representado com dados mockados e sem integracao externa nesta versao.`;
    modal.querySelector("[data-modal-close]")?.focus();
  };

  const closeModal = () => {
    const modal = document.querySelector("[data-mock-modal]");
    if (modal) modal.hidden = true;
  };

  function bindLocalActions(scope = document) {
    scope.querySelectorAll("[data-scroll-target]").forEach((button) => {
      button.addEventListener("click", () => {
        document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth" });
      });
    });

    scope.querySelectorAll("[data-modal-open]").forEach((button) => {
      button.addEventListener("click", () => openModal(button.dataset.modalOpen));
    });
  }

  const bindControls = () => {
    document.querySelector("[data-token-prev]")?.addEventListener("click", () => setActiveToken(state.activeTokenIndex - 1));
    document.querySelector("[data-token-next]")?.addEventListener("click", () => setActiveToken(state.activeTokenIndex + 1));
    document.querySelector("[data-profile-toggle]")?.addEventListener("click", toggleProfileMenu);
    document.querySelector("[data-difusora-clear]")?.remove();
    if (document.querySelector("[data-difusora-feed]")) {
      window.addEventListener("focus", () => refreshCollectorDashboard().catch((error) => console.error("Difusora refresh failed", error)));
      window.addEventListener("memora:difusora:refresh", () => refreshCollectorDashboard().catch((error) => console.error("Difusora refresh failed", error)));
    }

    document.querySelectorAll("[data-modal-close]").forEach((item) => {
      item.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeModal();
      closeProfileMenu({ focusTrigger: true });
    });
  };

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      if (window.location.pathname.endsWith("/memora-id.html")) {
        await refreshCollectorDashboard();
        renderProfile(dashboard.profile, dashboard.stats);
        renderHive();
      } else {
        const auth = await window.MemoraAPI.get("/api/auth/me");
        renderProfile(auth.user);
      }
      bindLocalActions();
      bindControls();
    } catch (error) {
      if (window.location.pathname.endsWith("/memora-id.html") && error.status === 401) {
        window.location.assign("/index.html#login");
      } else if (error.status === 401) {
        document.querySelector("[data-profile-dock]")?.setAttribute("hidden", "");
      } else {
        console.error("Memora ID failed to load", error);
      }
    }
  });
})();
