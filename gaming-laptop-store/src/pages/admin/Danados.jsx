import React, { useEffect, useState } from "react";
import {
  Wrench,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Package,
  ShoppingCart,
  Lock,
  Calendar,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import "./../../styles/admin/danados.css";
import "./../../styles/admin/ventasPage.css";
import "../../styles/admin/filtersBar.css";
import TitleCrud from "../../components/admin/TitleCrud";
import CountCard from "../../components/admin/CountCard";
import DataTable from "../../components/admin/DataTable";
import ConfirmModal from "../../components/admin/ConfirmModal";
import NotifyModal from "../../components/admin/NotifyModal";
import * as ReparacionService from "../../services/ReparacionService";
import { DATE_RANGE_PRESETS, computeDateRange, matchesDateRange } from "../../utils/dateRangeFilter";

const ORIGEN_LABELS = {
  stock: "Stock",
  venta: "Venta",
  separacion: "Separación",
  metodo_aliado: "Método Aliado",
};

const CONDICION_LABELS = {
  nuevo: "Nuevo",
  open_box: "Open Box",
  refurbished: "Refurbished",
  usado: "Usado",
};

const Danados = () => {
  const [reparaciones, setReparaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [notify, setNotify] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCondicion, setFilterCondicion] = useState("");
  const [filterOrigen, setFilterOrigen] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterValorMin, setFilterValorMin] = useState("");
  const [filterValorMax, setFilterValorMax] = useState("");
  const [datePreset, setDatePreset] = useState("mes_actual");
  const [dateFrom, setDateFrom] = useState(() => computeDateRange("mes_actual").from);
  const [dateTo, setDateTo] = useState(() => computeDateRange("mes_actual").to);

  useEffect(() => {
    loadReparaciones();
  }, []);

  const loadReparaciones = async () => {
    setLoading(true);
    try {
      const data = await ReparacionService.getReparaciones();
      setReparaciones(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error al cargar reparaciones:", error);
      setNotify({
        variant: "error",
        title: "Error al cargar",
        message: "No se pudieron cargar las reparaciones. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIniciar = (row) => {
    setConfirmDialog({
      title: "¿Iniciar reparación?",
      message: `La unidad ${row.serial} pasará a estado "En Reparación".`,
      confirmLabel: "Sí, iniciar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await ReparacionService.iniciarReparacion(row.id);
          setConfirmDialog(null);
          loadReparaciones();
          setNotify({
            variant: "success",
            title: "Reparación iniciada",
            message: `La unidad ${row.serial} quedó en reparación.`,
          });
        } catch (error) {
          const msg =
            error.response?.data?.error ||
            "No se pudo iniciar la reparación.";
          setConfirmDialog(null);
          setNotify({ variant: "error", title: "Error", message: msg });
        }
      },
    });
  };

  const handleCompletar = (row) => {
    const destino =
      row.origen === "venta"
        ? "quedará vendida y lista para entregar al cliente"
        : row.origen === "separacion"
        ? "volverá a estar separada para el cliente"
        : row.origen === "metodo_aliado"
        ? "volverá al flujo de método aliado"
        : "volverá al stock disponible";

    setConfirmDialog({
      title: "¿Completar reparación?",
      message: `La unidad ${row.serial} ${destino}.`,
      confirmLabel: "Sí, completar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await ReparacionService.completarReparacion(row.id);
          setConfirmDialog(null);
          loadReparaciones();
          setNotify({
            variant: "success",
            title: "Reparación completada",
            message: `La unidad ${row.serial} salió del pipeline de reparación.`,
          });
        } catch (error) {
          const msg =
            error.response?.data?.error ||
            "No se pudo completar la reparación.";
          setConfirmDialog(null);
          setNotify({ variant: "error", title: "Error", message: msg });
        }
      },
    });
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    return d.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ── Date preset ──────────────────────────────────────────────────────────
  const handleDatePresetChange = (preset) => {
    setDatePreset(preset);
    if (preset !== "personalizado") {
      const range = computeDateRange(preset);
      if (range) {
        setDateFrom(range.from);
        setDateTo(range.to);
      }
    }
  };

  // ── Filtering ────────────────────────────────────────────────────────────
  const isFiltersActive =
    searchTerm.trim() ||
    filterCondicion ||
    filterOrigen ||
    filterEstado ||
    filterValorMin ||
    filterValorMax ||
    datePreset !== "mes_actual";

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCondicion("");
    setFilterOrigen("");
    setFilterEstado("");
    setFilterValorMin("");
    setFilterValorMax("");
    setDatePreset("mes_actual");
    const range = computeDateRange("mes_actual");
    setDateFrom(range.from);
    setDateTo(range.to);
  };

  const filtered = reparaciones.filter((r) => {
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const matchSerial = (r.serial || "").toLowerCase().includes(term);
      const matchProducto = (r.producto_nombre || "").toLowerCase().includes(term);
      const matchCliente = (r.cliente_nombre || "").toLowerCase().includes(term);
      if (!matchSerial && !matchProducto && !matchCliente) return false;
    }

    if (filterCondicion && r.condicion !== filterCondicion) return false;
    if (filterOrigen && r.origen !== filterOrigen) return false;
    if (filterEstado && r.estado_producto !== filterEstado) return false;

    const precio = Number(r.precio || 0);
    if (filterValorMin && precio < Number(filterValorMin)) return false;
    if (filterValorMax && precio > Number(filterValorMax)) return false;

    if (!matchesDateRange(r.fecha_reporte_dano, dateFrom, dateTo)) return false;

    return true;
  });

  const isCustomPreset = datePreset !== "personalizado";

  // ── Stats (always from full reparaciones) ────────────────────────────────
  const now = new Date();
  const mesActualFrom = new Date(now.getFullYear(), now.getMonth(), 1);

  const porReparar = reparaciones.filter((r) => r.estado_producto === "por_reparar").length;
  const enReparacion = reparaciones.filter((r) => r.estado_producto === "en_reparacion").length;
  const desdeStock = reparaciones.filter((r) => r.origen === "stock").length;
  const desdeVenta = reparaciones.filter((r) => r.origen === "venta").length;
  const desdeSep = reparaciones.filter((r) => r.origen === "separacion").length;
  const reportadosEsteMes = reparaciones.filter((r) => {
    if (!r.fecha_reporte_dano) return false;
    return new Date(r.fecha_reporte_dano) >= mesActualFrom;
  }).length;

  const stats = [
    {
      label: "Total en Reparación",
      count: reparaciones.length,
      icon: (
        <Wrench
          className="icon-card"
          style={{ stroke: "#92400e", color: "#92400e", backgroundColor: "#fef3c7" }}
        />
      ),
    },
    {
      label: "Por Reparar",
      count: porReparar,
      icon: (
        <AlertTriangle
          className="icon-card"
          style={{ stroke: "#b91c1c", color: "#b91c1c", backgroundColor: "#fee2e2" }}
        />
      ),
    },
    {
      label: "En Reparación",
      count: enReparacion,
      icon: (
        <PlayCircle
          className="icon-card"
          style={{ stroke: "#1e40af", color: "#1e40af", backgroundColor: "#dbeafe" }}
        />
      ),
    },
    {
      label: "Reportados Este Mes",
      count: reportadosEsteMes,
      icon: (
        <Calendar
          className="icon-card"
          style={{ stroke: "#1d4ed8", color: "#1d4ed8", backgroundColor: "#dbeafe" }}
        />
      ),
    },
    {
      label: "Desde Stock",
      count: desdeStock,
      icon: (
        <Package
          className="icon-card"
          style={{ stroke: "#6b21a8", color: "#6b21a8", backgroundColor: "#f3e8ff" }}
        />
      ),
    },
    {
      label: "Desde Venta",
      count: desdeVenta,
      icon: (
        <ShoppingCart
          className="icon-card"
          style={{ stroke: "#3730a3", color: "#3730a3", backgroundColor: "#e0e7ff" }}
        />
      ),
    },
    {
      label: "Desde Separación",
      count: desdeSep,
      icon: (
        <Lock
          className="icon-card"
          style={{ stroke: "#92400e", color: "#92400e", backgroundColor: "#fef3c7" }}
        />
      ),
    },
  ];

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = [
    {
      key: "origen",
      label: "Origen",
      render: (row) => (
        <span className={`status-badge dan-origen-${row.origen}`}>
          {ORIGEN_LABELS[row.origen] || row.origen}
        </span>
      ),
    },
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
      key: "cliente_nombre",
      label: "Cliente",
      render: (row) => row.cliente_nombre || <span style={{ color: "#94a3b8" }}>—</span>,
    },
    {
      key: "descripcion_dano",
      label: "Descripción",
      render: (row) => {
        const desc = row.descripcion_dano || "";
        if (!desc) return <span style={{ color: "#94a3b8" }}>—</span>;
        const truncated = desc.length > 50 ? desc.substring(0, 50) + "…" : desc;
        return (
          <span title={desc} style={{ fontSize: "0.85rem" }}>
            {truncated}
          </span>
        );
      },
    },
    {
      key: "fecha_reporte_dano",
      label: "Reportado",
      render: (row) => formatDate(row.fecha_reporte_dano),
    },
    {
      key: "estado_producto",
      label: "Estado",
      render: (row) => (
        <span className={`status-badge dan-estado-${row.estado_producto.replace("_", "-")}`}>
          {row.estado_producto_display || row.estado_producto}
        </span>
      ),
    },
  ];

  const customActions = [
    {
      icon: PlayCircle,
      handler: handleIniciar,
      show: (row) => row.estado_producto === "por_reparar",
      title: "Iniciar Reparación",
    },
    {
      icon: CheckCircle,
      handler: handleCompletar,
      show: (row) => row.estado_producto === "en_reparacion",
      title: "Completar Reparación",
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Equipos Dañados"
          icon={Wrench}
          description="Monitorea las unidades en el flujo de reparación"
        />

        <div className="fb-bar">
          <span className="fb-label">
            <SlidersHorizontal size={14} />
            Filtrar:
          </span>

          <div className="fb-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Serial, producto o cliente..."
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
            value={filterOrigen}
            onChange={(e) => setFilterOrigen(e.target.value)}
          >
            <option value="">Todos los orígenes</option>
            <option value="stock">Stock</option>
            <option value="venta">Venta</option>
            <option value="separacion">Separación</option>
            <option value="metodo_aliado">Método Aliado</option>
          </select>

          <select
            className="fb-select"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="por_reparar">Por Reparar</option>
            <option value="en_reparacion">En Reparación</option>
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

          <div className="fb-divider" />

          <select
            className="fb-select"
            value={datePreset}
            onChange={(e) => handleDatePresetChange(e.target.value)}
          >
            {DATE_RANGE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          <input
            type="date"
            className="fb-input"
            value={dateFrom}
            disabled={isCustomPreset}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="fb-input"
            value={dateTo}
            disabled={isCustomPreset}
            onChange={(e) => setDateTo(e.target.value)}
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
          customActions={customActions}
          loading={loading}
        />

        {confirmDialog && (
          <ConfirmModal
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmLabel={confirmDialog.confirmLabel}
            isDestructive={confirmDialog.isDestructive}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        )}

        {notify && (
          <NotifyModal
            variant={notify.variant}
            title={notify.title}
            message={notify.message}
            onClose={() => setNotify(null)}
          />
        )}
      </div>
    </section>
  );
};

export default Danados;
