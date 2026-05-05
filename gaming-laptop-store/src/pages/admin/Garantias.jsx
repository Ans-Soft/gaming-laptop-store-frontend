import React, { useEffect, useState } from "react";
import "../../styles/admin/dataTable.css";
import "../../styles/global.css";
import "../../styles/admin/ventasPage.css";
import "../../styles/admin/filtersBar.css";
import { ShieldAlert, Package, Truck, SlidersHorizontal, Search } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
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

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCondicion, setFilterCondicion] = useState("");
  const [filterEstadoProducto, setFilterEstadoProducto] = useState("");
  const [filterValorMin, setFilterValorMin] = useState("");
  const [filterValorMax, setFilterValorMax] = useState("");

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

  // ── Filtering ────────────────────────────────────────────────────────────
  const isFiltersActive =
    searchTerm.trim() ||
    filterCondicion ||
    filterEstadoProducto ||
    filterValorMin ||
    filterValorMax;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCondicion("");
    setFilterEstadoProducto("");
    setFilterValorMin("");
    setFilterValorMax("");
  };

  const filtered = garantiaUnidades.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const matchSerial = (u.serial || "").toLowerCase().includes(term);
      const matchProducto = (u.producto_nombre || "").toLowerCase().includes(term);
      const matchMarca = (u.producto_marca || "").toLowerCase().includes(term);
      const matchCliente = (u.cliente_garantia_nombre || "").toLowerCase().includes(term);
      if (!matchSerial && !matchProducto && !matchMarca && !matchCliente) return false;
    }

    if (filterCondicion && u.condicion !== filterCondicion) return false;
    if (filterEstadoProducto && u.estado_producto !== filterEstadoProducto) return false;

    const precio = Number(u.precio || 0);
    if (filterValorMin && precio < Number(filterValorMin)) return false;
    if (filterValorMax && precio > Number(filterValorMax)) return false;

    return true;
  });

  // ── Columns ──────────────────────────────────────────────────────────────
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
      key: "condicion",
      label: "Condición",
      render: (row) => {
        const c = row.condicion;
        if (!c) return <span style={{ color: "#94a3b8" }}>—</span>;
        return (
          <span className={`vp-condicion-${c}`}>
            {CONDICION_LABELS[c] || c}
          </span>
        );
      },
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

  // ── Stats (always from garantiaUnidades, not filtered) ───────────────────
  const stats = [
    {
      label: "Total Garantías",
      count: garantiaUnidades.length,
      icon: (
        <ShieldAlert
          className="icon-card"
          style={{ stroke: "#92400e", color: "#92400e", backgroundColor: "#fef3c7" }}
        />
      ),
    },
    {
      label: "Por Entregar",
      count: garantiaUnidades.filter((u) => u.estado_producto === "por_entregar").length,
      icon: (
        <Truck
          className="icon-card"
          style={{ stroke: "#c2410c", color: "#c2410c", backgroundColor: "#fff7ed" }}
        />
      ),
    },
    {
      label: "Entregados",
      count: garantiaUnidades.filter((u) => u.estado_producto === "entregado").length,
      icon: (
        <Package
          className="icon-card"
          style={{ stroke: "#065f46", color: "#065f46", backgroundColor: "#d1fae5" }}
        />
      ),
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

        {/* TODO: sin fecha disponible — filtro de brecha de tiempo omitido */}
        <div className="fb-bar">
          <span className="fb-label">
            <SlidersHorizontal size={14} />
            Filtrar:
          </span>

          <div className="fb-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Serial, producto, marca o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="fb-divider" />

          <select
            className="fb-select"
            value={filterCondicion}
            onChange={(e) => setFilterCondicion(e.target.value)}
          >
            <option value="">Todas las condiciones</option>
            {Object.entries(CONDICION_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          <select
            className="fb-select"
            value={filterEstadoProducto}
            onChange={(e) => setFilterEstadoProducto(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="por_entregar">Por Entregar</option>
            <option value="entregado">Entregado</option>
          </select>

          <div className="fb-divider" />

          <input
            type="number"
            className="fb-input"
            placeholder="Precio mín."
            value={filterValorMin}
            onChange={(e) => setFilterValorMin(e.target.value)}
          />
          <input
            type="number"
            className="fb-input"
            placeholder="Precio máx."
            value={filterValorMax}
            onChange={(e) => setFilterValorMax(e.target.value)}
          />

          {isFiltersActive && (
            <button className="fb-clear" onClick={clearFilters}>
              Limpiar filtros
            </button>
          )}
        </div>

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
