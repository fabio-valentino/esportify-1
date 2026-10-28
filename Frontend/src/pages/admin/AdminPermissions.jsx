import { useEffect, useState } from "react";
import Icon from "../../components/icon";
import PermissionModal from "../../components/admin/PermissionModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import Pagination from "../../components/admin/Pagination";

const PAGE_SIZE = 5;
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../../services/adminApi";
import { formatPermission } from "../../utils/permission";

// 403 bisa berarti tidak punya izin kelola_permission
const errorText = (err) =>
  err.status === 403 ? err.message || "Aksi ini tidak diizinkan." : err.message;

function AdminPermissions() {
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { item } (null = tambah)
  const [confirm, setConfirm] = useState(null); // permission yang akan dihapus
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [page, setPage] = useState(1);

  const load = async () => setPermissions(await getPermissions());

  useEffect(() => {
    load()
      .catch((err) => setMessage({ text: errorText(err), type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const keyword = search.trim().toLowerCase().replace(/\s+/g, "_");
  const filtered = permissions.filter((p) =>
    p.name.toLowerCase().includes(keyword),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  // Dipanggil modal. Error dilempar kembali supaya tampil di modal.
  const handleSave = async (name) => {
    if (modal.item) await updatePermission(modal.item.id, name);
    else await createPermission(name);
    await load(); // ambil ulang supaya id dan nama sesuai backend
    setMessage({ text: "Permission berhasil disimpan.", type: "success" });
  };

  const handleDelete = async () => {
    const target = confirm;
    setWorking(true);
    try {
      await deletePermission(target.id);
      setPermissions((prev) => prev.filter((p) => p.id !== target.id));
      setMessage({ text: "Permission berhasil dihapus.", type: "success" });
    } catch (err) {
      setMessage({ text: errorText(err), type: "error" });
    } finally {
      setWorking(false);
      setConfirm(null);
    }
  };

  return (
    <>
      <h1 className="admin-title">Permissions</h1>

      <section className="admin-panel">
        <div className="admin-filters">
          <div className="admin-search">
            <Icon name="search" size={18} />
            <input
              type="text"
              placeholder="Cari permissions"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <button
            className="admin-outline-btn"
            onClick={() => setModal({ item: null })}
          >
            <Icon name="plus" size={16} /> Tambah Permissions
          </button>
        </div>

        {message.text && (
          <p className={`admin-message ${message.type}`}>{message.text}</p>
        )}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Permissions</th>
                <th className="col-action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, index) => (
                <tr key={p.id}>
                  <td>{startIndex + index + 1}</td>
                  <td title={p.name}>{formatPermission(p.name)}</td>
                  <td className="col-action">
                    <div className="admin-actions">
                      <button
                        className="admin-icon-btn edit"
                        onClick={() => setModal({ item: p })}
                        aria-label={`Edit ${p.name}`}
                      >
                        <Icon name="edit" size={18} />
                      </button>
                      <button
                        className="admin-icon-btn delete"
                        onClick={() => setConfirm(p)}
                        aria-label={`Hapus ${p.name}`}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={3} className="admin-empty">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="admin-empty">
                    {permissions.length === 0
                      ? "Belum ada permission."
                      : "Permission tidak ditemukan."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <Pagination
        page={safePage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />

      {modal && (
        <PermissionModal
          permission={modal.item}
          onSubmit={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          tone="danger"
          icon="trash"
          title="Hapus Permission?"
          confirmLabel="Hapus"
          loading={working}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        >
          <p>
            Apakah anda yakin ingin menghapus permission "
            {formatPermission(confirm.name)}"
          </p>
          <p>Role dan route yang memakainya akan kehilangan permission ini.</p>
        </ConfirmDialog>
      )}
    </>
  );
}

export default AdminPermissions;
