import api from "./Api";
import urls from "./Urls";

export async function getVentas() {
  const response = await api.get(urls.ventasList);
  return response.data;
}

export async function createVenta(ventaData) {
  const response = await api.post(urls.ventasCreate, ventaData);
  return response.data;
}

export async function updateVenta(id, ventaData) {
  const response = await api.put(urls.ventasUpdate(id), ventaData);
  return response.data;
}

export async function getVentaDetail(id) {
  const response = await api.get(urls.ventasDetail(id));
  return response.data;
}
