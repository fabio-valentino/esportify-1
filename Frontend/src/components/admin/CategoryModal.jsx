import { useState } from "react";
import Icon from "../icon";

// category: null = tambah, objek = edit. onSubmit(name) melempar error kalau gagal.
function CategoryModal({ category, onSubmit, onClose }) {
  const [name, setName] = useState(category?.name ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const value = name.trim();
    if (value.length < 2) {
      setError("Nama kategori minimal 2 karakter.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(value);
      onClose();
    } catch (err) {
      const fe = err.fields?.name ?? err.fields?.nama_kategori;
      setError(
        (Array.isArray(fe) ? fe[0] : fe) ||
          err.message ||
          "Gagal menyimpan kategori.",
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
        aria-labelledby="cat-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-head">
          <h2 id="cat-title">
            {category ? "Edit Kategori Game" : "Tambah Kategori Game"}
          </h2>
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
            <label htmlFor="cat-name">Nama Kategori</label>
            <input
              id="cat-name"
              type="text"
              placeholder="Masukkan nama kategori"
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
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;
