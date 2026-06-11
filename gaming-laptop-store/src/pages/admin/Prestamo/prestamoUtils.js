// Utilidades compartidas de las pantallas de Préstamo.

/** Formatea un número/string a pesos colombianos sin decimales. */
export function formatCOP(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Formatea con 2 decimales (para montos exactos del préstamo). */
export function formatCOP2(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export const TIPO_LABELS = {
  cuota_amigo: "Cuota amigo",
  cuota_dueno: "Cuota dueño",
  abono_amigo: "Abono amigo",
  abono_dueno: "Abono dueño",
  comision_2pct: "Comisión 2%",
};

export const TIPO_OPTIONS = [
  { value: "abono_amigo", label: "Abono amigo" },
  { value: "abono_dueno", label: "Abono dueño" },
  { value: "cuota_amigo", label: "Cuota amigo" },
  { value: "cuota_dueno", label: "Cuota dueño" },
  { value: "comision_2pct", label: "Comisión 2%" },
];

/** Fecha de hoy en formato YYYY-MM-DD (zona local). */
export function hoyISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
