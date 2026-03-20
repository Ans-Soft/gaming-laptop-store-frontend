import api from "./Api";
import urls from "./Urls";

export async function getProductosBajoPedido() {
  const response = await api.get(urls.productosBajoPedidoList);
  return response.data;
}

export async function createProductoBajoPedido(productoData) {
  const response = await api.post(urls.productosBajoPedidoCreate, productoData);
  return response.data;
}

export async function updateProductoBajoPedido(id, productoData) {
  const response = await api.put(urls.productosBajoPedidoUpdate(id), productoData);
  return response.data;
}

export async function activateProductoBajoPedido(id) {
  const response = await api.post(urls.productosBajoPedidoActivate(id));
  return response.data;
}

export async function deactivateProductoBajoPedido(id) {
  const response = await api.post(urls.productosBajoPedidoDeactivate(id));
  return response.data;
}

export async function getProductoBajoPedidoDetail(id) {
  const response = await api.get(urls.productosBajoPedidoDetail(id));
  return response.data;
}
