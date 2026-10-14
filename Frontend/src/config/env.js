// Satu-satunya tempat membaca konfigurasi dari .env

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);

// Mock hanya aktif kalau nilainya persis "true"
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

if (!USE_MOCK && !API_BASE_URL) {
  console.error("VITE_API_BASE_URL belum diisi di file .env");
}
