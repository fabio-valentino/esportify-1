import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserHome from "./pages/UserHome";
import AdminLayout from "./layouts/AdminLayout";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPermissions from "./pages/admin/AdminPermissions";
import UserLayout from "./layouts/UserLayout";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Wajib login. Hak akses admin yang sebenarnya diputuskan backend (403). */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/home" element={<UserHome />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            {/* Sementara hanya fitur Users */}
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="permissions" element={<AdminPermissions />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
