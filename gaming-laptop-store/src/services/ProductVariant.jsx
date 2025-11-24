import api from "./Api";
import urls from "./Urls";

// Listar todas las variantes de producto
export async function getProductVariants() {
  const response = await api.get(urls.productVariantsList);
  return response.data;
}

// Crear una variante de producto
export async function createProductVariant(data) {
  const response = await api.post(urls.productVariantCreate, data);
  return response.data;
}

// Actualizar una variante de producto
export async function updateProductVariant(id, data) {
  const response = await api.put(`${urls.productVariantUpdate}${id}/`, data);
  return response.data;
}

// Activar variante
export async function activateProductVariant(id) {
  const response = await api.post(`${urls.productVariantActivate}${id}/`);
  return response.data;
}

// Desactivar variante
export async function deactivateProductVariant(id) {
  const response = await api.post(`${urls.productVariantDeactivate}${id}/`);
  return response.data;
}

// Publicar variante
export async function publishProductVariant(id) {
  const response = await api.post(`${urls.productVariantPublish}${id}/`);
  return response.data;
}

// Despublicar variante
export async function unpublishProductVariant(id) {
  const response = await api.post(`${urls.productVariantUnpublish}${id}/`);
  return response.data;
}
