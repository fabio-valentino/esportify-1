import { NavLink } from "react-router-dom";

const tabs = [
  { label: "Turnamen Kelolaan", to: "/turnamen/kelola" },
  { label: "Status Pengajuan", to: "/turnamen/status-pengajuan" },
];

// Dua tombol di atas halaman: berpindah antara dua halaman
function TournamentTabs() {
  return (
    <nav className="t-tabs" aria-label="Kelola turnamen">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `t-tab ${isActive ? "active" : ""}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default TournamentTabs;
