export const DATE_RANGE_PRESETS = [
  { value: "mes_actual", label: "Mes actual" },
  { value: "mes_anterior", label: "Mes anterior" },
  { value: "ultimos_7", label: "Últimos 7 días" },
  { value: "ultimos_30", label: "Últimos 30 días" },
  { value: "ultimos_90", label: "Últimos 90 días" },
  { value: "este_anio", label: "Este año" },
  { value: "personalizado", label: "Personalizado" },
];

const toYMD = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const computeDateRange = (preset) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (preset === "personalizado") return null;

  if (preset === "mes_actual") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toYMD(from), to: toYMD(today) };
  }

  if (preset === "mes_anterior") {
    const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const to = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from: toYMD(from), to: toYMD(to) };
  }

  if (preset === "ultimos_7") {
    const from = new Date(today);
    from.setDate(today.getDate() - 6);
    return { from: toYMD(from), to: toYMD(today) };
  }

  if (preset === "ultimos_30") {
    const from = new Date(today);
    from.setDate(today.getDate() - 29);
    return { from: toYMD(from), to: toYMD(today) };
  }

  if (preset === "ultimos_90") {
    const from = new Date(today);
    from.setDate(today.getDate() - 89);
    return { from: toYMD(from), to: toYMD(today) };
  }

  if (preset === "este_anio") {
    const from = new Date(today.getFullYear(), 0, 1);
    return { from: toYMD(from), to: toYMD(today) };
  }

  return null;
};

/**
 * Returns true if dateStr (ISO or YYYY-MM-DD) falls within [from, to] inclusive.
 * from/to are YYYY-MM-DD strings. Either can be "" / null to skip that bound.
 */
export const matchesDateRange = (dateStr, from, to) => {
  if (!dateStr) return true;
  const date = dateStr.substring(0, 10); // normalize to YYYY-MM-DD
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
};
