import React, { useRef, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import "../../styles/admin/confirmModal.css";
import "../../styles/admin/notifyModal.css";

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconClass: "nm-icon-success",
    btnClass: "nm-btn-success",
    defaultTitle: "Operación exitosa",
  },
  error: {
    icon: XCircle,
    iconClass: "nm-icon-error",
    btnClass: "nm-btn-error",
    defaultTitle: "Ocurrió un error",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "cm-icon-warning",
    btnClass: "cm-btn-warning",
    defaultTitle: "Atención",
  },
  info: {
    icon: Info,
    iconClass: "nm-icon-info",
    btnClass: "nm-btn-info",
    defaultTitle: "Información",
  },
};

const NotifyModal = ({
  variant = "info",
  title,
  message,
  buttonLabel = "Aceptar",
  onClose,
}) => {
  const modalRef = useRef();
  const config = VARIANTS[variant] || VARIANTS.info;
  const Icon = config.icon;

  useEffect(() => {
    document.body.classList.add("modal-open");
    const handleKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose?.();
    }
  };

  return (
    <div className="cm-overlay" onMouseDown={handleOverlayClick}>
      <div className="cm-container" ref={modalRef}>
        <div className={`cm-icon-wrap ${config.iconClass}`}>
          <Icon size={28} />
        </div>

        <h3 className="cm-title">{title || config.defaultTitle}</h3>

        {message && <p className="cm-message">{message}</p>}

        <div className="cm-actions nm-actions-single">
          <button className={`cm-btn-confirm ${config.btnClass}`} onClick={onClose}>
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotifyModal;
