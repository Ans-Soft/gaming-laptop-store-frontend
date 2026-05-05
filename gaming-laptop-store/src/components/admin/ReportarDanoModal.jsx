import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import ModalBase from "./ModalBase";
import NotifyModal from "./NotifyModal";
import * as ReparacionService from "../../services/ReparacionService";
import "../../styles/admin/reportarDanoModal.css";

const ORIGEN_LABELS = {
  stock: "Stock",
  venta: "Venta",
  separacion: "Separación",
  metodo_aliado: "Método Aliado",
};

const ReportarDanoModal = ({
  unidad,
  origen,
  clienteNombre,
  onClose,
  onSuccess,
}) => {
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notify, setNotify] = useState(null);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await ReparacionService.reportarDano(unidad.id, {
        descripcion_dano: descripcion.trim(),
      });
      onSuccess?.();
      onClose?.();
    } catch (error) {
      const data = error.response?.data;
      const msg =
        data?.error ||
        data?.detail ||
        "No se pudo reportar el daño. Intenta nuevamente.";
      setNotify({
        variant: "error",
        title: "Error al reportar daño",
        message: typeof msg === "object" ? JSON.stringify(msg) : msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ModalBase
        title="Reportar Equipo Dañado"
        icon={<AlertTriangle size={22} />}
        subtitle="La unidad pasará al flujo de reparación"
        onClose={onClose}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        submitLabel={submitting ? "Reportando..." : "Reportar Daño"}
      >
        <div className="rdm-summary">
          <div className="rdm-summary-row">
            <span className="rdm-summary-label">Serial</span>
            <span className="rdm-summary-value rdm-mono">
              {unidad?.serial || "—"}
            </span>
          </div>
          <div className="rdm-summary-row">
            <span className="rdm-summary-label">Producto</span>
            <span className="rdm-summary-value">
              {unidad?.producto_nombre || "—"}
            </span>
          </div>
          <div className="rdm-summary-row">
            <span className="rdm-summary-label">Origen</span>
            <span className={`rdm-origen-badge rdm-origen-${origen}`}>
              {ORIGEN_LABELS[origen] || origen}
            </span>
          </div>
          {clienteNombre && (
            <div className="rdm-summary-row">
              <span className="rdm-summary-label">Cliente</span>
              <span className="rdm-summary-value">{clienteNombre}</span>
            </div>
          )}
        </div>

        <div className="rdm-form-group">
          <label htmlFor="rdm-descripcion">Descripción del daño</label>
          <textarea
            id="rdm-descripcion"
            rows={4}
            placeholder="Describe el daño reportado (opcional pero recomendado)…"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        {origen === "venta" && (
          <p className="rdm-info">
            Al reportar el daño, la venta asociada volverá a estado{" "}
            <strong>Por Entregar</strong> hasta que la reparación se complete.
          </p>
        )}
        {origen === "separacion" && (
          <p className="rdm-info">
            La separación permanecerá activa. La unidad volverá a{" "}
            <strong>separada</strong> una vez termine la reparación.
          </p>
        )}
        {origen === "stock" && (
          <p className="rdm-info">
            La unidad saldrá del inventario disponible y volverá a{" "}
            <strong>stock</strong> cuando se complete la reparación.
          </p>
        )}
        {origen === "metodo_aliado" && (
          <p className="rdm-info">
            La solicitud de método aliado permanecerá activa. La unidad volverá
            a <strong>solicitud método aliado</strong> cuando termine la reparación.
          </p>
        )}
      </ModalBase>

      {notify && (
        <NotifyModal
          variant={notify.variant}
          title={notify.title}
          message={notify.message}
          onClose={() => setNotify(null)}
        />
      )}
    </>
  );
};

export default ReportarDanoModal;
