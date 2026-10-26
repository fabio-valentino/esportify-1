import {
  API_BASE_URL,
  USE_LANDING_MOCK,
  USE_LANDING_GAME_MOCK, // FIX: flag terpisah untuk game
} from "../config/env";
import { apiRequest } from "./httpClient";

// Satu-satunya tempat yang perlu disentuh saat data asli sudah jadi:
// 1) ubah VITE_USE_LANDING_MOCK=false di .env (turnamen & komunitas)
//    dan/atau VITE_USE_LANDING_GAME_MOCK=false (game)
// 2) sesuaikan ENDPOINT dan nama field di mapper (semua bertanda ASSUMPTION)

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));
const API_ORIGIN = API_BASE_URL ? new URL(API_BASE_URL).origin : "";

// FIX: sama seperti adminApi.js, aman untuk path "games/x.png" maupun "storage/games/x.png"
const toMediaUrl = (value) => {
  if (!value) return null;
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  return `${API_ORIGIN}/storage/${String(value).replace(/^\/?(storage\/)?/, "")}`;
};

// Respons bisa array langsung, { data: [...] }, atau paginasi Laravel { data: { data: [...] } }
const toList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

/* ---------------- Formatter tampilan ---------------- */

export const formatRupiah = (n) =>
  Number(n) > 0 ? `Rp${Number(n).toLocaleString("id-ID")}` : "Rp0";

export const formatFee = (n) => (Number(n) > 0 ? formatRupiah(n) : "Gratis");

export const formatDate = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return "Jadwal menyusul";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
};

const normalizeType = (v) => {
  const s = String(v ?? "").toLowerCase();
  if (s.includes("offline")) return "Offline";
  if (s.includes("online")) return "Online";
  return "";
};

/* ---------------- Mapper (ASSUMPTION: nama field belum dikonfirmasi) ---------------- */

const mapTournament = (d) => ({
  id: d.id_turnamen ?? d.id,
  name: d.nama_turnamen ?? d.nama ?? d.name ?? "",
  poster: toMediaUrl(d.poster),
  game: d.game?.nama_game ?? d.game?.nama ?? d.nama_game ?? d.game_name ?? "",
  type: normalizeType(d.tipe ?? d.type),
  date:
    d.hari_pertandingan ?? d.tanggal_pertandingan ?? d.tanggal_mulai ?? null,
  prize: Number(d.total_hadiah ?? 0),
  fee: Number(d.nominal_pendaftaran ?? d.biaya_pendaftaran ?? 0),
  slotFilled: Number(d.peserta_terdaftar ?? d.slot_terisi ?? 0),
  slotTotal: Number(d.slot ?? d.total_slot ?? 0),
});

const mapCommunity = (d) => ({
  id: d.id_komunitas ?? d.id,
  name: d.nama_komunitas ?? d.nama ?? d.name ?? "",
  image: toMediaUrl(d.gambar ?? d.poster ?? d.image),
  game: d.game?.nama_game ?? d.game?.nama ?? d.nama_game ?? d.game_name ?? "",
  description: d.deskripsi ?? d.description ?? "",
  members: Number(d.jumlah_anggota ?? d.anggota_count ?? d.members_count ?? 0),
});

// FIX: mengikuti format admin (id_game, nama_game, avatar_url) + filter game nonaktif.
// ASSUMPTION: response publik mengikuti format /admin/games; nilai status nonaktif = "nonaktif".
const mapGame = (d) => ({
  id: d.id_game ?? d.id,
  name: d.nama_game ?? d.nama ?? d.name ?? "",
  icon: d.avatar_url ?? toMediaUrl(d.avatar ?? d.icon),
  active: String(d.status ?? "aktif").toLowerCase() !== "nonaktif",
});

/* ---------------- Data contoh (hanya saat flag mock aktif) ----------------
   DATA CONTOH untuk development. Jangan tampilkan sebagai statistik nyata. */

const mockTournaments = [
  {
    id: 1,
    name: "MLBB TURNAMEN PORSIMAPTAR",
    poster: null,
    game: "Mobile Legends",
    type: "Offline",
    date: "2026-10-27",
    prize: 25000000,
    fee: 50000,
    slotFilled: 30,
    slotTotal: 64,
  },
  {
    id: 2,
    name: "FREEFIRE TURNAMEN Oneday",
    poster: null,
    game: "Free Fire",
    type: "Online",
    date: "2026-10-17",
    prize: 200000,
    fee: 10000,
    slotFilled: 10,
    slotTotal: 12,
  },
  {
    id: 3,
    name: "HOK TURNAMEN Bekasi Series",
    poster: null,
    game: "Honor of Kings",
    type: "Offline",
    date: "2026-11-15",
    prize: 10000000,
    fee: 0,
    slotFilled: 24,
    slotTotal: 64,
  },
];

const mockCommunities = [
  {
    id: 1,
    name: "HOK Motion IME",
    image: null,
    game: "Honor of Kings",
    description:
      "Komunitas pemain Honor of Kings untuk berdiskusi, berbagi informasi, dan mencari teman bermain.",
    members: 1032,
  },
  {
    id: 2,
    name: "Roblox Muslim Community",
    image: null,
    game: "Roblox",
    description:
      "Komunitas dakwah dan edukasi Islam berbasis Roblox untuk belajar, berdiskusi, dan bersilaturahmi.",
    members: 3494,
  },
  {
    id: 3,
    name: "Free Fire Gresik Community",
    image: null,
    game: "Free Fire",
    description:
      "Komunitas pemain Free Fire di Gresik untuk berbagi informasi, berdiskusi, dan terhubung dengan sesama pemain.",
    members: 647,
  },
];

const mockGames = [
  { id: 1, name: "Mobile Legends: Bang Bang", icon: null },
  { id: 2, name: "PUBG Mobile", icon: null },
  { id: 3, name: "Roblox", icon: null },
  { id: 4, name: "Free Fire MAX", icon: null },
];

/* ---------------- API ---------------- */

// ASSUMPTION: GET /tournaments?sort=latest&limit=3 (publik, tanpa token)
export async function getLatestTournaments(limit = 3) {
  if (USE_LANDING_MOCK) {
    await wait();
    return mockTournaments.slice(0, limit);
  }
  const res = await apiRequest(`/tournaments?sort=latest&limit=${limit}`);
  return toList(res).slice(0, limit).map(mapTournament);
}

// ASSUMPTION: GET /communities?sort=members&limit=3 (publik, urut anggota terbanyak)
export async function getTopCommunities(limit = 3) {
  if (USE_LANDING_MOCK) {
    await wait();
    return mockCommunities.slice(0, limit);
  }
  const res = await apiRequest(`/communities?sort=members&limit=${limit}`);
  return toList(res).slice(0, limit).map(mapCommunity);
}

// ASSUMPTION: GET /games = route PUBLIK BARU (belum ada di api.php; yang ada baru
// /admin/games yang butuh login admin). Backend perlu: tanpa auth, hanya game aktif,
// diurutkan dari yang paling banyak dipakai. Kalau nama route-nya beda, ubah di sini saja.
const GAMES_ENDPOINT = "/games";

export async function getSupportedGames() {
  if (USE_LANDING_GAME_MOCK) {
    await wait();
    return mockGames;
  }
  const res = await apiRequest(GAMES_ENDPOINT);
  return toList(res)
    .map(mapGame)
    .filter((g) => g.active); // urutan populer tetap dari backend
}
