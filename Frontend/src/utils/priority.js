import { PRIORITY_AFTER_MINUTES } from "../config/env";

// Hanya untuk tampilan. Aturan prioritas yang sebenarnya dijalankan backend.
const WAITING = ["menunggu verifikasi", "sedang ditinjau"];

export const isWaiting = (status) =>
  WAITING.includes(
    String(status ?? "")
      .trim()
      .toLowerCase(),
  );

// Tanggal dari backend -> milidetik. Tanpa zona ("2026-10-30 14:00:00")
// dianggap WIB, supaya tidak meleset kalau kolomnya tidak ber-cast datetime.
export const toMs = (value) => {
  if (!value) return NaN;
  let text = String(value)
    .trim()
    .replace(/(\.\d{3})\d+/, "$1");
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(text)) {
    text = `${text.replace(" ", "T")}+07:00`;
  }
  return Date.parse(text);
};

// Acuan waktu tunggu: terakhir diajukan ulang, kalau belum pernah pakai tanggal
// pengajuan pertama. Sama dengan COALESCE(diajukan_ulang_pada, created_at) di backend.
export const waitingSince = (s) => s.resubmittedAt || s.createdAt;

export const ageMinutes = (iso, now = Date.now()) => {
  const t = toMs(iso);
  return Number.isNaN(t) ? 0 : Math.max(0, Math.floor((now - t) / 60000));
};

export const isPriority = (s, now = Date.now()) =>
  isWaiting(s.status) &&
  ageMinutes(waitingSince(s), now) > PRIORITY_AFTER_MINUTES;

export const waitingText = (iso, now = Date.now()) => {
  const m = ageMinutes(iso, now);
  if (m < 60) return `Menunggu ${m} menit`;
  if (m < 1440) return `Menunggu ${Math.floor(m / 60)} jam`;
  return `Menunggu ${Math.floor(m / 1440)} hari`;
};
