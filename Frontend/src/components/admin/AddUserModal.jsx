import { useState } from "react";
import Icon from "../Icon";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nama field backend -> nama field di form
const fieldMap = { password_confirmation: "confirmPassword" };

// onSubmit(form) harus melempar ApiError kalau gagal. Modal menampilkan errornya.
function AddUserModal({ roles, onSubmit, onClose }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setMessage("");
  };

  // Validasi klien hanya untuk kenyamanan. Aturan yang berlaku tetap dari backend.
  const validate = () => {
    const result = {};
    if (form.username.trim().length < 3)
      result.username = "Username minimal 3 karakter.";
    if (!emailPattern.test(form.email))
      result.email = "Format email tidak valid.";

    if (form.password.length < 8)
      result.password = "Password minimal 8 karakter.";
    if (form.password !== form.confirmPassword)
      result.confirmPassword = "Konfirmasi password tidak sama.";
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
      await onSubmit({ ...form, username: form.username.trim() });
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
          : err.message || "Gagal menambah user.",
      );
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = "text", placeholder = "") => (
    <div className="admin-form-field">
      <label htmlFor={`add-${name}`}>{label}</label>
      <input
        id={`add-${name}`}
        name={name}
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        className={errors[name] ? "has-error" : ""}
        autoComplete={type === "password" ? "new-password" : "off"}
      />
      {errors[name] && <p className="admin-form-error">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="admin-modal-backdrop" onMouseDown={onClose}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-user-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-head">
          <h2 id="add-user-title">Tambah User</h2>
          <button
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {field("username", "Username", "text", "AlexShadow")}
          {field("email", "Email", "email", "alex@example.com")}
          {field("password", "Password", "password", "Min. 8 karakter")}
          {field("confirmPassword", "Konfirmasi Password", "password")}

          <div className="admin-form-field">
            <label htmlFor="add-role">Role (opsional)</label>
            <select
              id="add-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={roles.length === 0}
            >
              <option value="">
                {roles.length === 0
                  ? "Daftar role tidak tersedia"
                  : "Gunakan role bawaan"}
              </option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
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
              {loading ? "Menyimpan..." : "Tambah User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;
