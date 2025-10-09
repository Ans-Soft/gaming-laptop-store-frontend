import "../styles/login.css";
import { login } from "../services/Auth";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      console.log("Tokens recibidos:", data);

      navigate("/admin"); 
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

          <button type="submit" className="login-btn">
            Iniciar Sesión →
          </button>
        </form>
      </div>
    </div>
  );
}
