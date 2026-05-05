import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './StatusDonut.css';

export default function StatusDonut({
  title,
  data = [],
  centerValue,
  centerLabel,
  isLoading = false,
  isError = false,
  onRetry,
}) {
  const total = data.reduce((acc, d) => acc + (d.value || 0), 0);
  const empty = total === 0;

  return (
    <div className="sd-card">
      <h3 className="sd-title">{title}</h3>
      <div className="sd-body">
        <div className="sd-chart-wrap">
          {isLoading ? (
            <div className="sd-skeleton" aria-busy="true" />
          ) : isError ? (
            <div className="sd-empty">
              <span className="sd-empty-text sd-empty-text--danger">Error al cargar</span>
              {onRetry && (
                <button type="button" className="sd-retry" onClick={onRetry}>
                  Reintentar
                </button>
              )}
            </div>
          ) : empty ? (
            <div className="sd-empty">
              <span className="sd-empty-text">Sin datos del mes</span>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={52}
                    outerRadius={70}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {data.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      background: '#fff',
                      border: '0.5px solid rgba(10,22,40,0.10)',
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="sd-center" aria-hidden="true">
                <span className="sd-center-value">{centerValue ?? total}</span>
                {centerLabel && <span className="sd-center-label">{centerLabel}</span>}
              </div>
            </>
          )}
        </div>

        {!isLoading && !isError && (
          <ul className="sd-legend">
            {data.map((d, i) => (
              <li key={i} className="sd-legend-item">
                <span className="sd-dot" style={{ background: d.color }} />
                <span className="sd-legend-label">{d.label}</span>
                <span className="sd-legend-value">{d.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
