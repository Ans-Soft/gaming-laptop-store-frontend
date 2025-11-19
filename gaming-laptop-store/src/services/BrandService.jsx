import api from "./Api";
import urls from "./Urls";

export async function getBrands() {
  const response = await api.get(urls.brandsList);
  return response.data;
}

export async function createBrand(brandData) {
  const response = await api.post(urls.brandsCreate, brandData);
  return response.data;
}

export async function updateBrand(id, brandData) {
  const response = await api.put(`${urls.brandUpdate}${id}/`, brandData);
  return response.data;
}

export async function activateBrand(id) {
  const response = await api.post(`${urls.brandActivate}${id}/`);
  return response.data;
}

export async function deactivateBrand(id) {
  const response = await api.post(`${urls.brandDeactivate}${id}/`);
  return response.data;
}
