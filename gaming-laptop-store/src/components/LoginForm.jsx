import "../styles/login.css";
import { login } from "../services/Auth";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

  // Detectar si la sesión expiró y limpiar el flag inmediatamente para que
  // el aviso solo se muestre una vez.
  useEffect(() => {
    if (localStorage.getItem("session_expired") === "1") {
      setSessionExpired(true);
      localStorage.removeItem("session_expired");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      console.log("Tokens recibidos:", data);

      // Redirigir al usuario a la página donde estaba antes de que la sesión
      // expirara, o al dashboard si no hay ninguna ruta guardada.
      const redirectTo = localStorage.getItem("redirect_after_login");
      if (redirectTo) {
        localStorage.removeItem("redirect_after_login");
        navigate(redirectTo);
      } else {
        navigate("/admin");
      }
    } catch (error) {
      setError("Credenciales incorrectas o error en el servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <FaLock />
        </div>

        <h2 className="login-title">Iniciar Sesión</h2>
        <p className="login-subtitle">
          Ingresa tus credenciales para continuar
        </p>

        {sessionExpired && (
          <div className="session-expired-banner">
            Tu sesión ha expirado. Por favor inicia sesión nuevamente.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="login-label">Correo electrónico</label>
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="text"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label className="login-label">Contraseña</label>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">
            Iniciar Sesión →
          </button>
        </form>
      </div>
    </div>
  );
}
