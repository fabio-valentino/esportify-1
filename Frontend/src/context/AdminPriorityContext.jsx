import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { getAdminSubmissions } from "../services/adminApi";
import { isPriority } from "../utils/priority";

const Ctx = createContext(null);

export function AdminPriorityProvider({ children }) {
  const { pathname } = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  const refresh = useCallback(async () => {
    try {
      setItems(await getAdminSubmissions());
      setError("");
    } catch (err) {
      setError(
        err.status === 403
          ? err.message || "Kamu tidak punya izin melihat pengajuan."
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat ulang tiap pindah halaman admin (termasuk setelah setujui/tolak/revisi)
  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  // Hitung ulang umur pengajuan tiap 30 detik
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // Prioritas, yang paling lama menunggu di atas
  const priority = useMemo(
    () =>
      items
        .filter((s) => isPriority(s, now))
        .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)),
    [items, now],
  );

  return (
    <Ctx.Provider value={{ items, priority, loading, error, now, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAdminPriority = () => useContext(Ctx);
