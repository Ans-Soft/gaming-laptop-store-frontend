import React, { useState, useRef, useEffect } from "react"
import "../../styles/filterPanel.css"

// ---------------------------------------------------------------------------
// Static option definitions
// ---------------------------------------------------------------------------

const BRAND_OPTIONS = [
  { label: "Acer",   value: "acer" },
  { label: "MSI",    value: "msi" },
  { label: "Asus",   value: "asus" },
  { label: "Lenovo", value: "lenovo" },
]

const GPU_OPTIONS = [
  { label: "RTX 3060", value: "3060" },
  { label: "RTX 4050", value: "4050" },
  { label: "RTX 5050", value: "5050" },
]

const RAM_OPTIONS = [
  { label: "8GB",  value: "8GB" },
  { label: "16GB", value: "16GB" },
  { label: "32GB", value: "32GB" },
]

// ---------------------------------------------------------------------------
// MultiSelect — custom dropdown with checkboxes (no external libraries)
// ---------------------------------------------------------------------------

/**
 * MultiSelect component — a styled dropdown with checkboxes.
 * Props:
 *   label       {string}   - Section label shown above the trigger
 *   options     {Array}    - [{ label, value }]
 *   selected    {string[]} - Array of currently selected values
 *   onChange    {Function} - (newSelected: string[]) => void
 *   placeholder {string}   - Text when nothing is selected
 */
const MultiSelect = ({ label, options, selected, onChange, placeholder }) => {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleOption = (value) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    onChange(next)
  }

  const triggerLabel =
    selected.length === 0
      ? placeholder
      : `${selected.length} seleccionado${selected.length > 1 ? "s" : ""}`

  return (
    <div className="fp-group">
      <span className="fp-label">{label}</span>
      <div className="ms-wrapper" ref={wrapperRef}>
        <button
          type="button"
          className="ms-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span>{triggerLabel}</span>
          <span className={`ms-arrow${open ? " ms-arrow--open" : ""}`} aria-hidden="true">
            ▼
          </span>
        </button>

        {open && (
          <div className="ms-dropdown" role="listbox" aria-multiselectable="true">
            {options.map((opt) => {
              const checked = selected.includes(opt.value)
              return (
                <label
                  key={opt.value}
                  className="ms-option"
                  role="option"
                  aria-selected={checked}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(opt.value)}
                    aria-label={opt.label}
                  />
                  {opt.label}
                </label>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FilterPanel
// ---------------------------------------------------------------------------

/**
 * FilterPanel component — sidebar with all filter controls.
 * Props:
 *   filters  {{ search, price_min, price_max, brands: string[], gpus: string[], rams: string[] }}
 *   onChange {(key: string, value: any) => void}
 *   onApply  {() => void}
 */
const FilterPanel = ({ filters, onChange, onApply }) => {
  const handlePriceMin = (e) => onChange("price_min", e.target.value)
  const handlePriceMax = (e) => onChange("price_max", e.target.value)

  return (
    <div className="fp-panel" role="search" aria-label="Panel de filtros">
      <h2 className="fp-title">Filtros</h2>

      {/* Price range */}
      <div className="fp-group">
        <span className="fp-label">Precio (COP)</span>
        <div className="fp-price-row">
          <input
            type="number"
            className="fp-input"
            placeholder="Desde"
            value={filters.price_min}
            onChange={handlePriceMin}
            min="0"
            aria-label="Precio mínimo"
          />
          <span className="fp-price-sep" aria-hidden="true">—</span>
          <input
            type="number"
            className="fp-input"
            placeholder="Hasta"
            value={filters.price_max}
            onChange={handlePriceMax}
            min="0"
            aria-label="Precio máximo"
          />
        </div>
      </div>

      {/* Brand multi-select — client-side filter against base_product.brand.slug */}
      <MultiSelect
        label="Marca"
        options={BRAND_OPTIONS}
        selected={filters.brands}
        onChange={(val) => onChange("brands", val)}
        placeholder="Todas las marcas"
      />

      {/* GPU multi-select — client-side contains match on specs.graphics.model */}
      <MultiSelect
        label="GPU"
        options={GPU_OPTIONS}
        selected={filters.gpus}
        onChange={(val) => onChange("gpus", val)}
        placeholder="Todas las GPU"
      />

      {/* RAM multi-select — client-side contains match on specs.memory.size */}
      <MultiSelect
        label="RAM"
        options={RAM_OPTIONS}
        selected={filters.rams}
        onChange={(val) => onChange("rams", val)}
        placeholder="Toda la RAM"
      />

      {/* Apply button — triggers re-fetch for price and client-side for the rest */}
      <button
        type="button"
        className="fp-apply-btn"
        onClick={onApply}
        aria-label="Aplicar filtros"
      >
        Filtrar
      </button>
    </div>
  )
}

export default FilterPanel
