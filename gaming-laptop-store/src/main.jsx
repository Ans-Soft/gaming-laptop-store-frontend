import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import PublicLayout from "./components/PublicLayout.jsx";
import Home from "./pages/home/Home.jsx";
import Catalog from "./pages/catalog/Catalog.jsx";
import PrivacyPolicy from "./pages/privacy/Privacy.jsx";
import Conocenos from "./pages/conocenos/Conocenos.jsx";
import Contactanos from "./pages/contactanos/Contactanos.jsx";
import Envios from "./pages/envios/Envios.jsx";
import Login from "./pages/admin/Login.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Users from "./pages/admin/Users.jsx";
import Categories from "./pages/admin/Categories.jsx";
import Brands from "./pages/admin/Brands.jsx";
import BaseProducts from "./pages/admin/BaseProducts.jsx";
import Products from "./pages/admin/Products.jsx";
import Invoices from "./pages/admin/Invoices.jsx";
import ProductTypes from "./pages/admin/ProductTypes.jsx";
import ProductFields from "./pages/admin/ProductFields.jsx";
import Suppliers from "./pages/admin/Suppliers.jsx";
import Productos from "./pages/admin/Productos.jsx";
import Unidades from "./pages/admin/Unidades.jsx";
import BajoPedido from "./pages/admin/BajoPedido.jsx";
import Clientes from "./pages/admin/Clientes.jsx";
import OrdenesCompra from "./pages/admin/OrdenesCompra.jsx";
import ProductosBajoPedido from "./pages/admin/ProductosBajoPedido.jsx";
import Separaciones from "./pages/admin/Separaciones.jsx";
import Ventas from "./pages/admin/Ventas.jsx";
import Recibos from "./pages/admin/Recibos.jsx";
import ClienteDetail from "./pages/admin/ClienteDetail.jsx";
import VentaDetail from "./pages/admin/VentaDetail.jsx";
import SeparacionDetail from "./pages/admin/SeparacionDetail.jsx";
import Inventario from "./pages/admin/Inventario.jsx";
import ReporteSalesReport from "./pages/admin/ReporteSalesReport.jsx";
import ReporteSeparacionesReport from "./pages/admin/ReporteSeparacionesReport.jsx";
import ReporteMargenes from "./pages/admin/ReporteMargenes.jsx";
import ReporteMasVendidos from "./pages/admin/ReporteMasVendidos.jsx";
import ReporteOrdenesCompra from "./pages/admin/ReporteOrdenesCompra.jsx";
import ReporteRentabilidad from "./pages/admin/ReporteRentabilidad.jsx";

const router = createBrowserRouter([
  {
    // Public pages share LandingHeader + Footer + Whatsapp via PublicLayout
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/catalogo", element: <Catalog /> },
      { path: "/politica-de-privacidad", element: <PrivacyPolicy /> },
      { path: "/conocenos", element: <Conocenos /> },
      { path: "/contactanos", element: <Contactanos /> },
      { path: "/envios", element: <Envios /> },
    ],
  },
  // Login page is independent
  { path: "/login", element: <Login /> },
  // Admin pages share AdminLayout with sidebar
  {
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <Dashboard /> },
      { path: "/admin/users", element: <Users /> },
      { path: "/admin/base_products", element: <BaseProducts /> },
      { path: "/admin/products", element: <Products /> },
      { path: "/admin/categories", element: <Categories /> },
      { path: "/admin/brands", element: <Brands /> },
      { path: "/admin/facturas", element: <Invoices /> },
      { path: "/admin/product-types", element: <ProductTypes /> },
      { path: "/admin/product-fields", element: <ProductFields /> },
      { path: "/admin/suppliers", element: <Suppliers /> },
      { path: "/admin/productos", element: <Productos /> },
      { path: "/admin/unidades", element: <Unidades /> },
      { path: "/admin/bajo-pedido", element: <BajoPedido /> },
      { path: "/admin/clientes", element: <Clientes /> },
      { path: "/admin/clientes/:id", element: <ClienteDetail /> },
      { path: "/admin/ordenes-compra", element: <OrdenesCompra /> },
      { path: "/admin/productos-bajo-pedido", element: <ProductosBajoPedido /> },
      { path: "/admin/separaciones", element: <Separaciones /> },
      { path: "/admin/separaciones/:id", element: <SeparacionDetail /> },
      { path: "/admin/ventas", element: <Ventas /> },
      { path: "/admin/ventas/:id", element: <VentaDetail /> },
      { path: "/admin/recibos", element: <Recibos /> },
      { path: "/admin/inventario", element: <Inventario /> },
      { path: "/admin/reportes/ventas", element: <ReporteSalesReport /> },
      { path: "/admin/reportes/separaciones", element: <ReporteSeparacionesReport /> },
      { path: "/admin/reportes/margenes", element: <ReporteMargenes /> },
      { path: "/admin/reportes/mas-vendidos", element: <ReporteMasVendidos /> },
      { path: "/admin/reportes/ordenes-compra", element: <ReporteOrdenesCompra /> },
      { path: "/admin/reportes/rentabilidad", element: <ReporteRentabilidad /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
