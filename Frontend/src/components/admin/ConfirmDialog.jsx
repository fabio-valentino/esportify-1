import Icon from "../icon";

// tone: "danger" (merah) atau "warning" (kuning)
function ConfirmDialog({
  tone,
  icon,
  title,
  confirmLabel,
  loading,
  onConfirm,
  onClose,
  children,
}) {
  return (
    <div className="admin-modal-backdrop" onMouseDown={onClose}>
      <div
        className="admin-modal admin-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span className={`admin-confirm-icon ${tone}`}>
          <Icon name={icon} size={22} />
        </span>
        <h2 id="confirm-title">{title}</h2>
        <div className="admin-confirm-text">{children}</div>

        <div className="admin-modal-actions">
          <button type="button" className="admin-cancel-btn" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className={
              tone === "danger" ? "admin-danger-btn" : "admin-warn-btn"
            }
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
