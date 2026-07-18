(() => {
  const formHtml = `<form class="manager-capsule-form" data-capsule-form><div class="manager-form-grid"><label>Nova recordação<textarea data-capsule-text rows="4" maxlength="1000" required></textarea></label><div class="manager-capsule-fields"><label>Data<input data-capsule-date type="date" required></label><label>Foto (opcional)<input data-capsule-photo type="file" accept="image/jpeg,image/png,image/webp"></label></div></div><div class="manager-section-actions"><button class="memora-id-action-button" type="submit">Salvar recordação</button><p data-capsule-status aria-live="polite"></p></div></form>`;
  const mount = () => {
    const section = document.querySelector('[data-section="capsula"]');
    if (!section || section.querySelector("[data-capsule-form]")) return;
    section.insertAdjacentHTML("beforeend", formHtml);
    const form = section.querySelector("[data-capsule-form]");
    form.querySelector("[data-capsule-date]").value = new Date().toISOString().slice(0, 10);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector("[data-capsule-status]");
      const data = new FormData();
      data.set("text", form.querySelector("[data-capsule-text]").value.trim());
      data.set("event_date", form.querySelector("[data-capsule-date]").value);
      const photo = form.querySelector("[data-capsule-photo]").files[0];
      if (photo) data.set("image", photo);
      try {
        await window.MemoraAPI.post(`/api/manager/editions/${encodeURIComponent(document.body.dataset.managerEdition)}/capsule`, data);
        status.textContent = "Recordação publicada.";
        form.reset();
        form.querySelector("[data-capsule-date]").value = new Date().toISOString().slice(0, 10);
      } catch (error) { status.textContent = error.message; }
    });
  };
  document.addEventListener("DOMContentLoaded", () => { new MutationObserver(mount).observe(document.body, { childList: true, subtree: true }); mount(); });
})();

