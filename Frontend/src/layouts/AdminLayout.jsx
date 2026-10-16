import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import AdminSidebar from "../components/admin/AdminSidebar";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/ESPORTIFY-Logo.png";
import "../styles/admin.css";

function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

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
          <span className="admin-circle-btn" title={user?.username}>
            <Icon name="user" size={18} />
          </span>
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
