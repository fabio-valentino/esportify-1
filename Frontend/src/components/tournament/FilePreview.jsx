import { useEffect } from "react";
import Icon from "../icon";

const isPdf = (file) => /\.pdf($|\?)/i.test(file.name || file.url || "");

function FilePreview({ file, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="t-preview-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="t-preview" role="dialog" aria-modal="true">
        <div className="t-preview-head">
          <span>{file.name || "Pratinjau"}</span>
          <button type="button" aria-label="Tutup" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>
        {isPdf(file) ? (
          <iframe
            className="t-preview-pdf"
            src={file.url}
            title={file.name || "Pratinjau"}
          />
        ) : (
          <img src={file.url} alt={file.name || "Pratinjau"} />
        )}
      </div>
    </div>
  );
}

export default FilePreview;
