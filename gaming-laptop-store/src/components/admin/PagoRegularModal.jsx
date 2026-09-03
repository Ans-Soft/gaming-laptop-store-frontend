import React, { useState } from "react";
import { CalendarCheck, User, UserCog, Percent } from "lucide-react";
import ModalBase from "./ModalBase";
import {
  usePagoRegularPreview,
  useRegistrarPagoRegular,
  useResumen,
} from "../../pages/admin/Prestamo/usePrestamo";
import { formatCOP2 } from "../../pages/admin/Prestamo/prestamoUtils";
import { uploadComprobante } from "../../services/PrestamoService";

/**
 * Registra de una sola vez las 3 líneas del corte del día 11:
 *  - cuota del amigo al préstamo
 *  - cuota del dueño al préstamo
 *  - 2% que el amigo paga al dueño
 * Los montos los calcula el motor para el período vigente.
 */
const PagoRegularModal = ({ onClose }) => {
  const { data: resumen } = useResumen();
  const plazo = resumen?.plazo || 12;

  const [mesSeleccionado, setMesSeleccionado] = useState(null);
  const { data: preview, isLoading, isError } = usePagoRegularPreview(true, mesSeleccionado);
  const mut = useRegistrarPagoRegular();
  const [error, setError] = useState(null);
  const [comprobanteUrl, setComprobanteUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const mesEfectivo = mesSeleccionado ?? preview?.mes;
  const yaPagado = preview?.ya_pagado;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadComprobante(file);
      setComprobanteUrl(url);
    } catch (err) {
      console.error("Error subiendo comprobante:", err);
      setError("No se pudo subir el comprobante.");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      await mut.mutateAsync({ mes: mesEfectivo, comprobanteUrl });
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "No se pudo registrar el pago regular.");
    }
  };

  const lineas = preview
    ? [
        {
          icon: <User size={16} />,
          label: "Cuota del amigo → préstamo",
          valor: preview.cuota_amigo,
        },
        {
          icon: <UserCog size={16} />,
          label: "Tu cuota → préstamo",
          valor: preview.cuota_dueno,
        },
        {
          icon: <Percent size={16} />,
          label: "Comisión 2% del amigo → a ti",
          valor: preview.comision_2pct,
        },
      ]
    : [];

  const fechaTxt = preview?.fecha
    ? new Date(preview.fecha + "T00:00:00").toLocaleDateString("es-CO")
    : "";

  return (
    <ModalBase
      title="Realizar pago regular"
      icon={<CalendarCheck size={20} />}
      onClose={onClose}
      onSubmit={!isLoading && !yaPagado && !isError ? handleConfirm : undefined}
      isSubmitting={mut.isPending || uploading}
      submitLabel="Confirmar pago"
      subtitle={
        preview && preview.configurado !== false
          ? `Corte del mes ${preview.mes} · ${fechaTxt}`
          : undefined
      }
    >
      {isLoading && <p className="pr-muted">Calculando montos del corte…</p>}

      {isError && (
        <p className="pr-error">No se pudo cargar el pago regular.</p>
      )}

      {preview && preview.configurado === false && (
        <p className="pr-muted">Aún no hay configuración del préstamo.</p>
      )}

      {preview && preview.configurado !== false && (
        <>
          <label className="pr-field">
            <span>Mes a registrar</span>
            <select
              value={mesEfectivo || ""}
              onChange={(e) => { setMesSeleccionado(Number(e.target.value)); setError(null); }}
              style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid var(--border, #d1d5db)" }}
            >
              {Array.from({ length: plazo }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Mes {m}</option>
              ))}
            </select>
          </label>

          {yaPagado && (
            <div className="pr-notice pr-notice--warn">
              El pago regular del mes {mesEfectivo} ya fue registrado.
            </div>
          )}

          <ul className="pr-pago-list">
            {lineas.map((l, i) => (
              <li key={i} className="pr-pago-row">
                <span className="pr-pago-label">{l.icon} {l.label}</span>
                <span className="pr-pago-val">{formatCOP2(l.valor)}</span>
              </li>
            ))}
            <li className="pr-pago-row pr-pago-row--total">
              <span className="pr-pago-label">Total del corte</span>
              <span className="pr-pago-val">{formatCOP2(preview.total)}</span>
            </li>
          </ul>

          {!yaPagado && (
            <label className="pr-field pr-field--full" style={{ marginTop: "0.5rem" }}>
              <span>Comprobante (opcional)</span>
              <input type="file" onChange={handleFile} disabled={uploading} />
              {uploading && <small className="pr-hint">Subiendo…</small>}
              {comprobanteUrl && (
                <a href={comprobanteUrl} target="_blank" rel="noreferrer" className="pr-link">
                  Ver comprobante adjunto
                </a>
              )}
            </label>
          )}

          {!yaPagado && (
            <p className="pr-hint">
              Se crearán 3 movimientos para el mes {mesEfectivo} con fecha {fechaTxt}
              {comprobanteUrl ? ", con el comprobante adjunto" : ""}. Los abonos
              adicionales se registran aparte.
            </p>
          )}
        </>
      )}

      {error && <p className="pr-error">{error}</p>}
    </ModalBase>
  );
};

export default PagoRegularModal;
