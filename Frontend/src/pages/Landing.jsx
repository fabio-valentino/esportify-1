import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import logo from "../assets/ESPORTIFY-Logo.png";
import { useAuth } from "../context/AuthContext";
import { homePathFor } from "../utils/role";
import {
  getLatestTournaments,
  getSupportedGames,
  getTopCommunities,
} from "../services/landingApi";
import LdIcon from "../components/landing/LandingIcons";
import Poster from "../components/landing/Poster";
import TournamentCard from "../components/landing/TournamentCard";
import CommunityCard from "../components/landing/CommunityCard";
import GuestGateModal from "../components/landing/GuestGateModal";
import "../styles/landing.css";

/* ---------------- Konfigurasi route ----------------
   null = halamannya belum ada. Isi saat halaman publik / detail sudah dibuat.
   Selama null: tombol "Jelajahi" menggulir ke section, link "Lihat Semua" disembunyikan,
   dan setelah login Guest dikembalikan ke halaman beranda user. */
const PATHS = {
  tournamentsAll: null, // contoh: "/tournaments"
  communitiesAll: null, // contoh: "/communities"
  organize: null, // contoh: "/tournaments/create"
  // Isi saat route detail sudah ada di App.jsx. Selama null, setelah login user
  // dibawa ke beranda (bukan ke halaman kosong).
  tournamentDetail: null, // contoh: (id) => `/tournaments/${id}`
  communityDetail: null, // contoh: (id) => `/communities/${id}`
};

// Fungsi level modul supaya referensinya stabil untuk useAsync
const loadTournaments = () => getLatestTournaments(3);
const loadCommunities = () => getTopCommunities(3);
const loadGames = () => getSupportedGames();

// GAME_LIMIT: jumlah game yang ditampilkan di section "Game yang Didukung".
// Ganti 3 / 4 / 5 sesuai selera tampilan. Urutan "terpopuler" ditentukan backend.
const GAME_LIMIT = 5;

function useAsync(fn) {
  const [state, setState] = useState({ status: "loading", data: [] });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let off = false;
    setState((s) => ({ ...s, status: "loading" }));
    fn()
      .then((data) => !off && setState({ status: "ok", data }))
      .catch(() => !off && setState({ status: "error", data: [] }));
    return () => {
      off = true;
    };
  }, [fn, tick]);

  return [state, () => setTick((t) => t + 1)];
}

function CardGrid({ state, retry, emptyText, render }) {
  if (state.status === "loading") {
    return (
      <div className="ld-grid" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="ld-card ld-skel" />
        ))}
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="ld-state">
        <p>Data belum bisa dimuat.</p>
        <button type="button" className="ld-btn ld-btn-s" onClick={retry}>
          Coba lagi
        </button>
      </div>
    );
  }
  if (!state.data.length) {
    return (
      <div className="ld-state">
        <p>{emptyText}</p>
      </div>
    );
  }
  return <div className="ld-grid">{state.data.map(render)}</div>;
}

function SectionHead({ id, title, sub, linkTo, linkText, onLink }) {
  return (
    <div className="ld-sec-head" id={id}>
      <div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      {linkTo !== undefined && linkTo !== null && (
        <button type="button" className="ld-link" onClick={onLink}>
          {linkText} <LdIcon name="external" size={14} />
        </button>
      )}
    </div>
  );
}

/* Judul + subjudul rata tengah, pakai inline style supaya
   tidak bergantung pada landing.css (tidak bisa kalah oleh rule lain). */
function CenterHead({ title, sub }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        width: "100%",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 30,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: "8px 0 0",
          maxWidth: 640,
          textAlign: "center",
          color: "var(--ld-tx2, #94a3b8)",
        }}
      >
        {sub}
      </p>
    </div>
  );
}

const FEATURES = [
  {
    icon: "trophy",
    tone: "blue",
    title: "Temukan Turnamen Berikutnya.",
    text: "Jelajahi berbagai turnamen berdasarkan game yang kamu mainkan. Periksa jadwal, hadiah, biaya pendaftaran, dan ketersediaan slot sebelum memutuskan untuk bergabung.",
    cta: "Jelajahi Turnamen",
    target: "turnamen",
  },
  {
    icon: "users",
    tone: "violet",
    title: "Squad-mu, Perjalananmu.",
    text: "Bangun tim, kelola anggota, ikuti turnamen, dan pantau perjalanan kompetitif Squad melalui riwayat kompetisi serta pencapaian.",
    cta: "Bangun Squad",
    target: "register",
  },
  {
    icon: "network",
    tone: "green",
    title: "Temukan Komunitasmu.",
    text: "Cari komunitas sesuai game dan minatmu, bagikan postingan, berinteraksi melalui komentar, dan terhubung dengan pemain lain.",
    cta: "Jelajahi Komunitas",
    target: "komunitas",
  },
];

const STEPS = [
  ["Ajukan Turnamen", "Isi informasi turnamen dan unggah dokumen pendukung."],
  ["Validasi Admin", "Pengajuanmu ditinjau oleh Admin Platform."],
  ["Publikasi", "Turnamen yang disetujui tampil di Esportify."],
];

function Landing() {
  const navigate = useNavigate();
  const { user, loading: checking } = useAuth();

  const [tournaments, retryT] = useAsync(loadTournaments);
  const [communities, retryC] = useAsync(loadCommunities);
  const [games] = useAsync(loadGames);
  const [gate, setGate] = useState(null); // { from: string | null }

  const closeGate = useCallback(() => setGate(null), []);

  // Sudah login? Landing bukan untuk mereka (sama seperti perilaku "/" sebelumnya)
  if (!checking && user) return <Navigate to={homePathFor(user)} replace />;

  const scrollTo = (id) => (e) => {
    e?.preventDefault();
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goExplore = () => {
    if (PATHS.tournamentsAll) navigate(PATHS.tournamentsAll);
    else scrollTo("turnamen")();
  };

  // Guest menekan kartu: simpan URL tujuan, minta login
  const openTournament = (item) =>
    setGate({ from: PATHS.tournamentDetail?.(item.id) ?? null });
  const openCommunity = (item) =>
    setGate({ from: PATHS.communityDetail?.(item.id) ?? null });

  const toLogin = (from) =>
    navigate("/login", { state: from ? { from } : undefined });

  const featureAction = (target) => {
    if (target === "register") navigate("/register");
    else scrollTo(target)();
  };

  const heroPosters = [0, 1, 2].map((i) => tournaments.data[i] || null);
  const shownGames = games.data.slice(0, GAME_LIMIT); // GAME_LIMIT

  return (
    <div className="ld-page">
      {/* ---------- Navbar ---------- */}
      <header className="ld-nav">
        <div className="ld-wrap ld-nav-in">
          <Link to="/" className="ld-logo">
            <img src={logo} alt="" />
            ESPORTIFY
          </Link>
          <nav className="ld-nav-links" aria-label="Navigasi utama">
            <a href="#turnamen" onClick={scrollTo("turnamen")}>
              Turnamen
            </a>
            <a href="#komunitas" onClick={scrollTo("komunitas")}>
              Komunitas
            </a>
            <a href="#penyelenggara" onClick={scrollTo("penyelenggara")}>
              Penyelenggara
            </a>
          </nav>
          <div className="ld-nav-act">
            <Link to="/login" className="ld-btn ld-btn-g">
              Masuk
            </Link>
            <Link to="/register" className="ld-btn ld-btn-p">
              Daftar
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---------- Hero ---------- */}
        <section className="ld-hero">
          <div className="ld-wrap ld-hero-in">
            <div className="ld-hero-text">
              <span className="ld-pill">Terhubung. Tanding. Taklukkan.</span>
              <h1>
                Temukan Pertandinganmu.
                <br />
                <em>Bangun Dominasi.</em>
              </h1>
              <p>
                Jelajahi turnamen, bangun Squad, dan temukan komunitas yang
                punya semangat bermain sepertimu. Semua terhubung dalam satu
                platform gaming.
              </p>
              <div className="ld-hero-cta">
                <button
                  type="button"
                  className="ld-btn ld-btn-p ld-btn-lg"
                  onClick={goExplore}
                >
                  Jelajahi Esportify <LdIcon name="arrow" size={18} />
                </button>
                <Link to="/register" className="ld-btn ld-btn-s ld-btn-lg">
                  Buat Akun Gratis
                </Link>
              </div>
            </div>

            <div className="ld-hero-art" aria-hidden="true">
              {heroPosters.map((t, i) => (
                <div key={i} className={`ld-hero-frame f${i}`}>
                  <Poster src={t?.poster} alt="" fallbackText={t?.name || ""} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Game yang didukung ---------- */}
        {(games.status === "loading" || shownGames.length > 0) && (
          <section className="ld-games">
            <div className="ld-wrap">
              <CenterHead
                title="Game yang Didukung"
                sub="Temukan turnamen dan komunitas berdasarkan game favoritmu."
              />
              <div className="ld-game-row">
                {games.status === "loading"
                  ? Array.from({ length: GAME_LIMIT }, (_, i) => i).map((i) => (
                      <div key={i} className="ld-game">
                        <div className="ld-game-ic ld-skel" />
                      </div>
                    )) /* GAME_LIMIT */
                  : shownGames.map((g) => (
                      <div key={g.id} className="ld-game">
                        <div className="ld-game-ic">
                          <Poster
                            src={g.icon}
                            alt={g.name}
                            fallbackText={g.name.charAt(0).toUpperCase()}
                          />
                        </div>
                        <span>{g.name}</span>
                      </div>
                    ))}
                {games.data.length > GAME_LIMIT && (
                  /* GAME_LIMIT */
                  <div className="ld-game">
                    <div className="ld-game-ic ld-game-more">
                      <LdIcon name="gamepad" size={28} />
                    </div>
                    <span>Dan Lainnya</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ---------- Turnamen terbaru ---------- */}
        <section className="ld-sec">
          <div className="ld-wrap">
            <SectionHead
              id="turnamen"
              title="Turnamen Pilihan"
              sub="Periksa jadwal, hadiah, biaya, dan slot sebelum bergabung."
              linkTo={PATHS.tournamentsAll}
              linkText="Lihat Semua Turnamen"
              onLink={() => navigate(PATHS.tournamentsAll)}
            />
            <CardGrid
              state={tournaments}
              retry={retryT}
              emptyText="Belum ada turnamen yang dipublikasikan."
              render={(item) => (
                <TournamentCard
                  key={item.id}
                  item={item}
                  onOpen={openTournament}
                />
              )}
            />
          </div>
        </section>

        {/* ---------- Komunitas terbanyak anggota ---------- */}
        <section className="ld-sec ld-sec-alt">
          <div className="ld-wrap">
            <SectionHead
              id="komunitas"
              title="Komunitas"
              sub="Temukan komunitas sesuai game dan minatmu."
              linkTo={PATHS.communitiesAll}
              linkText="Lihat Semua Komunitas"
              onLink={() => navigate(PATHS.communitiesAll)}
            />
            <CardGrid
              state={communities}
              retry={retryC}
              emptyText="Belum ada komunitas yang tersedia."
              render={(item) => (
                <CommunityCard
                  key={item.id}
                  item={item}
                  onOpen={openCommunity}
                />
              )}
            />
          </div>
        </section>

        {/* ---------- Fitur unggulan ---------- */}
        <section className="ld-sec">
          <div className="ld-wrap">
            <CenterHead
              title="Satu Platform untuk Bertanding"
              sub="Temukan turnamen, bangun Squad, dan terhubung dengan komunitas game dalam satu platform."
            />
            <div className="ld-grid ld-feat-grid">
              {FEATURES.map((f) => (
                <div key={f.title} className="ld-card ld-feat">
                  <div className={`ld-feat-ic ${f.tone}`}>
                    <LdIcon name={f.icon} size={22} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                  <button
                    type="button"
                    className="ld-link"
                    onClick={() => featureAction(f.target)}
                  >
                    {f.cta} <LdIcon name="arrow" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Penyelenggara ---------- */}
        <section className="ld-sec" id="penyelenggara">
          <div className="ld-wrap">
            <div className="ld-org">
              <div>
                <span className="ld-eyebrow">UNTUK PENYELENGGARA</span>
                <h2>Punya Turnamen? Bawa ke Esportify.</h2>
                <p>
                  Ajukan turnamenmu, lengkapi informasi dan dokumen pendukung,
                  lalu ikuti proses validasi agar turnamen dapat dipublikasikan
                  melalui Esportify.
                </p>
                <button
                  type="button"
                  className="ld-btn ld-btn-p ld-btn-lg"
                  onClick={() => toLogin(PATHS.organize)}
                >
                  Ajukan Turnamen <LdIcon name="arrow" size={18} />
                </button>
              </div>
              <ol className="ld-steps">
                {STEPS.map(([title, text], i) => (
                  <li key={title}>
                    <span>{i + 1}</span>
                    <div>
                      <b>{title}</b>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ---------- CTA penutup ---------- */}
        <section className="ld-sec ld-sec-tight">
          <div className="ld-wrap">
            <div className="ld-final">
              <h2>Siap bergabung?</h2>
              <p>
                Jelajahi turnamen dan komunitas lebih dulu, buat akun saat kamu
                siap.
              </p>
              <div className="ld-hero-cta ld-center">
                <Link to="/register" className="ld-btn ld-btn-p ld-btn-lg">
                  Buat Akun Gratis
                </Link>
                <button
                  type="button"
                  className="ld-btn ld-btn-s ld-btn-lg"
                  onClick={goExplore}
                >
                  Jelajahi Esportify
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="ld-foot">
        <div className="ld-wrap">
          <div className="ld-foot-top">
            <div>
              <Link to="/" className="ld-logo">
                <img src={logo} alt="" />
                ESPORTIFY
              </Link>
              <p>
                Platform esports untuk menemukan turnamen, membangun Squad, dan
                terhubung dengan komunitas.
              </p>
            </div>
            <nav aria-label="Navigasi footer">
              <a href="#turnamen" onClick={scrollTo("turnamen")}>
                Turnamen
              </a>
              <a href="#komunitas" onClick={scrollTo("komunitas")}>
                Komunitas
              </a>
              <Link to="/login">Masuk</Link>
              <Link to="/register">Daftar</Link>
            </nav>
          </div>
          <div className="ld-foot-bot">
            <span>© 2026 ESPORTIFY. Hak cipta dilindungi.</span>
          </div>
        </div>
      </footer>

      {gate && (
        <GuestGateModal
          onClose={closeGate}
          onLogin={() => toLogin(gate.from)}
          onRegister={() => navigate("/register")}
        />
      )}
    </div>
  );
}

export default Landing;
