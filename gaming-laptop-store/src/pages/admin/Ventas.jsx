import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import {
  ShoppingCart,
  CheckCircle,
  DollarSign,
  Calendar,
  Truck,
  Edit,
  Eye,
  Trash2,
  Mail,
  AlertTriangle,
  SlidersHorizontal,
  Search,
  Package,
  Store,
} from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import VentaForm from "../../components/admin/VentaForm";
import ConfirmModal from "../../components/admin/ConfirmModal";
import GenerarReciboVentaModal from "../../components/admin/GenerarReciboVentaModal";
import NotifyModal from "../../components/admin/NotifyModal";
import ReportarDanoModal from "../../components/admin/ReportarDanoModal";
import SeleccionarUnidadDanoModal from "../../components/admin/SeleccionarUnidadDanoModal";
import MarcarEnvioModal from "../../components/admin/MarcarEnvioModal";
import * as VentaService from "../../services/VentaService";
import * as InvoiceService from "../../services/InvoiceService";
import "../../styles/admin/ventasPage.css";
import "../../styles/admin/filtersBar.css";
import { matchesDateRange } from "../../utils/dateRangeFilter";
import { useDateRange } from "../../hooks/useDateRange";

const CONDICION_LABELS = {
  nuevo: "Nuevo",
  open_box: "Open Box",
  refurbished: "Refurbished",
  usado: "Usado",
};

const Ventas = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [generarReciboTarget, setGenerarReciboTarget] = useState(null);
  const [notify, setNotify] = useState(null);

  // Damage-reporting state
  const [reportarDanoTarget, setReportarDanoTarget] = useState(null);
  const [seleccionarUnidadTarget, setSeleccionarUnidadTarget] = useState(null);

  // Shipment registration state
  const [envioTarget, setEnvioTarget] = useState(null);

  // Date range comes from the global header selector (DateRangeContext)
  const { from: dateFrom, to: dateTo } = useDateRange();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCondicion, setFilterCondicion] = useState("");
  const [filterEstadoEntrega, setFilterEstadoEntrega] = useState("");
  const [filterValorMin, setFilterValorMin] = useState("");
  const [filterValorMax, setFilterValorMax] = useState("");

  useEffect(() => {
    loadVentas();
  }, []);

  const loadVentas = async () => {
    setLoading(true);
    try {
      const data = await VentaService.getVentas();
      setVentas(Array.isArray(data) ? data : data.ventas || []);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Filtering ───────────────────────────────────────────────────────────
  const isFiltersActive =
    searchTerm.trim() ||
    filterCondicion ||
    filterEstadoEntrega ||
    filterValorMin ||
    filterValorMax;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCondicion("");
    setFilterEstadoEntrega("");
    setFilterValorMin("");
    setFilterValorMax("");
  };

  const filteredVentas = ventas.filter((v) => {
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const matchCliente = (v.cliente_nombre || "").toLowerCase().includes(term);
      const matchSerial = (v.items || []).some((i) =>
        (i.unidad_serial || "").toLowerCase().includes(term)
      );
      if (!matchCliente && !matchSerial) return false;
    }

    if (filterCondicion) {
      const allCondiciones = (v.items || []).map((i) => i.unidad_condicion);
      if (!allCondiciones.includes(filterCondicion)) return false;
    }

    if (filterEstadoEntrega && v.estado_entrega !== filterEstadoEntrega) return false;

    const total = Number(v.total || 0);
    if (filterValorMin && total < Number(filterValorMin)) return false;
    if (filterValorMax && total > Number(filterValorMax)) return false;

    if (!matchesDateRange(v.fecha, dateFrom, dateTo)) return false;

    return true;
  });

  // ── Action handlers ─────────────────────────────────────────────────────
  const handleCreateNew = () => {
    setSelectedVenta(null);
    setShowModal(true);
  };

  const handleEdit = (venta) => {
    setSelectedVenta(venta);
    setShowModal(true);
  };

  const handleView = (venta) => {
    navigate(`/admin/ventas/${venta.id}`);
  };

  const handleDelete = (venta) => {
    setConfirmDialog({
      title: `¿Eliminar venta #${venta.id}?`,
      message: `Se eliminará permanentemente la venta de ${venta.cliente_nombre}. Las unidades vendidas volverán a estar disponibles.`,
      confirmLabel: "Sí, eliminar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await VentaService.deleteVenta(venta.id);
          loadVentas();
        } catch (error) {
          console.error("Error al eliminar venta:", error);
          setNotify({
            variant: "error",
            title: "Error al eliminar",
            message: "No se pudo eliminar la venta. Intenta nuevamente.",
          });
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // ── Damage reporting ────────────────────────────────────────────────────
  const handleReportarDano = (venta) => {
    const elegibles = (venta.items || []).filter(
      (i) => i.unidad_estado_venta !== "danado"
    );
    if (elegibles.length === 0) return;

    if (elegibles.length === 1) {
      const item = elegibles[0];
      setReportarDanoTarget({
        ventaId: venta.id,
        clienteNombre: venta.cliente_nombre,
        unidad: {
          id: item.unidad_producto,
          serial: item.unidad_serial,
          producto_nombre: item.producto_nombre,
        },
      });
    } else {
      setSeleccionarUnidadTarget(venta);
    }
  };

  const handleUnidadSelected = (item) => {
    if (!seleccionarUnidadTarget) return;
    setSeleccionarUnidadTarget(null);
    setReportarDanoTarget({
      ventaId: seleccionarUnidadTarget.id,
      clienteNombre: seleccionarUnidadTarget.cliente_nombre,
      unidad: {
        id: item.unidad_producto,
        serial: item.unidad_serial,
        producto_nombre: item.producto_nombre,
      },
    });
  };

  // ── Recibo ──────────────────────────────────────────────────────────────
  const resendExistingRecibo = async (invoice) => {
    try {
      await InvoiceService.resendInvoiceEmail(invoice.id);
      setNotify({
        variant: "success",
        title: "Recibo reenviado",
        message: "El recibo existente fue reenviado por correo al cliente exitosamente.",
      });
    } catch (error) {
      console.error("Error al reenviar recibo:", error);
      const data = error.response?.data;
      const msg =
        data?.error ||
        data?.detail ||
        "No se pudo reenviar el recibo por correo. Verifica tu conexión e intenta nuevamente.";
      setNotify({
        variant: "error",
        title: "Error al reenviar",
        message: typeof msg === "object" ? JSON.stringify(msg) : msg,
      });
    }
  };

  const handleEnviarRecibo = async (venta) => {
    try {
      const data = await InvoiceService.getInvoices();
      const invoices = Array.isArray(data) ? data : data.invoices || [];
      const existing = invoices.find(
        (inv) => inv.venta === venta.id && inv.active !== false
      );

      if (existing) {
        setConfirmDialog({
          title: "Reenviar recibo existente",
          message: `Ya existe el recibo ${existing.bill_id} para esta venta. ¿Deseas reenviarlo por correo al cliente?`,
          confirmLabel: "Sí, reenviar",
          isDestructive: false,
          onConfirm: async () => {
            setConfirmDialog(null);
            await resendExistingRecibo(existing);
          },
        });
        return;
      }

      setGenerarReciboTarget(venta);
    } catch (error) {
      console.error("Error al enviar recibo:", error);
      const data = error.response?.data;
      const msg =
        data?.error || data?.detail || "No se pudo consultar los recibos existentes";
      setNotify({
        variant: "error",
        title: "Error al enviar recibo",
        message: typeof msg === "object" ? JSON.stringify(msg) : msg,
      });
    }
  };

  const handleGenerarReciboSubmit = async (invoiceData) => {
    try {
      await InvoiceService.createInvoice(invoiceData);
      setGenerarReciboTarget(null);
      setNotify({
        variant: "success",
        title: "Recibo enviado",
        message: "El recibo fue generado y enviado por correo al cliente exitosamente.",
      });
    } catch (error) {
      console.error("Error al generar recibo:", error);
      const data = error.response?.data;
      let msg =
        data?.error ||
        data?.detail ||
        (Array.isArray(data?.serial_item) ? data.serial_item[0] : data?.serial_item) ||
        (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : null) ||
        "No se pudo generar el recibo. Intenta nuevamente.";

      if (typeof msg === "string" && msg.toLowerCase().includes("bill_id")) {
        msg =
          "Ya existe un recibo con esa fecha y serial para esta venta. Cambia la fecha del recibo para generar uno nuevo.";
      }
      setNotify({
        variant: "error",
        title: "Error al generar recibo",
        message: typeof msg === "object" ? JSON.stringify(msg) : msg,
      });
    }
  };

  const handleEnvioSubmit = async (payload) => {
    if (!envioTarget) return;
    try {
      await VentaService.updateVenta(envioTarget.id, payload);
      setEnvioTarget(null);
      loadVentas();
      setNotify({
        variant: "success",
        title: "Envío actualizado",
        message:
          payload.tipo_entrega === "local"
            ? "Marcada como entrega en oficina."
            : `Tracking ${payload.numero_guia} (${payload.transportadora}) registrado.`,
      });
    } catch (error) {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "No se pudo guardar el envío.";
      throw new Error(typeof msg === "object" ? JSON.stringify(msg) : msg);
    }
  };

  const handleSubmit = async (formData, ventaId, invoiceData) => {
    try {
      if (ventaId) {
        await VentaService.updateVenta(ventaId, {
          cliente: formData.cliente,
          notas: formData.notas,
          estado_entrega: formData.estado_entrega,
        });
      } else {
        const result = await VentaService.createVenta({
          cliente: formData.cliente,
          notas: formData.notas,
          separacion: formData.separacion || null,
          items_data: formData.items_data,
          estado_entrega: formData.estado_entrega,
        });
        const venta = result.venta || result;

        if (invoiceData && venta?.id) {
          const items = formData.items_data || [];
          const serials = items
            .map((i) => i.unidad_serial)
            .filter(Boolean)
            .join(", ");
          const total = items.reduce((s, i) => s + parseFloat(i.precio || 0), 0);
          try {
            await InvoiceService.createInvoice({
              cliente: formData.cliente,
              venta: venta.id,
              concepto: "venta",
              serial_item: serials || `VENTA-${venta.id}`,
              total_amount: total,
              payment_method: invoiceData.payment_method,
              due_date: invoiceData.due_date,
            });
          } catch (invoiceErr) {
            console.warn(
              "Venta creada, pero error al generar la factura:",
              invoiceErr?.response?.data || invoiceErr
            );
          }
        }
      }
      setShowModal(false);
      loadVentas();
    } catch (error) {
      console.error("Error al guardar venta:", error);
      setNotify({
        variant: "error",
        title: "Error al guardar",
        message: "No se pudo guardar la venta. Intenta nuevamente.",
      });
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────
  const formatCOP = (value) => "$" + Number(value || 0).toLocaleString("es-CO");

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ── Stats (computed from all ventas, not filtered) ──────────────────────
  const now = new Date();
  const mesActualFrom = new Date(now.getFullYear(), now.getMonth(), 1);

  const ventasEsteMes = ventas.filter((v) => {
    const d = new Date(v.fecha);
    return d >= mesActualFrom;
  });

  const ingresosMes = ventasEsteMes.reduce((s, v) => s + Number(v.total || 0), 0);
  const ingresosTotales = ventas.reduce((s, v) => s + Number(v.total || 0), 0);

  const stats = [
    {
      label: "Total Ventas",
      count: ventas.length,
      icon: (
        <ShoppingCart
          className="icon-card"
          style={{ stroke: "#3730a3", color: "#3730a3", backgroundColor: "#e0e7ff" }}
        />
      ),
    },
    {
      label: "Vendido Este Mes",
      count: ventasEsteMes.length,
      icon: (
        <Calendar
          className="icon-card"
          style={{ stroke: "#1d4ed8", color: "#1d4ed8", backgroundColor: "#dbeafe" }}
        />
      ),
    },
    {
      label: "Ingresos Este Mes",
      count: formatCOP(ingresosMes),
      icon: (
        <DollarSign
          className="icon-card"
          style={{ stroke: "#166534", color: "#166534", backgroundColor: "#dcfce7" }}
        />
      ),
    },
    {
      label: "Ingresos Totales",
      count: formatCOP(ingresosTotales),
      icon: (
        <DollarSign
          className="icon-card"
          style={{ stroke: "#92400e", color: "#92400e", backgroundColor: "#fef3c7" }}
        />
      ),
    },
    {
      label: "Pendientes por Entregar",
      count: ventas.filter((v) => v.estado_entrega === "por_entregar").length,
      icon: (
        <Truck
          className="icon-card"
          style={{ stroke: "#c2410c", color: "#c2410c", backgroundColor: "#fff7ed" }}
        />
      ),
    },
    {
      label: "Entregadas",
      count: ventas.filter((v) => v.estado_entrega === "entregado").length,
      icon: (
        <CheckCircle
          className="icon-card"
          style={{ stroke: "#065f46", color: "#065f46", backgroundColor: "#d1fae5" }}
        />
      ),
    },
  ];

  // ── Columns ─────────────────────────────────────────────────────────────
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span style={{ fontWeight: 600 }}>#{row.id}</span>,
    },
    {
      key: "items_producto",
      label: "Producto",
      render: (row) => {
        const items = row.items || [];
        if (items.length === 0)
          return <span style={{ color: "#9ca3af" }}>Sin productos</span>;
        const nombres = items.map((i) => i.producto_nombre).filter(Boolean);
        const primero = nombres[0] || `${items.length} producto${items.length === 1 ? "" : "s"}`;
        const tooltip = nombres.join(", ");
        return (
          // CSS does the truncation via overflow:hidden + text-overflow:ellipsis,
          // so the title attribute is the source of truth for the full name.
          // cursor:help signals the tooltip is hoverable.
          <span
            title={tooltip}
            style={{
              display: "inline-block",
              maxWidth: 220,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              verticalAlign: "bottom",
              cursor: "help",
            }}
          >
            {primero}
            {items.length > 1 && (
              <span className="vp-extra-count" title={tooltip}>
                +{items.length - 1} más
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: "items_serial",
      label: "Serial",
      render: (row) => {
        const items = row.items || [];
        if (items.length === 0) return <span style={{ color: "#9ca3af" }}>—</span>;
        const seriales = items.map((i) => i.unidad_serial).filter(Boolean);
        const primero = seriales[0] || "—";
        return (
          <span title={seriales.join(", ")}>
            <code
              style={{
                fontFamily: "Courier New, monospace",
                backgroundColor: "var(--icon-bg)",
                padding: "0.2rem 0.45rem",
                borderRadius: "4px",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              {primero}
            </code>
            {items.length > 1 && (
              <span className="vp-extra-count">+{items.length - 1} más</span>
            )}
          </span>
        );
      },
    },
    {
      key: "condicion",
      label: "Condición",
      render: (row) => {
        const items = row.items || [];
        if (items.length === 0) return null;
        const condiciones = [...new Set(items.map((i) => i.unidad_condicion).filter(Boolean))];
        if (condiciones.length === 1) {
          const c = condiciones[0];
          return (
            <span className={`vp-condicion-${c}`}>
              {CONDICION_LABELS[c] || c}
            </span>
          );
        }
        return <span className="vp-condicion-varias">Varias</span>;
      },
    },
    {
      key: "cliente_nombre",
      label: "Cliente",
      render: (row) => (
        <span style={{ fontWeight: 600 }}>{row.cliente_nombre || "—"}</span>
      ),
    },
    {
      key: "fecha",
      label: "Fecha",
      render: (row) => formatDate(row.fecha),
    },
    {
      key: "total",
      label: "Total",
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--primary-color)" }}>
          {formatCOP(row.total)}
        </span>
      ),
    },
    {
      key: "tracking",
      label: "Tracking",
      render: (row) => {
        // tipo_entrega='local' → recogida en oficina, no hay tracking.
        if (row.tipo_entrega === "local") {
          return (
            <span
              className="vp-tracking-local"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                background: "#eff6ff",
                color: "#1e40af",
                padding: "0.2rem 0.55rem",
                borderRadius: "999px",
                fontSize: "0.78rem",
                fontWeight: 600,
              }}
            >
              <Store size={11} />
              {row.estado_entrega === "entregado" ? "Entregado en oficina" : "Recogida en oficina"}
            </span>
          );
        }
        // tipo_entrega='envio' (default) without a guide number yet — show
        // "Pendiente" while estado_entrega is por_entregar so the user knows
        // a tracking still needs to be registered.
        if (!row.numero_guia) {
          if (row.estado_entrega === "por_entregar") {
            return (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  background: "#fef3c7",
                  color: "#92400e",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                Pendiente
              </span>
            );
          }
          return <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Sin envío</span>;
        }
        return (
          <span
            title={row.transportadora ? `${row.transportadora} — ${row.numero_guia}` : row.numero_guia}
            style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.2 }}
          >
            <code
              style={{
                fontFamily: "Courier New, monospace",
                background: "var(--icon-bg)",
                padding: "0.18rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              {row.numero_guia}
            </code>
            {row.transportadora && (
              <span style={{ fontSize: "0.72rem", color: "var(--subtitle-color)", marginTop: "2px" }}>
                {row.transportadora}
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: "estado_entrega",
      label: "Entrega",
      render: (row) =>
        row.estado_entrega === "entregado" ? (
          <span className="vp-badge-entregado">Entregado</span>
        ) : (
          <span className="vp-badge-por-entregar">Por Entregar</span>
        ),
    },
  ];

  const customActions = [
    {
      show: () => true,
      icon: Eye,
      title: "Ver detalle",
      handler: handleView,
    },
    {
      show: () => true,
      icon: Edit,
      title: "Editar",
      handler: handleEdit,
    },
    {
      show: () => true,
      icon: Mail,
      title: "Enviar Recibo",
      handler: handleEnviarRecibo,
    },
    {
      show: (row) => row.active !== false && row.estado_entrega !== "entregado",
      icon: Package,
      title: "Marcar / Crear envío",
      handler: (venta) => setEnvioTarget(venta),
    },
    {
      show: (row) => {
        if (!row.active) return false;
        const items = row.items || [];
        if (items.length === 0) return false;
        // Hide if ALL items are already damaged
        const elegibles = items.filter((i) => i.unidad_estado_venta !== "danado");
        return elegibles.length > 0;
      },
      icon: AlertTriangle,
      title: "Reportar Dañado",
      handler: handleReportarDano,
      destructive: true,
    },
    {
      show: () => true,
      icon: Trash2,
      title: "Eliminar",
      handler: handleDelete,
      destructive: true,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Gestión de Ventas"
          icon={ShoppingCart}
          description="Administra las ventas registradas y genera recibos"
        />

        {/* SearchBox: only the register button, search is in the filters bar */}
        <SearchBox
          onRegisterClick={handleCreateNew}
          registerLabel="Registrar Nueva Venta"
        />

        {/* Filters bar */}
        <div className="fb-bar">
          <span className="fb-label">
            <SlidersHorizontal size={14} />
            Filtrar:
          </span>

          {/* Text search */}
          <div className="fb-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Cliente o serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="fb-divider" />

          {/* Condición */}
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

          {/* Estado Entrega */}
          <select
            className="fb-select"
            value={filterEstadoEntrega}
            onChange={(e) => setFilterEstadoEntrega(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="por_entregar">Por Entregar</option>
            <option value="entregado">Entregado</option>
          </select>

          <div className="fb-divider" />

          {/* Valor range */}
          <input
            type="number"
            className="fb-input"
            placeholder="Total mín."
            value={filterValorMin}
            onChange={(e) => setFilterValorMin(e.target.value)}
          />
          <input
            type="number"
            className="fb-input"
            placeholder="Total máx."
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
          data={filteredVentas}
          rowKey="id"
          showEdit={false}
          loading={loading}
          customActions={customActions}
        />

        {showModal && (
          <VentaForm
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
            venta={selectedVenta}
          />
        )}

        {generarReciboTarget && (
          <GenerarReciboVentaModal
            venta={generarReciboTarget}
            onClose={() => setGenerarReciboTarget(null)}
            onSubmit={handleGenerarReciboSubmit}
          />
        )}

        {seleccionarUnidadTarget && (
          <SeleccionarUnidadDanoModal
            venta={seleccionarUnidadTarget}
            onSelect={handleUnidadSelected}
            onClose={() => setSeleccionarUnidadTarget(null)}
          />
        )}

        {envioTarget && (
          <MarcarEnvioModal
            venta={envioTarget}
            onClose={() => setEnvioTarget(null)}
            onSubmit={handleEnvioSubmit}
          />
        )}

        {reportarDanoTarget && (
          <ReportarDanoModal
            unidad={reportarDanoTarget.unidad}
            origen="venta"
            clienteNombre={reportarDanoTarget.clienteNombre}
            onClose={() => setReportarDanoTarget(null)}
            onSuccess={loadVentas}
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

export default Ventas;
