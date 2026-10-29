import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/icon";
import TournamentInfo from "../../components/tournament/TournamentInfo";
import { getTournamentDetail } from "../../services/tournamentApi";

function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({
    status: "loading",
    data: null,
    message: "",
  });

  const here = `${location.pathname}${location.search}`;

  useEffect(() => {
    let off = false;
    setState({ status: "loading", data: null, message: "" });
    getTournamentDetail(id)
      .then((data) => {
        if (!off) setState({ status: "ok", data, message: "" });
      })
      .catch((err) => {
        if (off) return;
        // Token tidak valid / kedaluwarsa: ke login, lalu kembali ke halaman ini
        if (err.status === 401) {
          navigate("/login", { replace: true, state: { from: here } });
          return;
        }
        setState({
          status: "error",
          data: null,
          message:
            err.status === 404
              ? "Turnamen tidak ditemukan."
              : err.message || "Terjadi kesalahan.",
        });
      });
    return () => {
      off = true;
    };
  }, [id, here, navigate]);

  return (
    <>
      <button type="button" className="d-back" onClick={() => navigate(-1)}>
        <Icon name="chevron-left" size={26} /> Kembali
      </button>
      <h1 className="admin-title">Detail Turnamen</h1>

      {state.status === "loading" && <p className="admin-message">Memuat...</p>}
      {state.status === "error" && (
        <p className="admin-message error" role="alert">
          {state.message}
        </p>
      )}
      {state.status === "ok" && (
        <TournamentInfo
          d={state.data}
          action={
            // Belum ada fungsi pendaftaran
            <button type="button" className="td-register">
              <Icon name="user-plus" size={18} /> Daftar Sekarang
            </button>
          }
        />
      )}
    </>
  );
}

export default TournamentDetail;
