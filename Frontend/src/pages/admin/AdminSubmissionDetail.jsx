import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/icon";
import DecisionModal from "../../components/admin/DecisionModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  getAdminSubmissionDetail,
  approveSubmission,
  rejectSubmission,
  requestRevision,
} from "../../services/adminApi";
import "../../styles/user.css";

const REVISION_OPTIONS = [
  "Informasi turnamen belum lengkap",
  "Informasi sponsor belum lengkap",
  "File KTP bermasalah",
  "Lainnya",
];
const REJECT_OPTIONS = [
  "Informasi turnamen tidak valid",
  "Ditemukan informasi atau dokumen palsu",
  "Pengajuan melanggar ketentuan platform",
  "Lainnya",
];
const STATUS_LABEL = { revisi: "Perlu Revisi", "sedang diedit": "Sedang Diedit", "sedang ditinjau": "Sedang Ditinjau" };
const METHOD_LABEL = { qris: "QRIS", transfer: "Transfer Bank", qris_transfer: "QRIS dan Transfer Bank" };

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const longDate = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v ?? ""));
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : v || "-";
};
const rupiah = (v) =>
  v === null || v === undefined || v === "" ? "-" : `Rp. ${Number(v).toLocaleString("id-ID")}`;

const errorText = (err) => {
  if (err.status === 403) return err.message || "Kamu tidak punya izin untuk pengajuan ini.";
  return err.message;
};

function Field({ label, children }) {
  return (
    <section className="d-card">
      <p className="d-label">{label}</p>
      <div className="d-value">{children ?? "-"}</div>
    </section>
  );
}

// Baris file. url kosong = tidak bisa dilihat (mis. KTP yang privat).
function FileRow({ name, url, note }) {
  return (
    <div className="t-file-row">
      <span className="t-file-icon"><Icon name="file-image" size={26} /></span>
      <span className="t-file-name" title={name}>{name || "-"}</span>
      <div className="t-file-actions">
        <button
          type="button"
          className="t-pill"
          disabled={!url}
          title={url ? "Buka di tab baru" : note}
          onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
        >
          Lihat
        </button>
      </div>
    </div>
  );
}

function AdminSubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // "revision" | "reject"
  const [approving, setApproving] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  // Membuka halaman ini memanggil endpoint yang mengubah status menjadi "Sedang ditinjau"
  useEffect(() => {
    getAdminSubmissionDetail(id)
      .then(setData)
      .catch((err) => setError(errorText(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const back = () => navigate("/admin/pengajuan");
  const reviewing = String(data?.status ?? "").toLowerCase() === "sedang ditinjau";

  const handleApprove = async () => {
    setWorking(true);
    try {
      await approveSubmission(id);
      back();
    } catch (err) {
      setMessage(errorText(err));
      setApproving(false);
    } finally {
      setWorking(false);
    }
  };

  const statusKey = String(data?.status ?? "").toLowerCase();

  return (
    <>
      <button type="button" className="d-back" onClick={back}>
        <Icon name="chevron-left" size={26} /> Kembali
      </button>
      <h1 className="admin-title">Detail Pengajuan Turnamen</h1>

      {loading && <p className="admin-message">Memuat...</p>}
      {error && <p className="admin-message error">{error}</p>}

      {data && (
        <div className="d-wrap">
          <section className="d-card">
            <p className="d-label">Status Pengajuan saat ini</p>
            <div className="d-box">{STATUS_LABEL[statusKey] ?? data.status}</div>
            <p className="d-label">Tanggal Diajukan</p>
            <div className="d-box">{longDate(data.createdAt)}</div>
          </section>

          <section className="d-card d-center">
            <p className="d-label">Poster Turnamen</p>
            {data.posterUrl ? (
              <img className="d-poster" src={data.posterUrl} alt={`Poster ${data.name}`} />
            ) : (
              <p className="admin-message">Poster tidak tersedia.</p>
            )}
          </section>

          <Field label="Nama Turnamen">{data.name}</Field>
          <Field label="Nama Lengkap">{data.organizer}</Field>
          <Field label="Game">{data.game}</Field>
          <Field label="Tipe">{data.type === "offline" ? "Offline" : "Online"}</Field>

          {data.type === "offline" && (
            <section className="d-card">
              <p className="d-label">Lokasi</p>
              <p className="d-row"><span>Provinsi</span> <b>{data.province || "-"}</b></p>
              <p className="d-row"><span>Kota</span> <b>{data.city || "-"}</b></p>
              <div className="d-value">{data.address || "-"}</div>
            </section>
          )}

          <Field label="Slot">{data.slot}</Field>

          <section className="d-card">
            <p className="d-label">Pendaftaran</p>
            <div className="d-value">{longDate(data.closeDate)}</div>
            <p className="d-label">Hari Pertandingan</p>
            <div className="d-value">{longDate(data.matchDate)}</div>
          </section>

          <Field label="Deskripsi">{data.description}</Field>
          <Field label="Total Hadiah">{rupiah(data.prize)}</Field>

          <section className="d-card">
            <p className="d-label">Sumber Pendanaan</p>
            <div className="d-value">{data.funding.length ? data.funding.join(", ") : "-"}</div>
            {data.sponsors.map((s, i) => (
              <div key={i}>
                <p className="d-label">Nama Sponsor</p>
                <div className="d-value">{s.name}</div>
                <p className="d-label">Contact Person Sponsor</p>
                <div className="d-value">{s.contact}</div>
              </div>
            ))}
          </section>

          <Field label="Rincian Pendanaan">{data.fundingDetail}</Field>

          <section className="d-card">
            <p className="d-label">Biaya Pendaftaran</p>
            <div className="d-value">{data.feeType === "berbayar" ? "Berbayar" : "Gratis"}</div>

            {data.feeType === "berbayar" && (
              <>
                <p className="d-label">Nominal Pendaftaran</p>
                <div className="d-value">{rupiah(data.fee)}</div>
                <p className="d-label">Metode Pembayaran</p>
                <div className="d-value">{METHOD_LABEL[data.paymentMethod] ?? data.paymentMethod ?? "-"}</div>

                {["qris", "qris_transfer"].includes(data.paymentMethod) && (
                  <FileRow name={data.qrisName} url={data.qrisUrl} note="File QRIS tidak tersedia" />
                )}
                {["transfer", "qris_transfer"].includes(data.paymentMethod) && (
                  <>
                    <p className="d-label">Nomor Rekening</p>
                    <div className="d-value">{data.account || "-"}</div>
                  </>
                )}
              </>
            )}
          </section>

          <section className="d-card">
            <p className="d-label">KTP</p>
            {/* KTP privat: belum ada endpoint untuk melihatnya, jadi Lihat dinonaktifkan */}
            <FileRow name={data.ktpName} url={data.ktpUrl} note="File KTP tidak tersedia" />
          </section>

          {message && <p className="admin-message error">{message}</p>}

          <div className="d-actions">
            <button className="d-btn reject" disabled={!reviewing} onClick={() => setModal("reject")}>
              Tolak Pengajuan
            </button>
            <button className="d-btn revision" disabled={!reviewing} onClick={() => setModal("revision")}>
              Revisi Pengajuan
            </button>
            <button className="d-btn approve" disabled={!reviewing} onClick={() => setApproving(true)}>
              Setujui Pengajuan
            </button>
          </div>
          {!reviewing && (
            <p className="admin-message">Keputusan hanya bisa diberikan saat status "Sedang Ditinjau".</p>
          )}
        </div>
      )}

      {modal === "revision" && (
        <DecisionModal
          tone="revision"
          title="Konfirmasi alasan Revisi"
          options={REVISION_OPTIONS}
          confirmLabel="Kirim Revisi"
          onSubmit={async (reason) => {
            await requestRevision(id, reason);
            back();
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "reject" && (
        <DecisionModal
          tone="reject"
          title="Konfirmasi Penolakan"
          options={REJECT_OPTIONS}
          confirmLabel="Konfirmasi Penolakan"
          onSubmit={async (reason) => {
            await rejectSubmission(id, reason);
            back();
          }}
          onClose={() => setModal(null)}
        />
      )}

      {approving && (
        <ConfirmDialog
          tone="warning"
          icon="alert"
          title="Setujui Pengajuan?"
          confirmLabel="Setujui"
          loading={working}
          onConfirm={handleApprove}
          onClose={() => setApproving(false)}
        >
          <p>Turnamen akan dibuat dari pengajuan ini.</p>
        </ConfirmDialog>
      )}
    </>
  );
}

export default AdminSubmissionDetail;