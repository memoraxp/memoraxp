(() => {
  class MemoraApiError extends Error {
    constructor(message, options = {}) {
      super(message);
      this.name = "MemoraApiError";
      this.status = options.status || 0;
      this.code = options.code || "network_error";
      this.fields = options.fields || [];
      this.kind = this.status === 401 ? "authentication" : this.status === 403 ? "authorization" : this.status === 422 ? "validation" : this.status ? "api" : "network";
    }
  }

  const csrfToken = () => document.cookie.split("; ").find((item) => item.startsWith("memora_csrf="))?.split("=").slice(1).join("=") || "";

  const request = async (path, options = {}) => {
    const method = String(options.method || "GET").toUpperCase();
    const headers = new Headers(options.headers || {});
    let body = options.body;
    if (body && !(body instanceof FormData) && typeof body !== "string") {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(body);
    }
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) headers.set("X-CSRF-Token", csrfToken());
    let response;
    try {
      response = await fetch(path, { ...options, method, headers, body, credentials: "same-origin" });
    } catch (error) {
      throw new MemoraApiError("Não foi possível conectar ao servidor.", { code: "network_error" });
    }
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : await response.text();
    if (!response.ok) {
      const detail = data?.error || {};
      throw new MemoraApiError(detail.message || `A solicitação falhou (${response.status}).`, { status: response.status, code: detail.code, fields: detail.fields });
    }
    return data;
  };

  window.MemoraAPI = {
    Error: MemoraApiError,
    request,
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    delete: (path) => request(path, { method: "DELETE" }),
  };
})();

