import React, { useEffect, useState } from "react";
import { PackagePlus, Edit } from "lucide-react";
import ModalBase from "./ModalBase";
import "../../styles/admin/usersForm.css";

import { getBaseProducts } from "../../services/BaseProduct";


const CONDITION_CHOICES = [
  { value: "nuevo", label: "Nuevo" },
  { value: "open_box", label: "Open Box" },
  { value: "refurbished", label: "Refurbished" },
  { value: "usado", label: "Usado" },
];

const STOCK_CHOICES = [
  { value: "en_stock", label: "En Stock" },
  { value: "en_camino", label: "En Camino" },
  { value: "por_importacion", label: "Por Importación" },
  { value: "sin_stock", label: "Sin Stock" },
];

const ProductsForm = ({
  onClose,
  onSubmit,
  variant,
  isSubmitting,
  submitError,
}) => {
  const [formData, setFormData] = useState({
    base_product: "",
    price: "",
    condition: "nuevo",
    stock_status: "en_stock",
    is_published: true,
  });

  const [productsList, setProductsList] = useState([]);

  const isEditMode = Boolean(variant);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseProducts = await getBaseProducts();
        setProductsList(baseProducts);
      } catch (error) {
        console.error("Error cargando productos base:", error);
      }
    };

    fetchData();

    if (isEditMode) {
      setFormData({
        base_product: variant.base_product.id,
        price: variant.price,
        condition: variant.condition,
        stock_status: variant.stock_status,
        is_published: variant.is_published,
      });
    }
  }, [variant, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const cleanData = {
      base_product: Number(formData.base_product),
      price: Number(formData.price),
      condition: formData.condition,
      stock_status: formData.stock_status,
      is_published: formData.is_published,
    };

    if (onSubmit) onSubmit(cleanData, variant?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Variante" : "Crear Variante"}
      icon={isEditMode ? <Edit size={24} /> : <PackagePlus size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información de la variante"
          : "Completa la información para crear una variante"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      {submitError && <div className="form-error-banner">{submitError}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label>Producto Base *</label>
          <select
            name="base_product"
            value={formData.base_product}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un producto base</option>
            {productsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.model_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Precio *</label>
          <input
            name="price"
            type="number"
            placeholder="Ej: 3500000"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Condición *</label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
          >
            {CONDITION_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Estado del Stock *</label>
          <select
            name="stock_status"
            value={formData.stock_status}
            onChange={handleChange}
          >
            {STOCK_CHOICES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label>Publicado</label>
          <input
            type="checkbox"
            name="is_published"
            checked={formData.is_published}
            onChange={handleChange}
          />
        </div>
      </div>
    </ModalBase>
  );
};

export default ProductsForm;
