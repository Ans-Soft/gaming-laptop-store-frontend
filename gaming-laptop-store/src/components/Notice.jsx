import "../styles/notice.css"
import { FaBolt } from "react-icons/fa"

export default function notice() {
  return (
    <section className="construction">
      <FaBolt className="bolt-icon" />
      <h2 className="construction-text">Estamos en construcción</h2>
      <FaBolt className="bolt-icon" />
    </section>
  )
}
