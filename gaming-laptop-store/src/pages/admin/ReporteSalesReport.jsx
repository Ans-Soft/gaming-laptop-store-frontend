import React, { useState, useEffect } from "react";
import { TrendingUp, Download } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import * as VentaService from "../../services/VentaService";
import "../../styles/admin/reporteSales.css";

const ReporteSalesReport = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    fechaFin: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadVentas();
  }, []);

  const loadVentas = async () => {
    setLoading(true);
    try {
      const data = await VentaService.getVentas();
      setVentas(Array.isArray(data) ? data : data.ventas || []);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredVentas = ventas.filter((v) => {
    const ventaDate = new Date(v.fecha);
    const startDate = new Date(filters.fechaInicio);
    const endDate = new Date(filters.fechaFin);
    return ventaDate >= startDate && ventaDate <= endDate;
  });

  const totalSold = filteredVentas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
  const transactionCount = filteredVentas.length;
  const avgTransaction = transactionCount > 0 ? totalSold / transactionCount : 0;

  const handleExport = () => {
    const headers = ["ID", "Cliente", "Fecha", "Items", "Total"];
    const csvContent = [
      headers.join(","),
      ...filteredVentas.map((v) =>
        [v.id, v.cliente_nombre || "N/A", v.fecha, v.items_count || 0, v.total || 0].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_ventas_${filters.fechaInicio}_a_${filters.fechaFin}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (row) => `#${row.id}`,
    },
    {
      key: "cliente_nombre",
      label: "Cliente",
      sortable: true,
      render: (row) => row.cliente_nombre || "N/A",
    },
    {
      key: "fecha",
      label: "Fecha",
      sortable: true,
      render: (row) => new Date(row.fecha).toLocaleDateString("es-CO"),
    },
    {
      key: "items_count",
      label: "Items",
      sortable: true,
      render: (row) => row.items_count || 0,
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (row) => `$${parseFloat(row.total || 0).toFixed(2)}`,
    },
  ];

  return (
    <div className="rs-container">
      <div className="rs-header">
        <h1>Reporte de Ventas por Período</h1>
        <button className="rs-btn-export" onClick={handleExport}>
          <Download size={20} /> Exportar CSV
        </button>
      </div>

      <div className="rs-filters">
        <div className="rs-filter-group">
          <label htmlFor="fechaInicio">Fecha Inicio</label>
          <input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            value={filters.fechaInicio}
            onChange={handleFilterChange}
          />
        </div>
        <div className="rs-filter-group">
          <label htmlFor="fechaFin">Fecha Fin</label>
          <input
            id="fechaFin"
            name="fechaFin"
            type="date"
            value={filters.fechaFin}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="rs-stats">
        <div className="rs-stat-card">
          <div className="rs-stat-icon" style={{ backgroundColor: "#3b82f6" }}>
            <TrendingUp size={24} color="white" />
          </div>
          <div className="rs-stat-content">
            <div className="rs-stat-label">Total Vendido</div>
            <div className="rs-stat-value">${totalSold.toFixed(2)}</div>
          </div>
        </div>
        <div className="rs-stat-card">
          <div className="rs-stat-icon" style={{ backgroundColor: "#10b981" }}>
            <TrendingUp size={24} color="white" />
          </div>
          <div className="rs-stat-content">
            <div className="rs-stat-label">Transacciones</div>
            <div className="rs-stat-value">{transactionCount}</div>
          </div>
        </div>
        <div className="rs-stat-card">
          <div className="rs-stat-icon" style={{ backgroundColor: "#f59e0b" }}>
            <TrendingUp size={24} color="white" />
          </div>
          <div className="rs-stat-content">
            <div className="rs-stat-label">Promedio por Transacción</div>
            <div className="rs-stat-value">${avgTransaction.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="rs-table-container">
        <h2>Ventas en el Período</h2>
        <DataTable
          columns={columns}
          data={filteredVentas}
          loading={loading}
          emptyMessage="No hay ventas en este período"
        />
      </div>
    </div>
  );
};

export default ReporteSalesReport;
