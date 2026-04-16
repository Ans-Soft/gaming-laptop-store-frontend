import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, User, AlertTriangle } from "lucide-react";
import * as VentaService from "../../services/VentaService";
import * as ClienteService from "../../services/ClienteService";
import ReportarDanoModal from "../../components/admin/ReportarDanoModal";
import "../../styles/admin/ventaDetail.css";

const VentaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [venta, setVenta] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportarDanoTarget, setReportarDanoTarget] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const ventaData = await VentaService.getVentaDetail(id);
      const v = ventaData.venta || ventaData;
      setVenta(v);

      if (v?.cliente) {
        const clienteData = await ClienteService.getClienteDetail(v.cliente);
        setCliente(clienteData.cliente || clienteData);
      }
    } catch (error) {
      console.error("Error al cargar venta:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="vd-container">Cargando...</div>;
  if (!venta) return <div className="vd-container">Venta no encontrada</div>;

  const items = venta.items || [];

  return (
    <div className="vd-container">
      <div className="vd-header">
        <button className="vd-back-btn" onClick={() => navigate("/admin/ventas")}>
          <ArrowLeft size={20} />
        </button>
        <h1>Detalle de Venta #{venta.id}</h1>
      </div>

      {/* ── Info de la venta ── */}
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
            <label>Productos vendidos</label>
            <p>{items.length}</p>
          </div>
          <div className="vd-info-item">
            <label>Total</label>
            <p className="vd-total-amount">
              ${Number(venta.total || 0).toLocaleString("es-CO")}
            </p>
          </div>
          <div className="vd-info-item">
            <label>Estado</label>
            <p>{venta.active ? "Activa" : "Inactiva"}</p>
          </div>
          <div className="vd-info-item">
            <label>Entrega</label>
            <p>{venta.estado_entrega === "entregado" ? "Entregado" : "Por Entregar"}</p>
          </div>
        </div>

        {venta.notas && (
          <div className="vd-notes">
            <label>Notas</label>
            <p>{venta.notas}</p>
          </div>
        )}
      </div>

      {/* ── Info del cliente ── */}
      {cliente && (
        <div className="vd-info-card">
          <div className="vd-info-header">
            <User size={24} />
            <div className="vd-info-content">
              <h2>Información del Cliente</h2>
            </div>
          </div>
          <div className="vd-info-grid">
            <div className="vd-info-item">
              <label>Nombre</label>
              <p>{cliente.nombre_completo}</p>
            </div>
            <div className="vd-info-item">
              <label>Cédula</label>
              <p>{cliente.cedula}</p>
            </div>
            <div className="vd-info-item">
              <label>Celular</label>
              <p>{cliente.celular}</p>
            </div>
            <div className="vd-info-item">
              <label>Correo</label>
              <p>{cliente.correo}</p>
            </div>
            <div className="vd-info-item">
              <label>Dirección</label>
              <p>{cliente.direccion}</p>
            </div>
            <div className="vd-info-item">
              <label>Ciudad / Depto.</label>
              <p>{[cliente.ciudad_nombre, cliente.departamento_nombre].filter(Boolean).join(", ") || "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Productos vendidos ── */}
      <div className="vd-items-section">
        <h3>Productos Vendidos</h3>
        {items.length > 0 ? (
          <table className="vd-items-table">
            <thead>
              <tr>
                <th>Serial</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const inRepair =
                  item.unidad_estado_producto === "por_reparar" ||
                  item.unidad_estado_producto === "en_reparacion";
                return (
                  <tr key={idx}>
                    <td><code>{item.unidad_serial || "—"}</code></td>
                    <td>{item.producto_nombre || "—"}</td>
                    <td>${Number(item.precio || 0).toLocaleString("es-CO")}</td>
                    <td>
                      {!inRepair ? (
                        <button
                          className="vd-btn-danger-icon"
                          title="Reportar Dañado"
                          onClick={() =>
                            setReportarDanoTarget({
                              id: item.unidad_producto,
                              serial: item.unidad_serial,
                              producto_nombre: item.producto_nombre,
                            })
                          }
                        >
                          <AlertTriangle size={16} />
                        </button>
                      ) : (
                        <span className="vd-in-repair">En reparación</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="vd-empty">No hay productos en esta venta</p>
        )}
      </div>

      <div className="vd-actions">
        <button className="vd-btn-back" onClick={() => navigate("/admin/ventas")}>
          Volver a Ventas
        </button>
      </div>

      {reportarDanoTarget && (
        <ReportarDanoModal
          unidad={reportarDanoTarget}
          origen="venta"
          clienteNombre={venta.cliente_nombre || cliente?.nombre_completo}
          onClose={() => setReportarDanoTarget(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default VentaDetail;
