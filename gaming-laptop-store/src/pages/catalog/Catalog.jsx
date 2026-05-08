import React, { useEffect, useState, useCallback, useMemo } from "react"
import { Search } from "lucide-react"
import { getPublicProductos } from "../../services/CatalogService.jsx"
import {
  getProductTypes,
  getProductTypeDetail,
} from "../../services/ProductTypeService.jsx"
import FilterPanel from "../../components/catalog/FilterPanel.jsx"
import CatalogCard from "../../components/catalog/CatalogCard.jsx"
import CanvaEmbed from "../../components/CanvaEmbed.jsx"
import "../../styles/catalog.css"

// ---------------------------------------------------------------------------
// Default filter state
// ---------------------------------------------------------------------------

const DEFAULT_FILTERS = {
  search: "",
  price_min: "",
  price_max: "",
  brands: [],
  // attrs: { [campo_producto_id]: string[] (texto/booleano) | {min,max} (numero) }
  attrs: {},
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Pull the user-facing string for a campo_valor based on its campo_tipo.
 * texto → valor_texto. booleano → "Sí"/"No". numero → null (range filter).
 */
function readCampoValueForFilter(cv, tipo) {
  if (!cv) return null
  if (tipo === "texto") return cv.valor_texto || null
  if (tipo === "booleano") {
    if (cv.valor_booleano === null || cv.valor_booleano === undefined) return null
    return cv.valor_booleano ? "Sí" : "No"
  }
  return null
}

/**
 * Apply ALL client-side filters to an array of catalog productos.
 * Uses the currently-selected tipo to decide which attribute filters are
 * relevant (filters from inactive types are ignored).
 */
function applyClientFilters(productos, filters, selectedTipoId, tipoCampos) {
  let result = productos

  // Type filter — restricts the catalog to a single tipo_producto when set.
  if (selectedTipoId !== null && selectedTipoId !== undefined) {
    result = result.filter((p) => p.tipo_producto === selectedTipoId)
  }

  // Search — case-insensitive substring match on nombre + nombre_base.
  if (filters.search.trim()) {
    const query = filters.search.trim().toLowerCase()
    result = result.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(query) ||
        p.nombre_base?.toLowerCase().includes(query)
    )
  }

  // Brand — exact slug match against marca.slug.
  if (filters.brands.length > 0) {
    result = result.filter((p) => filters.brands.includes(p.marca?.slug))
  }

  // Price filter — client-side on merged price.
  if (filters.price_min !== "" || filters.price_max !== "") {
    result = result.filter((p) => {
      if (p.precio === null) return false
      if (filters.price_min !== "" && p.precio < parseFloat(filters.price_min))
        return false
      if (filters.price_max !== "" && p.precio > parseFloat(filters.price_max))
        return false
      return true
    })
  }

  // Attribute filters — only meaningful when a tipo is selected.
  const attrs = filters.attrs || {}
  if (selectedTipoId !== null && tipoCampos.length > 0) {
    for (const campo of tipoCampos) {
      const campoId = campo.campo_producto
      const value = attrs[campoId]
      if (!value) continue

      if (campo.campo_tipo === "numero") {
        const min = value.min !== "" ? parseFloat(value.min) : null
        const max = value.max !== "" ? parseFloat(value.max) : null
        if (min === null && max === null) continue
        result = result.filter((p) => {
          const cv = p.campo_valores?.find((v) => v.campo_producto === campoId)
          if (!cv || cv.valor_numero === null || cv.valor_numero === undefined) return false
          const num = parseFloat(cv.valor_numero)
          if (min !== null && num < min) return false
          if (max !== null && num > max) return false
          return true
        })
      } else {
        // texto / booleano — multi-select.
        if (!Array.isArray(value) || value.length === 0) continue
        result = result.filter((p) => {
          const cv = p.campo_valores?.find((v) => v.campo_producto === campoId)
          const readable = readCampoValueForFilter(cv, campo.campo_tipo)
          return readable && value.includes(readable)
        })
      }
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Sub-components: Loading, Error, Empty states
// ---------------------------------------------------------------------------

const LoadingState = () => (
  <div className="cat-loading" role="status" aria-label="Cargando productos">
    <div className="cat-spinner" aria-hidden="true" />
    <span>Cargando productos...</span>
  </div>
)

const EmptyState = () => (
  <div className="cat-empty">
    <span className="cat-empty-icon" aria-hidden="true">🔍</span>
    <h3>Sin resultados</h3>
    <p>No encontramos productos con los filtros seleccionados.</p>
  </div>
)

// ---------------------------------------------------------------------------
// Catalog page
// ---------------------------------------------------------------------------

const Catalog = () => {
  const [allProductos, setAllProductos] = useState([])

  // Tipo de producto state
  const [tipos, setTipos] = useState([])
  const [tiposCampos, setTiposCampos] = useState({})
  const [selectedTipoId, setSelectedTipoId] = useState(null)

  // Single live filter state — every change applies on demand.
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchProductos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPublicProductos()
      setAllProductos(data)
    } catch (err) {
      console.error("Error fetching catalog productos:", err)
      setError("Error al cargar los productos. Intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load — productos + tipos in parallel.
  useEffect(() => {
    fetchProductos()

    const loadTipos = async () => {
      try {
        const list = await getProductTypes()
        const arr = Array.isArray(list) ? list : []
        const active = arr.filter((t) => t.active !== false)
        setTipos(active)

        const detailEntries = await Promise.all(
          active.map(async (t) => {
            try {
              const d = await getProductTypeDetail(t.id)
              const promoOnly = (d.campos || []).filter((c) => c.mostrar_en_promo)
              return [t.id, promoOnly]
            } catch {
              return [t.id, []]
            }
          })
        )
        const map = {}
        detailEntries.forEach(([id, campos]) => {
          map[id] = campos
        })
        setTiposCampos(map)
      } catch (err) {
        console.error("Error loading tipos for filters:", err)
      }
    }
    loadTipos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------------------------------------------------------------------
  // Tipo selection
  // ---------------------------------------------------------------------------

  const handleTipoChange = (tipoId) => {
    setSelectedTipoId(tipoId)
    // Drop attribute filters from the previous tipo — they no longer apply.
    setFilters((prev) => ({ ...prev, attrs: {} }))
  }

  // ---------------------------------------------------------------------------
  // Filter handlers — every change applies on demand.
  // ---------------------------------------------------------------------------

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setMobileFiltersOpen(false)
  }

  // ---------------------------------------------------------------------------
  // Derived state — recomputed live as filters change.
  // ---------------------------------------------------------------------------

  const activeCampos = useMemo(() => {
    if (selectedTipoId === null) return []
    return tiposCampos[selectedTipoId] || []
  }, [selectedTipoId, tiposCampos])

  const displayed = useMemo(
    () => applyClientFilters(allProductos, filters, selectedTipoId, activeCampos),
    [allProductos, filters, selectedTipoId, activeCampos]
  )

  // Brand options — restricted to brands that have productos in the current
  // tipo selection (so toggling to "Laptops" hides GPU-only brands).
  const brandOptions = useMemo(() => {
    const set = new Set()
    const pool =
      selectedTipoId === null
        ? allProductos
        : allProductos.filter((p) => p.tipo_producto === selectedTipoId)
    pool.forEach((p) => {
      if (p.marca?.slug && p.marca?.nombre) {
        set.add(JSON.stringify({ label: p.marca.nombre, value: p.marca.slug }))
      }
    })
    return Array.from(set).map((s) => JSON.parse(s))
  }, [allProductos, selectedTipoId])

  // Distinct value options per campo_producto for texto/booleano filters.
  const attrOptions = useMemo(() => {
    if (selectedTipoId === null) return {}
    const pool = allProductos.filter((p) => p.tipo_producto === selectedTipoId)
    const out = {}
    activeCampos.forEach((campo) => {
      if (campo.campo_tipo === "numero") return
      const set = new Set()
      pool.forEach((p) => {
        const cv = p.campo_valores?.find((v) => v.campo_producto === campo.campo_producto)
        const readable = readCampoValueForFilter(cv, campo.campo_tipo)
        if (readable) set.add(readable)
      })
      out[campo.campo_producto] = Array.from(set)
        .sort()
        .map((v) => ({ label: v, value: v }))
    })
    return out
  }, [allProductos, selectedTipoId, activeCampos])

  // Tabs only show tipos that currently have at least one available product.
  const tipoTabs = useMemo(() => {
    const counts = new Map()
    allProductos.forEach((p) => {
      counts.set(p.tipo_producto, (counts.get(p.tipo_producto) || 0) + 1)
    })
    return tipos
      .filter((t) => counts.has(t.id))
      .map((t) => ({ id: t.id, nombre: t.nombre, count: counts.get(t.id) }))
  }, [tipos, allProductos])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="cat-page">
      <div className="cat-body">
        <button
          type="button"
          className="cat-filters-toggle"
          onClick={() => setMobileFiltersOpen((prev) => !prev)}
          aria-expanded={mobileFiltersOpen}
          aria-controls="cat-sidebar"
        >
          {mobileFiltersOpen ? "Ocultar filtros" : "Mostrar filtros"}
        </button>

        <aside
          id="cat-sidebar"
          className={`cat-sidebar${mobileFiltersOpen ? " cat-sidebar--open" : ""}`}
          aria-label="Filtros de productos"
        >
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            brandOptions={brandOptions}
            promoCampos={activeCampos}
            attrOptions={attrOptions}
          />
        </aside>

        <main className="cat-main" aria-label="Listado de productos">
          {tipoTabs.length > 0 && (
            <div className="cat-tipo-tabs" role="tablist" aria-label="Tipos de producto">
              <button
                type="button"
                role="tab"
                aria-selected={selectedTipoId === null}
                className={`cat-tipo-tab${selectedTipoId === null ? " cat-tipo-tab--active" : ""}`}
                onClick={() => handleTipoChange(null)}
              >
                Todos <span className="cat-tipo-count">{allProductos.length}</span>
              </button>
              {tipoTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedTipoId === t.id}
                  className={`cat-tipo-tab${selectedTipoId === t.id ? " cat-tipo-tab--active" : ""}`}
                  onClick={() => handleTipoChange(t.id)}
                >
                  {t.nombre} <span className="cat-tipo-count">{t.count}</span>
                </button>
              ))}
            </div>
          )}

          <div className="cat-search-bar">
            <div className="cat-search-inner">
              <span className="cat-search-icon" aria-hidden="true">
                <Search size={18} />
              </span>
              <input
                type="search"
                className="cat-search-input"
                placeholder="Buscar productos..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                aria-label="Buscar productos"
              />
            </div>
          </div>

          {loading && <LoadingState />}

          {!loading && (error || allProductos.length === 0) && <CanvaEmbed />}

          {!loading && !error && allProductos.length > 0 && displayed.length === 0 && <EmptyState />}

          {!loading && !error && displayed.length > 0 && (
            <div className="cat-grid">
              {displayed.map((producto) => (
                <CatalogCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Catalog
