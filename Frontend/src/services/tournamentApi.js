import { apiRequest } from "./httpClient";

// Semua fungsi di file ini SELALU memakai backend (tanpa mock).
// Respons player: { success, message, data }.
const listOf = (response) => {
  const inner = response?.data ?? response;
  return Array.isArray(inner) ? inner : [];
};

// ASSUMPTION: ID sumber pendanaan. Hanya Dana Pribadi = 2 yang terkonfirmasi.
const FUNDING_IDS = { sponsor: 1, dana_pribadi: 2, biaya_peserta: 3 };

// ----- Kelola Turnamen -----
// GET /api/turnamen-kelolaan. Daftar kosong = 200 dengan data: [] (bukan error).
export async function getManagedTournaments() {
  const response = await apiRequest("/turnamen-kelolaan");
  return listOf(response).map((t) => {
    const p = t.pengajuan ?? {};
    return {
      id: Number(t.id_turnamen),
      name: p.nama_turnamen ?? "-",
      game: p.game?.nama_game ?? "-",
      status: String(t.status ?? "").trim().toLowerCase(), // pendaftaran | berlangsung | selesai
      registrationCloses: p.jadwal_pendaftaran_tutup ?? "",
      matchDate: p.jadwal_main ?? "",
      type: String(p.tipe_turnamen ?? "").toLowerCase(),
      capacity: p.slot ?? null,
    };
  });
}

// ----- Status Pengajuan -----
// GET /api/pengajuan-turnamen (terbaru di atas, tanpa pagination)
export async function getSubmissions() {
  const response = await apiRequest("/pengajuan-turnamen");
  return listOf(response).map((s) => ({
    id: Number(s.id_pengajuan),
    name: s.nama_turnamen ?? "-",
    submittedAt: s.created_at ?? "",
    status: s.status ?? "",
  }));
}

// ----- Pilihan form Buat Turnamen -----
// GET /api/public/games (publik)
export async function getGameOptions() {
  const response = await apiRequest("/public/games");
  return listOf(response).map((g) => ({ id: Number(g.id_game), name: g.nama_game }));
}

// GET /api/provinsi dan /api/provinsi/{id}/kota (publik)
export async function getProvinces() {
  const response = await apiRequest("/provinsi");
  return listOf(response).map((p) => ({ id: Number(p.id_provinsi), name: p.nama_provinsi }));
}

export async function getCities(provinceId) {
  const response = await apiRequest(`/provinsi/${provinceId}/kota`);
  return listOf(response).map((c) => ({ id: Number(c.id_kota), name: c.nama_kota }));
}

// ----- Buat Turnamen -----
// POST /api/pengajuan-turnamen (multipart/form-data)
export async function submitTournament(v) {
  const f = new FormData();
  f.append("poster", v.poster);
  f.append("nama_turnamen", v.name.trim());
  f.append("nama_penyelenggara", v.organizer.trim());
  f.append("id_game", String(v.gameId));
  f.append("tipe_turnamen", v.type);

  // Offline: id_kota wajib. Online: tidak dikirim.
  if (v.type === "offline") {
    f.append("id_kota", String(Number(v.city)));
    if (v.address.trim()) f.append("deskripsi_lokasi", v.address.trim());
  }

  f.append("slot", String(Number(v.slot)));
  f.append("jadwal_pendaftaran_tutup", v.closeDate);
  f.append("jadwal_main", v.matchDate);
  f.append("deskripsi_turnamen", v.description.trim());
  f.append("total_hadiah", String(Number(v.prize)));
  f.append("rincian_pendanaan", v.fundingDetail.trim());

  v.funding.forEach((key) => f.append("sumber_pendanaan[]", String(FUNDING_IDS[key])));
  // Data sponsor hanya dikirim kalau Sponsor dipilih
  if (v.funding.includes("sponsor")) {
    f.append("sponsor[0][nama_sponsor]", v.sponsorName.trim());
    f.append("sponsor[0][kontak_sponsor]", v.sponsorContact.trim());
  }

  f.append("jenis_biaya", v.fee);
  if (v.fee === "berbayar") {
    f.append("biaya_pendaftaran", String(Number(v.feeAmount)));
    f.append("metode_pembayaran", v.paymentMethod);
    if (["qris", "qris_transfer"].includes(v.paymentMethod)) f.append("qris", v.qris);
    if (["transfer", "qris_transfer"].includes(v.paymentMethod)) {
      f.append("no_rekening", v.account.trim());
    }
  }

  f.append("ktp", v.ktp);
  f.append("setuju_pertanggungjawaban", v.agree ? "1" : "0");

  return apiRequest("/pengajuan-turnamen", { method: "POST", body: f });
}