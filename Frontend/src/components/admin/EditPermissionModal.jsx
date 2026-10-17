import { useEffect, useState } from "react";
import Icon from "../icon";
import { getAllPermissions } from "../../services/adminApi";
import {
  formatPermission,
  RESTRICTED_PERMISSIONS,
} from "../../utils/permission";

// perms: { direct, viaRoles } milik user ini
// onSave(permissions) melempar error kalau gagal. Modal menampilkan errornya.
function EditPermissionModal({ user, perms, onSave, onClose }) {
  const [allPermissions, setAllPermissions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listFailed, setListFailed] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Izin tinggi yang sudah dimiliki langsung dipertahankan saat simpan,
  // karena syncPermissions akan menghapus apa pun yang tidak dikirim.
  const preserved = perms.direct.filter((p) =>
    RESTRICTED_PERMISSIONS.includes(p),
  );
  const [selected, setSelected] = useState(
    perms.direct.filter((p) => !RESTRICTED_PERMISSIONS.includes(p)),
  );

  useEffect(() => {
    getAllPermissions()
      .then(setAllPermissions)
      .catch((err) => {
        setListFailed(true);
        setMessage(err.message || "Daftar permission gagal dimuat.");
      })
      .finally(() => setLoadingList(false));
  }, []);

  // Yang bisa diubah: semua izin kecuali yang sudah dari role dan izin tinggi.

  // Izin langsung yang sudah dimiliki selalu tampil.
  const editable = [...new Set([...allPermissions, ...selected])].filter(
    (p) => !perms.viaRoles.includes(p) && !RESTRICTED_PERMISSIONS.includes(p),
  );

  const toggle = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    );
    setMessage("");
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await onSave([...new Set([...selected, ...preserved])]);
      onClose();
    } catch (err) {
      setMessage(err.message || "Gagal menyimpan permission.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onMouseDown={onClose}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-perm-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-head">
          <h2 id="edit-perm-title">Edit Permission: {user.username}</h2>
          <button
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <p className="admin-warning">
          Izin dari role tidak bisa dicabut di sini. Yang diubah hanya izin
          tambahan khusus untuk <strong>{user.username}</strong>.
        </p>

        {perms.viaRoles.length > 0 && (
          <>
            <p className="admin-subtitle">Dari role (terkunci)</p>
            <div className="admin-check-list">
              {perms.viaRoles.map((name) => (
                <label key={name} className="admin-check locked">
                  <input type="checkbox" checked disabled readOnly />
                  {formatPermission(name)}
                </label>
              ))}
            </div>
          </>
        )}

        <p className="admin-subtitle">Tambahan khusus user</p>
        {loadingList && (
          <p className="admin-message">Memuat daftar permission...</p>
        )}
        <div className="admin-check-list">
          {editable.map((name) => (
            <label key={name} className="admin-check">
              <input
                type="checkbox"
                checked={selected.includes(name)}
                onChange={() => toggle(name)}
              />
              {formatPermission(name)}
            </label>
          ))}
          {!loadingList && !listFailed && editable.length === 0 && (
            <span className="admin-message">
              Tidak ada izin tambahan yang tersedia.
            </span>
          )}
        </div>

        {message && <p className="admin-form-error">{message}</p>}

        <div className="admin-modal-actions">
          <button type="button" className="admin-cancel-btn" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="admin-save-btn"
            onClick={handleSave}
            disabled={saving || loadingList || listFailed}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPermissionModal;
