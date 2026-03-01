import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function ProtectedRoute({ allowRoles, children }) {
  const auth = useContext(AuthContext);

  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  if (allowRoles?.length && !allowRoles.includes(auth.role)) return <Navigate to="/login" replace />;

  return children;
}
