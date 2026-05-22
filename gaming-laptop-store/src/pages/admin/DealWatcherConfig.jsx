import React, { useEffect, useState, useCallback } from "react";
import { Timer, Save, RefreshCw } from "lucide-react";

import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";

import TitleCrud from "../../components/admin/TitleCrud";
import DealWatcherPauseBar from "../../components/admin/DealWatcherPauseBar";

import {
  getNotificadorConfig,
  updateNotificadorConfig,
  getNotificadorStatus,
} from "../../services/DealWatcherService";

// "07:00:00" -> "07:00" (lo que espera <input type="time">)
const toHHMM = (t) => (t ? String(t).slice(0, 5) : "");

const EMPTY_FORM = {
  hora_inicio_activa: "07:00",
  hora_fin_activa: "01:00",
  llamados_diarios_objetivo: 5000,
  reserva_otros_llamados: 200,
  active: true,
};

const DealWatcherConfig = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [savedOk, setSavedOk] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const s = await getNotificadorStatus();
      setStatus(s);
    } catch (e) {
      console.error("No se pudo leer el estado del notificador:", e);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const cfg = await getNotificadorConfig();
      setForm({
        hora_inicio_activa: toHHMM(cfg.hora_inicio_activa),
        hora_fin_activa: toHHMM(cfg.hora_fin_activa),
        llamados_diarios_objetivo: cfg.llamados_diarios_objetivo,
        reserva_otros_llamados: cfg.reserva_otros_llamados,
        active: cfg.active,
      });
      await loadStatus();
    } catch (e) {
      console.error("No se pudo cargar la configuración:", e);
      setSubmitError("No se pudo cargar la configuración del notificador.");
    } finally {
      setLoading(false);
    }
  }, [loadStatus]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSavedOk(false);
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSavedOk(false);
    try {
      const payload = {
        hora_inicio_activa: form.hora_inicio_activa,
        hora_fin_activa: form.hora_fin_activa,
        llamados_diarios_objetivo: Number(form.llamados_diarios_objetivo),
        reserva_otros_llamados: Number(form.reserva_otros_llamados),
        active: form.active,
      };
      const cfg = await updateNotificadorConfig(payload);
      setForm({
        hora_inicio_activa: toHHMM(cfg.hora_inicio_activa),
        hora_fin_activa: toHHMM(cfg.hora_fin_activa),
        llamados_diarios_objetivo: cfg.llamados_diarios_objetivo,
        reserva_otros_llamados: cfg.reserva_otros_llamados,
        active: cfg.active,
      });
      setSavedOk(true);
      await loadStatus();
    } catch (error) {
      console.error("Error al guardar la configuración:", error);
      const data = error.response?.data;
      let msg = "Ocurrió un error inesperado.";
      if (data?.message) msg = data.message;
      else if (typeof data === "object" && data) {
        msg = Object.values(data).flat().join(" ");
      }
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <div className="table-container">
        <DealWatcherPauseBar />
        <TitleCrud
          title="Configuración del Notificador"
          icon={Timer}
          description="Franja horaria activa (hora Colombia) y presupuesto diario de llamadas a eBay. El notificador reparte las llamadas de forma pareja dentro de la franja."
        />

        {status && <StatusPanel status={status} onRefresh={loadStatus} />}

        <form onSubmit={handleSubmit} style={{ maxWidth: 720, marginTop: 16 }}>
          {submitError && <div className="form-error-banner">{submitError}</div>}
          {savedOk && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 14,
                fontSize: 14,
              }}
            >
              ✅ Configuración guardada.
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="hora_inicio_activa">
                Inicio de franja activa <span className="required">*</span>
              </label>
              <input
                id="hora_inicio_activa"
                name="hora_inicio_activa"
                type="time"
                value={form.hora_inicio_activa}
                onChange={handleChange}
                disabled={isSubmitting || loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hora_fin_activa">
                Fin de franja activa <span className="required">*</span>
              </label>
              <input
                id="hora_fin_activa"
                name="hora_fin_activa"
                type="time"
                value={form.hora_fin_activa}
                onChange={handleChange}
                disabled={isSubmitting || loading}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <small style={{ color: "#64748b" }}>
                Hora Colombia. Puede cruzar medianoche (ej. 07:00 → 01:00 = activo todo
                el día excepto de 1 a 7 a.m.). Fuera de la franja no se hacen consultas.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="llamados_diarios_objetivo">
                Presupuesto diario (llamadas eBay) <span className="required">*</span>
              </label>
              <input
                id="llamados_diarios_objetivo"
                name="llamados_diarios_objetivo"
                type="number"
                min="1"
                max="5000"
                step="1"
                value={form.llamados_diarios_objetivo}
                onChange={handleChange}
                disabled={isSubmitting || loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reserva_otros_llamados">
                Reserva para otras tareas <span className="required">*</span>
              </label>
              <input
                id="reserva_otros_llamados"
                name="reserva_otros_llamados"
                type="number"
                min="0"
                step="1"
                value={form.reserva_otros_llamados}
                onChange={handleChange}
                disabled={isSubmitting || loading}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <small style={{ color: "#64748b" }}>
                Tope de eBay: 5000/día. La reserva se descuenta del presupuesto para
                dejar cuota a la tarea de precios Bajo Pedido (también consume eBay).
              </small>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label
                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              >
                <input
                  name="active"
                  type="checkbox"
                  checked={form.active}
                  onChange={handleChange}
                  disabled={isSubmitting || loading}
                  style={{ width: "auto" }}
                />
                Notificador habilitado
              </label>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              style={{
                background: "#0A1628",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 18px",
                fontSize: 14,
                cursor: isSubmitting || loading ? "not-allowed" : "pointer",
                opacity: isSubmitting || loading ? 0.6 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Save size={16} /> {isSubmitting ? "Guardando…" : "Guardar configuración"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

// --- Panel "Estado en vivo" -------------------------------------------------

const StatusPanel = ({ status, onRefresh }) => {
  const enabled = status.enabled;
  const within = status.within_window;

  let banner;
  if (!enabled) {
    banner = { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", text: "Notificador deshabilitado" };
  } else if (within) {
    banner = { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", text: "Dentro de la franja activa" };
  } else {
    banner = { bg: "#f8fafc", border: "#e2e8f0", color: "#475569", text: "Fuera de la franja (en pausa hasta el inicio)" };
  }

  const lastRun = status.last_run_at
    ? new Date(status.last_run_at).toLocaleString("es-CO")
    : "—";

  const items = [
    ["Franja", status.window_label],
    ["Período", status.period || "—"],
    ["Productos vigilados (N)", status.n_products],
    ["Presupuesto efectivo", `${status.effective_budget} / ${status.objetivo} (reserva ${status.reserva})`],
    ["Usado hoy", `${status.used} de ${Math.round(status.earned)} "ganado"`],
    ["Ciclos hoy", status.cycles_today],
    ["Última corrida", lastRun],
    [
      "Cadencia estimada",
      status.cadencia_efectiva_min != null
        ? `≈ ${status.cadencia_efectiva_min} min` +
          (status.cadencia_estimada_min < 5 ? " (piso cron 5 min)" : "")
        : "—",
    ],
  ];

  return (
    <div
      style={{
        border: `1px solid ${banner.border}`,
        background: banner.bg,
        borderRadius: 8,
        padding: "14px 16px",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <strong style={{ color: banner.color }}>{banner.text}</strong>
        <button
          type="button"
          onClick={onRefresh}
          title="Refrescar estado"
          style={{
            marginLeft: "auto",
            background: "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 12,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <RefreshCw size={13} /> Refrescar
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        {items.map(([label, value]) => (
          <div key={label} style={{ fontSize: 13 }}>
            <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 }}>
              {label}
            </div>
            <div style={{ color: "#0A1628", fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealWatcherConfig;
