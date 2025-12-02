import "../styles/notice.css"
import { FaBolt } from "react-icons/fa"

export default function Notice() {
  return (
    <section className="construction">
      <FaBolt className="bolt-icon" />
      <h2 className="construction-text">Mira nuestro catálogo</h2>
      <FaBolt className="bolt-icon" />
    </section>
  )
}