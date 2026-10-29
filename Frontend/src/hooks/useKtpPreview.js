import { useCallback, useEffect, useRef, useState } from "react";
import { fetchKtpObjectUrl } from "../services/ktpApi";

export default function useKtpPreview(id, role = "player") {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const urlRef = useRef(null);

  const revoke = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };

  const open = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      revoke();
      const url = await fetchKtpObjectUrl(id, role);
      urlRef.current = url;
      setPreview({ url, name: "KTP" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, role, loading]);

  const close = useCallback(() => {
    revoke();
    setPreview(null);
  }, []);

  // Lepaskan blob kalau halaman ditutup saat preview masih terbuka
  useEffect(() => revoke, []);

  return { preview, loading, error, open, close };
}
