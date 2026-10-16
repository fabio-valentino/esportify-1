import { USE_ADMIN_MOCK } from "../config/env";
import { apiRequest, ApiError } from "./httpClient";
import { mockUsers, mockRoles } from "./mock/adminMock";

const copy = (data) => JSON.parse(JSON.stringify(data));
const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Ambil array dari response. Mendukung { data: [...] } dan array langsung.
// ASSUMPTION: pembungkus "data" belum dikonfirmasi untuk endpoint admin.
const toList = (response) => {
  const inner = response?.data ?? response;
  return Array.isArray(inner) ? inner : [];
};

// Di endpoint admin, roles = array objek role (Spatie). Ambil namanya.
const roleName = (r) => (typeof r === "string" ? r : (r?.name ?? ""));

// Backend -> frontend. status sudah berupa "aktif" | "nonaktif".
const mapUser = (u) => ({
  id: u.id_user,
  username: u.username,
  email: u.email,
  role: roleName(u.roles?.[0]), // desain: satu role per user
  status: u.status,
});

// GET /api/admin/users
export async function getUsers() {
  if (USE_ADMIN_MOCK) {
    await wait();
    return copy(mockUsers);
  }

  const response = await apiRequest("/admin/users");
  return toList(response).map(mapUser);
}

// GET /api/admin/roles -> ["admin", "user", ...]
export async function getRoles() {
  if (USE_ADMIN_MOCK) return [...mockRoles];
  const response = await apiRequest("/admin/roles");
  return toList(response).map(roleName);
}

// changes: [{ id, role, status, roleChanged, statusChanged }]
// Belum ada endpoint bulk, jadi dikirim satu per satu.
// Mengembalikan { succeeded: [id], failed: [{ id, message }] }
export async function updateUsers(changes) {
  if (USE_ADMIN_MOCK) {
    await wait();
    changes.forEach((c) => {
      const target = mockUsers.find((u) => u.id === c.id);
      if (target) Object.assign(target, { role: c.role, status: c.status });
    });
    return { succeeded: changes.map((c) => c.id), failed: [] };
  }

  const succeeded = [];
  const failed = [];

  for (const c of changes) {
    try {
      if (c.roleChanged) {
        await apiRequest(`/admin/users/${c.id}/roles`, {
          method: "POST",

          body: { role: c.role },
        });
      }
      if (c.statusChanged) {
        await apiRequest(`/admin/users/${c.id}`, {
          method: "PATCH",
          body: { status: c.status },
        });
      }
      succeeded.push(c.id);
    } catch (err) {
      failed.push({
        id: c.id,
        message: err instanceof ApiError ? err.message : "Gagal menyimpan.",
      });
    }
  }
  return { succeeded, failed };
}

// DELETE /api/admin/users/{id}. Admin menghapus akun sendiri dijawab 403.
export async function deleteUser(id) {
  if (USE_ADMIN_MOCK) {
    await wait();
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index >= 0) mockUsers.splice(index, 1);
    return true;
  }
  await apiRequest(`/admin/users/${id}`, { method: "DELETE" });
  return true;
}

// POST /api/admin/users
// ASSUMPTION: field body belum dikonfirmasi backend. Ubah di sini kalau berbeda.
export async function createUser({
  username,
  email,
  password,
  confirmPassword,
}) {
  if (USE_ADMIN_MOCK) {
    await wait();
    if (mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new ApiError("Data tidak valid.", 422, {
        email: ["Email sudah terdaftar."],
      });
    }
    mockUsers.push({
      id: Date.now(),
      username,
      email,
      role: "User",
      status: "aktif",
    });
    return true;
  }
  return apiRequest("/admin/users", {
    method: "POST",
    body: {
      username,
      email,
      password,
      password_confirmation: confirmPassword,
    },
  });
}

// POST /api/admin/users/{id}/roles (mengganti role lewat syncRoles di backend)
export async function setUserRole(id, role) {
  if (USE_ADMIN_MOCK) {
    await wait();
    const target = mockUsers.find((u) => u.id === id);
    if (target) target.role = role;
    return true;
  }
  return apiRequest(`/admin/users/${id}/roles`, {
    method: "POST",
    body: { role },
  });
}
