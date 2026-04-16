import React, { useState } from "react";
import { FileText } from "lucide-react";
import ModalBase from "./ModalBase";
import NotifyModal from "./NotifyModal";
import "../../styles/admin/generarReciboModal.css";

const formatCOP = (value) => "$" + Number(value).toLocaleString("es-CO");

const GenerarReciboVentaModal = ({ venta, onClose, onSubmit }) => {
  const today = new Date().toISOString().split("T")[0];

  const [paymentMethod, setPaymentMethod] = useState("");
  const [dueDate, setDueDate] = useState(today);
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState(null);

  const items = venta?.items || [];
  const serialsList = items.map((i) => i.unidad_serial).filter(Boolean);
  const primarySerial = serialsList[0] || "";
  const total = Number(venta?.total || 0);
  const productosTexto =
    items.map((i) => i.producto_nombre).filter(Boolean).join(", ") || `${items.length} producto${items.length === 1 ? "" : "s"}`;

  const handleSubmit = async () => {
    if (!paymentMethod) {
      setWarning({ title: "Método de pago requerido", message: "Debes seleccionar un método de pago antes de generar el recibo." });
      return;
    }
    if (!dueDate) {
      setWarning({ title: "Fecha requerida", message: "Debes seleccionar la fecha del recibo." });
      return;
    }
    if (!primarySerial) {
      setWarning({
        title: "Sin serial disponible",
        message: "Esta venta no tiene unidades con serial asociadas, no se puede generar el recibo.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        cliente: venta.cliente,
        venta: venta.id,
        concepto: "venta",
        serial_item: primarySerial,
        total_amount: total,
        payment_method: paymentMethod,
        due_date: dueDate,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <ModalBase
      title="Generar y Enviar Recibo"
      icon={<FileText size={22} />}
      subtitle="Generar recibo para la venta y enviarlo por correo"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={submitting ? "Enviando..." : "Generar y Enviar"}
    >
      <div className="grm-form-grid">
        {/* Summary */}
        <div className="grm-full">
          <div className="grm-summary">
            <div className="grm-summary-item">
              <span className="grm-summary-label">Cliente</span>
              <span className="grm-summary-value">{venta.cliente_nombre}</span>
            </div>
            <div className="grm-summary-item">
              <span className="grm-summary-label">Venta</span>
              <span className="grm-summary-value">#{venta.id}</span>
            </div>
            <div className="grm-summary-item">
              <span className="grm-summary-label">Total</span>
              <span className="grm-summary-value" style={{ color: "var(--primary-color)" }}>
                {formatCOP(total)}
              </span>
            </div>
            <div className="grm-summary-item grm-full" style={{ gridColumn: "1 / -1" }}>
              <span className="grm-summary-label">Productos</span>
              <span className="grm-summary-value" style={{ fontFamily: "Courier New, monospace", fontSize: "0.8rem" }}>
                {productosTexto}
              </span>
            </div>
          </div>
        </div>

        {/* Método de Pago */}
        <div className="grm-form-group">
          <label htmlFor="grm-payment">
            Método de Pago <span className="required">*</span>
          </label>
          <select
            id="grm-payment"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="">Selecciona...</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Fecha */}
        <div className="grm-form-group">
          <label htmlFor="grm-date">
            Fecha del Recibo <span className="required">*</span>
          </label>
          <input
            id="grm-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="grm-form-group grm-full">
          <p className="grm-info">
            Se generará un recibo por el valor total de la venta (<strong>{formatCOP(total)}</strong>)
            y se enviará por correo al cliente.
          </p>
        </div>
      </div>
    </ModalBase>

    {warning && (
      <NotifyModal
        variant="warning"
        title={warning.title}
        message={warning.message}
        onClose={() => setWarning(null)}
      />
    )}
    </>
  );
};

export default GenerarReciboVentaModal;
