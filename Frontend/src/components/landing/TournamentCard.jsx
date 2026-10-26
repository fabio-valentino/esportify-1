import LdIcon from "./LandingIcons";
import Poster from "./Poster";
import { formatDate, formatFee, formatRupiah } from "../../services/landingApi";

// Kartu hanya menerima props. Tidak peduli data dari mock atau backend.
function TournamentCard({ item, onOpen }) {
  const pct = item.slotTotal
    ? Math.min(100, Math.round((item.slotFilled / item.slotTotal) * 100))
    : 0;

  return (
    <article className="ld-card ld-card-click" onClick={() => onOpen(item)}>
      <div className="ld-poster">
        <Poster src={item.poster} alt={item.name} fallbackText={item.name} />
        {item.game && (
          <span className="ld-badge ld-badge-game">{item.game}</span>
        )}
        {item.type && (
          <span className={`ld-badge ld-badge-type ${item.type.toLowerCase()}`}>
            {item.type}
          </span>
        )}
      </div>

      <div className="ld-card-body">
        <p className="ld-meta">
          <LdIcon name="calendar" size={14} />
          {formatDate(item.date)}
        </p>
        <h3 className="ld-card-title" title={item.name}>
          {item.name}
        </h3>

        <div className="ld-stats">
          <div>
            <span>Total Hadiah</span>
            <b className="ld-prize">{formatRupiah(item.prize)}</b>
          </div>
          <div className="ld-right">
            <span>Biaya Pendaftaran</span>
            <b>{formatFee(item.fee)}</b>
          </div>
        </div>

        <div className="ld-slot">
          <div className="ld-slot-row">
            <span>Slot Terisi</span>
            <b>
              {item.slotFilled} / {item.slotTotal}
            </b>
          </div>
          <div
            className="ld-bar"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Slot terisi"
          >
            <i style={{ width: `${pct}%` }} />
          </div>
        </div>

        <button type="button" className="ld-btn ld-btn-s ld-btn-block">
          Lihat Detail
        </button>
      </div>
    </article>
  );
}

export default TournamentCard;
