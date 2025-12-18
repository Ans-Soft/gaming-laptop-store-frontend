import React from "react";
import { X } from "lucide-react";
import "../../styles/admin/modalBase.css";

const ModalBase = ({
  title,
  icon,
  subtitle,
  onClose,
  children,
  onSubmit,
  isSubmitting = false,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            {icon && <span className="modal-icon">{icon}</span>}
            <h2>{title}</h2>
          </div>
          <button
            className="close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {subtitle && <p className="modal-subtitle">{subtitle}</p>}

        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit && onSubmit();
          }}
        >
          {children}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "+ Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalBase;
