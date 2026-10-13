import { Link } from "react-router-dom";
import logo from "../../assets/ESPORTIFY-Logo.png";
import "../../styles/auth.css";

// Kerangka halaman login & register: teks di kiri, kartu form di kanan
function AuthShell({ heading, highlight, description, children }) {
  return (
    <div className="auth">
      <section className="auth-left">
        <Link to="/" className="logo">
          <img src={logo} alt="ESPORTIFY" className="logo-img" />
          ESPORTIFY
        </Link>

        <div className="auth-intro">
          <h1>
            {heading}
            <br />
            <span>{highlight}</span>
          </h1>
          <p>{description}</p>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-card">{children}</div>
      </section>
    </div>
  );
}

export default AuthShell;
