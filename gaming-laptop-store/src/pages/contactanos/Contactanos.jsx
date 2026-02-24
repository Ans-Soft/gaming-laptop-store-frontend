import "../../styles/contactanos.css";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

const WA_LINK =
  "https://wa.me/573012661811?text=Hola%2C%20vengo%20de%20su%20p%C3%A1gina%20y%20quiero%20hablar%20con%20un%20asesor";

const MAP_SRC =
  "https://maps.google.com/maps?q=Carrera+86A+%235-69+Cali+Valle+del+Cauca+Colombia&t=&z=15&ie=UTF8&iwloc=&output=embed";

const FORM_SRC =
  "https://docs.google.com/forms/d/e/1FAIpQLSeaTFzik6WJO0ZZLBnhJtY_93H9ZVBQkaWKkEdqdIB-qgb9jw/viewform?embedded=true";

const SOCIAL_CARDS = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    Icon: FaWhatsapp,
    handle: "+57 301 266 1811",
    href: WA_LINK,
  },
  {
    id: "instagram",
    name: "Instagram",
    Icon: FaInstagram,
    handle: "@patecnologicos",
    href: "https://www.instagram.com/patecnologicos/",
  },
  {
    id: "facebook",
    name: "Facebook",
    Icon: FaFacebook,
    handle: "Patecnologicos",
    href: "https://www.facebook.com/people/Patecnologicos/61555822834562/",
  },
  {
    id: "tiktok",
    name: "TikTok",
    Icon: FaTiktok,
    handle: "@patecnologicos",
    href: "https://www.tiktok.com/@patecnologicos",
  },
];

export default function Contactanos() {
  return (
    <div className="ct-page">

      {/* ── 1. HERO ── */}
      <section className="ct-hero">
        <div className="ct-hero-inner">
          <h1 className="ct-hero-title">Contáctanos</h1>
          <p className="ct-hero-subtitle">Hablemos. Estamos para asesorarte</p>
          <p className="ct-hero-desc">
            Tienes dudas, necesitas asesoría de compra o soporte técnico?
            Escríbenos y le responderemos lo antes posible.
          </p>
        </div>
      </section>

      {/* ── 2. GOOGLE MAP (full width) ── */}
      <div className="ct-map-section">
        <div className="ct-map-inner">
          <iframe
            title="Ubicación Patecnológicos — Carrera 86A #5-69, Cali"
            src={MAP_SRC}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* ── 3. FORM (left) + CONTACT INFO (right) ── */}
      <section className="ct-section">
        <div className="ct-split">

          {/* Left: embedded form */}
          <div className="ct-split-left">
            <h2 className="ct-section-title">Envíanos un mensaje</h2>
            <p className="ct-form-note">Tu información es privada y segura.</p>
            <div className="ct-form-wrapper">
              <iframe
                src={FORM_SRC}
                title="Formulario de contacto Patecnológicos"
              >
                Cargando…
              </iframe>
            </div>
          </div>

          {/* Right: contact details stacked */}
          <div className="ct-split-right">
            <h2 className="ct-section-title">Información de contacto</h2>
            <div className="ct-info-stack">

              <div className="ct-info-card">
                <FaWhatsapp className="ct-info-icon ct-info-icon--whatsapp" />
                <div>
                  <span className="ct-info-label">WhatsApp</span>
                  <a
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ct-info-value ct-info-link"
                  >
                    +57 301 266 1811
                  </a>
                </div>
              </div>

              <div className="ct-info-card">
                <FaMapMarkerAlt className="ct-info-icon ct-info-icon--location" />
                <div>
                  <span className="ct-info-label">Dirección</span>
                  <span className="ct-info-value">
                    Carrera 86A #5-69, Cali, Valle del Cauca
                  </span>
                </div>
              </div>

              <div className="ct-info-card">
                <FaClock className="ct-info-icon ct-info-icon--schedule" />
                <div>
                  <span className="ct-info-label">Horario de atención</span>
                  <span className="ct-info-value">
                    Lunes a Viernes 9:00 a.m. a 6:00 p.m.
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 4. SOCIAL CARDS ── */}
      <section className="ct-section ct-social-section">
        <h2 className="ct-section-title ct-centered">
          También puedes contactarnos por
        </h2>
        <div className="ct-social-grid">
          {SOCIAL_CARDS.map(({ id, name, Icon, handle, href }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`ct-social-card ct-social-card--${id}`}
            >
              <Icon className="ct-social-icon" />
              <span className="ct-social-name">{name}</span>
              <span className="ct-social-handle">{handle}</span>
            </a>
          ))}
        </div>
      </section>

    </div>
  );
}
