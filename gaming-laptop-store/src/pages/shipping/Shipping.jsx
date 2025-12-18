import "../../styles/shipping.css"

export default function Shipping() {
  return (
    <section className="shipping-section" id="envios">
      <h2 className="section-title">
        Medios de <span>Envío</span>
      </h2>

      <p className="subtitle">
        Enviamos tu equipo gaming de forma segura y rápida a cualquier parte del país
      </p>

      <div className="shipping-cards">
        <div className="shipping-card">
          <h3>Envío Nacional</h3>
          <span className="highlight">2-5 días</span>
        </div>

        <div className="shipping-card">
          <h3>Recogida Local</h3>
          <span className="highlight">Inmediato</span>
        </div>

        <div className="shipping-card">
          <h3>Envío Asegurado</h3>
          <span className="highlight">100%</span>
        </div>
      </div>
    </section>
  );
}
