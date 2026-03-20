import React from "react";
import "../../styles/admin/dashboardHeader.css";
import logo from "../../assets/logo.png";

const AdminHeader = () => {
  return (
    <header className="admin-header" role="banner">
      <div className="admin-header-inner">
        <div className="admin-header-left">
          <div className="admin-logo">
            <img src={logo} alt="Logo Patecnológicos" className="navbar-logo" />
            <h1 className="navbar-logo-text">
              Patecnologicos
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
