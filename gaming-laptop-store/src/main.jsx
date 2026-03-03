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
import Dashboard from "./pages/admin/Dashboard.jsx";
import Users from "./pages/admin/Users.jsx";
import Categories from "./pages/admin/Categories.jsx";
import Brands from "./pages/admin/Brands.jsx";
import BaseProducts from "./pages/admin/BaseProducts.jsx";
import Products from "./pages/admin/Products.jsx";
import Invoices from "./pages/admin/Invoices.jsx";

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
  // Admin pages are independent — no public layout
  { path: "/login", element: <Login /> },
  { path: "/admin", element: <Dashboard /> },
  { path: "/admin/users", element: <Users /> },
  { path: "/admin/base_products", element: <BaseProducts /> },
  { path: "/admin/products", element: <Products /> },
  { path: "/admin/categories", element: <Categories /> },
  { path: "/admin/brands", element: <Brands /> },
  { path: "/admin/facturas", element: <Invoices /> },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
