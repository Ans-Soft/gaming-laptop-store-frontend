import React, { useState, useEffect } from "react";
import { Lock, Edit } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import * as ClienteService from "../../services/ClienteService";
import * as UnidadService from "../../services/UnidadService";
import "../../styles/admin/separacionForm.css";

const SeparacionForm = ({ onClose, onSubmit, separacion, preselectedUnidadId }) => {
  const [formData, setFormData] = useState({
    cliente: "",
    unidad_producto: preselectedUnidadId ? String(preselectedUnidadId) : "",
    valor_abono: "",
    fecha_separacion: "",
    fecha_maxima_compra: "",
  });

  const [clientes, setClientes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [preselectedUnidad, setPreselectedUnidad] = useState(null);

  const isEditMode = Boolean(separacion);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const clientesData = await ClienteService.getClientes();
      setClientes(clientesData.cliente || []);

      const unidadesData = await UnidadService.getUnidades();
      setUnidades(unidadesData || []);

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
    }
  }, [separacion, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.cliente) {
      alert("Debe seleccionar un cliente");
      return;
    }
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

    if (onSubmit) onSubmit(formData, separacion?.id);
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
