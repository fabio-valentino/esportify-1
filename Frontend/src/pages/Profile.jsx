import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Icon from "../components/icon";
import Avatar from "../components/user/Avatar";
import ProfileField from "../components/user/ProfileField";
import EditableField from "../components/user/EditableField";
import PasswordSection from "../components/user/PasswordSection";
import { useAuth } from "../context/AuthContext";
import { SKIP_AUTH } from "../config/env";
import {
  getProfile,
  updateUsername,
  updateBio,
  updateGender,
  changePassword,
  uploadAvatar,
} from "../services/profileApi";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // ASSUMPTION: batas belum dikonfirmasi backend
const GENDER_OPTIONS = ["Laki-laki", "Perempuan"]; // ASSUMPTION: nilai belum dikonfirmasi

function Profile() {
  const { profile, setProfile } = useOutletContext();
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
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarMsg({ text: "Ukuran gambar maksimal 2 MB.", type: "error" });
      return;
    }

    setUploading(true);
    setAvatarMsg({ text: "", type: "" });
    try {
      const localUrl = await uploadAvatar(file);
      setProfile(
        localUrl ? { ...profile, avatar: localUrl } : await getProfile(),
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

  return (
    <>
      <h1 className="profile-title">Profil</h1>

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
            onSave={updateUsername}
            onSaved={async (v) => {
              setProfile({ ...profile, username: v });
              if (!SKIP_AUTH) await refreshUser().catch(() => {});
            }}
          />

          <EditableField
            label="Bio"
            value={profile.bio}
            errorKey="bio"
            onSave={updateBio}
            onSaved={(v) => setProfile({ ...profile, bio: v })}
          />

          <EditableField
            label="Jenis Kelamin"
            value={profile.gender}
            options={GENDER_OPTIONS}
            errorKey="jenis_kelamin"
            validate={(v) => (v ? "" : "Pilih jenis kelamin.")}
            onSave={updateGender}
            onSaved={(v) => setProfile({ ...profile, gender: v })}
          />

          <hr className="pf-divider" />

          <ProfileField label="Email" value={profile.email} />
          <PasswordSection onSubmit={changePassword} />
        </div>
      </div>
    </>
  );
}

export default Profile;
