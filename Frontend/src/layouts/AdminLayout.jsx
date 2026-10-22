import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Icon from "../components/icon";
import AdminSidebar from "../components/admin/AdminSidebar";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/ESPORTIFY-Logo.png";
import "../styles/admin.css";
import Avatar from "../components/user/Avatar";
import "../styles/user.css";
import { getAdminProfile } from "../services/profileApi";

function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const [adminProfile, setAdminProfile] = useState(null);

  useEffect(() => {
    getAdminProfile()
      .then(setAdminProfile)
      .catch(() => {}); // cadangan: user?.username
  }, []);

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
          <Link to="/admin" className="logo">
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
              name={adminProfile?.username || user?.username || ""}
              size={36}
            />
          </Link>
          <button
            className="admin-circle-btn"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </header>

      <div className="admin-body">
        <AdminSidebar open={sidebarOpen} onNavigate={closeSidebar} />
        {sidebarOpen && (
          <div className="admin-overlay" onClick={closeSidebar}></div>
        )}
        <main className="admin-main">
          <Outlet context={{ adminProfile, setAdminProfile }} />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
