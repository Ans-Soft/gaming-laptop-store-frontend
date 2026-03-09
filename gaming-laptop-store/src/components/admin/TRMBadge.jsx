import React, { useEffect, useState } from "react";
import { getTodayTRM } from "../../services/TRMService";
import "../../styles/admin/trmBadge.css";

const SOURCE_LABELS = {
  "trm-colombia-api": "API TRM Colombia",
  "banco-republica": "Banco de la República",
  "fallback-ultimo-valor": "Último valor conocido",
};

/**
 * Formatea un valor TRM como moneda colombiana sin decimales.
 * Ej: 4250.75 -> "$4,251"
 */
function formatTRM(value) {
  const num = parseFloat(value);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Formatea un timestamp ISO a fecha/hora legible en zona Bogotá.
 * Ej: "2026-03-07T14:30:00Z" -> "07/03/2026 09:30"
 */
function formatFetchedAt(isoString) {
  if (!isoString) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

export default function TRMBadge() {
  const [trm, setTrm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchTRM = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await getTodayTRM();
        if (!cancelled) {
          setTrm(data);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTRM();

    return () => {
      cancelled = true;
    };
  }, []);

  // Estado de carga — skeleton
  if (loading) {
    return <div className="trm-skeleton" role="status" aria-label="Cargando TRM..." />;
  }

  // Estado de error — no hay TRM disponible
  if (error || !trm) {
    return (
      <div className="trm-wrapper">
        <div className="trm-badge trm-badge--error" role="alert" aria-live="polite">
          <svg
            className="trm-badge__alert-icon"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          TRM no disponible
        </div>
        <div className="trm-tooltip" role="tooltip">
          <div className="trm-tooltip__row">
            <span className="trm-tooltip__label">Estado</span>
            <span className="trm-tooltip__value" style={{ color: "#f87171" }}>
              No se pudo obtener
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Estado normal — TRM disponible
  const sourceLabel = SOURCE_LABELS[trm.source] || trm.source;
  const formattedValue = formatTRM(trm.value);
  const formattedDate = new Date(trm.date + "T00:00:00").toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedFetchedAt = formatFetchedAt(trm.fetched_at);

  const isFallback = trm.source === "fallback-ultimo-valor";

  return (
    <div className="trm-wrapper">
      <div
        className={`trm-badge${isFallback ? " trm-badge--error" : ""}`}
        aria-label={`TRM hoy: ${formattedValue} por dólar`}
      >
        TRM hoy: {formattedValue}
      </div>

      <div className="trm-tooltip" role="tooltip">
        <div className="trm-tooltip__row">
          <span className="trm-tooltip__label">Fecha</span>
          <span className="trm-tooltip__value">{formattedDate}</span>
        </div>
        <div className="trm-tooltip__row">
          <span className="trm-tooltip__label">Valor</span>
          <span className="trm-tooltip__value">{formattedValue} / USD</span>
        </div>
        <hr className="trm-tooltip__divider" />
        <div className="trm-tooltip__row">
          <span className="trm-tooltip__label">Fuente</span>
          <span className="trm-tooltip__value">{sourceLabel}</span>
        </div>
        <div className="trm-tooltip__row">
          <span className="trm-tooltip__label">Actualizado</span>
          <span className="trm-tooltip__value">{formattedFetchedAt}</span>
        </div>
        {isFallback && (
          <>
            <hr className="trm-tooltip__divider" />
            <div className="trm-tooltip__row" style={{ color: "#fbbf24" }}>
              <span style={{ fontSize: "0.75rem" }}>
                Usando último valor conocido. APIs externas no disponibles.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
