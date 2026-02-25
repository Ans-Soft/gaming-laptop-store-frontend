import React, { useEffect, useState, useCallback } from "react"
import { Search } from "lucide-react"
import { getPublicVariants } from "../../services/CatalogService.jsx"
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
 * Apply client-side filters to an array of product variants.
 * @param {Array}  variants - Raw variants from the API
 * @param {Object} filters  - Current applied filter state
 * @returns {Array} Filtered subset of variants
 */
function applyClientFilters(variants, filters) {
  let result = variants

  // Search — case-insensitive substring match on model name
  if (filters.search.trim()) {
    const query = filters.search.trim().toLowerCase()
    result = result.filter((v) =>
      v.base_product?.model_name?.toLowerCase().includes(query)
    )
  }

  // Brand — exact slug match against base_product.brand.slug
  if (filters.brands.length > 0) {
    result = result.filter((v) =>
      filters.brands.includes(v.base_product?.brand?.slug)
    )
  }

  // GPU — contains match on specs.graphics.model
  if (filters.gpus.length > 0) {
    result = result.filter((v) => {
      const gpu = v.base_product?.specs?.graphics?.model ?? ""
      return filters.gpus.some((g) => gpu.toLowerCase().includes(g.toLowerCase()))
    })
  }

  // RAM — contains match on specs.memory.size
  if (filters.rams.length > 0) {
    result = result.filter((v) => {
      const ram = v.base_product?.specs?.memory?.size ?? ""
      return filters.rams.some((r) => ram.toLowerCase().includes(r.toLowerCase()))
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
  // All variants fetched from the API (after server-side price filter)
  const [allVariants, setAllVariants] = useState([])
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
   * Fetch variants from the API with optional server-side price bounds.
   * Stores result in allVariants, then re-applies client-side filters.
   */
  const fetchVariants = useCallback(async (priceParams, clientFilters) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPublicVariants(priceParams)
      setAllVariants(data)
      setDisplayed(applyClientFilters(data, clientFilters))
    } catch (err) {
      console.error("Error fetching catalog variants:", err)
      setError("Error al cargar los productos. Intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch on mount — no price bounds, no filters
  useEffect(() => {
    fetchVariants({}, DEFAULT_FILTERS)
  }, [fetchVariants])

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
        setDisplayed(applyClientFilters(allVariants, { ...appliedFilters, search: value }))
      }
      return next
    })
  }

  /**
   * "Filtrar" button handler.
   * - If price bounds changed → re-fetch from API with new price params.
   * - Always apply client-side filters (brand, GPU, RAM, search) afterward.
   */
  const handleApplyFilters = () => {
    const priceChanged =
      pendingFilters.price_min !== appliedFilters.price_min ||
      pendingFilters.price_max !== appliedFilters.price_max

    setAppliedFilters(pendingFilters)

    if (priceChanged) {
      const priceParams = {}
      if (pendingFilters.price_min !== "") priceParams.price_min = pendingFilters.price_min
      if (pendingFilters.price_max !== "") priceParams.price_max = pendingFilters.price_max
      fetchVariants(priceParams, pendingFilters)
    } else {
      // No price change — only re-run client-side filter on existing data
      setDisplayed(applyClientFilters(allVariants, pendingFilters))
    }

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
          <FilterPanel
            filters={pendingFilters}
            onChange={handleFilterChange}
            onApply={handleApplyFilters}
          />
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

          {!loading && (error || allVariants.length === 0) && <CanvaEmbed />}

          {!loading && !error && allVariants.length > 0 && displayed.length === 0 && <EmptyState />}

          {!loading && !error && displayed.length > 0 && (
            <div className="cat-grid">
              {displayed.map((variant) => (
                <CatalogCard key={variant.id} variant={variant} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Catalog
