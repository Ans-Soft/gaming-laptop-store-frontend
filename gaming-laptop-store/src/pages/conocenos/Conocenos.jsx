import { Link } from "react-router-dom";
import "../../styles/conocenos.css";

const WA_LINK =
  "https://wa.me/573012661811?text=Vengo%20de%20su%20p%C3%A1gina%2C%20quiero%20hablar%20con%20un%20asesor";

const FEATURES = [
  { title: "Precios justos" },
  { title: "Asesoría personalizada" },
  { title: "Garantía real" },
  { title: "Soporte técnico y postventa" },
];

function CtaButtons() {
  return (
    <div className="cn-btn-group">
      <Link to="/catalogo" className="cn-btn cn-btn--primary">
        Ver productos
      </Link>
      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="cn-btn cn-btn--outline"
      >
        Contactar un asesor
      </a>
    </div>
  );
}


export default function Conocenos() {
  return (
    <div className="cn-page">

      {/* ── 1. HERO ── */}
      <section className="cn-hero">
        <div className="cn-hero-inner">
          <span className="cn-eyebrow">Desde 2023 en Colombia</span>
          <h1 className="cn-hero-title">
            Tecnología de alto rendimiento al precio que realmente vale
          </h1>
          <p className="cn-hero-desc">
            Precios justos, asesoría personalizada y valor real en cada
            producto, sin intermediarios ni complicaciones.
          </p>
          <CtaButtons />
        </div>
      </section>

      {/* ── 2. QUIÉNES SOMOS ── */}
      <section className="cn-section cn-quienes">
        <div className="cn-quienes-text">
          <h2 className="cn-section-title">Quiénes somos Patecnológicos</h2>
          <p>
            Somos una empresa colombiana especializada en tecnología de alto
            rendimiento. Desde 2023 nos hemos dedicado a ofrecer portátiles,
            gráficas y equipos de cómputo a precios accesibles, con asesoría
            real y transparente.
          </p>
          <p>
            Trabajamos directamente con distribuidores para eliminar
            intermediarios y trasladarle el ahorro al cliente. Porque creemos
            que la tecnología de calidad no debería estar fuera del alcance
            de nadie.
          </p>
          <p>
            Nuestro equipo te acompaña en cada paso: desde elegir el equipo
            correcto hasta resolver cualquier duda después de la compra.
          </p>
        </div>
        <img
          src="/assets/conocenos/conocenos-techimage.jpg"
          alt="Equipo tecnológico de alto rendimiento"
          className="cn-img--tall"
        />
      </section>

      {/* ── 3. NUESTRA RAZÓN DE SER ── */}
      <section className="cn-razon">
        <div className="cn-razon-inner">
          <div className="cn-razon-text">
            <span className="cn-label">Nuestra razón de ser</span>
            <h2 className="cn-razon-title">
              Porque la tecnología no debería costar de más
            </h2>
            <p>
              Patecnológicos nació con una convicción clara: ofrecer tecnología
              de avance y rendimiento a precios accesibles. Nos comprometemos
              con la calidad sin intermediarios, lo que nos permite dar la
              mejor relación precio-rendimiento del mercado.
            </p>
            <p>
              No nos comprometemos con lo "barato", sino con lo justo. Cada
              equipo que vendemos ha sido revisado y verificado para que
              encuentres el producto de mayor rendimiento al precio que
              realmente vale.
            </p>
          </div>
          <img
            src="/logo.png"
            alt="Logo Patecnológicos"
            className="cn-img--logo"
          />
        </div>
      </section>

      {/* ── 4. LO QUE NOS DIFERENCIA ── */}
      <section className="cn-section cn-diferencia">
        <h2 className="cn-section-title cn-centered">Lo que nos diferencia</h2>
        <div className="cn-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="cn-feature-card">
              <span className="cn-feature-title">{f.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. RESPALDO TOTAL ── */}
      <section className="cn-section cn-respaldo">
        <div className="cn-respaldo-text">
          <h2 className="cn-section-title">Respaldo total</h2>
          <h3 className="cn-respaldo-sub">Tu compra está respaldada</h3>
          <ul className="cn-respaldo-list">
            <li>Vendemos únicamente equipos revisados y verificados antes de la entrega.</li>
            <li>Contamos con garantía en todos nuestros productos.</li>
            <li>Llevamos la logística a tu puerta con seguimiento de envío.</li>
            <li>¿Dudas después de la compra? Nuestro equipo responde.</li>
            <li>¿Hubo un problema? Te lo resolvemos, sin excusas.</li>
          </ul>
        </div>
        <img
          src="/assets/conocenos/conocenos-trustworthy.jpg"
          alt="Compra respaldada con garantía"
          className="cn-img--tall"
        />
      </section>

      {/* ── 6. FINAL CTA ── */}
      <section className="cn-section cn-cta-wrap">
        <div className="cn-cta-box">
          <h2 className="cn-cta-title">
            Compra con confianza. Nosotros te asesoramos.
          </h2>
          <p className="cn-cta-desc">
            Encuentra en nuestro catálogo el equipo que buscas o contáctanos
            directamente. Un asesor te guiará según tu uso y presupuesto.
          </p>
          <CtaButtons />
        </div>
      </section>

    </div>
  );
}
