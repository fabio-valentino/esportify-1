import { useEffect, useState } from "react";
import Icon from "../icon";
import { getAllPermissions } from "../../services/adminApi";
import { formatPermission } from "../../utils/permission";

// role: null = tambah, objek = edit. onSubmit({ name, permissions }) melempar error kalau gagal.
function RoleModal({ role, onSubmit, onClose }) {
  const isEdit = Boolean(role);
  const [name, setName] = useState(role?.name ?? "");
  const [selected, setSelected] = useState(role?.permissions ?? []);
  const [all, setAll] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listFailed, setListFailed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllPermissions()
      .then(setAll)
      .catch(() => setListFailed(true))
      .finally(() => setLoadingList(false));
  }, []);

  // Permission yang sudah dimiliki role selalu tampil, walau daftar gagal dimuat
  const options = [...new Set([...all, ...selected])];

  const toggle = (perm) => {
    setSelected((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const value = name.trim();
    if (value.length < 3) {
      setError("Nama role minimal 3 karakter.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name: value, permissions: selected });
      onClose();
    } catch (err) {
      const fe = err.fields?.name;
      setError(
        (Array.isArray(fe) ? fe[0] : fe) ||
          err.message ||
          "Gagal menyimpan role.",
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
        aria-labelledby="role-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-head">
          <h2 id="role-title">{isEdit ? "Edit Role" : "Tambah Role"}</h2>
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
            <label htmlFor="role-name">Nama role</label>
            <input
              id="role-name"
              type="text"
              placeholder="Penyelenggara"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className={error ? "has-error" : ""}
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="admin-form-field">
            <label>Permissions</label>
            {loadingList && (
              <p className="admin-message">Memuat daftar permission...</p>
            )}
            {listFailed && (
              <p className="admin-form-error">
                Daftar permission gagal dimuat (butuh izin kelola_permission).
                Permission tidak bisa diubah.
              </p>
            )}
            <div className="admin-check-list">
              {options.map((perm) => (
                <label key={perm} className="admin-check">
                  <input
                    type="checkbox"
                    checked={selected.includes(perm)}
                    onChange={() => toggle(perm)}
                    disabled={listFailed}
                  />
                  {formatPermission(perm)}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="admin-form-error">{error}</p>}

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-cancel-btn"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="admin-save-btn"
              disabled={loading || loadingList}
            >
              {loading
                ? isEdit
                  ? "Menyimpan..."
                  : "Menambahkan..."
                : isEdit
                  ? "Simpan"
                  : "Tambah Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RoleModal;
