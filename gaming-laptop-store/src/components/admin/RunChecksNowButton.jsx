import React, { useState } from "react";
import { Zap, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

import { runChecksNow } from "../../services/DealWatcherService";

/**
 * Botón on-demand: dispara al instante la verificación de precios de todos
 * los productos (Bajo Pedido + Deal Watcher) y notifica por Telegram si hay
 * oferta. Es el mismo trabajo que hace el Railway Cron, pero manual — pensado
 * para pruebas.
 *
 * Incluye un toggle "modo prueba (sin notificar)" para correr la verificación
 * sin enviar notificaciones reales.
 *
 * Embebible: colócalo al inicio de cualquier página del área de Deal Watcher.
 */
const RunChecksNowButton = () => {
  const [busy, setBusy] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    if (busy) return;
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const data = await runChecksNow({ dryRun });
      setResult(data);
    } catch (e) {
      console.error("Error en verificación on-demand:", e);
      setError(
        e.response?.data?.message ||
          "No se pudo ejecutar la verificación. Revisa la conexión y vuelve a intentar."
      );
    } finally {
      setBusy(false);
    }
  };

  const barStyle = {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    marginBottom: 16,
  };

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#0A1628",
    color: "#fff",
    border: "1px solid #0A1628",
    borderRadius: 6,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: busy ? "not-allowed" : "pointer",
    opacity: busy ? 0.6 : 1,
  };

  return (
    <div style={barStyle}>
      <style>{"@keyframes rc-spin{to{transform:rotate(360deg)}}.rc-spin{animation:rc-spin 1s linear infinite}"}</style>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#0A1628" }}>
        <Zap size={18} />
        <strong>Verificación on-demand</strong>
      </span>
      <span style={{ color: "#64748b", fontSize: 13 }}>
        Revisa el precio de todos los productos ahora mismo y notifica si hay oferta.
      </span>

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: "#475569",
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={dryRun}
          disabled={busy}
          onChange={(e) => setDryRun(e.target.checked)}
        />
        Modo prueba (sin notificar)
      </label>

      <button
        type="button"
        onClick={handleRun}
        disabled={busy}
        style={{ ...buttonStyle, marginLeft: "auto" }}
      >
        {busy ? (
          <>
            <Loader2 size={14} className="rc-spin" /> Verificando…
          </>
        ) : (
          <>
            <Zap size={14} /> Verificar ahora
          </>
        )}
      </button>

      {error && (
        <div
          style={{
            flex: "1 0 100%",
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#dc2626",
            fontSize: 13,
          }}
        >
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {result && (
        <div
          style={{
            flex: "1 0 100%",
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            padding: "10px 12px",
            borderRadius: 6,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            fontSize: 13,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <CheckCircle2 size={14} /> {result.message}
          </span>

          {result.deal_watcher && (
            <span>
              Deal Watcher — vigilados: {result.deal_watcher.total} · notificados:{" "}
              <strong>{result.deal_watcher.notified}</strong> · omitidos:{" "}
              {result.deal_watcher.skipped} · errores: {result.deal_watcher.errors}
            </span>
          )}
          {result.deal_watcher_error && (
            <span style={{ color: "#dc2626" }}>
              Deal Watcher falló: {result.deal_watcher_error}
            </span>
          )}

          {result.bajo_pedido && (
            <span>
              Bajo Pedido — actualizados: <strong>{result.bajo_pedido.actualizado}</strong> ·
              errores: {result.bajo_pedido.errores} · omitidos: {result.bajo_pedido.salto}
            </span>
          )}
          {result.bajo_pedido_error && (
            <span style={{ color: "#dc2626" }}>
              Bajo Pedido falló: {result.bajo_pedido_error}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RunChecksNowButton;
