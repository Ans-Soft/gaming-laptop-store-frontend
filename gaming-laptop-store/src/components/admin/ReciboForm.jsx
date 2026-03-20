import React, { useState, useEffect } from "react";
import { FileText, Edit } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import * as VentaService from "../../services/VentaService";
import * as SeparacionService from "../../services/SeparacionService";
import "../../styles/admin/reciboForm.css";

const ReciboForm = ({ onClose, onSubmit, recibo }) => {
  const [formData, setFormData] = useState({
    venta: "",
    separacion: "",
    url: "",
    fecha_documento: "",
  });

  const [ventas, setVentas] = useState([]);
  const [separaciones, setSeparaciones] = useState([]);
  const [tipoDocumento, setTipoDocumento] = useState("venta");

  const isEditMode = Boolean(recibo);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ventasData = await VentaService.getVentas();
      setVentas(ventasData || []);

      const separacionesData = await SeparacionService.getSeparaciones();
      setSeparaciones(separacionesData || []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        venta: recibo.venta || "",
        separacion: recibo.separacion || "",
        url: recibo.url || "",
        fecha_documento: recibo.fecha_documento || "",
      });

      if (recibo.venta) {
        setTipoDocumento("venta");
      } else if (recibo.separacion) {
        setTipoDocumento("separacion");
      }
    }
  }, [recibo, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (e) => {
    const newTipo = e.target.value;
    setTipoDocumento(newTipo);
    setFormData((prev) => ({
      ...prev,
      venta: "",
      separacion: "",
    }));
  };

  const handleSubmit = () => {
    if (tipoDocumento === "venta" && !formData.venta) {
      alert("Debe seleccionar una venta");
      return;
    }
    if (tipoDocumento === "separacion" && !formData.separacion) {
      alert("Debe seleccionar una separación");
      return;
    }
    if (!formData.url) {
      alert("Debe ingresar la URL del recibo");
      return;
    }
    if (!formData.fecha_documento) {
      alert("Debe seleccionar la fecha del documento");
      return;
    }

    const submitData = {
      venta: tipoDocumento === "venta" ? formData.venta : null,
      separacion: tipoDocumento === "separacion" ? formData.separacion : null,
      url: formData.url,
      fecha_documento: formData.fecha_documento,
    };

    if (onSubmit) onSubmit(submitData, recibo?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Recibo" : "Registrar Nuevo Recibo"}
      icon={isEditMode ? <Edit size={24} /> : <FileText size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información del recibo"
          : "Completa la información para registrar un recibo"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="rf-form-grid">
        <div className="rf-form-group rf-full">
          <label htmlFor="tipoDocumento">
            Tipo de Documento <span className="required">*</span>
          </label>
          <select
            id="tipoDocumento"
            value={tipoDocumento}
            onChange={handleTipoChange}
            required
          >
            <option value="venta">Venta</option>
            <option value="separacion">Separación</option>
          </select>
        </div>

        {tipoDocumento === "venta" && (
          <div className="rf-form-group rf-full">
            <label htmlFor="venta">
              Venta <span className="required">*</span>
            </label>
            <select
              id="venta"
              name="venta"
              value={formData.venta}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una venta...</option>
              {ventas.map((venta) => (
                <option key={venta.id} value={venta.id}>
                  Venta #{venta.id} - Cliente: {venta.cliente_nombre || "N/A"}
                </option>
              ))}
            </select>
          </div>
        )}

        {tipoDocumento === "separacion" && (
          <div className="rf-form-group rf-full">
            <label htmlFor="separacion">
              Separación <span className="required">*</span>
            </label>
            <select
              id="separacion"
              name="separacion"
              value={formData.separacion}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una separación...</option>
              {separaciones.map((separacion) => (
                <option key={separacion.id} value={separacion.id}>
                  Separación #{separacion.id} - Cliente:{" "}
                  {separacion.cliente_nombre || "N/A"}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="rf-form-group rf-full">
          <label htmlFor="url">
            URL del Recibo <span className="required">*</span>
          </label>
          <input
            id="url"
            name="url"
            type="url"
            placeholder="Ej: https://example.com/recibo/pdf"
            value={formData.url}
            onChange={handleChange}
            required
          />
        </div>

        <div className="rf-form-group">
          <label htmlFor="fecha_documento">
            Fecha del Documento <span className="required">*</span>
          </label>
          <input
            id="fecha_documento"
            name="fecha_documento"
            type="date"
            value={formData.fecha_documento}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </ModalBase>
  );
};

export default ReciboForm;
