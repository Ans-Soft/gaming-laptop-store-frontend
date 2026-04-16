import DashboardCard from "../../components/admin/DashboardCard";
import { Package, Tag, Users, FileText, Box, ShoppingCart, Lock } from "lucide-react";
import "../../styles/admin/dashboard.css";

export default function Dashboard() {
  const modules = [
    {
      icon: <Package size={32} />,
      title: "Productos",
      description: "Administra el catálogo de productos",
      color: "#00ffc3",
      to: "/admin/productos",
    },
    {
      icon: <Box size={32} />,
      title: "Inventario",
      description: "Gestiona unidades, seriales y estados",
      color: "#db6ec9ff",
      to: "/admin/inventario",
    },
    {
      icon: <ShoppingCart size={32} />,
      title: "Ventas",
      description: "Registra y consulta ventas realizadas",
      color: "#2ef06a",
      to: "/admin/ventas",
    },
    {
      icon: <Lock size={32} />,
      title: "Separaciones",
      description: "Administra reservas de productos",
      color: "#f59e0b",
      to: "/admin/separaciones",
    },
    {
      icon: <FileText size={32} />,
      title: "Facturas",
      description: "Genera y administra facturas",
      color: "#1e40af",
      to: "/admin/facturas",
    },
    {
      icon: <Tag size={32} />,
      title: "Marcas",
      description: "Administra las marcas de productos",
      color: "#9c6bff",
      to: "/admin/brands",
    },
    {
      icon: <Users size={32} />,
      title: "Usuarios",
      description: "Administra usuarios y permisos",
      color: "#6366f1",
      to: "/admin/users",
    },
  ];

  return (
    <section className="dashboard-container">
      <h1 className="dashboard-title">
        Panel de <span>Administración</span>
      </h1>
      <p className="dashboard-subtitle">
        Gestiona todos los aspectos de tu tienda de tecnología gamer desde un
        solo lugar
      </p>

      <div className="dashboard-grid">
        {modules.map((m, i) => (
          <DashboardCard key={i} {...m} />
        ))}
      </div>
    </section>
  );
}
