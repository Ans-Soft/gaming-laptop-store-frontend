import "../styles/header.css"
import logo from "../assets/logo.png"

export default function HeaderLogo() {
  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="Logo Patecnológicos" className="logo-img" />
        <h1 className="logo-text">
          Pate<span className="highlight">cnologicos</span>
        </h1>
      </div>
    </header>
  )
}
