import React, { useRef } from "react";
import { FaShieldAlt } from "react-icons/fa";
import ModalBase from "./ModalBase";
import ClienteSelector from "./ClienteSelector";
import "../../styles/admin/metodoAliadoForm.css";

const GarantiaForm = ({ unidad, onClose, onSubmit }) => {
  const clienteRef = useRef();

  const handleSubmit = async () => {
    try {
      const clienteId = await clienteRef.current.getClienteId();
      if (!clienteId) return;
      onSubmit({
        unidadId: unidad.id,
        cliente_garantia: clienteId,
      });
    } catch (error) {
      console.error("Error al crear cliente:", error);
      const data = error.response?.data;
      const msg = data?.cedula || data?.correo || data?.detail || "Error al crear el cliente";
      alert(typeof msg === "object" ? JSON.stringify(msg) : msg);
    }
  };

  return (
    <ModalBase
      title="Entregar por Garantía"
      icon={<FaShieldAlt size={22} />}
      subtitle={`Unidad: ${unidad.serial} — ${unidad.producto_nombre || ""}`}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="ma-form-grid">
        <div className="ma-form-group ma-full">
          <ClienteSelector ref={clienteRef} />
        </div>

        <div className="ma-form-group ma-full">
          <p className="ma-info">
            La unidad se marcará como <strong>Entregada por Garantía</strong> y se asociará al cliente seleccionado.
          </p>
        </div>
      </div>
    </ModalBase>
  );
};

export default GarantiaForm;
