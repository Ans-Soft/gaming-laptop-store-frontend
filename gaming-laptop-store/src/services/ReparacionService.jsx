import api from "./Api";
import urls from "./Urls";

export async function getReparaciones() {
  const response = await api.get(urls.reparacionesList);
  return response.data;
}

export async function reportarDano(unidadId, data) {
  const response = await api.post(urls.reparacionesReportarDano(unidadId), data);
  return response.data;
}

export async function iniciarReparacion(unidadId) {
  const response = await api.post(urls.reparacionesIniciar(unidadId));
  return response.data;
}

export async function completarReparacion(unidadId) {
  const response = await api.post(urls.reparacionesCompletar(unidadId));
  return response.data;
}
