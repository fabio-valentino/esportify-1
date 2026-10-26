import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Icon from "../../components/icon";
import Avatar from "../../components/user/Avatar";
import PasswordModal from "../../components/user/PasswordModal";
import { useAuth } from "../../context/AuthContext";
import { SKIP_AUTH } from "../../config/env";
import {
  getAdminProfile,
  uploadAdminAvatar,
  updateAdminUsername,
  changeAdminPassword,
} from "../../services/profileApi";
import "../../styles/user.css"; // style profil dipakai ulang

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const readError = (err) => {
  const fe = err?.fields?.username;
  return (Array.isArray(fe) ? fe[0] : fe) || err?.message || "Gagal menyimpan.";
};

function AdminProfile() {
  // Data profil dimiliki AdminLayout supaya navbar ikut berubah
  const { adminProfile: profile, setAdminProfile: setProfile } =
    useOutletContext();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  // Mode halaman: false = hanya lihat (default), true = form bisa diedit
  const [isEditing, setIsEditing] = useState(false);

  // ---------- Avatar (logika sama seperti sebelumnya) ----------
  const [uploading, setUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState({ text: "", type: "" });

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarMsg({ text: "File harus berupa gambar.", type: "error" });
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarMsg({ text: "Ukuran gambar maksimal 2 MB.", type: "error" });
      return;
    }
    setUploading(true);
    setAvatarMsg({ text: "", type: "" });
    try {
      const localUrl = await uploadAdminAvatar(file);
      setProfile(
        localUrl ? { ...profile, avatar: localUrl } : await getAdminProfile(),
      );
      setAvatarMsg({ text: "Foto profil diperbarui.", type: "success" });
    } catch (err) {
      const fe = err.fields?.avatar;
      setAvatarMsg({
        text:
          (Array.isArray(fe) ? fe[0] : fe) ||
          err.message ||
          "Gagal mengunggah foto.",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  // ---------- Form informasi pribadi (admin hanya punya username) ----------
  const savedUsername = profile?.username ?? "";

  const [username, setUsername] = useState(savedUsername);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [pwOpen, setPwOpen] = useState(false);

  // Input terkunci saat mode lihat atau saat sedang menyimpan
  const locked = !isEditing || saving;

  const dirty = username.trim() !== savedUsername;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // Klik "Edit": mulai dari data yang tersimpan
  const handleEdit = () => {
    setUsername(savedUsername);
    setError("");
    setIsEditing(true);
  };

  // Klik "Batal": buang perubahan dan kembali ke mode lihat
  const handleReset = () => {
    setUsername(savedUsername);
    setError("");
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isEditing || !dirty || saving) return;

    const v = username.trim();
    if (v.length < 3) {
      setError("Username minimal 3 karakter.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await updateAdminUsername(v);
      setProfile({ ...profile, username: v }); // navbar ikut berubah
      if (!SKIP_AUTH) await refreshUser().catch(() => {});
      setToast("Profil berhasil diperbarui");
      setIsEditing(false);
    } catch (err) {
      setError(readError(err)); // tetap di mode edit supaya error terlihat
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <p className="admin-message">Memuat...</p>;

  return (
    <div className="pr-page">
      <button type="button" className="pr-back" onClick={() => navigate(-1)}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Kembali
      </button>

      <h1 className="pr-title">Profil Admin</h1>
      <p className="pr-sub">Kelola informasi akun admin kamu.</p>

      <div className="pr-grid">
        {/* ===== Kolom kiri: avatar ===== */}
        <section className="pr-card pr-side">
          <div className="pr-ring">
            <Avatar src={profile.avatar} name={profile.username} size={128} />

            {/* Ganti foto hanya bisa saat mode edit */}
            {isEditing && (
              <button
                type="button"
                className="pr-camera"
                onClick={() => fileRef.current.click()}
                disabled={uploading}
                aria-label="Ganti foto profil"
              >
                <Icon name="camera" size={18} />
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatar}
            />
          </div>

          <h2 className="pr-name">{profile.username}</h2>
          <p className="pr-bio">Admin Platform</p>

          {uploading && <p className="pr-msg">Mengunggah...</p>}
          {avatarMsg.text && (
            <p className={`pr-msg ${avatarMsg.type}`}>{avatarMsg.text}</p>
          )}

          {isEditing && <p className="pr-hint">Gambar maksimal 2 MB.</p>}
        </section>

        {/* ===== Kolom kanan ===== */}
        <div className="pr-col">
          <form
            className={`pr-card ${isEditing ? "" : "pr-view"}`}
            onSubmit={handleSave}
            noValidate
          >
            <div className="pr-head">
              {/* Baris judul: judul di kiri, tombol Edit/Batal di pojok kanan */}
              <div className="pr-head-top">
                <h3>Informasi pribadi</h3>

                {/* Satu tombol yang berganti: Edit (pensil) <-> Batal (silang) */}
                <button
                  type="button"
                  className="pr-btn pr-btn-s pr-btn-toggle"
                  onClick={isEditing ? handleReset : handleEdit}
                  disabled={saving}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {isEditing ? (
                      <>
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </>
                    ) : (
                      <>
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </>
                    )}
                  </svg>
                  {isEditing ? "Batal" : "Edit"}
                </button>
              </div>

              <p>
                {isEditing
                  ? "Perubahan tersimpan setelah kamu menekan Simpan perubahan."
                  : "Informasi profil yang tampil di akun kamu."}
              </p>
            </div>

            <div className="pr-body">
              <div className="pr-field">
                <label className="pr-label" htmlFor="pr-username">
                  Username
                </label>
                <input
                  id="pr-username"
                  className={`pr-input ${error ? "err" : ""}`}
                  value={isEditing ? username : savedUsername}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  disabled={locked}
                />
                {error && <p className="pr-err">{error}</p>}
              </div>
            </div>

            {isEditing && (
              <div className="pr-foot">
                <span className={`pr-dirty ${dirty ? "on" : ""}`}>
                  <i />
                  {dirty
                    ? "Ada perubahan yang belum disimpan"
                    : "Belum ada perubahan"}
                </span>
                <button
                  type="submit"
                  className="pr-btn pr-btn-p"
                  disabled={!dirty || saving}
                >
                  {saving ? "Menyimpan..." : "Simpan perubahan"}
                </button>
              </div>
            )}
          </form>

          {/* Email read-only permanen (tidak ada endpoint ubah email) */}
          <section className="pr-card">
            <div className="pr-head">
              <h3>Akun</h3>
              <p>Email dan password yang kamu pakai untuk masuk.</p>
            </div>

            <div className="pr-row">
              <div className="pr-sec-ic blue" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </div>
              <div className="pr-sec-tx">
                <b>Email</b>
                <span className="pr-email">{profile.email}</span>
              </div>
              <span className="pr-badge">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </span>
            </div>

            <div className="pr-row">
              <div className="pr-sec-ic" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </div>
              <div className="pr-sec-tx">
                <b>Password</b>
                <span>••••••••</span>
              </div>
              <button
                type="button"
                className="pr-btn pr-btn-s"
                onClick={() => setPwOpen(true)}
              >
                Ubah password
              </button>
            </div>
          </section>

          {/* changeAdminPassword dipanggil dengan kontrak yang sama:
              { currentPassword, password, confirmPassword } */}
          {pwOpen && (
            <PasswordModal
              onSubmit={changeAdminPassword}
              onClose={() => setPwOpen(false)}
              onSuccess={() => setToast("Password berhasil diubah")}
            />
          )}
        </div>
      </div>

      {toast && (
        <div className="pr-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

export default AdminProfile;
