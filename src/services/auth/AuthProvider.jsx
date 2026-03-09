import React, { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";

function decodeJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload) {
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("access_token") || "");
  const payload = token ? decodeJwt(token) : null;

  const role = payload?.role || null;

  const login = useCallback((newToken) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    setToken("");
  }, []);

  const value = useMemo(() => ({
    token,
    role,
    payload,           // ← agregar esto
    isAuthenticated: !!token && !isTokenExpired(payload),
    logout,
    login,
  }), [token, role, payload, logout, login]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
