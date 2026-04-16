import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Users, UserPlus } from "lucide-react";
import * as ClienteService from "../../services/ClienteService";
import api from "../../services/Api";
import urls from "../../services/Urls";
import "../../styles/admin/clienteSelector.css";

const EMPTY_NUEVO_CLIENTE = {
  nombre_completo: "",
  cedula: "",
  celular: "",
  correo: "",
  direccion: "",
  departamento: "",
  ciudad: "",
};

/**
 * Reusable client selection component with existing/new toggle.
 *
 * Usage:
 *   const clienteRef = useRef();
 *   // on submit:
 *   const clienteId = await clienteRef.current.getClienteId();
 *   if (!clienteId) return; // validation failed
 *
 *   <ClienteSelector ref={clienteRef} />
 */
const ClienteSelector = forwardRef((_, ref) => {
  const [mode, setMode] = useState("existente");
  const [clienteId, setClienteId] = useState("");
  const [clientes, setClientes] = useState([]);
  const [nuevoCliente, setNuevoCliente] = useState({ ...EMPTY_NUEVO_CLIENTE });
  const [errors, setErrors] = useState({});
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [clientesData, deptosData, ciudadesData] = await Promise.all([
          ClienteService.getClientes(),
          api.get(urls.departamentosList).then((r) => r.data),
          api.get(urls.ciudadesList).then((r) => r.data),
        ]);
        setClientes(Array.isArray(clientesData) ? clientesData : (clientesData.clientes || []));
        setDepartamentos(Array.isArray(deptosData) ? deptosData : (deptosData.departamentos || []));
        setCiudades(Array.isArray(ciudadesData) ? ciudadesData : (ciudadesData.ciudades || []));
      } catch (e) {
        console.error("Error loading client data:", e);
      }
    };
    load();
  }, []);

  const handleNuevoChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    if (name === "departamento") {
      setNuevoCliente((prev) => ({ ...prev, departamento: value, ciudad: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!nuevoCliente.nombre_completo.trim()) errs.nombre_completo = "Requerido";
    if (!nuevoCliente.cedula.trim()) errs.cedula = "Requerido";
    if (!nuevoCliente.celular.trim()) errs.celular = "Requerido";
    if (!nuevoCliente.correo.trim()) errs.correo = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoCliente.correo)) errs.correo = "Correo inválido";
    if (!nuevoCliente.direccion.trim()) errs.direccion = "Requerido";
    if (!nuevoCliente.departamento) errs.departamento = "Requerido";
    if (!nuevoCliente.ciudad) errs.ciudad = "Requerido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Expose getClienteId to parent via ref
  useImperativeHandle(ref, () => ({
    async getClienteId() {
      if (mode === "existente") {
        if (!clienteId) {
          setErrors({ cliente: "Debe seleccionar un cliente" });
          return null;
        }
        return parseInt(clienteId);
      }
      // mode === "nuevo"
      if (!validate()) return null;
      const res = await ClienteService.createCliente({
        nombre_completo: nuevoCliente.nombre_completo.trim(),
        cedula: nuevoCliente.cedula.trim(),
        celular: nuevoCliente.celular.trim(),
        correo: nuevoCliente.correo.trim(),
        direccion: nuevoCliente.direccion.trim(),
        departamento: parseInt(nuevoCliente.departamento),
        ciudad: parseInt(nuevoCliente.ciudad),
      });
      const created = res.cliente || res;
      return created.id;
    },
  }));

  const ciudadesFiltradas = nuevoCliente.departamento
    ? ciudades.filter((c) => String(c.departamento) === String(nuevoCliente.departamento))
    : [];

  return (
    <>
      {/* Toggle */}
      <div className="cs-toggle">
        <button
          type="button"
          className={`cs-toggle-btn${mode === "existente" ? " active" : ""}`}
          onClick={() => setMode("existente")}
        >
          <Users size={15} /> Cliente existente
        </button>
        <button
          type="button"
          className={`cs-toggle-btn${mode === "nuevo" ? " active" : ""}`}
          onClick={() => setMode("nuevo")}
        >
          <UserPlus size={15} /> Nuevo cliente
        </button>
      </div>

      {/* Existing client */}
      {mode === "existente" && (
        <div className="cs-field">
          <label>Cliente <span className="required">*</span></label>
          <select
            value={clienteId}
            onChange={(e) => {
              setClienteId(e.target.value);
              if (errors.cliente) setErrors((p) => { const n = { ...p }; delete n.cliente; return n; });
            }}
          >
            <option value="">Selecciona un cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre_completo} ({c.cedula})
              </option>
            ))}
          </select>
          {errors.cliente && <span className="cs-error">{errors.cliente}</span>}
        </div>
      )}

      {/* New client form */}
      {mode === "nuevo" && (
        <div className="cs-nuevo-grid">
          <div className="cs-field">
            <label>Nombre completo <span className="required">*</span></label>
            <input name="nombre_completo" type="text" placeholder="Ej: Juan Pérez" value={nuevoCliente.nombre_completo} onChange={handleNuevoChange} />
            {errors.nombre_completo && <span className="cs-error">{errors.nombre_completo}</span>}
          </div>
          <div className="cs-field">
            <label>Cédula <span className="required">*</span></label>
            <input name="cedula" type="text" placeholder="Ej: 1234567890" value={nuevoCliente.cedula} onChange={handleNuevoChange} />
            {errors.cedula && <span className="cs-error">{errors.cedula}</span>}
          </div>
          <div className="cs-field">
            <label>Celular <span className="required">*</span></label>
            <input name="celular" type="text" placeholder="Ej: 3001234567" value={nuevoCliente.celular} onChange={handleNuevoChange} />
            {errors.celular && <span className="cs-error">{errors.celular}</span>}
          </div>
          <div className="cs-field">
            <label>Correo <span className="required">*</span></label>
            <input name="correo" type="email" placeholder="Ej: juan@email.com" value={nuevoCliente.correo} onChange={handleNuevoChange} />
            {errors.correo && <span className="cs-error">{errors.correo}</span>}
          </div>
          <div className="cs-field cs-full">
            <label>Dirección <span className="required">*</span></label>
            <input name="direccion" type="text" placeholder="Ej: Calle 123 #45-67" value={nuevoCliente.direccion} onChange={handleNuevoChange} />
            {errors.direccion && <span className="cs-error">{errors.direccion}</span>}
          </div>
          <div className="cs-field">
            <label>Departamento <span className="required">*</span></label>
            <select name="departamento" value={nuevoCliente.departamento} onChange={handleNuevoChange}>
              <option value="">Selecciona...</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
            {errors.departamento && <span className="cs-error">{errors.departamento}</span>}
          </div>
          <div className="cs-field">
            <label>Ciudad <span className="required">*</span></label>
            <select name="ciudad" value={nuevoCliente.ciudad} onChange={handleNuevoChange} disabled={!nuevoCliente.departamento}>
              <option value="">{nuevoCliente.departamento ? "Selecciona..." : "Selecciona depto. primero"}</option>
              {ciudadesFiltradas.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {errors.ciudad && <span className="cs-error">{errors.ciudad}</span>}
          </div>
        </div>
      )}
    </>
  );
});

ClienteSelector.displayName = "ClienteSelector";

export default ClienteSelector;
