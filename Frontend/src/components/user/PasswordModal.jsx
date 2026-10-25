import { useEffect, useRef, useState } from "react";

// Kontrak SAMA dengan PasswordSection:
// onSubmit({ currentPassword, password, confirmPassword }) -> melempar error kalau gagal
// Error backend dipetakan sama persis (current_password, password_confirmation).
const emptyPasswords = {
  currentPassword: "",
  password: "",
  confirmPassword: "",
};
const fieldMap = {
  current_password: "currentPassword",
  password_confirmation: "confirmPassword",
};

const FIELDS = [
  {
    name: "currentPassword",
    label: "Password lama",
    placeholder: "Masukkan password lama",
    autoComplete: "current-password",
  },
  {
    name: "password",
    label: "Password baru",
    placeholder: "Minimal 8 karakter",
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "Konfirmasi password baru",
    placeholder: "Ulangi password baru",
    autoComplete: "new-password",
  },
];

function EyeIcon({ off }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}

// Render hanya saat dibuka: {open && <PasswordModal ... />}
// Jadi state otomatis ter-reset tiap kali modal dibuka.
function PasswordModal({ onSubmit, onClose, onSuccess }) {
  const [values, setValues] = useState(emptyPasswords);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState({});
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [saving, onClose]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setMsg("");
  };

  // Validasi klien hanya kenyamanan (sama seperti PasswordSection).
  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

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
      onSuccess?.();
      onClose();
    } catch (err) {
      const fe = {};
      Object.entries(err.fields || {}).forEach(([k, v]) => {
        fe[fieldMap[k] || k] = Array.isArray(v) ? v[0] : v;
      });
      setErrors(fe);
      setMsg(
        Object.keys(fe).length > 0
          ? "Periksa kembali data yang kamu isi."
          : err.message || "Gagal mengubah password.",
      );
      setSaving(false);
    }
  };

  return (
    <div
      className="pr-ov"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <form
        className="pr-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pr-pw-title"
        onSubmit={submit}
        noValidate
      >
        <div className="pr-head">
          <h3 id="pr-pw-title">Ubah password</h3>
          <p>Masukkan password saat ini dan password baru kamu.</p>
        </div>

        <div className="pr-body">
          {FIELDS.map((f, i) => (
            <div key={f.name} className="pr-field">
              <label className="pr-label" htmlFor={`pr-${f.name}`}>
                {f.label}
              </label>
              <div className="pr-pw">
                <input
                  id={`pr-${f.name}`}
                  ref={i === 0 ? firstRef : null}
                  className={`pr-input ${errors[f.name] ? "err" : ""}`}
                  type={visible[f.name] ? "text" : "password"}
                  name={f.name}
                  placeholder={f.placeholder}
                  value={values[f.name]}
                  onChange={handleChange}
                  autoComplete={f.autoComplete}
                  disabled={saving}
                />
                <button
                  type="button"
                  className="pr-eye"
                  aria-label={
                    visible[f.name] ? "Sembunyikan password" : "Lihat password"
                  }
                  onClick={() =>
                    setVisible({ ...visible, [f.name]: !visible[f.name] })
                  }
                >
                  <EyeIcon off={visible[f.name]} />
                </button>
              </div>
              {errors[f.name] && <p className="pr-err">{errors[f.name]}</p>}
            </div>
          ))}
          {msg && <p className="pr-err">{msg}</p>}
        </div>

        <div className="pr-foot">
          <button
            type="button"
            className="pr-btn pr-btn-s"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </button>
          <button type="submit" className="pr-btn pr-btn-p" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan password"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PasswordModal;
