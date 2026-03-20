import api from "./Api";
import urls from "./Urls";

/**
 * Fetches all BajoPedido records (on-demand sourcing).
 * @returns {Promise<Array>} Array of BajoPedido objects.
 */
export async function getBajoPedidos() {
  const response = await api.get(urls.bajoPedidoList);
  return response.data;
}

/**
 * Fetches a single BajoPedido record by ID.
 * @param {number} id - BajoPedido ID.
 * @returns {Promise<Object>} BajoPedido detail object.
 */
export async function getBajoPedidoDetail(id) {
  const response = await api.get(urls.bajoPedidoDetail(id));
  return response.data;
}

/**
 * Creates a new BajoPedido record.
 * @param {Object} bajoPedidoData - Fields: producto, condicion, precio, enlace_proveedor, proveedor, estado.
 * @returns {Promise<Object>} API response with message and bajoPedido.
 */
export async function createBajoPedido(bajoPedidoData) {
  const response = await api.post(urls.bajoPedidoCreate, bajoPedidoData);
  return response.data;
}

/**
 * Updates an existing BajoPedido record.
 * @param {number} id - BajoPedido ID.
 * @param {Object} bajoPedidoData - Fields to update (partial update supported).
 * @returns {Promise<Object>} API response with message and bajoPedido.
 */
export async function updateBajoPedido(id, bajoPedidoData) {
  const response = await api.patch(urls.bajoPedidoUpdate(id), bajoPedidoData);
  return response.data;
}

/**
 * Activates a BajoPedido record by ID.
 * Sets estado = 'activo'.
 * @param {number} id - BajoPedido ID.
 * @returns {Promise<Object>} API response with message and bajoPedido.
 */
export async function activateBajoPedido(id) {
  const response = await api.post(urls.bajoPedidoActivate(id));
  return response.data;
}

/**
 * Deactivates a BajoPedido record by ID.
 * Sets estado = 'inactivo'.
 * @param {number} id - BajoPedido ID.
 * @returns {Promise<Object>} API response with message and bajoPedido.
 */
export async function deactivateBajoPedido(id) {
  const response = await api.post(urls.bajoPedidoDeactivate(id));
  return response.data;
}
