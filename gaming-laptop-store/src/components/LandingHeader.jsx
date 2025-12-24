import "../styles/landingHeader.css"
import logo from "../assets/logo.png"
import { Link } from "react-router-dom";

export default function LandingHeader() {
  return (
    <header className="navbar">
      <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <img src={logo} alt="Patecnológicos Logo" />
            <span>Patecnológicos</span>  
          </Link>


        {/* LINKS */}
        <nav className="navbar-links">
          <Link to="/">Inicio</Link>
          <a href="#nosotros">Nosotros</a>
          <a href="#envios">Envíos</a>
          <Link to="/catalogo">Catálogo</Link>
        </nav>
      </div>
    </header>
  );
}
