import React, { useState, useEffect } from "react";
import { Download, DollarSign } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import * as VentaService from "../../services/VentaService";
import * as OrdenCompraService from "../../services/OrdenCompraService";
import "../../styles/admin/reporteMargenes.css";

const ReporteMargenes = () => {
  const [margenes, setMargenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    fechaFin: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ventasData, ordenesData] = await Promise.all([
        VentaService.getVentas(),
        OrdenCompraService.getOrdenesCompra(),
      ]);

      const ventas = Array.isArray(ventasData) ? ventasData : ventasData.ventas || [];
      const ordenes = Array.isArray(ordenesData) ? ordenesData : ordenesData.orden_compra || [];

      // Map ordenes by unidad_producto for quick lookup
      const ordenesMap = {};
      ordenes.forEach((orden) => {
        if (orden.unidad_producto) {
          ordenesMap[orden.unidad_producto] = orden;
        }
      });

      // Build margenes rows from venta items
      const margenesRows = [];
      ventas.forEach((venta) => {
        const ventaDate = new Date(venta.fecha);
        const startDate = new Date(filters.fechaInicio);
        const endDate = new Date(filters.fechaFin);

        if (ventaDate >= startDate && ventaDate <= endDate) {
          if (venta.items && Array.isArray(venta.items)) {
            venta.items.forEach((item) => {
              const orden = ordenesMap[item.unidad_producto];
              if (orden) {
                const costCompra = parseFloat(orden.costo_compra || 0);
                const costImportacion = parseFloat(orden.costo_importacion || 0);
                const impuesto = parseFloat(orden.impuesto_importacion || 0);
                const precioVenta = parseFloat(item.precio || 0);

                const margenDolares = precioVenta - costCompra - costImportacion - impuesto;
                const margenPorcentaje =
                  precioVenta > 0 ? ((margenDolares / precioVenta) * 100).toFixed(2) : 0;

                margenesRows.push({
                  id: item.id,
                  serial: item.unidad_serial || "N/A",
                  producto: item.producto_nombre || "N/A",
                  costCompra,
                  costImportacion,
                  impuesto,
                  precioVenta,
                  margenDolares,
                  margenPorcentaje: parseFloat(margenPorcentaje),
                });
              }
            });
          }
        }
      });

      setMargenes(margenesRows);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const totalIngresos = margenes.reduce((sum, m) => sum + m.precioVenta, 0);
  const totalCostos = margenes.reduce((sum, m) => sum + m.costCompra + m.costImportacion + m.impuesto, 0);
  const margenTotal = totalIngresos - totalCostos;

  const handleExport = () => {
    const headers = ["Serial", "Producto", "Costo Compra", "Costo Importación", "Impuesto", "Precio Venta", "Margen ($)", "Margen (%)"];
    const csvContent = [
      headers.join(","),
      ...margenes.map((m) =>
        [
          m.serial,
          m.producto,
          m.costCompra.toFixed(2),
          m.costImportacion.toFixed(2),
          m.impuesto.toFixed(2),
          m.precioVenta.toFixed(2),
          m.margenDolares.toFixed(2),
          m.margenPorcentaje.toFixed(2),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_margenes_${filters.fechaInicio}_a_${filters.fechaFin}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: "serial",
      label: "Serial",
      sortable: true,
      render: (row) => row.serial,
    },
    {
      key: "producto",
      label: "Producto",
      sortable: true,
      render: (row) => row.producto,
    },
    {
      key: "costCompra",
      label: "Costo Compra",
      sortable: true,
      render: (row) => `$${row.costCompra.toFixed(2)}`,
    },
    {
      key: "costImportacion",
      label: "Costo Importación",
      sortable: true,
      render: (row) => `$${row.costImportacion.toFixed(2)}`,
    },
    {
      key: "impuesto",
      label: "Impuesto",
      sortable: true,
      render: (row) => `$${row.impuesto.toFixed(2)}`,
    },
    {
      key: "precioVenta",
      label: "Precio Venta",
      sortable: true,
      render: (row) => `$${row.precioVenta.toFixed(2)}`,
    },
    {
      key: "margenDolares",
      label: "Margen ($)",
      sortable: true,
      render: (row) => `$${row.margenDolares.toFixed(2)}`,
    },
    {
      key: "margenPorcentaje",
      label: "Margen (%)",
      sortable: true,
      render: (row) => `${row.margenPorcentaje.toFixed(2)}%`,
    },
  ];

  return (
    <div className="rm-container">
      <div className="rm-header">
        <h1>Reporte de Márgenes y Costos</h1>
        <button className="rm-btn-export" onClick={handleExport}>
          <Download size={20} /> Exportar CSV
        </button>
      </div>

      <div className="rm-filters">
        <div className="rm-filter-group">
          <label htmlFor="fechaInicio">Fecha Inicio</label>
          <input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            value={filters.fechaInicio}
            onChange={handleFilterChange}
          />
        </div>
        <div className="rm-filter-group">
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

      <div className="rm-stats">
        <div className="rm-stat-card">
          <div className="rm-stat-icon" style={{ backgroundColor: "#3b82f6" }}>
            <DollarSign size={24} color="white" />
          </div>
          <div className="rm-stat-content">
            <div className="rm-stat-label">Total Ingresos</div>
            <div className="rm-stat-value">${totalIngresos.toFixed(2)}</div>
          </div>
        </div>
        <div className="rm-stat-card">
          <div className="rm-stat-icon" style={{ backgroundColor: "#ef4444" }}>
            <DollarSign size={24} color="white" />
          </div>
          <div className="rm-stat-content">
            <div className="rm-stat-label">Total Costos</div>
            <div className="rm-stat-value">${totalCostos.toFixed(2)}</div>
          </div>
        </div>
        <div className="rm-stat-card">
          <div className="rm-stat-icon" style={{ backgroundColor: "#10b981" }}>
            <DollarSign size={24} color="white" />
          </div>
          <div className="rm-stat-content">
            <div className="rm-stat-label">Margen Total</div>
            <div className="rm-stat-value">${margenTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="rm-table-container">
        <h2>Análisis de Márgenes por Venta</h2>
        <DataTable
          columns={columns}
          data={margenes}
          loading={loading}
          emptyMessage="No hay ventas en este período"
        />
      </div>
    </div>
  );
};

export default ReporteMargenes;
