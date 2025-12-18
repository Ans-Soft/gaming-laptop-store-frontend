import "../styles/landingHeader.css"
import logo from "../assets/logo.png"

export default function LandingHeader() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <div className="navbar-logo">
          <img src={logo} alt="Patecnológicos Logo" />
          <span>Patecnológicos</span>
        </div>

        {/* LINKS */}
        <nav className="navbar-links">
          <a href="#inicio">Inicio</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#envios">Envíos</a>
          <a href="#catalogo">Catálogo</a>
        </nav>
      </div>
    </header>
  );
}
