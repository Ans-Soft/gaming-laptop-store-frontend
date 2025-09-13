import "../styles/features.css"
import { FaMicrochip, FaGamepad, FaBolt } from "react-icons/fa"

export default function Features() {
  return (
    <section className="features">
      <div className="feature-card">
        <FaMicrochip className="feature-icon" />
        <h3 className="feature-title">Alta Gama</h3>
        <p className="feature-desc">Los mejores procesadores y tarjetas gráficas</p>
      </div>

      <div className="feature-card">
        <FaGamepad className="feature-icon" />
        <h3 className="feature-title">Gaming Pro</h3>
        <p className="feature-desc">Optimizados para la mejor experiencia gaming</p>
      </div>

      <div className="feature-card">
        <FaBolt className="feature-icon" />
        <h3 className="feature-title">Tecnología</h3>
        <p className="feature-desc">Las últimas innovaciones en hardware</p>
      </div>
    </section>
  )
}
