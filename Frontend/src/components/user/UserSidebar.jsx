import { useState } from "react";
import { NavLink } from "react-router-dom";
import Icon from "../icon";

const navClass = ({ isActive }) =>
  isActive ? "admin-nav-item active" : "admin-nav-item";

function UserSidebar({ open, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      <NavLink to="/home" className={navClass} onClick={onNavigate}>
        <Icon name="home" size={16} /> Home
      </NavLink>

      <button
        className="admin-nav-item admin-nav-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Icon name="trophy" size={16} /> Turnament
        <Icon name={menuOpen ? "chevron-up" : "chevron-down"} size={14} />
      </button>

      {/* Isi submenu menunggu fitur Turnamen */}
      {menuOpen && (
        <div className="admin-submenu">
          <span className="admin-message">Belum ada menu.</span>
        </div>
      )}
    </aside>
  );
}

export default UserSidebar;
