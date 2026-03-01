import React, { useState, useEffect, useRef } from "react";
import { PackagePlus, Edit } from "lucide-react";
import ModalBase from "./ModalBase";
import "../../styles/admin/usersForm.css";
import "../../styles/admin/baseProductsForm.css";
import { getCategories } from "../../services/CategoryService";
import { getBrands } from "../../services/BrandService";

const BASE_URL = "http://127.0.0.1:8000";
const MAX_IMAGES = 10;

function detectProductType(product) {
  if (!product?.specs) return null;
  const keys = Object.keys(product.specs);
  if (keys.includes("screen") || keys.includes("processor")) return "Laptop";
  if (keys.includes("vram") || keys.includes("vram_speed")) return "Tarjeta gráfica";
  return null;
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

  // images: [{ id, file, previewUrl, altText, toRemove }]
  const [images, setImages] = useState([]);

  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");

  const fileInputRef = useRef(null);

  const isEditMode = Boolean(product);
  const currentProductType = isEditMode ? detectProductType(product) : productType;

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

      // Load existing images sorted by order
      if (product.images && product.images.length > 0) {
        const sorted = [...product.images].sort((a, b) => a.order - b.order);
        setImages(
          sorted.map((img) => ({
            id: img.id,
            file: null,
            previewUrl: img.imagen.startsWith("http")
              ? img.imagen
              : BASE_URL + img.imagen,
            altText: img.alt_text || "",
            toRemove: false,
          }))
        );
      }

      if (product.specs) {
        const effectiveType = detectProductType(product);
        if (effectiveType === "Tarjeta gráfica") {
          setGraphicsCardSpecs((prevSpecs) => ({
            ...prevSpecs,
            ...product.specs,
          }));
        } else if (effectiveType === "Laptop") {
          const laptopSpecsToSet = {
            ...product.specs,
            connectivity: Array.isArray(product.specs.connectivity)
              ? product.specs.connectivity.join(", ")
              : product.specs.connectivity,
          };
          setLaptopSpecs((prevSpecs) => {
            const updatedSpecs = { ...prevSpecs };
            for (const key in laptopSpecsToSet) {
              if (
                typeof laptopSpecsToSet[key] === "object" &&
                laptopSpecsToSet[key] !== null &&
                !Array.isArray(laptopSpecsToSet[key])
              ) {
                updatedSpecs[key] = {
                  ...(updatedSpecs[key] || {}),
                  ...laptopSpecsToSet[key],
                };
              } else {
                updatedSpecs[key] = laptopSpecsToSet[key];
              }
            }
            return updatedSpecs;
          });
        }
      }
    }
  }, [product, isEditMode, productType]);

  const filteredCategories = categoriesList.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecsChange = (e, specType, parent = null) => {
    const { name, value } = e.target;
    if (specType === "graphicsCard") {
      setGraphicsCardSpecs((prev) => ({ ...prev, [name]: value }));
    } else if (specType === "laptop") {
      if (parent) {
        setLaptopSpecs((prev) => ({
          ...prev,
          [parent]: { ...prev[parent], [name]: value },
        }));
      } else {
        setLaptopSpecs((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleCategoryToggle = (id) => {
    const numId = Number(id);
    setFormData((prev) => {
      const alreadySelected = prev.categories.map(Number).includes(numId);
      return {
        ...prev,
        categories: alreadySelected
          ? prev.categories.filter((c) => Number(c) !== numId)
          : [...prev.categories, numId],
      };
    });
  };

  // ── Image handlers ──────────────────────────────────────────────────────────

  const activeImageCount = images.filter((img) => !img.toRemove).length;
  const atLimit = activeImageCount >= MAX_IMAGES;

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    // Reset input so the same file can be re-selected if removed
    e.target.value = "";

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const slots = MAX_IMAGES - activeImageCount;
    const toAdd = imageFiles.slice(0, slots);

    const newEntries = toAdd.map((file) => ({
      id: null,
      file,
      previewUrl: URL.createObjectURL(file),
      altText: "",
      toRemove: false,
    }));

    setImages((prev) => [...prev, ...newEntries]);
  };

  const handleImageRemove = (index) => {
    setImages((prev) =>
      prev.map((img, i) => {
        if (i !== index) return img;
        if (img.id) {
          // Existing image: mark for removal
          return { ...img, toRemove: true };
        }
        // New image: release object URL and remove from list
        URL.revokeObjectURL(img.previewUrl);
        return null;
      }).filter(Boolean)
    );
  };

  const handleImageRestore = (index) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, toRemove: false } : img))
    );
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const handleMoveDown = (index) => {
    setImages((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleAltTextChange = (index, value) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, altText: value } : img))
    );
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    let specs = {};
    if (currentProductType === "Tarjeta gráfica") {
      specs = { ...graphicsCardSpecs };
    } else if (currentProductType === "Laptop") {
      specs = {
        ...laptopSpecs,
        connectivity: laptopSpecs.connectivity
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
      };
    }

    const fd = new FormData();
    fd.append("model_name", formData.model_name.trim());
    fd.append("brand", String(Number(formData.brand)));
    formData.categories.forEach((c) => fd.append("categories", String(Number(c))));
    fd.append("long_description", formData.long_description.trim());
    fd.append("specs", JSON.stringify(specs));

    // New images (not marked for removal, have a file)
    const newImages = images.filter((img) => !img.toRemove && img.file);
    newImages.forEach((img, i) => {
      fd.append(`image_${i}`, img.file);
      fd.append(`alt_text_${i}`, img.altText || "");
    });

    if (isEditMode) {
      // IDs to delete
      const toRemove = images.filter((img) => img.toRemove && img.id);
      toRemove.forEach((img) => fd.append("remove_images", String(img.id)));

      // Reorder existing kept images
      const reorderData = images
        .filter((img) => !img.toRemove && img.id)
        .map((img, i) => ({ id: img.id, order: i }));
      fd.append("reorder_data", JSON.stringify(reorderData));
    }

    if (onSubmit) onSubmit(fd, product?.id);
  };

  // ── Spec renderers ──────────────────────────────────────────────────────────

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
      <div style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontWeight: "bold" }}>
        Pantalla
      </div>
      <div className="form-group">
        <label>Tamaño de pantalla</label>
        <input name="size" data-parent="screen" type="text" placeholder='Ej: 15.6"'
          value={laptopSpecs.screen.size} onChange={(e) => handleSpecsChange(e, "laptop", "screen")} />
      </div>
      <div className="form-group">
        <label>Resolución</label>
        <input name="resolution" data-parent="screen" type="text" placeholder="Ej: FHD"
          value={laptopSpecs.screen.resolution} onChange={(e) => handleSpecsChange(e, "laptop", "screen")} />
      </div>
      <div className="form-group">
        <label>Tasa de Refresco</label>
        <input name="refresh_rate" data-parent="screen" type="text" placeholder="Ej: 144 Hz"
          value={laptopSpecs.screen.refresh_rate} onChange={(e) => handleSpecsChange(e, "laptop", "screen")} />
      </div>

      <div style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontWeight: "bold" }}>
        Procesador
      </div>
      <div className="form-group">
        <label>Modelo de Procesador</label>
        <input name="model" data-parent="processor" type="text" placeholder="Ej: Intel Core i5 13450HX"
          value={laptopSpecs.processor.model} onChange={(e) => handleSpecsChange(e, "laptop", "processor")} />
      </div>
      <div className="form-group">
        <label>Núcleos</label>
        <input name="cores" data-parent="processor" type="number" placeholder="Ej: 10"
          value={laptopSpecs.processor.cores} onChange={(e) => handleSpecsChange(e, "laptop", "processor")} />
      </div>
      <div className="form-group">
        <label>Hilos</label>
        <input name="threads" data-parent="processor" type="number" placeholder="Ej: 16"
          value={laptopSpecs.processor.threads} onChange={(e) => handleSpecsChange(e, "laptop", "processor")} />
      </div>

      <div style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontWeight: "bold" }}>
        Memoria
      </div>
      <div className="form-group">
        <label>Tamaño de Memoria</label>
        <input name="size" data-parent="memory" type="text" placeholder="Ej: 16GB"
          value={laptopSpecs.memory.size} onChange={(e) => handleSpecsChange(e, "laptop", "memory")} />
      </div>
      <div className="form-group">
        <label>Tipo de Memoria</label>
        <input name="type" data-parent="memory" type="text" placeholder="Ej: DDR5"
          value={laptopSpecs.memory.type} onChange={(e) => handleSpecsChange(e, "laptop", "memory")} />
      </div>

      <div style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontWeight: "bold" }}>
        Gráficos
      </div>
      <div className="form-group">
        <label>Modelo de Gráficos</label>
        <input name="model" data-parent="graphics" type="text" placeholder="Ej: NVIDIA GeForce RTX 5050"
          value={laptopSpecs.graphics.model} onChange={(e) => handleSpecsChange(e, "laptop", "graphics")} />
      </div>
      <div className="form-group">
        <label>VRAM</label>
        <input name="vram" data-parent="graphics" type="text" placeholder="Ej: 8GB"
          value={laptopSpecs.graphics.vram} onChange={(e) => handleSpecsChange(e, "laptop", "graphics")} />
      </div>

      <div style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontWeight: "bold" }}>
        Almacenamiento
      </div>
      <div className="form-group">
        <label>Tamaño de Almacenamiento</label>
        <input name="size" data-parent="storage" type="text" placeholder="Ej: 512GB"
          value={laptopSpecs.storage.size} onChange={(e) => handleSpecsChange(e, "laptop", "storage")} />
      </div>
      <div className="form-group">
        <label>Tipo de Almacenamiento</label>
        <input name="type" data-parent="storage" type="text" placeholder="Ej: SSD"
          value={laptopSpecs.storage.type} onChange={(e) => handleSpecsChange(e, "laptop", "storage")} />
      </div>

      <div style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontWeight: "bold" }}>
        Conectividad
      </div>
      <div className="form-group">
        <label>Conectividad (separado por comas)</label>
        <input name="connectivity" type="text" placeholder="Ej: WiFi 6, Bluetooth 5.2, USB-C"
          value={laptopSpecs.connectivity} onChange={(e) => handleSpecsChange(e, "laptop")} />
      </div>

      <div style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontWeight: "bold" }}>
        Batería
      </div>
      <div className="form-group">
        <label>Batería</label>
        <input name="battery" type="text" placeholder="Ej: 60Wh"
          value={laptopSpecs.battery} onChange={(e) => handleSpecsChange(e, "laptop")} />
      </div>

      <div style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontWeight: "bold" }}>
        Peso
      </div>
      <div className="form-group">
        <label>Peso</label>
        <input name="weight" type="text" placeholder="Ej: 2.4 kg"
          value={laptopSpecs.weight} onChange={(e) => handleSpecsChange(e, "laptop")} />
      </div>
    </>
  );

  // ── Image section ───────────────────────────────────────────────────────────

  const renderImagesSection = () => (
    <div className="bpf-images-section">
      <label>Imágenes del Producto (máx. {MAX_IMAGES})</label>

      {images.length > 0 && (
        <div className="bpf-images-grid">
          {images.map((img, index) => (
            <div
              key={index}
              className={`bpf-image-card${img.toRemove ? " bpf-image-removed" : ""}`}
            >
              <img
                src={img.previewUrl}
                alt={img.altText || `Imagen ${index + 1}`}
                className="bpf-image-preview"
              />
              {img.toRemove && (
                <div className="bpf-removed-overlay">Eliminada</div>
              )}
              <input
                type="text"
                className="bpf-alt-input"
                placeholder="Texto alt"
                value={img.altText}
                onChange={(e) => handleAltTextChange(index, e.target.value)}
                disabled={img.toRemove}
              />
              <div className="bpf-image-actions">
                <button
                  type="button"
                  className="bpf-action-btn"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0 || img.toRemove}
                  title="Mover arriba"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="bpf-action-btn"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === images.length - 1 || img.toRemove}
                  title="Mover abajo"
                >
                  ↓
                </button>
                {img.toRemove ? (
                  <button
                    type="button"
                    className="bpf-action-btn bpf-action-btn--restore"
                    onClick={() => handleImageRestore(index)}
                    title="Restaurar"
                  >
                    ↺
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bpf-action-btn bpf-action-btn--remove"
                    onClick={() => handleImageRemove(index)}
                    title="Eliminar"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bpf-add-row">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="bpf-file-input"
          onChange={handleImageAdd}
        />
        <button
          type="button"
          className="bpf-add-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={atLimit}
        >
          + Agregar imágenes
        </button>
        <span className={`bpf-counter${atLimit ? " bpf-counter--warn" : ""}`}>
          {activeImageCount} / {MAX_IMAGES} imágenes
        </span>
      </div>

      {atLimit && (
        <span className="bpf-counter bpf-counter--warn">
          Límite de {MAX_IMAGES} imágenes alcanzado.
        </span>
      )}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ModalBase
      title={isEditMode ? "Editar Producto Base" : `Crear ${currentProductType}`}
      icon={isEditMode ? <Edit size={24} /> : <PackagePlus size={24} />}
      badge={isEditMode && currentProductType ? currentProductType : null}
      subtitle={
        isEditMode
          ? "Actualiza la información del producto base"
          : `Completa la información para crear un nuevo producto base de tipo ${currentProductType}`
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
          <label>
            Categorías *{" "}
            {formData.categories.length > 0 && (
              <span className="bpf-cat-count">
                ({formData.categories.length} seleccionada{formData.categories.length !== 1 ? "s" : ""})
              </span>
            )}
          </label>
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="bpf-cat-search"
          />
          <div className="bpf-cat-chips">
            {filteredCategories.length === 0 ? (
              <span className="bpf-cat-empty">Sin resultados</span>
            ) : (
              filteredCategories.map((cat) => {
                const isSelected = formData.categories.map(Number).includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`bpf-cat-chip${isSelected ? " bpf-cat-chip--selected" : ""}`}
                    onClick={() => handleCategoryToggle(cat.id)}
                  >
                    {cat.name}
                  </button>
                );
              })
            )}
          </div>
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

        {currentProductType === "Tarjeta gráfica" && renderGraphicsCardFields()}
        {currentProductType === "Laptop" && renderLaptopFields()}

        {renderImagesSection()}
      </div>
    </ModalBase>
  );
};

export default BaseProductsForm;
