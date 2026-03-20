import React, { useState, useEffect } from "react";
import { Sliders, Edit } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import "../../styles/admin/brandsForm.css";

/**
 * Modal form for creating and editing product fields (CampoProducto).
 * Wraps ModalBase and follows the same pattern as ProductTypesForm.
 *
 * @param {Function} onClose - Callback to close the modal.
 * @param {Function} onSubmit - Callback called with (formData, id|undefined).
 * @param {Object|null} productField - Existing field object when editing, null when creating.
 * @param {boolean} isSubmitting - Disables inputs and submit button while saving.
 * @param {string|null} submitError - Error message to display in the form banner.
 */
const ProductFieldsForm = ({
  onClose,
  onSubmit,
  productField,
  isSubmitting,
  submitError,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "texto",
  });

  const isEditMode = Boolean(productField);

  const tipoOptions = [
    { value: "texto", label: "Texto" },
    { value: "numero", label: "Número" },
    { value: "booleano", label: "Booleano" },
  ];

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        nombre: productField.nombre,
        tipo: productField.tipo || "texto",
      });
    } else {
      setFormData({ nombre: "", tipo: "texto" });
    }
  }, [productField, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(formData, productField?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Campo de Producto" : "Registrar Nuevo Campo de Producto"}
      icon={isEditMode ? <Edit size={24} /> : <Sliders size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información del campo de producto"
          : "Completa la información para agregar el campo al sistema"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      {submitError && <div className="form-error-banner">{submitError}</div>}

      <div className="form-grid">
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="nombre">
            Nombre <span className="required">*</span>
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            placeholder="Ej: Procesador, RAM, VRAM"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="tipo">
            Tipo de Campo <span className="required">*</span>
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--fourth-color)",
              borderRadius: "6px",
              padding: "0.6rem 0.8rem",
              color: "var(--text-color)",
              fontFamily: "inherit",
              fontSize: "0.9rem",
              outline: "none",
            }}
          >
            {tipoOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </ModalBase>
  );
};

export default ProductFieldsForm;
