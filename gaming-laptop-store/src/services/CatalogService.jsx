import api from "./Api"
import urls from "./Urls"

/**
 * Fetch published active product variants.
 * Server-side filters: is_published, active, price_min, price_max.
 * Client-side filters (brands, gpus, rams, search) are applied in Catalog.jsx.
 * @param {Object} params - Optional extra query params (e.g. price_min, price_max)
 * @returns {Promise<Array>} Array of product variant objects
 */
export const getPublicVariants = async (params = {}) => {
  const response = await api.get(urls.productVariantsList, {
    params: {
      is_published: true,
      active: true,
      ...params,
    },
  })
  // Handle both plain array and paginated { results: [] } response shapes
  return Array.isArray(response.data) ? response.data : (response.data.results ?? [])
}
