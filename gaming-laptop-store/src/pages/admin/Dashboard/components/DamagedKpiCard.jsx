import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './DamagedKpiCard.css';

// Repair palette: project's primary blue family.
const REPAIR_COLORS = { en_reparacion: '#2979C8', por_reparar: '#7ED4F7' };
// Origin palette: muted warning/error tones (not saturated red).
const ORIGIN_COLORS = { garantia: '#B45309', stock: '#FCD34D' };

function StackedBar({ segments, total }) {
  if (!total || total <= 0) {
    return <div className="dk-bar dk-bar--empty" aria-hidden="true" />;
  }
  return (
    <div className="dk-bar" role="img" aria-hidden="true">
      {segments.map((s, i) => (
        <div
          key={i}
          className="dk-bar-seg"
          style={{
            width: `${(s.value / total) * 100}%`,
            background: s.color,
          }}
        />
      ))}
    </div>
  );
}

function Legend({ items }) {
  return (
    <ul className="dk-legend">
      {items.map((it, i) => (
        <li key={i} className="dk-legend-item">
          <span className="dk-dot" style={{ background: it.color }} />
          <span className="dk-legend-label">{it.label}</span>
          <span className="dk-legend-count">{it.value}</span>
        </li>
      ))}
    </ul>
  );
}

export default function DamagedKpiCard({
  total = 0,
  estadoReparacion = { en_reparacion: 0, por_reparar: 0 },
  origenDano = { garantia: 0, stock: 0 },
  to,
  isLoading = false,
  isError = false,
  onRetry,
}) {
  const Wrapper = to && !isError ? Link : 'div';
  const wrapperProps = to && !isError ? { to } : {};

  const repairTotal =
    (estadoReparacion.en_reparacion || 0) + (estadoReparacion.por_reparar || 0);
  const originTotal = (origenDano.garantia || 0) + (origenDano.stock || 0);

  return (
    <Wrapper className={`dk-card ${to ? 'dk-card--linked' : ''}`} {...wrapperProps}>
      <div className="dk-header">
        <span className="dk-label">Equipos dañados</span>
        <div className="dk-header-right">
          {!isLoading && !isError && (
            <span className={`dk-total ${total === 0 ? 'dk-total--zero' : ''}`}>{total}</span>
          )}
          {to && !isError && (
            <ArrowUpRight size={14} className="dk-arrow" aria-hidden="true" />
          )}
        </div>
      </div>

      {isLoading && <div className="dk-skeleton" />}

      {isError && (
        <div className="dk-error">
          <span className="dk-error-text">Error al cargar</span>
          {onRetry && (
            <button
              type="button"
              className="dk-retry"
              onClick={(e) => { e.preventDefault(); onRetry(); }}
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="dk-section">
            <span className="dk-section-label">Estado de reparación</span>
            <StackedBar
              total={repairTotal}
              segments={[
                { value: estadoReparacion.en_reparacion || 0, color: REPAIR_COLORS.en_reparacion },
                { value: estadoReparacion.por_reparar || 0, color: REPAIR_COLORS.por_reparar },
              ]}
            />
            <Legend
              items={[
                {
                  label: 'En reparación',
                  value: estadoReparacion.en_reparacion || 0,
                  color: REPAIR_COLORS.en_reparacion,
                },
                {
                  label: 'Por reparar',
                  value: estadoReparacion.por_reparar || 0,
                  color: REPAIR_COLORS.por_reparar,
                },
              ]}
            />
          </div>

          <div className="dk-section">
            <span className="dk-section-label">Origen del daño</span>
            <StackedBar
              total={originTotal}
              segments={[
                { value: origenDano.garantia || 0, color: ORIGIN_COLORS.garantia },
                { value: origenDano.stock || 0, color: ORIGIN_COLORS.stock },
              ]}
            />
            <Legend
              items={[
                { label: 'Garantía', value: origenDano.garantia || 0, color: ORIGIN_COLORS.garantia },
                { label: 'Stock', value: origenDano.stock || 0, color: ORIGIN_COLORS.stock },
              ]}
            />
          </div>
        </>
      )}
    </Wrapper>
  );
}
