// Formatters local to the Dashboard. If duplication with the inline formatCOP
// in admin/* components becomes painful, migrate to src/utils/format.js.

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const MONTH_FORMAT = new Intl.DateTimeFormat('es-CO', {
  month: 'long',
  year: 'numeric',
});

const SHORT_MONTH_FORMAT = new Intl.DateTimeFormat('es-CO', {
  month: 'short',
});

export function formatCOP(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return COP.format(Number(value));
}

export function formatCOPCompact(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function formatPct(value) {
  if (value == null) return '—';
  const sign = value > 0 ? '▲' : value < 0 ? '▼' : '';
  return `${sign} ${Math.abs(value).toFixed(0)}%`;
}

export function formatDays(value) {
  if (value == null) return '—';
  return `${value} día${value === 1 ? '' : 's'}`;
}

// Color bands for the reservations dot — matches the spec.
export function getReservaColor(dias) {
  if (dias <= 15) return '#639922';
  if (dias <= 25) return '#EF9F27';
  return '#E24B4A';
}

// "octubre 2026" → "Octubre 2026"
export function formatMonthEs(monthStr) {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-').map(Number);
  if (!y || !m) return monthStr;
  const d = new Date(y, m - 1, 1);
  const raw = MONTH_FORMAT.format(d);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

// "2026-04" → "Abr"
export function formatShortMonthEs(monthStr) {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-').map(Number);
  if (!y || !m) return monthStr;
  const d = new Date(y, m - 1, 1);
  const raw = SHORT_MONTH_FORMAT.format(d).replace('.', '');
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

// Helpers to navigate months in YYYY-MM strings.
export function shiftMonth(monthStr, delta) {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yy}-${mm}`;
}

export function currentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function isFutureMonth(monthStr) {
  return monthStr > currentMonthStr();
}
