import api from "./Api";
import urls from "./Urls";

export async function getSeparaciones() {
  const response = await api.get(urls.separacionesList);
  return response.data;
}

export async function createSeparacion(separacionData) {
  const response = await api.post(urls.separacionesCreate, separacionData);
  return response.data;
}

export async function updateSeparacion(id, separacionData) {
  const response = await api.put(urls.separacionesUpdate(id), separacionData);
  return response.data;
}

export async function getSeparacionDetail(id) {
  const response = await api.get(urls.separacionesDetail(id));
  return response.data;
}

export async function activateSeparacion(id) {
  const response = await api.put(urls.separacionesActivate(id));
  return response.data;
}

export async function deactivateSeparacion(id) {
  const response = await api.put(urls.separacionesDeactivate(id));
  return response.data;
}
