import { useState } from "react";
import Icon from "../icon";
import {
  formatDate,
  formatFee,
  formatRupiah,
} from "../../services/tournamentSearchApi";

// onOpen kosong = halaman detail belum ada, tombol dinonaktifkan.
function ResultCard({ item, onOpen }) {
  const [imgFailed, setImgFailed] = useState(false);
  const full = item.slotTotal > 0 && item.slotFilled >= item.slotTotal;
  const percent =
    item.slotTotal > 0
      ? Math.min(100, Math.round((item.slotFilled / item.slotTotal) * 100))
      : 0;

  return (
    <article className="ct-card">
      <div className="ct-poster">
        {item.poster && !imgFailed ? (
          <img
            src={item.poster}
            alt={item.name}
            className="ct-poster-img"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="ct-poster-fb">
            <Icon name="trophy" size={64} />
          </div>
        )}
        {item.game && <span className="ct-tag ct-tag-game">{item.game}</span>}
        {item.type && (
          <span
            className={`ct-tag ct-tag-type ${item.type === "Online" ? "online" : ""}`}
          >
            {item.type}
          </span>
        )}
      </div>

      <div className="ct-meta">
        <Icon name="calendar" size={16} />
        <span>{formatDate(item.date)}</span>
      </div>

      <h3 className="ct-title">{item.name}</h3>

      <div className="ct-stats">
        <div>
          <span>Total Hadiah</span>
          <b className="ct-prize">{formatRupiah(item.prize)}</b>
        </div>
        <div className="ct-right">
          <span>Biaya Pendaftaran</span>
          <b>{formatFee(item.fee)}</b>
        </div>
      </div>

      <div>
        <div className="ct-slot">
          <span>Slot Terisi</span>
          <b>
            {item.slotFilled} / {item.slotTotal}
            {full ? " (Penuh)" : ""}
          </b>
        </div>
        <div className="ct-bar" aria-hidden="true">
          <i style={{ width: `${percent}%` }} />
        </div>
      </div>

      <button
        type="button"
        className="ct-btn ct-btn-s ct-btn-block"
        disabled={!onOpen}
        title={onOpen ? undefined : "Halaman detail belum tersedia"}
        onClick={() => onOpen?.(item)}
      >
        Lihat Detail <Icon name="chevron-right" size={14} />
      </button>
    </article>
  );
}

export default ResultCard;
