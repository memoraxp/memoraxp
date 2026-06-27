(() => {
  const main = document.querySelector("main");
  const header = document.querySelector(".site-header");

  if (!main) {
    return;
  }

  const root = document.documentElement;
  const body = document.body;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sections = Array.from(document.querySelectorAll("main > section:not(.login-screen)"));
  const isHomeSnapPage =
    main.id === "top" &&
    sections.length > 1 &&
    !body.classList.contains("biplano-page") &&
    !body.classList.contains("memora-id-page");
  const interactiveSelector = [
    "a",
    "button",
    "input",
    "select",
    "textarea",
    "summary",
    "[contenteditable='true']",
    "[role='button']",
    "[role='switch']"
  ].join(",");

  const slideDuration = () => (reducedMotionQuery.matches ? 0 : 680);
  const clampIndex = (index) => Math.max(0, Math.min(sections.length - 1, index));
  const normalizePath = (path) => path.replace(/\/index\.html$/i, "/");
  const samePageUrl = (url) =>
    url.origin === window.location.origin &&
    normalizePath(url.pathname) === normalizePath(window.location.pathname);
  const decodeHash = (hash) => {
    try {
      return decodeURIComponent(hash.slice(1));
    } catch {
      return hash.slice(1);
    }
  };
  const headerOffset = () => Math.ceil((header?.getBoundingClientRect().height || 0) + 14);

  let activeIndex = 0;
  let isSliding = false;
  let slideTimer = 0;
  let wheelTotal = 0;
  let wheelEndTimer = 0;
  let touchStartY = null;
  let touchCurrentY = null;
  let sectionRail = null;

  root.classList.add("enhanced-navigation");
  root.classList.toggle("is-snap-reduced-motion", reducedMotionQuery.matches);

  const sectionIndexForElement = (element) => {
    if (!element) return -1;
    const section = element.matches("main > section:not(.login-screen)")
      ? element
      : element.closest("main > section:not(.login-screen)");

    return sections.indexOf(section);
  };

  const sectionTop = (index) => sections[index].getBoundingClientRect().top + window.scrollY;

  const nearestSectionIndex = () => {
    const viewportMiddle = window.scrollY + window.innerHeight / 2;
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    sections.forEach((section, index) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const height = Math.min(section.offsetHeight, window.innerHeight);
      const distance = Math.abs(top + height / 2 - viewportMiddle);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  };

  const hashForSection = (section, index) => {
    if (index === 0) return "#top";
    return section.id ? `#${section.id}` : "";
  };

  const labelForSection = (section, index) => {
    const heading = section.querySelector("h1, h2, [aria-label]");
    return heading?.getAttribute("aria-label") || heading?.textContent?.trim() || `Secao ${index + 1}`;
  };

  const navLinks = () => Array.from(document.querySelectorAll(".nav-links a[href], .header-actions a[href]"));

  const localAnchorTargets = () =>
    navLinks()
      .map((link) => {
        const url = new URL(link.href, window.location.href);
        if (!samePageUrl(url) || !url.hash || url.hash === "#login") return null;
        const target = url.hash === "#top" ? sections[0] || main : document.getElementById(decodeHash(url.hash));
        return target ? { hash: url.hash, target, label: link.textContent.trim() || url.hash.slice(1) } : null;
      })
      .filter(Boolean);

  const setActiveNavigation = (hash) => {
    navLinks().forEach((link) => {
      const url = new URL(link.href, window.location.href);
      const isActive = samePageUrl(url) && url.hash === hash && hash !== "#login";
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const syncSectionStates = () => {
    sections.forEach((section, index) => {
      section.classList.toggle("is-snap-active", index === activeIndex);
      section.classList.toggle("is-snap-before", index < activeIndex);
      section.classList.toggle("is-snap-after", index > activeIndex);
    });

    root.dataset.snapSection = String(activeIndex + 1);
    const hash = hashForSection(sections[activeIndex], activeIndex);
    if (hash) setActiveNavigation(hash);

    sectionRail?.querySelectorAll("button").forEach((button, index) => {
      const isActive = index === activeIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const updateHeaderState = () => {
    root.classList.toggle("has-nav-scrolled", window.scrollY > 12 || (isHomeSnapPage && activeIndex > 0));
  };

  const releaseSlide = () => {
    window.clearTimeout(slideTimer);
    slideTimer = window.setTimeout(() => {
      isSliding = false;
      root.classList.remove("is-snap-sliding");
    }, slideDuration() + 80);
  };

  const scrollToTarget = (target, behavior = "smooth") => {
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset());
    window.scrollTo({
      top,
      behavior: reducedMotionQuery.matches ? "auto" : behavior
    });
  };

  const goToSection = (index, options = {}) => {
    const nextIndex = clampIndex(index);
    const instant = Boolean(options.instant);

    if (isSliding && !instant) {
      return;
    }

    root.dataset.snapDirection = nextIndex > activeIndex ? "down" : "up";
    activeIndex = nextIndex;
    syncSectionStates();
    updateHeaderState();

    if (instant || slideDuration() === 0) {
      window.clearTimeout(slideTimer);
      isSliding = false;
      root.classList.remove("is-snap-sliding");
      window.scrollTo({ top: sectionTop(activeIndex), behavior: "auto" });
      return;
    }

    isSliding = true;
    root.classList.add("is-snap-sliding");
    window.scrollTo({ top: sectionTop(activeIndex), behavior: "smooth" });
    releaseSlide();
  };

  const currentSectionCanScroll = (deltaY) => {
    const section = sections[activeIndex] || sections[nearestSectionIndex()];
    if (!section) return false;

    const top = sectionTop(activeIndex);
    const bottom = top + section.offsetHeight;
    const goingDown = deltaY > 0;
    const viewportBottom = window.scrollY + window.innerHeight;

    return goingDown ? viewportBottom < bottom - 8 : window.scrollY > top + 8;
  };

  const nestedScrollableCanScroll = (start, deltaY) => {
    let node = start instanceof Element ? start : start?.parentElement;

    while (node && node !== body) {
      const style = window.getComputedStyle(node);
      const canOverflow = /(auto|scroll)/.test(style.overflowY);

      if (canOverflow && node.scrollHeight > node.clientHeight + 1) {
        if (deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true;
        if (deltaY < 0 && node.scrollTop > 1) return true;
      }

      node = node.parentElement;
    }

    return false;
  };

  const moveBy = (direction) => {
    if (isSliding) {
      return;
    }

    activeIndex = nearestSectionIndex();
    goToSection(activeIndex + direction);
  };

  const settleWheelGesture = () => {
    const delta = wheelTotal;
    wheelTotal = 0;

    if (isSliding || Math.abs(delta) < 24) {
      return;
    }

    moveBy(delta > 0 ? 1 : -1);
  };

  const getInitialIndex = () => {
    if (!window.location.hash || window.location.hash === "#top" || window.location.hash === "#login") {
      return 0;
    }

    const target = document.getElementById(decodeHash(window.location.hash));
    const index = sectionIndexForElement(target);

    return index >= 0 ? index : 0;
  };

  const createSectionRail = () => {
    sectionRail = document.createElement("nav");
    sectionRail.className = "snap-section-rail";
    sectionRail.setAttribute("aria-label", "Secoes da pagina");

    sections.forEach((section, index) => {
      const button = document.createElement("button");
      const hash = hashForSection(section, index);
      button.type = "button";
      button.dataset.hash = hash;
      button.setAttribute("aria-label", labelForSection(section, index));
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        if (hash) history.pushState(null, "", hash);
        goToSection(index);
      });
      sectionRail.append(button);
    });

    document.body.append(sectionRail);
  };

  const createLocalAnchorRail = () => {
    const targets = localAnchorTargets();
    if (targets.length < 2) return;

    sectionRail = document.createElement("nav");
    sectionRail.className = "snap-section-rail snap-section-rail-local";
    sectionRail.setAttribute("aria-label", "Secoes da pagina");

    targets.forEach(({ hash, target, label }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.hash = hash;
      button.setAttribute("aria-label", label);
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        history.pushState(null, "", hash);
        scrollToTarget(target);
        setActiveNavigation(hash);
        syncRailState(hash);
      });
      sectionRail.append(button);
    });

    document.body.append(sectionRail);
  };

  const syncRailState = (activeHash) => {
    sectionRail?.querySelectorAll("button").forEach((button) => {
      const isActive = button.dataset.hash === activeHash;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const updateLocalAnchorState = () => {
    if (isHomeSnapPage) {
      return;
    }

    const targets = localAnchorTargets();

    if (!targets.length) {
      updateHeaderState();
      return;
    }

    const marker = window.scrollY + headerOffset() + 24;
    let activeHash = "";

    targets.forEach(({ hash, target }) => {
      const top = target.getBoundingClientRect().top + window.scrollY;
      if (top <= marker) {
        activeHash = hash;
      }
    });

    setActiveNavigation(activeHash);
    syncRailState(activeHash);
    updateHeaderState();
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link) return;

    const url = new URL(link.href, window.location.href);
    if (!url.hash || url.hash === "#login" || !samePageUrl(url)) {
      return;
    }

    const target = url.hash === "#top" ? sections[0] || main : document.getElementById(decodeHash(url.hash));
    if (!target) {
      return;
    }

    event.preventDefault();
    history.pushState(null, "", url.hash);

    const index = sectionIndexForElement(target);
    if (isHomeSnapPage && index >= 0) {
      goToSection(index);
      return;
    }

    scrollToTarget(target);
    setActiveNavigation(url.hash);
    syncRailState(url.hash);
  });

  if (isHomeSnapPage) {
    root.classList.add("snap-sections-ready");
    createSectionRail();

    document.addEventListener("keydown", (event) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (event.target instanceof Element && event.target.closest(interactiveSelector))
      ) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey)) {
        event.preventDefault();
        moveBy(1);
        return;
      }

      if (event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey)) {
        event.preventDefault();
        moveBy(-1);
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        goToSection(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        goToSection(sections.length - 1);
      }
    });

    window.addEventListener(
      "wheel",
      (event) => {
        if (
          Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
          Math.abs(event.deltaY) < 2 ||
          nestedScrollableCanScroll(event.target, event.deltaY) ||
          currentSectionCanScroll(event.deltaY)
        ) {
          return;
        }

        event.preventDefault();

        if (isSliding) {
          return;
        }

        wheelTotal += event.deltaY;
        window.clearTimeout(wheelEndTimer);
        wheelEndTimer = window.setTimeout(settleWheelGesture, 60);
      },
      { passive: false }
    );

    window.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length !== 1 || isSliding) {
          touchStartY = null;
          touchCurrentY = null;
          return;
        }

        touchStartY = event.touches[0].clientY;
        touchCurrentY = touchStartY;
      },
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      (event) => {
        if (touchStartY === null || event.touches.length !== 1) {
          return;
        }

        touchCurrentY = event.touches[0].clientY;
        const delta = touchStartY - touchCurrentY;

        if (Math.abs(delta) > 8 && !nestedScrollableCanScroll(event.target, delta) && !currentSectionCanScroll(delta)) {
          event.preventDefault();
        }
      },
      { passive: false }
    );

    window.addEventListener("touchend", () => {
      if (touchStartY === null || touchCurrentY === null || isSliding) {
        touchStartY = null;
        touchCurrentY = null;
        return;
      }

      const delta = touchStartY - touchCurrentY;
      touchStartY = null;
      touchCurrentY = null;

      if (Math.abs(delta) >= 42 && !currentSectionCanScroll(delta)) {
        moveBy(delta > 0 ? 1 : -1);
      }
    });

    window.addEventListener("resize", () => {
      activeIndex = nearestSectionIndex();
      goToSection(activeIndex, { instant: true });
    });

    window.addEventListener(
      "scroll",
      () => {
        if (isSliding) return;
        const nextIndex = nearestSectionIndex();
        if (nextIndex !== activeIndex) {
          root.dataset.snapDirection = nextIndex > activeIndex ? "down" : "up";
          activeIndex = nextIndex;
          syncSectionStates();
        }
        updateHeaderState();
      },
      { passive: true }
    );

    activeIndex = getInitialIndex();
    requestAnimationFrame(() => goToSection(activeIndex, { instant: true }));
  } else {
    createLocalAnchorRail();
    window.addEventListener("scroll", updateLocalAnchorState, { passive: true });
    requestAnimationFrame(() => {
      if (window.location.hash && window.location.hash !== "#login") {
        const target = window.location.hash === "#top" ? main : document.getElementById(decodeHash(window.location.hash));
        if (target) scrollToTarget(target, "auto");
      }
      updateLocalAnchorState();
    });
  }

  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#login") {
      return;
    }

    if (isHomeSnapPage) {
      goToSection(getInitialIndex());
      return;
    }

    const target = window.location.hash === "#top" ? main : document.getElementById(decodeHash(window.location.hash));
    if (target) {
      scrollToTarget(target);
      setActiveNavigation(window.location.hash);
      syncRailState(window.location.hash);
    }
  });

  reducedMotionQuery.addEventListener?.("change", () => {
    root.classList.toggle("is-snap-reduced-motion", reducedMotionQuery.matches);
    if (isHomeSnapPage) goToSection(nearestSectionIndex(), { instant: true });
  });
})();
