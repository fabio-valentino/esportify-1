import { useEffect, useState } from "react";
import Icon from "../../components/icon";
import RoleModal from "../../components/admin/RoleModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import Pagination from "../../components/admin/Pagination";
import {
  getRolesWithPermissions,
  createRole,
  updateRoleName,
  setRolePermissions,
  deleteRole,
} from "../../services/adminApi";
import { formatPermission } from "../../utils/permission";

const PAGE_SIZE = 5;

const errorText = (err) =>
  err.status === 403 ? err.message || "Aksi ini tidak diizinkan." : err.message;

function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { item } (null = tambah)
  const [confirm, setConfirm] = useState(null);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const load = async () => setRoles(await getRolesWithPermissions());

  useEffect(() => {
    load()
      .catch((err) => setMessage({ text: errorText(err), type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const keyword = search.trim().toLowerCase();
  const filtered = roles.filter((r) => r.name.toLowerCase().includes(keyword));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  // Dipanggil modal. Error dilempar kembali supaya tampil di modal.
  const handleSave = async ({ name, permissions }) => {
    const item = modal.item;
    let id = item?.id;

    if (item) {
      if (name !== item.name) await updateRoleName(item.id, name);
    } else {
      id = (await createRole(name)).id;
    }

    if (id) {
      await setRolePermissions(id, permissions);
    } else if (permissions.length > 0) {
      // Backend tidak mengembalikan id role baru, jadi permission belum bisa diatur
      await load();
      setMessage({
        text: "Role dibuat, tetapi permission belum diatur. Edit role untuk menambahkannya.",
        type: "error",
      });
      return;
    }

    await load();
    setMessage({ text: "Role berhasil disimpan.", type: "success" });
  };

  const handleDelete = async () => {
    const target = confirm;
    setWorking(true);
    try {
      await deleteRole(target.id);
      setRoles((prev) => prev.filter((r) => r.id !== target.id));
      setMessage({ text: "Role berhasil dihapus.", type: "success" });
    } catch (err) {
      setMessage({ text: errorText(err), type: "error" });
    } finally {
      setWorking(false);
      setConfirm(null);
    }
  };

  return (
    <>
      <h1 className="admin-title">Roles</h1>

      <section className="admin-panel">
        <div className="admin-filters">
          <div className="admin-search">
            <Icon name="search" size={18} />
            <input
              type="text"
              placeholder="Cari role"
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
            <Icon name="plus" size={16} /> Tambah Role
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
                <th>Role</th>
                <th>Permissions</th>
                <th className="col-action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((role, index) => (
                <tr key={role.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{role.name}</td>
                  <td>
                    <div className="role-chips">
                      {role.permissions.length === 0 && (
                        <span className="admin-empty">-</span>
                      )}
                      {role.permissions.map((perm, i) => (
                        <span
                          key={perm}
                          className={`role-chip ${i % 2 === 0 ? "blue" : "gray"}`}
                        >
                          {formatPermission(perm)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="col-action">
                    <div className="admin-actions">
                      <button
                        className="admin-icon-btn edit"
                        onClick={() => setModal({ item: role })}
                        aria-label={`Edit ${role.name}`}
                      >
                        <Icon name="edit" size={18} />
                      </button>
                      <button
                        className="admin-icon-btn delete"
                        onClick={() => setConfirm(role)}
                        aria-label={`Hapus ${role.name}`}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    {roles.length === 0
                      ? "Belum ada role."
                      : "Role tidak ditemukan."}
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
        <RoleModal
          role={modal.item}
          onSubmit={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          tone="danger"
          icon="trash"
          title="Hapus Role?"
          confirmLabel="Hapus"
          loading={working}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        >
          <p>Apakah anda yakin ingin menghapus role "{confirm.name}"</p>
          <p>User yang memakai role ini bisa kehilangan akses.</p>
        </ConfirmDialog>
      )}
    </>
  );
}

export default AdminRoles;
