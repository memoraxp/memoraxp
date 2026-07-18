(() => {
  const api = window.MemoraAPI;
  const safeNext = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

  const showError = (message) => {
    const element = document.querySelector("[data-manager-login-error]");
    if (element) { element.textContent = message; element.hidden = false; }
  };

  const bindLogin = () => {
    const toggle = document.querySelector("[data-manager-login-toggle]");
    const form = document.querySelector("[data-manager-login-form]");
    toggle?.addEventListener("click", () => {
      form.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      form.querySelector("input")?.focus();
    });
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector("[type=submit]");
      submit.disabled = true;
      showError("");
      try {
        const result = await api.post("/api/auth/manager/login", {
          email: form.elements.email.value.trim(),
          password: form.elements.password.value,
        });
        const destination = result.editions?.[0]?.manager_page;
        if (!destination) throw new Error("Esta conta não possui uma edição atribuída.");
        window.location.assign(`/${destination}`);
      } catch (error) {
        showError(error.status === 401 ? "E-mail ou senha inválidos." : error.message);
      } finally {
        submit.disabled = false;
      }
    });
    document.querySelector("[data-google-login]")?.addEventListener("click", () => {
      window.location.assign(`/api/auth/google/start?next=${encodeURIComponent(safeNext() === "/index.html#login" ? "/memora-id.html" : safeNext())}`);
    });
  };

  const bindSession = async () => {
    let current = null;
    try { current = await api.get("/api/auth/me"); } catch (error) { if (error.status !== 401) console.error(error); }
    if (current && !document.querySelector("[data-memora-logout]")) {
      const actions = document.querySelector(".header-actions");
      if (actions) actions.insertAdjacentHTML("beforeend", '<button class="header-cta" type="button" data-memora-logout>Sair</button>');
    }
    document.querySelectorAll("[data-memora-logout]").forEach((button) => button.addEventListener("click", async () => {
      await api.post("/api/auth/logout");
      window.location.assign("/index.html#login");
    }));
    document.dispatchEvent(new CustomEvent("memora:auth", { detail: current }));
  };

  document.addEventListener("DOMContentLoaded", () => { bindLogin(); bindSession(); });
})();
