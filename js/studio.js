const studioConfig = {
  assetsBase: "assets/memora-studio-assets/",
  contact: {
    phoneDisplay: "(11) 99999-9999",
    phoneHref: "+5511999999999",
    email: "contato@memorastudio.com.br",
    addressLine1: "Rua da Música, 123",
    addressLine2: "São Paulo — SP"
  },
  socialLinks: {
    instagram: "",
    youtube: "",
    whatsapp: ""
  },
  rooms: [
    { id: "room-01", name: "Sala 01", image: "sala-01.webp", width: 1280, height: 841, hourlyPrice: 95 },
    { id: "room-02", name: "Sala 02", image: "sala-02.webp", width: 1280, height: 834, hourlyPrice: 120 },
    { id: "room-03", name: "Sala 03", image: "sala-03.webp", width: 1280, height: 749, hourlyPrice: 145 }
  ],
  roomFeatures: ["Bateria", "Amplificadores", "PA", "Microfones", "Ar-condicionado", "Tratamento acústico"],
  sessions: [
    { name: "Reckless", type: "Live Session", image: "session-reckless.webp", width: 1280, height: 770 },
    { name: "Aura", type: "Ensaio + Gravação", image: "session-aura.webp", width: 1280, height: 766 },
    { name: "Fourkaos", type: "Live Session", image: "session-fourkaos.webp", width: 1280, height: 768 },
    { name: "Distance and Belief", type: "Ensaio + Vídeo", image: "session-distance-and-belief.webp", width: 1280, height: 764 }
  ],
  schedule: {
    dates: ["2026-05-21", "2026-05-22", "2026-05-23", "2026-05-24", "2026-05-25"],
    times: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
    durationHours: 2,
    services: ["Gravação multipista", "2 câmeras", "Técnico de áudio"],
    servicesPrice: 130,
    occupied: {
      "2026-05-21": { "room-01": ["18:00", "22:00"], "room-02": ["19:00", "20:00"], "room-03": ["21:00", "23:00"] },
      "2026-05-22": { "room-01": ["19:00", "21:00"], "room-02": ["18:00", "23:00"], "room-03": ["20:00"] },
      "2026-05-23": { "room-01": ["20:00", "23:00"], "room-02": ["21:00", "22:00"], "room-03": ["18:00", "19:00"] },
      "2026-05-24": { "room-01": ["18:00", "19:00"], "room-02": ["20:00"], "room-03": ["22:00", "23:00"] },
      "2026-05-25": { "room-01": ["21:00"], "room-02": ["18:00", "22:00"], "room-03": ["19:00", "20:00"] }
    }
  }
};

const state = {
  date: studioConfig.schedule.dates[0],
  roomId: "room-01",
  time: "20:00"
};

const elements = {
  header: document.querySelector("[data-header]"),
  menuToggle: document.querySelector("[data-menu-toggle]"),
  mobileMenu: document.querySelector("[data-mobile-menu]"),
  roomsModal: document.getElementById("rooms-modal"),
  videoModal: document.getElementById("video-modal"),
  confirmationModal: document.getElementById("confirmation-modal"),
  roomsGrid: document.getElementById("rooms-grid"),
  sessionsGrid: document.getElementById("sessions-grid"),
  scheduleHead: document.getElementById("schedule-head"),
  scheduleBody: document.getElementById("schedule-body"),
  dateInput: document.querySelector("[data-date-input]"),
  visibleDateLabel: document.getElementById("visible-date-label"),
  toast: document.querySelector("[data-toast-region]")
};

let toastTimer;
const modalTriggers = new WeakMap();

function asset(filename) {
  return `${studioConfig.assetsBase}${filename}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 3000);
}

function syncBodyLock() {
  const dialogOpen = Boolean(document.querySelector("dialog[open]"));
  const menuOpen = elements.menuToggle.getAttribute("aria-expanded") === "true";
  document.body.classList.toggle("is-locked", dialogOpen || menuOpen);
}

function openModal(dialog, trigger) {
  if (!dialog || dialog.open) return;
  modalTriggers.set(dialog, trigger || document.activeElement);
  dialog.showModal();
  syncBodyLock();
  window.requestAnimationFrame(() => {
    const preferred = dialog.querySelector("[data-close-modal]");
    preferred?.focus();
  });
}

function closeModal(dialog) {
  if (dialog?.open) dialog.close();
}

function getFocusable(container) {
  return [...container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hasAttribute("hidden") && element.getClientRects().length);
}

function trapDialogFocus(event) {
  if (event.key !== "Tab") return;
  const dialog = event.currentTarget;
  const focusable = getFocusable(dialog);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function renderRooms() {
  elements.roomsGrid.innerHTML = studioConfig.rooms.map((room) => `
    <article class="room-card">
      <img src="${asset(room.image)}" width="${room.width}" height="${room.height}" alt="${escapeHtml(room.name)} do Memora Studio" loading="lazy" decoding="async">
      <div class="room-content">
        <h3>${escapeHtml(room.name)}</h3>
        <ul>${studioConfig.roomFeatures.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>
      </div>
    </article>
  `).join("");
}

function renderSessions() {
  elements.sessionsGrid.innerHTML = studioConfig.sessions.map((session) => `
    <article class="session-card reveal">
      <button type="button" aria-label="Reproduzir ${escapeHtml(session.name)}" data-session="${escapeHtml(session.name)}">
        <span class="session-image">
          <img src="${asset(session.image)}" width="${session.width}" height="${session.height}" alt="${escapeHtml(session.name)} em sessão no Memora Studio" loading="lazy" decoding="async">
          <span class="play-button" aria-hidden="true">▶</span>
        </span>
        <span class="session-info"><h3>${escapeHtml(session.name)}</h3><p>${escapeHtml(session.type)}</p></span>
      </button>
    </article>
  `).join("");

  elements.sessionsGrid.querySelectorAll("[data-session]").forEach((button) => {
    button.addEventListener("click", () => openModal(elements.videoModal, button));
  });
}

function parseLocalDate(dateValue) {
  return new Date(`${dateValue}T12:00:00`);
}

function formatLongDate(dateValue) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(parseLocalDate(dateValue));
}

function formatShortDate(dateValue) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(parseLocalDate(dateValue));
}

function endTime(start, duration) {
  const [hours, minutes] = start.split(":").map(Number);
  const endHours = (hours + duration) % 24;
  return `${String(endHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function isOccupied(roomId, time) {
  return studioConfig.schedule.occupied[state.date]?.[roomId]?.includes(time) || false;
}

function renderSchedule() {
  elements.scheduleHead.innerHTML = `<th scope="col">Horário</th>${studioConfig.rooms.map((room) => `<th scope="col">${escapeHtml(room.name)}</th>`).join("")}`;
  elements.scheduleBody.innerHTML = studioConfig.schedule.times.map((time) => `
    <tr>
      <td>${time}</td>
      ${studioConfig.rooms.map((room) => {
        const occupied = isOccupied(room.id, time);
        const selected = state.roomId === room.id && state.time === time;
        const label = occupied ? `${room.name}, ${time}, ocupado` : `${room.name}, ${time}, disponível`;
        return `<td><button class="slot${selected ? " is-selected" : ""}" type="button" data-room="${room.id}" data-time="${time}" aria-label="${label}" aria-pressed="${selected}" ${occupied ? "disabled" : ""}>${occupied ? "Ocupado" : time}</button></td>`;
      }).join("")}
    </tr>
  `).join("");

  elements.scheduleBody.querySelectorAll(".slot:not(:disabled)").forEach((slot) => {
    slot.addEventListener("click", () => {
      state.roomId = slot.dataset.room;
      state.time = slot.dataset.time;
      renderSchedule();
      updateSummary();
      document.querySelector(`[data-room="${state.roomId}"][data-time="${state.time}"]`)?.focus();
    });
  });

  elements.visibleDateLabel.textContent = formatLongDate(state.date);
  elements.dateInput.value = state.date;
}

function updateSummary() {
  const room = studioConfig.rooms.find((item) => item.id === state.roomId);
  const duration = studioConfig.schedule.durationHours;
  const total = room.hourlyPrice * duration + studioConfig.schedule.servicesPrice;
  document.getElementById("summary-room").textContent = room.name;
  document.getElementById("summary-time").textContent = `${formatShortDate(state.date)} — ${state.time} às ${endTime(state.time, duration)}`;
  document.getElementById("summary-duration").textContent = `${duration} horas`;
  document.getElementById("summary-services").innerHTML = studioConfig.schedule.services.map((service) => `<li>${escapeHtml(service)}</li>`).join("");
  document.getElementById("summary-total").textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  document.getElementById("confirmation-copy").textContent = `${room.name}, ${formatShortDate(state.date)}, das ${state.time} às ${endTime(state.time, duration)} — ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`;
}

function setDate(dateValue) {
  if (!studioConfig.schedule.dates.includes(dateValue)) return;
  state.date = dateValue;
  if (isOccupied(state.roomId, state.time)) {
    const available = studioConfig.schedule.times.flatMap((time) => studioConfig.rooms.map((room) => ({ room, time }))).find(({ room, time }) => !isOccupied(room.id, time));
    state.roomId = available.room.id;
    state.time = available.time;
  }
  renderSchedule();
  updateSummary();
}

function moveDate(step) {
  const dates = studioConfig.schedule.dates;
  const index = dates.indexOf(state.date);
  const nextIndex = Math.max(0, Math.min(dates.length - 1, index + step));
  setDate(dates[nextIndex]);
}

function setContactDetails() {
  const phone = document.getElementById("contact-phone");
  const email = document.getElementById("contact-email");
  phone.textContent = studioConfig.contact.phoneDisplay;
  phone.href = `tel:${studioConfig.contact.phoneHref}`;
  email.textContent = studioConfig.contact.email;
  email.href = `mailto:${studioConfig.contact.email}`;
  document.getElementById("contact-address").innerHTML = `${escapeHtml(studioConfig.contact.addressLine1)}<br>${escapeHtml(studioConfig.contact.addressLine2)}`;
}

function closeMobileMenu({ restoreFocus = false } = {}) {
  if (elements.mobileMenu.hidden) return;
  elements.mobileMenu.hidden = true;
  elements.menuToggle.setAttribute("aria-expanded", "false");
  elements.menuToggle.setAttribute("aria-label", "Abrir menu");
  syncBodyLock();
  if (restoreFocus) elements.menuToggle.focus();
}

function toggleMobileMenu() {
  const willOpen = elements.mobileMenu.hidden;
  elements.mobileMenu.hidden = !willOpen;
  elements.menuToggle.setAttribute("aria-expanded", String(willOpen));
  elements.menuToggle.setAttribute("aria-label", willOpen ? "Fechar menu" : "Abrir menu");
  syncBodyLock();
  if (willOpen) elements.mobileMenu.querySelector("a, button")?.focus();
}

function initializeNavigation() {
  elements.menuToggle.addEventListener("click", toggleMobileMenu);
  elements.mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMobileMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.mobileMenu.hidden) closeMobileMenu({ restoreFocus: true });
  });

  const sectionIds = ["studio", "servicos", "sessions", "agendamento", "connect"];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll("[data-nav-link]").forEach((link) => {
        const active = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-30% 0px -60%", threshold: 0 });
  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
}

function initializeDialogs() {
  document.querySelectorAll("[data-open-rooms]").forEach((button) => {
    button.addEventListener("click", () => {
      closeMobileMenu();
      openModal(elements.roomsModal, button);
    });
  });
  document.querySelector("[data-confirm-booking]").addEventListener("click", (event) => openModal(elements.confirmationModal, event.currentTarget));

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("keydown", trapDialogFocus);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeModal(dialog);
    });
    dialog.addEventListener("close", () => {
      syncBodyLock();
      modalTriggers.get(dialog)?.focus();
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeModal(dialog);
    });
    dialog.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => closeModal(dialog)));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openDialog = document.querySelector("dialog[open]");
    if (!openDialog) return;
    event.preventDefault();
    closeModal(openDialog);
  }, true);
}

function initializeActions() {
  document.querySelectorAll("[data-toast]").forEach((button) => button.addEventListener("click", () => showToast(button.dataset.toast)));
  document.querySelectorAll("[data-social]").forEach((button) => {
    button.addEventListener("click", () => {
      const url = studioConfig.socialLinks[button.dataset.social];
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else showToast("Link oficial ainda não configurado.");
    });
  });
  document.querySelector("[data-directions]").addEventListener("click", () => showToast(`${studioConfig.contact.addressLine1} · ${studioConfig.contact.addressLine2}`));
  document.querySelector("[data-date-prev]").addEventListener("click", () => moveDate(-1));
  document.querySelector("[data-date-next]").addEventListener("click", () => moveDate(1));
  elements.dateInput.addEventListener("change", (event) => setDate(event.target.value));
}

function initializeScrollEffects() {
  const onScroll = () => elements.header.classList.toggle("is-scrolled", window.scrollY > 18);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: .12 });
  document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
}

renderRooms();
renderSessions();
renderSchedule();
updateSummary();
setContactDetails();
initializeNavigation();
initializeDialogs();
initializeActions();
initializeScrollEffects();
