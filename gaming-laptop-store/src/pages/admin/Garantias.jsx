import React, { useEffect, useState } from "react";
import "../../styles/admin/dataTable.css";
import "../../styles/global.css";
import { ShieldAlert, Package, Truck } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import { getUnidades, updateUnidad } from "../../services/UnidadService";

const CONDICION_LABELS = {
  nuevo: "Nuevo",
  open_box: "Open Box",
  refurbished: "Refurbished",
  usado: "Usado",
};

const ESTADO_PRODUCTO_GARANTIA_OPTIONS = [
  { value: "por_entregar", label: "Por Entregar" },
  { value: "entregado", label: "Entregado" },
];

const formatCOP = (value) => "$" + Number(value).toLocaleString("es-CO");

const Garantias = () => {
  const [unidades, setUnidades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUnidades();
  }, []);

  const fetchUnidades = async () => {
    try {
      const data = await getUnidades();
      setUnidades(data);
    } catch (error) {
      console.error("Error cargando unidades:", error);
    }
  };

  const handleEstadoProductoChange = async (id, nuevoEstado) => {
    const prevEstado = unidades.find((u) => u.id === id)?.estado_producto;
    setUnidades((prev) =>
      prev.map((u) => (u.id === id ? { ...u, estado_producto: nuevoEstado } : u))
    );
    try {
      await updateUnidad(id, { estado_producto: nuevoEstado });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      setUnidades((prev) =>
        prev.map((u) => (u.id === id ? { ...u, estado_producto: prevEstado } : u))
      );
      const msg =
        error.response?.data?.estado_producto ||
        error.response?.data?.detail ||
        "Error al actualizar estado del producto";
      alert(typeof msg === "object" ? JSON.stringify(msg) : msg);
    }
  };

  const garantiaUnidades = unidades.filter(
    (u) => u.active !== false && u.estado_venta === "entregado_garantia"
  );

  const filtered = garantiaUnidades.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      u.serial?.toLowerCase().includes(term) ||
      u.producto_nombre?.toLowerCase().includes(term) ||
      u.producto_marca?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      key: "producto_nombre",
      label: "Producto",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.producto_nombre || "—"}</div>
          {row.producto_marca && (
            <div style={{ fontSize: "0.78rem", color: "var(--subtitle-color)", marginTop: "2px" }}>
              {row.producto_marca}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "condicion",
      label: "Condición",
      render: (row) => (
        <span className={`status-badge condicion-${row.condicion}`}>
          {CONDICION_LABELS[row.condicion] || row.condicion}
        </span>
      ),
    },
    {
      key: "serial",
      label: "Serial",
      render: (row) => (
        <code
          style={{
            fontFamily: "Courier New, monospace",
            backgroundColor: "var(--icon-bg)",
            padding: "0.25rem 0.5rem",
            borderRadius: "4px",
            fontSize: "0.82rem",
            fontWeight: 600,
          }}
        >
          {row.serial}
        </code>
      ),
    },
    {
      key: "cliente_garantia_nombre",
      label: "Cliente",
      render: (row) => (
        <span style={{ fontWeight: 500 }}>
          {row.cliente_garantia_nombre || "—"}
        </span>
      ),
    },
    {
      key: "precio",
      label: "Precio",
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--primary-color)" }}>
          {formatCOP(row.precio)}
        </span>
      ),
    },
    {
      key: "estado_producto",
      label: "Estado",
      render: (row) => (
        <select
          className={`uep-select uep-select--${row.estado_producto}`}
          value={row.estado_producto}
          onChange={(e) => handleEstadoProductoChange(row.id, e.target.value)}
        >
          {ESTADO_PRODUCTO_GARANTIA_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ),
    },
  ];

  const stats = [
    {
      label: "Total Garantías",
      count: garantiaUnidades.length,
      icon: <ShieldAlert className="icon-card" style={{ stroke: "#92400e", color: "#92400e", backgroundColor: "#fef3c7" }} />,
    },
    {
      label: "Por Entregar",
      count: garantiaUnidades.filter((u) => u.estado_producto === "por_entregar").length,
      icon: <Truck className="icon-card" style={{ stroke: "#c2410c", color: "#c2410c", backgroundColor: "#fff7ed" }} />,
    },
    {
      label: "Entregados",
      count: garantiaUnidades.filter((u) => u.estado_producto === "entregado").length,
      icon: <Package className="icon-card" style={{ stroke: "#065f46", color: "#065f46", backgroundColor: "#d1fae5" }} />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Garantías"
          icon={ShieldAlert}
          description="Unidades entregadas por garantía y su estado de devolución"
        />

        <SearchBox
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por serial o producto..."
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={filtered}
          rowKey="id"
          showEdit={false}
        />
      </div>
    </section>
  );
};

export default Garantias;
