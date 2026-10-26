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
import AdminProfile from "./pages/admin/AdminProfile";
import AdminGames from "./pages/admin/AdminGames";
import AdminRoles from "./pages/admin/AdminRoles";
import Landing from "./pages/Landing";
import CreateTournament from "./pages/tournament/CreateTournament";
import ManageTournaments from "./pages/tournament/ManageTournaments";
import SubmissionStatus from "./pages/tournament/SubmissionStatus";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Khusus user biasa: admin diarahkan ke /admin */}
        <Route element={<ProtectedRoute userOnly />}>
          <Route element={<UserLayout />}>
            <Route path="/home" element={<UserHome />} />
            <Route path="/turnamen/buat" element={<CreateTournament />} />
            <Route path="/turnamen/kelola" element={<ManageTournaments />} />
            <Route
              path="/turnamen/status-pengajuan"
              element={<SubmissionStatus />}
            />
          </Route>
        </Route>

        {/* Semua yang sudah login */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Khusus admin. Backend tetap menolak dengan 403 kalau bukan admin. */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="permissions" element={<AdminPermissions />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="games" element={<AdminGames />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
