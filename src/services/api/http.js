import axios from "axios";

/**
 * Cliente HTTP para consumir los microservicios del backend.
 *
 * En producción/preview, Vercel Rewrites (vercel.json) redirige las
 * peticiones /api/* al microservicio correcto en Render.
 *
 * En desarrollo local, Vite proxy (vite.config.js) hace lo mismo
 * contra los servicios levantados en localhost.
 */
export const http = axios.create({
  baseURL: "",
});

function normalizeToRelativeApiUrl(rawUrl) {
  if (!rawUrl) return rawUrl;
  const input = typeof rawUrl === "string" ? rawUrl : String(rawUrl);
  if (input.startsWith("/api/")) return input;

  try {
    const parsed = new URL(input);
    const isRenderHost = parsed.hostname.endsWith(".onrender.com");
    if (!isRenderHost || !parsed.pathname.startsWith("/api/")) return input;

    const pathname = parsed.pathname.startsWith("/api/")
      ? parsed.pathname
      : `/api${parsed.pathname}`;
    return `${pathname}${parsed.search || ""}`;
  } catch {
    return input;
  }
}

function getStoredToken() {
  const candidates = [
    localStorage.getItem("access_token"),
    localStorage.getItem("token"),
    localStorage.getItem("auth_token"),
    sessionStorage.getItem("access_token"),
    sessionStorage.getItem("token"),
    sessionStorage.getItem("auth_token"),
  ];

  const raw = candidates.find((value) => typeof value === "string" && value.trim() !== "");
  if (!raw) return "";

  let normalized = String(raw).trim().replace(/^"+|"+$/g, "");
  if (!normalized) return "";

  // Soporta valores serializados como JSON:
  // {"access_token":"..."} | {"token":"..."} | "\"eyJ...\""
  if (normalized.startsWith("{") || normalized.startsWith("[")) {
    try {
      const parsed = JSON.parse(normalized);
      const nested =
        parsed?.access_token ||
        parsed?.token ||
        parsed?.data?.access_token ||
        parsed?.Data?.access_token ||
        "";
      normalized = String(nested).trim();
    } catch {
      // Si no parsea, continuamos con el valor original.
    }
  }

  const token = normalized
    .replace(/^Bearer\s+/i, "")
    .replace(/^"+|"+$/g, "")
    .trim();

  return token;
}

http.interceptors.request.use((config) => {
  const normalizedUrl = normalizeToRelativeApiUrl(config.url);
  config.url = normalizedUrl;

  if (typeof normalizedUrl === "string" && normalizedUrl.startsWith("/api/")) {
    config.baseURL = "";
  }

  if (typeof config.baseURL === "string" && config.baseURL.includes(".onrender.com")) {
    config.baseURL = "";
  }

  const token = getStoredToken();
  if (!config.headers) config.headers = {};
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
