import React, { useState, useEffect } from "react";
import { Box, Edit } from "lucide-react";
import ModalBase from "./ModalBase";
import "../../styles/admin/unidadForm.css";

const LOCKED_STATES = ["vendido", "separado"];
const LOCKED_LABELS = { vendido: "Vendido", separado: "Separado" };

const CONDICION_OPTIONS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "open_box", label: "Open Box" },
  { value: "refurbished", label: "Refurbished" },
  { value: "usado", label: "Usado" },
];

const EMPTY_FORM = {
  serial: "",
  condicion: "nuevo",
  precio: "",
};

/**
 * UnidadProductoForm — create and edit form for UnidadProducto.
 *
 * Props:
 *   onClose          {Function}  — closes the modal
 *   onSubmit         {Function}  — (payload: Object, id?: number) => void
 *   unidad           {Object}    — existing unidad for edit mode (null for create)
 *   productoId       {number}    — required when creating (product ID)
 *   productoNombre   {string}    — product label to show in the banner
 *   condicionDefault {string}    — pre-selected condition for create mode
 *   isSubmitting     {boolean}
 *   submitError      {string}
 */
const UnidadProductoForm = ({
  onClose,
  onSubmit,
  unidad,
  productoId,
  productoNombre,
  condicionDefault = "nuevo",
  isSubmitting,
  submitError,
}) => {
  const isEditMode = Boolean(unidad);
  const isLocked = isEditMode && LOCKED_STATES.includes(unidad?.estado_venta);

  const [formData, setFormData] = useState({ ...EMPTY_FORM, condicion: condicionDefault });
  const [errors, setErrors] = useState({});

  const displayProductoNombre = isEditMode
    ? (unidad.producto_nombre || "—")
    : (productoNombre || "—");

  useEffect(() => {
    if (isEditMode && unidad) {
      setFormData({
        serial: unidad.serial || "",
        condicion: unidad.condicion || "nuevo",
        precio: unidad.precio !== null && unidad.precio !== undefined
          ? String(unidad.precio)
          : "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.serial || !formData.serial.trim()) {
      newErrors.serial = "El serial es obligatorio.";
    }
    if (!formData.condicion) {
      newErrors.condicion = "Selecciona una condición.";
    }
    if (!formData.precio || isNaN(Number(formData.precio)) || Number(formData.precio) <= 0) {
      newErrors.precio = "El precio debe ser un número mayor a 0.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      serial: formData.serial.trim(),
      condicion: formData.condicion,
      precio: Number(formData.precio),
    };

    if (!isEditMode && productoId) {
      payload.producto_id = Number(productoId);
    }

    if (onSubmit) onSubmit(payload, unidad?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Unidad" : "Nueva Unidad"}
      icon={isEditMode ? <Edit size={24} /> : <Box size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información de la unidad"
          : "Completa la información para registrar una nueva unidad"
      }
      onClose={onClose}
      onSubmit={isLocked ? undefined : handleSubmit}
      isSubmitting={isSubmitting}
    >
      {submitError && <div className="form-error-banner">{submitError}</div>}

      {isLocked && (
        <div className="uf-locked-banner">
          Esta unidad está marcada como <strong>{LOCKED_LABELS[unidad.estado_venta]}</strong>.
          Para editarla, primero elimine la venta o separación asociada.
        </div>
      )}

      {/* Product context banner */}
      <div className="uf-variant-banner">
        <span className="uf-variant-banner-label">Producto:</span>
        <span className="uf-variant-banner-name">{displayProductoNombre}</span>
      </div>

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
            disabled={isSubmitting || isLocked}
            required
          />
          {errors.serial && <span className="uf-field-error">{errors.serial}</span>}
        </div>

        {/* Condición */}
        <div className="form-group">
          <label htmlFor="uf-condicion">
            Condición <span className="required">*</span>
          </label>
          <select
            id="uf-condicion"
            name="condicion"
            value={formData.condicion}
            onChange={handleChange}
            disabled={isSubmitting || isLocked}
            required
          >
            {CONDICION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.condicion && <span className="uf-field-error">{errors.condicion}</span>}
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
            disabled={isSubmitting || isLocked}
            required
          />
          {errors.precio && <span className="uf-field-error">{errors.precio}</span>}
        </div>

      </div>
    </ModalBase>
  );
};

export default UnidadProductoForm;
