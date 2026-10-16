import Icon from "../Icon";

function Pagination({ page, totalItems, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="admin-pagination">
      <p>
        Menampilkan {start} - {end} dari {totalItems} data
      </p>
      <div className="admin-pages">
        <button
          className="admin-page-btn"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Halaman sebelumnya"
        >
          <Icon name="chevron-left" size={16} />
        </button>

        {pages.map((n) => (
          <button
            key={n}
            className={`admin-page-btn ${n === page ? "active" : ""}`}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}

        <button
          className="admin-page-btn"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Halaman berikutnya"
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
