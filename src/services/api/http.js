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

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
