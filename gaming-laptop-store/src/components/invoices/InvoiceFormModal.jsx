import React, { useState, useEffect } from "react";
import { FileText, Edit } from "lucide-react";
import ModalBase from "../admin/ModalBase";
import "../../styles/admin/invoiceForm.css";

const EMPTY_FORM = {
  client_name: "",
  client_document: "",
  client_phone: "",
  client_address: "",
  client_email: "",
  concepto: "",
  item: "",
  serial_item: "",
  total_amount: "",
  payment_method: "",
  due_date: "",
};

const REQUIRED_FIELDS = Object.keys(EMPTY_FORM);

function computeBillId(due_date, serial_item) {
  if (!due_date || !serial_item.trim()) return "";
  const datePart = due_date.replace(/-/g, "");
  const serialPart = serial_item.trim().toUpperCase().replace(/\s+/g, "");
  return `${datePart}-${serialPart}`;
}

const InvoiceFormModal = ({ onClose, onSubmit, invoice, isSubmitting }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [aiExpanded, setAiExpanded] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiToast, setAiToast] = useState(false);

  const isEditMode = Boolean(invoice);

  useEffect(() => {
    if (isEditMode && invoice) {
      setFormData({
        client_name: invoice.client_name || "",
        client_document: invoice.client_document || "",
        client_phone: invoice.client_phone || "",
        client_address: invoice.client_address || "",
        client_email: invoice.client_email || "",
        concepto: invoice.concepto || "",
        item: invoice.item || "",
        serial_item: invoice.serial_item || "",
        total_amount: invoice.total_amount || "",
        payment_method: invoice.payment_method || "",
        due_date: invoice.due_date || "",
      });
    }
  }, [invoice, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!formData[field] || !String(formData[field]).trim()) {
        newErrors[field] = "Este campo es requerido.";
      }
    });
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (onSubmit) onSubmit(formData, invoice?.id);
  };

  const handleAiClick = () => {
    setAiToast(true);
    setTimeout(() => setAiToast(false), 3000);
  };

  const billIdPreview = computeBillId(formData.due_date, formData.serial_item);

  return (
    <ModalBase
      title={isEditMode ? "Editar Factura" : "Nueva Factura"}
      icon={isEditMode ? <Edit size={24} /> : <FileText size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza los datos de la factura"
          : "Completa los datos del cliente y la venta para generar la factura"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <div className="inv-form">
        {/* Section 1 — Client Data */}
        <div className="inv-section">
          <h3 className="inv-section-title">Datos del Cliente</h3>
          <div className="inv-grid">
            <div className="inv-field">
              <label htmlFor="client_name">
                Nombre <span className="inv-required">*</span>
              </label>
              <input
                id="client_name"
                name="client_name"
                type="text"
                placeholder="Ej: Juan Pérez"
                value={formData.client_name}
                onChange={handleChange}
              />
              {errors.client_name && (
                <span className="inv-error">{errors.client_name}</span>
              )}
            </div>

            <div className="inv-field">
              <label htmlFor="client_document">
                Cédula / NIT <span className="inv-required">*</span>
              </label>
              <input
                id="client_document"
                name="client_document"
                type="text"
                placeholder="Ej: 1234567890"
                value={formData.client_document}
                onChange={handleChange}
              />
              {errors.client_document && (
                <span className="inv-error">{errors.client_document}</span>
              )}
            </div>

            <div className="inv-field">
              <label htmlFor="client_phone">
                Teléfono <span className="inv-required">*</span>
              </label>
              <input
                id="client_phone"
                name="client_phone"
                type="text"
                placeholder="Ej: 3001234567"
                value={formData.client_phone}
                onChange={handleChange}
              />
              {errors.client_phone && (
                <span className="inv-error">{errors.client_phone}</span>
              )}
            </div>

            <div className="inv-field">
              <label htmlFor="client_email">
                Correo electrónico <span className="inv-required">*</span>
              </label>
              <input
                id="client_email"
                name="client_email"
                type="email"
                placeholder="Ej: juan@email.com"
                value={formData.client_email}
                onChange={handleChange}
              />
              {errors.client_email && (
                <span className="inv-error">{errors.client_email}</span>
              )}
            </div>

            <div className="inv-field inv-field--full">
              <label htmlFor="client_address">
                Dirección <span className="inv-required">*</span>
              </label>
              <input
                id="client_address"
                name="client_address"
                type="text"
                placeholder="Ej: Cra 15 #23-45, Bogotá"
                value={formData.client_address}
                onChange={handleChange}
              />
              {errors.client_address && (
                <span className="inv-error">{errors.client_address}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2 — Sale Data */}
        <div className="inv-section">
          <h3 className="inv-section-title">Datos de la Venta</h3>
          <div className="inv-grid">
            <div className="inv-field">
              <label htmlFor="concepto">
                Concepto <span className="inv-required">*</span>
              </label>
              <select
                id="concepto"
                name="concepto"
                value={formData.concepto}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                <option value="venta">Venta</option>
                <option value="separacion">Separación</option>
              </select>
              {errors.concepto && (
                <span className="inv-error">{errors.concepto}</span>
              )}
            </div>

            <div className="inv-field">
              <label htmlFor="item">
                Producto <span className="inv-required">*</span>
              </label>
              <select
                id="item"
                name="item"
                value={formData.item}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                <option value="laptop">Laptop</option>
                <option value="tarjeta_grafica">Tarjeta Gráfica</option>
                <option value="hardware">Hardware</option>
                <option value="pc_mesa">PC de Mesa</option>
              </select>
              {errors.item && <span className="inv-error">{errors.item}</span>}
            </div>

            <div className="inv-field">
              <label htmlFor="serial_item">
                Serial <span className="inv-required">*</span>
              </label>
              <input
                id="serial_item"
                name="serial_item"
                type="text"
                placeholder="Ej: SN123ABC"
                value={formData.serial_item}
                onChange={handleChange}
              />
              {errors.serial_item && (
                <span className="inv-error">{errors.serial_item}</span>
              )}
            </div>

            <div className="inv-field">
              <label htmlFor="total_amount">
                Monto total (COP) <span className="inv-required">*</span>
              </label>
              <input
                id="total_amount"
                name="total_amount"
                type="number"
                min="0"
                step="1"
                placeholder="Ej: 3500000"
                value={formData.total_amount}
                onChange={handleChange}
              />
              {errors.total_amount && (
                <span className="inv-error">{errors.total_amount}</span>
              )}
            </div>

            <div className="inv-field">
              <label htmlFor="payment_method">
                Método de pago <span className="inv-required">*</span>
              </label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </select>
              {errors.payment_method && (
                <span className="inv-error">{errors.payment_method}</span>
              )}
            </div>

            <div className="inv-field">
              <label htmlFor="due_date">
                Fecha de emisión <span className="inv-required">*</span>
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
              />
              {errors.due_date && (
                <span className="inv-error">{errors.due_date}</span>
              )}
            </div>
          </div>
        </div>

        {/* Live Bill ID preview */}
        {billIdPreview && (
          <div className="inv-bill-preview">
            <span className="inv-bill-label">Bill ID:</span>
            <span className="inv-bill-value">{billIdPreview}</span>
          </div>
        )}

        {/* AI Pre-fill section (scaffold only) */}
        <div className="inv-ai-section">
          <button
            type="button"
            className="inv-ai-toggle"
            onClick={() => setAiExpanded((p) => !p)}
          >
            <span>✨ Prellenar con IA (próximamente)</span>
            <span className="inv-ai-arrow">{aiExpanded ? "▲" : "▼"}</span>
          </button>

          {aiExpanded && (
            <div className="inv-ai-body">
              <textarea
                className="inv-ai-textarea"
                placeholder='Ej: "El cliente es Juan Pérez, cédula 1234567, vendí una laptop HP serial XYZ123 por 3 millones en efectivo"'
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                rows={3}
              />
              <button
                type="button"
                className="inv-ai-btn"
                onClick={handleAiClick}
              >
                Analizar con IA
              </button>
              {aiToast && (
                <p className="inv-ai-toast">
                  Funcionalidad próximamente disponible
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalBase>
  );
};

export default InvoiceFormModal;
