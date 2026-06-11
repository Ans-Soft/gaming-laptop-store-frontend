import React, { useState } from "react";
import { Wallet } from "lucide-react";
import ModalBase from "./ModalBase";
import { uploadComprobante } from "../../services/PrestamoService";
import { TIPO_OPTIONS, hoyISO } from "../../pages/admin/Prestamo/prestamoUtils";

/**
 * Formulario modal para crear/editar un movimiento del préstamo.
 * El `tramo` se deriva del tipo en el backend; aquí solo se elige el tipo.
 */
const MovimientoPrestamoForm = ({
  onClose,
  onSubmit,
  movimiento = null,
  isSubmitting = false,
  submitError = null,
}) => {
  // Al crear de forma eventual solo se permiten abonos (las cuotas y el 2% se
  // registran juntas con "Realizar pago regular"). Al editar se muestran todos
  // los tipos para no perder el del movimiento existente.
  const opciones = movimiento
    ? TIPO_OPTIONS
    : TIPO_OPTIONS.filter((o) => o.value.startsWith("abono_"));
  const [tipo, setTipo] = useState(movimiento?.tipo || "abono_amigo");
  const [monto, setMonto] = useState(movimiento?.monto || "");
  const [fecha, setFecha] = useState(movimiento?.fecha || hoyISO());
  const [nota, setNota] = useState(movimiento?.nota || "");
  const [comprobanteUrl, setComprobanteUrl] = useState(
    movimiento?.comprobante_url || ""
  );
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setLocalError(null);
    try {
      const url = await uploadComprobante(file);
      setComprobanteUrl(url);
    } catch (err) {
      console.error("Error subiendo comprobante:", err);
      setLocalError("No se pudo subir el comprobante.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    setLocalError(null);
    const montoNum = Number(monto);
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      setLocalError("El monto debe ser mayor que 0.");
      return;
    }
    if (!fecha) {
      setLocalError("La fecha es obligatoria.");
      return;
    }
    const payload = {
      tipo,
      monto: String(monto),
      fecha,
      nota,
      comprobante_url: comprobanteUrl,
    };
    onSubmit(payload, movimiento?.id);
  };

  return (
    <ModalBase
      title={movimiento ? "Editar movimiento" : "Registrar abono"}
      icon={<Wallet size={20} />}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting || uploading}
      submitLabel={movimiento ? "Guardar cambios" : "+ Registrar"}
    >
      <div className="pr-form-grid">
        <label className="pr-field">
          <span>Tipo de movimiento</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {opciones.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="pr-field">
          <span>Monto (COP)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0"
          />
        </label>

        <label className="pr-field">
          <span>Fecha</span>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>

        <label className="pr-field pr-field--full">
          <span>Nota (opcional)</span>
          <textarea
            rows={2}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Detalle del movimiento…"
          />
        </label>

        <label className="pr-field pr-field--full">
          <span>Comprobante (opcional)</span>
          <input type="file" onChange={handleFile} />
          {uploading && <small className="pr-hint">Subiendo…</small>}
          {comprobanteUrl && (
            <a
              href={comprobanteUrl}
              target="_blank"
              rel="noreferrer"
              className="pr-link"
            >
              Ver comprobante adjunto
            </a>
          )}
        </label>
      </div>

      {(localError || submitError) && (
        <p className="pr-error">{localError || submitError}</p>
      )}
    </ModalBase>
  );
};

export default MovimientoPrestamoForm;
