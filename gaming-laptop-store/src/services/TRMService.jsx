import api from "./Api";
import urls from "./Urls";

export async function getTRM() {
  const response = await api.get(urls.trmList);
  return response.data;
}
