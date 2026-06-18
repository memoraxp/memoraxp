(() => {
  const STORAGE_KEY = "memora.access.v1";
  const PENDING_TOKEN_KEY = "memora.pendingToken.v1";
  const PENDING_NEXT_KEY = "memora.pendingNext.v1";
  const scriptUrl = new URL(document.currentScript?.src || "assets/memora-access.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);

  const editions = [
    {
      id: 1,
      slug: "toninho-borbo-biplano",
      title: "Toninho Borbo - Biplano",
      artist_name: "Toninho Borbo",
      edition_code: "TB",
      total_tokens: 100,
      internal_page_url: "edicoes/toninho-borbo-biplano/",
      content_page_url: "edicao-toninho-borbo-biplano.html",
      activation_url: "m/TB001-x7K92PQa/",
      is_active: true,
      created_at: "2026-06-18T00:00:00.000Z",
    },
  ];

  const demoProfile = {
    instagram_id: "memora-demo-instagram-001",
    instagram_username: "memora.collector",
    display_name: "Colecionador Memora",
    avatar_url: "",
  };

  const now = () => new Date().toISOString();
  const padToken = (value) => String(value).padStart(3, "0");
  const isAbsoluteUrl = (value) => /^[a-z][a-z0-9+.-]*:/i.test(value || "");
  const siteUrl = (path) => (isAbsoluteUrl(path) ? path : new URL(String(path || "").replace(/^\/+/, ""), siteRoot).href);

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const tokenSecret = (index) => {
    if (index === 1) return "x7K92PQa";

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let seed = (index * 48271 + 1337) % 2147483647;
    let secret = "";

    for (let i = 0; i < 8; i += 1) {
      seed = (seed * 16807) % 2147483647;
      secret += chars[seed % chars.length];
    }

    return secret;
  };

  const buildSeedTokens = () =>
    editions.flatMap((edition) =>
      Array.from({ length: edition.total_tokens }, (_, index) => {
        const tokenIndex = index + 1;
        const token_number = `${edition.edition_code}${padToken(tokenIndex)}`;

        return {
          id: index + 1,
          edition_id: edition.id,
          token_number,
          token_code: `${token_number}-${tokenSecret(tokenIndex)}`,
          status: "available",
          activated_by_user_id: null,
          activated_at: null,
          created_at: edition.created_at,
        };
      })
    );

  const normalizeState = (rawState = {}) => {
    const seededTokens = buildSeedTokens();
    const savedTokens = new Map((rawState.tokens || []).map((token) => [token.token_code, token]));
    const users = Array.isArray(rawState.users) ? rawState.users : [];
    const user_tokens = Array.isArray(rawState.user_tokens) ? rawState.user_tokens : [];

    return {
      users,
      editions,
      tokens: seededTokens.map((token) => ({ ...token, ...(savedTokens.get(token.token_code) || {}) })),
      user_tokens,
      active_user_id: rawState.active_user_id || null,
      sequences: {
        users: Math.max(rawState.sequences?.users || 0, ...users.map((user) => user.id || 0)),
        user_tokens: Math.max(rawState.sequences?.user_tokens || 0, ...user_tokens.map((link) => link.id || 0)),
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

  const getEdition = (slugOrId) =>
    editions.find((edition) => edition.slug === slugOrId || edition.id === Number(slugOrId));

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

  const setPendingActivation = (tokenCode, nextUrl = window.location.href) => {
    if (tokenCode) localStorage.setItem(PENDING_TOKEN_KEY, tokenCode);
    if (nextUrl) localStorage.setItem(PENDING_NEXT_KEY, nextUrl);
  };

  const clearPendingActivation = () => {
    localStorage.removeItem(PENDING_TOKEN_KEY);
    localStorage.removeItem(PENDING_NEXT_KEY);
  };

  const activateToken = (tokenCode) => {
    const state = loadState();
    const user = getActiveUser(state);
    const token = state.tokens.find((item) => item.token_code === tokenCode);

    if (!token) return { status: "not_found" };
    if (!user) {
      setPendingActivation(tokenCode);
      return { status: "needs_login", token, edition: getEdition(token.edition_id) };
    }

    if (token.status === "activated" && token.activated_by_user_id && token.activated_by_user_id !== user.id) {
      return { status: "already_claimed", token, edition: getEdition(token.edition_id), user };
    }

    token.status = "activated";
    token.activated_by_user_id = user.id;
    token.activated_at = token.activated_at || now();

    const hasLink = state.user_tokens.some((link) => link.user_id === user.id && link.token_id === token.id);
    if (!hasLink) {
      state.sequences.user_tokens += 1;
      state.user_tokens.push({
        id: state.sequences.user_tokens,
        user_id: user.id,
        token_id: token.id,
        edition_id: token.edition_id,
        activated_at: token.activated_at,
      });
    }

    clearPendingActivation();
    saveState(state);
    return { status: "activated", token, edition: getEdition(token.edition_id), user };
  };

  const canAccessEdition = (editionSlug) => {
    const state = loadState();
    const edition = getEdition(editionSlug);
    const user = getActiveUser(state);

    if (!edition) return { allowed: false, reason: "edition_not_found" };
    if (!edition.is_active) return { allowed: false, reason: "edition_inactive", edition };
    if (!user) return { allowed: false, reason: "needs_login", edition };

    const activeLink = state.user_tokens.find((link) => {
      if (link.user_id !== user.id || link.edition_id !== edition.id) return false;
      const token = state.tokens.find((item) => item.id === link.token_id);
      return token?.status === "activated" && token.activated_by_user_id === user.id;
    });

    if (!activeLink) return { allowed: false, reason: "missing_token", edition, user };

    return {
      allowed: true,
      reason: "allowed",
      edition,
      user,
      token: state.tokens.find((token) => token.id === activeLink.token_id),
    };
  };

  const getPendingNextUrl = () => localStorage.getItem(PENDING_NEXT_KEY) || window.location.href.split("#")[0];

  const getAuthPageUrl = (nextUrl = getPendingNextUrl(), tokenCode = localStorage.getItem(PENDING_TOKEN_KEY)) => {
    const target = new URL(siteUrl("auth/instagram/"));
    if (nextUrl) target.searchParams.set("next", nextUrl);
    if (tokenCode) target.searchParams.set("token_code", tokenCode);
    return target.href;
  };

  const startInstagramOAuth = (options = {}) => {
    const pendingToken = options.tokenCode || localStorage.getItem(PENDING_TOKEN_KEY);
    const nextUrl = options.next || getPendingNextUrl();
    const oauthStartUrl = getOAuthStartUrl();

    setPendingActivation(pendingToken, nextUrl);

    if (!oauthStartUrl) {
      return { status: "missing_oauth_config" };
    }

    const target = new URL(oauthStartUrl, window.location.href);
    target.searchParams.set("next", nextUrl);
    if (pendingToken) target.searchParams.set("token_code", pendingToken);
    window.location.assign(target.href);
    return { status: "redirecting" };
  };

  const goToInstagramAuth = (options = {}) => {
    const pendingToken = options.tokenCode || localStorage.getItem(PENDING_TOKEN_KEY);
    const nextUrl = options.next || getPendingNextUrl();
    setPendingActivation(pendingToken, nextUrl);
    window.location.assign(getAuthPageUrl(nextUrl, pendingToken));
    return { status: "auth_screen" };
  };

  const loginWithInstagram = (options = {}) => {
    if (options.profile) {
      const user = createOrUpdateUser(options.profile);
      const pendingToken = options.tokenCode || localStorage.getItem(PENDING_TOKEN_KEY);
      const activation = pendingToken ? activateToken(pendingToken) : null;

      if (options.redirect) {
        window.location.assign(options.next || getPendingNextUrl());
      }

      return { status: "logged_in", user, activation };
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

  const renderActivationPage = (container) => {
    const tokenCode = container.dataset.memoraToken || decodeURIComponent(window.location.pathname.split("/").filter(Boolean).at(-1) || "");
    const state = loadState();
    const token = state.tokens.find((item) => item.token_code === tokenCode);

    if (!token) {
      renderAccessShell(
        container,
        `
          <p class="eyebrow">Token Memora</p>
          <h1>Token não encontrado</h1>
          <p>O código escaneado não pertence a uma edição ativa da Memora.</p>
          <div class="memora-access-actions">
            <a class="primary-button" href="${siteUrl("index.html#edicoes")}">Ver edições</a>
          </div>
        `
      );
      return;
    }

    const edition = getEdition(token.edition_id);
    const user = getActiveUser(state);

    if (!user) {
      setPendingActivation(token.token_code, window.location.href);
      renderAccessShell(
        container,
        `
          <p class="eyebrow">Ativação Memora</p>
          <h1>${escapeHtml(token.token_number)}</h1>
          <p>Entre com Instagram para criar seu Memora ID e vincular este token à edição ${escapeHtml(edition.title)}.</p>
          <dl class="memora-access-meta">
            <div><dt>Status</dt><dd>${escapeHtml(token.status)}</dd></div>
            <div><dt>Edição</dt><dd>${escapeHtml(edition.title)}</dd></div>
            <div><dt>Token</dt><dd>${escapeHtml(token.token_number)}</dd></div>
          </dl>
          <div class="memora-access-actions">
            <button class="primary-button" type="button" data-memora-login data-memora-token="${escapeHtml(token.token_code)}" data-memora-next="${escapeHtml(window.location.href)}">Login com Instagram</button>
          </div>
        `
      );
      bindLoginButtons(container);
      return;
    }

    const activation = activateToken(token.token_code);

    renderAccessShell(
      container,
      `
        <p class="eyebrow">Acesso liberado</p>
        <h1>${escapeHtml(token.token_number)} ativado</h1>
        <p>Memora ID ${escapeHtml(activation.user?.id || user.id)} agora possui acesso à edição ${escapeHtml(edition.title)}.</p>
        <dl class="memora-access-meta">
          <div><dt>User</dt><dd>${escapeHtml(activation.user?.id || user.id)}</dd></div>
          <div><dt>Token</dt><dd>${escapeHtml(token.token_number)}</dd></div>
          <div><dt>Status</dt><dd>activated</dd></div>
        </dl>
        <div class="memora-access-actions">
          <a class="primary-button" href="${siteUrl(edition.internal_page_url)}">Abrir edição</a>
          <a class="secondary-button" href="${siteUrl("index.html#edicoes")}">Ver coleções</a>
        </div>
      `
    );
  };

  const deniedContent = (edition) => `
    <p class="eyebrow">Edição exclusiva</p>
    <h1>${escapeHtml(edition?.title || "Memora")}</h1>
    <p>Esta edição é exclusiva para colecionadores. Escaneie seu Memora físico para ativar o acesso.</p>
    <div class="memora-access-actions">
      ${edition?.activation_url ? `<a class="primary-button" href="${siteUrl(edition.activation_url)}">Ativar Memora físico</a>` : ""}
      <a class="secondary-button" href="${siteUrl("index.html#edicoes")}">Voltar às edições</a>
    </div>
  `;

  const renderEditionGate = (container) => {
    const editionSlug = container.dataset.memoraEditionGate;
    const access = canAccessEdition(editionSlug);

    if (access.allowed) {
      renderAccessShell(
        container,
        `
          <p class="eyebrow">Acesso validado</p>
          <h1>${escapeHtml(access.edition.title)}</h1>
          <p>Memora ID ${escapeHtml(access.user.id)} possui o token ${escapeHtml(access.token.token_number)} ativado.</p>
          <div class="memora-access-actions">
            <a class="primary-button" href="${siteUrl(access.edition.content_page_url)}">Entrar agora</a>
          </div>
        `
      );
      window.setTimeout(() => window.location.assign(siteUrl(access.edition.content_page_url)), 700);
      return;
    }

    renderAccessShell(container, deniedContent(access.edition));
  };

  const enforceProtectedEdition = () => {
    const editionSlug = document.body.dataset.memoraProtectedEdition;
    if (!editionSlug) return;

    const access = canAccessEdition(editionSlug);
    if (access.allowed) {
      document.body.classList.add("memora-access-ready");
      return;
    }

    document.body.classList.add("memora-access-denied", "memora-access-ready");
    const main = document.querySelector("main");
    if (main) renderAccessShell(main, deniedContent(access.edition));
  };

  const renderInstagramAuthPage = (container) => {
    const params = new URLSearchParams(window.location.search);
    const tokenCode = params.get("token_code") || localStorage.getItem(PENDING_TOKEN_KEY);
    const nextUrl = params.get("next") || getPendingNextUrl();
    const oauthStartUrl = getOAuthStartUrl();

    setPendingActivation(tokenCode, nextUrl);

    renderAccessShell(
      container,
      `
        <p class="eyebrow">Login Instagram</p>
        <h1>Conectar Memora ID</h1>
        <p>Entre com Instagram para criar ou atualizar seu user Memora e vincular tokens físicos ao seu perfil.</p>
        <dl class="memora-access-meta">
          <div><dt>Memora ID</dt><dd>users.id</dd></div>
          <div><dt>Login</dt><dd>Instagram</dd></div>
          <div><dt>Token</dt><dd>${escapeHtml(tokenCode ? tokenCode.split("-")[0] : "pendente")}</dd></div>
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
    const tokenCode = params.get("token_code") || localStorage.getItem(PENDING_TOKEN_KEY);
    const nextUrl = params.get("next") || storedNextUrl || siteUrl("index.html#edicoes");

    if (!profile) {
      renderAccessShell(
        container,
        `
          <p class="eyebrow">Callback Instagram</p>
          <h1>Dados pendentes</h1>
          <p>O retorno chegou sem os dados do Instagram. O backend precisa trocar o código OAuth pelo perfil e redirecionar para cá com instagram_id, instagram_username, display_name e avatar_url.</p>
          <div class="memora-access-actions">
            <a class="primary-button" href="${getAuthPageUrl(nextUrl, tokenCode)}">Voltar ao login</a>
          </div>
        `
      );
      return;
    }

    const user = createOrUpdateUser(profile);
    const activation = tokenCode ? activateToken(tokenCode) : null;

    renderAccessShell(
      container,
      `
        <p class="eyebrow">Login confirmado</p>
        <h1>@${escapeHtml(user.instagram_username)}</h1>
        <p>${activation?.status === "activated" ? "Token ativado e vinculado ao seu Memora ID." : "Seu Memora ID foi atualizado."}</p>
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
        const tokenCode = localStorage.getItem(PENDING_TOKEN_KEY);
        const nextUrl = getPendingNextUrl();
        const target = new URL(siteUrl("auth/instagram/callback/"));
        target.searchParams.set("next", nextUrl);
        target.searchParams.set("instagram_id", demoProfile.instagram_id);
        target.searchParams.set("instagram_username", demoProfile.instagram_username);
        target.searchParams.set("display_name", demoProfile.display_name);
        if (tokenCode) target.searchParams.set("token_code", tokenCode);
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

        const tokenCode = button.dataset.memoraToken || localStorage.getItem(PENDING_TOKEN_KEY);
        const nextUrl = button.dataset.memoraNext || localStorage.getItem(PENDING_NEXT_KEY) || window.location.href.split("#")[0];
        goToInstagramAuth({ tokenCode, next: nextUrl });
      });
    });
  }

  const updateLoginLabels = () => {
    const user = getActiveUser();
    if (!user) return;

    document.querySelectorAll(".login-cta").forEach((link) => {
      link.textContent = `@${user.instagram_username}`;
      link.setAttribute("href", siteUrl("index.html#login"));
    });
  };

  const renderCurrentRoute = () => {
    document.querySelectorAll("[data-memora-auth-start]").forEach(renderInstagramAuthPage);
    document.querySelectorAll("[data-memora-activation]").forEach(renderActivationPage);
    document.querySelectorAll("[data-memora-edition-gate]").forEach(renderEditionGate);
    document.querySelectorAll("[data-memora-auth-callback]").forEach(renderAuthCallback);
    enforceProtectedEdition();
    bindLoginButtons();
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindLoginButtons();
    updateLoginLabels();
    renderCurrentRoute();
  });

  window.MemoraAccess = {
    activateToken,
    canAccessEdition,
    createOrUpdateUser,
    editions,
    getActiveUser,
    loadState,
    loginWithInstagram,
    saveState,
    siteUrl,
    startInstagramOAuth,
  };
})();
