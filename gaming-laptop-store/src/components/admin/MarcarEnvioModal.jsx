import { useEffect, useState } from "react";
import { Truck, Store, X } from "lucide-react";
import "../../styles/admin/cargueMasivo.css";

const TIPO_OPTIONS = [
  { value: "envio", label: "Envío con transportadora", icon: Truck },
  { value: "local", label: "Entrega en oficina (sin tracking)", icon: Store },
];

/**
 * Modal to register or update shipment info on a Venta.
 * - "envio"  → carrier + tracking number required
 * - "local"  → no tracking; the venta is marked as in-store pickup
 *
 * Submits via onSubmit({ tipo_entrega, transportadora, numero_guia }).
 */
export default function MarcarEnvioModal({ venta, onClose, onSubmit }) {
  const [tipo, setTipo] = useState(venta.tipo_entrega || "envio");
  const [transportadora, setTransportadora] = useState(venta.transportadora || "");
  const [numeroGuia, setNumeroGuia] = useState(venta.numero_guia || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tipo === "local") {
      // Switching to in-store pickup wipes shipment fields locally — actual
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

    const payload = {
      tipo_entrega: tipo,
      transportadora: tipo === "envio" ? transportadora.trim() : "",
      numero_guia: tipo === "envio" ? numeroGuia.trim() : "",
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err?.message || "No se pudo guardar el envío.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cm-modal-backdrop" onClick={onClose}>
      <div className="cm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <header className="cm-modal-header">
          <div>
            <h3>Marcar envío</h3>
            <p className="cm-modal-sub">Venta #{venta.id} — {venta.cliente_nombre}</p>
          </div>
          <button className="cm-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="cm-modal-body" style={{ display: "flex", flexDirection: "column", gap: "0.95rem" }}>
            <div>
              <label className="me-label">Tipo de entrega</label>
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
                  <input
                    id="me-transportadora"
                    type="text"
                    className="cm-cell-input"
                    placeholder="Ej. Servientrega, Coordinadora..."
                    value={transportadora}
                    onChange={(e) => setTransportadora(e.target.value)}
                  />
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
            <button type="submit" className="cm-btn cm-btn-primary" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
