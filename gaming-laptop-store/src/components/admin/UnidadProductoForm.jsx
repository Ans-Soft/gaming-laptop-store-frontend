import React, { useState, useEffect } from "react";
import { Box, Edit } from "lucide-react";
import ModalBase from "./ModalBase";
import "../../styles/admin/unidadForm.css";

const ESTADO_VENTA_OPTIONS = [
  { value: "sin_vender", label: "Sin Vender" },
  { value: "separado", label: "Separado" },
  { value: "vendido", label: "Vendido" },
  { value: "por_encargo", label: "Por Encargo" },
  { value: "entregado_garantia", label: "Entregado en Garantía" },
  { value: "danado", label: "Dañado" },
  { value: "solicitud_metodo_aliado", label: "Solicitud Método Aliado" },
];

const ESTADO_PRODUCTO_OPTIONS = [
  { value: "en_stock", label: "En Stock" },
  { value: "viajando", label: "Viajando" },
  { value: "por_comprar", label: "Por Comprar" },
  { value: "por_entregar", label: "Por Entregar" },
  { value: "entregado", label: "Entregado" },
  { value: "por_reparar", label: "Por Reparar" },
  { value: "en_reparacion", label: "En Reparación" },
];

const EMPTY_FORM = {
  serial: "",
  estado_venta: "sin_vender",
  estado_producto: "en_stock",
  precio: "",
};

/**
 * UnidadProductoForm — create and edit form for UnidadProducto.
 *
 * Features:
 *   - Displays the associated variant name in a banner at the top.
 *   - Required fields: serial, estado_venta, estado_producto, precio.
 *   - Info notice explaining that changing estado_producto triggers automatic
 *     variant estado sync on the backend.
 *
 * Props:
 *   onClose         {Function}  — closes the modal
 *   onSubmit        {Function}  — (payload: Object, id?: number) => void
 *   unidad          {Object}    — existing unidad for edit mode (null for create)
 *   varianteId      {number}    — required when creating from a variant context
 *   varianteNombre  {string}    — variant label to show in the banner
 *   isSubmitting    {boolean}
 *   submitError     {string}
 */
const UnidadProductoForm = ({
  onClose,
  onSubmit,
  unidad,
  varianteId,
  varianteNombre,
  isSubmitting,
  submitError,
}) => {
  const isEditMode = Boolean(unidad);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});

  // ── Resolved variant context ───────────────────────────────────────────────
  const displayVarianteId = isEditMode ? unidad.variante : varianteId;
  const displayVarianteNombre = isEditMode
    ? (unidad.variante_nombre || "—")
    : (varianteNombre || "—");

  // ── Mount: pre-populate in edit mode ──────────────────────────────────────
  useEffect(() => {
    if (isEditMode && unidad) {
      setFormData({
        serial: unidad.serial || "",
        estado_venta: unidad.estado_venta || "sin_vender",
        estado_producto: unidad.estado_producto || "en_stock",
        precio: unidad.precio !== null && unidad.precio !== undefined
          ? String(unidad.precio)
          : "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    const newErrors = {};

    if (!formData.serial || !formData.serial.trim()) {
      newErrors.serial = "El serial es obligatorio.";
    }
    if (!formData.estado_venta) {
      newErrors.estado_venta = "Selecciona un estado de venta.";
    }
    if (!formData.estado_producto) {
      newErrors.estado_producto = "Selecciona un estado del producto.";
    }
    if (
      !formData.precio ||
      isNaN(Number(formData.precio)) ||
      Number(formData.precio) <= 0
    ) {
      newErrors.precio = "El precio debe ser un número mayor a 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      serial: formData.serial.trim(),
      estado_venta: formData.estado_venta,
      estado_producto: formData.estado_producto,
      precio: Number(formData.precio),
    };

    // Include variante_id only on create
    if (!isEditMode && displayVarianteId) {
      payload.variante_id = Number(displayVarianteId);
    }

    if (onSubmit) onSubmit(payload, unidad?.id);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ModalBase
      title={isEditMode ? "Editar Unidad" : "Nueva Unidad"}
      icon={isEditMode ? <Edit size={24} /> : <Box size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información de la unidad"
          : "Completa la información para registrar una nueva unidad de la variante"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      {submitError && <div className="form-error-banner">{submitError}</div>}

      {/* Variant context banner */}
      <div className="uf-variant-banner">
        <span className="uf-variant-banner-label">Variante:</span>
        <span className="uf-variant-banner-name">{displayVarianteNombre}</span>
      </div>

      {/* Cascade explanation box */}
      <div
        style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          backgroundColor: "#dbeafe",
          border: "1px solid #93c5fd",
          borderRadius: "6px",
          fontSize: "0.9rem",
          color: "#1e40af",
        }}
      >
        <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>ℹ Cambios en cascada</div>
        <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
          <li>
            El <strong>precio de la variante</strong> se actualizará al valor mínimo de todas las unidades activas.
          </li>
          <li>
            El <strong>estado de la variante</strong> se ajustará según los estados de sus unidades activas.
          </li>
          <li>
            Cambios en unidades inactivas no afectan a la variante.
          </li>
        </ul>
      </div>

      {/* Main fields grid */}
      <div className="uf-grid">

        {/* Serial — full width */}
        <div className="form-group form-group--full">
          <label htmlFor="uf-serial">
            Serial <span className="required">*</span>
          </label>
          <input
            id="uf-serial"
            name="serial"
            type="text"
            placeholder="Ej: SN-123456789"
            value={formData.serial}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          {errors.serial && (
            <span className="uf-field-error">{errors.serial}</span>
          )}
        </div>

        {/* Precio */}
        <div className="form-group">
          <label htmlFor="uf-precio">
            Precio (COP) <span className="required">*</span>
          </label>
          <input
            id="uf-precio"
            name="precio"
            type="number"
            min="0"
            step="any"
            placeholder="Ej: 4500000"
            value={formData.precio}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          <span className="uf-price-hint">
            El precio de la variante se actualizará al mínimo de sus unidades activas.
          </span>
          {errors.precio && (
            <span className="uf-field-error">{errors.precio}</span>
          )}
        </div>

        {/* Estado venta */}
        <div className="form-group">
          <label htmlFor="uf-estado-venta">
            Estado de Venta <span className="required">*</span>
          </label>
          <select
            id="uf-estado-venta"
            name="estado_venta"
            value={formData.estado_venta}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          >
            {ESTADO_VENTA_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.estado_venta && (
            <span className="uf-field-error">{errors.estado_venta}</span>
          )}
        </div>

        {/* Estado producto */}
        <div className="form-group form-group--full">
          <label htmlFor="uf-estado-producto">
            Estado del Producto <span className="required">*</span>
          </label>
          <select
            id="uf-estado-producto"
            name="estado_producto"
            value={formData.estado_producto}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          >
            {ESTADO_PRODUCTO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.estado_producto && (
            <span className="uf-field-error">{errors.estado_producto}</span>
          )}
        </div>

      </div>
    </ModalBase>
  );
};

export default UnidadProductoForm;
