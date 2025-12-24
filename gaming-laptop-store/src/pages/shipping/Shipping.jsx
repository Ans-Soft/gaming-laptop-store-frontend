import "../../styles/shipping.css"
import { MdLocalShipping } from "react-icons/md";
import { FaLocationDot, FaCalendarCheck } from "react-icons/fa6";


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
          <MdLocalShipping className="shipping-icons"/>
          <h3>Envío Nacional</h3>
          <p className="shipping-desc">Cobertura en todo el país con empresas de transporte confiables y tracking en tiempo real</p>
          <span className="highlight">2-5 días</span>
          <p className="shipping-desc">Tiempo de entrega</p>

        </div>

        <div className="shipping-card">
          <FaLocationDot className="shipping-icons"/>
          <h3>Recogida Local</h3>
          <p className="shipping-desc">Disponible en nuestras oficinas. Coordina tu visita y llévate tu equipo el mismo día</p>
          <span className="highlight">Inmediato</span>
          <p className="shipping-desc">Sin costo adicional</p>
        </div>

        <div className="shipping-card">
          <FaCalendarCheck className="shipping-icons"/>
          <h3>Envío Asegurado</h3>
          <p className="shipping-desc">Todos nuestros envíos pueden asegurarse contra daños o pérdidas durante el transporte</p>
          <span className="highlight">100%</span>
          <p className="shipping-desc">Protección garantizada</p>
        </div>
      </div>
    </section>
  );
}
