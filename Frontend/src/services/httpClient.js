import { API_BASE_URL } from "../config/env";
import { getToken } from "./tokenStorage";

export class ApiError extends Error {
  constructor(message, status = 0, fields = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = tidak sampai ke server
    this.fields = fields; // format Laravel: { field: ["pesan"] }
  }
}

export async function apiRequest(path, { method = "GET", body } = {}) {
  const token = getToken();
  const isForm = body instanceof FormData;
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // FormData: biarkan browser mengatur Content-Type (beserta boundary)
        ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError("Tidak dapat terhubung ke server. Coba lagi nanti.");
  }

  const data = await response.json().catch(() => null);

  if (response.ok) return data;

  if (response.status === 401) {
    throw new ApiError(data?.message || "Tidak terautentikasi.", 401);
  }
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
