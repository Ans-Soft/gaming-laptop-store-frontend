import api from "./Api";
import urls from "./Urls";

/**
 * Fetches all suppliers from the API.
 * @returns {Promise<Array>} Array of supplier objects.
 */
export async function getSuppliers() {
  const response = await api.get(urls.suppliersList);
  return response.data;
}

/**
 * Creates a new supplier.
 * @param {Object} supplierData - { nombre }
 * @returns {Promise<Object>} API response with message and proveedor.
 */
export async function createSupplier(supplierData) {
  const response = await api.post(urls.suppliersCreate, supplierData);
  return response.data;
}

/**
 * Updates an existing supplier.
 * @param {number} id - Supplier ID.
 * @param {Object} supplierData - Fields to update.
 * @returns {Promise<Object>} API response with message and proveedor.
 */
export async function updateSupplier(id, supplierData) {
  const response = await api.put(`${urls.suppliersUpdate}${id}/`, supplierData);
  return response.data;
}

/**
 * Activates a supplier by ID.
 * @param {number} id - Supplier ID.
 * @returns {Promise<Object>} API response with message and proveedor.
 */
export async function activateSupplier(id) {
  const response = await api.post(`${urls.suppliersActivate}${id}/`);
  return response.data;
}

/**
 * Deactivates a supplier by ID.
 * Will fail if the supplier has active variants associated with it.
 * @param {number} id - Supplier ID.
 * @returns {Promise<Object>} API response with message and proveedor.
 */
export async function deactivateSupplier(id) {
  const response = await api.post(`${urls.suppliersDeactivate}${id}/`);
  return response.data;
}
