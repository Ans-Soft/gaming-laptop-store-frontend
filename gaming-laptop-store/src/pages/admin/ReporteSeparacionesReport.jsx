import React, { useState, useEffect } from "react";
import { AlertCircle, Download } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import * as SeparacionService from "../../services/SeparacionService";
import "../../styles/admin/reporteSeparaciones.css";

const ReporteSeparacionesReport = () => {
  const [separaciones, setSeparaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    fechaFin: new Date().toISOString().split("T")[0],
    estado: "",
  });

  useEffect(() => {
    loadSeparaciones();
  }, []);

  const loadSeparaciones = async () => {
    setLoading(true);
    try {
      const data = await SeparacionService.getSeparaciones();
      setSeparaciones(Array.isArray(data) ? data : data.separaciones || []);
    } catch (error) {
      console.error("Error al cargar separaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredSeparaciones = separaciones.filter((s) => {
    const sepDate = new Date(s.fecha_separacion);
    const startDate = new Date(filters.fechaInicio);
    const endDate = new Date(filters.fechaFin);

    if (sepDate < startDate || sepDate > endDate) return false;
    if (filters.estado && s.estado !== filters.estado) return false;

    return true;
  });

  const totalDeposits = filteredSeparaciones.reduce((sum, s) => sum + parseFloat(s.valor_abono || 0), 0);
  const totalSeparations = filteredSeparaciones.length;
  const expiringCount = filteredSeparaciones.filter((s) => {
    const daysUntilExpire = Math.floor((new Date(s.fecha_maxima_compra) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpire >= 0 && daysUntilExpire <= 7 && s.estado === "activa";
  }).length;

  const handleExport = () => {
    const headers = ["ID", "Cliente", "Serial", "Estado", "Valor Abono", "Fecha Separación", "Fecha Máxima"];
    const csvContent = [
      headers.join(","),
      ...filteredSeparaciones.map((s) =>
        [
          s.id,
          s.cliente_nombre || "N/A",
          s.unidad_serial || "N/A",
          s.estado,
          s.valor_abono || 0,
          s.fecha_separacion,
          s.fecha_maxima_compra,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_separaciones_${filters.fechaInicio}_a_${filters.fechaFin}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getDaysUntilExpire = (fechaMaxima, estado) => {
    if (estado !== "activa") return "-";
    const days = Math.floor((new Date(fechaMaxima) - new Date()) / (1000 * 60 * 60 * 24));
    return days >= 0 ? `${days} días` : "Expirada";
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
      key: "unidad_serial",
      label: "Serial",
      sortable: true,
      render: (row) => row.unidad_serial || "N/A",
    },
    {
      key: "estado",
      label: "Estado",
      sortable: true,
      render: (row) => {
        const estadoColors = {
          activa: "#10b981",
          expirada: "#ef4444",
          cancelada: "#6b7280",
          completada: "#3b82f6",
        };
        return (
          <span
            className="rs-status-badge"
            style={{ backgroundColor: estadoColors[row.estado] || "#6b7280", color: "white" }}
          >
            {row.estado}
          </span>
        );
      },
    },
    {
      key: "valor_abono",
      label: "Valor Abono",
      sortable: true,
      render: (row) => `$${parseFloat(row.valor_abono || 0).toFixed(2)}`,
    },
    {
      key: "fecha_maxima_compra",
      label: "Días Restantes",
      sortable: false,
      render: (row) => getDaysUntilExpire(row.fecha_maxima_compra, row.estado),
    },
  ];

  return (
    <div className="rse-container">
      <div className="rse-header">
        <h1>Reporte de Separaciones por Período</h1>
        <button className="rse-btn-export" onClick={handleExport}>
          <Download size={20} /> Exportar CSV
        </button>
      </div>

      <div className="rse-filters">
        <div className="rse-filter-group">
          <label htmlFor="fechaInicio">Fecha Inicio</label>
          <input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            value={filters.fechaInicio}
            onChange={handleFilterChange}
          />
        </div>
        <div className="rse-filter-group">
          <label htmlFor="fechaFin">Fecha Fin</label>
          <input
            id="fechaFin"
            name="fechaFin"
            type="date"
            value={filters.fechaFin}
            onChange={handleFilterChange}
          />
        </div>
        <div className="rse-filter-group">
          <label htmlFor="estado">Estado</label>
          <select id="estado" name="estado" value={filters.estado} onChange={handleFilterChange}>
            <option value="">Todos</option>
            <option value="activa">Activa</option>
            <option value="expirada">Expirada</option>
            <option value="cancelada">Cancelada</option>
            <option value="completada">Completada</option>
          </select>
        </div>
      </div>

      <div className="rse-stats">
        <div className="rse-stat-card">
          <div className="rse-stat-icon" style={{ backgroundColor: "#3b82f6" }}>
            <AlertCircle size={24} color="white" />
          </div>
          <div className="rse-stat-content">
            <div className="rse-stat-label">Total de Separaciones</div>
            <div className="rse-stat-value">{totalSeparations}</div>
          </div>
        </div>
        <div className="rse-stat-card">
          <div className="rse-stat-icon" style={{ backgroundColor: "#10b981" }}>
            <AlertCircle size={24} color="white" />
          </div>
          <div className="rse-stat-content">
            <div className="rse-stat-label">Total de Depósitos</div>
            <div className="rse-stat-value">${totalDeposits.toFixed(2)}</div>
          </div>
        </div>
        <div className="rse-stat-card">
          <div className="rse-stat-icon" style={{ backgroundColor: "#ef4444" }}>
            <AlertCircle size={24} color="white" />
          </div>
          <div className="rse-stat-content">
            <div className="rse-stat-label">Por Expirar (≤7 días)</div>
            <div className="rse-stat-value">{expiringCount}</div>
          </div>
        </div>
      </div>

      <div className="rse-table-container">
        <h2>Separaciones en el Período</h2>
        <DataTable
          columns={columns}
          data={filteredSeparaciones}
          loading={loading}
          emptyMessage="No hay separaciones en este período"
        />
      </div>
    </div>
  );
};

export default ReporteSeparacionesReport;
