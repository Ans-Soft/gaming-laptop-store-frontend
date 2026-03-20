import api from "./Api";
import urls from "./Urls";

/**
 * Fetches all product fields from the API.
 * @returns {Promise<Array>} Array of product field objects.
 */
export async function getProductFields() {
  const response = await api.get(urls.productFieldsList);
  return response.data;
}

/**
 * Creates a new product field.
 * @param {Object} fieldData - { nombre, tipo }
 * @returns {Promise<Object>} API response with message and campo_producto.
 */
export async function createProductField(fieldData) {
  const response = await api.post(urls.productFieldsCreate, fieldData);
  return response.data;
}

/**
 * Updates an existing product field.
 * @param {number} id - Product field ID.
 * @param {Object} fieldData - Fields to update.
 * @returns {Promise<Object>} API response with message and campo_producto.
 */
export async function updateProductField(id, fieldData) {
  const response = await api.put(`${urls.productFieldsUpdate}${id}/`, fieldData);
  return response.data;
}

/**
 * Activates a product field by ID.
 * @param {number} id - Product field ID.
 * @returns {Promise<Object>} API response with message and campo_producto.
 */
export async function activateProductField(id) {
  const response = await api.post(`${urls.productFieldsActivate}${id}/`);
  return response.data;
}

/**
 * Deactivates a product field by ID.
 * Will fail if the field is associated with one or more product types.
 * @param {number} id - Product field ID.
 * @returns {Promise<Object>} API response with message and campo_producto.
 */
export async function deactivateProductField(id) {
  const response = await api.post(`${urls.productFieldsDeactivate}${id}/`);
  return response.data;
}
