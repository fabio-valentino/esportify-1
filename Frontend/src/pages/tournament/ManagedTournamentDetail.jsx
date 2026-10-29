import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/icon";
import TournamentInfo from "../../components/tournament/TournamentInfo";
import { getTournamentDetail } from "../../services/tournamentApi";

function ManagedTournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTournamentDetail(id)
      .then(setD)
      .catch((err) =>
        setError(
          err.status === 404 ? "Turnamen tidak ditemukan." : err.message,
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const back = (
    <button
      type="button"
      className="d-back"
      onClick={() => navigate("/turnamen/kelola")}
    >
      <Icon name="chevron-left" size={26} /> Kembali
    </button>
  );

  if (loading) return <p className="admin-message">Memuat...</p>;
  if (error)
    return (
      <>
        {back}
        <p className="admin-message error">{error}</p>
      </>
    );

  return (
    <>
      {back}
      <h1 className="admin-title">Detail Turnamen</h1>
      <TournamentInfo d={d} />
    </>
  );
}

export default ManagedTournamentDetail;
