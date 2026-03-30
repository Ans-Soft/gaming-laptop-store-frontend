import React, { useRef, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import "../../styles/admin/confirmModal.css";

const ConfirmModal = ({
  title = "¿Estás seguro?",
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  isDestructive = true,
}) => {
  const modalRef = useRef();

  useEffect(() => {
    document.body.classList.add("modal-open");
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", handleKey);
    };
  }, [onCancel]);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onCancel();
    }
  };

  return (
    <div className="cm-overlay" onMouseDown={handleOverlayClick}>
      <div className="cm-container" ref={modalRef}>
        <div className={`cm-icon-wrap ${isDestructive ? "cm-icon-danger" : "cm-icon-warning"}`}>
          <AlertTriangle size={28} />
        </div>

        <h3 className="cm-title">{title}</h3>

        {message && <p className="cm-message">{message}</p>}

        <div className="cm-actions">
          <button className="cm-btn-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`cm-btn-confirm ${isDestructive ? "cm-btn-danger" : "cm-btn-warning"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
