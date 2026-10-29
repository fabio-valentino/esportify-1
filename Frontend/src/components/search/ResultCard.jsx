import { useState } from "react";
import Icon from "../icon";
import {
  formatDate,
  formatFee,
  formatRupiah,
} from "../../services/tournamentSearchApi";

// onOpen kosong = tombol dinonaktifkan.
function ResultCard({ item, onOpen }) {
  const [imgFailed, setImgFailed] = useState(false);

  // Slot terisi belum ada di backend (null). Selama itu, tampilkan total slot saja.
  const hasSlotFilled = item.slotFilled != null;
  const full =
    hasSlotFilled && item.slotTotal > 0 && item.slotFilled >= item.slotTotal;
  const percent =
    hasSlotFilled && item.slotTotal > 0
      ? Math.min(100, Math.round((item.slotFilled / item.slotTotal) * 100))
      : 0;

  // Hadiah dan biaya yang tidak diketahui (null) disembunyikan, bukan ditulis Rp0 / Gratis
  const hasMoney = item.prize != null || item.fee != null;

  const statusLabel =
    item.status === "berlangsung"
      ? "Sedang berlangsung"
      : item.registrationOpen === false
        ? "Pendaftaran ditutup"
        : "";

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
        {statusLabel && (
          <span
            className={`ct-tag ct-tag-status ${item.status === "berlangsung" ? "live" : ""}`}
          >
            {statusLabel}
          </span>
        )}
      </div>

      <div className="ct-meta">
        <Icon name="calendar" size={16} />
        <span>{formatDate(item.date)}</span>
      </div>

      <h3 className="ct-title">{item.name}</h3>

      {/* Lokasi hanya ada untuk turnamen offline. Online sudah ditandai tag Online. */}
      {item.location && (
        <div className="ct-meta">
          <span>{item.location}</span>
        </div>
      )}

      {hasMoney && (
        <div className="ct-stats">
          {item.prize != null && (
            <div>
              <span>Total Hadiah</span>
              <b className="ct-prize">{formatRupiah(item.prize)}</b>
            </div>
          )}
          {item.fee != null && (
            <div className="ct-right">
              <span>Biaya Pendaftaran</span>
              <b>{formatFee(item.fee)}</b>
            </div>
          )}
        </div>
      )}

      {item.slotTotal > 0 && (
        <div>
          <div className="ct-slot">
            <span>{hasSlotFilled ? "Slot Terisi" : "Total Slot"}</span>
            <b>
              {hasSlotFilled
                ? `${item.slotFilled} / ${item.slotTotal}${full ? " (Penuh)" : ""}`
                : item.slotTotal}
            </b>
          </div>
          {hasSlotFilled && (
            <div className="ct-bar" aria-hidden="true">
              <i style={{ width: `${percent}%` }} />
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="ct-btn ct-btn-s ct-btn-block"
        disabled={!onOpen}
        onClick={() => onOpen?.(item)}
      >
        Lihat Detail <Icon name="chevron-right" size={14} />
      </button>
    </article>
  );
}

export default ResultCard;
