import React, { useState, useRef, useEffect } from "react"
import "../../styles/filterPanel.css"

// ---------------------------------------------------------------------------
// MultiSelect — styled dropdown with checkboxes (no external libraries)
// ---------------------------------------------------------------------------

const MultiSelect = ({ label, options, selected, onChange, placeholder }) => {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

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

        {open && options.length > 0 && (
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
// NumericRange — min/max paired inputs for a `numero` campo
// ---------------------------------------------------------------------------

const NumericRange = ({ label, value, onChange }) => {
  const min = value?.min ?? ""
  const max = value?.max ?? ""
  return (
    <div className="fp-group">
      <span className="fp-label">{label}</span>
      <div className="fp-price-row">
        <input
          type="number"
          className="fp-input"
          placeholder="Mín."
          value={min}
          onChange={(e) => onChange({ min: e.target.value, max })}
          aria-label={`${label} mínimo`}
        />
        <span className="fp-price-sep" aria-hidden="true">—</span>
        <input
          type="number"
          className="fp-input"
          placeholder="Máx."
          value={max}
          onChange={(e) => onChange({ min, max: e.target.value })}
          aria-label={`${label} máximo`}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FilterPanel
// ---------------------------------------------------------------------------

/**
 * Sidebar with all filter controls.
 *
 * filters keys:
 *   - search (string, applied live by parent)
 *   - price_min / price_max (string)
 *   - brands (string[])
 *   - attrs ({ [campo_producto_id]: string[] | { min, max } })
 *
 * promoCampos: array of TipoProductoCampo entries with mostrar_en_promo=true.
 *   Each has campo_producto, campo_nombre, campo_tipo (texto/numero/booleano).
 *
 * attrOptions: { [campo_producto_id]: [{label, value}] } — distinct values
 *   computed by parent from the current product set so the multi-select
 *   only offers values that exist for the selected tipo.
 */
const FilterPanel = ({
  filters,
  onChange,
  onClear,
  brandOptions = [],
  promoCampos = [],
  attrOptions = {},
}) => {
  const handlePriceMin = (e) => onChange("price_min", e.target.value)
  const handlePriceMax = (e) => onChange("price_max", e.target.value)

  const handleAttrChange = (campoId, value) => {
    const nextAttrs = { ...(filters.attrs || {}), [campoId]: value }
    onChange("attrs", nextAttrs)
  }

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

      {/* Brand multi-select — dynamic options from available productos */}
      {brandOptions.length > 0 && (
        <MultiSelect
          label="Marca"
          options={brandOptions}
          selected={filters.brands}
          onChange={(val) => onChange("brands", val)}
          placeholder="Todas las marcas"
        />
      )}

      {/* Type-specific attribute filters — one group per campo flagged
          mostrar_en_promo on the selected tipo_producto. */}
      {promoCampos.map((campo) => {
        const campoId = campo.campo_producto
        const tipo = campo.campo_tipo
        const label = (campo.campo_nombre || "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
        const attrs = filters.attrs || {}

        if (tipo === "numero") {
          return (
            <NumericRange
              key={campoId}
              label={label}
              value={attrs[campoId] || { min: "", max: "" }}
              onChange={(val) => handleAttrChange(campoId, val)}
            />
          )
        }

        // texto + booleano fall back to multi-select with distinct values.
        const opts = attrOptions[campoId] || []
        if (opts.length === 0) return null

        return (
          <MultiSelect
            key={campoId}
            label={label}
            options={opts}
            selected={attrs[campoId] || []}
            onChange={(val) => handleAttrChange(campoId, val)}
            placeholder={`Cualquier ${label.toLowerCase()}`}
          />
        )
      })}

      {/* Clear button — filters apply live so we just need a reset action. */}
      <button
        type="button"
        className="fp-apply-btn"
        onClick={onClear}
        aria-label="Limpiar todos los filtros"
      >
        Limpiar filtros
      </button>
    </div>
  )
}

export default FilterPanel
