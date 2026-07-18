(() => {
  const themeKey = "memora-manager-theme";
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  let dashboard;

  const applyTheme = (theme) => {
    const light = theme === "light";
    document.documentElement.dataset.managerTheme = light ? "light" : "dark";
    document.body.dataset.theme = light ? "light" : "dark";
    document.querySelectorAll("[data-manager-theme-toggle]").forEach((node) => { node.checked = light; });
  };
  const modal = (title, body) => {
    const node = document.querySelector("[data-mock-modal]"); if (!node) return;
    node.hidden = false; node.querySelector("[data-modal-title]").textContent = title; node.querySelector("[data-modal-body]").textContent = body;
  };
  const assetUploader = (slot, label, multiple = false) => `<label>${label}<input type="file" accept="image/jpeg,image/png,image/webp" ${multiple ? "multiple" : ""} data-manager-asset="${slot}"></label><p data-asset-status="${slot}" aria-live="polite"></p>`;
  const render = (data) => {
    dashboard = data;
    const edition = data.edition, config = edition.configuration || {};
    document.title = `${data.profile.display_name} | Memora Manager`;
    const set = (selector, value) => { const node = document.querySelector(selector); if (node) node.textContent = value; };
    set("[data-profile-name]", data.profile.display_name); set("[data-profile-type]", `Manager de ${edition.name}`);
    const contact = document.querySelector("[data-profile-contact]"); if (contact) contact.innerHTML = `<span>${escapeHtml(data.profile.email)}</span>`;
    const avatar = document.querySelector("[data-profile-avatar]"); if (avatar) avatar.src = data.profile.avatar_url || "assets/avatar.png";
    set("[data-active-edition-label]", edition.name); set("[data-panel-title]", edition.name); set("[data-panel-module]", `Módulo ${edition.module}`); set("[data-panel-status]", `Status ${edition.status}`);
    const link = document.querySelector("[data-panel-public-link]"); if (link) link.href = `/${edition.public_page}`;
    const code = document.querySelector("[data-token-edition-code]"); if (code) code.value = edition.token_code;
    const total = document.querySelector("[data-token-total]"); if (total) total.value = edition.token_total;
    const metrics = document.querySelector("[data-panel-metrics]");
    if (metrics) metrics.innerHTML = Object.entries({ "Disponíveis": data.token_counts.available, "Vendidos": data.token_counts.sold, "Ativos": data.token_counts.active, "Desativados": data.token_counts.disabled, "Preço unitário": `R$ ${Number(edition.unit_price).toFixed(2).replace(".", ",")}` }).map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
    const hive = document.querySelector("[data-edition-grid]"); if (hive) hive.innerHTML = `<button class="memora-id-honeycomb-cell is-active" type="button"><img src="${escapeHtml(config.tile || "assets/mlogo.png")}" alt="${escapeHtml(edition.name)}"></button>`;
    const stats = document.querySelector("[data-profile-stats]"); if (stats) stats.innerHTML = `<div><dt>Edições</dt><dd>1</dd></div><div><dt>Função</dt><dd>${escapeHtml(data.role)}</dd></div>`;
    const arte = document.querySelector('[data-section="arte"]');
    if (arte) arte.innerHTML = `<div class="manager-form-grid">${assetUploader("edition_cover", "Capa da edição")}${assetUploader("card_front", "Frente do cartão")}${assetUploader("card_back", "Verso do cartão")}${assetUploader("wallpaper", "Wallpapers", true)}</div><p class="manager-sensitive-note">JPEG, PNG ou WebP. Os arquivos são validados e armazenados pelo servidor.</p>`;
    const capsule = document.querySelector('[data-section="capsula"]'); if (capsule) capsule.innerHTML = `<div data-timeline-scroll>${data.capsule.map((entry) => `<article class="toninho-timeline-mock-item"><div class="toninho-timeline-mock-content">${entry.image_url ? `<img src="${escapeHtml(entry.image_url)}" alt="">` : ""}<p>${escapeHtml(entry.text)}</p><time datetime="${entry.event_date}">${escapeHtml(entry.event_date)}</time></div></article>`).join("")}</div>`;
    const coaster = document.querySelector('[data-section="coaster"]'); if (coaster) coaster.innerHTML = `<p>Inventário autenticado: ${edition.token_total} tokens, ${data.token_counts.active} ativos e ${data.token_counts.available} disponíveis.</p>`;
    const community = document.querySelector('[data-section="comunidade"]'); if (community) community.innerHTML = "<p>Dados pessoais de colecionadores não são exibidos como analytics de demonstração.</p>";
    const token = document.querySelector('[data-section="token"]'); if (token) token.innerHTML = `<dl class="manager-metric-grid"><div><dt>Código</dt><dd>${escapeHtml(edition.token_code)}</dd></div><div><dt>Ativos</dt><dd>${data.token_counts.active}</dd></div><div><dt>Desativados</dt><dd>${data.token_counts.disabled}</dd></div></dl>`;
    const payments = document.querySelector('[data-section="pagamentos"]'); if (payments) payments.innerHTML = `<p>Preço configurado: R$ ${Number(edition.unit_price).toFixed(2).replace(".", ",")}. Pagamentos e receita operacional ainda não estão integrados.</p>`;
    const selects = document.querySelectorAll("[data-push-edition], [data-whatsapp-edition]"); selects.forEach((select) => { select.innerHTML = `<option>${escapeHtml(edition.name)}</option>`; });
    bindUploads();
  };
  const bindUploads = () => document.querySelectorAll("[data-manager-asset]").forEach((input) => input.addEventListener("change", async () => {
    const files = Array.from(input.files || []); const status = document.querySelector(`[data-asset-status="${input.dataset.managerAsset}"]`); if (!files.length) return;
    try {
      for (let index = 0; index < files.length; index += 1) { const form = new FormData(); form.set("file", files[index]); form.set("sort_order", String(index)); await window.MemoraAPI.put(`/api/manager/editions/${encodeURIComponent(dashboard.edition.slug)}/assets/${input.dataset.managerAsset}`, form); }
      status.textContent = "Arquivo salvo.";
    } catch (error) { status.textContent = error.message; }
  }));
  const bind = () => {
    document.querySelectorAll("[data-manager-theme-toggle]").forEach((toggle) => toggle.addEventListener("change", () => { const value = toggle.checked ? "light" : "dark"; localStorage.setItem(themeKey, value); applyTheme(value); }));
    document.querySelectorAll("[data-accordion-toggle]").forEach((button) => button.addEventListener("click", () => { const panel = document.getElementById(button.getAttribute("aria-controls")); const open = button.getAttribute("aria-expanded") !== "true"; button.setAttribute("aria-expanded", String(open)); panel.hidden = !open; panel.classList.toggle("is-open", open); }));
    document.querySelector("[data-profile-toggle]")?.addEventListener("click", (event) => { const menu = document.querySelector("[data-profile-menu]"); const open = event.currentTarget.getAttribute("aria-expanded") !== "true"; event.currentTarget.setAttribute("aria-expanded", String(open)); menu.hidden = !open; });
    document.querySelector("[data-push-message]")?.addEventListener("input", (event) => { const counter = document.querySelector("[data-push-counter]"); if (counter) counter.textContent = `${event.target.value.length} / 180`; const preview = document.querySelector("[data-push-preview-text]"); if (preview) preview.textContent = event.target.value; });
    document.querySelector("[data-push-send]")?.addEventListener("click", async () => { const field = document.querySelector("[data-push-message]"); try { await window.MemoraAPI.post(`/api/manager/editions/${encodeURIComponent(dashboard.edition.slug)}/difusora`, { text: field.value.trim(), tag: "comunicado" }); field.value = ""; modal("Comunicado publicado", "A mensagem foi salva na Difusora desta edição."); } catch (error) { modal("Falha ao publicar", error.message); } });
    document.querySelectorAll("[data-modal-open]").forEach((button) => button.addEventListener("click", () => modal(button.dataset.modalOpen, "Este recurso permanece demonstrativo e não executa integrações externas.")));
    document.querySelectorAll("[data-modal-close]").forEach((button) => button.addEventListener("click", () => { document.querySelector("[data-mock-modal]").hidden = true; }));
    document.querySelector("[data-open-difusora]")?.addEventListener("click", () => document.getElementById("difusora")?.scrollIntoView({ behavior: "smooth" }));
    document.querySelector("[data-whatsapp-open]")?.addEventListener("click", () => modal("WhatsApp não integrado", "Nenhuma conversa ou mensagem externa é aberta por este protótipo."));
    document.querySelector("[data-difusora-clear]")?.remove();
  };
  document.addEventListener("DOMContentLoaded", async () => {
    applyTheme(localStorage.getItem(themeKey)); bind();
    const slug = document.body.dataset.managerEdition;
    try { render(await window.MemoraAPI.get(`/api/manager/editions/${encodeURIComponent(slug)}/dashboard`)); }
    catch (error) { if ([401, 403].includes(error.status)) window.location.assign("/index.html#login"); else modal("Falha ao carregar", error.message); }
  });
})();
