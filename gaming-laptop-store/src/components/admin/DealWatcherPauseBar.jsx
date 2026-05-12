import React, { useEffect, useState, useCallback } from "react";
import { Pause, Play } from "lucide-react";

import {
  getGlobalPauseStatus,
  createGlobalPause,
  liftGlobalPause,
} from "../../services/DealWatcherService";

const PRESETS = [
  { label: "30 min", minutes: 30 },
  { label: "1 h", minutes: 60 },
  { label: "3 h", minutes: 180 },
  { label: "12 h", minutes: 720 },
  { label: "1 día", minutes: 1440 },
  { label: "Indefinido", minutes: null },
];

/**
 * Embeddable bar that shows the global Deal Watcher pause state and lets the
 * operator pause / resume notifications. Drop it at the top of any admin page
 * inside the deal_watcher area.
 */
const DealWatcherPauseBar = () => {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getGlobalPauseStatus();
      setStatus(data);
      setError(null);
    } catch (e) {
      console.error("No se pudo leer el estado de pausa:", e);
      setError("No se pudo leer el estado de pausa.");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handlePause = async (minutes) => {
    setBusy(true);
    try {
      await createGlobalPause(minutes != null ? { durationMinutes: minutes } : {});
      await refresh();
    } catch (e) {
      console.error("Error creando pausa:", e);
      setError("No se pudo crear la pausa.");
    } finally {
      setBusy(false);
    }
  };

  const handleResume = async () => {
    setBusy(true);
    try {
      await liftGlobalPause();
      await refresh();
    } catch (e) {
      console.error("Error levantando pausa:", e);
      setError("No se pudo levantar la pausa.");
    } finally {
      setBusy(false);
    }
  };

  const baseStyle = {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid",
    marginBottom: 16,
  };

  const buttonStyle = (variant = "default") => ({
    background: variant === "primary" ? "#0A1628" : "#fff",
    color: variant === "primary" ? "#fff" : "#0A1628",
    border: "1px solid #0A1628",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 13,
    cursor: busy ? "not-allowed" : "pointer",
    opacity: busy ? 0.6 : 1,
  });

  if (status === null) {
    return (
      <div style={{ ...baseStyle, borderColor: "#e2e8f0", background: "#f8fafc", color: "#94a3b8" }}>
        Cargando estado de Deal Watcher…
      </div>
    );
  }

  if (status.is_paused) {
    const until = status.paused_until
      ? new Date(status.paused_until).toLocaleString("es-CO")
      : "indefinido";
    return (
      <div
        style={{
          ...baseStyle,
          borderColor: "#fecaca",
          background: "#fef2f2",
          color: "#991b1b",
        }}
      >
        <Pause size={18} />
        <strong>Notificaciones pausadas</strong>
        <span>(hasta {until})</span>
        {status.reason && <span style={{ color: "#7f1d1d" }}>· motivo: {status.reason}</span>}
        <span style={{ marginLeft: "auto" }}>
          <button
            type="button"
            onClick={handleResume}
            disabled={busy}
            style={buttonStyle("primary")}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Play size={14} /> Reanudar
            </span>
          </button>
        </span>
        {error && <div style={{ flex: "1 0 100%", color: "#dc2626", fontSize: 12 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div
      style={{
        ...baseStyle,
        borderColor: "#bbf7d0",
        background: "#f0fdf4",
        color: "#166534",
      }}
    >
      <Play size={18} />
      <strong>Notificaciones activas</strong>
      <span style={{ color: "#475569" }}>· Pausar:</span>
      {PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => handlePause(p.minutes)}
          disabled={busy}
          style={buttonStyle()}
          title={p.minutes ? `Pausar durante ${p.label}` : "Pausar hasta cancelar"}
        >
          {p.label}
        </button>
      ))}
      {error && <div style={{ flex: "1 0 100%", color: "#dc2626", fontSize: 12 }}>{error}</div>}
    </div>
  );
};

export default DealWatcherPauseBar;
