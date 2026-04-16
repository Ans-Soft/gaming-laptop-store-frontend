import React, { useEffect, useState } from "react";
import "../../styles/admin/dataTable.css";
import "../../styles/global.css";
import { Handshake, Package, Truck, MapPin } from "lucide-react";
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

const ESTADO_PRODUCTO_MA_OPTIONS = [
  { value: "por_entregar", label: "Por Entregar" },
  { value: "entregado", label: "Entregado" },
];

const formatCOP = (value) => "$" + Number(value).toLocaleString("es-CO");

const MetodoAliadoList = () => {
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

  const maUnidades = unidades.filter(
    (u) => u.active !== false && u.estado_venta === "solicitud_metodo_aliado"
  );

  const filtered = maUnidades.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      u.serial?.toLowerCase().includes(term) ||
      u.producto_nombre?.toLowerCase().includes(term) ||
      u.producto_marca?.toLowerCase().includes(term) ||
      u.cliente_metodo_aliado_nombre?.toLowerCase().includes(term) ||
      u.ciudad_envio_metodo_aliado?.toLowerCase().includes(term)
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
      key: "cliente_metodo_aliado_nombre",
      label: "Cliente",
      render: (row) => (
        <span style={{ fontWeight: 500 }}>
          {row.cliente_metodo_aliado_nombre || "—"}
        </span>
      ),
    },
    {
      key: "ciudad_envio_metodo_aliado",
      label: "Ciudad Envío",
      render: (row) => row.ciudad_envio_metodo_aliado ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <MapPin size={13} style={{ color: "var(--subtitle-color)" }} />
          {row.ciudad_envio_metodo_aliado}
        </span>
      ) : (
        <span style={{ color: "var(--subtitle-color)" }}>—</span>
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
          {ESTADO_PRODUCTO_MA_OPTIONS.map((opt) => (
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
      label: "Total Método Aliado",
      count: maUnidades.length,
      icon: <Handshake className="icon-card" style={{ stroke: "#1e40af", color: "#1e40af", backgroundColor: "#dbeafe" }} />,
    },
    {
      label: "Por Entregar",
      count: maUnidades.filter((u) => u.estado_producto === "por_entregar").length,
      icon: <Truck className="icon-card" style={{ stroke: "#c2410c", color: "#c2410c", backgroundColor: "#fff7ed" }} />,
    },
    {
      label: "Entregados",
      count: maUnidades.filter((u) => u.estado_producto === "entregado").length,
      icon: <Package className="icon-card" style={{ stroke: "#065f46", color: "#065f46", backgroundColor: "#d1fae5" }} />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Método Aliado"
          icon={Handshake}
          description="Unidades solicitadas por método aliado y su estado de envío"
        />

        <SearchBox
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por serial, producto, cliente o ciudad..."
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

export default MetodoAliadoList;
