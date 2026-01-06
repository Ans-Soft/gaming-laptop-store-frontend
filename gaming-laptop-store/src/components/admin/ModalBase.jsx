import React, { useRef, useEffect } from "react";
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
  cancelLabel,
}) => {
  const modalRef = useRef();

  useEffect(() => {
    document.body.classList.add("modal-open");
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
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
              {cancelLabel || "Cancelar"}
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
