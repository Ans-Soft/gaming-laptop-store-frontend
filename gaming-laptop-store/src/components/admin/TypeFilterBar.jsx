import React from "react";
import { X } from "lucide-react";
import "../../styles/admin/typeFilterBar.css";

/**
 * TypeFilterBar Component
 *
 * Chip-based filter for product types with accessibility features
 * and responsive design. Replaces dropdown for better discoverability.
 */
const TypeFilterBar = ({ productTypes, productos = [], selectedTypeFilter, onFilterChange }) => {
  const activeCount = selectedTypeFilter ? 1 : 0;
  const totalCount = productTypes.length;

  // Count active products per tipo_producto id. Producto.tipo_producto is the
  // FK id on the list endpoint.
  const countsByType = productos.reduce((acc, p) => {
    if (p.active === false) return acc;
    const id = p.tipo_producto;
    if (id == null) return acc;
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const handleChipClick = (typeId) => {
    // Toggle: if clicking active chip, clear filter; otherwise set it
    if (selectedTypeFilter === typeId.toString()) {
      onFilterChange("");
    } else {
      onFilterChange(typeId.toString());
    }
  };

  const handleClear = () => {
    onFilterChange("");
  };

  return (
    <div className="tfb-container">
      <div className="tfb-header">
        <label className="tfb-label">Filtrar por Tipo:</label>
        {selectedTypeFilter && (
          <button
            className="tfb-clear-btn"
            onClick={handleClear}
            title="Limpiar filtro"
            aria-label="Limpiar filtro de tipo"
          >
            <X size={16} />
            Limpiar
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <div className="tfb-badge" aria-live="polite">
          {activeCount} de {totalCount} tipos seleccionados
        </div>
      )}

      <div className="tfb-chips" role="radiogroup" aria-label="Selecciona un tipo de producto">
        {productTypes.map((type) => {
          const isActive = selectedTypeFilter === type.id.toString();
          return (
            <button
              key={type.id}
              className={`tfb-chip ${isActive ? "tfb-chip--active" : ""}`}
              onClick={() => handleChipClick(type.id)}
              role="radio"
              aria-checked={isActive}
              aria-label={`${type.nombre}${isActive ? ", seleccionado" : ""}`}
            >
              <span className="tfb-chip-name">{type.nombre}</span>
              <span className="tfb-chip-badge">{countsByType[type.id] || 0}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TypeFilterBar;
