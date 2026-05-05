import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getVentas,
  getVentaDetail,
  createVenta,
  updateVenta,
  deleteVenta,
} from "../../services/VentaService";

export const ventasKeys = {
  all: ["ventas"],
  list: (filters) => [...ventasKeys.all, "list", filters ?? null],
  detail: (id) => [...ventasKeys.all, "detail", id],
};

export function useVentasList(filters) {
  return useQuery({
    queryKey: ventasKeys.list(filters),
    queryFn: () => getVentas(filters),
  });
}

export function useVentaDetail(id) {
  return useQuery({
    queryKey: ventasKeys.detail(id),
    queryFn: () => getVentaDetail(id),
    enabled: !!id,
  });
}

export function useCreateVenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createVenta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ventasKeys.all });
    },
  });
}

export function useUpdateVenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateVenta(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ventasKeys.all });
      qc.invalidateQueries({ queryKey: ventasKeys.detail(id) });
    },
  });
}

export function useDeleteVenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteVenta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ventasKeys.all });
    },
  });
}
