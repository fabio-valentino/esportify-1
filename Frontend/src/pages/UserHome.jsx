import { useOutletContext } from "react-router-dom";

function UserHome() {
  const { profile } = useOutletContext();

  return (
    <h1 className="admin-title">
      Hallo, {profile?.username ?? " "}! Selamat datang kembali di Esportify.
    </h1>
  );
}

export default UserHome;
