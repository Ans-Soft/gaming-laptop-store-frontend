import React, { useState, useEffect } from "react";
import { Download, Award } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import * as VentaService from "../../services/VentaService";
import "../../styles/admin/reporteMasVendidos.css";

const ReporteMasVendidos = () => {
  const [productos, setProductos] = useState([]);
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
      const ventas = Array.isArray(data) ? data : data.ventas || [];

      // Group by producto and accumulate units and revenue
      const productosMap = {};
      let ranking = 0;

      ventas.forEach((venta) => {
        const ventaDate = new Date(venta.fecha);
        const startDate = new Date(filters.fechaInicio);
        const endDate = new Date(filters.fechaFin);

        if (ventaDate >= startDate && ventaDate <= endDate) {
          if (venta.items && Array.isArray(venta.items)) {
            venta.items.forEach((item) => {
              const productoNombre = item.producto_nombre || "N/A";
              if (!productosMap[productoNombre]) {
                productosMap[productoNombre] = {
                  producto: productoNombre,
                  unidades: 0,
                  ingresos: 0,
                };
              }
              productosMap[productoNombre].unidades += 1;
              productosMap[productoNombre].ingresos += parseFloat(item.precio || 0);
            });
          }
        }
      });

      // Convert to array and sort by units_sold descending
      const productosArray = Object.values(productosMap)
        .sort((a, b) => b.unidades - a.unidades)
        .map((p, index) => ({
          ...p,
          ranking: index + 1,
        }));

      setProductos(productosArray);
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

  const productosUnicos = productos.length;
  const totalUnidades = productos.reduce((sum, p) => sum + p.unidades, 0);
  const totalIngresos = productos.reduce((sum, p) => sum + p.ingresos, 0);

  const handleExport = () => {
    const headers = ["Ranking", "Producto", "Unidades Vendidas", "Ingresos Totales"];
    const csvContent = [
      headers.join(","),
      ...productos.map((p) =>
        [p.ranking, p.producto, p.unidades, p.ingresos.toFixed(2)].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_mas_vendidos_${filters.fechaInicio}_a_${filters.fechaFin}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: "ranking",
      label: "Ranking",
      sortable: true,
      render: (row) => `#${row.ranking}`,
    },
    {
      key: "producto",
      label: "Producto",
      sortable: true,
      render: (row) => row.producto,
    },
    {
      key: "unidades",
      label: "Unidades Vendidas",
      sortable: true,
      render: (row) => row.unidades,
    },
    {
      key: "ingresos",
      label: "Ingresos Totales",
      sortable: true,
      render: (row) => `$${row.ingresos.toFixed(2)}`,
    },
  ];

  return (
    <div className="rmv-container">
      <div className="rmv-header">
        <h1>Reporte de Productos Más Vendidos</h1>
        <button className="rmv-btn-export" onClick={handleExport}>
          <Download size={20} /> Exportar CSV
        </button>
      </div>

      <div className="rmv-filters">
        <div className="rmv-filter-group">
          <label htmlFor="fechaInicio">Fecha Inicio</label>
          <input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            value={filters.fechaInicio}
            onChange={handleFilterChange}
          />
        </div>
        <div className="rmv-filter-group">
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

      <div className="rmv-stats">
        <div className="rmv-stat-card">
          <div className="rmv-stat-icon" style={{ backgroundColor: "#8b5cf6" }}>
            <Award size={24} color="white" />
          </div>
          <div className="rmv-stat-content">
            <div className="rmv-stat-label">Productos Únicos</div>
            <div className="rmv-stat-value">{productosUnicos}</div>
          </div>
        </div>
        <div className="rmv-stat-card">
          <div className="rmv-stat-icon" style={{ backgroundColor: "#06b6d4" }}>
            <Award size={24} color="white" />
          </div>
          <div className="rmv-stat-content">
            <div className="rmv-stat-label">Total Unidades</div>
            <div className="rmv-stat-value">{totalUnidades}</div>
          </div>
        </div>
        <div className="rmv-stat-card">
          <div className="rmv-stat-icon" style={{ backgroundColor: "#10b981" }}>
            <Award size={24} color="white" />
          </div>
          <div className="rmv-stat-content">
            <div className="rmv-stat-label">Total Ingresos</div>
            <div className="rmv-stat-value">${totalIngresos.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="rmv-table-container">
        <h2>Productos Ordenados por Unidades Vendidas</h2>
        <DataTable
          columns={columns}
          data={productos}
          loading={loading}
          emptyMessage="No hay productos vendidos en este período"
        />
      </div>
    </div>
  );
};

export default ReporteMasVendidos;
