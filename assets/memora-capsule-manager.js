(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const formatDate = (value) => {
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!parts) return "Data não informada";
    return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]), 12));
  };
  const formHtml = `<form class="manager-capsule-form" data-capsule-form><div class="manager-form-grid"><label>Nova recordação<textarea data-capsule-text rows="4" maxlength="1000" required placeholder="Escreva a recordação que entrará na linha do tempo."></textarea></label><div class="manager-capsule-fields"><label>Data da recordação<input data-capsule-date type="date" required></label><label>Foto (opcional)<input data-capsule-photo type="file" accept="image/jpeg,image/png,image/webp"></label></div></div><div class="manager-section-actions"><button class="memora-id-action-button" type="submit">Salvar recordação</button><p class="manager-capsule-status" data-capsule-status aria-live="polite"></p></div></form>`;
  const item = (entry) => `<article class="toninho-timeline-mock-item" data-api-capsule-entry="${escapeHtml(entry.id)}"><span class="toninho-timeline-mock-marker" aria-hidden="true"></span><div class="toninho-timeline-mock-content">${entry.image_url ? `<img src="${escapeHtml(entry.image_url)}" alt="Foto da recordação">` : ""}<p>${escapeHtml(entry.text)}</p><time datetime="${escapeHtml(entry.event_date)}">${escapeHtml(formatDate(entry.event_date))}</time></div></article>`;
  const stateItem = (message, state) => `<article class="toninho-timeline-mock-item" data-api-capsule-state="${state}"><span class="toninho-timeline-mock-marker" aria-hidden="true"></span><div class="toninho-timeline-mock-content"><p>${escapeHtml(message)}</p></div></article>`;
  const today = () => new Date().toISOString().slice(0, 10);

  const setStatus = (form, message, tone = "") => {
    const status = form.querySelector("[data-capsule-status]");
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const render = (entries, options = {}) => {
    const section = document.querySelector('[data-section="capsula"]');
    if (!section) return;
    let timeline = section.querySelector("[data-timeline-scroll]");
    if (!timeline) {
      timeline = document.createElement("div");
      timeline.className = "toninho-timeline-mock";
      timeline.dataset.timelineScroll = "";
      timeline.setAttribute("aria-label", "Linha do tempo de acontecimentos");
      section.prepend(timeline);
    }
    const previousScroll = timeline.scrollTop;
    timeline.innerHTML = entries.length ? entries.map(item).join("") : stateItem("Ainda não há recordações nesta linha do tempo.", "empty");
    requestAnimationFrame(() => { timeline.scrollTop = options.showNewest ? 0 : previousScroll; });
  };

  const refresh = async (options = {}) => {
    const slug = document.body.dataset.managerEdition;
    try {
      const entries = await window.MemoraAPI.get(`/api/editions/${encodeURIComponent(slug)}/capsule`);
      render(entries, options);
      return entries;
    } catch (error) {
      const section = document.querySelector('[data-section="capsula"]');
      const timeline = section?.querySelector("[data-timeline-scroll]");
      if (timeline) timeline.innerHTML = stateItem("Não foi possível carregar a linha do tempo. Tente novamente mais tarde.", "error");
      throw error;
    }
  };

  const mount = () => {
    const section = document.querySelector('[data-section="capsula"]');
    if (!section) return;
    if (!section.querySelector("[data-capsule-form]")) section.insertAdjacentHTML("beforeend", formHtml);
    const form = section.querySelector("[data-capsule-form]");
    if (form.dataset.capsuleBound === "true") return;
    form.dataset.capsuleBound = "true";
    form.querySelector("[data-capsule-date]").value = today();
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const text = form.querySelector("[data-capsule-text]").value.trim();
      const eventDate = form.querySelector("[data-capsule-date]").value;
      if (!text || !eventDate) {
        setStatus(form, "Preencha o texto e a data para salvar a recordação.", "error");
        return;
      }
      const submit = form.querySelector('button[type="submit"]');
      const data = new FormData();
      data.set("text", text);
      data.set("event_date", eventDate);
      const photo = form.querySelector("[data-capsule-photo]").files[0];
      if (photo) data.set("image", photo);
      submit.disabled = true;
      setStatus(form, "Salvando recordação…", "pending");
      try {
        const created = await window.MemoraAPI.post(`/api/manager/editions/${encodeURIComponent(document.body.dataset.managerEdition)}/capsule`, data);
        const entries = await refresh({ showNewest: true });
        if (!entries.some((entry) => entry.id === created.id)) throw new Error("A recordação foi aceita, mas não apareceu na consulta de confirmação.");
        form.reset();
        form.querySelector("[data-capsule-date]").value = today();
        setStatus(form, "Recordação publicada e confirmada na linha do tempo.", "saved");
      } catch (error) {
        setStatus(form, error.message || "Não foi possível salvar a recordação.", "error");
        console.error("Capsule save or verification failed", { edition: document.body.dataset.managerEdition, error });
      } finally {
        submit.disabled = false;
      }
    });
  };

  window.MemoraManagerCapsule = { render, refresh, mount };
  document.addEventListener("DOMContentLoaded", mount);
})();
