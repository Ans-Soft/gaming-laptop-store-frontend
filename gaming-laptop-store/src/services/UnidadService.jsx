import api from "./Api";
import urls from "./Urls";

/**
 * Fetches all product units from the API.
 * Accepts an optional variante_id to filter units by variant.
 * @param {number|null} varianteId - Optional variant ID to filter by.
 * @returns {Promise<Array>} Array of unidad objects.
 */
export async function getUnidades(varianteId = null) {
  const params = varianteId ? { producto_id: varianteId } : {};
  const response = await api.get(urls.unidadesList, { params });
  return response.data;
}

/**
 * Fetches a single product unit by ID.
 * @param {number} id - Unidad ID.
 * @returns {Promise<Object>} Unidad detail object.
 */
export async function getUnidadDetail(id) {
  const response = await api.get(urls.unidadesDetail(id));
  return response.data;
}

/**
 * Creates a new product unit.
 * @param {Object} unidadData - Unit fields: variante_id, serial, estado_venta, estado_producto, precio.
 * @returns {Promise<Object>} API response with message and unidad.
 */
export async function createUnidad(unidadData) {
  const response = await api.post(urls.unidadesCreate, unidadData);
  return response.data;
}

/**
 * Updates an existing product unit.
 * @param {number} id - Unidad ID.
 * @param {Object} unidadData - Fields to update (partial update supported).
 * @returns {Promise<Object>} API response with message and unidad.
 */
export async function updateUnidad(id, unidadData) {
  const response = await api.patch(urls.unidadesUpdate(id), unidadData);
  return response.data;
}

/**
 * Activates a product unit by ID.
 * Also triggers parent variant estado/price sync on the backend.
 * @param {number} id - Unidad ID.
 * @returns {Promise<Object>} API response with message and unidad.
 */
export async function activateUnidad(id) {
  const response = await api.post(urls.unidadesActivate(id));
  return response.data;
}

/**
 * Deactivates a product unit by ID.
 * Also triggers parent variant estado/price sync on the backend.
 * @param {number} id - Unidad ID.
 * @returns {Promise<Object>} API response with message and unidad.
 */
export async function deactivateUnidad(id) {
  const response = await api.post(urls.unidadesDeactivate(id));
  return response.data;
}
