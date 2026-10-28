import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/icon";
import Pagination from "../../components/admin/Pagination";
import SubmissionStatusBadge from "../../components/tournament/SubmissionStatusBadge";
import { getAdminSubmissions } from "../../services/adminApi";
import "../../styles/user.css"; // gaya tabel dan badge status dipakai ulang

const PAGE_SIZE = 7;

// Nilai asli dari backend (huruf kecil untuk pencocokan)
const STATUSES = [
  "Menunggu Verifikasi",
  "Sedang diedit",
  "Sedang ditinjau",
  "Revisi",
  "Disetujui",
  "Ditolak",
];
const STATUS_LABEL = {
  Revisi: "Perlu Revisi",
  "Sedang diedit": "Sedang Diedit",
  "Sedang ditinjau": "Sedang Ditinjau",
};

const same = (a, b) =>
  String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

// ISO -> 08/11/2026
const formatDate = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ""));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
};

// Hanya tampilan: sudah berapa lama sejak diajukan. Aturan prioritas tetap dari backend.
const waitingText = (iso) => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - t) / 60000));
  if (minutes < 60) return `Menunggu ${minutes} menit`;
  if (minutes < 1440) return `Menunggu ${Math.floor(minutes / 60)} jam`;
  return `Menunggu ${Math.floor(minutes / 1440)} hari`;
};

const WAITING_STATUSES = ["menunggu verifikasi", "sedang ditinjau"];

const errorText = (err) =>
  err.status === 403
    ? err.message || "Kamu tidak punya izin melihat pengajuan."
    : err.message;

function AdminSubmissions() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminSubmissions()
      .then(setItems)
      .catch((err) => setError(errorText(err)))
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = items.filter((s) =>
    same(s.status, "Menunggu Verifikasi"),
  ).length;

  const keyword = search.trim().toLowerCase();
  const filtered = items.filter(
    (s) =>
      (!status || same(s.status, status)) &&
      (s.name.toLowerCase().includes(keyword) ||
        s.organizer.toLowerCase().includes(keyword)),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <>
      <h1 className="admin-title">Pengajuan Turnamen</h1>

      {pendingCount > 0 && (
        <div className="sub-banner">
          <span className="sub-banner-icon">
            <Icon name="hourglass" size={20} />
          </span>
          <div>
            <strong>{pendingCount} pengajuan menunggu verifikasi</strong>
            <p>
              Segera lakukan verifikasi untuk menghindari keterlambatan kepada
              penyelenggara.
            </p>
          </div>
        </div>
      )}

      <section className="admin-panel">
        <div className="sub-toolbar">
          <div className="admin-search">
            <Icon name="search" size={16} />
            <input
              type="text"
              placeholder="Cari nama turnamen, penyelenggara..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="admin-filter-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s] ?? s}
              </option>
            ))}
          </select>
          <span className="sub-count">
            Menampilkan <b>{visible.length}</b> dari {filtered.length} pengajuan
          </span>
        </div>

        {error && <p className="admin-message error">{error}</p>}

        <div className="s-table-wrap">
          <table className="s-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Turnamen</th>
                <th>Nama Penyelenggara</th>
                <th>Tanggal Pengajuan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s, index) => {
                const locked = same(s.status, "Sedang diedit");
                return (
                  <tr key={s.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      <span className="sub-name">{s.name}</span>
                      {s.tag && <span className="sub-tag">{s.tag}</span>}
                    </td>
                    <td>{s.organizer}</td>
                    <td>
                      <span className="sub-date">
                        {formatDate(s.createdAt)}
                      </span>
                      {WAITING_STATUSES.includes(
                        String(s.status).toLowerCase(),
                      ) && (
                        <small className="sub-wait">
                          {waitingText(s.createdAt)}
                        </small>
                      )}
                    </td>
                    <td>
                      <SubmissionStatusBadge status={s.status} />
                    </td>
                    <td>
                      {locked ? (
                        <span
                          className="s-detail-btn locked"
                          title="Sedang diedit player, belum bisa ditinjau"
                        >
                          <Icon name="lock" size={13} /> Detail
                        </span>
                      ) : (
                        <Link
                          to={`/admin/pengajuan/${s.id}`}
                          className="s-detail-btn"
                        >
                          Detail <Icon name="chevron-right" size={14} />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
              {loading && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && !error && visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    {items.length === 0
                      ? "Belum ada pengajuan."
                      : "Pengajuan tidak ditemukan."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Pagination
        page={safePage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />
    </>
  );
}

export default AdminSubmissions;
