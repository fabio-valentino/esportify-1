import { useEffect, useState } from "react";
import Icon from "../../components/icon";
import Pagination from "../../components/admin/Pagination";
import AddUserModal from "../../components/admin/AddUserModal";
import { useAuth } from "../../context/AuthContext";
import {
  getUsers,
  getRoles,
  updateUsers,
  deleteUser,
  createUser,
  setUserRole,
} from "../../services/adminApi";

const PAGE_SIZE = 7;

// 403 bisa berarti tidak punya izin atau aksi dilarang (mis. hapus akun sendiri)
const errorText = (err) =>
  err.status === 403 ? err.message || "Aksi ini tidak diizinkan." : err.message;

function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [original, setOriginal] = useState([]); // untuk mendeteksi baris yang berubah
  const [roles, setRoles] = useState([]);
  const [rolesFailed, setRolesFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Users dan roles dimuat terpisah: roles butuh permission berbeda (kelola_role)
  useEffect(() => {
    getUsers()
      .then((data) => {
        setUsers(data);
        setOriginal(data);
      })
      .catch((err) => setMessage({ text: errorText(err), type: "error" }))
      .finally(() => setLoading(false));

    getRoles()
      .then(setRoles)
      .catch(() => setRolesFailed(true));
  }, []);

  // Filter (dikerjakan di klien, karena backend belum punya pagination/search)
  const keyword = search.toLowerCase();
  const filtered = users.filter(
    (u) =>
      (u.username.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword)) &&
      (!roleFilter || u.role === roleFilter) &&
      (!statusFilter || u.status === statusFilter),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  // Pastikan role user saat ini selalu ada di pilihan dropdown
  const roleOptionsFor = (user) =>
    user.role && !roles.includes(user.role) ? [user.role, ...roles] : roles;

  const handleFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleChange = (id, field, value) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)),
    );
    setMessage({ text: "", type: "" });
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
      setOriginal((prev) => prev.filter((u) => u.id !== user.id));
      setMessage({ text: "User berhasil dihapus.", type: "success" });
    } catch (err) {
      setMessage({ text: errorText(err), type: "error" });
    }
  };

  const handleSave = async () => {
    // Hanya baris yang berubah. Role dan status punya endpoint berbeda.

    const changes = users
      .map((u) => {
        const before = original.find((o) => o.id === u.id);
        if (!before) return null;
        return {
          id: u.id,
          role: u.role,
          status: u.status,
          roleChanged: before.role !== u.role,
          statusChanged: before.status !== u.status,
        };
      })
      .filter((c) => c && (c.roleChanged || c.statusChanged));

    if (changes.length === 0) {
      setMessage({ text: "Tidak ada perubahan.", type: "" });
      return;
    }

    // Menonaktifkan akun sendiri belum dilarang backend, jadi minta konfirmasi
    const selfDeactivate = changes.find(
      (c) => c.id === me?.id && c.status === "nonaktif",
    );
    if (
      selfDeactivate &&
      !window.confirm("Kamu akan menonaktifkan akunmu sendiri. Lanjutkan?")
    ) {
      return;
    }

    setSaving(true);
    try {
      const { succeeded, failed } = await updateUsers(changes);

      setOriginal((prev) =>
        prev.map((o) => {
          const edited = users.find((u) => u.id === o.id);

          return succeeded.includes(o.id) && edited ? edited : o;
        }),
      );

      if (failed.length === 0) {
        setMessage({ text: "Perubahan berhasil disimpan.", type: "success" });
      } else {
        const names = failed
          .map((f) => users.find((u) => u.id === f.id)?.username ?? f.id)
          .join(", ");
        setMessage({
          text: `${succeeded.length} berhasil, ${failed.length} gagal (${names}). ${failed[0].message}`,
          type: "error",
        });
      }
    } catch (err) {
      setMessage({ text: errorText(err), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Dipanggil modal. Error dilempar ke modal untuk ditampilkan di form.
  const handleCreate = async (form) => {
    await createUser(form);

    try {
      const fresh = await getUsers();
      setUsers(fresh);
      setOriginal(fresh);
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
      <h1 className="admin-title">Data User</h1>

      <section className="admin-panel">
        <div className="admin-filters">
          <div className="admin-search">
            <Icon name="search" size={16} />
            <input
              type="text"
              placeholder="Cari username atau email.."
              value={search}
              onChange={handleFilter(setSearch)}
            />
          </div>

          <select
            className="admin-filter-select"
            value={roleFilter}
            onChange={handleFilter(setRoleFilter)}
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
            onChange={handleFilter(setStatusFilter)}
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>

          <button className="admin-add-btn" onClick={() => setShowAdd(true)}>
            <Icon name="plus" size={16} /> Tambah User
          </button>
        </div>

        {rolesFailed && (
          <p className="admin-message error">
            Daftar role gagal dimuat (mungkin butuh izin kelola_role), jadi
            pengubahan role dinonaktifkan.
          </p>
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
                <th>Aksi</th>
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
                        handleChange(user.id, "role", e.target.value)
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
                        handleChange(user.id, "status", e.target.value)
                      }
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="admin-icon-btn delete"
                      onClick={() => handleDelete(user)}
                      aria-label={`Hapus ${user.username}`}
                    >
                      <Icon name="trash" size={18} />
                    </button>
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
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Data user tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-save-row">
          {message.text && (
            <span className={`admin-message ${message.type}`}>
              {message.text}
            </span>
          )}
          <button
            className="admin-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

        <Pagination
          page={safePage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </section>

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
