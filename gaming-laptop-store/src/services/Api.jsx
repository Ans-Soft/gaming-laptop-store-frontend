import axios from "axios";
import urls from "./Urls";

const api = axios.create({
  baseURL: urls.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token solo en endpoints protegidos
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

 
    const publicEndpoints = [urls.login];

    if (
      !publicEndpoints.some((endpoint) => config.url.includes(endpoint)) &&
      token
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
