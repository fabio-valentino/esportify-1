import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/icon";
import TournamentTabs from "../../components/tournament/TournamentTabs";
import SubmissionStatusBadge from "../../components/tournament/SubmissionStatusBadge";
import { getSubmissions } from "../../services/tournamentApi";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

// ISO (2026-11-10) -> 10 Nov 2026. Teks lain ditampilkan apa adanya.
const formatDate = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ""));
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : value;
};

function SubmissionStatus() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSubmissions()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 className="admin-title">Kelola Turnamen</h1>
      <TournamentTabs />

      <section className="admin-panel">
        <h2 className="t-section-title s-title">
          <span className="s-title-icon">
            <Icon name="menu" size={20} />
          </span>
          Daftar Pengajuan Saya
        </h2>

        {error && <p className="admin-message error">{error}</p>}

        <div className="s-table-wrap">
          <table className="s-table">
            <thead>
              <tr>
                <th>Nama turnamen</th>
                <th>Tanggal pengajuan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td className="s-name">{s.name}</td>
                  <td className="s-center">{formatDate(s.submittedAt)}</td>
                  <td className="s-center">
                    <SubmissionStatusBadge status={s.status} />
                  </td>
                  <td className="s-center">
                    {/* Halaman detail pengajuan belum ada */}
                    <Link
                      to={`/turnamen/pengajuan/${s.id}`}
                      className="s-detail-btn"
                    >
                      Detail <Icon name="chevron-right" size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    Belum ada pengajuan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default SubmissionStatus;
