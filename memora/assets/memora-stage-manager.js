(() => {
  if (document.body.dataset.managerEdition !== "playoffs-nbb") return;
  const key = (name) => `memora:playoffs-nbb:${name}`;
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const read = (name, fallback) => { try { const stored = localStorage.getItem(key(name)); return stored === null ? fallback : JSON.parse(stored); } catch (error) { return fallback; } };
  const write = (name, value) => localStorage.setItem(key(name), JSON.stringify(value));
  const money = (value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const defaults = [
    { id: "gates", title: "Abertura dos portoes", text: "Entrada do publico e orientacao dos setores.", date: "2026-07-24", time: "18:00", type: "acesso", published: true },
    { id: "warmup", title: "Aquecimento das equipes", text: "Unifacisa e Corinthians entram em quadra.", date: "2026-07-24", time: "19:15", type: "bastidores", published: true },
    { id: "tipoff", title: "Inicio da partida", text: "Bola ao alto nos Playoffs do NBB.", date: "2026-07-24", time: "19:30", type: "partida", published: true },
    { id: "final", title: "Resultado final", text: "Placar e galeria serao publicados apos o jogo.", date: "2026-07-24", time: "21:20", type: "resultado", published: true },
  ];
  const participants = [
    { name: "Marina Alves", id: "@marina.nbb", phone: "(83) 99911-2026", token: "ativo", ticket: "validado", checkin: "19:02", consent: true, emergency: "Contato autorizado - (83) 98800-2026", health: "Alergia informada" },
    { name: "Carlos Ribeiro", id: "@carlos.facisa", phone: "oculto", token: "ativo", ticket: "pendente", checkin: "--", consent: false },
    { name: "Joana Lima", id: "@joana.torcida", phone: "(83) 98777-5511", token: "ativo", ticket: "validado", checkin: "18:54", consent: true, emergency: "Contato autorizado - (83) 98877-5511", health: "Sem observacoes" },
  ];
  let timeline = read("timeline", defaults);
  let editingId = "";

  const renderMetrics = () => {
    const metrics = [["Tokens totais", 300], ["Tokens comprados", 225], ["Tokens ativados", 225], ["Tokens disponiveis", 75], ["Valor unitario", money(40)], ["Conteudos publicados", timeline.filter((item) => item.published !== false).length]];
    document.querySelector("[data-panel-metrics]").innerHTML = metrics.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  };
  const renderCoaster = () => {
    const total = 300; const activated = 225; const purchased = 225; const available = 75;
    const tokens = Array.from({ length: total }, (_, index) => {
      const number = index + 1; const label = `NBB-${String(number).padStart(3, '0')}`; const isActive = number <= activated;
      const status = isActive ? 'ativado' : 'disponível para venda'; const statusClass = isActive ? 'is-active' : 'is-available';
      return `<span class="manager-token-hex ${statusClass}" title="Token ${label}: ${status}" aria-label="Token ${label}: ${status}" role="img"></span>`;
    }).join('');
    document.querySelector('[data-section="coaster"]').innerHTML = `<div class="manager-section-grid stage-manager-metrics"><article class="manager-section-card"><strong>Total de tokens</strong><span>${total}</span><small>100%</small></article><article class="manager-section-card"><strong>Tokens comprados</strong><span>${purchased}</span><small>75%</small></article><article class="manager-section-card"><strong>Tokens ativados</strong><span>${activated}</span><small>75%</small></article><article class="manager-section-card"><strong>Tokens disponíveis</strong><span>${available}</span><small>25%</small></article></div><details class="manager-token-panel" open><summary><span>Mapa de tokens</span><small>${activated} ativados · ${purchased} comprados · ${available} disponíveis</small></summary><div class="manager-token-legend" aria-label="Legenda dos tokens"><span><i class="manager-token-swatch is-active"></i>Ativado</span><span><i class="manager-token-swatch is-available"></i>Disponível</span></div><div class="manager-token-grid" aria-label="Mapa de 300 tokens da edição NBB">${tokens}</div></details><div class="manager-progress-bar" role="progressbar" aria-label="Tokens comprados" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"><span style="width:75%"></span></div><div class="manager-form-grid"><label>Buscar por código<input type="search" placeholder="NBB-001" data-stage-token-search></label><button class="memora-id-action-button" type="button" data-stage-token-search-button>Consultar status individual</button></div><div class="manager-table-wrap"><table class="stage-manager-table"><thead><tr><th>Token</th><th>Status</th><th>Última leitura</th><th>Jornada</th></tr></thead><tbody><tr><td>NBB-001</td><td>Ativado</td><td>Portão principal</td><td>Emitido → comprado → ativado</td></tr><tr><td>NBB-226</td><td>Disponível</td><td>—</td><td>Emitido → disponível</td></tr></tbody></table></div>`;
  };  const renderCommunity = () => {
    document.querySelector('[data-section="comunidade"]').innerHTML = `<p class="manager-sensitive-note">Dados sensiveis permanecem ocultos por padrao e so aparecem quando o participante forneceu consentimento.</p><div class="manager-community-grid">${participants.map((person, index) => `<article class="manager-community-card"><strong>${escapeHtml(person.name)}</strong><span>Memora ID: ${escapeHtml(person.id)}</span><span>Token ${escapeHtml(person.token)} &middot; ingresso ${escapeHtml(person.ticket)}</span><span>Check-in: ${escapeHtml(person.checkin)}</span><p data-sensitive="${index}">${person.consent ? "Dados autorizados ocultos." : "Sem consentimento para exibir telefone, saude ou emergencia."}</p>${person.consent ? `<button class="memora-id-action-button" type="button" data-reveal="${index}">Exibir dados autorizados</button>` : ""}</article>`).join("")}</div>`;
    document.querySelectorAll("[data-reveal]").forEach((button) => button.addEventListener("click", () => { const person = participants[Number(button.dataset.reveal)]; const target = document.querySelector(`[data-sensitive="${button.dataset.reveal}"]`); target.innerHTML = `Telefone: ${escapeHtml(person.phone)}<br>Emergencia: ${escapeHtml(person.emergency)}<br>Saude: ${escapeHtml(person.health)}`; button.remove(); }));
  };
  const renderToken = () => {
    const config = read("tokenConfig", { event: "Playoffs NBB - Unifacisa x Corinthians", module: "Stage", date: "", time: "", venue: "A confirmar", address: "A confirmar", gates: "A confirmar", sectors: "Arquibancada", rules: "Chegue com antecedencia e apresente sua credencial.", quantity: 300, code: "NBB", status: "Ativa", links: "Pagina publica; Difusora; Mapa de acesso", about: "Partida decisiva entre Unifacisa e Corinthians nos Playoffs do NBB.", access: "Setores, portoes, itens permitidos e acessibilidade serao confirmados pelo realizador." });
    document.querySelector('[data-section="token"]').innerHTML = `<form class="manager-form-grid stage-token-form" data-stage-token-form><label>Nome do evento<input name="event" value="${escapeHtml(config.event)}"></label><label>Modulo<input name="module" value="${escapeHtml(config.module)}"></label><label>Data<input name="date" type="date" value="${escapeHtml(config.date)}"></label><label>Horario<input name="time" type="time" value="${escapeHtml(config.time)}"></label><label>Local<input name="venue" value="${escapeHtml(config.venue)}"></label><label>Endereco<input name="address" value="${escapeHtml(config.address)}"></label><label>Portoes<input name="gates" value="${escapeHtml(config.gates)}"></label><label>Setores<input name="sectors" value="${escapeHtml(config.sectors)}"></label><label>Quantidade de tokens<input name="quantity" type="number" value="${escapeHtml(config.quantity)}"></label><label>Codigo da edicao<input name="code" value="${escapeHtml(config.code)}"></label><label>Status geral<select name="status"><option>Ativa</option><option>Pausada</option></select></label><label>Links rapidos<input name="links" value="${escapeHtml(config.links)}"></label><label class="stage-manager-wide">Regras de acesso<textarea name="rules" rows="3">${escapeHtml(config.rules)}</textarea></label><label class="stage-manager-wide">Sobre o evento<textarea name="about" rows="4">${escapeHtml(config.about)}</textarea></label><label class="stage-manager-wide">Informacoes de acesso<textarea name="access" rows="4">${escapeHtml(config.access)}</textarea></label><div class="manager-section-actions stage-manager-wide"><button class="memora-id-action-button" type="submit">Salvar configuracao</button><span data-token-save-status aria-live="polite"></span></div></form>`;
  };
  const renderPayments = () => {
    const points = [{ name: 'Facisa', allocated: 100, sold: 75 }, { name: 'Banca do Orlando', allocated: 50, sold: 25 }, { name: 'Partage Shopping', allocated: 100, sold: 75 }, { name: 'Shopping Luiza Motta', allocated: 50, sold: 50 }];
    const total = points.reduce((sum, point) => sum + point.allocated, 0);
    document.querySelector('[data-section="pagamentos"]').innerHTML = `<p class="manager-sensitive-note">Distribuição comercial da edição NBB. Total destinado: ${total} tokens.</p><div class="manager-payment-grid"><article class="manager-payment-card"><strong>Total de tokens</strong><span>${total}</span><p>Quantidade distribuída entre os pontos de venda.</p></article><article class="manager-payment-card"><strong>Valor unitário</strong><span>R$ 40,00</span><p>Valor configurado para cada token.</p></article><section class="manager-sales-by-point" aria-labelledby="sales-by-point-title"><div class="manager-sales-by-point-heading"><div><p class="eyebrow">distribuição da edição</p><h4 id="sales-by-point-title">Pontos de venda</h4></div><span>${total} tokens distribuídos</span></div><div class="manager-sales-by-point-list">${points.map((point) => `<article class="manager-sales-point-card"><strong>${point.name}</strong><dl><div><dt>Disponibilizados</dt><dd>${point.allocated} tokens</dd></div><div><dt>Vendidos</dt><dd>${point.sold} tokens</dd></div><div><dt>Disponíveis</dt><dd>${point.allocated - point.sold} tokens</dd></div></dl></article>`).join('')}</div></section></div>`;
  };
  const timelineForm = () => `<form class="manager-capsule-form stage-timeline-form" data-stage-timeline-form><input type="hidden" name="id"><div class="manager-form-grid"><label>Titulo<input name="title" maxlength="100" required></label><label>Tipo do registro<select name="type"><option value="partida">Partida</option><option value="acesso">Acesso</option><option value="galeria">Galeria</option><option value="melhor-momento">Melhor momento</option><option value="bastidores">Bastidores</option><option value="entrevista">Entrevista</option><option value="torcida">Torcida</option></select></label><label>Data<input name="date" type="date" required></label><label>Horario<input name="time" type="time" required></label><label class="stage-manager-wide">Texto<textarea name="text" rows="4" maxlength="700" required></textarea></label><label>Imagem<input name="imageFile" type="file" accept="image/*"></label><label>Link de video ou entrevista<input name="mediaUrl" type="url" placeholder="https://"></label><label><input name="published" type="checkbox" checked> Conteudo publicado</label></div><div class="manager-section-actions"><button class="memora-id-action-button" type="submit">Salvar acontecimento</button><button class="memora-id-action-button" type="button" data-timeline-cancel>Cancelar edicao</button><span data-timeline-status aria-live="polite"></span></div></form>`;
  const renderTimeline = () => {
    const section = document.querySelector('[data-section="capsula"]');
    section.innerHTML = `<div class="toninho-timeline-mock" data-timeline-scroll aria-label="Linha do tempo de acontecimentos">${timeline.map((item, index) => `<article class="toninho-timeline-mock-item"><span class="toninho-timeline-mock-marker" aria-hidden="true"></span><div class="toninho-timeline-mock-content">${item.image ? `<img src="${escapeHtml(item.image)}" alt="Imagem de ${escapeHtml(item.title || 'acontecimento da edição')}">` : ''}<p><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.text)}</p><time datetime="${escapeHtml(item.date)}T${escapeHtml(item.time)}">${escapeHtml(item.date)} · ${escapeHtml(item.time)}</time>${item.mediaUrl ? `<a href="${escapeHtml(item.mediaUrl)}" target="_blank" rel="noopener">Abrir mídia cadastrada</a>` : ''}<span class="manager-status-pill">${item.published === false ? 'Não publicado' : 'Publicado'}</span><div class="manager-form-row stage-timeline-actions"><button type="button" data-timeline-action="up" data-index="${index}">Subir</button><button type="button" data-timeline-action="down" data-index="${index}">Descer</button><button type="button" data-timeline-action="edit" data-index="${index}">Editar</button><button type="button" data-timeline-action="toggle" data-index="${index}">${item.published === false ? 'Publicar' : 'Despublicar'}</button><button type="button" data-timeline-action="delete" data-index="${index}">Excluir</button></div></div></article>`).join('')}</div>${timelineForm()}`;
    const form = section.querySelector('[data-stage-timeline-form]');
    form.elements.date.value = new Date().toISOString().slice(0, 10);
    form.elements.time.value = new Date().toTimeString().slice(0, 5);
    bindTimeline(section, form);
    const timelineElement = section.querySelector('[data-timeline-scroll]'); if (timelineElement) timelineElement.scrollTop = 0;
  };  const fileData = (file) => new Promise((resolve) => {
    if (!file) { resolve(""); return; }
    const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || "")); reader.onerror = () => resolve(""); reader.readAsDataURL(file);
  });
  const bindTimeline = (section, form) => {
    section.querySelector("[data-timeline-scroll]").addEventListener("click", (event) => {
      const button = event.target.closest("[data-timeline-action]");
      if (!button) return;
      const index = Number(button.dataset.index); const action = button.dataset.timelineAction; const item = timeline[index];
      if (!item) return;
      if (action === "up" && index > 0) [timeline[index - 1], timeline[index]] = [timeline[index], timeline[index - 1]];
      if (action === "down" && index < timeline.length - 1) [timeline[index + 1], timeline[index]] = [timeline[index], timeline[index + 1]];
      if (action === "toggle") item.published = item.published === false;
      if (action === "delete") timeline.splice(index, 1);
      if (action === "edit") {
        editingId = item.id; form.elements.id.value = item.id; form.elements.title.value = item.title || ""; form.elements.type.value = item.type || "partida"; form.elements.date.value = item.date || ""; form.elements.time.value = item.time || ""; form.elements.text.value = item.text || ""; form.elements.mediaUrl.value = item.mediaUrl || ""; form.elements.published.checked = item.published !== false; form.scrollIntoView({ behavior: "smooth", block: "center" }); return;
      }
      write("timeline", timeline); renderTimeline(); renderMetrics();
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form); const image = await fileData(form.elements.imageFile.files?.[0]);
      const existing = timeline.find((item) => item.id === editingId);
      const record = { id: existing?.id || `stage-${Date.now()}`, title: String(data.get("title") || "").trim(), type: String(data.get("type") || "partida"), date: String(data.get("date") || ""), time: String(data.get("time") || ""), text: String(data.get("text") || "").trim(), mediaUrl: String(data.get("mediaUrl") || "").trim(), published: form.elements.published.checked, image: image || existing?.image || "" };
      if (!record.title || !record.text || !record.date || !record.time) return;
      if (existing) Object.assign(existing, record); else timeline.push(record);
      timeline.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
      write("timeline", timeline); editingId = ""; renderTimeline(); renderMetrics();
    });
    section.querySelector("[data-timeline-cancel]").addEventListener("click", () => { editingId = ""; form.reset(); form.elements.date.value = new Date().toISOString().slice(0, 10); });
  };
  const bindForms = () => {
    document.querySelector("[data-stage-token-form]")?.addEventListener("submit", (event) => {
      event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form).entries()); data.quantity = Number(data.quantity || 0); write("tokenConfig", data); form.querySelector("[data-token-save-status]").textContent = "Configuracao salva e publicada na pagina da edicao.";
    });
    document.querySelector("[data-stage-token-search-button]")?.addEventListener("click", () => { const input = document.querySelector("[data-stage-token-search]"); input.value = input.value.trim().toUpperCase(); input.setAttribute("aria-describedby", ""); });
    document.querySelector("[data-stage-report]")?.addEventListener("click", (event) => { event.currentTarget.textContent = "Relatorio prototipo preparado"; });
  };
  document.addEventListener("DOMContentLoaded", () => {
    const arteGrid = document.querySelector('[data-section="arte"] .manager-section-grid');
    if (arteGrid) {
      const arteItems = ['.manager-edition-cover-card', '.manager-wallpaper-config', '.manager-digital-card-config'].map((selector) => arteGrid.querySelector(selector));
      if (arteItems.every(Boolean)) {
        arteGrid.replaceChildren(...arteItems);
        const wallpaperTitle = arteGrid.querySelector('.manager-wallpaper-config > strong');
        if (wallpaperTitle) wallpaperTitle.textContent = 'Wallpaper';
      }
    }
    document.querySelector("[data-panel-module]").textContent = "Modulo Stage";
    document.querySelector("[data-panel-status]").textContent = "Status Ativa";
    const publicLink = document.querySelector("[data-panel-public-link]"); if (publicLink) publicLink.href = "edicao-playoffs-nbb.html";
    const counter = document.querySelector("[data-edition-counter]"); if (counter) counter.textContent = "1 / 1";
    renderMetrics(); renderCoaster(); renderCommunity(); renderToken(); renderPayments(); renderTimeline(); bindForms();
  });
})();
