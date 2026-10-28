import { API_BASE_URL, USE_TOURNAMENT_MOCK } from "../config/env";
import { ApiError, apiRequest } from "./httpClient";

// Service khusus halaman Cari Turnamen. Sengaja terpisah dari tournamentApi.js.

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

let API_ORIGIN = "";
try {
  API_ORIGIN = API_BASE_URL ? new URL(API_BASE_URL).origin : "";
} catch {
  API_ORIGIN = "";
}

export const PER_PAGE = 6;

// DATA CONTOH: false = daftar kosong (yang tampil state "tidak ditemukan").
// Ubah ke true untuk melihat kartu, filter, dan paginasi bekerja.
const SHOW_SAMPLE_DATA = false;

/* ---------------- Opsi filter (nilai yang dikirim ke URL/API) ---------------- */

export const TYPE_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];

export const FEE_OPTIONS = [
  { value: "", label: "Semua biaya" },
  { value: "gratis", label: "Gratis" },
  { value: "berbayar", label: "Berbayar" },
];

// ASSUMPTION: pilihan jadwal belum ada di desain selain "Semua waktu". Nilai = jumlah hari ke depan.
export const SCHEDULE_OPTIONS = [
  { value: "", label: "Semua waktu" },
  { value: "7", label: "7 hari ke depan" },
  { value: "30", label: "30 hari ke depan" },
  { value: "90", label: "3 bulan ke depan" },
];

/* ---------------- Formatter tampilan ---------------- */

export const formatRupiah = (n) =>
  Number(n) > 0 ? `Rp${Number(n).toLocaleString("id-ID")}` : "Rp0";

export const formatFee = (n) => (Number(n) > 0 ? formatRupiah(n) : "Gratis");

export const formatDate = (value) => {
  const text = String(value ?? "");
  const d = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? new Date(`${text}T00:00:00`)
    : value
      ? new Date(value)
      : null;
  if (!d || Number.isNaN(d.getTime())) return "Jadwal menyusul";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
};

/* ---------------- Helper & mapper ---------------- */

const notReady = (name) =>
  new ApiError(`Endpoint belum disepakati dengan backend (${name}).`);

const toList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

const toMediaUrl = (value) => {
  if (!value) return null;
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  return `${API_ORIGIN}/storage/${String(value).replace(/^\/?(storage\/)?/, "")}`;
};

const normalizeType = (v) => {
  const s = String(v ?? "").toLowerCase();
  if (s.includes("offline")) return "Offline";
  if (s.includes("online")) return "Online";
  return "";
};

// ASSUMPTION: nama field belum dikonfirmasi backend (mengikuti tebakan di landingApi.js)
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

/* ---------------- DATA CONTOH (hanya saat USE_TOURNAMENT_MOCK) ---------------- */

const mockCategories = [
  { id: "1", name: "MOBA" },
  { id: "2", name: "Battle Royale" },
  { id: "3", name: "FPS" },
];

const mockGames = [
  { id: "1", name: "Mobile Legends", categoryIds: ["1"] },
  { id: "2", name: "PUBG Mobile", categoryIds: ["2"] },
  { id: "3", name: "Valorant", categoryIds: ["3"] },
  { id: "4", name: "Free Fire", categoryIds: ["2"] },
  { id: "5", name: "Honor of Kings", categoryIds: ["1"] },
];

const mockLocations = {
  "Jawa Timur": ["Surabaya", "Gresik", "Malang"],
  "Jawa Barat": ["Bandung", "Bekasi", "Bogor"],
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan"],
};

const mockTournaments = [
  {
    id: 1,
    name: "Gresik Youth MLBB Cup 2026",
    gameId: "1",
    type: "Offline",
    province: "Jawa Timur",
    city: "Gresik",
    date: "2026-11-18",
    prize: 5000000,
    fee: 0,
    slotFilled: 28,
    slotTotal: 32,
  },
  {
    id: 2,
    name: "Piala Pelajar Gresik S4",
    gameId: "1",
    type: "Offline",
    province: "Jawa Timur",
    city: "Gresik",
    date: "2026-11-22",
    prize: 3500000,
    fee: 0,
    slotFilled: 16,
    slotTotal: 16,
  },
  {
    id: 3,
    name: "FREEFIRE TURNAMEN Oneday Cup",
    gameId: "4",
    type: "Online",
    province: "",
    city: "",
    date: "2026-11-14",
    prize: 200000,
    fee: 10000,
    slotFilled: 10,
    slotTotal: 12,
  },
  {
    id: 4,
    name: "HOK TURNAMEN Bekasi Series",
    gameId: "5",
    type: "Offline",
    province: "Jawa Barat",
    city: "Bekasi",
    date: "2026-11-15",
    prize: 10000000,
    fee: 0,
    slotFilled: 24,
    slotTotal: 64,
  },
  {
    id: 5,
    name: "PUBGM East Java Battleground",
    gameId: "2",
    type: "Offline",
    province: "Jawa Timur",
    city: "Surabaya",
    date: "2026-11-25",
    prize: 8000000,
    fee: 25000,
    slotFilled: 14,
    slotTotal: 20,
  },
  {
    id: 6,
    name: "MLBB Surabaya Championship",
    gameId: "1",
    type: "Offline",
    province: "Jawa Timur",
    city: "Surabaya",
    date: "2026-12-03",
    prize: 15000000,
    fee: 35000,
    slotFilled: 28,
    slotTotal: 32,
  },
  {
    id: 7,
    name: "Valorant Jakarta Open",
    gameId: "3",
    type: "Online",
    province: "",
    city: "",
    date: "2026-12-10",
    prize: 20000000,
    fee: 50000,
    slotFilled: 40,
    slotTotal: 64,
  },
  {
    id: 8,
    name: "Bupati Cup Gresik 2026",
    gameId: "1",
    type: "Offline",
    province: "Jawa Timur",
    city: "Gresik",
    date: "2026-11-29",
    prize: 10000000,
    fee: 0,
    slotFilled: 45,
    slotTotal: 64,
  },
];

const matchesMock = (t, c) => {
  const game = mockGames.find((g) => g.id === t.gameId);
  // Kata kunci mencocokkan nama turnamen ATAU nama game
  if (c.q) {
    const q = c.q.toLowerCase();
    const inName = t.name.toLowerCase().includes(q);
    const inGame = (game?.name ?? "").toLowerCase().includes(q);
    if (!inName && !inGame) return false;
  }
  if (c.kategori && !game?.categoryIds.includes(c.kategori)) return false;
  if (c.tipe && t.type.toLowerCase() !== c.tipe) return false;
  if (c.biaya === "gratis" && t.fee > 0) return false;
  if (c.biaya === "berbayar" && !(t.fee > 0)) return false;
  if (c.provinsi && t.province !== c.provinsi) return false;
  if (c.kota && t.city !== c.kota) return false;
  if (c.jadwal) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + Number(c.jadwal));
    const when = new Date(`${t.date}T00:00:00`);
    if (when < start || when > end) return false;
  }
  return true;
};

const mockToItem = (t) => ({
  id: t.id,
  name: t.name,
  poster: null,
  game: mockGames.find((g) => g.id === t.gameId)?.name ?? "",
  type: t.type,
  date: t.date,
  prize: t.prize,
  fee: t.fee,
  slotFilled: t.slotFilled,
  slotTotal: t.slotTotal,
});

/* ---------------- API ---------------- */

// criteria: { q, kategori, tipe, biaya, jadwal, provinsi, kota, page }
// return: { items, total, page, perPage, totalPages }
export async function searchTournaments(criteria) {
  if (USE_TOURNAMENT_MOCK) {
    await wait(350);
    const source = SHOW_SAMPLE_DATA ? mockTournaments : [];
    const all = source.filter((t) => matchesMock(t, criteria));
    const start = (criteria.page - 1) * PER_PAGE;
    return {
      items: all.slice(start, start + PER_PAGE).map(mockToItem),
      total: all.length,
      page: criteria.page,
      perPage: PER_PAGE,
      totalPages: Math.max(1, Math.ceil(all.length / PER_PAGE)),
    };
  }

  // ASSUMPTION: endpoint dan nama parameter BELUM ada di kontrak backend (api.php belum punya route turnamen).
  // Jangan dipakai sebelum disepakati:
  // GET /tournaments?q=&category_id=&type=&fee=&within_days=&province=&city=&page=&per_page=
  // "q" diharapkan mencocokkan nama turnamen DAN nama game.
  const query = new URLSearchParams();
  if (criteria.q) query.set("q", criteria.q);
  if (criteria.kategori) query.set("category_id", criteria.kategori);
  if (criteria.tipe) query.set("type", criteria.tipe);
  if (criteria.biaya) query.set("fee", criteria.biaya);
  if (criteria.jadwal) query.set("within_days", criteria.jadwal);
  if (criteria.provinsi) query.set("province", criteria.provinsi);
  if (criteria.kota) query.set("city", criteria.kota);
  query.set("page", String(criteria.page));
  query.set("per_page", String(PER_PAGE));

  const res = await apiRequest(`/tournaments?${query.toString()}`);

  // ASSUMPTION: format paginasi Laravel, baik { data, meta } maupun { data: { data, total, ... } }
  const box = Array.isArray(res?.data) || !res?.data ? res : res.data;
  const list = Array.isArray(res)
    ? res
    : Array.isArray(box?.data)
      ? box.data
      : [];
  const meta = box?.meta ?? box ?? {};
  const total = Number(meta.total ?? list.length);
  const perPage = Number(meta.per_page ?? PER_PAGE);

  return {
    items: list.map(mapTournament),
    total,
    page: Number(meta.current_page ?? criteria.page),
    perPage,
    totalPages: Number(
      meta.last_page ?? Math.max(1, Math.ceil(total / perPage)),
    ),
  };
}

// Pilihan filter Kategori Game. Id selalu string supaya cocok dengan nilai di URL.
export async function getSearchCategories() {
  if (USE_TOURNAMENT_MOCK) {
    await wait(150);
    return mockCategories.map((c) => ({ ...c }));
  }
  // ASSUMPTION: GET /categories yang bisa diakses user biasa. Belum ada di api.php;
  // yang ada baru /admin/categories (butuh role admin + permission lihat_data_kategori).
  const res = await apiRequest("/categories");
  return toList(res).map((c) => ({
    id: String(c.id_kategori ?? c.id),
    name: c.nama_kategori ?? c.nama ?? c.name ?? "",
  }));
}

export async function getSearchProvinces() {
  if (USE_TOURNAMENT_MOCK) return Object.keys(mockLocations);
  throw notReady("daftar provinsi");
}

export async function getSearchCities(province) {
  if (USE_TOURNAMENT_MOCK) return [...(mockLocations[province] ?? [])];
  throw notReady("daftar kota");
}
