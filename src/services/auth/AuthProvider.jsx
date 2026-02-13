import React, { createContext, useMemo, useState } from "react";

export const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("access_token") || "");
  const payload = token ? decodeJwt(token) : null;

  const isExpired = useMemo(() => {
    if (!payload?.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }, [payload]);

  const role = payload?.role || null;

  const login = (newToken) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken("");
  };

  const value = useMemo(() => ({
    token,
    role,
    isAuthenticated: !!token && !isExpired,
    logout,
    login,
  }), [token, role, isExpired]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
