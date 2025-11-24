import React, { useState, useEffect } from "react";
import { PackagePlus, Edit } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import "../../styles/admin/usersForm.css";
import { getCategories } from "../../services/CategoryService";
import { getBrands } from "../../services/BrandService";

// 🔧 Convierte texto a JSON o key:value, y si no, lo deja como texto
function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const lines = text.split("\n").filter((l) => l.trim() !== "");
    const obj = {};

    let validKV = true;

    lines.forEach((line) => {
      if (!line.includes(":")) {
        validKV = false;
        return;
      }
      const [key, value] = line.split(":").map((s) => s.trim());
      if (key && value) obj[key] = value;
    });

    if (validKV && Object.keys(obj).length > 0) {
      return obj;
    }

    return text;
  }
}

const ProductsForm = ({
  onClose,
  onSubmit,
  product,
  isSubmitting,
  submitError,
}) => {
  const [formData, setFormData] = useState({
    model_name: "",
    long_description: "",
    brand: "",
    specs: "",
    categories: [],
  });
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);

  const isEditMode = Boolean(product);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, brs] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        setCategoriesList(cats);
        setBrandsList(brs);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();

    if (isEditMode) {
      setFormData({
        model_name: product.model_name,
        long_description: product.long_description,
        brand: product.brand.id,
        specs: JSON.stringify(product.specs, null, 2),
        categories: product.categories.map((cat) => cat.id),
      });
    }
  }, [product, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoriesChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, categories: selectedOptions }));
  };

  const handleSubmit = () => {
    const cleanData = {
      model_name: formData.model_name.trim(),
      brand: Number(formData.brand),
      long_description: formData.long_description.trim(),
      specs: safeParse(formData.specs),
      categories: formData.categories.map(Number),
    };

    if (onSubmit) onSubmit(cleanData, product?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Producto Base" : "Crear Producto Base"}
      icon={isEditMode ? <Edit size={24} /> : <PackagePlus size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información del producto base"
          : "Completa la información para crear un producto base"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      {submitError && <div className="form-error-banner">{submitError}</div>}
      <div className="form-grid">
        <div className="form-group">
          <label>Nombre del Modelo *</label>
          <input
            name="model_name"
            type="text"
            placeholder="Ej: Asus TUF F15"
            value={formData.model_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Marca *</label>
          <select
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una marca</option>
            {brandsList.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label>Categorías *</label>
          <select
            name="categories"
            multiple
            value={formData.categories}
            onChange={handleCategoriesChange}
            required
            className="multi-select"
          >
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label>Descripción *</label>
          <textarea
            name="long_description"
            placeholder="Descripción del producto"
            value={formData.long_description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label>Especificaciones (JSON o texto)</label>
          <textarea
            name="specs"
            placeholder='{"ram": "16GB", "ssd": "512GB"}'
            value={formData.specs}
            onChange={handleChange}
            rows={5}
          />
        </div>
      </div>
    </ModalBase>
  );
};

export default ProductsForm;