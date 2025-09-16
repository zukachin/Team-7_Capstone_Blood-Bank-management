import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";

/**
 * ProtectedRoute: Wraps routes and restricts access based on authentication
 *
 * Props:
 * - adminOnly (boolean): If true, requires adminToken, else checks for user token.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = adminOnly ? api.getAdminToken() : api.getToken();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to={adminOnly ? "/admin/login" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
