import api from "./Api";
import urls from "./Urls";

/**
 * Obtiene la TRM del día actual desde el backend.
 * @returns {Promise<{date, value, source, fetched_at}>}
 */
export const getTodayTRM = async () => {
  const response = await api.get(urls.trmToday);
  return response.data.trm;
};

/**
 * Obtiene la TRM para una fecha específica.
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {Promise<{date, value, source, fetched_at}>}
 */
export const getTRMByDate = async (date) => {
  const response = await api.get(urls.trmByDate(date));
  return response.data.trm;
};
