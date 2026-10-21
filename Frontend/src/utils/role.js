// Nama role admin di backend (route memakai role:admin)
const ADMIN_ROLE = "admin";

// roles: array nama role, atau array objek { name }
const roleNames = (roles = []) =>
  roles.map((r) => (typeof r === "string" ? r : r?.name));

// Hanya untuk memilih halaman tujuan. Hak akses sebenarnya dicek backend.
export const isAdmin = (user) => roleNames(user?.roles).includes(ADMIN_ROLE);

export const homePathFor = (user) => (isAdmin(user) ? "/admin" : "/home");
