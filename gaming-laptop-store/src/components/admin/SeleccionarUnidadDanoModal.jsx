import React from "react";
import { AlertTriangle } from "lucide-react";
import ModalBase from "./ModalBase";
import "../../styles/admin/seleccionarUnidadDanoModal.css";

const CONDICION_LABELS = {
  nuevo: "Nuevo",
  open_box: "Open Box",
  refurbished: "Refurbished",
  usado: "Usado",
};

/**
 * Intermediate modal to pick which unit to report as damaged when a venta
 * has more than one item.
 *
 * Props:
 *   venta         — the full Venta object (items[])
 *   onSelect(item) — called with the chosen ItemVenta
 *   onClose       — called to dismiss without selecting
 */
const SeleccionarUnidadDanoModal = ({ venta, onSelect, onClose }) => {
  const items = (venta?.items || []).filter(
    (i) => i.unidad_estado_venta !== "danado"
  );

  return (
    <ModalBase
      title="Seleccionar Unidad a Reportar"
      icon={<AlertTriangle size={22} />}
      subtitle={`Venta #${venta?.id} — elige cuál unidad deseas reportar como dañada`}
      onClose={onClose}
    >
      {items.length === 0 ? (
        <p className="sudm-empty">No hay unidades elegibles para reportar daño.</p>
      ) : (
        <div className="sudm-list">
          {items.map((item) => (
            <div key={item.id} className="sudm-row">
              <div className="sudm-info">
                <code className="sudm-serial">{item.unidad_serial || "—"}</code>
                <span className="sudm-nombre">{item.producto_nombre || "—"}</span>
                {item.unidad_condicion && (
                  <span className={`sudm-badge sudm-condicion-${item.unidad_condicion}`}>
                    {CONDICION_LABELS[item.unidad_condicion] || item.unidad_condicion}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="sudm-btn-reportar"
                onClick={() => onSelect(item)}
              >
                <AlertTriangle size={14} />
                Reportar daño
              </button>
            </div>
          ))}
        </div>
      )}
    </ModalBase>
  );
};

export default SeleccionarUnidadDanoModal;
