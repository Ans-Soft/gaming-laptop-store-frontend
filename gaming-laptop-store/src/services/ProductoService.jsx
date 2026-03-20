import api from "./Api";
import urls from "./Urls";

/**
 * Fetches all products from the API.
 * @returns {Promise<Array>} Array of producto objects.
 */
export async function getProductos() {
  const response = await api.get(urls.productosList);
  return response.data;
}

/**
 * Fetches a single product by ID with all nested data.
 * @param {number} id - Producto ID.
 * @returns {Promise<Object>} Producto detail object.
 */
export async function getProductoDetail(id) {
  const response = await api.get(urls.productosDetail(id));
  return response.data;
}

/**
 * Creates a new product. Accepts multipart/form-data (FormData) because
 * the request may include image files.
 * @param {FormData} formData - Product data including optional image files.
 * @returns {Promise<Object>} API response with message and producto.
 */
export async function createProducto(formData) {
  const response = await api.post(urls.productosCreate, formData, {
    headers: { "Content-Type": undefined },
  });
  return response.data;
}

/**
 * Updates an existing product. Accepts multipart/form-data.
 * @param {number} id - Producto ID.
 * @param {FormData} formData - Updated product data.
 * @returns {Promise<Object>} API response with message and producto.
 */
export async function updateProducto(id, formData) {
  const response = await api.put(urls.productosUpdate(id), formData, {
    headers: { "Content-Type": undefined },
  });
  return response.data;
}

/**
 * Activates a product by ID.
 * @param {number} id - Producto ID.
 * @returns {Promise<Object>} API response with message and producto.
 */
export async function activateProducto(id) {
  const response = await api.post(urls.productosActivate(id));
  return response.data;
}

/**
 * Deactivates a product by ID.
 * @param {number} id - Producto ID.
 * @returns {Promise<Object>} API response with message and producto.
 */
export async function deactivateProducto(id) {
  const response = await api.post(urls.productosDeactivate(id));
  return response.data;
}
