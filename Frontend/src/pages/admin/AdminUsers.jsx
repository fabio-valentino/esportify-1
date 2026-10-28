import { useEffect, useState } from "react";
import Icon from "../../components/icon";
import AddUserModal from "../../components/admin/AddUserModal";
import { useAuth } from "../../context/AuthContext";
import Pagination from "../../components/admin/Pagination";
import {
  getUsers,
  getRoles,
  updateUsers,
  deleteUser,
  createUser,
} from "../../services/adminApi";
// 403 bisa berarti tidak punya izin atau aksi dilarang (mis. hapus akun sendiri)
const errorText = (err) =>
  err.status === 403 ? err.message || "Aksi ini tidak diizinkan." : err.message;

const PAGE_SIZE = 5;

function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [roles, setRoles] = useState([]);
  const [rolesFailed, setRolesFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Users dan roles dimuat terpisah: roles butuh permission berbeda (kelola_role)
  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setMessage({ text: errorText(err), type: "error" }))
      .finally(() => setLoading(false));

    getRoles()
      .then(setRoles)
      .catch(() => setRolesFailed(true));
  }, []);

  // Filter dikerjakan di klien, karena backend belum punya search/filter
  const keyword = search.toLowerCase();
  const filtered = users.filter(
    (u) =>
      (u.username.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword)) &&
      (!roleFilter || u.role === roleFilter) &&
      (!statusFilter || u.status === statusFilter),
  );

  // safePage menjaga agar tidak melebihi halaman terakhir setelah hapus atau filter
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  // Role user saat ini selalu ada di pilihan dropdown
  const roleOptionsFor = (user) =>
    user.role && !roles.includes(user.role) ? [user.role, ...roles] : roles;

  // Role atau status berubah: langsung disimpan, dikembalikan kalau gagal
  const handleInline = async (user, field, value) => {
    if (
      user.id === me?.id &&
      field === "status" &&
      value === "nonaktif" &&
      !window.confirm("Kamu akan menonaktifkan akunmu sendiri. Lanjutkan?")
    ) {
      return;
    }

    const previous = user[field];
    const apply = (v) =>
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, [field]: v } : u)),
      );

    apply(value);
    setMessage({ text: "", type: "" });

    const { failed } = await updateUsers([
      {
        id: user.id,
        role: field === "role" ? value : user.role,
        status: field === "status" ? value : user.status,
        roleChanged: field === "role",
        statusChanged: field === "status",
      },
    ]);

    if (failed.length > 0) {
      apply(previous);
      setMessage({ text: failed[0].message, type: "error" });
    } else {
      setMessage({
        text: `${user.username}: perubahan disimpan.`,
        type: "success",
      });
    }
  };

  const handleDelete = async (user) => {
    if (user.id === me?.id) {
      setMessage({
        text: "Kamu tidak dapat menghapus akunmu sendiri.",
        type: "error",
      });
      return;
    }
    if (!window.confirm(`Hapus user "${user.username}"?`)) return;
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setMessage({ text: "User berhasil dihapus.", type: "success" });
    } catch (err) {
      setMessage({ text: errorText(err), type: "error" });
    }
  };

  // Dipanggil modal tambah. Error dilempar ke modal.
  const handleCreate = async (form) => {
    await createUser(form);
    try {
      setUsers(await getUsers());
      setMessage({ text: "User berhasil ditambahkan.", type: "success" });
    } catch {
      setMessage({
        text: "User berhasil dibuat, tetapi daftar gagal dimuat ulang. Muat ulang halaman.",
        type: "error",
      });
    }
  };

  return (
    <>
      <h1 className="admin-title">Users</h1>

      <section className="admin-panel">
        <div className="admin-filters">
          <div className="admin-search">
            <Icon name="search" size={18} />
            <input
              type="text"
              placeholder="Cari users"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="admin-filter-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Role</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>

          <button
            className="admin-outline-btn"
            onClick={() => setShowAdd(true)}
          >
            <Icon name="plus" size={16} /> Tambah User
          </button>
        </div>

        {rolesFailed && (
          <p className="admin-message error">
            Daftar role gagal dimuat (mungkin butuh izin kelola_role), jadi
            pengubahan role dinonaktifkan.
          </p>
        )}
        {message.text && (
          <p className={`admin-message ${message.type}`}>{message.text}</p>
        )}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="col-action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((user, index) => (
                <tr key={user.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className="admin-select role-select"
                      value={user.role}
                      disabled={rolesFailed}
                      onChange={(e) =>
                        handleInline(user, "role", e.target.value)
                      }
                    >
                      {roleOptionsFor(user).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className={`admin-select status-${user.status}`}
                      value={user.status}
                      onChange={(e) =>
                        handleInline(user, "status", e.target.value)
                      }
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </td>
                  <td className="col-action">
                    <div className="admin-actions">
                      <button
                        className="admin-icon-btn delete"
                        onClick={() => handleDelete(user)}
                        aria-label={`Hapus ${user.username}`}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Data user tidak ditemukan.
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
      {showAdd && (
        <AddUserModal
          roles={rolesFailed ? [] : roles}
          onSubmit={handleCreate}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  );
}

export default AdminUsers;
