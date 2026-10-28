import { useEffect, useRef, useState } from "react";
import Icon from "../icon";

const extOf = (name = "") => (name.split(".").pop() || "").toUpperCase();

// onChange(file | null). Validasi tipe dan ukuran dilakukan di sini.

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function UploadButton({
  label = "Upload",
  hint,
  accept = ".jpg,.jpeg,.png,.webp",
  allowedTypes = IMAGE_TYPES,
  maxMB,
  file,
  onChange,
  onError,
}) {
  const ref = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [open, setOpen] = useState(false);

  // URL pratinjau hanya dibuat saat dibuka, dan selalu dilepas lagi
  useEffect(() => {
    if (!open || !file) return undefined;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [open, file]);

  // Tutup dengan Escape
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleFile = (e) => {
    const picked = e.target.files[0];
    e.target.value = "";
    if (!allowedTypes.includes(picked.type)) {
      onError("Format file tidak didukung.");
      return;
    }

    if (!picked) return;

    if (!picked.type.startsWith("image/")) {
      onError("File harus berupa gambar (JPG atau PNG).");
      return;
    }
    if (picked.size > maxMB * 1024 * 1024) {
      onError(`Ukuran file maksimal ${maxMB} MB.`);
      return;
    }
    onError("");
    onChange(picked);
  };

  return (
    <div className="t-upload">
      {file ? (
        <div className="t-file-row">
          <span className="t-file-icon">
            <Icon name="file-image" size={26} />
            <b>{extOf(file.name)}</b>
          </span>
          <span className="t-file-name" title={file.name}>
            {file.name}
          </span>
          <div className="t-file-actions">
            <button
              type="button"
              className="t-pill danger"
              onClick={() => onChange(null)}
            >
              <Icon name="trash" size={14} /> Hapus
            </button>
            <button
              type="button"
              className="t-pill"
              onClick={() => setOpen(true)}
            >
              Lihat
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="t-upload-btn"
          onClick={() => ref.current.click()}
        >
          <Icon name="upload" size={18} /> {label}
        </button>
      )}

      {hint && <p className="t-upload-hint">{hint}</p>}
      <input
        ref={ref}
        type="file"
        accept={accept}
        hidden
        onChange={handleFile}
      />

      {open && (
        <div className="t-preview-backdrop" onMouseDown={() => setOpen(false)}>
          <div
            className="t-preview"
            role="dialog"
            aria-modal="true"
            aria-label="Pratinjau file"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="t-preview-head">
              <span title={file?.name}>{file?.name}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            {previewUrl && file?.type === "application/pdf" ? (
              <iframe
                title="Pratinjau PDF"
                src={previewUrl}
                className="t-preview-pdf"
              />
            ) : (
              previewUrl && (
                <img src={previewUrl} alt={`Pratinjau ${file?.name}`} />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadButton;
