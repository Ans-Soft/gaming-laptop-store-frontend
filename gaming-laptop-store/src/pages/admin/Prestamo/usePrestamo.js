// Hooks de react-query para el Control de Préstamo.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getResumen,
  getProyeccion,
  getMovimientos,
  createMovimiento,
  updateMovimiento,
  deleteMovimiento,
  getAuditoria,
  getPagoRegularPreview,
  registrarPagoRegular,
} from "../../../services/PrestamoService";

const KEYS = {
  resumen: ["prestamo", "resumen"],
  proyeccion: ["prestamo", "proyeccion"],
  movimientos: ["prestamo", "movimientos"],
  auditoria: ["prestamo", "auditoria"],
};

export function useResumen() {
  return useQuery({ queryKey: KEYS.resumen, queryFn: getResumen });
}

export function useProyeccion() {
  return useQuery({ queryKey: KEYS.proyeccion, queryFn: getProyeccion });
}

export function useMovimientos(params = {}) {
  return useQuery({
    queryKey: [...KEYS.movimientos, params],
    queryFn: () => getMovimientos(params),
  });
}

export function useAuditoria() {
  return useQuery({ queryKey: KEYS.auditoria, queryFn: getAuditoria });
}

// Tras cualquier mutación el motor recalcula: invalidamos todo lo derivado.
function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["prestamo"] });
  };
}

export function useCreateMovimiento() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: createMovimiento, onSuccess: invalidate });
}

export function useUpdateMovimiento() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, payload }) => updateMovimiento(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteMovimiento() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: deleteMovimiento, onSuccess: invalidate });
}

export function usePagoRegularPreview(enabled = true) {
  return useQuery({
    queryKey: ["prestamo", "pago-regular-preview"],
    queryFn: () => getPagoRegularPreview(),
    enabled,
    staleTime: 0,
  });
}

export function useRegistrarPagoRegular() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (args) => registrarPagoRegular(args),
    onSuccess: invalidate,
  });
}
