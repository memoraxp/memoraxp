(() => {
  const editionId = "playoffs-nbb";
  const key = (name) => `memora:${editionId}:${name}`;
  const read = (name, fallback = null) => {
    try {
      const value = localStorage.getItem(key(name));
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  };
  const readText = (name, fallback = "") => {
    try { return localStorage.getItem(key(name)) || fallback; } catch (error) { return fallback; }
  };
  const write = (name, value) => localStorage.setItem(key(name), JSON.stringify(value));
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  let lastTrigger = null;
  const lockPage = (locked) => { document.documentElement.classList.toggle("has-stage-modal", locked); document.body.style.overflow = locked ? "hidden" : ""; };
  const theater = document.querySelector("[data-stage-theater]");
  const theaterImage = theater?.querySelector("[data-stage-image]");
  const openImage = (src, alt, title, trigger) => {
    if (!theater || !theaterImage || !src) return;
    lastTrigger = trigger || document.activeElement;
    theaterImage.src = src; theaterImage.alt = alt || title; theaterImage.hidden = false;
    theater.hidden = false; theater.classList.add("is-open"); lockPage(true);
    theater.querySelector("[data-stage-close]")?.focus();
  };
  const closeImage = () => {
    if (!theater || theater.hidden) return;
    theater.hidden = true; theater.classList.remove("is-open");
    if (theaterImage) { theaterImage.removeAttribute("src"); theaterImage.hidden = true; }
    lockPage(false); lastTrigger?.focus?.();
  };
  const renderWallpapers = () => {
    const target = document.querySelector("[data-stage-wallpapers]");
    if (!target) return;
    const defaults = [{ name: "WPF1", src: "assets/WPF1.png" }, { name: "MF2", src: "assets/MF2.png" }];
    const configured = readText("wallpapersConfigured") === "true";
    const stored = read("wallpapers", []);
    const wallpapers = configured && Array.isArray(stored) && stored.length ? stored : defaults;
    target.innerHTML = wallpapers.map((wallpaper, index) => `<figure class="stage-wallpaper"><img src="${escapeHtml(wallpaper.src)}" alt="${escapeHtml(wallpaper.name || `Wallpaper ${index + 1}`)}"><figcaption>${escapeHtml(wallpaper.name || `Wallpaper ${index + 1}`)}</figcaption><div><button type="button" data-wallpaper-open="${index}">Abrir</button><a href="${escapeHtml(wallpaper.src)}" download>Baixar</a></div></figure>`).join("");
    target.querySelectorAll("[data-wallpaper-open]").forEach((button) => button.addEventListener("click", () => {
      const wallpaper = wallpapers[Number(button.dataset.wallpaperOpen)];
      openImage(wallpaper?.src, wallpaper?.name, wallpaper?.name, button);
    }));
  };

  const cardTheater = document.querySelector("[data-card-theater]");
  const cardFlip = cardTheater?.querySelector("[data-card-flip]");
  const cardStage = cardTheater?.querySelector("[data-card-stage]");
  const setCardImages = () => {
    const front = readText("cardFront", "assets/WPF1.png");
    const back = readText("cardBack", "assets/MF2.png");
    const frontImage = cardTheater?.querySelector("[data-card-front]");
    const backImage = cardTheater?.querySelector("[data-card-back]");
    if (frontImage) frontImage.src = front;
    if (backImage) backImage.src = back;
  };
  const flipCard = () => { const flipped = cardFlip?.classList.toggle("is-flipped"); cardStage?.setAttribute("aria-pressed", String(Boolean(flipped))); };
  const openCard = (trigger) => {
    if (!cardTheater) return;
    lastTrigger = trigger; setCardImages(); cardFlip?.classList.remove("is-flipped");
    cardStage?.setAttribute("aria-pressed", "false"); cardTheater.hidden = false; cardTheater.classList.add("is-open"); lockPage(true); cardTheater.querySelector("[data-card-close]")?.focus();
  };
  const closeCard = () => {
    if (!cardTheater || cardTheater.hidden) return;
    cardTheater.hidden = true; cardTheater.classList.remove("is-open"); cardFlip?.classList.remove("is-flipped"); cardStage?.setAttribute("aria-pressed", "false"); lockPage(false); lastTrigger?.focus?.();
  };
  const stageModal = document.querySelector("[data-stage-modal]");
  const openModal = (title, body, trigger) => {
    if (!stageModal) return;
    lastTrigger = trigger || document.activeElement;
    stageModal.querySelector("[data-stage-modal-title]").textContent = title;
    stageModal.querySelector("[data-stage-modal-body]").textContent = body;
    stageModal.hidden = false; lockPage(true); stageModal.querySelector("[data-stage-modal-close]")?.focus();
  };
  const closeModal = () => { if (!stageModal || stageModal.hidden) return; stageModal.hidden = true; lockPage(false); lastTrigger?.focus?.(); };
  const renderCommunity = () => {
    const target = document.querySelector("[data-stage-supporters]");
    if (!target) return;
    const defaults = [{ name: "Marina A.", id: "@marina.nbb", sharing: true }, { name: "Carlos R.", id: "@carlos.facisa", sharing: true }, { name: "Perfil privado", id: "Memora ID protegido", sharing: false }];
    const records = read("community", defaults);
    target.innerHTML = (Array.isArray(records) ? records : defaults).map((person) => person.sharing === false ? `<article><strong>Perfil privado</strong><span>Preferencia de privacidade respeitada</span></article>` : `<article><strong>${escapeHtml(person.name)}</strong><span>${escapeHtml(person.id || "Memora ID")}</span></article>`).join("");
  };
  const applyCredentialHolder = () => {
    try {
      const state = JSON.parse(localStorage.getItem("memora.access.v1") || "{}");
      const user = Array.isArray(state.users) ? state.users.find((item) => item.id === state.active_user_id) : null;
      const target = document.querySelector("[data-credential-holder]");
      if (target && user?.display_name) target.textContent = user.display_name;
    } catch (error) {}
  };

  const applyTokenConfig = () => {
    const config = read("tokenConfig", null);
    if (!config || typeof config !== "object") return;
    const eventCopy = document.querySelector("[data-stage-event-copy]");
    const accessCopy = document.querySelector("[data-stage-access-copy]");
    if (eventCopy && config.about) eventCopy.querySelector("p:last-child").textContent = config.about;
    if (accessCopy && config.access) accessCopy.querySelector("p:first-of-type").textContent = config.access;
  };
  const renderTimeline = () => {
    const target = document.querySelector('[data-nbb-timeline]');
    if (!target) return;
    const defaults = [{ id: 'gates', text: 'Abertura dos portÃµes e orientaÃ§Ã£o dos setores.', date: '2026-07-24', time: '18:00', image: 'assets/CF.jpg' }, { id: 'warmup', text: 'Unifacisa e Corinthians entram em quadra.', date: '2026-07-24', time: '19:15' }, { id: 'tipoff', text: 'Bola ao alto nos Playoffs do NBB.', date: '2026-07-24', time: '19:30' }, { id: 'final', text: 'Placar e galeria serÃ£o publicados apÃ³s o jogo.', date: '2026-07-24', time: '21:20' }];
    const records = read('timeline', defaults);
    const items = Array.isArray(records) ? records.filter((item) => item && item.published !== false && item.text) : defaults;
    target.innerHTML = items.map((item) => `<article class="toninho-timeline-mock-item"><span class="toninho-timeline-mock-marker" aria-hidden="true"></span><div class="toninho-timeline-mock-content">${item.image ? `<img src="${escapeHtml(item.image)}" alt="Imagem de ${escapeHtml(item.title || 'acontecimento da ediÃ§Ã£o')}">` : ''}<p>${escapeHtml(item.text)}</p><time datetime="${escapeHtml(item.date)}T${escapeHtml(item.time || '00:00')}">${escapeHtml(item.date)}${item.time ? ` Â· ${escapeHtml(item.time)}` : ''}</time></div></article>`).join('');
    target.scrollTop = 0;
  };  const renderPayments = () => {
    const target = document.querySelector("[data-stage-payments]");
    const values = read("payments", { added: 80, used: 32 });
    if (!target) return;
    const added = Number(values?.added || 0); const used = Number(values?.used || 0); const balance = Math.max(0, added - used);
    target.innerHTML = `<div><span>Saldo disponivel</span><strong>${balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></div><div><span>Total adicionado</span><strong>${added.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></div><div><span>Total utilizado</span><strong>${used.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></div>`;
  };

const setExpandableState = (button, panel, open) => {
    if (!button || !panel) return;
    button.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    if (open) {
      panel.hidden = false;
      panel.classList.add("is-open");
      panel.style.maxHeight = "0px";
      requestAnimationFrame(() => { panel.style.maxHeight = `${panel.scrollHeight}px`; });
    } else {
      panel.classList.remove("is-open");
      panel.style.maxHeight = "0px";
      panel.hidden = true;
    }
  };
  const unloadVideo = (panel) => { panel?.querySelector("[data-nbb-video-panel]")?.replaceChildren(); };
  const closeOtherVideos = (activePanel) => { document.querySelectorAll("[data-nbb-video-panel]").forEach((videoPanel) => { const panel = videoPanel.closest(".biplano-menu-panel"); if (!panel || panel === activePanel) return; const button = document.getElementById(panel.getAttribute("aria-labelledby")); if (button) setExpandableState(button, panel, false); unloadVideo(panel); }); };
const loadVideo = (panel) => {
    const video = panel.querySelector("[data-nbb-video-panel]");
    if (!video || video.querySelector("iframe")) return;
    const [videoId, query = ""] = String(video.dataset.videoId || "").split("?");
    if (!videoId) return;
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}${query ? `?${query}` : ""}`;
    iframe.title = video.dataset.videoTitle || "Vídeo da partida";
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    video.append(iframe);
  };
  document.addEventListener("DOMContentLoaded", () => {
    renderWallpapers(); renderTimeline(); renderCommunity(); renderPayments(); applyTokenConfig(); applyCredentialHolder();
    document.querySelectorAll(".biplano-menu-toggle").forEach((button) => {
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      if (!panel) return;
      if (button.getAttribute("aria-expanded") === "true") setExpandableState(button, panel, true);
      button.addEventListener("click", () => {
        const nextOpen = button.getAttribute("aria-expanded") !== "true";
        if (nextOpen && panel.querySelector("[data-nbb-video-panel]")) closeOtherVideos(panel);
        setExpandableState(button, panel, nextOpen);
        if (nextOpen) loadVideo(panel); else unloadVideo(panel);
      });
    });
    document.querySelectorAll("[data-timeline-scroll]").forEach((timeline) => { timeline.scrollTop = 0; });
    document.querySelectorAll("[data-cover-open]").forEach((button) => button.addEventListener("click", () => openImage(readText("editionCover", "assets/CF.jpg"), "Capa da edicao Playoffs NBB", "Capa da Edicao", button)));
    document.querySelectorAll("[data-stage-image-open]").forEach((button) => button.addEventListener("click", () => openImage(button.dataset.imageSrc, button.dataset.imageAlt, "", button)));
    document.querySelectorAll("[data-card-open]").forEach((button) => button.addEventListener("click", () => openCard(button)));
    theater?.querySelector("[data-stage-close]")?.addEventListener("click", closeImage);
    theater?.addEventListener("click", (event) => { if (event.target === theater) closeImage(); });
    cardTheater?.querySelector("[data-card-close]")?.addEventListener("click", closeCard);
    cardTheater?.addEventListener("click", (event) => { if (event.target === cardTheater) closeCard(); });
    cardStage?.addEventListener("click", flipCard);
    cardStage?.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); flipCard(); } });
    document.querySelectorAll("[data-stage-modal-close]").forEach((button) => button.addEventListener("click", closeModal));
    document.querySelector("[data-add-credits]")?.addEventListener("click", (event) => openModal("Adicionar creditos", "Prototipo preparado para futura integracao de pagamentos. Nenhuma cobranca real sera realizada.", event.currentTarget));
    document.querySelector("[data-token-journey]")?.addEventListener("click", (event) => openModal("Jornada do token NBB001", "Emitido - ativado - credencial pronta. Leituras de QR Code e check-in aparecerao aqui quando estiverem disponiveis.", event.currentTarget));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeImage(); closeCard(); closeModal(); } });
    window.addEventListener("storage", (event) => { if (event.key?.startsWith(`memora:${editionId}:`)) { renderWallpapers(); renderTimeline(); renderCommunity(); renderPayments(); applyTokenConfig(); } });
  });
})();
