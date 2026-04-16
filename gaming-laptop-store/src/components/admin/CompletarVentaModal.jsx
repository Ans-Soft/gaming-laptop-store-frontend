import React, { useState, useRef } from "react";
import { ShoppingCart, Info } from "lucide-react";
import ModalBase from "./ModalBase";
import "../../styles/admin/completarVentaModal.css";

const formatCOP = (value) => "$" + Number(value).toLocaleString("es-CO");

const CompletarVentaModal = ({ separacion, onClose, onSubmit }) => {
  const today = new Date().toISOString().split("T")[0];

  const initialPrecio = separacion.unidad_precio || separacion.valor_abono || "";
  const [precio, setPrecio] = useState(
    initialPrecio ? String(Math.round(Number(initialPrecio))) : ""
  );
  const [notas, setNotas] = useState("");
  const [estadoEntrega, setEstadoEntrega] = useState("por_entregar");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [dueDate, setDueDate] = useState(today);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async () => {
    // Synchronous guard — blocks re-entry before React re-renders the disabled button
    if (submittingRef.current) return;

    if (!precio || Number(precio) <= 0) {
      alert("Debe ingresar un precio válido");
      return;
    }
    if (!paymentMethod) {
      alert("Debe seleccionar el método de pago");
      return;
    }
    if (!dueDate) {
      alert("Debe seleccionar la fecha de emisión");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await onSubmit({
        separacionId: separacion.id,
        cliente: separacion.cliente,
        unidad_producto: separacion.unidad_producto,
        precio: parseInt(precio, 10),
        notas,
        estado_entrega: estadoEntrega,
        payment_method: paymentMethod,
        due_date: dueDate,
        serial_item: separacion.unidad_serial,
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <ModalBase
      title="Completar Venta"
      icon={<ShoppingCart size={22} />}
      subtitle="Convertir separación en venta con factura"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={submitting}
      submitLabel={submitting ? "Procesando..." : "Completar Venta"}
    >
      <div className="cvm-form-grid">
        {/* Summary */}
        <div className="cvm-full">
          <div className="cvm-summary">
            <div className="cvm-summary-product">
              <span className="cvm-summary-product-label">Producto</span>
              <span className="cvm-summary-product-name">
                {separacion.producto_nombre || "—"}
              </span>
            </div>
            <div className="cvm-summary-row">
              <div className="cvm-summary-item">
                <span className="cvm-summary-label">Cliente</span>
                <span className="cvm-summary-value">{separacion.cliente_nombre}</span>
              </div>
              <div className="cvm-summary-item">
                <span className="cvm-summary-label">Serial</span>
                <span className="cvm-summary-value cvm-summary-value--mono">
                  {separacion.unidad_serial}
                </span>
              </div>
              <div className="cvm-summary-item">
                <span className="cvm-summary-label">Abono pagado</span>
                <span className="cvm-summary-value">{formatCOP(separacion.valor_abono)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Datos de la venta ── */}
        <div className="cvm-full cvm-section-header">Datos de la venta</div>

        {/* Precio final — prominent full width */}
        <div className="cvm-form-group cvm-form-group--price cvm-full">
          <label htmlFor="cvm-precio">
            Precio final <span className="required">*</span>
          </label>
          <div className="cvm-price-wrapper">
            <span className="cvm-price-prefix">$</span>
            <input
              id="cvm-precio"
              className="cvm-price-input"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={precio ? Number(precio).toLocaleString("es-CO") : ""}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^\d]/g, "");
                setPrecio(digits);
              }}
            />
          </div>
        </div>

        {/* Notas */}
        <div className="cvm-form-group cvm-full">
          <label htmlFor="cvm-notas">Notas (opcional)</label>
          <input
            id="cvm-notas"
            type="text"
            placeholder="Notas adicionales..."
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        {/* Estado de Entrega */}
        <div className="cvm-form-group cvm-full">
          <label>Estado de Entrega</label>
          <div className="cvm-toggle">
            <button
              type="button"
              className={`cvm-toggle-btn${estadoEntrega === "por_entregar" ? " active" : ""}`}
              onClick={() => setEstadoEntrega("por_entregar")}
            >
              Por Entregar
            </button>
            <button
              type="button"
              className={`cvm-toggle-btn${estadoEntrega === "entregado" ? " active" : ""}`}
              onClick={() => setEstadoEntrega("entregado")}
            >
              Entregado
            </button>
          </div>
        </div>

        {/* ── Datos de la factura ── */}
        <div className="cvm-full cvm-section-header">Datos de la factura</div>

        {/* Metodo de Pago */}
        <div className="cvm-form-group">
          <label htmlFor="cvm-payment">
            Método de Pago <span className="required">*</span>
          </label>
          <select
            id="cvm-payment"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Fecha de emisión */}
        <div className="cvm-form-group">
          <label htmlFor="cvm-date">
            Fecha de emisión <span className="required">*</span>
          </label>
          <input
            id="cvm-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Callout */}
        <div className="cvm-full">
          <div className="cvm-callout">
            <Info size={16} />
            <p>
              Se creará una <strong>venta</strong> con la unidad separada, se marcará la separación
              como <strong>completada</strong> y se generará la <strong>factura</strong>{" "}
              automáticamente.
            </p>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

export default CompletarVentaModal;
