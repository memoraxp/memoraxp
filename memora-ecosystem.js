(() => {
  const header = document.querySelector("[data-ecosystem-header]");

  const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 16);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  document.querySelectorAll("[data-ecosystem-switcher]").forEach((switcher) => {
    const toggle = switcher.querySelector("[data-ecosystem-toggle]");
    const panel = switcher.querySelector("[data-ecosystem-panel]");
    if (!toggle || !panel) return;

    const close = ({ restoreFocus = false } = {}) => {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) panel.querySelector("a[aria-current='page'], a")?.focus();
    });

    document.addEventListener("pointerdown", (event) => {
      if (!switcher.contains(event.target)) close();
    });

    switcher.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) {
        event.preventDefault();
        close({ restoreFocus: true });
      }
    });
  });

  const menuToggle = document.querySelector("[data-ecosystem-menu-toggle]");
  const mobileMenu = document.querySelector("[data-ecosystem-mobile-menu]");

  if (menuToggle && mobileMenu) {
    const closeMenu = ({ restoreFocus = false } = {}) => {
      mobileMenu.hidden = true;
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
      document.body.classList.remove("ecosystem-menu-open");
      if (restoreFocus) menuToggle.focus();
    };

    menuToggle.addEventListener("click", () => {
      const willOpen = mobileMenu.hidden;
      mobileMenu.hidden = !willOpen;
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Fechar menu" : "Abrir menu");
      document.body.classList.toggle("ecosystem-menu-open", willOpen);
      if (willOpen) mobileMenu.querySelector("a, button")?.focus();
    });

    mobileMenu.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileMenu.hidden) closeMenu({ restoreFocus: true });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1120 && !mobileMenu.hidden) closeMenu();
    });
  }
})();
