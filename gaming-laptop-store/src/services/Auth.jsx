import api from "./Api";
import urls from "./Urls";

export async function login(email, password) {
  console.log("Logging in with:", email, password, urls.login);
  const response = await api.post(urls.login, { email, password });
  if (response.data.access && response.data.refresh) {
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
  }
  return response.data;
}

export async function refreshToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) throw new Error("No refresh token available");

  const response = await api.post(urls.refresh, { refresh });
  localStorage.setItem("access_token", response.data.access);
  return response.data;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
