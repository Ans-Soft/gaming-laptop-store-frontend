import React, { useState, useEffect } from "react";
import { ShieldCheck, Edit } from "lucide-react";
import ModalBase from "./ModalBase";
import "../../styles/admin/brandsForm.css";

/**
 * Form for creating / editing a Deal Watcher TrustedSeller.
 * The username is normalised to lowercase server-side; we strip whitespace here.
 */
const TrustedSellerForm = ({
  onClose,
  onSubmit,
  seller,
  isSubmitting,
  submitError,
}) => {
  const isEditMode = Boolean(seller);
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    notes: "",
  });

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        username: seller.username || "",
        display_name: seller.display_name || "",
        notes: seller.notes || "",
      });
    } else {
      setFormData({ username: "", display_name: "", notes: "" });
    }
  }, [seller, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!onSubmit) return;
    onSubmit(
      {
        username: formData.username.trim(),
        display_name: formData.display_name.trim(),
        notes: formData.notes,
      },
      seller?.id,
    );
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Seller Confiable" : "Registrar Seller Confiable"}
      icon={isEditMode ? <Edit size={24} /> : <ShieldCheck size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información del seller de eBay"
          : "Agrega un seller de eBay cuyas ofertas activan la notificación"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      {submitError && <div className="form-error-banner">{submitError}</div>}

      <div className="form-grid">
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="username">
            Username de eBay <span className="required">*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Ej: antonline"
            value={formData.username}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            autoCapitalize="off"
            autoCorrect="off"
          />
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            Se guarda en minúsculas; debe coincidir exacto con `seller.username` de eBay.
          </small>
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="display_name">Nombre visible (opcional)</label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            placeholder="Ej: Antonline LLC"
            value={formData.display_name}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="notes">Notas (opcional)</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Por qué confías en este seller, condiciones especiales, etc."
            value={formData.notes}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </ModalBase>
  );
};

export default TrustedSellerForm;
