import api from "./Api";
import urls from "./Urls";

export async function getDepartamentos() {
  const response = await api.get(urls.departamentosList);
  return response.data;
}

export async function getCiudades(departamentoId = null) {
  const url = departamentoId
    ? `${urls.ciudadesList}?departamento_id=${departamentoId}`
    : urls.ciudadesList;
  const response = await api.get(url);
  return response.data;
}
