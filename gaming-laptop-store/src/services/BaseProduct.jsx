import api from "./Api";
import urls from "./Urls";

// Obtener todos los productos base
export async function getBaseProducts() {
  const response = await api.get(urls.baseProductsList);
  return response.data;
}

// Crear un producto base
export async function createBaseProduct(data) {
  const response = await api.post(urls.baseProductCreate, data);
  return response.data;
}

// Actualizar un producto base
export async function updateBaseProduct(id, data) {
  const response = await api.put(`${urls.baseProductUpdate}${id}/`, data);
  return response.data;
}

// Activar un producto base
export async function activateBaseProduct(id) {
  const response = await api.post(`${urls.baseProductActivate}${id}/`);
  return response.data;
}

// Desactivar un producto base
export async function deactivateBaseProduct(id) {
  const response = await api.post(`${urls.baseProductDeactivate}${id}/`);
  return response.data;
}
