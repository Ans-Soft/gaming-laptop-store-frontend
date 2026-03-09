import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tag,
  Grid3X3,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { logout } from "../../services/Auth";
import logo from "../../assets/logo.png";
import "../admin/adminSidebar.css";

const AdminSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navGroups = [
    {
      label: "General",
      items: [
        { path: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      ],
    },
    {
      label: "Catálogo",
      items: [
        {
          path: "/admin/base_products",
          label: "Productos Base",
          icon: Package,
        },
        { path: "/admin/products", label: "Variantes", icon: Tag },
        { path: "/admin/brands", label: "Marcas", icon: Package },
        {
          path: "/admin/categories",
          label: "Categorías",
          icon: Grid3X3,
        },
      ],
    },
    {
      label: "Ventas",
      items: [{ path: "/admin/facturas", label: "Facturas", icon: FileText }],
    },
    {
      label: "Usuarios",
      items: [{ path: "/admin/users", label: "Usuarios", icon: Users }],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onMobileClose}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${collapsed ? "admin-sidebar--collapsed" : ""} ${
          mobileOpen ? "admin-sidebar--mobile-open" : ""
        }`}
        role="navigation"
        aria-label="Admin Navigation"
      >
        {/* Logo section */}
        <div className="admin-sidebar__logo">
          <img src={logo} alt="Logo" className="admin-sidebar__logo-icon" />
          <span className="admin-sidebar__logo-text">Patecnológicos</span>
        </div>

        {/* Toggle button - separate for visibility */}
        <button
          className="admin-sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir navegación" : "Contraer navegación"}
          title={collapsed ? "Expandir" : "Contraer"}
        >
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>

        {/* Nav content */}
        <nav className="admin-sidebar__nav">
          {navGroups.map((group, idx) => (
            <div key={idx} className="admin-sidebar__group">
              <div className="admin-sidebar__group-label">{group.label}</div>
              <div className="admin-sidebar__links">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        `admin-sidebar__link ${isActive ? "active" : ""}`
                      }
                      onClick={onMobileClose}
                    >
                      <Icon className="admin-sidebar__icon" size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer logout */}
        <div className="admin-sidebar__footer">
          <button
            onClick={handleLogout}
            className="admin-sidebar__logout"
            title="Cerrar Sesión"
          >
            <LogOut className="admin-sidebar__icon" size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
