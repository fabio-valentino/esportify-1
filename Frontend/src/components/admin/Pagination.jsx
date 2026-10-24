import Icon from "../icon";

function Pagination({ page, totalItems, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="admin-pagination" aria-label="Pagination">
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
            aria-current={n === page ? "page" : undefined}
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
    </nav>
  );
}

export default Pagination;
