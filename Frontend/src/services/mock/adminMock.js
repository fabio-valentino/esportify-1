// SEMENTARA: data contoh. Bukan implementasi backend. Hapus setelah API admin siap.

export const mockRoles = ["Admin Platform", "User"];

export const mockUsers = [
  {
    id: 1,
    username: "Admin",
    email: "admin@gmail.com",
    role: "Admin Platform",
    status: "aktif",
  },
  {
    id: 2,
    username: "Ananda",
    email: "anandaa@gmail.com",
    role: "User",
    status: "aktif",
  },
  {
    id: 3,
    username: "Budi",
    email: "budi@gmail.com",
    role: "User",
    status: "aktif",
  },
  {
    id: 4,
    username: "Danu",
    email: "danu@gmail.com",
    role: "User",
    status: "aktif",
  },
  {
    id: 5,
    username: "Lily",
    email: "lily@gmail.com",
    role: "User",
    status: "aktif",
  },
  {
    id: 6,
    username: "Lana",
    email: "lana@gmail.com",
    role: "User",
    status: "nonaktif",
  },
  {
    id: 7,
    username: "Bayu",
    email: "bayu@gmail.com",
    role: "User",
    status: "aktif",
  },
  {
    id: 8,
    username: "Citra",
    email: "citra@gmail.com",
    role: "User",
    status: "aktif",
  },
  {
    id: 9,
    username: "Dewi",
    email: "dewi@gmail.com",
    role: "User",
    status: "nonaktif",
  },
  {
    id: 10,
    username: "Eko",
    email: "eko@gmail.com",
    role: "User",
    status: "aktif",
  },
];

// Nama permission mengikuti route backend
export const mockAllPermissions = [
  "lihat_dashboard",
  "lihat_data_user",
  "ubah_data_user",
  "hapus_data_user",
  "kelola_role",
  "kelola_permission",
  "atur_permission_role",
  "atur_role_user",
  "atur_permission_user",
  "kelola_turnamen",
];

// Dipakai untuk menghitung izin dari role di mode mock
export const mockPermissionRoles = [
  { id: 1, name: "Admin Platform", permissions: [...mockAllPermissions] },
  { id: 2, name: "User", permissions: ["lihat_dashboard"] },
];

// Izin langsung per user (id user -> nama permission)
export const mockDirectPermissions = { 3: ["lihat_data_user"] };

// SEMENTARA: data contoh. Bukan implementasi backend.
export const mockCategories = [
  { id: 1, name: "MOBA" },
  { id: 2, name: "Battle Royale" },
  { id: 3, name: "FPS" },
  { id: 4, name: "RPG" },
  { id: 5, name: "Strategy" },
  { id: 6, name: "Sports" },
];

// used: true = sudah dipakai turnamen (tidak boleh dihapus, hanya dinonaktifkan)
export const mockGames = [
  {
    id: 1,
    name: "Mobile Legends : Bang-bang",
    avatar: null,
    categoryIds: [1],
    status: "aktif",
    used: true,
  },
];

// Daftar permission dengan id, untuk halaman Permissions
export const mockPermissionList = mockAllPermissions.map((name, i) => ({
  id: i + 1,
  name,
}));

export const mockRoleList = [
  { id: 1, name: "Admin", permissions: [...mockAllPermissions] },
  {
    id: 2,
    name: "Owner",
    permissions: ["lihat_dashboard", "lihat_data_user", "kelola_turnamen"],
  },
  { id: 3, name: "Player", permissions: ["lihat_dashboard"] },
  {
    id: 4,
    name: "Penyelenggara",
    permissions: ["lihat_dashboard", "kelola_turnamen"],
  },
];
