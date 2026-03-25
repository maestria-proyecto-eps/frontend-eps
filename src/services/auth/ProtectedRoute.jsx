import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function ProtectedRoute({ allowRoles, children }) {
  const auth = useContext(AuthContext);

  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;

  if (allowRoles?.length) {
    const enabledRoles = Array.isArray(auth?.enabledRoles) && auth.enabledRoles.length
      ? auth.enabledRoles
      : auth?.role
        ? [auth.role]
        : [];

    if (!allowRoles.some((r) => enabledRoles.includes(r))) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
