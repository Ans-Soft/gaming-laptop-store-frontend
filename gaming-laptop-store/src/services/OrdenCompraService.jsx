import api from "./Api";
import urls from "./Urls";

export async function getOrdenesCompra() {
  const response = await api.get(urls.ordenesCompraList);
  return response.data;
}

export async function createOrdenCompra(ordenData) {
  const response = await api.post(urls.ordenesCompraCreate, ordenData);
  return response.data;
}

export async function updateOrdenCompra(id, ordenData) {
  const response = await api.put(urls.ordenesCompraUpdate(id), ordenData);
  return response.data;
}

export async function activateOrdenCompra(id) {
  const response = await api.post(urls.ordenesCompraActivate(id));
  return response.data;
}

export async function deactivateOrdenCompra(id) {
  const response = await api.post(urls.ordenesCompraDeactivate(id));
  return response.data;
}

export async function getOrdenCompraDetail(id) {
  const response = await api.get(urls.ordenesCompraDetail(id));
  return response.data;
}
