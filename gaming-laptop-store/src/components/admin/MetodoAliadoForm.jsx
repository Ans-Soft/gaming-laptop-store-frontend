import React, { useState, useRef, useEffect } from "react";
import { FaHandshake } from "react-icons/fa";
import ModalBase from "./ModalBase";
import ClienteSelector from "./ClienteSelector";
import * as UbicacionService from "../../services/UbicacionService";
import "../../styles/admin/metodoAliadoForm.css";

const MetodoAliadoForm = ({ unidad, onClose, onSubmit }) => {
  const clienteRef = useRef();
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);
  const [departamento, setDepartamento] = useState("");
  const [ciudadId, setCiudadId] = useState("");
  const [transportadora, setTransportadora] = useState("");
  const [numeroGuia, setNumeroGuia] = useState("");
  const [notas, setNotas] = useState("");
  const [ciudadError, setCiudadError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [deps, cits] = await Promise.all([
          UbicacionService.getDepartamentos(),
          UbicacionService.getCiudades(),
        ]);
        setDepartamentos(deps);
        setCiudades(cits);
      } catch (e) {
        console.error("Error cargando ubicaciones", e);
      }
    })();
  }, []);

  const handleDepartamentoChange = (value) => {
    setDepartamento(value);
    setCiudadId("");
    setCiudadesFiltradas(
      ciudades.filter((c) => parseInt(c.departamento) === parseInt(value))
    );
  };

  const handleSubmit = async () => {
    if (!ciudadId) {
      setCiudadError("Debe seleccionar la ciudad de envío");
      return;
    }
    setCiudadError("");

    try {
      const clienteId = await clienteRef.current.getClienteId();
      if (!clienteId) return;

      onSubmit({
        unidadId: unidad.id,
        cliente: clienteId,
        ciudad_envio_metodo_aliado: ciudadId,
        transportadora_metodo_aliado: transportadora.trim(),
        numero_guia_metodo_aliado: numeroGuia.trim(),
        notas_metodo_aliado: notas.trim(),
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

        <div className="ma-form-group">
          <label htmlFor="ma-departamento">
            Departamento <span className="required">*</span>
          </label>
          <select
            id="ma-departamento"
            value={departamento}
            onChange={(e) => handleDepartamentoChange(e.target.value)}
          >
            <option value="">Selecciona un departamento...</option>
            {departamentos.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="ma-form-group">
          <label htmlFor="ma-ciudad">
            Ciudad de envío <span className="required">*</span>
          </label>
          <select
            id="ma-ciudad"
            value={ciudadId}
            onChange={(e) => {
              setCiudadId(e.target.value);
              if (ciudadError) setCiudadError("");
            }}
            disabled={!departamento}
          >
            <option value="">
              {departamento ? "Selecciona una ciudad..." : "Primero el departamento"}
            </option>
            {ciudadesFiltradas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          {ciudadError && <span className="ma-error">{ciudadError}</span>}
        </div>

        <div className="ma-form-group">
          <label htmlFor="ma-transportadora">Transportadora</label>
          <input
            id="ma-transportadora"
            type="text"
            placeholder="Ej: Servientrega, Interrapidísimo..."
            value={transportadora}
            onChange={(e) => setTransportadora(e.target.value)}
          />
        </div>

        <div className="ma-form-group">
          <label htmlFor="ma-guia">Número de guía</label>
          <input
            id="ma-guia"
            type="text"
            placeholder="Ej: 1234567890"
            value={numeroGuia}
            onChange={(e) => setNumeroGuia(e.target.value)}
          />
        </div>

        <div className="ma-form-group ma-full">
          <label htmlFor="ma-notas">Notas</label>
          <textarea
            id="ma-notas"
            rows={3}
            placeholder="Observaciones adicionales sobre el envío..."
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        <div className="ma-form-group ma-full">
          <p className="ma-info">
            La unidad se marcará como <strong>Solicitud Método Aliado</strong> y se asociará
            al cliente seleccionado. Registre la transportadora y guía cuando despache.
          </p>
        </div>
      </div>
    </ModalBase>
  );
};

export default MetodoAliadoForm;
