// SEMENTARA: hanya dipakai kalau VITE_USE_MOCK=true.
// Bukan implementasi backend. Hapus file ini setelah API asli siap.

import { ApiError } from "../httpClient";

const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockRegister({ email }) {
  await wait();

  // Simulasi error validasi supaya tampilan error bisa dicoba
  if (email === "taken@example.com") {
    throw new ApiError("Data tidak valid.", 422, {
      email: ["Email sudah terdaftar."],
    });
  }
  return null;
}
