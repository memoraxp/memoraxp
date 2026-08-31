(function () {
  "use strict";

  const data = window.MEMORA_TICKET_DATA;
  const categoryRow = document.querySelector("#category-row");
  const eventGrid = document.querySelector("#event-grid");
  const testimonialGrid = document.querySelector("#testimonial-grid");
  const emptyState = document.querySelector("#empty-state");
  const searchInput = document.querySelector("#event-search");
  const searchForm = document.querySelector("#search-form");
  const toast = document.querySelector("#toast");
  let activeCategory = "Todos";

  const locationIcon = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/></svg>';

  function normalize(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function renderCategories() {
    if (!categoryRow) return;
    categoryRow.innerHTML = data.categories.map((category) => `
      <button class="category-card${activeCategory === category.name ? " active" : ""}" type="button" data-category="${category.name}">
        <span class="category-icon" aria-hidden="true">${category.icon}</span>
        <strong>${category.name}</strong>
      </button>
    `).join("");
  }

  function eventMarkup(event, index) {
    return `
      <article class="event-card">
        <div class="event-hex-frame hex-frame">
          <div class="event-image hex-primary">
            <img src="${event.image}" alt="${event.title}" loading="lazy" style="object-position: ${event.objectPosition || "center"}">
            <span class="event-tag hex-icon">${event.tag}</span>
            <button class="event-favorite" type="button" aria-label="Favoritar ${event.title}" data-favorite="${index}">♡</button>
          </div>
        </div>
        <div class="event-body">
          <span class="event-date">${event.date}</span>
          <h3>${event.title}</h3>
          <p class="event-location">${locationIcon}${event.location}</p>
          <div class="event-bottom">
            <div class="event-price"><small>Ingressos a partir de</small><strong>${event.price}</strong></div>
            <a class="event-arrow" href="em-breve.html" aria-label="Ver ${event.title}">→</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderEvents() {
    if (!eventGrid) return;
    const term = normalize(searchInput ? searchInput.value.trim() : "");
    const filtered = data.events.filter((event) => {
      const matchesCategory = activeCategory === "Todos" || event.category === activeCategory;
      const haystack = normalize(`${event.title} ${event.category} ${event.location}`);
      return matchesCategory && (!term || haystack.includes(term));
    });
    eventGrid.innerHTML = filtered.map(eventMarkup).join("");
    emptyState.hidden = filtered.length !== 0;
  }

  function renderTestimonials() {
    if (!testimonialGrid) return;
    testimonialGrid.innerHTML = data.testimonials.map((person) => `
      <article class="testimonial-card">
        <div class="quote-mark" aria-hidden="true">“</div>
        <blockquote>${person.quote}</blockquote>
        <div class="testimonial-person">
          <span class="testimonial-avatar">${person.initials}</span>
          <div><strong>${person.name}</strong><small>${person.role}</small></div>
        </div>
      </article>
    `).join("");
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
  }

  document.addEventListener("click", (event) => {
    const categoryButton = event.target.closest("[data-category]");
    if (categoryButton) {
      const chosen = categoryButton.dataset.category;
      activeCategory = activeCategory === chosen ? "Todos" : chosen;
      renderCategories();
      renderEvents();
      document.querySelector("#eventos")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const favoriteButton = event.target.closest("[data-favorite], .heart-button");
    if (favoriteButton) {
      favoriteButton.classList.toggle("active");
      favoriteButton.textContent = favoriteButton.classList.contains("active") ? "♥" : "♡";
      showToast(favoriteButton.classList.contains("active") ? "Evento salvo nos favoritos." : "Evento removido dos favoritos.");
    }
  });

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    activeCategory = "Todos";
    renderCategories();
    renderEvents();
    document.querySelector("#eventos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  searchInput?.addEventListener("input", () => {
    if (!searchInput.value) renderEvents();
  });

  document.querySelectorAll("[data-category-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.categoryScroll === "previous" ? -1 : 1;
      categoryRow?.scrollBy({ left: direction * Math.max(280, categoryRow.clientWidth * .72), behavior: "smooth" });
    });
  });

  const newsletterForm = document.querySelector("#newsletter-form");
  newsletterForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.querySelector("#newsletter-message");
    message.textContent = "Pronto! Avisaremos quando houver novidades.";
    newsletterForm.reset();
  });

  renderCategories();
  renderEvents();
  renderTestimonials();
}());
