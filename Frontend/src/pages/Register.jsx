import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import FormField from "../components/auth/FormField";
import Icon from "../components/Icon";
import { register } from "../services/authApi";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Status validasi (dipakai untuk ikon centang dan pesan)
  const usernameValid = form.username.trim().length >= 3;
  const emailValid = emailPattern.test(form.email);
  const passwordValid = form.password.length >= 8;
  const confirmFilled = form.confirmPassword.length > 0;
  const passwordMatch = confirmFilled && form.password === form.confirmPassword;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setMessage("");
  };

  const validate = () => {
    const result = {};
    if (!usernameValid) result.username = "Username minimal 3 karakter.";
    if (!emailValid) result.email = "Format email tidak valid.";
    if (!passwordValid) result.password = "Password minimal 8 karakter.";
    if (!passwordMatch)
      result.confirmPassword = "Konfirmasi password tidak sama.";
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = validate();
    if (Object.keys(result).length > 0) {
      setErrors(result);
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      // Error validasi dari Laravel: ambil pesan pertama tiap field
      const fieldErrors = {};
      Object.entries(err.fields || {}).forEach(([key, value]) => {
        fieldErrors[key] = Array.isArray(value) ? value[0] : value;
      });
      setErrors(fieldErrors);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleButton = (
    <button
      type="button"
      className="field-toggle"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
    >
      <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
    </button>
  );

  return (
    <AuthShell
      heading="Mulailah Perjalanan"
      highlight="Esports Anda."
      description="Arena Digital yang telah teruji untuk para peserta individu dan organisasi. bersaing, dan raih kemenangan!"
    >
      <h2 className="auth-title">Buat Akun</h2>
      <p className="auth-subtitle">
        Bergabunglah dengan ESPORTIFY sebagai pemain Kompetitif
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Username"
          icon="gamepad"
          name="username"
          type="text"
          placeholder="AlexShadow"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
          autoComplete="username"
          right={usernameValid && <Icon name="badge-check" size={16} />}
        />

        <FormField
          label="Email"
          icon="mail"
          name="email"
          type="email"
          placeholder="alex@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          right={emailValid && <Icon name="check" size={16} />}
        />

        <FormField
          label="Password"
          hint="Min. 8 Karakter"
          icon="lock"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
          right={toggleButton}
        />

        <FormField
          label="Konfirmasi Password"
          icon="lock"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
          right={passwordMatch && <Icon name="check-check" size={16} />}
        />

        {confirmFilled && (
          <p className={passwordMatch ? "field-ok" : "field-error"}>
            {passwordMatch ? (
              <>
                <Icon name="check" size={12} /> Password sesuai
              </>
            ) : (
              "Password belum sama"
            )}
          </p>
        )}

        {message && <p className="auth-error">{message}</p>}

        <button
          type="submit"
          className="btn btn-primary btn-block auth-submit"
          disabled={loading}
        >
          {loading ? "Memproses..." : "Buat Akun"}
          {!loading && <Icon name="arrow-right" size={16} />}
        </button>
      </form>

      <p className="auth-switch">
        Sudah punya akun?{" "}
        <Link to="/login">
          Login <Icon name="login" size={12} />
        </Link>
      </p>
    </AuthShell>
  );
}

export default Register;
