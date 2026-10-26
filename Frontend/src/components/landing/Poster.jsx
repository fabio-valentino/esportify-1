import { useEffect, useState } from "react";

// Tampil gambar kalau ada. Kalau kosong atau gagal dimuat, tampil panel gradient
// dengan teks cadangan (tidak pernah menampilkan gambar rusak).
function Poster({ src, alt = "", fallbackText = "" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return (
      <img
        className="ld-poster-img"
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="ld-poster-fb" role="img" aria-label={alt}>
      <span>{fallbackText}</span>
    </div>
  );
}

export default Poster;
