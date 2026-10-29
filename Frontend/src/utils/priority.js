import { PRIORITY_AFTER_MINUTES } from "../config/env";

// Hanya untuk tampilan. Aturan prioritas yang sebenarnya dijalankan backend.
const WAITING = ["menunggu verifikasi", "sedang ditinjau"];

export const isWaiting = (status) =>
  WAITING.includes(
    String(status ?? "")
      .trim()
      .toLowerCase(),
  );

export const ageMinutes = (iso, now = Date.now()) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : Math.max(0, Math.floor((now - t) / 60000));
};

export const isPriority = (s, now = Date.now()) =>
  isWaiting(s.status) && ageMinutes(s.createdAt, now) > PRIORITY_AFTER_MINUTES;

export const waitingText = (iso, now = Date.now()) => {
  const m = ageMinutes(iso, now);
  if (m < 60) return `Menunggu ${m} menit`;
  if (m < 1440) return `Menunggu ${Math.floor(m / 60)} jam`;
  return `Menunggu ${Math.floor(m / 1440)} hari`;
};
