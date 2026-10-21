// Satu-satunya tempat membaca konfigurasi dari .env
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// Khusus data panel admin. Ubah ke false setelah endpoint admin tersedia.
export const USE_ADMIN_MOCK = import.meta.env.VITE_USE_ADMIN_MOCK !== "false";

if (!USE_MOCK && !API_BASE_URL) {
  console.error("VITE_API_BASE_URL belum diisi di file .env");
}

export const SKIP_AUTH =
  import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === "true";
