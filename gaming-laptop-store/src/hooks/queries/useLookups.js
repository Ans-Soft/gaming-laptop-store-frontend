import { useQuery } from "@tanstack/react-query";
import api from "../../services/Api";
import urls from "../../services/Urls";

const fetcher = (url) => api.get(url).then((r) => r.data);

export function useBrands() {
  return useQuery({
    queryKey: ["lookups", "brands"],
    queryFn: () => fetcher(urls.brandsList),
    staleTime: 1000 * 60 * 10,
  });
}

export function useTiposProducto() {
  return useQuery({
    queryKey: ["lookups", "tipos-producto"],
    queryFn: () => fetcher(urls.productTypesList),
    staleTime: 1000 * 60 * 10,
  });
}

export function useDepartamentos() {
  return useQuery({
    queryKey: ["lookups", "departamentos"],
    queryFn: () => fetcher(urls.departamentosList),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCiudades(departamentoId) {
  return useQuery({
    queryKey: ["lookups", "ciudades", departamentoId ?? "all"],
    queryFn: () =>
      fetcher(
        departamentoId
          ? `${urls.ciudadesList}?departamento_id=${departamentoId}`
          : urls.ciudadesList
      ),
    staleTime: 1000 * 60 * 10,
  });
}

export function useTRMList(limit = 30) {
  return useQuery({
    queryKey: ["lookups", "trm", limit],
    queryFn: () => fetcher(`${urls.trmList}?limit=${limit}`),
    staleTime: 1000 * 60 * 30,
  });
}

export function useUnidades() {
  return useQuery({
    queryKey: ["lookups", "unidades"],
    queryFn: () => fetcher(urls.unidadesList),
    staleTime: 1000 * 60 * 5,
  });
}
