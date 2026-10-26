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

// Khusus Kelola Game. Ubah ke false setelah semua endpoint game selesai.
export const USE_GAME_MOCK = import.meta.env.VITE_USE_GAME_MOCK !== "false";

// Khusus landing page (turnamen & komunitas). Ubah ke false setelah endpoint landing selesai.
export const USE_LANDING_MOCK =
  import.meta.env.VITE_USE_LANDING_MOCK !== "false";
// Khusus daftar game di landing. Ubah ke false setelah route game publik dari backend jadi.
export const USE_LANDING_GAME_MOCK =
  import.meta.env.VITE_USE_LANDING_GAME_MOCK !== "false";

export const USE_TOURNAMENT_MOCK =
  import.meta.env.VITE_USE_TOURNAMENT_MOCK !== "false";
