import { Link } from "react-router-dom";

function PlaceholderPage({ title }) {
  return (
    <section className="placeholder">
      <h1>{title}</h1>
      <p>Halaman ini belum dibuat.</p>
      <Link to="/register" className="btn btn-primary">
        Kembali ke Register
      </Link>
    </section>
  );
}

export default PlaceholderPage;
