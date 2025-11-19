import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin/dashboardHeader.css";
import logo from "../../assets/logo.png";
import { refreshToken, logout } from "../../services/Auth";

const AdminHeader = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        refreshToken();
      } catch (error) {
        console.error("Error refreshing token:", error);
        handleLogout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="admin-header" role="banner">
      <div className="admin-header-inner">
        <div className="admin-header-left">
          <div className="admin-logo">
            <img src={logo} alt="Logo Patecnológicos" className="navbar-logo" />
            <h1 className="navbar-logo-text">
              Pate<span className="highlight">cnologicos</span>
            </h1>
          </div>
        </div>

        <nav className="admin-header-right" aria-label="admin actions">
          <a className="admin-badge" href="/admin">
            Panel Admin
          </a>
          <button onClick={handleLogout} className="admin-badge">
            Cerrar Sesión
          </button>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
