(() => {
  const themeStorageKey = "memora-manager-theme";
  const lightThemeValue = "light";

  const readSavedTheme = () => {
    try {
      return window.localStorage.getItem(themeStorageKey);
    } catch (error) {
      return "";
    }
  };

  const persistTheme = (theme) => {
    try {
      window.localStorage.setItem(themeStorageKey, theme === lightThemeValue ? lightThemeValue : "dark");
    } catch (error) {
      // Theme preference is progressive enhancement; the UI still works without storage.
    }
  };

  const applyManagerTheme = (theme) => {
    const isLight = theme === lightThemeValue;
    document.documentElement.dataset.managerTheme = isLight ? lightThemeValue : "dark";
    if (document.body) document.body.dataset.theme = isLight ? lightThemeValue : "dark";
    document.querySelectorAll("[data-manager-theme-toggle]").forEach((toggle) => {
      toggle.checked = isLight;
      toggle.setAttribute("aria-checked", String(isLight));
    });
  };

  applyManagerTheme(readSavedTheme());
  const LEGACY_ILLUSTRATOR_PRESENTATION = {
    title: "Ilustrador",
    avatar: "assets/avatareldon.png",
    handle: "eldon.art",
    name: "Eldon Oliveira",
    posts: 12,
    followers: "1.675",
    following: "3.016",
    bio: "Desenho com a pena da galhofa e a tinta da melancolia.",
    url: "https://www.instagram.com/eldon.art/",
  };
  const profile = {
    name: "Guilherme",
    type: "Manager da banda Aura",
    contact: ["Instagram @aura.banda", "WhatsApp: (83) 98888-1200", "guilherme@memora.app"],
    avatar: "assets/avatar.png",
    stats: {
      Edições: 1,
      "Vendas totais": 42,
      "Tokens ativos": 31,
      Comunidade: 537,
    },
  };

  const LEGACY_PRESENTATION_DEFAULTS = [
    {
      id: "aura",
      name: "Edição Aura",
      module: "Artist",
      status: "ativa",
      image: "assets/Capa.jpg",
      digitalCard: {
        front: "assets/WP04.png",
        back: "assets/WP03.png",
      },
      wallpapers: [
        { name: "WP03.png", src: "assets/WP03.png" },
        { name: "WP04.png", src: "assets/WP04.png" },
      ],
      tile: "assets/MC1.png",
      managerPage: "manager-aura.html",
      publicPage: "edicao-aura.html",
      titleLogo: "assets/Aura logo.png",
      manager: {
        name: "Guilherme",
        type: "Manager da banda Aura",
        contact: ["Instagram @aura.banda", "WhatsApp: (83) 98888-1200", "guilherme@memora.app"],
        avatar: "assets/avatar.png",
        stats: { Edições: 1, "Vendas totais": 42,
      "Tokens ativos": 31, Comunidade: 537 },
      },
      sold: 42,
      activeTokens: 31,
      unitPrice: 35,
      tokenCode: "AURA",
      tokenTotal: 100,
      qrReads: 621,
      checkins: 0,
      revenue: "R$ 1.470,00",
      emergency: 84,
      stock: 27,
      campaign: "R$ 6.800,00 de R$ 10.000,00",
      collectors: [
        { name: "Lia Ramos", instagram: "@liaramos", phone: "(83) 99911-2300", status: "ativo", consent: true, health: "Alergia a dipirona", emergency: "Caio Ramos - (83) 98800-1200" },
        { name: "Bruno Lins", instagram: "@brunolins", phone: "(83) 98777-4500", status: "ativo", consent: false },
        { name: "Taina Alves", instagram: "@taina.alves", phone: "(83) 98123-0002", status: "pausado", consent: true, health: "Uso continuo de bombinha", emergency: "Marcia Alves - (83) 98110-4000" },
      ],
      links: ["Instagram", "Site oficial", "Realidade aumentada", "Loja", "Conteúdo exclusivo"],
      logs: ["João Pessoa - hoje, 14:18", "Campina Grande - ontem, 21:04", "Recife - 23 jun, 19:52"],
      points: [{ name: "Galeria Estação Cabo Branco", allocated: 35, sold: 18 }, { name: "Loja Memora Online", allocated: 40, sold: 17 }, { name: "Ateliê Aura", allocated: 25, sold: 7 }],
      memories: ["Foto da montagem da exposicao", "Relato da artista sobre a primeira tiragem", "Prints dos primeiros colecionadores"],
    },
    {
      id: "distance",
      name: "Edição Distance And Belief",
      module: "Music",
      status: "ativa",
      image: "assets/Capa.jpg",
      wallpapers: [
        { name: "WP01.png", src: "assets/WP01.png" },
        { name: "WP02.png", src: "assets/WP02.png" },
      ],
      tile: "assets/MC2.png",
      managerPage: "manager-distance-and-belief.html",
      publicPage: "edicao-distance-and-belief.html",
      titleLogo: "assets/distance.png",
      manager: {
        name: "Arthur Miná",
        type: "Manager da edição Distance And Belief",
        contact: ["Instagram @arthurmina", "WhatsApp: (83) 99913-9300", "arthur@memora.app"],
        avatar: "assets/avatar.png",
        stats: { Edições: 1, "Vendas totais": 57,
      "Tokens ativos": 36, Comunidade: 3 },
      },
      sold: 57,
      activeTokens: 36,
      unitPrice: 35,
      tokenCode: "ADAB",
      tokenTotal: 100,
      qrReads: 304,
      checkins: 0,
      revenue: "R$ 1.995,00",
      emergency: 31,
      stock: 7,
      campaign: "Campanha nao ativa neste modulo",
      collectors: [
        { name: "Nina Torres", instagram: "@ninatorres", phone: "(83) 98812-6688", status: "ativo", consent: false },
        { name: "Pedro Maia", instagram: "@pedromaia", phone: "(83) 99904-1122", status: "ativo", consent: true, health: "Restricao alimentar registrada", emergency: "Luiza Maia - (83) 99904-7788" },
        { name: "Rafa Nunes", instagram: "@rafanunes", phone: "(83) 98722-5001", status: "ativo", consent: false },
      ],
      links: ["Instagram", "Playlist", "Site oficial", "Conteúdo exclusivo", "Loja"],
      logs: ["São Paulo - hoje, 10:09", "João Pessoa - ontem, 18:33", "Curitiba - 22 jun, 23:12"],
      points: [{ name: "Bandcamp", allocated: 35, sold: 21 }, { name: "Loja do artista", allocated: 35, sold: 19 }, { name: "Evento de lançamento", allocated: 30, sold: 17 }],
      memories: ["Video de ensaio", "Making of da capa", "Playlist comentada faixa a faixa"],
      digitalCard: { front: "assets/distance-card-front.png", back: "assets/distance-card-back.png" },
    },
    {
      id: "fourkaos",
      name: "Edição Fourkaos",
      module: "Stage",
      status: "ativa",
      image: "assets/fourkaos-background.jpg",
      digitalCard: { front: "assets/WP07.png", back: "assets/WP08.png" },
      wallpapers: [
        { name: "WP07.png", src: "assets/WP07.png" },
        { name: "WP08.png", src: "assets/WP08.png" },
      ],
      tile: "assets/MC3.png",
      managerPage: "manager-fourkaos.html",
      publicPage: "edicao-fourkaos.html",
      titleLogo: "assets/LOGO FOURKAOS.png",
      manager: {
        name: "Johnny",
        type: "Manager da banda Fourkaos",
        contact: ["Instagram @fourkaos", "WhatsApp: (83) 98844-9000", "johnny@memora.app"],
        avatar: "assets/avatar.png",
        stats: { Edições: 1, "Vendas totais": 68,
      "Tokens ativos": 24, Comunidade: 3 },
      },
      sold: 68,
      activeTokens: 24,
      unitPrice: 35,
      tokenCode: "FKOS",
      tokenTotal: 100,
      qrReads: 774,
      checkins: 241,
      revenue: "R$ 2.380,00",
      emergency: 187,
      stock: 8,
      campaign: "R$ 11.420,00 de R$ 16.000,00",
      collectors: [
        { name: "Iago Ferraz", instagram: "@iagoferraz", phone: "(83) 98844-9000", status: "check-in realizado", consent: true, health: "Diabético", emergency: "Renata Ferraz - (83) 98844-9010" },
        { name: "Mel Duarte", instagram: "@melduarte", phone: "(83) 99915-4421", status: "check-in realizado", consent: true, health: "Ansiedade em multidões", emergency: "Bia Duarte - (83) 99915-1111" },
        { name: "Cesar Brito", instagram: "@cesarbrito", phone: "(83) 98770-8181", status: "comprador", consent: false },
      ],
      links: ["Instagram", "Site oficial", "Playlist", "Loja", "Conteúdo exclusivo"],
      logs: ["Casa de Show Aurora - hoje, 22:11", "Casa de Show Aurora - hoje, 21:48", "Portaria lateral - hoje, 21:07"],
      points: [{ name: "Bilheteria Aurora", allocated: 40, sold: 31 }, { name: "Sympla", allocated: 35, sold: 24 }, { name: "Loja da banda", allocated: 25, sold: 13 }],
      memories: ["Check-ins da noite", "Setlist fotografado", "Relatos da comunidade no pós-show"],
    },
    {
      id: "toninho-borbo-biplano",
      name: "Edição Toninho Borbo | Biplano",
      module: "Music",
      status: "ativa",
      image: "assets/Capatoninho.jpg",
      wallpapers: [
        { name: "WP01.png", src: "assets/WP01.png" },
        { name: "WP02.png", src: "assets/WP02.png" },
      ],
      tile: "assets/MC4.png",
      managerPage: "manager-toninho-borbo-biplano.html",
      publicPage: "edicao-toninho-borbo-biplano.html",
      titleLogo: "assets/toninho-biplano-logo.png",
      manager: {
        name: "Toninho Borbo",
        type: "Manager da edição Biplano",
        contact: ["Instagram @toninhoborbo", "WhatsApp: (83) 98800-1978", "toninho@memora.app"],
        avatar: "assets/avatar.png",
        stats: { Edições: 1, "Vendas totais": 67,
      "Tokens ativos": 0, Comunidade: 3 },
      },
      sold: 67,
      activeTokens: 0,
      unitPrice: 35,
      tokenCode: "TBRB",
      tokenTotal: 100,
      qrReads: 412,
      checkins: 0,
      revenue: "R$ 2.345,00",
      emergency: 37,
      stock: 33,
      campaign: "R$ 7.200,00 de R$ 12.000,00",
      collectors: [
        { name: "Helena Brito", instagram: "@helenabrito", phone: "(83) 98820-1978", status: "ativo", consent: true, health: "Contato de emergencia registrado", emergency: "Rui Brito - (83) 98820-1979" },
        { name: "Marcos Lima", instagram: "@marcoslima", phone: "(83) 98710-2018", status: "ativo", consent: false },
        { name: "Clara Vasconcelos", instagram: "@clara.v", phone: "(83) 99980-2016", status: "ativo", consent: true, health: "Restricao alimentar", emergency: "Ana Vasconcelos - (83) 99980-2017" },
      ],
      links: ["Instagram", "Álbum", "Rádio Biplano", "Loja", "Conteúdo exclusivo"],
      logs: ["Campina Grande - hoje, 12:04", "João Pessoa - ontem, 20:11", "Recife - 24 jun, 18:06"],
      points: [
        { name: "Venda direta - Toninho Borbo", allocated: 25, sold: 19 },
        { name: "Cine S\u00e3o Jos\u00e9", allocated: 25, sold: 15 },
        { name: "Livraria Nobel", allocated: 25, sold: 11 },
        { name: "Banca do Orlando", allocated: 25, sold: 22 },
      ],
      memories: ["Entrevista de 2016 sobre Biplano", "Faixas favoritas do Toninho", "Registros da criação do album"],
      digitalCard: { front: "assets/Capatoninho.jpg", back: "assets/WP02.png" },
    },
  ];

  let dashboard = null;
  let editions = LEGACY_PRESENTATION_DEFAULTS.map((edition) => ({ ...edition }));

  const groupAssetsBySlot = (assets = []) => assets.reduce((groups, asset) => {
    if (!groups[asset.slot]) groups[asset.slot] = [];
    groups[asset.slot].push(asset);
    return groups;
  }, {});

  const buildManagerViewModel = (data) => {
    const apiEdition = data.edition;
    const fallback = LEGACY_PRESENTATION_DEFAULTS.find((edition) => edition.id === apiEdition.slug) || {};
    const configuration = apiEdition.configuration || {};
    const assetsBySlot = groupAssetsBySlot(data.assets);
    const firstAsset = (slot) => assetsBySlot[slot]?.[0] || null;
    const configuredCard = configuration.digitalCard || fallback.digitalCard || {};
    const configuredWallpapers = configuration.wallpapers || fallback.wallpapers || [];
    const apiWallpapers = assetsBySlot.wallpaper || [];
    const presentation = {
      sold: Number(configuration.sold ?? fallback.sold ?? 0),
      activeTokens: Number(configuration.activeTokens ?? fallback.activeTokens ?? 0),
      qrReads: Number(configuration.qrReads ?? fallback.qrReads ?? 0),
      checkins: Number(configuration.checkins ?? fallback.checkins ?? 0),
      revenue: configuration.revenue || fallback.revenue || "R$ 0,00",
      stock: Number(configuration.stock ?? fallback.stock ?? 0),
      campaign: configuration.campaign || fallback.campaign || "Campanha não ativa neste módulo",
    };

    return {
      ...fallback,
      id: apiEdition.slug,
      name: apiEdition.name,
      module: apiEdition.module,
      status: apiEdition.status,
      tokenCode: apiEdition.token_code,
      tokenTotal: Number(apiEdition.token_total || 0),
      unitPrice: Number(apiEdition.unit_price || 0),
      publicPage: apiEdition.public_page,
      managerPage: apiEdition.manager_page,
      configuration,
      assetsBySlot,
      realTokenCounts: { available: 0, sold: 0, active: 0, disabled: 0, ...(data.token_counts || {}) },
      presentationMetrics: presentation,
      sold: presentation.sold,
      activeTokens: presentation.activeTokens,
      qrReads: presentation.qrReads,
      checkins: presentation.checkins,
      revenue: presentation.revenue,
      stock: presentation.stock,
      campaign: presentation.campaign,
      titleLogo: configuration.titleLogo || fallback.titleLogo || "",
      tile: configuration.tile || fallback.tile || "assets/mlogo.png",
      image: firstAsset("edition_cover")?.url || configuration.image || fallback.image || "",
      coverAsset: firstAsset("edition_cover"),
      digitalCard: {
        front: firstAsset("card_front")?.url || configuredCard.front || "",
        back: firstAsset("card_back")?.url || configuredCard.back || "",
      },
      cardAssets: { front: firstAsset("card_front"), back: firstAsset("card_back") },
      wallpapers: apiWallpapers.length
        ? apiWallpapers.map((asset) => ({ name: asset.original_filename, src: asset.url, assetId: asset.id, isApi: true }))
        : configuredWallpapers,
      manager: fallback.manager || profile,
      illustrator: fallback.illustrator || LEGACY_ILLUSTRATOR_PRESENTATION,
      collectors: fallback.collectors || [],
      logs: fallback.logs || [],
      links: fallback.links || [],
      points: fallback.points || [],
      authenticatedProfile: data.profile,
      role: data.role,
      capsule: Array.isArray(data.capsule) ? data.capsule : [],
      difusora: Array.isArray(data.difusora) ? data.difusora : [],
      analyticsNotice: data.analytics_notice,
    };
  };


  const state = { activeIndex: 0, pushIndex: 0, whatsappIndex: 0 };
  let hiveScrollFrame = 0;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const refreshDashboard = async () => {
    const data = await window.MemoraAPI.get(`/api/manager/editions/${encodeURIComponent(scopedEditionId())}/dashboard`);
    dashboard = data;
    const viewModel = buildManagerViewModel(data);
    const index = Math.max(0, editionIndexById(viewModel.id));
    editions[index] = viewModel;
    return viewModel;
  };

  const publishDifusoraPost = async () => {
    const messageField = document.querySelector("[data-push-message]");
    const message = messageField?.value.trim() || "";
    const edition = editions[state.pushIndex];

    if (!message) {
      openModal("Mensagem vazia", "Escreva um comunicado antes de publicar na Difusora.");
      messageField?.focus();
      return;
    }

    try {
      const sendButton = document.querySelector("[data-push-send]");
      if (sendButton) sendButton.disabled = true;
      await window.MemoraAPI.post(`/api/manager/editions/${encodeURIComponent(edition.id)}/difusora`, {
        text: message,
        tag: `comunicado - ${edition.name}`,
      });
      await refreshDashboard();
      messageField.value = "";
      updatePushPreview();
      window.dispatchEvent(new CustomEvent("memora:difusora:refresh", { detail: { editionId: edition.id } }));
      openModal("Push publicado", `Mensagem salva na Difusora de ${edition.name}.`);
    } catch (error) {
      openModal("Falha ao publicar", error.message || "Não foi possível publicar esta mensagem.");
    } finally {
      const sendButton = document.querySelector("[data-push-send]");
      if (sendButton) sendButton.disabled = false;
    }
  };

  const formatCurrency = (value) => Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const salePoints = (edition) => Array.isArray(edition.points) && edition.points.every((point) => point && typeof point === "object" && "sold" in point)
    ? edition.points
    : [];
  const editionSold = (edition) => salePoints(edition).reduce((total, point) => total + Number(point.sold || 0), 0) || Number(edition.sold || 0);
  const editionAvailable = (edition) => {
    const points = salePoints(edition);
    return points.length
      ? points.reduce((total, point) => total + Math.max(0, Number(point.allocated || 0) - Number(point.sold || 0)), 0)
      : Math.max(0, tokenTotalForEdition(edition) - Number(edition.activeTokens || 0) - editionSold(edition));
  };
  const editionRevenue = (edition) => formatCurrency(editionSold(edition) * Number(edition.unitPrice || 0));
  const editionUnitPrice = (edition) => edition.unitPrice ? formatCurrency(edition.unitPrice) : "Nao definido";

  const moneyMetric = (edition) => [
    ["Vendas", editionSold(edition)],
    ["Tokens ativos", edition.activeTokens],
    ["Leituras QR", edition.qrReads],
    ["Check-ins", edition.checkins],
    ["Valor unitário da peça", editionUnitPrice(edition)],
    ["Receita", edition.revenue || editionRevenue(edition)],
  ];

  const getCells = () => Array.from(document.querySelectorAll("[data-edition-index]"));
  const activeEdition = () => editions[state.activeIndex];
  const scopedEditionId = () => document.body?.dataset.managerEdition || "";
  const isScopedManagerPage = () => Boolean(scopedEditionId());
  const editionIndexById = (id) => editions.findIndex((edition) => edition.id === id);
  const hasTokenInventory = (edition) => Boolean(edition.tokenCode && edition.tokenTotal);
  const tokenTotalForEdition = (edition) => Number(edition.tokenTotal || edition.sold + edition.stock || 100);
  const fallbackWallpapers = [
    { name: "WP01.png", src: "assets/WP01.png" },
    { name: "WP02.png", src: "assets/WP02.png" },
  ];
  const defaultWallpapers = (edition = activeEdition()) => edition.wallpapers || fallbackWallpapers;
  let pendingWallpapers = null;
  let pendingWallpaperDeletes = new Set();

  const renderTokenIcons = (edition) => {
    const total = tokenTotalForEdition(edition);
    const counts = edition.realTokenCounts || { active: edition.activeTokens, sold: edition.sold, available: Math.max(0, total - edition.activeTokens - edition.sold) };
    return Array.from({ length: total }, (_, index) => {
      const tokenNumber = index + 1;
      const tokenLabel = `${edition.tokenCode || "MEMO"}-${String(tokenNumber).padStart(3, "0")}`;
      const isActive = tokenNumber <= counts.active;
      const isSold = tokenNumber > counts.active && tokenNumber <= counts.active + counts.sold;
      const tokenStatus = isActive ? "ativado" : isSold ? "vendido" : "disponivel para venda";
      const statusClass = isActive ? "is-active" : isSold ? "is-sold" : "is-available";
      return `
        <span
          class="manager-token-hex ${statusClass}"
          title="Token ${escapeHtml(tokenLabel)}: ${tokenStatus}"
          aria-label="Token ${escapeHtml(tokenLabel)}: ${tokenStatus}"
          role="img"
        ></span>
      `;
    }).join("");
  };

  const syncProfileToEdition = (edition) => {
    if (!edition?.manager) return;
    profile.name = edition.manager.name;
    profile.type = edition.manager.type;
    profile.contact = edition.manager.contact;
    profile.avatar = edition.manager.avatar;
    profile.stats = edition.manager.stats;
  };

  const renderManagerChrome = (edition) => {
    const managerName = edition.manager?.name || profile.name;
    document.title = `${managerName} | Memora Manager`;

    const managerTitle = document.querySelector("#manager-title");
    if (managerTitle) {
      managerTitle.innerHTML = edition.titleLogo
        ? `<img class="manager-title-logo" src="${escapeHtml(edition.titleLogo)}" alt="${escapeHtml(edition.name)}">`
        : escapeHtml(managerName);
    }

    const heroEyebrow = document.querySelector(".manager-hero-copy .eyebrow");
    if (heroEyebrow) heroEyebrow.textContent = "manager da edição";

    const heroCopy = document.querySelector(".manager-hero-copy > p:last-child");
    if (heroCopy) heroCopy.textContent = `Painel de ${managerName} para operar ${edition.name}, acompanhar a comunidade e publicar comunicados na Difusora.`;

    const heroStatus = document.querySelector(".manager-hero-status span");
    if (heroStatus) heroStatus.textContent = "edição ativa";

    const heroHint = document.querySelector(".manager-hero-status small");
    if (heroHint) heroHint.textContent = isScopedManagerPage() ? "Esta Colmeia mostra apenas o favo desta edição." : "Selecione um favo para abrir o painel da edição.";

    const accountLink = document.querySelector(".login-cta");
    if (accountLink) accountLink.textContent = edition.authenticatedProfile?.display_name || managerName;

    const publicLink = document.querySelector("[data-panel-public-link]");
    if (publicLink) {
      publicLink.href = edition.publicPage;
      publicLink.textContent = "Ver página da edição";
      publicLink.setAttribute("aria-label", `Abrir página pública de ${edition.name}`);
    }
  };

  const renderEditionHive = () => {
    const track = document.querySelector("[data-edition-grid]");
    if (!track) return;

    const visibleEditions = isScopedManagerPage()
      ? editions.filter((edition) => edition.id === scopedEditionId())
      : editions;

    track.innerHTML = visibleEditions
      .map((edition) => {
        const index = editionIndexById(edition.id);
        return `
          <button class="memora-id-honeycomb-cell" type="button" data-edition-index="${index}" aria-label="Favo ${index + 1} - Manager de ${escapeHtml(edition.name)}" aria-pressed="false">
            <img src="${escapeHtml(edition.tile)}" alt="Favo ${index + 1} de ${escapeHtml(edition.name)}">
          </button>
        `;
      })
      .join("");
  };

  const syncHiveEdgePadding = () => {
    const viewport = document.querySelector("[data-hive-viewport]");
    const track = document.querySelector("[data-edition-grid]");
    const firstCell = getCells()[0];
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
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / 260);
      viewport.scrollLeft = start + distance * (1 - Math.pow(1 - progress, 3));
      if (progress < 1) hiveScrollFrame = window.requestAnimationFrame(tick);
    };
    hiveScrollFrame = window.requestAnimationFrame(tick);
  };

  const centerActiveCell = (behavior = "smooth") => {
    const viewport = document.querySelector("[data-hive-viewport]");
    const activeCell = document.querySelector("[data-edition-index].is-active");
    if (!viewport || !activeCell) return;
    syncHiveEdgePadding();
    const left = activeCell.offsetLeft - (viewport.clientWidth - activeCell.offsetWidth) / 2;
    animateHiveScroll(viewport, left, behavior);
  };

  const renderProfile = () => {
    document.querySelector("[data-profile-name]").textContent = profile.name;
    document.querySelector("[data-profile-type]").textContent = profile.type;
    document.querySelector("[data-profile-contact]").innerHTML = profile.contact.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    const avatar = document.querySelector("[data-profile-avatar]");
    avatar.src = profile.avatar;
    avatar.alt = `Avatar do realizador ${profile.name}`;
    document.querySelector("[data-profile-stats]").innerHTML = Object.entries(profile.stats)
      .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
      .join("");
  };

  const renderPanel = () => {
    const edition = activeEdition();
    syncProfileToEdition(edition);
    renderProfile();
    renderManagerChrome(edition);
    document.querySelector("[data-panel-title]").textContent = edition.name;
    document.querySelector("[data-panel-module]").textContent = `Módulo comercial ${edition.module}`;
    document.querySelector("[data-panel-status]").textContent = `Status ${edition.status}`;
    document.querySelector("[data-active-edition-label]").textContent = edition.name;
    const metrics = document.querySelector("[data-panel-metrics]");
    metrics.setAttribute("aria-label", "Métricas de apresentação da edição; não são analytics operacionais");
    metrics.innerHTML = moneyMetric(edition)
      .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
      .join("");

    renderTokenConfig(edition);
    renderArte(edition);
    renderCoaster(edition);
    renderCommunity(edition);
    renderToken(edition);
    renderPayments(edition);
    renderCapsule(edition);
    syncDifusoraToActive();
  };

  const renderTokenConfig = (edition) => {
    const config = document.querySelector("[data-token-config]");
    if (!config) return;
    const codeField = config.querySelector("[data-token-edition-code]");
    const totalField = config.querySelector("[data-token-total]");
    const hasInventory = hasTokenInventory(edition);
    config.hidden = !hasInventory;
    if (codeField) codeField.value = hasInventory ? edition.tokenCode : "";
    if (totalField) totalField.value = hasInventory ? tokenTotalForEdition(edition) : "";
  };

  const readImageFileAsDataUrl = (file, options = {}) => new Promise((resolve) => {
    const maxWidth = options.maxWidth || 1400;
    const maxHeight = options.maxHeight || 2200;
    const quality = options.quality || 0.84;
    const fallbackReader = () => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result || "")));
      reader.addEventListener("error", () => resolve(""));
      reader.readAsDataURL(file);
    };

    if (!file?.type?.startsWith("image/") || typeof Image === "undefined") {
      fallbackReader();
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const originalSrc = String(reader.result || "");
      const image = new Image();
      image.addEventListener("load", () => {
        const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(originalSrc);
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      });
      image.addEventListener("error", () => resolve(originalSrc));
      image.src = originalSrc;
    });
    reader.addEventListener("error", () => resolve(""));
    reader.readAsDataURL(file);
  });

  const currentEditionCover = (edition = activeEdition()) => edition.image || "";

  const renderEditionCoverCard = (edition) => {
    const coverSrc = currentEditionCover(edition);
    const isEditableCover = true;
    if (!isEditableCover) {
      return `
        <article class="manager-section-card manager-edition-cover-card">
          <strong>Capa da edição</strong>
          <a class="manager-edition-cover-link" href="${escapeHtml(edition.publicPage)}#arte-capa" aria-label="Abrir capa de ${escapeHtml(edition.name)} na página da edição">
            <img src="${escapeHtml(coverSrc || edition.image)}" alt="Capa de ${escapeHtml(edition.name)}">
          </a>
          <p>Arquivo principal exibido nos tokens, comunicações e na página pública da edição.</p>
        </article>
      `;
    }

    return `
      <article class="manager-section-card manager-edition-cover-card manager-edition-cover-config">
        <strong>Capa da edição</strong>
        <label class="manager-card-upload-target manager-edition-cover-upload">
          <span>Anexar capa</span>
          <input type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" data-edition-cover-upload>
          <span class="manager-card-preview manager-edition-cover-preview ${coverSrc ? "has-image" : ""}" data-edition-cover-preview-wrap>
            <img src="${escapeHtml(coverSrc)}" alt="Preview da capa de ${escapeHtml(edition.name)}" data-edition-cover-preview ${coverSrc ? "" : "hidden"}>
            <small data-edition-cover-placeholder>${coverSrc ? "Trocar capa" : "Anexar capa"}</small>
          </span>
        </label>
        <p>Arquivo principal exibido nos tokens, comunicações e na página pública da edição.</p>
        <div class="manager-card-save-row manager-edition-cover-actions">
          <button class="memora-id-action-button manager-card-save" type="button" data-edition-cover-save>Salvar</button>
          <button class="memora-id-action-button manager-card-remove" type="button" data-edition-cover-remove>Remover</button>
          <span class="manager-card-save-status" data-edition-cover-status>${coverSrc ? "Capa carregada para esta edição." : "Envie uma imagem para publicar a capa da edição."}</span>
        </div>
      </article>
    `;
  };

  const setEditionCoverStatus = (message, tone = "") => {
    const status = document.querySelector("[data-edition-cover-status]");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const setEditionCoverPreview = (src = "") => {
    const preview = document.querySelector("[data-edition-cover-preview]");
    const placeholder = document.querySelector("[data-edition-cover-placeholder]");
    const wrap = document.querySelector("[data-edition-cover-preview-wrap]");
    if (!preview || !placeholder || !wrap) return;
    wrap.classList.toggle("has-image", Boolean(src));
    preview.hidden = !src;
    if (src) preview.src = src;
    else preview.removeAttribute("src");
    placeholder.textContent = src ? "Trocar capa" : "Anexar capa";
  };

  const initEditionCoverUploads = () => {
    const edition = activeEdition();
    const upload = document.querySelector("[data-edition-cover-upload]");
    const preview = document.querySelector("[data-edition-cover-preview]");
    upload?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      readImageFileAsDataUrl(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.88 }).then((src) => {
        if (!src) return;
        preview.pendingEditionCoverFile = file;
        setEditionCoverPreview(src);
        setEditionCoverStatus("Capa carregada. Clique em Salvar para publicar na página da edição.", "pending");
        event.target.value = "";
      });
    });

    document.querySelector("[data-edition-cover-save]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const file = preview?.pendingEditionCoverFile;
      if (!file) {
        setEditionCoverStatus("Selecione uma nova imagem antes de salvar.", "error");
        return;
      }
      button.disabled = true;
      setEditionCoverStatus("Salvando capa…", "pending");
      try {
        const form = new FormData();
        form.set("file", file);
        await window.MemoraAPI.put(`/api/manager/editions/${encodeURIComponent(edition.id)}/assets/edition_cover`, form);
        await refreshDashboard();
        renderPanel();
        setEditionCoverStatus("Capa salva e confirmada pelo servidor.", "saved");
      } catch (error) {
        setEditionCoverStatus(error.message || "Não foi possível salvar a capa.", "error");
      } finally {
        button.disabled = false;
      }
    });

    document.querySelector("[data-edition-cover-remove]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      if (!edition.coverAsset) {
        if (preview) delete preview.pendingEditionCoverFile;
        setEditionCoverPreview(currentEditionCover(edition));
        setEditionCoverStatus("A capa de compatibilidade só poderá ser removida após a migração de apresentação.", "error");
        return;
      }
      button.disabled = true;
      setEditionCoverStatus("Removendo capa…", "pending");
      try {
        await window.MemoraAPI.delete(`/api/manager/editions/${encodeURIComponent(edition.id)}/assets/${encodeURIComponent(edition.coverAsset.id)}`);
        await refreshDashboard();
        renderPanel();
        setEditionCoverStatus("Upload removido. A capa de compatibilidade voltou a ser exibida.", "saved");
      } catch (error) {
        setEditionCoverStatus(error.message || "Não foi possível remover a capa.", "error");
      } finally {
        button.disabled = false;
      }
    });
  };
  const renderDigitalCardUploads = (edition) => {
    return `
      <article class="manager-section-card manager-digital-card-config">
        <div class="manager-card-config-copy">
          <strong>Card Digital</strong>
          <p>Configure frente e verso do card fisico em um unico quadro funcional.</p>
        </div>
        <div class="manager-card-composer" aria-label="Uploads do Card Digital">
          <div class="manager-card-side">
            <label class="manager-card-upload-target">
              <span>Frente</span>
              <input type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" data-card-upload="front">
              <span class="manager-card-preview" data-card-preview-wrap="front">
                <img data-card-preview="front" alt="Preview da frente do Card Digital" hidden>
                <small data-card-placeholder="front">${edition.digitalCard?.front ? "Trocar frente" : "Anexar frente"}</small>
              </span>
            </label>
            <button class="manager-card-remove" type="button" data-card-remove="front">Remover</button>
          </div>

          <div class="manager-card-side">
            <label class="manager-card-upload-target">
              <span>Verso</span>
              <input type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" data-card-upload="back">
              <span class="manager-card-preview" data-card-preview-wrap="back">
                <img data-card-preview="back" alt="Preview do verso do Card Digital" hidden>
                <small data-card-placeholder="back">${edition.digitalCard?.back ? "Trocar verso" : "Anexar verso"}</small>
              </span>
            </label>
            <button class="manager-card-remove" type="button" data-card-remove="back">Remover</button>
          </div>
        </div>
        <div class="manager-card-save-row">
          <button class="memora-id-action-button manager-card-save" type="button" data-card-save>Salvar card</button>
          <span class="manager-card-save-status" data-card-save-status>Envie frente e verso para atualizar a pagina da edicao.</span>
        </div>
      </article>
    `;
  };

  const currentWallpapers = () => {
    const wallpapers = Array.isArray(pendingWallpapers) ? pendingWallpapers : defaultWallpapers();
    return wallpapers.map((item, index) => ({ ...item, storedIndex: index, isDefault: !item.assetId && !item.file }));
  };

  const renderWallpaperUploader = (edition) => {
    return `
      <article class="manager-section-card manager-wallpaper-config">
        <strong>Wallpaper para download</strong>
        <p>Anexe imagens para aparecerem como miniaturas na pagina publica da edicao.</p>
        <label class="manager-wallpaper-upload">
          <span>Anexar arquivos</span>
          <input type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" multiple data-wallpaper-upload>
        </label>
        <div class="manager-wallpaper-grid" data-wallpaper-preview-list></div>
        <button class="memora-id-action-button manager-wallpaper-clear" type="button" data-wallpaper-clear>Remover arquivos anexados</button>
        <div class="manager-card-save-row">
          <button class="memora-id-action-button manager-card-save" type="button" data-wallpaper-save>Salvar</button>
          <span class="manager-card-save-status" data-wallpaper-save-status>${escapeHtml(defaultWallpapers(edition).map((wallpaper) => wallpaper.name).join(" e "))} estao carregados como exemplo.</span>
        </div>
      </article>
    `;
  };

  const setWallpaperStatus = (message, tone = "") => {
    const status = document.querySelector("[data-wallpaper-save-status]");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const renderWallpaperPreviewList = () => {
    const list = document.querySelector("[data-wallpaper-preview-list]");
    if (!list) return;
    list.innerHTML = currentWallpapers()
      .map((wallpaper) => `
        <figure class="manager-wallpaper-thumb">
          ${wallpaper.isDefault ? "" : `<button class="manager-wallpaper-remove" type="button" data-wallpaper-remove="${wallpaper.storedIndex}" aria-label="Remover ${escapeHtml(wallpaper.name || "wallpaper anexado")}" title="Remover arquivo anexado">x</button>`}
          <img src="${escapeHtml(wallpaper.src)}" alt="${escapeHtml(wallpaper.name || "Wallpaper da edicao")}">
          <figcaption>${escapeHtml(wallpaper.name || "Wallpaper")}</figcaption>
        </figure>
      `)
      .join("");
  };

  const initWallpaperUploads = () => {
    const edition = activeEdition();
    pendingWallpapers = defaultWallpapers(edition).map((wallpaper) => ({ ...wallpaper }));
    pendingWallpaperDeletes = new Set();
    renderWallpaperPreviewList();

    document.querySelector("[data-wallpaper-preview-list]")?.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-wallpaper-remove]");
      if (!removeButton) return;
      const removeIndex = Number(removeButton.dataset.wallpaperRemove);
      const removed = pendingWallpapers?.[removeIndex];
      if (removed?.assetId) pendingWallpaperDeletes.add(removed.assetId);
      pendingWallpapers = (pendingWallpapers || []).filter((_, index) => index !== removeIndex);
      renderWallpaperPreviewList();
      setWallpaperStatus("Arquivo removido da seleção. Clique em Salvar para atualizar a página da edição.", "pending");
    });
    document.querySelector("[data-wallpaper-clear]")?.addEventListener("click", () => {
      const uploaded = (pendingWallpapers || []).filter((wallpaper) => wallpaper.assetId);
      uploaded.forEach((wallpaper) => pendingWallpaperDeletes.add(wallpaper.assetId));
      pendingWallpapers = (pendingWallpapers || []).filter((wallpaper) => !wallpaper.assetId && !wallpaper.file);
      renderWallpaperPreviewList();
      setWallpaperStatus(uploaded.length ? "Uploads marcados para remoção. Clique em Salvar." : "Os exemplos de compatibilidade permanecem até a migração de apresentação.", uploaded.length ? "pending" : "error");
    });

    document.querySelector("[data-wallpaper-upload]")?.addEventListener("change", (event) => {
      const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
      if (!files.length) return;

      Promise.all(files.map((file) => readImageFileAsDataUrl(file, { maxWidth: 1200, maxHeight: 2134, quality: 0.82 })
        .then((src) => (src ? { name: file.name, src, file } : null)))).then((loadedFiles) => {
        const validFiles = loadedFiles.filter(Boolean);
        if (!validFiles.length) return;

        pendingWallpapers = [...(pendingWallpapers || []), ...validFiles];
        renderWallpaperPreviewList();
        setWallpaperStatus(`${validFiles.length} arquivo(s) anexado(s). Clique em Salvar para atualizar a página da edição.`, "pending");
        event.target.value = "";
      });
    });

    document.querySelector("[data-wallpaper-save]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const uploads = (pendingWallpapers || []).filter((wallpaper) => wallpaper.file);
      button.disabled = true;
      setWallpaperStatus("Salvando wallpapers…", "pending");
      try {
        for (const assetId of pendingWallpaperDeletes) {
          await window.MemoraAPI.delete(`/api/manager/editions/${encodeURIComponent(edition.id)}/assets/${encodeURIComponent(assetId)}`);
        }
        for (let index = 0; index < uploads.length; index += 1) {
          const form = new FormData();
          form.set("file", uploads[index].file);
          form.set("sort_order", String(index));
          await window.MemoraAPI.put(`/api/manager/editions/${encodeURIComponent(edition.id)}/assets/wallpaper`, form);
        }
        await refreshDashboard();
        renderPanel();
        setWallpaperStatus("Wallpapers salvos e confirmados pelo servidor.", "saved");
      } catch (error) {
        setWallpaperStatus(error.message || "Não foi possível salvar os wallpapers.", "error");
      } finally {
        button.disabled = false;
      }
    });
  };
  const setCardPreview = (preview, placeholder, dataUrl) => {
    if (!preview || !placeholder) return;
    preview.hidden = !dataUrl;
    preview.parentElement?.classList.toggle("has-image", Boolean(dataUrl));
    if (dataUrl) preview.src = dataUrl;
    else preview.removeAttribute("src");
    placeholder.hidden = Boolean(dataUrl);
  };

  const setSaveStatus = (message, tone = "") => {
    const status = document.querySelector("[data-card-save-status]");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const setupCardUpload = (input, preview, removeButton, fallbackSrc = "") => {
    if (!input || !preview) return;
    const side = input.dataset.cardUpload;
    const placeholder = document.querySelector(`[data-card-placeholder="${side}"]`);
    setCardPreview(preview, placeholder, fallbackSrc);

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;

      readImageFileAsDataUrl(file, { maxWidth: 1400, maxHeight: 2200, quality: 0.86 }).then((dataUrl) => {
        if (!dataUrl) return;
        preview.pendingCardFile = file;
        preview.removeRequested = false;
        setCardPreview(preview, placeholder, dataUrl);
        setSaveStatus("Imagem carregada. Clique em Salvar card para publicar no Card Digital.", "pending");
      });
    });

    removeButton?.addEventListener("click", (event) => {
      event.preventDefault();
      input.value = "";
      delete preview.pendingCardFile;
      preview.removeRequested = true;
      setCardPreview(preview, placeholder, "");
      setSaveStatus("Imagem removida do preview. Clique em Salvar card para atualizar a página da edição.", "pending");
    });
  };

  const saveDigitalCardImages = async (event) => {
    const edition = activeEdition();
    const sides = [
      { side: "front", slot: "card_front", asset: edition.cardAssets?.front },
      { side: "back", slot: "card_back", asset: edition.cardAssets?.back },
    ];
    const button = event?.currentTarget || document.querySelector("[data-card-save]");
    if (button) button.disabled = true;
    setSaveStatus("Salvando Card Digital…", "pending");
    try {
      let changed = false;
      for (const { side, slot, asset } of sides) {
        const preview = document.querySelector(`[data-card-preview="${side}"]`);
        if (preview?.pendingCardFile) {
          const form = new FormData();
          form.set("file", preview.pendingCardFile);
          await window.MemoraAPI.put(`/api/manager/editions/${encodeURIComponent(edition.id)}/assets/${slot}`, form);
          changed = true;
        } else if (preview?.removeRequested && asset) {
          await window.MemoraAPI.delete(`/api/manager/editions/${encodeURIComponent(edition.id)}/assets/${encodeURIComponent(asset.id)}`);
          changed = true;
        }
      }
      if (!changed) {
        setSaveStatus("Selecione uma imagem. Os exemplos de compatibilidade permanecem até a migração de apresentação.", "error");
        return;
      }
      await refreshDashboard();
      renderPanel();
      setSaveStatus("Card Digital salvo e confirmado pelo servidor.", "saved");
    } catch (error) {
      setSaveStatus(error.message || "Não foi possível salvar o Card Digital.", "error");
    } finally {
      if (button) button.disabled = false;
    }
  };
  const initDigitalCardUploads = () => {
    const edition = activeEdition();
    setupCardUpload(
      document.querySelector('[data-card-upload="front"]'),
      document.querySelector('[data-card-preview="front"]'),
      document.querySelector('[data-card-remove="front"]'),
      edition.digitalCard?.front || ""
    );
    setupCardUpload(
      document.querySelector('[data-card-upload="back"]'),
      document.querySelector('[data-card-preview="back"]'),
      document.querySelector('[data-card-remove="back"]'),
      edition.digitalCard?.back || ""
    );
    document.querySelector("[data-card-save]")?.addEventListener("click", saveDigitalCardImages);
  };

  const renderArte = (edition) => {
    const illustrator = edition.illustrator;
    document.querySelector('[data-section="arte"]').innerHTML = `
      <div class="manager-section-grid">
        ${renderEditionCoverCard(edition)}
        <article class="manager-section-card manager-illustrator-card">
          <strong class="manager-illustrator-title">${escapeHtml(illustrator.title)}</strong>
          <div class="manager-illustrator-avatar">
            <img src="${escapeHtml(illustrator.avatar)}" alt="Retrato do ilustrador ${escapeHtml(illustrator.name)}">
          </div>
          <div class="manager-illustrator-info">
            <div class="manager-illustrator-heading">
              <strong>${escapeHtml(illustrator.handle)}</strong>
              <span aria-hidden="true">...</span>
            </div>
            <p class="manager-illustrator-name">${escapeHtml(illustrator.name)}</p>
            <dl class="manager-illustrator-stats" aria-label="Metricas do perfil do ilustrador">
              <div><dt>posts</dt><dd>${escapeHtml(illustrator.posts)}</dd></div>
              <div><dt>seguidores</dt><dd>${escapeHtml(illustrator.followers)}</dd></div>
              <div><dt>seguindo</dt><dd>${escapeHtml(illustrator.following)}</dd></div>
            </dl>
            <p class="manager-illustrator-bio">${escapeHtml(illustrator.bio)}</p>
            <a class="manager-illustrator-instagram" href="${escapeHtml(illustrator.url)}" target="_blank" rel="noopener">Acessar perfil do Instagram</a>
          </div>
        </article>
        ${renderWallpaperUploader(edition)}
        ${renderDigitalCardUploads(edition)}
      </div>
      <div class="manager-section-actions">
        <button class="memora-id-action-button" type="button" data-modal-open="Upload de arquivos">Upload mockado de arquivos</button>
      </div>
    `;
    bindModalButtons(document.querySelector('[data-section="arte"]'));
    initWallpaperUploads();
    initEditionCoverUploads();
    initDigitalCardUploads();
  };
  const renderCoaster = (edition) => {
    const total = tokenTotalForEdition(edition);
    const counts = edition.realTokenCounts || { active: edition.activeTokens, sold: edition.sold, available: Math.max(0, total - edition.activeTokens - edition.sold) };
    const tokenPanel = hasTokenInventory(edition) ? `
      <details class="manager-token-panel" open>
        <summary>
          <span>Tokens — inventário operacional</span>
          <small>${counts.active} ativados - ${counts.sold} vendidos - ${counts.available} disponíveis</small>
        </summary>
        <div class="manager-token-legend" aria-label="Legenda dos tokens">
          <span><i class="manager-token-swatch is-active"></i>Ativado</span>
          <span><i class="manager-token-swatch is-sold"></i>Vendido</span>
          <span><i class="manager-token-swatch is-available"></i>Disponivel</span>
        </div>
        <div class="manager-token-grid" aria-label="Mapa de 100 tokens da edicao">
          ${renderTokenIcons(edition)}
        </div>
      </details>
    ` : "";
    document.querySelector('[data-section="coaster"]').innerHTML = `
      <div class="manager-section-grid">
        ${edition.logs.map((log) => `<article class="manager-log-card"><strong>Leitura QR</strong><span>${escapeHtml(log)}</span><p>Registro mockado de local, data e hora.</p></article>`).join("")}
        <article class="manager-log-card"><strong>Check-in / check-out</strong><span>${edition.module === "Stage" ? `${edition.checkins} entradas confirmadas` : "Sem check-in neste modulo"}</span><p>Histórico de presenca acompanha a jornada fisica do token.</p></article>
        <article class="manager-log-card"><strong>Alerta de uso suspeito</strong><span>Nenhum alerta critico</span><p>Padroes fora do comum apareceriam aqui antes de qualquer bloqueio.</p></article>
      </div>
      ${tokenPanel}
      <button class="memora-id-action-button" type="button" data-modal-open="Logs completos">Ver logs completos</button>
    `;
    bindModalButtons(document.querySelector('[data-section="coaster"]'));
  };
  const renderCommunity = (edition) => {
    document.querySelector('[data-section="comunidade"]').innerHTML = `
      <p class="manager-sensitive-note">Registros demonstrativos de apresentação. Não são dados de colecionadores reais. Informações de saúde e contato de emergência só aparecem nos exemplos com consentimento.</p>
      <div class="manager-panel-meta" aria-label="Filtros mockados">
        <span>Participantes</span><span>Compradores</span><span>Check-in realizado</span><span>Emergencia disponivel</span>
      </div>
      <div class="manager-community-grid">
        ${edition.collectors.map((person) => `
          <article class="manager-community-card">
            <strong>${escapeHtml(person.name)}</strong>
            <span>${escapeHtml(person.instagram)} - ${escapeHtml(person.phone)}</span>
            <span class="manager-status-pill">Token ${escapeHtml(person.status)}</span>
            <span class="manager-consent">${person.consent ? "Consentimento concedido" : "Sem consentimento sensivel"}</span>
            <p>${person.consent ? `Saude: ${escapeHtml(person.health)}<br>Emergencia: ${escapeHtml(person.emergency)}` : "Dados de saude e emergencia ocultos."}</p>
          </article>
        `).join("")}
      </div>
    `;
  };

  const renderToken = (edition) => {
    const counts = edition.realTokenCounts || { active: edition.activeTokens, disabled: 0 };
    document.querySelector('[data-section="token"]').innerHTML = `
      <div class="manager-section-grid">
        <article class="manager-section-card"><strong>Status geral</strong><span class="manager-status-pill">${escapeHtml(edition.status)}</span><p>${counts.active} tokens ativos no inventário autenticado; ${counts.disabled} desativados.</p></article>
        <article class="manager-section-card"><strong>Ativar/desativar token</strong><p>Ações criticas pedem confirmação antes de alterar o estado mockado.</p><button class="memora-id-action-button" type="button" data-critical-token>Desativar token</button></article>
        <article class="manager-section-card"><strong>Historico de alteracoes</strong><p>Ultima configuracao salva hoje as 14:28 por ${escapeHtml(profile.name)}.</p></article>
      </div>
      <div class="manager-panel-meta">${edition.links.map((link) => `<span>${escapeHtml(link)}</span>`).join("")}</div>
      <button class="memora-id-action-button" type="button" data-modal-open="Salvar configuração">Salvar configuração</button>
    `;
    bindModalButtons(document.querySelector('[data-section="token"]'));
    document.querySelector("[data-critical-token]")?.addEventListener("click", () => openModal("Confirmar desativacao", "Desativar tokens e uma acao critica. Neste protótipo, a confirmação aparece em modal e nada e salvo ou enviado a um backend."));
  };

  const renderPayments = (edition) => {
    const points = salePoints(edition);
    document.querySelector('[data-section="pagamentos"]').innerHTML = `
      <p class="manager-sensitive-note">Valores demonstrativos de apresentação; não representam integração financeira ou relatório operacional.</p>
      <div class="manager-payment-grid">
        <article class="manager-payment-card"><strong>Unidades vendidas</strong><span>${editionSold(edition)}</span><p>Consolidado da edicao selecionada.</p></article>
        <article class="manager-payment-card"><strong>Receita total</strong><span>${escapeHtml(edition.unitPrice ? editionRevenue(edition) : edition.revenue)}</span><p>Calculada pelas unidades vendidas.</p></article>
        <article class="manager-payment-card"><strong>Estoque disponivel</strong><span>${editionAvailable(edition)} unidades</span><p>Entrada e baixa por ponto de distribuicao.</p></article>
        ${points.length ? `<section class="manager-sales-by-point" aria-labelledby="sales-by-point-title">
          <div class="manager-sales-by-point-heading"><div><p class="eyebrow">distribuicao da edicao</p><h4 id="sales-by-point-title">Pontos de venda</h4></div><span>${tokenTotalForEdition(edition)} tokens distribuidos</span></div>
          <div class="manager-sales-by-point-list">${points.map((point) => {
            const available = Math.max(0, Number(point.allocated || 0) - Number(point.sold || 0));
            const pointRevenue = formatCurrency(Number(point.sold || 0) * Number(edition.unitPrice || 0));
            return `<article class="manager-sales-point-card"><strong>${escapeHtml(point.name)}</strong><dl><div><dt>Disponibilizados</dt><dd>${point.allocated} tokens</dd></div><div><dt>Vendidos</dt><dd>${point.sold} tokens</dd></div><div><dt>Disponiveis</dt><dd>${available} tokens</dd></div><div><dt>Receita gerada</dt><dd>${pointRevenue}</dd></div></dl></article>`;
          }).join("")}</div>
        </section>` : edition.points.map((point) => `<article class="manager-payment-card"><strong>${escapeHtml(point)}</strong><span>Ponto de venda</span><p>Contato e endereco mockados para controle logistico.</p></article>`).join("")}
        <article class="manager-payment-card"><strong>Vaquinha / campanha online</strong><span>${escapeHtml(edition.campaign)}</span><p>Area exibida para modulos Stage e Artist quando houver campanha.</p></article>
      </div>
    `;
  };

  const renderCapsule = (edition) => {
    const capsuleSection = document.querySelector('[data-section="capsula"]');
    if (!capsuleSection) return;
    const formatDate = (value) => {
      const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
      if (!parts) return "Data não informada";
      return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]), 12));
    };
    let timeline = capsuleSection.querySelector("[data-timeline-scroll]");
    if (!timeline) {
      timeline = document.createElement("div");
      timeline.className = "toninho-timeline-mock";
      timeline.dataset.timelineScroll = "";
      timeline.setAttribute("aria-label", "Linha do tempo de acontecimentos");
      capsuleSection.prepend(timeline);
    }
    const entries = edition.capsule || [];
    timeline.innerHTML = entries.length
      ? entries.map((entry) => `<article class="toninho-timeline-mock-item" data-api-capsule-entry="${escapeHtml(entry.id)}"><span class="toninho-timeline-mock-marker" aria-hidden="true"></span><div class="toninho-timeline-mock-content">${entry.image_url ? `<img src="${escapeHtml(entry.image_url)}" alt="Foto da recordação">` : ""}<p>${escapeHtml(entry.text)}</p><time datetime="${escapeHtml(entry.event_date)}">${escapeHtml(formatDate(entry.event_date))}</time></div></article>`).join("")
      : '<article class="toninho-timeline-mock-item" data-api-capsule-state="empty"><span class="toninho-timeline-mock-marker" aria-hidden="true"></span><div class="toninho-timeline-mock-content"><p>Ainda não há recordações nesta linha do tempo.</p></div></article>';
    requestAnimationFrame(() => {
      const timeline = capsuleSection.querySelector("[data-timeline-scroll]");
      if (timeline) timeline.scrollTop = timeline.scrollHeight;
    });
  };

  const setActiveEdition = (index, options = {}) => {
    state.activeIndex = (index + editions.length) % editions.length;
    getCells().forEach((cell) => {
      const isActive = Number(cell.dataset.editionIndex) === state.activeIndex;
      cell.classList.toggle("is-active", isActive);
      cell.setAttribute("aria-pressed", String(isActive));
      if (isActive) cell.setAttribute("aria-current", "true");
      else cell.removeAttribute("aria-current");
    });
    document.querySelector("[data-edition-counter]").textContent = `${state.activeIndex + 1} / ${editions.length}`;
    document.querySelector("[data-edition-prev]").hidden = isScopedManagerPage();
    document.querySelector("[data-edition-next]").hidden = isScopedManagerPage();
    renderPanel();
    if (options.scroll !== false) centerActiveCell();
  };

  const openEditionManager = (index, options = {}) => {
    const normalizedIndex = (index + editions.length) % editions.length;
    const edition = editions[normalizedIndex];

    if (isScopedManagerPage() && edition.id !== scopedEditionId()) {
      window.location.href = edition.managerPage;
      return;
    }

    setActiveEdition(normalizedIndex, options);
  };

  const renderSelects = () => {
    const options = editions.map((edition, index) => `<option value="${index}">${escapeHtml(edition.name)}</option>`).join("");
    document.querySelector("[data-push-edition]").innerHTML = options;
    document.querySelector("[data-whatsapp-edition]").innerHTML = options;
  };

  const syncDifusoraToActive = () => {
    state.pushIndex = state.activeIndex;
    state.whatsappIndex = state.activeIndex;
    document.querySelector("[data-push-edition]").value = String(state.pushIndex);
    document.querySelector("[data-whatsapp-edition]").value = String(state.whatsappIndex);
    updatePushPreview();
    renderWhatsappContacts();
  };

  const updatePushPreview = () => {
    const message = document.querySelector("[data-push-message]").value;
    const edition = editions[state.pushIndex];
    document.querySelector("[data-push-counter]").textContent = `${message.length} / 180`;
    document.querySelector("[data-push-preview-title]").textContent = edition.name;
    document.querySelector("[data-push-preview-text]").textContent = message;
  };

  const renderWhatsappContacts = () => {
    const edition = editions[state.whatsappIndex];
    document.querySelector("[data-whatsapp-contacts]").innerHTML = edition.collectors
      .map((person, index) => `
        <label>
          <input type="checkbox" value="${index}">
          <span>${escapeHtml(person.name)} - ${escapeHtml(person.phone)}</span>
        </label>
      `)
      .join("");
  };


  const getProfileMenuElements = () => ({
    button: document.querySelector("[data-profile-toggle]"),
    menu: document.querySelector("[data-profile-menu]"),
  });

  const setProfileMenuOpen = (isOpen) => {
    const { button, menu } = getProfileMenuElements();
    if (!button || !menu) return;
    button.setAttribute("aria-expanded", String(isOpen));
    menu.hidden = !isOpen;
    menu.classList.toggle("is-open", isOpen);
    menu.style.height = isOpen ? "auto" : "";
    menu.style.overflow = isOpen ? "auto" : "";
  };

  const openAccordionPanel = (id) => {
    const panel = document.getElementById(id);
    if (!panel) return;
    const button = document.querySelector(`[aria-controls="${id}"]`);
    button?.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    panel.classList.add("is-open");
  };
  const openManagerPanelLink = (hash, options = {}) => {
    const id = String(hash || "").replace(/^#/, "");
    if (!id.startsWith("panel-")) return false;

    openAccordionPanel(id);
    const target = document.querySelector("[data-edition-panel]") || document.getElementById(id);
    target?.scrollIntoView({
      behavior: options.instant ? "auto" : "smooth",
      block: "start",
    });
    return true;
  };

  const bindAccordions = () => {
    document.querySelectorAll("[data-accordion-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const panel = document.getElementById(button.getAttribute("aria-controls"));
        if (!panel) return;
        const isOpen = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isOpen));
        panel.hidden = isOpen;
        panel.classList.toggle("is-open", !isOpen);
      });
    });
  };

  const openModal = (title, customBody) => {
    const modal = document.querySelector("[data-mock-modal]");
    modal.hidden = false;
    modal.querySelector("[data-modal-title]").textContent = title;
    modal.querySelector("[data-modal-body]").textContent = customBody || `${title} esta representado com dados mockados. Nenhuma acao externa, envio real, pagamento ou armazenamento sensivel e executado nesta versao.`;
    modal.querySelector("[data-modal-close]")?.focus();
  };

  const closeModal = () => {
    document.querySelector("[data-mock-modal]").hidden = true;
  };

  function bindModalButtons(scope = document) {
    scope.querySelectorAll("[data-modal-open]").forEach((button) => {
      if (button.dataset.boundModal) return;
      button.dataset.boundModal = "true";
      button.addEventListener("click", () => openModal(button.dataset.modalOpen));
    });
  }

  const bindControls = () => {
    document.querySelectorAll("[data-manager-theme-toggle]").forEach((toggle) => {
      toggle.addEventListener("change", () => {
        const theme = toggle.checked ? lightThemeValue : "dark";
        applyManagerTheme(theme);
        persistTheme(theme);
      });
    });
    getCells().forEach((cell) => cell.addEventListener("click", () => openEditionManager(Number(cell.dataset.editionIndex))));
    document.querySelector("[data-edition-prev]")?.addEventListener("click", () => openEditionManager(state.activeIndex - 1));
    document.querySelector("[data-edition-next]")?.addEventListener("click", () => openEditionManager(state.activeIndex + 1));
    document.querySelector("[data-profile-toggle]")?.addEventListener("click", () => {
      const { button } = getProfileMenuElements();
      setProfileMenuOpen(button.getAttribute("aria-expanded") !== "true");
    });
    document.querySelector("[data-open-difusora]")?.addEventListener("click", () => document.getElementById("difusora")?.scrollIntoView({ behavior: "smooth" }));
    document.querySelector("[data-open-community]")?.addEventListener("click", () => {
      openAccordionPanel("panel-comunidade");
      document.querySelector("[data-edition-panel]")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    document.querySelectorAll("[data-manager-panel-link]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (!openManagerPanelLink(link.hash)) return;
        event.preventDefault();
        history.pushState(null, "", link.hash);
      });
    });
    document.querySelector("[data-push-message]")?.addEventListener("input", updatePushPreview);
    document.querySelector("[data-push-send]")?.addEventListener("click", publishDifusoraPost);
    document.querySelector("[data-difusora-clear]")?.remove();
    document.querySelector("[data-push-edition]")?.addEventListener("change", (event) => {
      openEditionManager(Number(event.target.value));
    });
    document.querySelector("[data-whatsapp-edition]")?.addEventListener("change", (event) => {
      openEditionManager(Number(event.target.value));
    });
    document.querySelector("[data-whatsapp-open]")?.addEventListener("click", () => openModal("WhatsApp protótipo", "Seleção demonstrativa de contatos. Nenhuma conversa é aberta e nenhuma mensagem real é montada ou enviada."));
    document.querySelectorAll("[data-modal-close]").forEach((item) => item.addEventListener("click", closeModal));
    window.addEventListener("resize", () => centerActiveCell("auto"));
    window.addEventListener("hashchange", () => openManagerPanelLink(window.location.hash));
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeModal();
      setProfileMenuOpen(false);
    });
    bindModalButtons();
  };

  document.addEventListener("DOMContentLoaded", async () => {
    applyManagerTheme(readSavedTheme());
    const initialEditionIndex = Math.max(0, editionIndexById(scopedEditionId()));
    renderEditionHive();
    renderSelects();
    bindAccordions();
    bindControls();
    try {
      await refreshDashboard();
      setActiveEdition(initialEditionIndex, { scroll: false });
    } catch (error) {
      if ([401, 403].includes(error.status)) {
        window.location.assign(`/index.html?next=${encodeURIComponent(window.location.pathname)}#login`);
        return;
      }
      openModal("Falha ao carregar", error.message || "Não foi possível carregar o painel da edição.");
      return;
    }
    requestAnimationFrame(() => {
      centerActiveCell("auto");
      openManagerPanelLink(window.location.hash, { instant: true });
    });
  });
})();
