import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './KpiCard.css';

export default function KpiCard({
  label,
  value,
  subtitle,
  subtitleColor = 'muted', // 'success' | 'danger' | 'muted'
  to,
  arrow = true,
  isLoading = false,
  isError = false,
  isZero = false,
  onRetry,
}) {
  const Wrapper = to && !isError ? Link : 'div';
  const wrapperProps = to && !isError ? { to } : {};

  return (
    <Wrapper className={`kc-card ${to ? 'kc-card--linked' : ''}`} {...wrapperProps}>
      <div className="kc-header">
        <span className="kc-label">{label}</span>
        {arrow && to && !isError && (
          <ArrowUpRight size={14} className="kc-arrow" aria-hidden="true" />
        )}
      </div>

      {isLoading ? (
        <div className="kc-skeleton" />
      ) : isError ? (
        <span className="kc-value kc-value--error">—</span>
      ) : (
        <span className={`kc-value ${isZero ? 'kc-value--zero' : ''}`}>{value}</span>
      )}

      {isError ? (
        <div className="kc-error-row">
          <span className="kc-subtitle kc-subtitle--danger">Error al cargar</span>
          {onRetry && (
            <button
              type="button"
              className="kc-retry"
              onClick={(e) => {
                e.preventDefault();
                onRetry();
              }}
            >
              Reintentar
            </button>
          )}
        </div>
      ) : (
        // Only render subtitle when present — avoids visual noise from
        // repeated "Sin datos del mes anterior" placeholder strings.
        subtitle && (
          <span className={`kc-subtitle kc-subtitle--${subtitleColor}`}>
            {subtitle}
          </span>
        )
      )}
    </Wrapper>
  );
}
