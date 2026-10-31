import Icon from "../icon";
import {
  priorityLimitText,
  waitingSince,
  waitingText,
} from "../../utils/priority";

function PriorityPopup({ items, now, onGo }) {
  const shown = items.slice(0, 5);
  return (
    <div className="admin-modal-backdrop">
      <div
        className="admin-modal pri-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pri-title"
      >
        <span className="pri-icon">
          <Icon name="clock" size={26} />
        </span>
        <p className="pri-kicker">TINDAKAN DIPERLUKAN</p>
        <h2 id="pri-title">
          {items.length} Pengajuan Perlu Segera Diverifikasi
        </h2>
        <p className="pri-text">
          Ada pengajuan yang belum diverifikasi lebih dari {priorityLimitText()}
          .
        </p>

        <ul className="pri-list">
          {shown.map((s) => (
            <li key={s.id}>
              <span>
                <i></i> {s.name} · {s.organizer}
              </span>
              <b>{waitingText(waitingSince(s), now)}</b>
            </li>
          ))}
          {items.length > shown.length && (
            <li className="more">dan {items.length - shown.length} lainnya</li>
          )}
        </ul>

        <button type="button" className="sub-go pri-go" onClick={onGo}>
          Tinjau Pengajuan Sekarang <Icon name="arrow-right" size={16} />
        </button>
      </div>
    </div>
  );
}

export default PriorityPopup;
