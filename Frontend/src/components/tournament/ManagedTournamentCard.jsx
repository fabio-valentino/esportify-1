import { Link } from "react-router-dom";
import Icon from "../icon";

const STATUS_LABEL = {
  pendaftaran: "Pendaftaran",
  berlangsung: "Berlangsung",
  selesai: "Selesai",
};

function ManagedTournamentCard({ tournament: t }) {
  return (
    <article className="t-card">
      <div className="t-card-head">
        <div>
          <h3>{t.name}</h3>
          <p>{t.game}</p>
        </div>
        <span className={`t-status ${t.status}`}>
          <i></i> {STATUS_LABEL[t.status] ?? t.status}
        </span>
      </div>

      <dl className="t-stats">
        <div>
          <dt>Jadwal pendaftaran ditutup</dt>
          <dd>{t.registrationCloses}</dd>
        </div>
        <div>
          <dt>Jadwal tanding</dt>
          <dd>{t.matchDate}</dd>
        </div>
        <div>
          <dt>Tipe</dt>
          <dd>{t.type}</dd>
        </div>
        <div>
          <dt>Peserta terdaftar</dt>
          <dd>
            {t.registered}/{t.capacity} tim
          </dd>
        </div>
        <div>
          <dt>Perlu diverifikasi</dt>
          <dd>{t.pendingVerification} Pendaftar</dd>
        </div>
      </dl>

      <div className="t-card-actions">
        <Link to={`/turnamen/${t.id}/kelola`} className="t-btn-primary">
          <Icon name="manage" size={18} /> Kelola Turnamen
        </Link>
        <Link to={`/turnamen/${t.id}`} className="t-btn-outline">
          Detail
        </Link>
      </div>
    </article>
  );
}

export default ManagedTournamentCard;
