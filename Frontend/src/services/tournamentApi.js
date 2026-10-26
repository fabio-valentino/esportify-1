import { USE_TOURNAMENT_MOCK } from "../config/env";
import { ApiError } from "./httpClient";

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// SEMENTARA: data contoh. Bukan implementasi backend.
const mockManaged = [
  {
    id: 1,
    name: "MLBB Surabaya",
    game: "Mobile Legends : Bang-bang",
    status: "pendaftaran", // "pendaftaran" | "berlangsung" | "selesai"
    registrationCloses: "12 November 2026",
    matchDate: "14 November 2026",
    type: "Offline",
    registered: 32,
    capacity: 64,
    pendingVerification: 5,
  },
];

// Endpoint turnamen BELUM ada di kontrak. Jangan ditebak.
// Setelah kontrak ada, isi dengan apiRequest(...) dan petakan response ke bentuk mock.
const notReady = (name) =>
  new ApiError(`Endpoint belum disepakati dengan backend (${name}).`);

export async function getManagedTournaments() {
  if (USE_TOURNAMENT_MOCK) {
    await wait();
    return JSON.parse(JSON.stringify(mockManaged));
  }
  throw notReady("daftar turnamen kelolaan");
}

// ----- Form Buat Turnamen -----
// SEMENTARA: data pilihan contoh. Bukan implementasi backend.
const mockGames = [
  { id: 1, name: "Mobile Legends : Bang-bang" },
  { id: 2, name: "PUBG MOBILE" },
  { id: 3, name: "Valorant" },
  { id: 4, name: "Free Fire" },
];
const mockLocations = {
  "Jawa Timur": ["Surabaya", "Gresik", "Malang"],
  "Jawa Barat": ["Bandung", "Bekasi", "Bogor"],
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan"],
};

export async function getGameOptions() {
  if (USE_TOURNAMENT_MOCK) {
    await wait(150);
    return [...mockGames];
  }
  throw notReady("daftar game");
}

export async function getProvinces() {
  if (USE_TOURNAMENT_MOCK) return Object.keys(mockLocations);
  throw notReady("daftar provinsi");
}

export async function getCities(province) {
  if (USE_TOURNAMENT_MOCK) return [...(mockLocations[province] ?? [])];
  throw notReady("daftar kota");
}

// values: lihat CreateTournament.jsx. File ada di values.poster, values.ktp, values.qris.
// Setelah kontrak ada, susun FormData dengan nama field dari backend lalu apiRequest(...).
export async function submitTournament(values) {
  if (USE_TOURNAMENT_MOCK) {
    await wait(600);
    mockSubmissions.unshift({
      id: Date.now(),
      name: values.name,
      submittedAt: new Date().toISOString().slice(0, 10),
      status: "Menunggu Verifikasi",
    });
    return true;
  }
  throw notReady("ajukan turnamen");
}

// ----- Status Pengajuan -----
// SEMENTARA: data contoh. Bukan implementasi backend.
// Bentuk yang dipakai halaman: { id, name, submittedAt (ISO atau teks), status (teks dari backend) }
const mockSubmissions = [
  {
    id: 1,
    name: "PUBGM Weekend",
    submittedAt: "2026-11-10",
    status: "Menunggu Verifikasi",
  },
  {
    id: 2,
    name: "ROBLOX RACING",
    submittedAt: "2026-11-09",
    status: "Sedang Ditinjau",
  },
  {
    id: 3,
    name: "HOK Battle S2",
    submittedAt: "2026-11-05",
    status: "Perlu Revisi",
  },
  {
    id: 4,
    name: "MLBB Surabaya",
    submittedAt: "2026-11-01",
    status: "Disetujui",
  },
  {
    id: 5,
    name: "Free Fire SMA Area",
    submittedAt: "2026-10-05",
    status: "Ditolak",
  },
];

export async function getSubmissions() {
  if (USE_TOURNAMENT_MOCK) {
    await wait();
    return JSON.parse(JSON.stringify(mockSubmissions));
  }
  throw notReady("daftar pengajuan turnamen");
}
