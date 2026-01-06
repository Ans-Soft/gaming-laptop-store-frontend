import React, { useState, useEffect } from "react";
import { PackagePlus, Edit } from "lucide-react";
import ModalBase from "./ModalBase";
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

const BaseProductsForm = ({
  onClose,
  onSubmit,
  product,
  productType,
  onBack,
  isSubmitting,
  submitError,
}) => {
  const [formData, setFormData] = useState({
    model_name: "",
    long_description: "",
    brand: "",
    categories: [],
  });

  const [graphicsCardSpecs, setGraphicsCardSpecs] = useState({
    vram: "",
    vram_speed: "",
    vram_type: "",
    power_consumption: "",
    recommended_psu: "",
  });

  const [laptopSpecs, setLaptopSpecs] = useState({
    screen: { size: "", resolution: "", refresh_rate: "" },
    processor: { model: "", cores: "", threads: "" },
    memory: { size: "", type: "" },
    graphics: { model: "", vram: "" },
    storage: { size: "", type: "" },
    connectivity: "",
    battery: "",
    weight: "",
  });

  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");

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

    if (isEditMode && product) {
      setFormData({
        model_name: product.model_name,
        long_description: product.long_description,
        brand: product.brand.id,
        categories: product.categories.map((cat) => cat.id),
      });

      if (product.specs) {
        // Assume product.product_type exists to identify the product category
        // If not, a more complex inference from specs structure would be needed
        if (product.product_type === "Tarjeta gráfica") {
          setGraphicsCardSpecs(product.specs);
        } else if (product.product_type === "Laptop") {
          // Flatten connectivity array back to comma-separated string for input field
          const laptopSpecsToSet = {
            ...product.specs,
            connectivity: Array.isArray(product.specs.connectivity)
              ? product.specs.connectivity.join(", ")
              : product.specs.connectivity,
          };
          setLaptopSpecs(laptopSpecsToSet);
        }
      }
    }
  }, [product, isEditMode, productType]);

  const filteredCategories = categoriesList.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSpecsChange = (e, specType, parent = null) => {
    const { name, value } = e.target;

    if (specType === "graphicsCard") {
      setGraphicsCardSpecs((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (specType === "laptop") {
      if (parent) {
        setLaptopSpecs((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [name]: value,
          },
        }));
      } else {
        setLaptopSpecs((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleCategoriesChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, categories: selectedOptions }));
  };

  const handleSubmit = () => {
    let specs = {};
    if (productType === "Tarjeta gráfica") {
      specs = { ...graphicsCardSpecs };
    } else if (productType === "Laptop") {
      specs = {
        ...laptopSpecs,
        connectivity: laptopSpecs.connectivity
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
      };
    }

    const cleanData = {
      model_name: formData.model_name.trim(),
      brand: Number(formData.brand),
      long_description: formData.long_description.trim(),
      specs: specs,
      categories: formData.categories.map(Number),
    };

    if (onSubmit) onSubmit(cleanData, product?.id);
  };

  const renderGraphicsCardFields = () => (
    <>
      <div className="form-group">
        <label>Memoria VRAM</label>
        <input
          name="vram"
          type="text"
          placeholder="Ej: 8GB"
          value={graphicsCardSpecs.vram}
          onChange={(e) => handleSpecsChange(e, "graphicsCard")}
        />
      </div>
      <div className="form-group">
        <label>Velocidad VRAM</label>
        <input
          name="vram_speed"
          type="text"
          placeholder="Ej: 14 Gbps"
          value={graphicsCardSpecs.vram_speed}
          onChange={(e) => handleSpecsChange(e, "graphicsCard")}
        />
      </div>
      <div className="form-group">
        <label>Tipo de memoria VRAM</label>
        <input
          name="vram_type"
          type="text"
          placeholder="Ej: GDDR6"
          value={graphicsCardSpecs.vram_type}
          onChange={(e) => handleSpecsChange(e, "graphicsCard")}
        />
      </div>
      <div className="form-group">
        <label>Consumo de energía</label>
        <input
          name="power_consumption"
          type="text"
          placeholder="Ej: 175W"
          value={graphicsCardSpecs.power_consumption}
          onChange={(e) => handleSpecsChange(e, "graphicsCard")}
        />
      </div>
      <div className="form-group">
        <label>Fuente recomendada</label>
        <input
          name="recommended_psu"
          type="text"
          placeholder="Ej: 550W"
          value={graphicsCardSpecs.recommended_psu}
          onChange={(e) => handleSpecsChange(e, "graphicsCard")}
        />
      </div>
    </>
  );

  const renderLaptopFields = () => (
    <>
      <div
        style={{
          gridColumn: "1 / -1",
          marginTop: "20px",
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        Pantalla
      </div>
      <div className="form-group">
        <label>Tamaño de pantalla</label>
        <input
          name="size"
          data-parent="screen"
          type="text"
          placeholder='Ej: 15.6"'
          value={laptopSpecs.screen.size}
          onChange={(e) => handleSpecsChange(e, "laptop", "screen")}
        />
      </div>
      <div className="form-group">
        <label>Resolución</label>
        <input
          name="resolution"
          data-parent="screen"
          type="text"
          placeholder="Ej: FHD"
          value={laptopSpecs.screen.resolution}
          onChange={(e) => handleSpecsChange(e, "laptop", "screen")}
        />
      </div>
      <div className="form-group">
        <label>Tasa de Refresco</label>
        <input
          name="refresh_rate"
          data-parent="screen"
          type="text"
          placeholder="Ej: 144 Hz"
          value={laptopSpecs.screen.refresh_rate}
          onChange={(e) => handleSpecsChange(e, "laptop", "screen")}
        />
      </div>

      <div
        style={{
          gridColumn: "1 / -1",
          marginTop: "20px",
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        Procesador
      </div>
      <div className="form-group">
        <label>Modelo de Procesador</label>
        <input
          name="model"
          data-parent="processor"
          type="text"
          placeholder="Ej: Intel Core i5 13450HX"
          value={laptopSpecs.processor.model}
          onChange={(e) => handleSpecsChange(e, "laptop", "processor")}
        />
      </div>
      <div className="form-group">
        <label>Núcleos</label>
        <input
          name="cores"
          data-parent="processor"
          type="number"
          placeholder="Ej: 10"
          value={laptopSpecs.processor.cores}
          onChange={(e) => handleSpecsChange(e, "laptop", "processor")}
        />
      </div>
      <div className="form-group">
        <label>Hilos</label>
        <input
          name="threads"
          data-parent="processor"
          type="number"
          placeholder="Ej: 16"
          value={laptopSpecs.processor.threads}
          onChange={(e) => handleSpecsChange(e, "laptop", "processor")}
        />
      </div>

      <div
        style={{
          gridColumn: "1 / -1",
          marginTop: "20px",
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        Memoria
      </div>
      <div className="form-group">
        <label>Tamaño de Memoria</label>
        <input
          name="size"
          data-parent="memory"
          type="text"
          placeholder="Ej: 16GB"
          value={laptopSpecs.memory.size}
          onChange={(e) => handleSpecsChange(e, "laptop", "memory")}
        />
      </div>
      <div className="form-group">
        <label>Tipo de Memoria</label>
        <input
          name="type"
          data-parent="memory"
          type="text"
          placeholder="Ej: DDR5"
          value={laptopSpecs.memory.type}
          onChange={(e) => handleSpecsChange(e, "laptop", "memory")}
        />
      </div>

      <div
        style={{
          gridColumn: "1 / -1",
          marginTop: "20px",
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        Gráficos
      </div>
      <div className="form-group">
        <label>Modelo de Gráficos</label>
        <input
          name="model"
          data-parent="graphics"
          type="text"
          placeholder="Ej: NVIDIA GeForce RTX 5050"
          value={laptopSpecs.graphics.model}
          onChange={(e) => handleSpecsChange(e, "laptop", "graphics")}
        />
      </div>
      <div className="form-group">
        <label>VRAM</label>
        <input
          name="vram"
          data-parent="graphics"
          type="text"
          placeholder="Ej: 8GB"
          value={laptopSpecs.graphics.vram}
          onChange={(e) => handleSpecsChange(e, "laptop", "graphics")}
        />
      </div>

      <div
        style={{
          gridColumn: "1 / -1",
          marginTop: "20px",
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        Almacenamiento
      </div>
      <div className="form-group">
        <label>Tamaño de Almacenamiento</label>
        <input
          name="size"
          data-parent="storage"
          type="text"
          placeholder="Ej: 512GB"
          value={laptopSpecs.storage.size}
          onChange={(e) => handleSpecsChange(e, "laptop", "storage")}
        />
      </div>
      <div className="form-group">
        <label>Tipo de Almacenamiento</label>
        <input
          name="type"
          data-parent="storage"
          type="text"
          placeholder="Ej: SSD"
          value={laptopSpecs.storage.type}
          onChange={(e) => handleSpecsChange(e, "laptop", "storage")}
        />
      </div>

      <div
        style={{
          gridColumn: "1 / -1",
          marginTop: "20px",
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        Conectividad
      </div>
      <div className="form-group">
        <label>Conectividad (separado por comas)</label>
        <input
          name="connectivity"
          type="text"
          placeholder="Ej: WiFi 6, Bluetooth 5.2, USB-C"
          value={laptopSpecs.connectivity}
          onChange={(e) => handleSpecsChange(e, "laptop")}
        />
      </div>

      <div
        style={{
          gridColumn: "1 / -1",
          marginTop: "20px",
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        Batería
      </div>
      <div className="form-group">
        <label>Batería</label>
        <input
          name="battery"
          type="text"
          placeholder="Ej: 60Wh"
          value={laptopSpecs.battery}
          onChange={(e) => handleSpecsChange(e, "laptop")}
        />
      </div>

      <div
        style={{
          gridColumn: "1 / -1",
          marginTop: "20px",
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        Peso
      </div>
      <div className="form-group">
        <label>Peso</label>
        <input
          name="weight"
          type="text"
          placeholder="Ej: 2.4 kg"
          value={laptopSpecs.weight}
          onChange={(e) => handleSpecsChange(e, "laptop")}
        />
      </div>
    </>
  );

  return (
    <ModalBase
      title={isEditMode ? "Editar Producto Base" : `Crear ${productType}`}
      icon={isEditMode ? <Edit size={24} /> : <PackagePlus size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información del producto base"
          : `Completa la información para crear un nuevo producto base de tipo ${productType}`
      }
      onClose={isEditMode ? onClose : onBack}
      cancelLabel={isEditMode ? "Cancelar" : "Atrás"}
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
            {filteredCategories.map((cat) => (
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
        
        {productType === "Tarjeta gráfica" && renderGraphicsCardFields()}

        {productType === "Laptop" && renderLaptopFields()}
      </div>
    </ModalBase>
  );
};

export default BaseProductsForm;