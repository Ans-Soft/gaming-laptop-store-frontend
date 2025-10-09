import React from "react";
import "../../styles/admin/dashboardHeader.css";
import logo from "../../assets/logo.png";

export default function AdminHeader() {
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
        </nav>
      </div>
    </header>
  );
}
