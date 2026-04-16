import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Tag,
  Boxes,
  Sliders,
  Truck,
  Box,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShoppingCart,
  Clock,
  Lock,
  ShieldAlert,
  Handshake,
  Wrench,
} from "lucide-react";
import "../../styles/admin/adminSidebar.css";

const NAV_SECTIONS = [
  {
    label: "Gestión",
    items: [
      {
        path: "/admin/productos",
        icon: ShoppingBag,
        label: "Productos",
      },
      {
        path: "/admin/ordenes-compra",
        icon: ShoppingCart,
        label: "Órdenes de Compra",
      },
      {
        path: "/admin/inventario",
        icon: Box,
        label: "Inventario",
      },
      {
        path: "/admin/separaciones",
        icon: Lock,
        label: "Separaciones",
      },
      {
        path: "/admin/ventas",
        icon: ShoppingCart,
        label: "Ventas",
      },
      {
        path: "/admin/garantias",
        icon: ShieldAlert,
        label: "Garantías",
      },
      {
        path: "/admin/danados",
        icon: Wrench,
        label: "Equipos Dañados",
      },
      {
        path: "/admin/metodo-aliado",
        icon: Handshake,
        label: "Método Aliado",
      },
      {
        path: "/admin/productos-bajo-pedido",
        icon: Clock,
        label: "Productos Bajo Pedido",
      },
    ],
  },
  {
    label: "Configuración del Sistema",
    items: [
      {
        path: "/admin/users",
        icon: Users,
        label: "Usuarios",
      },
      {
        path: "/admin/clientes",
        icon: Users,
        label: "Clientes",
      },
      {
        path: "/admin/bajo-pedido",
        icon: Clock,
        label: "Sourcing Bajo Pedido",
      },
      {
        path: "/admin/brands",
        icon: Tag,
        label: "Marcas",
      },
      {
        path: "/admin/product-types",
        icon: Boxes,
        label: "Tipos de Producto",
      },
      {
        path: "/admin/product-fields",
        icon: Sliders,
        label: "Campos de Producto",
      },
      {
        path: "/admin/suppliers",
        icon: Truck,
        label: "Proveedores",
      },
    ],
  },
];

const AdminSidebar = ({ isCollapsed, onToggle, onLogout }) => {
  return (
    <aside className={`as-sidebar ${isCollapsed ? "as-sidebar--collapsed" : ""}`}>
      <button
        className="as-toggle"
        onClick={onToggle}
        title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <NavLink
        to="/admin"
        end
        className={({ isActive }) => `as-item ${isActive ? "as-item--active" : ""}`}
        title={isCollapsed ? "Panel Principal" : undefined}
      >
        <LayoutDashboard size={20} />
        {!isCollapsed && <span className="as-label">Panel Principal</span>}
      </NavLink>

      {NAV_SECTIONS.map((section, sectionIdx) => (
        <div key={sectionIdx} className="as-section">
          {!isCollapsed && <p className="as-section-title">{section.label}</p>}
          {section.items.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `as-item ${isActive ? "as-item--active" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <IconComponent size={20} />
                {!isCollapsed && <span className="as-label">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      ))}

      <div className="as-spacer" />

      <button
        className="as-item as-item--logout"
        onClick={onLogout}
        title={isCollapsed ? "Cerrar Sesión" : undefined}
        aria-label="Cerrar Sesión"
      >
        <LogOut size={20} />
        {!isCollapsed && <span className="as-label">Cerrar Sesión</span>}
      </button>
    </aside>
  );
};

export default AdminSidebar;
