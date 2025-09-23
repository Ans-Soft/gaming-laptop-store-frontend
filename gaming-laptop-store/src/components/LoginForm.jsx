import "../styles/login.css"
import { FaLock, FaEnvelope } from "react-icons/fa"

export default function LoginForm() {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <FaLock />
        </div>

        <h2 className="login-title">Iniciar Sesión</h2>
        <p className="login-subtitle">Ingresa tus credenciales para continuar</p>

        {/* Formulario */}
        <form>
          <label className="login-label">Correo electrónico</label>
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input type="email" placeholder="tu@email.com" />
          </div>

          <label className="login-label">Contraseña</label>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input type="password" placeholder="••••••••" />
          </div>

          <button type="submit" className="login-btn">
            Iniciar Sesión →
          </button>
        </form>
    
      </div>
    </div>
  )
}
