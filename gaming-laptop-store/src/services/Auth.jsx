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

  try {
    const response = await api.post(urls.refresh, { refresh });

    localStorage.setItem("access_token", response.data.access);

    // Si usas ROTATE_REFRESH_TOKENS
    if (response.data.refresh) {
      localStorage.setItem("refresh_token", response.data.refresh);
    }

    return response.data.access;
  } catch (error) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    throw error;
  }
}

export async function logout() {
  const refresh = localStorage.getItem("refresh_token");

  try {
    if (refresh) {
      await api.post(urls.logout, { refresh });
    }
  } catch (error) {
    console.warn("Logout backend failed:", error);
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}
