import React, { useMemo, useState } from "react";
import { AuthContext } from "./auth-context";

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
    isAuthenticated: !!token,
    logout,
    login,
  }), [token, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
