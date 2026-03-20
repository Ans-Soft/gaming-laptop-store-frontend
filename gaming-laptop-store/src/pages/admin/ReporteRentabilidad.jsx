import React, { useState, useEffect } from "react";
import { Download, PieChart } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import * as VentaService from "../../services/VentaService";
import * as OrdenCompraService from "../../services/OrdenCompraService";
import "../../styles/admin/reporteRentabilidad.css";

const ReporteRentabilidad = () => {
  const [rentabilidad, setRentabilidad] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    fechaFin: new Date().toISOString().split("T")[0],
    producto: "",
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

      // Map ordenes by unidad_producto
      const ordenesMap = {};
      ordenes.forEach((orden) => {
        if (orden.unidad_producto) {
          ordenesMap[orden.unidad_producto] = orden;
        }
      });

      // Group by product and aggregate
      const productosMap = {};

      ventas.forEach((venta) => {
        const ventaDate = new Date(venta.fecha);
        const startDate = new Date(filters.fechaInicio);
        const endDate = new Date(filters.fechaFin);

        if (ventaDate >= startDate && ventaDate <= endDate) {
          if (venta.items && Array.isArray(venta.items)) {
            venta.items.forEach((item) => {
              const productoNombre = item.producto_nombre || "N/A";
              const orden = ordenesMap[item.unidad_producto];

              if (!productosMap[productoNombre]) {
                productosMap[productoNombre] = {
                  producto: productoNombre,
                  unidades: 0,
                  totalIngresos: 0,
                  totalCosto: 0,
                };
              }

              productosMap[productoNombre].unidades += 1;
              productosMap[productoNombre].totalIngresos += parseFloat(item.precio || 0);

              if (orden) {
                const cost =
                  parseFloat(orden.costo_compra || 0) +
                  parseFloat(orden.costo_importacion || 0) +
                  parseFloat(orden.impuesto_importacion || 0);
                productosMap[productoNombre].totalCosto += cost;
              }
            });
          }
        }
      });

      // Calculate margins and apply filters
      const rentabilidadArray = Object.values(productosMap).map((p) => {
        const margenDolares = p.totalIngresos - p.totalCosto;
        const margenPorcentaje =
          p.totalIngresos > 0 ? ((margenDolares / p.totalIngresos) * 100).toFixed(2) : 0;

        return {
          ...p,
          margenDolares,
          margenPorcentaje: parseFloat(margenPorcentaje),
        };
      });

      // Apply product filter
      let filtered = rentabilidadArray;
      if (filters.producto) {
        filtered = rentabilidadArray.filter((r) =>
          r.producto.toLowerCase().includes(filters.producto.toLowerCase())
        );
      }

      setRentabilidad(filtered);
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

  const totalUnidades = rentabilidad.reduce((sum, r) => sum + r.unidades, 0);
  const totalIngresos = rentabilidad.reduce((sum, r) => sum + r.totalIngresos, 0);
  const totalCostos = rentabilidad.reduce((sum, r) => sum + r.totalCosto, 0);
  const margenTotal = totalIngresos - totalCostos;

  const handleExport = () => {
    const headers = ["Producto", "Unidades", "Ingresos", "Costo Total", "Margen ($)", "Margen (%)"];
    const csvContent = [
      headers.join(","),
      ...rentabilidad.map((r) =>
        [
          r.producto,
          r.unidades,
          r.totalIngresos.toFixed(2),
          r.totalCosto.toFixed(2),
          r.margenDolares.toFixed(2),
          r.margenPorcentaje.toFixed(2),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_rentabilidad_${filters.fechaInicio}_a_${filters.fechaFin}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getMargenColor = (margenPorcentaje) => {
    if (margenPorcentaje >= 20) return "#10b981"; // green
    if (margenPorcentaje > 0) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const columns = [
    {
      key: "producto",
      label: "Producto",
      sortable: true,
      render: (row) => row.producto,
    },
    {
      key: "unidades",
      label: "Unidades",
      sortable: true,
      render: (row) => row.unidades,
    },
    {
      key: "totalIngresos",
      label: "Ingresos",
      sortable: true,
      render: (row) => `$${row.totalIngresos.toFixed(2)}`,
    },
    {
      key: "totalCosto",
      label: "Costo Total",
      sortable: true,
      render: (row) => `$${row.totalCosto.toFixed(2)}`,
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
      render: (row) => (
        <span
          className="rr-margen-badge"
          style={{ backgroundColor: getMargenColor(row.margenPorcentaje), color: "white" }}
        >
          {row.margenPorcentaje.toFixed(2)}%
        </span>
      ),
    },
  ];

  return (
    <div className="rr-container">
      <div className="rr-header">
        <h1>Reporte de Rentabilidad por Producto</h1>
        <button className="rr-btn-export" onClick={handleExport}>
          <Download size={20} /> Exportar CSV
        </button>
      </div>

      <div className="rr-filters">
        <div className="rr-filter-group">
          <label htmlFor="fechaInicio">Fecha Inicio</label>
          <input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            value={filters.fechaInicio}
            onChange={handleFilterChange}
          />
        </div>
        <div className="rr-filter-group">
          <label htmlFor="fechaFin">Fecha Fin</label>
          <input
            id="fechaFin"
            name="fechaFin"
            type="date"
            value={filters.fechaFin}
            onChange={handleFilterChange}
          />
        </div>
        <div className="rr-filter-group">
          <label htmlFor="producto">Buscar Producto</label>
          <input
            id="producto"
            name="producto"
            type="text"
            placeholder="Nombre del producto..."
            value={filters.producto}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="rr-stats">
        <div className="rr-stat-card">
          <div className="rr-stat-icon" style={{ backgroundColor: "#8b5cf6" }}>
            <PieChart size={24} color="white" />
          </div>
          <div className="rr-stat-content">
            <div className="rr-stat-label">Total Unidades</div>
            <div className="rr-stat-value">{totalUnidades}</div>
          </div>
        </div>
        <div className="rr-stat-card">
          <div className="rr-stat-icon" style={{ backgroundColor: "#06b6d4" }}>
            <PieChart size={24} color="white" />
          </div>
          <div className="rr-stat-content">
            <div className="rr-stat-label">Total Ingresos</div>
            <div className="rr-stat-value">${totalIngresos.toFixed(2)}</div>
          </div>
        </div>
        <div className="rr-stat-card">
          <div className="rr-stat-icon" style={{ backgroundColor: "#10b981" }}>
            <PieChart size={24} color="white" />
          </div>
          <div className="rr-stat-content">
            <div className="rr-stat-label">Margen Total</div>
            <div className="rr-stat-value">${margenTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="rr-table-container">
        <h2>Análisis de Rentabilidad</h2>
        <DataTable
          columns={columns}
          data={rentabilidad}
          loading={loading}
          emptyMessage="No hay productos vendidos en este período"
        />
      </div>
    </div>
  );
};

export default ReporteRentabilidad;
