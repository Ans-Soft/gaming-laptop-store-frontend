import React from "react";
import { FaRegEdit, FaRegEye } from "react-icons/fa";
import ActionMenu from "./ActionMenu";
import "./../../styles/admin/dataTable.css";

/**
 * DataTable - Componente genérico reutilizable para CRUDs
 *
 * Props:
 *  - columns: [{ key: 'name', label: 'Producto', render?: (row)=>jsx }]
 *  - data: array de objetos (filas)
 *  - onView, onEdit: funciones opcionales (reciben el objeto fila)
 *  - rowKey: string -> propiedad única por fila (default: "id")
 *  - customActions: [{ icon, handler, show, title, destructive? }]
 */
const DataTable = ({
  columns = [],
  data = [],
  onView,
  onEdit,
  rowKey = "id",
  showView = false,
  showEdit = true,
  customActions = [],
}) => {
  const renderCell = (col, row) => {
    if (typeof col.render === "function") return col.render(row);
    return row[col.key] ?? "-";
  };

  // Build a unified actions array per row (view + edit + custom)
  const buildActions = () => {
    const base = [];
    if (showView && onView) {
      base.push({
        icon: FaRegEye,
        handler: (row) => onView(row),
        show: () => true,
        title: "Ver",
      });
    }
    if (showEdit && onEdit) {
      base.push({
        icon: FaRegEdit,
        handler: (row) => onEdit(row),
        show: () => true,
        title: "Editar",
      });
    }
    return [...base, ...customActions];
  };

  const allActions = buildActions();
  const hasActions = allActions.length > 0;

  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {hasActions && <th>Acciones</th>}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row) => (
              <tr key={row[rowKey]}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className || ""}>
                    {renderCell(col, row)}
                  </td>
                ))}

                {hasActions && (
                  <td className="actions">
                    <ActionMenu actions={allActions} row={row} />
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (hasActions ? 1 : 0)}
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#9ca3af",
                }}
              >
                No hay registros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
