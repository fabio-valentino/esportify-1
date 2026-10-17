import { useEffect, useRef, useState } from "react";
import Icon from "../../components/icon";
import Pagination from "../../components/admin/Pagination";
import EditPermissionModal from "../../components/admin/EditPermissionModal";
import { useAuth } from "../../context/AuthContext";
import {
  getUsers,
  getUserPermissions,
  setUserPermissions,
  createPermission,
} from "../../services/adminApi";
import { formatPermission } from "../../utils/permission";
import AddPermissionModal from "../../components/admin/AddPermissionModal";

const PAGE_SIZE = 7;

// 403 bisa berarti tidak punya izin atau aksi dilarang (mis. mengatur izin sendiri)
const errorText = (err) =>
  err.status === 403 ? err.message || "Aksi ini tidak diizinkan." : err.message;

function AdminPermissions() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [perms, setPerms] = useState({}); // id user -> { direct, viaRoles, effective } | { error }
  const requested = useRef(new Set());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setMessage({ text: errorText(err), type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const keyword = search.toLowerCase();
  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(keyword),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  // Ambil izin hanya untuk baris yang sedang tampil, sekali per user
  const idsKey = visible.map((u) => u.id).join(",");
  useEffect(() => {
    visible.forEach((u) => {
      if (requested.current.has(u.id)) return;
      requested.current.add(u.id);
      getUserPermissions(u.id)
        .then((data) => setPerms((prev) => ({ ...prev, [u.id]: data })))
        .catch((err) =>
          setPerms((prev) => ({ ...prev, [u.id]: { error: errorText(err) } })),
        );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  // Dipanggil modal. Error dilempar kembali supaya tampil di modal.
  const handleSave = async (permissions) => {
    await setUserPermissions(editing.id, permissions);
    // Ambil ulang dari backend: izin efektif juga dipengaruhi role
    const fresh = await getUserPermissions(editing.id);
    setPerms((prev) => ({ ...prev, [editing.id]: fresh }));
    setMessage({ text: "Permission user berhasil disimpan.", type: "success" });
  };

  // Dipanggil modal. Error dilempar kembali supaya tampil di modal.
  const handleCreate = async (name) => {
    await createPermission(name);
    setMessage({
      text: `Permission "${name}" berhasil ditambahkan.`,
      type: "success",
    });
  };

  return (
    <>
      <h1 className="admin-title">Data Permission</h1>

      <section className="admin-panel">
        <div className="admin-filters">
          <div className="admin-search">
            <Icon name="search" size={16} />
            <input
              type="text"
              placeholder="Cari username.."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <p className="perm-legend">
            Keterangan warna:
            <span className="perm-legend-item">
              <i className="perm-dot"></i> izin dari role
            </span>
            <span className="perm-legend-item">
              <i className="perm-dot direct"></i> izin khusus user
            </span>
          </p>
          <button className="admin-add-btn" onClick={() => setShowAdd(true)}>
            <Icon name="plus" size={16} /> Tambah Permission
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
                <th>Username</th>
                <th>Permission</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((user, index) => {
                const p = perms[user.id];
                const isMe = user.id === me?.id;
                return (
                  <tr key={user.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{user.username}</td>
                    <td>
                      {!p && <span className="admin-empty">Memuat...</span>}
                      {p?.error && (
                        <span className="admin-form-error">{p.error}</span>
                      )}
                      {p && !p.error && (
                        <div className="perm-list">
                          {p.effective.length === 0 && (
                            <span className="admin-empty">-</span>
                          )}
                          {p.effective.map((name) => (
                            <span
                              key={name}
                              className={`perm-chip ${p.viaRoles.includes(name) ? "" : "direct"}`}
                            >
                              {formatPermission(name)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        className="admin-icon-btn edit"
                        onClick={() => setEditing(user)}
                        disabled={!p || Boolean(p.error) || isMe}
                        title={
                          isMe
                            ? "Tidak bisa mengatur izin akun sendiri"
                            : "Edit"
                        }
                        aria-label={`Edit permission ${user.username}`}
                      >
                        <Icon name="edit" size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {loading && (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={safePage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </section>

      {editing && perms[editing.id] && !perms[editing.id].error && (
        <EditPermissionModal
          user={editing}
          perms={perms[editing.id]}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {showAdd && (
        <AddPermissionModal
          onSubmit={handleCreate}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  );
}

export default AdminPermissions;
