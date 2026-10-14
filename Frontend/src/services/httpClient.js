import { API_BASE_URL } from "../config/env";

// Semua kegagalan request dijadikan ApiError supaya halaman cukup menangani satu jenis error
export class ApiError extends Error {
  constructor(message, status = 0, fields = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = tidak sampai ke server
    this.fields = fields; // error per kolom, format Laravel: { field: ["pesan"] }
  }
}

export async function apiRequest(path, { method = "GET", body } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json", // agar Laravel selalu membalas JSON
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Server mati, tidak ada internet, atau diblokir CORS
    throw new ApiError("Tidak dapat terhubung ke server. Coba lagi nanti.");
  }

  // Body bisa kosong (misalnya 204), jadi jangan dipaksa jadi JSON
  const data = await response.json().catch(() => null);

  if (response.ok) return data;

  if (response.status === 422) {
    throw new ApiError(
      data?.message || "Data tidak valid.",
      422,
      data?.errors || {},
    );
  }
  if (response.status === 429) {
    throw new ApiError(
      "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
      429,
    );
  }
  if (response.status >= 500) {
    throw new ApiError(
      "Terjadi kesalahan pada server. Coba lagi nanti.",
      response.status,
    );
  }
  throw new ApiError(data?.message || "Permintaan gagal.", response.status);
}
