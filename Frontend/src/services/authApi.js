import { USE_MOCK } from "../config/env";
import { apiRequest } from "./httpClient";
import { mockRegister } from "./mock/authMock";

// POST /api/register
// Nama field mengikuti konvensi Laravel. Konfirmasikan dengan backend.
export async function register({ username, email, password, confirmPassword }) {
  const payload = {
    username,
    email,
    password,
    password_confirmation: confirmPassword,
  };

  if (USE_MOCK) return mockRegister(payload);

  return apiRequest("/register", { method: "POST", body: payload });
}
