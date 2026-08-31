(() => {
  const editionId = document.body.dataset.editionId || "toninho-borbo-biplano";
  const storageKey = `memora:${editionId}:capsule-records`;
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const formatDate = (value) => { const [year, month, day] = String(value || "").split("-").map(Number); return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(year, month - 1, day)); };
  const sortTimeline = (timeline) => Array.from(timeline.children).sort((a, b) => (b.querySelector("time")?.dateTime || "").localeCompare(a.querySelector("time")?.dateTime || "")).forEach((entry) => timeline.appendChild(entry));
  window.addEventListener("DOMContentLoaded", () => { const timeline = document.querySelector("#capsula [data-timeline-scroll]"); if (!timeline) return; try { const records = JSON.parse(localStorage.getItem(storageKey) || "[]"); (Array.isArray(records) ? records : []).filter((record) => record && record.text && record.date).forEach((record) => timeline.insertAdjacentHTML("afterbegin", `<article class="toninho-timeline-mock-item"><span class="toninho-timeline-mock-marker" aria-hidden="true"></span><div class="toninho-timeline-mock-content">${record.image ? `<img src="${escapeHtml(record.image)}" alt="Foto da recordação">` : ""}<p>${escapeHtml(record.text)}</p><time datetime="${escapeHtml(record.date)}">${escapeHtml(formatDate(record.date))}</time></div></article>`)); sortTimeline(timeline); timeline.scrollTop = 0; } catch {} });
  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#arte .biplano-menu-toggle").forEach((toggle) => {
      if (toggle.getAttribute("aria-expanded") === "false") toggle.click();
    });
  });
})();







