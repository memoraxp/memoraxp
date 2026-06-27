(() => {
  const mockUser = {
    name: "Arthur",
    memoraId: "@arthur.memora",
    contact: ["Instagram @arthurmina", "WhatsApp: (83) 999139300"],
    role: "Colecionador de experiencias",
    avatar: "assets/avatar.png",
    stats: { Tokens: 4, XP: 1280, Memorias: 12, Eventos: 3 },
  };

  const mockDifusora = [
    {
      author: "Equipe Memora",
      time: "ha 2h",
      tag: "lancamento",
      text: "A proxima edicao Memora Music ganhou previa visual para colecionadores ativos.",
      metrics: "12 salvos - 4 respostas",
    },
    {
      author: "Memora XP",
      time: "hoje",
      tag: "evento",
      text: "Colecionadores Genesis receberao uma janela antecipada para novas experiencias presenciais.",
      metrics: "28 salvos - 9 ecos",
    },
    {
      author: "Realizadores",
      time: "ontem",
      tag: "update",
      text: "Novos materiais de making of estao sendo preparados para tokens musicais selecionados.",
      metrics: "18 salvos - 6 respostas",
    },
  ];

  const mockUpdates = [
    { title: "Conteudo desbloqueado", text: "Voce desbloqueou um novo conteudo em Biplano Sessions.", date: "Hoje" },
    { title: "Memoria recebida", text: "Seu token Festival Aurora recebeu uma nova memoria.", date: "Ontem" },
    { title: "Acesso antecipado", text: "Acesso antecipado liberado para colecionadores Genesis.", date: "21 jun" },
    { title: "Capsula do Tempo", text: "Nova Capsula do Tempo disponivel em breve.", date: "18 jun" },
  ];

  const state = { activeTokenIndex: 0 };
  let hiveScrollFrame = 0;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const getHiveCells = () => Array.from(document.querySelectorAll("[data-token-index]"));

  const renderProfile = () => {
    const name = document.querySelector("[data-profile-name]");
    const handle = document.querySelector("[data-profile-handle]");
    const contact = document.querySelector("[data-profile-contact]");
    const role = document.querySelector("[data-profile-role]");
    const avatar = document.querySelector("[data-profile-avatar]");
    const stats = document.querySelector("[data-profile-stats]");

    if (name) name.textContent = mockUser.name;
    if (handle) handle.textContent = mockUser.memoraId;
    if (contact) contact.innerHTML = mockUser.contact.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    if (role) role.textContent = mockUser.role;

    if (avatar) {
      avatar.src = mockUser.avatar;
      avatar.alt = `Avatar do colecionador ${mockUser.name}`;
    }

    if (stats) {
      stats.innerHTML = Object.entries(mockUser.stats)
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
      menu.profileCloseTimer = window.setTimeout(finishOpen, 820);
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
    menu.profileCloseTimer = window.setTimeout(finishClose, 820);
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
    getHiveCells().forEach((cell) => {
      cell.addEventListener("click", () => setActiveToken(Number(cell.dataset.tokenIndex)));
    });
    window.addEventListener("resize", () => centerActiveCell("auto"));
    syncTokenState();
    requestAnimationFrame(() => centerActiveCell("auto"));
  };

  const renderDifusora = () => {
    const feed = document.querySelector("[data-difusora-feed]");
    if (!feed) return;

    feed.innerHTML = mockDifusora
      .map(
        (post) => `
          <article>
            <header><strong>${escapeHtml(post.author)}</strong><small>${escapeHtml(post.time)}</small></header>
            <p>${escapeHtml(post.text)}</p>
            <footer><span>${escapeHtml(post.tag)}</span><span>${escapeHtml(post.metrics)}</span></footer>
          </article>
        `
      )
      .join("");
  };

  const renderUpdates = () => {
    const list = document.querySelector("[data-updates-list]");
    if (!list) return;

    list.innerHTML = mockUpdates
      .map((item) => `<li><time>${escapeHtml(item.date)}</time><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></li>`)
      .join("");
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

    document.querySelectorAll("[data-modal-close]").forEach((item) => {
      item.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeModal();
      closeProfileMenu({ focusTrigger: true });
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderProfile();
    renderHive();
    renderDifusora();
    renderUpdates();
    bindLocalActions();
    bindControls();
  });
})();