import React, { useState, useRef } from "react";
import { FaHandshake } from "react-icons/fa";
import ModalBase from "./ModalBase";
import ClienteSelector from "./ClienteSelector";
import "../../styles/admin/metodoAliadoForm.css";

const MetodoAliadoForm = ({ unidad, onClose, onSubmit }) => {
  const clienteRef = useRef();
  const [ciudadEnvio, setCiudadEnvio] = useState("");
  const [ciudadError, setCiudadError] = useState("");

  const handleSubmit = async () => {
    let hasError = false;

    if (!ciudadEnvio.trim()) {
      setCiudadError("Debe ingresar la ciudad de envío");
      hasError = true;
    } else {
      setCiudadError("");
    }

    try {
      const clienteId = await clienteRef.current.getClienteId();
      if (!clienteId) return; // validation failed inside selector
      if (hasError) return;

      onSubmit({
        unidadId: unidad.id,
        cliente: clienteId,
        ciudad_envio: ciudadEnvio.trim(),
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
      title="Solicitud Método Aliado"
      icon={<FaHandshake size={22} />}
      subtitle={`Unidad: ${unidad.serial} — ${unidad.producto_nombre || ""}`}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="ma-form-grid">
        <div className="ma-form-group ma-full">
          <ClienteSelector ref={clienteRef} />
        </div>

        <div className="ma-form-group ma-full">
          <label htmlFor="ma-ciudad">
            Ciudad de envío <span className="required">*</span>
          </label>
          <input
            id="ma-ciudad"
            type="text"
            placeholder="Ej: Medellín, Bogotá, Cali..."
            value={ciudadEnvio}
            onChange={(e) => {
              setCiudadEnvio(e.target.value);
              if (ciudadError) setCiudadError("");
            }}
          />
          {ciudadError && <span className="ma-error">{ciudadError}</span>}
        </div>

        <div className="ma-form-group ma-full">
          <p className="ma-info">
            La unidad se marcará como <strong>Solicitud Método Aliado</strong> y se asociará al cliente seleccionado.
          </p>
        </div>
      </div>
    </ModalBase>
  );
};

export default MetodoAliadoForm;
