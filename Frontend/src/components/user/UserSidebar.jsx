import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Icon from "../icon";

const tournamentItems = [
  {
    label: "Cari Turnamen",
    to: "/turnamen/cari",
    icon: "search",
    also: ["/turnamen/cari/"],
    locked: false,
  },
  {
    label: "Turnamen Saya",
    to: "/turnamen/saya",
    icon: "ticket",
    locked: true,
  },
  {
    label: "Kelola Turnamen",
    to: "/turnamen/kelola",
    icon: "manage",
    also: [
      "/turnamen/buat",
      "/turnamen/status-pengajuan",
      "/turnamen/pengajuan",
      "/turnamen/detail",
    ],
    locked: true,
  },
];

function UserSidebar({ open, onNavigate, onLogout, guest = false }) {
  const { pathname, search } = useLocation();

  const [menuOpen, setMenuOpen] = useState(pathname.startsWith("/turnamen"));
  const [showGate, setShowGate] = useState(false);

  const returnTo = `${pathname}${search}`;

  const navClass = ({ isActive }) =>
    isActive ? "admin-nav-item active" : "admin-nav-item";

  const handleLockedClick = () => {
    setShowGate(true);
    onNavigate?.();
  };

  const isItemActive = (item) =>
    pathname === item.to ||
    (item.also ?? []).some((path) => pathname.startsWith(path));

  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      {/* Home hanya ditampilkan untuk user yang sudah login */}
      {!guest && (
        <NavLink to="/home" end className={navClass} onClick={onNavigate}>
          <Icon name="home" size={16} />
          Home
        </NavLink>
      )}

      {/* Menu turnamen tersedia untuk guest dan user */}
      <button
        type="button"
        className="admin-nav-item admin-nav-toggle"
        onClick={() => setMenuOpen((previous) => !previous)}
        aria-expanded={menuOpen}
      >
        <Icon name="trophy" size={16} />
        <span>Turnamen</span>
        <Icon name={menuOpen ? "chevron-up" : "chevron-down"} size={14} />
      </button>

      {menuOpen && (
        <div className="admin-submenu">
          {tournamentItems.map((item) => {
            const active = isItemActive(item);

            if (guest && item.locked) {
              return (
                <button
                  key={item.to}
                  type="button"
                  className="admin-nav-item guest-locked-item"
                  onClick={handleLockedClick}
                  title="Masuk untuk menggunakan fitur ini"
                  aria-label={`${item.label}, perlu login`}
                >
                  <Icon name={item.icon} size={15} />
                  <span>{item.label}</span>
                  <Icon name="lock" size={13} />
                </button>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/turnamen/cari"}
                className={`admin-nav-item ${active ? "active" : ""}`}
                onClick={onNavigate}
              >
                <Icon name={item.icon} size={15} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Aksi akun */}
      {guest ? (
        <Link to="/" className="guest-back-landing" onClick={onNavigate}>
          <Icon name="arrow-left" size={16} />
          <span>Kembali ke Landing Page</span>
        </Link>
      ) : (
        <button type="button" onClick={onLogout}>
          Logout
        </button>
      )}

      {/* Modal akses khusus guest */}
      {guest && showGate && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowGate(false);
            }
          }}
        >
          <section
            className="admin-modal guest-gate-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-gate-title"
          >
            <div className="admin-modal-head">
              <h2 id="guest-gate-title">Masuk dulu, bro!</h2>

              <button
                type="button"
                className="admin-modal-close"
                aria-label="Tutup"
                onClick={() => setShowGate(false)}
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <p className="guest-gate-description">
              Masuk atau buat akun Esportify untuk mengakses fitur ini dan
              mengelola aktivitas turnamenmu.
            </p>

            <div className="admin-modal-actions">
              <Link
                to="/login"
                state={{ from: returnTo }}
                className="guest-gate-btn guest-gate-secondary"
                onClick={() => setShowGate(false)}
              >
                Masuk
              </Link>

              <Link
                to="/register"
                state={{ from: returnTo }}
                className="guest-gate-btn guest-gate-primary"
                onClick={() => setShowGate(false)}
              >
                Buat Akun
              </Link>
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}

export default UserSidebar;
