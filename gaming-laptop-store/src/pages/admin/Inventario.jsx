import React, { useState, useEffect } from "react";
import { Download, Filter, X } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import * as UnidadService from "../../services/UnidadService";
import "../../styles/admin/inventario.css";

const Inventario = () => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    estado_producto: "",
    estado_venta: "",
    producto: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadUnidades();
  }, []);

  const loadUnidades = async () => {
    setLoading(true);
    try {
      const data = await UnidadService.getUnidades();
      console.log("Unidades data:", data);
      // Handle various response formats
      let unidadesArray = [];
      if (Array.isArray(data)) {
        unidadesArray = data;
      } else if (data.unidades && Array.isArray(data.unidades)) {
        unidadesArray = data.unidades;
      } else if (data.results && Array.isArray(data.results)) {
        unidadesArray = data.results;
      }
      setUnidades(unidadesArray);
    } catch (error) {
      console.error("Error al cargar unidades:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUnidades = unidades.filter((u) => {
    if (filters.estado_producto && !u.estado_producto?.toLowerCase().includes(filters.estado_producto.toLowerCase())) return false;
    if (filters.estado_venta && !u.estado_venta?.toLowerCase().includes(filters.estado_venta.toLowerCase())) return false;
    if (filters.producto && !u.variante_nombre?.toLowerCase().includes(filters.producto.toLowerCase())) return false;
    return true;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ estado_producto: "", estado_venta: "", producto: "" });
  };

  const handleExport = () => {
    const headers = ["ID", "Serial", "Producto", "Estado Producto", "Estado Venta", "Precio"];
    const csvContent = [
      headers.join(","),
      ...filteredUnidades.map((u) =>
        [
          u.id,
          u.serial,
          u.variante_nombre || "N/A",
          u.estado_producto_display || u.estado_producto || "N/A",
          u.estado_venta_display || u.estado_venta || "N/A",
          u.precio,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventario_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getEstadoProductoColor = (estado) => {
    if (!estado || typeof estado !== "string") return "#6b7280";
    const lower = estado.toLowerCase();
    if (lower.includes("oficina")) return "#10b981";
    if (lower.includes("viajando")) return "#f59e0b";
    if (lower.includes("comprar")) return "#8b5cf6";
    if (lower.includes("entregar")) return "#3b82f6";
    if (lower.includes("entregado")) return "#6b7280";
    if (lower.includes("reparar")) return "#ef4444";
    if (lower.includes("reparacion")) return "#f97316";
    return "#6b7280";
  };

  const getEstadoVentaColor = (estado) => {
    if (!estado || typeof estado !== "string") return "#6b7280";
    const lower = estado.toLowerCase();
    if (lower.includes("sin vender")) return "#10b981";
    if (lower.includes("separado")) return "#f59e0b";
    if (lower.includes("vendido")) return "#3b82f6";
    if (lower.includes("encargo")) return "#8b5cf6";
    if (lower.includes("garantia")) return "#ec4899";
    if (lower.includes("dañado")) return "#ef4444";
    if (lower.includes("aliado")) return "#6366f1";
    return "#6b7280";
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (row) => `#${row.id}`,
    },
    {
      key: "serial",
      label: "Serial",
      sortable: true,
      render: (row) => row.serial || "N/A",
    },
    {
      key: "variante_nombre",
      label: "Producto",
      sortable: true,
      render: (row) => row.variante_nombre || "N/A",
    },
    {
      key: "estado_producto_display",
      label: "Estado Producto",
      sortable: true,
      render: (row) => {
        const value = row.estado_producto_display;
        return (
          <span
            className="inv-status-badge"
            style={{ backgroundColor: getEstadoProductoColor(value), color: "white" }}
          >
            {value || "N/A"}
          </span>
        );
      },
    },
    {
      key: "estado_venta_display",
      label: "Estado Venta",
      sortable: true,
      render: (row) => {
        const value = row.estado_venta_display;
        return (
          <span
            className="inv-status-badge"
            style={{ backgroundColor: getEstadoVentaColor(value), color: "white" }}
          >
            {value || "N/A"}
          </span>
        );
      },
    },
    {
      key: "precio",
      label: "Precio",
      sortable: true,
      render: (row) => `$${parseFloat(row.precio || 0).toFixed(2)}`,
    },
  ];

  const stats = [
    {
      label: "Total de Unidades",
      count: unidades.length,
      color: "#4f46e5",
    },
    {
      label: "En Stock",
      count: unidades.filter((u) => u.estado_venta?.toLowerCase().includes("sin vender") || u.estado_venta === "sin_vender").length,
      color: "#10b981",
    },
    {
      label: "Vendidas",
      count: unidades.filter((u) => u.estado_venta?.toLowerCase().includes("vendido")).length,
      color: "#3b82f6",
    },
    {
      label: "Separadas",
      count: unidades.filter((u) => u.estado_venta?.toLowerCase().includes("separado")).length,
      color: "#f59e0b",
    },
    {
      label: "Por Reparar",
      count: unidades.filter((u) => u.estado_producto?.toLowerCase().includes("reparar")).length,
      color: "#ef4444",
    },
  ];

  return (
    <div className="inv-container">
      <div className="inv-header">
        <h1>Reporte de Inventario</h1>
        <button className="inv-btn-export" onClick={handleExport}>
          <Download size={20} /> Exportar CSV
        </button>
      </div>

      <div className="inv-cards">
        {stats.map((stat, idx) => (
          <div key={idx} className="inv-stat-card" style={{ borderTopColor: stat.color }}>
            <div className="inv-stat-label">{stat.label}</div>
            <div className="inv-stat-value">{stat.count}</div>
          </div>
        ))}
      </div>

      <div className="inv-filters-section">
        <button className="inv-btn-filters" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={18} />
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </button>

        {showFilters && (
          <div className="inv-filters">
            <div className="inv-filter-group">
              <label htmlFor="producto">Buscar Producto</label>
              <input
                id="producto"
                type="text"
                placeholder="Nombre del producto..."
                value={filters.producto}
                onChange={handleFilterChange}
                name="producto"
              />
            </div>

            <div className="inv-filter-group">
              <label htmlFor="estado_producto">Estado Producto</label>
              <select id="estado_producto" name="estado_producto" value={filters.estado_producto} onChange={handleFilterChange}>
                <option value="">Todos</option>
                <option value="en_stock">En Oficina</option>
                <option value="viajando">Viajando</option>
                <option value="por_comprar">Por Comprar</option>
                <option value="por_entregar">Por Entregar</option>
                <option value="entregado">Entregado</option>
                <option value="por_reparar">Por Reparar</option>
                <option value="en_reparacion">En Reparación</option>
              </select>
            </div>

            <div className="inv-filter-group">
              <label htmlFor="estado_venta">Estado Venta</label>
              <select id="estado_venta" name="estado_venta" value={filters.estado_venta} onChange={handleFilterChange}>
                <option value="">Todos</option>
                <option value="sin_vender">Sin Vender</option>
                <option value="separado">Separado</option>
                <option value="vendido">Vendido</option>
                <option value="por_encargo">Por Encargo</option>
                <option value="entregado_garantia">Entregado en Garantía</option>
                <option value="dañado">Dañado</option>
                <option value="solicitud_metodo_aliado">Solicitud Método Aliado</option>
              </select>
            </div>

            <button className="inv-btn-clear" onClick={handleClearFilters}>
              <X size={16} /> Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      <div className="inv-results">
        <p className="inv-results-count">Mostrando {filteredUnidades.length} unidades</p>
        <div className="inv-table-container">
          <DataTable
            columns={columns}
            data={filteredUnidades}
            loading={loading}
            emptyMessage="No hay unidades que coincidan con los filtros"
          />
        </div>
      </div>
    </div>
  );
};

export default Inventario;
