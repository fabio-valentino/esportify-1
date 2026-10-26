import { useEffect, useRef } from "react";
import LdIcon from "./LandingIcons";

// Muncul saat Guest membuka detail turnamen/komunitas.
// onLogin / onRegister ditangani halaman (supaya URL tujuan bisa disimpan).
function GuestGateModal({ onClose, onLogin, onRegister }) {
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="ld-ov"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="ld-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ld-gate-title"
      >
        <button
          type="button"
          className="ld-modal-x"
          onClick={onClose}
          aria-label="Tutup"
        >
          <LdIcon name="close" size={18} />
        </button>

        <div className="ld-modal-ic">
          <LdIcon name="lock" size={22} />
        </div>
        <h2 id="ld-gate-title">Masuk untuk Melihat Detail</h2>
        <p>
          Buat akun atau masuk ke Esportify untuk melihat informasi lengkap dan
          melanjutkan aktivitasmu.
        </p>

        <div className="ld-modal-actions">
          <button
            ref={firstRef}
            type="button"
            className="ld-btn ld-btn-p ld-btn-block"
            onClick={onLogin}
          >
            Masuk
          </button>
          <button
            type="button"
            className="ld-btn ld-btn-s ld-btn-block"
            onClick={onRegister}
          >
            Daftar Akun
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuestGateModal;
