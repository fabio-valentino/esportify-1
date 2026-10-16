import { USE_MOCK } from "../config/env";
import { ApiError, apiRequest } from "./httpClient";
import { mockRegister } from "./mock/authMock";
import { getToken, setToken, clearToken } from "./tokenStorage";

// POST /api/register (nama field: konfirmasikan dengan backend)
export async function register({ username, email, password, confirmPassword }) {
  const payload = {
    username,
    email,
    password,
    password_confirmation: confirmPassword,
  };
  if (USE_MOCK) return mockRegister(payload);
  return apiRequest("/register", { method: "POST", body: payload });
}

// POST /api/login. Sukses = server mengirim token, lalu kita simpan.
export async function login({ email, password }) {
  if (USE_MOCK) {
    throw new ApiError("Login membutuhkan backend. Set VITE_USE_MOCK=false.");
  }

  const response = await apiRequest("/login", {
    method: "POST",
    body: { email, password },
  });

  // Lokasi token di response: KONFIRMASIKAN dengan backend.
  // Di sini dicoba beberapa kemungkinan umum.
  const token =
    response?.token ??
    response?.access_token ??
    response?.data?.token ??
    response?.data?.access_token;

  if (!token) {
    throw new ApiError(
      "Login berhasil tetapi token tidak ditemukan di response server.",
    );
  }
  setToken(token);
  return response;
}

// POST /api/logout. Token selalu dihapus walaupun request gagal.
export async function logout() {
  try {
    if (!USE_MOCK && getToken()) {
      await apiRequest("/logout", { method: "POST" });
    }
  } finally {
    clearToken();
  }
}

// Mengubah format backend ke format frontend (satu tempat saja)
const mapUser = (u) => ({
  id: u.id_user,
  username: u.username,
  email: u.email,
  roles: Array.isArray(u.roles) ? u.roles : [], // hanya untuk tampilan
});

// GET /api/user. Mengembalikan null kalau belum login atau token ditolak.
export async function getCurrentUser() {
  if (USE_MOCK || !getToken()) return null;
  try {
    const response = await apiRequest("/user");
    return mapUser(response.data); // response dibungkus "data"
  } catch (err) {
    if (err.status === 401) {
      clearToken(); // token dicabut atau tidak valid
      return null;
    }
    throw err;
  }
}
