import axios from 'axios';
import urls from "./Urls";

const api = axios.create({
  baseURL: urls.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;