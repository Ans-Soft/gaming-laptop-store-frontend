import React, { useState } from "react";
import { FileText } from "lucide-react";
import ModalBase from "./ModalBase";
import "../../styles/admin/generarReciboModal.css";

const formatCOP = (value) => "$" + Number(value).toLocaleString("es-CO");

const GenerarReciboModal = ({ separacion, onClose, onSubmit }) => {
  const today = new Date().toISOString().split("T")[0];

  const [paymentMethod, setPaymentMethod] = useState("");
  const [dueDate, setDueDate] = useState(today);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!paymentMethod) {
      alert("Debe seleccionar el método de pago");
      return;
    }
    if (!dueDate) {
      alert("Debe seleccionar la fecha del recibo");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        cliente: separacion.cliente,
        separacion: separacion.id,
        concepto: "separacion",
        serial_item: separacion.unidad_serial,
        total_amount: parseFloat(separacion.valor_abono),
        payment_method: paymentMethod,
        due_date: dueDate,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalBase
      title="Generar Recibo"
      icon={<FileText size={22} />}
      subtitle="Generar recibo para la separación"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={submitting ? "Generando..." : "Generar Recibo"}
    >
      <div className="grm-form-grid">
        {/* Summary */}
        <div className="grm-full">
          <div className="grm-summary">
            <div className="grm-summary-item">
              <span className="grm-summary-label">Cliente</span>
              <span className="grm-summary-value">{separacion.cliente_nombre}</span>
            </div>
            <div className="grm-summary-item">
              <span className="grm-summary-label">Serial</span>
              <span className="grm-summary-value" style={{ fontFamily: "Courier New, monospace" }}>
                {separacion.unidad_serial}
              </span>
            </div>
            <div className="grm-summary-item">
              <span className="grm-summary-label">Valor Abono</span>
              <span className="grm-summary-value" style={{ color: "var(--primary-color)" }}>
                {formatCOP(separacion.valor_abono)}
              </span>
            </div>
          </div>
        </div>

        {/* Metodo de Pago */}
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
            Se generará un recibo por el valor del abono (<strong>{formatCOP(separacion.valor_abono)}</strong>)
            y se enviará por correo al cliente.
          </p>
        </div>
      </div>
    </ModalBase>
  );
};

export default GenerarReciboModal;
