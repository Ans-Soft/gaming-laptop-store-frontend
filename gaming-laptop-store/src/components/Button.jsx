import "../styles/button.css"
import { FaInstagram } from "react-icons/fa"

export default function Button() {
  return (
    <div className="instagram-section">
      <a 
        href="https://www.instagram.com/patecnologicos/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="instagram-btn"
      >
        <FaInstagram className="instagram-icon" />
        Síguenos en Instagram
      </a>
      <p className="instagram-text">Mantente al día con las últimas novedades</p>
    </div>
  )
}
