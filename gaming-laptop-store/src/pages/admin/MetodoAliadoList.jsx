import React, { useEffect, useState } from "react";
import "../../styles/admin/dataTable.css";
import "../../styles/global.css";
import "../../styles/admin/filtersBar.css";
import "../../styles/admin/ventasPage.css";
import {
  Handshake,
  Package,
  Truck,
  CheckCircle,
  DollarSign,
  Calendar,
  SlidersHorizontal,
  Search,
  Send,
  X,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import ConfirmModal from "../../components/admin/ConfirmModal";
import NotifyModal from "../../components/admin/NotifyModal";
import ReportarDanoModal from "../../components/admin/ReportarDanoModal";
import {
  getMetodoAliadoUnidades,
  marcarEnviadaMetodoAliado,
  marcarEntregadaMetodoAliado,
  cancelarMetodoAliado,
} from "../../services/MetodoAliadoService";
import { DATE_RANGE_PRESETS, computeDateRange, matchesDateRange } from "../../utils/dateRangeFilter";

const CONDICION_LABELS = {
  nuevo: "Nuevo",
  open_box: "Open Box",
  refurbished: "Refurbished",
  usado: "Usado",
};

const deriveEstadoEnvio = (u) => {
  if (u.estado_producto === "entregado" || u.fecha_entrega_metodo_aliado) return "entregado";
  if (u.fecha_envio_metodo_aliado) return "en_transito";
  return "pendiente";
};

const ESTADO_ENVIO_LABELS = {
  pendiente: "Pendiente envío",
  en_transito: "En tránsito",
  entregado: "Entregado",
};

const formatCOP = (value) => "$" + Number(value || 0).toLocaleString("es-CO");

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const MetodoAliadoList = () => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [notify, setNotify] = useState(null);
  const [reportarDanoTarget, setReportarDanoTarget] = useState(null);
  const [enviarTarget, setEnviarTarget] = useState(null);
  const [enviarForm, setEnviarForm] = useState({ transportadora: "", numero_guia: "" });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCondicion, setFilterCondicion] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterCiudad, setFilterCiudad] = useState("");
  const [filterValorMin, setFilterValorMin] = useState("");
  const [filterValorMax, setFilterValorMax] = useState("");
  const [datePreset, setDatePreset] = useState("mes_actual");
  const [dateFrom, setDateFrom] = useState(() => computeDateRange("mes_actual").from);
  const [dateTo, setDateTo] = useState(() => computeDateRange("mes_actual").to);

  useEffect(() => {
    loadUnidades();
  }, []);

  const loadUnidades = async () => {
    setLoading(true);
    try {
      const data = await getMetodoAliadoUnidades();
      setUnidades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando método aliado:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const isFiltersActive =
    searchTerm.trim() ||
    filterCondicion ||
    filterEstado ||
    filterCiudad ||
    filterValorMin ||
    filterValorMax ||
    datePreset !== "mes_actual";

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCondicion("");
    setFilterEstado("");
    setFilterCiudad("");
    setFilterValorMin("");
    setFilterValorMax("");
    setDatePreset("mes_actual");
    const range = computeDateRange("mes_actual");
    setDateFrom(range.from);
    setDateTo(range.to);
  };

  const ciudadesDisponibles = [...new Set(
    unidades.map((u) => u.ciudad_envio_metodo_aliado_nombre).filter(Boolean)
  )].sort();

  const filtered = unidades.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const haystack = [
        u.serial, u.producto_nombre, u.producto_marca,
        u.cliente_metodo_aliado_nombre, u.ciudad_envio_metodo_aliado_nombre,
        u.transportadora_metodo_aliado, u.numero_guia_metodo_aliado,
      ].map((v) => (v || "").toLowerCase()).join(" ");
      if (!haystack.includes(term)) return false;
    }
    if (filterCondicion && u.condicion !== filterCondicion) return false;
    if (filterEstado && deriveEstadoEnvio(u) !== filterEstado) return false;
    if (filterCiudad && u.ciudad_envio_metodo_aliado_nombre !== filterCiudad) return false;

    const precio = Number(u.precio || 0);
    if (filterValorMin && precio < Number(filterValorMin)) return false;
    if (filterValorMax && precio > Number(filterValorMax)) return false;

    if (!matchesDateRange(u.fecha_solicitud_metodo_aliado, dateFrom, dateTo)) return false;
    return true;
  });

  // ── Actions ────────────────────────────────────────────────────────────
  const openEnviar = (u) => {
    setEnviarTarget(u);
    setEnviarForm({
      transportadora: u.transportadora_metodo_aliado || "",
      numero_guia: u.numero_guia_metodo_aliado || "",
    });
  };

  const confirmEnviar = async () => {
    if (!enviarTarget) return;
    try {
      await marcarEnviadaMetodoAliado(enviarTarget.id, {
        transportadora_metodo_aliado: enviarForm.transportadora.trim(),
        numero_guia_metodo_aliado: enviarForm.numero_guia.trim(),
      });
      setEnviarTarget(null);
      loadUnidades();
      setNotify({
        variant: "success",
        title: "Envío registrado",
        message: "Se registró el envío con la transportadora y guía indicadas.",
      });
    } catch (error) {
      console.error("Error al marcar enviada:", error);
      const msg = error.response?.data?.error || "No se pudo registrar el envío.";
      setNotify({ variant: "error", title: "Error", message: msg });
    }
  };

  const handleMarcarEntregada = (u) => {
    setConfirmDialog({
      title: `¿Marcar unidad ${u.serial} como entregada?`,
      message: `Se registrará la fecha de entrega. El cliente ${u.cliente_metodo_aliado_nombre || ""} recibe la unidad en ${u.ciudad_envio_metodo_aliado_nombre || ""}.`,
      confirmLabel: "Sí, marcar entregada",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await marcarEntregadaMetodoAliado(u.id);
          loadUnidades();
        } catch (error) {
          console.error("Error al marcar entregada:", error);
          setNotify({
            variant: "error",
            title: "Error",
            message: error.response?.data?.error || "No se pudo registrar la entrega.",
          });
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleCancelar = (u) => {
    setConfirmDialog({
      title: `¿Cancelar solicitud de método aliado?`,
      message: `La unidad ${u.serial} volverá a estar disponible en stock. Se limpiarán todos los datos del envío.`,
      confirmLabel: "Sí, cancelar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await cancelarMetodoAliado(u.id);
          loadUnidades();
        } catch (error) {
          console.error("Error al cancelar:", error);
          setNotify({
            variant: "error",
            title: "Error",
            message: error.response?.data?.error || "No se pudo cancelar la solicitud.",
          });
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleReportarDano = (u) => {
    setReportarDanoTarget({
      unidad: { id: u.id, serial: u.serial, producto_nombre: u.producto_nombre },
      clienteNombre: u.cliente_metodo_aliado_nombre,
    });
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const now = new Date();
  const mesActualFrom = new Date(now.getFullYear(), now.getMonth(), 1);

  const pendientes = unidades.filter((u) => deriveEstadoEnvio(u) === "pendiente");
  const enTransito = unidades.filter((u) => deriveEstadoEnvio(u) === "en_transito");
  const entregados = unidades.filter((u) => deriveEstadoEnvio(u) === "entregado");

  const solicitadasMes = unidades.filter((u) => {
    if (!u.fecha_solicitud_metodo_aliado) return false;
    return new Date(u.fecha_solicitud_metodo_aliado) >= mesActualFrom;
  });
  const ingresosMes = solicitadasMes.reduce((s, u) => s + Number(u.precio || 0), 0);

  const stats = [
    {
      label: "Total Método Aliado",
      count: unidades.length,
      icon: <Handshake className="icon-card" style={{ stroke: "#1e40af", color: "#1e40af", backgroundColor: "#dbeafe" }} />,
    },
    {
      label: "Pendientes de envío",
      count: pendientes.length,
      icon: <Package className="icon-card" style={{ stroke: "#c2410c", color: "#c2410c", backgroundColor: "#fff7ed" }} />,
    },
    {
      label: "En tránsito",
      count: enTransito.length,
      icon: <Truck className="icon-card" style={{ stroke: "#7c3aed", color: "#7c3aed", backgroundColor: "#ede9fe" }} />,
    },
    {
      label: "Entregadas",
      count: entregados.length,
      icon: <CheckCircle className="icon-card" style={{ stroke: "#065f46", color: "#065f46", backgroundColor: "#d1fae5" }} />,
    },
    {
      label: "Solicitadas este mes",
      count: solicitadasMes.length,
      icon: <Calendar className="icon-card" style={{ stroke: "#1d4ed8", color: "#1d4ed8", backgroundColor: "#dbeafe" }} />,
    },
    {
      label: "Ingresos del mes",
      count: formatCOP(ingresosMes),
      icon: <DollarSign className="icon-card" style={{ stroke: "#166534", color: "#166534", backgroundColor: "#dcfce7" }} />,
    },
  ];

  // ── Columns ─────────────────────────────────────────────────────────────
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
      render: (row) => (
        <span className={`vp-condicion-${row.condicion}`}>
          {CONDICION_LABELS[row.condicion] || row.condicion}
        </span>
      ),
    },
    {
      key: "cliente_metodo_aliado_nombre",
      label: "Cliente",
      render: (row) => (
        <span style={{ fontWeight: 500 }}>{row.cliente_metodo_aliado_nombre || "—"}</span>
      ),
    },
    {
      key: "ciudad_envio_metodo_aliado_nombre",
      label: "Ciudad envío",
      render: (row) => row.ciudad_envio_metodo_aliado_nombre ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <MapPin size={13} style={{ color: "var(--subtitle-color)" }} />
          {row.ciudad_envio_metodo_aliado_nombre}
        </span>
      ) : (
        <span style={{ color: "var(--subtitle-color)" }}>—</span>
      ),
    },
    {
      key: "transportadora_metodo_aliado",
      label: "Transportadora",
      render: (row) => row.transportadora_metodo_aliado || <span style={{ color: "#9ca3af" }}>—</span>,
    },
    {
      key: "numero_guia_metodo_aliado",
      label: "Guía",
      render: (row) => row.numero_guia_metodo_aliado ? (
        <code style={{ fontSize: "0.78rem" }}>{row.numero_guia_metodo_aliado}</code>
      ) : (
        <span style={{ color: "#9ca3af" }}>—</span>
      ),
    },
    {
      key: "fecha_solicitud_metodo_aliado",
      label: "Solicitada",
      render: (row) => formatDate(row.fecha_solicitud_metodo_aliado),
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
      key: "estado_envio",
      label: "Estado",
      render: (row) => {
        const e = deriveEstadoEnvio(row);
        const classMap = {
          pendiente: "vp-badge-por-entregar",
          en_transito: "vp-condicion-open_box",
          entregado: "vp-badge-entregado",
        };
        return <span className={classMap[e]}>{ESTADO_ENVIO_LABELS[e]}</span>;
      },
    },
  ];

  const customActions = [
    {
      show: (row) => deriveEstadoEnvio(row) === "pendiente",
      icon: Send,
      title: "Marcar enviada",
      handler: openEnviar,
    },
    {
      show: (row) => deriveEstadoEnvio(row) === "en_transito",
      icon: CheckCircle,
      title: "Marcar entregada",
      handler: handleMarcarEntregada,
    },
    {
      show: (row) => deriveEstadoEnvio(row) !== "entregado",
      icon: AlertTriangle,
      title: "Reportar dañado",
      handler: handleReportarDano,
      destructive: true,
    },
    {
      show: (row) => deriveEstadoEnvio(row) !== "entregado",
      icon: X,
      title: "Cancelar solicitud",
      handler: handleCancelar,
      destructive: true,
    },
  ];

  const isCustomPreset = datePreset !== "personalizado";

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Método Aliado"
          icon={Handshake}
          description="Unidades solicitadas por método aliado y su estado de envío"
        />

        <SearchBox />

        <div className="fb-bar">
          <span className="fb-label">
            <SlidersHorizontal size={14} />
            Filtrar:
          </span>

          <div className="fb-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Serial, producto, cliente, guía..."
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
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_ENVIO_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          <select
            className="fb-select"
            value={filterCiudad}
            onChange={(e) => setFilterCiudad(e.target.value)}
          >
            <option value="">Todas las ciudades</option>
            {ciudadesDisponibles.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
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
          loading={loading}
          customActions={customActions}
        />

        {enviarTarget && (
          <div className="modal-overlay" onClick={() => setEnviarTarget(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "480px", padding: "1.5rem" }}
            >
              <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>
                Registrar envío — {enviarTarget.serial}
              </h3>
              <p style={{ color: "var(--subtitle-color)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                Ingresa la transportadora y el número de guía para dejar trazabilidad del envío.
              </p>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.3rem" }}>
                    Transportadora
                  </label>
                  <input
                    type="text"
                    className="fb-input"
                    placeholder="Ej: Servientrega, Interrapidísimo..."
                    value={enviarForm.transportadora}
                    onChange={(e) => setEnviarForm((f) => ({ ...f, transportadora: e.target.value }))}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.3rem" }}>
                    Número de guía
                  </label>
                  <input
                    type="text"
                    className="fb-input"
                    placeholder="Ej: 1234567890"
                    value={enviarForm.numero_guia}
                    onChange={(e) => setEnviarForm((f) => ({ ...f, numero_guia: e.target.value }))}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1.25rem" }}>
                <button className="fb-clear" onClick={() => setEnviarTarget(null)}>
                  Cancelar
                </button>
                <button
                  className="fb-clear"
                  style={{ background: "#1e40af", color: "#fff", borderColor: "#1e40af" }}
                  onClick={confirmEnviar}
                >
                  Registrar envío
                </button>
              </div>
            </div>
          </div>
        )}

        {reportarDanoTarget && (
          <ReportarDanoModal
            unidad={reportarDanoTarget.unidad}
            origen="metodo_aliado"
            clienteNombre={reportarDanoTarget.clienteNombre}
            onClose={() => setReportarDanoTarget(null)}
            onSuccess={loadUnidades}
          />
        )}

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

export default MetodoAliadoList;
