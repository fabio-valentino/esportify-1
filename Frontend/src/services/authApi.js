const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

async function post(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json", // wajib agar Laravel membalas JSON
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Error validasi Laravel (422): { message, errors: { field: [..] } }
    const error = new Error(json.message || "Terjadi kesalahan. Coba lagi.");
    error.fields = json.errors || {};
    throw error;
  }
  return json.data ?? json;
}

export async function register({ username, email, password, confirmPassword }) {
  if (USE_MOCK) {
    await wait();
    return { user: { username, email } };
  }
  return post("/register", {
    username,
    email,
    password,
    password_confirmation: confirmPassword, // format bawaan validasi "confirmed" Laravel
  });
}
