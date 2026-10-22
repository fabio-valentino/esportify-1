import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Avatar from "../../components/user/Avatar";
import { useAuth } from "../../context/AuthContext";
import { SKIP_AUTH } from "../../config/env";
import {
  updateAdminUsername,
  changeAdminPassword,
} from "../../services/profileApi";
import "../../styles/user.css"; // style profil dipakai ulang

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

function AdminProfile() {
  // Data profil dimiliki AdminLayout supaya navbar ikut berubah
  const { adminProfile: profile, setAdminProfile: setProfile } =
    useOutletContext();
  const { refreshUser } = useAuth();

  const [saving, setSaving] = useState(false);

  // Username
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameMsg, setNameMsg] = useState({ text: "", type: "" });

  // Password
  const [editingPass, setEditingPass] = useState(false);
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [passErrors, setPassErrors] = useState({});
  const [passMsg, setPassMsg] = useState({ text: "", type: "" });

  if (!profile) return <p className="admin-message">Memuat...</p>;

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
      await updateAdminUsername(value);
      setProfile({ ...profile, username: value }); // navbar ikut berubah
      if (!SKIP_AUTH) await refreshUser();
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

  // Validasi klien hanya kenyamanan. Aturan yang berlaku tetap dari backend.
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
      await changeAdminPassword(passwords);
      setPasswords(emptyPasswords); // jangan simpan password lebih lama dari perlu
      setEditingPass(false);
      setPassMsg({ text: "Password berhasil diubah.", type: "success" });
    } catch (err) {
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
      <h1 className="profile-title">Profil Admin</h1>

      <div className="profile-layout">
        {/* Kiri: inisial username (admin tidak bisa mengganti foto) */}
        <div className="profile-left">
          <Avatar name={profile.username} size={220} />
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

          {/* Email hanya ditampilkan */}
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

export default AdminProfile;
