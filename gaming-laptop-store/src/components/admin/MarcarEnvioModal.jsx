import { useEffect, useState } from "react";
import { Truck, Store, X } from "lucide-react";
import "../../styles/admin/cargueMasivo.css";

const TIPO_OPTIONS = [
  { value: "envio", label: "Envío con transportadora", icon: Truck },
  { value: "local", label: "Entrega en oficina (sin tracking)", icon: Store },
];

// Canonical carrier list. The value is the slug we persist; label is what we
// show. Adding more carriers means: add an entry here AND wire the tracking
// URL in pages/admin/Ventas.jsx (CARRIER_TRACKING).
const TRANSPORTADORAS = [
  { value: "coordinadora", label: "Coordinadora" },
  { value: "interrapidisimo", label: "Interrapidísimo" },
];

/**
 * Modal to register a delivery on a Venta. The act of registering the
 * delivery itself implies estado_entrega='entregado' — the modal always
 * sends that flag and the backend stamps fecha_entrega + cascades to the
 * unidades. The user only chooses HOW the delivery happened:
 *   - 'envio' → carrier + tracking number required
 *   - 'local' → in-store pickup, no tracking
 */
export default function MarcarEnvioModal({ venta, onClose, onSubmit }) {
  const [tipo, setTipo] = useState(venta.tipo_entrega || "envio");
  const [transportadora, setTransportadora] = useState(venta.transportadora || "");
  const [numeroGuia, setNumeroGuia] = useState(venta.numero_guia || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tipo === "local") {
      // Switching to in-store pickup wipes shipment fields locally — the
      // payload below also empties them server-side.
      setTransportadora("");
      setNumeroGuia("");
    }
  }, [tipo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (tipo === "envio" && (!transportadora.trim() || !numeroGuia.trim())) {
      setError("Para envío con transportadora, transportadora y número de guía son obligatorios.");
      return;
    }

    // Registering the delivery always marks the sale as entregado. The
    // backend takes care of stamping fecha_entrega and cascading the unit
    // estado_producto to 'entregado'.
    const payload = {
      tipo_entrega: tipo,
      transportadora: tipo === "envio" ? transportadora.trim() : "",
      numero_guia: tipo === "envio" ? numeroGuia.trim() : "",
      estado_entrega: "entregado",
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err?.message || "No se pudo registrar la entrega.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cm-modal-backdrop" onClick={onClose}>
      <div className="cm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <header className="cm-modal-header">
          <div>
            <h3>Registrar entrega</h3>
            <p className="cm-modal-sub">Venta #{venta.id} — {venta.cliente_nombre}</p>
          </div>
          <button className="cm-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="cm-modal-body" style={{ display: "flex", flexDirection: "column", gap: "0.95rem" }}>
            <div>
              <label className="me-label">¿Cómo se entregó?</label>
              <div className="me-tipo-grid">
                {TIPO_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = tipo === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`me-tipo-card ${active ? "me-tipo-card--active" : ""}`}
                      onClick={() => setTipo(opt.value)}
                    >
                      <Icon size={18} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {tipo === "envio" && (
              <>
                <div>
                  <label className="me-label" htmlFor="me-transportadora">Transportadora</label>
                  <select
                    id="me-transportadora"
                    className="cm-cell-input"
                    value={transportadora}
                    onChange={(e) => setTransportadora(e.target.value)}
                  >
                    <option value="">Selecciona una transportadora...</option>
                    {TRANSPORTADORAS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="me-label" htmlFor="me-tracking">Número de guía</label>
                  <input
                    id="me-tracking"
                    type="text"
                    className="cm-cell-input"
                    placeholder="Ej. 1234567890"
                    value={numeroGuia}
                    onChange={(e) => setNumeroGuia(e.target.value)}
                  />
                </div>
              </>
            )}

            {error && <div className="cm-banner cm-banner-error">{error}</div>}
          </div>

          <footer className="cm-modal-footer">
            <button type="button" className="cm-btn cm-btn-secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="cm-btn cm-btn-success" disabled={submitting}>
              {submitting ? "Guardando..." : "Confirmar entrega"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
