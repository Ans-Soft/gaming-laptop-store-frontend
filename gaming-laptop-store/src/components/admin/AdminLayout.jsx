import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import GlobalHeader from "./GlobalHeader";
import AdminSidebar from "./AdminSidebar";
import { DateRangeProvider } from "../../contexts/DateRangeContext";
import { refreshToken, logout } from "../../services/Auth";
import "../../styles/admin/adminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      return saved === "true";
    }
    return window.innerWidth < 768;
  });

  // Persistir preferencia de sidebar
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", isCollapsed);
  }, [isCollapsed]);

  // Token refresh (movido desde DashboardHeader)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error("Error refreshing token:", error);
        handleLogout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Auto-collapse en mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <DateRangeProvider>
      <div className="al-root">
        <GlobalHeader />
        <div className="al-body">
          <AdminSidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed((prev) => !prev)}
            onLogout={handleLogout}
          />
          <main className="al-content">
            <Outlet />
          </main>
        </div>
      </div>
    </DateRangeProvider>
  );
};

export default AdminLayout;
