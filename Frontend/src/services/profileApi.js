import { API_BASE_URL, SKIP_AUTH } from "../config/env";
import { apiRequest } from "./httpClient";

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));
const API_ORIGIN = API_BASE_URL ? new URL(API_BASE_URL).origin : "";

// Data contoh hanya untuk mode development tanpa login (VITE_SKIP_AUTH)
const skipProfile = {
  id: 0,
  username: "James",
  email: "james123@gmail.com",
  avatar: null,
  bio: "",
  gender: "",
};

// ASSUMPTION: avatar bisa URL lengkap atau path. Path relatif digabung dengan
// alamat server. Kalau backend memakai /storage, ubah di sini saja.

const toAvatarUrl = (value) => {
  if (!value) return null;

  if (/^(https?:|data:|blob:)/.test(value)) {
    return value;
  }

  return `${API_ORIGIN}/storage/${String(value).replace(/^\/+/, "")}`;
};

// ASSUMPTION: nama field belum dikonfirmasi. Data player bisa ada di objek "player".
const mapProfile = (d) => {
  const player = d.player ?? {};
  return {
    id: d.id_user ?? d.id,
    username: d.username,
    email: d.email,
    avatar: toAvatarUrl(player.avatar ?? d.avatar),
    bio: player.bio ?? d.bio ?? "",
    gender: player.jenis_kelamin ?? d.jenis_kelamin ?? "",
  };
};

// GET /api/profile (profil player)
export async function getProfile() {
  if (SKIP_AUTH) {
    await wait();
    return { ...skipProfile };
  }
  const response = await apiRequest("/profile");
  return mapProfile(response?.data ?? response);
}

// PUT /api/profile
async function putProfile(payload) {
  if (SKIP_AUTH) {
    await wait();
    return null;
  }
  return apiRequest("/profile", { method: "PUT", body: payload });
}

export const updateUsername = (username) => putProfile({ username });

export const changePassword = ({
  currentPassword,
  password,
  confirmPassword,
}) =>
  putProfile({
    current_password: currentPassword,
    password,
    password_confirmation: confirmPassword,
  });

// Upload foto: POST multipart + _method=PUT (Laravel tidak membaca file dari PUT asli).
// Mengembalikan URL sementara di mode skip, selain itu null (ambil ulang lewat getProfile).
export async function uploadAvatar(file) {
  if (SKIP_AUTH) {
    await wait();
    return URL.createObjectURL(file);
  }
  const form = new FormData();
  form.append("_method", "PUT");
  form.append("avatar", file);
  await apiRequest("/profile", { method: "POST", body: form });
  return null;
}

// GET /api/admin/profile
// Respons: { data: { id_admin, id_user, username, email } }
export async function getAdminProfile() {
  if (SKIP_AUTH) {
    await wait();
    return { id: 1, username: "admin_esportify", email: "admin@esportify.com" };
  }
  const response = await apiRequest("/admin/profile");
  const d = response?.data ?? response;
  return {
    id: d.id_admin,
    userId: d.id_user,
    username: d.username,
    email: d.email,
  };
}

// PUT /api/admin/profile
// ASSUMPTION: body belum dikonfirmasi (kontrak terpotong). Ubah di sini saja.
async function putAdminProfile(payload) {
  if (SKIP_AUTH) {
    await wait();
    return null;
  }
  return apiRequest("/admin/profile", { method: "PUT", body: payload });
}

export const updateAdminUsername = (username) => putAdminProfile({ username });

export const changeAdminPassword = ({
  currentPassword,
  password,
  confirmPassword,
}) =>
  putAdminProfile({
    current_password: currentPassword,
    password,
    password_confirmation: confirmPassword,
  });
