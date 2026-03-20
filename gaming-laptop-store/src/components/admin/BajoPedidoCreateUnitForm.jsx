import React, { useState } from "react";
import ModalBase from "./ModalBase";
import "../../styles/admin/bajoPedidoForm.css";

/**
 * BajoPedidoCreateUnitForm — Modal form to create a UnidadProducto from a BajoPedido record.
 * Props:
 *   bajoPedido (obj) - The source BajoPedido record
 *   onClose (fn) - Callback to close modal
 *   onSubmit (fn) - Callback on successful creation: (payload) => void
 *   isSubmitting (bool) - Loading state
 *   submitError (str) - Error message if form submission failed
 */
const BajoPedidoCreateUnitForm = ({
  bajoPedido,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const [formData, setFormData] = useState({
    serial: "",
    precio: bajoPedido?.precio || 0,
    estado_venta: "sin_vender",
    estado_producto: "en_stock",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "precio" ? parseFloat(value) || 0 : value,
    }));
    // Clear error for this field when user starts editing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.serial.trim()) {
      newErrors.serial = "El número de serie es requerido";
    }
    if (formData.precio <= 0) {
      newErrors.precio = "El precio debe ser mayor a 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      producto: bajoPedido.producto,
      condicion: bajoPedido.condicion,
      serial: formData.serial.trim(),
      precio: formData.precio,
      estado_venta: formData.estado_venta,
      estado_producto: formData.estado_producto,
    };

    onSubmit(payload);
  };

  return (
    <ModalBase onClose={onClose} title="Crear Unidad desde Bajo Pedido">
      <form className="bpf-form" onSubmit={handleSubmit}>
        {/* Info section — read-only */}
        <div className="bpf-info-section">
          <div className="bpf-field">
            <label>Producto</label>
            <input
              type="text"
              value={bajoPedido?.producto_nombre || ""}
              disabled
              className="bpf-input"
            />
          </div>
          <div className="bpf-field">
            <label>Condición</label>
            <input
              type="text"
              value={bajoPedido?.condicion ? bajoPedido.condicion.charAt(0).toUpperCase() + bajoPedido.condicion.slice(1) : ""}
              disabled
              className="bpf-input"
            />
          </div>
        </div>

        {/* Editable fields */}
        <div className="bpf-field">
          <label htmlFor="serial">
            Número de Serie <span className="required">*</span>
          </label>
          <input
            id="serial"
            type="text"
            name="serial"
            value={formData.serial}
            onChange={handleChange}
            placeholder="ej. ABC123456789"
            className={`bpf-input ${errors.serial ? "bpf-input--error" : ""}`}
            disabled={isSubmitting}
          />
          {errors.serial && <span className="bpf-error">{errors.serial}</span>}
        </div>

        <div className="bpf-field">
          <label htmlFor="precio">
            Precio (COP) <span className="required">*</span>
          </label>
          <input
            id="precio"
            type="number"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            step="1"
            min="0"
            className={`bpf-input ${errors.precio ? "bpf-input--error" : ""}`}
            disabled={isSubmitting}
          />
          {errors.precio && <span className="bpf-error">{errors.precio}</span>}
          <small className="bpf-hint">Pre-rellenado del precio en Bajo Pedido</small>
        </div>

        <div className="bpf-field">
          <label htmlFor="estado_venta">Estado de Venta</label>
          <select
            id="estado_venta"
            name="estado_venta"
            value={formData.estado_venta}
            onChange={handleChange}
            className="bpf-select"
            disabled={isSubmitting}
          >
            <option value="sin_vender">Sin Vender</option>
            <option value="separado">Separado</option>
            <option value="vendido">Vendido</option>
            <option value="por_encargo">Por Encargo</option>
            <option value="entregado_garantia">Entregado (Garantía)</option>
            <option value="dañado">Dañado</option>
            <option value="solicitud_metodo_aliado">Solicitud Método Aliado</option>
          </select>
        </div>

        <div className="bpf-field">
          <label htmlFor="estado_producto">Estado del Producto</label>
          <select
            id="estado_producto"
            name="estado_producto"
            value={formData.estado_producto}
            onChange={handleChange}
            className="bpf-select"
            disabled={isSubmitting}
          >
            <option value="en_stock">En Stock</option>
            <option value="viajando">Viajando</option>
            <option value="por_comprar">Por Comprar</option>
            <option value="por_entregar">Por Entregar</option>
            <option value="entregado">Entregado</option>
            <option value="por_reparar">Por Reparar</option>
            <option value="en_reparacion">En Reparación</option>
          </select>
        </div>

        {submitError && <div className="bpf-error-message">{submitError}</div>}

        <div className="bpf-actions">
          <button
            type="button"
            className="bpf-btn bpf-btn--secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bpf-btn bpf-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creando..." : "Crear Unidad"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

export default BajoPedidoCreateUnitForm;
