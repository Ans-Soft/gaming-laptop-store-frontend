import React, { useState, useRef, useEffect } from "react";
import { Package, X } from "lucide-react";
import "../../styles/admin/serialInputModal.css";

const SerialInputModal = ({ productoNombre, productoSubtitle, onClose, onSubmit, isSubmitting }) => {
  const [serial, setSerial] = useState("");
  const [error, setError] = useState("");
  const modalRef = useRef();

  useEffect(() => {
    document.body.classList.add("modal-open");
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = serial.trim();
    if (!trimmed) {
      setError("El serial es obligatorio");
      return;
    }
    if (trimmed.startsWith("SIN-SERIAL-")) {
      setError("Ingrese un serial real, no un placeholder");
      return;
    }
    setError("");
    onSubmit(trimmed);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <div className="modal-title">
            <h2>Registrar llegada de unidad</h2>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <form className="sim-form" onSubmit={handleSubmit}>
          <div className="sim-info">
            <Package size={20} />
            <div>
              <strong>{productoNombre}</strong>
              {productoSubtitle && (
                <span className="sim-subtitle">{productoSubtitle}</span>
              )}
            </div>
          </div>

          <p className="sim-description">
            Esta unidad está en tránsito. Para marcarla como <strong>En Oficina</strong>,
            ingrese el serial del equipo.
          </p>

          <div className="sim-field">
            <label htmlFor="sim-serial">Serial del equipo</label>
            <input
              id="sim-serial"
              type="text"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Ej: ABC123XYZ"
              autoFocus
            />
            {error && <span className="sim-error">{error}</span>}
          </div>

          <div className="sim-actions">
            <button type="button" className="sim-btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="sim-btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Confirmar llegada"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SerialInputModal;
