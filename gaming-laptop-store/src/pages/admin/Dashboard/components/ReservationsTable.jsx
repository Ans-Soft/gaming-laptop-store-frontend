import { getReservaColor } from '../formatters';
import './ReservationsTable.css';

export default function ReservationsTable({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}) {
  const rows = Array.isArray(data) ? data : (data?.results ?? []);
  return (
    <div className="rt-card">
      <div className="rt-header">
        <h3 className="rt-title">Reservas activas</h3>
        <ul className="rt-color-legend" aria-label="Leyenda de antigüedad">
          <li><span className="rt-dot" style={{ background: '#639922' }} /> 0–15 días</li>
          <li><span className="rt-dot" style={{ background: '#EF9F27' }} /> 16–25 días</li>
          <li><span className="rt-dot" style={{ background: '#E24B4A' }} /> 26+ días</li>
        </ul>
      </div>

      {isLoading ? (
        <div className="rt-skeleton">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rt-skeleton-row" />
          ))}
        </div>
      ) : isError ? (
        <div className="rt-empty">
          <span className="rt-empty-text rt-empty-text--danger">Error al cargar</span>
          {onRetry && (
            <button type="button" className="rt-retry" onClick={onRetry}>
              Reintentar
            </button>
          )}
        </div>
      ) : rows.length === 0 ? (
        <div className="rt-empty">
          <span className="rt-empty-text">No hay reservas activas</span>
        </div>
      ) : (
        <div className="rt-table-wrap">
          <table className="rt-table">
            <thead>
              <tr>
                <th className="rt-th">Tipo</th>
                <th className="rt-th">Serial</th>
                <th className="rt-th">Cliente</th>
                <th className="rt-th rt-th--right">Días</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={`${row.serial}-${i}`} className="rt-row">
                  <td className="rt-td">
                    <span
                      className="rt-tipo-dot"
                      style={{ background: getReservaColor(row.dias) }}
                      aria-hidden="true"
                    />
                    {row.tipo || '—'}
                  </td>
                  <td className="rt-td rt-td--mono">{row.serial || '—'}</td>
                  <td className="rt-td">{row.cliente || '—'}</td>
                  <td className="rt-td rt-td--right rt-td--bold">{row.dias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
