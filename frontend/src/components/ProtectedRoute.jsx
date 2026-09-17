import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap a page element with this to require login, and optionally
 * restrict it to specific roles, e.g.:
 *   <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
