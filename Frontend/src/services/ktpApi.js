import { apiBlob } from "./httpClient";

// role: "player" -> /pengajuan-turnamen/{id}/ktp
//       "admin"  -> /admin/pengajuan-turnamen/{id}/ktp
export async function fetchKtpObjectUrl(submissionId, role = "player") {
  const prefix = role === "admin" ? "/admin" : "";
  const blob = await apiBlob(
    `${prefix}/pengajuan-turnamen/${encodeURIComponent(submissionId)}/ktp`,
  );
  return URL.createObjectURL(blob);
}
