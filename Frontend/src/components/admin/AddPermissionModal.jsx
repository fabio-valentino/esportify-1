import { useState } from "react";
import Icon from "../icon";

// Huruf kecil, angka, underscore, diawali huruf. Contoh: lihat_data_user
// Ini hanya kenyamanan. Aturan yang berlaku tetap dari backend.
const namePattern = /^[a-z][a-z0-9_]*$/;

// onSubmit(name) melempar error kalau gagal. Modal menampilkan errornya.
function AddPermissionModal({ onSubmit, onClose }) {
  const [name, setName] = useState("");
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
      setError("Gunakan underscore tanpa spasi. Contoh: kelola_turnamen");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(value);
      onClose();
    } catch (err) {
      // Error validasi per kolom (422) diutamakan
      const fieldError = err.fields?.name;
      setError(
        (Array.isArray(fieldError) ? fieldError[0] : fieldError) ||
          err.message ||
          "Gagal menambah permission.",
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
        aria-labelledby="add-perm-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-head">
          <h2 id="add-perm-title">Tambah Permission</h2>
          <button
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-form-field">
            <label htmlFor="perm-name">Nama permission</label>
            <input
              id="perm-name"
              type="text"
              placeholder="masukkan nama permission"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className={error ? "has-error" : ""}
              autoComplete="off"
              autoFocus
            />
            <p className="admin-hint">
              Permission baru belum diberikan ke siapa pun. Atur lewat tombol
              edit di tabel.
            </p>
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
              {loading ? "Menyimpan..." : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPermissionModal;
