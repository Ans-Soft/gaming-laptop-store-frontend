import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, ShoppingCart } from "lucide-react";
import * as SeparacionService from "../../services/SeparacionService";
import * as VentaService from "../../services/VentaService";
import "../../styles/admin/separacionDetail.css";

const SeparacionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [separacion, setSeparacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertNotes, setConvertNotes] = useState("");

  useEffect(() => {
    loadSeparacion();
  }, [id]);

  const loadSeparacion = async () => {
    setLoading(true);
    try {
      const data = await SeparacionService.getSeparacionDetail(id);
      setSeparacion(data.separacion || data);
    } catch (error) {
      console.error("Error al cargar separación:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const message = `¿Cambiar estado a "${newStatus}"?`;
    if (!window.confirm(message)) return;

    try {
      await SeparacionService.updateSeparacion(id, { estado: newStatus });
      loadSeparacion();
      alert("Estado actualizado correctamente");
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("Error al cambiar el estado");
    }
  };

  const handleConvertToSale = async () => {
    if (!window.confirm("¿Convertir esta separación en venta?")) return;

    setConverting(true);
    try {
      // Create sale with client and unit from separation
      const saleData = {
        cliente: separacion.cliente,
        items_data: [
          {
            unidad_producto: separacion.unidad_producto,
            precio: separacion.valor_abono, // Use deposit as base price
            unidad_serial: separacion.unidad_serial,
            producto_nombre: separacion.producto_nombre,
          },
        ],
        notas: convertNotes || `Convertida desde separación #${separacion.id}`,
        separacion: id, // Link to original separation
      };

      await VentaService.createVenta(saleData);

      // Mark separation as completed
      await SeparacionService.updateSeparacion(id, { estado: "completada" });

      setShowConvertModal(false);
      navigate("/admin/separaciones");
      alert("Separación convertida a venta exitosamente");
    } catch (error) {
      console.error("Error al convertir:", error);
      alert("Error al convertir la separación");
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return <div className="sd-container">Cargando...</div>;
  }

  if (!separacion) {
    return <div className="sd-container">Separación no encontrada</div>;
  }

  const estadoColors = {
    activa: "#10b981",
    expirada: "#ef4444",
    cancelada: "#6b7280",
    completada: "#3b82f6",
  };

  return (
    <div className="sd-container">
      <div className="sd-header">
        <button className="sd-back-btn" onClick={() => navigate("/admin/separaciones")}>
          <ArrowLeft size={20} />
        </button>
        <h1>Detalle de Separación</h1>
      </div>

      <div className="sd-info-card">
        <div className="sd-info-header">
          <Lock size={28} />
          <div className="sd-info-content">
            <h2>Separación #{separacion.id}</h2>
            <div className="sd-status-badge" style={{ backgroundColor: estadoColors[separacion.estado] }}>
              {separacion.estado.charAt(0).toUpperCase() + separacion.estado.slice(1)}
            </div>
          </div>
        </div>

        <div className="sd-info-grid">
          <div className="sd-info-item">
            <label>Cliente</label>
            <p>{separacion.cliente_nombre || "N/A"}</p>
          </div>
          <div className="sd-info-item">
            <label>Cédula</label>
            <p>{separacion.cliente_cedula || "N/A"}</p>
          </div>
          <div className="sd-info-item">
            <label>Producto Serial</label>
            <p>{separacion.unidad_serial}</p>
          </div>
          <div className="sd-info-item">
            <label>Producto</label>
            <p>{separacion.producto_nombre || "N/A"}</p>
          </div>
          <div className="sd-info-item">
            <label>Valor del Abono</label>
            <p className="sd-amount">${parseFloat(separacion.valor_abono || 0).toFixed(2)}</p>
          </div>
          <div className="sd-info-item">
            <label>Fecha de Separación</label>
            <p>{new Date(separacion.fecha_separacion).toLocaleDateString("es-CO")}</p>
          </div>
          <div className="sd-info-item">
            <label>Fecha Máxima de Compra</label>
            <p>{new Date(separacion.fecha_maxima_compra).toLocaleDateString("es-CO")}</p>
          </div>
          <div className="sd-info-item">
            <label>Días Restantes</label>
            <p>
              {Math.max(
                0,
                Math.floor((new Date(separacion.fecha_maxima_compra) - new Date()) / (1000 * 60 * 60 * 24))
              )}{" "}
              días
            </p>
          </div>
        </div>
      </div>

      {separacion.estado === "activa" && (
        <div className="sd-actions">
          <button className="sd-btn sd-btn-success" onClick={() => handleStatusChange("completada")}>
            <ShoppingCart size={18} />
            Marcar como Completada
          </button>
          <button className="sd-btn sd-btn-primary" onClick={() => setShowConvertModal(true)}>
            <ShoppingCart size={18} />
            Convertir a Venta
          </button>
          <button className="sd-btn sd-btn-warning" onClick={() => handleStatusChange("expirada")}>
            Marcar como Expirada
          </button>
          <button className="sd-btn sd-btn-danger" onClick={() => handleStatusChange("cancelada")}>
            Cancelar Separación
          </button>
        </div>
      )}

      {separacion.estado !== "activa" && (
        <div className="sd-actions">
          <button className="sd-btn sd-btn-secondary" onClick={() => navigate("/admin/separaciones")}>
            Volver a Separaciones
          </button>
        </div>
      )}

      {showConvertModal && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header">
              <h3>Convertir a Venta</h3>
              <button className="sd-modal-close" onClick={() => setShowConvertModal(false)}>
                ×
              </button>
            </div>
            <div className="sd-modal-body">
              <p>Se creará una venta con los datos de esta separación.</p>
              <div className="sd-modal-field">
                <label htmlFor="notes">Notas Adicionales (opcional)</label>
                <textarea
                  id="notes"
                  placeholder="Ej: Observaciones sobre la venta..."
                  value={convertNotes}
                  onChange={(e) => setConvertNotes(e.target.value)}
                  rows="3"
                />
              </div>
            </div>
            <div className="sd-modal-footer">
              <button
                className="sd-modal-btn sd-modal-cancel"
                onClick={() => setShowConvertModal(false)}
                disabled={converting}
              >
                Cancelar
              </button>
              <button
                className="sd-modal-btn sd-modal-confirm"
                onClick={handleConvertToSale}
                disabled={converting}
              >
                {converting ? "Convirtiendo..." : "Convertir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeparacionDetail;
