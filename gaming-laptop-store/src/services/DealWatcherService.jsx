import api from "./Api";
import urls from "./Urls";

/**
 * Deal Watcher service: monitored products, trusted sellers, pauses,
 * Telegram subscribers, price-check history. Mirrors the conventions of
 * SupplierService.jsx + BajoPedidoService.jsx.
 */

// ---- Monitored Products --------------------------------------------------

export async function getMonitoredProducts() {
  const { data } = await api.get(urls.dwMonitoredList);
  return data;
}

export async function getMonitoredProduct(id) {
  const { data } = await api.get(urls.dwMonitoredDetail(id));
  return data;
}

export async function createMonitoredProduct(payload) {
  const { data } = await api.post(urls.dwMonitoredCreate, payload);
  return data;
}

export async function updateMonitoredProduct(id, payload) {
  const { data } = await api.put(urls.dwMonitoredUpdate(id), payload);
  return data;
}

export async function activateMonitoredProduct(id) {
  const { data } = await api.post(urls.dwMonitoredActivate(id));
  return data;
}

export async function deactivateMonitoredProduct(id) {
  const { data } = await api.post(urls.dwMonitoredDeactivate(id));
  return data;
}

export async function getMonitoredProductHistory(id, limit = 200) {
  const { data } = await api.get(urls.dwMonitoredHistory(id), { params: { limit } });
  return data;
}

// ---- Trusted Sellers -----------------------------------------------------

export async function getTrustedSellers() {
  const { data } = await api.get(urls.dwSellersList);
  return data;
}

export async function createTrustedSeller(payload) {
  const { data } = await api.post(urls.dwSellersCreate, payload);
  return data;
}

export async function updateTrustedSeller(id, payload) {
  const { data } = await api.put(urls.dwSellersUpdate(id), payload);
  return data;
}

export async function activateTrustedSeller(id) {
  const { data } = await api.post(urls.dwSellersActivate(id));
  return data;
}

export async function deactivateTrustedSeller(id) {
  const { data } = await api.post(urls.dwSellersDeactivate(id));
  return data;
}

// ---- Pauses --------------------------------------------------------------

export async function getGlobalPauseStatus() {
  const { data } = await api.get(urls.dwPauseStatus);
  return data;
}

/**
 * Create a global pause. Provide either `durationMinutes` or `pausedUntil`,
 * or neither for indefinite. `reason` is free text.
 */
export async function createGlobalPause({ durationMinutes, pausedUntil, reason } = {}) {
  const payload = {};
  if (durationMinutes != null) payload.duration_minutes = durationMinutes;
  if (pausedUntil != null) payload.paused_until = pausedUntil;
  if (reason) payload.reason = reason;
  const { data } = await api.post(urls.dwPauseCreate, payload);
  return data;
}

export async function liftGlobalPause() {
  const { data } = await api.post(urls.dwPauseLift);
  return data;
}

// ---- On-demand check -----------------------------------------------------

/**
 * Ejecuta on-demand (al instante) la verificación de precios de todos los
 * productos: actualiza Bajo Pedido y corre el Deal Watcher, notificando por
 * Telegram si hay oferta. Es lo mismo que hace el cron, pero manual.
 *
 * @param {boolean} dryRun - si es true, no envía notificaciones.
 * Petición síncrona y potencialmente lenta (llama a eBay por cada producto):
 * se usa un timeout amplio.
 */
export async function runChecksNow({ dryRun = false } = {}) {
  const { data } = await api.post(urls.dwRunNow, null, {
    params: dryRun ? { dry_run: true } : {},
    timeout: 180000,
  });
  return data;
}

// ---- Telegram Subscribers -----------------------------------------------

export async function getTelegramSubscribers() {
  const { data } = await api.get(urls.dwTelegramSubscribersList);
  return data;
}

export async function deactivateTelegramSubscriber(id) {
  const { data } = await api.post(urls.dwTelegramSubscribersDeactivate(id));
  return data;
}
