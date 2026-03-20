import React, { useState, useEffect } from "react";
import { Users, Edit } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import * as UbicacionService from "../../services/UbicacionService";
import "../../styles/admin/clientesForm.css";

const ClientesForm = ({ onClose, onSubmit, cliente }) => {
  const [formData, setFormData] = useState({
    nombre_completo: "",
    cedula: "",
    celular: "",
    correo: "",
    direccion: "",
    departamento: "",
    ciudad: "",
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);

  const isEditMode = Boolean(cliente);

  useEffect(() => {
    fetchUbicaciones();
  }, []);

  const fetchUbicaciones = async () => {
    try {
      const deptData = await UbicacionService.getDepartamentos();
      setDepartamentos(deptData || []);

      const cityData = await UbicacionService.getCiudades();
      setCiudades(cityData || []);
    } catch (error) {
      console.error("Error al obtener ubicaciones:", error);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        nombre_completo: cliente.nombre_completo,
        cedula: cliente.cedula,
        celular: cliente.celular,
        correo: cliente.correo,
        direccion: cliente.direccion,
        departamento: cliente.departamento,
        ciudad: cliente.ciudad,
      });

      // Filter cities when editing
      if (cliente.departamento) {
        const filtered = ciudades.filter(
          (c) => c.departamento === cliente.departamento
        );
        setCiudadesFiltradas(filtered);
      }
    }
  }, [cliente, isEditMode, ciudades]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "departamento") {
      // Filter cities when department changes
      const filtered = ciudades.filter((c) => parseInt(c.departamento) === parseInt(value));
      setCiudadesFiltradas(filtered);
      // Reset city selection
      setFormData((prev) => ({ ...prev, [name]: value, ciudad: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(formData, cliente?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Cliente" : "Registrar Nuevo Cliente"}
      icon={isEditMode ? <Edit size={24} /> : <Users size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información del cliente"
          : "Completa la información del cliente para agregarlo al sistema"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="cf-form-grid">
        <div className="cf-form-group">
          <label htmlFor="nombre_completo">
            Nombre Completo <span className="required">*</span>
          </label>
          <input
            id="nombre_completo"
            name="nombre_completo"
            type="text"
            placeholder="Ej: Juan Pérez"
            value={formData.nombre_completo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="cf-form-group">
          <label htmlFor="cedula">
            Cédula <span className="required">*</span>
          </label>
          <input
            id="cedula"
            name="cedula"
            type="text"
            placeholder="Ej: 1234567890"
            value={formData.cedula}
            onChange={handleChange}
            required
          />
        </div>

        <div className="cf-form-group">
          <label htmlFor="celular">
            Celular <span className="required">*</span>
          </label>
          <input
            id="celular"
            name="celular"
            type="tel"
            placeholder="Ej: +573001234567"
            value={formData.celular}
            onChange={handleChange}
            required
          />
        </div>

        <div className="cf-form-group">
          <label htmlFor="correo">
            Correo <span className="required">*</span>
          </label>
          <input
            id="correo"
            name="correo"
            type="email"
            placeholder="Ej: cliente@example.com"
            value={formData.correo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="cf-form-group cf-full">
          <label htmlFor="direccion">
            Dirección <span className="required">*</span>
          </label>
          <input
            id="direccion"
            name="direccion"
            type="text"
            placeholder="Ej: Calle 123, Apartamento 456"
            value={formData.direccion}
            onChange={handleChange}
            required
          />
        </div>

        <div className="cf-form-group">
          <label htmlFor="departamento">
            Departamento <span className="required">*</span>
          </label>
          <select
            id="departamento"
            name="departamento"
            value={formData.departamento}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un departamento...</option>
            {departamentos.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="cf-form-group">
          <label htmlFor="ciudad">
            Ciudad <span className="required">*</span>
          </label>
          <select
            id="ciudad"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            required
            disabled={!formData.departamento}
          >
            <option value="">
              {formData.departamento ? "Selecciona una ciudad..." : "Primero selecciona un departamento"}
            </option>
            {ciudadesFiltradas.map((city) => (
              <option key={city.id} value={city.id}>
                {city.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
    </ModalBase>
  );
};

export default ClientesForm;
