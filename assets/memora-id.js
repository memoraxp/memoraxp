(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const setProfileMenu = (open) => {
    const menu = document.querySelector("[data-profile-menu]");
    const button = document.querySelector("[data-profile-toggle]");
    if (!menu || !button) return;
    menu.hidden = !open; menu.classList.toggle("is-open", open); button.setAttribute("aria-expanded", String(open));
  };
  const render = (data) => {
    const profile = data.profile;
    const set = (selector, value) => { const node = document.querySelector(selector); if (node) node.textContent = value; };
    set("[data-profile-name]", profile.display_name);
    set("[data-profile-handle]", profile.email);
    set("[data-profile-role]", "Colecionador de experiências");
    const contact = document.querySelector("[data-profile-contact]");
    if (contact) contact.innerHTML = `<span>${escapeHtml(profile.email)}</span>`;
    const avatar = document.querySelector("[data-profile-avatar]");
    if (avatar) { avatar.src = profile.avatar_url || "assets/avatar.png"; avatar.alt = `Avatar de ${profile.display_name}`; }
    const stats = document.querySelector("[data-profile-stats]");
    if (stats) stats.innerHTML = Object.entries(data.stats).map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
    const grid = document.querySelector("[data-token-grid]");
    if (grid) grid.innerHTML = data.tokens.length ? data.tokens.map((token, index) => `<a class="memora-id-honeycomb-cell${index ? "" : " is-active"}" href="/${escapeHtml(token.edition.public_page)}" data-token-index="${index}" aria-label="Abrir ${escapeHtml(token.edition.name)}"><img src="${escapeHtml(token.edition.image || "assets/mlogo.png")}" alt="${escapeHtml(token.serial)}"></a>`).join("") : `<p>Você ainda não ativou nenhum token.</p>`;
    const feed = document.querySelector("[data-difusora-feed]");
    if (feed) feed.innerHTML = data.difusora.length ? data.difusora.map((post) => `<article><header><strong>${escapeHtml(post.author)}</strong><small>${new Date(post.created_at).toLocaleString("pt-BR")}</small></header><p>${escapeHtml(post.text)}</p><footer><span>${escapeHtml(post.tag || "comunicado")}</span></footer></article>`).join("") : "<p>Nenhum comunicado para os seus tokens.</p>";
    const updates = document.querySelector("[data-updates-list]");
    if (updates) updates.innerHTML = data.updates.length ? data.updates.map((item) => `<li><time>${escapeHtml(item.date)}</time><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></li>`).join("") : "<li><p>Nenhuma atualização disponível.</p></li>";
  };
  document.addEventListener("DOMContentLoaded", async () => {
    document.querySelector("[data-profile-toggle]")?.addEventListener("click", (event) => setProfileMenu(event.currentTarget.getAttribute("aria-expanded") !== "true"));
    if (window.location.pathname !== "/memora-id.html") {
      try {
        const auth = await window.MemoraAPI.get("/api/auth/me");
        const profile = auth.user;
        const name = document.querySelector("[data-profile-name]"); if (name) name.textContent = profile.display_name;
        const handle = document.querySelector("[data-profile-handle]"); if (handle) handle.textContent = profile.email;
        const contact = document.querySelector("[data-profile-contact]"); if (contact) contact.innerHTML = `<span>${escapeHtml(profile.email)}</span>`;
        const avatar = document.querySelector("[data-profile-avatar]"); if (avatar) { avatar.src = profile.avatar_url || "assets/avatar.png"; avatar.alt = `Avatar de ${profile.display_name}`; }
      } catch (error) {
        if (error.status === 401) document.querySelector("[data-profile-dock]")?.setAttribute("hidden", "");
        else console.error(error);
      }
      return;
    }
    try { render(await window.MemoraAPI.get("/api/me/dashboard")); }
    catch (error) { if (error.status === 401) window.location.assign("/index.html#login"); else console.error(error); }
  });
})();
