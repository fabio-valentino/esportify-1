import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/httpClient";

// Sementara: tampilan mentah untuk memastikan alur dan akses benar.
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
    apiRequest(`/turnamen/${id}`)
      .then((res) => {
        if (!off)
          setState({ status: "ok", data: res?.data ?? res, message: "" });
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
    <div className="ct-page">
      <button
        type="button"
        className="ct-btn ct-btn-s"
        onClick={() => navigate(-1)}
      >
        Kembali
      </button>
      <h1 className="admin-title">Detail Turnamen</h1>

      {state.status === "loading" && <p>Memuat...</p>}
      {state.status === "error" && <p role="alert">{state.message}</p>}
      {state.status === "ok" && (
        <pre style={{ overflow: "auto" }}>
          {JSON.stringify(state.data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default TournamentDetail;
