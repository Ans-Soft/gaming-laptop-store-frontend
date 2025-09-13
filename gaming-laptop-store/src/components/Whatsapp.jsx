import { FaWhatsapp } from "react-icons/fa";
import "../styles/whatsapp.css"
export default function Button() {
  return (
    <div>
      <a 
        href="https://wa.me/573012661811" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-btn"
      >
        <FaWhatsapp  className="whatsapp-icon" /></a>
    </div>
  )
}
