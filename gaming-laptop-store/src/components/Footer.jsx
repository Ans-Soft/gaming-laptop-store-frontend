import "../styles/footer.css";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";

const GUARANTEE_URL =
  "https://drive.google.com/file/d/1wwVvhp9dB5dFVwS1fJ-6HX4jGq5Fqiao/view?usp=drive_link";

const RUT_WA_URL =
  "https://wa.me/573012661811?text=Hola%2C%20%C2%BFCuentan%20con%20RUT%20y%20C%C3%A1mara%20de%20Comercio%3F";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* ── LEFT: brand + social icons ── */}
        <div className="footer-brand">
          <Link to="/" aria-label="Inicio">
            <img src={logo} alt="Patecnológicos" className="footer-logo" />
          </Link>

          <div className="footer-socials">
            <a
              href="https://wa.me/573012661811"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link whatsapp"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
            <a
              href="https://www.instagram.com/patecnologicos/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link instagram"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.facebook.com/people/Patecnologicos/61555822834562/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link facebook"
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>
            <a
              href="https://www.tiktok.com/@patecnologicos"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link tiktok"
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
          </div>
        </div>

        {/* ── CENTER: Nosotros ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Nosotros</h4>
          <Link to="/conocenos">Conócenos</Link>
          <Link to="/contactanos">Contáctanos</Link>
          <Link to="/politica-de-privacidad">Política de privacidad</Link>
        </div>

        {/* ── CENTER: Proceso de Compra ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Proceso de Compra</h4>
          <Link to="/envios#metodos-pago">Métodos de pago</Link>
          <Link to="/envios#metodo-aliado">Método aliado</Link>
          <Link to="/envios#envios">Envíos</Link>
          <Link to="/envios#contraentrega">Contraentrega</Link>
        </div>

        {/* ── RIGHT: Legal ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Legal</h4>
          <a
            href={GUARANTEE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de garantías
          </a>
          <a
            href={RUT_WA_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            RUT y Cámara de Comercio
          </a>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <p>Patecnologicos. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
