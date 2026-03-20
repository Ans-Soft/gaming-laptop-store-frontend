import React from "react";
import { FaPlus, FaRegEdit, FaCheck, FaTimes, FaRegTrashAlt } from "react-icons/fa";
import "../../styles/admin/discountCell.css";

const formatCOP = (value) =>
  "$" + Number(value).toLocaleString("es-CO");

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * DiscountCell — displays discount details in a table cell with inline actions
 *
 * Props:
 *   variant {Object} — variante object with descuento property
 *   onAdd {Function} — called when user clicks "Agregar descuento"
 *   onEdit {Function} — called when user clicks edit button
 *   onActivate {Function} — called when user clicks activate button
 *   onDeactivate {Function} — called when user clicks deactivate button
 *   onDelete {Function} — called when user clicks delete button
 */
const DiscountCell = ({
  variant,
  onAdd,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}) => {
  const discount = variant?.descuento;
  const originalPrice = variant?.precio;

  // Check if discount is expired or scheduled
  const isExpired = discount && new Date(discount.fecha_fin) < new Date();
  const isScheduled = discount && new Date(discount.fecha_inicio) > new Date();

  const getBadgeClass = () => {
    if (!discount) return "";
    if (isExpired) return "dc-badge--expired";
    if (isScheduled) return "dc-badge--scheduled";
    return discount.active ? "dc-badge--active" : "dc-badge--inactive";
  };

  const getBadgeText = () => {
    if (isExpired) return "Vencida";
    if (isScheduled) return "Programada";
    return discount?.active ? "Activa" : "Inactiva";
  };

  return (
    <div className="dc-cell">
      {!discount ? (
        // Empty state
        <div className="dc-empty">
          <span className="dc-empty-label">Sin descuento</span>
          <button
            className="dc-add-btn"
            onClick={() => onAdd?.(variant)}
            title="Agregar descuento"
          >
            <FaPlus size={12} />
            <span>Agregar</span>
          </button>
        </div>
      ) : (
        // Populated state
        <>
          {/* Prices row: strikethrough original + discount price */}
          <div className="dc-prices">
            <span className="dc-original">{formatCOP(originalPrice)}</span>
            <span className="dc-price">{formatCOP(discount.precio_descuento)}</span>
          </div>

          {/* Meta row: badge + dates */}
          <div className="dc-meta">
            <span className={`dc-badge ${getBadgeClass()}`}>
              {getBadgeText()}
            </span>
            <span className="dc-dates">
              {formatDate(discount.fecha_inicio)} - {formatDate(discount.fecha_fin)}
            </span>
          </div>

          {/* Actions */}
          <div className="dc-actions">
            <button
              className="dc-action-btn"
              onClick={() => onEdit?.(variant)}
              title="Editar descuento"
            >
              <FaRegEdit size={14} />
            </button>

            {!isExpired && !isScheduled && !discount.active && (
              <button
                className="dc-action-btn"
                onClick={() => onActivate?.(variant)}
                title="Activar descuento"
              >
                <FaCheck size={14} />
              </button>
            )}

            {discount.active && (
              <button
                className="dc-action-btn"
                onClick={() => onDeactivate?.(variant)}
                title="Desactivar descuento"
              >
                <FaTimes size={14} />
              </button>
            )}

            <button
              className="dc-action-btn dc-action-btn--delete"
              onClick={() => onDelete?.(variant)}
              title="Eliminar descuento"
            >
              <FaRegTrashAlt size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DiscountCell;
