import Icon from "../icon";

// Baris file hanya-baca. url kosong = tombol Lihat nonaktif (mis. KTP yang privat).
function FileRow({ name, url, note }) {
  return (
    <div className="t-file-row">
      <span className="t-file-icon">
        <Icon name="file-image" size={26} />
      </span>
      <span className="t-file-name" title={name}>
        {name || "-"}
      </span>
      <div className="t-file-actions">
        <button
          type="button"
          className="t-pill"
          disabled={!url}
          title={url ? "Buka di tab baru" : note}
          onClick={() =>
            url && window.open(url, "_blank", "noopener,noreferrer")
          }
        >
          Lihat
        </button>
      </div>
    </div>
  );
}

export default FileRow;
