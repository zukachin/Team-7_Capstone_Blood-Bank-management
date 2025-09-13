import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";

/**
 * ProtectedRoute: wraps children and redirects to /login when not authenticated
 *
 * Usage:
 * <Route path="/donor-portal" element={<ProtectedRoute><DonorPortalPage/></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const token = api.getToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
