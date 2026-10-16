import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Ini hanya pengarah tampilan. Keamanan data tetap dijaga backend.
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="placeholder">Memuat...</p>;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}

export default ProtectedRoute;
