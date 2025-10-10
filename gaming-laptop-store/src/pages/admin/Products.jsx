import React from "react";
import "./../../styles/admin/products.css";
import { Plus, Package, DollarSign, Search, Eye, Edit, Trash2 } from "lucide-react";

const Products = () => {
  const products = [
    {
      id: 1,
      name: "ASUS ROG Strix G16",
      category: "Portátiles Gaming",
      brand: "ASUS",
      price: "$2499,99",
      stock: 15,
    },
    {
      id: 2,
      name: "MSI Raider GE78",
      category: "Portátiles Gaming",
      brand: "MSI",
      price: "$3299,99",
      stock: 8,
    },
    {
      id: 3,
      name: "Lenovo Legion Pro 7i",
      category: "Portátiles Gaming",
      brand: "Lenovo",
      price: "$2899,99",
      stock: 12,
    },
    {
      id: 4,
      name: "Razer Blade 16",
      category: "Portátiles Gaming",
      brand: "Razer",
      price: "$3499,99",
      stock: 5,
    },
    {
      id: 5,
      name: "Alienware m18",
      category: "Portátiles Gaming",
      brand: "Alienware",
      price: "$3799,99",
      stock: 3,
    },
  ];

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValue = products
    .reduce((acc, p) => acc + parseFloat(p.price.replace("$", "").replace(",", "")) * p.stock, 0)
    .toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="products-container">
      <div className="products-header">
        <div>
          <h1><Package size={28} /> Gestión de Productos</h1>
          <p>Administra el catálogo de portátiles gamer</p>
        </div>
      </div>

      <div className="products-filters">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Buscar por nombre o marca..." />
        </div>
        <select>
          <option>Todas las categorías</option>
        </select>
        <select>
          <option>Todas las marcas</option>
        </select>
        <button className="btn-register">
          <Plus size={18} /> Registrar Producto
        </button>
      </div>

      <div className="products-stats">
        <div className="stat-card">
          <Package size={20} />
          <div>
            <p>Total Productos</p>
            <h3>{totalProducts}</h3>
          </div>
        </div>
        <div className="stat-card">
          <Package size={20} />
          <div>
            <p>Stock Total</p>
            <h3>{totalStock}</h3>
          </div>
        </div>
        <div className="stat-card">
          <DollarSign size={20} />
          <div>
            <p>Valor Inventario</p>
            <h3>{totalValue}</h3>
          </div>
        </div>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="product-info">
                  {p.name}
                </td>
                <td>{p.category}</td>
                <td><span className="brand-tag">{p.brand}</span></td>
                <td>{p.price}</td>
                <td>
                  <span
                    className={`stock-badge ${
                      p.stock <= 5 ? "low" : p.stock <= 10 ? "medium" : "high"
                    }`}
                  >
                    {p.stock} unidades
                  </span>
                </td>
                <td className="actions">
                  <Eye size={18} />
                  <Edit size={18} />
                  <Trash2 size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
