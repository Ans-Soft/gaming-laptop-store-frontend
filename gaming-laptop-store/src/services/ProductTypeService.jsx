import api from "./Api";
import urls from "./Urls";

/**
 * Fetches all product types from the API.
 * @returns {Promise<Array>} Array of product type objects.
 */
export async function getProductTypes() {
  const response = await api.get(urls.productTypesList);
  return response.data;
}

/**
 * Creates a new product type with optional field associations.
 * @param {Object} productTypeData - { nombre, descripcion, campos: [{id, orden}] }
 * @returns {Promise<Object>} API response with message and tipo_producto.
 */
export async function createProductType(productTypeData) {
  const response = await api.post(urls.productTypesCreate, productTypeData);
  return response.data;
}

/**
 * Updates an existing product type and atomically replaces its field associations.
 * @param {number} id - Product type ID.
 * @param {Object} productTypeData - { nombre, descripcion, campos: [{id, orden}] }
 * @returns {Promise<Object>} API response with message and tipo_producto.
 */
export async function updateProductType(id, productTypeData) {
  const response = await api.put(`${urls.productTypesUpdate}${id}/`, productTypeData);
  return response.data;
}

/**
 * Activates a product type by ID.
 * @param {number} id - Product type ID.
 * @returns {Promise<Object>} API response with message and tipo_producto.
 */
export async function activateProductType(id) {
  const response = await api.post(`${urls.productTypesActivate}${id}/`);
  return response.data;
}

/**
 * Deactivates a product type by ID.
 * Will fail if the type has associated active products.
 * @param {number} id - Product type ID.
 * @returns {Promise<Object>} API response with message and tipo_producto.
 */
export async function deactivateProductType(id) {
  const response = await api.post(`${urls.productTypesDeactivate}${id}/`);
  return response.data;
}

/**
 * Retrieves a single product type with its ordered list of associated fields.
 * Used to pre-populate the edit form.
 * @param {number} id - Product type ID.
 * @returns {Promise<Object>} API response with tipo_producto detail including campos array.
 */
export async function getProductTypeDetail(id) {
  const response = await api.get(urls.productTypesDetail(id));
  return response.data;
}
