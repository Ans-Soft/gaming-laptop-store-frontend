import "../styles/logo.css";
import logo from "../assets/logo.png";

export default function Logo() {
  return (
    <div className="logo">
      <img src={logo} alt="Logo Patecnológicos" className="logo-img" />
    </div>
  );
}
