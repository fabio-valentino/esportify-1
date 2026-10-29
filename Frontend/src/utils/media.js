import { API_BASE_URL } from "../config/env";

const ORIGIN = API_BASE_URL ? new URL(API_BASE_URL).origin : "";

// Path relatif dari backend -> URL lengkap (php artisan storage:link diperlukan)
export const toMediaUrl = (value) => {
  if (!value) return null;
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  return `${ORIGIN}/storage/${String(value).replace(/^\/?(storage\/)?/, "")}`;
};
