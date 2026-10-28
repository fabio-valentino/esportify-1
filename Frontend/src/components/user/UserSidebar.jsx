import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Icon from "../icon";

const navClass = ({ isActive }) =>
  isActive ? "admin-nav-item active" : "admin-nav-item";

// Cari Turnamen dan Turnamen Saya belum punya halaman: link-nya disiapkan saja
const tournamentItems = [
  { label: "Cari Turnamen", to: "/turnamen/cari", icon: "search" },
  { label: "Turnamen Saya", to: "/turnamen/saya", icon: "ticket" },
  {
    label: "Kelola Turnamen",
    to: "/turnamen/kelola",
    icon: "manage",
    also: ["/turnamen/buat", "/turnamen/status-pengajuan"],
  },
];

function UserSidebar({ open, onNavigate, onLogout }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(pathname.startsWith("/turnamen"));

  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      <NavLink to="/home" className={navClass} onClick={onNavigate}>
        <Icon name="home" size={16} /> Home
      </NavLink>

      <button
        className="admin-nav-item admin-nav-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Icon name="trophy" size={16} /> Turnamen
        <Icon name={menuOpen ? "chevron-up" : "chevron-down"} size={14} />
      </button>

      {menuOpen && (
        <div className="admin-submenu">
          {tournamentItems.map((item) => {
            const active =
              pathname === item.to ||
              (item.also ?? []).some((p) => pathname.startsWith(p));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`admin-nav-item ${active ? "active" : ""}`}
                onClick={onNavigate}
              >
                <Icon name={item.icon} size={15} /> {item.label}
              </NavLink>
            );
          })}
        </div>
      )}

      <button className="admin-nav-item sidebar-logout" onClick={onLogout}>
        <Icon name="logout" size={18} /> Keluar
      </button>
    </aside>
  );
}

export default UserSidebar;
