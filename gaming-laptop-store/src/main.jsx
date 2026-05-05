import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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
import Users from "./pages/admin/Users.jsx";
import Brands from "./pages/admin/Brands.jsx";
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
import Garantias from "./pages/admin/Garantias.jsx";
import Danados from "./pages/admin/Danados.jsx";
import MetodoAliadoList from "./pages/admin/MetodoAliadoList.jsx";
import ClienteDetail from "./pages/admin/ClienteDetail.jsx";
import VentaDetail from "./pages/admin/VentaDetail.jsx";
import SeparacionDetail from "./pages/admin/SeparacionDetail.jsx";
import Dashboard from "./pages/admin/Dashboard/Dashboard.jsx";
import GananciaNeta from "./pages/admin/GananciaNeta.jsx";
import OrdenesEnvio from "./pages/admin/OrdenesEnvio.jsx";
import EquiposDanados from "./pages/admin/EquiposDanados.jsx";


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
      { path: "/admin", element: <Navigate to="/admin/dashboard" replace /> },
      { path: "/admin/dashboard", element: <Dashboard /> },
      { path: "/admin/ganancia-neta", element: <GananciaNeta /> },
      { path: "/admin/ordenes-envio", element: <OrdenesEnvio /> },
      { path: "/admin/equipos-danados", element: <EquiposDanados /> },
      { path: "/admin/users", element: <Users /> },
      { path: "/admin/brands", element: <Brands /> },
      { path: "/admin/facturas", element: <Invoices /> },
      { path: "/admin/product-types", element: <ProductTypes /> },
      { path: "/admin/product-fields", element: <ProductFields /> },
      { path: "/admin/suppliers", element: <Suppliers /> },
      { path: "/admin/productos", element: <Productos /> },
      { path: "/admin/inventario", element: <Unidades /> },
      { path: "/admin/bajo-pedido", element: <BajoPedido /> },
      { path: "/admin/clientes", element: <Clientes /> },
      { path: "/admin/clientes/:id", element: <ClienteDetail /> },
      { path: "/admin/ordenes-compra", element: <OrdenesCompra /> },
      { path: "/admin/productos-bajo-pedido", element: <ProductosBajoPedido /> },
      { path: "/admin/separaciones", element: <Separaciones /> },
      { path: "/admin/separaciones/:id", element: <SeparacionDetail /> },
      { path: "/admin/ventas", element: <Ventas /> },
      { path: "/admin/garantias", element: <Garantias /> },
      { path: "/admin/danados", element: <Danados /> },
      { path: "/admin/metodo-aliado", element: <MetodoAliadoList /> },
      { path: "/admin/ventas/:id", element: <VentaDetail /> },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);
