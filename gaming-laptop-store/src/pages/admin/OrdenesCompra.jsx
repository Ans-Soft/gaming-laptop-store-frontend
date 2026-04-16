import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { ShoppingCart, Package, Truck, Building2, Store, SlidersHorizontal, AlertTriangle } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaTrash } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import OrdenCompraForm from "../../components/admin/OrdenCompraForm";
import ConfirmModal from "../../components/admin/ConfirmModal";
import SerialInputModal from "../../components/admin/SerialInputModal";
import { updateUnidad } from "../../services/UnidadService";
import * as TRMService from "../../services/TRMService";
import {
  getOrdenesCompra,
  createOrdenCompra,
  updateOrdenCompra,
  patchOrdenCompra,
  deactivateOrdenCompra,
} from "../../services/OrdenCompraService";

const ESTADO_LOGISTICO_OPTIONS = [
  { value: "viajando", label: "Viajando" },
  { value: "en_oficina_importadora", label: "En Oficina Importadora" },
  { value: "en_oficina", label: "En Oficina Tienda" },
];

const CONDICION_LABELS = {
  nuevo: "Nuevo",
  open_box: "Open Box",
  refurbished: "Refurbished",
  usado: "Usado",
};

const OrdenesCompra = () => {
  const [showModal, setShowModal] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [editingOrden, setEditingOrden] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [trm, setTrm] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [serialModalOrden, setSerialModalOrden] = useState(null);
  const [serialSubmitting, setSerialSubmitting] = useState(false);

  // Filters
  const [filterProveedor, setFilterProveedor] = useState("");
  const [filterCondicion, setFilterCondicion] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  useEffect(() => {
    fetchOrdenes();
    fetchTRM();
  }, []);

  const fetchTRM = async () => {
    try {
      const data = await TRMService.getTRM();
      const latest = data.trm_history?.[0];
      if (latest) setTrm(parseFloat(latest.valor_cop));
    } catch {
      // TRM unavailable — COP column will show "—"
    }
  };

  const fetchOrdenes = async () => {
    try {
      const data = await getOrdenesCompra();
      setOrdenes(data.orden_compra || data);
    } catch (error) {
      console.error("Error al obtener órdenes:", error);
    }
  };

  const handleOpenModal = (orden = null) => {
    setEditingOrden(orden);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingOrden(null);
    setShowModal(false);
  };

  const handleSubmitOrden = async (data, id) => {
    try {
      if (id) {
        await updateOrdenCompra(id, data);
      } else {
        await createOrdenCompra(data);
      }
      handleCloseModal();
      fetchOrdenes();
    } catch (error) {
      console.error("Error al guardar orden:", error);
    }
  };

  const handleDelete = (orden) => {
    setConfirmDelete(orden);
  };

  const handleConfirmDelete = async () => {
    try {
      await deactivateOrdenCompra(confirmDelete.id);
      fetchOrdenes();
    } catch (error) {
      console.error("Error al eliminar orden:", error);
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleEstadoChange = async (id, nuevoEstado) => {
    const orden = ordenes.find((o) => o.id === id);
    if (!orden) return;

    // Intercept → en_oficina when unit has placeholder serial: require real serial
    if (
      nuevoEstado === "en_oficina" &&
      orden.unidad_serial &&
      orden.unidad_serial.startsWith("SIN-SERIAL-")
    ) {
      // Force a re-render so the controlled <select> resyncs with the old value
      // in the DOM before the modal mounts. Without this, React 19's commit phase
      // may throw `insertBefore` when reconciling <option> nodes after fetchOrdenes.
      setOrdenes((prev) => [...prev]);
      setSerialModalOrden(orden);
      return;
    }

    try {
      await patchOrdenCompra(id, { estado_logistico: nuevoEstado });
      setOrdenes((prev) =>
        prev.map((o) => (o.id === id ? { ...o, estado_logistico: nuevoEstado } : o))
      );
    } catch (error) {
      console.error("Error al actualizar estado logístico:", error);
    }
  };

  const handleSerialSubmitOrden = async (serial) => {
    if (!serialModalOrden) return;
    setSerialSubmitting(true);
    try {
      // 1. Update unit serial
      await updateUnidad(serialModalOrden.unidad_producto, { serial });
      // 2. Update order estado_logistico → en_oficina (backend syncs unit estado_producto → en_stock)
      await patchOrdenCompra(serialModalOrden.id, { estado_logistico: "en_oficina" });
      setSerialModalOrden(null);
      fetchOrdenes();
    } catch (error) {
      console.error("Error al registrar serial:", error);
      const data = error.response?.data;
      const msg = data?.serial || data?.estado_logistico || data?.detail || "Error al registrar el serial";
      alert(typeof msg === "object" ? JSON.stringify(msg) : msg);
    } finally {
      setSerialSubmitting(false);
    }
  };

  const activeOrdenes = ordenes.filter((o) => o.active !== false);

  // Unique proveedores for filter
  const proveedores = [...new Set(
    activeOrdenes.map((o) => o.proveedor_nombre).filter(Boolean)
  )].sort();

  const filteredOrdenes = activeOrdenes.filter((orden) => {
    const matchSearch =
      orden.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.numero_orden?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.proveedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProveedor = !filterProveedor || orden.proveedor_nombre === filterProveedor;
    const matchCondicion = !filterCondicion || orden.condicion === filterCondicion;
    const matchEstado = !filterEstado || orden.estado_logistico === filterEstado;
    return matchSearch && matchProveedor && matchCondicion && matchEstado;
  });

  const columns = [
    {
      key: "producto_nombre",
      label: "Producto",
      render: (row) => (
        <div style={{ maxWidth: "230px" }}>
          <div
            className="cell-primary"
            title={row.producto_nombre || "—"}
            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {row.producto_nombre || "—"}
          </div>
          {row.unidad_serial && !row.unidad_serial.startsWith("SIN-SERIAL-") ? (
            <div key="serial-real" className="cell-secondary cell-code">Serial: {row.unidad_serial}</div>
          ) : (
            <div key="serial-placeholder" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              background: "#fff7ed",
              color: "#c2410c",
              borderRadius: "4px",
              padding: "0.1rem 0.45rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginTop: "0.2rem",
            }}>
              <AlertTriangle size={10} />
              Sin serial
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
      key: "proveedor_nombre",
      label: "Proveedor",
      render: (row) => (
        <span className={row.proveedor_nombre ? "cell-primary" : "cell-empty"}>
          {row.proveedor_nombre || "—"}
        </span>
      ),
    },
    {
      key: "numero_orden",
      label: "N° Orden",
      render: (row) => <span className="cell-primary">{row.numero_orden}</span>,
    },
    {
      key: "numero_tracking",
      label: "Tracking",
      render: (row) => row.numero_tracking
        ? <span className="cell-code">{row.numero_tracking}</span>
        : <span className="cell-empty">—</span>,
    },
    {
      key: "costo_total",
      label: "Costo Total",
      render: (row) => {
        const compraUSD = parseFloat(row.costo_compra || 0);
        const extraUSD = parseFloat(row.costo_importacion || 0) + parseFloat(row.impuesto_importacion || 0);
        const totalUSD = compraUSD + extraUSD;
        const totalCOP = trm ? totalUSD * trm : null;
        return (
          <div>
            <div className="cell-primary--strong">
              {totalCOP ? `$${totalCOP.toLocaleString("es-CO", { maximumFractionDigits: 0 })}` : "—"}
            </div>
            <div className="cell-secondary">
              {extraUSD > 0
                ? `$${compraUSD.toFixed(2)} + $${extraUSD.toFixed(2)} USD`
                : `($${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)`
              }
            </div>
          </div>
        );
      },
    },
    {
      key: "unidad_precio",
      label: "Precio de Venta",
      render: (row) => row.unidad_precio
        ? <span className="cell-primary--accent">
            ${parseFloat(row.unidad_precio).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
          </span>
        : <span className="cell-empty">—</span>,
    },
    {
      key: "estado_logistico",
      label: "Estado Logístico",
      render: (row) => {
        const hasRealSerial = Boolean(
          row.unidad_serial && !row.unidad_serial.startsWith("SIN-SERIAL-")
        );
        // Key forces React to remount the <select> whenever estado_logistico or
        // hasRealSerial change. Without this, React 19's option reconciliation
        // can throw `insertBefore` after a fetchOrdenes re-render.
        return (
          <select
            key={`${row.id}-${row.estado_logistico}-${hasRealSerial ? "r" : "p"}`}
            className={`oc-estado-select oc-estado-select--${row.estado_logistico}`}
            value={row.estado_logistico}
            onChange={(e) => handleEstadoChange(row.id, e.target.value)}
          >
            {ESTADO_LOGISTICO_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={hasRealSerial && opt.value !== "en_oficina"}
              >
                {opt.label}
              </option>
            ))}
          </select>
        );
      },
    },
  ];

  const stats = [
    {
      label: "Total Activas",
      count: activeOrdenes.length,
      icon: <Package className="icon-card" />,
    },
    {
      label: "Viajando",
      count: activeOrdenes.filter((o) => o.estado_logistico === "viajando").length,
      icon: <Truck className="icon-card" style={{ stroke: "#92400e", color: "#92400e", backgroundColor: "#fef3c7" }} />,
    },
    {
      label: "En Importadora",
      count: activeOrdenes.filter((o) => o.estado_logistico === "en_oficina_importadora").length,
      icon: <Building2 className="icon-card" style={{ stroke: "#5b21b6", color: "#5b21b6", backgroundColor: "#ede9fe" }} />,
    },
    {
      label: "En Oficina",
      count: activeOrdenes.filter((o) => o.estado_logistico === "en_oficina").length,
      icon: <Store className="icon-card" style={{ stroke: "#065f46", color: "#065f46", backgroundColor: "#d1fae5" }} />,
    },
  ];

  const hasFilters = filterProveedor || filterCondicion || filterEstado;

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Gestión de Órdenes de Compra"
          icon={ShoppingCart}
          description="Administra las órdenes de compra y canjes de clientes"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Orden de Compra"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por producto, orden o proveedor..."
        />

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", margin: "1rem 0 0.5rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--subtitle-color)", fontSize: "0.85rem", fontWeight: 500, flexShrink: 0 }}>
            <SlidersHorizontal size={14} />
            Filtrar:
          </span>

          <select value={filterProveedor} onChange={(e) => setFilterProveedor(e.target.value)}>
            <option value="">Todos los proveedores</option>
            {proveedores.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select value={filterCondicion} onChange={(e) => setFilterCondicion(e.target.value)}>
            <option value="">Todas las condiciones</option>
            {Object.entries(CONDICION_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className={filterEstado ? `oc-estado-select oc-estado-select--${filterEstado}` : ""}
            style={filterEstado ? { padding: "0.6rem 2rem 0.6rem 1rem", borderRadius: "8px" } : {}}
          >
            <option value="">Todos los estados</option>
            {ESTADO_LOGISTICO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setFilterProveedor(""); setFilterCondicion(""); setFilterEstado(""); }}
              style={{
                background: "none",
                border: "1px solid var(--fourth-color)",
                borderRadius: "8px",
                padding: "0.6rem 1rem",
                cursor: "pointer",
                color: "var(--subtitle-color)",
                fontFamily: "inherit",
                fontSize: "0.85rem",
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={filteredOrdenes}
          rowKey="id"
          onEdit={handleOpenModal}
          customActions={[
            {
              icon: FaTrash,
              handler: handleDelete,
              show: () => true,
              title: "Eliminar",
            },
          ]}
        />

        {showModal && (
          <OrdenCompraForm
            onClose={handleCloseModal}
            onSubmit={handleSubmitOrden}
            orden={editingOrden}
          />
        )}

        {serialModalOrden && (
          <SerialInputModal
            productoNombre={serialModalOrden.producto_nombre}
            productoSubtitle={CONDICION_LABELS[serialModalOrden.condicion] || serialModalOrden.condicion}
            onClose={() => setSerialModalOrden(null)}
            onSubmit={handleSerialSubmitOrden}
            isSubmitting={serialSubmitting}
          />
        )}

        {confirmDelete && (
          <ConfirmModal
            title="¿Eliminar orden de compra?"
            message={`Se eliminará la orden ${confirmDelete.numero_orden}. Esta acción no se puede deshacer.`}
            confirmLabel="Sí, eliminar"
            isDestructive={true}
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </div>
    </section>
  );
};

export default OrdenesCompra;
