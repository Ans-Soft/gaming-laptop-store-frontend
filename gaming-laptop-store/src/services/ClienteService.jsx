import api from "./Api";
import urls from "./Urls";

export async function getClientes() {
  const response = await api.get(urls.clientesList);
  return response.data;
}

export async function createCliente(clienteData) {
  const response = await api.post(urls.clientesCreate, clienteData);
  return response.data;
}

export async function updateCliente(id, clienteData) {
  const response = await api.put(urls.clientesUpdate(id), clienteData);
  return response.data;
}

export async function activateCliente(id) {
  const response = await api.post(urls.clientesActivate(id));
  return response.data;
}

export async function deactivateCliente(id) {
  const response = await api.post(urls.clientesDeactivate(id));
  return response.data;
}

export async function getClienteDetail(id) {
  const response = await api.get(urls.clientesDetail(id));
  return response.data;
}
