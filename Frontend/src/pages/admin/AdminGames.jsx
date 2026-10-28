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
} from "../../services/adminApi";

// 403 bisa berarti tidak punya izin
const errorText = (err) =>
  err.status === 403 ? err.message || "Aksi ini tidak diizinkan." : err.message;

// Warna pill kategori mengikuti urutan kategori (biru, putih, merah, ...)
const TONES = ["blue", "white", "red", "green", "yellow", "purple"];

function AdminGames() {
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
  const keyword = search.trim().toLowerCase();
  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(keyword),
  );

  const toneOf = (id) =>
    TONES[
      Math.max(
        0,
        categories.findIndex((c) => c.id === id),
      ) % TONES.length
    ];

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
    } catch (err) {
      // 422: "Game tidak dapat dihapus karena sudah memiliki turnamen."
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
                      className="admin-icon-btn edit with-label"
                      onClick={() => setCatModal({ item: c })}
                      aria-label={`Edit kategori ${c.name}`}
                    >
                      <Icon name="edit" size={18} /> Edit
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
        </div>

        <div className="game-toolbar">
          <div className="game-search">
            <Icon name="search" size={18} />
            <input
              type="text"
              placeholder="Cari game"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                <th className="col-action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.map((g) => (
                <tr
                  key={g.id}
                  className={g.status === "nonaktif" ? "inactive" : ""}
                >
                  <td>
                    <span className="game-avatar">
                      {g.avatar ? (
                        <img
                          src={
                            g.avatar.startsWith("http")
                              ? g.avatar
                              : `http://127.0.0.1:8000/storage/${g.avatar.replace(/^\/+/, "").replace(/^storage\//, "")}`
                          }
                          alt={g.name}
                          onError={(e) => {
                            console.error(
                              "Gambar game gagal dimuat:",
                              e.currentTarget.src,
                            );
                          }}
                        />
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
                          <span
                            key={id}
                            className={`game-chip tone-${toneOf(id)}`}
                          >
                            {label}
                          </span>
                        ) : null;
                      })}
                    </div>
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
                  <td colSpan={4} className="game-empty">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && filteredGames.length === 0 && (
                <tr>
                  <td colSpan={4} className="game-empty">
                    {games.length === 0
                      ? "Belum ada game."
                      : "Game tidak ditemukan."}
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
    </>
  );
}

export default AdminGames;
