(() => {
  const profile = {
    name: "Guilherme",
    type: "Manager da banda Aura",
    contact: ["Instagram @aura.banda", "WhatsApp: (83) 98888-1200", "guilherme@memora.app"],
    avatar: "assets/avatar.png",
    stats: {
      Edições: 1,
      "Vendas totais": 100,
      "Tokens ativos": 100,
      Comunidade: 537,
    },
  };

  const editions = [
    {
      id: "aura",
      name: "Edição Aura",
      module: "Artist",
      status: "ativa",
      image: "assets/aura-memora.png",
      tile: "assets/MC1.png",
      managerPage: "manager-aura.html",
      publicPage: "edicao-aura.html",
      titleLogo: "assets/Aura logo.png",
      manager: {
        name: "Guilherme",
        type: "Manager da banda Aura",
        contact: ["Instagram @aura.banda", "WhatsApp: (83) 98888-1200", "guilherme@memora.app"],
        avatar: "assets/avatar.png",
        stats: { Edições: 1, "Vendas totais": 100, "Tokens ativos": 100, Comunidade: 537 },
      },
      sold: 100,
      activeTokens: 100,
      qrReads: 621,
      checkins: 0,
      revenue: "R$ 5.000,00",
      emergency: 84,
      stock: 0,
      campaign: "R$ 6.800,00 de R$ 10.000,00",
      collectors: [
        { name: "Lia Ramos", instagram: "@liaramos", phone: "(83) 99911-2300", status: "ativo", consent: true, health: "Alergia a dipirona", emergency: "Caio Ramos - (83) 98800-1200" },
        { name: "Bruno Lins", instagram: "@brunolins", phone: "(83) 98777-4500", status: "ativo", consent: false },
        { name: "Taina Alves", instagram: "@taina.alves", phone: "(83) 98123-0002", status: "pausado", consent: true, health: "Uso continuo de bombinha", emergency: "Marcia Alves - (83) 98110-4000" },
      ],
      links: ["Instagram", "Site oficial", "Realidade aumentada", "Loja", "Conteúdo exclusivo"],
      logs: ["João Pessoa - hoje, 14:18", "Campina Grande - ontem, 21:04", "Recife - 23 jun, 19:52"],
      points: ["Galeria Estação Cabo Branco", "Loja Memora Online", "Ateliê Aura"],
      memories: ["Foto da montagem da exposicao", "Relato da artista sobre a primeira tiragem", "Prints dos primeiros colecionadores"],
    },
    {
      id: "distance",
      name: "Edição Distance And Belief",
      module: "Music",
      status: "ativa",
      image: "assets/Capa.jpg",
      tile: "assets/MC2.png",
      managerPage: "manager-distance-and-belief.html",
      publicPage: "edicao-distance-and-belief.html",
      titleLogo: "assets/distance.png",
      manager: {
        name: "Arthur Miná",
        type: "Manager da edição Distance And Belief",
        contact: ["Instagram @arthurmina", "WhatsApp: (83) 99913-9300", "arthur@memora.app"],
        avatar: "assets/avatar.png",
        stats: { Edições: 1, "Vendas totais": 96, "Tokens ativos": 91, Comunidade: 3 },
      },
      sold: 96,
      activeTokens: 91,
      qrReads: 304,
      checkins: 0,
      revenue: "R$ 4.800,00",
      emergency: 31,
      stock: 4,
      campaign: "Campanha nao ativa neste modulo",
      collectors: [
        { name: "Nina Torres", instagram: "@ninatorres", phone: "(83) 98812-6688", status: "ativo", consent: false },
        { name: "Pedro Maia", instagram: "@pedromaia", phone: "(83) 99904-1122", status: "ativo", consent: true, health: "Restricao alimentar registrada", emergency: "Luiza Maia - (83) 99904-7788" },
        { name: "Rafa Nunes", instagram: "@rafanunes", phone: "(83) 98722-5001", status: "ativo", consent: false },
      ],
      links: ["Instagram", "Playlist", "Site oficial", "Conteúdo exclusivo", "Loja"],
      logs: ["São Paulo - hoje, 10:09", "João Pessoa - ontem, 18:33", "Curitiba - 22 jun, 23:12"],
      points: ["Bandcamp mockado", "Loja do artista", "Evento de lançamento"],
      memories: ["Video de ensaio", "Making of da capa", "Playlist comentada faixa a faixa"],
    },
    {
      id: "fourkaos",
      name: "Edição Fourkaos",
      module: "Stage",
      status: "ativa",
      image: "assets/fourkaos-background.jpg",
      tile: "assets/MC3.png",
      managerPage: "manager-fourkaos.html",
      publicPage: "edicao-fourkaos.html",
      titleLogo: "assets/LOGO FOURKAOS.png",
      manager: {
        name: "Johnny",
        type: "Manager da banda Fourkaos",
        contact: ["Instagram @fourkaos", "WhatsApp: (83) 98844-9000", "johnny@memora.app"],
        avatar: "assets/avatar.png",
        stats: { Edições: 1, "Vendas totais": 100, "Tokens ativos": 100, Comunidade: 3 },
      },
      sold: 100,
      activeTokens: 100,
      qrReads: 774,
      checkins: 241,
      revenue: "R$ 5.000,00",
      emergency: 187,
      stock: 0,
      campaign: "R$ 11.420,00 de R$ 16.000,00",
      collectors: [
        { name: "Iago Ferraz", instagram: "@iagoferraz", phone: "(83) 98844-9000", status: "check-in realizado", consent: true, health: "Diabético", emergency: "Renata Ferraz - (83) 98844-9010" },
        { name: "Mel Duarte", instagram: "@melduarte", phone: "(83) 99915-4421", status: "check-in realizado", consent: true, health: "Ansiedade em multidões", emergency: "Bia Duarte - (83) 99915-1111" },
        { name: "Cesar Brito", instagram: "@cesarbrito", phone: "(83) 98770-8181", status: "comprador", consent: false },
      ],
      links: ["Instagram", "Site oficial", "Playlist", "Loja", "Conteúdo exclusivo"],
      logs: ["Casa de Show Aurora - hoje, 22:11", "Casa de Show Aurora - hoje, 21:48", "Portaria lateral - hoje, 21:07"],
      points: ["Bilheteria Aurora", "Sympla mockado", "Loja da banda"],
      memories: ["Check-ins da noite", "Setlist fotografado", "Relatos da comunidade no pós-show"],
    },
    {
      id: "toninho-borbo-biplano",
      name: "Edição Toninho Borbo | Biplano",
      module: "Music",
      status: "ativa",
      image: "assets/toninho-biplano-background.png",
      tile: "assets/MC4.png",
      managerPage: "manager-toninho-borbo-biplano.html",
      publicPage: "edicao-toninho-borbo-biplano.html",
      titleLogo: "assets/toninho-biplano-logo.png",
      manager: {
        name: "Toninho Borbo",
        type: "Manager da edição Biplano",
        contact: ["Instagram @toninhoborbo", "WhatsApp: (83) 98800-1978", "toninho@memora.app"],
        avatar: "assets/avatar.png",
        stats: { Edições: 1, "Vendas totais": 100, "Tokens ativos": 100, Comunidade: 3 },
      },
      sold: 100,
      activeTokens: 100,
      qrReads: 412,
      checkins: 0,
      revenue: "R$ 5.000,00",
      emergency: 37,
      stock: 0,
      campaign: "R$ 7.200,00 de R$ 12.000,00",
      collectors: [
        { name: "Helena Brito", instagram: "@helenabrito", phone: "(83) 98820-1978", status: "ativo", consent: true, health: "Contato de emergencia registrado", emergency: "Rui Brito - (83) 98820-1979" },
        { name: "Marcos Lima", instagram: "@marcoslima", phone: "(83) 98710-2018", status: "ativo", consent: false },
        { name: "Clara Vasconcelos", instagram: "@clara.v", phone: "(83) 99980-2016", status: "ativo", consent: true, health: "Restricao alimentar", emergency: "Ana Vasconcelos - (83) 99980-2017" },
      ],
      links: ["Instagram", "Álbum", "Rádio Biplano", "Loja", "Conteúdo exclusivo"],
      logs: ["Campina Grande - hoje, 12:04", "João Pessoa - ontem, 20:11", "Recife - 24 jun, 18:06"],
      points: ["Loja Memora Online", "Show Biplano", "Acervo Toninho Borbo"],
      memories: ["Entrevista de 2016 sobre Biplano", "Faixas favoritas do Toninho", "Registros da criação do album"],
    },
  ];

  const updates = [
    { tag: "#update", title: "Novo painel de links do token", text: "Configure Instagram, loja, playlist e conteúdo exclusivo a partir da edição ativa.", status: "nao lido", edition: "aura", section: "panel-token" },
    { tag: "#evento", title: "Check-in Stage em tempo real", text: "Fourkaos recebeu uma visão rapida de entradas, saídas e contatos consentidos.", status: "nao lido", edition: "fourkaos", section: "panel-coaster" },
    { tag: "#dica", title: "Cápsula do Tempo mais forte", text: "Destaque memórias enviadas pela comunidade para transformar a edição em arquivo vivo.", status: "lido", edition: "distance", section: "panel-capsula" },
    { tag: "#bugfix", title: "Exportacao financeira ajustada", text: "Relatorios mockados agora separam pontos de venda e estoque disponivel.", status: "lido", edition: "aura", section: "panel-pagamentos" },
  ];

  const state = { activeIndex: 0, pushIndex: 0, whatsappIndex: 0 };
  let hiveScrollFrame = 0;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const difusoraStorageKey = "memora:difusora:feed";

  const readDifusoraRecords = () => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(difusoraStorageKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.text) : [];
    } catch (error) {
      return [];
    }
  };

  const writeDifusoraRecord = (record) => {
    const records = [record, ...readDifusoraRecords().filter((item) => item.id !== record.id)].slice(0, 50);
    window.localStorage.setItem(difusoraStorageKey, JSON.stringify(records));
  };

  const clearDifusoraHistory = () => {
    try {
      window.localStorage.removeItem(difusoraStorageKey);
      const messageField = document.querySelector("[data-push-message]");
      if (messageField) messageField.value = "";
      updatePushPreview();
      openModal("Histórico limpo", "O histórico local da Difusora foi apagado neste navegador.");
    } catch (error) {
      openModal("Falha ao limpar", "Não foi possível limpar o histórico local da Difusora.");
    }
  };
  const publishDifusoraPost = () => {
    const messageField = document.querySelector("[data-push-message]");
    const message = messageField?.value.trim() || "";
    const edition = editions[state.pushIndex];

    if (!message) {
      openModal("Mensagem vazia", "Escreva um comunicado antes de publicar na Difusora.");
      messageField?.focus();
      return;
    }

    const record = {
      id: `manager-${edition.id}-${Date.now()}`,
      author: profile.name,
      createdAt: new Date().toISOString(),
      editionId: edition.id,
      editionName: edition.name,
      tag: `comunicado - ${edition.name}`,
      text: message,
      metrics: `${edition.activeTokens} destinatarios - 0 respostas`,
      source: "memora-manager",
    };

    try {
      writeDifusoraRecord(record);
      messageField.value = "";
      updatePushPreview();
      openModal("Push publicado", `Mensagem registrada na Difusora e pronta para aparecer no feed do Memora ID: ${edition.name}.`);
    } catch (error) {
      openModal("Falha ao publicar", "Não foi possível registrar esta mensagem no feed local do Memora ID.");
    }
  };

  const moneyMetric = (edition) => [
    ["Vendas", edition.sold],
    ["Tokens ativos", edition.activeTokens],
    ["Leituras QR", edition.qrReads],
    ["Check-ins", edition.checkins],
    ["Emergencias", edition.emergency],
    ["Receita", edition.revenue],
  ];

  const getCells = () => Array.from(document.querySelectorAll("[data-edition-index]"));
  const activeEdition = () => editions[state.activeIndex];
  const scopedEditionId = () => document.body?.dataset.managerEdition || "";
  const isScopedManagerPage = () => Boolean(scopedEditionId());
  const editionIndexById = (id) => editions.findIndex((edition) => edition.id === id);

  const syncProfileToEdition = (edition) => {
    if (!edition?.manager) return;
    profile.name = edition.manager.name;
    profile.type = edition.manager.type;
    profile.contact = edition.manager.contact;
    profile.avatar = edition.manager.avatar;
    profile.stats = edition.manager.stats;
  };

  const updateManagerChrome = (edition) => {
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
    if (accountLink) accountLink.textContent = managerName;

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
    updateManagerChrome(edition);
    document.querySelector("[data-panel-title]").textContent = edition.name;
    document.querySelector("[data-panel-module]").textContent = `Modulo comercial ${edition.module}`;
    document.querySelector("[data-panel-status]").textContent = `Status ${edition.status}`;
    document.querySelector("[data-active-edition-label]").textContent = edition.name;
    document.querySelector("[data-panel-metrics]").innerHTML = moneyMetric(edition)
      .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
      .join("");

    renderArte(edition);
    renderCoaster(edition);
    renderCommunity(edition);
    renderToken(edition);
    renderPayments(edition);
    renderCapsule(edition);
    syncDifusoraToActive();
  };

  const renderArte = (edition) => {
    document.querySelector('[data-section="arte"]').innerHTML = `
      <div class="manager-section-grid">
        <article class="manager-section-card"><img src="${escapeHtml(edition.image)}" alt="Capa de ${escapeHtml(edition.name)}"><strong>Capa da edição</strong><p>Arquivo principal exibido nos tokens e comunicações.</p></article>
        <article class="manager-section-card"><strong>Realizador estampado</strong><p>${escapeHtml(profile.name)} assina a curadoria visual e editorial desta tiragem.</p></article>
        <article class="manager-section-card"><strong>Wallpaper para download</strong><p>Pacote visual mockado pronto para colecionadores.</p></article>
        <article class="manager-section-card"><strong>Card digital interativo</strong><p>Frente e verso do token com narrativa, creditos e acesso rapido.</p></article>
        <article class="manager-section-card"><strong>Making of</strong><p>${escapeHtml(edition.memories[0])} esta destacado como bastidor oficial.</p></article>
        <article class="manager-section-card"><strong>Press release</strong><p>Texto institucional pronto para imprensa, parceiros e pontos de venda.</p></article>
      </div>
      <div class="manager-section-actions">
        <button class="memora-id-action-button" type="button" data-modal-open="Upload de arquivos">Upload mockado de arquivos</button>
      </div>
    `;
    bindModalButtons(document.querySelector('[data-section="arte"]'));
  };

  const renderCoaster = (edition) => {
    document.querySelector('[data-section="coaster"]').innerHTML = `
      <div class="manager-section-grid">
        ${edition.logs.map((log) => `<article class="manager-log-card"><strong>Leitura QR</strong><span>${escapeHtml(log)}</span><p>Registro mockado de local, data e hora.</p></article>`).join("")}
        <article class="manager-log-card"><strong>Check-in / check-out</strong><span>${edition.module === "Stage" ? `${edition.checkins} entradas confirmadas` : "Sem check-in neste modulo"}</span><p>Histórico de presenca acompanha a jornada fisica do token.</p></article>
        <article class="manager-log-card"><strong>Alerta de uso suspeito</strong><span>Nenhum alerta critico</span><p>Padroes fora do comum apareceriam aqui antes de qualquer bloqueio.</p></article>
      </div>
      <button class="memora-id-action-button" type="button" data-modal-open="Logs completos">Ver logs completos</button>
    `;
    bindModalButtons(document.querySelector('[data-section="coaster"]'));
  };

  const renderCommunity = (edition) => {
    document.querySelector('[data-section="comunidade"]').innerHTML = `
      <p class="manager-sensitive-note">Informacoes de saude e contato de emergencia so aparecem quando fornecidas voluntariamente pelo colecionador.</p>
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
    document.querySelector('[data-section="token"]').innerHTML = `
      <div class="manager-section-grid">
        <article class="manager-section-card"><strong>Status geral</strong><span class="manager-status-pill">${escapeHtml(edition.status)}</span><p>${edition.activeTokens} tokens ativos nesta edição.</p></article>
        <article class="manager-section-card"><strong>Ativar/desativar token</strong><p>Ações criticas pedem confirmação antes de alterar o estado mockado.</p><button class="memora-id-action-button" type="button" data-critical-token>Desativar token</button></article>
        <article class="manager-section-card"><strong>Histórico de alterações</strong><p>Última configuração salva hoje as 14:28 por ${escapeHtml(profile.name)}.</p></article>
      </div>
      <div class="manager-panel-meta">${edition.links.map((link) => `<span>${escapeHtml(link)}</span>`).join("")}</div>
      <button class="memora-id-action-button" type="button" data-modal-open="Salvar configuração">Salvar configuração</button>
    `;
    bindModalButtons(document.querySelector('[data-section="token"]'));
    document.querySelector("[data-critical-token]")?.addEventListener("click", () => openModal("Confirmar desativacao", "Desativar tokens e uma acao critica. Neste protótipo, a confirmação aparece em modal e nada e salvo ou enviado a um backend."));
  };

  const renderPayments = (edition) => {
    document.querySelector('[data-section="pagamentos"]').innerHTML = `
      <div class="manager-payment-grid">
        <article class="manager-payment-card"><strong>Unidades vendidas</strong><span>${edition.sold}</span><p>Consolidado da edição selecionada.</p></article>
        <article class="manager-payment-card"><strong>Receita total</strong><span>${escapeHtml(edition.revenue)}</span><p>Valor mockado sem integracao financeira.</p></article>
        <article class="manager-payment-card"><strong>Estoque disponivel</strong><span>${edition.stock} unidades</span><p>Entrada e baixa por ponto de distribuicao.</p></article>
        ${edition.points.map((point) => `<article class="manager-payment-card"><strong>${escapeHtml(point)}</strong><span>Ponto de venda</span><p>Contato e endereco mockados para controle logistico.</p></article>`).join("")}
        <article class="manager-payment-card"><strong>Vaquinha / campanha online</strong><span>${escapeHtml(edition.campaign)}</span><p>Area exibida para modulos Stage e Artist quando houver campanha.</p></article>
      </div>
    `;
  };

  const renderCapsule = (edition) => {
    document.querySelector('[data-section="capsula"]').innerHTML = `
      <div class="manager-timeline-grid">
        ${edition.memories.map((memory, index) => `<article class="manager-memory-card"><strong>${String(index + 1).padStart(2, "0")} - Memória</strong><p>${escapeHtml(memory)}</p><span>Conteúdo curado para a linha do tempo da edição.</span></article>`).join("")}
        <article class="manager-memory-card"><strong>Conteúdos da comunidade</strong><p>Relatos e prints destacados aparecem apos curadoria do realizador.</p></article>
      </div>
      <div class="manager-section-actions">
        <button class="memora-id-action-button" type="button" data-modal-open="Adicionar memória">Adicionar memória</button>
        <button class="memora-id-action-button" type="button" data-modal-open="Gerar arquivo da edição">Gerar arquivo da edição</button>
      </div>
    `;
    bindModalButtons(document.querySelector('[data-section="capsula"]'));
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

  const renderUpdates = () => {
    document.querySelector("[data-updates-list]").innerHTML = updates
      .map((item) => {
        const editionIndex = editions.findIndex((edition) => edition.id === item.edition);
        return `
          <li>
            <time>${escapeHtml(item.tag)} - ${escapeHtml(item.status)}</time>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
            <button class="memora-id-action-button" type="button" data-update-edition="${editionIndex}" data-update-section="${escapeHtml(item.section)}">Ver detalhes</button>
          </li>
        `;
      })
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
    document.querySelector("[data-push-message]")?.addEventListener("input", updatePushPreview);
    document.querySelector("[data-push-send]")?.addEventListener("click", publishDifusoraPost);
    document.querySelector("[data-difusora-clear]")?.addEventListener("click", clearDifusoraHistory);
    document.querySelector("[data-push-edition]")?.addEventListener("change", (event) => {
      openEditionManager(Number(event.target.value));
    });
    document.querySelector("[data-whatsapp-edition]")?.addEventListener("change", (event) => {
      openEditionManager(Number(event.target.value));
    });
    document.querySelector("[data-whatsapp-open]")?.addEventListener("click", () => openModal("WhatsApp protótipo", "A conversa usaria um link wa.me mockado para os contatos selecionados. Nenhuma mensagem real sera enviada sem backend e consentimento operacional."));
    document.querySelectorAll("[data-modal-close]").forEach((item) => item.addEventListener("click", closeModal));
    document.querySelector("[data-updates-list]")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-update-edition]");
      if (!button) return;
      openEditionManager(Number(button.dataset.updateEdition), { scroll: false });
      openAccordionPanel(button.dataset.updateSection);
      document.querySelector("[data-edition-panel]")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    window.addEventListener("resize", () => centerActiveCell("auto"));
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeModal();
      setProfileMenuOpen(false);
    });
    bindModalButtons();
  };

  document.addEventListener("DOMContentLoaded", () => {
    const initialEditionIndex = Math.max(0, editionIndexById(scopedEditionId()));
    renderEditionHive();
    renderSelects();
    renderUpdates();
    bindAccordions();
    bindControls();
    setActiveEdition(initialEditionIndex, { scroll: false });
    requestAnimationFrame(() => centerActiveCell("auto"));
  });
})();
