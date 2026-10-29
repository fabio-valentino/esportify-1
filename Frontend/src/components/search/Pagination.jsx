import Icon from "../icon";

// 1 ... 4 [5] 6 ... 20
function buildPages(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const nums = [...new Set([1, total, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="ct-pager" aria-label="Halaman">
      <button
        type="button"
        aria-label="Halaman sebelumnya"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <Icon name="chevron-left" size={18} />
      </button>

      {buildPages(page, totalPages).map((p) =>
        typeof p === "number" ? (
          <button
            key={p}
            type="button"
            className={p === page ? "on" : ""}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ) : (
          <span key={p} className="ct-pager-gap">
            …
          </span>
        ),
      )}

      <button
        type="button"
        aria-label="Halaman berikutnya"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <Icon name="chevron-right" size={18} />
      </button>
    </nav>
  );
}

export default Pagination;
