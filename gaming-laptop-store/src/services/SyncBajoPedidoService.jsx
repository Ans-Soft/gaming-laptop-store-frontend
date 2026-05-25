import api from "./Api";
import urls from "./Urls";

/**
 * SyncBajoPedidoService — daily price-sync log monitoring (Hito 7).
 * Mirrors conventions of DealWatcherService.jsx / BajoPedidoService.jsx.
 */

/**
 * Fetches the sync log for Bajo Pedido price updates.
 *
 * @param {Object} params
 * @param {number} [params.dias=30]      - Window in days (0 = no window).
 * @param {string} [params.resultado=""] - Filter by result key (empty = all).
 * @param {number} [params.bajo_pedido]  - Filter by variant ID (omit for all).
 * @returns {Promise<Array>} Array of sync log entries, desc by checked_at.
 */
export async function getSyncLogs({ dias = 30, resultado = "", bajo_pedido } = {}) {
  const params = { dias };
  if (resultado) params.resultado = resultado;
  if (bajo_pedido != null) params.bajo_pedido = bajo_pedido;
  const { data } = await api.get(urls.syncBajoPedidoLogs, { params });
  return Array.isArray(data) ? data : data.results ?? [];
}

/**
 * Fetches all active Bajo Pedido variants to show their current sync state.
 * Reuses the existing bajoPedidoList endpoint which now includes the
 * extra sync fields: ebay_legacy_id, disponibilidad_ebay,
 * disponibilidad_ebay_display, fallos_consecutivos, ultimo_sync_at,
 * ultimo_vendedor.
 *
 * @returns {Promise<Array>}
 */
export async function getListingsSyncState() {
  const { data } = await api.get(urls.bajoPedidoList);
  return Array.isArray(data) ? data : data.results ?? [];
}
