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
