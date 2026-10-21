import { useState } from "react";
import { NavLink } from "react-router-dom";
import Icon from "../icon";

const navClass = ({ isActive }) =>
  isActive ? "admin-nav-item active" : "admin-nav-item";

// Fitur berikutnya (Dashboard, Permissions) tinggal menambah item di sini
const userMenuItems = [
  { label: "Users", to: "/admin/users", icon: "user" },
  { label: "Permissions", to: "/admin/permissions", icon: "key" },
];

function AdminSidebar({ open, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      <button
        className="admin-nav-item admin-nav-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Icon name="users" size={16} /> User Management
        <Icon name={menuOpen ? "chevron-up" : "chevron-down"} size={14} />
      </button>

      {menuOpen && (
        <div className="admin-submenu">
          {userMenuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navClass}
              onClick={onNavigate}
            >
              <Icon name={item.icon} size={15} /> {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </aside>
  );
}

export default AdminSidebar;
