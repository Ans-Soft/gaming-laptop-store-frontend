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
 */
const DataTable = ({
  columns = [],
  data = [],
  onView,
  onEdit,
  onDelete,
  rowKey = "id",
  showView = false,
  showEdit = true,
  showDelete = true,
}) => {
  // 🔹 funciones internas para manejar clics en botones
  const handleView = (row) => onView?.(row);
  const handleEdit = (row) => onEdit?.(row);
  const handleDelete = (row) => onDelete?.(row);

  // 🔹 función para renderizar celdas
  const renderCell = (col, row) => {
    if (typeof col.render === "function") return col.render(row);
    return row[col.key] ?? "-"; // muestra "-" si no hay dato
  };

  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Acciones</th>
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

                <td className="actions">
                  {showView && (
                    <button title="Ver" onClick={() => handleView(row)}>
                      <FaRegEye size={18} />
                    </button>
                  )}
                  {showEdit && (
                  <button title="Editar" onClick={() => handleEdit(row)}>
                    <FaRegEdit size={18} />
                  </button>
                  )}
                  {showDelete && (
                  <button title="Eliminar" onClick={() => handleDelete(row)}>
                    <FaRegTrashAlt size={18} />
                  </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + 1}
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
