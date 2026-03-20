import React, { useState, useEffect } from "react";
import { Tag, Edit, GripVertical, Trash2, ChevronDown } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import { getProductFields } from "../../services/ProductFieldService";
import "../../styles/admin/manageProductTypeFields.css";

/**
 * Modal form for creating and editing product types.
 * Unified field sequence builder: drag-and-drop reordering with descriptive field info.
 * The form submits a single payload with { nombre, descripcion, campos }
 * so the backend creates/updates the type and its associations atomically.
 */
const ProductTypesForm = ({
  onClose,
  onSubmit,
  productType,
  isSubmitting,
  submitError,
}) => {
  const isEditMode = Boolean(productType);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [allFields, setAllFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  // Field type metadata with descriptions and colors
  const fieldTypeInfo = {
    texto: { label: "Text", description: "Entrada libre de texto", color: "tipo-text" },
    numero: { label: "Number", description: "Valor numérico", color: "tipo-number" },
    booleano: { label: "Boolean", description: "Alternar Sí / No", color: "tipo-boolean" },
  };

  // ── Initialise form state whenever the productType prop changes ──────────
  useEffect(() => {
    if (isEditMode) {
      setNombre(productType.nombre || "");
      setDescripcion(productType.descripcion || "");
      const preselected = (productType.campos || []).map((c) => ({
        id: c.campo_producto,
        nombre: c.campo_nombre,
        tipo: c.campo_tipo,
        orden: c.orden,
        // Option B: required comes from the association row, not from the field itself
        required: Boolean(c.required),
      }));
      // Sort by orden to maintain sequence
      setSelectedFields(preselected.sort((a, b) => a.orden - b.orden));
    } else {
      setNombre("");
      setDescripcion("");
      setSelectedFields([]);
    }
  }, [productType, isEditMode]);

  // ── Load all active fields once on mount ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingFields(true);
        const data = await getProductFields();
        const fields = Array.isArray(data) ? data : [];
        setAllFields(fields.filter((f) => f.active));
      } catch (err) {
        console.error("Error loading product fields:", err);
      } finally {
        setLoadingFields(false);
      }
    };
    load();
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const isFieldSelected = (fieldId) => selectedFields.some((f) => f.id === fieldId);

  const handleAddField = (field) => {
    if (!isFieldSelected(field.id)) {
      const nextOrden = selectedFields.length > 0
        ? Math.max(...selectedFields.map((f) => f.orden)) + 1
        : 1;
      setSelectedFields((prev) => [
        ...prev,
        // New associations default to required=false (Option B)
        { id: field.id, nombre: field.nombre, tipo: field.tipo, orden: nextOrden, required: false },
      ]);
    }
    setOpenDropdown(false);
  };

  const handleToggleRequired = (fieldId) => {
    setSelectedFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, required: !f.required } : f))
    );
  };

  const handleRemoveField = (fieldId) => {
    setSelectedFields((prev) => prev.filter((f) => f.id !== fieldId));
  };

  // ── Drag and drop handlers ────────────────────────────────────────────────
  const handleDragStart = (e, field) => {
    setDraggedItem(field);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetField) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetField.id) return;

    const draggedIndex = selectedFields.findIndex((f) => f.id === draggedItem.id);
    const targetIndex = selectedFields.findIndex((f) => f.id === targetField.id);

    const newFields = [...selectedFields];
    newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, draggedItem);

    // Recalculate orden to maintain sequence
    newFields.forEach((field, idx) => {
      field.orden = idx + 1;
    });

    setSelectedFields(newFields);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(
        {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          // Include required flag per association (Option B)
          campos: selectedFields.map((f) => ({ id: f.id, orden: f.orden, required: f.required })),
        },
        productType?.id
      );
    }
  };

  const availableFields = allFields.filter((f) => !isFieldSelected(f.id));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ModalBase
      title={isEditMode ? "Edit Product Type" : "Create Product Type"}
      icon={isEditMode ? <Edit size={24} /> : <Tag size={24} />}
      subtitle={
        isEditMode
          ? "Update the information and field sequence"
          : "Enter the product type name and select fields"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      {submitError && <div className="form-error-banner">{submitError}</div>}

      <div className="form-grid">
        {/* Nombre */}
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="nombre">
            Name <span className="required">*</span>
          </label>
          <input
            id="nombre"
            type="text"
            placeholder="e.g., Laptop, Graphics Card, Monitor"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Descripcion */}
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="descripcion">Description</label>
          <textarea
            id="descripcion"
            placeholder="Optional description of this product type"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            disabled={isSubmitting}
          />
        </div>

        {/* Field Sequence Builder */}
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <div className="mptf-header">
            <label>Field Sequence</label>
            <span className="mptf-count">{selectedFields.length}</span>
          </div>

          {loadingFields ? (
            <p className="mptf-loading">Loading fields...</p>
          ) : (
            <>
              {/* Sequence list */}
              {selectedFields.length === 0 ? (
                <div className="mptf-empty-sequence">
                  <p>No fields yet. Add fields using the selector below.</p>
                </div>
              ) : (
                <div className="mptf-sequence">
                  {selectedFields.map((field, idx) => {
                    const typeInfo = fieldTypeInfo[field.tipo] || { label: field.tipo, description: "", color: "tipo-text" };
                    return (
                      <div
                        key={field.id}
                        className={`mptf-sequence-item ${draggedItem?.id === field.id ? "dragging" : ""}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, field)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, field)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="mptf-sequence-number">{idx + 1}</div>
                        <div className="mptf-sequence-drag">
                          <GripVertical size={16} />
                        </div>
                        <div className="mptf-sequence-info">
                          <div className="mptf-sequence-name">{field.nombre}</div>
                          <div className="mptf-sequence-type">
                            <span className={`mptf-type-badge ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            <span className="mptf-type-description">{typeInfo.description}</span>
                          </div>
                        </div>
                        <label className="mptf-required-label" title="Mark as required for this product type">
                          <input
                            type="checkbox"
                            className="mptf-required-checkbox"
                            checked={field.required}
                            onChange={() => handleToggleRequired(field.id)}
                            disabled={isSubmitting}
                          />
                          <span className="mptf-required-text">¿Es obligatorio?</span>
                        </label>
                        <button
                          type="button"
                          className="mptf-sequence-remove"
                          title="Remove field"
                          onClick={() => handleRemoveField(field.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add field dropdown */}
              {loadingFields ? null : (
                <div className="mptf-add-field">
                  <div className="mptf-dropdown-wrapper">
                    <button
                      type="button"
                      className="mptf-add-btn"
                      onClick={() => setOpenDropdown(!openDropdown)}
                      disabled={availableFields.length === 0 || isSubmitting}
                    >
                      <span>+ Add Field</span>
                      <ChevronDown size={16} className={openDropdown ? "rotated" : ""} />
                    </button>
                    {openDropdown && availableFields.length > 0 && (
                      <div className="mptf-dropdown">
                        {availableFields.map((field) => {
                          const typeInfo = fieldTypeInfo[field.tipo] || { label: field.tipo, description: "", color: "tipo-text" };
                          return (
                            <button
                              key={field.id}
                              type="button"
                              className="mptf-dropdown-item"
                              onClick={() => handleAddField(field)}
                            >
                              <div className="mptf-dropdown-name">{field.nombre}</div>
                              <span className={`mptf-type-badge ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {availableFields.length === 0 && (
                    <p className="mptf-no-available">All fields are already added.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ModalBase>
  );
};

export default ProductTypesForm;
