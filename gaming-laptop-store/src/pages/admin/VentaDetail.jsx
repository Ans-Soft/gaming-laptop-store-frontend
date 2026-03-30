import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import * as VentaService from "../../services/VentaService";
import "../../styles/admin/ventaDetail.css";

const VentaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load venta details
      const ventaData = await VentaService.getVentaDetail(id);
      setVenta(ventaData.venta || ventaData);


    } catch (error) {
      console.error("Error al cargar venta:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="vd-container">Cargando...</div>;
  }

  if (!venta) {
    return <div className="vd-container">Venta no encontrada</div>;
  }

  const items = venta.items_data || [];
  const total = items.reduce((sum, item) => sum + parseFloat(item.precio || 0), 0);

  return (
    <div className="vd-container">
      <div className="vd-header">
        <button className="vd-back-btn" onClick={() => navigate("/admin/ventas")}>
          <ArrowLeft size={20} />
        </button>
        <h1>Detalle de Venta</h1>
      </div>

      <div className="vd-info-card">
        <div className="vd-info-header">
          <ShoppingCart size={28} />
          <div className="vd-info-content">
            <h2>Venta #{venta.id}</h2>
            <p className="vd-subtitle">
              {new Date(venta.fecha).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="vd-info-grid">
          <div className="vd-info-item">
            <label>Cliente</label>
            <p>{venta.cliente_nombre || "N/A"}</p>
          </div>
          <div className="vd-info-item">
            <label>Fecha</label>
            <p>{new Date(venta.fecha).toLocaleDateString("es-CO")}</p>
          </div>
          <div className="vd-info-item">
            <label>Total Items</label>
            <p>{items.length}</p>
          </div>
          <div className="vd-info-item">
            <label>Total Venta</label>
            <p className="vd-total-amount">${total.toFixed(2)}</p>
          </div>
        </div>

        {venta.notas && (
          <div className="vd-notes">
            <label>Notas</label>
            <p>{venta.notas}</p>
          </div>
        )}
      </div>

      <div className="vd-items-section">
        <h3>Items Vendidos</h3>
        {items.length > 0 ? (
          <table className="vd-items-table">
            <thead>
              <tr>
                <th>Serial</th>
                <th>Producto</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.unidad_serial}</td>
                  <td>{item.producto_nombre}</td>
                  <td>${parseFloat(item.precio || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="vd-empty">No hay items en esta venta</p>
        )}
      </div>


      <div className="vd-actions">
        <button className="vd-btn-back" onClick={() => navigate("/admin/ventas")}>
          Volver a Ventas
        </button>
      </div>
    </div>
  );
};

export default VentaDetail;
