import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SKIP_AUTH } from "../config/env";
import { isAdmin } from "../utils/role";

// Pengarah tampilan saja. Keamanan data tetap dijaga backend.
// adminOnly: halaman khusus admin. userOnly: halaman khusus user biasa.
function ProtectedRoute({ adminOnly = false, userOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // DEV ONLY: lewati login (lihat VITE_SKIP_AUTH di .env)
  if (SKIP_AUTH) return <Outlet />;

  if (loading) return <p className="placeholder">Memuat...</p>;
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );

  const admin = isAdmin(user);
  if (adminOnly && !admin) return <Navigate to="/home" replace />;
  if (userOnly && admin) return <Navigate to="/admin" replace />;

  return <Outlet />;
}

export default ProtectedRoute;
