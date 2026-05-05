import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCOP, formatCOPCompact, formatShortMonthEs } from '../formatters';
import './ImportsExpensesChart.css';

// Brand-aligned palette (primary blue + lighter blue tint).
const COLOR_BASE = '#2979C8';
const COLOR_TAX = '#7ED4F7';

function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  const total = (row.valor_importacion || 0) + (row.impuesto || 0);
  return (
    <div className="ie-tooltip">
      <div className="ie-tooltip-month">{formatShortMonthEs(row.mes)} ({row.mes})</div>
      <div className="ie-tooltip-row">
        <span className="ie-tooltip-dot" style={{ background: COLOR_BASE }} />
        <span className="ie-tooltip-label">Importación</span>
        <span className="ie-tooltip-value">{formatCOP(row.valor_importacion)}</span>
      </div>
      <div className="ie-tooltip-row">
        <span className="ie-tooltip-dot" style={{ background: COLOR_TAX }} />
        <span className="ie-tooltip-label">Impuesto</span>
        <span className="ie-tooltip-value">{formatCOP(row.impuesto)}</span>
      </div>
      <div className="ie-tooltip-total">
        <span>Total</span>
        <span>{formatCOP(total)}</span>
      </div>
    </div>
  );
}

export default function ImportsExpensesChart({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}) {
  const list = Array.isArray(data) ? data : (data?.results ?? []);
  const rows = list.map((r) => ({
    ...r,
    valor_importacion: Number(r.valor_importacion) || 0,
    impuesto: Number(r.impuesto) || 0,
    label: formatShortMonthEs(r.mes),
  }));

  const allZero = rows.every((r) => r.valor_importacion === 0 && r.impuesto === 0);

  return (
    <div className="ie-card">
      <div className="ie-header">
        <h3 className="ie-title">Gastos de importación — últimos 6 meses</h3>
        <div className="ie-legend">
          <span className="ie-legend-item">
            <span className="ie-sq" style={{ background: COLOR_BASE }} /> Importación
          </span>
          <span className="ie-legend-item">
            <span className="ie-sq" style={{ background: COLOR_TAX }} /> Impuesto
          </span>
        </div>
      </div>

      <div className="ie-body">
        {isLoading ? (
          <div className="ie-skeleton" />
        ) : isError ? (
          <div className="ie-empty">
            <span className="ie-empty-text ie-empty-text--danger">Error al cargar</span>
            {onRetry && (
              <button type="button" className="ie-retry" onClick={onRetry}>
                Reintentar
              </button>
            )}
          </div>
        ) : rows.length === 0 || allZero ? (
          <div className="ie-empty">
            <span className="ie-empty-text">Sin datos en el período</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 10, right: 24, bottom: 10, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#6a6a66' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6a6a66' }}
                tickFormatter={formatCOPCompact}
                tickLine={false}
                axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
                width={56}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="valor_importacion" stackId="a" fill={COLOR_BASE} isAnimationActive={false} />
              <Bar dataKey="impuesto" stackId="a" fill={COLOR_TAX} isAnimationActive={false} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
