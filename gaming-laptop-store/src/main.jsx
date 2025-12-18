import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./pages/home/Home.jsx"; 
import Login from "./pages/admin/Login.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Users from "./pages/admin/Users.jsx";
import Categories from "./pages/admin/Categories.jsx";
import Brands from "./pages/admin/Brands.jsx";
import BaseProducts from "./pages/admin/BaseProducts.jsx";
import Products from "./pages/admin/Products.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <Dashboard />,
  },
  {
    path: "/admin/users",
    element: <Users />,
  },
  {
    path: "/admin/base_products",
    element: <BaseProducts />,
  },
  {
    path: "/admin/products",
    element: <Products />,
  },
  {
    path: "/admin/categories",
    element: <Categories />,
  },
  {
    path: "/admin/brands",
    element: <Brands />,
  }

]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
