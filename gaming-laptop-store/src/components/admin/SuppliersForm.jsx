import React, { useState, useEffect } from "react";
import { Truck, Edit } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import "../../styles/admin/brandsForm.css";

/**
 * Modal form for creating and editing suppliers (Proveedor).
 * Wraps ModalBase and follows the same pattern as ProductFieldsForm.
 *
 * @param {Function} onClose - Callback to close the modal.
 * @param {Function} onSubmit - Callback called with (formData, id|undefined).
 * @param {Object|null} supplier - Existing supplier object when editing, null when creating.
 * @param {boolean} isSubmitting - Disables inputs and submit button while saving.
 * @param {string|null} submitError - Error message to display in the form banner.
 */
const SuppliersForm = ({
  onClose,
  onSubmit,
  supplier,
  isSubmitting,
  submitError,
}) => {
  const [formData, setFormData] = useState({ nombre: "" });

  const isEditMode = Boolean(supplier);

  useEffect(() => {
    if (isEditMode) {
      setFormData({ nombre: supplier.nombre });
    } else {
      setFormData({ nombre: "" });
    }
  }, [supplier, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(formData, supplier?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}
      icon={isEditMode ? <Edit size={24} /> : <Truck size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información del proveedor"
          : "Completa la información para agregar el proveedor al sistema"
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
            placeholder="Ej: Amazon, eBay, AliExpress"
            value={formData.nombre}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>
    </ModalBase>
  );
};

export default SuppliersForm;
