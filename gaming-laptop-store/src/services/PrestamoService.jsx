import api from "./Api";
import urls from "./Urls";

/**
 * Servicio del Control de Préstamo. Mapea la API /api/prestamo/.
 * Las respuestas del backend vienen envueltas ({ resumen }, { proyeccion },
 * { movimientos }, etc.); aquí se desenvuelven para el frontend.
 */

// ---- Resumen / proyección -------------------------------------------------

export async function getResumen() {
  const { data } = await api.get(urls.prestamoResumen);
  return data.resumen ?? data;
}

export async function getProyeccion() {
  const { data } = await api.get(urls.prestamoProyeccion);
  return data.proyeccion ?? data;
}

// ---- Movimientos ----------------------------------------------------------

export async function getMovimientos(params = {}) {
  const { data } = await api.get(urls.prestamoMovimientos, { params });
  return data.movimientos ?? data;
}

export async function createMovimiento(payload) {
  const { data } = await api.post(urls.prestamoMovimientos, payload);
  return data.movimiento ?? data;
}

export async function updateMovimiento(id, payload) {
  const { data } = await api.patch(urls.prestamoMovimientoDetail(id), payload);
  return data.movimiento ?? data;
}

export async function deleteMovimiento(id) {
  const { data } = await api.delete(urls.prestamoMovimientoDetail(id));
  return data;
}

// ---- Pago regular (las 3 líneas del corte del día 11) ---------------------

export async function getPagoRegularPreview(mes) {
  const { data } = await api.get(urls.prestamoPagoRegular, {
    params: mes ? { mes } : {},
  });
  return data.pago_regular ?? data;
}

export async function registrarPagoRegular({ mes, comprobanteUrl } = {}) {
  const payload = {};
  if (mes) payload.mes = mes;
  if (comprobanteUrl) payload.comprobante_url = comprobanteUrl;
  const { data } = await api.post(urls.prestamoPagoRegular, payload);
  return data;
}

// ---- Comprobantes ---------------------------------------------------------

export async function uploadComprobante(file) {
  const form = new FormData();
  form.append("archivo", file);
  const { data } = await api.post(urls.prestamoComprobantes, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.comprobante_url;
}

// ---- Auditoría ------------------------------------------------------------

export async function getAuditoria() {
  const { data } = await api.get(urls.prestamoAuditoria);
  return data.auditoria ?? data;
}

// ---- Configuración --------------------------------------------------------

export async function getConfiguracion() {
  const { data } = await api.get(urls.prestamoConfiguracion);
  return data.configuracion ?? data;
}

export async function updateConfiguracion(payload) {
  const { data } = await api.put(urls.prestamoConfiguracion, payload);
  return data.configuracion ?? data;
}
