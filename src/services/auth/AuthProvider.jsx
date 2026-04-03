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
  const [enabledRoles, setEnabledRoles] = useState(role ? [role] : []);

  const login = useCallback((newToken) => {
    localStorage.setItem("access_token", newToken);
    const nextPayload = newToken ? decodeJwt(newToken) : null;
    const nextRole = nextPayload?.role || null;
    setEnabledRoles(nextRole ? [nextRole] : []);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    setToken("");
    setEnabledRoles([]);
  }, []);

  const value = useMemo(() => ({
    token,
    role,
    enabledRoles,
    setEnabledRoles,
    payload,           // ← agregar esto
    isAuthenticated: !!token && !isTokenExpired(payload),
    logout,
    login,
  }), [token, role, enabledRoles, payload, logout, login]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
