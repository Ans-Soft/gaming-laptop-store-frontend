import React, { useEffect, useState, useCallback } from "react"
import { Search } from "lucide-react"
import { getPublicProductos } from "../../services/CatalogService.jsx"
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
  gpus: [],
  rams: [],
}

// ---------------------------------------------------------------------------
// Client-side filter function
// Applied after the API response to handle brand, GPU, RAM, and search.
// Price filtering is delegated to the server (price_min / price_max params).
// ---------------------------------------------------------------------------

/**
 * Apply client-side filters to an array of catalog productos.
 * @param {Array}  productos - Raw productos from the API (merged data)
 * @param {Object} filters   - Current applied filter state
 * @returns {Array} Filtered subset of productos
 */
function applyClientFilters(productos, filters) {
  let result = productos

  // Search — case-insensitive substring match on nombre
  if (filters.search.trim()) {
    const query = filters.search.trim().toLowerCase()
    result = result.filter((p) =>
      p.nombre?.toLowerCase().includes(query)
    )
  }

  // Brand — exact slug match against marca.slug
  if (filters.brands.length > 0) {
    result = result.filter((p) =>
      filters.brands.includes(p.marca?.slug)
    )
  }

  // Price filter — client-side on merged price
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

const ErrorState = ({ message }) => (
  <div className="cat-error" role="alert">
    <p>{message || "Error al cargar los productos. Intenta de nuevo más tarde."}</p>
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
  // All productos fetched from the merged API data
  const [allProductos, setAllProductos] = useState([])
  // Subset after client-side filters are applied
  const [displayed, setDisplayed] = useState([])

  // Pending filters reflect UI state (not yet applied via "Filtrar" button)
  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS)
  // Applied filters are what was last submitted — used for API + client filter
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  /**
   * Fetch productos from the merged API sources.
   * Stores result in allProductos, then re-applies client-side filters.
   */
  const fetchProductos = useCallback(async (priceParams, clientFilters) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPublicProductos(priceParams)
      setAllProductos(data)
      setDisplayed(applyClientFilters(data, clientFilters))
    } catch (err) {
      console.error("Error fetching catalog productos:", err)
      setError("Error al cargar los productos. Intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch on mount — no price bounds, no filters
  useEffect(() => {
    fetchProductos({}, DEFAULT_FILTERS)
  }, [fetchProductos])

  // ---------------------------------------------------------------------------
  // Filter handlers
  // ---------------------------------------------------------------------------

  /**
   * Update a single pending filter key.
   * Search updates are also applied live (client-side only, no re-fetch).
   */
  const handleFilterChange = (key, value) => {
    setPendingFilters((prev) => {
      const next = { ...prev, [key]: value }
      // Live search: apply client-side filter immediately without re-fetching
      if (key === "search") {
        setDisplayed(applyClientFilters(allProductos, { ...appliedFilters, search: value }))
      }
      return next
    })
  }

  /**
   * "Filtrar" button handler.
   * - Apply all client-side filters (price now done client-side).
   */
  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters)
    // Apply all filters client-side on merged data
    setDisplayed(applyClientFilters(allProductos, pendingFilters))

    // Collapse mobile filters panel after applying
    setMobileFiltersOpen(false)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="cat-page">
      {/* Body: mobile toggle + sidebar + main */}
      <div className="cat-body">
        {/* Mobile-only filter toggle button */}
        <button
          type="button"
          className="cat-filters-toggle"
          onClick={() => setMobileFiltersOpen((prev) => !prev)}
          aria-expanded={mobileFiltersOpen}
          aria-controls="cat-sidebar"
        >
          {mobileFiltersOpen ? "Ocultar filtros" : "Mostrar filtros"}
        </button>

        {/* Filter sidebar */}
        <aside
          id="cat-sidebar"
          className={`cat-sidebar${mobileFiltersOpen ? " cat-sidebar--open" : ""}`}
          aria-label="Filtros de productos"
        >
          {(() => {
            // Build dynamic brand options from available productos
            const brandSet = new Set()
            allProductos.forEach((p) => {
              if (p.marca?.slug && p.marca?.nombre) {
                brandSet.add(JSON.stringify({ label: p.marca.nombre, value: p.marca.slug }))
              }
            })
            const brandOptions = Array.from(brandSet).map((s) => JSON.parse(s))

            return (
              <FilterPanel
                filters={pendingFilters}
                onChange={handleFilterChange}
                onApply={handleApplyFilters}
                brandOptions={brandOptions}
              />
            )
          })()}
        </aside>

        {/* Main product area */}
        <main className="cat-main" aria-label="Listado de productos">
          {/* Search bar — inside cat-main so it aligns with the card columns */}
          <div className="cat-search-bar">
            <div className="cat-search-inner">
              <span className="cat-search-icon" aria-hidden="true">
                <Search size={18} />
              </span>
              <input
                type="search"
                className="cat-search-input"
                placeholder="Buscar productos..."
                value={pendingFilters.search}
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
