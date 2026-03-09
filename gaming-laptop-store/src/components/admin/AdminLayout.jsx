import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { refreshToken } from "../../services/Auth";
import AdminSidebar from "./AdminSidebar";
import TRMBadge from "./TRMBadge";
import "../../styles/admin/adminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Initialize collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin-sidebar-collapsed");
    if (stored !== null) {
      setCollapsed(JSON.parse(stored));
    }
  }, []);

  // JWT refresh interval - migrated from DashboardHeader
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        refreshToken();
      } catch (error) {
        console.error("Error refreshing token:", error);
        navigate("/login");
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [navigate]);

  const handleToggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem("admin-sidebar-collapsed", JSON.stringify(newCollapsed));
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <div className={`admin-shell ${mobileOpen ? "mobile-backdrop" : ""}`}>
      <AdminSidebar
        collapsed={collapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />

      <div className="admin-main">
        {/* Top bar - header only over content */}
        <header className="admin-topbar" role="banner">
          <div className="admin-topbar__content">
            <button
              className="admin-topbar__hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir navegación"
            >
              <Menu size={24} />
            </button>
            <div style={{ flex: 1 }} />
            <div className="admin-topbar__right">
              <TRMBadge />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
