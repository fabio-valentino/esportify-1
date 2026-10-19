import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Icon from "../components/icon";
import Avatar from "../components/user/Avatar";
import { useAuth } from "../context/AuthContext";
import { SKIP_AUTH } from "../config/env";
import {
  getProfile,
  updateUsername,
  changePassword,
  uploadAvatar,
} from "../services/profileApi";

// ASSUMPTION: batas upload belum dikonfirmasi backend
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const emptyPasswords = {
  currentPassword: "",
  password: "",
  confirmPassword: "",
};

// Nama field backend -> nama field di form
const fieldMap = {
  current_password: "currentPassword",
  password_confirmation: "confirmPassword",
};

// ApiError.fields (format Laravel) -> { namaField: "pesan pertama" }
const toFieldErrors = (fields = {}) => {
  const result = {};
  Object.entries(fields).forEach(([key, value]) => {
    result[fieldMap[key] || key] = Array.isArray(value) ? value[0] : value;
  });
  return result;
};

function Profile() {
  const { profile, setProfile } = useOutletContext();
  const { refreshUser } = useAuth();
  const fileRef = useRef(null);

  const [saving, setSaving] = useState(false);

  // Foto
  const [uploading, setUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState({ text: "", type: "" });

  // Username
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameMsg, setNameMsg] = useState({ text: "", type: "" });

  // Password
  const [editingPass, setEditingPass] = useState(false);
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [passErrors, setPassErrors] = useState({});
  const [passMsg, setPassMsg] = useState({ text: "", type: "" });

  // ===== Foto profil =====
  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // agar file yang sama bisa dipilih lagi
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
      const localUrl = await uploadAvatar(file);
      // Ambil ulang dari backend supaya memakai path yang dikembalikan server
      setProfile(
        localUrl ? { ...profile, avatar: localUrl } : await getProfile(),
      );
      setAvatarMsg({ text: "Foto profil diperbarui.", type: "success" });
    } catch (err) {
      const fe = toFieldErrors(err.fields);
      setAvatarMsg({
        text: fe.avatar || err.message || "Gagal mengunggah foto.",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  // ===== Username =====
  const startEditName = () => {
    setNameInput(profile.username);
    setNameMsg({ text: "", type: "" });
    setEditingName(true);
  };

  const saveName = async () => {
    const value = nameInput.trim();
    if (value.length < 3) {
      setNameMsg({ text: "Username minimal 3 karakter.", type: "error" });
      return;
    }
    if (value === profile.username) {
      setEditingName(false);
      return;
    }

    setSaving(true);
    try {
      await updateUsername(value);
      setProfile({ ...profile, username: value });
      if (!SKIP_AUTH) await refreshUser(); // sinkronkan data user di layout lain
      setEditingName(false);
      setNameMsg({ text: "Username berhasil diubah.", type: "success" });
    } catch (err) {
      const fe = toFieldErrors(err.fields);
      setNameMsg({
        text: fe.username || err.message || "Gagal mengubah username.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // ===== Password =====
  const togglePassword = () => {
    setPasswords(emptyPasswords);
    setPassErrors({});
    setPassMsg({ text: "", type: "" });
    setEditingPass(!editingPass);
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPassErrors({ ...passErrors, [e.target.name]: "" });
    setPassMsg({ text: "", type: "" });
  };

  // Validasi klien hanya untuk kenyamanan. Aturan yang berlaku tetap dari backend.
  const savePassword = async () => {
    const { currentPassword, password, confirmPassword } = passwords;
    const errs = {};
    if (!currentPassword) errs.currentPassword = "Password lama wajib diisi.";
    if (password.length < 8)
      errs.password = "Password baru minimal 8 karakter.";
    if (password !== confirmPassword)
      errs.confirmPassword = "Konfirmasi password tidak sama.";
    if (Object.keys(errs).length > 0) {
      setPassErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await changePassword(passwords);
      setPasswords(emptyPasswords); // jangan simpan password lebih lama dari perlu
      setEditingPass(false);
      setPassMsg({ text: "Password berhasil diubah.", type: "success" });
    } catch (err) {
      // Password lama salah dijawab 422, jadi muncul di bawah kolom password lama
      const fe = toFieldErrors(err.fields);
      setPassErrors(fe);
      setPassMsg({
        text:
          Object.keys(fe).length > 0
            ? "Periksa kembali data yang kamu isi."
            : err.message || "Gagal mengubah password.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const passField = (name, placeholder, autoComplete) => (
    <div>
      <input
        className={`profile-input ${passErrors[name] ? "has-error" : ""}`}
        type="password"
        name={name}
        placeholder={placeholder}
        value={passwords[name]}
        onChange={handlePasswordChange}
        autoComplete={autoComplete}
      />
      {passErrors[name] && (
        <p className="admin-form-error">{passErrors[name]}</p>
      )}
    </div>
  );

  return (
    <>
      <h1 className="profile-title">Profil</h1>

      <div className="profile-layout">
        {/* Kiri: foto dan ID */}
        <div className="profile-left">
          <div className="profile-photo">
            <Avatar src={profile.avatar} name={profile.username} size={220} />
            <button
              className="profile-camera"
              onClick={() => fileRef.current.click()}
              disabled={uploading}
              aria-label="Ganti foto profil"
            >
              <Icon name="camera" size={24} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatar}
            />
          </div>
          <p className="profile-id">ID: {profile.id}</p>
          {uploading && <p className="admin-message">Mengunggah...</p>}
          {avatarMsg.text && (
            <p className={`admin-message ${avatarMsg.type}`}>
              {avatarMsg.text}
            </p>
          )}
        </div>

        {/* Kanan: data akun */}
        <div className="profile-right">
          <div className="profile-row">
            <div className="profile-row-head">
              <h2>Username</h2>
              <button
                className="profile-link"
                onClick={
                  editingName ? () => setEditingName(false) : startEditName
                }
              >
                {editingName ? "Cancel" : "Edit"}
              </button>
            </div>

            {editingName ? (
              <div className="profile-form">
                <input
                  className="profile-input"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    setNameMsg({ text: "", type: "" });
                  }}
                  autoComplete="username"
                  autoFocus
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={saveName}
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            ) : (
              <p className="profile-value">{profile.username}</p>
            )}
            {nameMsg.text && (
              <p className={`admin-message ${nameMsg.type}`}>{nameMsg.text}</p>
            )}
          </div>

          {/* Email hanya ditampilkan (belum bisa diedit) */}
          <div className="profile-row">
            <div className="profile-row-head">
              <h2>Email</h2>
            </div>
            <p className="profile-value">{profile.email}</p>
          </div>

          <div className="profile-row">
            <div className="profile-row-head">
              <h2>Password</h2>
              <button className="profile-link" onClick={togglePassword}>
                {editingPass ? "Cancel" : "Edit"}
              </button>
            </div>
            <p className="profile-value">********</p>

            {editingPass && (
              <div className="profile-form column">
                {passField(
                  "currentPassword",
                  "Password Lama",
                  "current-password",
                )}
                {passField("password", "Password Baru", "new-password")}
                {passField(
                  "confirmPassword",
                  "Konfirmasi Password Baru",
                  "new-password",
                )}
                <button
                  className="btn btn-primary profile-save"
                  onClick={savePassword}
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            )}
            {passMsg.text && (
              <p className={`admin-message ${passMsg.type}`}>{passMsg.text}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
