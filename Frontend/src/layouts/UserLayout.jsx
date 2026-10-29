import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Icon from "../components/icon";
import UserSidebar from "../components/user/UserSidebar";
import ProfileMenu from "../components/user/ProfileMenu";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/ESPORTIFY-Logo.png";
import "../styles/admin.css"; // topbar dan sidebar dipakai ulang
import "../styles/user.css";
import { getProfile } from "../services/profileApi";

function UserLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  // const handleLogout = async () => {
  //   try {
  //     await signOut();
  //   } catch (err) {
  //     console.error("Logout backend gagal:", err);
  //   } finally {
  //     window.location.replace("/");
  //   }
  // };

  const handleLogout = async () => {
    // Pindah dulu ke landing supaya ProtectedRoute tidak sempat melempar ke /login
    navigate("/", { replace: true });
    try {
      await signOut();
    } catch (err) {
      console.error("Logout backend gagal:", err);
    }
  };

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((err) => setError(err.message || "Gagal memuat profil."));
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
          <Link to="/home" className="logo">
            <img src={logo} alt="ESPORTIFY" className="logo-img" />
            ESPORTIFY
          </Link>
        </div>

        <div className="admin-topbar-right">
          <button className="admin-circle-btn" aria-label="Notifikasi">
            <Icon name="bell" size={18} />
            <span className="admin-dot"></span>
          </button>
          <ProfileMenu
            username={profile?.username ?? user?.username ?? ""}
            avatar={profile?.avatar}
          />
        </div>
      </header>

      <div className="admin-body">
        <UserSidebar
          open={sidebarOpen}
          onNavigate={closeSidebar}
          onLogout={handleLogout}
        />
        {sidebarOpen && (
          <div className="admin-overlay" onClick={closeSidebar}></div>
        )}
        <main className="admin-main">
          {error && <p className="admin-message error">{error}</p>}
          {!profile && !error && <p className="admin-message">Memuat...</p>}
          {profile && <Outlet context={{ profile, setProfile }} />}
        </main>
      </div>
    </div>
  );
}

export default UserLayout;
