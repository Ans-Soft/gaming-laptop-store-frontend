import api from "./Api";
import urls from "./Urls";

export async function getCategories() {
  const response = await api.get(urls.categoriesList);
  return response.data;
}

export async function createCategory(categoryData) {
  const response = await api.post(urls.categoryCreate, categoryData);
  return response.data;
}

export async function updateCategory(id, categoryData) {
  const response = await api.put(`${urls.categoryUpdate}${id}/`, categoryData);
  return response.data;
}

export async function activateCategory(id) {
  const response = await api.post(`${urls.categoryActivate}${id}/`);
  return response.data;
}

export async function deactivateCategory(id) {
  const response = await api.post(`${urls.categoryDeactivate}${id}/`);
  return response.data;
}
