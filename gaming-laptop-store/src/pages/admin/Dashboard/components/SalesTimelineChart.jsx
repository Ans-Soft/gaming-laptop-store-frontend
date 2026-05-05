import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCOP, formatCOPCompact } from '../formatters';
import './SalesTimelineChart.css';

// Brand-aligned palette.
const COLOR_ACTUAL = '#2979C8'; // primary-color
const COLOR_PREV = '#8AA1B8';   // muted neutral

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="st-tooltip">
      <div className="st-tooltip-day">Día {label}</div>
      {payload
        .filter((p) => p.dataKey === 'actual' || p.dataKey === 'anterior')
        .map((p) => (
          <div key={p.dataKey} className="st-tooltip-row">
            <span
              className={`st-tooltip-dot ${p.dataKey === 'anterior' ? 'st-tooltip-dot--dashed' : ''}`}
              style={{ borderColor: p.dataKey === 'actual' ? COLOR_ACTUAL : COLOR_PREV }}
            />
            <span className="st-tooltip-label">
              {p.dataKey === 'actual' ? 'Mes actual' : 'Mes anterior'}
            </span>
            <span className="st-tooltip-value">{formatCOP(p.value)}</span>
          </div>
        ))}
    </div>
  );
}

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.results)) return v.results;
  return [];
}

function mergeSeries(actual, anterior) {
  const map = new Map();
  asArray(actual).forEach((d) => map.set(d.dia, { dia: d.dia, actual: Number(d.valor) || 0 }));
  asArray(anterior).forEach((d) => {
    const cur = map.get(d.dia) || { dia: d.dia, actual: 0 };
    cur.anterior = Number(d.valor) || 0;
    map.set(d.dia, cur);
  });
  return [...map.values()].sort((a, b) => a.dia - b.dia);
}

export default function SalesTimelineChart({
  actual = [],
  anterior = [],
  isLoading = false,
  isError = false,
  onRetry,
}) {
  const data = mergeSeries(actual, anterior);

  return (
    <div className="st-card">
      <div className="st-header">
        <h3 className="st-title">Ventas — comparativa con mes anterior</h3>
        <div className="st-legend">
          <span className="st-legend-item">
            <span className="st-line st-line--solid" /> Mes actual
          </span>
          <span className="st-legend-item">
            <span className="st-line st-line--dashed" /> Mes anterior
          </span>
        </div>
      </div>

      <div className="st-body">
        {isLoading ? (
          <div className="st-skeleton" />
        ) : isError ? (
          <div className="st-empty">
            <span className="st-empty-text st-empty-text--danger">Error al cargar</span>
            {onRetry && (
              <button type="button" className="st-retry" onClick={onRetry}>
                Reintentar
              </button>
            )}
          </div>
        ) : data.length === 0 ? (
          <div className="st-empty">
            <span className="st-empty-text">Sin datos del mes</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 24, bottom: 6, left: 8 }}>
              <defs>
                <linearGradient id="st-actual-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_ACTUAL} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={COLOR_ACTUAL} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,22,40,0.06)" vertical={false} />
              <XAxis
                dataKey="dia"
                tick={{ fontSize: 11, fill: '#4A6580' }}
                interval={4}
                tickLine={false}
                axisLine={{ stroke: 'rgba(10,22,40,0.08)' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#4A6580' }}
                tickFormatter={formatCOPCompact}
                tickLine={false}
                axisLine={{ stroke: 'rgba(10,22,40,0.08)' }}
                width={56}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(10,22,40,0.12)' }} />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="none"
                fill="url(#st-actual-fill)"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="anterior"
                stroke={COLOR_PREV}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke={COLOR_ACTUAL}
                strokeWidth={2}
                dot={{ r: 2.5, fill: COLOR_ACTUAL, stroke: '#fff', strokeWidth: 1 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
