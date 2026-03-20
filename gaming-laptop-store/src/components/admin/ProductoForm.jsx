import React, { useState, useEffect, useRef } from "react";
import { PackagePlus, Edit, ChevronDown } from "lucide-react";
import ModalBase from "./ModalBase";
import "../../styles/admin/usersForm.css";
import "../../styles/admin/productoForm.css";

import { getBrands } from "../../services/BrandService";
import { getCategories } from "../../services/CategoryService";
import { getProductTypes, getProductTypeDetail } from "../../services/ProductTypeService";

const MAX_IMAGES = 10;
const BASE_URL = "http://127.0.0.1:8000";

/**
 * ProductoForm — create and edit form for the new Producto domain model.
 *
 * Layout: two-column progressive layout.
 *   Left column (30%, sticky): base fields — nombre, descripcion, marca,
 *     tipo_producto, categorias multi-select.
 *   Right column (70%, scrollable): primary image preview + specification sections + image upload.
 *
 * Props:
 *   onClose      {Function}  — closes the modal
 *   onSubmit     {Function}  — (formData: FormData, id?: number) => void
 *   producto     {Object}    — existing producto for edit mode (null for create)
 *   isSubmitting {boolean}
 *   submitError  {string}
 */
const ProductoForm = ({
  onClose,
  onSubmit,
  producto,
  isSubmitting,
  submitError,
}) => {
  const isEditMode = Boolean(producto);

  // ── Base field state ───────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    marca: "",
    tipo_producto: "",
    categorias: [], // array of numeric IDs
  });

  // ── Validation errors ──────────────────────────────────────────────────────
  const [errors, setErrors] = useState({});

  // ── Lookup lists ───────────────────────────────────────────────────────────
  const [brandsList, setBrandsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [productTypesList, setProductTypesList] = useState([]);

  // ── Categories multi-select state ─────────────────────────────────────────
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catDropdownRef = useRef(null);

  // ── Dynamic fields state ───────────────────────────────────────────────────
  // campos: array from TipoProductoDetailSerializer campos[]
  const [campos, setCampos] = useState([]);
  // campoValues: { [campo_producto_id]: string | boolean }
  const [campoValues, setCampoValues] = useState({});
  const [loadingCampos, setLoadingCampos] = useState(false);
  // Track previous tipo_producto to detect changes in edit mode
  const [originalTipoProducto, setOriginalTipoProducto] = useState(null);
  const [showTypeWarning, setShowTypeWarning] = useState(false);

  // ── Image state ────────────────────────────────────────────────────────────
  // entries: [{ id, file, previewUrl, toRemove }]
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // ── Mount: load lookup lists and pre-populate in edit mode ─────────────────
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [brands, cats, types] = await Promise.all([
          getBrands(),
          getCategories(),
          getProductTypes(),
        ]);
        setBrandsList(brands);
        setCategoriesList(cats);
        setProductTypesList(types);
      } catch (err) {
        console.error("Error cargando listas de referencia:", err);
      }
    };
    loadLookups();

    if (isEditMode && producto) {
      const tipoId = producto.tipo_producto;
      setOriginalTipoProducto(tipoId);

      setFormData({
        nombre: producto.nombre || "",
        descripcion: producto.descripcion || "",
        marca: String(producto.marca || ""),
        tipo_producto: String(tipoId || ""),
        categorias: (producto.categorias_data || []).map((c) => c.id),
      });

      // Pre-load dynamic fields for the product's tipo_producto
      if (tipoId) {
        loadCamposForTipo(tipoId, producto.campo_valores || []);
      }

      // Pre-load images
      if (producto.imagenes && producto.imagenes.length > 0) {
        const sorted = [...producto.imagenes].sort((a, b) => a.orden - b.orden);
        setImages(
          sorted.map((img) => ({
            id: img.id,
            file: null,
            previewUrl: img.url.startsWith("http") ? img.url : BASE_URL + img.url,
            toRemove: false,
          }))
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Close category dropdown on outside click ───────────────────────────────
  useEffect(() => {
    if (!catDropdownOpen) return;
    const handleOutside = (e) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [catDropdownOpen]);

  // ── Load campos when tipo_producto changes ─────────────────────────────────
  const loadCamposForTipo = async (tipoId, existingValues = []) => {
    if (!tipoId) {
      setCampos([]);
      setCampoValues({});
      return;
    }
    setLoadingCampos(true);
    try {
      const detail = await getProductTypeDetail(tipoId);
      const camposList = detail.campos || [];
      setCampos(camposList);

      // Build initial values map
      const valuesMap = {};
      camposList.forEach((c) => {
        const existing = existingValues.find(
          (v) => v.campo_producto === c.campo_producto
        );
        if (existing) {
          if (c.campo_tipo === "booleano") {
            valuesMap[c.campo_producto] = Boolean(existing.valor_booleano);
          } else if (c.campo_tipo === "numero") {
            valuesMap[c.campo_producto] =
              existing.valor_numero !== null && existing.valor_numero !== undefined
                ? String(existing.valor_numero)
                : "";
          } else {
            valuesMap[c.campo_producto] = existing.valor_texto || "";
          }
        } else {
          valuesMap[c.campo_producto] = c.campo_tipo === "booleano" ? false : "";
        }
      });
      setCampoValues(valuesMap);
    } catch (err) {
      console.error("Error cargando campos del tipo de producto:", err);
      setCampos([]);
      setCampoValues({});
    } finally {
      setLoadingCampos(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleTipoProductoChange = (e) => {
    const newTipoId = e.target.value;

    if (isEditMode && originalTipoProducto && String(originalTipoProducto) !== newTipoId) {
      setShowTypeWarning(true);
    } else {
      setShowTypeWarning(false);
    }

    setFormData((prev) => ({ ...prev, tipo_producto: newTipoId }));
    if (errors.tipo_producto) setErrors((prev) => ({ ...prev, tipo_producto: null }));

    if (newTipoId) {
      loadCamposForTipo(newTipoId, []);
    } else {
      setCampos([]);
      setCampoValues({});
    }
  };

  // Category multi-select handlers
  const handleCategoryAdd = (id) => {
    const numId = Number(id);
    setFormData((prev) => ({
      ...prev,
      categorias: prev.categorias.map(Number).includes(numId)
        ? prev.categorias
        : [...prev.categorias, numId],
    }));
    if (errors.categorias) setErrors((prev) => ({ ...prev, categorias: null }));
    setCatDropdownOpen(false);
  };

  const handleCategoryRemove = (id) => {
    const numId = Number(id);
    setFormData((prev) => ({
      ...prev,
      categorias: prev.categorias.filter((c) => Number(c) !== numId),
    }));
  };

  const handleCampoChange = (campoId, value) => {
    setCampoValues((prev) => ({ ...prev, [campoId]: value }));
  };

  // ── Image handlers ─────────────────────────────────────────────────────────

  const activeImageCount = images.filter((img) => !img.toRemove).length;
  const atLimit = activeImageCount >= MAX_IMAGES;

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const slots = MAX_IMAGES - activeImageCount;
    const toAdd = imageFiles.slice(0, slots);
    const newEntries = toAdd.map((file) => ({
      id: null,
      file,
      previewUrl: URL.createObjectURL(file),
      toRemove: false,
    }));
    setImages((prev) => [...prev, ...newEntries]);
  };

  const handleImageRemove = (index) => {
    setImages((prev) =>
      prev
        .map((img, i) => {
          if (i !== index) return img;
          if (img.id) return { ...img, toRemove: true };
          URL.revokeObjectURL(img.previewUrl);
          return null;
        })
        .filter(Boolean)
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

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    // Client-side validation
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!formData.descripcion.trim()) newErrors.descripcion = "La descripcion es obligatoria.";
    if (!formData.marca) newErrors.marca = "Selecciona una marca.";
    if (!formData.tipo_producto) newErrors.tipo_producto = "Selecciona un tipo de producto.";
    if (formData.categorias.length === 0) newErrors.categorias = "Selecciona al menos una categoria.";

    // Validate required dynamic campos
    const missingRequired = campos.filter((c) => {
      if (!c.required) return false;
      const val = campoValues[c.campo_producto];
      if (c.campo_tipo === "booleano") return false;
      return val === undefined || val === null || String(val).trim() === "";
    });

    if (Object.keys(newErrors).length > 0 || missingRequired.length > 0) {
      setErrors(newErrors);
      if (missingRequired.length > 0) {
        const names = missingRequired.map((c) => c.campo_nombre).join(", ");
        alert(`Los siguientes campos son obligatorios: ${names}`);
      }
      return;
    }

    const fd = new FormData();

    fd.append("nombre", formData.nombre.trim());
    fd.append("descripcion", formData.descripcion.trim());
    fd.append("marca", String(Number(formData.marca)));
    fd.append("tipo_producto", String(Number(formData.tipo_producto)));
    formData.categorias.forEach((id) => fd.append("categorias", String(Number(id))));

    // Build campo_valores array and serialize as JSON string
    const campoValoresPayload = campos.map((c) => {
      const rawValue = campoValues[c.campo_producto];
      return {
        campo_producto: c.campo_producto,
        valor:
          c.campo_tipo === "booleano"
            ? rawValue === true || rawValue === "true"
              ? "true"
              : "false"
            : rawValue !== undefined && rawValue !== null
            ? String(rawValue)
            : "",
      };
    });
    fd.append("campo_valores", JSON.stringify(campoValoresPayload));

    // New image files (not marked for removal, have a file object)
    const newImages = images.filter((img) => !img.toRemove && img.file);
    newImages.forEach((img, i) => {
      fd.append(`image_${i}`, img.file);
    });

    if (isEditMode) {
      const toRemove = images.filter((img) => img.toRemove && img.id);
      toRemove.forEach((img) => fd.append("remove_images", String(img.id)));

      const reorderData = images
        .filter((img) => !img.toRemove && img.id)
        .map((img, i) => ({ id: img.id, order: i }));
      fd.append("reorder_data", JSON.stringify(reorderData));
    }

    if (onSubmit) onSubmit(fd, producto?.id);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  // Categories not yet selected — shown in the dropdown
  const availableCategories = categoriesList.filter(
    (cat) => !formData.categorias.map(Number).includes(cat.id)
  );

  // Resolved names for selected category IDs
  const selectedCategoryObjects = formData.categorias
    .map((id) => categoriesList.find((c) => c.id === Number(id)))
    .filter(Boolean);

  // ── Product image preview (sticky header) ──────────────────────────────────

  const renderProductImagePreview = () => {
    const activeImages = images.filter((img) => !img.toRemove);
    const primaryImage = activeImages.length > 0 ? activeImages[0] : null;

    return (
      <div className="pf-image-preview-section">
        <div className="pf-image-preview-box">
          {primaryImage ? (
            <img
              src={primaryImage.previewUrl}
              alt="Imagen principal"
              className="pf-primary-image"
            />
          ) : (
            <div className="pf-image-placeholder">
              <span>Sin imagen</span>
            </div>
          )}
        </div>
        <span className="pf-preview-label">Imagen Principal</span>
      </div>
    );
  };

  // ── Specification sections renderer (grouped by type) ────────────────────────

  const renderSpecificationSections = () => {
    if (!formData.tipo_producto) {
      return (
        <div className="pf-spec-empty">
          <p>Selecciona un tipo de producto para ver los campos de especificaciones.</p>
        </div>
      );
    }
    if (loadingCampos) {
      return (
        <div className="pf-spec-empty">
          <p className="pf-dynamic-loading">Cargando campos del tipo de producto...</p>
        </div>
      );
    }
    if (campos.length === 0) {
      return (
        <div className="pf-spec-empty">
          <p>Este tipo de producto no tiene campos de especificacion definidos.</p>
        </div>
      );
    }

    // Group fields by tipo
    const groupedByType = {
      texto: [],
      numero: [],
      booleano: [],
    };

    campos.forEach((c) => {
      if (groupedByType[c.campo_tipo]) {
        groupedByType[c.campo_tipo].push(c);
      }
    });

    // Type display labels
    const typeLabels = {
      texto: "Campos de Texto",
      numero: "Campos Numéricos",
      booleano: "Opciones Booleanas",
    };

    const sections = Object.entries(groupedByType)
      .filter(([_, fields]) => fields.length > 0)
      .map(([tipo, fieldsInType]) => (
        <div key={tipo} className="pf-spec-section">
          <div className="pf-section-header">
            <span className="pf-section-title">{typeLabels[tipo]}</span>
            <span className="pf-section-field-count">{fieldsInType.length}</span>
          </div>
          <div className="pf-section-fields">
            {fieldsInType.map((c) => {
              const currentValue = campoValues[c.campo_producto];
              const labelText = c.required ? (
                <>
                  {c.campo_nombre}
                  <span className="pf-required-mark">*</span>
                </>
              ) : (
                c.campo_nombre
              );

              if (tipo === "booleano") {
                return (
                  <div key={c.campo_producto} className="form-group">
                    <div className="pf-bool-row">
                      <input
                        type="checkbox"
                        id={`campo_${c.campo_producto}`}
                        checked={Boolean(currentValue)}
                        onChange={(e) =>
                          handleCampoChange(c.campo_producto, e.target.checked)
                        }
                      />
                      <label
                        htmlFor={`campo_${c.campo_producto}`}
                        className="pf-bool-label"
                      >
                        {labelText}
                      </label>
                    </div>
                  </div>
                );
              }

              if (tipo === "numero") {
                return (
                  <div key={c.campo_producto} className="form-group">
                    <label htmlFor={`campo_${c.campo_producto}`}>{labelText}</label>
                    <input
                      id={`campo_${c.campo_producto}`}
                      type="number"
                      step="any"
                      placeholder="Valor numerico"
                      value={currentValue || ""}
                      onChange={(e) =>
                        handleCampoChange(c.campo_producto, e.target.value)
                      }
                      required={c.required}
                    />
                  </div>
                );
              }

              // Default: texto
              return (
                <div key={c.campo_producto} className="form-group">
                  <label htmlFor={`campo_${c.campo_producto}`}>{labelText}</label>
                  <input
                    id={`campo_${c.campo_producto}`}
                    type="text"
                    placeholder="Valor del campo"
                    value={currentValue || ""}
                    onChange={(e) =>
                      handleCampoChange(c.campo_producto, e.target.value)
                    }
                    required={c.required}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ));

    return <div className="pf-spec-sections">{sections}</div>;
  };

  // ── Image section renderer ─────────────────────────────────────────────────

  const renderImagesSection = () => (
    <div className="pf-images-section">
      <label>Imagenes del Producto (max. {MAX_IMAGES})</label>

      {images.length > 0 && (
        <div className="pf-images-grid">
          {images.map((img, index) => (
            <div
              key={index}
              className={`pf-image-card${img.toRemove ? " pf-image-removed" : ""}`}
            >
              <img
                src={img.previewUrl}
                alt={`Imagen ${index + 1}`}
                className="pf-image-preview"
              />
              {img.toRemove && (
                <div className="pf-removed-overlay">Eliminada</div>
              )}
              <div className="pf-image-actions">
                <button
                  type="button"
                  className="pf-action-btn"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0 || img.toRemove}
                  title="Mover arriba"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="pf-action-btn"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === images.length - 1 || img.toRemove}
                  title="Mover abajo"
                >
                  ↓
                </button>
                {img.toRemove ? (
                  <button
                    type="button"
                    className="pf-action-btn pf-action-btn--restore"
                    onClick={() => handleImageRestore(index)}
                    title="Restaurar"
                  >
                    ↺
                  </button>
                ) : (
                  <button
                    type="button"
                    className="pf-action-btn pf-action-btn--remove"
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

      <div className="pf-add-row">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="pf-file-input"
          onChange={handleImageAdd}
        />
        <button
          type="button"
          className="pf-add-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={atLimit}
        >
          + Agregar imagenes
        </button>
        <span className={`pf-counter${atLimit ? " pf-counter--warn" : ""}`}>
          {activeImageCount} / {MAX_IMAGES} imagenes
        </span>
      </div>

      {atLimit && (
        <span className="pf-counter pf-counter--warn">
          Limite de {MAX_IMAGES} imagenes alcanzado.
        </span>
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ModalBase
      title={isEditMode ? "Editar Producto" : "Nuevo Producto"}
      icon={isEditMode ? <Edit size={24} /> : <PackagePlus size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la informacion del producto"
          : "Completa la informacion para registrar un nuevo producto"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      {submitError && <div className="form-error-banner">{submitError}</div>}

      {/* Two-column progressive layout */}
      <div className="pf-container">

        {/* ── Left column: base information ── */}
        <div className="pf-column-left">

          {/* Nombre */}
          <div className="form-group">
            <label>
              Nombre <span className="pf-required-mark">*</span>
            </label>
            <input
              name="nombre"
              type="text"
              placeholder="Ej: ASUS TUF Gaming F15"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            {errors.nombre && <span className="pf-field-error">{errors.nombre}</span>}
          </div>

          {/* Descripcion */}
          <div className="form-group">
            <label>
              Descripcion <span className="pf-required-mark">*</span>
            </label>
            <input
              name="descripcion"
              type="text"
              placeholder="Descripcion corta del producto"
              value={formData.descripcion}
              onChange={handleChange}
              required
            />
            {errors.descripcion && (
              <span className="pf-field-error">{errors.descripcion}</span>
            )}
          </div>

          {/* Marca */}
          <div className="form-group">
            <label>
              Marca <span className="pf-required-mark">*</span>
            </label>
            <select
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una marca</option>
              {brandsList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.marca && <span className="pf-field-error">{errors.marca}</span>}
          </div>

          {/* Tipo de producto */}
          <div className="form-group">
            <label>
              Tipo de Producto <span className="pf-required-mark">*</span>
            </label>
            <select
              name="tipo_producto"
              value={formData.tipo_producto}
              onChange={handleTipoProductoChange}
              required
            >
              <option value="">Selecciona un tipo</option>
              {productTypesList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
            {errors.tipo_producto && (
              <span className="pf-field-error">{errors.tipo_producto}</span>
            )}
          </div>

          {/* Type-change warning */}
          {showTypeWarning && campos.length > 0 && (
            <div className="pf-type-warning">
              <strong>⚠ Cambio de tipo detectado</strong>
              <p>Cambiar el tipo de producto eliminará los valores de estos campos:</p>
              <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem", fontSize: "0.85rem" }}>
                {campos.slice(0, 3).map((c) => (
                  <li key={c.campo_producto}>{c.campo_nombre}</li>
                ))}
                {campos.length > 3 && <li>+ {campos.length - 3} más...</li>}
              </ul>
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", opacity: 0.8 }}>
                Esta acción no se puede deshacer.
              </p>
            </div>
          )}

          {/* Categorias multi-select */}
          <div className="form-group">
            <label>
              Categorias <span className="pf-required-mark">*</span>
              {formData.categorias.length > 0 && (
                <span className="pf-cat-count">
                  {" "}({formData.categorias.length} seleccionada
                  {formData.categorias.length !== 1 ? "s" : ""})
                </span>
              )}
            </label>

            {/* Selected categories list */}
            {selectedCategoryObjects.length > 0 && (
              <ul className="pf-cat-selected-list">
                {selectedCategoryObjects.map((cat) => (
                  <li key={cat.id} className="pf-cat-selected-item">
                    <span className="pf-cat-selected-name">{cat.name}</span>
                    <button
                      type="button"
                      className="pf-cat-remove-btn"
                      onClick={() => handleCategoryRemove(cat.id)}
                      title="Quitar categoria"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add category dropdown */}
            <div className="pf-cat-dropdown-wrapper" ref={catDropdownRef}>
              <button
                type="button"
                className="pf-cat-add-btn"
                onClick={() => setCatDropdownOpen((prev) => !prev)}
                disabled={availableCategories.length === 0}
              >
                <span>+ Agregar Categoria</span>
                <ChevronDown
                  size={15}
                  className={`pf-cat-chevron${catDropdownOpen ? " pf-cat-chevron--open" : ""}`}
                />
              </button>

              {catDropdownOpen && availableCategories.length > 0 && (
                <div className="pf-cat-dropdown">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className="pf-cat-dropdown-item"
                      onClick={() => handleCategoryAdd(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              {availableCategories.length === 0 && categoriesList.length > 0 && (
                <p className="pf-cat-all-added">Todas las categorias han sido agregadas.</p>
              )}
            </div>

            {errors.categorias && (
              <span className="pf-field-error">{errors.categorias}</span>
            )}
          </div>
        </div>

        {/* ── Right column: image preview + specifications + images ── */}
        <div className="pf-column-right">

          {/* Primary image preview (sticky) */}
          {renderProductImagePreview()}

          {/* Specifications section header */}
          <div className="pf-spec-header">
            <span className="pf-spec-header-title">Especificaciones</span>
            {campos.length > 0 && (
              <span className="pf-spec-count">{campos.length} campo{campos.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {/* Specification sections (grouped by type) */}
          {renderSpecificationSections()}

          {/* Divider */}
          <div className="pf-spec-divider" />

          {/* Image upload section */}
          {renderImagesSection()}
        </div>
      </div>
    </ModalBase>
  );
};

export default ProductoForm;
