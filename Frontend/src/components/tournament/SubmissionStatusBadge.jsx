// Kunci = nilai asli backend (huruf kecil). Label hanya untuk tampilan.
// Tidak ada logika perubahan status di sini.
const STATUS = {
  "menunggu verifikasi": { tone: "gray", label: "Menunggu Verifikasi" },
  "sedang diedit": { tone: "purple", label: "Sedang Diedit" },
  "sedang ditinjau": { tone: "cyan", label: "Sedang Ditinjau" },
  revisi: { tone: "yellow", label: "Perlu Revisi" },
  disetujui: { tone: "green", label: "Disetujui" },
  ditolak: { tone: "red", label: "Ditolak" },
};

function SubmissionStatusBadge({ status }) {
  const key = String(status ?? "")
    .trim()
    .toLowerCase();
  const info = STATUS[key] ?? { tone: "gray", label: status };
  return (
    <span className={`s-badge ${info.tone}`}>
      <i></i> {info.label}
    </span>
  );
}

export default SubmissionStatusBadge;
