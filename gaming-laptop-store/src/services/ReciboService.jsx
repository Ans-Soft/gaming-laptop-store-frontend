import api from "./Api";
import urls from "./Urls";

export async function getRecibos() {
  const response = await api.get(urls.recibosList);
  return response.data;
}

export async function createRecibo(reciboData) {
  const response = await api.post(urls.recibosCreate, reciboData);
  return response.data;
}

export async function updateRecibo(id, reciboData) {
  const response = await api.put(urls.recibosUpdate(id), reciboData);
  return response.data;
}

export async function getReciboDetail(id) {
  const response = await api.get(urls.recibosDetail(id));
  return response.data;
}
