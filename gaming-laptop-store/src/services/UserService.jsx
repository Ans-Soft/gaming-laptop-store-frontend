import api from "./Api";
import urls from "./Urls";

export async function getUsers() {
  const response = await api.get(urls.usersList);
  return response.data;
}

export async function registerUser(userData) {
  const response = await api.post(urls.usersRegister, userData);
  return response.data;
}

export async function updateUser(id, userData) {
  const response = await api.put(`${urls.userUpdate}${id}/`, userData);
  return response.data;
}

export async function activateUser(id) {
  const response = await api.post(`${urls.userActivate}${id}/`);
  return response.data;
}

export async function deactivateUser(id) {
  const response = await api.post(`${urls.userDeactivate}${id}/`);
  return response.data;
}