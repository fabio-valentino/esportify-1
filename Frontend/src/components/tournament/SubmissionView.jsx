import FileRow from "./FileRow";
import { longDate, rupiah } from "../../utils/date";

const METHOD_LABEL = {
  qris: "QRIS",
  transfer: "Transfer Bank",
  qris_transfer: "QRIS dan Transfer Bank",
};
const FUNDING_LABEL = {
  sponsor: "Sponsor",
  dana_pribadi: "Dana Pribadi",
  biaya_peserta: "Biaya Pendaftaran Peserta",
};

function Field({ label, children }) {
  return (
    <section className="d-card">
      <p className="d-label">{label}</p>
      <div className="d-value">{children || "-"}</div>
    </section>
  );
}

// Tampilan baca isi pengajuan. d = hasil getSubmissionDetail.
function SubmissionView({ d }) {
  return (
    <>
      <section className="d-card d-center">
        <p className="d-label">Poster Turnamen</p>
        {d.posterUrl ? (
          <img
            className="d-poster"
            src={d.posterUrl}
            alt={`Poster ${d.name}`}
          />
        ) : (
          <p className="admin-message">Poster tidak tersedia.</p>
        )}
      </section>

      <Field label="Nama Turnamen">{d.name}</Field>
      <Field label="Nama Lengkap">{d.organizer}</Field>
      <Field label="Game">{d.gameName}</Field>
      <Field label="Tipe">{d.type === "offline" ? "Offline" : "Online"}</Field>

      {d.type === "offline" && (
        <section className="d-card">
          <p className="d-label">Lokasi</p>
          <p className="d-row">
            <span>Provinsi</span> <b>{d.provinceName || "-"}</b>
          </p>
          <p className="d-row">
            <span>Kota</span> <b>{d.cityName || "-"}</b>
          </p>
          <div className="d-value">{d.address || "-"}</div>
        </section>
      )}

      <Field label="Slot">{d.slot}</Field>

      <section className="d-card">
        <p className="d-label">Pendaftaran</p>
        <div className="d-value">{longDate(d.closeDate)}</div>
        <p className="d-label">Hari Pertandingan</p>
        <div className="d-value">{longDate(d.matchDate)}</div>
      </section>

      <Field label="Deskripsi">{d.description}</Field>
      <Field label="Total Hadiah">{rupiah(d.prize)}</Field>

      <section className="d-card">
        <p className="d-label">Sumber Pendanaan</p>
        <div className="d-value">
          {d.funding.map((k) => FUNDING_LABEL[k]).join(", ") || "-"}
        </div>
        {d.funding.includes("sponsor") && (
          <>
            <p className="d-label">Nama Sponsor</p>
            <div className="d-value">{d.sponsorName || "-"}</div>
            <p className="d-label">Email / Nomor Telepon</p>
            <div className="d-value">{d.sponsorContact || "-"}</div>
          </>
        )}
      </section>

      <Field label="Rincian Pendanaan">{d.fundingDetail}</Field>

      <section className="d-card">
        <p className="d-label">Biaya Pendaftaran</p>
        <div className="d-value">
          {d.feeType === "berbayar" ? "Berbayar" : "Gratis"}
        </div>
        {d.feeType === "berbayar" && (
          <>
            <p className="d-label">Nominal Pendaftaran</p>
            <div className="d-value">{rupiah(d.fee)}</div>
            <p className="d-label">Metode Pembayaran</p>
            <div className="d-value">
              {METHOD_LABEL[d.paymentMethod] ?? "-"}
            </div>
            {["qris", "qris_transfer"].includes(d.paymentMethod) && (
              <FileRow
                name={d.qrisName || "QRIS"}
                url={d.qrisUrl}
                note="File QRIS tidak tersedia"
              />
            )}
            {["transfer", "qris_transfer"].includes(d.paymentMethod) && (
              <>
                <p className="d-label">Nomor Rekening</p>
                <div className="d-value">{d.account || "-"}</div>
              </>
            )}
          </>
        )}
      </section>

      <section className="d-card">
        <p className="d-label">KTP</p>
        {/* KTP disembunyikan backend dari response player */}
        <FileRow
          name="KTP sudah diunggah"
          url={null}
          note="KTP bersifat privat dan tidak ditampilkan"
        />
      </section>
    </>
  );
}

export default SubmissionView;
