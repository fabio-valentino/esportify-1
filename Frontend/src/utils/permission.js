// "lihat_data_user" -> "Lihat data user"
export const formatPermission = (name) => {
  const text = name.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Izin tinggi: tidak ditawarkan di daftar centang frontend.
// Pembatasan sebenarnya tetap dilakukan backend.
export const RESTRICTED_PERMISSIONS = [
  "kelola_permission",
  "atur_permission_user",
];
