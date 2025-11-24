import React, { useState, useEffect } from "react";
import { Tag, Edit } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import "../../styles/admin/brandsForm.css";

const CategoriesForm = ({
  onClose,
  onSubmit,
  category,
  isSubmitting,
  submitError,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const isEditMode = Boolean(category);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
      });
    }
  }, [category, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(formData, category?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Categoría" : "Registrar Nueva Categoría"}
      icon={isEditMode ? <Edit size={24} /> : <Tag size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información de la categoría"
          : "Completa la información de la categoría para agregarla al sistema"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      {submitError && <div className="form-error-banner">{submitError}</div>}
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">
            Nombre <span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Ej: Gaming"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="slug">Slug</label>
          <input
            id="slug"
            name="slug"
            type="text"
            placeholder="Ej: gaming-laptops"
            value={formData.slug}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            placeholder="Descripción opcional de la categoría"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

      </div>
    </ModalBase>
  );
};

export default CategoriesForm;
