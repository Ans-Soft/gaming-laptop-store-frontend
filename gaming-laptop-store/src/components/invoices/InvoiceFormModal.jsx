import React, { useState, useEffect } from "react";
import { FileText, Edit } from "lucide-react";
import ModalBase from "../admin/ModalBase";
import * as ClienteService from "../../services/ClienteService";
import "../../styles/admin/invoiceForm.css";

const EMPTY_FORM = {
  cliente: "",
  venta: "",
  separacion: "",
  concepto: "",
  item: "",
  serial_item: "",
  total_amount: "",
  payment_method: "",
  due_date: "",
};

const REQUIRED_FIELDS = ["cliente", "concepto", "item", "serial_item", "total_amount", "payment_method", "due_date"];

function computeBillId(due_date, serial_item) {
  if (!due_date || !serial_item.trim()) return "";
  const datePart = due_date.replace(/-/g, "");
  const serialPart = serial_item.trim().toUpperCase().replace(/\s+/g, "");
  return `${datePart}-${serialPart}`;
}

const InvoiceFormModal = ({ onClose, onSubmit, invoice, isSubmitting }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [clientes, setClientes] = useState([]);
  const [aiExpanded, setAiExpanded] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiToast, setAiToast] = useState(false);

  const isEditMode = Boolean(invoice);

  useEffect(() => {
    const loadClientes = async () => {
      try {
        const data = await ClienteService.getClientes();
        const list = Array.isArray(data) ? data : (data.clientes || data.results || []);
        setClientes(list);
      } catch (e) {
        console.error("Error loading clients:", e);
      }
    };
    loadClientes();
  }, []);

  useEffect(() => {
    if (isEditMode && invoice) {
      setFormData({
        cliente: invoice.cliente || "",
        venta: invoice.venta || "",
        separacion: invoice.separacion || "",
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
    if (formData.venta && formData.separacion) {
      newErrors.separacion = "No puede estar vinculado a una venta y separación al mismo tiempo.";
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const payload = { ...formData };
    if (!payload.venta) delete payload.venta;
    if (!payload.separacion) delete payload.separacion;
    if (onSubmit) onSubmit(payload, invoice?.id);
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
          : "Selecciona el cliente y completa los datos de la venta para generar la factura"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <div className="inv-form">
        {/* Section 1 — Cliente */}
        <div className="inv-section">
          <h3 className="inv-section-title">Cliente</h3>
          <div className="inv-grid">
            <div className="inv-field inv-field--full">
              <label htmlFor="cliente">
                Cliente <span className="inv-required">*</span>
              </label>
              <select
                id="cliente"
                name="cliente"
                value={formData.cliente}
                onChange={handleChange}
                disabled={clientes.length === 0}
              >
                <option value="">
                  {clientes.length === 0 ? "Cargando clientes..." : "Seleccionar cliente..."}
                </option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre_completo} — {c.cedula}
                  </option>
                ))}
              </select>
              {errors.cliente && <span className="inv-error">{errors.cliente}</span>}
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
              <select id="concepto" name="concepto" value={formData.concepto} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                <option value="venta">Venta</option>
                <option value="separacion">Separación</option>
              </select>
              {errors.concepto && <span className="inv-error">{errors.concepto}</span>}
            </div>

            <div className="inv-field">
              <label htmlFor="item">
                Producto <span className="inv-required">*</span>
              </label>
              <select id="item" name="item" value={formData.item} onChange={handleChange}>
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
              {errors.serial_item && <span className="inv-error">{errors.serial_item}</span>}
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
              {errors.total_amount && <span className="inv-error">{errors.total_amount}</span>}
            </div>

            <div className="inv-field">
              <label htmlFor="payment_method">
                Método de pago <span className="inv-required">*</span>
              </label>
              <select id="payment_method" name="payment_method" value={formData.payment_method} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </select>
              {errors.payment_method && <span className="inv-error">{errors.payment_method}</span>}
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
              {errors.due_date && <span className="inv-error">{errors.due_date}</span>}
            </div>
          </div>
        </div>

        {/* Section 3 — Optional transaction links */}
        <div className="inv-section">
          <h3 className="inv-section-title">Vincular a Transacción (opcional)</h3>
          <div className="inv-grid">
            <div className="inv-field">
              <label htmlFor="venta">ID de Venta</label>
              <input
                id="venta"
                name="venta"
                type="number"
                min="1"
                placeholder="Ej: 12"
                value={formData.venta}
                onChange={handleChange}
              />
              {errors.venta && <span className="inv-error">{errors.venta}</span>}
            </div>
            <div className="inv-field">
              <label htmlFor="separacion">ID de Separación</label>
              <input
                id="separacion"
                name="separacion"
                type="number"
                min="1"
                placeholder="Ej: 7"
                value={formData.separacion}
                onChange={handleChange}
              />
              {errors.separacion && <span className="inv-error">{errors.separacion}</span>}
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
              <button type="button" className="inv-ai-btn" onClick={handleAiClick}>
                Analizar con IA
              </button>
              {aiToast && (
                <p className="inv-ai-toast">Funcionalidad próximamente disponible</p>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalBase>
  );
};

export default InvoiceFormModal;
