import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import * as OrdenCompraService from "../../services/OrdenCompraService";
import "../../styles/admin/reporteOrdenesCompra.css";

const ReporteOrdenesCompra = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    estado: "",
  });

  useEffect(() => {
    loadOrdenes();
  }, []);

  const loadOrdenes = async () => {
    setLoading(true);
    try {
      const data = await OrdenCompraService.getOrdenesCompra();
      const ordenesData = Array.isArray(data) ? data : data.orden_compra || [];

      // Default filter: show viajando and en_oficina_importadora
      const defaultEstados = ["viajando", "en_oficina_importadora"];
      const filtered = ordenesData.filter((o) => defaultEstados.includes(o.estado_logistico));

      setOrdenes(filtered);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = async (ordenId, newStatus) => {
    try {
      await OrdenCompraService.updateOrdenCompra(ordenId, { estado_logistico: newStatus });
      loadOrdenes();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  let filteredOrdenes = ordenes;
  if (filters.estado) {
    filteredOrdenes = ordenes.filter((o) => o.estado_logistico === filters.estado);
  }

  const enTransito = ordenes.filter((o) => o.estado_logistico === "viajando").length;
  const enOficinaImportadora = ordenes.filter((o) => o.estado_logistico === "en_oficina_importadora").length;
  const sinTracking = ordenes.filter((o) => !o.numero_tracking).length;

  const estadoColors = {
    viajando: "#f59e0b",
    en_oficina_importadora: "#3b82f6",
    entregado: "#10b981",
    cancelado: "#ef4444",
  };

  const estadoLabels = {
    viajando: "En Tránsito",
    en_oficina_importadora: "En Oficina Importadora",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };

  const columns = [
    {
      key: "numero_orden",
      label: "Orden",
      sortable: true,
      render: (row) => row.numero_orden || "N/A",
    },
    {
      key: "producto_nombre",
      label: "Producto",
      sortable: true,
      render: (row) => row.producto_nombre || "N/A",
    },
    {
      key: "unidad_serial",
      label: "Serial",
      sortable: true,
      render: (row) => row.unidad_serial || "N/A",
    },
    {
      key: "tipo",
      label: "Tipo",
      sortable: true,
      render: (row) => (row.tipo === "compra_externa" ? "Compra Externa" : "Canje Cliente"),
    },
    {
      key: "estado_logistico",
      label: "Estado",
      sortable: true,
      render: (row) => (
        <select
          className="roc-status-select"
          value={row.estado_logistico}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          style={{ borderColor: estadoColors[row.estado_logistico] || "#ddd" }}
        >
          <option value="viajando">En Tránsito</option>
          <option value="en_oficina_importadora">En Oficina Importadora</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      ),
    },
    {
      key: "numero_tracking",
      label: "Tracking",
      sortable: true,
      render: (row) => row.numero_tracking || "Sin tracking",
    },
    {
      key: "costo_compra",
      label: "Costo Compra",
      sortable: true,
      render: (row) => `$${parseFloat(row.costo_compra || 0).toFixed(2)}`,
    },
  ];

  return (
    <div className="roc-container">
      <div className="roc-header">
        <h1>Reporte de Órdenes de Compra Pendientes</h1>
      </div>

      <div className="roc-filters">
        <div className="roc-filter-group">
          <label htmlFor="estado">Estado</label>
          <select id="estado" name="estado" value={filters.estado} onChange={handleFilterChange}>
            <option value="">Todos los Estados</option>
            <option value="viajando">En Tránsito</option>
            <option value="en_oficina_importadora">En Oficina Importadora</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="roc-stats">
        <div className="roc-stat-card">
          <div className="roc-stat-icon" style={{ backgroundColor: "#f59e0b" }}>
            <Package size={24} color="white" />
          </div>
          <div className="roc-stat-content">
            <div className="roc-stat-label">En Tránsito</div>
            <div className="roc-stat-value">{enTransito}</div>
          </div>
        </div>
        <div className="roc-stat-card">
          <div className="roc-stat-icon" style={{ backgroundColor: "#3b82f6" }}>
            <Package size={24} color="white" />
          </div>
          <div className="roc-stat-content">
            <div className="roc-stat-label">En Oficina Importadora</div>
            <div className="roc-stat-value">{enOficinaImportadora}</div>
          </div>
        </div>
        <div className="roc-stat-card">
          <div className="roc-stat-icon" style={{ backgroundColor: "#ef4444" }}>
            <Package size={24} color="white" />
          </div>
          <div className="roc-stat-content">
            <div className="roc-stat-label">Sin Tracking</div>
            <div className="roc-stat-value">{sinTracking}</div>
          </div>
        </div>
      </div>

      <div className="roc-table-container">
        <h2>Órdenes Pendientes</h2>
        <DataTable
          columns={columns}
          data={filteredOrdenes}
          loading={loading}
          emptyMessage="No hay órdenes pendientes"
        />
      </div>
    </div>
  );
};

export default ReporteOrdenesCompra;
