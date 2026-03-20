import React from "react";
import { FaRegEdit, FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import "./../../styles/admin/dataTable.css";

/**
 * ✅ DataTable - Componente genérico reutilizable para CRUDs
 *
 * Props:
 *  - columns: [{ key: 'name', label: 'Producto', render?: (row)=>jsx }]
 *  - data: array de objetos (filas)
 *  - onView, onEdit, onDelete: funciones opcionales (reciben el objeto fila)
 *  - rowKey: string -> propiedad única por fila (default: "id")
 *  - customActions: [] (deprecated, use customActionGroups instead)
 *  - customActionGroups: [{ label: 'Acciones', actions: [...] }]
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
  customActionGroups = [],
}) => {
  //  funciones internas para manejar clics en botones
  const handleView = (row) => onView?.(row);
  const handleEdit = (row) => onEdit?.(row);

  // 🔹 función para renderizar celdas
  const renderCell = (col, row) => {
    if (typeof col.render === "function") return col.render(row);
    return row[col.key] ?? "-"; // muestra "-" si no hay dato
  };

  // Determine which action columns to display
  const hasActionGroups = customActionGroups.length > 0;
  const actionGroupsToDisplay = hasActionGroups ? customActionGroups : (customActions.length > 0 ? [{ label: 'Acciones', actions: customActions }] : []);

  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {actionGroupsToDisplay.map((group) => (
              <th key={group.label}>{group.label}</th>
            ))}
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

                {actionGroupsToDisplay.map((group) => (
                  <td key={group.label} className="actions">
                    {group.label === 'Acciones' && showView && (
                      <button title="Ver" onClick={() => handleView(row)}>
                        <FaRegEye size={18} />
                      </button>
                    )}
                    {group.label === 'Acciones' && showEdit && (
                      <button title="Editar" onClick={() => handleEdit(row)}>
                        <FaRegEdit size={18} />
                      </button>
                    )}
                    {group.actions.map((action, index) => {
                      if (action.show(row)) {
                        const Icon = action.icon;
                        return (
                          <button
                            key={index}
                            title={action.title}
                            onClick={() => action.handler(row)}
                          >
                            <Icon size={18} />
                          </button>
                        );
                      }
                      return null;
                    })}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + actionGroupsToDisplay.length}
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
