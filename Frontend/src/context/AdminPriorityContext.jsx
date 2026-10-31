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
import { isPriority, toMs, waitingSince } from "../utils/priority";

const Ctx = createContext(null);

const TICK_MS = 5000; // geser jam (di browser saja)
const REFRESH_MS = 30000; // muat ulang daftar dari server

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

  // Jam: supaya popup muncul tepat waktu tanpa menunggu muat ulang
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(t);
  }, []);

  // Daftar: berkala, dan saat tab kembali aktif
  useEffect(() => {
    const r = setInterval(refresh, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setNow(Date.now());
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(r);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  // Prioritas, yang paling lama menunggu di atas.
  // Acuan waktu = terakhir diajukan ulang (kalau ada), bukan tanggal pengajuan pertama.
  const priority = useMemo(
    () =>
      items
        .filter((s) => isPriority(s, now))
        .sort((a, b) => toMs(waitingSince(a)) - toMs(waitingSince(b))),
    [items, now],
  );

  return (
    <Ctx.Provider value={{ items, priority, loading, error, now, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAdminPriority = () => useContext(Ctx);
