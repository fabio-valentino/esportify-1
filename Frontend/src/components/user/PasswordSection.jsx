import { useState } from "react";
import ProfileField from "./ProfileField";

const emptyPasswords = {
  currentPassword: "",
  password: "",
  confirmPassword: "",
};
const fieldMap = {
  current_password: "currentPassword",
  password_confirmation: "confirmPassword",
};

// onSubmit({ currentPassword, password, confirmPassword }) melempar error kalau gagal
function PasswordSection({ onSubmit }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(emptyPasswords);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [saving, setSaving] = useState(false);

  const toggle = () => {
    setValues(emptyPasswords);
    setErrors({});
    setMsg({ text: "", type: "" });
    setEditing(!editing);
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setMsg({ text: "", type: "" });
  };

  // Validasi klien hanya kenyamanan. Aturan yang berlaku tetap dari backend.
  const submit = async () => {
    const errs = {};
    if (!values.currentPassword)
      errs.currentPassword = "Password lama wajib diisi.";
    if (values.password.length < 8)
      errs.password = "Password baru minimal 8 karakter.";

    if (values.password !== values.confirmPassword)
      errs.confirmPassword = "Konfirmasi password tidak sama.";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await onSubmit(values);
      setValues(emptyPasswords);
      setEditing(false);
      setMsg({ text: "Password berhasil diubah.", type: "success" });
    } catch (err) {
      const fe = {};
      Object.entries(err.fields || {}).forEach(([k, v]) => {
        fe[fieldMap[k] || k] = Array.isArray(v) ? v[0] : v;
      });
      setErrors(fe);
      setMsg({
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

  const field = (name, placeholder, autoComplete) => (
    <div>
      <input
        className={`profile-input ${errors[name] ? "has-error" : ""}`}
        type="password"
        name={name}
        placeholder={placeholder}
        value={values[name]}
        onChange={handleChange}
        autoComplete={autoComplete}
      />
      {errors[name] && <p className="admin-form-error">{errors[name]}</p>}
    </div>
  );

  return (
    <ProfileField
      label="Password"
      value="********"
      actionLabel={editing ? "Cancel" : "Edit"}
      onAction={toggle}
      below={
        editing && (
          <>
            {field("currentPassword", "Password Lama", "current-password")}
            {field("password", "Password Baru", "new-password")}
            {field(
              "confirmPassword",
              "Konfirmasi Password Baru",
              "new-password",
            )}
            <button
              type="button"
              className="pf-save"
              onClick={submit}
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        )
      }
      message={msg}
    />
  );
}

export default PasswordSection;
