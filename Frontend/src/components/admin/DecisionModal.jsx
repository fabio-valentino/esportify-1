import { useState } from "react";
import Icon from "../icon";

// tone: "revision" | "reject". onSubmit(alasan) melempar error kalau gagal.
function DecisionModal({
  tone,
  title,
  options,
  confirmLabel,
  onSubmit,
  onClose,
}) {
  const [choice, setChoice] = useState(options[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isOther = choice === "Lainnya";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const text = note.trim();
    if (isOther && text.length < 5) {
      setError("Isi catatan untuk pengaju (minimal 5 karakter).");
      return;
    }
    // Backend hanya punya satu field alasan_admin
    const reason = isOther
      ? text
      : text
        ? `${choice}. Catatan: ${text}`
        : choice;

    setLoading(true);
    try {
      await onSubmit(reason);
      onClose();
    } catch (err) {
      const fe = err.fields?.alasan_admin;
      setError(
        (Array.isArray(fe) ? fe[0] : fe) ||
          err.message ||
          "Gagal mengirim keputusan.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onMouseDown={onClose}>
      <form
        className="admin-modal decision-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-title"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="decision-head">
          <span className={`decision-icon ${tone}`}>
            <Icon name={tone === "revision" ? "edit" : "alert"} size={22} />
          </span>
          <div>
            <h2 id="decision-title">{title}</h2>
            <p>Pilih alasan yang sesuai dengan hasil verifikasi.</p>
          </div>
        </div>

        <div className="decision-options">
          {options.map((o) => (
            <label key={o} className="t-radio">
              <input
                type="radio"
                name="reason"
                checked={choice === o}
                onChange={() => {
                  setChoice(o);
                  setError("");
                }}
              />
              {o}
            </label>
          ))}
        </div>

        <label className="decision-label" htmlFor="decision-note">
          Catatan untuk pengaju
        </label>
        <textarea
          id="decision-note"
          className={`t-box ${error ? "has-error" : ""}`}
          rows={3}
          placeholder="Jelaskan alasan keputusan agar pengaju memahami hasil verifikasi..."
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setError("");
          }}
        />
        <p className="t-upload-hint decision-hint">
          Alasan ini akan disimpan dan ditampilkan kepada pengaju.
        </p>
        {error && <p className="admin-form-error">{error}</p>}

        <div className="decision-actions">
          <button type="button" className="decision-cancel" onClick={onClose}>
            Batal
          </button>
          <button
            type="submit"
            className={`decision-confirm ${tone}`}
            disabled={loading}
          >
            {loading ? "Mengirim..." : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DecisionModal;
