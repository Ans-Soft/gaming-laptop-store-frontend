import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, Activity, AlertTriangle, CheckCircle, Filter } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import { getSyncLogs, getListingsSyncState } from "../../services/SyncBajoPedidoService";
import "../../styles/admin/dataTable.css";
import "../../styles/admin/filtersBar.css";
import "../../styles/global.css";
import "../../styles/admin/syncBajoPedidoMonitor.css";

// ── Constants ────────────────────────────────────────────────────────────────

const RESULTADO_OPTIONS = [
  { key: "", label: "Todos los resultados" },
  { key: "precio_subido",      label: "Precio subido" },
  { key: "sin_cambio",         label: "Sin cambio" },
  { key: "margen_para_bajar",  label: "Margen para bajar" },
  { key: "agotado_seller",     label: "Agotado (seller)" },
  { key: "agotado_fallos",     label: "Agotado (fallos)" },
  { key: "fallo_ebay",         label: "Fallo eBay" },
  { key: "sin_unidades_skip",  label: "Skip (sin unidades)" },
  { key: "con_unidades_skip",  label: "Skip (con unidades)" },
];

const DIAS_OPTIONS = [
  { value: 7,  label: "Últimos 7 días" },
  { value: 30, label: "Últimos 30 días" },
  { value: 90, label: "Últimos 90 días" },
  { value: 0,  label: "Todo el historial" },
];

// Badge color by resultado key
const RESULTADO_BADGE_CLASS = {
  precio_subido:     "sbp-badge--success",
  sin_cambio:        "sbp-badge--success",
  margen_para_bajar: "sbp-badge--warning",
  agotado_seller:    "sbp-badge--danger",
  agotado_fallos:    "sbp-badge--danger",
  fallo_ebay:        "sbp-badge--danger",
  sin_unidades_skip: "sbp-badge--skip",
  con_unidades_skip: "sbp-badge--skip",
};

// Badge color for disponibilidad_ebay
const DISP_BADGE_CLASS = {
  disponible:    "sbp-badge--success",
  agotado:       "sbp-badge--danger",
  desconocido:   "sbp-badge--skip",
};

// ── Formatters ───────────────────────────────────────────────────────────────

/** Formats a decimal-string or number as COP currency. Returns "—" for null/empty. */
function formatCOP(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (isNaN(n)) return "—";
  return "$" + n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

/** Formats a decimal-string as USD. Returns "—" for null/empty. */
function formatUSD(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (isNaN(n)) return "—";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Formats a decimal-string as a plain number. Returns "—" for null/empty. */
function formatDecimal(value, decimals = 0) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (isNaN(n)) return "—";
  return n.toLocaleString("es-CO", { maximumFractionDigits: decimals });
}

/** Formats an ISO date string as "DD/MM/YYYY HH:mm" in local time. */
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ResultadoBadge({ resultado, resultadoDisplay }) {
  const cls = RESULTADO_BADGE_CLASS[resultado] ?? "sbp-badge--skip";
  return (
    <span className={`status-badge sbp-badge ${cls}`}>
      {resultadoDisplay || resultado || "—"}
    </span>
  );
}

function DispBadge({ clave, display }) {
  const cls = DISP_BADGE_CLASS[clave] ?? "sbp-badge--skip";
  return (
    <span className={`status-badge sbp-badge ${cls}`}>
      {display || clave || "—"}
    </span>
  );
}

function PriceArrow({ anterior, nuevo }) {
  const a = Number(anterior);
  const n = Number(nuevo);
  if (!anterior && !nuevo) return <span className="cell-secondary">—</span>;
  if (!anterior || isNaN(a)) return <span className="cell-primary">{formatCOP(nuevo)}</span>;
  if (!nuevo    || isNaN(n)) return <span className="cell-primary">{formatCOP(anterior)}</span>;
  const arrow = n > a ? "↑" : n < a ? "↓" : "→";
  const arrowCls = n > a ? "sbp-arrow--up" : n < a ? "sbp-arrow--down" : "sbp-arrow--neutral";
  return (
    <span className="sbp-price-change">
      <span className="cell-secondary">{formatCOP(anterior)}</span>
      <span className={`sbp-arrow ${arrowCls}`}>{arrow}</span>
      <span className="cell-primary--strong">{formatCOP(nuevo)}</span>
    </span>
  );
}

function ErrorCell({ msg }) {
  if (!msg) return <span className="cell-secondary">—</span>;
  const short = msg.length > 60 ? msg.slice(0, 57) + "..." : msg;
  return (
    <span className="sbp-error-cell" title={msg}>
      {short}
    </span>
  );
}

// ── Column definitions ───────────────────────────────────────────────────────

const LOG_COLUMNS = [
  {
    key: "checked_at",
    label: "Fecha",
    render: (row) => (
      <span className="cell-code">{formatDate(row.checked_at)}</span>
    ),
  },
  {
    key: "producto_nombre",
    label: "Producto",
    render: (row) => (
      <div>
        <div className="cell-primary--strong">{row.producto_nombre || "—"}</div>
        <div className="cell-secondary">{row.condicion_display || row.condicion || ""}</div>
      </div>
    ),
  },
  {
    key: "resultado",
    label: "Resultado",
    render: (row) => (
      <ResultadoBadge resultado={row.resultado} resultadoDisplay={row.resultado_display} />
    ),
  },
  {
    key: "was_available",
    label: "Disponible",
    render: (row) =>
      row.was_available ? (
        <span className="sbp-badge sbp-badge--success status-badge">Sí</span>
      ) : (
        <span className="sbp-badge sbp-badge--danger status-badge">No</span>
      ),
  },
  {
    key: "price_usd",
    label: "USD",
    render: (row) => (
      <span className="cell-primary">{formatUSD(row.price_usd)}</span>
    ),
  },
  {
    key: "trm_used",
    label: "TRM",
    render: (row) => (
      <span className="cell-secondary">{formatDecimal(row.trm_used, 0)}</span>
    ),
  },
  {
    key: "precio",
    label: "Precio COP",
    render: (row) => (
      <PriceArrow anterior={row.precio_anterior} nuevo={row.precio_nuevo} />
    ),
  },
  {
    key: "seller_username",
    label: "Vendedor",
    render: (row) => (
      <div className="sbp-seller-cell">
        <span className="cell-primary">{row.seller_username || "—"}</span>
        {row.seller_is_trusted && (
          <span className="sbp-trusted-badge" title="Seller confiable">
            Confiable
          </span>
        )}
      </div>
    ),
  },
  {
    key: "error_message",
    label: "Error",
    render: (row) => <ErrorCell msg={row.error_message} />,
  },
];

const LISTING_COLUMNS = [
  {
    key: "producto_nombre",
    label: "Producto",
    render: (row) => (
      <div>
        <div className="cell-primary--strong">{row.producto_nombre || "—"}</div>
        <div className="cell-secondary">{row.condicion_display || row.condicion || ""}</div>
      </div>
    ),
  },
  {
    key: "disponibilidad_ebay",
    label: "Disponibilidad eBay",
    render: (row) =>
      row.disponibilidad_ebay ? (
        <DispBadge
          clave={row.disponibilidad_ebay}
          display={row.disponibilidad_ebay_display}
        />
      ) : (
        <span className="cell-secondary">—</span>
      ),
  },
  {
    key: "fallos_consecutivos",
    label: "Fallos",
    render: (row) => {
      const n = row.fallos_consecutivos ?? 0;
      return (
        <span className={n > 0 ? "sbp-fallos--nonzero" : "cell-secondary"}>
          {n}
        </span>
      );
    },
  },
  {
    key: "ultimo_sync_at",
    label: "Último sync",
    render: (row) => (
      <span className="cell-code">{formatDate(row.ultimo_sync_at)}</span>
    ),
  },
  {
    key: "ultimo_vendedor",
    label: "Último vendedor",
    render: (row) => (
      <span className="cell-primary">{row.ultimo_vendedor || "—"}</span>
    ),
  },
  {
    key: "precio",
    label: "Precio actual (COP)",
    render: (row) => (
      <span className="cell-primary">{formatCOP(row.precio)}</span>
    ),
  },
];

// ── Main Page ────────────────────────────────────────────────────────────────

const SyncBajoPedidoMonitor = () => {
  // Filters
  const [dias, setDias] = useState(30);
  const [resultado, setResultado] = useState("");

  // Data
  const [logs, setLogs] = useState([]);
  const [listings, setListings] = useState([]);

  // Loading/error
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const data = await getSyncLogs({ dias, resultado });
      setLogs(data);
    } catch (err) {
      console.error("Error cargando logs de sync:", err);
      setLogsError("No se pudieron cargar los registros. Verifica tu conexión e intenta de nuevo.");
    } finally {
      setLogsLoading(false);
    }
  }, [dias, resultado]);

  const fetchListings = useCallback(async () => {
    setListingsLoading(true);
    setListingsError(null);
    try {
      const data = await getListingsSyncState();
      // Filter only those that have at least an eBay link or sync data
      setListings(data.filter((bp) => bp.active !== false));
    } catch (err) {
      console.error("Error cargando estado de listings:", err);
      setListingsError("No se pudo cargar el estado de listings.");
    } finally {
      setListingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Stats derived from logs
  const stats = [
    {
      label: "Registros en vista",
      count: logs.length,
      icon: <Activity className="icon-card" />,
    },
    {
      label: "Precio subido",
      count: logs.filter((l) => l.resultado === "precio_subido").length,
      icon: <CheckCircle className="icon-card" />,
    },
    {
      label: "Fallos eBay",
      count: logs.filter((l) => l.resultado === "fallo_ebay").length,
      icon: <AlertTriangle className="icon-card" />,
    },
    {
      label: "Agotados",
      count: logs.filter((l) =>
        l.resultado === "agotado_seller" || l.resultado === "agotado_fallos"
      ).length,
      icon: <AlertTriangle className="icon-card" />,
    },
  ];

  const handleResetFilters = () => {
    setDias(30);
    setResultado("");
  };

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Monitor Sync Bajo Pedido"
          icon={RefreshCw}
          description="Historial de actualizaciones automáticas de precio en variantes Bajo Pedido con enlace eBay."
        />

        {/* Filters bar */}
        <div className="fb-bar sbp-filters-bar">
          <span className="fb-label">
            <Filter size={14} />
            Filtros
          </span>
          <div className="fb-divider" />

          <div className="fb-group">
            <label className="fb-label">Ventana</label>
            <select
              className="fb-select"
              value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
            >
              {DIAS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="fb-divider" />

          <div className="fb-group">
            <label className="fb-label">Resultado</label>
            <select
              className="fb-select"
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
            >
              {RESULTADO_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="fb-divider" />

          <button className="fb-clear" onClick={handleResetFilters}>
            Limpiar
          </button>
        </div>

        <CountCard stats={stats} />

        {/* ── Log table ── */}
        <div className="sbp-section-title">
          <Activity size={16} />
          <span>Historial de sincronización</span>
        </div>

        {logsError && (
          <div className="sbp-error-banner">
            <AlertTriangle size={16} />
            {logsError}
          </div>
        )}

        {logsLoading ? (
          <div className="sbp-loading">Cargando registros...</div>
        ) : (
          <DataTable
            columns={LOG_COLUMNS}
            data={logs}
            rowKey="id"
            showEdit={false}
          />
        )}

        {/* ── Listings state table ── */}
        <div className="sbp-section-title sbp-section-title--secondary">
          <RefreshCw size={16} />
          <span>Estado actual por listing</span>
        </div>

        {listingsError && (
          <div className="sbp-error-banner">
            <AlertTriangle size={16} />
            {listingsError}
          </div>
        )}

        {listingsLoading ? (
          <div className="sbp-loading">Cargando estado de listings...</div>
        ) : (
          <DataTable
            columns={LISTING_COLUMNS}
            data={listings}
            rowKey="id"
            showEdit={false}
          />
        )}
      </div>
    </section>
  );
};

export default SyncBajoPedidoMonitor;
