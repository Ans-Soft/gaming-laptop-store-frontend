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

    const publicEndpoints = [urls.login, urls.productVariantsList];

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

// Interceptor de respuesta: manejo de 401 con refresco de token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;

    // Solo actuar sobre respuestas 401
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // No reintentar si ya se marcó como reintento, o si es el endpoint de
    // login o refresh (evitar bucles infinitos)
    const isAuthEndpoint =
      originalConfig.url.includes(urls.login) ||
      originalConfig.url.includes(urls.refresh);

    if (originalConfig._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    try {
      // Llamada directa con axios (no con la instancia `api`) para evitar
      // que este mismo interceptor se vuelva a disparar sobre el refresh.
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) throw new Error("No refresh token available");

      const refreshResponse = await axios.post(urls.refresh, {
        refresh,
      });

      const newAccessToken = refreshResponse.data.access;
      localStorage.setItem("access_token", newAccessToken);

      // SimpleJWT con rotación devuelve un nuevo refresh token en cada llamada
      if (refreshResponse.data.refresh) {
        localStorage.setItem("refresh_token", refreshResponse.data.refresh);
      }

      // Reintentar la petición original con el nuevo access token
      originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalConfig);
    } catch (refreshError) {
      // El refresh falló (token expirado, rotado o inválido): cerrar sesión
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // Guardar la ruta actual para redirigir al usuario tras el re-login,
      // pero nunca guardar /login para evitar bucles de redirección.
      const currentPath = window.location.pathname + window.location.search;
      if (!currentPath.startsWith("/login")) {
        localStorage.setItem("redirect_after_login", currentPath);
      }

      // Señal para que la página de login muestre el aviso de sesión expirada
      localStorage.setItem("session_expired", "1");

      // Redirección dura para cancelar todas las peticiones en vuelo
      window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  }
);

export default api;
