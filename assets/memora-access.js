(() => {
  const STORAGE_KEY = "memora.access.v1";
  const PENDING_NEXT_KEY = "memora.pendingNext.v1";
  const scriptUrl = new URL(document.currentScript?.src || "assets/memora-access.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);

  const demoProfile = {
    instagram_id: "memora-demo-instagram-001",
    instagram_username: "memora.collector",
    display_name: "Colecionador Memora",
    avatar_url: "",
  };

  const now = () => new Date().toISOString();
  const isAbsoluteUrl = (value) => /^[a-z][a-z0-9+.-]*:/i.test(value || "");
  const siteUrl = (path) => (isAbsoluteUrl(path) ? path : new URL(String(path || "").replace(/^\/+/, ""), siteRoot).href);

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const normalizeState = (rawState = {}) => {
    const users = Array.isArray(rawState.users) ? rawState.users : [];

    return {
      users,
      active_user_id: rawState.active_user_id || null,
      sequences: {
        users: Math.max(rawState.sequences?.users || 0, ...users.map((user) => user.id || 0)),
      },
    };
  };

  const loadState = () => {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch {
      return normalizeState();
    }
  };

  const saveState = (state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
  };

  const getActiveUser = (state = loadState()) =>
    state.users.find((user) => user.id === state.active_user_id) || null;

  const getOAuthStartUrl = () => {
    const value = document.querySelector('meta[name="memora-instagram-oauth-start"]')?.content?.trim();
    return value && value !== "demo" ? value : "";
  };

  const profileFromSearch = (search = window.location.search, fallback = demoProfile) => {
    const params = new URLSearchParams(search);
    const instagram_id = params.get("instagram_id") || params.get("id");

    if (!instagram_id && !fallback) return null;

    return {
      instagram_id: instagram_id || fallback.instagram_id,
      instagram_username: params.get("instagram_username") || params.get("username") || fallback.instagram_username,
      display_name: params.get("display_name") || params.get("name") || fallback.display_name,
      avatar_url: params.get("avatar_url") || fallback.avatar_url,
    };
  };

  const createOrUpdateUser = (profile = demoProfile) => {
    const state = loadState();
    const instagram_id = String(profile.instagram_id || demoProfile.instagram_id);
    let user = state.users.find((item) => item.instagram_id === instagram_id);

    if (!user) {
      state.sequences.users += 1;
      user = {
        id: state.sequences.users,
        instagram_id,
        instagram_username: "",
        display_name: "",
        avatar_url: "",
        created_at: now(),
        updated_at: now(),
        last_login_at: now(),
      };
      state.users.push(user);
    }

    user.instagram_username = profile.instagram_username || user.instagram_username || demoProfile.instagram_username;
    user.display_name = profile.display_name || user.display_name || demoProfile.display_name;
    user.avatar_url = profile.avatar_url || user.avatar_url || "";
    user.updated_at = now();
    user.last_login_at = now();
    state.active_user_id = user.id;

    saveState(state);
    return user;
  };

  const setPendingNextUrl = (nextUrl = window.location.href) => {
    if (nextUrl) localStorage.setItem(PENDING_NEXT_KEY, nextUrl);
  };

  const clearPendingNextUrl = () => {
    localStorage.removeItem(PENDING_NEXT_KEY);
  };

  const getPendingNextUrl = () => localStorage.getItem(PENDING_NEXT_KEY) || window.location.href.split("#")[0];

  const getAuthPageUrl = (nextUrl = getPendingNextUrl()) => {
    const target = new URL(siteUrl("auth/instagram/"));
    if (nextUrl) target.searchParams.set("next", nextUrl);
    return target.href;
  };

  const startInstagramOAuth = (options = {}) => {
    const nextUrl = options.next || getPendingNextUrl();
    const oauthStartUrl = getOAuthStartUrl();

    setPendingNextUrl(nextUrl);

    if (!oauthStartUrl) {
      return { status: "missing_oauth_config" };
    }

    const target = new URL(oauthStartUrl, window.location.href);
    target.searchParams.set("next", nextUrl);
    window.location.assign(target.href);
    return { status: "redirecting" };
  };

  const goToInstagramAuth = (options = {}) => {
    const nextUrl = options.next || getPendingNextUrl();
    setPendingNextUrl(nextUrl);
    window.location.assign(getAuthPageUrl(nextUrl));
    return { status: "auth_screen" };
  };

  const loginWithInstagram = (options = {}) => {
    if (options.profile) {
      const user = createOrUpdateUser(options.profile);

      if (options.redirect) {
        window.location.assign(options.next || getPendingNextUrl());
      }

      return { status: "logged_in", user };
    }

    return goToInstagramAuth(options);
  };

  const renderAccessShell = (container, content) => {
    container.innerHTML = `
      <section class="memora-access-shell" aria-live="polite">
        <div class="memora-access-card">
          ${content}
        </div>
      </section>
    `;
  };

  const renderInstagramAuthPage = (container) => {
    const params = new URLSearchParams(window.location.search);
    const nextUrl = params.get("next") || getPendingNextUrl();
    const oauthStartUrl = getOAuthStartUrl();

    setPendingNextUrl(nextUrl);

    renderAccessShell(
      container,
      `
        <p class="eyebrow">Login Instagram</p>
        <h1>Conectar Memora ID</h1>
        <p>Entre com Instagram para criar ou atualizar seu user Memora.</p>
        <dl class="memora-access-meta">
          <div><dt>Memora ID</dt><dd>users.id</dd></div>
          <div><dt>Login</dt><dd>Instagram</dd></div>
          <div><dt>Status</dt><dd>pendente</dd></div>
        </dl>
        <p class="memora-access-note" data-memora-auth-message>
          ${
            oauthStartUrl
              ? "Você será encaminhado para a autenticação segura do Instagram."
              : "OAuth Instagram ainda não configurado: defina o endpoint backend em memora-instagram-oauth-start para ativar login real em produção."
          }
        </p>
        <div class="memora-access-actions">
          <button class="primary-button" type="button" data-memora-start-oauth>Entrar com Instagram</button>
          <button class="secondary-button" type="button" data-memora-demo-login>Usar login de teste</button>
        </div>
      `
    );

    bindAuthStartButtons(container);
    bindDemoLoginButtons(container);
  };

  const renderAuthCallback = (container) => {
    const params = new URLSearchParams(window.location.search);
    const storedNextUrl = localStorage.getItem(PENDING_NEXT_KEY);
    const profile = profileFromSearch(window.location.search, null);
    const nextUrl = params.get("next") || storedNextUrl || siteUrl("index.html#edicoes");

    if (!profile) {
      renderAccessShell(
        container,
        `
          <p class="eyebrow">Callback Instagram</p>
          <h1>Dados pendentes</h1>
          <p>O retorno chegou sem os dados do Instagram. O backend precisa trocar o código OAuth pelo perfil e redirecionar para cá com instagram_id, instagram_username, display_name e avatar_url.</p>
          <div class="memora-access-actions">
            <a class="primary-button" href="${getAuthPageUrl(nextUrl)}">Voltar ao login</a>
          </div>
        `
      );
      return;
    }

    const user = createOrUpdateUser(profile);
    clearPendingNextUrl();

    renderAccessShell(
      container,
      `
        <p class="eyebrow">Login confirmado</p>
        <h1>@${escapeHtml(user.instagram_username)}</h1>
        <p>Seu Memora ID foi atualizado.</p>
      `
    );

    window.setTimeout(() => window.location.assign(nextUrl), 800);
  };

  function bindAuthStartButtons(scope = document) {
    scope.querySelectorAll("[data-memora-start-oauth]").forEach((button) => {
      if (button.dataset.memoraStartOauthBound === "true") return;
      button.dataset.memoraStartOauthBound = "true";
      button.addEventListener("click", () => {
        const result = startInstagramOAuth();
        if (result.status !== "missing_oauth_config") return;

        const message = scope.querySelector("[data-memora-auth-message]");
        if (message) {
          message.textContent = "Ainda falta conectar o backend OAuth da Meta. Em GitHub Pages puro não dá para trocar o code do Instagram por access token com segurança.";
        }
      });
    });
  }

  function bindDemoLoginButtons(scope = document) {
    scope.querySelectorAll("[data-memora-demo-login]").forEach((button) => {
      if (button.dataset.memoraDemoLoginBound === "true") return;
      button.dataset.memoraDemoLoginBound = "true";
      button.addEventListener("click", () => {
        const nextUrl = getPendingNextUrl();
        const target = new URL(siteUrl("auth/instagram/callback/"));
        target.searchParams.set("next", nextUrl);
        target.searchParams.set("instagram_id", demoProfile.instagram_id);
        target.searchParams.set("instagram_username", demoProfile.instagram_username);
        target.searchParams.set("display_name", demoProfile.display_name);
        window.location.assign(target.href);
      });
    });
  }

  function bindLoginButtons(scope = document) {
    scope.querySelectorAll("[data-memora-login]").forEach((button) => {
      if (button.dataset.memoraLoginBound === "true") return;
      button.dataset.memoraLoginBound = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();

        const nextUrl = button.dataset.memoraNext || localStorage.getItem(PENDING_NEXT_KEY) || window.location.href.split("#")[0];
        goToInstagramAuth({ next: nextUrl });
      });
    });
  }

  const updateLoginLabels = () => {
    if (!document.body.classList.contains("memora-id-page")) return;

    const user = getActiveUser();
    if (!user) return;

    document.querySelectorAll(".login-cta").forEach((link) => {
      link.textContent = `@${user.instagram_username}`;
      link.setAttribute("href", siteUrl("index.html#login"));
    });
  };

  const renderCurrentRoute = () => {
    document.querySelectorAll("[data-memora-auth-start]").forEach(renderInstagramAuthPage);
    document.querySelectorAll("[data-memora-auth-callback]").forEach(renderAuthCallback);
    bindLoginButtons();
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindLoginButtons();
    updateLoginLabels();
    renderCurrentRoute();
  });

  window.MemoraAccess = {
    createOrUpdateUser,
    getActiveUser,
    loadState,
    loginWithInstagram,
    saveState,
    siteUrl,
    startInstagramOAuth,
  };
})();
