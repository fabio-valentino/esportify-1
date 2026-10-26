// Warna badge hanya mengikuti nama status dari backend. Tidak ada logika perubahan status di sini.
const TONES = {
  "menunggu verifikasi": "cyan",
  "sedang ditinjau": "blue",
  "perlu revisi": "yellow",
  disetujui: "green",
  ditolak: "red",
  "sedang diedit": "gray",
};

function SubmissionStatusBadge({ status }) {
  const tone =
    TONES[
      String(status ?? "")
        .trim()
        .toLowerCase()
    ] ?? "gray";
  return <span className={`s-badge ${tone}`}>{status}</span>;
}

export default SubmissionStatusBadge;
