import api from "./Api";
import urls from "./Urls";

export async function getMetodoAliadoUnidades() {
  const response = await api.get(urls.metodoAliadoList);
  return response.data;
}

export async function marcarEnviadaMetodoAliado(id, payload = {}) {
  const response = await api.post(urls.metodoAliadoMarcarEnviada(id), payload);
  return response.data;
}

export async function marcarEntregadaMetodoAliado(id) {
  const response = await api.post(urls.metodoAliadoMarcarEntregada(id));
  return response.data;
}

export async function cancelarMetodoAliado(id) {
  const response = await api.post(urls.metodoAliadoCancelar(id));
  return response.data;
}
