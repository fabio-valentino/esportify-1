import { useOutletContext } from "react-router-dom";
import Avatar from "../../components/user/Avatar";
import ProfileField from "../../components/user/ProfileField";
import EditableField from "../../components/user/EditableField";
import PasswordSection from "../../components/user/PasswordSection";
import { useAuth } from "../../context/AuthContext";
import { SKIP_AUTH } from "../../config/env";
import {
  updateAdminUsername,
  changeAdminPassword,
} from "../../services/profileApi";
import "../../styles/user.css"; // style profil dipakai ulang
import { useRef, useState } from "react";
import Icon from "../../components/icon";
import { getAdminProfile, uploadAdminAvatar } from "../../services/profileApi";

function AdminProfile() {
  // Data profil dimiliki AdminLayout supaya navbar ikut berubah
  const { adminProfile: profile, setAdminProfile: setProfile } =
    useOutletContext();
  const { refreshUser } = useAuth();

  const fileRef = useRef(null);
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
    if (file.size > 2 * 1024 * 1024) {
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

  if (!profile) return <p className="admin-message">Memuat...</p>;

  return (
    <>
      <h1 className="profile-title">Profil Admin</h1>

      <div className="profile-layout">
        <div className="profile-left">
          <div className="profile-photo">
            <Avatar src={profile.avatar} name={profile.username} size={250} />
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
          {uploading && <p className="admin-message">Mengunggah...</p>}
          {avatarMsg.text && (
            <p className={`admin-message ${avatarMsg.type}`}>
              {avatarMsg.text}
            </p>
          )}
        </div>

        <div className="profile-right">
          <EditableField
            label="Username"
            value={profile.username}
            errorKey="username"
            validate={(v) =>
              v.length < 3 ? "Username minimal 3 karakter." : ""
            }
            onSave={updateAdminUsername}
            onSaved={async (v) => {
              setProfile({ ...profile, username: v }); // navbar ikut berubah
              if (!SKIP_AUTH) await refreshUser().catch(() => {});
            }}
          />

          <hr className="pf-divider" />

          <ProfileField label="Email" value={profile.email} />
          <PasswordSection onSubmit={changeAdminPassword} />
        </div>
      </div>
    </>
  );
}

export default AdminProfile;
