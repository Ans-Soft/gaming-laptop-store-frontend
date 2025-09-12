import "../styles/header.css"
import { FaGamepad } from "react-icons/fa"

export default function HeaderLogo() {
  return (
    <header className="header">
      <div className="logo">
        <FaGamepad className="logo-icon" />
        <h1 className="logo-text">
          Pate<span className="highlight">cnológicos</span>
        </h1>
      </div>
    </header>
  )
}
