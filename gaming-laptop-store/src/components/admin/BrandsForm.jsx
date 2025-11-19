import React, { useState, useEffect } from "react";
import { Tag, Edit } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import "../../styles/admin/brandsForm.css";

const BrandsForm = ({ onClose, onSubmit, brand }) => {
  const [formData, setFormData] = useState({
    name: "",
  });

  const isEditMode = Boolean(brand);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: brand.name,
      });
    }
  }, [brand, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(formData, brand?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Marca" : "Registrar Nueva Marca"}
      icon={isEditMode ? <Edit size={24} /> : <Tag size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información de la marca"
          : "Completa la información de la marca para agregarla al sistema"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">
            Nombre <span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Ej: Asus"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </ModalBase>
  );
};

export default BrandsForm;
