import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import ModalBase from "./ModalBase";
import * as ClienteService from "../../services/ClienteService";

const SolicitudBajoPedidoForm = ({ bajoPedido, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    cliente: "",
    valor_abono: "",
    fecha_maxima_compra: "",
  });
  const [clientes, setClientes] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    ClienteService.getClientes()
      .then((data) => setClientes(Array.isArray(data) ? data : (data.clientes || [])))
      .catch((err) => console.error("Error cargando clientes:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validate = () => {
    const errs = {};
    if (!formData.cliente) errs.cliente = "Selecciona un cliente";
    if (!formData.valor_abono || parseFloat(formData.valor_abono) <= 0) errs.valor_abono = "Ingresa un valor de abono válido";
    if (!formData.fecha_maxima_compra) errs.fecha_maxima_compra = "Selecciona la fecha máxima";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      bajo_pedido: bajoPedido.id,
      cliente: parseInt(formData.cliente),
      valor_abono: parseFloat(formData.valor_abono),
      fecha_maxima_compra: formData.fecha_maxima_compra,
    });
  };

  const condicionLabel = {
    nuevo: "Nuevo", open_box: "Open Box", refurbished: "Refurbished", usado: "Usado",
  };

  return (
    <ModalBase
      title="Registrar Solicitud de Cliente"
      icon={<Clock size={24} />}
      subtitle="Registra el pedido de un cliente para este producto bajo pedido"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Read-only product info */}
        <div style={{ background: "var(--icon-bg, #f3f4f6)", borderRadius: "6px", padding: "0.75rem 1rem", fontSize: "0.9rem" }}>
          <strong>{bajoPedido.producto_nombre}</strong>
          {bajoPedido.condicion && (
            <span style={{ marginLeft: "0.5rem", color: "#6b7280" }}>
              — {condicionLabel[bajoPedido.condicion] || bajoPedido.condicion}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="sbp-cliente" style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.9rem", fontWeight: 500 }}>
            Cliente <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            id="sbp-cliente"
            name="cliente"
            value={formData.cliente}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid var(--fourth-color, #e5e7eb)", fontFamily: "inherit", fontSize: "0.9rem" }}
          >
            <option value="">Selecciona un cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre_completo} ({c.cedula})</option>
            ))}
          </select>
          {errors.cliente && <span style={{ color: "#ef4444", fontSize: "0.82rem" }}>{errors.cliente}</span>}
        </div>

        <div>
          <label htmlFor="sbp-abono" style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.9rem", fontWeight: 500 }}>
            Valor Abono (COP) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="sbp-abono"
            name="valor_abono"
            type="number"
            step="1000"
            min="0"
            placeholder="Ej: 500000"
            value={formData.valor_abono}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid var(--fourth-color, #e5e7eb)", fontFamily: "inherit", fontSize: "0.9rem", boxSizing: "border-box" }}
          />
          {errors.valor_abono && <span style={{ color: "#ef4444", fontSize: "0.82rem" }}>{errors.valor_abono}</span>}
        </div>

        <div>
          <label htmlFor="sbp-fecha" style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.9rem", fontWeight: 500 }}>
            Fecha Máxima de Compra <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="sbp-fecha"
            name="fecha_maxima_compra"
            type="date"
            value={formData.fecha_maxima_compra}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid var(--fourth-color, #e5e7eb)", fontFamily: "inherit", fontSize: "0.9rem", boxSizing: "border-box" }}
          />
          {errors.fecha_maxima_compra && <span style={{ color: "#ef4444", fontSize: "0.82rem" }}>{errors.fecha_maxima_compra}</span>}
        </div>
      </div>
    </ModalBase>
  );
};

export default SolicitudBajoPedidoForm;
