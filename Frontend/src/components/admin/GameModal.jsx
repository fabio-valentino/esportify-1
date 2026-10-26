import { useEffect, useRef, useState } from "react";
import Icon from "../icon";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // ASSUMPTION: batas belum dikonfirmasi backend

const fieldMap = {
  category_ids: "categoryIds",
  "category_ids.0": "categoryIds",
  nama_game: "name",
};

// game: null = tambah, objek = edit. onSubmit(values) melempar error kalau gagal.
function GameModal({ game, categories, onSubmit, onClose }) {
  const isEdit = Boolean(game);
  const fileRef = useRef(null);

  const [name, setName] = useState(game?.name ?? "");
  const [categoryIds, setCategoryIds] = useState(game?.categoryIds ?? []);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(game?.avatar ?? null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:") && preview !== game?.avatar) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview, game]);

  const clearError = (key) => {
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setMessage("");
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, avatar: "File harus berupa gambar." }));
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Ukuran gambar maksimal 2 MB.",
      }));
      return;
    }
    clearError("avatar");
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const toggleCategory = (id) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
    clearError("categoryIds");
  };

  const validate = () => {
    const result = {};
    if (name.trim().length < 2) result.name = "Nama game minimal 2 karakter.";
    if (categoryIds.length === 0)
      result.categoryIds = "Pilih minimal satu kategori.";
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const result = validate();
    if (Object.keys(result).length > 0) {
      setErrors(result);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), avatarFile, categoryIds });
      onClose();
    } catch (err) {
      const fieldErrors = {};
      Object.entries(err.fields || {}).forEach(([key, value]) => {
        fieldErrors[fieldMap[key] || key] = Array.isArray(value)
          ? value[0]
          : value;
      });
      setErrors(fieldErrors);
      setMessage(
        Object.keys(fieldErrors).length > 0
          ? "Periksa kembali data yang kamu isi."
          : err.message || "Gagal menyimpan game.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onMouseDown={onClose}>
      <div
        className="admin-modal game-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-head">
          <h2 id="game-title">{isEdit ? "Edit Game" : "Tambah Game"}</h2>
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
            <label htmlFor="game-name">Nama Game</label>
            <input
              id="game-name"
              type="text"
              placeholder="Masukkan nama game"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
              className={errors.name ? "has-error" : ""}
              autoComplete="off"
              autoFocus
            />
            {errors.name && <p className="admin-form-error">{errors.name}</p>}
          </div>

          <div className="admin-form-field">
            <label>Avatar</label>
            <div className="game-avatar-row">
              <button
                type="button"
                className="game-upload"
                onClick={() => fileRef.current.click()}
                aria-label="Unggah avatar"
              >
                {preview ? (
                  <img src={preview} alt="Pratinjau avatar" />
                ) : (
                  <>
                    <Icon name="upload" size={20} />
                    <span className="game-upload-label">Unggah</span>
                  </>
                )}
              </button>
              <div className="game-avatar-hint">
                <button
                  type="button"
                  className="game-avatar-btn"
                  onClick={() => fileRef.current.click()}
                >
                  {preview ? "Ganti gambar" : "Pilih gambar"}
                </button>
                <span>Format gambar, maksimal 2 MB</span>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFile}
            />
            {errors.avatar && (
              <p className="admin-form-error">{errors.avatar}</p>
            )}
          </div>

          <div className="admin-form-field">
            <label>Kategori</label>
            <div className="game-cat-grid">
              {categories.map((c) => {
                const checked = categoryIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`game-cat-option ${checked ? "checked" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(c.id)}
                    />
                    <span>{c.name}</span>
                  </label>
                );
              })}
            </div>
            {errors.categoryIds && (
              <p className="admin-form-error">{errors.categoryIds}</p>
            )}
          </div>

          {message && <p className="admin-form-error">{message}</p>}

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
                  : "Tambah Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GameModal;
