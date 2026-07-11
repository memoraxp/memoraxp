(() => {
  const editionId = document.body.dataset.managerEdition || "toninho-borbo-biplano";
  const storageKey = `memora:${editionId}:capsule-records`;
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const formatDate = (value) => { const [year, month, day] = String(value || "").split("-").map(Number); return year && month && day ? new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(year, month - 1, day)) : "Data não informada"; };
  const readRecords = () => { try { const records = JSON.parse(localStorage.getItem(storageKey) || "[]"); return Array.isArray(records) ? records.filter((record) => record && record.text && record.date) : []; } catch { return []; } };
  const writeRecords = (records) => localStorage.setItem(storageKey, JSON.stringify(records));
  const item = (record) => `<article class="toninho-timeline-mock-item"><span class="toninho-timeline-mock-marker" aria-hidden="true"></span><div class="toninho-timeline-mock-content">${record.image ? `<img src="${escapeHtml(record.image)}" alt="Foto da recordação">` : ""}<p>${escapeHtml(record.text)}</p><time datetime="${escapeHtml(record.date)}">${escapeHtml(formatDate(record.date))}</time></div></article>`;
  const sortTimeline = (timeline) => Array.from(timeline.children).sort((a, b) => (b.querySelector("time")?.dateTime || "").localeCompare(a.querySelector("time")?.dateTime || "")).forEach((entry) => timeline.appendChild(entry));
  const form = () => `<form class="manager-capsule-form" data-capsule-form><div class="manager-form-grid"><label>Nova recordação<textarea data-capsule-text rows="4" maxlength="600" required placeholder="Escreva a recordação que entrará na linha do tempo."></textarea></label><div class="manager-capsule-fields"><label>Data da recordação<input data-capsule-date type="date" required></label><label>Foto (opcional)<input data-capsule-photo type="file" accept="image/*"></label></div></div><div class="manager-section-actions"><button class="memora-id-action-button" type="submit">Salvar recordação</button><p class="manager-capsule-status" data-capsule-status aria-live="polite"></p></div></form>`;
  const mount = () => {
    const section = document.querySelector('[data-section="capsula"]');
    const timeline = section?.querySelector('[data-timeline-scroll]');
    if (!section || !timeline || section.querySelector('[data-capsule-form]')) return;
    timeline.insertAdjacentHTML("afterbegin", readRecords().map(item).join("")); sortTimeline(timeline);
    timeline.insertAdjacentHTML("afterend", form());
    const capsuleForm = section.querySelector('[data-capsule-form]');
    capsuleForm.querySelector('[data-capsule-date]').value = new Date().toISOString().slice(0, 10);
    capsuleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = capsuleForm.querySelector('[data-capsule-text]').value.trim(); const date = capsuleForm.querySelector('[data-capsule-date]').value; const photo = capsuleForm.querySelector('[data-capsule-photo]').files[0]; const status = capsuleForm.querySelector('[data-capsule-status]');
      if (!text || !date) { status.textContent = "Preencha o texto e a data para salvar a recordação."; return; }
      const save = (image = "") => { try { const records = readRecords(); const record = { id: `capsule-${Date.now()}`, text, date, image }; records.push(record); records.sort((a, b) => b.date.localeCompare(a.date)); writeRecords(records); timeline.insertAdjacentHTML("afterbegin", item(record)); sortTimeline(timeline); timeline.scrollTop = 0; capsuleForm.reset(); capsuleForm.querySelector('[data-capsule-date]').value = new Date().toISOString().slice(0, 10); status.textContent = "Recordação salva e publicada na linha do tempo."; } catch { status.textContent = "Não foi possível salvar. Tente usar uma foto menor."; } };
      if (!photo) { save(); return; }
      const reader = new FileReader(); reader.onload = () => save(String(reader.result || "")); reader.onerror = () => { status.textContent = "Não foi possível ler a foto selecionada."; }; reader.readAsDataURL(photo);
    });
  };
  document.addEventListener("DOMContentLoaded", () => { const observer = new MutationObserver(mount); observer.observe(document.body, { childList: true, subtree: true }); mount(); });
})();







