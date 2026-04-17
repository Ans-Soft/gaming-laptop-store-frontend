import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import {
  Lock,
  Clock,
  CheckCircle,
  ShoppingCart,
  Ban,
  Edit,
  FileText,
  AlertTriangle,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import SeparacionForm from "../../components/admin/SeparacionForm";
import CompletarVentaModal from "../../components/admin/CompletarVentaModal";
import GenerarReciboModal from "../../components/admin/GenerarReciboModal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import NotifyModal from "../../components/admin/NotifyModal";
import ReportarDanoModal from "../../components/admin/ReportarDanoModal";
import {
  getSeparaciones,
  createSeparacion,
  updateSeparacion,
  patchSeparacion,
} from "../../services/SeparacionService";
import * as VentaService from "../../services/VentaService";
import * as InvoiceService from "../../services/InvoiceService";
import "../../styles/admin/ventasPage.css";
import "../../styles/admin/filtersBar.css";
import { DATE_RANGE_PRESETS, computeDateRange, matchesDateRange } from "../../utils/dateRangeFilter";

const CONDICION_LABELS = {
  nuevo: "Nuevo",
  open_box: "Open Box",
  refurbished: "Refurbished",
  usado: "Usado",
};

const Separaciones = () => {
  const [showModal, setShowModal] = useState(false);
  const [separaciones, setSeparaciones] = useState([]);
  const [editingSeparacion, setEditingSeparacion] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [completarVentaTarget, setCompletarVentaTarget] = useState(null);
  const [generarReciboTarget, setGenerarReciboTarget] = useState(null);
  const [reportarDanoTarget, setReportarDanoTarget] = useState(null);
  const [notify, setNotify] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCondicion, setFilterCondicion] = useState("");
  const [filterValorMin, setFilterValorMin] = useState("");
  const [filterValorMax, setFilterValorMax] = useState("");
  const [datePreset, setDatePreset] = useState("mes_actual");
  const [dateFrom, setDateFrom] = useState(() => computeDateRange("mes_actual").from);
  const [dateTo, setDateTo] = useState(() => computeDateRange("mes_actual").to);

  useEffect(() => {
    fetchSeparaciones();
  }, []);

  const fetchSeparaciones = async () => {
    try {
      const data = await getSeparaciones();
      setSeparaciones(data.separacion || data);
    } catch (error) {
      console.error("Error al obtener separaciones:", error);
    }
  };

  const handleOpenModal = (separacion = null) => {
    setEditingSeparacion(separacion);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingSeparacion(null);
    setShowModal(false);
  };

  const handleSubmitSeparacion = async (data, id) => {
    try {
      if (id) {
        await updateSeparacion(id, data);
      } else {
        await createSeparacion(data);
      }
      handleCloseModal();
      fetchSeparaciones();
    } catch (error) {
      console.error("Error al guardar separación:", error);
    }
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
    filterValorMin ||
    filterValorMax ||
    datePreset !== "mes_actual";

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCondicion("");
    setFilterValorMin("");
    setFilterValorMax("");
    setDatePreset("mes_actual");
    const range = computeDateRange("mes_actual");
    setDateFrom(range.from);
    setDateTo(range.to);
  };

  const activeSeparaciones = separaciones.filter(
    (s) =>
      s.active !== false &&
      s.estado !== "completada" &&
      s.unidad_estado_venta !== "vendido"
  );

  const filteredSeparaciones = activeSeparaciones.filter((s) => {
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const matchCliente = (s.cliente_nombre || "").toLowerCase().includes(term);
      const matchSerial = (s.unidad_serial || "").toLowerCase().includes(term);
      if (!matchCliente && !matchSerial) return false;
    }

    if (filterCondicion && s.unidad_condicion !== filterCondicion) return false;

    const precio = Number(s.unidad_precio || 0);
    if (filterValorMin && precio < Number(filterValorMin)) return false;
    if (filterValorMax && precio > Number(filterValorMax)) return false;

    if (!matchesDateRange(s.fecha_separacion, dateFrom, dateTo)) return false;

    return true;
  });

  // ── Completar Venta ──────────────────────────────────────────────────────
  const handleCompletarVentaSubmit = async (data) => {
    let invoiceOk = true;
    try {
      const result = await VentaService.createVenta({
        cliente: data.cliente,
        notas: data.notas || "",
        separacion: data.separacionId,
        items_data: [{ unidad_producto: data.unidad_producto, precio: data.precio }],
        estado_entrega: data.estado_entrega,
      });
      const venta = result.venta || result;

      try {
        await patchSeparacion(data.separacionId, { estado: "completada" });
      } catch (err) {
        console.warn("Venta creada, pero error al actualizar separación:", err);
      }

      if (venta?.id) {
        try {
          await InvoiceService.createInvoice({
            cliente: data.cliente,
            venta: venta.id,
            concepto: "venta",
            serial_item: data.serial_item || `VENTA-${venta.id}`,
            total_amount: data.precio,
            payment_method: data.payment_method,
            due_date: data.due_date,
          });
        } catch (invoiceErr) {
          invoiceOk = false;
          console.warn(
            "Venta creada, pero error al generar factura:",
            invoiceErr?.response?.data || invoiceErr
          );
        }
      }

      setCompletarVentaTarget(null);
      fetchSeparaciones();
      setNotify(
        invoiceOk
          ? {
              variant: "success",
              title: "Venta completada",
              message:
                "La venta fue registrada, la separación se marcó como completada y la factura fue enviada al cliente.",
            }
          : {
              variant: "warning",
              title: "Venta registrada con advertencia",
              message:
                "La venta se completó correctamente, pero hubo un error al generar la factura. Puedes reintentar desde el listado de facturas.",
            }
      );
    } catch (error) {
      console.error("Error al completar venta:", error);
      const msg = error.response?.data?.detail || "Error al completar la venta";
      setNotify({
        variant: "error",
        title: "Error al completar la venta",
        message: typeof msg === "object" ? JSON.stringify(msg) : msg,
      });
    }
  };

  // ── Cancelar ─────────────────────────────────────────────────────────────
  const handleCancelar = (separacion) => {
    setConfirmDialog({
      title: "¿Cancelar esta separación?",
      message: `Se cancelará la separación de ${separacion.cliente_nombre}. La unidad volverá a estar disponible para la venta.`,
      confirmLabel: "Sí, cancelar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await patchSeparacion(separacion.id, { estado: "cancelada" });
          fetchSeparaciones();
        } catch (error) {
          console.error("Error al cancelar separación:", error);
          setNotify({
            variant: "error",
            title: "Error",
            message: "Error al cancelar la separación",
          });
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // ── Generar Recibo ────────────────────────────────────────────────────────
  const handleGenerarReciboSubmit = async (invoiceData) => {
    try {
      await InvoiceService.createInvoice(invoiceData);
      setGenerarReciboTarget(null);
      setNotify({
        variant: "success",
        title: "Recibo generado",
        message: "El recibo fue generado exitosamente.",
      });
    } catch (error) {
      console.error("Error al generar recibo:", error);
      const data = error.response?.data;
      const msg = data?.detail || data?.serial_item || "Error al generar el recibo";
      setNotify({
        variant: "error",
        title: "Error al generar recibo",
        message: typeof msg === "object" ? JSON.stringify(msg) : msg,
      });
    }
  };

  const formatCOP = (value) => "$" + Number(value).toLocaleString("es-CO");

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  };

  const columns = [
    {
      key: "producto_nombre",
      label: "Producto",
      render: (row) => (
        <span style={{ fontWeight: 500 }}>{row.producto_nombre || "—"}</span>
      ),
    },
    {
      key: "unidad_serial",
      label: "Serial",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "flex-start" }}>
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
            {row.unidad_serial}
          </code>
          {row.unidad_estado_venta === "danado" && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                background: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                borderRadius: "4px",
                padding: "0.15rem 0.45rem",
                fontSize: "0.72rem",
                fontWeight: 600,
                lineHeight: 1,
              }}
              title="La unidad está en el flujo de reparación"
            >
              <AlertTriangle size={11} />
              Unidad dañada
            </span>
          )}
        </div>
      ),
    },
    {
      key: "unidad_condicion",
      label: "Condición",
      render: (row) => {
        const c = row.unidad_condicion;
        if (!c) return null;
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
      render: (row) => (
        <span style={{ fontWeight: 600 }}>{row.cliente_nombre || "—"}</span>
      ),
    },
    {
      key: "valor_abono",
      label: "Valor Abono",
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--primary-color)" }}>
          {formatCOP(row.valor_abono)}
        </span>
      ),
    },
    {
      key: "saldo_pendiente",
      label: "Saldo Pendiente",
      render: (row) => {
        const saldo = Number(row.unidad_precio || 0) - Number(row.valor_abono || 0);
        return (
          <span style={{ fontWeight: 600, color: saldo > 0 ? "#c2410c" : "var(--success-color)" }}>
            {formatCOP(saldo > 0 ? saldo : 0)}
          </span>
        );
      },
    },
    {
      key: "fecha_separacion",
      label: "Fecha Separación",
      render: (row) => formatDate(row.fecha_separacion),
    },
    {
      key: "fecha_maxima_compra",
      label: "Fecha Máxima",
      render: (row) => formatDate(row.fecha_maxima_compra),
    },
  ];

  const stats = [
    {
      label: "Total Separaciones",
      count: activeSeparaciones.length,
      icon: (
        <Lock
          className="icon-card"
          style={{ stroke: "#92400e", color: "#92400e", backgroundColor: "#fef3c7" }}
        />
      ),
    },
    {
      label: "Activas",
      count: activeSeparaciones.filter((s) => s.estado === "activa").length,
      icon: (
        <CheckCircle
          className="icon-card"
          style={{ stroke: "#065f46", color: "#065f46", backgroundColor: "#d1fae5" }}
        />
      ),
    },
    {
      label: "Expiradas",
      count: activeSeparaciones.filter((s) => s.estado === "expirada").length,
      icon: (
        <Clock
          className="icon-card"
          style={{ stroke: "#c2410c", color: "#c2410c", backgroundColor: "#fff7ed" }}
        />
      ),
    },
  ];

  const isCustomPreset = datePreset !== "personalizado";

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Gestión de Separaciones"
          icon={Lock}
          description="Administra las reservas de unidades en stock"
        />

        {/* SearchBox: only register button; search lives in filters bar */}
        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Nueva Separación"
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

          <div className="fb-divider" />

          {/* Valor range (sobre unidad_precio) */}
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

          {/* Date range preset */}
          <select
            className="fb-select"
            value={datePreset}
            onChange={(e) => handleDatePresetChange(e.target.value)}
          >
            {DATE_RANGE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {/* Custom date pickers */}
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
          data={filteredSeparaciones}
          rowKey="id"
          showEdit={false}
          customActions={[
            {
              icon: ShoppingCart,
              handler: (row) => setCompletarVentaTarget(row),
              show: (row) =>
                row.estado === "activa" && row.unidad_estado_venta !== "danado",
              title: "Completar Venta",
            },
            {
              icon: Edit,
              handler: (row) => handleOpenModal(row),
              show: (row) =>
                row.estado === "activa" && row.unidad_estado_venta !== "danado",
              title: "Editar",
            },
            {
              icon: FileText,
              handler: (row) => setGenerarReciboTarget(row),
              show: (row) => row.estado === "activa",
              title: "Generar Recibo",
            },
            {
              icon: AlertTriangle,
              handler: (row) =>
                setReportarDanoTarget({
                  id: row.unidad_producto,
                  serial: row.unidad_serial,
                  producto_nombre: row.producto_nombre,
                  cliente_nombre: row.cliente_nombre,
                }),
              show: (row) =>
                row.estado === "activa" && row.unidad_estado_venta !== "danado",
              title: "Reportar Dañado",
              destructive: true,
            },
            {
              icon: Ban,
              handler: handleCancelar,
              show: (row) => row.estado === "activa",
              title: "Cancelar Separación",
              destructive: true,
            },
          ]}
        />

        {showModal && (
          <SeparacionForm
            onClose={handleCloseModal}
            onSubmit={handleSubmitSeparacion}
            separacion={editingSeparacion}
          />
        )}

        {completarVentaTarget && (
          <CompletarVentaModal
            separacion={completarVentaTarget}
            onClose={() => setCompletarVentaTarget(null)}
            onSubmit={handleCompletarVentaSubmit}
          />
        )}

        {generarReciboTarget && (
          <GenerarReciboModal
            separacion={generarReciboTarget}
            onClose={() => setGenerarReciboTarget(null)}
            onSubmit={handleGenerarReciboSubmit}
          />
        )}

        {reportarDanoTarget && (
          <ReportarDanoModal
            unidad={{
              id: reportarDanoTarget.id,
              serial: reportarDanoTarget.serial,
              producto_nombre: reportarDanoTarget.producto_nombre,
            }}
            origen="separacion"
            clienteNombre={reportarDanoTarget.cliente_nombre}
            onClose={() => setReportarDanoTarget(null)}
            onSuccess={fetchSeparaciones}
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

export default Separaciones;
