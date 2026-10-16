import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function UserHome() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  // roles hanya untuk tampilan. Hak akses sebenarnya dicek backend.
  const roleText = user.roles
    .map((r) => (typeof r === "string" ? r : r.name))
    .join(", ");

  return (
    <section className="placeholder">
      <h1>Hallo, {user.username}! Selamat datang kembali di Esportify.</h1>
      {roleText && <p>Role: {roleText}</p>}
      <button className="btn btn-primary" onClick={handleLogout}>
        Logout
      </button>
    </section>
  );
}

export default UserHome;
