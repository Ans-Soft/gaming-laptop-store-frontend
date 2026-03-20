import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  FileText,
  Users,
  Tag,
  Grid,
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
  BarChart3,
  DollarSign,
  Award,
  PieChart,
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
        path: "/admin/unidades",
        icon: Box,
        label: "Inventario (Unidades)",
      },
      {
        path: "/admin/bajo-pedido",
        icon: Clock,
        label: "Sourcing Bajo Pedido",
      },
      {
        path: "/admin/facturas",
        icon: FileText,
        label: "Facturas",
      },
      {
        path: "/admin/clientes",
        icon: Users,
        label: "Clientes",
      },
      {
        path: "/admin/ordenes-compra",
        icon: ShoppingCart,
        label: "Órdenes de Compra",
      },
      {
        path: "/admin/productos-bajo-pedido",
        icon: Clock,
        label: "Productos Bajo Pedido",
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
        path: "/admin/recibos",
        icon: FileText,
        label: "Recibos",
      },
      {
        path: "/admin/inventario",
        icon: BarChart3,
        label: "Inventario",
      },
    ],
  },
  {
    label: "Reportes",
    items: [
      {
        path: "/admin/reportes/ventas",
        icon: FileText,
        label: "Reporte de Ventas",
      },
      {
        path: "/admin/reportes/separaciones",
        icon: Clock,
        label: "Reporte de Separaciones",
      },
      {
        path: "/admin/reportes/margenes",
        icon: DollarSign,
        label: "Márgenes y Costos",
      },
      {
        path: "/admin/reportes/mas-vendidos",
        icon: Award,
        label: "Más Vendidos",
      },
      {
        path: "/admin/reportes/ordenes-compra",
        icon: Package,
        label: "Órdenes de Compra",
      },
      {
        path: "/admin/reportes/rentabilidad",
        icon: PieChart,
        label: "Rentabilidad",
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
        path: "/admin/brands",
        icon: Tag,
        label: "Marcas",
      },
      {
        path: "/admin/categories",
        icon: Grid,
        label: "Categorías",
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
