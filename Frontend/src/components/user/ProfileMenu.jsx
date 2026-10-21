import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../icon";
import Avatar from "./Avatar";

// Avatar di pojok kanan atas. Diklik: muncul Pengaturan dan Logout
function ProfileMenu({ username, avatar, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Tutup menu kalau klik di luar
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="profile-menu" ref={ref}>
      <button
        className="profile-menu-trigger"
        onClick={() => setOpen(!open)}
        aria-label="Menu profil"
      >
        <Avatar src={avatar} name={username} size={36} />
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-avatar">
            <Avatar src={avatar} name={username} size={88} />
          </div>

          <Link
            to="/profile"
            className="profile-dropdown-item"
            onClick={() => setOpen(false)}
          >
            <Icon name="settings" size={20} /> Pengaturan
          </Link>

          <button className="profile-dropdown-item logout" onClick={onLogout}>
            <Icon name="logout" size={20} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
