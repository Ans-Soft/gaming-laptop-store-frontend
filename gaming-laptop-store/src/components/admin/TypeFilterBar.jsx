import React from "react";
import { X } from "lucide-react";
import "../../styles/admin/typeFilterBar.css";

/**
 * TypeFilterBar Component
 *
 * Chip-based filter for product types with accessibility features
 * and responsive design. Replaces dropdown for better discoverability.
 */
const TypeFilterBar = ({ productTypes, selectedTypeFilter, onFilterChange }) => {
  const activeCount = selectedTypeFilter ? 1 : 0;
  const totalCount = productTypes.length;

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
              <span className="tfb-chip-badge">0</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TypeFilterBar;
