import { useState, useEffect } from "react";
import "../../styles/envios.css";
import { FaWhatsapp } from "react-icons/fa";

const WA_LINK =
  "https://wa.me/573012661811?text=Hola%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20los%20m%C3%A9todos%20de%20pago%20y%20env%C3%ADos";

const SECTIONS = [
  { id: "metodos-pago",  label: "Métodos de pago"  },
  { id: "metodo-aliado", label: "Método aliado"     },
  { id: "envios",        label: "Envíos"            },
  { id: "contraentrega", label: "Contraentrega"     },
];

export default function Envios() {
  const [activeSection, setActiveSection] = useState("metodos-pago");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="env-page">
      <div className="env-layout">

        {/* ── SIDEBAR ── */}
        <aside className="env-sidebar">
          <p className="env-sidebar-title">Secciones</p>
          <nav className="env-sidebar-nav">
            {SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`env-sidebar-link${activeSection === id ? " is-active" : ""}`}
              >
                <span className="env-sidebar-icon" />
                {label}
              </a>
            ))}
          </nav>
          <div className="env-sidebar-help">
            <p>¿Necesitas ayuda?</p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="env-sidebar-wap"
            >
              <FaWhatsapp /> Contactar un asesor
            </a>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="env-main">

          {/* ── SECCIÓN 1: MÉTODOS DE PAGO ── */}
          <section id="metodos-pago" className="env-section">
            <h2 className="env-section-title">Métodos de pago</h2>
            <p className="env-section-lead">
              Aceptamos múltiples formas de pago para que elijas la que mejor se adapte a ti.
            </p>
            <ul className="env-payment-list">
              <li>Nequi</li>
              <li>Davivienda</li>
              <li>Bancolombia</li>
              <li>Tarjeta de crédito y débito</li>
              <li>Efectivo como parte de pago</li>
            </ul>
            <div className="env-note-box">
              <strong>Nota:</strong> Toda compra será gestionada a través del whatsapp oficial
              de Patecnologicos.
            </div>
          </section>

          {/* ── SECCIÓN 2: MÉTODO ALIADO ── */}
          <section id="metodo-aliado" className="env-section">
            <h2 className="env-section-title">Método aliado</h2>
            <p className="env-section-lead">
              Nuestro método más seguro para quienes prefieren revisar el equipo antes de pagar.
              Un aliado logístico lleva el producto hasta tu ciudad.
            </p>
            <ol className="env-steps-list">
              <li className="env-step-item">
                <span className="env-step-number">1</span>
                <span>Coordina con tu asesor el envío del producto.</span>
              </li>
              <li className="env-step-item">
                <span className="env-step-number">2</span>
                <span>Enviamos el equipo a la ciudad solicitada.</span>
              </li>
              <li className="env-step-item">
                <span className="env-step-number">3</span>
                <span>Revisas el equipo estética y funcionalmente.</span>
              </li>
              <li className="env-step-item">
                <span className="env-step-number">4</span>
                <span>Pagas el valor del equipo.</span>
              </li>
            </ol>
            <div className="env-dual-cards">
              <div className="env-info-card">
                Disponible en Pereira, Bogotá, Medellín y Buga.
              </div>
              <div className="env-info-card">
                Revisa tu equipo antes de pagar por sólo 70.000
              </div>
            </div>
          </section>

          {/* ── SECCIÓN 3: ENVÍOS ── */}
          <section id="envios" className="env-section">
            <h2 className="env-section-title">Envíos</h2>
            <p className="env-section-lead">
              Enviamos a todo Colombia con transportadoras líderes. Cada envío incluye guía
              y número de guía para que sigas tu pedido en tiempo real.
            </p>
            <div className="env-cards-grid">
              <div className="env-info-card">
                Trabajamos con Coordinadora e Interrapidísimo, líderes nacionales en logística
                y envíos.
              </div>
              <div className="env-info-card">
                Enviamos a todas las ciudades y municipios de Colombia. Principales y
                secundarios.
              </div>
              <div className="env-info-card">
                Envíos que toman 2 a 4 días hábiles a cualquier ciudad del país.
              </div>
              <div className="env-info-card">
                Una vez despachado tu pedido, recibirás el número de guía para rastrear tu
                envío en tiempo real.
              </div>
            </div>
          </section>

          {/* ── SECCIÓN 4: CONTRAENTREGA ── */}
          <section id="contraentrega" className="env-section">
            <h2 className="env-section-title">Contraentrega</h2>
            <p className="env-section-lead">
              Paga la mayor parte al recibir tu equipo. Solo necesitas un anticipo para
              asegurar tu pedido y nosotros nos encargamos del resto.
            </p>
            <ol className="env-steps-list">
              <li className="env-step-item">
                <span className="env-step-number">1</span>
                <span>Realizas un anticipo de 100.000 para solicitar el envío de tu equipo.</span>
              </li>
              <li className="env-step-item">
                <span className="env-step-number">2</span>
                <span>Enviamos el equipo a la dirección indicada.</span>
              </li>
              <li className="env-step-item">
                <span className="env-step-number">3</span>
                <span>Recibes el equipo y revisas su estado.</span>
              </li>
              <li className="env-step-item">
                <span className="env-step-number">4</span>
                <span>Pagas el restante del equipo por el método de pago que desees.</span>
              </li>
            </ol>
            <div className="env-note-box">
              <strong>Disponibilidad:</strong> La contraentrega está sujeta a disponibilidad
              según tu ciudad y el producto seleccionado. Consulta con tu asesor.
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
