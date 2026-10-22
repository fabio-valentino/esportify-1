import { USE_ADMIN_MOCK } from "../config/env";
import { apiRequest, ApiError } from "./httpClient";
import {
  mockUsers,
  mockRoles,
  mockAllPermissions,
  mockPermissionRoles,
  mockDirectPermissions,
} from "./mock/adminMock";

const copy = (data) => JSON.parse(JSON.stringify(data));
const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Ambil array dari response.
const toList = (response) => {
  const inner = response?.data ?? response;
  return Array.isArray(inner) ? inner : [];
};

// Mengambil nama role.
const roleName = (r) => (typeof r === "string" ? r : (r?.name ?? ""));

// Backend -> frontend.
const mapUser = (u) => ({
  id: u.id_user,
  username: u.username,
  email: u.email,
  role: roleName(u.roles?.[0]),
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

// GET /api/admin/roles
export async function getRoles() {
  if (USE_ADMIN_MOCK) return [...mockRoles];

  const response = await apiRequest("/admin/roles");
  return toList(response).map(roleName);
}

// Update beberapa user.
export async function updateUsers(changes) {
  if (USE_ADMIN_MOCK) {
    await wait();

    changes.forEach((c) => {
      const target = mockUsers.find((u) => u.id === c.id);
      if (target) {
        Object.assign(target, {
          role: c.role,
          status: c.status,
        });
      }
    });

    return {
      succeeded: changes.map((c) => c.id),
      failed: [],
    };
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

// DELETE /api/admin/users/{id}
export async function deleteUser(id) {
  if (USE_ADMIN_MOCK) {
    await wait();

    const index = mockUsers.findIndex((u) => u.id === id);
    if (index >= 0) mockUsers.splice(index, 1);

    return true;
  }

  await apiRequest(`/admin/users/${id}`, {
    method: "DELETE",
  });

  return true;
}

// POST /api/admin/users (role wajib, dikirim bersamaan sesuai backend)
export async function createUser({
  username,
  email,
  password,
  confirmPassword,
  role,
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
      role,
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
      role,
    },
  });
}

// POST /api/admin/users/{id}/roles
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

// ==================================================
// PERMISSIONS
// ==================================================

const permName = (p) => (typeof p === "string" ? p : (p?.name ?? ""));

const namesOf = (list) => (Array.isArray(list) ? list : []).map(permName);

// GET /api/admin/permissions
export async function getAllPermissions() {
  if (USE_ADMIN_MOCK) {
    await wait(200);
    return [...mockAllPermissions];
  }

  const response = await apiRequest("/admin/permissions");
  return toList(response).map(permName);
}

// GET /api/admin/users/permissions
// Mengambil permission banyak user dalam SATU request.
export async function getUsersPermissions(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return {};
  }

  if (USE_ADMIN_MOCK) {
    await wait(150);

    const result = {};

    ids.forEach((id) => {
      const user = mockUsers.find((u) => String(u.id) === String(id));

      if (!user) return;

      const viaRoles =
        mockPermissionRoles.find((r) => r.name === user.role)?.permissions ??
        [];

      const direct = mockDirectPermissions[id] ?? [];

      result[id] = {
        direct: [...direct],
        viaRoles: [...viaRoles],
        effective: [...new Set([...direct, ...viaRoles])],
      };
    });

    return copy(result);
  }

  // Kirim sebagai ids[]=1&ids[]=2 agar sesuai validasi Laravel.
  const query = new URLSearchParams();

  ids.forEach((id) => {
    query.append("ids[]", String(id));
  });

  const response = await apiRequest(
    `/admin/users/permissions?${query.toString()}`,
  );

  const data = response?.data ?? {};
  const result = {};

  Object.entries(data).forEach(([id, permission]) => {
    result[id] = {
      direct: namesOf(permission.direct),
      viaRoles: namesOf(permission.via_roles),
      effective: namesOf(permission.effective),
    };
  });

  return result;
}

// GET /api/admin/users/{id}/permissions
// Mengambil permission satu user.
export async function getUserPermissions(id) {
  if (USE_ADMIN_MOCK) {
    await wait(150);

    const user = mockUsers.find((u) => u.id === id);

    const viaRoles =
      mockPermissionRoles.find((r) => r.name === user?.role)?.permissions ?? [];

    const direct = mockDirectPermissions[id] ?? [];

    return copy({
      direct,
      viaRoles,
      effective: [...new Set([...viaRoles, ...direct])],
    });
  }

  const response = await apiRequest(`/admin/users/${id}/permissions`);

  const data = response?.data ?? {};

  return {
    direct: namesOf(data.direct),
    viaRoles: namesOf(data.via_roles),
    effective: namesOf(data.effective),
  };
}

// POST /api/admin/users/{id}/permissions
export async function setUserPermissions(id, permissions) {
  if (USE_ADMIN_MOCK) {
    await wait();
    mockDirectPermissions[id] = [...permissions];
    return true;
  }

  return apiRequest(`/admin/users/${id}/permissions`, {
    method: "POST",
    body: { permissions },
  });
}

// POST /api/admin/permissions
export async function createPermission(name) {
  if (USE_ADMIN_MOCK) {
    await wait();

    if (mockAllPermissions.includes(name)) {
      throw new ApiError("Data tidak valid.", 422, {
        name: ["Permission sudah ada."],
      });
    }

    mockAllPermissions.push(name);
    return true;
  }

  return apiRequest("/admin/permissions", {
    method: "POST",
    body: { name },
  });
}
