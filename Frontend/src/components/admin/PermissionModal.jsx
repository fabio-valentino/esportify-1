import { useState } from "react";
import Icon from "../icon";

// Huruf kecil, angka, underscore, diawali huruf. Contoh: lihat_data_user
// Ini hanya kenyamanan. Aturan yang berlaku tetap dari backend.
const namePattern = /^[a-z][a-z0-9_]*$/;

// permission: null = tambah, objek = edit. onSubmit(name) melempar error kalau gagal.
function PermissionModal({ permission, onSubmit, onClose }) {
  const isEdit = Boolean(permission);
  const [name, setName] = useState(permission?.name ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const value = name.trim();
    if (value.length < 3) {
      setError("Nama permission minimal 3 karakter.");
      return;
    }
    if (!namePattern.test(value)) {
      setError(
        "Gunakan huruf kecil, angka, dan underscore, diawali huruf. Contoh: kelola_turnamen",
      );
      return;
    }

    setLoading(true);
    try {
      await onSubmit(value);
      onClose();
    } catch (err) {
      const fe = err.fields?.name;
      setError(
        (Array.isArray(fe) ? fe[0] : fe) ||
          err.message ||
          "Gagal menyimpan permission.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onMouseDown={onClose}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="perm-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-head">
          <h2 id="perm-title">
            {isEdit ? "Edit Permission" : "Tambah Permission"}
          </h2>
          <button
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {isEdit && (
          <p className="admin-warning">
            Mengganti nama permission dapat memutus route backend yang masih
            memakai nama lama.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-form-field">
            <label htmlFor="perm-name">Nama permission</label>
            <input
              id="perm-name"
              type="text"
              placeholder="kelola_turnamen"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className={error ? "has-error" : ""}
              autoComplete="off"
              autoFocus
            />
            {error && <p className="admin-form-error">{error}</p>}
          </div>

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-cancel-btn"
              onClick={onClose}
            >
              Batal
            </button>
            <button type="submit" className="admin-save-btn" disabled={loading}>
              {loading
                ? isEdit
                  ? "Menyimpan..."
                  : "Menambahkan..."
                : isEdit
                  ? "Simpan"
                  : "Tambah Permission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PermissionModal;
