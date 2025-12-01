import DashboardCard from "../../components/admin/DashboardCard";
import { Package, Tag, Users, Grid } from "lucide-react";
import "../../styles/admin/dashboard.css";
import DashboardHeader from "../../components/admin/DashboardHeader";

export default function Dashboard() {
  const modules = [
    {
      icon: <Package size={32} />,
      title: "Gestión de Productos Base",
      description: "Administra el catálogo de productos base",
      color: "#00ffc3",
      to: "/admin/base_products",
    },
    {
      icon: <Package size={32} />,
      title: "Gestión de Productos Variantes",
      description: "Administra el catálogo de portátiles activos",
      color: "#db6ec9ff",
      to: "/admin/products",
    },
    {
      icon: <Tag size={32} />,
      title: "Gestión de Marcas",
      description: "Administra las marcas de productos",
      color: "#9c6bff",
      to: "/admin/brands",
    },
    {
      icon: <Users size={32} />,
      title: "Gestión de Usuarios",
      description: "Administra usuarios y permisos",
      color: "#2ef06a",
      to: "/admin/users",
      
    },
    {
      icon: <Grid size={32} />,
      title: "Gestión de Categorías",
      description: "Administra categorías de productos",
      color: "#ff9f2e",
      to: "/admin/categories",
    },
  ];

  return (
    <section className="dashboard-container">
      <DashboardHeader />
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
