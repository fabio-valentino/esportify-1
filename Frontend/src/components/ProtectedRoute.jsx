import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SKIP_AUTH } from "../config/env";

// Ini hanya pengarah tampilan. Keamanan data tetap dijaga backend.
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // DEV ONLY: lewati login (lihat VITE_SKIP_AUTH di .env)
  if (SKIP_AUTH) return <Outlet />;

  if (loading) return <p className="placeholder">Memuat...</p>;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}

export default ProtectedRoute;
