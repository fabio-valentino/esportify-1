import {
  API_BASE_URL,
  USE_LANDING_MOCK,
  USE_LANDING_GAME_MOCK,
} from "../config/env";
import { apiRequest } from "./httpClient";
import { getFeaturedTournaments } from "./tournamentSearchApi";

// Pengaturan data landing page:
// 1. USE_LANDING_MOCK mengatur mock turnamen dan komunitas.
// 2. USE_LANDING_GAME_MOCK mengatur mock game.
// 3. Turnamen asli: GET /turnamen (lewat tournamentSearchApi).

// Formatter dipakai bersama halaman Cari Turnamen (tanggal dalam WIB)
export { formatDate, formatFee, formatRupiah } from "./tournamentSearchApi";

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const API_ORIGIN = API_BASE_URL ? new URL(API_BASE_URL).origin : "";

/* ---------------- URL gambar ---------------- */

// Mendukung:
// games/x.png
// storage/games/x.png
// /storage/games/x.png
// https://domain.com/storage/games/x.png
// data: dan blob:
const toMediaUrl = (value) => {
  if (!value) return null;

  const path = String(value).trim();

  if (!path) return null;

  // URL lengkap atau sumber gambar khusus.
  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }

  // Hindari menambahkan /storage dua kali.
  const cleanPath = path.replace(/^\/+/, "").replace(/^storage\/+/i, "");

  return API_ORIGIN
    ? `${API_ORIGIN}/storage/${cleanPath}`
    : `/storage/${cleanPath}`;
};

/* ---------------- Normalisasi respons API ---------------- */

// Mendukung respons:
// [...]
// { data: [...] }
// { data: { data: [...] } }
const toList = (res) => {
  if (Array.isArray(res)) return res;

  if (Array.isArray(res?.data)) {
    return res.data;
  }

  if (Array.isArray(res?.data?.data)) {
    return res.data.data;
  }

  return [];
};

/* ---------------- Mapper data API ---------------- */

// ASSUMPTION: nama field komunitas mengikuti struktur respons backend.
const mapCommunity = (d) => ({
  id: d.id_komunitas ?? d.id,
  name: d.nama_komunitas ?? d.nama ?? d.name ?? "",
  image: toMediaUrl(d.gambar ?? d.poster ?? d.image),
  game: d.game?.nama_game ?? d.game?.nama ?? d.nama_game ?? d.game_name ?? "",
  description: d.deskripsi ?? d.description ?? "",
  members: Number(d.jumlah_anggota ?? d.anggota_count ?? d.members_count ?? 0),
});

// Game tidak difilter berdasarkan status aktif/nonaktif.
// Frontend mengikuti data yang dikirim endpoint backend.
const mapGame = (d) => ({
  id: d.id_game ?? d.id,
  name: d.nama_game ?? d.nama ?? d.name ?? "",
  icon: toMediaUrl(d.avatar ?? d.avatar_url ?? d.icon),
});

/* ---------------- Data mock ---------------- */

// Data contoh untuk development, bukan statistik nyata.

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

/* ---------------- Endpoint API ---------------- */

// Turnamen yang sedang membuka pendaftaran, total hadiah terbesar di atas.
// (Nama fungsi dipertahankan supaya pemanggilnya tidak perlu diubah.)
export async function getLatestTournaments(limit = 3) {
  if (USE_LANDING_MOCK) {
    await wait();
    return mockTournaments.slice(0, limit);
  }

  return getFeaturedTournaments(limit);
}

// ASSUMPTION: endpoint publik komunitas.
// Backend belum punya modul komunitas. Ubah ke true saat GET /communities siap.
const COMMUNITY_API_READY = false;

export async function getTopCommunities(limit = 3) {
  if (USE_LANDING_MOCK || !COMMUNITY_API_READY) {
    await wait();
    return mockCommunities.slice(0, limit);
  }

  const res = await apiRequest(`/communities?sort=members&limit=${limit}`);

  return toList(res).slice(0, limit).map(mapCommunity);
}

// Endpoint publik game.
// Backend menentukan data dan urutannya.
const GAMES_ENDPOINT = "/public/games";

export async function getSupportedGames() {
  if (USE_LANDING_GAME_MOCK) {
    await wait();
    return mockGames;
  }

  const res = await apiRequest(GAMES_ENDPOINT);

  return toList(res).map(mapGame);
}
