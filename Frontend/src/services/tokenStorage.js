// Satu-satunya tempat yang menyentuh penyimpanan token.
// Kalau nanti ingin pindah tempat penyimpanan, cukup ubah file ini.
const KEY = "esportify_token";

export const getToken = () => sessionStorage.getItem(KEY);
export const setToken = (token) => sessionStorage.setItem(KEY, token);
export const clearToken = () => sessionStorage.removeItem(KEY);