import { useState, useRef, useEffect } from "react";
import "../styles/landingHeader.css";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header className="navbar">

      {/* ── TOP ROW: logo + social icons ── */}
      <div className="navbar-top">
        <div className="navbar-top-inner">

          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <img src={logo} alt="Patecnológicos Logo" />
            <span>Patecnologicos</span>
          </Link>

          <div className="navbar-top-right">
            <a
              href="https://www.instagram.com/patecnologicos/"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-social-link instagram"
              aria-label="Instagram de Patecnológicos"
            >
              <FaInstagram />
            </a>
            <a
              href="https://wa.me/573012661811"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-social-link whatsapp"
              aria-label="WhatsApp de Patecnológicos"
            >
              <FaWhatsapp />
            </a>

            {/* Hamburger — visible on mobile only */}
            <button
              className={`navbar-hamburger${menuOpen ? " is-open" : ""}`}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

        </div>
      </div>

      {/* ── BOTTOM ROW: centered nav links ── */}
      <div className={`navbar-bottom${menuOpen ? " is-open" : ""}`}>
        <nav className="navbar-links">
          <Link to="/" onClick={closeMenu}>Inicio</Link>
          <Link to="/catalogo" onClick={closeMenu}>Productos</Link>
          <Link to="/conocenos" onClick={closeMenu}>Nosotros</Link>
          <Link to="/envios" onClick={closeMenu}>Envíos</Link>

          {/* Policies dropdown — click-based, outside-click closes */}
          <div
            ref={dropdownRef}
            className={`navbar-dropdown${dropdownOpen ? " is-open" : ""}`}
          >
            <button
              className="navbar-dropdown-trigger"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              Nuestras políticas
              <span className="navbar-dropdown-arrow" aria-hidden="true">▾</span>
            </button>

            <div className="navbar-dropdown-menu">
              <Link to="/politica-de-privacidad" onClick={closeMenu}>
                Política de privacidad
              </Link>
              <a
                href="https://drive.google.com/file/d/1wwVvhp9dB5dFVwS1fJ-6HX4jGq5Fqiao/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
              >
                Políticas de garantía
              </a>
            </div>
          </div>
        </nav>
      </div>

    </header>
  );
}
