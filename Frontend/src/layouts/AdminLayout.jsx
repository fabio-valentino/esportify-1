import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Icon from "../components/icon";
import Avatar from "../components/user/Avatar";
import AdminSidebar from "../components/admin/AdminSidebar";
import PriorityPopup from "../components/admin/PriorityPopup";
import {
  AdminPriorityProvider,
  useAdminPriority,
} from "../context/AdminPriorityContext";
import { useAuth } from "../context/AuthContext";
import { getAdminProfile } from "../services/profileApi";
import logo from "../assets/ESPORTIFY-Logo.png";
import "../styles/admin.css";
import "../styles/user.css";

const POPUP_KEY = "esportify_priority_popup";

function AdminShell() {
  const { user, signOut } = useAuth();
  const { priority, loading, now } = useAdminPriority();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [popupDone, setPopupDone] = useState(
    () => sessionStorage.getItem(POPUP_KEY) === "1",
  );

  useEffect(() => {
    getAdminProfile()
      .then(setAdminProfile)
      .catch(() => {});
  }, []);

  const locked = !loading && priority.length > 0;

  const handleLogout = async () => {
    sessionStorage.removeItem(POPUP_KEY); // popup muncul lagi di login berikutnya
    await signOut();
    navigate("/login", { replace: true });
  };

  const goReview = () => {
    sessionStorage.setItem(POPUP_KEY, "1");
    setPopupDone(true);
    navigate("/admin/pengajuan");
  };

  // Kenyamanan saja. Penguncian yang sebenarnya dilakukan backend.
  if (locked && !pathname.startsWith("/admin/pengajuan")) {
    return <Navigate to="/admin/pengajuan" replace />;
  }

  return (
    <div className="admin">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button
            className="admin-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Buka menu"
          >
            <Icon name="menu" size={22} />
          </button>
          <Link to="/admin/pengajuan" className="logo">
            <img src={logo} alt="ESPORTIFY" className="logo-img" />
            ESPORTIFY
          </Link>
        </div>
        <div className="admin-topbar-right">
          <button className="admin-circle-btn" aria-label="Notifikasi">
            <Icon name="bell" size={18} />
            <span className="admin-dot"></span>
          </button>
          <Link
            to="/admin/profile"
            title="Profil admin"
            aria-label="Profil admin"
          >
            <Avatar
              src={adminProfile?.avatar}
              name={adminProfile?.username || user?.username || ""}
              size={36}
            />
          </Link>
        </div>
      </header>

      <div className="admin-body">
        <AdminSidebar
          open={sidebarOpen}
          locked={locked}
          onNavigate={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
        {sidebarOpen && (
          <div
            className="admin-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <main className="admin-main">
          <Outlet context={{ adminProfile, setAdminProfile }} />
        </main>
      </div>

      {locked && !popupDone && (
        <PriorityPopup items={priority} now={now} onGo={goReview} />
      )}
    </div>
  );
}

function AdminLayout() {
  return (
    <AdminPriorityProvider>
      <AdminShell />
    </AdminPriorityProvider>
  );
}

export default AdminLayout;
