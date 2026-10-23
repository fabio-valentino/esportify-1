import { Link } from "react-router-dom";
import Avatar from "./Avatar";

// Avatar di topbar: langsung ke halaman profil. Logout ada di sidebar.
function ProfileMenu({ username, avatar }) {
  return (
    <Link
      to="/profile"
      className="profile-menu-trigger"
      aria-label="Profil"
      title="Profil"
    >
      <Avatar src={avatar} name={username} size={36} />
    </Link>
  );
}

export default ProfileMenu;
