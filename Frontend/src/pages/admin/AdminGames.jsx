import { useEffect, useState } from "react";
import Icon from "../../components/icon";
import CategoryModal from "../../components/admin/CategoryModal";
import GameModal from "../../components/admin/GameModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  getCategories,
  createCategory,
  updateCategory,
  getGames,
  createGame,
  updateGame,
  deleteGame,
  setGameStatus,
} from "../../services/adminApi";

// 403 bisa berarti tidak punya izin
const errorText = (err) =>
  err.status === 403 ? err.message || "Aksi ini tidak diizinkan." : err.message;

function AdminGames() {
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Modal: { item } (item null = tambah)
  const [catModal, setCatModal] = useState(null);
  const [gameModal, setGameModal] = useState(null);
  // Dialog konfirmasi: { type: "delete" | "deactivate", game }
  const [confirm, setConfirm] = useState(null);
  const [working, setWorking] = useState(false);

  const loadAll = async () => {
    const [cats, gameList] = await Promise.all([getCategories(), getGames()]);
    setCategories(cats);
    setGames(gameList);
  };

  useEffect(() => {
    loadAll()
      .catch((err) => setMessage({ text: errorText(err), type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const categoryName = (id) => categories.find((c) => c.id === id)?.name;

  // Dipanggil modal. Error dilempar kembali supaya tampil di modal.
  const saveCategory = async (name) => {
    if (catModal.item) await updateCategory(catModal.item.id, name);
    else await createCategory(name);
    await loadAll();
    setMessage({ text: "Kategori berhasil disimpan.", type: "success" });
  };

  const saveGame = async (values) => {
    if (gameModal.item) await updateGame(gameModal.item.id, values);
    else await createGame(values);
    await loadAll();
    setMessage({ text: "Game berhasil disimpan.", type: "success" });
  };

  const handleDelete = async () => {
    const game = confirm.game;
    setWorking(true);
    try {
      await deleteGame(game.id);
      setGames((prev) => prev.filter((g) => g.id !== game.id));
      setMessage({ text: "Game berhasil dihapus.", type: "success" });
      setConfirm(null);
    } catch (err) {
      if (err.status === 409) {
        // Game sudah dipakai turnamen: tawarkan menonaktifkan
        setConfirm({ type: "deactivate", game });
      } else {
        setMessage({ text: errorText(err), type: "error" });
        setConfirm(null);
      }
    } finally {
      setWorking(false);
    }
  };

  const handleDeactivate = async () => {
    const game = confirm.game;
    setWorking(true);
    try {
      await setGameStatus(game.id, "nonaktif");
      setGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, status: "nonaktif" } : g)),
      );
      setMessage({
        text: `Game "${game.name}" dinonaktifkan.`,
        type: "success",
      });
    } catch (err) {
      setMessage({ text: errorText(err), type: "error" });
    } finally {
      setWorking(false);
      setConfirm(null);
    }
  };

  return (
    <>
      <h1 className="admin-title">Kelola Game</h1>

      {message.text && (
        <p className={`admin-message ${message.type}`}>{message.text}</p>
      )}

      {/* ===== Kategori ===== */}
      <section className="admin-panel game-section">
        <div className="game-section-head">
          <div>
            <h2>Kategori Game</h2>
            <p>Kelola kategori untuk filter</p>
          </div>
          <button
            className="admin-outline-btn"
            onClick={() => setCatModal({ item: null })}
          >
            <Icon name="plus" size={16} /> Tambah Kategori
          </button>
        </div>

        <div className="game-table-wrap">
          <table className="game-table">
            <thead>
              <tr>
                <th>Nama Kategori</th>
                <th className="col-action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td className="col-action">
                    <button
                      className="admin-icon-btn edit"
                      onClick={() => setCatModal({ item: c })}
                      aria-label={`Edit kategori ${c.name}`}
                    >
                      <Icon name="edit" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={2} className="game-empty">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && categories.length === 0 && (
                <tr>
                  <td colSpan={2} className="game-empty">
                    Belum ada kategori.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== Game ===== */}
      <section className="admin-panel game-section">
        <div className="game-section-head">
          <div>
            <h2>Daftar Game</h2>
            <p>Kelola data game</p>
          </div>
          <button
            className="admin-outline-btn"
            onClick={() => setGameModal({ item: null })}
          >
            <Icon name="plus" size={16} /> Tambah Game
          </button>
        </div>

        <div className="game-table-wrap">
          <table className="game-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Nama Game</th>
                <th>Kategori</th>
                <th>Status</th>
                <th className="col-action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.id}>
                  <td>
                    <span className="game-avatar">
                      {g.avatar ? (
                        <img src={g.avatar} alt={g.name} />
                      ) : (
                        g.name.charAt(0).toUpperCase()
                      )}
                    </span>
                  </td>
                  <td>{g.name}</td>
                  <td>
                    <div className="game-chips">
                      {g.categoryIds.map((id) => {
                        const label = categoryName(id);
                        return label ? (
                          <span key={id} className="game-chip">
                            {label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td>
                    <span className={`game-status ${g.status}`}>
                      {g.status === "aktif" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="col-action">
                    <div className="game-actions">
                      <button
                        className="admin-icon-btn edit"
                        onClick={() => setGameModal({ item: g })}
                        aria-label={`Edit ${g.name}`}
                      >
                        <Icon name="edit" size={18} />
                      </button>
                      <button
                        className="admin-icon-btn delete"
                        onClick={() => setConfirm({ type: "delete", game: g })}
                        aria-label={`Hapus ${g.name}`}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={5} className="game-empty">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && games.length === 0 && (
                <tr>
                  <td colSpan={5} className="game-empty">
                    Belum ada game.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {catModal && (
        <CategoryModal
          category={catModal.item}
          onSubmit={saveCategory}
          onClose={() => setCatModal(null)}
        />
      )}

      {gameModal && (
        <GameModal
          game={gameModal.item}
          categories={categories}
          onSubmit={saveGame}
          onClose={() => setGameModal(null)}
        />
      )}

      {confirm?.type === "delete" && (
        <ConfirmDialog
          tone="danger"
          icon="trash"
          title="Hapus Game?"
          confirmLabel="Hapus"
          loading={working}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        >
          <p>Apakah anda yakin ingin menghapus game "{confirm.game.name}"</p>
          <p>Data yang sudah dihapus tidak dapat dikembalikan</p>
        </ConfirmDialog>
      )}

      {confirm?.type === "deactivate" && (
        <ConfirmDialog
          tone="warning"
          icon="alert"
          title="Nonaktifkan Game?"
          confirmLabel="Nonaktifkan"
          loading={working}
          onConfirm={handleDeactivate}
          onClose={() => setConfirm(null)}
        >
          <p>Game "{confirm.game.name}" sudah digunakan oleh turnamen.</p>
          <p>Turnamen yang sudah ada tetap aman dan dapat diakses.</p>
          <p>Game tidak dapat dihapus, tetapi dapat dinonaktifkan.</p>
        </ConfirmDialog>
      )}
    </>
  );
}

export default AdminGames;
