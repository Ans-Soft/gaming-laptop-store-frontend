import "../styles/button.css"
import { GrCatalogOption } from "react-icons/gr";

export default function Catalog() {
  return (
    <div className="instagram-section">
      <a 
        href="https://www.instagram.com/patecnologicos/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="instagram-btn"
      >
        <GrCatalogOption className="instagram-icon" />
        Catálogo
      </a>
    </div>
  )
}
