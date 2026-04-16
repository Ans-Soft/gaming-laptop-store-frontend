import React, { useState, useEffect } from "react";
import { Lock, Edit, Users, UserPlus } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import * as ClienteService from "../../services/ClienteService";
import * as UnidadService from "../../services/UnidadService";
import api from "../../services/Api";
import urls from "../../services/Urls";
import "../../styles/admin/separacionForm.css";

const EMPTY_NUEVO_CLIENTE = {
  nombre_completo: "",
  cedula: "",
  celular: "",
  correo: "",
  direccion: "",
  departamento: "",
  ciudad: "",
};

const toISODate = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const SeparacionForm = ({ onClose, onSubmit, separacion, preselectedUnidadId }) => {
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  const [formData, setFormData] = useState({
    cliente: "",
    unidad_producto: preselectedUnidadId ? String(preselectedUnidadId) : "",
    valor_abono: "",
    fecha_separacion: toISODate(today),
    fecha_maxima_compra: toISODate(in30Days),
  });

  const [clienteMode, setClienteMode] = useState("existente");
  const [nuevoCliente, setNuevoCliente] = useState({ ...EMPTY_NUEVO_CLIENTE });
  const [nuevoClienteErrors, setNuevoClienteErrors] = useState({});

  const [clientes, setClientes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [preselectedUnidad, setPreselectedUnidad] = useState(null);

  const isEditMode = Boolean(separacion);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientesData, unidadesData, deptosData, ciudadesData] = await Promise.all([
        ClienteService.getClientes(),
        UnidadService.getUnidades(),
        api.get(urls.departamentosList).then((r) => r.data),
        api.get(urls.ciudadesList).then((r) => r.data),
      ]);

      setClientes(Array.isArray(clientesData) ? clientesData : (clientesData.clientes || []));
      setUnidades(unidadesData || []);
      setDepartamentos(Array.isArray(deptosData) ? deptosData : (deptosData.departamentos || []));
      setCiudades(Array.isArray(ciudadesData) ? ciudadesData : (ciudadesData.ciudades || []));

      if (preselectedUnidadId) {
        const found = (unidadesData || []).find((u) => u.id === preselectedUnidadId);
        if (found) setPreselectedUnidad(found);
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        cliente: separacion.cliente || "",
        unidad_producto: separacion.unidad_producto || "",
        valor_abono: separacion.valor_abono || "",
        fecha_separacion: separacion.fecha_separacion || "",
        fecha_maxima_compra: separacion.fecha_maxima_compra || "",
      });
      // In edit mode, find the current unit to display as read-only
      if (separacion.unidad_producto) {
        setPreselectedUnidad({
          id: separacion.unidad_producto,
          serial: separacion.unidad_serial || "",
          producto_nombre: separacion.producto_nombre || "",
        });
      }
    }
  }, [separacion, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNuevoClienteChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({ ...prev, [name]: value }));
    if (nuevoClienteErrors[name]) {
      setNuevoClienteErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
    if (name === "departamento") {
      setNuevoCliente((prev) => ({ ...prev, departamento: value, ciudad: "" }));
    }
  };

  const validateNuevoCliente = () => {
    const errs = {};
    if (!nuevoCliente.nombre_completo.trim()) errs.nombre_completo = "Requerido";
    if (!nuevoCliente.cedula.trim()) errs.cedula = "Requerido";
    if (!nuevoCliente.celular.trim()) errs.celular = "Requerido";
    if (!nuevoCliente.correo.trim()) errs.correo = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoCliente.correo)) errs.correo = "Correo inválido";
    if (!nuevoCliente.direccion.trim()) errs.direccion = "Requerido";
    if (!nuevoCliente.departamento) errs.departamento = "Requerido";
    if (!nuevoCliente.ciudad) errs.ciudad = "Requerido";
    setNuevoClienteErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const ciudadesFiltradas = nuevoCliente.departamento
    ? ciudades.filter((c) => String(c.departamento) === String(nuevoCliente.departamento))
    : [];

  const handleSubmit = async () => {
    if (!formData.unidad_producto) {
      alert("Debe seleccionar una unidad");
      return;
    }
    if (!formData.valor_abono) {
      alert("Debe ingresar el valor del abono");
      return;
    }
    if (!formData.fecha_separacion) {
      alert("Debe seleccionar la fecha de separación");
      return;
    }
    if (!formData.fecha_maxima_compra) {
      alert("Debe seleccionar la fecha máxima de compra");
      return;
    }

    let clienteId = formData.cliente;

    if (clienteMode === "nuevo") {
      if (!validateNuevoCliente()) return;
      try {
        const res = await ClienteService.createCliente({
          nombre_completo: nuevoCliente.nombre_completo.trim(),
          cedula: nuevoCliente.cedula.trim(),
          celular: nuevoCliente.celular.trim(),
          correo: nuevoCliente.correo.trim(),
          direccion: nuevoCliente.direccion.trim(),
          departamento: parseInt(nuevoCliente.departamento),
          ciudad: parseInt(nuevoCliente.ciudad),
        });
        clienteId = res.cliente?.id || res.id;
      } catch (error) {
        const data = error.response?.data;
        if (data) {
          const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("; ");
          alert(`Error al crear cliente: ${msgs}`);
        } else {
          alert("Error al crear el cliente");
        }
        return;
      }
    } else {
      if (!clienteId) {
        alert("Debe seleccionar un cliente");
        return;
      }
    }

    if (onSubmit) onSubmit({ ...formData, cliente: clienteId }, separacion?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Separación" : "Registrar Nueva Separación"}
      icon={isEditMode ? <Edit size={24} /> : <Lock size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información de la separación"
          : "Completa la información para registrar una separación"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="sf-form-grid">
        {/* Client section */}
        {isEditMode ? (
          <div className="sf-form-group sf-full">
            <label>Cliente</label>
            <div
              style={{
                padding: "0.6rem 1rem",
                background: "var(--icon-bg)",
                border: "1px solid var(--fourth-color)",
                borderRadius: "8px",
                fontSize: "0.9rem",
                color: "var(--text-color)",
                fontWeight: 600,
              }}
            >
              {separacion.cliente_nombre || "—"}
            </div>
          </div>
        ) : (
          <>
            {/* Client toggle */}
            <div className="sf-form-group sf-full">
              <div className="sf-client-toggle">
                <button
                  type="button"
                  className={`sf-toggle-btn${clienteMode === "existente" ? " active" : ""}`}
                  onClick={() => setClienteMode("existente")}
                >
                  <Users size={15} /> Cliente existente
                </button>
                <button
                  type="button"
                  className={`sf-toggle-btn${clienteMode === "nuevo" ? " active" : ""}`}
                  onClick={() => setClienteMode("nuevo")}
                >
                  <UserPlus size={15} /> Nuevo cliente
                </button>
              </div>
            </div>

            {/* Existing client */}
            {clienteMode === "existente" && (
              <div className="sf-form-group sf-full">
                <label htmlFor="cliente">
                  Cliente <span className="required">*</span>
                </label>
                <select
                  id="cliente"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un cliente...</option>
                  {clientes.map((cli) => (
                    <option key={cli.id} value={cli.id}>
                      {cli.nombre_completo} ({cli.cedula})
                    </option>
                  ))}
                </select>
          </div>
        )}

        {/* New client form */}
        {clienteMode === "nuevo" && (
          <div className="sf-nuevo-cliente sf-full">
            <div className="sf-nuevo-cliente-grid">
              <div className="sf-nc-field">
                <label>Nombre completo <span className="required">*</span></label>
                <input name="nombre_completo" type="text" placeholder="Ej: Juan Pérez" value={nuevoCliente.nombre_completo} onChange={handleNuevoClienteChange} />
                {nuevoClienteErrors.nombre_completo && <span className="sf-field-error">{nuevoClienteErrors.nombre_completo}</span>}
              </div>
              <div className="sf-nc-field">
                <label>Cédula <span className="required">*</span></label>
                <input name="cedula" type="text" placeholder="Ej: 1234567890" value={nuevoCliente.cedula} onChange={handleNuevoClienteChange} />
                {nuevoClienteErrors.cedula && <span className="sf-field-error">{nuevoClienteErrors.cedula}</span>}
              </div>
              <div className="sf-nc-field">
                <label>Celular <span className="required">*</span></label>
                <input name="celular" type="text" placeholder="Ej: 3001234567" value={nuevoCliente.celular} onChange={handleNuevoClienteChange} />
                {nuevoClienteErrors.celular && <span className="sf-field-error">{nuevoClienteErrors.celular}</span>}
              </div>
              <div className="sf-nc-field">
                <label>Correo <span className="required">*</span></label>
                <input name="correo" type="email" placeholder="Ej: juan@email.com" value={nuevoCliente.correo} onChange={handleNuevoClienteChange} />
                {nuevoClienteErrors.correo && <span className="sf-field-error">{nuevoClienteErrors.correo}</span>}
              </div>
              <div className="sf-nc-field sf-nc-full">
                <label>Dirección <span className="required">*</span></label>
                <input name="direccion" type="text" placeholder="Ej: Calle 123 #45-67" value={nuevoCliente.direccion} onChange={handleNuevoClienteChange} />
                {nuevoClienteErrors.direccion && <span className="sf-field-error">{nuevoClienteErrors.direccion}</span>}
              </div>
              <div className="sf-nc-field">
                <label>Departamento <span className="required">*</span></label>
                <select name="departamento" value={nuevoCliente.departamento} onChange={handleNuevoClienteChange}>
                  <option value="">Selecciona...</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
                {nuevoClienteErrors.departamento && <span className="sf-field-error">{nuevoClienteErrors.departamento}</span>}
              </div>
              <div className="sf-nc-field">
                <label>Ciudad <span className="required">*</span></label>
                <select name="ciudad" value={nuevoCliente.ciudad} onChange={handleNuevoClienteChange} disabled={!nuevoCliente.departamento}>
                  <option value="">{nuevoCliente.departamento ? "Selecciona..." : "Selecciona depto. primero"}</option>
                  {ciudadesFiltradas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                {nuevoClienteErrors.ciudad && <span className="sf-field-error">{nuevoClienteErrors.ciudad}</span>}
              </div>
            </div>
          </div>
        )}
          </>
        )}

        <div className="sf-form-group sf-full">
          <label htmlFor="unidad_producto">
            Unidad de Producto <span className="required">*</span>
          </label>
          {preselectedUnidad ? (
            <div
              style={{
                padding: "0.6rem 1rem",
                background: "var(--icon-bg)",
                border: "1px solid var(--fourth-color)",
                borderRadius: "8px",
                fontSize: "0.9rem",
                color: "var(--text-color)",
                fontWeight: 600,
              }}
            >
              {preselectedUnidad.serial && !preselectedUnidad.serial.startsWith("SIN-SERIAL-")
                ? preselectedUnidad.serial
                : "Serial pendiente"}{" "}
              — {preselectedUnidad.producto_nombre || "—"}
            </div>
          ) : (
            <select
              id="unidad_producto"
              name="unidad_producto"
              value={formData.unidad_producto}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una unidad...</option>
              {unidades
                .filter((u) => u.estado_venta === "sin_vender")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.serial} - {u.producto_nombre}
                  </option>
                ))}
            </select>
          )}
        </div>

        <div className="sf-form-group">
          <label htmlFor="valor_abono">
            Valor del Abono <span className="required">*</span>
          </label>
          <input
            id="valor_abono"
            name="valor_abono"
            type="number"
            step="0.01"
            placeholder="Ej: 500000"
            value={formData.valor_abono}
            onChange={handleChange}
            required
          />
        </div>

        <div className="sf-form-group">
          <label htmlFor="fecha_separacion">
            Fecha de Separación <span className="required">*</span>
          </label>
          <input
            id="fecha_separacion"
            name="fecha_separacion"
            type="date"
            value={formData.fecha_separacion}
            onChange={handleChange}
            required
          />
        </div>

        <div className="sf-form-group">
          <label htmlFor="fecha_maxima_compra">
            Fecha Máxima de Compra <span className="required">*</span>
          </label>
          <input
            id="fecha_maxima_compra"
            name="fecha_maxima_compra"
            type="date"
            value={formData.fecha_maxima_compra}
            onChange={handleChange}
            required
          />
        </div>

        <div className="sf-form-group sf-full">
          <p className="sf-info">
            La separación se creará con estado <strong>activa</strong>. La unidad se marcará como <strong>separada</strong>.
          </p>
        </div>
      </div>
    </ModalBase>
  );
};

export default SeparacionForm;
