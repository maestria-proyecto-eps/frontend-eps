import axios from "axios";

/**
 * Cliente HTTP para consumir la API del backend (repositorio externo).
 * La URL base se configura en .env con VITE_API_BASE_URL (ej: http://localhost:8000).
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/";

export const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
